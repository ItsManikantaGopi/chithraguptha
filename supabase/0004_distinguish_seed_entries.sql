alter table public.confessions
  add column if not exists is_seed boolean not null default false;

-- Existing seed rows were created without a user Soul. Real user confessions
-- always reference auth.uid(), so NULL soul_id is the safe migration boundary.
update public.confessions
set is_seed = true
where soul_id is null
  and is_seed = false;

create index if not exists confessions_feed_seed_idx
  on public.confessions(status, language, is_seed, created_at desc);
