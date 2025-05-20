import { ReactNode } from "react";

interface ImpactItemProps {
  text: string;
}

const ImpactItem = ({ text }: ImpactItemProps) => {
  return (
    <li className="flex items-start gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#2f4858] mt-0.5"
      >
        <path d="m5 12 5 5L20 7"></path>
      </svg>
      <span className="text-sm text-[#2f4858]">{text}</span>
    </li>
  );
};

export const ImpactSection = () => {
  const impactItems = [
    "$25 provides educational materials for peace workshops",
    "$50 helps organize a local peace dialogue session",
    "$100 supports conflict resolution training for community leaders",
    "$500 funds a peace-building initiative in a conflict zone",
  ];

  return (
    <div className="flex justify-center">
      <div className="bg-background p-6 rounded-lg shadow-md max-w-md w-full">
        <h4 className="text-lg font-bold text-[#2f4858] mb-4">
          Impact of Your Support
        </h4>
        <ul className="space-y-3">
          {impactItems.map((item, index) => (
            <ImpactItem key={index} text={item} />
          ))}
        </ul>
      </div>
    </div>
  );
};
