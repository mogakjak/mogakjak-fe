# 백엔드 WebSocket 엔드포인트 정리

## 기본 설정 (StompWebSocketConfig.java)

### WebSocket 연결 엔드포인트

- **엔드포인트**: `/connect`
- **프로토콜**: SockJS 사용
- **허용 Origin**: `http://localhost:3000`
- **연결 URL**: `http://localhost:8080/connect`

### 메시지 브로커 설정

- **Application Destination Prefix**: `/publish`
  - 클라이언트가 메시지를 보낼 때 사용하는 prefix
  - 예: `/publish/{roomId}` → `@MessageMapping("/{roomId}")`로 라우팅
- **Topic Prefix**: `/topic`
  - 클라이언트가 구독할 때 사용하는 prefix
  - 예: `/topic/{roomId}` → 해당 roomId의 메시지를 구독

## 현재 구현된 WebSocket 엔드포인트

### 1. 채팅 (Chat/StompController)

#### 메시지 발행 (클라이언트 → 서버)

- **경로**: `/publish/{roomId}`
- **메서드**: `@MessageMapping("/{roomId}")`
- **요청 형식**:
  ```json
  {
    "senderEmail": "user@example.com",
    "message": "채팅 메시지 내용"
  }
  ```

#### 메시지 구독 (서버 → 클라이언트)

- **경로**: `/topic/{roomId}`
- **응답 형식**: ChatMessageDto (Redis Pub/Sub을 통해 전송)

### 2. 타이머 (TimerController)

- **현재 상태**: ❌ WebSocket 미구현
- **현재 구현**: REST API만 존재
  - `/api/timers/start` (POST)
  - `/api/timers/pause` (POST)
  - `/api/timers/resume` (POST)
  - `/api/timers/stop` (POST)
  - `/api/timers/{sessionId}/next-phase` (POST)

## 예상되는 타이머 WebSocket 엔드포인트 (구현 필요)

### 메시지 발행 (클라이언트 → 서버)

- **타이머 시작**: `/publish/timer/start`
  - 예상 `@MessageMapping`: `/timer/start`
- **타이머 정지**: `/publish/timer/stop`
  - 예상 `@MessageMapping`: `/timer/stop`

### 메시지 구독 (서버 → 클라이언트)

- **개인 타이머 업데이트**: `/topic/timer/{userId}`
  - 사용자별 타이머 상태 업데이트 수신
- **그룹 타이머 업데이트**: `/topic/group/{groupId}/members`
  - 그룹 멤버들의 타이머 상태 업데이트 수신

## 테스트 방법

### 채팅 WebSocket 테스트

```bash
# 기존 테스트 파일 사용
node tests/scripts/test-websocket-with-token.js
```

### 타이머 WebSocket 테스트

```bash
# 타이머 WebSocket이 구현되면 사용
node tests/scripts/test-timer-websocket.js
```

## 참고사항

1. **인증**: 모든 WebSocket 연결은 JWT 토큰이 필요합니다.

   - 연결 시 헤더에 `Authorization: Bearer {token}` 포함

2. **SockJS 사용**: 순수 WebSocket이 아닌 SockJS를 사용하므로

   - 클라이언트에서 `new SockJS('http://localhost:8080/connect')` 사용

3. **STOMP 프로토콜**: 메시징 프로토콜로 STOMP 사용
   - 클라이언트에서 `Stomp.over(sockJs)` 또는 `@stomp/stompjs` 사용
