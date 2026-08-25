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
  if (item.display_soul) return `#${item.display_soul}`;
  return item.soul_id ? "#•••••" : "#SEED";
}

export default function LiveLedger() {
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
    // Supabase auth is intentionally the only external dependency for this bootstrap listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setProfile(null);
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

  async function loadLedger(feedLanguage: ProductLanguage) {
    setLoading(true);
    setError("");

    const [{ data, error: feedError }, { data: reactionRows, error: reactionError }] = await Promise.all([
      supabase
        .from("confessions")
        .select("id,soul_id,display_soul,language,region,category,content,status,created_at,updated_at,moderated_at,moderated_by")
        .eq("status", "published")
        .eq("language", feedLanguage)
        .order("created_at", { ascending: false })
        .limit(60),
      supabase.from("reactions").select("confession_id,type,soul_id,created_at").limit(5000),
    ]);

    if (feedError || reactionError) {
      setError(feedError?.message || reactionError?.message || "Could not load the Ledger.");
    }

    setConfessions((data as Confession[]) || []);

    const next: Record<string, { punya: number; paapa: number }> = {};
    for (const row of reactionRows || []) {
      next[row.confession_id] ??= { punya: 0, paapa: 0 };
      next[row.confession_id][row.type as ReactionType] += 1;
    }
    setCounts(next);

    const current = profile;
    if (current) {
      const { data: mine, error: mineError } = await supabase
        .from("reactions")
        .select("confession_id,type")
        .eq("soul_id", current.id);
      if (mineError) setError(mineError.message);
      const votedMap: Record<string, ReactionType> = {};
      for (const row of mine || []) votedMap[row.confession_id] = row.type as ReactionType;
      setVoted(votedMap);
    } else {
      setVoted({});
    }
    setLoading(false);
  }

  async function bootstrap(initialLanguage: ProductLanguage) {
    const current = await loadProfile();
    const feedLanguage = (current?.language as ProductLanguage) || initialLanguage;
    await loadLedger(copy[feedLanguage] ? feedLanguage : "en");
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

    await loadLedger(next);
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
    if (!text.trim()) {
      notify("Write something before recording it in the Ledger.");
      return;
    }

    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("confessions")
      .insert({
        soul_id: profile.id,
        language: profile.language,
        region: profile.region,
        category: cats[category],
        content: text.trim(),
        status: "published",
      })
      .select("id,soul_id,display_soul,language,region,category,content,status,created_at,updated_at,moderated_at,moderated_by")
      .single();
    setSaving(false);

    if (insertError) {
      notify(insertError.message);
      return;
    }

    setText("");
    setCategory(0);
    notify(data?.status === "pending" ? "Your confession is in the Ledger queue for review." : "Your deed has been recorded anonymously.");
    await loadLedger(language);
  }

  async function react(confessionId: string, type: ReactionType) {
    if (!profile) {
      notify("Create or return to your Soul to pass judgment.");
      return;
    }
    if (voted[confessionId]) return;

    const { error: reactionError } = await supabase.from("reactions").insert({
      confession_id: confessionId,
      soul_id: profile.id,
      type,
    });

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
    notify("You have left the Ledger. Your Soul remains anonymous.");
    await loadLedger(language);
  }

  async function copySoul() {
    if (!profile?.soul_id) return;
    await navigator.clipboard?.writeText(profile.soul_id);
    setCopied(true);
    notify("Soul ID copied. Keep it with your password.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="cg-shell">
      <header className="cg-header">
        <div className="cg-brand">
          <div className="cg-lamp">🪔</div>
          <div>
            <div className="cg-eyebrow">The Cosmic Ledger</div>
            <div className="cg-title">Chithraguptha</div>
            <div className="cg-tagline cg-muted">{t.tagline}</div>
          </div>
        </div>
        <div className="cg-header-tools">
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

        <section className="cg-stats">
          <div className="cg-stat"><b>{confessions.length.toLocaleString()}</b><span>{language === "en" ? "Published entries" : "Entries in this language"}</span></div>
          <div className="cg-stat"><b>{Object.values(counts).reduce((a, c) => a + c.punya + c.paapa, 0).toLocaleString()}</b><span>Judgments</span></div>
          <div className="cg-stat"><b>{profile ? "SOUL" : "OPEN"}</b><span>{profile ? "Authenticated" : "Public preview"}</span></div>
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
                <select className="cg-select" value={category} onChange={(e) => setCategory(Number(e.target.value))}>{cats.map((c, i) => <option key={i}>{c}</option>)}</select>
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
          <p className="cg-note">{profile ? `Showing published confessions written in ${productLanguages[language].native}.` : "Choose a language above to preview its Ledger."} Judgment requires a Soul so one person cannot flood the Ledger.</p>
        </section>

        {error && <div className="cg-source-banner"><ShieldCheck size={15} /><span>{error} Check your Supabase environment variables and make sure <code>supabase/schema.sql</code> has been run.</span></div>}
        {loading ? (
          <div className="cg-mini" style={{ textAlign: "center", padding: 28 }}><Loader2 className="cg-spin" /> Loading the Ledger…</div>
        ) : confessions.length === 0 ? (
          <div className="cg-empty-feed"><BookOpen size={20} /><strong>No published confessions in this language yet.</strong><span>Be the first Soul to record a deed in {productLanguages[language].native}.</span>{!profile && <Link href="/login" className="cg-primary">Create your Soul</Link>}</div>
        ) : (
          <div className="cg-feed">
            {confessions.map((item) => {
              const c = counts[item.id] || { punya: 0, paapa: 0 };
              const choice = voted[item.id];
              return <article className="cg-card" id={`soul-${item.id}`} key={item.id}>
                <div className="cg-meta"><span className="cg-pill">{item.category}</span><span className="cg-time">{elapsed(item.created_at)} · {item.region}</span></div>
                <div className="cg-confession">{item.content}</div>
                <div className="cg-soul">Soul {displaySoul(item)}</div>
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
        .cg-feed-context{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 16px;padding:13px 16px;border:1px solid #4b3c22;border-radius:12px;background:linear-gradient(90deg,#15120c,#0d1014);color:#d9d1c4}.cg-feed-context strong{display:block;margin-top:4px;font:600 20px/1.1 Cormorant Garamond,Georgia,serif;color:#eee7da}.cg-feed-context small{display:block;margin-top:4px;color:#817b72;font-size:9px;line-height:1.5}.cg-feed-context>svg{color:#c9a85d;flex:none}.cg-soul-header{display:flex;align-items:center;gap:6px;height:34px;padding:0 8px;border:1px solid #66552f;border-radius:9px;background:#15120d;color:#dfc889}.cg-soul-header strong{font:700 10px ui-monospace,monospace;letter-spacing:.08em}.cg-soul-header button{display:grid;place-items:center;width:24px;height:24px;background:transparent;border:0;color:#bca86f}.cg-login-button{height:34px;display:inline-flex;align-items:center;gap:6px;padding:0 11px;border:1px solid #66552f;border-radius:9px;background:#17130d;color:#dfc889;text-decoration:none;font-size:10px;font-weight:800}.cg-nav{display:flex;gap:6px}.cg-nav a{display:inline-flex;align-items:center;padding:8px 11px;border:1px solid #292b31;border-radius:9px;background:#0e1116;color:#9d988f;text-decoration:none;font-size:10px}.cg-nav a.active,.cg-nav a:hover{color:#eed49a;border-color:#66552f;background:#19150e}.cg-spin{animation:cgspin 1s linear infinite}@keyframes cgspin{to{transform:rotate(360deg)}}.cg-preview-field{display:flex;flex-direction:column;justify-content:center;min-height:145px;width:100%;padding:15px;border:1px solid #292b31;border-radius:12px;background:#0b0e12;color:#918c83;text-decoration:none;line-height:1.7}.cg-preview-field small{margin-top:6px;color:#5f5b54;font-size:10px}.cg-preview-control{text-decoration:none;text-align:left;display:flex;align-items:center}.cg-source-banner code{font-family:ui-monospace,monospace;color:#d6b46a}.cg-empty-feed{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:190px;padding:30px 20px;text-align:center;background:#0d1014;border:1px dashed #3c3f43;border-radius:12px;color:#918c83}.cg-empty-feed svg{color:#b08d4a;margin-bottom:4px}.cg-empty-feed strong{font:600 20px/1.1 Cormorant Garamond,Georgia,serif;color:#ddd6ca}.cg-empty-feed span{max-width:440px;font-size:10px;line-height:1.6}.cg-empty-feed .cg-primary{margin-top:7px;text-decoration:none}.cg-composer-label{display:block;margin-bottom:6px;color:#a39c91;font-size:9px;letter-spacing:.12em;font-weight:700}.cg-composer-note{display:flex;align-items:center;gap:5px;margin:9px 0 0}.cg-nav{flex-wrap:nowrap}.cg-header-tools{flex-wrap:wrap}@media(max-width:980px){.cg-header{align-items:flex-start;flex-direction:column;gap:12px}.cg-brand{width:100%}.cg-header-tools{width:100%;justify-content:flex-start}.cg-nav{flex:1}.cg-nav a{flex:1;justify-content:center}}@media(max-width:650px){.cg-main{width:min(calc(100% - 24px),var(--max))}.cg-header{padding:12px}.cg-header-tools{display:grid;grid-template-columns:1fr 1fr;width:100%}.cg-feed-language{grid-column:1 / -1}.cg-nav{grid-column:1 / -1;width:100%;overflow:auto}.cg-nav a{white-space:nowrap}.cg-login-button,.cg-soul-header{grid-column:1 / -1;width:100%;justify-content:center}.cg-compose-row{grid-template-columns:1fr}.cg-stats{grid-template-columns:1fr}.cg-feed-context{align-items:flex-start}.cg-ledger-intro{display:block}.cg-ledger-intro>.cg-note{text-align:left;margin-top:8px}.cg-confession{font-size:18px}}
      `}</style>
    </div>
  );
}
