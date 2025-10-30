import type { Meta, StoryObj } from "@storybook/nextjs";
import Timer from "@/app/_components/common/timer/timer";

const meta = {
  title: "UI/Timer/timer",
  component: Timer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    hours: { control: "number" },
    minutes: { control: "number" },
    seconds: { control: "number" },
    autoStart: { control: "boolean" },
  },
  args: {
    hours: 0,
    minutes: 3,
    seconds: 0,
    autoStart: false,
  },
} satisfies Meta<typeof Timer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Running: Story = {
  args: {
    autoStart: true,
  },
};
