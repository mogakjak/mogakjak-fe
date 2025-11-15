import type { Meta, StoryObj } from "@storybook/nextjs";
import TimerSelected from "@/app/_components/common/timer/timerSelected";

const meta = {
  title: "UI/Timer/TimerSelected",
  component: TimerSelected,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["md", "sm", "custom"],
    },
    value: {
      control: "radio",
      options: ["pomodoro", "stopwatch", "timer"],
    },
    onChange: { action: "onChange" },
  },
} satisfies Meta<typeof TimerSelected>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "timer",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    value: "stopwatch",
    size: "sm",
  },
};

export const Custom: Story = {
  args: {
    value: "stopwatch",
    size: "custom",
  },
};
