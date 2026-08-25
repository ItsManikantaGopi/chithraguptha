"use client";

import { useEffect, useMemo, useState } from "react";
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
  ml: ["ചെറിയ തെറ്റ്", "തൊഴിൽ", "പ്രണയം", "പശ്ചാത്താപം", "ആഴത്തിലുള്ള രഹಸ್ಯ"],
  mr: ["किरकोळ चूक", "करिअर", "प्रेम", "पश्चात्ताप", "गुपित"],
  bn: ["ছোট ভুল", "কর্মজীবন", "ভালোবাসা", "অনুতাপ", "গভীর গোপন"],
};

const regions = ["IN", "AP", "TS", "KA", "TN", "KL", "MH", "WB", "DL", "UP"];

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
  if (item.is_seed) return "Founding archive";
  if (item.display_soul) return `#${item.display_soul}`;
  return "#•••••";
}

export default function LiveLedger() {
  const [language, setLanguage] = useState<ProductLanguage>("en");
  const [region, setRegion] = useState("IN");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [counts, setCounts] = useState<Record<string, { punya: number; paapa: number }>>({});
  const [voted, setVoted] = useState<Record<string, ReactionType>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myDeedCount, setMyDeedCount] = useState(0);
  const [text, setText] = useState("");
  const [category, setCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const t = copy[language];
  const cats = categories[language];

  useEffect(() => {
    const saved = window.localStorage.getItem("cg-language") as ProductLanguage | null;
    const initial = saved && copy[saved] ? saved : "en";
    setLanguage(initial);
    document.documentElement.lang = initial;
    void bootstrap(initial);
    const { data } = supabase.auth.onAuthStateChange(() => void bootstrap(initial));
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setProfile(null);
      setMyDeedCount(0);
      return null;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id,soul_id,role,language,region,created_at")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setProfile(null);
      return null;
    }

    const current = (data as Profile | null) ?? null;
    setProfile(current);
    if (current?.language && copy[current.language as ProductLanguage]) {
      const nextLanguage = current.language as ProductLanguage;
      setLanguage(nextLanguage);
      window.localStorage.setItem("cg-language", nextLanguage);
      document.documentElement.lang = nextLanguage;
    }
    if (current?.region) setRegion(current.region);
    return current;
  }

  async function loadLedger(feedLanguage: ProductLanguage, currentProfile: Profile | null = profile) {
    setLoading(true);
    setError("");

    const [{ data, error: feedError }, { data: reactionRows, error: reactionError }] = await Promise.all([
      supabase
        .from("confessions")
        .select("id,soul_id,display_soul,is_seed,language,region,category,content,status,created_at,updated_at,moderated_at,moderated_by")
        .eq("status", "published")
        .eq("language", feedLanguage)
        .order("created_at", { ascending: false })
        .limit(60),
      supabase.from("reactions").select("confession_id,type,soul_id,created_at").limit(5000),
    ]);

    if (feedError || reactionError) {
      setError(feedError?.message || reactionError?.message || "Could not load the Ledger.");
    }

    const rows = (data as Confession[]) || [];
    setConfessions(rows);

    const next: Record<string, { punya: number; paapa: number }> = {};
    for (const row of reactionRows || []) {
      next[row.confession_id] ??= { punya: 0, paapa: 0 };
      next[row.confession_id][row.type as ReactionType] += 1;
    }
    setCounts(next);

    if (currentProfile) {
      const [{ data: mine, error: mineError }, { count: ownCount, error: ownCountError }] = await Promise.all([
        supabase.from("reactions").select("confession_id,type").eq("soul_id", currentProfile.id),
        supabase.from("confessions").select("id", { count: "exact", head: true }).eq("soul_id", currentProfile.id).eq("status", "published"),
      ]);
      if (mineError) setError(mineError.message);
      if (ownCountError) setError(ownCountError.message);
      setMyDeedCount(ownCount ?? 0);
      const votedMap: Record<string, ReactionType> = {};
      for (const row of mine || []) votedMap[row.confession_id] = row.type as ReactionType;
      setVoted(votedMap);
    } else {
      setVoted({});
      setMyDeedCount(0);
    }
    setLoading(false);
  }

  async function bootstrap(initialLanguage: ProductLanguage) {
    const current = await loadProfile();
    const feedLanguage = (current?.language as ProductLanguage) || initialLanguage;
    await loadLedger(copy[feedLanguage] ? feedLanguage : "en", current);
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function changeLanguage(next: ProductLanguage) {
    setLanguage(next);
    window.localStorage.setItem("cg-language", next);
    document.documentElement.lang = next;

    if (profile) {
      const { error: updateError } = await supabase.from("profiles").update({ language: next }).eq("id", profile.id);
      if (updateError) {
        notify("Could not save your Soul language. Please try again.");
        return;
      }
      setProfile((current) => (current ? { ...current, language: next } : current));
      notify(`Your Soul now follows ${productLanguages[next].native} entries.`);
    }

    await loadLedger(next, profile);
  }

  async function changeRegion(next: string) {
    setRegion(next);
    if (profile) {
      const { error: updateError } = await supabase.from("profiles").update({ region: next }).eq("id", profile.id);
      if (updateError) notify("Could not save your Soul region.");
      else setProfile((current) => (current ? { ...current, region: next } : current));
    }
  }

  async function record() {
    if (!profile) {
      notify("Create or return to your Soul before recording.");
      return;
    }
    const content = text.trim();
    if (!content) {
      notify("Write something before recording it in the Ledger.");
      return;
    }

    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("confessions")
      .insert({
        soul_id: profile.id,
        is_seed: false,
        language: profile.language,
        region: profile.region,
        category: cats[category],
        content,
        status: "published",
      })
      .select("id,soul_id,display_soul,is_seed,language,region,category,content,status,created_at,updated_at,moderated_at,moderated_by")
      .single();
    setSaving(false);

    if (insertError) {
      notify(insertError.message);
      return;
    }

    setText("");
    setCategory(0);
    setMyDeedCount((value) => value + 1);
    if (data) setConfessions((current) => [data as Confession, ...current]);
    notify(data?.status === "pending" ? "Your confession is in the Ledger queue for review." : "Your deed has been recorded anonymously.");
    await loadLedger(language, profile);
  }

  async function react(confessionId: string, type: ReactionType) {
    if (!profile) {
      notify("Create or return to your Soul to pass judgment.");
      return;
    }
    if (voted[confessionId]) return;

    const { error: reactionError } = await supabase.from("reactions").insert({ confession_id: confessionId, soul_id: profile.id, type });
    if (reactionError) {
      notify(/duplicate|unique/i.test(reactionError.message) ? "Your judgment is already recorded." : reactionError.message);
      return;
    }

    setVoted((current) => ({ ...current, [confessionId]: type }));
    setCounts((current) => {
      const previous = current[confessionId] || { punya: 0, paapa: 0 };
      return {
        ...current,
        [confessionId]: {
          punya: previous.punya + (type === "punya" ? 1 : 0),
          paapa: previous.paapa + (type === "paapa" ? 1 : 0),
        },
      };
    });
    notify(type === "punya" ? "Punya recorded." : "Paapa recorded.");
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
    setVoted({});
    setMyDeedCount(0);
    notify("You have left the Ledger. Your Soul remains anonymous.");
    await loadLedger(language, null);
  }

  async function copySoul() {
    if (!profile?.soul_id) return;
    await navigator.clipboard?.writeText(profile.soul_id);
    setCopied(true);
    notify("Soul ID copied. Keep it with your password.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  const communityCount = confessions.filter((item) => !item.is_seed).length;
  const judgmentCount = confessions.filter((item) => !item.is_seed).reduce((sum, item) => {
    const c = counts[item.id] || { punya: 0, paapa: 0 };
    return sum + c.punya + c.paapa;
  }, 0);

  return (
    <div className="cg-shell">
      <header className="cg-header">
        <div className="cg-header-inner">
          <Link href="/" className="cg-brand" aria-label="Chithraguptha Ledger">
            <div className="cg-lamp">🪔</div>
            <div className="cg-brand-copy">
              <div className="cg-eyebrow">The Cosmic Ledger</div>
              <div className="cg-title">Chithraguptha</div>
              <div className="cg-tagline cg-muted">{t.tagline}</div>
            </div>
          </Link>

          <div className="cg-header-tools">
            <div className="cg-preferences">
              <label className="cg-language cg-feed-language">
                <Globe2 size={14} />
                <span>{profile ? "Soul language" : t.language}</span>
                <select value={language} onChange={(e) => void changeLanguage(e.target.value as ProductLanguage)} aria-label={profile ? "Soul feed language" : t.language}>
                  {Object.entries(productLanguages).map(([code, lang]) => <option value={code} key={code}>{lang.native}</option>)}
                </select>
              </label>
              <label className="cg-language">
                <span>Region</span>
                <select value={region} onChange={(e) => void changeRegion(e.target.value)} aria-label="Region">
                  {regions.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
            </div>

            <nav className="cg-nav" aria-label="Primary navigation">
              <Link href="/" className="active">{t.ledger}</Link>
              <Link href="/garuda-purana">{t.garuda}</Link>
              <Link href="/dharma">{t.dharma}</Link>
              <Link href="/about">{t.about}</Link>
            </nav>

            {profile?.soul_id ? (
              <div className="cg-soul-header">
                <span className="cg-soul-header-label">SOUL</span>
                <strong>#{profile.soul_id}</strong>
                <button onClick={() => void copySoul()} aria-label="Copy Soul ID">{copied ? <Check size={13} /> : <Copy size={13} />}</button>
                <button onClick={() => void logout()} aria-label="Leave Ledger"><LogOut size={13} /></button>
              </div>
            ) : (
              <Link href="/login" className="cg-login-button"><LogIn size={14} /><span>Login</span></Link>
            )}
          </div>
        </div>
      </header>

      <main className="cg-main">
        <section className="cg-hero">
          <div className="cg-hero-mark">🪔</div>
          <div className="cg-eyebrow">{t.heroEyebrow}</div>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroBody}</p>
          <div className="cg-actions">
            <Link href={profile ? "#composer" : "/login"} className="cg-primary"><ScrollText size={16} />{profile ? "Write a confession" : t.enter}</Link>
            <button className="cg-secondary" onClick={() => document.getElementById("ledger")?.scrollIntoView({ behavior: "smooth" })}><BookOpen size={16} />Explore the Ledger</button>
          </div>
          <div className="cg-hero-trust">
            <span><ShieldCheck size={14} />{t.anonymous}</span>
            <span><BookOpen size={14} />{t.sacredNote}</span>
          </div>
        </section>

        {profile && (
          <div className="cg-feed-context">
            <div>
              <span className="cg-eyebrow">Your Ledger view</span>
              <strong>{productLanguages[language].native} confessions</strong>
              <small>Chosen for Soul #{profile.soul_id}. Change the language above to change your feed.</small>
            </div>
            <Globe2 size={18} />
          </div>
        )}

        <section className="cg-stats" aria-label="Ledger statistics">
          <div className="cg-stat"><b>{communityCount.toLocaleString()}</b><span>Community deeds</span></div>
          <div className="cg-stat"><b>{judgmentCount.toLocaleString()}</b><span>Judgments in view</span></div>
          <div className="cg-stat"><b>{profile ? myDeedCount.toLocaleString() : "—"}</b><span>{profile ? "Your published deeds" : "Your deeds"}</span></div>
        </section>

        <section className={`cg-composer ${profile ? "" : "cg-preview"}`} id="composer">
          <div className="cg-composer-heading">
            <div><div className="cg-eyebrow">{t.recordEyebrow}</div><h2 className="cg-section-title">{t.confession}</h2></div>
            <span className="cg-seal">{profile ? "PRIVATE" : "PREVIEW"}</span>
          </div>
          {profile ? (
            <>
              <label className="cg-composer-label">CONFIDENTIAL</label>
              <textarea className="cg-textarea" value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} maxLength={500} placeholder={t.placeholder} />
              <div className="cg-counter">{text.length} / 500</div>
              <div className="cg-compose-row">
                <select className="cg-select" value={category} onChange={(e) => setCategory(Number(e.target.value))}>{cats.map((c, i) => <option value={i} key={i}>{c}</option>)}</select>
                <button className="cg-primary" onClick={() => void record()} disabled={saving}>{saving ? <><Loader2 size={15} className="cg-spin" />Recording…</> : <>{t.record}<ArrowRight size={15} /></>}</button>
              </div>
              <p className="cg-note cg-composer-note"><ShieldCheck size={13} /> Your confession is tied to your anonymous Soul ID, never a real-world identity.</p>
            </>
          ) : (
            <>
              <Link href="/login" className="cg-preview-field"><span>{t.placeholder}</span><small>Login or create a Soul to write in the Ledger.</small></Link>
              <div className="cg-counter">0 / 500</div>
              <div className="cg-compose-row"><Link href="/login" className="cg-select cg-preview-control">Choose a category</Link><Link href="/login" className="cg-primary">{t.record}<ArrowRight size={15} /></Link></div>
            </>
          )}
        </section>

        <section className="cg-ledger-intro" id="ledger">
          <div><div className="cg-eyebrow">{t.community}</div><h2>{t.today}</h2></div>
          <p className="cg-note">{profile ? `Showing published confessions written in ${productLanguages[language].native}.` : "Choose a language above to preview its Ledger."} Seed entries are marked as founding archive material and are not counted as community deeds.</p>
        </section>

        {error && <div className="cg-source-banner"><ShieldCheck size={15} /><span>{error} Check your Supabase environment variables and database migrations.</span></div>}
        {loading ? (
          <div className="cg-mini cg-loading"><Loader2 className="cg-spin" /> Loading the Ledger…</div>
        ) : confessions.length === 0 ? (
          <div className="cg-empty-feed"><BookOpen size={20} /><strong>No published confessions in this language yet.</strong><span>Be the first Soul to record a deed in {productLanguages[language].native}.</span>{!profile && <Link href="/login" className="cg-primary">Create your Soul</Link>}</div>
        ) : (
          <div className="cg-feed">
            {confessions.map((item) => {
              const c = counts[item.id] || { punya: 0, paapa: 0 };
              const choice = voted[item.id];
              return <article className={`cg-card ${item.is_seed ? "cg-card-seed" : ""}`} id={`soul-${item.id}`} key={item.id}>
                <div className="cg-meta">
                  <div className="cg-meta-left">
                    <span className="cg-pill">{item.category}</span>
                    {item.is_seed && <span className="cg-seed-badge">FOUNDING ENTRY</span>}
                  </div>
                  <span className="cg-time">{elapsed(item.created_at)} · {item.region}</span>
                </div>
                <div className="cg-confession">{item.content}</div>
                <div className="cg-soul">{displaySoul(item)}</div>
                <div className="cg-reactions">
                  <button className={`cg-react green ${choice === "punya" ? "selected" : ""}`} disabled={!!choice} onClick={() => void react(item.id, "punya")}><Leaf size={16} /><b>Punya</b><span>{c.punya}</span></button>
                  <button className={`cg-react red ${choice === "paapa" ? "selected" : ""}`} disabled={!!choice} onClick={() => void react(item.id, "paapa")}><Flame size={16} /><b>Paapa</b><span>{c.paapa}</span></button>
                </div>
                {!profile && <div className="cg-micro">Login or create a Soul to pass judgment.</div>}
              </article>;
            })}
          </div>
        )}
        <footer className="cg-footer">{t.company}</footer>
      </main>

      {toast && <div className="cg-toast">{toast}</div>}

      <style>{`
        .cg-header{position:sticky;top:0;z-index:20;background:rgba(7,8,9,.97);backdrop-filter:blur(16px);border-bottom:1px solid #20242a}
        .cg-header-inner{width:min(calc(100% - 40px),1320px);min-height:76px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:28px}
        .cg-brand{display:flex;align-items:center;gap:11px;min-width:220px;text-decoration:none;color:inherit}
        .cg-lamp{font-size:24px;line-height:1}
        .cg-brand-copy{min-width:0}
        .cg-header-tools{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0}
        .cg-preferences{display:flex;gap:8px}
        .cg-language{height:38px;display:flex;align-items:center;gap:7px;color:#a7a198;background:#0d1014;border:1px solid #3c4147;border-radius:9px;padding:0 10px;font-size:10px;white-space:nowrap}
        .cg-language select{border:0;outline:0;background:transparent;color:#ddd7ca;font-size:10px;min-width:56px}
        .cg-language option{background:#11151a}
        .cg-nav{display:flex;gap:5px;flex-wrap:nowrap}
        .cg-nav a{height:38px;display:inline-flex;align-items:center;justify-content:center;padding:0 11px;border:1px solid #34383e;border-radius:9px;background:#0d1014;color:#aaa59b;text-decoration:none;font-size:10px;font-weight:600;white-space:nowrap;transition:all .16s ease}
        .cg-nav a:hover{color:#eee7da;border-color:#5b554b;background:#15191f}
        .cg-nav a.active{color:#ead39d;border-color:#80632b;background:#17130d}
        .cg-soul-header{height:38px;display:flex;align-items:center;gap:7px;padding:0 9px;border:1px solid #8a6a2d;border-radius:9px;background:#17130d;color:#e4cb91;white-space:nowrap}
        .cg-soul-header-label{font-size:9px;letter-spacing:.14em;color:#b79a59}
        .cg-soul-header strong{font:700 11px ui-monospace,monospace;letter-spacing:.06em}
        .cg-soul-header button{display:grid;place-items:center;width:25px;height:25px;background:transparent;border:0;border-radius:6px;color:#bca86f}
        .cg-soul-header button:hover{background:#292012;color:#f0d9a2}
        .cg-login-button{height:38px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:1px solid #8a6a2d;border-radius:9px;background:#17130d;color:#ead39d;text-decoration:none;font-size:10px;font-weight:800;white-space:nowrap}
        .cg-main{width:min(calc(100% - 40px),1160px);margin:auto;padding:0 0 64px}
        .cg-hero{max-width:850px;margin:auto;text-align:center;padding:48px 10px 34px}
        .cg-hero-mark{height:28px;font-size:19px;line-height:1;margin-bottom:8px}
        .cg-hero:before{content:'✦';display:block;color:#8f6e35;font-size:9px;margin-bottom:12px}
        .cg-hero h1{font:600 clamp(46px,6vw,70px)/.96 Cormorant Garamond,Georgia,serif;max-width:850px;margin:0 auto 16px;letter-spacing:-.025em;color:#f0eadf}
        .cg-hero>p{max-width:650px;margin:auto;line-height:1.7;font-size:13px;color:#9b958b}
        .cg-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:20px}
        .cg-primary,.cg-secondary{min-height:42px;border-radius:10px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:11px;font-weight:700;white-space:nowrap;text-decoration:none}
        .cg-primary{background:#6f5119;color:#f5e4ba;border:1px solid #8b6828}.cg-primary:hover{background:#7d5d20}
        .cg-secondary{background:#0d1115;color:#d1ccc2;border:1px solid #41464d}.cg-secondary:hover{background:#15191f}
        .cg-hero-trust{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px 18px;margin:16px auto 0;max-width:760px;color:#aaa49a;font-size:10px;line-height:1.5}.cg-hero-trust span{display:inline-flex;align-items:center;gap:6px}.cg-hero-trust svg{color:#b89a58;flex:none}
        .cg-feed-context{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 16px;padding:13px 16px;border:1px solid #4b3c22;border-radius:12px;background:linear-gradient(90deg,#15120c,#0d1014);color:#d9d1c4}.cg-feed-context strong{display:block;margin-top:4px;font:600 20px/1.1 Cormorant Garamond,Georgia,serif;color:#eee7da}.cg-feed-context small{display:block;margin-top:4px;color:#817b72;font-size:9px;line-height:1.5}.cg-feed-context>svg{color:#c9a85d;flex:none}
        .cg-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 24px}.cg-stat{min-height:82px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d1014;border:1px solid #34383e;border-radius:11px;padding:12px}.cg-stat b{font:600 24px/1 Cormorant Garamond,Georgia,serif;color:#ead39d}.cg-stat span{margin-top:6px;font-size:8px;color:#858078;letter-spacing:.14em;text-transform:uppercase;text-align:center}
        .cg-composer{padding:22px;background:linear-gradient(145deg,#15130f,#0d1014 68%);border:1px solid #725726;border-radius:12px;box-shadow:0 18px 45px rgba(0,0,0,.18)}.cg-composer-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:15px}.cg-composer .cg-section-title{margin:5px 0 0}.cg-section-title{font:600 28px/1.08 Cormorant Garamond,Georgia,serif;margin:0;color:#e9e3d8}.cg-seal{display:inline-flex;align-items:center;height:24px;padding:0 9px;border:1px solid #51452e;border-radius:999px;color:#8e8064;font-size:8px;font-weight:700;letter-spacing:.14em;white-space:nowrap}
        .cg-textarea{display:block;width:100%;min-height:145px;background:#090b0e;color:#eee9df;border:1px solid #454a50;border-radius:10px;padding:14px 15px;resize:vertical;outline:0;line-height:1.65;font-size:13px}.cg-textarea::placeholder{color:#5f5b55}.cg-textarea:focus{border-color:#80652e;box-shadow:0 0 0 3px rgba(212,174,93,.06)}.cg-counter{text-align:right;color:#716c63;font-size:9px;margin:5px 2px 0}.cg-compose-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:11px}.cg-select{width:100%;height:44px;background:#090b0e;color:#c8c1b4;border:1px solid #454a50;border-radius:10px;padding:0 12px;text-decoration:none}.cg-compose-row .cg-primary{width:100%;height:44px}
        .cg-ledger-intro{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin:30px 0 13px;padding:0 2px}.cg-ledger-intro h2{font:600 30px/1 Cormorant Garamond,Georgia,serif;margin:5px 0 0;color:#e9e3d8}.cg-ledger-intro>.cg-note{max-width:520px;margin:0;text-align:right}.cg-note{font-size:10px;line-height:1.65;color:#827d74}.cg-feed{display:grid;gap:10px}
        .cg-card{padding:17px 18px;background:#0d1014;border:1px solid #30343a;border-radius:12px}.cg-card:hover{border-color:#4d4a42}.cg-card-seed{background:linear-gradient(145deg,#0f1115,#0d1014);border-color:#39362f}.cg-meta{display:flex;align-items:center;justify-content:space-between;gap:12px}.cg-meta-left{display:flex;align-items:center;gap:7px;min-width:0}.cg-pill{color:#d9b971;background:#18140d;border:1px solid #705726;padding:5px 8px;border-radius:999px;font-size:8px;text-transform:uppercase;letter-spacing:.12em;white-space:nowrap}.cg-seed-badge{color:#7f786b;border:1px solid #35342f;border-radius:999px;padding:5px 8px;font-size:7px;letter-spacing:.1em;white-space:nowrap}.cg-time,.cg-soul{font-size:9px;color:#6f6a61}.cg-confession{font:500 20px/1.45 Cormorant Garamond,Georgia,serif;color:#e3ddd2;margin:15px 0 11px;max-width:920px}.cg-soul{padding-top:9px;border-top:1px solid rgba(255,255,255,.055)}.cg-reactions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.cg-react{min-height:42px;border-radius:9px;padding:0 12px;border:1px solid #2e3237;background:#090b0e;color:#a8a39b;display:flex;align-items:center;justify-content:center;gap:7px;font-size:11px}.cg-react.green:hover,.cg-react.green.selected{color:#a8c79b;border-color:#526b47;background:#0f1710}.cg-react.red:hover,.cg-react.red.selected{color:#d98f8f;border-color:#713e3e;background:#190f10}.cg-react:disabled{opacity:.5}.cg-micro{text-align:center;color:#676259;font-size:9px;margin-top:7px}
        .cg-source-banner{display:flex;gap:9px;align-items:flex-start;background:#15120c;border:1px solid #554321;border-radius:9px;padding:11px;color:#bfb5a2;font-size:10px;line-height:1.6}.cg-empty-feed{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:190px;padding:30px 20px;text-align:center;background:#0d1014;border:1px dashed #3c3f43;border-radius:12px;color:#918c83}.cg-empty-feed svg{color:#b08d4a;margin-bottom:4px}.cg-empty-feed strong{font:600 20px/1.1 Cormorant Garamond,Georgia,serif;color:#ddd6ca}.cg-empty-feed span{max-width:440px;font-size:10px;line-height:1.6}.cg-empty-feed .cg-primary{margin-top:7px}.cg-loading{display:flex;align-items:center;justify-content:center;gap:8px;text-align:center;padding:28px}.cg-mini{background:#0d1014;border:1px solid #30343a;border-radius:12px;color:#918c83}.cg-composer-label{display:block;margin-bottom:6px;color:#a39c91;font-size:9px;letter-spacing:.12em;font-weight:700}.cg-composer-note{display:flex;align-items:center;gap:5px;margin:9px 0 0}.cg-preview-field{width:100%;min-height:145px;padding:15px;border:1px solid #454a50;border-radius:10px;background:#090b0e;color:#5f5b55;text-align:left;display:flex;flex-direction:column;justify-content:center;gap:10px;text-decoration:none}.cg-preview-field span{font-size:13px;line-height:1.65}.cg-preview-field small{font-size:9px;color:#777168}.cg-preview-field:hover{border-color:#80652e;background:#0b0e12}.cg-preview-control{display:flex;align-items:center;justify-content:flex-start;text-align:left;color:#777168}.cg-footer{text-align:center;color:#5f5b54;font-size:9px;padding:38px 10px 16px}.cg-toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:40;background:#181b20;border:1px solid #594721;color:#ebdbb4;padding:9px 14px;border-radius:999px;font-size:10px;white-space:nowrap}.cg-spin{animation:cgspin 1s linear infinite}@keyframes cgspin{to{transform:rotate(360deg)}}
        @media(max-width:1120px){.cg-header-inner{align-items:flex-start;flex-direction:column;gap:12px;padding:12px 0}.cg-brand{min-width:0}.cg-header-tools{width:100%;justify-content:flex-start;flex-wrap:wrap}.cg-preferences{flex:0 0 auto}.cg-nav{flex:1;overflow:auto}.cg-nav a{flex:1}.cg-login-button,.cg-soul-header{flex:0 0 auto}}
        @media(max-width:700px){.cg-header-inner{width:min(calc(100% - 24px),1320px)}.cg-header-tools{display:grid;grid-template-columns:1fr auto;width:100%;gap:8px}.cg-preferences{grid-column:1 / -1;width:100%;display:grid;grid-template-columns:1fr 1fr}.cg-language{width:100%;justify-content:space-between}.cg-nav{grid-column:1 / -1;width:100%;overflow:auto}.cg-nav a{flex:0 0 auto}.cg-login-button,.cg-soul-header{grid-column:1 / -1;width:100%;justify-content:center}.cg-main{width:min(calc(100% - 24px),1160px)}.cg-stats{grid-template-columns:1fr}.cg-compose-row{grid-template-columns:1fr}.cg-ledger-intro{display:block}.cg-ledger-intro>.cg-note{text-align:left;margin-top:8px}.cg-confession{font-size:18px}.cg-meta{align-items:flex-start}.cg-time{white-space:nowrap}.cg-seed-badge{display:none}}
      `}</style>
    </div>
  );
}
