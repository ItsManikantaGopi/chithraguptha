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

-- Keep seed state and the public Soul identity authoritative at the database
-- boundary. A browser must never be able to turn its own confession into seed data.
create or replace function public.apply_moderation_status()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.soul_id is not null and not public.is_admin() then
    new.is_seed := false;
    select p.soul_id into new.display_soul
    from public.profiles p
    where p.id = new.soul_id;

    if exists (select 1 from public.app_settings where id = true and moderation_enabled = true) then
      new.status := 'pending';
    else
      new.status := 'published';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;
