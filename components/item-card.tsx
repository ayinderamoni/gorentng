import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { toggleItemFavoriteAction } from "@/app/actions/items";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { formatNaira } from "@/lib/format";
import type { ItemWithMeta } from "@/lib/types";

export function ItemCard({
  item,
  saved = false,
  canSave = false,
}: {
  item: ItemWithMeta;
  saved?: boolean;
  canSave?: boolean;
}) {
  const photo = item.media[0]?.url ?? "/images/listing-ikoyi.jpg";
  const category = ITEM_CATEGORIES.find((row) => row.value === item.category)?.label;

  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-cream hover:shadow-warm">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
        <Link href={`/rent-items/${item.slug}`}>
          <Image
            src={photo}
            alt={`${item.title} for rent in ${item.pickupArea}`}
            fill
            sizes="(max-width: 768px) 80vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {canSave ? (
          <form action={toggleItemFavoriteAction} className="absolute right-3 top-3">
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className={`grid size-10 place-items-center rounded-full bg-cream/90 ${saved ? "text-persimmon" : "text-ink"}`}
              aria-label={saved ? `Remove ${item.title} from saved items` : `Save ${item.title}`}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </form>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink px-2.5 py-1 font-head text-[11px] font-semibold text-cream">
          {category}
        </span>
      </div>
      <Link href={`/rent-items/${item.slug}`} className="block p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl font-extrabold">
            {formatNaira(item.pricePerDay)}{" "}
            <span className="font-body text-xs font-medium text-ink-soft">/day</span>
          </p>
          {item.rating ? (
            <span className="inline-flex items-center gap-1 font-head text-xs font-semibold text-ink-soft">
              <Star size={14} className="fill-ochre text-ochre" /> {item.rating}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 font-head text-sm font-semibold">{item.title}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">
          {item.pickupArea}, {item.pickupCity}
        </p>
      </Link>
    </article>
  );
}
