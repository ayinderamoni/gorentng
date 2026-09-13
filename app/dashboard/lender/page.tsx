import Link from "next/link";
import { redirect } from "next/navigation";

import { addAvailabilityAction, completeBookingAction, decideBookingAction } from "@/app/actions/items";
import { DashboardNav } from "@/components/dashboard-nav";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { listAvailability, listBookingsForLender, listItemsByLender } from "@/lib/store";

export default async function LenderDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/lender");
  const items = await listItemsByLender(user.id);
  const bookings = await listBookingsForLender(user.id);
  const availabilityByItem = Object.fromEntries(
    await Promise.all(items.map(async (item) => [item.id, await listAvailability(item.id)] as const)),
  );
  const earned = bookings.filter((row) => row.status === "completed" || row.status === "approved").reduce((sum, row) => sum + row.agreedPrice, 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <DashboardNav roles={user.roles} current="/dashboard/lender" />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Item lender</h1>
          <p className="text-sm text-ink-soft">Logged earnings {formatNaira(earned)}</p>
        </div>
        <Link href="/rent-items/new" className="rounded-full bg-ink px-4 py-2 font-head text-sm font-semibold text-cream">
          List an item
        </Link>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="font-head text-xl font-semibold">Your items</h2>
        {items.map((item) => {
          const next = bookings.find((row) => row.itemId === item.id && row.status === "approved");
          const itemEarned = bookings
            .filter((row) => row.itemId === item.id && (row.status === "approved" || row.status === "completed"))
            .reduce((sum, row) => sum + row.agreedPrice, 0);
          return (
            <article key={item.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">{item.title}</p>
              <p className="text-sm text-ink-soft">
                {item.status} · next booking {next ? `${next.startDate}–${next.endDate}` : "none"} · earned {formatNaira(itemEarned)}
              </p>
              <p className="mt-2 text-xs text-ink-soft">
                Blocked: {(availabilityByItem[item.id] ?? []).map((row) => `${row.startDate}–${row.endDate}`).join(", ") || "none"}
              </p>
              <form action={addAvailabilityAction} className="mt-3 grid gap-2 sm:grid-cols-4">
                <input type="hidden" name="itemId" value={item.id} />
                <input type="date" name="startDate" required className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <input type="date" name="endDate" required className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <input name="note" placeholder="Why blocked" className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <button className="rounded-lg bg-ink px-3 text-sm text-cream">Block dates</button>
              </form>
            </article>
          );
        })}
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold">Booking requests</h2>
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-ink/10 p-4">
              <p className="font-head font-semibold">{booking.renter?.fullName} · {booking.item?.title}</p>
              <p className="text-sm text-ink-soft">
                {booking.startDate} → {booking.endDate} · {formatNaira(booking.agreedPrice)} · {booking.status}
              </p>
              <p className="mt-1 text-sm">{booking.message}</p>
              {booking.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <form action={decideBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button className="rounded-full bg-teal px-3 py-1.5 text-sm font-semibold text-cream">Approve</button>
                  </form>
                  <form action={decideBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <button className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">Decline</button>
                  </form>
                </div>
              ) : null}
              {booking.status === "approved" ? (
                <form action={completeBookingAction} className="mt-3">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button className="text-sm font-semibold text-teal">Mark returned / completed</button>
                </form>
              ) : null}
              {booking.status === "completed" ? (
                <ReviewForm itemBookingId={booking.id} label={`Review ${booking.renter?.fullName}`} />
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
