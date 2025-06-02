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
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white ring-2 md:ring-4 ring-[#548281] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
        {description}
      </p>
      <div className="flex-grow"></div>
      <Link
        href={linkHref}
        className="inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#548281] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
      >
        {linkText}
      </Link>
    </div>
  );
};
