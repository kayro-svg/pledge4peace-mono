import type React from "react";
interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

export default function ProcessStep({
  icon,
  title,
  description,
  index,
}: ProcessStepProps) {
  return (
    <div className="flex flex-col items-center text-center p-10 hover:shadow-soft transition-all duration-300 hover:-translate-y-1 relative">
      <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
