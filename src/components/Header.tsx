import Image from "next/image";
import HeaderButton from "./header/HeaderButton";
import ProfileButton from "./header/ProfileButton";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-center bg-white border-b border-gray-200">
      <div className="flex w-full justify-between items-center px-9 py-4">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={105} height={36}></Image>
        </Link>
        <nav className="flex gap-3">
          <HeaderButton text="할 일" href="/todo" />
          <HeaderButton text="집중 리포트" href="/record" />
          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
