-- Run once in a NEW Supabase project's SQL Editor before connecting the site.
begin;
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy "Admins can check their membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create table public.properties (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]+$'),
  data jsonb not null check (
    jsonb_typeof(data) = 'object'
    and data ?& array['title','location','price','status','type','description','images']
    and length(data->>'title') between 1 and 300
    and jsonb_typeof(data->'price') = 'number'
    and (data->>'price')::numeric >= 0
    and jsonb_typeof(data->'images') = 'array'
    and jsonb_array_length(data->'images') between 1 and 12
  ),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.properties enable row level security;
revoke all on public.properties from anon, authenticated;
grant select on public.properties to anon, authenticated;
grant insert, update on public.properties to authenticated;
create policy "Public can read active listings" on public.properties
  for select to anon, authenticated using (archived = false);
create policy "Admins can read archived listings" on public.properties
  for select to authenticated using (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
create policy "Only admins create listings" on public.properties
  for insert to authenticated with check (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
create policy "Only admins update listings" on public.properties
  for update to authenticated using (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  )) with check (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 5242880, array['image/jpeg']);
create policy "Admins upload property photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'property-images' and exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
create policy "Admins read property photo records" on storage.objects
  for select to authenticated using (bucket_id = 'property-images' and exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
create policy "Admins remove unused uploads" on storage.objects
  for delete to authenticated using (bucket_id = 'property-images' and exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
commit;

-- After creating your own user in Authentication > Users, run separately:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
-- Never use a user's editable metadata as proof of admin access.
