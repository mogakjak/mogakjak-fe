export function isTodayDateString(dateStr: string): boolean {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return dateStr === `${yyyy}-${mm}-${dd}`;
}

export function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** 최근 작업 목록용 날짜 라벨: 오늘 / N일 전 / 한달 전 / M/D / YY/M/D */
export function formatRecentDateLabel(dateStr: string, now = new Date()): string {
  const date = parseLocalDateString(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);

  if (diffDays === 0) return "오늘";
  if (diffDays > 0 && diffDays < 30) return `${diffDays}일 전`;
  if (diffDays >= 30 && diffDays < 60) return "한달 전";
  if (date.getFullYear() === today.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${String(date.getFullYear()).slice(2)}/${date.getMonth() + 1}/${date.getDate()}`;
}
