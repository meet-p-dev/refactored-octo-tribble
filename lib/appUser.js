"use client";
/* The per-app boundary on a shared account.

   MoneyTrack shares one Supabase project — one Postgres, one auth.users — with
   Heimat, the flat-money app. That means one email and password unlock both.
   What they do NOT share is membership: public.app_users holds one row per
   (account, app), so each app can tell an account of its own from a stranger who
   happens to have signed up next door, and each has somewhere to keep a profile
   that is its alone.

   Every call fails soft. Membership is bookkeeping — losing a write must never
   cost the user a sign-in or a password reset. */
import { sb } from "./supabase";

export const APP = "moneytrack";

// Record this account as a MoneyTrack account and bump its last-seen stamp.
export async function touchAppUser(displayName) {
  const c = sb(); if (!c) return;
  try {
    const { data } = await c.auth.getUser();
    const u = data?.user;
    if (!u || !u.email) return;
    await c.from("app_users").upsert({
      user_id: u.id,
      app: APP,
      ...(displayName ? { display_name: displayName } : {}),
      last_seen_at: new Date().toISOString(),
    }, { onConflict: "user_id,app" });
  } catch { /* bookkeeping only — never block the caller */ }
}
