"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PreviewMain from "@/app/_components/home/previewMain";
import RoomMain from "@/app/_components/home/roomMain";
import FriendMain from "@/app/_components/home/friendMain";
import OnboardingCommonModal from "./_components/onboardingCommonModal";
import IntroModal from "./_components/introModal";
import GuideModal from "./_components/guideModal";
import AddWorkForm from "@/app/(pages)/todo/components/addWorkForm";
import { useTodoCategories } from "@/app/_hooks/todoCategory/useTodoCategories";
import type { CategoryColorToken } from "@/app/_types/category";
import type { TodoCategoryColor } from "@/app/_types/todoCategory";
import GroupPage from "@/app/(pages)/group/_components/groupPage";
import RoomModal from "@/app/_components/home/room/roomModal";
import InviteModal from "@/app/_components/home/room/inviteModal";
import { GroupDetail } from "@/app/_types/groups";

const ONBOARDING_KEY = "mg_onboarded_v1";

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
    groupId: "dummy-group",
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
        groupId: "dummy-group",
        goalHours: 2,
        goalMinutes: 0,
    },
    progressRate: 30,
};

export default function OnboardingPage() {
    const router = useRouter();
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);
    const [showAddWorkForm, setShowAddWorkForm] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showGroupCreateModal, setShowGroupCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(true);

    const [currentStep, setCurrentStep] = useState(-1);

    const { data: categories = [] } = useTodoCategories();

    const handleWelcomeModalClose = () => {
        setShowWelcomeModal(false);
        setCurrentStep(0);
    };

    const handleStep0Click = () => {
        setShowAddWorkForm(true);
        setCurrentStep(1);
    };

    const handleAddWorkFormClose = () => {
        setShowAddWorkForm(false);
        setCurrentStep(2);
    };

    const handleStep2Click = () => {
        setShowCompletionModal(true);
        setCurrentStep(3);
    };

    const handleCompletionModalClose = () => {
        setShowCompletionModal(false);
        setCurrentStep(4);
    };

    const handleStep4Click = () => {
        setShowGroupCreateModal(true);
        setCurrentStep(5);
    };

    const handleGroupCreateSuccess = () => {
        setShowGroupCreateModal(false);
        setCurrentStep(6); // Enter Group Room
    };

    const handleStep6Next = () => {
        setCurrentStep(7);
    };

    const handleStep6Prev = () => {
        setCurrentStep(6);
    };

    const handleStep7Next = () => {
        setCurrentStep(8);
    };

    const handleStep7Prev = () => {
        setCurrentStep(6);
    };

    const handleStep8Next = () => {
        setCurrentStep(9);
    };

    const handleStep8Prev = () => {
        setCurrentStep(7);
    };

    const handleStep9Prev = () => {
        setCurrentStep(8);
    };

    const handleStep9Click = () => {
        setShowInviteModal(true);
        setCurrentStep(10);
    };

    const handleInviteModalClose = () => {
        setShowInviteModal(false);
        setShowFinalModal(true);
        setCurrentStep(11);
    };

    const handleFinalModalClose = () => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(ONBOARDING_KEY, "true");
        }
        router.replace("/");
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
            {showWelcomeModal && (
                <OnboardingCommonModal
                    title="반가워요, 김몰입님!"
                    description={
                        "나의 모각작은 함께 몰입하는 시간을 만드는 공간입니다.\n" +
                        "나의 몰입을 시작하고,친구들을 초대해볼까요?"
                    }
                    buttonText="네, 시작할게요!"
                    onClose={handleWelcomeModalClose}
                />
            )}

            {showCompletionModal && (
                <OnboardingCommonModal
                    title="첫 몰입을 시작했어요! 🎉"
                    description={
                        "혼자서도 잘하시네요!\n" +
                        "하지만 함께하면 몰입이 훨씬 쉬워진답니다.\n\n" +
                        "친구들과 함께 경쟁없는 공간에서\n" +
                        "서로 자극을 주고받는 모각작을 경험해볼까요?"
                    }
                    buttonText="네, 시작할게요!"
                    onClose={handleCompletionModalClose}
                />
            )}

            {showFinalModal && (
                <OnboardingCommonModal
                    title="모든 준비가 끝났어요!"
                    description={"이제 친구들이 들어오면 알림으로 알려드릴게요.\n" + "그동안 편안하게 몰입하고 계세요!\n" + " 혹은 홈에서 개인타이머를 하고 있는\n" + "친구에게 “콕 찌르기”로 같이하자고 할 수도 있어요."}
                    buttonText="몰입 시작하기"
                    onClose={handleFinalModalClose}
                />
            )}

            {showAddWorkForm && (
                <div className="fixed inset-0  flex items-center justify-center z-50">
                    <div className="relative">
                        <div className="border-4 border-red-200 rounded-3xl">
                            <AddWorkForm
                                type="select"
                                categories={categoryOptions}
                                onClose={handleAddWorkFormClose}
                                onSubmit={() => {
                                    handleAddWorkFormClose();
                                }}
                            />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-[520px]">
                            <IntroModal
                                title="오늘 집중할 일과 시간을 설정해주세요!"
                                position="right"
                                onClick={() => { }}
                                hideButton={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showGroupCreateModal && (
                <div className="fixed inset-0  flex items-center justify-center z-50">
                    <div className="relative">
                        <div className="border-4 border-red-200 rounded-[24px]">
                            <RoomModal
                                mode="create"
                                onClose={() => setShowGroupCreateModal(false)}
                                onCreateSuccess={handleGroupCreateSuccess}
                            />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-[520px]">
                            <IntroModal
                                title="함께 집중할 그룹을 생성해보세요!"
                                position="right"
                                onClick={() => { }}
                                hideButton={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showInviteModal && (
                <div className="fixed inset-0  flex items-center justify-center z-50">
                    <div className="relative">
                        <div className="border-4 border-red-200 rounded-[24px]">
                            <InviteModal
                                groupId={dummyGroupData.groupId}
                                onClose={handleInviteModalClose}
                            />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-[520px]">
                            <IntroModal
                                title={"이제 마지막 단계예요!\n" + "함께 집중할 메이트들을 초대해보세요!"}
                                position="right"
                                onClick={() => { }}
                                onPrevClick={() => setShowGroupCreateModal(true)}
                                buttonText="완료하기"
                            />
                        </div>
                    </div>
                </div>
            )}

            <main className="w-full max-w-[1440px] mx-auto flex gap-5 overflow-x-hidden pt-9 px-4">
                <div className="self-stretch relative">
                    <div className={`h-full ${currentStep === 0 || currentStep === 2 ? 'border-4 border-red-200' : ''} rounded-[24px] pointer-events-none opacity-90`}>
                        <PreviewMain state={currentStep >= 6} isOnboarding={currentStep === 6} />
                    </div>

                    {!showWelcomeModal && currentStep === 0 && (
                        <IntroModal
                            title="오늘 집중할 일과 시간을 설정해주세요!"
                            position="right"
                            onClick={handleStep0Click}
                        />
                    )}

                    {!showWelcomeModal && currentStep === 2 && (
                        <div className="absolute top-[650px] left-[340px] z-10">
                            <IntroModal
                                title="시간이 쌓일수록 새싹 뽀모도로 쑥쑥 자라난답니다. 타이머를 실행해보세요!"
                                position="right"
                                onClick={handleStep2Click}
                            />
                        </div>
                    )}
                </div>
                <section className="w-full flex-1 flex flex-col gap-5 relative">
                    {currentStep < 6 ? (
                        <div className="flex flex-col gap-5 opacity-90 w-full h-full relative">
                            <RoomMain
                                isPending={false}
                                highlightButton={currentStep === 4}
                                onButtonClick={handleStep4Click}
                                disableInternalModal={true}
                            />
                            {currentStep === 4 && (
                                <div className="absolute top-[55px] right-[240px] z-10">
                                    <IntroModal
                                        title="함께 집중할 그룹을 생성해보세요!"
                                        position="left"
                                        onClick={handleStep4Click}
                                    />
                                </div>
                            )}
                            <FriendMain groups={[]} />
                        </div>
                    ) : (
                        <div className="w-full relative">
                            <GroupPage
                                onExitGroup={() => { }}
                                groupData={dummyGroupData}
                                onboardingStep={currentStep - 6}
                            />

                            {currentStep === 6 && (
                                <div className="absolute top-[320px] -left-[50px] z-10">
                                    <IntroModal
                                        title="그룹방에서는 언제든 비공개모드로 바꿀 수 있으니, 부담없이 함께 몰입해보세요!"
                                        position="right"
                                        onClick={handleStep6Next}
                                        onPrevClick={handleStep6Prev}
                                        buttonText="다음"
                                    />
                                </div>
                            )}

                            {currentStep === 7 && (
                                <div className="absolute top-[270px] left-[50px] z-10">
                                    <IntroModal
                                        title={
                                            "메이트들이 함께 집중하는 시간도 기록할 수 있어요\n" +
                                            "2명 이상일 때부터 시작 가능해요!"
                                        }
                                        position="right"
                                        onClick={handleStep7Next}
                                        onPrevClick={handleStep7Prev}
                                        buttonText="다음"
                                    />
                                </div>
                            )}

                            {currentStep === 8 && (
                                <div className="absolute top-[85px] right-[410px] z-10">
                                    <IntroModal
                                        title={
                                            "우리 그룹의 목표 달성률을 확인하세요\n" +
                                            "모두가 잘 집중하고 있는지 확인하고 싶다면?" +
                                            "[집중 체크 알림]을 보내 환기해 보세요!🔔"
                                        }
                                        position="left"
                                        onClick={handleStep8Next}
                                        onPrevClick={handleStep8Prev}
                                        buttonText="다음"
                                    />
                                </div>
                            )}

                            {currentStep === 9 && (
                                <div className="absolute top-[250px] right-[220px] z-10">
                                    <IntroModal
                                        title={"이제 마지막 단계예요!\n" + " 함께 집중할 메이트들을 초대하고 시작해보세요!"}
                                        position="left"
                                        onClick={handleStep9Click}
                                        onPrevClick={handleStep9Prev}
                                        buttonText="완료하기"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {showGuideModal && (
                <GuideModal
                    currentStep={currentStep + 1}
                    steps={guideSteps}
                />
            )}
        </>
    );
}
