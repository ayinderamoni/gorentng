import { createReviewAction } from "@/app/actions/reviews";

export function ReviewForm({
  tenancyId,
  itemBookingId,
  label,
}: {
  tenancyId?: string;
  itemBookingId?: string;
  label: string;
}) {
  return (
    <form action={createReviewAction} className="mt-3 space-y-2 rounded-xl border border-ink/10 bg-cream p-3">
      {tenancyId ? <input type="hidden" name="tenancyId" value={tenancyId} /> : null}
      {itemBookingId ? <input type="hidden" name="itemBookingId" value={itemBookingId} /> : null}
      <p className="font-head text-sm font-semibold">{label}</p>
      <label className="block text-sm">
        Rating
        <select name="rating" required className="mt-1 w-full rounded-lg border border-ink/15 bg-cream px-2 py-1.5">
          <option value="5">5 — excellent</option>
          <option value="4">4 — good</option>
          <option value="3">3 — okay</option>
          <option value="2">2 — poor</option>
          <option value="1">1 — avoid</option>
        </select>
      </label>
      <textarea name="comment" required rows={3} placeholder="What should the next person know?" className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
      <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 font-head text-sm font-semibold text-cream">
        Submit review
      </button>
    </form>
  );
}
