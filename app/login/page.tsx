import Link from "next/link";

import { signInAction } from "@/app/actions/auth";
import { DEMO_PASSWORD_HINT } from "@/lib/store/seed";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-sm text-ink-soft">One account. Be a tenant, a landlord, a lender — or all three.</p>
      <form action={signInAction} className="mt-8 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <label className="block text-sm">
          Email
          <input name="email" type="email" required defaultValue="chinedu@gorent.ng" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
        </label>
        <p className="text-xs text-ink-soft">{DEMO_PASSWORD_HINT} Try chinedu@gorent.ng (tenant) or amaka@gorent.ng (landlord).</p>
        <button type="submit" className="w-full rounded-xl bg-ink py-3 font-head text-sm font-semibold text-cream">
          Continue
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-soft">
        New here? <Link href="/signup" className="font-semibold text-teal underline">Create a profile</Link>
      </p>
    </div>
  );
}
