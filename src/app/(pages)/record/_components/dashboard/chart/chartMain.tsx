import { categoryTime } from "../../../_utils/categoryTime";
import CategoryStats from "./categoryStats";

import DonutGraph from "./donutGraph";
import StickGraphs from "./stickGraphs";

export default function ChartMain() {
  const totalMinutes = 600;
  const focusData = [
    90, 70, 0, 0, 0, 0, 0, 0, 0, 40, 65, 30, 0, 0, 8, 12, 45, 60, 100, 75, 100,
    25, 35, 50,
  ];

  const timeItems = [
    { category: "공부공부공부공부공부공부공부", minutes: 180 },
    { category: "운동", minutes: 75 },
    { category: "독서", minutes: 60 },
    { category: "개발", minutes: 200 },
    { category: "휴식", minutes: 120 },
    { category: "기타", minutes: 40 },
    { category: "기타", minutes: 40 },
    { category: "기타", minutes: 40 },
    { category: "기타", minutes: 40 },
  ];

  const countItems = [
    {
      category: "공부공부공부공부공부공부공부",
      currentCount: 5,
      totalCount: 8,
    },
    { category: "운동", currentCount: 3, totalCount: 5 },
    { category: "독서", currentCount: 7, totalCount: 10 },
    { category: "독서", currentCount: 7, totalCount: 10 },
    { category: "독서", currentCount: 7, totalCount: 10 },
    { category: "독서", currentCount: 7, totalCount: 10 },
    { category: "독서", currentCount: 7, totalCount: 10 },
    { category: "독서", currentCount: 7, totalCount: 10 },
  ];

  const categories = categoryTime(timeItems);
  return (
    <main className="mt-[100px]">
      <div className="flex items-center gap-5 mb-5">
        <p className="text-heading4-20SB text-black">시간대별 분석</p>
        <p className="text-body1-16R text-gray-600">
          막대에 마우스를 올리면 상세 시간을 볼 수 있어요.
        </p>
      </div>
      <StickGraphs data={focusData} />
      <div className="flex mt-[100px]  gap-[140px]">
        <section>
          <p className="text-heading4-20SB text-black mb-10">
            카테고리별 집중시간
          </p>
          <div className="flex gap-[60px] w-full">
            <DonutGraph totalMinutes={totalMinutes} categories={categories} />
            <CategoryStats type="time" items={timeItems} />
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
          <CategoryStats type="count" items={countItems} />
        </section>
      </div>
    </main>
  );
}
