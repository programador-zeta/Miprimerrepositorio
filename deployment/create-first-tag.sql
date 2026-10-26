-- Run once in the SQL Editor of your dedicated Supabase project.
-- The activation code is generated at execution time and shown only in your SQL result.
-- Save that result privately. Never paste it into GitHub, Render variables, or chat.
-- If SW0001 already exists, this returns no rows and leaves it unchanged.
begin;
with secret as materialized (
  select encode(extensions.gen_random_bytes(24), 'hex') as activation_code
), created as (
  insert into public.tags (public_code, activation_code, status)
  select 'SW0001', extensions.crypt(secret.activation_code, extensions.gen_salt('bf')), 'unclaimed'
  from secret
  on conflict (public_code) do nothing
  returning public_code
)
select created.public_code, secret.activation_code
from created cross join secret;
commit;
