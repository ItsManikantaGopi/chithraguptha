# Chithraguptha — The Cosmic Ledger

Chithraguptha is an anonymous confession and community-reflection experience inspired by Chitragupta, dharma, karma and Purāṇic traditions.

## What is live in this MVP

- `/` — Supabase-backed public Ledger and confession feed.
- `/login` — five-character anonymous Soul ID + password continuity across devices.
- `/admin` — private moderation desk for administrators.
- `/prototype` — preserved legacy prototype from the earlier visual/interaction work.
- `/garuda-purana`, `/dharma`, `/about` — existing mythology/product pages.
- PostgreSQL persistence through Supabase.
- Punya / Paapa reactions persisted with one reaction per Soul per confession.
- Localized, India-region-aware seed content for Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali and English.
- Moderation defaults to **OFF**. When enabled, new user confessions become `pending` and must be published or rejected by an admin.

## 1. Create the Supabase connection

In Supabase, open **Project Settings → API** and copy:

- Project URL
- Publishable key (`sb_publishable_...` on current projects)

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Do **not** put a Supabase secret/service-role key in the browser. The application only needs the publishable key because the database is protected by RLS.

Supabase's current Next.js guidance uses the project URL and publishable key for browser clients and recommends RLS for exposed tables: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## 2. Create the database

Open **Supabase → SQL Editor** and run these scripts in order:

```text
supabase/schema.sql
supabase/0002_admin_settings.sql
supabase/0003_seed-id-normalization.sql
```

The first script creates:

- `profiles`
- `app_settings`
- `confessions`
- `reactions`
- RLS policies
- admin authorization helper
- authentication trigger
- moderation-status trigger
- localized seed data

The two follow-up scripts grant the admin settings update permission and normalize the seeded display IDs to five characters.

The initial moderation setting is deliberately:

```text
moderation_enabled = false
```

Therefore seed entries and new user confessions are published immediately until an administrator turns moderation on.

## 3. Configure Supabase Auth for anonymous Soul IDs

The product does not ask users for a real email. Internally, the MVP maps a generated Soul ID to an unreachable synthetic Auth email such as:

```text
soul_a7f9k@accounts.chithraguptha.site
```

The user never sees this address.

For the MVP, go to **Authentication → Providers → Email** and disable **Confirm email**. This lets a newly created Soul receive a session immediately without requiring an email inbox. Supabase documents that a signup returns a session when email confirmation is disabled.

This is a deliberate MVP trade-off. Before a public launch, review abuse controls, password recovery and whether the anonymous credential model should remain this way.

## 4. Create the first administrator

Create an administrator through **Supabase → Authentication → Users → Add user** using an email/password you control.

After the Auth user exists, open SQL Editor and promote that Auth user:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID_HERE';
```

The application deliberately ignores client-supplied `role` metadata, so a normal Soul cannot promote itself to administrator.

Then open:

```text
https://www.chithraguptha.site/admin
```

Sign in with that administrator email/password.

The dashboard lets you:

- see pending confessions;
- publish a confession;
- reject a confession;
- permanently remove a confession;
- see published/total counts;
- turn moderation ON/OFF.

## 5. Moderation behavior

### Moderation OFF

```text
Soul → Record confession → published → public Ledger
```

### Moderation ON

```text
Soul → Record confession → pending
                           ↓
                    Admin moderation desk
                      ↙           ↘
                 Publish         Reject
                    ↓
              public Ledger
```

The moderation state is enforced by a Postgres trigger, not only by the UI. This prevents a client from bypassing the setting by manually submitting `status = published`.

## 6. Anonymous Soul model

Soul IDs are intentionally only **5 characters** for the MVP:

```text
#A7F9K
```

The namespace uses uppercase letters and digits while avoiding visually confusing characters. The ID is a public pseudonymous identifier; the actual Supabase Auth UUID remains internal.

The current namespace is sufficient for the MVP. We should expand it before the Soul population approaches the collision-risk range.

A Soul can sign in from another device with:

```text
Soul ID: A7F9K
Password: ********
```

No name, phone number or real email is collected.

## 7. CRUD model

### Confessions

- Create — authenticated Soul.
- Read — public can read published entries; users/admins can read according to RLS.
- Update — owner can update their own entry; admin can moderate.
- Delete — owner can delete their own entry; admin can permanently remove entries.

### Reactions

- Create — authenticated Soul.
- Read — public counts/records for published entries.
- Delete — owner can remove their own reaction.
- A database uniqueness constraint prevents more than one reaction per Soul per confession.

## 8. Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without Supabase environment variables the new live root cannot connect to the database; use `/prototype` to inspect the preserved legacy prototype.

## 9. Vercel

Add the same environment variables in **Vercel → Project → Settings → Environment Variables**:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Redeploy after adding them.

## 10. Important security boundary

The publishable key is safe to expose in browser code only because the database is protected with RLS. Never expose a Supabase secret/service-role key in `NEXT_PUBLIC_*` variables or client components. Supabase documents that service/secret keys bypass RLS and must remain server-side.

## Product/content boundary

The product should not claim to determine a person's real karma, afterlife, religious status or guaranteed spiritual punishment. Garuda Purana/Naraka material is presented as source-aware cultural and religious material plus a reflective product layer.

The popular 28-Naraka catalogue is especially explicit in Bhagavata Purana 5.26 and appears with variants across Purāṇic literature. The Garuda Purana's Preta material also discusses Yama-marga, Chitragupta, Yamadutas, Naraka and post-death consequences. Names and associations can vary by text, recension and translation.
