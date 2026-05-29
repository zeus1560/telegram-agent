# Telegram Coding Agent

> 텔레그램 메시지 한 줄로 로컬 코드를 수정하는 원격 코딩 에이전트

텔레그램 채팅창에서 자연어로 명령하면 AI가 코드를 분석해 수정 Diff를 제안하고,  
승인 버튼 한 번으로 파일 저장과 Git 커밋까지 자동으로 처리합니다.

---

## 목차

- [주요 기능](#주요-기능)
- [아키텍처](#아키텍처)
- [설계 철학 — 왜 서버 배포가 없나](#설계-철학--왜-서버-배포가-없나)
- [사전 준비](#사전-준비)
- [설치](#설치)
- [환경 변수 설정](#환경-변수-설정)
- [실행](#실행)
- [명령어 레퍼런스](#명령어-레퍼런스)
- [사용 예시](#사용-예시)
- [선택 기능 — Notion 로그](#선택-기능--notion-로그)
- [다중 프로젝트 운영](#다중-프로젝트-운영)
- [프로젝트 구조](#프로젝트-구조)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **자연어 코드 수정** | "버튼 색을 파란색으로 바꿔줘" 같은 자연어 명령을 AI가 코드 변경으로 변환 |
| **Diff 미리보기** | 수정 전 Diff를 텔레그램으로 전송, ✅ / ❌ 버튼으로 적용 여부 결정 |
| **다중 파일 부분 승인** | 파일별로 개별 승인·거절 가능 |
| **Git 자동 커밋** | 승인 즉시 스테이징 → 커밋 → (원격 있으면) Push |
| **Hot-reload 연동** | nodemon이 파일 변경 감지, 봇은 재시작 불필요 |
| **보안** | 등록된 단일 User ID만 응답, 민감 파일(.env, .key, .pem 등) 수정 차단 |
| **Undo** | 마지막 커밋을 revert 커밋으로 되돌리기 |
| **코드 분석** | `/analyze` 명령으로 AI 코드 리뷰 보고서 생성 |
| **npm 실행** | 화이트리스트 npm 명령을 타겟 프로젝트에서 원격 실행 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (텔레그램)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 자연어 명령 전송
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Telegram Coding Agent (Node.js)                │
│                                                                   │
│  index.js ──────▶ botHandlers.js    ◀── /커맨드 처리             │
│                   orchestrator.js   ◀── 자유 텍스트 처리          │
│                         │                                         │
│              ┌──────────▼──────────┐                             │
│              │      aiShim.js       │                             │
│              │  ┌────────┐         │                             │
│              │  │ 1단계  │ 파일 식별 (llama-3.1-8b)             │
│              │  └───┬────┘         │                             │
│              │  ┌───▼────┐         │                             │
│              │  │ 2단계  │ 코드 생성 (llama-3.3-70b)            │
│              │  └───┬────┘         │                             │
│              └──────┼──────────────┘                             │
│                     │ ShimResult JSON                             │
│                     ▼                                             │
│   fileOps.js ◀── diffUtils.js ──▶  Diff 메시지 + 버튼 전송      │
│   (파일 읽기/쓰기)                                                │
│         │                          사용자가 ✅ 클릭               │
│         ▼                                                         │
│   gitHandler.js  (commit + push)                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ 파일 변경 감지
                       ▼
            nodemon / PM2 (Hot-reload)
```

### AI 2단계 호출 흐름

```
사용자: "App.jsx 헤더를 환영합니다로 바꿔줘"
    │
    ▼
[1단계] llama-3.1-8b-instant  (빠르고 저렴)
    └─ 분석: "src/App.jsx 파일을 modify"
    │
    ▼
실제 파일 내용 읽기 (fileOps.js)
    │
    ▼
[2단계] llama-3.3-70b-versatile  (정확한 코드 생성)
    └─ 생성: originalSnippet → newSnippet JSON
    │
    ▼
Diff 미리보기 → [✅ 승인] → 파일 저장 → Git 커밋
```

---

## 설계 철학 — 왜 서버 배포가 없나

이 프로젝트는 **"개발자 한 명의 PC에서 돌아가는 개인 에이전트"** 로 설계되었습니다.  
일반적인 웹 서비스처럼 서버에 올려두고 여러 사람이 쓰는 구조가 아닙니다.

### 왜 중앙 서버 배포가 불가능한가

```
일반 웹서비스:   사용자 → 서버 → DB  (서버 한 대로 N명 서비스 가능)

이 프로젝트:     사용자 → 봇 → 내 PC의 로컬 파일 수정
                              ↑
                         여기가 핵심
```

봇이 수정하는 대상이 **서버 파일이 아니라 개발자 본인의 로컬 파일**입니다.  
서버에 배포하면 서버 안 파일만 바뀌고, 실제 개발자 PC의 코드는 변하지 않습니다.

또한 구조상 다음 이유로 멀티유저 SaaS 전환이 불가능합니다.

| 제약 | 이유 |
|------|------|
| `TARGET_PROJECT_PATH`가 로컬 절대경로 | 서버에서는 해당 경로가 존재하지 않음 |
| `ALLOWED_USER_ID`가 1명 고정 | 단일 사용자 보안 모델로 설계됨 |
| Git 커밋이 로컬 저장소 대상 | 서버 저장소 ≠ 개발자 작업 저장소 |
| 파일 시스템 직접 접근 | 다른 사용자의 코드에는 접근 불가 |

> 만약 여러 사용자에게 제공하려면 사용자별 클라우드 VM + 원격 git 연동으로 아키텍처를 전면 재설계해야 합니다. 현재 프로젝트의 범위 밖입니다.

### 이 설계의 장점

- **비용 없음** — 별도 서버 없이 내 PC만으로 동작
- **지연 없음** — 네트워크를 거치지 않고 직접 파일 I/O
- **API 키 노출 없음** — Groq 키가 개인 PC `.env`에만 존재
- **단순함** — 프로세스 하나(`node index.js`)가 전부

### 다른 개발자가 사용하려면

이 프로젝트는 **각자 자신의 환경에 직접 설치**하는 방식으로 배포됩니다.  
저장소를 클론하고 본인의 `.env`를 작성하면 5분 안에 동작합니다.

```bash
git clone https://github.com/zeus1560/telegram-agent.git
cd telegram-agent
npm install
cp .env.example .env
# .env 파일에 본인 토큰·경로 입력
node index.js
```

설정이 필요한 항목은 아래 4가지뿐입니다.

| 항목 | 발급처 | 소요 시간 |
|------|--------|-----------|
| `TELEGRAM_BOT_TOKEN` | @BotFather | 1분 |
| `ALLOWED_USER_ID` | @userinfobot | 30초 |
| `GROQ_API_KEY` | console.groq.com (무료) | 2분 |
| `TARGET_PROJECT_PATH` | 본인 프로젝트 경로 직접 입력 | 즉시 |

---

## 사전 준비

| 항목 | 요구 사항 |
|------|-----------|
| **Node.js** | 18 이상 (`node --version` 으로 확인) |
| **npm** | Node.js와 함께 설치됨 |
| **Git** | 타겟 프로젝트가 `git init` 또는 `git clone`된 상태여야 함 |
| **Telegram 계정** | 봇 생성용 |
| **Groq 계정** | 무료 API 키 발급 가능 |

---

## 설치

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/telegram-coding-agent.git
cd telegram-coding-agent

# 2. 의존성 설치
npm install

# 3. 환경 변수 파일 생성
cp .env.example .env
```

---

## 환경 변수 설정

`.env` 파일을 열어 아래 4가지 필수 항목을 채웁니다.

```env
TELEGRAM_BOT_TOKEN=
ALLOWED_USER_ID=
GROQ_API_KEY=
TARGET_PROJECT_PATH=
```

### ① TELEGRAM_BOT_TOKEN — 봇 토큰 발급

1. 텔레그램 앱에서 **[@BotFather](https://t.me/BotFather)** 검색 → 대화 시작
2. `/newbot` 명령 입력
3. 봇 표시 이름 입력 (예: `My Coding Agent`)
4. 봇 사용자명 입력 — 반드시 `bot`으로 끝나야 함 (예: `my_coding_bot`)
5. BotFather가 발급한 토큰을 아래와 같이 입력

```env
TELEGRAM_BOT_TOKEN=7412345678:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ② ALLOWED_USER_ID — 허가된 User ID

봇은 이 ID의 메시지만 처리합니다. 본인의 User ID 확인 방법:

1. 텔레그램에서 **[@userinfobot](https://t.me/userinfobot)** 검색 → `/start`
2. 표시되는 `Id:` 숫자를 복사

```env
ALLOWED_USER_ID=123456789
```

> **주의:** 숫자만 입력하세요. 앞에 `@`를 붙이지 않습니다.

### ③ GROQ_API_KEY — Groq API 키

1. [console.groq.com](https://console.groq.com) 회원가입 (GitHub 로그인 가능)
2. 좌측 메뉴 **API Keys** → **Create API Key**
3. 발급된 키 복사

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **무료 플랜 제한:** 분당 30 요청 / 일 14,400 요청. 개인 사용에는 충분합니다.

### ④ TARGET_PROJECT_PATH — 수정할 프로젝트 경로

코드를 수정할 로컬 프로젝트의 **절대 경로**를 입력합니다.

```env
# Windows
TARGET_PROJECT_PATH=C:\Users\me\projects\my-app

# macOS / Linux
TARGET_PROJECT_PATH=/Users/me/projects/my-app
```

> 해당 경로가 git 저장소여야 자동 커밋 기능이 동작합니다.

### 선택 항목

```env
# 기본 프로젝트에 이름 부여 (기본값: "default")
TARGET_PROJECT_NAME=frontend

# Git 커밋 작성자 (기본값: "Telegram Bot" <bot@church.local>)
GIT_USER_NAME=My Bot
GIT_USER_EMAIL=bot@example.com

# Notion 로그 연동 (선택 — 아래 섹션 참조)
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

---

## 실행

### 개발 환경 (nodemon)

파일이 변경되면 자동으로 재시작합니다.

```bash
npm run dev
```

### 운영 환경 (PM2)

크래시 시 자동 재시작, 서버 재부팅 후에도 자동 시작됩니다.

```bash
# PM2 전역 설치 (최초 1회)
npm install -g pm2

# 봇 시작
npm run pm2:start

# 상태 확인
pm2 status

# 로그 확인
npm run pm2:logs

# 봇 중지
npm run pm2:stop
```

### 직접 실행 (테스트용)

```bash
npm start
```

봇이 정상 시작되면 등록한 텔레그램 계정으로 아래 메시지가 도착합니다:

```
🟢 Telegram Coding Agent가 시작되었습니다.
```

---

## 명령어 레퍼런스

### 메인 기능

| 입력 | 설명 |
|------|------|
| `자유 텍스트` | 자연어로 코드 수정 요청 |
| `(거절 후 텍스트)` | 피드백을 반영해 코드 재생성 |

### 슬래시 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/status` | Lock 상태 및 마지막 작업 결과 확인 |
| `/history` | 최근 수정 내역 5건 |
| `/undo` | 마지막 커밋을 git revert로 되돌리기 |
| `/analyze <파일경로>` | AI 코드 품질 분석 보고서 |
| `/show <파일경로>` | 파일 내용 미리보기 (최대 50줄) |
| `/npm <명령>` | 화이트리스트 npm 명령 원격 실행 |
| `/projects` | 등록된 프로젝트 목록 |
| `/switch <이름>` | 활성 프로젝트 전환 |
| `/cancel` | 진행 중인 작업 취소 |

**`/npm` 허용 명령:**

```
install   ci   test
run build / dev / start / test / lint / preview
```

---

## 사용 예시

### 코드 수정 → 승인

```
나:  App.jsx 헤더 문구를 "환영합니다"로 바꿔줘

봇:  🔍 명령을 분석 중입니다...
     ✏️ 수정 코드를 생성 중입니다...

     📋 수정 계획

     📄 src/App.jsx
     ```diff
     @@ -5,7 +5,7 @@
     -  return <h1>테스트</h1>;
     +  return <h1>환영합니다</h1>;
     ```
     ✏️ 헤더 문구를 환영합니다로 변경

     진행할까요?  [✅ 승인]  [❌ 거절]

나:  [✅ 승인]

봇:  💾 파일 저장 완료. Hot-reload가 서버를 재시작합니다.
     ✅ 커밋 완료
     `feat: 헤더 문구를 환영합니다로 변경`
```

### 거절 → 피드백으로 재수정

```
나:  [❌ 거절]

봇:  🚫 거절되었습니다. 파일은 변경되지 않았습니다.
     어떻게 수정할까요? 피드백을 입력해 주세요.
     (새 명령으로 처음부터 하려면 /cancel 을 먼저 입력하세요)

나:  그냥 "Hello World"로 해줘

봇:  ✏️ 피드백을 반영해 수정 코드를 재생성 중입니다...
     (새 Diff 프리뷰와 버튼 전송)
```

### 모호한 명령 → AI 역질문

```
나:  색 좀 바꿔봐

봇:  🤔 어떤 파일의 색상을 변경할까요?
     A. src/App.jsx
     B. src/components/Button.jsx
     C. 직접 입력해 주세요.
```

### 다중 파일 수정 → 파일별 승인

```
나:  헤더랑 버튼 색 모두 파란색으로 바꿔줘

봇:  📋 총 2개 파일이 수정됩니다. 파일별로 승인 또는 거절해 주세요.

     📄 src/App.jsx
     ```diff
     - background: red;
     + background: blue;
     ```
     [✅ 승인]  [❌ 거절]

     📄 src/components/Button.jsx
     ```diff
     - color: green;
     + color: blue;
     ```
     [✅ 승인]  [❌ 거절]
```

### 코드 분석

```
나:  /analyze src/App.jsx

봇:  🔍 `src/App.jsx` 분석 중...

     🟡 경고
     [line 12] useState가 초기화 없이 사용됨 → 기본값 명시 권장
     [line 28] 에러 처리 없는 fetch 호출 → try-catch 추가 권장

     🟢 제안
     [line 5] 컴포넌트명이 소문자 → PascalCase 변경 권장
     [line 41] 중복된 스타일 선언 → 공통 클래스로 추출 권장
```

### 실행 취소

```
나:  /undo

봇:  ⏪ 마지막 커밋을 되돌립니다...
     커밋: `feat: 헤더 문구를 환영합니다로 변경`

     ✅ Revert 완료
     "App.jsx 헤더 문구를 환영합니다로 바꿔줘" 작업이 취소되었습니다.
```

---

## 선택 기능 — Notion 로그

승인된 커밋 내역을 Notion 데이터베이스에 자동 기록합니다.  
설정하지 않아도 봇은 정상 동작합니다.

### Notion 데이터베이스 속성 구성

| 속성명 | 타입 |
|--------|------|
| 커밋 | Title |
| 명령 | Rich text |
| 파일 | Rich text |
| 날짜 | Date |

### 설정 방법

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration** 생성
2. 위 속성으로 Notion 데이터베이스 생성
3. 데이터베이스 우측 상단 `···` → **Connections** → 생성한 Integration 연결
4. 데이터베이스 URL 마지막 32자리를 `NOTION_DATABASE_ID`에 입력

```
URL 예시: https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           이 32자리가 NOTION_DATABASE_ID
```

```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 다중 프로젝트 운영

`.env`에 `PROJECT_<이름>=<절대경로>` 형식으로 추가 프로젝트를 등록하면  
`/switch` 명령으로 전환할 수 있습니다.

```env
TARGET_PROJECT_PATH=C:\projects\frontend
TARGET_PROJECT_NAME=frontend

PROJECT_api=C:\projects\api
PROJECT_docs=C:\projects\docs
```

```
나:  /projects

봇:  📂 등록된 프로젝트 목록

     ▶ frontend  →  C:\projects\frontend
       api       →  C:\projects\api
       docs      →  C:\projects\docs

     전환: /switch <이름>

나:  /switch api

봇:  ✅ 프로젝트 전환 완료
     ▶ api  →  C:\projects\api
```

---

## 프로젝트 구조

```
telegram-coding-agent/
├── index.js               봇 진입점, PM2 크래시 감지
├── config.js              환경변수 로드 및 필수 키 검증
├── security.js            User ID 인가, 민감 파일 차단
├── orchestrator.js        2단계 AI 호출 플로우 조율
├── botHandlers.js         /커맨드 및 인라인 버튼 콜백 핸들러
├── aiShim.js              Groq LLM 어댑터 (2-step 호출)
├── prompts.js             AI 시스템 프롬프트 상수 모음
├── lock.js                인메모리 Lock (동시 명령 차단)
├── fileOps.js             파일 읽기·쓰기·퍼지탐색·변경 적용
├── diffUtils.js           Diff 생성 및 텔레그램 메시지 포맷
├── gitHandler.js          git commit / revert 자동화
├── conversationHistory.js 수정 이력 관리 (최대 5턴, 파일 영속)
├── projectState.js        현재 활성 프로젝트 상태
├── notionLogger.js        Notion 커밋 로그 (선택 기능)
├── ecosystem.config.js    PM2 설정
├── .env.example           환경변수 템플릿
└── README.md              이 파일
```

---

## 라이선스

MIT
