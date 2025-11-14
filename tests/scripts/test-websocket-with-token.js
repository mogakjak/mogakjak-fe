// 웹소켓 연결 테스트 스크립트 (제공된 토큰 사용)
/* eslint-disable @typescript-eslint/no-require-imports */
const SockJS = require("sockjs-client");
const Stomp = require("webstomp-client");
const axios = require("axios");

// 환경 변수로 API 주소 설정 가능 (기본값: localhost:8080)
// 프로덕션 테스트: API_BASE_URL=https://mogakjak.site node tests/scripts/test-websocket-with-token.js
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

console.log(`🌐 API Base URL: ${API_BASE_URL}`);

// 제공된 액세스 토큰
const accessToken =
  "eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoi7Jqw7J2A7KeEIiwidHlwIjoiYWNjZXNzIiwidXNlcklkIjoiN2YwMDAwMDEtOTlkZi0xZTU1LTgxOTktZGYzMDViYzcwMDAwIiwiZW1haWwiOiJlc3RoZXIwOTA0QG5hdmVyLmNvbSIsInN1YiI6ImVzdGhlcjA5MDRAbmF2ZXIuY29tIiwiaXNzIjoibW9nYWtqYWsiLCJpYXQiOjE3NjMxMTQwMzYsImV4cCI6MTc2NjcxNDAzNn0.BH_PZ5a7OR5XecPhtzVaS1L-2q-KNTfvDpsDLC51Bco";

const email = "esther0904@naver.com";

async function testWebSocket(roomIdOverride) {
  console.log("🌐 웹소켓 연결 테스트 시작...\n");

  try {
    let testRoomId = roomIdOverride;

    // roomId가 제공되지 않으면 채팅방 목록 조회
    if (!testRoomId) {
      console.log("📋 1단계: 채팅방 목록 조회...");
      const chatRoomsResponse = await axios.get(
        `${API_BASE_URL}/chat/room/group/list`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log(`   ✅ 채팅방 목록 조회 성공`);
      console.log(`   채팅방 수: ${chatRoomsResponse.data.length}\n`);

      if (chatRoomsResponse.data.length === 0) {
        console.log("⚠️  채팅방이 없습니다.");
        console.log("   채팅방을 생성하거나, 내 채팅방 목록을 확인합니다...\n");

        // 내 채팅방 목록 확인
        const myRoomsResponse = await axios.get(`${API_BASE_URL}/chat/my/rooms`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(`   내 채팅방 수: ${myRoomsResponse.data.length}\n`);

        if (myRoomsResponse.data.length === 0) {
          console.log("⚠️  테스트할 채팅방이 없습니다.");
          console.log("   채팅방이 없어도 웹소켓 연결만 테스트합니다...\n");
          testRoomId = "test-room-id";
        } else {
          // 내 채팅방 중 하나 사용
          testRoomId = String(myRoomsResponse.data[0].roomId);
        }
      } else {
        // 첫 번째 채팅방으로 테스트
        testRoomId = String(chatRoomsResponse.data[0].roomId);
      }
    }

    console.log(`📡 2단계: 웹소켓 연결 테스트 (roomId: ${testRoomId})...\n`);

    testWebSocketConnection(testRoomId);
  } catch (error) {
    console.error("\n❌ API 호출 실패:");
    if (error.response) {
      console.error(
        `   HTTP ${error.response.status}: ${error.response.statusText}`
      );
      console.error(`   메시지: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error("   에러:", error.message);
    }

    // API 호출이 실패해도 웹소켓 연결은 테스트할 수 있음
    console.log("\n   API 호출 실패했지만, 웹소켓 연결만 테스트합니다...\n");
    testWebSocketConnection("test-room-id");
  }
}

function testWebSocketConnection(roomId) {
  console.log("🌐 SockJS 연결 시도 중...");

  const sockJs = new SockJS(`${API_BASE_URL}/connect`);
  const stompClient = Stomp.over(sockJs);

  // 디버그 모드 활성화 (중요한 메시지만 표시)
  stompClient.debug = function (str) {
    if (
      str.includes("CONNECT") ||
      str.includes("CONNECTED") ||
      str.includes("SUBSCRIBE") ||
      str.includes("SEND") ||
      str.includes("ERROR") ||
      str.includes("DISCONNECT")
    ) {
      console.log("   STOMP:", str.replace(/\n/g, " "));
    }
  };

  sockJs.onerror = (error) => {
    console.error("\n❌ SockJS 연결 오류:", error);
  };

  sockJs.onclose = (event) => {
    console.log("\n🔌 SockJS 연결 종료:", event.code, event.reason || "");
  };

  stompClient.connect(
    {
      Authorization: `Bearer ${accessToken}`,
    },
    (frame) => {
      console.log("\n✅ 웹소켓 연결 성공!");
      console.log(`   STOMP 버전: ${frame.headers.version || "N/A"}`);
      console.log(`   서버: ${frame.headers.server || "N/A"}\n`);

      // Topic 구독
      console.log(`📡 Topic 구독 시도: /topic/${roomId}`);

      const subscription = stompClient.subscribe(
        `/topic/${roomId}`,
        (message) => {
          console.log("\n📨 메시지 수신:");
          try {
            const msg = JSON.parse(message.body);
            console.log(`   발신자: ${msg.senderEmail || "N/A"}`);
            console.log(`   메시지: ${msg.message || message.body}`);
          } catch {
            console.log(`   내용: ${message.body}`);
          }
        },
        { Authorization: `Bearer ${accessToken}` }
      );

      console.log("✅ 구독 완료\n");

      // 3초 후 테스트 메시지 전송
      setTimeout(() => {
        console.log("📤 테스트 메시지 전송 시도...");
        const testMessage = JSON.stringify({
          senderEmail: email,
          message: "웹소켓 연결 테스트 메시지",
        });

        try {
          stompClient.send(`/publish/${roomId}`, testMessage);
          console.log(`   메시지 전송: ${testMessage}`);
          console.log("✅ 메시지 전송 완료\n");
        } catch (sendError) {
          console.error("❌ 메시지 전송 실패:", sendError.message);
        }
      }, 2000);

      // 8초 후 연결 종료
      setTimeout(() => {
        console.log("\n🔌 연결 종료 중...");
        if (subscription) {
          subscription.unsubscribe();
        }
        stompClient.disconnect(() => {
          console.log("✅ 연결 종료 완료\n");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("✅ 웹소켓 연결 테스트 완료!");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
          process.exit(0);
        });
      }, 8000);
    },
    (error) => {
      console.error("\n❌ 웹소켓 연결 실패:");
      console.error("   에러:", error);

      if (error.headers) {
        console.error("   헤더:", JSON.stringify(error.headers));
      }
      if (error.body) {
        console.error("   본문:", error.body);
      }

      process.exit(1);
    }
  );
}

// 테스트 실행
// 환경 변수로 roomId 지정 가능: ROOM_ID=xxx node tests/scripts/test-websocket-with-token.js
const roomIdFromEnv = process.env.ROOM_ID;
testWebSocket(roomIdFromEnv);
