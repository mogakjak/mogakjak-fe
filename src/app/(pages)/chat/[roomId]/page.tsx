"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatSocket, ChatMessage } from "../../../_api/chat/useChatSocket";
import { useAuthState } from "../../../_api/auth/useAuthState";

interface ChatRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const { token, isLoggedIn, ready } = useAuthState();
  const [userEmail, setUserEmail] = useState<string>("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const { isConnected, isConnecting, messages, error, sendMessage } =
    useChatSocket(roomId, hasJoined);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // JWT 토큰에서 이메일 추출
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserEmail(payload.sub || payload.email || "");
      } catch {
        setUserEmail("");
      }
    }
  }, [token]);

  // 채팅방 참여
  useEffect(() => {
    const joinRoom = async () => {
      if (!ready || !isLoggedIn || hasJoined || joining) {
        return;
      }

      setJoining(true);
      try {
        const response = await fetch(`/api/chat/rooms/${roomId}/join`, {
          method: "POST",
        });

        if (response.ok) {
          console.log("✅ 채팅방 참여 성공");
          setHasJoined(true);
        } else {
          const errorData = await response.json();
          console.warn("⚠️ 채팅방 참여 실패 (이미 참여 중일 수 있음):", errorData);
          // 이미 참여 중이면 에러 무시
          setHasJoined(true);
        }
      } catch (err) {
        console.error("❌ 채팅방 참여 오류:", err);
        // 에러가 있어도 계속 진행 (이미 참여 중일 수 있음)
        setHasJoined(true);
      } finally {
        setJoining(false);
      }
    };

    joinRoom();
  }, [ready, isLoggedIn, roomId, hasJoined, joining]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    if (!isConnected) {
      alert("WebSocket에 연결되지 않았습니다.");
      return;
    }

    const senderEmail = userEmail || "unknown@example.com";
    sendMessage(inputMessage.trim(), senderEmail);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-[1440px] min-h-screen py-9 mx-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-[20px] shadow-sm flex flex-col h-[calc(100vh-72px)]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/chat")}
              className="px-3 py-1 text-body2-14R text-gray-600 hover:text-gray-900"
            >
              ← 뒤로
            </button>
            <h2 className="text-heading4-20SB text-black">
              채팅방 {roomId.substring(0, 8)}...
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected
                  ? "bg-green-500"
                  : isConnecting
                  ? "bg-orange-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="text-body2-14R text-gray-600">
              {isConnected
                ? "연결됨"
                : isConnecting
                ? "연결 중..."
                : "연결 안 됨"}
            </span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-body2-14R text-red-600">{error}</p>
            {error.includes("권한") && (
              <p className="text-body2-14R text-red-500 mt-2">
                채팅방에 참여 중입니다. 잠시 후 다시 시도해주세요.
              </p>
            )}
          </div>
        )}

        {/* 참여 중 표시 */}
        {joining && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-body2-14R text-blue-600">
              채팅방 참여 중...
            </p>
          </div>
        )}

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-body1-16R text-gray-500">
                메시지가 없습니다. 메시지를 보내보세요!
              </p>
            </div>
          )}

          {messages.map((msg: ChatMessage, index: number) => {
            const isMyMessage = msg.senderEmail === userEmail;
            return (
              <div
                key={index}
                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isMyMessage
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs mb-1 opacity-70">{msg.senderEmail}</p>
                  )}
                  <p className="text-body2-14R whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                  {msg.timestamp && (
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected
                  ? "메시지를 입력하세요..."
                  : "연결 중입니다..."
              }
              disabled={!isConnected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!isConnected || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

