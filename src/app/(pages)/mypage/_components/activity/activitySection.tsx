import Image from "next/image";
import type { CollectionProgress } from "../../_utils/collectionProgress";

function StatCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex-1 min-w-0 h-full px-5 py-7 rounded-[20px] bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-body1-16SB text-black whitespace-nowrap">{title}</p>
      <div className="flex items-center justify-center gap-1">
        <span className="size-10 flex items-center justify-center">
          <Image src="/Icons/fire.svg" alt="" width={26} height={32} />
        </span>
        <p className="flex items-center whitespace-nowrap">
          <span className="text-heading2-28SB text-red-500">{value}</span>
          <span className="text-[24px] leading-[1.4] font-normal text-black">
            {unit}
          </span>
        </p>
      </div>
    </div>
  );
}

function ProgressCard({ progress }: { progress: CollectionProgress }) {
  const { isComplete, remainingDays, remainingHours, windowLevels, fillRate } =
    progress;

  const conditionText = [
    remainingDays > 0 ? `${remainingDays}일 출석` : null,
    remainingHours > 0 ? `${remainingHours}시간 몰입` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex-1 min-w-0 h-full p-6 rounded-[20px] bg-white flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body1-16SB text-black whitespace-nowrap">
          {isComplete ? "과일 수집 완료" : "다음 과일 수집까지"}
        </p>
        <p className="flex items-center gap-1 text-body2-14R text-gray-600 text-right truncate">
          {isComplete ? (
            <>
              <span className="text-body2-14SB text-red-500">목표 달성!</span>
              모든 캐릭터를 모았어요
            </>
          ) : conditionText ? (
            <>
              <span className="text-body2-14SB text-red-500">
                {conditionText}
              </span>
              하면 다음 캐릭터를 만나요!
            </>
          ) : (
            <span className="text-body2-14SB text-red-500">
              곧 다음 캐릭터를 만나요!
            </span>
          )}
        </p>
      </div>

      <div
        className="relative w-full h-[68px]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fillRate * 100)}
      >
        <div className="absolute left-[23px] right-[23px] top-1/2 -translate-y-1/2 h-9 rounded-[100px] bg-gray-100 border border-gray-200 overflow-hidden">
          <div
            className="h-full rounded-r-[80px] transition-[width] duration-500"
            style={{
              width: `calc(11px + (100% - 22px) * ${fillRate})`,
              backgroundImage:
                "linear-gradient(88deg, var(--color-red-50) 0%, var(--color-red-200) 100%)",
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-between">
          {windowLevels.map((level) => (
            <Image
              key={level}
              src={`/character/level${level}.svg`}
              alt={`Lv${level} 캐릭터`}
              width={68}
              height={68}
              className="size-[68px] object-contain drop-shadow-[0_0_6px_rgba(0,0,0,0.15)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActivitySection({
  progress,
}: {
  progress: CollectionProgress;
}) {
  return (
    <section className="w-full h-[152px] flex gap-5">
      <div className="w-[327px] shrink-0 h-full flex gap-5">
        <StatCard
          title="누적 출석 일수"
          value={progress.attendanceDays}
          unit="일"
        />
        <StatCard
          title="누적 집중 시간"
          value={Math.floor(progress.focusSeconds / 3600)}
          unit="h"
        />
      </div>
      <ProgressCard progress={progress} />
    </section>
  );
}
