# WebSocket 테스트 가이드

## 📋 목차

1. [필요한 파일](#필요한-파일)
2. [필요한 패키지](#필요한-패키지)
3. [사전 준비사항](#사전-준비사항)
4. [테스트 파일 설명](#테스트-파일-설명)
5. [테스트 실행 방법](#테스트-실행-방법)
6. [예상 결과](#예상-결과)
7. [문제 해결](#문제-해결)

---

## 필요한 파일

### 테스트 스크립트 파일

다음 파일들이 `tests/scripts/` 디렉토리에 있어야 합니다:

1. **`test-websocket.js`**

   - 기본 웹소켓 연결 테스트
   - 토큰을 환경 변수로 받아서 사용
   - 간단한 연결 및 메시지 전송 테스트

2. **`test-websocket-full.js`**

   - 로그인부터 웹소켓 연결까지 전체 플로우 테스트
   - 이메일/비밀번호로 로그인 후 토큰 획득
   - 채팅방 목록 조회 후 실제 채팅방으로 테스트

3. **`test-websocket-with-token.js`**
   - 하드코딩된 토큰으로 웹소켓 연결 테스트
   - 채팅방 목록 조회 후 실제 채팅방으로 테스트
   - 가장 간단하게 테스트할 수 있는 파일

### 참고 문서

- **`WEBSOCKET_ENDPOINTS.md`**: 백엔드 WebSocket 엔드포인트 정리 문서
- **`README.md`**: 테스트 스크립트 기본 설명

---

## 필요한 패키지

다음 npm 패키지들이 설치되어 있어야 합니다:

```json
{
  "devDependencies": {
    "sockjs-client": "^1.6.1",
    "webstomp-client": "^1.2.6",
    "axios": "^1.x.x"
  }
}
```

### 패키지 설치 방법

```bash
npm install --save-dev sockjs-client webstomp-client axios
```

또는 이미 설치되어 있는지 확인:

```bash
npm list sockjs-client webstomp-client axios
```

---

## 사전 준비사항

### 1. 백엔드 서버 실행

백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.

```bash
# 백엔드 디렉토리로 이동
cd ../mogakjak-be

# 서버 실행 (Gradle 사용 시)
./gradlew bootRun

# 또는 IDE에서 실행
```

### 2. JWT 토큰 준비

테스트를 위해서는 유효한 JWT 토큰이 필요합니다.

**토큰 획득 방법:**

1. **프론트엔드 로그인 후 획득**

   - `http://localhost:3000`에서 로그인
   - 브라우저 개발자 도구 → Application → Local Storage
   - `accessToken` 값 확인

2. **백엔드 로그인 API 사용**

   ```bash
   curl -X POST http://localhost:8080/member/doLogin \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com","password":"your-password"}'
   ```

3. **기존 토큰 사용** (만료되지 않은 경우)
   - `test-websocket-with-token.js`에 하드코딩된 토큰 사용 가능

### 3. 채팅방 준비 (선택사항)

실제 메시지 전송/수신 테스트를 위해서는 채팅방이 필요합니다.

**채팅방 생성 방법:**

1. **프론트엔드에서 생성**

   - 채팅 기능에서 그룹 채팅방 생성

2. **백엔드 API 사용**

   ```bash
   curl -X POST "http://localhost:8080/chat/room/group/create?roomName=테스트방" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **채팅방 참여**
   ```bash
   curl -X POST "http://localhost:8080/chat/room/group/{roomId}/join" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

**참고:** 채팅방이 없어도 WebSocket 연결과 구독은 테스트할 수 있습니다.

---

## 테스트 파일 설명

### 1. `test-websocket.js`

**용도:** 가장 간단한 WebSocket 연결 테스트

**특징:**

- 환경 변수로 토큰 받음
- 테스트용 roomId (`test-room`) 사용
- 실제 채팅방이 없어도 연결 테스트 가능

**사용 시나리오:**

- WebSocket 연결만 빠르게 확인하고 싶을 때
- 토큰이 유효한지 확인하고 싶을 때

### 2. `test-websocket-full.js`

**용도:** 로그인부터 WebSocket까지 전체 플로우 테스트

**특징:**

- 이메일/비밀번호로 자동 로그인
- 채팅방 목록 자동 조회
- 실제 채팅방으로 테스트

**사용 시나리오:**

- 처음부터 끝까지 전체 플로우 테스트
- 새로운 계정으로 테스트하고 싶을 때

### 3. `test-websocket-with-token.js`

**용도:** 하드코딩된 토큰으로 빠른 테스트

**특징:**

- 토큰이 파일에 하드코딩되어 있음
- 채팅방 목록 자동 조회
- 실제 채팅방으로 테스트

**사용 시나리오:**

- 개발 중 빠르게 테스트하고 싶을 때
- 토큰이 이미 알고 있을 때

---

## 테스트 실행 방법

### 방법 1: `test-websocket.js` (환경 변수 사용)

```bash
TEST_TOKEN=your-jwt-token node tests/scripts/test-websocket.js
```

**예시:**

```bash
TEST_TOKEN=eyJhbGciOiJIUzI1NiJ9... node tests/scripts/test-websocket.js
```

### 방법 2: `test-websocket-full.js` (로그인 포함)

```bash
TEST_EMAIL=your-email@example.com TEST_PASSWORD=your-password node tests/scripts/test-websocket-full.js
```

**예시:**

```bash
TEST_EMAIL=esther0904@naver.com TEST_PASSWORD=password123 node tests/scripts/test-websocket-full.js
```

### 방법 3: `test-websocket-with-token.js` (하드코딩된 토큰)

```bash
node tests/scripts/test-websocket-with-token.js
```

**주의:** 파일 내부의 `accessToken` 변수를 실제 토큰으로 수정해야 합니다.

---

## 예상 결과

### 성공적인 테스트 결과

```
🌐 웹소켓 연결 테스트 시작...

📋 1단계: 채팅방 목록 조회...
   ✅ 채팅방 목록 조회 성공
   채팅방 수: 1

📡 2단계: 웹소켓 연결 테스트 (roomId: xxx-xxx-xxx)...

✅ 웹소켓 연결 성공!
   STOMP 버전: 1.2
   서버: N/A

📡 Topic 구독 시도: /topic/xxx-xxx-xxx
✅ 구독 완료

📤 테스트 메시지 전송 시도...
   메시지 전송: {"senderEmail":"...","message":"..."}
✅ 메시지 전송 완료

📨 메시지 수신:
   발신자: ...
   메시지: ...

🔌 연결 종료 중...
✅ 연결 종료 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 웹소켓 연결 테스트 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 실패 시나리오

#### 1. 백엔드 서버가 실행되지 않은 경우

```
❌ SockJS 연결 오류: Error: connect ECONNREFUSED 127.0.0.1:8080
```

**해결:** 백엔드 서버를 실행하세요.

#### 2. 토큰이 유효하지 않은 경우

```
❌ 웹소켓 연결 실패:
   에러: Frame {
     command: 'ERROR',
     headers: { ... },
     body: '...'
   }
```

**해결:** 유효한 JWT 토큰을 사용하세요.

#### 3. 채팅방 권한이 없는 경우

```
❌ 웹소켓 연결 실패:
   에러: AuthenticationServiceException: 해당 room에 권한이 없습니다.
```

**해결:** 해당 채팅방에 참여하거나, 참여 권한이 있는 채팅방을 사용하세요.

---

## 문제 해결

### 문제 1: `Cannot find module 'sockjs-client'`

**원인:** 필요한 패키지가 설치되지 않음

**해결:**

```bash
npm install --save-dev sockjs-client webstomp-client axios
```

### 문제 2: `connect ECONNREFUSED`

**원인:** 백엔드 서버가 실행되지 않음

**해결:**

1. 백엔드 서버가 실행 중인지 확인
2. `http://localhost:8080`에서 접근 가능한지 확인
3. 포트 번호가 올바른지 확인

### 문제 3: `토큰 검증 실패`

**원인:** JWT 토큰이 만료되었거나 유효하지 않음

**해결:**

1. 새로운 토큰으로 로그인하여 획득
2. 토큰이 만료되지 않았는지 확인
3. 토큰 형식이 올바른지 확인 (Bearer 제외한 토큰만 사용)

### 문제 4: `해당 room에 권한이 없습니다`

**원인:** 구독하려는 채팅방에 참여하지 않음

**해결:**

1. 채팅방에 먼저 참여
2. 참여 권한이 있는 채팅방 ID 사용
3. 또는 새로운 채팅방 생성 후 테스트

### 문제 5: `Failed to send message to ExecutorSubscribableChannel`

**원인:**

- 구독하려는 경로가 백엔드에 구현되지 않음
- 또는 StompHandler에서 권한 체크 실패

**해결:**

1. 구독 경로가 백엔드에 구현되어 있는지 확인
2. 채팅방의 경우: 채팅방에 참여했는지 확인
3. 타이머의 경우: 백엔드에 타이머 WebSocket이 구현되어 있는지 확인

---

## 추가 정보

### 백엔드 WebSocket 엔드포인트

자세한 엔드포인트 정보는 `WEBSOCKET_ENDPOINTS.md`를 참고하세요.

**주요 엔드포인트:**

- **연결**: `/connect` (SockJS)
- **발행**: `/publish/{roomId}` (클라이언트 → 서버)
- **구독**: `/topic/{roomId}` (서버 → 클라이언트)

### 테스트 체크리스트

- [ ] 백엔드 서버 실행 중
- [ ] 필요한 npm 패키지 설치됨
- [ ] 유효한 JWT 토큰 준비됨
- [ ] (선택) 테스트할 채팅방 생성/참여됨
- [ ] 테스트 스크립트 파일 존재 확인

---

## 참고 자료

- [SockJS 공식 문서](https://github.com/sockjs/sockjs-client)
- [STOMP 프로토콜](https://stomp.github.io/)
- [Spring WebSocket 가이드](https://spring.io/guides/gs/messaging-stomp-websocket/)
