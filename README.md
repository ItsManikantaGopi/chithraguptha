# Chithraguptha — The Cosmic Ledger

A Vercel-ready Next.js prototype for an anonymous confession and community reflection experience inspired by Chitragupta, Garuda Purana traditions, karma and dharma.

## Current prototype

- Next.js App Router + TypeScript
- Responsive mobile-first dark manuscript UI
- Anonymous confession flow using local prototype state
- Punya / Paapa community judgment interaction
- Chitragupta Verdict + Path of Repair
- Regional language dropdown: English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi and Bengali
- Garuda Purana journey page
- Comparative 28-Naraka atlas with expandable entries
- Traditional association, narrative experience, ethical reflection and source note for every entry
- Manuscript-inspired local SVG artwork for Garuda/Vishnu and Chitragupta's ledger
- Dharma library covering Satya, Dama, Seva, Dana, Prayaschitta and Bhakti

## Important textual boundary

The popular 28-Naraka catalogue is especially explicit in **Bhagavata Purana 5.26** and appears with variants across Purana literature. The **Garuda Purana's Preta material** also discusses Yama-marga, Chitragupta, Yamadutas, Naraka and post-death consequences. Names, associations and chapter numbering can vary by text, recension and translation. The product therefore calls the UI a **comparative Purāṇic Naraka Atlas**, rather than claiming that every association is unique to one edition of Garuda Purana.

The product does not determine a person's real karma, afterlife, religious status or spiritual punishment. The consequence engine is a reflective product layer and should remain source-aware.

## Visual provenance

The repository uses original manuscript-inspired SVG illustrations created for the prototype rather than copying third-party religious artwork into the project. For future production, replace or supplement these with properly licensed/public-domain museum or manuscript images and preserve provenance/attribution.

Useful research references include the Internet Sacred Text Archive's Ernest Wood/S. V. Subrahmanyam abridged translation, the Cleveland Museum of Art's Open Access Vishnu/Garuda works, and Sanskrit verse references where available.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Import `ItsManikantaGopi/chithraguptha` into Vercel. No environment variables are required for the prototype.

## Next production steps

1. PostgreSQL/Supabase persistence.
2. Anonymous Soul identity and anti-abuse controls.
3. Moderation/report workflow.
4. Source-backed lore retrieval with verse/chapter provenance.
5. Professional translations reviewed by native speakers and knowledgeable cultural reviewers.
6. Analytics, share cards, SEO/OG metadata and growth experiments.
7. Explainable confession-to-consequence taxonomy with strong safeguards against deterministic spiritual claims.
