import type { Meta, StoryObj } from "@storybook/nextjs";
import GroupModal from "@/app/_components/group/groupModal";
import type { Group } from "@/app/_components/group/baseGroup";
import type { Mate } from "@/app/_components/group/newGroup";

const groups: Group[] = [
  {
    id: "g1",
    name: "네가보내주는고무짜는릴스가좋아",
    status: "active",
    members: 6,
    capacity: 7,
    avatar: "https://placehold.co/56x56?text=A",
  },
  {
    id: "g2",
    name: "몰딥브 팀",
    status: "active",
    members: 3,
    capacity: 8,
    avatar: "https://placehold.co/56x56?text=B",
  },
  {
    id: "g3",
    name: "결속밴드 아자자!",
    status: "rest",
    members: 0,
    capacity: 4,
    avatar: "https://placehold.co/56x56?text=C",
  },
  {
    id: "g4",
    name: "네가보내주는고무짜는릴스가좋아",
    status: "active",
    members: 6,
    capacity: 7,
    avatar: "https://placehold.co/56x56?text=A",
  },
  {
    id: "g5",
    name: "몰딥브 팀",
    status: "active",
    members: 3,
    capacity: 8,
    avatar: "https://placehold.co/56x56?text=B",
  },
  {
    id: "g6",
    name: "결속밴드 아자자!",
    status: "rest",
    members: 0,
    capacity: 4,
    avatar: "https://placehold.co/56x56?text=C",
  },
];

const mates: Mate[] = [
  {
    id: "u1",
    name: "김이름",
    status: "active",
    teams: ["팀이름예시1", "팀이름예시2"],
    avatar: "https://placehold.co/48x48?text=K1",
  },
  {
    id: "u2",
    name: "박이름",
    status: "inactive",
    teams: [],
    lastSeen: "2일 전",
    avatar: "https://placehold.co/48x48?text=P2",
  },
  {
    id: "u3",
    name: "최이름",
    status: "active",
    teams: [],
    avatar: "https://placehold.co/48x48?text=C3",
  },
  {
    id: "u4",
    name: "이이름",
    status: "inactive",
    teams: [],
    lastSeen: "3일 전",
    avatar: "https://placehold.co/48x48?text=E4",
  },
];

const meta: Meta<typeof GroupModal> = {
  title: "Groups/GroupModal",
  component: GroupModal,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  args: {
    open: true,
    findTabGroups: groups,
    mates,
  },
};

export default meta;

type Story = StoryObj<typeof GroupModal>;

export const BaseTab: Story = {
  args: {
    initialTab: "find",
  },
};

export const NewTab: Story = {
  args: {
    initialTab: "create",
  },
};

export const LongLists: Story = {
  args: {
    initialTab: "find",
    findTabGroups: Array.from({ length: 10 }).map((_, i) => ({
      id: `gx-${i}`,
      name: `테스트 그룹 ${i + 1}`,
      status: i % 2 === 0 ? "active" : "rest",
      members: (i % 7) + 1,
      capacity: 8,
      avatar: `https://placehold.co/56x56?text=${i + 1}`,
    })),
    mates: Array.from({ length: 15 }).map((_, i) => ({
      id: `ux-${i}`,
      name: `사용자 ${i + 1}`,
      status: i % 2 === 0 ? "active" : "inactive",
      teams: ["프로젝트A"],
      avatar: `https://placehold.co/48x48?text=${i + 1}`,
    })),
  },
};
