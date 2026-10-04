import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/appointmentUtils";
import { initials } from "@/lib/userDisplay";
import { IDoctors } from "@/types/doctor.types";
import { CircleCheck, CircleMinus, Star } from "lucide-react";
import Link from "next/link";

// one doctor as a horizontal row (home page list): who, what, fee, rating, then Book
const DoctorRow = ({ doctor }: { doctor: IDoctors }) => {
  const specialties = doctor.specialties?.map((item) => item.specialty.title) ?? [];
  const available = doctor.isAvailable !== false;
  const reviews = doctor.reviewCount ?? 0;
  const profileHref = `/consultation/doctor/${doctor.id}`;

  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-4 py-6 lg:grid-cols-[auto_minmax(0,1fr)_10rem_10rem_12rem] lg:items-center lg:gap-x-6">
      <Avatar className="size-16 rounded-md after:rounded-md">
        <AvatarImage src={doctor.profilePhoto} alt="" className="rounded-md object-cover" />
        <AvatarFallback className="rounded-md bg-accent text-lg font-semibold text-accent-foreground">
          {initials(doctor.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <h3 className="text-lg font-semibold leading-snug">
          <Link
            href={profileHref}
            className="-my-2.5 inline-block rounded-sm py-2.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Dr. {doctor.name}
          </Link>
        </h3>
        <p className="text-base text-muted-foreground">{doctor.designation || doctor.qualification}</p>
        {specialties.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{specialties.slice(0, 3).join(" · ")}</p>}
      </div>

      {/* facts: below the name on phones, own columns from lg */}
      <dl className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 lg:col-span-2 lg:grid-cols-[10rem_10rem] lg:gap-6 lg:border-0 lg:pt-0">
        <div>
          <dt className="text-sm text-muted-foreground">Consultation fee</dt>
          <dd className="text-base font-semibold">{formatTaka(doctor.appointmentFee)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Patient rating</dt>
          <dd className="flex items-center gap-1 text-base font-semibold">
            {reviews > 0 ? (
              <>
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                {(doctor.averageRating ?? 0).toFixed(1)}
                <span className="sr-only">out of 5,</span>
                <span className="font-normal text-muted-foreground">
                  ({reviews} {reviews === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="font-normal text-muted-foreground">No reviews yet</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="col-span-2 flex flex-col gap-2 lg:col-span-1 lg:items-end">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {available ? (
            <CircleCheck className="h-4 w-4 text-success" aria-hidden />
          ) : (
            <CircleMinus className="h-4 w-4" aria-hidden />
          )}
          {available ? "Taking bookings" : "Not taking bookings"}
        </p>
        <Button asChild className="h-11 rounded-md px-5 text-base lg:w-auto">
          <Link href={profileHref}>
            Book<span className="sr-only"> with Dr. {doctor.name}</span>
          </Link>
        </Button>
      </div>
    </li>
  );
};

export default DoctorRow;
