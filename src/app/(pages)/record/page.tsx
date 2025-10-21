import Header from "@/components/Header";
import DashBoradMain from "./_components/dashboard/dashBoradMain";
import RecordMain from "./_components/record/recordMain";

export default function Record() {
  return (
    <>
      <Header />
      <div className="px-[36px] w-full max-w-[1440px] mx-auto flex flex-col items-center overflow-x-hidden">
        <RecordMain />
        <DashBoradMain />
      </div>
    </>
  );
}
