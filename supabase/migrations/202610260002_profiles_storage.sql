create function public.create_user_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(user_id,username) values(new.id,'user_' || left(replace(new.id::text,'-',''),24));
 return new;
end $$;
revoke all on function public.create_user_profile() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_user_profile();
insert into public.profiles(user_id,username) select u.id,'user_' || left(replace(u.id::text,'-',''),24) from auth.users u on conflict (user_id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('experience-photos','experience-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy images_owner_insert on storage.objects for insert to authenticated with check (bucket_id in ('avatars','experience-photos') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy images_owner_update on storage.objects for update to authenticated using (bucket_id in ('avatars','experience-photos') and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id in ('avatars','experience-photos') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy images_owner_delete on storage.objects for delete to authenticated using (bucket_id in ('avatars','experience-photos') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_read on storage.objects for select to anon, authenticated using(bucket_id='avatars');
create policy experience_images_read on storage.objects for select to anon, authenticated using(bucket_id='experience-photos' and ((storage.foldername(name))[1] = (select auth.uid())::text or exists(select 1 from public.experiences e where e.photo_url=storage.objects.name and e.visibility='public')));
