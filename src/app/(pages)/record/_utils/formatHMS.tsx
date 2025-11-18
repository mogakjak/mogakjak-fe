export function formatHMS(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${pad2(h)}h ${pad2(m)}m`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
