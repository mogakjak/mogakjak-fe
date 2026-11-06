"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { sendGAEvent } from "@next/third-parties/google";
import PreviewMain from "@/app/_components/home/previewMain";
import RoomMain from "@/app/_components/home/roomMain";
import FriendMain from "@/app/_components/home/friendMain";
import OnboardingCommonModal from "./_components/onboardingCommonModal";
import { useProfile } from "@/app/_hooks/mypage/useProfile";
import { getOnboardingRedirectPath } from "@/app/_lib/invite/inviteRedirectLogic";

// 최초 진입 시 웰컴 팝업만 노출합니다. (단계별 투어는 제거)
const WELCOME_STEP = 0;

export default function OnboardingPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const completedRef = useRef(false);

    const { data: profile, isLoading: isProfileLoading } = useProfile();

    useEffect(() => {
        sendGAEvent("event", "onboarding_step", {
            step: WELCOME_STEP,
            action: "view",
        });

        return () => {
            if (!completedRef.current) {
                sendGAEvent("event", "onboarding_step", {
                    step: WELCOME_STEP,
                    action: "close",
                });
            }
        };
    }, []);

    const handleStart = () => {
        sendGAEvent("event", "onboarding_step", {
            step: WELCOME_STEP,
            action: "next",
        });
        completedRef.current = true;
        const nextPath = getOnboardingRedirectPath();

        queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
        router.replace(nextPath);
    };

    return (
        <>
            {!isProfileLoading && profile && (
                <OnboardingCommonModal
                    title={`반가워요, ${profile.nickname}님!`}
                    description={
                        "모각작은 함께 몰입하는 시간을 만드는 공간이에요.\n" +
                        "지금 바로 몰입을 시작해 볼까요?"
                    }
                    buttonText="네, 시작할게요!"
                    onClose={handleStart}
                />
            )}

            <main className="w-full max-w-[1440px] mx-auto flex gap-5 overflow-x-hidden pt-9 px-4 pointer-events-none opacity-90">
                <div className="self-stretch">
                    <PreviewMain state={false} />
                </div>

                <section className="w-full flex-1 flex flex-col gap-5">
                    <RoomMain
                        isPending={false}
                        onButtonClick={() => { }}
                        disableInternalModal={true}
                    />
                    <FriendMain groups={[]} />
                </section>
            </main>
        </>
    );
}
