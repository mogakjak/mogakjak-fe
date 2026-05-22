import type { TimerTabType } from "@/app/api/timerSettings/api";

export type TimerMode = "pomodoro" | "stopwatch" | "timer";

const ALL_MODES: TimerMode[] = ["pomodoro", "stopwatch", "timer"];

const MODE_TO_API: Record<TimerMode, TimerTabType> = {
  pomodoro: "POMODORO",
  stopwatch: "STOPWATCH",
  timer: "TIMER",
};

const API_TO_MODE: Record<TimerTabType, TimerMode> = {
  POMODORO: "pomodoro",
  STOPWATCH: "stopwatch",
  TIMER: "timer",
};

export const DEFAULT_TIMER_TAB_ORDER: TimerTabType[] = [
  "POMODORO",
  "STOPWATCH",
  "TIMER",
];

export function timerModeToApi(mode: TimerMode): TimerTabType {
  return MODE_TO_API[mode];
}

export function apiTabTypeToMode(tab: TimerTabType): TimerMode {
  return API_TO_MODE[tab];
}

/** API tabOrder → UI 모드 배열 (누락된 탭은 기본 순서로 보완) */
export function normalizeTabOrderToModes(
  tabOrder?: TimerTabType[] | null,
): TimerMode[] {
  if (!tabOrder?.length) {
    return DEFAULT_TIMER_TAB_ORDER.map(apiTabTypeToMode);
  }

  const modes: TimerMode[] = [];
  for (const tab of tabOrder) {
    if (tab in API_TO_MODE && !modes.includes(API_TO_MODE[tab])) {
      modes.push(API_TO_MODE[tab]);
    }
  }
  for (const mode of ALL_MODES) {
    if (!modes.includes(mode)) modes.push(mode);
  }
  return modes;
}

export function modesToApiTabOrder(modes: TimerMode[]): TimerTabType[] {
  return modes.map(timerModeToApi);
}

/** 선택한 모드를 맨 앞에 둔 전체 탭 순서 (PATCH 요청용) */
export function buildTabOrderWithFirst(firstMode: TimerMode): TimerTabType[] {
  return modesToApiTabOrder([
    firstMode,
    ...ALL_MODES.filter((m) => m !== firstMode),
  ]);
}

export const TIMER_MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: "뽀모도로",
  stopwatch: "스톱워치",
  timer: "타이머",
};
