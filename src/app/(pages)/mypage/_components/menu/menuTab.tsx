interface MenuTabProps {
  title: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function MenuTab({
  title,
  selected = false,
  onClick,
}: MenuTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-[13px] rounded-lg border-[1.5px] text-body1-16SB text-start transition-colors duration-150
        ${selected
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-gray-100 border-gray-200 text-gray-600 "
        }`}
    >
      {title}
    </button>
  );
}
