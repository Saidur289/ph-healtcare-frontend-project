import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/appointmentUtils";
import { initials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import { IDoctors } from "@/types/doctor.types";
import { Briefcase, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

// doctor summary used on the home page and the doctor list; `action` is e.g. the Book button
const DoctorCard = ({ doctor, action }: { doctor: IDoctors; action?: ReactNode }) => {
  const specialties = doctor.specialties?.map((item) => item.specialty.title) ?? [];
  const available = doctor.isAvailable !== false;

  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="size-14">
            <AvatarImage src={doctor.profilePhoto} alt="" />
            <AvatarFallback className="bg-accent font-semibold text-accent-foreground">{initials(doctor.name)}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full ring-2 ring-card",
              available ? "bg-success" : "bg-muted-foreground/50",
            )}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold">
            <Link href={`/consultation/doctor/${doctor.id}`} className="hover:text-primary">
              Dr. {doctor.name}
            </Link>
          </h3>
          <p className="truncate text-xs text-muted-foreground">{doctor.designation || doctor.qualification}</p>
          <p className={cn("mt-1 text-xs font-medium", available ? "text-success" : "text-muted-foreground")}>
            {available ? "Available" : "Away"}
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-1 text-[13px] font-semibold">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {(doctor.averageRating ?? 0).toFixed(1)}
          <span className="sr-only">out of 5</span>
          {doctor.reviewCount !== undefined && (
            <span className="font-normal text-muted-foreground">({doctor.reviewCount})</span>
          )}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-lg bg-muted px-3 py-2">
          <dt className="text-xs text-muted-foreground">Experience</dt>
          <dd className="font-medium">{doctor.experience ?? 0} years</dd>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2">
          <dt className="text-xs text-muted-foreground">Fee</dt>
          <dd className="font-medium">{formatTaka(doctor.appointmentFee)}</dd>
        </div>
      </dl>

      {doctor.currentWorkingPlace && (
        <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> {doctor.currentWorkingPlace}
        </p>
      )}
      {specialties.length > 0 && (
        <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden /> {specialties.slice(0, 3).join(" · ")}
        </p>
      )}

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        {action}
        <Button asChild variant={action ? "outline" : "default"} className={cn("w-full", !action && "sm:col-span-2")}>
          <Link href={`/consultation/doctor/${doctor.id}`}>View profile</Link>
        </Button>
      </div>
    </article>
  );
};

export default DoctorCard;
