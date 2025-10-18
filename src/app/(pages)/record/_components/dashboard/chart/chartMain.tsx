import StickGraphs from "./stickGraphs";

export default function ChartMain() {
  const focusData = [
    90, 70, 0, 0, 0, 0, 0, 0, 0, 40, 65, 30, 0, 0, 8, 12, 45, 60, 100, 75, 100,
    25, 35, 50,
  ];

  return (
    <main className="p-6">
      <h2 className="text-lg font-semibold mb-4">시간대별 몰입 그래프</h2>
      <StickGraphs data={focusData} />
    </main>
  );
}
