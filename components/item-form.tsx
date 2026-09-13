"use client";

import { useActionState } from "react";

import { ListingMediaFields } from "@/components/listing-media-fields";
import type { FormActionState } from "@/lib/action-state";
import { CITIES, ITEM_CATEGORIES, ITEM_CONDITIONS } from "@/lib/constants";
import type { ItemWithMeta } from "@/lib/types";

export function ItemForm({
  action,
  item,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  item?: ItemWithMeta;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-xl border border-persimmon/30 bg-persimmon/10 px-3 py-2 text-sm text-persimmon">{state.error}</p>
      ) : null}
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Title</span>
        <input name="title" required defaultValue={item?.title} placeholder="3.5kVA generator" className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-persimmon/50" />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Category</span>
        <select name="category" required defaultValue={item?.category ?? "generators"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
          {ITEM_CATEGORIES.map((row) => (
            <option key={row.value} value={row.value}>{row.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Description</span>
        <textarea name="description" required rows={4} defaultValue={item?.description} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-persimmon/50" />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Condition</span>
        <select name="condition" required defaultValue={item?.condition ?? "good"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
          {ITEM_CONDITIONS.map((row) => (
            <option key={row.value} value={row.value}>{row.label}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">Price per day (₦)</span>
          <input name="pricePerDay" type="number" required defaultValue={item?.pricePerDay} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">Price per week (₦, optional)</span>
          <input name="pricePerWeek" type="number" defaultValue={item?.pricePerWeek ?? undefined} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">Pickup city</span>
          <select name="pickupCity" required defaultValue={item?.pickupCity ?? "Lagos"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
            {CITIES.map((row) => (
              <option key={row.city} value={row.city}>{row.city}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">Pickup area</span>
          <input name="pickupArea" required defaultValue={item?.pickupArea} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm" />
        </label>
      </div>
      {item?.media.map((media) => (
        <input key={media.id} type="hidden" name="existingPhotos" value={media.url} />
      ))}
      <ListingMediaFields />
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Status</span>
        <select name="status" defaultValue={item?.status ?? "available"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
          <option value="available">Available</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <button type="submit" className="w-full rounded-xl bg-ink px-4 py-3 font-head text-sm font-semibold text-cream hover:bg-persimmon">
        {item ? "Save item" : "List item"}
      </button>
    </form>
  );
}
