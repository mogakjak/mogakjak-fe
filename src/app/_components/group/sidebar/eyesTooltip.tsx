"use client";

import * as Tooltip from "@radix-ui/react-tooltip";

interface EyesTooltipProps {
  text: string;
  children: React.ReactNode;
}

export default function EyesTooltip({ text, children }: EyesTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Content
          side="bottom"
          sideOffset={8}
          className=" py-1.5 w-[70px] text-center rounded-[13px] text-body1-16B bg-[#D9D9D9] text-[#161B22] shadow"
        >
          {text}
          <Tooltip.Arrow className="fill-[#D9D9D9]" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
