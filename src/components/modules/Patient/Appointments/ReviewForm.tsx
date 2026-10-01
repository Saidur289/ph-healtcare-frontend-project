"use client";
import { createReviewAction } from "@/app/_actions/consultation.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// Shown on a COMPLETED appointment without a review. One review per appointment (API rule).
const ReviewForm = ({ appointmentId }: { appointmentId: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Star className="mr-1 h-4 w-4" /> Leave a review
      </Button>
    );
  }

  const submit = () =>
    startTransition(async () => {
      const result = await createReviewAction({ appointmentId, rating, comment });
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });

  return (
    <div className="w-full space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onClick={() => setRating(value)}
            className="p-0.5"
          >
            <Star className={`h-6 w-6 ${value <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <Textarea
        rows={3}
        maxLength={1000}
        placeholder="How was your consultation? (at least 5 characters)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="button" disabled={pending || rating === 0} onClick={submit}>
          {pending ? "Sending..." : "Submit review"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;
