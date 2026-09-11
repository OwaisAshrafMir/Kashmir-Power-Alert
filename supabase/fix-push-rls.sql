-- Fix push_subscriptions RLS so a device can be re-bound to the current user.
-- Run in Supabase SQL editor if you want browser-side upserts to work without service role.

drop policy if exists "Push subs owner access" on public.push_subscriptions;
drop policy if exists "Push subs select own" on public.push_subscriptions;
drop policy if exists "Push subs insert own" on public.push_subscriptions;
drop policy if exists "Push subs update own" on public.push_subscriptions;
drop policy if exists "Push subs delete own" on public.push_subscriptions;

create policy "Push subs select own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Push subs insert own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Push subs update own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Push subs delete own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
