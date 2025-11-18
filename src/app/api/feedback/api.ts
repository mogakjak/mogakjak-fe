import type { FeedbackTag, FeedbackTagType } from "../../_types/feedback";

const FEEDBACK_BASE = "/api/feedback";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${FEEDBACK_BASE}${endpoint}`, {
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
      const err = await res.json();
      msg = err?.message || err?.error || msg;
    } catch {
      console.error("Failed to parse error response body");
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

export const getFeedbackTags = (type?: FeedbackTagType) => {
  const query = type ? `?type=${type}` : "";
  return request<FeedbackTag[]>(`/tags${query}`, { method: "GET" });
};
