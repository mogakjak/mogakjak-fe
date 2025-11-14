"use client";

import { useRouter } from "next/navigation";
import { useChatRooms } from "../../_api/chat/useChatRooms";
import { useAuthState } from "../../_api/auth/useAuthState";

export default function ChatPage() {
  const router = useRouter();
  const { rooms, loading, error, refetch } = useChatRooms();
  const { isLoggedIn, ready } = useAuthState();

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
          <h1 className="text-heading3-24SB text-black">채팅방 목록</h1>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-body2-14R text-gray-700 transition-colors"
          >
            새로고침
          </button>
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

        {!loading && !error && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-body1-16R text-gray-600 mb-4">
              채팅방이 없습니다.
            </p>
            <p className="text-body2-14R text-gray-500">
              채팅방을 생성하거나 참여해주세요.
            </p>
          </div>
        )}

        {!loading && rooms.length > 0 && (
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.roomId}
                onClick={() => router.push(`/chat/${room.roomId}`)}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-body1-16SB text-black">{room.roomName}</p>
                    <p className="text-body2-14R text-gray-500 mt-1">
                      {room.isGroup ? "그룹 채팅" : "개인 채팅"}
                    </p>
                  </div>
                  {room.unreadCount && room.unreadCount > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

