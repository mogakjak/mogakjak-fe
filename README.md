# 모여서 각자 작업하는 시간 , 모각작🍅

> 🔗 Link : [https://mogakjak-fe.vercel.app](https://mogakjak-fe.vercel.app/)

![모각작 장표](https://github.com/user-attachments/assets/34debf9e-ca5e-40c8-91d4-be1807d009ee)


> **팀명**
>
> ### 🤿 몰딥브 (More Deep Dive)
>
> 몰입에 **Deep Dive** 하겠다는 포부와,  
> 휴양지 **Maldives**처럼 편안하고 즐거운 몰입 환경을 만들겠다는  
> **중의적 의미를 담은 팀명입니다.**



<br>

# 🔖 서비스 개요

###  👤 유저 리서치
![모각작 장표](https://github.com/user-attachments/assets/fbbe6732-514f-48ae-960e-21d5ab1a3e37)

#### 기존의 서비스들에 유저들은 압박이 필요한 몰입에 부담을 느끼고 있었습니다

### 🐥 PainPoint
![모각작 장표_1](https://github.com/user-attachments/assets/b9ca55b2-c3f6-43fd-865a-23dce83400b8)

#### 강제적인 경쟁이 아닌 자율성 속의 연대를 원합니다


<br>

# 💻 서비스 주요 기능
- **그룹 실시간 상태 공유**  
  멤버들의 집중/휴식 상태 표시, ‘콕 찌르기’ 알림 제공

- **몰입 지원 기능**  
  공개 설정, 그룹 타이머, 목표 달성률, 캐릭터 성장 시스템

- **웹 최적화 기능**  
  PIP 모드, 그룹 알림, 주·월 집중 리포트 시각화

![모각작 장표_2](https://github.com/user-attachments/assets/ef21d7eb-e428-45a1-a9cd-ac7d1b8940fe)

<br>
<br>

# 💼 API 명세서
[![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D?logo=swagger&logoColor=white)](https://mogakjak.site/swagger-ui/index.html#/)

<br>
<br>

# 🗂️ ERD
  <img width="1844" height="1041" alt="image" src="https://github.com/user-attachments/assets/eb9e2918-27b4-488c-a05a-b8df07a8395d" />

<br>
<br>

# 🏗️ 시스템 아키텍처
<img width="7900" height="4840" alt="image" src="https://github.com/user-attachments/assets/67f727ff-8dee-4c98-8ab0-d6136b0e7b8b" />

<br>
<br>

# 🛠️ 개발 환경 및 사용 기술 스택

### **프론트엔드**

- **Next.js + TypeScript**  
  실시간 기능이 많은 프로젝트 특성상 안정성과 유지보수성을 강화하기 위해 선택했습니다.  
  타입 안정성과 SSR 기반 구조를 통해 예측 가능한 코드를 유지합니다.

- **TailwindCSS**  
  집중 타이머처럼 즉각적인 UI 반응이 필요한 화면을 빠르고 효율적으로 구현하기 위해 사용했습니다.

- **TanStack Query**  
  실시간 WebSocket 데이터 외의 서버 상태를 안정적으로 캐싱·동기화하기 위한 선택입니다.


<br>

# 🤖 프론트엔드 CI/CD 

- **CI 자동화**: PR 생성 시 Lint·빌드·테스트를 자동 실행하고, 오류 발생 시 merge 차단하여 코드 품질 유지  
- **CD 자동화**: GitHub Actions로 `develop → preview`, `main → production` 자동 배포  
- **무중단 배포**: Vercel CLI 기반 `build → deploy` 자동화로 안정적인 릴리즈 보장

<br>

# 🐛 프론트엔드 트러블슈팅

### 1. 메타태그가 SNS에 표시되지 않음
- **원인**: 인증 API 사용 → 메타태그가 `<body>`로 삽입됨  
- **해결**: 비인증 전용 API로 분리하여 `generateMetadata()`에서 SSR 처리

### 2. WebSocket 등 브라우저 전용 코드로 SSR 충돌
- **해결**: `dynamic(..., { ssr: false })`로 서버 렌더링 제외

### 3. 새로고침 시 상대경로 fetch 오류
- **해결**: `useSuspenseQuery` → `useQuery`로 교체, 스켈레톤 UI 추가

### 4. 타이머 실행 중 페이지 이탈 시 세션이 계속 남는 문제
- **해결**: `popstate`로 이동 차단 + 409 발생 시 기존 세션 자동 종료

### 5. PIP 모드에서 타이머 표시 불가
- **해결**: Document Picture-in-Picture API 적용 + 브라우저 지원 체크

<br>

# 🚀 성능 최적화 

- **Kakao SDK 분리 로딩**으로 불필요한 스크립트 제거  
- **JS/CSS 빌드 최적화**(gzip/minify, alias 충돌 해결)  
- **스켈레톤 UI + 이미지 사이즈 지정**으로 레이아웃 시프트 감소  
- **LCP 이미지 priority/high 적용**으로 첫 화면 속도 개선  
- **WebSocket 지연 연결**로 초기 네트워크 부담 감소  
- **클라이언트 전용 코드 분리**로 초기 JS 번들 축소  

👉 **Speed Index 2.5s → 0.9s**, CLS·LCP 모두 개선
