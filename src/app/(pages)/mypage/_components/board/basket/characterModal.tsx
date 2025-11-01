import Image from "next/image";
import { rows } from "@/app/_utils/getCharacterByHours";

interface CharacterModalProps {
  onClose: () => void;
}

export default function CharacterModal({ onClose }: CharacterModalProps) {
  return (
    <div className="bg-white p-5 w-[516px] rounded-[20px]">
      <button className="flex ml-auto" onClick={onClose}>
        <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
      </button>
      <div className="p-5">
        <h2 className="text-heading4-20SB mb-[27px]  text-center">채소 도감</h2>

        <div>
          <div className="max-h-[784px] overflow-y-auto">
            <table className="w-full text-body1-16SB">
              <thead className="bg-gray-100 ">
                <tr className="text-left">
                  <th className="py-3 pl-4 w-[150px] text-gray-600 text-body1-16R">
                    레벨
                  </th>
                  <th className="py-3 w-40">보상 기준</th>
                  <th className="py-3 pr-4 text-left">캐릭터</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.level} className={"border-b border-gray-300 "}>
                    <td className="py-[13px] pl-4 text-gray-600 text-body1-16R">
                      Lv {item.level}
                    </td>
                    <td className="py-[13px] text-gray-800">
                      {item.level === 1 ? "회원가입" : `${item.hours}시간`}
                    </td>
                    <td className="py-[13px] pr-4 text-left text-red-500">
                      {item.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
