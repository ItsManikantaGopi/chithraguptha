"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Copy, Flame, Globe2, Leaf, Loader2, LogIn, LogOut, ScrollText, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { copy, productLanguages, type ProductLanguage } from "@/data/i18n";
import type { Confession, Language, Profile, ReactionType } from "@/lib/supabase/types";

const categories: Record<Language, string[]> = {
  en: ["Petty Sin", "Career", "Love", "Regret", "Deep Secret"],
  te: ["చిన్న తప్పు", "వృత్తి", "ప్రేమ", "పశ్చాత్తాపం", "లోతైన రహస్యం"],
  hi: ["छोटी भूल", "करियर", "प्रेम", "पश्चाताप", "गहरा रहस्य"],
  ta: ["சிறு தவறு", "வேலை", "காதல்", "வருத்தம்", "ஆழ்ந்த ரகசியம்"],
  kn: ["ಸಣ್ಣ ತಪ್ಪು", "ವೃತ್ತಿ", "ಪ್ರೀತಿ", "ಪಶ್ಚಾತ್ತಾಪ", "ಆಳವಾದ ರಹಸ್ಯ"],
  ml: ["ചെറിയ തെറ്റ്", "തൊഴിൽ", "പ്രണയം", "പശ്ചാത്താപം", "ആഴത്തിലുള്ള രഹസ്യം"],
  mr: ["किरकोळ चूक", "करिअर", "प्रेम", "पश्चात्ताप", "गुपित"],
  bn: ["ছোট ভুল", "কর্মজীবন", "ভালোবাসা", "অনুতাপ", "গভীর গোপন"],
};
const regions = ["IN", "AP", "TS", "KA", "TN", "KL", "MH", "WB", "DL", "UP"];
const confessionSelect = "id,soul_id,display_soul,language,region,category,content,status,created_at,updated_at,moderated_at,moderated_by";

function elapsed(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function displaySoul(item: Confession) {
  return item.display_soul ? `#${item.display_soul}` : item.soul_id ? "#•••••" : "#SEED";
}

export default function LiveLedgerFixed() {
  const supabase = useMemo(() => createClient(), []);
  const [language, setLanguage] = useState<ProductLanguage>("en");
  const [region, setRegion] = useState("IN");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [counts, setCounts] = useState<Record<string, { punya: number; paapa: number }>>({});
  const [voted, setVoted] = useState<Record<string, ReactionType>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const t = copy[language];
  const cats = categories[language];

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const loadProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setProfile(null); return null; }
    const { data, error: profileError } = await supabase.from("profiles").select("id,soul_id,role,language,region,created_at").eq("id", userData.user.id).maybeSingle();
    if (profileError) { setError(profileError.message); setProfile(null); return null; }
    const next = (data as Profile | null) ?? null;
    setProfile(next);
    if (next?.language && copy[next.language as ProductLanguage]) setLanguage(next.language as ProductLanguage);
    if (next?.region) setRegion(next.region);
    return next;
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [{ data, error: feedError }, { data: reactionRows, error: reactionError }] = await Promise.all([
      supabase.from("confessions").select(confessionSelect).eq("status", "published").order("created_at", { ascending: false }).limit(60),
      supabase.from("reactions").select("confession_id,type,soul_id,created_at").limit(5000),
    ]);
    if (feedError || reactionError) setError(feedError?.message || reactionError?.message || "Could not load the Ledger.");
    setConfessions((data as Confession[]) || []);
    const nextCounts: Record<string, { punya: number; paapa: number }> = {};
    for (const row of reactionRows || []) {
      nextCounts[row.confession_id] ??= { punya: 0, paapa: 0 };
      nextCounts[row.confession_id][row.type as ReactionType] += 1;
    }
    setCounts(nextCounts);
    const current = await loadProfile();
    if (current) {
      const { data: mine } = await supabase.from("reactions").select("confession_id,type").eq("soul_id", current.id);
      const map: Record<string, ReactionType> = {};
      for (const row of mine || []) map[row.confession_id] = row.type as ReactionType;
      setVoted(map);
    } else setVoted({});
    setLoading(false);
  }, [loadProfile, supabase]);

  useEffect(() => {
    const saved = window.localStorage.getItem("cg-language") as ProductLanguage | null;
    if (saved && copy[saved]) setLanguage(saved);
    void load();
    const { data } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => data.subscription.unsubscribe();
  }, [load, supabase]);

  function changeLanguage(next: ProductLanguage) {
    setLanguage(next);
    window.localStorage.setItem("cg-language", next);
    document.documentElement.lang = next;
  }

  async function record() {
    if (!profile) { notify("Create or return to your Soul before recording."); return; }
    const content = text.trim();
    if (!content) { notify("Write something before recording it in the Ledger."); return; }
    setSaving(true);
    const { data, error: insertError } = await supabase.from("confessions").insert({ soul_id: profile.id, language, region, category: cats[category], content }).select(confessionSelect).single();
    setSaving(false);
    if (insertError) { notify(insertError.message); return; }
    setText(""); setCategory(0);
    notify(data?.status === "pending" ? "Your confession is in the Ledger queue for review." : "Your deed has been recorded anonymously.");
    await load();
  }

  async function react(confessionId: string, type: ReactionType) {
    if (!profile) { notify("Create or return to your Soul to pass judgment."); return; }
    if (voted[confessionId]) return;
    const { error: reactionError } = await supabase.from("reactions").insert({ confession_id: confessionId, soul_id: profile.id, type });
    if (reactionError) { notify(/duplicate|unique/i.test(reactionError.message) ? "Your judgment is already recorded." : reactionError.message); return; }
    setVoted((current) => ({ ...current, [confessionId]: type }));
    setCounts((current) => {
      const previous = current[confessionId] || { punya: 0, paapa: 0 };
      return { ...current, [confessionId]: { punya: previous.punya + (type === "punya" ? 1 : 0), paapa: previous.paapa + (type === "paapa" ? 1 : 0) } };
    });
    notify(type === "punya" ? "Punya recorded." : "Paapa recorded.");
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null); setVoted({});
    notify("You have left the Ledger. Your Soul remains anonymous.");
  }

  async function copySoul() {
    if (!profile?.soul_id) return;
    await navigator.clipboard?.writeText(profile.soul_id);
    setCopied(true); notify("Soul ID copied. Keep it with your password.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="cg-shell">
      <header className="cg-header">
        <div className="cg-brand"><div className="cg-lamp">🪔</div><div><div className="cg-eyebrow">The Cosmic Ledger</div><div className="cg-title">Chithraguptha</div><div className="cg-tagline cg-muted">{t.tagline}</div></div></div>
        <div className="cg-header-tools">
          <label className="cg-language"><Globe2 size={14}/><span>{t.language}</span><select value={language} onChange={(e) => changeLanguage(e.target.value as ProductLanguage)} aria-label={t.language}>{Object.entries(productLanguages).map(([code, lang]) => <option value={code} key={code}>{lang.native}</option>)}</select></label>
          <label className="cg-language"><span>Region</span><select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <nav className="cg-nav"><Link href="/" className="active">{t.ledger}</Link><Link href="/garuda-purana">{t.garuda}</Link><Link href="/dharma">{t.dharma}</Link><Link href="/about">{t.about}</Link></nav>
          {profile?.soul_id ? <div className="cg-soul-header"><span className="cg-soul-header-label">SOUL</span><strong>#{profile.soul_id}</strong><button onClick={copySoul} aria-label="Copy Soul ID">{copied ? <Check size={13}/> : <Copy size={13}/>}</button><button onClick={logout} aria-label="Leave Ledger"><LogOut size={13}/></button></div> : <Link href="/login" className="cg-login-button"><LogIn size={14}/><span>Login</span></Link>}
        </div>
      </header>

      <main className="cg-main">
        <section className="cg-hero"><div className="cg-hero-mark">🪔</div><div className="cg-eyebrow">{t.heroEyebrow}</div><h1>{t.heroTitle}</h1><p>{t.heroBody}</p><div className="cg-actions"><Link href={profile ? "#composer" : "/login"} className="cg-primary"><ScrollText size={16}/>{profile ? "Write a confession" : t.enter}</Link><button className="cg-secondary" onClick={() => document.getElementById("ledger")?.scrollIntoView({ behavior: "smooth" })}><BookOpen size={16}/>Explore the Ledger</button></div><div className="cg-hero-trust"><span><ShieldCheck size={14}/>{t.anonymous}</span><span><BookOpen size={14}/>{t.sacredNote}</span></div></section>
        <section className="cg-stats"><div className="cg-stat"><b>{confessions.length.toLocaleString()}</b><span>Published entries</span></div><div className="cg-stat"><b>{Object.values(counts).reduce((total, item) => total + item.punya + item.paapa, 0).toLocaleString()}</b><span>Judgments</span></div><div className="cg-stat"><b>{profile ? "SOUL" : "OPEN"}</b><span>{profile ? "Authenticated" : "Public preview"}</span></div></section>

        <section className={`cg-composer ${profile ? "" : "cg-preview"}`} id="composer">
          <div className="cg-composer-heading"><div><div className="cg-eyebrow">{t.recordEyebrow}</div><h2 className="cg-section-title">{t.confession}</h2></div><span className="cg-seal">{profile ? "PRIVATE" : "PREVIEW"}</span></div>
          {profile ? <><label className="cg-composer-label">CONFIDENTIAL</label><textarea className="cg-textarea" value={text} onChange={(e) => setText(e.target.value.slice(0,500))} maxLength={500} placeholder={t.placeholder}/><div className="cg-counter">{text.length} / 500</div><div className="cg-compose-row"><select className="cg-select" value={category} onChange={(e) => setCategory(Number(e.target.value))}>{cats.map((item,index) => <option key={index} value={index}>{item}</option>)}</select><button className="cg-primary" onClick={record} disabled={saving}>{saving ? <><Loader2 size={15} className="cg-spin"/>Recording…</> : <>{t.record}<ArrowRight size={15}/></>}</button></div><p className="cg-note cg-composer-note"><ShieldCheck size={13}/> Your confession is tied to your anonymous Soul ID, never a real-world identity.</p></> : <><Link href="/login" className="cg-preview-field"><span>{t.placeholder}</span><small>Login or create a Soul to write in the Ledger.</small></Link><div className="cg-counter">0 / 500</div><div className="cg-compose-row"><Link href="/login" className="cg-select cg-preview-control">Choose a category</Link><Link href="/login" className="cg-primary">{t.record}<ArrowRight size={15}/></Link></div></>}
        </section>

        <section className="cg-ledger-intro" id="ledger"><div><div className="cg-eyebrow">{t.community}</div><h2>{t.today}</h2></div><p className="cg-note">Entries are read anonymously. Judgment requires a Soul so one person cannot flood the Ledger.</p></section>
        {error && <div className="cg-source-banner"><ShieldCheck size={15}/><span>{error} Check your Supabase environment variables and SQL migrations.</span></div>}
        {loading ? <div className="cg-mini"><Loader2 className="cg-spin"/> Loading the Ledger…</div> : <div className="cg-feed">{confessions.map((item) => { const count = counts[item.id] || { punya:0, paapa:0 }; const choice = voted[item.id]; return <article className="cg-card" id={`soul-${item.id}`} key={item.id}><div className="cg-meta"><span className="cg-pill">{item.category}</span><span className="cg-time">{elapsed(item.created_at)} · {item.region}</span></div><div className="cg-confession">{item.content}</div><div className="cg-soul">Soul {displaySoul(item)}</div><div className="cg-reactions"><button className={`cg-react green ${choice === "punya" ? "selected" : ""}`} disabled={!!choice} onClick={() => react(item.id,"punya")}><Leaf size={16}/><b>Punya</b><span>{count.punya}</span></button><button className={`cg-react red ${choice === "paapa" ? "selected" : ""}`} disabled={!!choice} onClick={() => react(item.id,"paapa")}><Flame size={16}/><b>Paapa</b><span>{count.paapa}</span></button></div>{!profile && <div className="cg-micro"><Link href="/login">Login or create a Soul</Link> to pass judgment.</div>}</article>})}</div>}
        <footer className="cg-footer">{t.company}</footer>
      </main>

      {toast && <div className="cg-toast" role="status">{toast}</div>}
      <style jsx>{`.cg-shell{min-height:100vh;background:#0d0c0a;color:#eee7d5}.cg-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px clamp(16px,4vw,48px);border-bottom:1px solid rgba(191,153,76,.2);background:rgba(13,12,10,.94);backdrop-filter:blur(16px)}.cg-brand,.cg-header-tools,.cg-language,.cg-nav,.cg-soul-header,.cg-actions,.cg-hero-trust,.cg-compose-row,.cg-meta,.cg-reactions{display:flex;align-items:center}.cg-brand{gap:12px}.cg-lamp{font-size:28px}.cg-title{font:700 24px Georgia,serif}.cg-eyebrow{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#bda05e}.cg-tagline{font-size:12px;margin-top:2px}.cg-muted{color:#8f8a7f}.cg-header-tools{gap:10px;flex-wrap:wrap;justify-content:flex-end}.cg-language{gap:5px;color:#aaa397;font-size:11px}.cg-language select{border:1px solid #39352e;background:#16140f;color:#ddd4c2;border-radius:7px;padding:6px 8px}.cg-nav{gap:4px}.cg-nav a{color:#a8a196;text-decoration:none;font-size:12px;padding:7px 9px;border-radius:7px}.cg-nav a:hover,.cg-nav .active{background:#1d1a14;color:#e0bd68}.cg-soul-header{gap:5px;height:34px;padding:0 7px;border:1px solid #66552f;border-radius:9px;background:#15120d;color:#dfc36f}.cg-soul-header button{display:grid;place-items:center;border:0;background:transparent;color:#9e927c;cursor:pointer}.cg-login-button,.cg-primary,.cg-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;cursor:pointer;border-radius:9px;font-size:12px;font-weight:700}.cg-login-button{padding:8px 12px;border:1px solid #6d5a31;color:#e0bd68}.cg-main{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:44px 0 60px}.cg-hero{text-align:center;padding:30px 12px 36px}.cg-hero-mark{font-size:42px;margin-bottom:14px}.cg-hero h1{max-width:760px;margin:10px auto;font:700 clamp(36px,6vw,66px)/1.02 Georgia,serif}.cg-hero p{max-width:650px;margin:16px auto;color:#aaa398;font-size:15px;line-height:1.7}.cg-actions{justify-content:center;gap:10px;margin-top:22px;flex-wrap:wrap}.cg-primary{min-height:40px;padding:0 15px;border:1px solid #9b7834;background:#b18a3f;color:#17130b}.cg-primary:disabled{opacity:.6;cursor:not-allowed}.cg-secondary{min-height:40px;padding:0 15px;border:1px solid #39342b;background:#17150f;color:#d0c7b7}.cg-hero-trust{justify-content:center;gap:18px;flex-wrap:wrap;margin-top:20px;color:#817b70;font-size:11px}.cg-hero-trust span{display:inline-flex;align-items:center;gap:6px}.cg-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 28px}.cg-stat{padding:17px 18px;border:1px solid #2d2a24;border-radius:10px;background:#12110e}.cg-stat b{display:block;font:700 22px Georgia,serif;color:#e0c477}.cg-stat span{display:block;margin-top:4px;color:#817b70;font-size:10px;text-transform:uppercase;letter-spacing:.1em}.cg-composer{padding:22px;border:1px solid #3b3427;border-radius:12px;background:linear-gradient(145deg,#15130e,#100f0c)}.cg-composer-heading,.cg-ledger-intro{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.cg-section-title{margin:5px 0 20px;font:700 27px Georgia,serif}.cg-seal{padding:5px 8px;border:1px solid #5d4b29;border-radius:999px;color:#bda05e;font-size:9px;font-weight:700;letter-spacing:.14em}.cg-composer-label{display:block;margin-bottom:7px;color:#7e776b;font-size:10px;letter-spacing:.12em}.cg-textarea{display:block;width:100%;min-height:170px;resize:vertical;border:1px solid #39352d;border-radius:9px;background:#0d0c0a;color:#eee7d5;padding:14px;font:16px/1.65 Georgia,serif;outline:none}.cg-textarea:focus{border-color:#8b6d37}.cg-counter{text-align:right;margin:6px 2px 12px;color:#706b61;font-size:10px}.cg-compose-row{gap:10px}.cg-select{min-height:40px;flex:1;border:1px solid #39352d;border-radius:9px;background:#12110e;color:#cfc7b8;padding:10px;text-decoration:none}.cg-compose-row .cg-primary{min-width:190px}.cg-note{color:#777168;font-size:11px;line-height:1.5}.cg-composer-note{display:flex;gap:6px;align-items:center;margin:12px 0 0}.cg-preview-field{display:flex;flex-direction:column;justify-content:center;gap:7px;min-height:170px;padding:18px;border:1px dashed #3b352a;border-radius:9px;background:#0e0d0b;color:#777168;text-decoration:none}.cg-preview-field span{font:16px Georgia,serif;color:#8f887c}.cg-preview-field small{font:11px sans-serif}.cg-preview-control{display:flex;align-items:center}.cg-ledger-intro{margin:42px 0 18px;align-items:end}.cg-ledger-intro h2{margin:5px 0 0;font:700 28px Georgia,serif}.cg-ledger-intro .cg-note{max-width:440px;margin:0}.cg-source-banner{display:flex;gap:8px;align-items:flex-start;padding:12px 14px;margin-bottom:14px;border:1px solid #5a3d30;border-radius:9px;background:#1a110e;color:#c8a996;font-size:11px;line-height:1.5}.cg-mini{display:flex;align-items:center;justify-content:center;gap:8px;padding:30px;color:#8c8579}.cg-feed{display:grid;gap:12px}.cg-card{padding:18px;border:1px solid #2e2b25;border-radius:11px;background:#12110e}.cg-meta{justify-content:space-between;gap:12px}.cg-pill{padding:5px 8px;border-radius:999px;background:#1e1a12;color:#c4a55c;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.cg-time,.cg-soul{color:#716b61;font-size:10px}.cg-confession{margin:17px 0 13px;max-width:850px;font:18px/1.65 Georgia,serif;color:#e6dfd1}.cg-reactions{gap:8px}.cg-react{display:flex;align-items:center;gap:7px;min-height:38px;padding:0 11px;border:1px solid #37332c;border-radius:8px;background:#17150f;color:#a9a196;cursor:pointer}.cg-react span{color:#ddd3c1}.cg-react.green.selected{border-color:#66784d;background:#1c2416;color:#b5cb8e}.cg-react.red.selected{border-color:#79433c;background:#271513;color:#df9187}.cg-react:disabled{cursor:default;opacity:.72}.cg-micro{margin-top:10px;color:#716b61;font-size:10px}.cg-micro a{color:#c5a65c}.cg-footer{padding-top:40px;text-align:center;color:#5f5a51;font-size:10px}.cg-toast{position:fixed;right:18px;bottom:18px;z-index:50;max-width:360px;padding:11px 14px;border:1px solid #5b492a;border-radius:9px;background:#18140d;color:#e3d7c0;box-shadow:0 10px 35px rgba(0,0,0,.35);font-size:12px}.cg-spin{animation:cgspin 1s linear infinite}@keyframes cgspin{to{transform:rotate(360deg)}}@media(max-width:900px){.cg-header{align-items:flex-start}.cg-header-tools{gap:7px}.cg-nav{order:3;width:100%;justify-content:center}.cg-main{width:min(100% - 24px,720px)}.cg-stats{grid-template-columns:1fr}.cg-compose-row{align-items:stretch;flex-direction:column}.cg-compose-row .cg-primary{width:100%}.cg-ledger-intro{flex-direction:column;align-items:flex-start}.cg-ledger-intro .cg-note{max-width:none}}@media(max-width:620px){.cg-header{position:relative;flex-direction:column}.cg-header-tools{width:100%;justify-content:flex-start}.cg-nav{justify-content:flex-start;overflow:auto}.cg-title{font-size:21px}.cg-main{width:min(100% - 20px,560px);padding-top:25px}.cg-hero{padding-top:15px}.cg-hero h1{font-size:42px}.cg-composer{padding:16px}.cg-composer-heading{gap:10px}.cg-section-title{font-size:24px}.cg-card{padding:15px}.cg-confession{font-size:17px}.cg-reactions{width:100%}.cg-react{flex:1;justify-content:center}.cg-soul-header{margin-left:auto}}`}</style>
    </div>
  );
}
