import { Button } from "@/components/button";
import GroupModal from "./groupModal";

export default function GoalModal() {
  return (
    <GroupModal>
      <div className="flex flex-col px-[28px] py-4 w-[336px] items-center">
        <h2 className="text-heading4-20SB">그룹 공동 목표</h2>
        <p className="text-body1-16R text-gray-700 mt-2 text-center">
          그룹원들이 다같이 달성할 일일 목표 시간을 설정해주세요!
        </p>

        <div className="flex justify-center my-[28px] text-gray-500 text-heading4-20SB bg-gray-100 rounded-xl w-full px-[40px] py-5">
          <input
            type="text"
            placeholder="0"
            className="w-[12px] border-none outline-none text-end bg-transparent text-gray-500 text-heading4-20SB"
          />
          h
          <input
            type="text"
            placeholder="00"
            className="w-[23px] ml-1 border-none outline-none text-end  bg-transparent text-gray-500 text-heading4-20SB"
          />
          m
        </div>

        <Button className="w-[200px]" leftIcon={null}>
          설정 완료
        </Button>
      </div>
    </GroupModal>
  );
}
