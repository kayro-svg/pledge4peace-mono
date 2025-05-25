"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
interface CampaignCardProps {
  title: string;
  description: string;
  featuredImage: string;
  raised?: number;
  goal?: number;
  category: string;
  action: string;
  variant?: "default" | "horizontal" | "compact" | "horizontal-large";
  link: string;
}

export default function CampaignCard({
  title,
  description,
  featuredImage,
  raised = 1000,
  goal = 10000,
  category,
  action,
  variant = "default",
  link,
}: CampaignCardProps) {
  const progress = Math.round((raised / goal) * 100);
  const router = useRouter();
  if (variant === "horizontal") {
    return (
      <Card className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
        <div className="relative h-auto w-[40%]">
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            fill
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col p-4 w-[60%] h-full justify-between">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
              {category}
            </Badge>
            <span className="text-sm font-medium text-emerald-700">
              {progress}%
            </span>
          </div>
          <h3 className="mb-1 line-clamp-1 text-base font-semibold">{title}</h3>
          <p className="mb-3 line-clamp-2 text-xs text-slate-500">
            {description}
          </p>
          <div className="flex flex-col justify-between text-sm">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {raised.toLocaleString()} Pledges
              </span>
              <span className="text-slate-500">
                Goal: {goal.toLocaleString()}
              </span>
            </div>
          </div>
          <Button
            className="bg-[#548281] text-white py-2 px-6 mt-4 rounded-full font-medium hover:bg-[#2f4858] transition-colors w-full"
            onClick={() => router.push(link)}
          >
            {action}
          </Button>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 text-xs"
            >
              {category}
            </Badge>
            <span className="text-xs font-medium text-emerald-700">
              {progress}%
            </span>
          </div>
          <CardTitle className="line-clamp-1 text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Progress value={progress} className="h-1.5 mb-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{raised.toLocaleString()}</span>
            <span className="text-slate-500">
              Goal: {goal.toLocaleString()}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <Button
            size="sm"
            className="w-full bg-[#548281] hover:bg-[#2f4858] text-white text-xs rounded-full"
            onClick={() => router.push(`/campaigns/${link}`)}
          >
            {action}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (variant === "horizontal-large") {
    return (
      <Card className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
        <div className="aspect-video w-[50%] overflow-hidden">
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            width={400}
            height={200}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="flex flex-col p-4 w-[50%] h-full justify-between">
          <div className="flex items-center justify-between px-4">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 text-xs"
            >
              {category}
            </Badge>
            <span className="text-xs font-medium text-emerald-700">
              {progress}%
            </span>
          </div>
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            {/* <CardDescription className="text-md">{description}</CardDescription> */}
            <CardDescription className="text-md">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor
              sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum
              dolor sit amet consectetur adipisicing elit. Quisquam, quos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Progress value={progress} className="h-2" />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                {raised.toLocaleString()} Pledges
              </span>
              <span className="text-slate-500">
                Goal: {goal.toLocaleString()}
              </span>
            </div>
          </CardContent>
          <div className="flex px-4">
            <Button
              className="bg-[#548281] text-white py-2 px-6 mt-4 rounded-full font-medium hover:bg-[#2f4858] transition-colors w-full"
              onClick={() => router.push(`/campaigns/${link}`)}
            >
              {action}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="overflow-hidden max-w-xl rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={featuredImage || "/placeholder.svg"}
          alt={title}
          width={400}
          height={200}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-8">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            {category}
          </Badge>
          <span className="text-sm font-medium text-emerald-700">
            {progress}%
          </span>
        </div>
        <CardTitle className="line-clamp-2 text-2xl">{title}</CardTitle>
        <CardDescription className="line-clamp-2 text-md">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium">{raised.toLocaleString()} Pledges</span>
          <span className="text-slate-500">Goal: {goal.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#548281] hover:bg-[#2f4858] text-white text-md font-semibold rounded-full"
          onClick={() => router.push(`/campaigns/${link}`)}
        >
          {action}
        </Button>
      </CardFooter>
    </Card>
  );
}
