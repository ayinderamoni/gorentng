"use client";

import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { CITIES, ITEM_CATEGORIES } from "@/lib/constants";

export function HomeSearch() {
  const [tab, setTab] = useState<"homes" | "items">("homes");

  return (
    <div className="mt-7 rounded-2xl border border-ink/10 bg-surface/80 p-2.5 shadow-sm">
      <div className="mb-2 grid grid-cols-2 gap-1 rounded-xl bg-cream p-1" role="tablist" aria-label="Search">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "homes"}
          onClick={() => setTab("homes")}
          className={`rounded-lg px-3 py-2 font-head text-sm font-semibold ${tab === "homes" ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"}`}
        >
          Homes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "items"}
          onClick={() => setTab("items")}
          className={`rounded-lg px-3 py-2 font-head text-sm font-semibold ${tab === "items" ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"}`}
        >
          Items
        </button>
      </div>
      {tab === "homes" ? (
        <form action="/listings" className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <label className="flex min-w-0 items-center gap-2 rounded-xl bg-cream px-3.5 py-3 ring-1 ring-transparent focus-within:ring-persimmon/60">
            <MapPin size={17} className="shrink-0 text-ochre" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-head text-[10px] font-medium uppercase tracking-wider text-ink-soft/70">City or area</span>
              <input name="area" placeholder="Lekki, Lagos" className="w-full bg-transparent font-head text-sm font-medium outline-none" />
            </span>
          </label>
          <label className="flex min-w-0 items-center gap-2 rounded-xl bg-cream px-3.5 py-3 ring-1 ring-transparent focus-within:ring-persimmon/60">
            <SlidersHorizontal size={17} className="shrink-0 text-ochre" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-head text-[10px] font-medium uppercase tracking-wider text-ink-soft/70">Bedrooms</span>
              <select name="bedrooms" className="w-full bg-transparent font-head text-sm font-medium outline-none">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </span>
          </label>
          <button type="submit" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-persimmon px-5 py-3 font-head text-sm font-semibold text-cream hover:bg-persimmon/90">
            <Search size={17} aria-hidden="true" /> Search homes
          </button>
        </form>
      ) : (
        <form action="/rent-items" className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <label className="flex min-w-0 items-center gap-2 rounded-xl bg-cream px-3.5 py-3 ring-1 ring-transparent focus-within:ring-persimmon/60">
            <SlidersHorizontal size={17} className="shrink-0 text-ochre" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-head text-[10px] font-medium uppercase tracking-wider text-ink-soft/70">Category</span>
              <select name="category" className="w-full bg-transparent font-head text-sm font-medium outline-none">
                <option value="">Any item</option>
                {ITEM_CATEGORIES.map((row) => (
                  <option key={row.value} value={row.value}>{row.label}</option>
                ))}
              </select>
            </span>
          </label>
          <label className="flex min-w-0 items-center gap-2 rounded-xl bg-cream px-3.5 py-3 ring-1 ring-transparent focus-within:ring-persimmon/60">
            <MapPin size={17} className="shrink-0 text-ochre" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-head text-[10px] font-medium uppercase tracking-wider text-ink-soft/70">City</span>
              <select name="city" className="w-full bg-transparent font-head text-sm font-medium outline-none">
                <option value="">Anywhere</option>
                {CITIES.map((row) => (
                  <option key={row.city} value={row.city}>{row.city}</option>
                ))}
              </select>
            </span>
          </label>
          <button type="submit" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-persimmon px-5 py-3 font-head text-sm font-semibold text-cream hover:bg-persimmon/90">
            <Search size={17} aria-hidden="true" /> Search items
          </button>
        </form>
      )}
    </div>
  );
}
