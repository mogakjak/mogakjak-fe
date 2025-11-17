export type RangeType = "TODAY" | "WEEK" | "MONTH" | "ALL";

export const TabType = (tab: string): RangeType => {
  switch (tab) {
    case "오늘":
      return "TODAY";
    case "이번 주":
      return "WEEK";
    case "이번 달":
      return "MONTH";
    case "전체":
      return "ALL";
    default:
      return "TODAY";
  }
};
