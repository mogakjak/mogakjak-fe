import Cards from "./data/cards";
import Tabs from "./tabs/tabs";

export default function DashBorad() {
  return (
    <div className="w-full bg-white rounded-[20px] px-10 py-7">
      <Tabs />
      <Cards
        totalFocusSec={2 * 3600 + 30 * 60}
        groupFocusSec={1 * 3600 + 30 * 60}
        personalFocusSec={1 * 3600}
        doneTasks={2}
      />
    </div>
  );
}
