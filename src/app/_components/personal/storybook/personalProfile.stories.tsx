import type { Meta, StoryObj } from "@storybook/nextjs";
import PersonalProfile from "@/app/_components/personal/personalProfile";

const meta: Meta<typeof PersonalProfile> = {
  title: "모각작/PersonalProfile",
  component: PersonalProfile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text", description: "사용자 이름" },
    characterSrc: { control: "text", description: "캐릭터 이미지 경로" },
  },
};

export default meta;
type Story = StoryObj<typeof PersonalProfile>;

export const Base: Story = {
  args: {
    name: "가나디",
    characterSrc: "/character/tomato.svg",
  },
};
