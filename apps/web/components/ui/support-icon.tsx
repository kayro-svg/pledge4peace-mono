import { ReactNode } from "react";

export interface SupportIconProps {
  children: ReactNode;
}

export const SupportIcon = ({ children }: SupportIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#86AC9D]"
    >
      {children}
    </svg>
  );
};
