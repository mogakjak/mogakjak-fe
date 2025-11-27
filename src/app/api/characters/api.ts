import { request } from "../request";
import type { CheckAwardReq, CheckAwardRes } from "../../_types/characters";

const CHARACTERS_BASE = "/api/characters";

export const postCheckAward = (payload: CheckAwardReq) =>
  request<CheckAwardRes>(CHARACTERS_BASE, "/check-award", {
    method: "POST",
    body: JSON.stringify(payload),
  });
