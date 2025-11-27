import { getGroupNoti } from "@/app/api/groups/api";
import { useQuery } from "@tanstack/react-query";

export const useGetGroupNotifications = (groupId: string | null) =>
  useQuery({
    queryKey: ["group", groupId, "noti"],
    queryFn: () => {
      if (!groupId) throw new Error("groupId is required");
      return getGroupNoti(groupId);
    },
    enabled: !!groupId,
    staleTime: 1000 * 30, // 30초 캐싱
  });
