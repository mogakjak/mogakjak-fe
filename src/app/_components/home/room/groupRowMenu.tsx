"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
} from "@floating-ui/react";
import LeavePopup from "./leavePopup";
import LeaveGroupModal from "./leaveGroupModal";

type GroupRowMenuProps = {
  groupName: string;
  isHost: boolean;
  hostLeaveBlocked: boolean;
  leaveModalOpen: boolean;
  onOpenLeaveModal: () => void;
  onCloseLeaveModal: () => void;
  onConfirmLeave: () => void;
};

export default function GroupRowMenu({
  groupName,
  isHost,
  hostLeaveBlocked,
  leaveModalOpen,
  onOpenLeaveModal,
  onCloseLeaveModal,
  onConfirmLeave,
}: GroupRowMenuProps) {
  const [openPopup, setOpenPopup] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: openPopup,
    onOpenChange: setOpenPopup,
    placement: "left",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift()],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context),
  ]);

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
      >
        <Image src="/Icons/menuKebab.svg" alt="메뉴" width={24} height={24} />
      </button>

      {openPopup && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-70"
        >
          <LeavePopup
            onLeaveClick={() => {
              setOpenPopup(false);
              onOpenLeaveModal();
            }}
          />
        </div>
      )}

      {leaveModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100">
          <LeaveGroupModal
            groupName={groupName}
            isHost={isHost || hostLeaveBlocked}
            onClose={onCloseLeaveModal}
            onConfirm={onConfirmLeave}
          />
        </div>
      )}
    </>
  );
}
