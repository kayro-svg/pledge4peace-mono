import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeaderCard from "@/components/ui/leader-card";

export default function LeadersSection() {
  // Generate 6 placeholder leaders
  const leaders = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    image: "/placeholder.svg?height=200&width=300",
    name: `Leader ${i + 1} Political Leader`,
    position: "Political Party • Country",
  }));

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#252a34] uppercase text-sm font-medium tracking-wider mb-4 border-b-2 w-fit mx-auto border-[#2F4858]">
            DECIDE WITH FACTS
          </p>
          <h2 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
            Discover the Pro-Peace and Anti-Peace Leaders
          </h2>
          <p className="text-[#2F4858] text-lg max-w-3xl mx-auto">
            Learn about the political leaders who are making a difference in the
            peace movement around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader) => (
            <LeaderCard
              key={leader.id}
              image={leader.image}
              name={leader.name}
              position={leader.position}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            asChild
            variant="default"
            size="lg"
            className="mt-6 md:mt-0 text-brand-500 font-mediu bg-transparent flex items-center border border-[#2F4858] hover:bg-[#2F4858] hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-fit"
          >
            <Link href="/leaders" className="flex items-center">
              See Who's Leading Change{" "}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
