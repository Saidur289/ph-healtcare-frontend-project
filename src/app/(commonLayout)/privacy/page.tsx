import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy policy | PH Healthcare" };

// Describes what the app actually does (see server/docs/data-retention.md).
// Have it reviewed by a legal advisor before launch.
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "What we collect",
    body: [
      "Account details: your name, email address, phone number, address and profile photo.",
      "Health information you choose to give: gender, date of birth, blood group, height, weight, conditions, notes and the medical reports you upload.",
      "Care records: your appointments, the prescriptions your doctors write and your reviews.",
      "Payments: the amount, status and invoice. Card details are handled by Stripe and never reach our servers.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To book and run your video consultations, send reminders, prescriptions and invoices, and keep your records available to you.",
      "Only you and the doctors you consult see your health information. Administrators manage accounts and payments; they do not see your health data or files.",
      "We do not sell your data, show advertising or use analytics trackers.",
    ],
  },
  {
    title: "How we protect it",
    body: [
      "Medical reports, prescription PDFs and invoices are stored privately. Each download uses a link that expires after a few minutes, and every access is recorded.",
      "Your health notes, report names and prescription details are encrypted in our database. All data is encrypted on disk and in backups.",
      "Video consultations run on Daily.co in private rooms that only you and your doctor can join.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Appointments, prescriptions and payments are medical and financial records and are kept for at least 10 years.",
      "Your uploaded reports and health information are kept until you delete them or your account.",
      "Security logs are kept for 6 years. Expired sessions and codes are removed after a few days.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Download all your data at any time from My Profile.",
      "Delete your account from My Profile. Your personal and health information is removed; appointments, prescriptions and payments remain as anonymous records because the law requires us to keep them.",
      "Correct your details at any time from My Profile and Health Records.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "We only use cookies that keep you signed in and protect your account (and one that remembers light or dark mode). There are no advertising or analytics cookies, so no cookie banner is needed.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="text-[13px] text-muted-foreground">Last updated 3 October 2026</p>
        <p className="text-sm text-muted-foreground">
          This policy explains what personal and health information PH Healthcare holds, why, and how you stay in control of it.
        </p>
      </header>
      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            {section.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm text-muted-foreground">
        See also the <Link href="/terms" className="font-medium text-primary hover:underline">terms of use</Link>.
      </p>
    </article>
  );
}
