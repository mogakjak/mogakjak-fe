# 집중 체크 알림 디버깅 가이드

## 브라우저 콘솔에서 확인할 로그

### 1. 웹소켓 연결 확인
다음 로그가 보여야 합니다:
```
[WebSocket] Connected globally
[WebSocket] [1/1] Subscribing to: /topic/group/{groupId}/notification
[WebSocket] ✓ Successfully subscribed to /topic/group/{groupId}/notification
```

### 2. 알림 수신 확인
알림이 오면 다음 로그가 보입니다:
```
[WebSocket] Received message for group {groupId}: {"groupId":"...","message":"...","groupName":"..."}
[WebSocket] Calling handleNotification for group {groupId}
[NotificationProvider] handleNotification called: {groupId: "...", message: "...", groupName: "..."}
```

### 3. 브라우저 알림 권한 확인
```
[NotificationProvider] Permission status: granted (또는 default/denied)
```

## 알림이 오지 않는 경우 확인 사항

### 백엔드 조건 확인
1. **그룹에 입장했는지**: 그룹 상세 페이지에 접속했는지 확인
2. **개인 타이머 활성화**: `isActive = true` 상태인지 확인
3. **그룹 알림 설정**: 
   - `isNotificationAgreed = true` (알림 허용)
   - `notificationCycle` 설정 확인 (예: 10분)
4. **알림 주기**: 마지막 알림 시간(`lastNotificationSentAt`) + `notificationCycle` 시간이 지났는지

### 프론트엔드 확인
1. **웹소켓 연결 상태**: 콘솔에 "Connected globally" 로그 확인
2. **그룹 구독 상태**: "Successfully subscribed" 로그 확인
3. **브라우저 알림 권한**: 브라우저 설정에서 알림 권한 확인
4. **그룹 ID 확인**: 구독한 그룹 ID와 알림이 오는 그룹 ID가 일치하는지

## 테스트 방법

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 위의 로그 확인
3. Network 탭에서 WebSocket 연결 확인
4. Application 탭 > Notifications에서 알림 권한 확인

