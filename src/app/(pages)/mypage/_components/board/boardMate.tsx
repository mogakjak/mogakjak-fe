"use client";

import { useState, useEffect, useMemo } from "react";
import DropdownList from "./mate/dropdownList";
import SearchBar from "./mate/searchBar";
import ProfileList from "./mate/profileList";
import PageNation from "./mate/pageNation";
import { useMyGroups, useMates } from "@/app/_hooks/groups";

export default function BoardMate() {
  const [selectedGroupName, setSelectedGroupName] = useState("전체 그룹");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined
  );
  const [total, setTotal] = useState(0);
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data: groups = [] } = useMyGroups();

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
    page: page - 1,
    size: pageSize,
    groupId: selectedGroupId,
    search: submittedSearch || undefined,
  });

  const profiles = matesData?.content ?? [];
  const totalCount = matesData?.totalElements ?? 0;

  return (
    <div className="p-2">
      <h2 className="text-heading4-20SB text-black">
        내 모각작 메이트({total})
      </h2>

      <section className="flex justify-between items-center mt-3">
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

      <section className="flex flex-col justify-between mt-4">
        <ProfileList
          profiles={profiles}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onCountChange={setTotal}
          search={submittedSearch}
          isLoading={matesLoading}
          groups={groups}
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
