import type { Todo } from "@/app/_types/todo";

/** 할일에 설정한 목표 시간(초) — 타이머 자동 설정용 */
export function getDefaultTimerSecondsFromTodo(
  todo: Todo | null | undefined
): number | undefined {
  if (!todo?.targetTimeInSeconds || todo.targetTimeInSeconds <= 0) {
    return undefined;
  }

  return todo.targetTimeInSeconds;
}

export function secondsToHms(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return {
    hours: Math.floor(safe / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
}
