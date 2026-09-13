import { ArrowRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeSearch } from "@/components/home-search";
import { HousingCard } from "@/components/housing-card";
import { ItemCard } from "@/components/item-card";
import { getCurrentUser } from "@/lib/auth";
import { listFavoriteIds, listLiveItems, listLiveProperties } from "@/lib/store";

export default async function HomePage() {
  const user = await getCurrentUser();
  const homes = (await listLiveProperties()).slice(0, 4);
  const items = (await listLiveItems()).slice(0, 4);
  const favorites = await listFavoriteIds(user?.id ?? null);

  return (
    <div>
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="panel-chrome absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
          <div className="reveal min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-cream/60 px-3 py-1.5 font-head text-xs font-semibold tracking-wide text-ink-soft">
              <span className="size-2 rounded-full bg-teal" /> Homes and items, across Nigeria
            </span>
            <h1 id="hero-title" className="mt-5 max-w-[14ch] font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              Rent a home. <span className="chrome-text">Or an item near you.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              GoRent.ng is one marketplace for yearly housing and short-term item rentals — flats, rooms, tools, projectors and more.
            </p>
            <HomeSearch />
          </div>
          <div className="relative reveal">
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-ink/5">
              <Image
                src="/images/mytenant-hero.jpg"
                alt="Bright apartment living room with warm natural light"
                width={1024}
                height={1280}
                priority
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="floaty absolute -bottom-4 -left-4 rounded-2xl border border-ink/10 bg-surface/95 px-4 py-3 shadow-warm">
              <p className="font-display text-2xl font-extrabold text-teal">2</p>
              <p className="font-head text-xs font-medium text-ink-soft">marketplaces, one account</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-cream-deep/40" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-persimmon">How it works</p>
          <h2 id="how-title" className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Find it, request it, agree terms.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Browse both sides", "Search homes by the year or items by the day — photos, prices and reviews in one place."],
              ["02", "Apply or book", "Send a housing application or an item request. The owner sees it on their dashboard."],
              ["03", "Pay the owner", "Agree the rent or daily rate, then pay the person who listed it."],
            ].map(([label, title, body]) => (
              <article key={label} className="rounded-2xl border border-ink/10 bg-cream p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-ochre/15 font-display text-lg font-extrabold text-persimmon">{label}</span>
                <h3 className="mt-4 font-head text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5" aria-labelledby="browse-title">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="py-14 md:py-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-persimmon">Homes</p>
                <h2 id="browse-title" className="mt-2 font-display text-3xl font-extrabold tracking-tight">Places to live</h2>
              </div>
              <Link href="/listings" className="inline-flex items-center gap-1 font-head text-sm font-semibold text-teal hover:underline">
                See all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 grid-cols-1 md:grid-cols-2">
              {homes.map((property) => (
                <HousingCard
                  key={property.id}
                  property={property}
                  canSave={Boolean(user)}
                  saved={favorites.propertyIds.has(property.id)}
                />
              ))}
            </div>
          </div>
          <div className="reveal bg-slate-200/70 p-12 rounded-2xl p-6 h-fit">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-persimmon">Items</p>
                <h2 id="items-title" className="mt-2 font-display text-3xl font-extrabold tracking-tight">Things to borrow</h2>
              </div>
              <Link href="/rent-items" className="inline-flex items-center gap-1 font-head text-sm font-semibold text-teal hover:underline">
                See all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 grid-cols-1 md:grid-cols-2">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} canSave={Boolean(user)} saved={favorites.itemIds.has(item.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream" aria-labelledby="why-title">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center md:py-24">
          <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-ochre">Why this exists</p>
          <h2 id="why-title" className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            A flat for the year. <span className="chrome-text">A generator for the weekend.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-cream/70">
            Housing and item rentals sit side by side. List what you own, find what you need, and keep everything on one profile.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
            {[["Homes", "yearly rentals"], ["Items", "daily or weekly"], ["One login", "every role"]].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-cream/10 bg-cream/5 p-4 sm:p-5">
                <p className="font-display text-2xl font-extrabold text-ochre sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs text-cream/70 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24" aria-labelledby="trust-title">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-head text-xs font-bold uppercase tracking-[0.2em] text-persimmon">Trust &amp; safety</p>
            <h2 id="trust-title" className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Built so you can rent with confidence</h2>
            <div className="mt-6 space-y-5">
              <div className="flex gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal"><Check size={21} strokeWidth={3} /></span>
                <div>
                  <h3 className="font-head text-base font-semibold">Reviews only after a real stay</h3>
                  <p className="mt-0.5 text-sm text-ink-soft">A tenancy or a completed item rental is required. No drive-by reviews.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-persimmon/10 text-persimmon"><ShieldCheck size={19} /></span>
                <div>
                  <h3 className="font-head text-base font-semibold">Flag a problem listing</h3>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    Fake photos or a listing that is not as described? <Link href="/report" className="font-semibold text-teal underline">Report it</Link>.
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ochre/15 text-ochre"><MessageCircle size={19} /></span>
                <div>
                  <h3 className="font-head text-base font-semibold">One profile, many roles</h3>
                  <p className="mt-0.5 text-sm text-ink-soft">Be a tenant, list a room, and lend a generator without creating another account.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/trust-couple.jpg"
              alt="Couple holding keys outside their home"
              width={1024}
              height={1024}
              className="aspect-square w-full rounded-3xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16" aria-label="Get started">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/listings/new" className="rounded-3xl bg-ink p-8 text-cream transition-colors hover:bg-persimmon">
            <span className="font-head text-xs font-bold uppercase tracking-[0.2em] text-ochre">Homes</span>
            <p className="mt-3 font-display text-3xl font-extrabold leading-tight">List a property</p>
            <p className="mt-2 text-sm text-cream/70">Reach people looking for a place to live. Free to publish.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-head text-sm font-semibold">Start listing <ArrowRight size={16} /></span>
          </Link>
          <Link href="/rent-items/new" className="rounded-3xl bg-teal p-8 text-cream hover:opacity-90">
            <span className="font-head text-xs font-bold uppercase tracking-[0.2em] text-ochre">Items</span>
            <p className="mt-3 font-display text-3xl font-extrabold leading-tight">List an item</p>
            <p className="mt-2 text-sm text-cream/70">Put a generator, tool or appliance to work nearby.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-head text-sm font-semibold">Start listing <ArrowRight size={16} /></span>
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link href="/listings" className="rounded-2xl border border-ink/10 bg-cream px-6 py-5 font-head text-sm font-semibold hover:border-ink/25">
            Browse homes <ArrowRight className="ml-1 inline" size={15} />
          </Link>
          <Link href="/rent-items" className="rounded-2xl border border-ink/10 bg-cream px-6 py-5 font-head text-sm font-semibold hover:border-ink/25">
            Browse items <ArrowRight className="ml-1 inline" size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
