"use client";

import React from "react";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  count: string;
  label: string;
  className?: string;
}

export function StatCard({
  icon,
  count,
  label,
  className = "",
}: StatCardProps) {
  return (
    <div className={`w-fit ${className} gap-2 md:gap-4`}>
      <div className="rounded-full flex items-center justify-start">{icon}</div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-[#2F4858]">{count}</span>
        </div>
        <p className="text-lg text-start font-medium text-[#2F4858]">{label}</p>
      </div>
    </div>
  );
}
