export type PendingInvitation = {
  invitationId: string;
  groupImageUrl?: string;
  memberCount?: number;
  activeMemberCount?: number;
  groupId: string;
  groupName: string;
  inviterNickname: string;
};

export type InvitationUrl = {
  groupId: string;
  invitationUrl: string;
};

export type InvitationResponseNotification = {
  invitationId: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviteeId: string;
  inviteeNickname: string;
  status: "ACCEPTED" | "DECLINED";
  message: string;
};
