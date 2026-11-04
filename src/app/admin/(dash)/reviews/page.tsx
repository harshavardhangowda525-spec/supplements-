import { requireAdmin } from "@/lib/admin/auth";
import { adminReviews } from "@/lib/admin/queries";
import { DeleteReviewButton, StatusSelect } from "@/components/admin/status-select";
import { Stars } from "@/components/brand/icons";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const { sb } = await requireAdmin();
  const reviews = await adminReviews(sb);
  const pending = reviews.filter((r) => r.status === "pending").length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Reviews</h1>
        <p className="mt-1 text-sm text-mist">
          Reviews submitted on the website ({pending} awaiting moderation). Only approved reviews are published. Google
          reviews are managed on Google.
        </p>
      </div>
      {reviews.length === 0 ? (
        <div className="metal-border rounded-2xl p-10 text-center text-mist">No website reviews yet.</div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="metal-border flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Stars rating={r.rating} />
                  <span className="font-heading text-sm font-semibold">{r.name}</span>
                  <span className="text-xs text-mist">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                </div>
                <p className="mt-2 text-sm text-white/85">{r.comment}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusSelect id={r.id} value={r.status} kind="review" />
                <DeleteReviewButton id={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
