import { request } from "../request";
import type { Quote } from "@/app/_types/mypage";

const QUOTES_BASE = "/api/quotes";

export const getRandomQuote = () =>
  request<Quote>(QUOTES_BASE, "/random", { method: "GET" });
