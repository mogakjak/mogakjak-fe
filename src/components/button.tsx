"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";

type Variant =
  | "primary"
  | "brick"
  | "salmon"
  | "slate700"
  | "neutral700"
  | "slate600"
  | "muted"
  | "selected";

type Size = "md" | "sm";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leftIcon?: ReactNode; 
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-red-500 text-neutral-50 hover:opacity-95 active:opacity-90",
  brick: "bg-orange-800 text-neutral-50 hover:opacity-95 active:opacity-90",
  salmon: "bg-red-400 text-neutral-50 hover:opacity-95 active:opacity-90",
  slate700: "bg-zinc-700 text-neutral-50 hover:opacity-95 active:opacity-90",
  neutral700:
    "bg-neutral-700 text-neutral-50 hover:opacity-95 active:opacity-90",
  slate600: "bg-zinc-600 text-neutral-50 hover:opacity-95 active:opacity-90",
  muted: "bg-gray-200 text-gray-400 cursor-not-allowed",
  selected:
    "bg-neutral-50 text-red-500 outline outline-1 outline-offset-[-1px] outline-red-500",
};

const SIZE_CLASS: Record<Size, string> = {
  md: "h-12 px-6 py-3 text-base rounded-xl",
  sm: "h-10 px-4 py-2 text-sm rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      block,
      leftIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isMuted = variant === "muted" || disabled;
    const enablePressScale = !isMuted && variant !== "selected";

    return (
      <button
        ref={ref}
        disabled={disabled || variant === "muted"}
        className={clsx(
          "inline-flex items-center justify-center gap-2 select-none transition-[opacity,transform]",
          SIZE_CLASS[size],
          VARIANT_CLASS[variant],
          block && "w-full",
          enablePressScale && "active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {leftIcon && (
          <span aria-hidden className="w-6 h-6 grid place-items-center">
            {leftIcon}
          </span>
        )}
        <span className="font-semibold leading-snug">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
