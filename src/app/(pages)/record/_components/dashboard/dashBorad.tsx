import ChartMain from "./chart/chartMain";
import Cards from "./data/cards";
import Tabs from "./tabs/tabs";

export default function DashBorad() {
  return (
    <div className="w-full bg-white rounded-[20px] px-10 py-7">
      <Tabs />
      <Cards
        totalFocusSec={300}
        groupFocusSec={100}
        personalFocusSec={200}
        doneTasks={2}
      />
      <ChartMain />
    </div>
  );
}
