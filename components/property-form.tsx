"use client";

import { useActionState } from "react";

import { HousingMediaFields } from "@/components/housing-media-fields";
import type { FormActionState } from "@/lib/action-state";
import { AMENITIES, CITIES, PROPERTY_TYPES } from "@/lib/constants";
import type { PropertyWithMeta } from "@/lib/types";

export function PropertyForm({
  action,
  property,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  property?: PropertyWithMeta;
}) {
  const [state, formAction] = useActionState(action, {});
  const selectedAmenities = new Set(property?.amenities ?? []);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-xl border border-persimmon/30 bg-persimmon/10 px-3 py-2 text-sm text-persimmon">{state.error}</p>
      ) : null}
      {property ? <input type="hidden" name="id" value={property.id} /> : null}
      <Field label="Title" name="title" defaultValue={property?.title} required placeholder="2-bedroom terrace in Lekki" />
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Description</span>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={property?.description}
          className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-persimmon/50"
        />
      </label>
      <Field label="Street address" name="address" defaultValue={property?.address} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">City</span>
          <select name="city" required defaultValue={property?.city ?? "Lagos"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
            {CITIES.map((row) => (
              <option key={row.city} value={row.city}>{row.city}</option>
            ))}
          </select>
        </label>
        <Field label="Area" name="area" defaultValue={property?.area} required placeholder="Lekki" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">Property type</span>
          <select name="propertyType" required defaultValue={property?.propertyType ?? "apartment"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
            {PROPERTY_TYPES.map((row) => (
              <option key={row.value} value={row.value}>{row.label}</option>
            ))}
          </select>
        </label>
        <Field label="Yearly rent (₦)" name="priceYearly" type="number" defaultValue={property?.priceYearly} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bedrooms" name="bedrooms" type="number" defaultValue={property?.bedrooms ?? 1} required />
        <Field label="Bathrooms" name="bathrooms" type="number" defaultValue={property?.bathrooms ?? 1} required />
      </div>
      <fieldset>
        <legend className="mb-2 font-head text-sm font-semibold">Amenities</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="amenities" value={amenity} defaultChecked={selectedAmenities.has(amenity)} />
              {amenity}
            </label>
          ))}
        </div>
      </fieldset>
      <HousingMediaFields media={property?.media} />
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Visibility</span>
        <select name="listingStatus" defaultValue={property?.listingStatus ?? "live"} className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm">
          <option value="live">Live — public</option>
          <option value="draft">Draft</option>
          <option value="unlisted">Unlisted</option>
        </select>
      </label>
      <button type="submit" className="w-full rounded-xl bg-ink px-4 py-3 font-head text-sm font-semibold text-cream hover:bg-persimmon">
        {property ? "Save listing" : "Publish listing"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-head text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-persimmon/50"
      />
    </label>
  );
}
