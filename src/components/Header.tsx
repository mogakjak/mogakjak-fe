import Image from "next/image";
import HeaderButton from "./HeaderButton";

export default function Header() {
  return (
    <header className="relative w-full flex justify-between px-9 py-4">
      <Image src="/icons/logo.svg" alt="logo" width={105} height={36}></Image>
      <nav className="flex gap-3">
        <HeaderButton text="Home" href="/" />
        <HeaderButton text="TO DO" href="/todo" />
        <HeaderButton text="기록" href="/history" />
        <button className="relative w-10 h-10">
          <Image
            src="/Icons/profile/profile_default.svg"
            alt="프로필"
            fill
            className="object-contain transition-opacity duration-200 opacity-100 hover:opacity-0"
          />
          <Image
            src="/Icons/profile/profile_hover.svg"
            alt="프로필 hover"
            fill
            className="object-contain transition-opacity duration-200 opacity-0 hover:opacity-100"
          />
        </button>
      </nav>
    </header>
  );
});

type PillTabProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

function PillTab({ label, selected, onClick }: PillTabProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-28 h-10 px-7 py-3 rounded-3xl flex justify-center items-center transition-all",
        selected
          ? "bg-red-500 text-white font-semibold"
          : "bg-white text-zinc-600 font-medium  outline-1 outline-gray-200",
      )}
    >
      {label}
    </button>
  );
}
