"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface InteractiveButtonProps {
  text: string;
  target: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export default function InteractiveButton({
  text,
  target,
  className,
  size = "default",
}: InteractiveButtonProps) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button className={className} size={size} onClick={handleClick}>
      {text}
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}
