"use client";

import * as React from "react";

type TimerCTAVariant = "primary" | "secondary" | "default" | "selected";
type TimerCTASize = "default" | "big";

interface TimerCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TimerCTAVariant;
  size?: TimerCTASize;
}

function cn(...a: Array<string | undefined | false>) {
  return a.filter(Boolean).join(" ");
}

export default function TimerCTA({
  variant = "primary",
  size = "default",
  className,
  children,
  ...buttonProps
}: TimerCTAProps) {
  const base =
    "w-full inline-flex items-center justify-center gap-1 rounded-lg transition-colors duration-200";

  const sizeCls =
    size === "big" ? "py-1 text-body2-14SB" : "py-2 text-body1-16SB";

  const variantCls =
    variant === "primary"
      ? "bg-red-400 text-white"
      : variant === "secondary"
      ? "bg-gray-700 text-white"
      : variant === "default"
      ? "bg-gray-200 text-gray-600"
      : "bg-white text-red-500 border border-red-500";

  return (
    <button
      type="button"
      className={cn(base, sizeCls, variantCls, className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
