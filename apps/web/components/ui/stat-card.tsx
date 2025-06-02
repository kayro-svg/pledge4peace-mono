"use client";

import React from "react";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  count: string;
  label: string;
  className?: string;
}

export function StatCard({ icon, count, label, className = '' }: StatCardProps) {
  return (
    <div className={`w-fit ${className}`}>
      <div className="rounded-full">{icon}</div>
      <div className="flex items-center mb-1 gap-2">
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2F4858]">{count}</span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-[#2F4858]">{label}</p>
    </div>
  );
}
