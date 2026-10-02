import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
        <SearchX className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-md text-[13px] text-muted-foreground">The page you are looking for does not exist or was moved.</p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/consultation">Find a doctor</Link>
        </Button>
      </div>
    </main>
  );
}
