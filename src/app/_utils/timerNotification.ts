import type { TimerCompletionNotification } from "@/app/_hooks/_websocket/notifications/useTimerCompletionNotification";

const POMODORO_BREAK_START_MESSAGE = "이제 휴식시간입니다!";
const POMODORO_FOCUS_START_MESSAGE = "휴식이 끝났어요. 다시 집중할 시간입니다!";
const POMODORO_COMPLETION_MESSAGE = "뽀모도로가 완료되었습니다!";

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
