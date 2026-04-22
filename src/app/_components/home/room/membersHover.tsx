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
import type { HomeGroupMember } from "@/app/_types/groups";

interface MembersHoverProps {
  trigger: React.ReactNode;
  members: (HomeGroupMember & { isActive?: boolean })[];
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
              const relationLabel =
                m.isMate === true ? "친구" : m.isMate === false ? "비친구" : null;
              return (
                <li key={m.userId} className="flex items-center">
                  <MemberProfile
                    isActive={isActive}
                    profileUrl={m.profileUrl}
                  />
                  <div className="ml-2 min-w-0 flex flex-col">
                    <span className="text-body2-14R text-black truncate">
                      {m.nickname}
                    </span>
                    {relationLabel && (
                      <span
                        className={clsx(
                          "mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          m.isMate
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {relationLabel}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto pl-2 shrink-0 self-center">
                    <StateButton state={isActive} />
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
