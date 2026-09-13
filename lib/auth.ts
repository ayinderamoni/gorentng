import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/constants";
import { ensureProfile, getProfile, upsertProfile } from "@/lib/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: row } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url, roles, created_at")
      .eq("id", data.user.id)
      .maybeSingle();
    return ensureProfile({
      id: data.user.id,
      email: data.user.email ?? "",
      fullName: row?.full_name ?? data.user.user_metadata.full_name ?? "GoRent member",
      phone: row?.phone ?? null,
      avatarUrl: row?.avatar_url ?? null,
      roles: row?.roles ?? [],
      createdAt: row?.created_at ?? new Date().toISOString(),
    });
  }

  const jar = await cookies();
  const userId = jar.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  const profile = await getProfile(userId);
  return profile ? ensureProfile(profile) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Sign in to continue");
  }
  return user;
}

export async function demoSignIn(email: string, fullName?: string, phone?: string) {
  const profile = await upsertProfile({
    email,
    fullName: fullName || email.split("@")[0],
    phone,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, profile.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return profile;
}

export async function demoSignOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
