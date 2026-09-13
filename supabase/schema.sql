-- GoRent.ng canonical schema. Run in the Supabase SQL editor.
-- RLS is on from the start. Public reads are limited to live/available listings.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  email text,
  roles text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text not null,
  address text not null,
  city text not null,
  area text not null,
  property_type text not null,
  price_yearly integer not null check (price_yearly > 0),
  bedrooms integer not null check (bedrooms >= 0),
  bathrooms integer not null check (bathrooms >= 0),
  amenities text[] not null default '{}',
  listing_status text not null default 'live' check (listing_status in ('draft', 'live', 'unlisted')),
  occupancy_status text not null default 'vacant' check (occupancy_status in ('vacant', 'occupied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  kind text not null check (kind in ('photo', 'video')),
  label text,
  sort_order integer not null default 0
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  move_in_date date not null,
  message text not null,
  income text,
  employment text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenancies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid not null references public.applications(id),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  date date not null,
  description text not null,
  cost integer not null check (cost >= 0)
);

create table if not exists public.rent_payments (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  date date not null,
  amount integer not null check (amount > 0),
  note text not null default ''
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  category text not null,
  description text not null,
  condition text not null,
  price_per_day integer not null check (price_per_day > 0),
  price_per_week integer,
  pickup_city text not null,
  pickup_area text not null,
  status text not null default 'available' check (status in ('available', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.item_media (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create table if not exists public.item_bookings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  lender_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'completed')),
  start_date date not null,
  end_date date not null,
  agreed_price integer not null check (agreed_price > 0),
  message text not null default '',
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.item_availability (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  note text not null default '',
  check (end_date >= start_date)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  tenancy_id uuid references public.tenancies(id) on delete cascade,
  item_booking_id uuid references public.item_bookings(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  direction text not null,
  created_at timestamptz not null default now(),
  check (
    (tenancy_id is not null and item_booking_id is null)
    or (tenancy_id is null and item_booking_id is not null)
  )
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  landlord_id uuid references public.profiles(id) on delete set null,
  description text not null,
  evidence_url text,
  contact text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  check (
    (property_id is not null and item_id is null)
    or (property_id is null and item_id is not null)
  )
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.listing_media enable row level security;
alter table public.applications enable row level security;
alter table public.tenancies enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.rent_payments enable row level security;
alter table public.items enable row level security;
alter table public.item_media enable row level security;
alter table public.item_bookings enable row level security;
alter table public.item_availability enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.favorites enable row level security;

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "live properties are public" on public.properties
  for select using (listing_status = 'live' or landlord_id = auth.uid());
create policy "landlords insert properties" on public.properties
  for insert with check (landlord_id = auth.uid());
create policy "landlords update own properties" on public.properties
  for update using (landlord_id = auth.uid());

create policy "listing media follows property" on public.listing_media
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and (p.listing_status = 'live' or p.landlord_id = auth.uid())
    )
  );
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

create policy "application parties can read" on public.applications
  for select using (
    tenant_id = auth.uid()
    or exists (select 1 from public.properties p where p.id = property_id and p.landlord_id = auth.uid())
  );
create policy "tenants create applications" on public.applications
  for insert with check (tenant_id = auth.uid());
create policy "landlords update applications" on public.applications
  for update using (
    exists (select 1 from public.properties p where p.id = property_id and p.landlord_id = auth.uid())
  );

create policy "tenancy parties can read" on public.tenancies
  for select using (tenant_id = auth.uid() or landlord_id = auth.uid());
create policy "landlords insert tenancies" on public.tenancies
  for insert with check (landlord_id = auth.uid());
create policy "landlords update tenancies" on public.tenancies
  for update using (landlord_id = auth.uid());

create policy "maintenance is landlord-only" on public.maintenance_records
  for all using (
    exists (select 1 from public.properties p where p.id = property_id and p.landlord_id = auth.uid())
  );

create policy "payments visible to tenancy parties" on public.rent_payments
  for select using (
    exists (
      select 1 from public.tenancies t
      where t.id = tenancy_id and (t.landlord_id = auth.uid() or t.tenant_id = auth.uid())
    )
  );
create policy "landlords insert payments" on public.rent_payments
  for insert with check (
    exists (select 1 from public.tenancies t where t.id = tenancy_id and t.landlord_id = auth.uid())
  );

create policy "available items are public" on public.items
  for select using (status = 'available' or lender_id = auth.uid());
create policy "lenders insert items" on public.items
  for insert with check (lender_id = auth.uid());
create policy "lenders update own items" on public.items
  for update using (lender_id = auth.uid());

create policy "item media follows item" on public.item_media
  for select using (
    exists (
      select 1 from public.items i
      where i.id = item_id and (i.status = 'available' or i.lender_id = auth.uid())
    )
  );
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

create policy "booking parties can read" on public.item_bookings
  for select using (renter_id = auth.uid() or lender_id = auth.uid());
create policy "renters create bookings" on public.item_bookings
  for insert with check (renter_id = auth.uid());
create policy "lenders update bookings" on public.item_bookings
  for update using (lender_id = auth.uid());

create policy "availability readable with item" on public.item_availability
  for select using (
    exists (
      select 1 from public.items i
      where i.id = item_id and (i.status = 'available' or i.lender_id = auth.uid())
    )
  );
create policy "lenders write availability" on public.item_availability
  for all using (
    exists (select 1 from public.items i where i.id = item_id and i.lender_id = auth.uid())
  );

create policy "reviews are public" on public.reviews for select using (true);
create policy "participants insert reviews" on public.reviews
  for insert with check (reviewer_id = auth.uid());

create policy "anyone can file a report" on public.reports
  for insert with check (reporter_id is null or reporter_id = auth.uid());
create policy "reporters read own reports" on public.reports
  for select using (reporter_id = auth.uid());

create policy "users manage own favorites" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
