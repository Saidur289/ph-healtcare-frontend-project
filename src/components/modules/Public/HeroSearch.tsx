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
      className="flex w-full max-w-xl items-center gap-2 rounded-md border border-foreground/25 bg-card p-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        id="hero-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        maxLength={100}
        placeholder="e.g. cardiology or a doctor's name"
        className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" className="h-11 rounded-md px-5 text-base">
        Find a doctor
      </Button>
    </form>
  );
};

export default HeroSearch;
