import MenuTab from "./menuTab";

interface MenuProps {
  selected: string;
  onSelect: (menu: string) => void;
}

export default function Menu({ selected, onSelect }: MenuProps) {
  const menuItems = ["내 과일 바구니", "내 모각작 메이트"];

  return (
    <div className="w-[327px] p-6 rounded-[20px] bg-white">
      <h2 className="text-heading4-20SB text-black mb-7">MENU</h2>

      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <MenuTab
            key={item}
            title={item}
            selected={selected === item}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </div>
  );
}
