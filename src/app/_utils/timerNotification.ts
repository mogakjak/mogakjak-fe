import type { TimerCompletionNotification } from "@/app/_hooks/_websocket/notifications/useTimerCompletionNotification";

const POMODORO_BREAK_START_MESSAGE = "이제 휴식시간입니다!";
const POMODORO_FOCUS_START_MESSAGE = "휴식이 끝났어요. 다시 집중할 시간입니다!";
const POMODORO_COMPLETION_MESSAGE = "뽀모도로가 완료되었습니다!";

const POMODORO_BROWSER_BODY = {
  focusEnd:
    "대단해요! 한 세트를 끝내셨네요! 집중한 나를 위해 잠시 숨을 골라보세요.",
  breakEnd:
    "휴식 끝! 다시 몰입해볼까요? 몸과 마음이 가벼워졌다면, 다시 집중해봐요!",
  complete:
    "타이머가 끝났습니다! 목표를 달성하셨나요? 다 마쳤다면 종료 버튼을, 시간이 더 필요하다면 타이머를 다시 시작해 보세요.",
} as const;

export function getTimerNotificationTitle(
  notification: TimerCompletionNotification
) {
  if (notification.mode === "POMODORO") {
    if (notification.message === POMODORO_BREAK_START_MESSAGE) {
      return "집중 시간이 끝났어요";
    }

    if (notification.message === POMODORO_FOCUS_START_MESSAGE) {
      return "휴식 시간이 끝났어요";
    }

    if (notification.message === POMODORO_COMPLETION_MESSAGE) {
      return "뽀모도로 완료!";
    }

    return "뽀모도로 알림";
  }

  return notification.todoTitle
    ? `"${notification.todoTitle}" 타이머 완료!`
    : "타이머 완료!";
}

export function getTimerNotificationBody(
  notification: TimerCompletionNotification
) {
  return notification.message || "설정한 시간이 완료되었습니다.";
}

/** 크롬(브라우저) 알림용 본문. 뽀모도로 단계별 고정 문구, 그 외는 null(기본 본문 사용) */
export function getTimerBrowserNotificationBody(
  notification: TimerCompletionNotification
): string | null {
  if (notification.mode !== "POMODORO") {
    return null;
  }

  if (notification.message === POMODORO_BREAK_START_MESSAGE) {
    return POMODORO_BROWSER_BODY.focusEnd;
  }

  if (notification.message === POMODORO_FOCUS_START_MESSAGE) {
    return POMODORO_BROWSER_BODY.breakEnd;
  }

  if (notification.message === POMODORO_COMPLETION_MESSAGE) {
    return POMODORO_BROWSER_BODY.complete;
  }

  return null;
}

export function getTimerBrowserNotificationTag(
  notification: TimerCompletionNotification
) {
  const base = `timer-completion-${notification.sessionId}`;

  if (notification.mode === "POMODORO") {
    if (notification.message === POMODORO_BREAK_START_MESSAGE) {
      return `${base}-focus-end`;
    }
    if (notification.message === POMODORO_FOCUS_START_MESSAGE) {
      return `${base}-break-end`;
    }
    if (notification.message === POMODORO_COMPLETION_MESSAGE) {
      return `${base}-complete`;
    }
  }

  return base;
}
