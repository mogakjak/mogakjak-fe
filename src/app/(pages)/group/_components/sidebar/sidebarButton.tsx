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
      className={`text-gray-800 flex gap-1 justify-center items-center text-body1-16R bg-gray-100 border border-gray-200 rounded-lg ${className}`}
    >
      {children}
    </button>
  );
}
