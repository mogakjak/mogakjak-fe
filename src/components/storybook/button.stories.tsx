import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@/components/button";

const meta = {
  title: "Common/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "brick",
        "salmon",
        "slate700",
        "neutral700",
        "slate600",
        "muted",
      ],
    },
    size: { control: "radio", options: ["md", "sm"] },
    block: { control: "boolean" },
    leftIcon: { control: "radio", options: ["plus", null] },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "buttonabcdef",
    variant: "primary",
    size: "md",
    block: false,
    leftIcon: "plus",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Brick: Story = { args: { variant: "brick" } };
export const Salmon: Story = { args: { variant: "salmon" } };
export const Slate700: Story = { args: { variant: "slate700" } };
export const Neutral700: Story = { args: { variant: "neutral700" } };
export const Slate600: Story = { args: { variant: "slate600" } };
export const Muted: Story = { args: { variant: "muted" } };
export const Small: Story = { args: { size: "sm" } };
export const Block: Story = { args: { block: true } };
