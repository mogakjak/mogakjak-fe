"use client";

import { invalidateTokenCache } from "@/app/api/auth/api";

interface AccountSettingsModalProps {
  onClose: () => void;
  onDeleteAccount: () => void;
}

export default function AccountSettingsModal({
  onClose,
  onDeleteAccount,
}: AccountSettingsModalProps) {
  const handleLogout = async () => {
    onClose();
    try {
      // 토큰 캐시 무효화
      invalidateTokenCache();

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      invalidateTokenCache();
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-80 p-5 bg-neutral-50 rounded-[20px] shadow-[0px_0px_28px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2.5">
      <div className="flex-1 inline-flex flex-col justify-start items-end gap-2">
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch h-6 justify-center text-zinc-600 text-xl font-normal font-['Pretendard'] leading-7">
            <button
              onClick={handleLogout}
              className="w-full text-left hover:text-black transition-colors"
            >
              로그아웃
            </button>
          </div>
          <div className="w-72 h-0 outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
          <div className="self-stretch h-6 justify-center text-zinc-600 text-xl font-normal font-['Pretendard'] leading-7">
            <button
              onClick={onDeleteAccount}
              className="w-full text-left hover:text-black transition-colors"
            >
              계정 탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

