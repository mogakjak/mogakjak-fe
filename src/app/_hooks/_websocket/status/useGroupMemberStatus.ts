"use client";

import { useEffect, useState, useMemo } from "react";
import {
  GroupDetail,
  GroupMemberStatus as GroupsGroupMemberStatus,
  Mate,
} from "@/app/_types/groups";
import { useWebSocket } from "../useWebSocket";

export type GroupMemberStatus = {
  groupId: string;
  userId: string;
  nickname: string;
  profileUrl?: string;
  level: number;
  participationStatus: "NOT_PARTICIPATING" | "RESTING" | "PARTICIPATING";
  enteredAt?: string;
  daysSinceLastParticipation?: number;
  personalTimerSeconds?: number | null; // null이면 비공개, 숫자면 공개
  todoTitle?: string | null; // null이면 비공개, 문자열이면 공개
  cheerCount?: number;
};

export type GroupMemberStatusUpdate = {
  groupId: string;
  members?: GroupMemberStatus[];
  updatedMember?: GroupMemberStatus;
};

type UseGroupMemberStatusOptionsBase = {
  groupId: string;
  enabled?: boolean;
};

type UseGroupMemberStatusOptionsWithCallback =
  UseGroupMemberStatusOptionsBase & {
    onUpdate: (update: GroupMemberStatusUpdate) => void;
    groupData?: never;
    members?: never;
  };

type UseGroupMemberStatusOptionsWithGroupData =
  UseGroupMemberStatusOptionsBase & {
    groupData: GroupDetail;
    onUpdate?: never;
    members?: never;
  };

type UseGroupMemberStatusOptionsWithMembers =
  UseGroupMemberStatusOptionsBase & {
    members: Mate[];
    onUpdate?: never;
    groupData?: never;
  };

type UseGroupMemberStatusOptions =
  | UseGroupMemberStatusOptionsWithCallback
  | UseGroupMemberStatusOptionsWithGroupData
  | UseGroupMemberStatusOptionsWithMembers;

// 함수 오버로드
export function useGroupMemberStatus(
  options: UseGroupMemberStatusOptionsWithGroupData
): {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  memberStatuses: Map<string, GroupsGroupMemberStatus>;
};

export function useGroupMemberStatus(
  options: UseGroupMemberStatusOptionsWithMembers
): {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  membersWithStatus: (Mate & { isActive: boolean })[];
  activeCount: number;
};

export function useGroupMemberStatus(
  options: UseGroupMemberStatusOptionsWithCallback
): {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export function useGroupMemberStatus({
  groupId,
  enabled = true,
  onUpdate,
  groupData,
  members,
}: UseGroupMemberStatusOptions) {
  // groupData가 제공되면 상태 관리 모드
  const [memberStatuses, setMemberStatuses] = useState<
    Map<string, GroupsGroupMemberStatus>
  >(new Map());

  // members가 제공되면 멤버 상태를 Map으로 관리
  const [memberStatusMap, setMemberStatusMap] = useState<
    Map<string, GroupMemberStatus>
  >(new Map());

  // groupData가 제공되면 초기 멤버 상태 설정 및 groupData 변경 시 업데이트
  useEffect(() => {
    if (!groupData) return;

    setMemberStatuses((prev) => {
      const next = new Map(prev);
      const currentMemberIds = new Set(groupData.members.map((m) => m.userId));

      // groupData의 멤버들을 업데이트 (기존 상태 유지)
      groupData.members.forEach((member) => {
        const existingStatus = next.get(member.userId);
        next.set(member.userId, {
          groupId: groupData.groupId,
          userId: member.userId,
          nickname: member.nickname,
          profileUrl: member.profileUrl,
          level: member.level || 1,
          // 기존 상태가 있으면 유지, 없으면 NOT_PARTICIPATING
          participationStatus:
            existingStatus?.participationStatus || "NOT_PARTICIPATING",
          cheerCount: existingStatus?.cheerCount || 0,
          enteredAt: existingStatus?.enteredAt,
          personalTimerSeconds: existingStatus?.personalTimerSeconds,
          todoTitle: existingStatus?.todoTitle,
        });
      });

      // groupData에 없는 멤버는 제거
      Array.from(next.keys()).forEach((userId) => {
        if (!currentMemberIds.has(userId)) {
          next.delete(userId);
        }
      });

      return next;
    });
  }, [groupData]);

  const handleUpdate = (update: GroupMemberStatusUpdate) => {
    // groupData가 제공되면 상태 관리 모드
    if (groupData) {
      setMemberStatuses((prev) => {
        const next = new Map(prev);

        if (update.members) {
          // 전체 멤버 목록 업데이트
          update.members.forEach((member) => {
            // WebSocket 타입을 groups 타입으로 변환 (null을 undefined로 변환)
            const convertedMember: GroupsGroupMemberStatus = {
              ...member,
              personalTimerSeconds: member.personalTimerSeconds ?? undefined,
              todoTitle: member.todoTitle ?? undefined,
            };
            next.set(member.userId, convertedMember);
          });
        } else if (update.updatedMember) {
          // 단일 멤버 상태 업데이트
          // WebSocket 타입을 groups 타입으로 변환 (null을 undefined로 변환)
          const convertedMember: GroupsGroupMemberStatus = {
            ...update.updatedMember,
            personalTimerSeconds:
              update.updatedMember.personalTimerSeconds ?? undefined,
            todoTitle: update.updatedMember.todoTitle ?? undefined,
          };
          next.set(update.updatedMember.userId, convertedMember);
        }
        return next;
      });
    }

    // members가 제공되면 상태 관리 모드
    if (members) {
      setMemberStatusMap((prev) => {
        const next = new Map(prev);

        // 전체 멤버 목록 업데이트
        if (update.members) {
          update.members.forEach((member) => {
            next.set(member.userId, member);
          });
        }

        // 개별 멤버 업데이트
        if (update.updatedMember) {
          next.set(update.updatedMember.userId, update.updatedMember);
        }

        return next;
      });
    }

    // onUpdate 콜백 호출 (groupData 모드가 아닐 때)
    onUpdate?.(update);
  };

  const { isConnected, connect, disconnect } =
    useWebSocket<GroupMemberStatusUpdate>({
      enabled: enabled && !!groupId,
      destination: groupId
        ? `/topic/group/${groupId}/member-status`
        : undefined,
      onMessage: handleUpdate,
      connectDelay: 500, // 그룹 페이지는 실시간이 중요하므로 짧은 지연
      waitForLoad: false,
    });

  // members가 제공되면 membersWithStatus와 activeCount 계산
  const membersWithStatus = useMemo(() => {
    if (!members) return [];
    return members.map((member) => {
      const status = memberStatusMap.get(member.userId);
      const isActive = status?.participationStatus === "PARTICIPATING";
      return {
        ...member,
        isActive,
      };
    });
  }, [members, memberStatusMap]);

  const activeCount = useMemo(
    () => membersWithStatus.filter((m) => m.isActive).length,
    [membersWithStatus]
  );

  // groupData가 제공되면 memberStatuses를 반환
  if (groupData) {
    return {
      isConnected,
      connect,
      disconnect,
      memberStatuses,
    } as const;
  }

  // members가 제공되면 membersWithStatus와 activeCount를 반환
  if (members) {
    return {
      isConnected,
      connect,
      disconnect,
      membersWithStatus,
      activeCount,
    } as const;
  }

  // onUpdate 콜백 모드
  return {
    isConnected,
    connect,
    disconnect,
  } as const;
}
