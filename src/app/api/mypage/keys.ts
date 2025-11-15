export const mypageKeys = {
  all: ["mypage"] as const,
  guide: () => [...mypageKeys.all, "guide"] as const,
  basket: () => [...mypageKeys.all, "basket"] as const,
};
