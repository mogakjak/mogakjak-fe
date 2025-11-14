# 채팅방 구독 및 메시지 전송 플로우

## 전체 흐름

```
1. 채팅방 페이지 진입
   ↓
2. 채팅방 참여 API 호출 (POST /api/chat/rooms/{roomId}/join)
   → 백엔드 DB에 사용자를 채팅방 참여자로 등록
   ↓
3. 참여 완료 후 WebSocket 연결
   ↓
4. /topic/{roomId} 구독 시도
   ↓
5. 백엔드 StompHandler에서 권한 체크
   → chatService.isRoomPaticipant(email, roomId) 확인
   → DB에 참여자 정보가 있으면 구독 허용
   ↓
6. 구독 성공 → 메시지 수신 가능
```

## 상세 설명

### 1. 채팅방 참여 (DB 상태 저장)

**프론트엔드:**
```typescript
// src/app/(pages)/chat/[roomId]/page.tsx
useEffect(() => {
  const joinRoom = async () => {
    const response = await fetch(`/api/chat/rooms/${roomId}/join`, {
      method: "POST",
    });
    // 참여 완료 후 hasJoined = true
  };
  joinRoom();
}, [roomId]);
```

**백엔드 API:**
- `POST /chat/room/group/{roomId}/join`
- 사용자를 채팅방 참여자로 DB에 저장
- 참여자 정보는 `chatService`를 통해 관리

### 2. WebSocket 연결 및 구독

**프론트엔드:**
```typescript
// src/app/_api/chat/useChatSocket.ts
// 참여 완료 후 (hasJoined = true) WebSocket 연결
client.subscribe(`/topic/${roomId}`, (message) => {
  // 메시지 수신 처리
});
```

**구독 경로:**
- `/topic/{roomId}` - 채팅방별 Topic
- 예: `/topic/7f000001-9a81-1b28-819a-81bc28f80000`

### 3. 백엔드 권한 체크

**StompHandler.java:**
```java
if(StompCommand.SUBSCRIBE == accessor.getCommand()){
    // 1. 토큰에서 이메일 추출
    String email = claims.getSubject();
    
    // 2. 구독 경로에서 roomId 추출
    // "/topic/{roomId}" → split("/")[2] = roomId
    String roomId = accessor.getDestination().split("/")[2];
    
    // 3. DB에서 참여자 확인
    if(!chatService.isRoomPaticipant(email, UUID.fromString(roomId))){
        throw new AuthenticationServiceException("해당 room에 권한이 없습니다.");
    }
}
```

**권한 체크 로직:**
- `chatService.isRoomPaticipant(email, roomId)` 호출
- DB에서 해당 사용자가 채팅방 참여자인지 확인
- 참여자가 아니면 구독 거부 (에러 발생)

### 4. 메시지 전송

**프론트엔드:**
```typescript
// 메시지 전송
client.publish({
  destination: `/publish/${roomId}`,
  body: JSON.stringify({
    senderEmail: "user@example.com",
    message: "안녕하세요",
    roomId: roomId
  })
});
```

**백엔드 처리:**
- `@MessageMapping("/publish/{roomId}")` 또는 유사한 핸들러에서 메시지 수신
- 메시지를 `/topic/{roomId}`로 브로드캐스트
- 구독 중인 모든 참여자에게 메시지 전달

## 핵심 포인트

1. **채팅방 상태는 DB에 저장됨**
   - 단순히 roomId로 구독하는 것이 아님
   - 먼저 채팅방에 참여해야 함 (DB에 참여자 정보 저장)

2. **구독 시 권한 체크**
   - 백엔드에서 구독 시도 시 권한 체크
   - DB에 참여자 정보가 있어야 구독 허용

3. **참여 → 구독 순서 보장**
   - 프론트엔드에서 `hasJoined` 상태로 순서 보장
   - 참여 완료 후에만 WebSocket 연결 시도

## 문제 해결

### "해당 room에 권한이 없습니다" 에러

**원인:**
- 채팅방에 참여하지 않은 상태에서 구독 시도
- 또는 참여 API 호출 실패

**해결:**
1. 채팅방 참여 API가 성공했는지 확인
2. DB에 참여자 정보가 저장되었는지 확인
3. 참여 완료 후 WebSocket 연결 시도

### WebSocket 연결은 되지만 구독 실패

**원인:**
- CONNECT는 성공했지만 SUBSCRIBE 시 권한 체크 실패

**해결:**
- 채팅방 참여 상태 확인
- 백엔드 로그에서 `chatService.isRoomPaticipant` 결과 확인

