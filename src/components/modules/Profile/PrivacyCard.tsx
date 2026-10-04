"use client";
import { deleteMyAccountAction } from "@/app/_actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

// Patient privacy controls: download everything we hold, or delete the account.
const PrivacyCard = ({ hasPassword }: { hasPassword: boolean }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccountAction(hasPassword ? { password: value } : { confirm: value });
      if (!result.success) return setError(result.message);
      toast.success(result.message);
      queryClient.clear();
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <Card className="gap-4 p-5 shadow-xs">
      <div>
        <p className="text-[15px] font-semibold">Your data</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          See how we handle it in the{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* a route handler returns the JSON as a file download */}
        <Button asChild variant="outline" size="sm">
          <a href="/account/export" download>
            <Download className="h-4 w-4" aria-hidden /> Download my data
          </a>
        </Button>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (pending) return;
            setOpen(next);
            if (!next) {
              setValue("");
              setError(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" aria-hidden /> Delete my account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                Your profile, health information and uploaded reports are deleted and you are signed out. Appointments,
                prescriptions and payments stay as anonymous records because we must keep them. This can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <form id="delete-account-form" onSubmit={submit} className="space-y-1.5">
              <Label htmlFor="delete-account-confirm">{hasPassword ? "Your password" : 'Type "DELETE" to confirm'}</Label>
              <Input
                id="delete-account-confirm"
                type={hasPassword ? "password" : "text"}
                autoComplete={hasPassword ? "current-password" : "off"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={128}
                aria-invalid={Boolean(error)}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Keep my account
              </Button>
              <Button type="submit" form="delete-account-form" variant="destructive" disabled={pending || !value}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Delete account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default PrivacyCard;
