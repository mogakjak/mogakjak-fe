interface TodayPreviewProps {
  hasActivity: boolean;
  completedTasks?: string;
  totalTime?: string;
  achievementRate?: string;
}

export default function TodayPreview({
  hasActivity,
  completedTasks = "0/0",
  totalTime = "0h 0m",
  achievementRate = "0%",
}: TodayPreviewProps) {
  return (
    <div>
      {hasActivity ? (
        <section className="flex justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-body2-14R text-gray-600">완료한 작업</p>
            <p className="text-heading3-24SB text-red-500">{completedTasks}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-body2-14R text-gray-600">완료한 시간</p>
            <p className="text-heading3-24SB text-red-500">{totalTime}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-body2-14R text-gray-600">달성률</p>
            <p className="text-heading3-24SB text-green-500">
              {achievementRate}
            </p>
          </div>
        </section>
      ) : (
        <section className="text-body2-14R text-gray-700 px-2 py-6 bg-gray-100 rounded-lg text-center">
          아직 몰입을 시작하지 않았어요. <br />
          지금 한 번 시작해볼까요?💪
        </section>
      )}
    </div>
  );
}
