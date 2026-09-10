"use client";
/* The far end of MoneyTrack's password-reset pipeline.

   A route of its own rather than the Bank Sync sheet, for three reasons. The
   emailed link is opened by whatever browser the mail app hands it to, often on
   a device that has never run MoneyTrack — so booting the whole app just to show
   one password field is slow and buys nothing. The recovery session it arrives
   with is a temporary credential, and the less of the app that touches it the
   better. And MoneyTrack shares a Supabase project (and, on GitHub Pages, an
   origin) with Heimat, so the page a reset link lands on has to say plainly
   which of the two it belongs to.

   The in-app recovery sheet stays where it is, for links sent before this
   existed. */
import { useEffect, useRef, useState } from "react";
import { sb } from "../../lib/supabase";
import { touchAppUser } from "../../lib/appUser";
import { readableAuthError } from "../../lib/bankSync";
import { LT, DK } from "../../lib/constants";

/* The recovery token arrives in the URL fragment and the Supabase client wipes
   the fragment the moment it is created. This module is evaluated before any
   sb() call — the client is lazy — so the address here is still the one the
   email sent the user to. */
const ARRIVED = typeof window !== "undefined" ? window.location.href : "";

const BASE = "/refactored-octo-tribble";

export default function ResetPage() {
  const [T, setT] = useState(DK);
  // "checking" → "form" | "dead" | "done"
  const [stage, setStage] = useState("checking");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const started = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const pick = () => setT(mq.matches ? DK : LT);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  useEffect(() => {
    if (started.current) return;          // StrictMode double-invoke would burn the token twice
    started.current = true;

    (async () => {
      const c = sb();
      if (!c) { setReason("MoneyTrack could not reach the server."); setStage("dead"); return; }

      const url = new URL(ARRIVED || window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const query = url.searchParams;

      const errCode = hash.get("error_code") || query.get("error_code");
      const errDesc = hash.get("error_description") || query.get("error_description");
      if (errCode || errDesc) {
        setReason(/expired/.test(errCode || "")
          ? "The link had already run out."
          : (errDesc || "").replace(/\+/g, " ") || "The link could not be used.");
        setStage("dead");
        return;
      }

      /* Only a link gets you the password form. Without this the page would hand
         a "choose a new password" box to anyone who opened the URL while a
         MoneyTrack session happened to be sitting in this browser. */
      /* token_hash is the shape the email template sends: this page redeems it,
         so a mail app that opens links ahead of the user to preview them (iOS
         Mail, Gmail and Outlook all do) only fetches a static page and cannot
         spend the one-time token first. The fragment and ?code= shapes are what
         older emails and PKCE produce. */
      const code = query.get("code");
      const tokenHash = query.get("token_hash");
      const viaLink = !!code || !!tokenHash || hash.get("type") === "recovery" || !!hash.get("access_token");
      if (!viaLink) {
        setReason("This page is the last step of a password reset, and it was opened without a link.");
        setStage("dead");
        return;
      }

      if (tokenHash) {
        const { error } = await c.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        if (error) {
          setReason(/expired|invalid/i.test(error.message) ? "The link had already run out, or was used once already." : error.message);
          setStage("dead");
          return;
        }
      }

      if (code) {
        const { error } = await c.auth.exchangeCodeForSession(code);
        if (error) { setReason(error.message); setStage("dead"); return; }
      }

      // getSession() waits for the client to finish reading the URL, so by here
      // the token in the fragment has either become a session or never will
      const { data } = await c.auth.getSession();
      const user = data?.session?.user;
      if (!user || !user.email) {
        setReason("That link could not be used.");
        setStage("dead");
        return;
      }

      // take the token out of the address bar before anything can copy it
      window.history.replaceState(null, "", url.pathname);
      setEmail(user.email);
      setStage("form");
    })();
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, color: T.txt, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 40px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 17 }}>M</div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.2px" }}>MoneyTrack</div>
        </div>
        {stage === "checking" && <Checking T={T} />}
        {stage === "form" && <NewPassword T={T} email={email} onDone={() => setStage("done")} />}
        {stage === "dead" && <DeadLink T={T} reason={reason} />}
        {stage === "done" && <Done T={T} />}
      </div>
    </div>
  );
}

/* ── shared bits ── */
const H1 = ({ T, children }) => <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-0.4px", margin: "0 0 10px" }}>{children}</h1>;
const P = ({ T, children }) => <p style={{ fontSize: 14, color: T.txt2, lineHeight: 1.55, margin: "0 0 20px" }}>{children}</p>;
const Small = ({ T, children }) => <p style={{ fontSize: 12, color: T.txt3, lineHeight: 1.5, margin: "18px 0 0", textAlign: "center" }}>{children}</p>;
const field = (T) => ({ display: "block", width: "100%", boxSizing: "border-box", background: T.inp, color: T.txt, border: `1.5px solid ${T.inpB}`, borderRadius: 14, padding: "15px 16px", fontSize: 16, outline: "none", WebkitAppearance: "none", marginBottom: 12 });
const button = (T, on) => ({ width: "100%", boxSizing: "border-box", background: on ? T.acc : T.border, color: "#fff", border: "none", borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 16, cursor: on ? "pointer" : "default" });
const Note = ({ T, color, children }) => <div style={{ fontSize: 13, color, lineHeight: 1.5, margin: "0 0 14px" }}>{children}</div>;

function Checking({ T }) {
  return <><H1 T={T}>Checking your link…</H1><P T={T}>One moment.</P></>;
}

function NewPassword({ T, email, onDone }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setErr("");
    if (pw.length < 6) return setErr("Use at least 6 characters.");
    if (pw !== pw2) return setErr("The two passwords do not match.");
    setBusy(true);
    const { error } = await sb().auth.updateUser({ password: pw });
    if (error) { setBusy(false); return setErr(readableAuthError(error, "Couldn't save the new password. Please try again.")); }
    // the account has now proved it is a MoneyTrack account, so record it as one
    await touchAppUser();
    onDone();
  };

  return (
    <>
      <H1 T={T}>Choose a new password</H1>
      <P T={T}>You are resetting the password for <strong style={{ color: T.txt }}>{email}</strong>. Pick a new one and you will be signed in straight away.</P>
      <input style={field(T)} type="password" autoComplete="new-password" placeholder="New password, at least 6 characters" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
      <input style={field(T)} type="password" autoComplete="new-password" placeholder="Repeat it" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
      {err && <Note T={T} color={T.red}>{err}</Note>}
      <button style={button(T, !busy)} disabled={busy} onClick={submit}>{busy ? "Saving…" : "Save new password"}</button>
      <Small T={T}>This password is for your MoneyTrack account — the one bank sync uses. Everything you keep on this device stays exactly where it is.</Small>
    </>
  );
}

function DeadLink({ T, reason }) {
  const [mail, setMail] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setErr(""); setOk("");
    if (!/\S+@\S+\.\S+/.test(mail)) return setErr("Enter your email address.");
    setBusy(true);
    const { error } = await sb().auth.resetPasswordForEmail(mail.trim(), { redirectTo: window.location.origin + window.location.pathname });
    setBusy(false);
    if (error) return setErr(readableAuthError(error, "Couldn't send the email right now. Please try again in a few minutes."));
    // worded the same way whether or not the address has an account, so the page
    // can't be used to find out who has one
    setOk(`If ${mail.trim()} has a MoneyTrack account, a new link is on its way. Open it on this device.`);
  };

  return (
    <>
      <H1 T={T}>This reset link has expired</H1>
      <P T={T}>{reason} Reset links are single-use and last an hour. Enter your email and MoneyTrack will send a fresh one.</P>
      <input style={field(T)} type="email" inputMode="email" autoCapitalize="none" autoComplete="email" placeholder="you@email.com" value={mail} onChange={(e) => setMail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} autoFocus />
      {err && <Note T={T} color={T.red}>{err}</Note>}
      {ok && <Note T={T} color={T.green}>{ok}</Note>}
      <button style={button(T, !busy)} disabled={busy} onClick={submit}>{busy ? "Sending…" : "Send a new link"}</button>
      <a href={`${BASE}/`} style={{ display: "block", textAlign: "center", marginTop: 16, color: T.txt2, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Back to MoneyTrack</a>
    </>
  );
}

function Done({ T }) {
  return (
    <>
      <H1 T={T}>Password changed</H1>
      <P T={T}>You are signed in on this browser. Open MoneyTrack and bank sync picks up where it left off.</P>
      <a href={`${BASE}/`} style={{ ...button(T, true), display: "block", textAlign: "center", textDecoration: "none", lineHeight: 1.2 }}>Open MoneyTrack</a>
      <Small T={T}>Using MoneyTrack from your home screen? It keeps its own sign-in, separate from this browser — open it and sign in with your new password.</Small>
    </>
  );
}
