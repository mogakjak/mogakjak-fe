import { RecordDashboard } from "@/app/_types/records";
import { categoryTime } from "../../../_utils/categoryTime";
import CategoryStats from "./categoryStats";

import DonutGraph from "./donutGraph";
import StickGraphs from "./stickGraphs";

interface ChartMainProps {
  data?: RecordDashboard;
  isPending: boolean;
}

export default function ChartMain({ data, isPending }: ChartMainProps) {
  const hourly = Array(24).fill(0);
  const dataReady = !!data && !isPending;

  if (dataReady) {
    data.hourlyFocus.forEach((h) => {
      hourly[h.hour] = h.totalSeconds;
    });
  }

  const baseCategories = dataReady
    ? data.categoryFocus.map((cat) => ({
        category: cat.categoryName,
        seconds: cat.totalSeconds,
        color: cat.color,
      }))
    : [];

  const resolvedCategories = dataReady ? categoryTime(baseCategories) : [];

  const timeItems = dataReady ? resolvedCategories : [];

  const countItems = dataReady
    ? data.categoryFocus.map((cat, idx) => ({
        category: cat.categoryName,
        currentCount: cat.completedTodoCount,
        totalCount: cat.totalTodoCount,
        color: resolvedCategories[idx]?.color ?? String(cat.color ?? ""),
      }))
    : [];

  const categories = resolvedCategories;
  return (
    <div className="mt-[100px]">
      <div className="flex items-center gap-5 mb-5">
        <p className="text-heading4-20SB text-black">시간대별 분석</p>
        <p className="text-body1-16R text-gray-600">
          막대에 마우스를 올리면 상세 시간을 볼 수 있어요.
        </p>
      </div>
      {!dataReady ? (
        <div className="w-full h-[200px] bg-gray-100 rounded-[20px] animate-pulse" />
      ) : (
        <StickGraphs data={hourly} />
      )}
      <div className="flex mt-[100px]  gap-[140px]">
        <section className={categories.length === 0 ? "w-xl" : ""}>
          <p className="text-heading4-20SB text-black mb-10">
            카테고리별 집중시간
          </p>
          <div className="flex gap-[60px] w-full">
            {!dataReady ? (
              <>
                <div className="w-[240px] h-[240px] bg-gray-100 rounded-full animate-pulse" />
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[200px] h-[20px] bg-gray-100 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <DonutGraph
                  totalSeconds={data!.summary.totalSeconds}
                  categories={categories}
                />
                <CategoryStats type="time" items={timeItems} />
              </>
            )}
          </div>
        </section>
        <section>
          <div className="flex items-center gap-5 mb-10">
            <p className="text-heading4-20SB text-black">
              카테고리별 목표 달성 개수
            </p>
            <p className="text-body2-14R text-gray-600">
              (달성 개수 / 목표 개수)
            </p>
          </div>
          {!dataReady ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[250px] h-[20px] bg-gray-100 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : (
            <CategoryStats type="count" items={countItems} />
          )}
        </section>
      </div>
    </div>
  );
}
