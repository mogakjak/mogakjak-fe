import {
  getMyGroupFocusCheck,
  putGroupNoti,
  putMyGroupFocusCheck,
} from "@/app/api/groups/api";

describe("group focus check API", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it("개인 수신 설정을 notifications/me에서 조회한다", async () => {
    fetchMock.mockResolvedValue(response({
      groupId: "group-1",
      myFocusCheckEnabled: true,
    }));

    await getMyGroupFocusCheck("group-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/groups/group-1/notifications/me",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("개인 수신 여부만 변경한다", async () => {
    fetchMock.mockResolvedValue(response({
      groupId: "group-1",
      myFocusCheckEnabled: false,
    }));

    await putMyGroupFocusCheck("group-1", { enabled: false });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/groups/group-1/notifications/me",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ enabled: false }),
      }),
    );
  });

  it("방장 설정에서는 알림 주기만 변경한다", async () => {
    fetchMock.mockResolvedValue(response({
      groupId: "group-1",
      groupName: "study",
      isNotificationAgreed: true,
      notificationCycle: 3,
      notificationMessage: "집중 체크",
    }));

    await putGroupNoti("group-1", { notificationCycle: 3 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/groups/group-1/notifications",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ notificationCycle: 3 }),
      }),
    );
  });
});

function response(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ statusCode: 200, message: "OK", data }),
  } as Response;
}
