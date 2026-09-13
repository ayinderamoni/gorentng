import type { Metadata } from "next";

import { createReportAction } from "@/app/actions/reports";
import { listLiveProperties } from "@/lib/store";

export const metadata: Metadata = {
  title: "Report a listing",
  description: "Tell us if a listing looks fake, misleading, or not as described.",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string; landlordId?: string; submitted?: string }>;
}) {
  const params = await searchParams;
  const properties = await listLiveProperties();

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold">Report a listing</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Use this if photos look fake, the place is not as described, or something else is wrong. You can stay anonymous.
      </p>
      {params.submitted ? (
        <p className="mt-6 rounded-2xl bg-teal/10 px-4 py-3 font-head text-sm font-semibold text-teal" role="status">
          Received. It sits in the review queue — thank you.
        </p>
      ) : (
        <form action={createReportAction} className="mt-8 space-y-4">
          {params.landlordId ? <input type="hidden" name="landlordId" value={params.landlordId} /> : null}
          <label className="block text-sm">
            Listing
            <select name="propertyId" defaultValue={params.propertyId ?? ""} className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5">
              <option value="">I&apos;m not sure / not listed</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} — {property.area}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            What happened
            <textarea name="description" required rows={5} className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            Evidence (optional screenshot)
            <input type="file" name="evidence" accept="image/*" className="mt-1" />
          </label>
          <label className="block text-sm">
            Contact (optional)
            <input name="contact" placeholder="Email or phone — leave blank to stay anonymous" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
          </label>
          <button type="submit" className="w-full rounded-xl bg-persimmon py-3 font-head text-sm font-semibold text-cream">
            Submit report
          </button>
        </form>
      )}
    </div>
  );
}
