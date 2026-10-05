"use client";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { TiltCard } from "@/components/motion/TiltCard";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { bloodGroupLabel, IHealthData } from "@/types/profile.types";
import { differenceInYears } from "date-fns";
import { CalendarHeart, Droplet, Ruler, Scale, type LucideIcon } from "lucide-react";

type TVital = { label: string; value: string; icon: LucideIcon; tone: string };

// The patient's own saved vitals at a glance (read-only; edited in the form below).
// Each tile leans toward the pointer.
const VitalsSummary = ({ health }: { health: IHealthData }) => {
  const birth = new Date(health.dateOfBirth);
  const age = Number.isNaN(birth.getTime()) ? null : differenceInYears(new Date(), birth);
  const vitals: TVital[] = [
    { label: "Blood group", value: bloodGroupLabel(health.bloodGroup), icon: Droplet, tone: "bg-danger-soft text-destructive" },
    { label: "Height", value: health.height, icon: Ruler, tone: "bg-info-soft text-primary" },
    { label: "Weight", value: health.weight, icon: Scale, tone: "bg-teal-soft text-teal" },
    { label: "Age", value: age === null ? "—" : `${age} years`, icon: CalendarHeart, tone: "bg-warning-soft text-warning" },
  ];

  return (
    <Stagger as="ul" className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Your vitals">
      {vitals.map(({ label, value, icon: Icon, tone }) => (
        <StaggerItem as="li" key={label}>
          <TiltCard className="h-full rounded-xl">
            <Card className="h-full gap-3 p-5 shadow-xs">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tone)}>
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold leading-none tracking-tight">{value}</p>
              </div>
            </Card>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
};

export default VitalsSummary;
