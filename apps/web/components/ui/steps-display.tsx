import { SanityHowItWorksStep } from "@/lib/types";
interface StepsDisplayProps {
  steps: SanityHowItWorksStep[];
}

export default function StepsDisplay({ steps }: StepsDisplayProps) {
  return (
    <div className="relative flex flex-col md:flex-row items-center justify-between bg-background rounded-3xl p-4 gap-5 md:p-6 shadow-card">
      <div className="absolute w-[65%] top-[65px] left-1/2 transform -translate-x-1/2 translate-y-1/2 h-0.5 bg-[#86AC9D] z-0" />
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col items-center relative w-full md:w-auto hover:drop-shadow-md hover:scale-105 z-1 p-4 rounded-2xl border border-[transparent] transition-all duration-300"
        >
          <div className="z-10 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 p-2 rounded-full border-4 bg-white border-[#548281] text-[#86AC9D]">
            {step.icon}
          </div>
          <div className="mt-2 md:mt-4 px-2 md:px-4 py-2 rounded-xl text-center">
            <div className="font-semibold text-base md:text-lg text-gray-800">
              {step.title}
            </div>
            <div className="text-gray-500 text-xs md:text-sm">
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
