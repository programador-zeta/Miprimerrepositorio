-- Work with automatic table exposure disabled. RLS still controls every row.
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.emergency_profiles, public.experiences to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.emergency_profiles, public.experiences to authenticated;
-- Preserve the restricted tag surface: activation_code and tag_scans remain inaccessible.
revoke all on public.tags, public.tag_scans from anon, authenticated;
grant select (id, public_code, owner_id, status, created_at) on public.tags to authenticated;
