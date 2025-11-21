import type { Meta, StoryObj } from "@storybook/nextjs";
import { useRef, useState } from "react";
import Stopwatch, {
  StopwatchHandle,
} from "@/app/_components/common/timer/stopwatch";
import TimerButtons from "@/app/_components/common/timer/timerButton";

const meta = {
  title: "UI/Timer/Stopwatch",
  component: Stopwatch,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Stopwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

function StopwatchWrapper() {
  const ref = useRef<StopwatchHandle>(null);
  const [running, setRunning] = useState(false);

  return (
    <div className="w-[920px] p-8 bg-neutral-50 rounded-2xl flex flex-col items-center gap-8">
      <Stopwatch ref={ref} />
      <TimerButtons
        running={running}
        onStart={() => {
          ref.current?.start();
          setRunning(true);
        }}
        onPause={() => {
          ref.current?.pause();
          setRunning(false);
        }}
        onStop={() => {
          ref.current?.stop();
          setRunning(false);
        }}
      />
    </div>
  );
}
export const Default: Story = {
  render: () => <StopwatchWrapper />,
};
