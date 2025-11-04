import type { Meta, StoryObj } from "@storybook/nextjs";
import PersonalData from "@/app/_components/personal/personalData";

const meta: Meta<typeof PersonalData> = {
  title: "모각작/PersonalData",
  component: PersonalData,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    taskName: { control: "text" },
    targetTime: { control: "text" },
    progressPercent: { control: { type: "range", min: 0, max: 100, step: 1 } },
    todayAccumulatedTime: { control: "text" },
    isAccumulating: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PersonalData>;

export const Base: Story = {
  args: {
    title: "할 일",
    taskName: "와이어프레임완료",
    targetTime: 0, 
    progressPercent: 0,
    todayAccumulatedTime: 0,
    isAccumulating: false,
  },
};

export const Accumulating: Story = {
  args: {
    title: "할 일",
    taskName: "와이어프레임완료",
    targetTime: 90 * 60,
    progressPercent: 72,
    todayAccumulatedTime: 3 * 60 * 60 + 12 * 60 + 5,
    isAccumulating: true, 
  },
};
