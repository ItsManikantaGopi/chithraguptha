create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  soul_id text unique check (soul_id is null or soul_id ~ '^[A-Z0-9]{5}$'),
  role text not null default 'user' check (role in ('user','admin')),
  language text not null default 'en',
  region text not null default 'IN',
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id boolean primary key default true check (id),
  moderation_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id, moderation_enabled) values (true, false) on conflict (id) do nothing;

create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  soul_id uuid references public.profiles(id) on delete cascade,
  display_soul text,
  language text not null default 'en',
  region text not null default 'IN',
  category text not null,
  content text not null check (char_length(content) between 1 and 500),
  status text not null default 'published' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references public.profiles(id)
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  soul_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('punya','paapa')),
  created_at timestamptz not null default now(),
  unique (confession_id, soul_id)
);

create index if not exists confessions_feed_idx on public.confessions(status, language, region, created_at desc);
create index if not exists confessions_soul_idx on public.confessions(soul_id, created_at desc);
create index if not exists reactions_confession_idx on public.reactions(confession_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, soul_id, role, language, region)
  values (new.id, nullif(new.raw_user_meta_data ->> 'soul_id',''), 'user',
    coalesce(new.raw_user_meta_data ->> 'language','en'), coalesce(new.raw_user_meta_data ->> 'region','IN'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.apply_moderation_status()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.soul_id is not null and not public.is_admin() then
    if exists (select 1 from public.app_settings where id = true and moderation_enabled = true) then new.status := 'pending';
    else new.status := 'published'; end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists confession_moderation_status on public.confessions;
create trigger confession_moderation_status before insert or update on public.confessions for each row execute procedure public.apply_moderation_status();

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.confessions enable row level security;
alter table public.reactions enable row level security;

revoke all on public.profiles from anon;
revoke all on public.app_settings from anon;
revoke all on public.confessions from anon;
revoke all on public.reactions from anon;
grant select on public.confessions to anon;
grant select on public.reactions to anon;
grant select on public.profiles to authenticated;
grant select on public.app_settings to authenticated;
grant select, insert, update, delete on public.confessions to authenticated;
grant select, insert, delete on public.reactions to authenticated;

drop policy if exists "public read published confessions" on public.confessions;
create policy "public read published confessions" on public.confessions for select to anon, authenticated using (status = 'published');
drop policy if exists "users read own confessions" on public.confessions;
create policy "users read own confessions" on public.confessions for select to authenticated using (soul_id = auth.uid());
drop policy if exists "admins read all confessions" on public.confessions;
create policy "admins read all confessions" on public.confessions for select to authenticated using ((select public.is_admin()));
drop policy if exists "users create confessions" on public.confessions;
create policy "users create confessions" on public.confessions for insert to authenticated with check (soul_id = auth.uid());
drop policy if exists "users update own confessions" on public.confessions;
create policy "users update own confessions" on public.confessions for update to authenticated using (soul_id = auth.uid()) with check (soul_id = auth.uid());
drop policy if exists "users delete own confessions" on public.confessions;
create policy "users delete own confessions" on public.confessions for delete to authenticated using (soul_id = auth.uid());
drop policy if exists "admins moderate confessions" on public.confessions;
create policy "admins moderate confessions" on public.confessions for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete confessions" on public.confessions;
create policy "admins delete confessions" on public.confessions for delete to authenticated using ((select public.is_admin()));

drop policy if exists "public read published reactions" on public.reactions;
create policy "public read published reactions" on public.reactions for select to anon, authenticated using (exists (select 1 from public.confessions c where c.id = confession_id and c.status = 'published'));
drop policy if exists "users create reactions" on public.reactions;
create policy "users create reactions" on public.reactions for insert to authenticated with check (soul_id = auth.uid() and exists (select 1 from public.confessions c where c.id = confession_id and c.status = 'published'));
drop policy if exists "users delete own reactions" on public.reactions;
create policy "users delete own reactions" on public.reactions for delete to authenticated using (soul_id = auth.uid());

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles for select to authenticated using ((select public.is_admin()));

drop policy if exists "authenticated read settings" on public.app_settings;
create policy "authenticated read settings" on public.app_settings for select to authenticated using (true);
drop policy if exists "admins update settings" on public.app_settings;
create policy "admins update settings" on public.app_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

with seed(language, region, category, content) as (values
('te','AP','Career','మీటింగ్‌లో నేను పని పూర్తి చేశానని చెప్పాను. నిజానికి ఆ టికెట్‌ను ఇంకా ఓపెన్ కూడా చేయలేదు.'),
('te','TS','Regret','నాన్నతో చివరిసారి మాట్లాడినప్పుడు తొందరగా ఫోన్ పెట్టేశాను. ఆ చిన్న నిమిషం ఇప్పటికీ గుర్తొస్తుంది.'),
('hi','DL','Petty Sin','ऑफिस में मैंने कहा कि इंटरनेट धीमा था। असल में मैं चाय लेकर छत पर बैठा था।'),
('hi','UP','Love','जिसे माफ़ करना चाहिए था, उससे मैं सालों तक नाराज़ रहा। अब लगता है कि अहंकार ने रिश्ते से ज़्यादा कीमत ली।'),
('ta','TN','Career','நான் deadline முடித்துவிட்டேன் என்று சொன்னேன். உண்மையில் முதல் file-ஐ கூட திறக்கவில்லை.'),
('ta','TN','Deep Secret','அம்மா அழைத்தபோது busy என்று சொன்னேன். உண்மையில் நான் பேச மனமில்லாமல் இருந்தேன். இப்போது வருத்தமாக இருக்கிறது.'),
('kn','KA','Petty Sin','ನಾನು ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೇನೆ ಎಂದು ಹೇಳಿ laptop ಮುಂದೆ YouTube ನೋಡುತ್ತಿದ್ದೆ.'),
('kn','KA','Regret','ಒಬ್ಬ ಸ್ನೇಹಿತನ ಕ್ಷಮೆ ಕೇಳುವ ಅವಕಾಶ ಇತ್ತು. ನನ್ನ ego ಗೆ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು ಬೆಲೆ ಕೊಟ್ಟೆ.'),
('ml','KL','Love','ഞാൻ സ്നേഹിച്ച ഒരാളോട് സത്യസന്ധമായി സംസാരിക്കേണ്ട സമയത്ത് മിണ്ടാതെ പോയി.'),
('ml','KL','Career','ജോലി തീർന്നെന്ന് പറഞ്ഞിട്ട് അവസാന നിമിഷം വരെ മാറ്റിവെച്ചിട്ടുണ്ട്. കുറ്റബോധം ഉണ്ടായിരുന്നു, പക്ഷേ വീണ്ടും അതേ തെറ്റ് ചെയ്തു.'),
('mr','MH','Petty Sin','मी कामाचा report तयार आहे असं सांगितलं. खरं तर तो फक्त desktop वर नवीन file होता.'),
('bn','WB','Regret','আমি বন্ধুকে ক্ষমা চাইতে পারতাম, কিন্তু অহংকারকে আগে রাখলাম।'),
('en','IN','Deep Secret','I keep saying I am too busy, but sometimes I am simply avoiding the conversation I know I need to have.'),
('en','IN','Love','I stayed in a relationship longer than I should have because I was afraid of admitting that I had changed.'))
insert into public.confessions (soul_id, display_soul, language, region, category, content, status)
select null, 'SEED' || lpad(row_number() over (order by language, region)::text, 1, '0'), language, region, category, content, 'published'
from seed where not exists (select 1 from public.confessions);
