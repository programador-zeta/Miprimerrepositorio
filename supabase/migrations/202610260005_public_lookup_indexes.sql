-- Index the owner and public timeline queries used by the dashboard and NFC profiles.
create index if not exists tags_owner_id_idx on public.tags(owner_id);
create index if not exists experiences_public_user_date_idx
  on public.experiences(user_id, experience_date desc)
  where visibility = 'public';
-- Make newly deployed tables and RPC signatures visible to the Data API.
notify pgrst, 'reload schema';
