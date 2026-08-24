import { request } from "../request";
import type { CheckAwardRes } from "../../_types/characters";

const CHARACTERS_BASE = "/api/characters";

export const postCheckAward = () =>
  request<CheckAwardRes>(CHARACTERS_BASE, "/check-award", {
    method: "POST",
  });
