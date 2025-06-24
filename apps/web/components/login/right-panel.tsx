import { ReactNode } from "react";

interface RightPanelProps {
  children: ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <div className="relative p-6 w-full h-auto md:min-h-[calc(100vh-100px)] lg:min-h-full lg:w-1/2 bg-white shadow-lg flex items-center justify-center rounded-2xl lg:rounded-r-2xl lg:ml-[-20px] z-10">
      {children}
    </div>
  );
}
