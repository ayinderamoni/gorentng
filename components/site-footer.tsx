import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-cream/70">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Image src="/gorent_ng_logo.png" alt="" width={36} height={36} className="size-9 rounded-xl bg-cream object-contain p-0.5" />
              <span className="font-display text-lg font-extrabold text-cream">
                GoRent<span className="text-persimmon">.ng</span>
              </span>
            </div>
            <p className="mt-3 text-sm">
              Homes and everyday items for rent across Nigeria — one account for both.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-head text-xs font-bold uppercase tracking-[0.15em] text-cream">Homes</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/listings" className="hover:text-cream">Browse homes</Link></li>
                <li><Link href="/listings/new" className="hover:text-cream">List a home</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-head text-xs font-bold uppercase tracking-[0.15em] text-cream">Items</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/rent-items" className="hover:text-cream">Browse items</Link></li>
                <li><Link href="/rent-items/new" className="hover:text-cream">List an item</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-head text-xs font-bold uppercase tracking-[0.15em] text-cream">Account</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-cream">Sign in</Link></li>
                <li><Link href="/dashboard" className="hover:text-cream">Dashboard</Link></li>
                <li><Link href="/report" className="hover:text-cream">Report a listing</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-cream/10 pt-6 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} GoRent.ng</p>
          <p className="font-semibold text-cream/90">Homes · Items · One profile</p>
        </div>
      </div>
    </footer>
  );
}
