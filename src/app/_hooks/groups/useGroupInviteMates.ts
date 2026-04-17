"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getInviteMates, type GetInviteMatesParams } from "../../api/groups/api";
import { groupKeys } from "../../api/groups/keys";
import type { InviteMatesPage } from "../../_types/groups";

export const useGroupInviteMates = (
  groupId: string,
  params?: GetInviteMatesParams,
  options?: Omit<UseQueryOptions<InviteMatesPage, Error>, "queryKey" | "queryFn">
) =>
  useQuery<InviteMatesPage, Error>({
    queryKey: groupKeys.inviteMates(groupId, params),
    queryFn: () => getInviteMates(groupId, params),
    enabled: !!groupId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
