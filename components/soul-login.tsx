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
  // Keep the internal Auth address RFC-friendly. An underscore in the local
  // part was rejected by Supabase's email validator in production, so use a
  // dot separator while keeping the address completely opaque to the user.
  return `soul.${soulId.toLowerCase()}@${INTERNAL_DOMAIN}`;
}

const pageStyles = `
.cg-auth-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:36px 18px;background:radial-gradient(700px 500px at 50% 0%,rgba(211,173,93,.10),transparent 70%),#070809;color:#eee9df;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.cg-auth-card{width:min(100%,620px);padding:34px;border:1px solid #34383e;border-radius:16px;background:linear-gradient(145deg,#11130f,#0d1014 70%);box-shadow:0 28px 90px rgba(0,0,0,.48)}.cg-auth-back{display:inline-flex;align-items:center;gap:6px;color:#8e8981;text-decoration:none;font-size:10px;margin-bottom:28px}.cg-auth-back:hover{color:#ead39d}.cg-auth-mark{width:48px;height:48px;display:grid;place-items:center;border:1px solid #604a26;border-radius:13px;background:#17130d;font-size:23px;margin-bottom:18px}.cg-eyebrow{font-size:9px;font-weight:800;line-height:1.2;letter-spacing:.19em;text-transform:uppercase;color:#d3ad5d}.cg-auth-card h1{font:600 clamp(38px,6vw,54px)/.98 Cormorant Garamond,Georgia,serif;letter-spacing:-.02em;margin:9px 0 13px;color:#f0eadf}.cg-auth-intro{max-width:540px;margin:0;color:#9b958b;font-size:11px;line-height:1.75}.cg-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:25px 0 18px;padding:4px;border:1px solid #2e3237;border-radius:11px;background:#090b0e}.cg-auth-tabs button{height:40px;border:1px solid transparent;border-radius:8px;background:transparent;color:#89847c;font-size:10px;font-weight:800;letter-spacing:.04em}.cg-auth-tabs button:hover{color:#ded8ce;background:#12161a}.cg-auth-tabs button.active{color:#eed49a;border-color:#725726;background:#19150e}.cg-auth-form{display:grid;gap:13px}.cg-auth-form label{display:grid;gap:6px;color:#a7a096;font-size:9px;font-weight:800;letter-spacing:.12em}.cg-auth-form input,.cg-auth-form select{width:100%;height:46px;border:1px solid #454a50;border-radius:10px;background:#090b0e;color:#eee9df;padding:0 13px;font-size:12px;outline:none}.cg-auth-form input::placeholder{color:#5f5b55}.cg-auth-form input:focus,.cg-auth-form select:focus{border-color:#80652e;box-shadow:0 0 0 3px rgba(212,174,93,.07)}.cg-auth-form select option{background:#11151a;color:#eee9df}.cg-auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cg-primary{min-height:44px;border-radius:10px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#6f5119;color:#f5e4ba;border:1px solid #8b6828;font-size:11px;font-weight:800;cursor:pointer;text-decoration:none}.cg-primary:hover{background:#7d5d20}.cg-primary:disabled{opacity:.65;cursor:wait}.cg-soul-preview{margin-top:16px;padding:18px;border:1px solid #705726;border-radius:12px;background:#15120c;text-align:center}.cg-soul-preview strong{display:block;margin:7px 0 4px;font:700 34px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#ead39d}.cg-soul-preview small{display:block;color:#817b72;font-size:9px;line-height:1.6}.cg-auth-message{display:flex;align-items:flex-start;gap:8px;margin-top:13px;padding:11px 12px;border:1px solid #4d422d;border-radius:10px;background:#11130f;color:#c9bfab;font-size:10px;line-height:1.6}.cg-auth-message svg{color:#c5a45d;flex:none;margin-top:1px}.cg-enter-ledger{width:100%;margin-top:12px}.cg-auth-trust{display:flex;gap:8px;align-items:flex-start;margin-top:20px;padding-top:16px;border-top:1px solid #24272b;color:#716c64;font-size:9px;line-height:1.65}.cg-auth-trust svg{color:#80652e;flex:none;margin-top:1px}.cg-spin{animation:cgspin 1s linear infinite}@keyframes cgspin{to{transform:rotate(360deg)}}@media(max-width:560px){.cg-auth-shell{padding:18px 12px;align-items:flex-start}.cg-auth-card{padding:22px;margin-top:4vh;border-radius:13px}.cg-auth-grid{grid-template-columns:1fr}.cg-auth-tabs{margin-top:20px}.cg-auth-card h1{font-size:42px}}
`;

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
    void supabase.auth.getUser().then(async ({ data }) => {
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

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const id = createSoulId();
      const { data, error } = await supabase.auth.signUp({
        email: authEmail(id),
        password: passwordValue,
        options: { data: { soul_id: id, language, region, role: "user" } },
      });

      if (!error && data.user) {
        if (!data.session) {
          throw new Error("Soul creation needs an active session. In Supabase, turn off email confirmation for this MVP because the internal Soul address cannot receive mail.");
        }

        // The profile trigger is the source of truth for the public Soul ID.
        // Read it back before declaring creation successful so a missing SQL
        // trigger cannot leave the user with an account but no visible Soul.
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("soul_id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) throw new Error(`Soul account created, but the profile could not be loaded: ${profileError.message}`);
        if (!profile?.soul_id) {
          throw new Error("Soul account was created, but its Soul ID was not recorded. Run the latest supabase/schema.sql trigger setup, then try again.");
        }

        setCreated(profile.soul_id);
        setSoulId(profile.soul_id);
        setPassword("");
        setMode("return");
        setMessage("Your Soul is ready. Keep the five-character Soul ID and password safe.");
        return;
      }

      // A collision is extremely unlikely, but the unique profile constraint
      // means we can safely generate another five-character ID and retry.
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
        <Link href="/" className="cg-auth-back"><ArrowLeft size={15} /> Ledger</Link>
        <div className="cg-auth-mark"><span>🪔</span></div>
        <div className="cg-eyebrow">Anonymous Soul Ledger</div>
        <h1>{mode === "create" ? "Keep your Soul" : "Return to your Soul"}</h1>
        <p className="cg-auth-intro">No name. No email. Your public identity is a generated five-character Soul ID. The email-like value used by Supabase is internal and never shown to you.</p>

        <div className="cg-auth-tabs">
          <button type="button" className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setMessage(""); }}>Create Soul</button>
          <button type="button" className={mode === "return" ? "active" : ""} onClick={() => { setMode("return"); setMessage(""); }}>Return</button>
        </div>

        <form onSubmit={submit} className="cg-auth-form">
          {mode === "create" && <div className="cg-auth-grid">
            <label>LANGUAGE<select value={language} onChange={(e) => setLanguage(e.target.value as Language)}><option value="en">English</option><option value="te">తెలుగు</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option><option value="kn">ಕನ್ನಡ</option><option value="ml">മലയാളം</option><option value="mr">मराठी</option><option value="bn">বাংলা</option></select></label>
            <label>REGION<select value={region} onChange={(e) => setRegion(e.target.value)}><option value="IN">India</option><option value="AP">Andhra Pradesh</option><option value="TS">Telangana</option><option value="KA">Karnataka</option><option value="TN">Tamil Nadu</option><option value="KL">Kerala</option><option value="MH">Maharashtra</option><option value="WB">West Bengal</option><option value="DL">Delhi</option><option value="UP">Uttar Pradesh</option></select></label>
          </div>}
          {mode === "return" && <label>SOUL ID<input value={soulId} onChange={(e) => setSoulId(e.target.value.toUpperCase())} placeholder="A7F9K" maxLength={5} autoCapitalize="characters" required /></label>}
          <label>PASSWORD<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
          <button className="cg-primary" type="submit" disabled={busy}>{busy ? <><Loader2 size={16} className="cg-spin" /> Connecting…</> : <><KeyRound size={16} />{mode === "create" ? "Generate my Soul ID" : "Verify Soul"}</>}</button>
        </form>

        {created && <div className="cg-soul-preview"><span className="cg-eyebrow">Your anonymous identity</span><strong>#{created}</strong><small>Five characters for the MVP. We can expand the namespace as the Soul population grows.</small></div>}
        {message && <div className="cg-auth-message"><ShieldCheck size={16} /><span>{message}</span></div>}
        {created && <button className="cg-primary cg-enter-ledger" type="button" onClick={enterLedger}>Enter the Ledger</button>}
        <div className="cg-auth-trust"><Sparkles size={15} /><span>Your password is handled by Supabase Auth. No real-world identifier is collected. For the MVP, disable email confirmation because the internal authentication address is intentionally unreachable.</span></div>
      </section>
      <style>{pageStyles}</style>
    </main>
  );
}
