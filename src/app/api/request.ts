/**
 * 공통 API 요청 함수
 * @param baseUrl API 기본 URL (예: "/api/feedback")
 * @param endpoint API 엔드포인트 (예: "/tags")
 * @param options fetch 옵션
 * @returns Promise<T>
 */
export async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const contentType = res.headers.get("content-type");
      const contentLength = res.headers.get("content-length");

      // 응답 본문이 있고 JSON 형식인 경우에만 파싱 시도
      if (contentType?.includes("application/json") && contentLength !== "0") {
        const text = await res.clone().text();
        if (text && text.trim().length > 0) {
          const err = JSON.parse(text);
          msg = err?.message || err?.error || msg;
        }
      } else {
        // JSON이 아닌 경우에도 시도
        const err = await res.json();
        msg = err?.message || err?.error || msg;
      }
    } catch {
      // 응답 본문 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(msg);
  }

  const json = await res.json().catch(() => undefined);

  if (json && typeof json === "object" && typeof json.statusCode === "number") {
    const code = json.statusCode as number;
    const isSuccess = code === 0 || (code >= 200 && code < 300);
    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }
    return json?.data as T;
  }

  return json as T;
}
