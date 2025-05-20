"use client";

import React from "react";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  count: string;
  label: string;
}

export function StatCard({ icon, count, label }: StatCardProps) {
  return (
    <div className="w-fit">
      <div className="rounded-full">{icon}</div>
      <div className="flex items-center mb-1 gap-2">
        <span className="text-3xl font-bold text-[#2F4858]">{count}</span>
      </div>
      <p className="text-sm font-medium text-[#2F4858]">{label}</p>
    </div>
  );
}
