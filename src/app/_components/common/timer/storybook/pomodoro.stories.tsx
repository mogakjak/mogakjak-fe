import type { Meta, StoryObj, Decorator } from "@storybook/nextjs";
import Pomodoro from "@/app/_components/common/timer/pomodoro";

const Wrapper: Decorator = (Story) => (
  <div className="min-h-[90vh] grid place-items-center bg-[--background] p-10">
    <Story />
  </div>
);

const meta = {
  title: "UI/Timer/PomodoroDial",
  component: Pomodoro,
  decorators: [Wrapper],
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    minutes: {
      control: { type: "number", min: 1, max: 120, step: 1 },
      description: "초기 타이머 분 (기본값 60)",
    },
    onComplete: {
      action: "completed",
      description: "타이머 완료 시 호출되는 콜백",
    },
  },
  args: {
    minutes: 60,
  },
} satisfies Meta<typeof Pomodoro>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "기본 60분 타이머",
};

export const ShortTimer: Story = {
  name: "10분 타이머",
  args: { minutes: 10 },
};
export const NoTimer: Story = {
  name: "비활성 타이머",
  args: { minutes: 0 },
};