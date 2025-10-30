import Image from "next/image";
import { getFormattedDate } from "../../_utils/getFormattedDate";
import TodayPreview from "./preview/todayPreview";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";

export default function PreviewMain() {
  return (
    <div className="w-[327px] min-w-[327px] px-6 py-9 rounded-[20px] bg-white">
      <h2 className="text-heading4-20SB text-black">
        오늘은 어떤 몰입을 해볼까요?
      </h2>
      <section className="flex gap-2 mt-3">
        <button className="flex-1 bg-red-400 px-4 py-5 flex flex-col gap-2 items-center rounded-2xl text-white text-body1-16SB">
          <Image
            src="/Icons/groupIcon.svg"
            alt="모각작"
            width={60}
            height={60}
          ></Image>
          <p>모각작하기</p>
        </button>
        <button className="flex-1 bg-red-400 px-4 py-5 flex flex-col gap-2 items-center rounded-2xl text-white text-body1-16SB">
          <Image
            src="/Icons/personalIcon.svg"
            alt="개인 몰입하기"
            width={60}
            height={60}
          ></Image>
          <p>개인 몰입하기</p>
        </button>
      </section>

      <section className="mt-9">
        <div className="flex gap-4 items-center mb-3">
          <p className="text-heading4-20SB text-black">오늘의 몰입</p>
          <p className="text-body1-16SB text-gray-400">{getFormattedDate()}</p>
        </div>
        <TodayPreview hasActivity={false} />
      </section>

      <PreviewCharacter />
      <Quotes />
    </div>
  );
}
