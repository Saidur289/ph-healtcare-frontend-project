import { format } from "date-fns";
import { ReactNode } from "react";

// page header from the design: "Hello, Dr. {name}" with today's date underneath
const DashboardGreeting = ({ name, children }: { name: string; children?: ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Hello, {name}</h1>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
    </div>
    {children}
  </div>
);

export default DashboardGreeting;
