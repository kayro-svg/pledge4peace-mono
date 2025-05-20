import Link from "next/link";
import { ReactNode } from "react";

export interface SupportCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

export const SupportCard = ({
  icon,
  title,
  description,
  linkText,
  linkHref,
}: SupportCardProps) => {
  return (
    <div className="bg-white group rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-start justify-between">
      <div className="w-16 h-16 rounded-full bg-white border-4 border-[#548281] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex-grow"></div>
      <Link
        href={linkHref}
        className="inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-6 py-3 text-sm font-medium text-[#548281] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
      >
        {linkText}
      </Link>
    </div>
  );
};
