import type { Meta, StoryObj } from "@storybook/nextjs";
import ForkPopup, { ForkGroup } from "@/app/_components/common/forkPopup";

const meta: Meta<typeof ForkPopup> = {
  title: "모각작/ForkPopup",
  component: ForkPopup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    userName: { control: "text" },
    onJoin: { action: "onJoin" },
  },
};

export default meta;
type Story = StoryObj<typeof ForkPopup>;

const mockGroups: ForkGroup[] = [
  {
    id: "1",
    name: "그룹이름예시",
    members: 5,
    capacity: 7,
    status: "active",
  },
  {
    id: "2",
    name: "그룹이름예시",
    members: 0,
    capacity: 7,
    status: "inactive",
  },
  {
    id: "3",
    name: "그룹이름이라능",
    members: 0,
    capacity: 7,
    status: "inactive",
  },
  {
    id: "4",
    name: "그룹이름진짜",
    members: 0,
    capacity: 7,
    status: "inactive",
  },
  {
    id: "5",
    name: "여기로와",
    members: 0,
    capacity: 7,
    status: "inactive",
  },
];

export const Base: Story = {
  args: {
    userName: "박뽀모",
    groups: mockGroups,
  },
};

