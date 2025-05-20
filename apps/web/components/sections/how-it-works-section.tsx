import { Users, HandshakeIcon, Award, UserPlus } from "lucide-react";
import ProcessStep from "@/components/ui/process-step";
import StepsDisplay from "@/components/ui/steps-display";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-brand-500" />,
      title: "Register as a P4P Member",
      description:
        "Sign up to our community and join us in the movement for a better world.",
    },
    {
      icon: <HandshakeIcon className="w-8 h-8 text-brand-500" />,
      title: "Pledge",
      description:
        "Make your pledge to support causes and initiatives that matter to you.",
    },
    {
      icon: <Award className="w-8 h-8 text-brand-500" />,
      title: "Endorse",
      description:
        "Endorse and promote peace initiatives that align with your values.",
    },
  ];

  return (
    <section className="py-20 ">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
            How <span className="text-[#548281]">Pledge4Peace</span> Works
          </h1>
          <p className="section-subtitle text-[#2F4858]">
            Join our global movement in three simple steps and help us build a
            more peaceful world.
          </p>
        </div>
        <StepsDisplay steps={steps} />
      </div>
    </section>
  );
}
