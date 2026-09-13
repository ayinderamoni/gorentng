import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { ItemCard } from "@/components/item-card";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { listBookingsForRenter, listFavorites } from "@/lib/store";

export default async function RenterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/renter");
  const bookings = await listBookingsForRenter(user.id);
  const favorites = await listFavorites(user.id);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <DashboardNav roles={user.roles} current="/dashboard/renter" />
      <h1 className="mt-6 font-display text-3xl font-extrabold">Item renter</h1>
      <section className="mt-8">
        <h2 className="font-head text-xl font-semibold">Saved items</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {favorites.items.map((item) => (item ? <ItemCard key={item.id} item={item} canSave saved /> : null))}
        </div>
        {favorites.items.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            <Link href="/rent-items" className="font-semibold text-teal underline">Browse items</Link>
          </p>
        ) : null}
      </section>
      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Booking requests</h2>
        <ul className="mt-4 space-y-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">{booking.item?.title}</p>
              <p className="text-sm capitalize text-ink-soft">
                {booking.status} · {booking.startDate} → {booking.endDate} · {formatNaira(booking.agreedPrice)}
              </p>
              {booking.status === "completed" ? (
                <ReviewForm itemBookingId={booking.id} label={`Review ${booking.lender?.fullName}`} />
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
