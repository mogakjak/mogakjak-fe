import type { Category as ListCategory } from "@/app/_types/category";
import { GroupFriendFieldProps } from "../_components/group/field/groupFriendField";
import type { Friend } from "../_types/friends";
import type { ForkGroup } from "@/app/_components/common/forkPopup";
import { Group } from "../_components/group/baseGroup";
import { Mate } from "../_components/group/newGroup";
//카테고리 목업데이터
export const categoriesData: ListCategory[] = [
  {
    id: 1,
    title: "카테고리 예시 가나다",
    barColorClass: "bg-red-400",
    expanded: true,
    items: [
      {
        date: "2025.10.14",
        title: "할 일 예시 가나다라마바사",
        targetSeconds: 10800,
        currentSeconds: 5400,
        completed: false,
      },
      {
        date: "2025.10.14",
        title: "할 일 예시 가나다라마바사",
        targetSeconds: 10800,
        currentSeconds: 10800,
        completed: true,
      },
    ],
  },
  {
    id: 2,
    title: "카테고리 예시 가나다",
    barColorClass: "bg-orange-300",
    expanded: true,
    items: [
      {
        date: "2025.10.14",
        title: "할 일 예시 가나다라마바사",
        targetSeconds: 10800,
        currentSeconds: 5400,
        completed: false,
      },
    ],
  },
];

//그룹 사용자 목업데이터
export const mockGroupFriends = [
  {
    id: 1,
    status: "active",
    friendName: "가나디",
    level: 1,
    isPublic: true,
    activeTime: 120,
  },
  {
    id: 2,
    status: "rest",
    friendName: "당근이",
    level: 3,
    isPublic: true,
    activeTime: 45,
  },
  {
    id: 3,
    status: "active",
    friendName: "브로콜리",
    level: 6,
    isPublic: false,
    activeTime: 300,
  },
  {
    id: 4,
    status: "end",
    friendName: "양상추",
    level: 3,
    isPublic: true,
    activeTime: 0,
  },
  {
    id: 5,
    status: "rest",
    friendName: "감자",
    level: 3,
    isPublic: true,
    activeTime: 210,
  },
  {
    id: 6,
    status: "active",
    friendName: "옥수수",
    level: 2,
    isPublic: false,
    activeTime: 380,
  },
  {
    id: 7,
    status: "end",
    friendName: "파프리카",
    level: 5,
    isPublic: true,
    activeTime: 0,
  },
  {
    id: 8,
    status: "rest",
    friendName: "바질",
    level: 1,
    isPublic: true,
    activeTime: 90,
  },
] satisfies ({ id: number } & GroupFriendFieldProps)[];

export const mockFriends: Friend[] = [
  {
    id: "1",
    name: "김이름",
    teams: ["팀이름예시1", "팀이름예시2"],
    active: true,
    lastText: "몰입 중",
  },
  {
    id: "2",
    name: "이이름",
    teams: ["팀이름예시1", "팀이름예시2"],
    active: false,
    lastText: "n일 전",
  },
  {
    id: "3",
    name: "박이름",
    teams: ["팀이름예시1", "팀이름예시2"],
    active: false,
    lastText: "n일 전",
  },
] satisfies Friend[];

export const mockForkGroups: ForkGroup[] = [
  {
    id: "1",
    name: "UI디자인 팀",
    members: 5,
    capacity: 7,
    status: "active",
    avatarUrl: "/Icons/group1.svg",
  },
  {
    id: "2",
    name: "React 스터디",
    members: 3,
    capacity: 5,
    status: "inactive",
    avatarUrl: "/Icons/group2.svg",
  },
  {
    id: "3",
    name: "코딩 부트캠프 5기",
    members: 7,
    capacity: 8,
    status: "active",
    avatarUrl: "/Icons/group3.svg",
  },
  {
    id: "4",
    name: "UX리서치 모임",
    members: 2,
    capacity: 6,
    status: "inactive",
    avatarUrl: "/Icons/group4.svg",
  },
] satisfies ForkGroup[];

// 모각작하기 그룹 모달 목업 데이터

export const groups: Group[] = [
  {
    id: "g1",
    name: "네가보내주는고무짜는릴스가좋아",
    status: "active",
    members: 6,
    capacity: 7,
    avatar: "/favicon.svg",
  },
  {
    id: "g2",
    name: "몰딥브 팀",
    status: "active",
    members: 3,
    capacity: 8,
    avatar: "/favicon.svg",
  },
  {
    id: "g3",
    name: "결속밴드 아자자!",
    status: "rest",
    members: 0,
    capacity: 4,
    avatar: "/favicon.svg",
  },
  {
    id: "g4",
    name: "네가보내주는고무짜는릴스가좋아",
    status: "active",
    members: 6,
    capacity: 7,
    avatar: "/favicon.svg",
  },
  {
    id: "g5",
    name: "몰딥브 팀",
    status: "active",
    members: 3,
    capacity: 8,
    avatar: "/favicon.svg",
  },
  {
    id: "g6",
    name: "결속밴드 아자자!",
    status: "rest",
    members: 0,
    capacity: 4,
    avatar: "/favicon.svg",
  },
];

export const mates: Mate[] = [
  {
    id: "u1",
    name: "김이름",
    status: "active",
    teams: ["팀이름예시1", "팀이름예시2"],
    avatar: "/favicon.svg",
  },
  {
    id: "u2",
    name: "박이름",
    status: "inactive",
    teams: [],
    lastSeen: "2일 전",
    avatar: "/favicon.svg",
  },
  {
    id: "u3",
    name: "최이름",
    status: "active",
    teams: [],
    avatar: "/favicon.svg",
  },
  {
    id: "u4",
    name: "이이름",
    status: "inactive",
    teams: [],
    lastSeen: "3일 전",
    avatar: "/favicon.svg",
  },
];
