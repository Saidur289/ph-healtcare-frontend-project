"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw } from "lucide-react";

// keeps the sidebar and top bar when one dashboard page fails to load
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-semibold">This page could not be loaded</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">The server may be busy. Try again in a moment.</p>
      <Button size="sm" variant="outline" onClick={reset}>
        <RotateCw className="h-4 w-4" aria-hidden /> Try again
      </Button>
    </div>
  );
}
