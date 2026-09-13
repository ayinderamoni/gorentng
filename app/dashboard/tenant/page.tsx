import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { HousingCard } from "@/components/housing-card";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { listApplicationsForTenant, listFavorites, listTenanciesForTenant } from "@/lib/store";

export default async function TenantDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tenant");
  const applications = await listApplicationsForTenant(user.id);
  const tenancies = await listTenanciesForTenant(user.id);
  const favorites = await listFavorites(user.id);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <DashboardNav roles={user.roles} current="/dashboard/tenant" />
      <h1 className="mt-6 font-display text-3xl font-extrabold">Tenant</h1>
      <section className="mt-8">
        <h2 className="font-head text-xl font-semibold">Saved homes</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {favorites.properties.map((property) =>
            property ? <HousingCard key={property.id} property={property} canSave saved /> : null,
          )}
        </div>
        {favorites.properties.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            Nothing saved yet. <Link href="/listings" className="font-semibold text-teal underline">Browse homes</Link>
          </p>
        ) : null}
      </section>
      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Applications</h2>
        <ul className="mt-4 space-y-3">
          {applications.map((application) => (
            <li key={application.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">{application.property?.title}</p>
              <p className="text-sm capitalize text-ink-soft">{application.status} · move-in {application.moveInDate}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Tenancy history</h2>
        <ul className="mt-4 space-y-3">
          {tenancies.map((tenancy) => (
            <li key={tenancy.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">{tenancy.property?.title}</p>
              <p className="text-sm text-ink-soft">
                {tenancy.property?.address}, {tenancy.property?.area} · {tenancy.startDate} → {tenancy.endDate ?? "current"}
              </p>
              <ReviewForm tenancyId={tenancy.id} label={`Review ${tenancy.landlord?.fullName}`} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
