import type {
  ProfileUpdate,
  CharacterUpdate,
  CharacterGuideItem,
  CharacterBasket,
  Profile,
  TotalStudyTimeResponse,
} from "../../_types/mypage";
import { request } from "../request";

const MYPAGE_BASE = "/api/mypage";

export const patchProfile = (payload: ProfileUpdate) =>
  request<void>(MYPAGE_BASE, "/profile", { method: "PATCH", body: JSON.stringify(payload) });

export const patchCharacter = (payload: CharacterUpdate) =>
  request<void>(MYPAGE_BASE, "/character", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getCharactersGuide = () =>
  request<CharacterGuideItem[]>(MYPAGE_BASE, "/characters/guide", { method: "GET" });

export const getCharacterBasket = () =>
  request<CharacterBasket>(MYPAGE_BASE, "/character-basket", { method: "GET" });

export const getProfile = () => request<Profile>(MYPAGE_BASE, "/profile", { method: "GET" });


export const getTotalStudyTime = () =>
  request<TotalStudyTimeResponse>(MYPAGE_BASE, "/total-study-time", {
    method: "GET",
  });