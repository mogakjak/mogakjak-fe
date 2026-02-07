"use client";
import { forwardRef, ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";

type Variant =
  | "primary"
  | "primary2"
  | "secondary"
  | "neutral700"
  | "slate600"
  | "muted"
  | "selected";
type Size = "md" | "sm" | "custom";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leftIcon?: ReactNode;
  leftIconSrc?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-red-500 text-neutral-50 hover:bg-red-700 active:opacity-90",
  primary2: "bg-red-400 text-neutral-50 hover:bg-red-700 active:opacity-90",
  secondary:
    "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 active:opacity-90",
  neutral700:
    "bg-neutral-700 text-neutral-50 hover:opacity-95 active:opacity-90",
  slate600: "bg-zinc-600 text-neutral-50 hover:opacity-95 active:opacity-90",
  muted: "bg-gray-200 text-gray-700 hover:bg-gray-200 active:opacity-95",
  selected:
    "bg-red-50 text-red-500 outline outline-1 outline-offset-[-1px] outline-red-500",
};

const SIZE_CLASS: Record<Size, string> = {
  md: "h-12 px-6 py-3 text-base rounded-[16px]",
  sm: "h-10 px-4 py-2 text-sm rounded-[12px]",
  custom: "",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      block,
      leftIcon,
      leftIconSrc,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isMuted = variant === "muted";
    const enablePressScale = !disabled && variant !== "selected";

    const iconNode =
      leftIcon ??
      (leftIconSrc ? (
        <Image
          src={leftIconSrc}
          alt=""
          width={24}
          height={24}
          aria-hidden
          style={{ aspectRatio: "1 / 1" }}
          className="object-contain"
        />
      ) : null);

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 select-none transition-[opacity,transform]",
          SIZE_CLASS[size],
          VARIANT_CLASS[variant],
          block && "w-full",
          enablePressScale && "active:scale-[0.98]",
          isMuted && "cursor-pointer",
          className,
        )}
        {...props}
      >
        {iconNode && (
          <span
            aria-hidden
            className="w-6 h-6 grid place-items-center shrink-0"
          >
            {iconNode}
          </span>
        )}
        <span className="font-semibold leading-snug">{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
