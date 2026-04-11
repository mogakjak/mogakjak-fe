"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/app/_hooks/_websocket/useWebSocket";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";
import type { HomeGroupMember, MyGroup } from "@/app/_types/groups";

export type OfficialLoungePresenceUpdateMessage = {
  loungeId: string;
  eventType: "ENTER" | "LEAVE" | "DISCONNECT" | string;
  changedUserId: string;
  currentMemberCount: number;
  maxMemberCount: number;
  members: HomeGroupMember[];
};

type UseOfficialLoungePresenceSubscriptionOptions = {
  enabled?: boolean;
  onUpdate?: (message: OfficialLoungePresenceUpdateMessage) => void;
};

export function useOfficialLoungePresenceSubscription({
  enabled = true,
  onUpdate,
}: UseOfficialLoungePresenceSubscriptionOptions = {}) {
  const queryClient = useQueryClient();

  const handleMessage = useCallback((message: OfficialLoungePresenceUpdateMessage) => {
    onUpdate?.(message);

    queryClient.setQueryData<MyGroup | undefined>(loungeKeys.summary(), (prev) => {
      if (!prev || !prev.isOfficialLounge || prev.groupId !== message.loungeId) {
        return prev;
      }

      return {
        ...prev,
        currentMemberCount: message.currentMemberCount,
        maxMemberCount: message.maxMemberCount,
        members: message.members,
      };
    });

    queryClient.setQueryData<MyGroup[] | undefined>(groupKeys.my(), (prev) => {
      if (!prev) return prev;

      return prev.map((group) => {
        if (!group.isOfficialLounge || group.groupId !== message.loungeId) {
          return group;
        }

        return {
          ...group,
          currentMemberCount: message.currentMemberCount,
          maxMemberCount: message.maxMemberCount,
          members: message.members,
        };
      });
    });
  }, [onUpdate, queryClient]);

  return useWebSocket<OfficialLoungePresenceUpdateMessage>({
    enabled,
    destination: "/topic/lounge/presence",
    onMessage: handleMessage,
    waitForLoad: true,
  });
}
