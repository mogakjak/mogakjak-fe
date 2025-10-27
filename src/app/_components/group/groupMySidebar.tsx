import Icon from "../Icons";
import Edit from "/Icons/edit.svg";

export default function GroupMySidebar() {
  return (
    <div className="p-5 bg-white w-[238px] h-[512px] rounded-2xl">
      <h3 className="text-body1-16SB">할 일</h3>
      <div className="flex justify-between items-center mt-2">
        <p className="text-body2-14SB text-green">와이어프레임 완료</p>
        <button>
          <Icon Svg={Edit} size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-2 bg-gray-100 rounded-lg px-3 py-2">
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">목표시간</b> 00 : 00 : 00
        </p>
        <p className="text-caption-12SB text-gray-600">
          <b className="text-black mr-2">현재 달성률</b> 50%
        </p>
      </div>

      <div className="flex flex-col gap-1 py-5 my-5 border-t border-b border-gray-200">
        <h3 className="text-body1-16SB">오늘 몰입 누적 시간</h3>
        <p className="text-body2-14SB text-red-500">00 : 00 : 00</p>
      </div>
    </div>
  );
}
