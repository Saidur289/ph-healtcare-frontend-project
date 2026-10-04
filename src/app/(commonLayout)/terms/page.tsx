import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of use | PH Healthcare" };

// Plain-language terms matching how the app works. Have them reviewed by a legal advisor before launch.
const TERMS: { title: string; text: string }[] = [
  { title: "The service", text: "PH Healthcare lets you book online video consultations with registered doctors, pay for them, and keep your prescriptions and health records in one place." },
  { title: "Not for emergencies", text: "Online consultations are not suitable for emergencies. If you need urgent help, call your local emergency number or go to the nearest hospital." },
  { title: "Your account", text: "Give accurate information, keep your password private and tell us if you think someone else used your account. You must be old enough to agree to these terms, or use the service with a parent or guardian." },
  { title: "Bookings and payment", text: "A slot is reserved when you book. Unpaid bookings are released when the payment deadline passes. You can cancel or reschedule until 2 hours before the start; paid bookings cancelled in time are refunded to the same card. Doctors may cancel when needed, and you are then refunded in full." },
  { title: "Consultations and prescriptions", text: "Your doctor is responsible for the medical advice and prescriptions they give. Follow the instructions on your prescription and contact your doctor if anything is unclear." },
  { title: "Reviews", text: "Reviews must be honest and about the consultation. We may hide reviews that are abusive or off-topic." },
  { title: "Privacy", text: "How we handle your personal and health information is described in the privacy policy." },
  { title: "Changes", text: "If these terms change in a way that affects you, we will ask you to accept the new version." },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Terms of use</h1>
        <p className="text-[13px] text-muted-foreground">Version 2026-10-03</p>
      </header>
      <ol className="space-y-5">
        {TERMS.map((term, index) => (
          <li key={term.title} className="space-y-1">
            <h2 className="text-base font-semibold">
              {index + 1}. {term.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{term.text}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">
        Read the <Link href="/privacy" className="font-medium text-primary hover:underline">privacy policy</Link>.
      </p>
    </article>
  );
}
