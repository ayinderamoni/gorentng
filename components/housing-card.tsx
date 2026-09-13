import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { togglePropertyFavoriteAction } from "@/app/actions/housing";
import { formatNaira } from "@/lib/format";
import type { PropertyWithMeta } from "@/lib/types";

export function HousingCard({
  property,
  saved = false,
  canSave = false,
}: {
  property: PropertyWithMeta;
  saved?: boolean;
  canSave?: boolean;
}) {
  const photo = property.media.find((media) => media.kind === "photo")?.url ?? "/images/listing-lekki.jpg";

  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-cream transition-transform duration-300 hover:-translate-y-1 hover:shadow-warm">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
        <Link href={`/listings/${property.slug}`}>
          <Image
            src={photo}
            alt={`${property.title} in ${property.area}, ${property.city}`}
            fill
            sizes="(max-width: 768px) 80vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {canSave ? (
          <form action={togglePropertyFavoriteAction} className="absolute right-3 top-3">
            <input type="hidden" name="propertyId" value={property.id} />
            <button
              type="submit"
              className={`grid size-10 place-items-center rounded-full bg-cream/90 ${saved ? "text-persimmon" : "text-ink"}`}
              aria-label={saved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </form>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-full bg-teal px-2.5 py-1 font-head text-[11px] font-semibold text-cream">
          For rent
        </span>
      </div>
      <Link href={`/listings/${property.slug}`} className="block p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl font-extrabold">
            {formatNaira(property.priceYearly)}{" "}
            <span className="font-body text-xs font-medium text-ink-soft">/yr</span>
          </p>
          {property.rating ? (
            <span className="inline-flex items-center gap-1 font-head text-xs font-semibold text-ink-soft">
              <Star size={14} className="fill-ochre text-ochre" /> {property.rating}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 font-head text-sm font-semibold">{property.title}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">
          {property.bedrooms} bed · {property.area}, {property.city}
        </p>
      </Link>
    </article>
  );
}
