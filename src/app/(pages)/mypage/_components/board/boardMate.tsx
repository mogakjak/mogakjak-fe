"use client";

import { useState, useEffect } from "react";
import DropdownList from "./mate/dropdownList";
import SearchBar from "./mate/searchBar";
import ProfileList from "./mate/profileList";
import PageNation from "./mate/pageNation";

export default function BoardMate() {
  const [selectedGroup, setSelectedGroup] = useState("전체 그룹");
  const [total, setTotal] = useState(0);
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
    <div className="p-4">
      <h2 className="text-heading4-20SB text-black">
        내 모각작 메이트({total})
      </h2>

      <section className="flex justify-between items-center mt-7">
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

      <section className="flex flex-col justify-between">
        <ProfileList
          groupName={selectedGroup}
          page={page}
          pageSize={pageSize}
          onCountChange={setTotal}
          search={submittedSearch}
        />
        <PageNation
          page={page}
          pageSize={pageSize}
          totalItems={total}
          onChange={setPage}
        />
      </section>
    </div>
  );
}
