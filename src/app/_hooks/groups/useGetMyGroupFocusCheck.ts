import { getMyGroupFocusCheck } from "@/app/api/groups/api";
import { groupKeys } from "@/app/api/groups/keys";
import { useQuery } from "@tanstack/react-query";

export const useGetMyGroupFocusCheck = (groupId: string) =>
  useQuery({
    queryKey: groupKeys.focusCheck(groupId),
    queryFn: () => getMyGroupFocusCheck(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
