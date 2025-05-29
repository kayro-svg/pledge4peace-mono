import { ReactNode } from "react";
import { LogoHeader } from "./logo-header";

interface RightPanelProps {
  children: ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <div className="relative w-full lg:w-1/2 bg-white shadow-lg flex items-center justify-center rounded-r-2xl ml-[-20px] z-10">
      <LogoHeader />
      {children}
    </div>
  );
}
