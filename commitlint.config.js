module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 수정
        "style", // 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
        "refactor", // 코드 리팩토링
        "perf", // 성능 개선
        "test", // 테스트 추가, 테스트 리팩토링
        "build", // 빌드 시스템 또는 외부 종속성에 영향을 주는 변경사항
        "ci", // CI 설정 파일 및 스크립트 변경
        "chore", // 기타 변경사항
        "revert", // 이전 커밋 되돌리기
      ],
    ],
    "type-case": [2, "always", "lowerCase"],
    "type-empty": [2, "never"],
    "subject-case": [2, "always", "lowerCase"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
  },
};
