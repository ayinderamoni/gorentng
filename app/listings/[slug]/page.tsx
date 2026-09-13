import { Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { applyToPropertyAction } from "@/app/actions/housing";
import { JsonLd } from "@/components/json-ld";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { housingDescription, housingJsonLd, housingTitle } from "@/lib/seo";
import { getPropertyBySlug, listApplicationsForTenant } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Listing not found" };
  const photo = property.media.find((media) => media.kind === "photo")?.url;
  const title = housingTitle(property);
  return {
    title: { absolute: title },
    description: housingDescription(property),
    openGraph: {
      title,
      description: housingDescription(property),
      images: photo ? [{ url: photo }] : undefined,
    },
  };
}

export default async function HousingListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  const user = await getCurrentUser();
  const alreadyApplied = user
    ? (await listApplicationsForTenant(user.id)).some((application) => application.propertyId === property.id)
    : false;
  const photos = property.media.filter((media) => media.kind === "photo");
  const video = property.media.find((media) => media.kind === "video");

  return (
    <article className="mx-auto max-w-7xl px-5 py-10">
      <JsonLd data={housingJsonLd(property)} />
      <div className="grid gap-3 md:grid-cols-2">
        {photos.map((media) => (
          <figure key={media.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-deep">
            <Image
              src={media.url}
              alt={media.label ? `${media.label} — ${property.title}` : property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {media.label ? (
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 font-head text-[11px] font-semibold text-cream">
                {media.label}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      {video ? (
        <video className="mt-3 w-full rounded-2xl" controls src={video.url} preload="metadata">
          Walkthrough of {property.title}
        </video>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-persimmon">
            {property.area}, {property.city}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{property.title}</h1>
          <p className="mt-3 font-display text-2xl font-extrabold">
            {formatNaira(property.priceYearly)} <span className="text-base font-medium text-ink-soft">/year</span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {property.bedrooms} bedroom · {property.bathrooms} bathroom · {property.propertyType} ·{" "}
            {property.occupancyStatus === "vacant" ? "Vacant" : "Currently occupied"}
          </p>
          <p className="mt-6 leading-relaxed text-ink-soft">{property.description}</p>
          <h2 className="mt-8 font-head text-lg font-semibold">Amenities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {property.amenities.map((amenity) => (
              <li key={amenity} className="rounded-full bg-cream-deep px-3 py-1 text-sm">{amenity}</li>
            ))}
          </ul>
          <h2 className="mt-8 font-head text-lg font-semibold">Landlord</h2>
          <p className="mt-2 text-sm">
            {property.landlord.fullName}
            {property.rating ? (
              <span className="ml-2 inline-flex items-center gap-1 text-ink-soft">
                <Star size={14} className="fill-ochre text-ochre" /> {property.rating} ({property.reviewCount})
              </span>
            ) : (
              <span className="ml-2 text-ink-soft">New on GoRent.ng</span>
            )}
          </p>
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-cream p-5">
          <h2 className="font-head text-lg font-semibold">Apply to this home</h2>
          <p className="mt-1 text-sm text-ink-soft">Short form. The landlord sees it on their dashboard.</p>
          {!user ? (
            <Link href={`/login?next=/listings/${property.slug}`} className="mt-4 block rounded-xl bg-ink px-4 py-3 text-center font-head text-sm font-semibold text-cream">
              Sign in to apply
            </Link>
          ) : alreadyApplied ? (
            <p className="mt-4 rounded-xl bg-teal/10 px-3 py-2 text-sm text-teal">You already applied. Track it in your tenant dashboard.</p>
          ) : user.id === property.landlordId ? (
            <Link href={`/listings/${property.slug}/edit`} className="mt-4 block rounded-xl bg-ink px-4 py-3 text-center font-head text-sm font-semibold text-cream">
              Edit your listing
            </Link>
          ) : (
            <form action={applyToPropertyAction} className="mt-4 space-y-3">
              <input type="hidden" name="propertyId" value={property.id} />
              <input type="hidden" name="slug" value={property.slug} />
              <label className="block text-sm">
                Move-in date
                <input type="date" name="moveInDate" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
              </label>
              <label className="block text-sm">
                Message
                <textarea name="message" required rows={4} className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
              </label>
              <label className="block text-sm">
                Income (optional)
                <input name="income" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
              </label>
              <label className="block text-sm">
                Employment (optional)
                <input name="employment" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
              </label>
              <button type="submit" className="w-full rounded-xl bg-persimmon px-4 py-3 font-head text-sm font-semibold text-cream">
                Send application
              </button>
            </form>
          )}
          <Link href={`/report?propertyId=${property.id}&landlordId=${property.landlordId}`} className="mt-4 block text-center text-sm font-semibold text-persimmon underline">
            Report this listing
          </Link>
        </aside>
      </div>
    </article>
  );
}
