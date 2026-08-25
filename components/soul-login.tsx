"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Language } from "@/lib/supabase/types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INTERNAL_DOMAIN = "accounts.chithraguptha.site";

function createSoulId() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

function authEmail(soulId: string) {
  return `soul_${soulId.toLowerCase()}@${INTERNAL_DOMAIN}`;
}

export default function SoulLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "return">("create");
  const [soulId, setSoulId] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [region, setRegion] = useState("IN");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("soul_id,language,region").eq("id", data.user.id).maybeSingle();
      if (profile?.soul_id) {
        setCreated(profile.soul_id);
        setSoulId(profile.soul_id);
        setLanguage((profile.language as Language) || "en");
        setRegion(profile.region || "IN");
        setMode("return");
      }
    });
  }, []);

  async function createSoul(passwordValue: string) {
    const supabase = createClient();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const id = createSoulId();
      const { data, error } = await supabase.auth.signUp({
        email: authEmail(id),
        password: passwordValue,
        options: { data: { soul_id: id, language, region, role: "user" } },
      });
      if (!error && data.user) {
        if (!data.session) throw new Error("Soul created but no session was returned. In Supabase, disable Authentication → Providers → Email → Confirm email for this MVP.");
        setCreated(id);
        setSoulId(id);
        setPassword("");
        setMode("return");
        setMessage("Your Soul is ready. Keep the five-character Soul ID and password safe.");
        return;
      }
      if (error && !/already registered|already exists/i.test(error.message)) throw error;
    }
    throw new Error("We could not find an unused Soul ID. Please try again.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      if (password.length < 8) throw new Error("Use at least 8 characters for your Soul password.");
      const supabase = createClient();
      if (mode === "create") {
        await createSoul(password);
        return;
      }
      const normalized = soulId.trim().replace(/^#/, "").toUpperCase();
      if (!/^[A-Z0-9]{5}$/.test(normalized)) throw new Error("Soul ID must be exactly 5 characters.");
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail(normalized), password });
      if (error || !data.user) throw new Error("We could not verify that Soul ID and password.");
      setCreated(normalized);
      setSoulId(normalized);
      setPassword("");
      setMessage("Welcome back, Soul. Your Ledger is ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function enterLedger() {
    router.push("/");
  }

  return (
    <main className="cg-auth-shell">
      <section className="cg-auth-card">
        <Link href="/" className="cg-auth-back"><ArrowLeft size={15}/> Ledger</Link>
        <div className="cg-auth-mark"><span>🪔</span></div>
        <div className="cg-eyebrow">Anonymous Soul Ledger</div>
        <h1>{mode === "create" ? "Keep your Soul" : "Return to your Soul"}</h1>
        <p className="cg-auth-intro">No name. No email. Your public identity is a generated five-character Soul ID. The email-like value used by Supabase is internal and never shown to you.</p>
        <div className="cg-auth-tabs">
          <button className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setMessage(""); }}>Create Soul</button>
          <button className={mode === "return" ? "active" : ""} onClick={() => { setMode("return"); setMessage(""); }}>Return</button>
        </div>
        <form onSubmit={submit} className="cg-auth-form">
          {mode === "create" && <div className="cg-auth-grid"><label>LANGUAGE<select value={language} onChange={(e) => setLanguage(e.target.value as Language)}><option value="en">English</option><option value="te">తెలుగు</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option><option value="kn">ಕನ್ನಡ</option><option value="ml">മലയാളം</option><option value="mr">मराठी</option><option value="bn">বাংলা</option></select></label><label>REGION<select value={region} onChange={(e) => setRegion(e.target.value)}><option value="IN">India</option><option value="AP">Andhra Pradesh</option><option value="TS">Telangana</option><option value="KA">Karnataka</option><option value="TN">Tamil Nadu</option><option value="KL">Kerala</option><option value="MH">Maharashtra</option><option value="WB">West Bengal</option><option value="DL">Delhi</option><option value="UP">Uttar Pradesh</option></select></label></div>}
          {mode === "return" && <label>SOUL ID<input value={soulId} onChange={(e) => setSoulId(e.target.value.toUpperCase())} placeholder="A7F9K" maxLength={5} autoCapitalize="characters" required/></label>}
          <label>PASSWORD<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required/></label>
          <button className="cg-primary" type="submit" disabled={busy}>{busy ? <><Loader2 size={16} className="cg-spin"/> Connecting…</> : <><KeyRound size={16}/>{mode === "create" ? "Generate my Soul ID" : "Verify Soul"}</>}</button>
        </form>
        {created && <div className="cg-soul-preview"><span className="cg-eyebrow">Your anonymous identity</span><strong>#{created}</strong><small>Five characters for the MVP. We can expand the namespace as the Soul population grows.</small></div>}
        {message && <div className="cg-auth-message"><ShieldCheck size={16}/><span>{message}</span></div>}
        {created && <button className="cg-primary cg-enter-ledger" type="button" onClick={enterLedger}>Enter the Ledger</button>}
        <div className="cg-auth-trust"><Sparkles size={15}/><span>Your password is handled by Supabase Auth. No real-world identifier is collected. For the MVP, disable email confirmation because the internal authentication address is intentionally unreachable.</span></div>
      </section>
      <style>{`.cg-auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cg-auth-form select{height:46px;width:100%;border-radius:10px;border:1px solid #454a50;background:#090b0e;color:#eee9df;padding:0 12px;outline:0;font-size:12px}.cg-auth-form select:focus{border-color:#80652e}.cg-spin{animation:cgspin 1s linear infinite}@keyframes cgspin{to{transform:rotate(360deg)}}.cg-auth-form button:disabled{opacity:.65;cursor:wait}@media(max-width:560px){.cg-auth-grid{grid-template-columns:1fr}}`}</style>
    </main>
  );
}
