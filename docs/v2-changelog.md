# 모각작 FE 2.0 변경 사항

정책 시트 2.00 / 2.10 기준으로 프론트엔드에서 반영한 내용을 정리합니다.  
기준일: 2026-03-13

관련 정책: 그룹방 · 공식 라운지 · 그룹 타이머 제거 · 캐릭터 성장  
참고 Swagger: [https://lets.mogakjak.site/swagger-ui/index.html](https://lets.mogakjak.site/swagger-ui/index.html)

---

## 1. 한눈에 보기


| 영역        | 정책 ID                       | 요약                                             | FE 상태                  |
| --------- | --------------------------- | ---------------------------------------------- | ---------------------- |
| 멤버카드 시간   | MC06, SD04                  | 세션 경과 → 작업별 누적 몰입 시간                           | 완료                     |
| 그룹 타이머 제거 | GT01~GT08, GX01, GS02, CH01 | `group_focus_session` UI·API·모달 제거, 개인 타이머만 유지 | 완료                     |
| 오늘의 한마디   | SH01, LN07                  | 그룹 타이머 자리를 랜덤 Quote로 대체                        | 완료                     |
| 그룹 목표 제거  | GM04, GM07, GR02            | 목표·달성률 UI/API 제거                               | 완료                     |
| 그룹방 현황    | LN07, GP01, GH02, GS01      | `{세션 참여}/{메이트}` 분수 표기                          | 완료                     |
| 온보딩 mock  | OB01                        | `groupGoal` 더미 제거                              | 완료                     |
| 집중체크 주기   | GM02, LN08                  | 방장 1시간 단위 설정 유지                                | 완료(기존 유지)              |
| 집중체크 수신   | GM03, LN09                  | 세션 입장 + 유저별 opt-in                             | FE 완료 / 수신 fan-out은 BE |
| 모각작 몰입 시간 | RP05, RP19                  | 리포트 카드 표기 유지                                   | FE 완료 / 집계는 BE         |
| 캐릭터 성장    | CR01, CR02                  | 출석 일수 + 집중 시간 AND 조건, 12단계 표                   | FE 완료 / 에셋·최종 네이밍은 디자인 |


추가로 같은 작업 흐름에서 맞춘 **Swagger/운영 정책 갭**(검증·초대·강퇴 등)은 [부록](#부록-swagger운영-갭-보정) 참고.

---



## 2. 그룹방 / 공식 라운지 상단 구성



### Before

상단 3칸이 대략 다음 구성이었습니다.

1. 그룹 공통 타이머
2. 그룹 목표 · 달성률
3. 집중 체크 알림



### After (2.0)

라운지와 그룹방 상단을 같은 패턴으로 맞췄습니다.

1. **오늘의 한마디** — `GET /api/quotes/random`
2. **현황** — `{현재 세션 참여 인원}/{메이트(또는 정원)}`
3. **집중 체크 알림** — 기존 그룹 정책 유지 + 개인 opt-in



### 주요 파일

- `src/app/(pages)/group/_components/groupPage.tsx`
- `src/app/(pages)/group/_components/sidebar/groupQuote.tsx`
- `src/app/(pages)/group/_components/sidebar/groupPresence.tsx`
- `src/app/(pages)/group/_components/sidebar/groupNoti.tsx`
- `src/app/(pages)/lounge/_components/loungePage.tsx`
- `src/app/_components/home/previewMain.tsx` (홈 사이드바 한마디)
- `src/app/api/quotes/*`, `src/app/_hooks/quotes/useRandomQuote.ts`



### 현황 표시 규칙 (GP01)

- **분자**: 세션 참여 기준 (`participationStatus !== NOT_PARTICIPATING`)
- **분모**: 그룹은 `totalMemberCount`(없으면 members 길이), 라운지는 `maxMemberCount`(없으면 members 길이)
- 타이머 실행 여부와 무관하게 **세션 입장** 기준으로 센다

---



## 3. 그룹 타이머 제거 (GT*)



### 정책 의도

공통 그룹 타이머(`group_focus_session`) UX를 단순화하고, **개인 타이머(TM01~02)만** 유지합니다.

### FE에서 한 일

- 그룹방 상단/숨김 `GroupTimer` 마운트 제거
- 나가기 시 `finishGroupTimer` 호출 제거 → 개인 타이머만 강제 종료
- `groupRoomPage`의 그룹 타이머 WS FINISH 구독 제거
- 관련 UI/훅 삭제
  - `groupTimer.tsx`
  - `useGroupTimer`, `useStart/Pause/Resume/FinishGroupTimer`
  - `useBlockGroupTimerNavigation`
- FE API 래퍼 제거: `start/resume/pause/finishGroupTimer`
- `alertModal`의 `groupTimerLimit` 타입/카피 제거
- 방장 승계 모달 문구에서 “목표 수정” 표현 제거



### 유지하는 것

- 개인 타이머 UI·제어 (`TimerComponent`, `TimerModal` 등)

---



## 4. 그룹 목표 · 달성률 제거 (GM04 등)



### 정책 의도

공통 타이머와 함께 `accumulated` / goal 달성률 의존을 없앱니다.

### FE에서 한 일

- `GroupGoal` 카드 · `GoalModal` 삭제
- `putGroupGoal` / `useUpdateGroupGoal` 삭제
- `GroupDetail.groupGoal`, `progressRate`를 optional(deprecated)로 완화
- 온보딩 mock에서 `groupGoal` 제거 (OB01)



### 참고

백엔드 `/api/groups/{groupId}/goals` 엔드포인트가 Swagger에 남아 있을 수 있으나, FE는 더 이상 호출하지 않습니다.

---



## 5. 멤버카드 시간 표시 (MC06, SD04)



### Before

세션 경과 시간(`personalTimerSeconds`) 성격의 값이 노출될 수 있었음.

### After

**작업별 누적 몰입 시간** `todo.actualTimeInSeconds`를 우선 표시합니다.  
내 카드는 `useSelectedTodoActualSeconds`로 선택 작업 누적을 실시간 반영합니다.

### 주요 파일

- `groupPage.tsx` / `loungePage.tsx` → `GroupFriendField`의 `activeTime`
- `useSelectedTodoActualSeconds`

---



## 6. 집중 체크 알림 (GM02, GM03 / LN08, LN09)



### 유지 (GM02 / LN08)

- 방장이 알림 주기(1시간 단위, UI상 “매 시 정각” 등)를 설정
- `groupNoti` + `notiModal` + `notificationCycle`



### 변경 (GM03 / LN09)

- 수신 조건: **세션 입장** + **유저별 on/off opt-in**
- 그룹: `myFocusCheckEnabled` (`GET/PUT .../notifications/me`)
- 라운지: `myFocusCheckEnabled` + lounge focus-check API
- 훅: `useToggleNotification` → `useGetMyGroupFocusCheck` / `useUpdateMyGroupFocusCheck`

> 실제 푸시/알림 fan-out은 백엔드 `FocusNotificationService` 책임입니다. FE는 설정 UI·상태만 담당합니다.

---



## 7. 캐릭터 성장 (CR01, CR02)



### 정책 변경 요지

- 기존: 누적 집중 **시간만**으로 캐릭터 획득
- 2.0: 누적 **출석 일수** + 누적 **집중 시간**을 **모두** 충족해야 다음 레벨
- 출석은 연속일 필요 없음. 단 모각작에서 하루 최소 30분 이상 타이머 이용 시 당일 출석 인정 (집계는 BE)
- 성장 UI는 토마토 단일 12단계 방향으로 단순화 (에셋/네이밍은 디자인 확정 가능)



### FE 레벨표 (폴백 상수)


| Lv  | 출석 일수 | 집중 시간  |
| --- | ----- | ------ |
| 1   | 가입    | 가입     |
| 2   | 15일   | 20시간   |
| 3   | 30일   | 50시간   |
| 4   | 50일   | 90시간   |
| 5   | 75일   | 140시간  |
| 6   | 105일  | 200시간  |
| 7   | 140일  | 280시간  |
| 8   | 180일  | 380시간  |
| 9   | 225일  | 500시간  |
| 10  | 275일  | 650시간  |
| 11  | 330일  | 850시간  |
| 12  | 400일  | 1100시간 |




### FE에서 한 일

- `CHARACTER_LEVELS` / `CharacterLevelInfo`에 `attendanceDays` 추가
- `getCharacterByProgress(hours, attendanceDays)` 추가
- 과일 도감 모달: `GET /api/mypage/characters/guide` 우선, 없으면 상수 폴백
- 잠금 카드 / 획득 모달 카피에 `N일 · N시간` 표기



### 주요 파일

- `src/app/_constants/character.ts`
- `src/app/_utils/getCharacterByHours.ts`
- `src/app/(pages)/mypage/_components/board/basket/characterModal.tsx`
- `src/app/(pages)/mypage/_components/board/basket/character.tsx`
- `src/app/_components/common/gainCharacterModal.tsx`
- `src/app/_types/mypage.ts` (`CharacterGuideItem` 확장)

---



## 8. 집중 리포트 (RP05, RP19)

- 대시보드 카드 **「모각작 몰입 시간」** ← `summary.groupSeconds`
- FE 표기/매핑은 유지
- “그룹 참여 세션 시간 합” 집계 정의는 백엔드 `RecordDashboardService`와 맞춰야 함

파일: `src/app/(pages)/record/_components/dashboard/data/cards.tsx`

---



## 9. 삭제 · 추가된 파일 (FE)



### 삭제

- `sidebar/groupTimer.tsx`
- `sidebar/groupGoal.tsx`
- `_components/group/modal/goalModal.tsx`
- `useGroupTimer.ts`, `useBlockGroupTimerNavigation.ts`
- `useStart/Pause/Resume/FinishGroupTimer.ts`
- `useUpdateGroupGoal.ts`



### 추가

- `src/app/api/quotes/api.ts`, `keys.ts`
- `src/app/_hooks/quotes/useRandomQuote.ts`

---



## 10. 아직 / 후속

토마토로만 12단계 변경되는 부분은 디자인 전달되는대로 적용시킬 예정 
---



## 부록. Swagger/운영 갭 보정

2.0 UI 개편과 별도로, 같은 작업에서 FE를 Swagger·운영 정책에 맞춘 항목입니다.


| 항목        | 내용                                          |
| --------- | ------------------------------------------- |
| 입력 검증     | 닉네임 20 / 카테고리 20 / 할일 35 / 목표 시·분 범위        |
| 초대 상태     | `ALREADY_IN_OFFICIAL_LOUNGE` → “라운지 중”      |
| 방장 나가기    | 멤버 있을 때 나가기 차단 UX + 400 처리                  |
| 멤버 강퇴     | `DELETE /groups/{id}/members/{userId}` + 모달 |
| 개인 타이머 상한 | 최대 24시간                                     |
| 라운지 가득 참  | “최대 20명” 카피                                 |


---



## 스크럼용 한 줄 요약

- 그룹 공통 타이머·목표 제거 → 오늘의 한마디 + 세션/메이트 현황으로 교체
- 멤버카드는 작업 누적 몰입 시간 우선
- 집중체크는 방장 주기 + 개인 opt-in
- 캐릭터는 출석일·집중시간 AND 12단계 표로 갱신
- Quote는 `/api/quotes/random`으로 홈·그룹·라운지 통일

