import BookAppointmentModal from "@/components/modules/Patient/Appointments/BookAppointmentModal";
import EmptyState from "@/components/shared/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/appointmentUtils";
import { initials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import { getUserInfo } from "@/services/auth.service";
import { getDoctorById } from "@/services/doctor.services";
import { type IDoctorDetails, type IDoctorScheduleItem } from "@/types/doctor.types";
import { format } from "date-fns";
import { ArrowLeft, Briefcase, CalendarX, GraduationCap, MapPin, MessageSquare, Star, UserRound } from "lucide-react";
import Link from "next/link";

const apiMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : "Failed to load doctor details";
};

// free future slots grouped by day, soonest first (at most 7 days shown)
const groupSlotsByDay = (items: IDoctorScheduleItem[]) => {
  const now = Date.now();
  const days = new Map<string, { label: string; times: string[] }>();
  items
    .filter((item) => !item.isBooked && item.schedule?.startDateTime)
    .map((item) => new Date(item.schedule!.startDateTime!))
    .filter((start) => !Number.isNaN(start.getTime()) && start.getTime() >= now)
    .sort((a, b) => a.getTime() - b.getTime())
    .forEach((start) => {
      const key = format(start, "yyyy-MM-dd");
      if (!days.has(key)) days.set(key, { label: format(start, "EEE, dd MMM"), times: [] });
      days.get(key)!.times.push(format(start, "hh:mm a"));
    });
  return [...days.entries()].slice(0, 7);
};

const Stars = ({ rating, className }: { rating: number; className?: string }) => (
  <span className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn("h-3.5 w-3.5", n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
        aria-hidden
      />
    ))}
  </span>
);

const ConsultationDoctorByIdPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [currentUser, result] = await Promise.all([
    getUserInfo(),
    getDoctorById(id).then(
      (response) => ({ doctor: response.data as IDoctorDetails, error: "" }),
      (error) => ({ doctor: null, error: apiMessage(error) }),
    ),
  ]);
  const doctor = result.doctor;

  if (!doctor) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <EmptyState
          icon={UserRound}
          title="Doctor not found"
          description={result.error}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/consultation">Back to doctors</Link>
            </Button>
          }
        />
      </section>
    );
  }

  const slotDays = groupSlotsByDay(doctor.doctorSchedules ?? []);
  const reviews = doctor.reviews ?? [];
  const available = doctor.isAvailable !== false;
  const reviewCount = doctor.reviewCount ?? reviews.length;
  const book = (
    <BookAppointmentModal
      doctorId={String(doctor.id)}
      doctorName={doctor.name}
      isAuthenticated={Boolean(currentUser)}
      viewerRole={currentUser?.role ?? null}
    />
  );

  // the profile, then slots and reviews, cascade in
  return (
    <Stagger as="section" className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <StaggerItem>
        <Link href="/consultation" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All doctors
        </Link>
      </StaggerItem>

      {/* profile header */}
      <StaggerItem className="flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-xs md:flex-row md:items-center">
        <Avatar className="size-24">
          <AvatarImage src={doctor.profilePhoto} alt="" />
          <AvatarFallback className="bg-accent text-2xl font-semibold text-accent-foreground">{initials(doctor.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Dr. {doctor.name}</h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                available ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
              )}
            >
              {available ? "Available" : "Away"}
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground">{doctor.designation}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <span className="flex items-center gap-1.5">
              <Stars rating={doctor.averageRating ?? 0} />
              <span className="font-medium">{(doctor.averageRating ?? 0).toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount} reviews)</span>
            </span>
            {doctor.currentWorkingPlace && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden /> {doctor.currentWorkingPlace}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(doctor.specialties ?? []).map((item) => (
              <span key={item.id} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                {item.title}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 rounded-xl bg-muted p-4 md:w-56">
          <p className="text-xs text-muted-foreground">Consultation fee</p>
          <p className="text-2xl font-semibold">{formatTaka(doctor.appointmentFee)}</p>
          {book}
        </div>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* available slots */}
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold">Available slots</h2>
              <span className="text-xs text-muted-foreground">Pick one when you book</span>
            </div>
            {slotDays.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted p-4 text-[13px] text-muted-foreground">
                <CalendarX className="h-5 w-5" aria-hidden /> No free slots right now. Check back soon.
              </div>
            ) : (
              <Stagger className="mt-4 space-y-4">
                {slotDays.map(([key, day]) => (
                  <StaggerItem key={key} className="grid gap-2 sm:grid-cols-[110px_1fr] sm:items-start">
                    <p className="pt-1.5 text-[13px] font-medium">{day.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {day.times.map((time) => (
                        <span key={time} className="rounded-lg border bg-info-soft px-3 py-1.5 text-xs font-medium text-primary">
                          {time}
                        </span>
                      ))}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>

          {/* reviews */}
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="text-[15px] font-semibold">Patient reviews</h2>
            {reviews.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted p-4 text-[13px] text-muted-foreground">
                <MessageSquare className="h-5 w-5" aria-hidden /> No reviews yet.
              </div>
            ) : (
              <Stagger as="ul" inView className="mt-4 divide-y">
                {reviews.map((review, index) => (
                  <StaggerItem as="li" key={review.id ?? index} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={review.patient?.profilePhoto || undefined} alt="" />
                      <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                        {initials(review.patient?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px] font-medium">{review.patient?.name || "Patient"}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt ? format(new Date(review.createdAt), "dd MMM yyyy") : ""}
                        </p>
                      </div>
                      <Stars rating={review.rating ?? 0} className="mt-0.5" />
                      {/* plain text: React escapes it, and the API strips HTML on save */}
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{review.comment}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>

        {/* details */}
        <div className="h-fit rounded-xl border bg-card p-5 shadow-xs">
          <h2 className="text-[15px] font-semibold">About</h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            {[
              { icon: GraduationCap, label: "Qualification", value: doctor.qualification },
              { icon: Briefcase, label: "Experience", value: `${doctor.experience ?? 0} years` },
              { icon: UserRound, label: "Gender", value: doctor.gender === "FEMALE" ? "Female" : doctor.gender === "MALE" ? "Male" : "—" },
              { icon: MapPin, label: "Works at", value: doctor.currentWorkingPlace || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 text-xs text-muted-foreground">Registration no. {doctor.registrationNumber}</div>
          </dl>
        </div>
      </StaggerItem>
    </Stagger>
  );
};

export default ConsultationDoctorByIdPage;
