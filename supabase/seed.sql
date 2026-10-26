-- Local development only. This secret is public test data, never use it on physical production tags.
insert into public.tags(public_code, activation_code) values ('SW0001', extensions.crypt('LOCAL-SW-2026', extensions.gen_salt('bf'))) on conflict (public_code) do nothing;
