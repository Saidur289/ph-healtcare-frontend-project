import { HeartPulse } from "lucide-react";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Patients",
    links: [
      { title: "Find a doctor", href: "/consultation" },
      { title: "Create an account", href: "/register" },
      { title: "My appointments", href: "/dashboard/my-appointments" },
    ],
  },
  {
    title: "Account",
    links: [
      { title: "Log in", href: "/login" },
      { title: "Forgot password", href: "/forgot-password" },
      { title: "How it works", href: "/#how-it-works" },
    ],
  },
];

// navy like the dashboard sidebar, so the public site and the app feel like one product
const PublicFooter = () => (
  <footer className="bg-sidebar text-sidebar-foreground">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
      <div className="space-y-3">
        <Link href="/" className="flex w-fit items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-white">
            <HeartPulse className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base font-semibold text-white">PH Healthcare</span>
        </Link>
        <p className="max-w-sm text-[13px] leading-relaxed">
          Book verified doctors, pay securely and consult over private video calls. Prescriptions arrive as PDF by
          email.
        </p>
      </div>
      {COLUMNS.map((column) => (
        <div key={column.title}>
          <p className="mb-3 text-[13px] font-semibold text-white">{column.title}</p>
          <ul className="space-y-2 text-[13px]">
            {column.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white hover:underline">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-sidebar-border">
      <p className="mx-auto max-w-7xl px-4 py-4 text-xs sm:px-6 lg:px-8">
        © {new Date().getFullYear()} PH Healthcare. All rights reserved.
      </p>
    </div>
  </footer>
);

export default PublicFooter;
