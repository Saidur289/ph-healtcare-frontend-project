import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyReviews } from "@/services/consultation.services";
import { format } from "date-fns";
import { Star } from "lucide-react";

const MyReviewsPage = async () => {
  const response = await getMyReviews();
  const reviews = response.data ?? [];
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">My Reviews</h1>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {average.toFixed(1)} from {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </p>
      </div>
      {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span>{review.patient?.name ?? "Patient"}</span>
              <span className="flex" aria-label={`${review.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star key={v} className={`h-4 w-4 ${v <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                ))}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {/* comments are plain text (HTML stripped by the API) and rendered as text */}
            <p>{review.comment}</p>
            <p className="mt-1 text-xs text-muted-foreground">{format(new Date(review.createdAt), "MMM d, yyyy")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyReviewsPage;
