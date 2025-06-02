import { SanityHowItWorksStep } from "@/lib/types";
interface StepsDisplayProps {
  steps: SanityHowItWorksStep[];
}

export default function StepsDisplay({ steps }: StepsDisplayProps) {
  return (
    <div className="relative flex flex-row items-center justify-between gap-5 lg:p-6 shadow-card">
      <div className="absolute md:w-[65%] top-14 md:top-[50px] lg:top-[70px] translate-x-0 md:transform md:-translate-x-1/2 md:translate-y-1/2 md:h-0.5 w-0.5 left-11 md:left-1/2 h-[65%] bg-[#86AC9D] z-0" />
      <div className="flex flex-col md:flex-row items-start justify-between w-full">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-row gap-4 md:gap-0 md:flex-col items-center w-full hover:drop-shadow-md hover:scale-105 z-1 p-4 rounded-2xl border border-[transparent] transition-all duration-300"
          >
            <div className="z-10 flex-shrink-0 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white ring-4 ring-[#548281] text-[#86AC9D] overflow-hidden">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9">
                {step.icon}
              </div>
            </div>
            <div className="mt-0 md:mt-4 px-2 md:px-0 lg:px-4 py-2 text-start md:text-center">
              <div className="font-semibold text-lg  text-gray-800">
                {step.title}
              </div>
              <div className="text-gray-500 text-base">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
