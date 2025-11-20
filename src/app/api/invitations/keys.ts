export const invitationKeys = {
  all: () => ["invitations"] as const,
  my: () => [...invitationKeys.all(), "my"] as const,
  url: (groupId: string) => [...invitationKeys.all(), "url", groupId] as const,
};
