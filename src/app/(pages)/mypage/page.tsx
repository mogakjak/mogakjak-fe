"use client";

import { useEffect, useMemo, useState } from "react";
import Menu from "./_components/menu/menuMain";
import Profile from "./_components/profile/profileMain";
import AttendanceCard from "./_components/attendance/attendanceCard";
import ActivitySection from "./_components/activity/activitySection";
import BoardBasket from "./_components/board/boardBasket";
import BoardMate from "./_components/board/boardMate";
import FloatingButtons from "./_components/floatingButton";
import { useCharacterBasket } from "@/app/_hooks/mypage/useCharacterBasket";
import { useAttendance } from "@/app/_hooks/mypage/useAttendance";
import { getCollectionProgress } from "./_utils/collectionProgress";

const BASKET_MENU = "내 과일 바구니";
const MATE_MENU = "내 모각작 메이트";

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`w-full rounded-[20px] bg-white border border-gray-100 shadow-sm animate-pulse ${className}`}
  />
);

export default function MyPage() {
  const [selectedMenu, setSelectedMenu] = useState(BASKET_MENU);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "mate") setSelectedMenu(MATE_MENU);
  }, []);

  const { data: basket, isLoading } = useCharacterBasket();
  const { data: attendance } = useAttendance();

  const progress = useMemo(
    () =>
      getCollectionProgress(
        basket?.growthProgress,
        attendance?.totalAttendanceDays,
      ),
    [basket?.growthProgress, attendance?.totalAttendanceDays],
  );

  const isBasketReady = !isLoading && !!basket;

  return (
    <div className="w-full max-w-[1440px] h-full pt-9 pb-[60px] px-9 mx-auto flex gap-5 items-stretch overflow-x-hidden">
      <section className="w-[327px] shrink-0 flex flex-col gap-5 self-stretch">
        <Menu selected={selectedMenu} onSelect={setSelectedMenu} />
        {isBasketReady ? (
          <Profile basket={basket} />
        ) : (
          <Skeleton className="h-[624px]" />
        )}
      </section>

      <section className="flex-1 min-w-0 flex flex-col gap-5 self-stretch">
        {selectedMenu === BASKET_MENU ? (
          <>
            <AttendanceCard
              referenceDate={attendance?.referenceDate}
              days={attendance?.days}
            />
            <ActivitySection progress={progress} />
            {isBasketReady ? (
              <BoardBasket ownedCharacters={basket.ownedCharacters} />
            ) : (
              <Skeleton className="h-[438px]" />
            )}
          </>
        ) : (
          <div className="w-full h-full p-6 bg-white rounded-[20px]">
            <BoardMate />
          </div>
        )}
      </section>

      <FloatingButtons />
    </div>
  );
}
