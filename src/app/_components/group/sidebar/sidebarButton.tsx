interface SidebarButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function SidebarButton({
  children,
  className = "",
}: SidebarButtonProps) {
  return (
    <button
      className={`flex gap-1 justify-center items-center text-body1-16R bg-gray-200 rounded-lg py-2.5 ${className}`}
    >
      {children}
    </button>
  );
}
