import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import StatsCardSkeleton from "./skeleton/StatsCardSkeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  isLoading?: boolean;
}

const colorMap = {
  primary: {
    bg: "bg-[hsl(var(--primary-light))]",
    text: "text-[hsl(var(--primary))]",
    icon: "text-[hsl(var(--primary))]",
  },
  secondary: {
    bg: "bg-[hsl(var(--secondary-light))]",
    text: "text-[hsl(var(--secondary))]",
    icon: "text-[hsl(var(--secondary))]",
  },
  success: {
    bg: "bg-[hsl(var(--success-light))]",
    text: "text-[hsl(var(--success))]",
    icon: "text-[hsl(var(--success))]",
  },
  warning: {
    bg: "bg-[hsl(var(--warning-light))]",
    text: "text-[hsl(var(--warning))]",
    icon: "text-[hsl(var(--warning))]",
  },
  error: {
    bg: "bg-[hsl(var(--error-light))]",
    text: "text-[hsl(var(--error))]",
    icon: "text-[hsl(var(--error))]",
  },
  info: {
    bg: "bg-[hsl(var(--info-light))]",
    text: "text-[hsl(var(--info))]",
    icon: "text-[hsl(var(--info))]",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "primary",
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  const colors = colorMap[color];

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2">
                <span
                  className={`text-xs font-semibold ${
                    trend.isPositive
                      ? "text-[hsl(var(--success))]"
                      : "text-[hsl(var(--error))]"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
