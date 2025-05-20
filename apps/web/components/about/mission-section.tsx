import { AboutSection } from "@/lib/types";

interface MissionSectionProps {
  sections: AboutSection[];
}

export default function MissionSection({ sections }: MissionSectionProps) {
  return (
    <div className="bg-blue-50 p-8 rounded-lg my-12">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        Our Mission & Vision
      </h2>

      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-xl font-semibold mb-3">{section.heading}</h3>
            <p className="text-gray-700">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
