"use client";

import {
  useFloating,
  useHover,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
  safePolygon,
} from "@floating-ui/react";
import clsx from "clsx";
import { useState } from "react";
import MemberProfile from "./memberProfile";
import StateButton from "./stateButton";
import { formatTime } from "@/app/_utils/formatTime";
import type { HomeGroupMember } from "@/app/_types/groups";

interface MembersHoverProps {
  trigger: React.ReactNode;
  members: HomeGroupMember[];
  activeCount: number;
  className?: string;
}

export default function MembersHover({
  trigger,
  members,
  activeCount,
  className = "",
}: MembersHoverProps) {
  const [open, setOpen] = useState(false);
  const isScrollable = members.length > 10;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift()],
  });

  const hover = useHover(context, {
    move: false,
    handleClose: safePolygon(),
    delay: { open: 50, close: 100 },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {trigger}
      </div>

      {open && (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className={clsx(
            "z-60 w-60  rounded-xl  bg-white shadow-md p-5",
            isScrollable && "max-h-[340px] overflow-y-auto pr-2",
            "transition-opacity duration-150",
            className
          )}
        >
          <div className="flex text-body1-16SB text-gray-800 mb-2">
            참여자
            <p className="text-gray-500 ml-3">
              {activeCount}/{members.length} 명
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {members.map((m) => {
              const isActive = m.isActive ?? false;
              const hasOfficialStatus = m.participationStatus !== undefined;
              const statusText =
                m.participationStatus === "PARTICIPATING"
                  ? m.todoTitle
                    ? `"${m.todoTitle}" 하는 중`
                    : "뭔가 하는 중"
                  : m.participationStatus === "RESTING"
                    ? "잠시 쉬어갈래요"
                    : "몰입에 참여하지 않았어요";
              const timerText =
                m.personalTimerSeconds !== null &&
                m.personalTimerSeconds !== undefined
                  ? formatTime(m.personalTimerSeconds)
                  : m.participationStatus === "PARTICIPATING"
                    ? "참여 중"
                    : m.participationStatus === "RESTING"
                      ? "휴식 중"
                      : m.daysSinceLastParticipation !== null &&
                          m.daysSinceLastParticipation !== undefined
                        ? `최근 참여시간 ${m.daysSinceLastParticipation}일전`
                        : m.lastActiveAt
                          ? "최근 참여"
                        : "";
              return (
                <li key={m.userId} className="flex items-center">
                  <MemberProfile
                    isActive={isActive}
                    profileUrl={m.profileUrl}
                  />
                  <div className="ml-2 min-w-0 flex-1">
                    <span className="block truncate text-body2-14R text-black">
                      {m.nickname}
                    </span>
                    {hasOfficialStatus ? (
                      <div className="mt-1 flex flex-col gap-0.5">
                        <span className="truncate text-caption-12R text-gray-600">
                          {statusText}
                        </span>
                        <span className="truncate text-caption-12R text-gray-500">
                          {timerText}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="ml-auto pl-2 shrink-0">
                    {hasOfficialStatus ? (
                      <StateButton
                        state={m.participationStatus === "PARTICIPATING"}
                      />
                    ) : (
                      <StateButton state={isActive} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
