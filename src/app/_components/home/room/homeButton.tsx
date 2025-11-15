"use client";

import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary";

interface HomeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function HomeButton({
  children,
  variant = "primary",
  className,
  disabled,
  ...props
}: HomeButtonProps) {
  const baseStyle =
    "w-[120px] h-[68px]  py-[20px] rounded-[12px] text-body1-16SB text-white transition-colors duration-150";

  const variantStyles: Record<Variant, string> = {
    primary: clsx(
      "bg-red-500",
      "hover:bg-red-600",
      "active:bg-red-400",
      "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
    ),
    secondary: clsx(
      "bg-gray-500",
      "hover:bg-gray-700",
      "active:bg-gray-600",
      "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
    ),
  };

  return (
    <button
      className={clsx(baseStyle, variantStyles[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
