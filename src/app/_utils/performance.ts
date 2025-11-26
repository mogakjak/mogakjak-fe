"use client";

/**
 * LCP(Largest Contentful Paint) 이후에 실행할 콜백을 등록합니다.
 * LCP가 이미 발생한 경우 즉시 실행합니다.
 */
export function afterLCP(callback: () => void): () => void {
  if (typeof window === "undefined") {
    // SSR 환경에서는 즉시 실행
    callback();
    return () => {};
  }

  // PerformanceObserver가 지원되지 않는 경우 window load 이후 실행
  if (typeof window !== "undefined" && !("PerformanceObserver" in window)) {
    if (document.readyState === "complete") {
      callback();
      return () => {};
    }
    const win = window as Window;
    win.addEventListener("load", callback, { once: true });
    return () => {
      win.removeEventListener("load", callback);
    };
  }

  let cancelled = false;
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as
        | PerformanceEntry
        | undefined;

      if (lastEntry) {
        observer.disconnect();
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!cancelled) {
          callback();
        }
      }
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });

    // 최대 3초 후에는 강제로 실행 (LCP가 너무 늦게 발생하는 경우 대비)
    timeoutId = setTimeout(() => {
      observer.disconnect();
      if (!cancelled) {
        callback();
      }
    }, 3000);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  } catch {
    // PerformanceObserver 실패 시 window load 이후 실행
    if (typeof window === "undefined") {
      callback();
      return () => {};
    }
    if (document.readyState === "complete") {
      callback();
      return () => {};
    }
    const win = window as Window;
    win.addEventListener("load", callback, { once: true });
    return () => {
      win.removeEventListener("load", callback);
    };
  }
}

/**
 * 초기 렌더링이 완료된 후 실행할 콜백을 등록합니다.
 * DOMContentLoaded 이후 또는 일정 시간 후 실행합니다.
 */
export function afterInitialRender(callback: () => void): () => void {
  if (typeof window === "undefined") {
    callback();
    return () => {};
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return () => {
      document.removeEventListener("DOMContentLoaded", callback);
    };
  }

  // 이미 로드된 경우 즉시 실행
  callback();
  return () => {};
}
