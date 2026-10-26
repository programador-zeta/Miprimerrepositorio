create extension if not exists pgcrypto with schema extensions;
create table public.profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'), name text not null default '', bio text not null default '', city text not null default '',
 profile_photo text, social_link text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tags (
 id uuid primary key default gen_random_uuid(), public_code text not null unique check (public_code ~ '^[A-Z0-9]{4,24}$'),
 activation_code text not null, owner_id uuid references auth.users(id), status text not null default 'unclaimed' check (status in ('unclaimed','active','disabled')),
 created_at timestamptz not null default now(), check (status <> 'active' or owner_id is not null)
);
create table public.emergency_profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 emergency_name text not null default '', emergency_phone text not null default '', allergies text, medications text, notes text,
 updated_at timestamptz not null default now()
);
create table public.experiences (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 type text not null check (type in ('hike','bike','run','mountain','trip','other')), name text not null, place text not null,
 experience_date date not null, photo_url text, note text, visibility text not null default 'private' check (visibility in ('public','private')),
 created_at timestamptz not null default now()
);
create index experiences_user_id_idx on public.experiences(user_id);
create table public.tag_scans (id uuid primary key default gen_random_uuid(), tag_id uuid not null references public.tags(id) on delete cascade, scanned_at timestamptz not null default now());
create index tag_scans_tag_id_idx on public.tag_scans(tag_id);
alter table public.tags enable row level security;
alter table public.profiles enable row level security;
alter table public.emergency_profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.tag_scans enable row level security;
revoke all on public.tags, public.tag_scans from anon, authenticated;
-- No client, including the owner, can read activation_code. Store only its bcrypt hash.
grant select (id, public_code, owner_id, status, created_at) on public.tags to authenticated;
create policy tags_owner_read on public.tags for select to authenticated using ((select auth.uid()) = owner_id);
create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy profiles_owner_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_owner_update on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy emergency_public_read on public.emergency_profiles for select to anon, authenticated using (exists(select 1 from public.profiles p where p.user_id = emergency_profiles.user_id));
create policy emergency_owner_all on public.emergency_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy experiences_read on public.experiences for select to anon, authenticated using (visibility = 'public' or (select auth.uid()) = user_id);
create policy experiences_owner_all on public.experiences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger emergency_updated before update on public.emergency_profiles for each row execute function public.touch_updated_at();
-- Public NFC lookup returns only the state and public destination. Never secrets or owner IDs.
create function public.resolve_tag(code text) returns table(status text, username text)
language plpgsql security definer set search_path = '' as $$
declare found_tag public.tags%rowtype;
begin
 select * into found_tag from public.tags t where t.public_code = code;
 if not found then return; end if;
 insert into public.tag_scans(tag_id) values(found_tag.id);
 return query select found_tag.status, case when found_tag.status = 'active' then (select p.username from public.profiles p where p.user_id = found_tag.owner_id) else null end;
end $$;
revoke all on function public.resolve_tag(text) from public;
grant execute on function public.resolve_tag(text) to anon, authenticated;
-- Claim is atomic: the row lock prevents simultaneous claims; only a logged-in user can claim.
create function public.claim_tag(code text, secret text) returns void
language plpgsql security definer set search_path = '' as $$
declare found_tag public.tags%rowtype;
begin
 if auth.uid() is null then raise exception 'Inicia sesión para activar tu tag'; end if;
 select * into found_tag from public.tags t where t.public_code = code for update;
 if not found or secret is null or length(secret) = 0 or found_tag.status <> 'unclaimed' or extensions.crypt(secret, found_tag.activation_code) <> found_tag.activation_code then
 raise exception 'No se pudo activar. Revisa el código o el estado del tag.';
 end if;
 update public.tags set owner_id = auth.uid(), status = 'active' where id = found_tag.id;
end $$;
revoke all on function public.claim_tag(text,text) from public, anon;
grant execute on function public.claim_tag(text,text) to authenticated;
