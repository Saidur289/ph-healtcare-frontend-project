"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

// error card with a retry button; retry re-runs the page's server fetches
const ErrorState = ({ message = "Something went wrong.", onRetry }: { message?: string; onRetry?: () => void }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const retry = () => (onRetry ? onRetry() : startTransition(() => router.refresh()));

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-10 text-center"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-[13px] text-muted-foreground">{message}</p>
      <Button size="sm" variant="outline" onClick={retry} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RotateCw className="h-4 w-4" aria-hidden />}
        Try again
      </Button>
    </div>
  );
};

export default ErrorState;
