import { ReactNode } from "react";
import { LogoHeader } from "./logo-header";

interface RightPanelProps {
  children: ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <div className="relative w-full lg:w-1/2 bg-white flex items-center justify-center">
      <LogoHeader />
      {children}
    </div>
  );
}
