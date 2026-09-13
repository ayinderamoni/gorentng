-- Demo marketplace rows for an existing GoRent.ng project.
-- Run in the Supabase SQL editor after schema.sql / patches.sql.
-- Attaches listings to your oldest profiles. Safe to re-run.

alter table public.listing_media add column if not exists label text;

do $$
declare
  owner_a uuid;
  owner_b uuid;
  lekki uuid;
  ikoyi uuid;
  gwarinpa uuid;
  gen_id uuid;
  projector_id uuid;
  sewing_id uuid;
begin
  select id into owner_a from public.profiles order by created_at, id limit 1;
  if owner_a is null then
    raise exception 'Create at least one account before seeding';
  end if;
  select id into owner_b from public.profiles order by created_at, id offset 1 limit 1;
  owner_b := coalesce(owner_b, owner_a);

  update public.profiles
  set roles = (
    select array_agg(distinct r)
    from unnest(coalesce(roles, '{}') || array['landlord', 'lender']) as r
  )
  where id in (owner_a, owner_b);

  insert into public.properties (
    landlord_id, slug, title, description, address, city, area,
    property_type, price_yearly, bedrooms, bathrooms, amenities,
    listing_status, occupancy_status
  ) values
    (
      owner_a,
      '2-bedroom-terrace-lekki-lagos',
      'Sunny 2-bedroom terrace in Lekki Phase 1',
      'A well-kept terrace on a quiet street in Lekki Phase 1. Prepaid meter, estate security, and a small compound.',
      '12 Admiralty Way', 'Lagos', 'Lekki', 'terrace', 3200000, 2, 3,
      array['Prepaid meter', 'Security', 'Parking', 'Estate', 'Water'],
      'live', 'vacant'
    ),
    (
      owner_a,
      '1-bedroom-flat-ikoyi-lagos',
      '1-bedroom flat near the lagoon, Ikoyi',
      'Compact, bright flat with built-in wardrobes and a working generator share. Walking distance to Falomo.',
      '8 Keffi Street', 'Lagos', 'Ikoyi', 'flat', 1800000, 1, 1,
      array['Generator', 'Wardrobes', 'Water', 'Security'],
      'live', 'occupied'
    ),
    (
      owner_b,
      '3-bedroom-apartment-gwarinpa-abuja',
      '3-bedroom apartment in Gwarinpa',
      'Family apartment on a paved street in 1st Avenue. Borehole, parking for two cars, and a small boys’ quarters.',
      '1st Avenue, 5th Avenue junction', 'Abuja', 'Gwarinpa', 'apartment', 4500000, 3, 3,
      array['Borehole', 'Parking', 'Security', 'POP ceiling', 'Kitchen cabinets'],
      'live', 'vacant'
    )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    landlord_id = excluded.landlord_id;

  select id into lekki from public.properties where slug = '2-bedroom-terrace-lekki-lagos';
  select id into ikoyi from public.properties where slug = '1-bedroom-flat-ikoyi-lagos';
  select id into gwarinpa from public.properties where slug = '3-bedroom-apartment-gwarinpa-abuja';

  delete from public.listing_media where property_id in (lekki, ikoyi, gwarinpa);
  insert into public.listing_media (property_id, url, kind, label, sort_order) values
    (lekki, '/images/listing-lekki.jpg', 'photo', 'Living', 0),
    (ikoyi, '/images/listing-ikoyi.jpg', 'photo', 'Bedroom', 0),
    (gwarinpa, '/images/listing-gwarinpa.jpg', 'photo', 'Exterior', 0);

  insert into public.items (
    lender_id, slug, title, category, description, condition,
    price_per_day, price_per_week, pickup_city, pickup_area, status
  ) values
    (
      owner_a,
      'elepaq-3-5kva-generator-ikeja-lagos',
      'Elepaq 3.5kVA generator',
      'generators',
      'Reliable home generator. Comes with 5 litres of petrol to start. Pickup in Ikeja GRA after 5pm weekdays or anytime Saturday.',
      'good', 15000, 80000, 'Lagos', 'Ikeja', 'available'
    ),
    (
      owner_a,
      'epson-projector-lekki-lagos',
      'Epson HD projector + screen',
      'electronics',
      'Great for birthdays and small office pitches. Includes HDMI cable and a 80-inch pull-up screen.',
      'like_new', 12000, 60000, 'Lagos', 'Lekki', 'available'
    ),
    (
      owner_b,
      'industrial-sewing-machine-gwarinpa-abuja',
      'Industrial sewing machine',
      'tools',
      'Butterfly industrial machine. You pick up and return the same week. Ideal for a short production run.',
      'good', 8000, 40000, 'Abuja', 'Gwarinpa', 'available'
    )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    lender_id = excluded.lender_id;

  select id into gen_id from public.items where slug = 'elepaq-3-5kva-generator-ikeja-lagos';
  select id into projector_id from public.items where slug = 'epson-projector-lekki-lagos';
  select id into sewing_id from public.items where slug = 'industrial-sewing-machine-gwarinpa-abuja';

  delete from public.item_media where item_id in (gen_id, projector_id, sewing_id);
  insert into public.item_media (item_id, url, sort_order) values
    (gen_id, '/images/listing-ikoyi.jpg', 0),
    (projector_id, '/images/listing-lekki.jpg', 0),
    (sewing_id, '/images/listing-gwarinpa.jpg', 0);
end
$$;
