import { CalendarCheck, FileText, ShieldCheck, Video } from "lucide-react";
import type { ReactNode } from "react";

const POINTS = [
  { icon: CalendarCheck, text: "Book a verified doctor in a few clicks" },
  { icon: Video, text: "Private video consultations" },
  { icon: FileText, text: "Prescriptions as PDF, straight to your inbox" },
  { icon: ShieldCheck, text: "Secure payments and protected records" },
];

// login, register, verify and password pages: form on the right, navy brand panel on large screens
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div className="hidden h-full flex-col justify-center rounded-2xl bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Care that fits your day</h2>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed">
          One account for booking, paying and meeting your doctor online.
        </p>
        <ul className="mt-8 space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[13px]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent text-white">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full min-w-0">{children}</div>
    </section>
  );
}
