import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { initials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import { getMyReviews } from "@/services/consultation.services";
import { format } from "date-fns";
import { MessageSquare, Star } from "lucide-react";

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((v) => (
      <Star key={v} className={cn("h-3.5 w-3.5", v <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} aria-hidden />
    ))}
  </span>
);

const MyReviewsPage = async () => {
  const response = await getMyReviews().catch(() => null);
  const header = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">My Reviews</h1>
      <p className="mt-0.5 text-[13px] text-muted-foreground">What patients said after their consultations.</p>
    </div>
  );
  if (!response) {
    return (
      <div className="space-y-5">
        {header}
        <ErrorState message="Could not load your reviews." />
      </div>
    );
  }

  const reviews = response.data ?? [];
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

  return (
    <div className="space-y-5">
      {header}
      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reviews yet" description="Patients can review you after a completed consultation." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="h-fit gap-4 p-5 shadow-xs">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold leading-none">{average.toFixed(1)}</span>
              <span className="pb-0.5 text-[13px] text-muted-foreground">/ 5 · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
            </div>
            <Stars rating={Math.round(average)} />
            <ul className="space-y-1.5">
              {counts.map(({ star, count }) => (
                <li key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(count / reviews.length) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </Card>

          <ul className="space-y-3 lg:col-span-2">
            {reviews.map((review) => (
              <li key={review.id} className="flex gap-3 rounded-xl border bg-card p-4 shadow-xs">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{initials(review.patient?.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-medium">{review.patient?.name ?? "Patient"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "dd MMM yyyy")}</p>
                  </div>
                  <Stars rating={review.rating} />
                  {/* plain text: the API strips HTML and React escapes it */}
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{review.comment}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
