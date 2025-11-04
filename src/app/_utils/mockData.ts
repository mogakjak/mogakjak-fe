import type { Category as ListCategory } from "@/app/_types/category";
import { GroupFriendFieldProps } from "../_components/group/field/groupFriendField";

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
  {
    id: 9,
    status: "active",
    friendName: "라디쉬",
    level: 2,
    isPublic: true,
    activeTime: 460,
  },
] satisfies ({ id: number } & GroupFriendFieldProps)[];
