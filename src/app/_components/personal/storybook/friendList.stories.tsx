import type { Meta, StoryObj, Decorator } from "@storybook/nextjs";
import FriendList from "@/app/_components/personal/friendList";

const Wrapper: Decorator = (Story) => (
  <div className="bg-gray-50 min-h-screen flex justify-center items-start p-12">
    <div className="w-[960px]">
      <Story />
    </div>
  </div>
);

const meta: Meta<typeof FriendList> = {
  title: "모각작/FriendList",
  component: FriendList,
  decorators: [Wrapper],
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Base: StoryObj<typeof FriendList> = {
  args: {
    title: "친구들의 집중 현황",
    groupLabel: "그룹이름가나다라",
    friends: [
      { id: "1", name: "김이름", teams: ["팀A", "팀B"], active: true },
      { id: "2", name: "박이름", teams: ["팀A", "팀B"], active: false, lastText: "2일 전" },
      { id: "1", name: "홍이름", teams: ["팀A", "팀B"], active: true },
      { id: "2", name: "진진진", teams: ["팀A", "팀B"], active: false, lastText: "2일 전" },
      { id: "1", name: "백백백", teams: ["팀A", "팀B"], active: true },
      { id: "2", name: "박박박", teams: ["팀A", "팀B"], active: false, lastText: "2일 전" },
    ],
    groupsForPoke: [],
  },
};
