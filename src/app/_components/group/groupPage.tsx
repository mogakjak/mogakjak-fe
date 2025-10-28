import GroupQuote from "./groupQuote";
import GroupSidebar from "./sidebar/groupSidebar";

export default function GroupPage() {
  return (
    <div className="flex">
      <div className="absolute left-0 top-18 min-h-screen">
        <GroupSidebar />
      </div>
      <div className="flex-1 ml-[300px]">
        <GroupQuote></GroupQuote>
      </div>
    </div>
  );
}
