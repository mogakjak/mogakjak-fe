type GroupPresenceProps = {
  participatingMemberCount: number;
};

export default function GroupPresence({
  participatingMemberCount,
}: GroupPresenceProps) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-2xl bg-white px-8 py-5">
      <h3 className="text-heading4-20SB text-black">라운지 현황</h3>
      <div className="flex h-[108px] flex-1 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 px-6 py-6 text-gray-700">
        <p className="text-center text-heading2-28SB">
          {participatingMemberCount}명 🔥
        </p>
        <p className="mt-2 text-center text-body1-16R text-gray-600">
          함께 몰입 중입니다
        </p>
      </div>
    </div>
  );
}
