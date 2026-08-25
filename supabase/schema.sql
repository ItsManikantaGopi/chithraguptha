-- Admin delete policy is appended separately so this migration remains safe to re-run.
-- Run the full schema.sql from this branch first.
drop policy if exists "admins delete confessions" on public.confessions;
create policy "admins delete confessions" on public.confessions for delete to authenticated using ((select public.is_admin()));
