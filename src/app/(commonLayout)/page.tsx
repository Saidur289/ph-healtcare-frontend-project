import childCheckup from "@/assets/home/child-checkup.webp";
import consultationDesk from "@/assets/home/consultation-desk.webp";
import doctorAndPatient from "@/assets/home/doctor-and-patient.webp";
import familyConsultation from "@/assets/home/family-consultation.webp";
import reviewingHistory from "@/assets/home/reviewing-history.webp";
import writingPrescription from "@/assets/home/writing-prescription.webp";
import DoctorRow from "@/components/modules/Public/DoctorRow";
import HeroSearch from "@/components/modules/Public/HeroSearch";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/button";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import { IDoctors } from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";
import { ArrowRight, Phone } from "lucide-react";
import { Newsreader } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

// serif for the large headings on this page (Inter stays the body font)
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// timings match server/src/app/module/appointment/appointment.constant.ts
const STEPS = [
  {
    title: "Find your doctor",
    text: "Filter by specialty, then compare experience, fees and reviews written by patients after their consultation.",
  },
  {
    title: "Book a 30-minute slot",
    text: "Pick a free time on the doctor's calendar and pay by card now, or later up to 2 hours before. You can cancel or reschedule until 2 hours before the start.",
  },
  {
    title: "Meet over video",
    text: "Join the private call from your dashboard; it opens 10 minutes before your slot. Your prescription arrives by email as a PDF.",
  },
];

const AFTER_CALL = [
  { term: "Prescription", text: "Medicines, instructions and a follow-up date, sent as a PDF and kept under My Prescriptions." },
  { term: "Receipt", text: "Your invoice stays with the appointment, ready when you need it." },
  { term: "Review", text: "Rate the consultation so the next patient can choose with confidence." },
];

const PRIVACY = [
  { term: "Private files", text: "Reports and prescriptions are never public. Links to them expire after 5 minutes." },
  { term: "Encrypted details", text: "Health notes and prescription details are encrypted before they are stored." },
  { term: "Every access recorded", text: "Each time a medical file is opened, it is written to an audit log." },
  { term: "Your data, your call", text: "Download everything we hold, or delete your account, from your profile." },
];

const specialtyHref = (title: string) =>
  `/consultation?${new URLSearchParams({ "specialties.specialty.title": title }).toString()}`;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

// a term/description list with 1px rules between items
const FactList = ({ items }: { items: { term: string; text: string }[] }) => (
  <Stagger as="dl" inView className="divide-y border-y">
    {items.map(({ term, text }) => (
      <StaggerItem key={term} className="grid gap-1 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
        <dt className="text-base font-semibold">{term}</dt>
        <dd className="text-base leading-relaxed text-muted-foreground">{text}</dd>
      </StaggerItem>
    ))}
  </Stagger>
);

export default async function HomePage() {
  // the home page still renders if either list fails
  const [doctorsResult, specialtiesResult] = await Promise.allSettled([
    getDoctors("sortBy=averageRating&sortOrder=desc&limit=6"),
    getAllSpecialties(),
  ]);
  const doctors: IDoctors[] = doctorsResult.status === "fulfilled" ? (doctorsResult.value.data ?? []) : [];
  const specialties: ISpecialty[] = specialtiesResult.status === "fulfilled" ? (specialtiesResult.value.data ?? []) : [];
  const doctorTotal = doctorsResult.status === "fulfilled" ? (doctorsResult.value.meta?.total ?? doctors.length) : 0;

  return (
    <div className={`${newsreader.variable} text-base`}>
      {/* hero: 60/40, flat surface, real photo */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Online doctor appointments
            </p>
            <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
              See the right doctor, <em>from home.</em>
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground">
              Choose a registered specialist, book a time that suits you and talk it through on a private video call.
              Your prescription follows by email.
            </p>

            <div className="mt-9">
              <label htmlFor="hero-search" className="mb-2 block text-sm font-medium">
                Search by specialty or doctor
              </label>
              <HeroSearch />
            </div>
            <p className="mt-4">
              <Link
                href="/consultation"
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
              >
                Or browse all doctors <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </p>

            {/* trust: only numbers that come from the database */}
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t pt-6">
              {doctorTotal > 0 && (
                <div>
                  <dt className="text-sm text-muted-foreground">Registered doctors</dt>
                  <dd className="font-display text-3xl font-medium">{doctorTotal}</dd>
                </div>
              )}
              {specialties.length > 0 && (
                <div>
                  <dt className="text-sm text-muted-foreground">Specialties</dt>
                  <dd className="font-display text-3xl font-medium">{specialties.length}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Fees</dt>
                <dd className="text-base font-medium leading-9">Shown before you book</dd>
              </div>
            </dl>
          </div>

          <figure className="relative">
            <Image
              src={consultationDesk}
              alt="A doctor in a white coat listening to a patient across her desk"
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-[4/3] w-full rounded-lg border object-cover object-[48%_center] lg:aspect-[4/5]"
            />
            <figcaption className="absolute bottom-4 left-4 right-4 rounded-md border bg-card px-4 py-3 sm:right-auto sm:max-w-xs">
              <span className="block text-base font-semibold">Private video consultations</span>
              <span className="block text-sm text-muted-foreground">The call opens 10 minutes before your slot.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* emergency notice: calm, always visible */}
      <aside aria-label="Emergencies" className="border-b bg-muted">
        <p className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-4 text-base sm:px-6 lg:px-8">
          <Phone className="mt-1 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Not for emergencies.</strong> If someone is seriously ill or injured, call{" "}
            <a href="tel:999" className={`rounded-sm font-semibold underline underline-offset-4 ${focusRing}`}>
              999
            </a>{" "}
            or go to the nearest hospital.
          </span>
        </p>
      </aside>

      {/* how it works: photo + three numbered steps, uneven columns */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.35fr] lg:gap-20 lg:px-8 lg:py-24">
          <Reveal className="min-w-0">
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.01em] sm:text-5xl">
              From search to prescription in three steps.
            </h2>
            <Image
              src={familyConsultation}
              alt="A mother and her young son talking with an older doctor at his desk"
              placeholder="blur"
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="mt-10 aspect-[4/3] w-full rounded-lg border object-cover"
            />
          </Reveal>
          <Stagger as="ol" inView className="min-w-0 divide-y border-y lg:self-end">
            {STEPS.map(({ title, text }, index) => (
              <StaggerItem as="li" key={title} className="grid grid-cols-[3.5rem_1fr] gap-5 py-8 sm:grid-cols-[5rem_1fr]">
                <span className="font-display text-6xl font-medium leading-none text-muted-foreground sm:text-7xl" aria-hidden>
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">
                    <span className="sr-only">Step {index + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[36rem] text-base leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* specialties: a typographic list, not icon cards */}
      {specialties.length > 0 && (
        <section className="border-t bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.01em] sm:text-5xl">
                Browse by specialty
              </h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
                Not sure who to see? Start with the area that matches your concern; each list shows fees and ratings.
              </p>
            </div>
            <Stagger as="ul" inView className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {specialties.map((specialty) => (
                <StaggerItem as="li" key={specialty.id} className="border-b">
                  <Link
                    href={specialtyHref(specialty.title)}
                    className={`group flex min-h-14 items-center justify-between gap-4 rounded-sm py-3 font-display text-2xl transition-colors duration-100 hover:text-primary ${focusRing}`}
                  >
                    {specialty.title}
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-100 group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      aria-hidden
                    />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* doctors: horizontal rows */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.01em] sm:text-5xl">
                Top rated doctors
              </h2>
              <p className="mt-3 text-base text-muted-foreground">Ratings come from patients after a completed consultation.</p>
            </div>
            <Link
              href="/consultation"
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
            >
              See all doctors <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {doctors.length > 0 ? (
            <Stagger as="ul" inView className="mt-8 divide-y border-y">
              {doctors.map((doctor) => (
                <DoctorRow key={String(doctor.id)} doctor={doctor} />
              ))}
            </Stagger>
          ) : (
            <div className="mt-8 rounded-lg border bg-card px-6 py-10">
              <p className="text-lg font-semibold">No doctors are listed yet.</p>
              <p className="mt-1 text-base text-muted-foreground">
                New doctors appear here as soon as they join. You can already create your account.
              </p>
              <Button asChild variant="outline" className="mt-5 h-11 rounded-md px-5 text-base">
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* after the call: two photos + what you receive */}
      <section className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20 lg:px-8 lg:py-24">
          <div className="grid grid-cols-[1.6fr_1fr] gap-4">
            <Image
              src={writingPrescription}
              alt="A doctor in green scrubs writing a prescription at a desk"
              placeholder="blur"
              sizes="(min-width: 1024px) 30vw, 60vw"
              className="aspect-[4/5] h-full w-full rounded-lg border object-cover object-[60%_center]"
            />
            <Image
              src={childCheckup}
              alt="A doctor listening to a young girl's back with a stethoscope"
              placeholder="blur"
              sizes="(min-width: 1024px) 18vw, 40vw"
              className="aspect-[3/5] w-full self-end rounded-lg border object-cover object-[72%_center]"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.01em] sm:text-5xl">
              Care that doesn&apos;t end when the call does.
            </h2>
            <p className="mt-4 max-w-[36rem] text-base leading-relaxed text-muted-foreground">
              Everything from your consultation stays in your dashboard, so you are never hunting through emails.
            </p>
            <div className="mt-8">
              <FactList items={AFTER_CALL} />
            </div>
          </div>
        </div>
      </section>

      {/* privacy: facts from how the app stores data (plan.md phase 10) */}
      <section className="border-t">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-20 lg:px-8 lg:py-24">
          <div className="min-w-0">
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.01em] sm:text-5xl">
              Your medical history stays yours.
            </h2>
            <div className="mt-8">
              <FactList items={PRIVACY} />
            </div>
            <Link
              href="/privacy"
              className={`mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
            >
              Read the privacy policy <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <Image
            src={reviewingHistory}
            alt="A doctor's hands holding a patient questionnaire and a pen"
            placeholder="blur"
            sizes="(min-width: 1024px) 35vw, 100vw"
            className="aspect-[4/3] w-full rounded-lg border object-cover object-[20%_center] lg:aspect-[4/5]"
          />
        </div>
      </section>

      {/* closing call to action */}
      <section className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center lg:gap-20 lg:px-8 lg:py-24">
          <Image
            src={doctorAndPatient}
            alt="A smiling doctor going through notes on a clipboard with a patient"
            placeholder="blur"
            sizes="(min-width: 768px) 45vw, 100vw"
            className="aspect-[3/2] w-full rounded-lg border object-cover object-[65%_center]"
          />
          <div className="min-w-0">
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.01em] sm:text-5xl">
              Ready when you are.
            </h2>
            <p className="mt-4 max-w-[30rem] text-lg leading-relaxed text-muted-foreground">
              Pick a doctor and a time. You will see the fee and the cancellation terms before you confirm.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Magnetic>
                <Button asChild className="h-12 rounded-md px-6 text-base">
                  <Link href="/consultation">Book an appointment</Link>
                </Button>
              </Magnetic>
              <Link
                href="/login"
                className={`inline-flex min-h-11 items-center rounded-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
