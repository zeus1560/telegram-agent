# Telegram Remote Coding Agent

텔레그램 메시지 하나로 로컬 프로젝트 코드를 수정하고 자동 커밋하는 1인용 원격 코딩 에이전트입니다.

## 동작 방식

1. 텔레그램에 자연어로 수정 명령 전송
2. AI가 대상 파일을 파악하고 수정 코드 생성
3. Diff 미리보기 + [✅ 승인] [❌ 거절] 버튼 수신
4. 승인 시 파일 저장 + 자동 Git 커밋

## 요구사항

- Node.js 18+
- Telegram Bot Token ([BotFather](https://t.me/botfather)에서 발급)
- Groq API Key ([console.groq.com](https://console.groq.com)에서 발급)
- 본인의 Telegram User ID

## 설치 및 실행

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 아래 4가지 값 입력

# 3. 봇 실행
node index.js
```

## 환경변수 (.env)

```
TELEGRAM_BOT_TOKEN=   # BotFather에서 발급한 봇 토큰
ALLOWED_USER_ID=      # 허용할 Telegram User ID (숫자)
GROQ_API_KEY=         # Groq API 키
TARGET_PROJECT_PATH=  # 수정할 프로젝트의 절대 경로 (예: C:\my-project)
```

> User ID 확인 방법: [@userinfobot](https://t.me/userinfobot)에 메시지 전송

## 사용 가능한 명령

| 명령 | 설명 |
|------|------|
| 자연어 텍스트 | 코드 수정 요청 (예: "auth.js의 login 함수를 bcrypt로 바꿔줘") |
| `/status` | 현재 상태 및 마지막 작업 결과 조회 |
| `/cancel` | 승인 대기 중인 작업 취소 |

## 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- 봇은 1인 전용입니다. `ALLOWED_USER_ID`에 등록된 계정만 명령을 처리합니다
- 앱 재시작은 nodemon(Hot-reload)에 위임합니다. 봇이 직접 서버를 재시작하지 않습니다
