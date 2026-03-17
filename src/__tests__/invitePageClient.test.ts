/**
 * InvitePageClient 핵심 로직 테스트 (extracted pure logic)
 */

import { decideInviteJoinAction } from "../app/_lib/invite/inviteRedirectLogic";

describe("InvitePageClient 핵심 로직 - decideInviteJoinAction", () => {
  const groupId = "group-123";

  it("비로그인 상태 → /login 리다이렉트와 storage 저장이 필요함으로 결정한다", () => {
    const action = decideInviteJoinAction({ groupId, isLoggedIn: false });
    
    expect(action).toEqual({
      type: "REDIRECT",
      path: "/login",
      savePending: true,
    });
  });

  it("로그인 상태 + 에러 없음 → 가입 성공으로 결정한다", () => {
    const action = decideInviteJoinAction({ groupId, isLoggedIn: true });
    
    expect(action).toEqual({
      type: "SUCCESS",
      path: `/group/${groupId}`,
    });
  });

  it("401 에러(권한 없음) → /login 리다이렉트와 storage 저장이 필요함으로 결정한다", () => {
    const error = new Error("401 Unauthorized");
    const action = decideInviteJoinAction({ groupId, isLoggedIn: true, error });
    
    expect(action).toEqual({
      type: "REDIRECT",
      path: "/login",
      savePending: true,
    });
  });

  it("409 에러(이미 참여) → 성공으로 간주하고 해당 그룹방으로 이동 결정한다", () => {
    const error = Object.assign(new Error("Conflict"), { status: 409 });
    const action = decideInviteJoinAction({ groupId, isLoggedIn: true, error });
    
    expect(action).toEqual({
      type: "SUCCESS",
      path: `/group/${groupId}`,
    });
  });

  it("404 에러(찾을 수 없음) → 만료된 그룹 링크 토스트 메시지를 결정한다", () => {
    const error = Object.assign(new Error("Not Found"), { status: 404 });
    const action = decideInviteJoinAction({ groupId, isLoggedIn: true, error });
    
    expect(action).toEqual({
      type: "TOAST",
      message: "만료된 그룹 링크입니다",
    });
  });

  it("기타 일반 에러 → 에러 메시지를 포함한 토스트를 결정한다", () => {
    const error = new Error("Server Error");
    const action = decideInviteJoinAction({ groupId, isLoggedIn: true, error });
    
    expect(action).toEqual({
      type: "TOAST",
      message: "Server Error",
    });
  });
});
