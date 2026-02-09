"use client";

import { useState } from "react";
import Image from "next/image";
import ProfileEditButton from "./profileEditButton";
import ProfileInfo from "./profileInfo";
import ProfileEditModal from "./profileEditModal";
import AccountSettingsModal from "./accountSettingsModal";
import DeleteAccountModal from "./deleteAccountModal";
import DeleteAccountConfirmModal from "./deleteAccountConfirmModal";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";

import type { CharacterBasket } from "@/app/_types/mypage";

export default function Profile({ basket }: { basket: CharacterBasket }) {
  const {
    nickname,
    email,
    imageUrl,
    totalTaskCount,
    totalFocusTime,
    collectedCharacterCount,
  } = basket;

  const [openEdit, setOpenEdit] = useState(false);
  const [openAccountSettings, setOpenAccountSettings] = useState(false);
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);
  const [openDeleteAccountConfirm, setOpenDeleteAccountConfirm] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState<{
    reasons: string[];
    feedback: string;
  } | null>(null);

  const [profileImage, setProfileImage] = useState<string>(
    imageUrl || "/profileDefault.svg"
  );

  const handleEditOpen = () => setOpenEdit(true);

  const { refs, floatingStyles, context } = useFloating({
    open: openAccountSettings,
    onOpenChange: setOpenAccountSettings,
    placement: "top-end",
    whileElementsMounted: autoUpdate,
    middleware: [offset({ mainAxis: 34, crossAxis: 20 }), flip(), shift()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);


  return (
    <div className="w-[327px] h-full p-6 rounded-[20px] bg-white flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h2 className="text-heading4-20SB text-black">내 프로필</h2>
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          className="text-body2-14R text-gray-500 underline"
        >
          계정설정
        </button>
        {openAccountSettings && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50"
          >
            <AccountSettingsModal
              onClose={() => setOpenAccountSettings(false)}
              onDeleteAccount={() => {
                setOpenAccountSettings(false);
                setOpenDeleteAccount(true);
              }}
            />
          </div>
        )}
      </div>

      <section className="flex flex-col items-center mb-12">
        <div className="w-[130px] h-[130px] border-2 border-gray-300 rounded-full overflow-hidden mt-4 relative">
          <Image
            src={profileImage}
            alt="프로필"
            width={130}
            height={130}
            className="rounded-full object-cover"
            style={{ aspectRatio: "1 / 1" }}
            onError={() => setProfileImage("/profile.svg")}
          />
        </div>
        <div className="flex flex-col gap-1 text-center mt-5 mb-6">
          <p className="text-heading3-24SB text-black max-w-[150px] truncate">
            {nickname}
          </p>
          <p className="text-body1-16R text-gray-500">{email}</p>
        </div>
        <ProfileEditButton openEdit={handleEditOpen} />
      </section>

      <section className="flex flex-col gap-3">
        <ProfileInfo title="완료한 작업" content={`${totalTaskCount}개`} />
        <ProfileInfo title="완료한 시간" content={`${totalFocusTime}`} />
        <ProfileInfo
          title="수집 캐릭터"
          content={`${collectedCharacterCount}개`}
        />
      </section>

      {openEdit && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpenEdit(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ProfileEditModal
              onClose={() => setOpenEdit(false)}
              initialNickname={nickname}
              initialEmail={email}
              initialImageUrl={profileImage}
            />
          </div>
        </div>
      )}

      {openDeleteAccount && (
        <DeleteAccountModal
          nickname={nickname}
          onClose={() => setOpenDeleteAccount(false)}
          onNext={(reasons, feedback) => {
            setDeleteAccountData({ reasons, feedback });
            setOpenDeleteAccount(false);
            setOpenDeleteAccountConfirm(true);
          }}
        />
      )}

      {openDeleteAccountConfirm && (
        <DeleteAccountConfirmModal
          nickname={nickname}
          onClose={() => {
            setOpenDeleteAccountConfirm(false);
            setDeleteAccountData(null);
          }}
          onConfirm={() => {
            // TODO: 계정 탈퇴 API 호출 (deleteAccountData.reasons, deleteAccountData.feedback 포함)
            if (deleteAccountData) {
              console.log("탈퇴 이유:", deleteAccountData.reasons);
              console.log("피드백:", deleteAccountData.feedback);
            }
            setOpenDeleteAccountConfirm(false);
            setDeleteAccountData(null);
          }}
        />
      )}
    </div>
  );
}
