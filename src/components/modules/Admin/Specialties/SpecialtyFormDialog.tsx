"use client";
import { createSpecialtyAction, updateSpecialtyAction } from "@/app/_actions/admin.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IAdminSpecialty } from "@/types/admin.types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { FormEvent, ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;

// create (no specialty) or edit (with specialty)
const SpecialtyFormDialog = ({ specialty, trigger }: { specialty?: IAdminSpecialty; trigger?: ReactNode }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const editing = Boolean(specialty);
  const prefix = specialty ? `sp-${specialty.id}` : "sp-new";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const icon = formData.get("icon");
    if (icon instanceof File && icon.size > 0 && (!["image/jpeg", "image/png", "image/webp"].includes(icon.type) || icon.size > MAX_BYTES)) {
      setErrors({ icon: "Use a JPG, PNG or WEBP image up to 5 MB" });
      return;
    }
    startTransition(async () => {
      const result = specialty ? await updateSpecialtyAction(specialty.id, formData) : await createSpecialtyAction(formData);
      setErrors(result.fieldErrors ?? {});
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-specialties"] }),
        queryClient.invalidateQueries({ queryKey: ["specialties"] }),
      ]);
      setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) setErrors({});
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" aria-hidden /> Add specialty
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit specialty" : "New specialty"}</DialogTitle>
          <DialogDescription>Patients filter doctors by these.</DialogDescription>
        </DialogHeader>
        <form id={`${prefix}-form`} onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-title`}>Title</Label>
            <Input
              id={`${prefix}-title`}
              name="title"
              defaultValue={specialty?.title}
              maxLength={60}
              required={!editing}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-description`}>Description</Label>
            <Textarea
              id={`${prefix}-description`}
              name="description"
              rows={3}
              maxLength={300}
              defaultValue={specialty?.description ?? ""}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-icon`}>Icon {editing && <span className="font-normal text-muted-foreground">(leave empty to keep)</span>}</Label>
            <Input id={`${prefix}-icon`} name="icon" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(errors.icon)} />
            {errors.icon && <p className="text-xs text-destructive">{errors.icon}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={`${prefix}-form`} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {editing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpecialtyFormDialog;
