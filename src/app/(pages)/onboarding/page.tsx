"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import PreviewMain from "@/app/_components/home/previewMain";
import RoomMain from "@/app/_components/home/roomMain";
import FriendMain from "@/app/_components/home/friendMain";
import OnboardingCommonModal from "./_components/onboardingCommonModal";
import IntroModal from "./_components/introModal";
import GuideModal from "./_components/guideModal";
import AddWorkForm from "@/app/(pages)/todo/components/addWorkForm";
import { useTodoCategories } from "@/app/_hooks/todoCategory/useTodoCategories";
import { useProfile } from "@/app/_hooks/mypage/useProfile";
import type { CategoryColorToken } from "@/app/_types/category";
import type { TodoCategoryColor } from "@/app/_types/todoCategory";
import GroupPage from "@/app/(pages)/group/_components/groupPage";
import RoomModal from "@/app/_components/home/room/roomModal";
import InviteModal from "@/app/_components/home/room/inviteModal";
import { GroupDetail } from "@/app/_types/groups";
import { getOnboardingRedirectPath } from "@/app/_lib/invite/inviteRedirectLogic";


// Convert TodoCategoryColor to CategoryColorToken
const colorToToken = (color: TodoCategoryColor): CategoryColorToken => {
    const mapping: Record<TodoCategoryColor, CategoryColorToken> = {
        RED: "category-1-red",
        ORANGE: "category-2-orange",
        YELLOW: "category-3-yellow",
        GREEN: "category-4-green",
        BLUE: "category-6-blue",
        INDIGO: "category-5-skyblue",
        PURPLE: "category-7-purple",
    };
    return mapping[color];
};

const dummyGroupData: GroupDetail = {
    groupId: "1",
    name: "모각작 온보딩 그룹",
    imageUrl: "",
    accumulatedDuration: 0,
    members: [
        {
            userId: "me",
            nickname: "김몰입",
            profileUrl: "",
            level: 1,
        },
        {
            userId: "mate1",
            nickname: "메이트1",
            profileUrl: "",
            level: 2,
        }
    ],
    groupGoal: {
        groupId: "1",
        goalHours: 0,
        goalMinutes: 0,
    },
    progressRate: 0,
};

export default function OnboardingPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // 여러 개 있던 모달 상태를 없애고 currentStep 하나로 모든 흐름을 제어합니다.
    const [currentStep, setCurrentStep] = useState(-1);

    const { data: categories = [] } = useTodoCategories();
    const { data: profile, isLoading: isProfileLoading } = useProfile();

    // --- 공통 다음/이전 단계 함수 ---
    const handleNextStep = () => setCurrentStep((prev) => prev + 1);
    const handlePrevStep = () => setCurrentStep((prev) => prev - 1);
    const goToStep = (step: number) => setCurrentStep(step);

    const handleFinalModalClose = () => {
        const nextPath = getOnboardingRedirectPath();
        
        queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
        router.replace(nextPath);
    };

    const categoryOptions = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        colorToken: colorToToken(cat.color),
    }));

    const guideSteps = [
        "오늘의 할일 설정하기",
        "그룹만들고 초대하기"
    ];

    return (
        <>
            {/* Step -1: 웰컴 모달 */}
            {currentStep === -1 && !isProfileLoading && profile && (
                <OnboardingCommonModal
                    title={`반가워요, ${profile.nickname}님!`}
                    description={
                        "모각작은 함께 몰입하는 시간을 만드는 공간이에요.\n" +
                        "몰입하기에 앞서, 모각작에 대해 간단히 알아볼까요?"
                    }
                    buttonText="네, 시작할게요!"
                    onClose={handleNextStep}
                />
            )}

            {/* Step 10: 최종 완료 모달 (기존 11에서 10으로 당겨짐) */}
            {currentStep === 10 && (
                <OnboardingCommonModal
                    title="모든 준비가 끝났어요!"
                    description={"이제 친구들과 함께 그룹방을 생성하여\n" + "함께 몰입해보세요!\n" + "이미 '모각작'에 들어와있는 친구가 있다면\n" + "“콕 찌르기”를 통해 같이하자고 할 수도 있어요."}
                    buttonText="몰입 시작하기"
                    onClose={handleFinalModalClose}
                />
            )}

            {/* Step 1: 할 일 추가 폼 모달 */}
            {currentStep === 1 && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="relative ">
                        <div className="border-4 border-red-200 rounded-3xl pointer-events-none shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]">
                            <AddWorkForm
                                type="select"
                                isOnboarding
                                categories={categoryOptions}
                                onClose={() => goToStep(0)} // 취소 시 이전 스텝
                                onSubmit={() => goToStep(2)} // 작성 시 다음 스텝
                            />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-[520px]">
                            <IntroModal
                                title="오늘 할 일과 목표 달성 시간을 설정할 수 있어요!"
                                position="right"
                                onClick={handleNextStep}
                                onPrevClick={handlePrevStep}
                                buttonText="다음"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: 그룹 생성 모달 (기존 5에서 4로 당겨짐) */}
            {currentStep === 4 && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="relative">
                        <div className="border-4 border-red-200 rounded-[24px] pointer-events-none shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]">
                            <RoomModal
                                initialName="몰딥브 팀"
                                initialImageUrl="/favicon.svg"
                                mode="create"
                                onClose={() => goToStep(3)}
                                onCreateSuccess={() => goToStep(5)}
                            />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-[520px]">
                            <IntroModal
                                title={"그룹 이미지와 이름을 생성한 후\n함께 집중할 그룹을 생성해 보세요!"}
                                position="right"
                                onClick={handleNextStep}
                                onPrevClick={handlePrevStep}
                                buttonText="다음"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 9: 그룹 초대 모달 (기존 10에서 9로 당겨짐) */}
            {currentStep === 9 && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="relative">
                        <div className="border-4 border-red-200 rounded-[24px] pointer-events-none shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]">
                            <InviteModal
                                groupId={dummyGroupData.groupId}
                                onClose={() => goToStep(10)} // (기존 11 -> 10)
                            />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-[520px]">
                            <IntroModal
                                title={"초대 링크를 복사해서 친구에게 공유해요."}
                                position="right"
                                onClick={handleNextStep}
                                onPrevClick={handlePrevStep}
                                buttonText="완료하기"
                            />
                        </div>
                    </div>
                </div>
            )}

            <main className="w-full max-w-[1440px] mx-auto flex gap-5 overflow-x-hidden pt-9 px-4">
                <div className="self-stretch relative">
                    <div className={`h-full ${currentStep === 0 || currentStep === 2 ? 'border-4 border-red-200 shadow-[0_0_30px_5px_rgba(0,0,0,0.2)]' : ''} rounded-[24px] pointer-events-none opacity-90`}>
                        <PreviewMain state={currentStep >= 5} isOnboarding={currentStep >= 2} currentStep={currentStep} />
                    </div>

                    {/* Step 0: 할 일 추가 인트로 */}
                    {currentStep === 0 && (
                        <IntroModal
                            title={"연필 아이콘을 클릭하여\n 오늘 할 일과 목표 달성 시간을 설정할 수 있어요!"}
                            position="right"
                            onClick={handleNextStep}
                            onPrevClick={handlePrevStep}
                            buttonText="다음"
                        />
                    )}

                    {/* Step 2: 타이머 실행 인트로 */}
                    {currentStep === 2 && (
                        <div className="absolute top-[650px] left-[340px] z-10">
                            <IntroModal
                                title={"원하는 종류의 타이머를 골라 실행할 수 있어요!\n시간이 쌓일수록 새싹 뽀모도 쑥쑥 자라난답니다 🌱"}
                                position="right"
                                onClick={handleNextStep}
                                onPrevClick={handlePrevStep}
                                buttonText="다음"
                            />
                        </div>
                    )}
                </div>

                <section className="w-full flex-1 flex flex-col gap-5 relative">
                    {/* 그룹방 진입 기준이 Step 6 -> Step 5 로 당겨짐 */}
                    {currentStep < 5 ? (
                        <div className="flex flex-col gap-5 w-full h-full relative">
                            <div className="flex flex-col gap-5 pointer-events-none opacity-90">
                                <RoomMain
                                    isPending={false}
                                    highlightButton={currentStep === 3} // (기존 4 -> 3)
                                    onButtonClick={handleNextStep}
                                    disableInternalModal={true}
                                />
                                <FriendMain groups={[]} />
                            </div>

                            {/* Step 3: 그룹 생성 인트로 (기존 4에서 3으로 당겨짐) */}
                            {currentStep === 3 && (
                                <div className="absolute top-[55px] right-[240px] z-10">
                                    <IntroModal
                                        title={"친구들과 함께 집중할 그룹을 생성하거나\n기존에 속해있는 그룹에 참여할 수 있어요."}
                                        position="left"
                                        onClick={handleNextStep}
                                        onPrevClick={handlePrevStep}
                                        buttonText="다음"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full relative">
                            <div className="pointer-events-none opacity-90">
                                <GroupPage
                                    onExitGroup={() => { }}
                                    groupData={dummyGroupData}
                                    onboardingStep={currentStep - 5} // (기존 6 -> 5)
                                />
                            </div>

                            {/* Step 5: 그룹방 인트로 (기존 6에서 5로 당겨짐) */}
                            {currentStep === 5 && (
                                <div className="absolute top-[340px] -left-[50px] z-10">
                                    <IntroModal
                                        title={"설정한 할 일과 목표 달성 시간은 \n그룹방에서는 언제든 비공개모드로 바꿀 수 있어요. \n부담없이 함께 몰입해보세요!"}
                                        position="right"
                                        onClick={handleNextStep}
                                        onPrevClick={handlePrevStep}
                                        buttonText="다음"
                                    />
                                </div>
                            )}

                            {/* Step 6: 시간 기록 인트로 (기존 7에서 6으로 당겨짐) */}
                            {currentStep === 6 && (
                                <div className="absolute top-[310px] left-[50px] z-10">
                                    <IntroModal
                                        title={
                                            "그룹원들이 함께 집중하는 시간을 기록해요.\n" +
                                            "2명 이상일 때부터 시작 가능해요!"
                                        }
                                        position="right"
                                        onClick={handleNextStep}
                                        onPrevClick={handlePrevStep}
                                        buttonText="다음"
                                    />
                                </div>
                            )}

                            {/* Step 7: 목표 달성률 인트로 (기존 8에서 7로 당겨짐) */}
                            {currentStep === 7 && (
                                <div className="absolute top-[300px] right-[390px] z-10">
                                    <IntroModal
                                        title={
                                            "👑 방장에게만 설정 권한이 있어요!\n\n" +
                                            "우리 그룹의 목표 시간을 설정하고,\n" +
                                            "[집중 체크 알림]을 보내 몰입을 환기해 보세요!"
                                        }
                                        position="bottom"
                                        onClick={handleNextStep}
                                        onPrevClick={handlePrevStep}
                                        buttonText="다음"
                                    />
                                </div>
                            )}

                            {/* Step 8: 초대 인트로 (기존 9에서 8로 당겨짐) */}
                            {currentStep === 8 && (
                                <div className="absolute top-[280px] right-[220px] z-10">
                                    <IntroModal
                                        title={"해당 그룹방에서 함께 집중할 그룹원을 초대해요."}
                                        position="left"
                                        onClick={handleNextStep}
                                        onPrevClick={handlePrevStep}
                                        buttonText="다음"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* 기존 10에서 9로 변경 */}
            {currentStep >= 0 && currentStep <= 9 && (
                <GuideModal
                    currentStep={currentStep}
                    steps={guideSteps}
                />
            )}
        </>
    );
}