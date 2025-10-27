import Image from "next/image";
import GroupModal from "./groupModal";
import { Button } from "@/components/button";

export default function InvitedModal() {
  return (
    <GroupModal>
      <div className="px-[28px] py-[16px] flex flex-col items-center mt-2">
        <h2 className="text-heading4-20SB">
          김이름님이 &quot;그룹 이름&quot; 으로 초대했어요!
        </h2>
        <p className="text-body1-16R text-gray-700 mt-2">
          모각작에 참여하여 더 몰입되는 경험을 해보세요.
        </p>

        <div className="flex items-center w-[360px] mt-[28px] bg-red-50 px-4 py-3 rounded-[10px]">
          <div className="w-[56px] h-[56px] rounded-lg">
            <Image
              src={"/Icons/defaultImage.svg"}
              alt={"빈 값"}
              width={56}
              height={56}
            ></Image>
          </div>
          <p className="text-body1-16SB ml-5">그룹 이름</p>
          <p className="text-gray-700 text-body1-16R ml-auto">n&#47;10 명</p>
        </div>

        <div className="flex items-center w-full gap-2 mt-[28px]">
          <Button className="flex-1" leftIcon={null} variant="muted">
            거절
          </Button>
          <Button className="flex-1" leftIcon={null}>
            수락
          </Button>
        </div>
      </div>
    </GroupModal>
  );
}
