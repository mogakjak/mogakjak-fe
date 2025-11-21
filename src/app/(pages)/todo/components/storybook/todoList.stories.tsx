import type { Meta, StoryObj, Decorator } from "@storybook/nextjs";
import TodayTodoList from "@/app/(pages)/todo/components/todoList";

const Wrapper: Decorator = (Story) => (
  <div className="font-sans min-h-[90vh] grid place-items-center bg-gray-50 p-8">
    <Story />
  </div>
);

const meta: Meta<typeof TodayTodoList> = {
  title: "UI/Todo/TodoList",
  component: TodayTodoList,
  decorators: [Wrapper],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TodayTodoList>;

export const Default: Story = {
  args: {
    dateLabel: "2025.10.14(화)",
    categories: [
      {
        id: 1,
        title: "카테고리 예시 가나다",
        barColorClass: "bg-red-400",
        expanded: true,
        items: [
          {
            date: "2025.10.14",
            title: "할 일 예시 가나다라마바사",
            targetSeconds: 3 * 60 * 60,
            currentSeconds: 90 * 60,
            completed: false,
          },
          {
            date: "2025.10.14",
            title: "할 일 예시 가나다라마바사",
            targetSeconds: 3 * 60 * 60,
            currentSeconds: 3 * 60 * 60,
            completed: true,
          },
        ],
      },
      {
        id: 2,
        title: "카테고리 예시 가나다",
        barColorClass: "bg-orange-300",
        expanded: true,
        items: [
          {
            date: "2025.10.14",
            title: "할 일 예시 가나다라마바사",
            targetSeconds: 3 * 60 * 60,
            currentSeconds: 90 * 60,
            completed: false,
          },
        ],
      },
      {
        id: 3,
        title: "카테고리 예시 가나다",
        barColorClass: "bg-amber-300",
        expanded: false,
        items: [],
      },
      {
        id: 4,
        title: "카테고리 예시 가나다",
        barColorClass: "bg-green-400",
        expanded: false,
        items: [],
      },
    ],
  },
};
