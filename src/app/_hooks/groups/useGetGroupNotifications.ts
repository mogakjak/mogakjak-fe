import { getGroupNoti } from "@/app/api/groups/api";
import { useQuery } from "@tanstack/react-query";
import { groupKeys } from "@/app/api/groups/keys";

export const useGetGroupNotifications = (
  groupId: string | null,
  options?: { refetchInterval?: number }
) =>
  useQuery({
    queryKey: groupId ? groupKeys.notifications(groupId) : ["group", "noti"],
    queryFn: () => {
      if (!groupId) throw new Error("groupId is required");
      return getGroupNoti(groupId);
    },
    enabled: !!groupId,
    staleTime: 1000 * 30, // 30초 캐싱
    refetchInterval: options?.refetchInterval,
  });
