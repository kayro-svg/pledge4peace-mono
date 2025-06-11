"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Gavel,
  Globe,
  Heart,
  Megaphone,
  MessageCircle,
  Scale,
  Shield,
  Users,
  Vote,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PledgeDetailsPage() {
  const router = useRouter();

  const pledgePoints = [
    {
      icon: Shield,
      title: "Resolve Conflicts Peacefully and Stand Against Wars & Aggression",
      description:
        "Prioritizes diplomacy, dialogue, and non-violent approaches to resolving conflicts both domestically and internationally. This includes supporting peace negotiations, ceasefires, and conflict mediation instead of war, military actions, or aggression. The party opposes initiating or participating in wars, and does not provide financial or military support to any country or group involved in conflicts or wars.",
    },
    {
      icon: Globe,
      title: "Foreign Policy Focused on Peace and International Cooperation",
      description:
        "Adopts a foreign policy that emphasizes international cooperation, conflict resolution, and support for global peace initiatives. This includes backing international treaties and organizations that aim to prevent wars, promote human rights, and resolve disputes through peaceful means.",
    },
    {
      icon: Vote,
      title: "Supports Democratic Processes Both Externally & Internally",
      description:
        "Respects democratic principles such as free and fair elections, transparency in governance, the rotation of power, and the rule of law, both externally and within the party itself. This includes respecting political opposition, ensuring a free press, promoting civilian control over military and security forces, and upholding these values within internal party structures, fostering accountability, fairness, and openness.",
    },
    {
      icon: MessageCircle,
      title: "Avoids Divisive Rhetoric & Encourages Dialogue",
      description:
        "Engages in dialogue with political opponents, minority groups, and other nations, even in cases of deep disagreements. The party seeks common ground and compromise to avoid escalation into conflict or violence. It avoids divisive or offensive rhetoric and focuses on promoting unity, respect, and inclusive dialogue.",
    },
    {
      icon: Users,
      title: "Advocates for the Protection of Minority Rights",
      description:
        "Promotes the inclusion and protection of minority groups—ethnic, religious, or cultural—within society. The party is committed to preventing discrimination and ensuring equal rights for all minorities, which is crucial for peace and justice.",
    },
    {
      icon: Scale,
      title: "Supports Social and Economic Equality",
      description:
        "Advocates for policies that reduce income inequality, promote social justice, and provide equal access to education, healthcare, and jobs regardless of religion, beliefs, ethnicity, or other factors. Addressing social and economic disparities is critical for creating peaceful societies.",
    },
    {
      icon: CheckCircle,
      title: "Respects Human Rights & Freedom of Speech",
      description:
        "Upholds universal human rights, including freedom of speech, religion, and movement. The party is committed to protecting citizens from oppression, supporting human rights in international relations, and promoting peace over conflict.",
    },
    {
      icon: Heart,
      title: "Stands for Gender Equality",
      description:
        "Advocates for equal rights and opportunities for all genders. This includes policies to close the gender pay gap, prevent violence against women, and ensure women's participation in political and economic life.",
    },
    {
      icon: Gavel,
      title: "Supports a Fair & Independent Justice System",
      description:
        "Advocates for an independent judiciary and a fair legal system that treats all citizens equally. The party opposes efforts to manipulate the courts for political advantage and ensures justice is delivered impartially.",
    },
    {
      icon: Megaphone,
      title:
        "Promotes Freedom of Expression to Create Peace, Equality and Justice",
      description:
        "Upholds the right to freedom of expression while fostering responsible dialogue that counters polarization and extremism. Encourages constructive criticism of local policies, protects peaceful protests, supports a free press, and ensures political dissent can occur without fear of retribution, all while promoting inclusivity, tolerance, and respect for diverse perspectives.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="inline-flex items-center text-[#548281] hover:text-[#3c6665] mb-4 border-none hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pledge
          </Button>
          <h1 className="text-3xl font-bold text-[#182828] mb-4">
            Pledge4Peace and support the political parties that will:
          </h1>
        </div>

        <div className="space-y-8">
          {pledgePoints.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#548281]"
              >
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 space-x-0 md:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-50  rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-emerald-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {point.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
