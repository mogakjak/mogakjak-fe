"use client";

import { useState, useEffect, useMemo } from "react";
import DropdownList from "../../(pages)/mypage/_components/board/mate/dropdownList";
import SearchBar from "../../(pages)/mypage/_components/board/mate/searchBar";
import ProfileList from "../../(pages)/mypage/_components/board/mate/profileList";
import { useMates } from "@/app/_hooks/groups/useMates";
import { MyGroup } from "@/app/_types/groups";

interface FriendMainProps {
  groups: MyGroup[];
}

export default function FriendMain({ groups }: FriendMainProps) {
  const [selectedGroupName, setSelectedGroupName] = useState("전체 그룹");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined
  );
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    setPage(1);
  }, [selectedGroupId, submittedSearch]);

  const groupItems = useMemo(
    () => ["전체 그룹", ...groups.map((g) => g.groupName)],
    [groups]
  );

  const handleGroupChange = (value: string) => {
    setSelectedGroupName(value);

    if (value === "전체 그룹") {
      setSelectedGroupId(undefined);
    } else {
      const found = groups.find((g) => g.groupName === value);
      setSelectedGroupId(found?.groupId);
    }
  };

  const handleSearchSubmit = (value: string) => {
    setSubmittedSearch(value.trim());
  };

  const { data: matesData, isLoading: matesLoading } = useMates({
    page: page - 1, // 서버가 0부터 시작이면 이렇게
    size: pageSize,
    groupId: selectedGroupId,
    search: submittedSearch || undefined,
  });

  const profiles = matesData?.content ?? [];
  const totalCount = matesData?.totalElements ?? 0;

  return (
    <div className="px-10 pt-10 bg-white rounded-[20px] self-stretch ">
      <h2 className="text-heading4-20SB text-black">메이트들의 집중 현황</h2>

      <section className="flex justify-between items-center mt-4">
        <DropdownList
          items={groupItems}
          defaultLabel={selectedGroupName}
          onChange={handleGroupChange}
        />
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearchSubmit}
        />
      </section>

      <section className="flex flex-col justify-between mt-4 h-[225px] overflow-y-auto">
        <ProfileList
          profiles={profiles}
          totalCount={totalCount}
          pageSize={pageSize}
          search={submittedSearch}
          isLoading={matesLoading}
        />
      </section>
    </div>
  );
}
