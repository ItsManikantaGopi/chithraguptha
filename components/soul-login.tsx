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
    </main>
  );
}
