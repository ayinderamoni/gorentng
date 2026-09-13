-- Run this in the Supabase SQL editor if you already applied schema.sql.
-- Safe to re-run.

alter table public.profiles add column if not exists email text;
alter table public.listing_media add column if not exists label text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email, roles)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.email,
    '{}'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true),
       ('item-media', 'item-media', true),
       ('report-evidence', 'report-evidence', false)
on conflict (id) do nothing;

drop policy if exists "listing media public read" on storage.objects;
drop policy if exists "listing media auth write" on storage.objects;
drop policy if exists "item media public read" on storage.objects;
drop policy if exists "item media auth write" on storage.objects;
drop policy if exists "report evidence auth write" on storage.objects;
drop policy if exists "report evidence auth read" on storage.objects;

create policy "listing media public read" on storage.objects
  for select using (bucket_id = 'listing-media');
create policy "listing media auth write" on storage.objects
  for insert with check (bucket_id = 'listing-media' and auth.role() = 'authenticated');

create policy "item media public read" on storage.objects
  for select using (bucket_id = 'item-media');
create policy "item media auth write" on storage.objects
  for insert with check (bucket_id = 'item-media' and auth.role() = 'authenticated');

create policy "report evidence auth write" on storage.objects
  for insert with check (bucket_id = 'report-evidence' and auth.role() = 'authenticated');
create policy "report evidence auth read" on storage.objects
  for select using (bucket_id = 'report-evidence' and auth.role() = 'authenticated');

drop policy if exists "landlords write listing media" on public.listing_media;
drop policy if exists "landlords insert listing media" on public.listing_media;
drop policy if exists "landlords update listing media" on public.listing_media;
drop policy if exists "landlords delete listing media" on public.listing_media;

create policy "landlords insert listing media" on public.listing_media
  for insert with check (
    exists (select 1 from public.properties p where p.id = property_id and p.landlord_id = auth.uid())
  );
create policy "landlords update listing media" on public.listing_media
  for update using (
    exists (select 1 from public.properties p where p.id = property_id and p.landlord_id = auth.uid())
  );
create policy "landlords delete listing media" on public.listing_media
  for delete using (
    exists (select 1 from public.properties p where p.id = property_id and p.landlord_id = auth.uid())
  );

drop policy if exists "lenders write item media" on public.item_media;
drop policy if exists "lenders insert item media" on public.item_media;
drop policy if exists "lenders update item media" on public.item_media;
drop policy if exists "lenders delete item media" on public.item_media;

create policy "lenders insert item media" on public.item_media
  for insert with check (
    exists (select 1 from public.items i where i.id = item_id and i.lender_id = auth.uid())
  );
create policy "lenders update item media" on public.item_media
  for update using (
    exists (select 1 from public.items i where i.id = item_id and i.lender_id = auth.uid())
  );
create policy "lenders delete item media" on public.item_media
  for delete using (
    exists (select 1 from public.items i where i.id = item_id and i.lender_id = auth.uid())
  );
