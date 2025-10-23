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
import { useState } from "react";
import MemberProfile from "./memberProfile";
import StateButton from "./stateButton";

type MemberItem = { id: number | string; isActive: boolean };

interface MembersHoverProps {
  trigger: React.ReactNode;
  members: MemberItem[];
  className?: string;
}

export default function MembersHover({
  trigger,
  members,
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

  const activeCount = members.filter((m) => m.isActive).length;

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
          className={[
            "z-[60] w-60  rounded-xl  bg-white shadow-md p-5",
            "transition-opacity duration-150",
            className,
          ].join(" ")}
        >
          <div className="flex text-body1-16SB text-gray-800 mb-2">
            참여자
            <p className="text-gray-500 ml-3">
              {activeCount}/{members.length} 명
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center">
                <MemberProfile isActive={m.isActive} />
                <span className="text-body2-14R text-black ml-2 truncate">
                  {m.id}번
                </span>
                <div className="ml-auto">
                  <StateButton state={m.isActive} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
