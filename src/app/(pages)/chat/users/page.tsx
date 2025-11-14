"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers, User } from "../../../_api/users/useUsers";
import { useCreatePrivateRoom } from "../../../_api/chat/useCreatePrivateRoom";
import { useAuthState } from "../../../_api/auth/useAuthState";

export default function ChatUsersPage() {
  const router = useRouter();
  const { users, loading, error, refetch } = useUsers();
  const { createPrivateRoom, loading: creatingRoom } = useCreatePrivateRoom();
  const { isLoggedIn, ready } = useAuthState();
  const [creatingUserId, setCreatingUserId] = useState<string | null>(null);

  const handleStartChat = async (user: User) => {
    if (creatingRoom || creatingUserId) return;

    setCreatingUserId(user.id);
    try {
      const roomId = await createPrivateRoom(user.id);
      if (roomId) {
        console.log(`✅ 채팅방 생성 성공: ${roomId}`);
        router.push(`/chat/${roomId}`);
      } else {
        alert("채팅방 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("채팅방 생성 오류:", err);
      alert("채팅방 생성에 실패했습니다.");
    } finally {
      setCreatingUserId(null);
    }
  };

  if (!ready) {
    return (
      <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex justify-center items-center">
        <p className="text-body1-16R text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex justify-center items-center">
        <p className="text-body1-16R text-red-600">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto">
      <div className="max-w-2xl mx-auto bg-white rounded-[20px] shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-heading3-24SB text-black">사용자 목록</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/chat")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-body2-14R text-gray-700 transition-colors"
            >
              채팅방 목록
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-body2-14R text-gray-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-body1-16R text-gray-600">로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-body2-14R text-red-600">오류: {error}</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-body1-16R text-gray-600 mb-4">
              사용자가 없습니다.
            </p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="text-body1-16SB text-black">{user.name}</p>
                  <p className="text-body2-14R text-gray-500 mt-1">
                    {user.email}
                  </p>
                  <p className="text-body2-12R text-gray-400 mt-1">
                    ID: {user.id.substring(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={() => handleStartChat(user)}
                  disabled={creatingRoom || creatingUserId === user.id}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingUserId === user.id ? "생성 중..." : "채팅하기"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

