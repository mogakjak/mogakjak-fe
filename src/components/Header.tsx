import Image from "next/image";
import HeaderButton from "./header/HeaderButton";
import ProfileButton from "./header/ProfileButton";

export default function Header() {
  return (
    <header className="relative w-full flex justify-between px-9 py-4 bg-white">
      <Image src="/logo.svg" alt="logo" width={105} height={36}></Image>
      <nav className="flex gap-3">
        <HeaderButton text="Home" href="/" />
        <HeaderButton text="TO DO" href="/todo" />
        <HeaderButton text="기록" href="/record" />
        <ProfileButton />
      </nav>
    </header>
  );
}
