import { redirect } from "next/navigation";

import { createPropertyAction } from "@/app/actions/housing";
import { PropertyForm } from "@/components/property-form";
import { getCurrentUser } from "@/lib/auth";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/listings/new");

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">List a home</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Keep it honest and mobile-friendly. People apply to you from the listing page.
      </p>
      <div className="mt-8">
        <PropertyForm action={createPropertyAction} />
      </div>
    </div>
  );
}
