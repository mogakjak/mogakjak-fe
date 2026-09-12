# 트러블슈팅 정리

모각작 프론트에서 실제로 발생했던 이슈와, 코드 기준으로 **어떻게 막았는지**를 정리한 문서입니다.

---

## 1. 메타태그가 SNS에 표시되지 않음

### 증상

카카오톡·페이스북 등에 초대 링크를 공유해도 OG 이미지·제목이 미리보기에 나오지 않았습니다.

### 원인

SNS 크롤러는 로그인 쿠키가 없고, 초기 HTML의 `<head>`만 읽습니다.

기존에는 **인증이 필요한 그룹 상세 API**로 메타 정보를 가져왔습니다. 크롤러 요청은 인증에 실패하고, 메타 태그가 서버 HTML `<head>`에 심기지 않거나 클라이언트 렌더 이후 `<body>` 쪽에만 남는 형태가 되었습니다. 그 결과 크롤러가 OG 태그를 읽지 못했습니다.

추가로 미들웨어가 비로그인 초대 접근을 `/login`으로 보내면서, 카카오 스크래퍼까지 로그인 페이지로 튕기는 문제가 있었습니다.

### 해결

**비인증 전용 API를 분리**하고, 서버 컴포넌트의 `generateMetadata()`에서 절대 URL로 호출해 OG 태그를 SSR `<head>`에 넣습니다.

- 엔드포인트: `GET {NEXT_PUBLIC_API_PROXY}/api/groups/meta/{groupId}`
- 인증 헤더·쿠키 없이 `groupId`, `groupName`만 조회
- 서버 `fetch`는 상대경로(`/api/...`)를 쓰지 않음 → Node 환경에서 origin이 없어 실패하지 않도록 절대 URL 사용

핵심 흐름 (`src/app/(pages)/invite/[groupid]/page.tsx`):

1. `fetchGroupMeta(groupId)`가 비인증 메타 API를 호출
2. `generateMetadata()`가 그룹명으로 `title` / `openGraph` 를 구성
3. 실패 시 기본 초대 썸네일·문구로 폴백
4. 페이지 본문은 같은 메타로 `InvitePageClient`에 `groupName`을 넘겨 화면만 클라이언트에서 그림

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const meta = await fetchGroupMeta(groupid);
  // title, description, openGraph.images 를 서버에서 반환
}
```

크롤러가 HTML을 받을 수 있도록 미들웨어도 예외 처리합니다.

- `isBot(userAgent)`로 `kakaotalk-scrap`, `facebookexternalhit` 등을 판별
- 봇이면 `/invite`를 로그인으로 보내지 않고 그대로 통과 (`decideInviteAccess`)

관련 파일:

- `src/app/(pages)/invite/[groupid]/page.tsx`
- `src/app/_lib/invite/middlewareInviteLogic.ts`
- `src/app/_lib/userAgent.ts`
- `src/middleware.ts`

---

## 2. WebSocket 등 브라우저 전용 코드로 SSR 충돌

### 증상

서버 렌더 시 `window` / `document` / SockJS WebSocket 초기화가 돌면서 hydration mismatch 또는 서버 런타임 에러가 났습니다.

### 원인

알림·네비게이션 가드가 앱 루트에 붙어 있었습니다. 이 컴포넌트들은 STOMP/SockJS, `window.addEventListener`, 브라우저 Notification API를 사용합니다. Next.js가 서버에서 같은 트리를 그리면 브라우저 전용 코드가 실행됩니다.

### 해결

브라우저 전용 모듈은 `next/dynamic(..., { ssr: false })`로 **서버 렌더에서 제외**하고, hydration 이후에만 마운트합니다.

`src/app/_providers/providers.tsx`

```ts
const NavigationBlocker = dynamic(() => import("./navigationBlocker"), { ssr: false });
const NavigationModal = dynamic(() => import("./navigationModal"), { ssr: false });
const InviteRedirectHandler = dynamic(() => import("./inviteRedirectHandler"), { ssr: false });
```

알림(WebSocket 구독)은 한 단계 더 분리했습니다.

`src/app/_components/common/notificationRoot.tsx`

- `NotificationProvider`를 `dynamic(..., { ssr: false })`로 로드
- `mounted` 플래그로 클라이언트 마운트 전에는 `children`만 렌더
- 서버 HTML에는 알림/WS 코드가 포함되지 않음

WebSocket 훅 자체도 `"use client"`이며, `useEffect` 안에서만 `createWebSocketClient()`를 호출합니다. SockJS·토큰 조회는 브라우저에서만 실행됩니다.

관련 파일:

- `src/app/_providers/providers.tsx`
- `src/app/_components/common/notificationRoot.tsx`
- `src/app/_providers/navigationModal.tsx`
- `src/app/_hooks/_websocket/useWebSocket.ts`
- `src/app/layout.tsx`

---

## 3. 새로고침 시 상대경로 fetch 오류

### 증상

페이지를 새로고침하면 `fetch("/api/...")` 가 서버에서 실패하거나, `useSuspenseQuery`가 데이터를 기다리며 화면이 깨졌습니다.

### 원인

공통 `request()`는 상대경로를 씁니다.

```ts
fetch(`${baseUrl}${endpoint}`) // 예: "/api/mypage/profile"
```

브라우저에서는 origin이 붙지만, **SSR/Node `fetch`는 상대경로를 해석하지 못합니다.**

`useSuspenseQuery`는 데이터가 올 때까지 컴포넌트를 suspend합니다. 새로고침 시 서버에서 쿼리가 돌면 상대경로 fetch가 터지고, 클라이언트에서도 Suspense 경계 없이 에러가 올라갔습니다.

### 해결

데이터 훅을 **`useSuspenseQuery` → `useQuery`로 교체**하고, 로딩 중에는 스켈레톤을 그립니다.

- 쿼리는 클라이언트에서만 실행 (상대경로 fetch가 origin을 가짐)
- `isLoading` / `isPending`으로 빈 데이터를 건드리지 않음
- suspend가 없어 새로고침 시 서버가 쿼리를 강제 실행하지 않음

적용된 훅 예:

- `useProfile`, `useCharacterBasket`, `useCharactersGuide`
- `useMyGroups`, `useGroupDetail`
- `useTodayTodos`, `useMyTodos`, `useTodoCategories`

스켈레톤 UI:

| 화면 | 동작 |
| --- | --- |
| 홈 미리보기 (`previewMain`) | 프로필/명언 영역에 `animate-pulse` 플레이스홀더 |
| 그룹 목록 (`roomMain`) | 그룹 카드 스켈레톤 |
| 그룹방 (`groupRoomPage`, `groupPage`) | 제목·멤버 그리드 스켈레톤 |
| 마이페이지 | 프로필/보드 영역 스켈레톤 |
| 할 일 페이지 | 카테고리·할 일 로딩 합쳐 `isLoading` 처리 |

핵심 패턴:

```ts
const { data: profile, isLoading } = useProfile();
const isPending = isLoading || !profile;

return isPending ? <Skeleton /> : <PreviewCharacter ... />;
```

관련 파일:

- `src/app/api/request.ts`
- `src/app/_hooks/mypage/useProfile.ts`
- `src/app/_components/home/previewMain.tsx`
- `src/app/_components/home/roomMain.tsx`
- `src/app/(pages)/group/_components/groupRoomPage.tsx`
- `src/app/(pages)/mypage/page.tsx`

---

## 4. 타이머 실행 중 페이지 이탈 시 세션이 계속 남는 문제

### 증상

타이머가 돌아가는 상태에서 뒤로가기·새로고침·다른 페이지로 나가면, 서버의 활성 세션이 종료되지 않았습니다. 다음에 타이머를 시작하려 하면 충돌(기존 세션 존재)이 났습니다.

### 원인

세션은 서버 상태입니다. 클라이언트만 언마운트되면 `FINISH` API가 호출되지 않습니다. 이후 시작 API는 활성 세션이 있다는 **409 Conflict** 성격의 응답을 반환합니다.

### 해결

이탈을 막고, 그래도 세션이 남아 있으면 시작 시 기존 세션을 종료한 뒤 다시 시작합니다.

#### 4-1. `popstate`로 이동 차단

개인 타이머 (`useBlockPageNavigation`):

- 실행 중이면 `history.pushState`로 현재 URL을 스택에 쌓아 뒤로가기를 가로챔
- `popstate` 발생 시 다시 `pushState`로 복원하고 종료 확인 모달 표시
- 확인 시 `POST /api/timers/finish/active` 후 `history.back()`
- `beforeunload`(탭 닫기/새로고침)에는 `keepalive: true`로 같은 finish API를 보냄 (페이지가 닫혀도 요청이 유실되지 않도록)

그룹 타이머 (`useBlockGroupTimerNavigation`, `groupPage`):

- 동일한 `popstate` 패턴
- 실행/일시정지 중이면 `TimerEndModal`, 아니면 리뷰 팝업
- 확인 시 `finishGroupTimer(groupId, sessionId)` 호출

루트 `NavigationBlocker`는 `ssr: false`로 로드되어 서버에서 `window`에 접근하지 않습니다.

#### 4-2. 409(기존 세션) 발생 시 자동 종료 후 재시작

시작 API가 “이미 실행 중 / already / running” 메시지를 주면 기존 세션이 남아 있다고 판단합니다. (`request()`가 HTTP status를 에러에 붙이며, 백엔드는 이 경우를 409 Conflict로 내려줍니다.)

`useTimerControl`:

1. `handleStartError`가 중복 세션으로 분류 → `ActiveSessionModal` 오픈
2. 사용자가 “종료 및 시작”을 누르면 `retryStartSession()`
3. `POST /api/timers/finish/active`로 **기존 세션을 먼저 종료**
4. 보관한 `pendingSessionConfig`로 새 세션을 다시 시작

그룹방을 나갈 때도 활성 세션이 캐시에 있으면 `finishActiveTimer`를 한 번 더 호출합니다.

관련 파일:

- `src/app/_hooks/block/useBlockPageNavigation.ts`
- `src/app/_hooks/block/useBlockGroupTimerNavigation.ts`
- `src/app/_hooks/timers/useTimerControl.ts`
- `src/app/_hooks/timers/useFinishActiveTimer.ts`
- `src/app/api/timers/api.ts` (`finishActiveTimer`)
- `src/app/_components/common/timer/activeSessionModal.tsx`
- `src/app/(pages)/group/_components/groupPage.tsx`

---

## 5. PIP 모드에서 타이머 표시 불가

### 증상

브라우저 기본 `<video>` Picture-in-Picture는 타이머 DOM을 띄울 수 없어, 다른 탭/창을 보는 동안 타이머를 화면에 유지할 수 없었습니다.

### 해결

**Document Picture-in-Picture API**로 타이머 컨테이너를 별도 미니 윈도우로 옮깁니다.

`src/app/_hooks/timers/usePictureInPicture.ts`

1. **브라우저 지원 체크**  
   `"documentPictureInPicture" in window` 가 아니면 경고 후 `false` 반환 (미지원 브라우저는 그냥 본문 타이머만 사용)

2. 실행 중이 아니거나 이미 PIP이면 열지 않음

3. `documentPictureInPicture.requestWindow({ width, height })`로 창 생성  
   크기는 타이머 다이얼 `getBoundingClientRect()` 기준

4. 메인 문서의 `link[rel=stylesheet]`, `style`을 PIP 창 `head`에 복사해 스타일을 유지

5. 타이머 DOM(`containerRef`)을 PIP `body`로 **이동**(복제가 아님 → React 상태·초 단위 업데이트가 그대로 동작)

6. `pagehide`로 창이 닫히면 원래 부모 노드 위치에 DOM을 되돌리고 인라인 스타일 복구

`TimerComponent` 연동:

- 시작/재개 시 `openPipWindow()` 호출
- PIP 버튼으로 열기/닫기 토글
- PIP 중에는 모드 탭·버튼 등 메인 UI를 숨기고 다이얼만 창에 표시 (`!isInPip`)
- PIP가 열려 있으면 `beforeunload` 경고를 띄우지 않음 (창 이동과 이탈을 구분)

관련 파일:

- `src/app/_hooks/timers/usePictureInPicture.ts`
- `src/app/_components/common/timer/timerComponent.tsx`
- `src/app/_components/common/timer/timerButton.tsx`

---

## 한눈에 보기

| # | 문제 | 핵심 원인 | 실제 조치 |
| --- | --- | --- | --- |
| 1 | SNS에 OG 미표시 | 인증 API + 클라이언트 삽입, 크롤러가 로그인으로 리다이렉트 | 비인증 `/api/groups/meta` + `generateMetadata()` SSR, 봇 UA 통과 |
| 2 | SSR 시 WebSocket/`window` 충돌 | 루트에 브라우저 전용 코드가 포함됨 | `dynamic(..., { ssr: false })` + 마운트 후 로드 |
| 3 | 새로고침 fetch 실패 | `useSuspenseQuery`가 SSR에서 상대경로 `fetch` 실행 | `useQuery` + 스켈레톤 |
| 4 | 이탈 후 세션 잔존 | FINISH 없이 언마운트, 이후 409 | `popstate` 차단 + `finish/active` keepalive + 409 시 기존 세션 종료 후 재시작 |
| 5 | PIP에 타이머 불가 | 비디오 전용 PiP API | Document PiP + 지원 여부 체크 + DOM 이동 |
