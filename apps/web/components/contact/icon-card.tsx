import { LucideIcon } from "lucide-react";

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function IconCard({ icon: Icon, title, description }: IconCardProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="z-10 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 p-2 rounded-full border-4 bg-white border-[#548281] text-[#86AC9D]">
        <Icon className="w-6 h-6 text-[#86AC9D]" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-xl">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
