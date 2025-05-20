import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface ProjectCardProps {
  image: string
  title: string
  description: string
  raisedPledges: number
  goalPledges: number
  slug: string
}

export default function ProjectCard({ image, title, description, raisedPledges, goalPledges, slug }: ProjectCardProps) {
  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((raisedPledges / goalPledges) * 100))

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-card hover:shadow-lg transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <div className="p-8">
        <h4 className="text-3xl font-bold mb-3">{title}</h4>
        <p className="text-gray-600 mb-10 text-lg">{description}</p>

        <div className="mb-2 flex justify-between">
          <span className="font-medium">Raised</span>
          <span className="font-medium">Goal</span>
        </div>

        <Progress value={progressPercentage} className="h-2 mb-2 bg-gray-200" indicatorClassName="bg-brand-500" />

        <div className="flex justify-between mb-10">
          <span className="font-medium">+{raisedPledges.toLocaleString()} Peace Pledges</span>
          <span className="font-medium">+{goalPledges.toLocaleString()} Peace Pledges</span>
        </div>

        <Button
          asChild
          variant="default"
          size="lg"
          className="w-full bg-gray-700 hover:bg-gray-800 rounded-full py-6 text-lg"
        >
          <Link href={`/pledge/${slug}`}>Pledge Now</Link>
        </Button>
      </div>
    </div>
  )
}
