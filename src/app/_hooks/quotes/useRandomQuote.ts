"use client";

import { useQuery } from "@tanstack/react-query";
import { getRandomQuote } from "../../api/quotes/api";
import { quoteKeys } from "../../api/quotes/keys";
import type { Quote } from "@/app/_types/mypage";

export const useRandomQuote = (enabled = true) =>
  useQuery<Quote>({
    queryKey: quoteKeys.random(),
    queryFn: getRandomQuote,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
