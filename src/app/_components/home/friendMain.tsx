"use client";

import { useState, useEffect } from "react";
import DropdownList from "../../(pages)/mypage/_components/board/mate/dropdownList";
import SearchBar from "../../(pages)/mypage/_components/board/mate/searchBar";
import ProfileList from "../../(pages)/mypage/_components/board/mate/profileList";

export default function FriendMain() {
  const [selectedGroup, setSelectedGroup] = useState("전체 그룹");
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(""); // 입력 중인 검색어
  const [submittedSearch, setSubmittedSearch] = useState(""); // 실제 검색된 이름

  const groupItems = [
    "전체 그룹",
    "그룹이름가나다라",
    "그룹이름마바사아",
    "그룹이름자차카타파하",
    "그룹이름ABCDE",
    "그룹이름ABDE",
    "그룹이름ACDE",
    "그룹이름AB",
    "그룹이름CDE",
  ];

  useEffect(() => {
    setPage(1);
  }, [selectedGroup, submittedSearch]);

  const handleSearchSubmit = (value: string) => {
    setSubmittedSearch(value);
  };

  return (
    <div className="px-10 pt-9 bg-white rounded-[20px] self-stretch">
      <h2 className="text-heading4-20SB text-black">메이트들의 집중 현황</h2>

      <section className="flex justify-between items-center mt-4 abs">
        <DropdownList
          items={groupItems}
          defaultLabel={selectedGroup}
          onChange={(value) => setSelectedGroup(value)}
        />
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearchSubmit}
        />
      </section>

      <section className="flex flex-col justify-between mt-4 h-[195px] overflow-y-auto">
        <ProfileList
          groupName={selectedGroup}
          page={page}
          pageSize={pageSize}
          search={submittedSearch}
        />
      </section>
    </div>
  );
}
