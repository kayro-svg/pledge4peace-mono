import { SanityAboutMissionHighlightCard } from "@/lib/types";

interface NonprofitMissionProps {
  missionHighlightCard: SanityAboutMissionHighlightCard;
}

export default function NonprofitMission({
  missionHighlightCard,
}: NonprofitMissionProps) {
  return (
    <div className="my-20 space-y-8">
      {/* Mission Highlight Card */}
      <div className="bg-white p-12 rounded-3xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#2F4858]">
            {missionHighlightCard.title}
          </h2>
          <div className="w-20 h-1 bg-[#548281] mx-auto mt-4 mb-8"></div>
        </div>

        <p className="text-xl text-gray-700 text-center max-w-4xl mx-auto">
          {missionHighlightCard.description}
        </p>
      </div>
    </div>
  );
}
