const AUTH_BASE = "/api/auth";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${AUTH_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.error || message;
    } catch {}
    throw new Error(message);
  }

  const json = (await res.json().catch(() => undefined)) as
    | { statusCode?: number; message?: string; data?: unknown }
    | undefined;

  if (json && typeof json.statusCode === "number") {
    const code = json.statusCode;
    const isSuccess = code === 0 || (code >= 200 && code < 300);
    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }
    return json?.data as T;
  }

  return json as T;
}

/**
 * 서버에서 인증 토큰을 가져옵니다.
 * httpOnly 쿠키는 JavaScript로 읽을 수 없으므로 API 라우트를 통해 가져옵니다.
 * 프록시를 통해 호출하여 다른 API와 일관성을 유지합니다.
 */
export async function getTokenFromServer(): Promise<string | null> {
  try {
    const data = await request<{ token: string | null }>("/token", {
      method: "GET",
      credentials: "include", // 쿠키 포함
    });
    return data?.token || null;
  } catch (error) {
    console.error("[WebSocket] 토큰 가져오기 실패:", error);
    return null;
  }
}

