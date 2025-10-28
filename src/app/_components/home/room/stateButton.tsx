import clsx from "clsx";

interface StateButtonProps {
  state: boolean;
}

export default function StateButton({ state }: StateButtonProps) {
  return (
    <div
      className={clsx(
        "px-4 py-1 rounded-[100px] text-caption-12SB w-[74px] text-center",
        state ? "text-red-500 bg-red-100" : "text-gray-500 bg-gray-200"
      )}
    >
      {state ? "몰입 중" : "휴식 중"}
    </div>
  );
}
