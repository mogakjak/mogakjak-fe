import Image from "next/image";
import HeaderButton from "./HeaderButton";

export default function Header() {
  return (
    <header className="relative w-full flex justify-between px-9 py-4">
      <Image src="/logo.svg" alt="logo" width={105} height={36}></Image>
      <nav className="flex gap-3">
        <HeaderButton text="Home" href="/" />
        <HeaderButton text="TO DO" href="/todo" />
        <HeaderButton text="기록" href="/history" />
        <button className="relative w-10 h-10">
          <Image
            src="/profileDefault.svg"
            alt="프로필"
            fill
            className="object-contain transition-opacity duration-200 opacity-100 hover:opacity-0"
          />
          <Image
            src="/profileSelected.svg"
            alt="프로필 선택"
            fill
            className="object-contain transition-opacity duration-200 opacity-0 hover:opacity-100"
          />
        </button>
      </nav>
    </header>
  );
}
