import type { Meta, StoryObj } from "@storybook/nextjs";
import Timer from "@/app/_components/common/timer/timerComponent";    

const meta = {
  title: "UI/Timer/TimerComponent",
  component: Timer,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Timer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pomodoro: Story = {
  render: () => <Timer initialMode="pomodoro" />,
};

export const Stopwatch: Story = {
  render: () => <Timer initialMode="stopwatch" />,
};

export const TimerComponent: Story = {
  render: () => <Timer initialMode="timer" />,
};
