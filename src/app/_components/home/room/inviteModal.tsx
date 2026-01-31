"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/button";
import { useMates } from "@/app/_hooks/groups/useMates";
import { useInviteMate } from "@/app/_hooks/groups/useInviteMate";
import ProfileActive from "@/app/(pages)/mypage/_components/board/mate/profileActive";
import { useMateActiveStatus } from "@/app/_hooks/_websocket/status/useMateActiveStatus";
import SimpleToast from "@/app/_components/common/SimpleToast";

interface InviteModalProps {
  onClose: () => void;
  groupId: string;
}

export default function InviteModal({ onClose, groupId }: InviteModalProps) {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [showToast, setShowToast] = useState(false);

  const { data: matesData, isLoading: matesLoading } = useMates({
    search: submittedSearch || undefined,
  });

  const profiles = useMemo(() => matesData?.content ?? [], [matesData?.content]);

  const { mutate: inviteMate } = useInviteMate(groupId);

  const [activeStatusMap, setActiveStatusMap] = useState<
    Record<string, boolean>
  >({});
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  // 1) 초기 isActive 값 세팅 (profiles가 바뀔 때)
  useEffect(() => {
    setActiveStatusMap((prev) => {
      const updated = { ...prev };

      profiles.forEach((profile) => {
        if (updated[profile.userId] === undefined) {
          updated[profile.userId] = profile.isActive ?? false;
        }
      });

      return updated;
    });
  }, [profiles]);

  // 2) 웹소켓에서 온 활성화 이벤트 반영
  const handleStatusChange = useCallback(
    (event: { userId: string; isActive: boolean }) => {
      setActiveStatusMap((prev) => ({
        ...prev,
        [event.userId]: event.isActive,
      }));
    },
    []
  );

  // 3) 웹소켓 구독
  useMateActiveStatus({
    enabled: true,
    onStatusChange: handleStatusChange,
  });

  // 초대링크
  const inviteUrl = useMemo(() => {
    if (!groupId) return "";
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "https://mogakjak-fe.vercel.app";
    return `${baseUrl}/invite/${groupId}`;
  }, [groupId]);

  const handleSearchSubmit = (value: string) => {
    setSubmittedSearch(value.trim());
  };

  // 초대 로직
  const handleInvite = (userId: string) => {
    setInvitingUserId(userId);
    inviteMate(
      { inviteeId: userId },
      {
        onSuccess: () => {
          // 초대 성공 처리 (선택사항)
        },
        onError: (error) => {
          console.error("초대 실패:", error);
          alert("초대에 실패했습니다. 다시 시도해주세요.");
        },
        onSettled: () => {
          setInvitingUserId(null);
        },
      }
    );
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  };

  return (
    <>
      <SimpleToast isVisible={showToast} message="초대링크가 복사되었어요." />
      <div className="w-[516px] p-5 bg-neutral-50 rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)]">
        <button
          className="flex ml-auto mb-2"
          onClick={onClose}
          aria-label="닫기"
        >
          <Image src="/Icons/xmark.svg" alt="닫기" width={24} height={24} />
        </button>
        <div className="p-5 flex flex-col items-center gap-7">
          <h2 className="text-center text-neutral-900 text-xl font-semibold leading-7">
            함께 할 메이트를 초대하세요!
          </h2>

          <div className="w-full flex flex-col gap-4">
            <div className="inline-flex justify-center items-center gap-4">
              <div className="text-neutral-900 text-base font-semibold leading-6">
                목록에서 메이트 초대하기
              </div>
              <div className="text-gray-400 text-xs font-normal leading-4">
                기존의 메이트 목록에서 초대할 수 있어요.
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-full h-11 px-5 py-3 bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchSubmit(search);
                    }
                  }}
                  type="text"
                  autoComplete="off"
                  placeholder="함께할 메이트의 이름을 검색해보세요."
                  className="flex-1 bg-transparent outline-none text-sm text-zinc-500 placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(search)}
                  aria-label="검색"
                  className="shrink-0 p-1 rounded-full transition-all duration-150 hover:opacity-80 focus:outline-none"
                >
                  <Image
                    src="/Icons/search.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-60"
                  />
                </button>
              </div>

              {/* 메이트 목록 */}
              <div className="w-full h-[150px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {matesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500">로딩 중...</p>
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500 text-sm">
                        {submittedSearch
                          ? `"${submittedSearch}"에 해당하는 메이트가 없습니다.`
                          : "메이트가 없습니다."}
                      </p>
                    </div>
                  ) : (
                    profiles.map((profile) => {
                      const isActive =
                        activeStatusMap[profile.userId] ??
                        profile.isActive ??
                        false;

                      return (
                        <div
                          key={profile.userId}
                          className="h-16 px-4 py-2 bg-neutral-50 rounded-[10px] flex justify-between items-center"
                        >
                          <div className="flex justify-start items-center gap-2">
                            <ProfileActive
                              src={profile.profileUrl}
                              name={profile.nickname}
                              active={isActive}
                              size="sm"
                            />
                            <div className="flex justify-start items-center">
                              <div className="text-neutral-900 text-base font-semibold leading-6 w-[55px] truncate">
                                {profile.nickname}
                              </div>
                              <div className="w-5 h-px bg-neutral-900 rotate-90" />
                              <div className="text-zinc-500 text-sm font-normal leading-5 truncate w-[160px]">
                                {profile.groupNames &&
                                  profile.groupNames.length > 0
                                  ? profile.groupNames.join(", ")
                                  : "-"}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleInvite(profile.userId)}
                            disabled={invitingUserId === profile.userId}
                            className="w-20 h-7 px-2.5 py-2.5 bg-gray-200 rounded-2xl flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-zinc-500 text-xs font-semibold leading-4">
                              {invitingUserId === profile.userId
                                ? "초대 중..."
                                : "초대하기"}
                            </span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="inline-flex justify-start items-center gap-4">
              <div className="text-neutral-900 text-base font-semibold leading-6">
                링크로 메이트 초대하기
              </div>
              <div className="text-gray-400 text-xs font-normal leading-4">
                링크를 복사해서 공유해 보세요.
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-full h-11 px-5 py-3 bg-white rounded-[100px] border border-gray-200 flex items-center gap-3">
                <div className="flex-1 text-neutral-700 text-base font-normal leading-6 truncate">
                  {inviteUrl || "초대 링크를 생성할 수 없습니다."}
                </div>
                <button
                  onClick={handleCopyLink}
                  aria-label="링크 복사"
                  disabled={!inviteUrl}
                  className="shrink-0 p-1 rounded-full transition-all duration-150 hover:opacity-80 focus:outline-none disabled:opacity-40"
                >
                  <Image
                    src="/Icons/copy.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-60"
                  />
                </button>
              </div>
            </div>
          </div>

          <Button
            className="w-40 h-12 px-6 py-3 bg-red-500 rounded-2xl mx-auto"
            onClick={onClose}
          >
            닫기
          </Button>
        </div>
      </div>
    </>
  );
}
