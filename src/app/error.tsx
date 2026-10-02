"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";

// last-resort error boundary; the message stays generic (no internal details)
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-destructive">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-[13px] text-muted-foreground">
        The page could not be loaded. Please try again; if it keeps happening, come back in a few minutes.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>
          <RotateCw className="h-4 w-4" aria-hidden /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
