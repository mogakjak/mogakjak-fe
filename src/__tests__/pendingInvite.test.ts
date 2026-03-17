import {
  setPendingInviteGroupId,
  getPendingInviteGroupId,
  removePendingInviteGroupId,
} from "../app/_lib/pendingInvite";

const PENDING_INVITE_KEY = "mg_invite_groupid";

describe("pendingInvite storage & cookie utilities", () => {
  let mockSessionStorage: Record<string, string> = {};
  let mockLocalStorage: Record<string, string> = {};
  let mockCookie = "";

  beforeEach(() => {
    mockSessionStorage = {};
    mockLocalStorage = {};
    mockCookie = "";

    // sessionStorage Mock
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
      },
      writable: true,
    });

    // localStorage Mock
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });

    // document.cookie Mock
    Object.defineProperty(document, "cookie", {
      get: jest.fn(() => mockCookie),
      set: jest.fn((val: string) => {
        // 간단한 모킹 (만료 설정에 따라 지워지는 로직 시뮬레이션)
        if (val.includes("max-age=0")) {
          mockCookie = mockCookie.replace(new RegExp(`(^| )${PENDING_INVITE_KEY}=[^;]+;?`), "");
        } else {
          mockCookie = val; 
        }
      }),
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("setPendingInviteGroupId", () => {
    it("sessionStorage, localStorage, cookie에 모두 groupId를 저장한다", () => {
      const gId = "group-123";
      setPendingInviteGroupId(gId);

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(PENDING_INVITE_KEY, gId);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(PENDING_INVITE_KEY, gId);
      expect(mockCookie).toContain(`${PENDING_INVITE_KEY}=${gId}`);
    });
  });

  describe("getPendingInviteGroupId", () => {
    it("sessionStorage에 값이 있으면 반환한다", () => {
      mockSessionStorage[PENDING_INVITE_KEY] = "group-456";
      expect(getPendingInviteGroupId()).toBe("group-456");
    });

    it("sessionStorage에 없고 localStorage에 있으면 반환한다", () => {
      mockLocalStorage[PENDING_INVITE_KEY] = "group-789";
      expect(getPendingInviteGroupId()).toBe("group-789");
    });

    it("storage가 둘 다 비어있을 때 쿠키에 값이 있으면 반환한다 (OAuth 콜백 시점)", () => {
      mockCookie = `some_cookie=abc; ${PENDING_INVITE_KEY}=group-from-cookie; other=123`;
      expect(getPendingInviteGroupId()).toBe("group-from-cookie");
    });

    it("아무 곳에도 값이 없으면 null을 반환한다", () => {
      expect(getPendingInviteGroupId()).toBeNull();
    });
  });

  describe("removePendingInviteGroupId", () => {
    it("sessionStorage, localStorage, cookie에서 모두 그룹 ID를 삭제(만료)한다", () => {
      mockSessionStorage[PENDING_INVITE_KEY] = "group-999";
      mockLocalStorage[PENDING_INVITE_KEY] = "group-999";
      mockCookie = `${PENDING_INVITE_KEY}=group-999; path=/`;

      removePendingInviteGroupId();

      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(PENDING_INVITE_KEY);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith(PENDING_INVITE_KEY);
      expect(mockCookie).not.toContain("group-999");
    });
  });
});
