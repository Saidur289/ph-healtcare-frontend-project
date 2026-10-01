"use client";
import { updateProfileAction } from "@/app/_actions/profile.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initials } from "@/lib/userDisplay";
import { IMyProfile } from "@/types/profile.types";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;

type TField = { name: string; label: string; type?: string; placeholder?: string; maxLength?: number };

const FIELDS: Record<string, TField[]> = {
  PATIENT: [
    { name: "name", label: "Full name", maxLength: 60 },
    { name: "contactNumber", label: "Phone", type: "tel", placeholder: "+8801XXXXXXXXX", maxLength: 16 },
    { name: "address", label: "Address", maxLength: 200 },
  ],
  DOCTOR: [
    { name: "name", label: "Full name", maxLength: 60 },
    { name: "contactNumber", label: "Phone", type: "tel", placeholder: "+8801XXXXXXXXX", maxLength: 16 },
    { name: "designation", label: "Designation", maxLength: 50 },
    { name: "qualification", label: "Qualification", maxLength: 50 },
    { name: "currentWorkingPlace", label: "Working place", maxLength: 50 },
    { name: "experience", label: "Experience (years)", type: "number" },
    { name: "address", label: "Address", maxLength: 200 },
  ],
  ADMIN: [
    { name: "name", label: "Full name", maxLength: 60 },
    { name: "contactNumber", label: "Phone", type: "tel", placeholder: "+8801XXXXXXXXX", maxLength: 16 },
  ],
};

const initialValue = (data: IMyProfile, field: string) => {
  const value = (data.profile as Record<string, unknown> | null)?.[field] ?? (field === "name" ? data.name : "");
  return value === null || value === undefined ? "" : String(value);
};

const ProfileForm = ({ data }: { data: IMyProfile }) => {
  const router = useRouter();
  const fields = FIELDS[data.role] ?? FIELDS.ADMIN;
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photo = preview ?? data.profile?.profilePhoto ?? data.image ?? undefined;

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const pickPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, profilePhoto: "Use a JPG, PNG or WEBP image up to 5 MB" }));
      event.target.value = "";
      return;
    }
    setErrors((current) => {
      const next = { ...current };
      delete next.profilePhoto;
      return next;
    });
    setPreview(URL.createObjectURL(file));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      setErrors(result.fieldErrors ?? {});
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      if (fileRef.current) fileRef.current.value = "";
      setPreview(null);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={photo} alt="" />
          <AvatarFallback className="bg-accent text-xl font-semibold text-accent-foreground">{initials(data.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Camera className="h-4 w-4" aria-hidden /> Change photo
          </Button>
          <input
            ref={fileRef}
            type="file"
            name="profilePhoto"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Profile photo"
            onChange={pickPhoto}
          />
          <p className="text-xs text-muted-foreground">JPG, PNG or WEBP, up to 5 MB.</p>
          {errors.profilePhoto && <p className="text-xs text-destructive">{errors.profilePhoto}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              defaultValue={initialValue(data, field.name)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              min={field.type === "number" ? 0 : undefined}
              max={field.type === "number" ? 70 : undefined}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
            />
            {errors[field.name] && (
              <p id={`${field.name}-error`} className="text-xs text-destructive">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={data.email} disabled readOnly />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
