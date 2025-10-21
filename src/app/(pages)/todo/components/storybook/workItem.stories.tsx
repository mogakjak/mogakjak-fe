import type { Meta, StoryObj, Decorator } from "@storybook/nextjs";
import WorkItem from "@/app/(pages)/todo/components/workItem";

const Wrapper: Decorator = (Story) => (
  <div className="font-sans min-h-[80vh] grid place-items-center bg-gray-50 p-8">
    <div className="space-y-6">
      <Story />
    </div>
  </div>
);

const meta: Meta<typeof WorkItem> = {
  title: "UI/Todo/WorkItem",
  component: WorkItem,
  decorators: [Wrapper],
  tags: ["autodocs"],
  argTypes: {
    date: { control: "text" },
    title: { control: "text" },
    targetSeconds: { control: "number" },
    currentSeconds: { control: "number" },
    completed: { control: "boolean" },
  },
  args: {
    date: "2025.10.14",
    title: "할 일 예시 가나다라마바사",
    targetSeconds: 3 * 60 * 60,
    currentSeconds: 90 * 60,
    completed: false,
  },
};

export default meta;
type Story = StoryObj<typeof WorkItem>;

export const Default: Story = {
  args: {
    completed: false,
    currentSeconds: 100 * 60,
  },
};

export const HalfProgress: Story = {
  args: {
    completed: false,
    currentSeconds: 1.5 * 60 * 60,
  },
};

export const Completed: Story = {
  args: {
    completed: true,
    currentSeconds: 3 * 60 * 60,
  },
};
