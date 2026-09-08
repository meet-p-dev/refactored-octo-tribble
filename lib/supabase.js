"use client";
// MoneyTrack Supabase client (singleton). URL + publishable key are public by design;
// all privileged work happens server-side in edge functions. Data is per-user via RLS.
import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://vqvycbzrkeeuuhgrkpbf.supabase.co";
const SB_KEY = "sb_publishable__akzhxAikI6-fLLQexhbxQ_rTeWuaoJ";

let _client = null;
export function sb() {
  if (typeof window === "undefined") return null; // SSR-safe: no client on the server
  if (!_client) {
    _client = createClient(SB_URL, SB_KEY, {
      // detectSessionInUrl: true so password-recovery links (…#type=recovery) are
      // processed on load and fire a PASSWORD_RECOVERY auth event.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "mt-sb-auth" },
    });
  }
  return _client;
}
