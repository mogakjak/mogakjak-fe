import type {
  ProfileUpdate,
  CharacterUpdate,
  CharacterGuideItem,
  CharacterBasket,
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
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.message || err?.error || msg;
    } catch (e) {
      console.warn("Error body JSON parse failed", e);
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
