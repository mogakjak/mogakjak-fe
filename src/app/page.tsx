import FriendMain from "./_components/home/friendMain";
import PreviewMain from "./_components/home/previewMain";
import RoomMain from "./_components/home/roomMain";

export default function Home() {
  return (
    <main className="w-full max-w-[1440px] min-h-screen py-9 mx-auto flex gap-5 overflow-x-hidden">
      <div className="self-stretch">
        <PreviewMain />
      </div>

      <section className="w-full flex flex-col self-stretch gap-5">
        <RoomMain />
        <FriendMain />
      </section>
    </main>
  );
}
