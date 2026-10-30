-- A gallery is saved atomically with its adventure. Existing cover photos remain intact.
alter table public.experiences add column media jsonb not null default '[]'::jsonb;
update public.experiences set media = jsonb_build_array(jsonb_build_object('path', photo_url, 'kind', 'image')) where photo_url is not null;

create function public.valid_experience_media(items jsonb, owner uuid) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb; paths text[] := '{}'; filename text;
begin
 if jsonb_typeof(items) <> 'array' then return false; end if;
 if jsonb_array_length(items) > 10 then return false; end if;
 for item in select value from jsonb_array_elements(items) loop
  if jsonb_typeof(item) <> 'object' or not (item ? 'path' and item ? 'kind')
    or jsonb_typeof(item->'path') <> 'string' or jsonb_typeof(item->'kind') <> 'string' then return false; end if;
  if not starts_with(item->>'path', owner::text || '/') or (item->>'path') = any(paths) then return false; end if;
  filename := substr(item->>'path', length(owner::text) + 2);
  if not ((item->>'kind' = 'image' and filename ~ '^[a-f0-9-]{36}\.(jpg|png|webp)$')
       or (item->>'kind' = 'video' and filename ~ '^[a-f0-9-]{36}\.(mp4|webm|mov)$')) then return false; end if;
  paths := array_append(paths, item->>'path');
 end loop;
 return true;
end $$;
revoke all on function public.valid_experience_media(jsonb,uuid) from public;
grant execute on function public.valid_experience_media(jsonb,uuid) to authenticated;
alter table public.experiences add constraint experience_media_owner check (public.valid_experience_media(media,user_id));

update storage.buckets set file_size_limit = 26214400,
 allowed_mime_types = array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
 where id = 'experience-photos';

drop policy experience_images_read on storage.objects;
create policy experience_images_read on storage.objects for select to anon, authenticated using (
 bucket_id = 'experience-photos' and (
  (storage.foldername(name))[1] = (select auth.uid())::text
  or exists (select 1 from public.experiences e where e.visibility = 'public'
    and (e.photo_url = storage.objects.name or e.media @> jsonb_build_array(jsonb_build_object('path', storage.objects.name))))
 )
);
notify pgrst, 'reload schema';
