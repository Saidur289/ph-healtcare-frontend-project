"use client";
import { createAdminAction, updateAdminAction } from "@/app/_actions/admin.actions";
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
import { IAdminUser } from "@/types/admin.types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

// create (no admin) or edit name / phone (with admin)
const AdminFormDialog = ({ admin }: { admin?: IAdminUser }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const prefix = admin ? `adm-${admin.id}` : "adm-new";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "");
    startTransition(async () => {
      const result = admin
        ? await updateAdminAction(admin.id, { name: value("name"), contactNumber: value("contactNumber") })
        : await createAdminAction({
            name: value("name"),
            email: value("email"),
            contactNumber: value("contactNumber"),
            password: value("password"),
          });
      setErrors(result.fieldErrors ?? {});
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
      setOpen(false);
    });
  };

  const field = (name: string, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`${prefix}-${name}`}>{label}</Label>
      <Input
        id={`${prefix}-${name}`}
        name={name}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${prefix}-${name}-error` : undefined}
        {...props}
      />
      {errors[name] && (
        <p id={`${prefix}-${name}-error`} className="text-xs text-destructive">
          {errors[name]}
        </p>
      )}
    </div>
  );

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
        {admin ? (
          <Button size="sm" variant="outline" className="h-8">
            Edit
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" aria-hidden /> Add admin
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{admin ? `Edit ${admin.name}` : "New admin"}</DialogTitle>
          <DialogDescription>
            {admin ? "Name and phone. The email can't be changed." : "They log in with this email and must set their own password first."}
          </DialogDescription>
        </DialogHeader>
        <form id={`${prefix}-form`} onSubmit={submit} noValidate className="space-y-4">
          {field("name", "Full name", { defaultValue: admin?.name, maxLength: 60, autoComplete: "off" })}
          {!admin && field("email", "Email", { type: "email", maxLength: 254, autoComplete: "off" })}
          {field("contactNumber", "Phone (optional)", { type: "tel", defaultValue: admin?.contactNumber ?? "", maxLength: 14 })}
          {!admin && field("password", "Temporary password", { type: "password", maxLength: 128, autoComplete: "new-password" })}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={`${prefix}-form`} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {admin ? "Save" : "Create admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFormDialog;
