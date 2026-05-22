import { request } from "../request";

const TIMER_SETTINGS_BASE = "/api/timer-settings";

export type TimerTabType = "POMODORO" | "STOPWATCH" | "TIMER";

export type TimerTabOrderData = {
  tabOrder: TimerTabType[];
};

export type UpdateTimerTabOrderPayload = {
  tabOrder: TimerTabType[];
};

export const getTimerTabOrder = () =>
  request<TimerTabOrderData>(TIMER_SETTINGS_BASE, "/tab-order", {
    method: "GET",
  });

export const updateTimerTabOrder = (payload: UpdateTimerTabOrderPayload) =>
  request<Record<string, never>>(TIMER_SETTINGS_BASE, "/tab-order", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
