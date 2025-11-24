"use client";

import { useMutation } from "@tanstack/react-query";
import { sendPokeNotification } from "../../api/groups/api";
import type { PokeRequest } from "../../_types/groups";

export const usePoke = () => {
  return useMutation<unknown, unknown, PokeRequest>({
    mutationFn: (body: PokeRequest) => sendPokeNotification(body),
  });
};

