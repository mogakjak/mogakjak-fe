import DashBoradMain from "./_components/dashboard/dashBoradMain";
import RecordMain from "./_components/record/recordMain";

export default function Record() {
  return (
    <div className="w-full max-w-[1440px] min-h-screen mx-auto flex flex-col items-center overflow-x-hidden mb-[60px]">
      <RecordMain />
      <DashBoradMain />
    </div>
  );
}
