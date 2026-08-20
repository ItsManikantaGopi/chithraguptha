import { createFileRoute } from "@tanstack/react-router";
import {
  profile,
  stats,
  projects,
  roles,
  skillGroups,
  education,
  writing,
} from "@/data/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Manikanta Gopi — Senior Backend & Platform Engineer" },
      {
        name: "description",
        content:
          "Portfolio of Manikanta Gopi, Senior Software Engineer in Hyderabad — Rails, Go and NestJS services on a GitOps-managed Kubernetes fleet across AWS, GCP and Azure.",
      },
      { property: "og:title", content: "Manikanta Gopi — Senior Backend & Platform Engineer" },
      {
        property: "og:description",
        content:
          "Backend systems and the infrastructure they run on: a Rails monolith, Go and NestJS services, and a 24-service Kubernetes fleet.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const nav = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

function Section({
  id,
  index,
  title,
  lead,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border py-20 md:py-28">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span className="rule-label">
            {index} / {title}
          </span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          {lead ? <p className="max-w-2xl text-muted-foreground">{lead}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}

function Portfolio() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-mono text-sm font-medium tracking-tight">
            <span className="text-primary">~/</span>manikanta
          </a>
          <nav className="hidden gap-6 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            GitHub
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero-glow">
          <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
            <span className="rule-label">
              {profile.role} · {profile.location}
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {profile.name}
              <span className="block text-primary">{profile.tagline}</span>
            </h1>
            <div className="mt-8 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {profile.intro.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#work"
                className="rounded-md bg-primary px-5 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                See selected work
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="rounded-md border border-border px-5 py-2.5 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
              >
                Get in touch
              </a>
            </div>

            <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-surface p-5">
                  <dt className="font-mono text-2xl font-semibold text-primary md:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-2 text-sm font-medium">{s.label}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Work */}
        <Section
          id="work"
          index="01"
          title="Selected work"
          lead="Systems I designed, owned or rebuilt — described at the architecture level."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <article
                key={p.slug}
                className="panel group flex flex-col p-6 transition-colors hover:border-primary/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
                    {p.kind}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{p.period}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Experience */}
        <Section id="experience" index="02" title="Experience">
          <ol className="space-y-10">
            {roles.map((r) => (
              <li
                key={r.title + r.period}
                className="grid gap-4 border-l border-border pl-6 md:grid-cols-[200px_1fr] md:gap-8"
              >
                <div>
                  <p className="font-mono text-xs text-primary">{r.period}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{r.company}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {r.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.stack.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Skills */}
        <Section id="skills" index="03" title="Toolkit">
          <div className="grid gap-4 md:grid-cols-3">
            {skillGroups.map((g) => (
              <div key={g.name} className="panel p-5">
                <h3 className="rule-label">{g.name}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.items.map((i) => (
                    <Tag key={i}>{i}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="panel mt-4 p-5">
            <h3 className="rule-label">Education</h3>
            {education.map((e) => (
              <div key={e.institution} className="mt-4">
                <p className="text-sm font-medium">{e.qualification}</p>
                <p className="text-sm text-muted-foreground">
                  {e.institution} · {e.year} · {e.detail}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Writing */}
        <Section
          id="writing"
          index="04"
          title="Writing"
          lead="Notes from the work, published on the blog."
        >
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {writing.map((w) => (
              <li key={w.slug}>
                <a
                  href={`${profile.blog}/writing/${w.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 bg-surface px-5 py-4 transition-colors hover:bg-surface-raised"
                >
                  <span className="text-sm font-medium">{w.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">read →</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* Contact */}
        <Section
          id="contact"
          index="05"
          title="Contact"
          lead="Open to conversations about backend, platform and infrastructure work."
        >
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-md bg-primary px-5 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border px-5 py-2.5 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
            >
              LinkedIn
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border px-5 py-2.5 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
            >
              GitHub
            </a>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <a
            href={profile.blog}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Blog & case studies →
          </a>
        </div>
      </footer>
    </div>
  );
}
