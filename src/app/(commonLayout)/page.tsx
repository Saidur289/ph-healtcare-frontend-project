import DoctorCard from "@/components/modules/Public/DoctorCard";
import HeroSearch from "@/components/modules/Public/HeroSearch";
import { Button } from "@/components/ui/button";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import { IDoctors } from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";
import { CalendarCheck, CreditCard, FileText, Search, ShieldCheck, Star, Stethoscope, Video } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { icon: Search, title: "Find a doctor", text: "Search by name or specialty and compare fees, experience and ratings." },
  { icon: CalendarCheck, title: "Pick a slot", text: "Choose a free time from the doctor's calendar." },
  { icon: CreditCard, title: "Pay securely", text: "Pay now by card, or pay later before the call." },
  { icon: Video, title: "Meet online", text: "Join the private video call and get your prescription by email." },
];

const TRUST = [
  { icon: ShieldCheck, label: "Verified doctors" },
  { icon: Video, label: "Private video calls" },
  { icon: FileText, label: "PDF prescriptions" },
];

const specialtyHref = (title: string) =>
  `/consultation?${new URLSearchParams({ "specialties.specialty.title": title }).toString()}`;

export default async function HomePage() {
  // the home page still renders if either list fails
  const [doctorsResult, specialtiesResult] = await Promise.allSettled([
    getDoctors("sortBy=averageRating&sortOrder=desc&limit=6"),
    getAllSpecialties(),
  ]);
  const doctors: IDoctors[] = doctorsResult.status === "fulfilled" ? (doctorsResult.value.data ?? []) : [];
  const specialties: ISpecialty[] = specialtiesResult.status === "fulfilled" ? (specialtiesResult.value.data ?? []) : [];

  return (
    <>
      {/* hero */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-20">
          <div className="min-w-0 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Stethoscope className="h-3.5 w-3.5" aria-hidden /> Online doctor appointments
            </span>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              See the right doctor, <span className="text-primary">from home</span>.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Book verified specialists, pay securely and consult over a private video call. Your prescription arrives
              by email as a PDF.
            </p>
            <HeroSearch />
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-success" aria-hidden /> {label}
                </li>
              ))}
            </ul>
          </div>

          {/* summary card in the dashboard style */}
          <div className="hidden rounded-2xl border bg-background p-6 lg:block">
            <div className="grid gap-4">
              <div className="rounded-xl border bg-card p-5 shadow-xs">
                <p className="text-[13px] text-muted-foreground">Doctors on the platform</p>
                <p className="mt-2 text-3xl font-semibold">{doctorsResult.status === "fulfilled" ? (doctorsResult.value.meta?.total ?? doctors.length) : "—"}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-xs">
                <p className="text-[13px] text-muted-foreground">Specialties</p>
                <p className="mt-2 text-3xl font-semibold">{specialties.length}</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-card p-5 shadow-xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-soft text-success">
                  <Video className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium">Video consult</p>
                  <p className="text-xs text-muted-foreground">Joins 10 minutes before your slot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* specialties */}
      {specialties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight">Browse by specialty</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {specialties.slice(0, 16).map((specialty) => (
              <Link
                key={specialty.id}
                href={specialtyHref(specialty.title)}
                className="rounded-full border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {specialty.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* featured doctors */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Top rated doctors</h2>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden /> Rated by patients after their
              consultation
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/consultation">View all</Link>
          </Button>
        </div>
        {doctors.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={String(doctor.id)} doctor={doctor} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center text-[13px] text-muted-foreground">
            Doctors will appear here soon.
          </p>
        )}
      </section>

      {/* how it works */}
      <section id="how-it-works" className="scroll-mt-20 border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">How it works</h2>
          <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="rounded-xl border bg-background p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">Step {index + 1}</span>
                </div>
                <p className="mt-4 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link href="/consultation">Find your doctor</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
