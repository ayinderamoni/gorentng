import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-3xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-sm text-ink-soft">That listing or page is gone. Browse homes or items instead.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/listings" className="inline-block rounded-full bg-ink px-4 py-2 font-head text-sm font-semibold text-cream">
          Browse homes
        </Link>
        <Link href="/rent-items" className="inline-block rounded-full border border-ink/15 px-4 py-2 font-head text-sm font-semibold">
          Browse items
        </Link>
      </div>
    </div>
  );
}
