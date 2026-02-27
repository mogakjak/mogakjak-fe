"use client";

import Image from "next/image";
import GroupModal from "./groupModal";
import { Button } from "@/components/button";
import { useAcceptInvitation } from "@/app/_hooks/invitations/useAcceptInvitation";
import { useDeclineInvitation } from "@/app/_hooks/invitations/useDeclineInvitation";
import { PendingInvitation } from "@/app/_types/invitations";

interface InviteAcceptModalProps {
  onClose: () => void;
  invitation: PendingInvitation;
}

export default function InviteAcceptModal({
  onClose,
  invitation,
}: InviteAcceptModalProps) {
  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutate: declineInvitation, isPending: isDeclining } =
    useDeclineInvitation();

  const handleAccept = () => {
    acceptInvitation(invitation.invitationId, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("초대 수락 실패:", error);
        alert("초대 수락에 실패했습니다. 다시 시도해주세요.");
      },
    });
  };

  const handleDecline = () => {
    declineInvitation(invitation.invitationId, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("초대 거절 실패:", error);
        alert("초대 거절에 실패했습니다. 다시 시도해주세요.");
      },
    });
  };

  const isLoading = isAccepting || isDeclining;

  return (
    <GroupModal onClose={onClose}>
      <div className="px-7 py-4 flex flex-col items-center mt-2">
        <h2 className="text-heading4-20SB">
          {invitation.inviterNickname}님이 &quot;{invitation.groupName}&quot;
          으로 초대했어요!
        </h2>
        <p className="text-body1-16R text-gray-700 mt-2">
          모각작에 참여하여 더 몰입되는 경험을 해보세요.
        </p>

        <div className="flex items-center w-[360px] mt-7 bg-red-50 px-4 py-3 rounded-[10px]">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-200">
            <Image
              src={invitation.groupImageUrl || "/Icons/defaultImage.svg"}
              alt={invitation.groupName}
              width={56}
              height={56}
              className="object-cover w-14 h-14"
            />
          </div>
          <p className="text-body1-16SB ml-5">{invitation.groupName}</p>
          <p className="text-gray-700 text-body1-16R ml-auto">
            활동 {invitation.activeMemberCount ?? 0} / 전체 {invitation.memberCount ?? 0} 명
          </p>
        </div>

        <div className="flex items-center w-full gap-2 mt-7">
          <Button
            className="flex-1"
            leftIcon={null}
            variant="muted"
            onClick={handleDecline}
            disabled={isLoading}
          >
            거절
          </Button>
          <Button
            className="flex-1"
            leftIcon={null}
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isAccepting ? "수락 중..." : "수락"}
          </Button>
        </div>
      </div>
    </GroupModal>
  );
}
