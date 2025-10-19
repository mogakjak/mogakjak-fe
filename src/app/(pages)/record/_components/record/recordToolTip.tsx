"use client";

import { useEffect, useRef } from "react";
import tippy, {
  Instance,
  Props as TippyCoreProps,
  followCursor,
} from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away-subtle.css";

type RecordToolTipProps = {
  label: string | number;
  children: React.ReactNode;
  placement?: TippyCoreProps["placement"];
  offset?: [number, number];
  followCursorEnabled?: boolean;
  theme?: string;
};

export default function RecordToolTip({
  label,
  children,
  placement = "top",
  offset = [0, 10],
  followCursorEnabled = true,
  theme = "chart",
}: RecordToolTipProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<Instance | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;

    tipRef.current = tippy(anchorRef.current, {
      content: "",
      placement,
      arrow: true,
      theme,
      animation: "shift-away-subtle",
      duration: [120, 80],
      offset,
      appendTo: () => document.body,
      zIndex: 9999,
      plugins: followCursorEnabled ? [followCursor] : [],
      followCursor: followCursorEnabled ? true : undefined,
      moveTransition: "transform 0.12s ease-out",
    });

    return () => {
      tipRef.current?.destroy();
      tipRef.current = null;
    };
  }, [placement, offset, followCursorEnabled, theme]);

  useEffect(() => {
    tipRef.current?.setContent(String(label));
  }, [label]);

  return (
    <span ref={anchorRef} className="inline-flex">
      {children}
    </span>
  );
}
