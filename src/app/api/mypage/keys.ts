export const mypageKeys = {
  all: ["mypage"] as const,
  profile: () => [...mypageKeys.all, "profile"] as const,
  guide: () => [...mypageKeys.all, "guide"] as const,
  basket: () => [...mypageKeys.all, "basket"] as const,
  totalStudyTime: () => [...mypageKeys.all, "totalStudyTime"] as const,
};
