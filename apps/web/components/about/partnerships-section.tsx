import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnershipsSectionProps {
  partnershipText: string;
}

export default function PartnershipsSection({
  partnershipText,
}: PartnershipsSectionProps) {
  return (
    <div className="my-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858]">
          Our <span className="text-[#548281]">Partnerships</span>
        </h2>
        <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
          {partnershipText}
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#2F4858] to-[#548281] rounded-3xl p-10 mt-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8BB05C]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8BB05C]/10 rounded-full -ml-16 -mb-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-white mb-4">
              Become a Partner for Peace
            </h3>
            <p className="text-white/90 text-lg">
              Join forces with organizations and companies that share our values
              and mission to build a more peaceful world together. Through
              strategic partnerships, we can amplify our impact and create
              lasting change.
            </p>
          </div>

          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white/10 p-5 rounded-full border-2 border-white/20">
              <Handshake className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-start relative z-10">
          <Button
            className="bg-white text-[#548281] hover:bg-white/90 px-6 py-3 text-lg rounded-full"
            size="lg"
          >
            Partner With Us
          </Button>
        </div>
      </div>
    </div>
  );
}
