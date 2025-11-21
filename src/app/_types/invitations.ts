export type PendingInvitation = {
  invitationId: string;
  groupId: string;
  groupName: string;
  inviterNickname: string;
};

export type InvitationUrl = {
  groupId: string;
  invitationUrl: string;
};
