import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "orange" | "purple" | "cyan";
  isActive: boolean;
  onClick: () => void;
}

export function InvolvementStatsCard({
  title,
  value,
  change,
  icon,
  color,
  isActive,
  onClick,
}: StatsCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-100 ring-emerald-500 cursor-pointer",
    blue: "bg-blue-50 border-blue-100 ring-blue-500 cursor-pointer",
    orange: "bg-orange-50 border-orange-100 ring-orange-500 cursor-pointer",
    purple: "bg-purple-50 border-purple-100 ring-purple-500 cursor-pointer",
    cyan: "bg-cyan-50 border-cyan-100 ring-cyan-500 cursor-pointer",
  };

  const textColorClasses = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    cyan: "text-cyan-600",
  };

  return (
    <Card
      className={`overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md ${colorClasses[color]} ${isActive ? "ring-2" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-700">
            {title}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${textColorClasses[color]}`}>{change}</p>
      </CardContent>
    </Card>
  );
}
