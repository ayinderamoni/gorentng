import Link from "next/link";
import { redirect } from "next/navigation";

import { addMaintenanceAction, addRentPaymentAction, decideApplicationAction, endTenancyAction } from "@/app/actions/housing";
import { DashboardNav } from "@/components/dashboard-nav";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import {
  earningsForLandlord,
  listApplicationsForLandlord,
  listMaintenance,
  listPaymentsForTenancy,
  listPropertiesByLandlord,
  listTenanciesForLandlord,
} from "@/lib/store";

export default async function LandlordDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/landlord");

  const properties = await listPropertiesByLandlord(user.id);
  const applications = await listApplicationsForLandlord(user.id);
  const tenancies = await listTenanciesForLandlord(user.id);
  const payments = await earningsForLandlord(user.id);
  const totalEarned = payments.reduce((sum, row) => sum + row.amount, 0);
  const maintenanceByProperty = Object.fromEntries(
    await Promise.all(properties.map(async (property) => [property.id, await listMaintenance(property.id)] as const)),
  );
  const paymentsByTenancy = Object.fromEntries(
    await Promise.all(tenancies.map(async (tenancy) => [tenancy.id, await listPaymentsForTenancy(tenancy.id)] as const)),
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <DashboardNav roles={user.roles} current="/dashboard/landlord" />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Landlord</h1>
          <p className="mt-1 text-sm text-ink-soft">Your homes, incoming applications, rent received.</p>
        </div>
        <Link href="/listings/new" className="rounded-full bg-ink px-4 py-2 font-head text-sm font-semibold text-cream">
          Add listing
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Properties" value={String(properties.length)} />
        <Stat label="Pending applications" value={String(applications.filter((row) => row.status === "pending").length)} />
        <Stat label="Rent logged" value={formatNaira(totalEarned)} />
      </div>

      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Properties</h2>
        <div className="mt-4 space-y-3">
          {properties.map((property) => {
            const current = tenancies.find((row) => row.propertyId === property.id && !row.endDate);
            const maint = maintenanceByProperty[property.id] ?? [];
            const maintTotal = maint.reduce((sum, row) => sum + row.cost, 0);
            const earned = tenancies
              .filter((row) => row.propertyId === property.id)
              .flatMap((row) => paymentsByTenancy[row.id] ?? [])
              .reduce((sum, row) => sum + row.amount, 0);
            return (
              <article key={property.id} className="rounded-2xl border border-ink/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-head font-semibold">{property.title}</h3>
                    <p className="text-sm text-ink-soft">
                      {property.occupancyStatus} · {current ? `Tenant: ${current.tenant?.fullName}` : "No current tenant"}
                    </p>
                    <p className="mt-1 text-sm">Earned {formatNaira(earned)} · Maintenance {formatNaira(maintTotal)}</p>
                  </div>
                  <Link href={`/listings/${property.slug}/edit`} className="text-sm font-semibold text-teal">Edit</Link>
                </div>
                <form action={addMaintenanceAction} className="mt-4 grid gap-2 sm:grid-cols-4">
                  <input type="hidden" name="propertyId" value={property.id} />
                  <input type="date" name="date" required className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                  <input name="description" required placeholder="Maintenance note" className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm sm:col-span-2" />
                  <div className="flex gap-2">
                    <input name="cost" type="number" required placeholder="₦" className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                    <button type="submit" className="rounded-lg bg-ink px-3 text-sm text-cream">Log</button>
                  </div>
                </form>
              </article>
            );
          })}
          {properties.length === 0 ? <p className="text-sm text-ink-soft">No homes yet. List one — it takes a few minutes on a phone.</p> : null}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Applications</h2>
        <div className="mt-4 space-y-3">
          {applications.map((application) => (
            <article key={application.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">{application.tenant?.fullName} → {application.property?.title}</p>
              <p className="text-sm text-ink-soft">Move-in {application.moveInDate} · {application.status}</p>
              <p className="mt-2 text-sm">{application.message}</p>
              {application.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <form action={decideApplicationAction}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button className="rounded-full bg-teal px-3 py-1.5 text-sm font-semibold text-cream">Approve</button>
                  </form>
                  <form action={decideApplicationAction}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <button className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">Decline</button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Tenancies &amp; rent</h2>
        <div className="mt-4 space-y-3">
          {tenancies.map((tenancy) => (
            <article key={tenancy.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">
                {tenancy.tenant?.fullName} at {tenancy.property?.title}
              </p>
              <p className="text-sm text-ink-soft">
                {tenancy.startDate} → {tenancy.endDate ?? "ongoing"}
              </p>
              <form action={addRentPaymentAction} className="mt-3 grid gap-2 sm:grid-cols-4">
                <input type="hidden" name="tenancyId" value={tenancy.id} />
                <input type="date" name="date" required className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <input name="amount" type="number" required placeholder="Amount ₦" className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <input name="note" placeholder="Note" className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <button className="rounded-lg bg-ink px-3 text-sm text-cream">Log payment</button>
              </form>
              {!tenancy.endDate ? (
                <form action={endTenancyAction} className="mt-2 flex gap-2">
                  <input type="hidden" name="tenancyId" value={tenancy.id} />
                  <input type="date" name="endDate" required className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                  <button className="text-sm font-semibold text-persimmon">End tenancy</button>
                </form>
              ) : (
                <ReviewForm tenancyId={tenancy.id} label={`Review ${tenancy.tenant?.fullName}`} />
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-4">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}
