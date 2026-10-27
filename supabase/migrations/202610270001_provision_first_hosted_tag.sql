-- Provision the first NFC entry without publishing or logging its activation secret.
-- Supabase Vault is private to privileged database roles, not exposed through the app.
create extension if not exists supabase_vault with schema vault;
revoke all on vault.decrypted_secrets, vault.secrets from public, anon, authenticated;

do $$
declare
  activation_secret text;
begin
  -- A factory tag, claimed tag or locally seeded tag is never overwritten.
  if exists(select 1 from public.tags where public_code = 'SW0001') then
    return;
  end if;

  select decrypted_secret into activation_secret
  from vault.decrypted_secrets where name = 'somewhere_tag_SW0001_activation';

  if activation_secret is null then
    activation_secret := encode(extensions.gen_random_bytes(24), 'hex');
    perform vault.create_secret(
      activation_secret,
      'somewhere_tag_SW0001_activation',
      'Private first-claim code for Somewhere Tag SW0001; never publish or share in chat.'
    );
  end if;

  insert into public.tags(public_code, activation_code, status)
  values ('SW0001', extensions.crypt(activation_secret, extensions.gen_salt('bf')), 'unclaimed');
end;
$$;
