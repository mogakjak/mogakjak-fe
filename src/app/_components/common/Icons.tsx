"use client";
import type { SVGProps } from "react";

interface IconProps {
  Svg: React.FC<SVGProps<SVGSVGElement>>;
  size?: number;
  className?: string;
  color?: string;
}

export default function Icon({
  Svg,
  size = 24,
  className = "",
  color,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      className={["fill-current", className].join(" ")}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}
