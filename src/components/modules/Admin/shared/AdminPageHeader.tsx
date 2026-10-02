import { ReactNode } from "react";

const AdminPageHeader = ({ title, description, children }: { title: string; description: string; children?: ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

export default AdminPageHeader;
