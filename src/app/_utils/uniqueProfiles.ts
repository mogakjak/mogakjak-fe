import { Mate } from "@/app/_types/groups";

export type UniqueProfile = {
  profile: Mate;
  groupNames: string[];
};

/**
 * 같은 userId를 가진 프로필들을 중복 제거하고, 각 사용자가 속한 그룹 이름들을 수집합니다.
 */
export function getUniqueProfiles(profiles: Mate[]): UniqueProfile[] {
  const map = new Map<string, UniqueProfile>();

  profiles.forEach((profile) => {
    const existing = map.get(profile.userId);

    if (existing) {
      if (
        profile.groupName &&
        !existing.groupNames.includes(profile.groupName)
      ) {
        existing.groupNames.push(profile.groupName);
      }
    } else {
      const initialGroupNames = profile.groupName ? [profile.groupName] : [];
      map.set(profile.userId, {
        profile,
        groupNames: initialGroupNames,
      });
    }
  });

  return Array.from(map.values());
}
