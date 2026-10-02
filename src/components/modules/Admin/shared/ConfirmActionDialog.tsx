"use client";
import { TAdminResult } from "@/app/_actions/admin.actions";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

interface ConfirmActionDialogProps {
  trigger: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  // shows a reason box; the text is passed to onConfirm
  withReason?: { label: string; required?: boolean };
  onConfirm: (reason?: string) => Promise<TAdminResult>;
  // TanStack keys to refresh after success
  invalidate: string[];
  triggerVariant?: "outline" | "ghost" | "default" | "destructive";
}

// confirm step for admin actions (block, cancel, hide, delete...) with an optional reason
const ConfirmActionDialog = ({
  trigger,
  title,
  description,
  confirmLabel,
  destructive,
  withReason,
  onConfirm,
  invalidate,
  triggerVariant = "outline",
}: ConfirmActionDialogProps) => {
  const queryClient = useQueryClient();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const missingReason = Boolean(withReason?.required) && reason.trim().length < 3;

  const confirm = () =>
    startTransition(async () => {
      const result = await onConfirm(withReason ? reason.trim() || undefined : undefined);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      await Promise.all(invalidate.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
      setOpen(false);
      setReason("");
    });

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant} className={destructive && triggerVariant !== "destructive" ? "h-8 text-destructive hover:text-destructive" : "h-8"}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {withReason && (
          <div className="space-y-1.5">
            <Label htmlFor={reasonId}>{withReason.label}</Label>
            <Textarea id={reasonId} rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Back
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={confirm} disabled={pending || missingReason}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActionDialog;
