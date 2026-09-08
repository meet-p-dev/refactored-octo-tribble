"use client";

import { useState } from "react";
import { I } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";

const DEFAULT_BANK = "Sparkasse Erlangen Höchstadt Herzogenaurach";

// Quick-pick chips for the most common banks. Names must match Enable Banking's ASPSP
// list exactly; the field stays editable so a regional Sparkasse or any other bank can be
// typed in. `iban:true` flags banks that only share an account when the exact IBAN is given.
const POPULAR_BANKS = [
  { label: "Sparkasse (Erlangen)", name: DEFAULT_BANK },
  { label: "Commerzbank", name: "Commerzbank" },
  { label: "Deutsche Bank", name: "Deutsche Bank" },
  { label: "ING", name: "ING" },
  { label: "DKB", name: "Deutsche Kreditbank AG" },
  { label: "N26", name: "N26 Bank" },
  { label: "Revolut", name: "Revolut", iban: true },
  { label: "PayPal", name: "PayPal" },
];

export function BankSyncSheet({
  modal, closeM, T, sbUser, bankConns, recoveryMode,
  onSignIn, onStartConnect, onFinishConnect, onSignOut, onChangePassword, onSendReset, onCompleteReset, onRefresh, showToast,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bankName, setBankName] = useState(DEFAULT_BANK);
  const [iban, setIban] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [linkOpened, setLinkOpened] = useState(false);
  const [pasteCode, setPasteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);        // {kind, message} — honest, typed sign-in error
  const [resetSent, setResetSent] = useState(false);
  const [recoveryPw, setRecoveryPw] = useState("");

  const inp = { display: "block", width: "100%", background: T.inp, color: T.txt, border: `1.5px solid ${T.inpB}`, borderRadius: 12, padding: "13px 14px", fontSize: 16, outline: "none", WebkitAppearance: "none", appearance: "none", boxSizing: "border-box" };
  const btn = (bg, fg) => ({ width: "100%", background: bg, color: fg, border: "none", borderRadius: 12, padding: "14px 16px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 });
  const run = async (fn) => { if (busy) return; setBusy(true); setErr(null); try { await fn(); } catch (e) { setErr({ kind: e?.kind || "other", message: String(e?.message || e) }); } finally { setBusy(false); } };
  const ErrBanner = () => err ? (
    <div style={{ background: T.red + "18", border: `1px solid ${T.red}55`, borderRadius: 12, padding: "11px 13px", margin: "12px 0 0", fontSize: 13, color: T.red, lineHeight: 1.4 }}>{err.message}</div>
  ) : null;

  // ── Password recovery: user arrived via a reset link ──
  if (recoveryMode) {
    return (
      <Sheet open={modal === "banksync"} onClose={closeM} title="Set a new password" T={T}>
        <p style={{ fontSize: 13, color: T.txt2, margin: "0 0 14px", lineHeight: 1.5 }}>
          You followed a password-reset link. Pick a new password to finish.
        </p>
        <input style={inp} type="password" autoComplete="new-password" placeholder="New password (min 6 characters)"
          value={recoveryPw} onChange={(e) => setRecoveryPw(e.target.value)} />
        <div style={{ height: 12 }} />
        <button style={btn(T.acc, "#fff")} disabled={busy}
          onClick={() => run(async () => {
            if (recoveryPw.length < 6) throw new Error("Password must be at least 6 characters");
            await onCompleteReset(recoveryPw);
            setRecoveryPw(""); showToast("Password updated — you're signed in");
          })}>{busy ? "Saving…" : "Save new password"}</button>
        <ErrBanner />
      </Sheet>
    );
  }

  return (
    <Sheet open={modal === "banksync"} onClose={closeM} title="Bank Sync" T={T}>
      {!sbUser ? (
        <>
          <div style={{ marginBottom: 10 }}><Label text="Sign in to enable automatic bank sync" /></div>
          <p style={{ fontSize: 13, color: T.txt2, margin: "0 0 16px", lineHeight: 1.5 }}>
            Your bank transactions sync privately to your account and update automatically 3× a day. No file imports.
            First time? Just pick a password — your account is created automatically.
          </p>
          <input style={inp} type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
            value={email} onChange={(e) => { setEmail(e.target.value); setResetSent(false); }} />
          <div style={{ height: 10 }} />
          <input style={inp} type="password" autoComplete="current-password" placeholder="Password (min 6 characters)"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ height: 12 }} />
          <button style={btn(T.acc, "#fff")} disabled={busy}
            onClick={() => run(async () => {
              if (!email.trim()) throw new Error("Enter your email");
              if (password.length < 6) throw new Error("Password must be at least 6 characters");
              await onSignIn(email, password);
              showToast("Signed in");
            })}>
            {busy ? "Signing in…" : "Sign in / Create account"}
          </button>
          <ErrBanner />
          {resetSent ? (
            <div style={{ background: T.green + "18", border: `1px solid ${T.green}55`, borderRadius: 12, padding: "11px 13px", marginTop: 12, fontSize: 13, color: T.green, lineHeight: 1.4 }}>
              Reset link sent to {email.trim()}. Open it on this device to set a new password.
            </div>
          ) : (
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <button style={{ background: "none", border: "none", color: err?.kind === "wrongpw" ? T.acc : T.txt2, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 4 }}
                onClick={() => run(async () => { await onSendReset(email); setResetSent(true); })}>
                Forgot password?
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 99, background: T.green + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.check ? I.check(T.green) : "✓"}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: T.txt2 }}>Signed in</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sbUser.email}</div>
              </div>
            </div>
            <button style={{ background: "none", border: `1.5px solid ${T.border}`, color: T.txt2, borderRadius: 99, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onClick={() => run(async () => { await onSignOut(); setEmail(""); setPassword(""); })}>Sign out</button>
          </div>
          <ErrBanner />

          <div style={{ marginBottom: 16 }}>
            {!showPw ? (
              <button style={{ background: "none", border: "none", color: T.acc, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => setShowPw(true)}>Change password</button>
            ) : (
              <div style={{ background: T.bg, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: 14 }}>
                <input style={inp} type="password" autoComplete="new-password" placeholder="New password (min 6 characters)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                <div style={{ height: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...btn(T.acc, "#fff"), flex: 1 }} disabled={busy}
                    onClick={() => run(async () => {
                      if (newPw.length < 6) throw new Error("Password must be at least 6 characters");
                      await onChangePassword(newPw);
                      setNewPw(""); setShowPw(false); showToast("Password changed");
                    })}>{busy ? "Saving…" : "Update password"}</button>
                  <button style={{ ...btn("transparent", T.txt2), flex: "0 0 auto", width: "auto", padding: "14px 16px" }} disabled={busy}
                    onClick={() => { setShowPw(false); setNewPw(""); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 10 }}><Label text="Connect a bank" /></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {POPULAR_BANKS.map((b) => {
              const on = bankName === b.name;
              return (
                <button key={b.name} type="button"
                  onClick={() => { setBankName(b.name); if (!b.iban) setIban(""); }}
                  style={{ background: on ? T.acc : T.card, color: on ? "#fff" : T.txt2, border: `1.5px solid ${on ? T.acc : T.border}`, borderRadius: 99, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {b.label}
                </button>
              );
            })}
          </div>
          <input style={inp} placeholder="Bank name (e.g. Sparkasse …)" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          <div style={{ height: 10 }} />
          <input style={inp} placeholder="Account IBAN (optional)" value={iban} onChange={(e) => setIban(e.target.value)} />
          <p style={{ fontSize: 12, color: T.txt3, margin: "6px 2px 10px", lineHeight: 1.45 }}>
            Leave blank for most banks. <b style={{ color: T.txt2 }}>Revolut needs it</b> — it shares no account unless you name the exact IBAN (find it in the Revolut app).
          </p>
          <button style={btn(T.acc, "#fff")} disabled={busy}
            onClick={() => run(async () => {
              const url = await onStartConnect(bankName, iban);
              window.open(url, "_blank", "noopener");
              setLinkOpened(true);
              showToast("Log in at your bank, then paste the code");
            })}>
            {busy ? "Preparing…" : "Open bank login"}
          </button>

          {linkOpened && (
            <div style={{ marginTop: 14, padding: 14, background: T.bg, borderRadius: 12, border: `1.5px solid ${T.border}` }}>
              <p style={{ fontSize: 13, color: T.txt2, margin: "0 0 10px", lineHeight: 1.5 }}>
                After logging in, your bank shows a <b style={{ color: T.txt }}>code</b>. Paste it here:
              </p>
              <input style={inp} placeholder="Paste code from bank page" value={pasteCode} onChange={(e) => setPasteCode(e.target.value.trim())} />
              <div style={{ height: 10 }} />
              <button style={btn(T.green, "#fff")} disabled={busy}
                onClick={() => run(async () => {
                  if (!pasteCode) throw new Error("Paste the code first");
                  const r = await onFinishConnect(pasteCode, bankName);
                  setPasteCode(""); setLinkOpened(false);
                  showToast(`Connected · ${r.transactions ?? 0} transactions`);
                })}>
                {busy ? "Connecting…" : "Finish connect"}
              </button>
            </div>
          )}

          <div style={{ marginTop: 22, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Label text="Connected banks" />
            <button style={{ background: "none", border: "none", color: T.acc, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onClick={() => run(async () => { await onRefresh(); showToast("Refreshed"); })}>Refresh</button>
          </div>
          {(!bankConns || bankConns.length === 0) ? (
            <p style={{ fontSize: 13, color: T.txt3, margin: 0 }}>No banks connected yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bankConns.map((c) => (
                <div key={c.id} style={{ background: T.card, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: "12px 14px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.txt }}>{c.bank_name}</div>
                  <div style={{ fontSize: 12, color: T.txt2, marginTop: 2 }}>
                    {c.last_sync_error ? <span style={{ color: T.red, display: "inline-flex", alignItems: "center", gap: 4 }}>{I.alert(T.red, 12)} {c.last_sync_error.slice(0, 60)}</span>
                      : c.last_synced_at ? `Last synced ${new Date(c.last_synced_at).toLocaleString("de-DE")}` : "Awaiting first sync"}
                  </div>
                  {c.valid_until && <div style={{ fontSize: 11, color: T.txt3, marginTop: 2 }}>Consent valid until {new Date(c.valid_until).toLocaleDateString("de-DE")}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
