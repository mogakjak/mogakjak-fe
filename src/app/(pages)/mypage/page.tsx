import Board from "./_components/board/boardMain";
import Menu from "./_components/menu/menuMain";
import Profile from "./_components/profile/profileMain";

export default function MyPage() {
  return (
    <div className="w-full max-w-[1440px] p-9 mx-auto flex gap-5 items-center overflow-x-hidden">
      <section className="flex flex-col gap-5">
        <Menu />
        <Profile />
      </section>
      <Board />
    </div>
  );
}
