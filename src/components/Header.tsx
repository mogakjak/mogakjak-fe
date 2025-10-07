export default function Header() {
  return (
    <header className="relative w-full flex justify-between">
      <p>모각작</p>
      <div className="flex gap-3">
        <button>홈</button>
        <button>대시보드</button>
        <button>카테고리</button>
      </div>
    </header>
  );
}
