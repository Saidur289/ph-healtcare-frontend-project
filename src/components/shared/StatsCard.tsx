import { TiltCard } from "@/components/motion/TiltCard";
import { Card } from "@/components/ui/card";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { createElement } from "react";

const TONES = {
  blue: "bg-info-soft text-primary",
  teal: "bg-teal-soft text-teal",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-destructive",
} as const;

interface StatsCardProps {
  value: string | number;
  title: string;
  iconName: string;
  tone?: keyof typeof TONES;
  // change compared with the previous period, e.g. { diff: 2, label: "vs yesterday" }
  trend?: { diff: number; label: string; display?: string };
  description?: string;
  className?: string;
  // 3D parallax tilt toward the pointer (high-value dashboard numbers)
  tilt?: boolean;
}

// Design card: label top-left, tinted icon square top-right, big number, trend line.
const StatsCard = ({ value, title, iconName, tone = "blue", trend, description, className, tilt = false }: StatsCardProps) => {
  const up = trend ? trend.diff > 0 : false;
  const down = trend ? trend.diff < 0 : false;
  const TrendIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;

  const card = (
    <Card className={cn("h-full gap-3 p-5 shadow-xs", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONES[tone])}>
          {createElement(getIconComponent(iconName), { className: "h-[18px] w-[18px]", "aria-hidden": true })}
        </span>
      </div>
      <p className="text-[28px] font-semibold leading-none tracking-tight">{value}</p>
      {trend ? (
        <p
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            up ? "text-success" : down ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" aria-hidden />
          <span>
            {trend.display ?? Math.abs(trend.diff)} {trend.label}
          </span>
        </p>
      ) : (
        description && <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </Card>
  );
  return tilt ? <TiltCard className="h-full rounded-xl">{card}</TiltCard> : card;
};

export default StatsCard;
