-- Prevent someone from publishing another user's private storage object by referencing its path.
alter table public.experiences add constraint experience_photo_owner check (photo_url is null or starts_with(photo_url,user_id::text || '/'));
alter table public.profiles add constraint avatar_owner check (profile_photo is null or starts_with(profile_photo,user_id::text || '/'));
create function public.set_tag_enabled(code text, enabled boolean) returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or enabled is null then raise exception 'No autorizado'; end if;
 update public.tags set status=case when enabled then 'active' else 'disabled' end where public_code=code and owner_id=auth.uid() and status in ('active','disabled');
 if not found then raise exception 'No se pudo actualizar el tag'; end if;
end $$;
revoke all on function public.set_tag_enabled(text,boolean) from public, anon;
grant execute on function public.set_tag_enabled(text,boolean) to authenticated;
