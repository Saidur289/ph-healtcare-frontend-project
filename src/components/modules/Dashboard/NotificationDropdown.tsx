"use client";

import { getNotificationsAction } from "@/app/_actions/dashboard.actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryKeys } from "@/lib/queryKeys";
import { IDashboardNotice } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, CreditCard, Loader2, Video } from "lucide-react";
import Link from "next/link";

const NoticeIcon = ({ kind }: { kind: IDashboardNotice["kind"] }) =>
  kind === "call" ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-soft text-primary">
      <Video className="h-4 w-4" aria-hidden />
    </span>
  ) : (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
      <CreditCard className="h-4 w-4" aria-hidden />
    </span>
  );

// loaded in the background so it never slows the page down
const NotificationDropdown = () => {
  const { data: notices = [], isLoading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => getNotificationsAction(),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
  const count = notices.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={count ? `Notifications (${count})` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-card">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-sm">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="flex justify-center p-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" />
          </div>
        ) : count === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notices.map((notice) => (
              <DropdownMenuItem key={notice.id} asChild className="cursor-pointer items-start gap-3 p-3">
                <Link href={notice.href}>
                  <NoticeIcon kind={notice.kind} />
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-sm font-medium">{notice.title}</span>
                    <span className="block text-xs text-muted-foreground">{notice.message}</span>
                    <span className="block text-xs text-muted-foreground">
                      {format(new Date(notice.at), "EEE, MMM d • hh:mm a")}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
