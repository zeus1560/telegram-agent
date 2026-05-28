# PRD — Telegram Remote Coding Agent  v1.0-Approved
**Author:** AI Engineering Manager  
**Last updated:** 2026-05-18  
**Status:** Approved

---

## 1. Problem Statement

개발자(매니저)가 로컬 PC를 직접 열지 않아도 텔레그램 메시지 하나로 로컬 프로젝트 코드를 읽고, Claude AI가 수정안을 만들어, 승인 후 자동 커밋까지 완료하는 **1인용 원격 코딩 에이전트**가 필요하다. 타겟 프로젝트는 React + Node.js 기반이며, 봇도 동일한 Node.js 런타임으로 구현해 관리 포인트를 최소화한다. 봇은 앱 실행에 관여하지 않으며 Hot-reload(nodemon)가 서버 재시작을 담당한다.

---

## 2. Goals & Non-Goals

| Goals | Non-Goals |
|-------|-----------|
| 텔레그램 자연어 명령으로 로컬 파일 수정 | 앱 프로세스 직접 실행·종료 |
| AI Shim으로 자연어 → 구조화 JSON 파싱 | PR(Pull Request) 생성 |
| 승인/거절 인라인 버튼으로 Diff 리뷰 | 멀티 유저 지원 |
| 승인 후 자동 Git Commit | Git push / 브랜치 관리 |
| 파일 못 찾을 때 후보 역질문 | 복잡한 에러 복구·롤백 로직 |
| 모호한 명령 시 역질문으로 의도 좁히기 | CI/CD 파이프라인 연동 |
| 단일 Lock으로 동시 명령 차단 | 큐(Queue) 기반 작업 스케줄링 |
| 사전 등록 User ID로 접근 제어 | OAuth / 멀티 계정 인증 |

---

## 3. User Stories

- 매니저로서, 텔레그램에 "auth.js의 login 함수를 bcrypt로 바꿔줘"라고 입력하면, 봇이 Diff를 보여주고 내가 승인하면 파일이 수정되고 자동 커밋되는 경험을 원한다.
- 매니저로서, 파일명을 잘못 말했을 때 봇이 후보 파일을 제안해 주기를 원한다.
- 매니저로서, 명령이 모호할 때 봇이 알아서 진행하지 않고 구체적인 선택지를 역질문해 주기를 원한다.
- 매니저로서, 다른 사람이 내 봇에 명령을 보내도 봇이 철저히 무시하기를 원한다.
- 매니저로서, 이전 작업이 끝나기 전에 새 명령을 보내면 봇이 "처리 중" 메시지로 알려주기를 원한다.

---

## 4. Functional Requirements

| ID    | Requirement                                                                                  | Priority |
|-------|----------------------------------------------------------------------------------------------|----------|
| FR-01 | 모든 수신 메시지에서 Telegram User ID를 확인하고, 미등록 ID는 즉시 무시한다                 | Must     |
| FR-02 | 자연어 명령을 AI Shim으로 분석해 ShimResult JSON을 생성한다                                 | Must     |
| FR-03 | AI Shim이 모호한 명령을 감지하면 `clarification_needed` 상태로 역질문 메시지를 전송한다      | Must     |
| FR-04 | 타겟 파일을 로컬에서 읽어 AI가 수정된 코드 스니펫을 생성한다                                | Must     |
| FR-05 | 타겟 파일이 없으면 디렉토리를 탐색해 후보 파일 목록(최대 3개)을 역질문으로 제안한다          | Must     |
| FR-06 | 수정 전·후 Diff를 텔레그램 코드 블록으로 표시하고 [✅ 승인] [❌ 거절] 인라인 버튼을 제공한다 | Must     |
| FR-07 | 다중 파일 수정 시 모든 변경사항을 한 메시지에 요약하고 단일 승인을 받는다                   | Must     |
| FR-08 | 승인 시 파일을 저장한다 (봇이 앱을 재시작하지 않는다)                                       | Must     |
| FR-09 | 승인 후 AI Shim의 `commitMessage` 필드를 사용해 `git commit`을 자동 실행한다                | Must     |
| FR-10 | 커밋 실패 시 파일 수정은 유지하고, 에러 내용을 텔레그램으로 알림만 전송한다                 | Must     |
| FR-11 | 작업 진행 중 Lock 상태이면 새 명령에 "처리 중입니다 ⏳" 메시지를 전송하고 무시한다          | Must     |
| FR-12 | `/status` 명령으로 현재 Lock 상태 및 마지막 작업 결과를 조회할 수 있다                      | Should   |
| FR-13 | `/cancel` 명령으로 승인 대기 중인 작업을 취소하고 Lock을 해제할 수 있다                     | Should   |

---

## 5. Non-Functional Requirements

| ID     | Category    | Requirement                                                                              |
|--------|-------------|------------------------------------------------------------------------------------------|
| NFR-01 | Security    | `TELEGRAM_BOT_TOKEN`, `ALLOWED_USER_ID`, `ANTHROPIC_API_KEY`는 `.env`에만 저장, 코드 하드코딩 금지 |
| NFR-02 | Security    | 미등록 User ID 접근은 응답·로그 없이 완전 무시 (봇의 존재 자체를 노출하지 않음)         |
| NFR-03 | Reliability | Lock으로 동시 작업을 차단해 파일 쓰기 충돌을 방지한다                                   |
| NFR-04 | Reliability | 봇 프로세스 재시작 시 Lock이 자동 해제된다 (인메모리 상태, 영속화 불필요)                |
| NFR-05 | Usability   | 모든 봇 응답은 한국어로 작성한다                                                         |
| NFR-06 | Portability | `TARGET_PROJECT_PATH` 환경변수로 타겟 프로젝트 경로 주입, 코드 변경 없이 프로젝트 전환  |
| NFR-07 | Runtime     | 타겟 프로젝트(React + Node.js)와 런타임 통일 (Node.js 18+)                               |

---

## 6. System Architecture

```
[ 매니저 ]
    │  텔레그램 메시지
    ▼
[ Telegraf Bot (Node.js 18+, Long-polling) ]
    │
    ├─► [Security Guard]  ──── 미등록 User ID → return (완전 무시)
    │
    ├─► [Lock Check]  ──── isLocked=true → "처리 중 ⏳" 전송 후 return
    │
    ├─► isLocked = true
    │
    ▼
[ AI Shim (Anthropic SDK — claude-sonnet-4-6) ]
    │  입력: 자연어 명령 + 프로젝트 파일 트리
    │  출력: ShimResult JSON (§8 참조)
    │
    ├─ status=clarification_needed → 역질문 전송, isLocked=false, return
    │
    ▼
[ File Operations (fs, path) ]
    │  파일 읽기
    ├─ 파일 없음 → 퍼지탐색(fs.readdirSync) → 후보 역질문, isLocked=false, return
    │
    ▼
[ Diff Generator (diff npm package) ]
    │  createPatch() → unified diff
    ▼
[ Telegraf: Diff 미리보기 + Inline Keyboard ]
    │  [✅ 승인]  [❌ 거절]
    │
    ├─ 거절 → pendingChanges 폐기, isLocked=false, "취소" 전송
    │
    ▼  승인
[ File Writer (fs.writeFileSync) ]
    │  파일 저장 → Hot-reload(nodemon)가 서버 재시작 담당
    ▼
[ Git Handler (simple-git) ]
    ├─ 성공 → "✅ 커밋 완료: [메시지]" 전송
    └─ 실패 → "⚠️ 파일 수정 성공, 커밋 실패: [에러]" 전송 (파일 유지, 롤백 없음)
    │
    ▼
isLocked = false
```

### 기술 스택

| Layer             | 확정 기술                              | 근거                                       |
|-------------------|----------------------------------------|--------------------------------------------|
| 언어 런타임       | Node.js 18+                            | 타겟 프로젝트(React+Node) 런타임 일치      |
| Telegram 봇       | Telegraf v4                            | Node.js 표준, Long-polling 직관적          |
| AI Shim LLM       | @anthropic-ai/sdk (claude-sonnet-4-6)  | 코드 이해 최상급, 구조화 출력 지원         |
| Git 실행          | simple-git                             | 경량 래퍼, CLI 직접 호출 방식              |
| 파일 Diff         | diff (npm)                             | unified diff 생성, Node.js 표준            |
| 파일 시스템       | fs, path (Node.js 내장)                | 외부 의존성 없음                           |
| 환경변수          | dotenv                                 | Node.js 업계 표준                          |

### 프로젝트 디렉토리 구조

```
telegram-coding-agent/
├── .env                  # 비밀값 (git 제외)
├── .env.example          # 키 템플릿
├── package.json
├── index.js              # 엔트리포인트 (Telegraf 초기화 + 핸들러 등록)
├── config.js             # dotenv 로드 및 값 검증
├── security.js           # User ID 화이트리스트 가드
├── lock.js               # 인메모리 Lock 상태 관리
├── aiShim.js             # 자연어 → ShimResult JSON (Claude API)
├── fileOps.js            # 파일 읽기·퍼지탐색·쓰기
├── diffUtils.js          # Diff 생성 및 텔레그램 포맷
├── gitHandler.js         # simple-git 자동 커밋
├── botHandlers.js        # Telegraf 텍스트·콜백 핸들러
└── orchestrator.js       # 전체 플로우 조율
```

---

## 7. API / Interface Contract

### 텔레그램 명령

| 명령        | 설명                              | 봇 응답 예시                                 |
|-------------|-----------------------------------|----------------------------------------------|
| 자유 텍스트 | 자연어 코드 수정 요청 (메인 기능)  | Diff 미리보기 + 승인/거절 버튼              |
| `/status`   | 현재 Lock 상태 + 마지막 작업 결과 | "🟢 대기 중. 마지막 작업: 커밋 완료"        |
| `/cancel`   | 승인 대기 중인 작업 취소          | "🚫 작업이 취소되었습니다."                 |

### Diff 미리보기 메시지 포맷

```
📋 수정 계획

📄 파일 1: src/auth/login.js
\`\`\`diff
- if (password === storedPassword) {
+ if (await bcrypt.compare(password, storedPassword)) {
\`\`\`

📄 파일 2: src/routes/user.js
\`\`\`diff
+ const bcrypt = require('bcrypt');
\`\`\`

진행할까요?
[✅ 승인]  [❌ 거절]
```

---

## 8. Data Model

### ShimResult (AI Shim 출력 JSON 스키마)

```json
{
  "status": "ok | clarification_needed",
  "clarificationQuestion": "string (status=clarification_needed 일 때만 존재)",
  "targetFiles": ["src/auth/login.js"],
  "action": "modify_function | add_function | delete_function | modify_line | add_import | other",
  "description": "login 함수의 비밀번호 검증을 bcrypt.compare로 교체",
  "changes": [
    {
      "file": "src/auth/login.js",
      "type": "replace | insert | delete",
      "targetIdentifier": "function login",
      "originalSnippet": "if (password === storedPassword) {",
      "newSnippet": "if (await bcrypt.compare(password, storedPassword)) {"
    }
  ],
  "commitMessage": "feat: replace plain-text password check with bcrypt.compare in login"
}
```

### Lock 상태 (lock.js)

```javascript
// 인메모리 상태 — 프로세스 재시작 시 자동 초기화
let isLocked = false;
let pendingChanges = null;  // ShimResult | null
let lastResult = '';        // /status 응답용
```

### 환경 변수 (.env)

```
TELEGRAM_BOT_TOKEN=...
ALLOWED_USER_ID=123456789        # 단일 정수 ID
ANTHROPIC_API_KEY=sk-ant-...
TARGET_PROJECT_PATH=C:\church-platform-main
```

---

## 9. Error Handling & Edge Cases

| ID    | 상황                       | 처리 방식                                                                        |
|-------|----------------------------|----------------------------------------------------------------------------------|
| EC-01 | 타겟 파일 없음             | fs.readdirSync로 재귀 탐색, 유사 파일명 최대 3개 제안 역질문 전송               |
| EC-02 | 다중 파일 수정             | 모든 변경을 단일 Diff 메시지에 요약, 단일 [✅ 승인] 버튼으로 일괄 처리          |
| EC-03 | 모호한 자연어 명령         | AI Shim이 `clarification_needed` 반환, 구체적 선택지 포함 역질문 전송           |
| EC-04 | Git 커밋 실패             | 파일 저장 상태 유지(롤백 없음), "⚠️ 파일 수정 성공, 커밋 실패: [에러]" 전송    |
| EC-05 | 작업 중 새 명령 도착       | `isLocked=true` 확인 후 "현재 이전 지시사항을 처리 중입니다. 완료 후 다시 명령해주세요 ⏳" 전송 |
| EC-06 | 미등록 User ID 접근        | 응답·로그 없이 완전 무시 (NFR-02)                                                |

---

## 10. Acceptance Criteria

- [ ] 등록된 User ID의 자연어 명령이 ShimResult JSON으로 파싱된다.
- [ ] 미등록 User ID의 메시지에 봇이 어떤 응답도 하지 않는다.
- [ ] 파일명이 모호하면 봇이 후보 파일 목록(최대 3개)을 제안한다.
- [ ] 명령이 모호하면 봇이 선택지를 포함한 역질문을 보낸다.
- [ ] 다중 파일 수정 시 Diff가 한 메시지에 요약되고 단일 버튼으로 승인된다.
- [ ] [✅ 승인] 클릭 후 타겟 파일이 실제로 수정 저장된다.
- [ ] [✅ 승인] 후 `commitMessage`로 git commit이 실행된다.
- [ ] [❌ 거절] 클릭 시 파일이 원본 그대로 유지된다.
- [ ] 작업 중 새 명령 전송 시 "처리 중" 메시지가 전송되고 명령이 무시된다.
- [ ] `.env`의 `TARGET_PROJECT_PATH` 변경만으로 다른 프로젝트에 즉시 적용된다.

---

## 11. Out of Scope

- 앱 프로세스 실행·종료 (Hot-reload에 위임)
- Pull Request 생성
- Git push, 브랜치 생성·전환
- 멀티 유저 / 팀 협업
- 큐 기반 작업 스케줄링
- 커밋 실패 시 자동 복구·롤백
- 웹 대시보드 / 로그 UI
- 텔레그램 외 채널 (Slack, Discord 등)

---

## 12. Open Questions

*(없음 — Approved 상태)*

---

## Development Task Breakdown

> 의존 관계: Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9  
> 각 Task는 독립적으로 구현·테스트 가능한 단위입니다.

---

### Task 1 — Project Scaffolding & Environment Setup

**목표:** Node.js 프로젝트 뼈대 생성 및 개발 환경 구성

```
디렉토리: telegram-coding-agent/

체크리스트:
□ package.json 초기화
  dependencies:
    - telegraf          (Telegram 봇)
    - @anthropic-ai/sdk (AI Shim)
    - simple-git        (Git 커밋)
    - diff              (Diff 생성)
    - dotenv            (환경변수)
□ .env.example 작성
    TELEGRAM_BOT_TOKEN=
    ALLOWED_USER_ID=
    ANTHROPIC_API_KEY=
    TARGET_PROJECT_PATH=
□ config.js — dotenv 로드 + 필수 키 누락 시 명시적 에러
□ .gitignore — .env 제외
□ npm install 실행
```

**완료 기준:** `node index.js` 실행 시 `.env` 누락 키를 명시적 에러로 출력

---

### Task 2 — Security Guard (User ID Whitelist)

**목표:** `ALLOWED_USER_ID` 이외의 모든 메시지를 완전 차단

```javascript
// security.js
const { ALLOWED_USER_ID } = require('./config');

function isAuthorized(userId) {
  return userId === Number(ALLOWED_USER_ID);
}

module.exports = { isAuthorized };
```

```
적용 위치: botHandlers.js의 모든 핸들러 최상단
isAuthorized(ctx.from.id) === false → return (응답 없음)
```

**완료 기준:** 다른 계정으로 메시지 전송 시 봇 완전 침묵 확인

---

### Task 3 — Telegraf Bootstrap + Lock Mechanism

**목표:** 봇 기동, `/status`, `/cancel` 처리, Lock 상태 관리

```javascript
// lock.js
let isLocked = false;
let pendingChanges = null;
let lastResult = '';

module.exports = {
  get: () => ({ isLocked, pendingChanges, lastResult }),
  lock: () => { isLocked = true; },
  unlock: () => { isLocked = false; pendingChanges = null; },
  setPending: (changes) => { pendingChanges = changes; },
  setLastResult: (msg) => { lastResult = msg; },
};
```

```
index.js:
- new Telegraf(token)
- bot.command('status', handler)
- bot.command('cancel', handler)
- bot.on('text', orchestrator.handleMessage)
- bot.launch() — Long-polling 시작

텍스트 핸들러 진입 시:
  isLocked=true → "현재 이전 지시사항을 처리 중입니다. 완료 후 다시 명령해주세요 ⏳" → return
```

**완료 기준:** `/status` 응답, Lock 중 새 메시지 차단 메시지 확인

---

### Task 4 — AI Shim (자연어 → ShimResult JSON)

**목표:** Claude API로 자연어 명령을 ShimResult JSON으로 변환

```javascript
// aiShim.js
const Anthropic = require('@anthropic-ai/sdk');

async function parseCommand(userMessage, fileTree) {
  const client = new Anthropic();
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,  // ShimResult JSON 스키마 명시
    messages: [
      { role: 'user', content: `파일 트리:\n${fileTree}\n\n명령: ${userMessage}` }
    ],
  });

  return JSON.parse(response.content[0].text); // ShimResult
}
```

```
System Prompt 포함 내용:
- 역할: 코드 수정 의도 분석기
- 출력: 반드시 ShimResult JSON만 반환
- 모호하면 status=clarification_needed + clarificationQuestion 반환
- JSON 스키마 (§8 참조)
```

**완료 기준:** 명확한 명령 → `status: "ok"` + `changes[]` 반환,  
모호한 명령 → `status: "clarification_needed"` + 질문 반환

---

### Task 5 — File Operations (읽기·퍼지탐색·쓰기)

**목표:** 파일 읽기, 없을 때 후보 탐색, 수정 후 저장

```javascript
// fileOps.js
const fs = require('fs');
const path = require('path');

// 파일 읽기
function readFile(relativePath) { ... }          // string | null

// 디렉토리 재귀 탐색 → 유사 파일명 최대 3개
function fuzzySearch(filename, rootPath) { ... } // string[]

// ShimResult.changes[] 기반 파일 수정 (originalSnippet → newSnippet 치환)
function applyChanges(changes, rootPath) { ... } // void

// AI Shim용 파일 트리 문자열 생성 (node_modules 제외)
function buildFileTree(rootPath) { ... }         // string
```

**완료 기준:** 존재하지 않는 파일명 → 유사 경로 1~3개 반환,  
`applyChanges` 실행 후 파일 내용 변경 확인

---

### Task 6 — Diff Generator + Telegram 승인 플로우

**목표:** 변경 전·후 Diff 생성, 인라인 버튼으로 승인 수신

```javascript
// diffUtils.js
const Diff = require('diff');

function generateDiff(original, modified, filename) {
  const patch = Diff.createPatch(filename, original, modified);
  return '```diff\n' + patch + '\n```';
}

function formatDiffMessage(changes) {
  // changes 배열 → 파일별 Diff 블록 합산
  // 다중 파일: "📄 파일 1: ...\n📄 파일 2: ..."
}
```

```javascript
// botHandlers.js — 승인 플로우
bot.action('approve', async (ctx) => {
  // 1. fileOps.applyChanges(pendingChanges)
  // 2. gitHandler.autoCommit(commitMessage)
  // 3. 결과 메시지 전송
  // 4. lock.unlock()
});

bot.action('reject', async (ctx) => {
  lock.unlock();
  ctx.reply('🚫 취소되었습니다.');
});
```

**완료 기준:** Diff 메시지 + 버튼 전송 확인, 각 버튼 클릭 시 분기 동작 확인

---

### Task 7 — Git Commit Handler

**목표:** 승인 후 `commitMessage`로 자동 커밋

```javascript
// gitHandler.js
const simpleGit = require('simple-git');

async function autoCommit(repoPath, message) {
  const git = simpleGit(repoPath);
  try {
    await git.add('.');
    await git.commit(message);
    return { success: true, message };
  } catch (err) {
    return { success: false, error: err.message };
    // 파일 롤백 없음 — 호출부에서 에러 알림만
  }
}
```

**완료 기준:** 성공 시 `git log`에 커밋 확인,  
git 미초기화 상태에서 실패 시 파일 유지 + 에러 메시지 텔레그램 전송 확인

---

### Task 8 — Orchestrator (전체 플로우 연결)

**목표:** Task 2~7을 순서대로 호출하는 메인 파이프라인 완성

```javascript
// orchestrator.js
async function handleMessage(ctx) {
  // 1. isAuthorized()              → false: return
  // 2. lock.get().isLocked         → true: "처리 중 ⏳", return
  // 3. lock.lock()
  // 4. fileOps.buildFileTree()
  // 5. aiShim.parseCommand()
  //    └─ clarification_needed     → 역질문 전송, lock.unlock(), return
  // 6. fileOps.readFile() per targetFiles
  //    └─ 파일 없음               → fuzzySearch → 역질문, lock.unlock(), return
  // 7. diffUtils.formatDiffMessage()
  // 8. lock.setPending(shimResult)
  // 9. ctx.reply(diffMessage, inlineKeyboard)
  //    (이후 콜백 핸들러에서 저장 + 커밋)
}
```

**완료 기준:** Happy Path 시나리오 1회 엔드투엔드 통과

---

### Task 9 — Integration Testing & Demo Prep

**목표:** 전체 시나리오 검증 및 데모 준비 완료

```
테스트 시나리오:
□ Happy Path: 명확한 명령 → Diff → 승인 → 파일 수정 → 커밋
□ EC-01: 없는 파일명 → 후보 제안 → 선택 → Happy Path
□ EC-03: 모호한 명령 → 역질문 → 명확화 → Happy Path
□ EC-04: Git 미초기화 → 커밋 실패 알림, 파일은 수정 유지
□ EC-05: 작업 중 새 명령 → "처리 중 ⏳" 차단
□ EC-06: 다른 계정 메시지 → 완전 침묵

데모 준비:
□ README.md: 설치 및 실행 1줄 가이드 (node index.js)
□ .env.example 최종 확인
□ 타겟 프로젝트(church-platform-main) 연동 테스트
```

**완료 기준:** 위 체크리스트 전 항목 통과, 데모 시연 가능 상태
