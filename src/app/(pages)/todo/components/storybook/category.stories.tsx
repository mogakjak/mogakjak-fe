import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import CategoryPanel, {
  type DayFilter,
  type Category as CategoryType,
} from "@/app/(pages)/todo/components/category";

const sampleCategories: CategoryType[] = [
  { id: "c1", name: "카테고리 예시 가나다", color: "red-400" },
  { id: "c2", name: "카테고리 예시 가", color: "red-400" },
  { id: "c3", name: "카테고리 예시 가나", color: "red-400" },
  { id: "c4", name: "카테고리 예시 가나다라", color: "red-400" },
  { id: "c5", name: "카테고리 예시 가나다라마", color: "red-400" },
];

const meta = {
  title: "Todo/Category",
  component: CategoryPanel,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    filter: { control: "radio", options: ["today", "all"] },
    selectedId: { control: false },
    onChangeFilter: { control: false },
    onSelect: { control: false },
    onAddCategory: { control: false },
  },
  args: {
    selectedId: "all",
    categories: sampleCategories,
    filter: "today" as DayFilter,
  },
} satisfies Meta<typeof CategoryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [filter, setFilter] = useState<DayFilter>(args.filter ?? "today");
    const [selectedId, setSelectedId] = useState<string>(args.selectedId ?? "all");

    return (
      <CategoryPanel
        {...args}
        filter={filter}
        selectedId={selectedId}
        onChangeFilter={setFilter}
        onSelect={setSelectedId}
        onAddCategory={() => alert("새 카테고리 추가하기")}
      />
    );
  },
};

export const TodayOnly: Story = {
  args: { filter: "today" as DayFilter },
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string>(args.selectedId ?? "all");
    return (
      <CategoryPanel
        {...args}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChangeFilter={() => {}}
        onAddCategory={() => alert("추가")}
      />
    );
  },
};

export const AllTab: Story = {
  args: { filter: "all" as DayFilter },
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string>(args.selectedId ?? "all");
    return (
      <CategoryPanel
        {...args}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChangeFilter={() => {}}
        onAddCategory={() => alert("추가")}
      />
    );
  },
};
