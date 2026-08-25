"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Flame, Leaf, ScrollText, Sparkles, X } from "lucide-react";
import { initialConfessions, narakaMotifs, repairGuides, type Confession } from "@/data/content";

type Page = "ledger" | "garuda" | "dharma";
type Verdict = { confession: Confession; choice: "punya" | "paapa" } | null;

const categories = ["Petty Sin", "Career", "Love", "Regret", "Deep Secret"];

export default function LedgerApp() {
  const [page, setPage] = useState<Page>("ledger");
  const [confessions, setConfessions] = useState(initialConfessions);
  const [voted, setVoted] = useState<Record<number, "punya" | "paapa">>({});
  const [text, setText] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [toast, setToast] = useState("");

  const votes = Object.keys(voted).length;
  const stats = useMemo(() => ({ confessions: 1284 + Math.max(0, confessions.length - initialConfessions.length), votes: 9731 + votes }), [confessions.length, votes]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function recordConfession() {
    const clean = text.trim();
    if (!clean) {
      notify("The Ledger awaits your confession.");
      return;
    }
    const item: Confession = {
      id: Date.now(),
      text: clean,
      category,
      time: "just now",
      punya: 0,
      paapa: 0,
      soul: `#${Math.floor(100 + Math.random() * 899)}`,
    };
    setConfessions((current) => [item, ...current]);
    setText("");
    notify("Your deed has been recorded.");
  }

  function vote(id: number, choice: "punya" | "paapa") {
    if (voted[id]) return;
    setVoted((current) => ({ ...current, [id]: choice }));
    setConfessions((current) => current.map((item) => item.id === id ? { ...item, [choice === "punya" ? "punya" : "paapa"]: item[choice === "punya" ? "punya" : "paapa"] + 1 } : item));
    const item = confessions.find((entry) => entry.id === id);
    if (item) setVerdict({ confession: { ...item, [choice]: item[choice] + 1 } as Confession, choice });
  }

  function randomSoul() {
    const target = confessions[Math.floor(Math.random() * confessions.length)];
    document.getElementById(`confession-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    notify("The Ledger opened a random soul.");
  }

  function showPage(next: Page) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="cg-shell">
      <header className="cg-header">
        <div className="cg-brand">
          <div className="cg-lamp">🪔</div>
          <div>
            <div className="cg-eyebrow">The Cosmic Ledger</div>
            <div className="cg-title">Chithraguptha</div>
            <div className="cg-tagline cg-muted">Confess. Be judged. Discover your karmic story.</div>
          </div>
        </div>
        <nav className="cg-nav" aria-label="Primary navigation">
          {(["ledger", "garuda", "dharma"] as Page[]).map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => showPage(item)}>{item === "ledger" ? "Ledger" : item === "garuda" ? "Garuda Purana" : "Dharma"}</button>)}
        </nav>
      </header>

      <main className="cg-main">
        {page === "ledger" && <>
          <section className="cg-hero">
            <div className="cg-eyebrow">Nothing forgotten</div>
            <h1>What would you put into the Ledger?</h1>
            <p>Anonymous confessions. Community judgment. Mythology-inspired consequences. And a path to make things right.</p>
            <div className="cg-actions">
              <button className="cg-primary" onClick={() => document.getElementById("composer")?.scrollIntoView({ behavior: "smooth" })}>Enter your confession</button>
              <button className="cg-secondary" onClick={randomSoul}>🔮 Draw a random soul</button>
            </div>
          </section>

          <section className="cg-stats" aria-label="Ledger statistics">
            <div className="cg-stat"><b>{stats.confessions.toLocaleString()}</b><span>deeds recorded</span></div>
            <div className="cg-stat"><b>{stats.votes.toLocaleString()}</b><span>judgments passed</span></div>
            <div className="cg-stat"><b>842</b><span>souls visited</span></div>
          </section>

          <section id="composer" className="cg-composer">
            <div className="cg-eyebrow">Record a deed</div>
            <h2 className="cg-section-title">The confession scroll</h2>
            <textarea className="cg-textarea" maxLength={500} value={text} onChange={(e) => setText(e.target.value)} placeholder="Unburden your soul to the Ledger... (max 500 characters)" />
            <div className="cg-counter">{text.length} / 500</div>
            <div className="cg-compose-row">
              <select className="cg-select" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
              <button className="cg-primary" onClick={recordConfession}>Record into Ledger <ArrowRight size={15} style={{ verticalAlign: "middle" }} /></button>
            </div>
            <div className="cg-note" style={{ marginTop: 8 }}>No name. No email. No login. Your public identity is a random Soul ID.</div>
          </section>

          <section className="cg-section-title"><div className="cg-eyebrow">Community judgment</div><h2>Today&apos;s Ledger</h2></section>
          <div className="cg-discover"><div><b>🔮 Draw a random soul</b><small>Skip the ranking. See what the Ledger serves next.</small></div><button className="cg-secondary" onClick={randomSoul}>Open →</button></div>
          <div className="cg-feed">
            {confessions.map((item) => {
              const selection = voted[item.id];
              return <article className="cg-card" id={`confession-${item.id}`} key={item.id}>
                <div className="cg-meta"><span className="cg-pill">{item.category}</span><span className="cg-time">{item.time}</span></div>
                <div className="cg-confession">{item.text}</div>
                <div className="cg-soul">Soul {item.soul}</div>
                <div className="cg-reactions">
                  <button disabled={Boolean(selection)} className={`cg-react green ${selection === "punya" ? "selected" : ""}`} onClick={() => vote(item.id, "punya")}><Leaf size={16}/> <b>Punya</b> <span>{item.punya}</span></button>
                  <button disabled={Boolean(selection)} className={`cg-react red ${selection === "paapa" ? "selected" : ""}`} onClick={() => vote(item.id, "paapa")}><Flame size={16}/> <b>Paapa</b> <span>{item.paapa}</span></button>
                </div>
                {selection && <div className="cg-micro">Your judgment is recorded. Opposite judgment disabled.</div>}
              </article>;
            })}
          </div>
        </>}

        {page === "garuda" && <section>
          <div className="cg-page-title"><div className="cg-eyebrow">Journey beyond the Ledger</div><h1>Garuda Purana</h1></div>
          <div className="cg-panel" style={{ padding: 18 }}>
            <p style={{ font: "28px Georgia, serif" }}>The tradition speaks of consequence. Chithraguptha turns that into a modern story layer.</p>
            <p className="cg-note">Educational and interpretive only. This product does not determine anyone&apos;s literal afterlife, karma, sin, or spiritual status. Specific Naraka associations vary across textual and regional traditions and should be sourced before production use.</p>
            <div className="cg-section-title"><div className="cg-eyebrow">Naraka Atlas</div><h2>Selected motifs</h2></div>
            <div className="cg-grid3">{narakaMotifs.map((motif) => <div className="cg-mini" key={motif.name}><h3>{motif.name}</h3><div className="cg-eyebrow" style={{ marginBottom: 6 }}>{motif.theme}</div><p>{motif.detail}</p></div>)}</div>
          </div>
        </section>}

        {page === "dharma" && <section>
          <div className="cg-page-title"><div className="cg-eyebrow">Living with consequence</div><h1>Dharma Library</h1></div>
          <div className="cg-panel" style={{ padding: 18 }}>
            <p style={{ font: "28px Georgia, serif" }}>Punishment is the hook. Repair is the meaning.</p>
            <p className="cg-note">Dharma should be represented as a broad family of traditions and ethical ideas, not a single rigid rulebook. Remedies are suggestions for responsible action, not guaranteed supernatural cancellation.</p>
            <div className="cg-grid2">{repairGuides.map((guide) => <div className="cg-mini" key={guide.title}><div className="cg-eyebrow">{guide.title}</div><h3>{guide.concept}</h3><p>{guide.detail}</p></div>)}</div>
          </div>
        </section>}
        <footer className="cg-footer">Inspired by Hindu / Sanatana Dharma traditions. Chithraguptha is a mythology-inspired community experience, not a religious authority.</footer>
      </main>

      {verdict && <div className="cg-modal" role="dialog" aria-modal="true"><div className="cg-modal-box">
        <button className="cg-close" onClick={() => setVerdict(null)} aria-label="Close"><X size={20}/></button>
        <div className="cg-eyebrow">Chitragupta&apos;s Verdict</div><h2 style={{ font: "30px Georgia, serif", margin: "4px 0 15px" }}>The Ledger has spoken.</h2>
        <p className="cg-note">Your judgment entered the Ledger as <b>{verdict.choice === "punya" ? "Punya" : "Paapa"}</b>.</p>
        <div className="cg-meter"><div className="p" style={{ width: `${Math.round((verdict.confession.punya / Math.max(1, verdict.confession.punya + verdict.confession.paapa)) * 100)}%` }}/><div className="q" style={{ flex: 1 }}/></div>
        <div className="cg-grid2" style={{ marginTop: 12 }}><div className="cg-mini"><div className="cg-eyebrow">Punya</div><h3>{verdict.confession.punya}</h3></div><div className="cg-mini"><div className="cg-eyebrow">Paapa</div><h3>{verdict.confession.paapa}</h3></div></div>
        <div className="cg-panel" style={{ marginTop: 12, padding: 14 }}><div className="cg-eyebrow">Ledger interpretation</div><p style={{ font: "21px Georgia, serif" }}>Consequence · Reflection</p><p className="cg-note">This is a mythology-inspired interpretation, not a literal judgment by Chitragupta or a prediction of anyone&apos;s afterlife.</p></div>
        <div className="cg-remedy"><strong>🌿 Path of Repair</strong><p className="cg-note">Acknowledge the action, understand who was affected, repair the harm where possible, and avoid repeating the pattern.</p></div>
        <div className="cg-actions"><button className="cg-primary" onClick={() => setVerdict(null)}>Continue reading</button><button className="cg-secondary" onClick={() => { setVerdict(null); setPage("garuda"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Explore Garuda Purana</button></div>
      </div></div>}
      {toast && <div className="cg-toast" aria-live="polite">{toast}</div>}
    </div>
  );
}
