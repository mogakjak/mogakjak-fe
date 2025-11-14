# 웹소켓 테스트 스크립트

이 폴더에는 웹소켓 연결을 테스트하는 스크립트들이 있습니다.

## 파일 목록

1. **test-websocket.js** - 기본 웹소켓 연결 테스트 (토큰 필요)
2. **test-websocket-full.js** - 로그인 후 웹소켓 연결 테스트
3. **test-websocket-with-token.js** - 제공된 토큰으로 웹소켓 연결 테스트

## 사용 방법

### 1. 기본 테스트 (토큰 필요)
```bash
TEST_TOKEN=your-jwt-token node tests/scripts/test-websocket.js
```

### 2. 로그인 포함 테스트
```bash
TEST_EMAIL=your-email@example.com TEST_PASSWORD=your-password node tests/scripts/test-websocket-full.js
```

### 3. 제공된 토큰으로 테스트
```bash
node tests/scripts/test-websocket-with-token.js
```

## 테스트 항목

- ✅ SockJS 웹소켓 연결
- ✅ STOMP 프로토콜 연결
- ✅ JWT 토큰 인증
- ✅ Topic 구독
- ✅ 메시지 전송
- ✅ 메시지 수신
- ✅ 연결 종료

## 참고사항

- 백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.
- 프론트엔드 서버가 `http://localhost:3000`에서 실행 중이어야 합니다.
- 유효한 JWT 토큰이 필요합니다.

