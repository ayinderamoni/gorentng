import { Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requestItemAction } from "@/app/actions/items";
import { JsonLd } from "@/components/json-ld";
import { getCurrentUser } from "@/lib/auth";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { formatNaira } from "@/lib/format";
import { itemDescription, itemJsonLd, itemTitle } from "@/lib/seo";
import { getItemBySlug, listAvailability, listBookingsForRenter } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return { title: "Item not found" };
  const title = itemTitle(item);
  return {
    title: { absolute: title },
    description: itemDescription(item),
    openGraph: {
      title,
      description: itemDescription(item),
      images: item.media[0] ? [{ url: item.media[0].url }] : undefined,
    },
  };
}

export default async function ItemListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) notFound();
  const user = await getCurrentUser();
  const category = ITEM_CATEGORIES.find((row) => row.value === item.category)?.label;
  const blocked = await listAvailability(item.id);
  const alreadyRequested = user
    ? (await listBookingsForRenter(user.id)).some((booking) => booking.itemId === item.id && booking.status === "pending")
    : false;

  return (
    <article className="mx-auto max-w-7xl px-5 py-10">
      <JsonLd data={itemJsonLd(item)} />
      <div className="grid gap-3 md:grid-cols-2">
        {item.media.map((media) => (
          <div key={media.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-deep">
            <Image src={media.url} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-persimmon">{category}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{item.title}</h1>
          <p className="mt-3 font-display text-2xl font-extrabold">
            {formatNaira(item.pricePerDay)} <span className="text-base font-medium text-ink-soft">/day</span>
            {item.pricePerWeek ? (
              <span className="ml-3 text-lg">{formatNaira(item.pricePerWeek)}/week</span>
            ) : null}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Pickup in {item.pickupArea}, {item.pickupCity} · Condition: {item.condition.replace("_", " ")}
          </p>
          <p className="mt-6 leading-relaxed text-ink-soft">{item.description}</p>
          {blocked.length > 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Unavailable: {blocked.map((row) => `${row.startDate}–${row.endDate}`).join(", ")}
            </p>
          ) : null}
          <h2 className="mt-8 font-head text-lg font-semibold">Lender</h2>
          <p className="mt-2 text-sm">
            {item.lender.fullName}
            {item.rating ? (
              <span className="ml-2 inline-flex items-center gap-1 text-ink-soft">
                <Star size={14} className="fill-ochre text-ochre" /> {item.rating}
              </span>
            ) : null}
          </p>
        </div>
        <aside className="h-fit rounded-2xl border border-ink/10 bg-cream p-5">
          <h2 className="font-head text-lg font-semibold">Request this item</h2>
          {!user ? (
            <Link href={`/login?next=/rent-items/${item.slug}`} className="mt-4 block rounded-xl bg-ink px-4 py-3 text-center font-head text-sm font-semibold text-cream">
              Sign in to request
            </Link>
          ) : alreadyRequested ? (
            <p className="mt-4 text-sm text-teal">You already have a pending request.</p>
          ) : user.id === item.lenderId ? (
            <p className="mt-4 text-sm text-ink-soft">This is your listing. Manage bookings from your lender dashboard.</p>
          ) : (
            <form action={requestItemAction} className="mt-4 space-y-3">
              <input type="hidden" name="itemId" value={item.id} />
              <label className="block text-sm">
                Start
                <input type="date" name="startDate" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
              </label>
              <label className="block text-sm">
                End
                <input type="date" name="endDate" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
              </label>
              <textarea name="message" required rows={3} placeholder="When will you pick it up?" className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" />
              <button type="submit" className="w-full rounded-xl bg-ink px-4 py-3 font-head text-sm font-semibold text-cream">
                Send request
              </button>
            </form>
          )}
          <Link href="/report" className="mt-4 block text-center text-sm font-semibold text-persimmon underline">
            Report this listing
          </Link>
        </aside>
      </div>
    </article>
  );
}
