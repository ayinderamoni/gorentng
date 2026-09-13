"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { signOutAction } from "@/app/actions/auth";

export function SiteHeader({
  userName,
}: {
  userName: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="GoRent.ng home">
          <Image src="/gorent_ng_logo.png" alt="" width={36} height={36} className="size-9 rounded-xl object-contain" />
          <span className="truncate font-display text-lg font-extrabold tracking-tight">
            GoRent<span className="text-persimmon">.ng</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 font-head text-sm font-medium text-ink-soft md:flex" aria-label="Main">
          <Link href="/listings" className="hover:text-ink">Homes</Link>
          <Link href="/rent-items" className="hover:text-ink">Items</Link>
          <Link href="/listings/new" className="hover:text-ink">List a home</Link>
          <Link href="/rent-items/new" className="hover:text-ink">List an item</Link>
        </nav>
        <div className="flex items-center gap-2.5">
          {userName ? (
            <>
              <Link href="/dashboard" className="hidden font-head text-sm font-medium text-ink-soft hover:text-ink sm:block">
                {userName.split(" ")[0]}
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="hidden rounded-full px-3 py-2 font-head text-sm text-ink-soft hover:text-ink sm:block">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hidden rounded-full px-4 py-2 font-head text-sm font-medium text-ink-soft hover:text-ink sm:block">
              Sign in
            </Link>
          )}
          <Link href="/dashboard" className="rounded-full bg-ink px-4 py-2 font-head text-sm font-semibold text-cream hover:bg-persimmon">
            List
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-ink/15 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-ink/10 px-5 py-3 md:hidden" aria-label="Mobile">
          <div className="mx-auto flex max-w-7xl flex-col font-head text-sm font-medium text-ink-soft">
            <Link href="/listings" className="rounded-lg px-3 py-3 hover:bg-cream-deep" onClick={() => setOpen(false)}>Homes</Link>
            <Link href="/rent-items" className="rounded-lg px-3 py-3 hover:bg-cream-deep" onClick={() => setOpen(false)}>Items</Link>
            <Link href="/listings/new" className="rounded-lg px-3 py-3 hover:bg-cream-deep" onClick={() => setOpen(false)}>List a home</Link>
            <Link href="/rent-items/new" className="rounded-lg px-3 py-3 hover:bg-cream-deep" onClick={() => setOpen(false)}>List an item</Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-3 hover:bg-cream-deep" onClick={() => setOpen(false)}>
              {userName ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
