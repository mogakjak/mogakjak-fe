"use client";

import Image from "next/image";
import clsx from "clsx";

export default function PersonalProfile({
  name = "가나디",
  isMe = true,
  characterSrc = "/character/tomato.svg",
  className,
}: {
  name?: string;
  isMe?: boolean;
  characterSrc?: string;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "w-[327px] shrink-0 bg-white rounded-[24px] flex flex-col items-center pt-6 pb-6",
        className,
      )}
      aria-label="개인 프로필"
    >
      <div className="flex justify-center items-center w-full">
        <Image
          src={characterSrc}
          alt="캐릭터"
          width={200}
          height={200}
          priority
          className="w-[200px] h-auto"
        />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <div
          className="w-8 h-8 rounded-full border border-neutral-200"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            backgroundColor: "white",
          }}
        />
        <p className="text-lg font-semibold text-neutral-900 leading-tight">
          {name} {isMe && <span className="text-neutral-800">(나)</span>}
        </p>
      </div>
    </section>
  );
}
