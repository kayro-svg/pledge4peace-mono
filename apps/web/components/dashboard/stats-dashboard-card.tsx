"use client";

import { HandHeart, TrendingUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, HandshakeIcon, VoteIcon } from "lucide-react";
import { Button } from "../ui/button";

interface StatsCardProps {
  title: string;
  value: number;
  percentage: number;
  description: string;
  buttonText: string;
  buttonLink: string;
  variant: "campaigns" | "pledges" | "votes";
  cardType: "default" | "involvement";
}

export function StatsDashboardCard({
  title,
  value,
  description,
  buttonText,
  buttonLink,
  variant,
  cardType = "default",
}: StatsCardProps) {
  const router = useRouter();

  const colorBasedOnVariant = (variant: "campaigns" | "pledges" | "votes") => {
    switch (variant) {
      case "campaigns":
        return {
          color: "bg-emerald-100",
          icon: <HandHeart className="h-6 w-6 text-emerald-600" />,
          iconBackground: "bg-emerald-100",
          textColor: "text-emerald-600",
          buttonColor: "text-emerald-600",
          hoverCircleColor: "bg-emerald-200",
        };
      case "pledges":
        return {
          color: "bg-blue-100",
          icon: <HandshakeIcon className="h-6 w-6 text-blue-600" />,
          iconBackground: "bg-blue-100",
          textColor: "text-blue-600",
          buttonColor: "text-blue-600",
          hoverCircleColor: "bg-blue-200",
        };
      case "votes":
        return {
          color: "bg-red-100",
          icon: <VoteIcon className="h-6 w-6 text-red-600" />,
          iconBackground: "bg-red-100",
          textColor: "text-red-600",
          buttonColor: "text-red-600",
          hoverCircleColor: "bg-red-200",
        };
      default:
        return {
          color: "bg-emerald-100",
          icon: <HandHeart className="h-6 w-6 text-emerald-600" />,
          iconBackground: "bg-emerald-100",
          textColor: "text-emerald-600",
          buttonColor: "text-emerald-600",
          hoverCircleColor: "bg-emerald-200",
        };
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${
          colorBasedOnVariant(variant).color
        } opacity-50 transition-all group-hover:${
          colorBasedOnVariant(variant).hoverCircleColor
        }`}
      />
      <div className="relative">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            colorBasedOnVariant(variant).iconBackground
          }`}
        >
          {colorBasedOnVariant(variant).icon}
        </div>
        <h3 className="mb-1 text-sm font-medium text-slate-500">{title}</h3>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          <TrendingUpIcon
            className={`h-4 w-4 ${colorBasedOnVariant(variant).textColor}`}
          />
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        <Button
          variant="ghost"
          size="sm"
          className={`mt-4 px-0 ${
            colorBasedOnVariant(variant).buttonColor
          } hover:bg-transparent hover:${
            colorBasedOnVariant(variant).buttonColor
          }`}
          onClick={() => router.push(buttonLink)}
        >
          {buttonText} <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
