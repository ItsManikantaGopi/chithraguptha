# Chithraguptha — The Cosmic Ledger

A Vercel-ready Next.js prototype for an anonymous confession and community judgment experience inspired by Chitragupta, Garuda Purana traditions, karma, dharma, and the idea of a cosmic ledger.

## Included

- Next.js App Router + TypeScript
- Responsive mobile-first UI
- Anonymous confession flow (prototype uses local in-memory state)
- Punya / Paapa community judgment
- Chitragupta's Verdict modal
- Mythology-inspired consequence + Path of Repair
- Garuda Purana / Naraka Atlas page
- Dharma / repair concepts page
- No authentication or database required for the prototype

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Import `ItsManikantaGopi/chithraguptha` into Vercel. No environment variables are required for the prototype.

## Product boundary

This prototype is a mythology-inspired community experience. It does not determine anyone's real karma, afterlife, religious status, or spiritual punishment. Specific scriptural claims should be verified against the relevant text and translation before production use.

## Next production steps

1. Replace in-memory data with PostgreSQL/Supabase.
2. Add anonymous identity and abuse/rate-limit controls.
3. Add moderation/report workflows.
4. Add sourced mythology knowledge entries and citations.
5. Add analytics, share cards, and SEO/OG metadata.
