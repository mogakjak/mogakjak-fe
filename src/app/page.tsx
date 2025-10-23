import FriendMain from "./_components/friendMain";
import PreviewMain from "./_components/previewMain";
import RoomMain from "./_components/roomMain";

export default function Home() {
  return (
    <main className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex gap-5 items-center overflow-x-hidden">
      <PreviewMain />

      <section className="flex flex-col gap-5">
        <RoomMain />
        <FriendMain />
      </section>
    </main>
  );
}
