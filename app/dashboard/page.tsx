import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { getCurrentUser } from "@/lib/auth";

const ROLES = [
  { href: "/dashboard/landlord", title: "Landlord", body: "List homes, review applications, track rent and maintenance.", cta: "List a home", ctaHref: "/listings/new" },
  { href: "/dashboard/tenant", title: "Tenant", body: "Saved homes, applications, tenancy history.", cta: "Browse homes", ctaHref: "/listings" },
  { href: "/dashboard/lender", title: "Item lender", body: "List idle items, approve bookings, track earnings.", cta: "List an item", ctaHref: "/rent-items/new" },
  { href: "/dashboard/renter", title: "Item renter", body: "Saved items, booking requests, rental history.", cta: "Browse items", ctaHref: "/rent-items" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <DashboardNav roles={user.roles} current="/dashboard" />
      <h1 className="mt-6 font-display text-3xl font-extrabold">Hi, {user.fullName.split(" ")[0]}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        One profile. Open whichever role you need — you do not create a second account.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {ROLES.map((role) => (
          <article key={role.href} className="rounded-2xl border border-ink/10 bg-cream p-6">
            <h2 className="font-head text-lg font-semibold">{role.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{role.body}</p>
            <div className="mt-4 flex gap-3">
              <Link href={role.href} className="rounded-full bg-ink px-4 py-2 font-head text-sm font-semibold text-cream">
                Open
              </Link>
              <Link href={role.ctaHref} className="rounded-full px-4 py-2 font-head text-sm font-semibold text-teal">
                {role.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
