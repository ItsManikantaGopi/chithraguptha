"use client";

import {FormEvent, useEffect, useState} from "react";
import Link from "next/link";
import {ArrowLeft, KeyRound, Sparkles, ShieldCheck} from "lucide-react";

const STORAGE_KEY = "cg-soul-account";
type LocalAccount = { soulId: string; verifier: string };

function createSoulId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `#${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

async function digest(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SoulLogin() {
  const [mode, setMode] = useState<"create" | "return">("create");
  const [soulId, setSoulId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<LocalAccount | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const account = JSON.parse(raw) as LocalAccount;
      setCreated(account);
      setSoulId(account.soulId);
      setMode("return");
    } catch {}
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("Use at least 8 characters for your Soul password.");
      return;
    }

    if (mode === "create") {
      const id = createSoulId();
      const verifier = await digest(`${id}:${password}`);
      const account = {soulId: id, verifier};
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      setCreated(account);
      setSoulId(id);
      setMessage("Your Soul ID is ready. Keep it with your password.");
      setMode("return");
      return;
    }

    const verifier = await digest(`${soulId.trim().toUpperCase()}:${password}`);
    if (created?.soulId === soulId.trim().toUpperCase() && created.verifier === verifier) {
      setMessage("Welcome back, Soul. This device recognizes your local account.");
    } else {
      setMessage("This prototype cannot verify an account stored on another device yet. The production flow will verify the Soul ID and password against the server-side account store.");
    }
  }

  return (
    <main className="cg-auth-shell">
      <section className="cg-auth-card">
        <Link href="/" className="cg-auth-back"><ArrowLeft size={15}/> Ledger</Link>
        <div className="cg-auth-mark"><span>🪔</span></div>
        <div className="cg-eyebrow">Anonymous Soul Ledger</div>
        <h1>{mode === "create" ? "Keep your Soul" : "Return to your Soul"}</h1>
        <p className="cg-auth-intro">No name. No email. Your public identity is a generated Soul ID. Use the password only to prove that you are the same keeper of that Soul on another device.</p>

        <div className="cg-auth-tabs">
          <button className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Create Soul</button>
          <button className={mode === "return" ? "active" : ""} onClick={() => setMode("return")}>Return</button>
        </div>

        <form onSubmit={submit} className="cg-auth-form">
          {mode === "return" && <label>SOUL ID<input value={soulId} onChange={(e) => setSoulId(e.target.value)} placeholder="#A7F91C20D4B18E2A" autoCapitalize="characters" required/></label>}
          <label>PASSWORD<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required/></label>
          <button className="cg-primary" type="submit"><KeyRound size={16}/>{mode === "create" ? "Generate my Soul ID" : "Enter the Ledger"}</button>
        </form>

        {mode === "create" && <div className="cg-soul-preview"><span className="cg-eyebrow">Generated identity</span><strong>{created?.soulId ?? "#••••••••••••••••"}</strong><small>Your Soul ID is not your real-world identity.</small></div>}
        {message && <div className="cg-auth-message"><ShieldCheck size={16}/><span>{message}</span></div>}

        <div className="cg-auth-trust"><Sparkles size={15}/><span>Designed for anonymous continuity. Production authentication will use a server-side account store with salted password hashing and secure sessions; this prototype stores only a local verifier.</span></div>
      </section>
      <style>{` .cg-auth-shell{min-height:100vh;display:grid;place-items:center;padding:32px 16px;background:radial-gradient(700px 400px at 50% 0%,rgba(211,173,93,.09),transparent 70%),#070809;color:#eee9df;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.cg-auth-card{width:min(100%,520px);background:#0d1014;border:1px solid #34383e;border-radius:16px;padding:28px;box-shadow:0 30px 90px rgba(0,0,0,.42)}.cg-auth-back{display:inline-flex;align-items:center;gap:6px;color:#9b958b;text-decoration:none;font-size:11px;margin-bottom:30px}.cg-auth-mark{width:52px;height:52px;display:grid;place-items:center;border:1px solid #6f5629;border-radius:14px;background:#17130d;font-size:25px;margin-bottom:18px}.cg-auth-card h1{font:600 clamp(38px,8vw,52px)/.95 Cormorant Garamond,Georgia,serif;margin:8px 0 13px}.cg-auth-intro{font-size:12px;line-height:1.75;color:#9b958b;margin:0}.cg-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:24px 0 18px;padding:4px;background:#090b0e;border:1px solid #25292e;border-radius:10px}.cg-auth-tabs button{height:38px;border:0;border-radius:7px;background:transparent;color:#858077;font-size:11px;font-weight:700}.cg-auth-tabs button.active{background:#211a0d;color:#ead39d}.cg-auth-form{display:grid;gap:13px}.cg-auth-form label{display:grid;gap:7px;color:#b9b2a8;font-size:9px;font-weight:700;letter-spacing:.14em}.cg-auth-form input{height:46px;width:100%;border-radius:10px;border:1px solid #454a50;background:#090b0e;color:#eee9df;padding:0 12px;outline:0;font-size:12px;letter-spacing:normal}.cg-auth-form input:focus{border-color:#80652e;box-shadow:0 0 0 3px rgba(212,174,93,.06)}.cg-auth-form .cg-primary{width:100%;height:46px;margin-top:2px}.cg-soul-preview{display:grid;gap:5px;margin-top:15px;padding:15px;border:1px dashed #66532e;border-radius:11px;background:#12100c}.cg-soul-preview strong{font:600 24px/1 ui-monospace,monospace;color:#ead39d;letter-spacing:.08em}.cg-soul-preview small{font-size:9px;color:#746e64}.cg-auth-message{display:flex;gap:9px;align-items:flex-start;margin-top:13px;padding:11px 12px;border:1px solid #4d5e42;border-radius:10px;background:#0f170f;color:#b8c8ae;font-size:10px;line-height:1.6}.cg-auth-trust{display:flex;gap:8px;align-items:flex-start;margin-top:20px;padding-top:17px;border-top:1px solid #25292e;color:#706b63;font-size:9px;line-height:1.65}.cg-auth-trust svg{color:#9f8247;flex:none}@media(max-width:560px){.cg-auth-card{padding:22px;border-radius:13px}.cg-auth-shell{padding:16px}} `}</style>
    </main>
  );
}
