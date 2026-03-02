"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getGroupHostAck } from "@/app/api/groups/api";
import { groupKeys } from "@/app/api/groups/keys";
import type { GroupHostAckStatus } from "@/app/_types/groups";

export const useGroupHostAck = (
  groupId: string,
  options?: Omit<
    UseQueryOptions<GroupHostAckStatus, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<GroupHostAckStatus, Error>({
    queryKey: groupKeys.hostAck(groupId),
    queryFn: () => {
      if (!groupId || groupId === "undefined") {
        throw new Error("groupId is required");
      }
      return getGroupHostAck(groupId);
    },
    enabled: !!groupId && groupId !== "undefined",
    ...options,
  });

