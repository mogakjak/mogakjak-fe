import clsx from "clsx";

export type RecordLevel = 0 | 1 | 2 | 3 | 4;

export interface RecordDotProps {
  level: RecordLevel;
  className?: string;
  dimmed?: boolean;
}

const BG_BY_LEVEL: Record<RecordLevel, string> = {
  0: "bg-gray-200",
  1: "bg-red-200",
  2: "bg-red-300",
  3: "bg-red-400",
  4: "bg-red-500",
};

const BORDER_BY_LEVEL: Record<RecordLevel, string> = {
  0: "border-gray-300",
  1: "border-red-300",
  2: "border-red-400",
  3: "border-red-500",
  4: "border-red-600",
};

export default function RecordDot({
  level,
  className,
  dimmed = false,
}: RecordDotProps) {
  const bg = BG_BY_LEVEL[level];
  const border = BORDER_BY_LEVEL[level];

  return (
    <div
      className={clsx(
        "inline-block rounded-full border-2",
        bg,
        border,
        dimmed && "opacity-50",
        className
      )}
      style={{
        width: 18,
        height: 18,
      }}
    />
  );
}
