"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Eye, Flame, Loader2, LogOut, ShieldCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Confession, Profile } from "@/lib/supabase/types";

type AdminProfileRow = Pick<Profile, "id" | "soul_id" | "role" | "language" | "region" | "created_at">;

export default function AdminPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [all, setAll] = useState<Confession[]>([]);
  const [moderation, setModeration] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void bootstrap(); }, []);

  async function bootstrap() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { data: rawProfile, error } = await supabase
      .from("profiles")
      .select("id,soul_id,role,language,region,created_at")
      .eq("id", data.user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      return;
    }

    const p = rawProfile as AdminProfileRow | null;
    if (p?.role === "admin") {
      setProfile(p as Profile);
      await loadData();
    } else if (p) {
      setMessage("This Soul is not an administrator.");
    }
  }

  async function loadData() {
    const [{ data: rows, error: rowsError }, { data: setting, error: settingError }] = await Promise.all([
      supabase
        .from("confessions")
        .select("id,soul_id,display_soul,language,region,category,content,status,created_at,updated_at,moderated_at,moderated_by")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("app_settings").select("moderation_enabled").eq("id", true).single(),
    ]);

    if (rowsError) setMessage(rowsError.message);
    if (settingError) setMessage(settingError.message);
    setAll((rows as Confession[] | null) || []);
    setModeration(Boolean(setting?.moderation_enabled));
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) setMessage(error?.message || "Could not sign in.");
    else await bootstrap();
    setBusy(false);
  }

  async function toggleModeration() {
    setBusy(true);
    const next = !moderation;
    const { error } = await supabase
      .from("app_settings")
      .update({ moderation_enabled: next, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) setMessage(error.message);
    else {
      setModeration(next);
      setMessage(next ? "Moderation is ON. New confessions will enter the queue." : "Moderation is OFF. New confessions publish immediately.");
    }
    setBusy(false);
  }

  async function moderate(id: string, status: "published" | "rejected") {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("confessions")
      .update({ status, moderated_at: new Date().toISOString(), moderated_by: userData.user?.id ?? null })
      .eq("id", id);
    if (error) setMessage(error.message);
    else await loadData();
    setBusy(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this confession permanently?")) return;
    setBusy(true);
    const { error } = await supabase.from("confessions").delete().eq("id", id);
    if (error) setMessage(error.message);
    else await loadData();
    setBusy(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
    setAll([]);
  }

  if (!profile) return <main className="cg-admin-shell"><section className="cg-admin-card"><Link href="/" className="cg-admin-back">← Ledger</Link><div className="cg-eyebrow">Chithraguptha · Steward</div><h1>Moderation desk</h1><p className="cg-admin-copy">This private dashboard controls whether new confessions are published immediately or held for review. It is intentionally separate from the public Soul experience.</p><form onSubmit={login} className="cg-auth-form"><label>ADMIN EMAIL<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com"/></label><label>PASSWORD<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/></label><button className="cg-primary" disabled={busy}>{busy ? <Loader2 className="cg-spin" size={15}/> : <ShieldCheck size={15}/>} Enter moderation desk</button></form>{message && <div className="cg-admin-message">{message}</div>}</section><style>{adminStyles}</style></main>;

  const pending = all.filter((x) => x.status === "pending");
  const published = all.filter((x) => x.status === "published");
  return <main className="cg-admin-shell"><section className="cg-admin-wrap"><header className="cg-admin-header"><div><div className="cg-eyebrow">Private stewardship</div><h1>Moderation desk</h1><p>Control the Ledger without changing the public experience.</p></div><div className="cg-admin-actions"><Link href="/" className="cg-secondary"><Eye size={14}/> View site</Link><button className="cg-secondary" onClick={logout}><LogOut size={14}/> Sign out</button></div></header><section className="cg-admin-control"><div><span className="cg-eyebrow">Publishing gate</span><h2>Moderation is {moderation ? "ON" : "OFF"}</h2><p>{moderation ? "New user confessions become pending until a steward approves them." : "New user confessions publish immediately. You can turn this on at any time."}</p></div><button className={moderation ? "cg-danger" : "cg-primary"} onClick={toggleModeration} disabled={busy}>{moderation ? "Turn moderation off" : "Turn moderation on"}</button></section><div className="cg-admin-stats"><div><strong>{pending.length}</strong><span>Pending</span></div><div><strong>{published.length}</strong><span>Published</span></div><div><strong>{all.length}</strong><span>Total visible</span></div></div><section className="cg-admin-section"><div className="cg-eyebrow">Review queue</div><h2>Pending confessions</h2>{pending.length === 0 ? <div className="cg-admin-empty"><Check size={18}/> Nothing is waiting for review.</div> : <div className="cg-admin-list">{pending.map((item) => <article className="cg-admin-item" key={item.id}><div className="cg-meta"><span className="cg-pill">{item.category}</span><span className="cg-time">{item.language} · {item.region}</span></div><p>{item.content}</p><small>Soul {item.display_soul || "anonymous"} · {new Date(item.created_at).toLocaleString()}</small><div className="cg-admin-item-actions"><button className="cg-primary" onClick={() => moderate(item.id, "published")}><Check size={14}/> Publish</button><button className="cg-danger" onClick={() => moderate(item.id, "rejected")}><X size={14}/> Reject</button><button className="cg-secondary" onClick={() => remove(item.id)}><Flame size={14}/> Remove</button></div></article>)}</div>}</section>{message && <div className="cg-admin-message">{message}</div>}</section><style>{adminStyles}</style></main>;
}

const adminStyles = `.cg-admin-shell{min-height:100vh;background:radial-gradient(700px 400px at 50% 0%,rgba(211,173,93,.09),transparent 70%),#070809;color:#eee9df;padding:24px 16px;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.cg-admin-wrap,.cg-admin-card{width:min(100%,1080px);margin:0 auto}.cg-admin-card{max-width:520px;margin-top:8vh;background:#0d1014;border:1px solid #34383e;border-radius:16px;padding:28px;box-shadow:0 30px 90px rgba(0,0,0,.42)}.cg-admin-back{display:inline-block;color:#aaa49a;text-decoration:none;font-size:11px;margin-bottom:30px}.cg-admin-card h1,.cg-admin-header h1{font:600 44px/.98 Cormorant Garamond,Georgia,serif;margin:8px 0 12px}.cg-admin-copy,.cg-admin-header p,.cg-admin-control p{font-size:12px;line-height:1.7;color:#8e8980}.cg-admin-header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding:25px 0}.cg-admin-actions{display:flex;gap:8px}.cg-admin-control{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px;background:#101319;border:1px solid #4d3e25;border-radius:14px}.cg-admin-control h2{font:24px Georgia,serif;margin:6px 0}.cg-admin-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0 30px}.cg-admin-stats>div{padding:16px;background:#101319;border:1px solid #292b31;border-radius:12px;text-align:center}.cg-admin-stats strong{display:block;font:26px Georgia,serif;color:#e7ce91}.cg-admin-stats span{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#777168}.cg-admin-section h2{font:26px Georgia,serif;margin:7px 0 16px}.cg-admin-list{display:grid;gap:10px}.cg-admin-item{padding:17px;background:#101319;border:1px solid #34383e;border-radius:13px}.cg-admin-item p{font:16px/1.7 Georgia,serif;color:#ddd8ce;margin:14px 0 8px}.cg-admin-item small{color:#716c64;font-size:9px}.cg-admin-item-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.cg-danger{height:40px;padding:0 13px;border-radius:9px;border:1px solid #6c3434;background:#211010;color:#e7a2a2;font-size:10px;font-weight:800}.cg-admin-empty{display:flex;gap:8px;align-items:center;padding:22px;border:1px dashed #4d4a42;border-radius:12px;color:#8e8980;font-size:11px}.cg-admin-message{margin-top:14px;padding:11px 12px;border:1px solid #5d4927;border-radius:10px;background:#17130d;color:#d7c38e;font-size:10px;line-height:1.6}.cg-spin{animation:cgspin 1s linear infinite}@keyframes cgspin{to{transform:rotate(360deg)}}@media(max-width:680px){.cg-admin-header,.cg-admin-control{align-items:stretch;flex-direction:column}.cg-admin-actions{width:100%}.cg-admin-actions>*{flex:1;justify-content:center}.cg-admin-stats{gap:6px}.cg-admin-card{padding:22px}.cg-admin-card h1,.cg-admin-header h1{font-size:36px}}`;
