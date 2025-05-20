import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";

const impactStories = [
  {
    title: "Pakistan Flood Relief",

    image: "/placeholder.svg?height=200&width=400",
    description: "Helped 1000 families affected by floods in Pakistan.",
  },
  {
    title: "Middle East Education",

    image: "/placeholder.svg?height=200&width=400",
    description: "Helped 1000 children get access to education in Middle East.",
  },
  {
    title: "India Peace Building",

    image: "/placeholder.svg?height=200&width=400",
    description: "Helped 1000 children get access to education in India.",
  },
];

export function ImpactStories() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between mt-8">
        <h2 className="text-2xl font-bold text-slate-800">Impact Stories</h2>
        <Button
          variant="outline"
          className="inline-flex items-center w-fit justify-center rounded-full border border-[#548281] px-5 py-2 text-sm text-[#548281] hover:text-white shadow hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {impactStories.map((story) => (
          <ImpactStoryCard
            key={story.title}
            title={story.title}
            image={story.image}
            description={story.description}
          />
        ))}
      </div>
    </div>
  );
}

interface ImpactStoryCardProps {
  title: string;
  image: string;
  description: string;
}

function ImpactStoryCard({ title, image, description }: ImpactStoryCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={400}
          height={200}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 text-sm">
          {description}
        </CardDescription>
      </CardContent>
      <div className="px-6 pb-6">
        <Button className="w-full bg-[#548281] hover:bg-[#2f4858] text-white text-sm rounded-full">
          Read Full Story
        </Button>
      </div>
    </Card>
  );
}
