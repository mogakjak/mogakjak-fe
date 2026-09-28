import clsx from "clsx";
import ProfileActive from "@/app/(pages)/mypage/_components/board/mate/profileActive";
import type { Mate } from "@/app/_types/groups";

interface ProfileListHomeProps {
  mate: Mate;
  isActive: boolean;
  onPoke: (userId: string) => void;
}

export default function ProfileListHome({
  mate,
  isActive,
  onPoke,
}: ProfileListHomeProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <ProfileActive
        src={mate.profileUrl || `/character/level${mate.level}.svg`}
        name={mate.nickname}
        active={isActive}
        size="sm"
      />
      <p className="flex-1 min-w-0 truncate text-body1-16SB text-black">
        {mate.nickname}
      </p>
      <button
        type="button"
        onClick={isActive ? () => onPoke(mate.userId) : undefined}
        disabled={!isActive}
        aria-disabled={!isActive}
        className={clsx(
          "shrink-0 px-4 py-2 rounded-xl text-body2-14SB transition-colors duration-200",
          isActive
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        찌르기
      </button>
    </div>
  );
}
