interface SidebarButtonProps {
  children: React.ReactNode;
}

export default function SidebarButton({ children }: SidebarButtonProps) {
  return (
    <button className="bg-gray-200 rounded-lg p-2 w-full">{children}</button>
  );
}
