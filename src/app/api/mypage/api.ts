import type {
  ProfileUpdate,
  CharacterUpdate,
  CharacterGuideItem,
  CharacterBasket,
  Profile,
} from "../../_types/mypage";

const MYPAGE_BASE = "/api/mypage";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${MYPAGE_BASE}${endpoint}`, {
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
      }
    } catch {
      // 응답 본문 파싱 실패 시 기본 메시지 사용 (에러 로그 제거)
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

export const patchProfile = (payload: ProfileUpdate) =>
  request<void>("/profile", { method: "PATCH", body: JSON.stringify(payload) });

export const patchCharacter = (payload: CharacterUpdate) =>
  request<void>("/character", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getCharactersGuide = () =>
  request<CharacterGuideItem[]>("/characters/guide", { method: "GET" });

export const getCharacterBasket = () =>
  request<CharacterBasket>("/character-basket", { method: "GET" });

export const getProfile = () => request<Profile>("/profile", { method: "GET" });
