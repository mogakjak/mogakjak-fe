// 특정 사용자와의 채팅방 테스트 스크립트
/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

// 제공된 액세스 토큰
const accessToken =
  "eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoi7Jqw7J2A7KeEIiwidHlwIjoiYWNjZXNzIiwidXNlcklkIjoiN2YwMDAwMDEtOTlkZi0xZTU1LTgxOTktZGYzMDViYzcwMDAwIiwiZW1haWwiOiJlc3RoZXIwOTA0QG5hdmVyLmNvbSIsInN1YiI6ImVzdGhlcjA5MDRAbmF2ZXIuY29tIiwiaXNzIjoibW9nYWtqYWsiLCJpYXQiOjE3NjMxMTQwMzYsImV4cCI6MTc2NjcxNDAzNn0.BH_PZ5a7OR5XecPhtzVaS1L-2q-KNTfvDpsDLC51Bco";

// 상대방 UUID (환경 변수로 지정 가능)
// 예: TARGET_USER_ID=7f000001-99df-1528-8199-df35e8f00000 API_BASE_URL=https://mogakjak.site node tests/scripts/test-chat-with-user.js
const targetUserId = process.env.TARGET_USER_ID || "7f000001-99df-1528-8199-df35e8f00000";

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`👤 상대방 UUID: ${targetUserId}\n`);

async function findOrCreateChatRoom() {
  try {
    console.log("📋 1단계: 내 채팅방 목록 조회...");
    const myRoomsResponse = await axios.get(`${API_BASE_URL}/chat/my/rooms`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ 채팅방 목록 조회 성공`);
    console.log(`   채팅방 수: ${myRoomsResponse.data.length}\n`);

    // 상대방과의 채팅방 찾기
    const existingRoom = myRoomsResponse.data.find((room) => {
      // 채팅방에 상대방이 포함되어 있는지 확인
      // (실제 응답 구조에 따라 수정 필요)
      return room.participants?.some(
        (p) => p.userId === targetUserId || p.id === targetUserId
      );
    });

    if (existingRoom) {
      console.log(`✅ 기존 채팅방 발견!`);
      console.log(`   채팅방 ID: ${existingRoom.roomId}`);
      console.log(`   채팅방 이름: ${existingRoom.roomName || "이름 없음"}\n`);
      return existingRoom.roomId;
    }

    console.log("⚠️  기존 채팅방이 없습니다.");
    console.log("   채팅방 생성 시도...\n");

    // 1:1 채팅방 생성 시도
    // 백엔드 API: POST /chat/room/private/create?otherMemberId={uuid}
    try {
      const createResponse = await axios.post(
        `${API_BASE_URL}/chat/room/private/create?otherMemberId=${targetUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // 응답이 UUID 문자열일 수 있음
      const roomId = createResponse.data?.roomId || createResponse.data || createResponse.data?.data;
      console.log(`✅ 개인 채팅방 생성 성공!`);
      console.log(`   채팅방 ID: ${roomId}\n`);
      return String(roomId);
    } catch (createError) {
      if (createError.response?.status === 404) {
        console.log("⚠️  1:1 채팅방 생성 API가 없습니다.");
        console.log("   다른 방법을 시도합니다...\n");

        // 그룹 채팅방 생성 후 상대방 초대
        try {
          const groupResponse = await axios.post(
            `${API_BASE_URL}/chat/room/group/create?roomName=테스트채팅`,
            {},
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const roomId = groupResponse.data.roomId;
          console.log(`✅ 그룹 채팅방 생성 성공!`);
          console.log(`   채팅방 ID: ${roomId}\n`);

          // 상대방 초대 시도
          try {
            await axios.post(
              `${API_BASE_URL}/chat/room/group/${roomId}/invite`,
              {
                userId: targetUserId,
              },
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            console.log(`✅ 상대방 초대 성공!\n`);
          } catch (inviteError) {
            console.log(
              `⚠️  상대방 초대 실패 (이미 참여 중일 수 있음): ${inviteError.message}\n`
            );
          }

          return roomId;
        } catch (groupError) {
          console.error("❌ 그룹 채팅방 생성 실패:", groupError.message);
          throw groupError;
        }
      } else {
        throw createError;
      }
    }
  } catch (error) {
    console.error("❌ 채팅방 조회/생성 실패:");
    if (error.response) {
      console.error(`   HTTP ${error.response.status}: ${error.response.statusText}`);
      console.error(`   메시지: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   에러: ${error.message}`);
    }
    throw error;
  }
}

async function testChat() {
  try {
    const roomId = await findOrCreateChatRoom();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ 채팅방 준비 완료!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(`📱 프론트엔드에서 채팅 테스트:`);
    console.log(`   URL: http://localhost:3000/chat/${roomId}\n`);
    console.log(`🔧 또는 WebSocket 테스트 스크립트 사용:`);
    console.log(
      `   ROOM_ID=${roomId} node tests/scripts/test-websocket-with-token.js\n`
    );
  } catch (error) {
    console.error("\n❌ 테스트 실패:", error.message);
    process.exit(1);
  }
}

testChat();

