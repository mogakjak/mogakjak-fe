export function formatHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}h ${pad2(m)}m`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
