"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/button";
import AlertModal from "@/app/_components/common/timer/alertModal";
import ToggleButton from "@/app/_components/group/modal/toggleButton";
import PreviewMain from "@/app/_components/home/previewMain";
import { useOfficialLoungeSummary } from "@/app/_hooks/lounge/useOfficialLoungeSummary";
import { useOfficialLoungePresenceSubscription } from "@/app/_hooks/lounge/useOfficialLoungePresenceSubscription";
import { useEnterOfficialLounge } from "@/app/_hooks/lounge/useEnterOfficialLounge";
import { useLeaveOfficialLounge } from "@/app/_hooks/lounge/useLeaveOfficialLounge";
import { useUpdateOfficialLoungeFocusCheck } from "@/app/_hooks/lounge/useUpdateOfficialLoungeFocusCheck";
import { useAuthState } from "@/app/_hooks/login/useAuthState";
import { getUserIdFromToken } from "@/app/_lib/getJwtExp";
import { loungeKeys } from "@/app/api/lounge/keys";
import { groupKeys } from "@/app/api/groups/keys";
import GroupFriendField from "@/app/(pages)/group/_components/field/groupFriendField";
import type { HomeGroupMember } from "@/app/_types/groups";

function toDisplayStatus(member: HomeGroupMember) {
  if (member.participationStatus === "PARTICIPATING") return "active" as const;
  if (member.participationStatus === "RESTING") return "rest" as const;
  return "end" as const;
}

export default function LoungePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const enterMutation = useEnterOfficialLounge();
  const leaveMutation = useLeaveOfficialLounge();
  const focusMutation = useUpdateOfficialLoungeFocusCheck();
  const { token } = useAuthState();
  const enteredFromHome = searchParams.get("entered") === "1";
  const [entered, setEntered] = useState(enteredFromHome);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const hasEnterAttemptedRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const currentUserId = useMemo(() => getUserIdFromToken(token), [token]);

  useOfficialLoungePresenceSubscription({
    enabled: entered,
  });

  const { data: lounge, isLoading } = useOfficialLoungeSummary({
    enabled: entered,
  });

  useEffect(() => {
    if (enteredFromHome) {
      hasEnterAttemptedRef.current = true;
      hasEnteredRef.current = true;
      setEntered(true);
      return;
    }

    if (hasEnterAttemptedRef.current) return;
    hasEnterAttemptedRef.current = true;

    const attemptEnter = async () => {
      try {
        const next = await enterMutation.mutateAsync();
        hasEnteredRef.current = true;
        setEntered(true);
        queryClient.setQueryData(loungeKeys.summary(), next);
        queryClient.invalidateQueries({ queryKey: groupKeys.my() });
        router.replace("/lounge?entered=1");
      } catch (error) {
        const err = error as Error & { status?: number };
        const isFull =
          err.status === 409 ||
          err.message.includes("열기로 가득") ||
          err.message.includes("공식 라운지");

        if (isFull) {
          setBlockedOpen(true);
          return;
        }

        console.error("공식 라운지 입실 실패:", error);
        router.replace("/");
      }
    };

    void attemptEnter();
  }, [enterMutation, enteredFromHome, queryClient, router]);

  useEffect(() => {
    const leaveIfNeeded = () => {
      if (!hasEnteredRef.current) return;
      void leaveMutation
        .mutateAsync()
        .catch((error) => console.error("공식 라운지 퇴실 실패:", error));
      hasEnteredRef.current = false;
    };

    window.addEventListener("pagehide", leaveIfNeeded);
    return () => {
      window.removeEventListener("pagehide", leaveIfNeeded);
    };
  }, [leaveMutation]);

  const displayedMembers = useMemo(() => {
    const members = lounge?.members ?? [];
    if (!currentUserId) return members;
    return [...members].sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return 0;
    });
  }, [currentUserId, lounge?.members]);
  const currentMemberCount = lounge?.currentMemberCount ?? displayedMembers.length;
  const maxMemberCount = lounge?.maxMemberCount ?? 20;
  const hasQuote = Boolean(lounge?.todayQuote?.content);
  const focusEnabled = lounge?.myFocusCheckEnabled ?? false;

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
    } catch (error) {
      console.error("공식 라운지 퇴실 실패:", error);
    } finally {
      hasEnteredRef.current = false;
      setEntered(false);
      router.push("/");
    }
  };

  const handleBlockedClose = () => {
    setBlockedOpen(false);
    router.replace("/");
  };

  const handleFocusToggle = async (nextEnabled: boolean) => {
    try {
      await focusMutation.mutateAsync(nextEnabled);
    } catch (error) {
      console.error("집중 체크 설정 변경 실패:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-6 xl:flex-row">
          <aside className="shrink-0 xl:self-start">
            <PreviewMain state={true} groupId={lounge?.groupId} />
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-6">
            <header className="flex flex-col gap-3 rounded-[28px] border border-red-100 bg-white/90 px-6 py-5 shadow-[0_18px_50px_rgba(255,90,64,0.08)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <Image src="/logo.svg" alt="모각작" width={30} height={30} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-heading3-24SB text-gray-900">
                      모각작 공식 라운지
                    </h1>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-caption-12SB text-red-500">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-body2-14R text-gray-500">
                    오늘도 함께 몰입하는 공용 광장입니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-gray-100 px-4 py-2 text-body2-14SB text-gray-700">
                  {currentMemberCount}/{maxMemberCount} 명 접속 중
                </div>
                <div className="rounded-full bg-red-50 px-4 py-2 text-body2-14SB text-red-500">
                  {focusEnabled ? "집중 체크 ON" : "집중 체크 OFF"}
                </div>
                <div className="rounded-full bg-orange-50 px-4 py-2 text-body2-14SB text-orange-600">
                  {lounge?.hasEntered ? "입실됨" : isLoading ? "불러오는 중" : "입실 중"}
                </div>
              </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                <h2 className="text-heading4-20SB text-gray-900">라운지 현황</h2>
                <div className="mt-5 rounded-[24px] bg-gradient-to-br from-red-500 to-orange-500 px-6 py-8 text-white">
                  <div className="text-heading2-28SB">
                    {currentMemberCount}명 함께 몰입 중
                  </div>
                  <p className="mt-2 text-body2-14R text-white/90">
                    최대 {maxMemberCount}명까지 함께 머물 수 있어요.
                  </p>
                </div>
              </article>

              <article className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                <h2 className="text-heading4-20SB text-gray-900">오늘의 한 마디</h2>
                <div className="mt-5 min-h-[180px] rounded-[24px] bg-gray-50 px-6 py-6 text-gray-700">
                  {hasQuote ? (
                    <>
                      <p className="text-body1-16R leading-7">
                        {lounge?.todayQuote?.content}
                      </p>
                      <p className="mt-4 text-body2-14SB text-gray-500">
                        - {lounge?.todayQuote?.author}
                      </p>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-body2-14R text-gray-400">
                      명언을 불러오는 중이에요.
                    </div>
                  )}
                </div>
              </article>

              <article className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                <h2 className="text-heading4-20SB text-gray-900">집중 체크</h2>
                <p className="mt-2 text-body2-14R text-gray-500">
                  매 시 정각 시스템이 자동으로 체크해요.
                </p>
                <div className="mt-6 rounded-[24px] bg-gray-50 px-6 py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-body1-16SB text-gray-900">
                        시스템이 자동 관리하고 있어요
                      </p>
                      <p className="mt-1 text-body2-14R text-gray-500">
                        정각에 집중 체크 신호를 받습니다.
                      </p>
                    </div>
                    <ToggleButton
                      checked={focusEnabled}
                      onChange={(e) => void handleFocusToggle(e.target.checked)}
                    />
                  </div>
                </div>
              </article>
            </section>

            <section className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-heading4-20SB text-gray-900">멤버 그리드</h2>
                  <p className="mt-1 text-body2-14R text-gray-500">
                    입실한 사람만 보여요. 퇴실하면 바로 사라집니다.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void handleLeave()}
                  disabled={leaveMutation.isPending || enterMutation.isPending}
                  leftIconSrc="/Icons/out.svg"
                >
                  라운지 나가기
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {displayedMembers.map((member) => (
                  <div
                    key={member.userId}
                    className={clsx(
                      member.userId === currentUserId &&
                        "border-4 border-red-200 rounded-[20px] shadow-[0_0_30px_5px_rgba(0,0,0,0.12)]",
                    )}
                  >
                    <GroupFriendField
                      status={toDisplayStatus(member)}
                      friendName={member.nickname}
                      level={member.level}
                      isPublic={true}
                      activeTime={member.personalTimerSeconds ?? undefined}
                      task={member.todoTitle ?? undefined}
                      lastActiveAt={member.lastActiveAt ?? undefined}
                      profileUrl={member.profileUrl}
                      isCurrentUser={member.userId === currentUserId}
                      isHost={false}
                      cheerCount={0}
                      userId={member.userId}
                      showCheerAction={false}
                    />
                  </div>
                ))}

                {Array.from({
                  length: Math.max(0, maxMemberCount - displayedMembers.length),
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className={clsx(
                      "rounded-[24px] border border-dashed border-gray-200 bg-white/70 p-4",
                      index > 7 && "hidden md:block",
                    )}
                  >
                    <div className="flex h-full min-h-[86px] items-center justify-center text-body2-14R text-gray-400">
                      빈자리
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      </div>

      <AlertModal
        isOpen={blockedOpen}
        onClose={handleBlockedClose}
        type="officialLoungeFull"
      />
    </main>
  );
}
