import type {
  ApiResponse,
  ProfileUpdate,
  CharacterUpdate,
  CharacterGuideItem,
  CharacterBasket,
} from "./types";

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
      const err = await res.json();
      msg = err?.message || err?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const json: ApiResponse<T> = await res.json();
  if (json.statusCode !== 0) throw new Error(json.message);
  return json.data;
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
