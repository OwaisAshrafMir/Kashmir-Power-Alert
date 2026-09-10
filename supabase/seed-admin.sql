-- Seed admin after first signup OR create via Auth dashboard then run:

-- update public.profiles
-- set role = 'admin', full_name = 'Owais Ashraf Mir'
-- where email = 'owaisashrafmir8764@gmail.com';

-- Full SQL seed for admin auth user (run in SQL Editor):
create extension if not exists pgcrypto;

do $$
declare
  v_user_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  v_email text := 'owaisashrafmir8764@gmail.com';
  v_password text := 'KashmirAdmin@2026';
  v_full_name text := 'Owais Ashraf Mir';
  v_encrypted text;
begin
  select id into v_user_id from auth.users where email = v_email limit 1;
  if v_user_id is null then
    v_user_id := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  end if;

  v_encrypted := crypt(v_password, gen_salt('bf'));

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    email_change_token_current, email_change_confirm_status, is_sso_user
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    v_encrypted,
    now(),
    '', '', '', '',
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', v_full_name),
    now(), now(),
    '', 0, false
  )
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
    'email',
    v_user_id::text,
    now(), now(), now()
  )
  on conflict (provider, provider_id) do update
  set identity_data = excluded.identity_data, updated_at = now();

  insert into public.profiles (id, email, full_name, role, plan)
  values (v_user_id, v_email, v_full_name, 'admin', 'free')
  on conflict (id) do update
  set role = 'admin', email = excluded.email, full_name = excluded.full_name;

  insert into public.user_settings (user_id, district, locality, notifications_enabled)
  values (v_user_id, 'Srinagar', 'Lal Chowk', true)
  on conflict (user_id) do nothing;
end $$;

select id, email, role, plan from public.profiles where email = 'owaisashrafmir8764@gmail.com';
