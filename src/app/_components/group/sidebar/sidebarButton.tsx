"use client";

interface SidebarButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SidebarButton({
  children,
  className = "",
  onClick,
}: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex gap-1 justify-center items-center text-body1-16R bg-gray-200 rounded-lg py-1.5 ${className}`}
    >
      {children}
    </button>
  );
}
