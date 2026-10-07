"use client";
import Image from "next/image";
import { deleteSpecialtyAction } from "@/app/_actions/admin.actions";
import ConfirmActionDialog from "@/components/modules/Admin/shared/ConfirmActionDialog";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSpecialtiesForAdmin } from "@/services/admin.services";
import { springs } from "@/lib/motion";
import { useQuery } from "@tanstack/react-query";
import { Hospital, Pencil, Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import SpecialtyFormDialog from "./SpecialtyFormDialog";

const SpecialtiesGrid = () => {
  const [term, setTerm] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-specialties"],
    queryFn: () => getSpecialtiesForAdmin(),
  });
  const needle = term.trim().toLowerCase();
  const specialties = (data?.data ?? []).filter(
    (s) => !needle || s.title.toLowerCase().includes(needle) || (s.description ?? "").toLowerCase().includes(needle),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Filter specialties"
            aria-label="Filter specialties"
            className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-[13px] outline-none focus:border-ring"
          />
        </div>
        <SpecialtyFormDialog />
      </div>

      {isError ? (
        <ErrorState message="Could not load specialties." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : specialties.length === 0 ? (
        <EmptyState icon={Hospital} title={needle ? "No specialty matches" : "No specialties yet"} description="Add the first one so doctors can be grouped." />
      ) : (
        // cards cascade in; filtering slides the rest into the freed places
        <Stagger as="ul" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {specialties.map((s) => (
              <StaggerItem
                as="li"
                key={s.id}
                layout
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                whileHover={{ y: -2 }}
                transition={springs.snappy}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {s.icon ? (
                    // resized and converted by next/image (Cloudinary is allowed in next.config.ts)
                    <Image src={s.icon} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                      <Hospital className="h-5 w-5" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s._count?.doctorSpecialty ?? 0} doctor{s._count?.doctorSpecialty === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {s.description && <p className="line-clamp-2 text-[13px] text-muted-foreground">{s.description}</p>}
                <div className="mt-auto flex justify-end gap-2">
                  <SpecialtyFormDialog
                    specialty={s}
                    trigger={
                      <Button size="sm" variant="outline" className="h-8" aria-label={`Edit ${s.title}`}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                      </Button>
                    }
                  />
                  <ConfirmActionDialog
                    trigger="Remove"
                    title={`Remove "${s.title}"?`}
                    description="It disappears from the doctor search and profiles. Doctors keep their other specialties. Creating it again with the same title brings it back."
                    confirmLabel="Remove"
                    destructive
                    triggerVariant="ghost"
                    onConfirm={() => deleteSpecialtyAction(s.id)}
                    invalidate={["admin-specialties", "specialties"]}
                  />
                </div>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </Stagger>
      )}
    </div>
  );
};

export default SpecialtiesGrid;
