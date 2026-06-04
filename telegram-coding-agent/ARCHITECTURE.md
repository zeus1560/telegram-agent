# Telegram Remote Coding Agent — 기술 문서

**작성자:** 개발자 본인  
**작성일:** 2026-05-28

---

## 1. 한 줄 요약

> 텔레그램 자연어 명령 → AI가 코드 수정안 생성 → 사람이 Diff 승인 → 자동 Git 커밋

PC 앞에 없어도 스마트폰으로 로컬 프로젝트를 수정하고 커밋할 수 있는 **1인용 원격 코딩 에이전트**입니다.

---

## 2. 시스템 아키텍처

```
[ 사용자 — 텔레그램 ]
        │
        ▼
[ Telegraf Bot — Long-polling ]
        │
  ┌─────┴──────┐
  │ security   │ ← User ID 검증, 미등록 시 완전 무시
  │ lock       │ ← 동시 명령 차단
  └─────┬──────┘
        │
        ▼
[ AI Shim (라우팅 에이전트) — llama-3.1-8b-instant ]
  입력: 자연어 명령 + 프로젝트 파일 경로 목록
  출력: 수정 대상 파일 경로 OR clarification_needed
        │
        ▼
[ File System — fs, path ]
  파일 읽기 / 없으면 fuzzySearch로 후보 3개 제안
        │
        ▼
[ AI Shim (코딩 에이전트) — llama-3.3-70b-versatile ]
  입력: 실제 파일 내용 + 수정 의도
  출력: originalSnippet → newSnippet 변경 명세 + commitMessage
        │
        ▼
[ diff npm — Unified Diff 생성 ]
  텔레그램 메시지로 변경 전후 비교 전송
        │
  [✅ 승인]          [❌ 거절]
        │                  │
  파일 저장     피드백 대기 상태로 전환
  git commit          │
                사용자 피드백 입력
                      │
                      └──▶ [ AI Shim (코딩 에이전트) ]
                             피드백 반영 재생성 후 Diff 재전송
```

---

## 3. 기술 스택 선택 이유

### Node.js + Telegraf v4

타겟 프로젝트(church-platform)가 Node.js 기반이라 **런타임을 통일**했습니다. 별도 런타임을 추가하면 배포 환경 복잡도가 올라가고, 팀에서 관리해야 할 기술 범위가 넓어집니다.

Telegraf는 Node.js 텔레그램 봇 라이브러리 중 TypeScript 지원, 미들웨어 패턴, 인라인 버튼 처리가 가장 성숙한 선택지입니다.

### AI를 2단계로 나눈 이유 (비용 최적화)

파일 식별과 코드 생성은 **난이도가 다릅니다.**

| 단계 | 작업 | 사용 모델 | 이유 |
|------|------|-----------|------|
| 1단계 | 파일 목록에서 대상 파일 선택 | llama-3.1-8b-instant | 분류 작업 — 빠르고 저렴한 모델로 충분 |
| 2단계 | 실제 코드를 읽고 수정안 작성 | llama-3.3-70b-versatile | 코드 이해 + 정확한 스니펫 생성 필요 |

처음에는 단일 AI 호출로 설계했지만, 파일이 많아지면 전체 파일 내용을 한 번에 컨텍스트에 넣는 것이 토큰 비용 측면에서 비효율적이었습니다. 2단계로 나눠서 필요한 파일만 2단계로 넘기는 방식으로 전환했습니다.

### Groq API (llama 모델)

초기 설계에는 Anthropic Claude API를 명시했으나, **Groq의 무료 티어와 빠른 추론 속도** 때문에 프로토타이핑 단계에서 Groq으로 전환했습니다. API 스키마가 OpenAI 호환이라 교체 비용이 낮고, 모델만 교체하면 다른 LLM 프로바이더로 언제든 전환 가능합니다.

### simple-git (Git 커밋)

`child_process.exec('git commit ...')`으로 직접 CLI를 호출하는 방법도 있었지만, **커맨드 인젝션 위험**과 플랫폼별 경로 차이 때문에 래퍼 라이브러리를 선택했습니다. simple-git은 API가 직관적이고 Promise 기반이라 async/await 흐름에 자연스럽게 맞습니다.

---

## 4. 직접 마주친 문제와 해결 과정

### 문제 1 — LLM이 존재하지 않는 파일 경로를 생성(Hallucination)

**현상:** "api/package.json 수정해줘"라고 명령했는데 AI가 `admin/src/api/package.json`(존재하지 않는 경로)을 반환했습니다.

**원인 분석:** `buildFileTree()`가 트리 형태(`├── package.json`)로 출력하면 LLM이 경로를 재조립해야 합니다. 경량 모델(8b)이 이 과정에서 없는 경로를 만들어냈습니다.

**해결:** 트리 대신 `api/package.json` 형태의 **완전한 상대 경로 목록**(`buildFlatFileList`)을 제공해 AI가 목록에서 복사만 하면 되도록 변경했습니다. 동시에 프롬프트에 "목록에 없는 경로를 절대 만들지 말 것" 규칙을 명시했습니다.

```
변경 전: ├── src
         │   └── package.json    ← LLM이 경로 재조립 필요
변경 후: api/package.json        ← LLM이 그대로 복사
         admin/package.json
```

### 문제 2 — Windows 경로가 JSON을 깨뜨림

**현상:** AI가 Windows 경로(`api\\src\common\controllers\login.js`)를 JSON 값에 담으면 `\c`, `\l` 같은 유효하지 않은 이스케이프 시퀀스가 포함돼 `JSON.parse`가 실패했습니다.

**원인 분석:** LLM이 `\\`(올바른 이스케이프)와 `\c`(잘못된 이스케이프)를 혼재해서 출력합니다. 처음 작성한 정규식이 `\\` 쌍의 두 번째 백슬래시까지 건드려서 오히려 더 망가뜨렸습니다.

**해결 — 2단계 방어:**

1차: `response_format: { type: 'json_object' }` 옵션으로 API 레벨에서 valid JSON 반환을 강제합니다. LLM이 마크다운 블록이나 잘못된 이스케이프를 출력할 수 없습니다.

2차: `sanitizeJson()` 함수를 fallback으로 유지합니다. `\([\s\S])` 패턴으로 백슬래시+다음 문자 쌍을 통째로 읽어서, 유효한 이스케이프(`"`, `\`, `/`, `b`, `f`, `n`, `r`, `t`, `u`)면 유지하고 나머지는 `\\`로 교체합니다.

### 문제 3 — 파일 수가 많아지면 파일이 잘림

**현상:** `MAX_TREE_LINES = 100` 제한 때문에 프로젝트에 파일이 많아지면 목록이 잘리고, 잘린 파일은 AI가 존재를 모르기 때문에 없는 경로를 만들어냈습니다.

**해결:** 이미지, lock 파일 등 AI에게 불필요한 파일을 제외하고 소스 파일(`.js`, `.ts`, `.json` 등 18개 확장자)만 필터링했습니다. 398개 → 188개로 줄여서 잘림 없이 전체 목록을 컨텍스트에 전달합니다.

---

## 5. 파일별 역할 요약

| 파일 | 역할 |
|------|------|
| `index.js` | 봇 초기화, Long-polling 시작, graceful shutdown |
| `config.js` | 환경변수 로드 및 누락 시 즉시 종료 |
| `security.js` | User ID 검증 — 미등록 ID는 응답·로그 없이 무시 |
| `lock.js` | 인메모리 Lock — 동시 명령 차단, 승인·피드백·부분승인 상태 보관 |
| `aiShim.js` | Groq API 2단계 호출, JSON mode 1차 방어 + sanitizeJson 2차 방어 |
| `fileOps.js` | 파일 읽기·쓰기·퍼지탐색·소스 파일 목록 생성 |
| `diffUtils.js` | unified diff 생성, 텔레그램 메시지 포맷 |
| `gitHandler.js` | simple-git으로 자동 커밋, 실패 시 파일 유지 |
| `botHandlers.js` | 승인·거절·/status·/cancel·/analyze·/history·/switch 핸들러 |
| `orchestrator.js` | 전체 파이프라인 조율 (보안 → Lock → AI → Diff → 승인 → 피드백 루프) |
| `conversationHistory.js` | 최근 수정 내역 5건 유지 — AI 파일 위치 추론 및 /undo·/history에 활용 |
| `projectState.js` | 현재 활성 프로젝트 경로·이름 관리 — /switch로 전환 가능 |
| `prompts.js` | Groq 시스템 프롬프트 상수 분리 — 로직과 독립적으로 버전관리 |

---

## 6. 의도적으로 단순하게 유지한 것들

**인메모리 Lock (DB 없음)**  
1인 전용이고 프로세스 재시작 시 자동 초기화되는 것이 오히려 안전합니다. Redis나 DB 기반 Lock은 이 규모에서 운영 복잡도만 높입니다.

**커밋 실패 시 롤백 없음**  
파일 수정은 성공했습니다. Git 커밋 실패는 대부분 일시적 환경 문제이며, 이때 파일까지 되돌리면 사용자 작업이 소실됩니다. 에러를 알리고 사용자가 직접 커밋하도록 하는 것이 더 안전한 선택입니다.

**Hot-reload 위임**  
봇이 서버 프로세스를 직접 재시작하면 관리 포인트가 늘어납니다. 이미 nodemon이 파일 변경을 감지해 재시작하므로, 봇은 파일 저장까지만 책임지고 이후는 기존 인프라에 위임합니다.
