"use client";
import { deleteReportAction, uploadReportAction } from "@/app/_actions/profile.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IMedicalReport } from "@/types/profile.types";
import { format } from "date-fns";
import { FileText, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

const MedicalReports = ({ reports }: { reports: IMedicalReport[] }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [toDelete, setToDelete] = useState<IMedicalReport | null>(null);

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) return void toast.error("Use a PDF, JPG, PNG or WEBP file");
    if (file.size > MAX_BYTES) return void toast.error("The file must be 5 MB or smaller");
    const formData = new FormData();
    formData.set("report", file);
    startUpload(async () => {
      const result = await uploadReportAction(formData);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const id = toDelete.id;
    startDelete(async () => {
      const result = await deleteReportAction(id);
      setToDelete(null);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">PDF or image, up to 5 MB each.</p>
        <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          {uploading ? "Uploading..." : "Upload report"}
        </Button>
        <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload a medical report" onChange={upload} />
      </div>

      {reports.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-[13px] text-muted-foreground">No reports uploaded yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {reports.map((report) => {
            const isPdf = report.reportName.toLowerCase().endsWith(".pdf");
            const Icon = isPdf ? FileText : ImageIcon;
            return (
              <li key={report.id} className="flex items-center gap-3 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/files/reports/${report.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-[13px] font-medium hover:text-primary hover:underline"
                  >
                    {report.reportName}
                  </a>
                  <p className="text-xs text-muted-foreground">Uploaded {format(new Date(report.createdAt), "dd MMM yyyy")}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${report.reportName}`}
                  onClick={() => setToDelete(report)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{toDelete?.reportName}&quot; will be removed permanently. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicalReports;
