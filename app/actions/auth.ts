"use server";

import { redirect } from "next/navigation";

import { demoSignIn, demoSignOut } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signUpAction(formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const fullName = formString(formData, "fullName");
  const phone = formString(formData, "phone");
  const next = formString(formData, "next") || "/dashboard";
  if (!email || !fullName) throw new Error("Name and email are required");

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw new Error(error.message);
    redirect(next);
  }

  await demoSignIn(email, fullName, phone);
  redirect(next);
}

export async function signInAction(formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const next = formString(formData, "next") || "/dashboard";
  if (!email) throw new Error("Email is required");

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    redirect(next);
  }

  await demoSignIn(email);
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  await demoSignOut();
  redirect("/");
}
