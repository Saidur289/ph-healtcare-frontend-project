"use client";
import { setDoctorSpecialtiesAction } from "@/app/_actions/admin.actions";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getDoctorsForAdmin, getAllSpecialties } from "@/services/doctor.services";
import { IDoctors } from "@/types/doctor.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const columns: ColumnDef<IDoctors>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Doctor",
    cell: ({ row }) => <UserInfoCell name={`Dr. ${row.original.name}`} email={row.original.email} profilePhoto={row.original.profilePhoto} />,
  },
  {
    id: "specialties",
    header: "Specialties",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.specialties?.length ? (
        <span className="flex max-w-md flex-wrap gap-1">
          {row.original.specialties.map((s) => (
            <span key={s.specialty.id} className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {s.specialty.title}
            </span>
          ))}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">None yet</span>
      ),
  },
];

const EditSpecialtiesDialog = ({ doctor }: { doctor: IDoctors }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const current = new Set((doctor.specialties ?? []).map((s) => s.specialty.id));
  const [selected, setSelected] = useState<Set<string>>(current);
  const [pending, startTransition] = useTransition();
  const { data, isLoading } = useQuery({ queryKey: ["specialties"], queryFn: getAllSpecialties, enabled: open, staleTime: 5 * 60 * 1000 });

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const save = () => {
    const changes = [
      ...[...selected].filter((id) => !current.has(id)).map((specialtyId) => ({ specialtyId, shouldDelete: false })),
      ...[...current].filter((id) => !selected.has(id)).map((specialtyId) => ({ specialtyId, shouldDelete: true })),
    ];
    if (changes.length === 0) return setOpen(false);
    startTransition(async () => {
      const result = await setDoctorSpecialtiesAction(String(doctor.id), changes);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-doctor-specialties"] });
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (next) setSelected(new Set((doctor.specialties ?? []).map((s) => s.specialty.id)));
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Specialties of Dr. {doctor.name}</DialogTitle>
          <DialogDescription>Patients find the doctor under every specialty ticked here.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />
            </div>
          ) : (
            (data?.data ?? []).map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[13px] hover:bg-muted">
                <Checkbox checked={selected.has(s.id)} onCheckedChange={(v) => toggle(s.id, Boolean(v))} />
                {s.title}
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SPECIALTY_KEY = "specialties.specialty.title";

const DoctorSpecialtiesTable = ({ initialQueryString, specialtyTitles }: { initialQueryString: string; specialtyTitles: string[] }) => (
  <AdminListTable<IDoctors>
    queryKey="admin-doctor-specialties"
    fetcher={getDoctorsForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search doctors…"
    emptyMessage="No doctors found."
    filterDefinitions={[serverManagedFilter.multi(SPECIALTY_KEY)]}
    filterConfigs={[
      { id: SPECIALTY_KEY, label: "Specialty", type: "multi-select", options: specialtyTitles.map((t) => ({ label: t, value: t })) },
    ]}
    rowActions={(doctor) => <EditSpecialtiesDialog doctor={doctor} />}
  />
);

export default DoctorSpecialtiesTable;
