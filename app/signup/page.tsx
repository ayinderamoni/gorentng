import Link from "next/link";

import { signUpAction } from "@/app/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold">Create your profile</h1>
      <p className="mt-2 text-sm text-ink-soft">Roles are added as you list, apply, lend or rent — not at signup.</p>
      <form action={signUpAction} className="mt-8 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <label className="block text-sm">
          Full name
          <input name="fullName" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          Phone (optional)
          <input name="phone" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5" />
        </label>
        <button type="submit" className="w-full rounded-xl bg-ink py-3 font-head text-sm font-semibold text-cream">
          Create profile
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-soft">
        Already have one? <Link href="/login" className="font-semibold text-teal underline">Sign in</Link>
      </p>
    </div>
  );
}
