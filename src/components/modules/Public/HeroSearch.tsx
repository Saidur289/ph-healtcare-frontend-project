"use client";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

// sends the visitor to the doctor list with ?searchTerm=
const HeroSearch = () => {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = term.trim().slice(0, 100);
    router.push(value ? `/consultation?searchTerm=${encodeURIComponent(value)}` : "/consultation");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full max-w-xl items-center gap-2 rounded-xl border bg-card p-1.5 shadow-xs focus-within:border-ring"
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        maxLength={100}
        placeholder="Doctor name, specialty or hospital…"
        aria-label="Search doctors"
        className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" className="h-10 px-5">
        Search
      </Button>
    </form>
  );
};

export default HeroSearch;
