import { Inbox, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
    <p className="text-sm font-medium">{title}</p>
    {description && <p className="max-w-sm text-[13px] text-muted-foreground">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
