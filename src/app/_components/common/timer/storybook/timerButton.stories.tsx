import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import TimerButtons, { TimerButtonsProps } from "@/app/_components/common/timer/timerButton";

const meta = {
  title: "UI/Timer/TimerButtons",
  component: TimerButtons,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["pomodoro", "stopwatch", "timer"],
    },
    running: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TimerButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

function Wrapper(args: TimerButtonsProps) {
  const [running, setRunning] = useState<boolean>(!!args.running);

  return (
    <div className="w-[920px] max-w-full p-6 bg-neutral-50 rounded-2xl">
      <TimerButtons
        {...args}
        running={running}
        onStart={() => setRunning(true)}
        onPause={() => setRunning(false)}
        onStop={() => setRunning(false)}
      />
    </div>
  );
}

export const Pomodoro_Idle: Story = {
  args: { mode: "pomodoro", running: false },
  render: (args) => <Wrapper {...args} />,
};

export const Pomodoro_Running: Story = {
  args: { mode: "pomodoro", running: true },
  render: (args) => <Wrapper {...args} />,
};

export const Timer_Idle: Story = {
  args: { mode: "timer", running: false },
  render: (args) => <Wrapper {...args} />,
};

export const Timer_Running: Story = {
  args: { mode: "timer", running: true },
  render: (args) => <Wrapper {...args} />,
};
