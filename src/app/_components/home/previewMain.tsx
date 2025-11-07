"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { getFormattedDate } from "../../_utils/getFormattedDate";
import TodayPreview from "./preview/todayPreview";
import PreviewCharacter from "./preview/previewCharacter";
import Quotes from "./preview/quotes";
import GroupModal from "../group/groupModal";
import AddWorkForm from "@/app/(pages)/todo/components/addWorkForm";
import { categoriesData, groups, mates } from "@/app/_utils/mockData";
import { CategoryOption } from "@/app/(pages)/todo/components/categorySelect";

interface PreviewMainProps {
  setPageState: (state: "group" | "personal") => void;
}

export default function PreviewMain({ setPageState }: PreviewMainProps) {
  const [groupOpen, setGroupOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [flow, setFlow] = useState<null | "group" | "personal">(null);

  const openGroupFlow = () => {
    setFlow("group");
    setGroupOpen(true);
  };

  const openPersonalFlow = () => {
    setFlow("personal");
    setPersonalOpen(true);
  };

  const handlePage = () => {
    if (!flow) return;
    setPageState(flow);
  };

  return (
    <div className="w-[327px] min-w-[327px] px-6 py-9 rounded-[20px] bg-white">
      <h2 className="text-heading4-20SB text-black">
        오늘은 어떤 몰입을 해볼까요?
      </h2>
      <section className="flex gap-2 mt-3">
        <button
          onClick={openGroupFlow}
          className="flex-1 bg-red-400 px-4 py-5 flex flex-col gap-2 items-center rounded-2xl text-white text-body1-16SB"
        >
          <Image
            src="/Icons/groupIcon.svg"
            alt="모각작"
            width={60}
            height={60}
          ></Image>
          <p>모각작하기</p>
        </button>
        <button
          onClick={openPersonalFlow}
          className="flex-1 bg-red-400 px-4 py-5 flex flex-col gap-2 items-center rounded-2xl text-white text-body1-16SB"
        >
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

      {groupOpen && (
        <GroupModal
          open={groupOpen}
          onClose={() => setGroupOpen(false)}
          findTabGroups={groups}
          mates={mates}
          onNext={() => {
            setGroupOpen(false);
            setPersonalOpen(true);
          }}
        ></GroupModal>
      )}

      {personalOpen && (
        <div className="z-[1000] fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <AddWorkForm
            type="select"
            categories={categoriesData.map((c) => ({
              id: String(c.id),
              name: c.title,
              colorToken: "category-1-red" as CategoryOption["colorToken"],
            }))}
            onSubmit={handlePage}
            onClose={() => setPersonalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
