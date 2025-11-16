import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import TimerButtons, {
  TimerButtonsProps,
} from "@/app/_components/common/timer/timerButton";

const meta = {
  title: "UI/Timer/TimerButtons",
  component: TimerButtons,
  parameters: {
    layout: "centered",
  },
  argTypes: {
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

export const Idle: Story = {
  args: { running: false },
  render: (args) => <Wrapper {...args} />,
};

export const Running: Story = {
  args: { running: true },
  render: (args) => <Wrapper {...args} />,
};
