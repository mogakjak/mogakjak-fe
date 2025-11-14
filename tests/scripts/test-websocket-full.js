// 웹소켓 연결 테스트 스크립트 (로그인 포함)
/* eslint-disable @typescript-eslint/no-require-imports */
const SockJS = require("sockjs-client");
const Stomp = require("webstomp-client");
const axios = require("axios");

const API_BASE_URL = "http://localhost:8080";

async function testWebSocket() {
  console.log("🔐 1단계: 로그인 시도...\n");

  try {
    // 먼저 회원 목록 확인
    const memberList = await axios.get(`${API_BASE_URL}/member/list`);
    console.log("✅ 회원 목록 조회 성공");
    console.log(`   회원 수: ${memberList.data.length}\n`);

    if (memberList.data.length === 0) {
      console.log("⚠️  테스트할 회원이 없습니다. 회원을 먼저 생성해주세요.");
      return;
    }

    // 첫 번째 회원으로 로그인 시도 (실제 이메일/비밀번호가 필요)
    // 여기서는 테스트용으로 사용자가 제공한 자격증명 사용
    const testEmail = process.env.TEST_EMAIL || "test@test.com";
    const testPassword = process.env.TEST_PASSWORD || "test123";

    console.log(`   로그인 시도: ${testEmail}`);

    let token;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/member/doLogin`, {
        email: testEmail,
        password: testPassword,
      });
      token = loginResponse.data.token;
      console.log("✅ 로그인 성공!\n");
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log(
          "❌ 로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다."
        );
        console.log("   환경 변수로 TEST_EMAIL과 TEST_PASSWORD를 설정하거나");
        console.log("   실제 회원 계정으로 로그인해주세요.\n");
        return;
      }
      throw loginError;
    }

    console.log("🌐 2단계: 웹소켓 연결 시도...\n");

    const sockJs = new SockJS(`${API_BASE_URL}/connect`);
    const stompClient = Stomp.over(sockJs);

    // 디버그 모드 활성화
    stompClient.debug = function (str) {
      if (
        str.includes("CONNECT") ||
        str.includes("ERROR") ||
        str.includes("CONNECTED")
      ) {
        console.log("STOMP:", str);
      }
    };

    return new Promise((resolve, reject) => {
      stompClient.connect(
        {
          Authorization: `Bearer ${token}`,
        },
        (frame) => {
          console.log("✅ 웹소켓 연결 성공!");
          console.log(`   Connected: ${frame.command}\n`);

          // 채팅방 목록 조회
          axios
            .get(`${API_BASE_URL}/chat/room/group/list`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              console.log("📋 3단계: 채팅방 목록 조회...");
              console.log(`   채팅방 수: ${response.data.length}\n`);

              if (response.data.length > 0) {
                const testRoomId = String(response.data[0].roomId);
                console.log(
                  `📡 4단계: Topic 구독 시도 (roomId: ${testRoomId})...`
                );

                stompClient.subscribe(
                  `/topic/${testRoomId}`,
                  (message) => {
                    console.log("\n📨 메시지 수신:");
                    try {
                      const msg = JSON.parse(message.body);
                      console.log(`   발신자: ${msg.senderEmail}`);
                      console.log(`   메시지: ${msg.message}`);
                    } catch {
                      console.log(`   내용: ${message.body}`);
                    }
                  },
                  { Authorization: `Bearer ${token}` }
                );

                console.log("✅ 구독 완료\n");

                // 3초 후 테스트 메시지 전송
                setTimeout(() => {
                  console.log("📤 5단계: 테스트 메시지 전송...");
                  const testMessage = JSON.stringify({
                    senderEmail: testEmail,
                    message: "웹소켓 테스트 메시지",
                  });

                  stompClient.send(`/publish/${testRoomId}`, testMessage);
                  console.log("✅ 메시지 전송 완료\n");
                }, 2000);

                // 5초 후 연결 종료
                setTimeout(() => {
                  console.log("\n🔌 연결 종료 중...");
                  stompClient.disconnect(() => {
                    console.log("✅ 연결 종료 완료");
                    resolve("success");
                  });
                }, 7000);
              } else {
                console.log(
                  "⚠️  채팅방이 없습니다. 채팅방을 먼저 생성해주세요."
                );
                stompClient.disconnect(() => {
                  resolve("no-rooms");
                });
              }
            })
            .catch((err) => {
              console.error("❌ 채팅방 목록 조회 실패:", err.message);
              stompClient.disconnect(() => {
                reject(err);
              });
            });
        },
        (error) => {
          console.error("\n❌ 웹소켓 연결 실패:");
          console.error("   에러:", error);
          reject(error);
        }
      );

      sockJs.onerror = (error) => {
        console.error("\n❌ SockJS 연결 오류:", error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("\n❌ 테스트 실패:");
    if (error.response) {
      console.error(
        `   HTTP ${error.response.status}: ${error.response.statusText}`
      );
      console.error(
        `   메시지: ${error.response.data?.message || error.message}`
      );
    } else {
      console.error("   에러:", error.message);
    }
    throw error;
  }
}

// 테스트 실행
testWebSocket()
  .then(() => {
    console.log("\n✅ 모든 테스트 완료!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 테스트 실패:", error.message);
    process.exit(1);
  });
