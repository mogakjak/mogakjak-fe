# Gemini Code Assist repository-level configuration

# Docs: https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github

have_fun: false

code_review:

# 전체 PR 리뷰 기능 켜기/끄기

disable: false

# 코멘트 최소 심각도: LOW | MEDIUM | HIGH | CRITICAL

# 팀 노이즈를 줄이기 위해 MEDIUM 이상만 남깁니다.

comment_severity_threshold: MEDIUM

# 한 PR에 남길 최대 코멘트 수 (-1 이면 무제한)

max_review_comments: 50

pull_request_opened: # 첫 코멘트에 도움말 메시지 표시 여부
help: false # PR 요약 코멘트 생성 여부(변경 요약/영향 범위)
summary: true # PR 오픈 시 자동 코드 리뷰 수행
code_review: true # Draft PR도 에이전트 기능 허용할지
include_drafts: false

# 리뷰에서 완전히 제외할 파일/디렉터리 (glob 패턴)

ignore_patterns:

# 빌드/출력물

- "dist/\*\*"
- ".next/\*\*"
- "out/\*\*"
- "coverage/\*\*"
- "storybook-static/\*\*"

# 종속성/락파일은 요약만 하고 상세 리뷰 제외

- "node_modules/\*\*"
- "pnpm-lock.yaml"
- "package-lock.json"
- "yarn.lock"

# 생성/스냅샷

- "\*_/_.snap"
- "\*_/_.map"
- "public/\*_/_.svg"
- "public/\*_/_.png"
- "public/\*_/_.jpg"
- "public/\*_/_.webp"

# 환경/비밀(안전상 코멘트 금지)

- ".env\*"

# 문서류는 스타일가이드 위반만 지적

- "\*_/_.md"
- "docs/\*\*"
