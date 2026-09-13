-- 25 homes + 25 items for one owner.
-- Run in the Supabase SQL editor. Safe to re-run (sample-* slugs).

do $$
declare
  owner uuid := 'd64fcf1c-cdaa-46be-83c6-437c7d097379';
begin
  if not exists (select 1 from public.profiles where id = owner) then
    raise exception 'Profile % does not exist. Sign in with that account first.', owner;
  end if;

  update public.profiles
  set roles = (
    select array_agg(distinct r)
    from unnest(coalesce(roles, '{}') || array['landlord', 'lender']) as r
  )
  where id = owner;

  insert into public.properties (
    landlord_id, slug, title, description, address, city, area,
    property_type, price_yearly, bedrooms, bathrooms, amenities,
    listing_status, occupancy_status
  ) values
    -- Lagos
    (owner, 'sample-room-sc-agege-lagos',
      'Single room self contain in Agege',
      'Compact self contain with prepaid meter, tiled floor and shared compound security. Suitable for one person working on the Abeokuta Expressway corridor.',
      '14 Old Abeokuta Road', 'Lagos', 'Agege', 'room', 450000, 1, 1,
      array['Prepaid meter', 'Water', 'Tiled floors', 'Security'], 'live', 'vacant'),
    (owner, 'sample-room-sc-surulere-lagos',
      'Single room self contain off Ogunlana, Surulere',
      'Quiet self contain behind a gated compound. Kitchenette, shower, and borehole water. Five minutes to Stadium and the BRT.',
      '8 Adeniran Ogunsanya hinterland', 'Lagos', 'Surulere', 'room', 550000, 1, 1,
      array['Borehole', 'Prepaid meter', 'Security', 'Tiled floors'], 'live', 'vacant'),
    (owner, 'sample-rp-yaba-lagos',
      'Room and parlour self contain in Yaba',
      'Room and parlour with a small kitchen and bathroom. Close to Tejuosho and the University of Lagos axis. Prepaid meter.',
      '22 Commercial Avenue', 'Lagos', 'Yaba', 'studio', 850000, 1, 1,
      array['Prepaid meter', 'Water', 'Wardrobes', 'Kitchen cabinets'], 'live', 'vacant'),
    (owner, 'sample-rp-ikeja-lagos',
      'Room and parlour self contain in Ikeja GRA edge',
      'Bright room and parlour, tiled, with a private bathroom. Estate security and parking for one small car.',
      '5 Obafemi Awolowo Way hinterland', 'Lagos', 'Ikeja', 'studio', 1100000, 1, 1,
      array['Security', 'Parking', 'Prepaid meter', 'Estate', 'Water'], 'live', 'vacant'),
    (owner, 'sample-2bed-lekki-lagos',
      '2-bedroom apartment in Lekki Phase 1',
      'Two-bedroom apartment on a paved street. POP ceiling, kitchen cabinets, estate security and a prepaid meter.',
      '18 Admiralty Way', 'Lagos', 'Lekki', 'apartment', 2800000, 2, 2,
      array['Estate', 'Security', 'Prepaid meter', 'POP ceiling', 'Kitchen cabinets', 'Parking'], 'live', 'vacant'),
    (owner, 'sample-2bed-ajah-lagos',
      '2-bedroom apartment in Ajah',
      'Family 2-bedroom with a small balcony, borehole and parking. Ten minutes to the Addo Road junction.',
      '7 Abraham Adesanya estate road', 'Lagos', 'Ajah', 'apartment', 1800000, 2, 2,
      array['Borehole', 'Parking', 'Security', 'Wardrobes', 'Tiled floors'], 'live', 'vacant'),

    -- Abuja
    (owner, 'sample-room-sc-garki-abuja',
      'Single room self contain in Garki Area 2',
      'Self contain in a quiet block. Running water, prepaid meter, and a short walk to Area 1 shops.',
      'Plot 1122, Area 2', 'Abuja', 'Garki', 'room', 600000, 1, 1,
      array['Prepaid meter', 'Water', 'Security', 'Tiled floors'], 'live', 'vacant'),
    (owner, 'sample-rp-gwarinpa-abuja',
      'Room and parlour self contain in Gwarinpa',
      'Room and parlour on 1st Avenue. Kitchen cabinets, borehole and estate security.',
      '1st Avenue, 3rd Avenue junction', 'Abuja', 'Gwarinpa', 'studio', 950000, 1, 1,
      array['Borehole', 'Estate', 'Security', 'Kitchen cabinets', 'Parking'], 'live', 'vacant'),
    (owner, 'sample-rp-jabi-abuja',
      'Room and parlour self contain near Jabi Lake',
      'Tiled room and parlour with AC-ready wiring. Close to Jabi Lake Mall and the airport road.',
      '12 Jabi District', 'Abuja', 'Jabi', 'studio', 1200000, 1, 1,
      array['Prepaid meter', 'Air conditioning', 'Security', 'Water', 'Parking'], 'live', 'vacant'),
    (owner, 'sample-2bed-wuse-abuja',
      '2-bedroom apartment in Wuse 2',
      'Two-bedroom flat with POP, wardrobes and a generator share. Walking distance to Wuse market.',
      '19 Aminu Kano Crescent', 'Abuja', 'Wuse', 'apartment', 3200000, 2, 2,
      array['Generator', 'POP ceiling', 'Wardrobes', 'Security', 'Parking'], 'live', 'vacant'),
    (owner, 'sample-2bed-maitama-abuja',
      '2-bedroom apartment in Maitama',
      'Quiet 2-bedroom in a serviced compound. Estate security, parking and kitchen cabinets.',
      '4 Lake Chad Crescent hinterland', 'Abuja', 'Maitama', 'apartment', 4500000, 2, 2,
      array['Estate', 'Security', 'Parking', 'Kitchen cabinets', 'Air conditioning', 'Water'], 'live', 'vacant'),

    -- Ogun
    (owner, 'sample-room-sc-abeokuta-ogun',
      'Single room self contain in Abeokuta',
      'Self contain off IBB Boulevard. Prepaid meter, tiled bathroom, and borehole water.',
      '9 IBB Boulevard hinterland', 'Ogun', 'Abeokuta', 'room', 280000, 1, 1,
      array['Prepaid meter', 'Borehole', 'Tiled floors', 'Security'], 'live', 'vacant'),
    (owner, 'sample-room-sc-sango-ogun',
      'Single room self contain in Sango Ota',
      'Self contain close to the Lagos–Abeokuta expressway. Good for someone working in Agbara or Ikeja.',
      '21 Idiroko Road hinterland', 'Ogun', 'Sango Ota', 'room', 320000, 1, 1,
      array['Prepaid meter', 'Water', 'Security'], 'live', 'vacant'),
    (owner, 'sample-rp-magboro-ogun',
      'Room and parlour self contain in Magboro',
      'Room and parlour in a new block near the Lagos–Ibadan expressway. Kitchenette and private bathroom.',
      '6 Magboro bus stop hinterland', 'Ogun', 'Magboro', 'studio', 480000, 1, 1,
      array['Prepaid meter', 'Water', 'Kitchen cabinets', 'Tiled floors'], 'live', 'vacant'),
    (owner, 'sample-rp-ijebu-ogun',
      'Room and parlour self contain in Ijebu Ode',
      'Room and parlour off Ibadan Road. Quiet street, borehole and parking for a motorcycle or small car.',
      '15 Ibadan Road hinterland', 'Ogun', 'Ijebu Ode', 'studio', 400000, 1, 1,
      array['Borehole', 'Parking', 'Security', 'Tiled floors'], 'live', 'vacant'),
    (owner, 'sample-2bed-abeokuta-ogun',
      '2-bedroom apartment in Abeokuta',
      'Two-bedroom apartment in a small estate off M.K.O. Abiola Way. POP, wardrobes and parking.',
      '11 M.K.O. Abiola Way hinterland', 'Ogun', 'Abeokuta', 'apartment', 900000, 2, 2,
      array['Estate', 'Parking', 'POP ceiling', 'Wardrobes', 'Water', 'Security'], 'live', 'vacant'),

    -- Oyo
    (owner, 'sample-room-sc-ibadan-oyo',
      'Single room self contain in Bodija, Ibadan',
      'Self contain near Bodija market. Prepaid meter and shared borehole. Suitable for a student or young worker.',
      '8 Bodija Estate hinterland', 'Oyo', 'Bodija', 'room', 250000, 1, 1,
      array['Prepaid meter', 'Borehole', 'Tiled floors'], 'live', 'vacant'),
    (owner, 'sample-room-sc-ogbomosho-oyo',
      'Single room self contain in Ogbomosho',
      'Self contain off Takie Road. Tiled, with a kitchenette and reliable borehole water.',
      '4 Takie Road hinterland', 'Oyo', 'Ogbomosho', 'room', 180000, 1, 1,
      array['Borehole', 'Tiled floors', 'Water'], 'live', 'vacant'),
    (owner, 'sample-rp-iwo-road-oyo',
      'Room and parlour self contain on Iwo Road',
      'Room and parlour close to the Iwo Road interchange. Kitchen cabinets and a private bathroom.',
      '19 Iwo Road hinterland', 'Oyo', 'Ibadan', 'studio', 420000, 1, 1,
      array['Prepaid meter', 'Kitchen cabinets', 'Water', 'Security'], 'live', 'vacant'),
    (owner, 'sample-rp-ring-road-oyo',
      'Room and parlour self contain at Ring Road',
      'Room and parlour near Challenge / Ring Road. Parking for one car and a prepaid meter.',
      '27 Ring Road hinterland', 'Oyo', 'Ibadan', 'studio', 480000, 1, 1,
      array['Parking', 'Prepaid meter', 'Tiled floors', 'Security'], 'live', 'vacant'),
    (owner, 'sample-2bed-bodija-oyo',
      '2-bedroom apartment in Bodija',
      'Two-bedroom flat in a gated compound. Wardrobes, kitchen cabinets and borehole water.',
      '14 Bodija Estate', 'Oyo', 'Bodija', 'apartment', 850000, 2, 2,
      array['Borehole', 'Wardrobes', 'Kitchen cabinets', 'Security', 'Parking'], 'live', 'vacant'),

    -- Port Harcourt
    (owner, 'sample-room-sc-rumuola-ph',
      'Single room self contain in Rumuola',
      'Self contain off Rumuola Road. Prepaid meter, tiled bathroom, and close to the flyover.',
      '10 Rumuola Road hinterland', 'Port Harcourt', 'Rumuola', 'room', 400000, 1, 1,
      array['Prepaid meter', 'Tiled floors', 'Water', 'Security'], 'live', 'vacant'),
    (owner, 'sample-rp-transamadi-ph',
      'Room and parlour self contain in Trans Amadi',
      'Room and parlour near the industrial layout. Kitchenette, borehole and parking for a small car.',
      '16 Trans Amadi Industrial Layout hinterland', 'Port Harcourt', 'Trans Amadi', 'studio', 700000, 1, 1,
      array['Borehole', 'Parking', 'Security', 'Kitchen cabinets'], 'live', 'vacant'),
    (owner, 'sample-2bed-gra-ph',
      '2-bedroom apartment in Port Harcourt GRA',
      'Two-bedroom apartment in GRA Phase 2. POP, estate security and a generator share.',
      '8 Tombia Street hinterland', 'Port Harcourt', 'GRA', 'apartment', 2200000, 2, 2,
      array['Estate', 'Generator', 'POP ceiling', 'Security', 'Parking', 'Wardrobes'], 'live', 'vacant'),
    (owner, 'sample-2bed-rumuola-ph',
      '2-bedroom apartment in Rumuola',
      'Two-bedroom flat with tiled floors, kitchen cabinets and borehole water. Close to town.',
      '21 Rumuola Road', 'Port Harcourt', 'Rumuola', 'apartment', 1500000, 2, 2,
      array['Borehole', 'Kitchen cabinets', 'Tiled floors', 'Parking', 'Security'], 'live', 'vacant')
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    address = excluded.address,
    city = excluded.city,
    area = excluded.area,
    property_type = excluded.property_type,
    price_yearly = excluded.price_yearly,
    bedrooms = excluded.bedrooms,
    bathrooms = excluded.bathrooms,
    amenities = excluded.amenities,
    listing_status = 'live',
    landlord_id = owner,
    updated_at = now();

  delete from public.listing_media
  where property_id in (select id from public.properties where slug like 'sample-%' and landlord_id = owner);

  insert into public.listing_media (property_id, url, kind, label, sort_order)
  select p.id, v.url, 'photo', v.label, 0
  from public.properties p
  join (
    values
      ('sample-room-sc-agege-lagos', '/images/listing-ikoyi.jpg', 'Bedroom'),
      ('sample-room-sc-surulere-lagos', '/images/listing-gwarinpa.jpg', 'Bedroom'),
      ('sample-rp-yaba-lagos', '/images/listing-lekki.jpg', 'Living'),
      ('sample-rp-ikeja-lagos', '/images/mytenant-hero.jpg', 'Living'),
      ('sample-2bed-lekki-lagos', '/images/listing-lekki.jpg', 'Living'),
      ('sample-2bed-ajah-lagos', '/images/trust-couple.jpg', 'Exterior'),
      ('sample-room-sc-garki-abuja', '/images/listing-ikoyi.jpg', 'Bedroom'),
      ('sample-rp-gwarinpa-abuja', '/images/listing-gwarinpa.jpg', 'Living'),
      ('sample-rp-jabi-abuja', '/images/mytenant-hero.jpg', 'Living'),
      ('sample-2bed-wuse-abuja', '/images/listing-lekki.jpg', 'Living'),
      ('sample-2bed-maitama-abuja', '/images/listing-gwarinpa.jpg', 'Exterior'),
      ('sample-room-sc-abeokuta-ogun', '/images/listing-ikoyi.jpg', 'Bedroom'),
      ('sample-room-sc-sango-ogun', '/images/listing-gwarinpa.jpg', 'Bedroom'),
      ('sample-rp-magboro-ogun', '/images/mytenant-hero.jpg', 'Living'),
      ('sample-rp-ijebu-ogun', '/images/listing-lekki.jpg', 'Living'),
      ('sample-2bed-abeokuta-ogun', '/images/trust-couple.jpg', 'Exterior'),
      ('sample-room-sc-ibadan-oyo', '/images/listing-ikoyi.jpg', 'Bedroom'),
      ('sample-room-sc-ogbomosho-oyo', '/images/listing-gwarinpa.jpg', 'Bedroom'),
      ('sample-rp-iwo-road-oyo', '/images/listing-lekki.jpg', 'Living'),
      ('sample-rp-ring-road-oyo', '/images/mytenant-hero.jpg', 'Living'),
      ('sample-2bed-bodija-oyo', '/images/listing-gwarinpa.jpg', 'Living'),
      ('sample-room-sc-rumuola-ph', '/images/listing-ikoyi.jpg', 'Bedroom'),
      ('sample-rp-transamadi-ph', '/images/listing-lekki.jpg', 'Living'),
      ('sample-2bed-gra-ph', '/images/listing-gwarinpa.jpg', 'Exterior'),
      ('sample-2bed-rumuola-ph', '/images/mytenant-hero.jpg', 'Living')
  ) as v(slug, url, label) on p.slug = v.slug
  where p.landlord_id = owner;

  insert into public.items (
    lender_id, slug, title, category, description, condition,
    price_per_day, price_per_week, pickup_city, pickup_area, status
  ) values
    -- Lagos
    (owner, 'sample-elepaq-3-5kva-ikeja-lagos',
      'Elepaq 3.5kVA generator', 'generators',
      'Petrol generator for a shop or small flat. Comes with 5 litres to start. Pickup in Ikeja after 5pm weekdays.',
      'good', 15000, 80000, 'Lagos', 'Ikeja', 'available'),
    (owner, 'sample-table-saw-yaba-lagos',
      'Carpentry table saw and workbench', 'tools',
      'Bosch-style table saw, clamps and a folding workbench. Good for furniture jobs in Yaba and the Island.',
      'good', 12000, 60000, 'Lagos', 'Yaba', 'available'),
    (owner, 'sample-arc-welder-isolo-lagos',
      'Arc welding machine and helmet', 'tools',
      '200A arc welder, helmet, gloves and a pack of rods. Pickup in Isolo. You bring your own cylinders if you need gas.',
      'good', 10000, 50000, 'Lagos', 'Ikeja', 'available'),
    (owner, 'sample-electrical-kit-ikeja-lagos',
      'Electrical work toolkit and testers', 'tools',
      'Multimeter, insulation tester, conduit bender, fish tape and a full hand-tool kit for site electricians.',
      'like_new', 8000, 40000, 'Lagos', 'Ikeja', 'available'),
    (owner, 'sample-industrial-sewing-surulere-lagos',
      'Industrial sewing machine', 'tools',
      'Butterfly industrial lockstitch. Pedal and spare needles included. Pickup in Surulere.',
      'good', 8000, 40000, 'Lagos', 'Surulere', 'available'),
    (owner, 'sample-epson-projector-lekki-lagos',
      'Epson HD projector and screen', 'electronics',
      'HD projector, HDMI cable and an 80-inch pull-up screen. Good for pitches, churches and birthdays.',
      'like_new', 12000, 60000, 'Lagos', 'Lekki', 'available'),

    -- Abuja
    (owner, 'sample-tiger-5kva-gwarinpa-abuja',
      'Tiger 5kVA generator', 'generators',
      '5kVA petrol generator. Quiet enough for a 3-bedroom. Pickup on 1st Avenue, Gwarinpa.',
      'good', 22000, 110000, 'Abuja', 'Gwarinpa', 'available'),
    (owner, 'sample-planer-router-wuse-abuja',
      'Carpentry planer and router set', 'tools',
      'Electric planer, plunge router, bits and a dust bag. For joinery work around Wuse and Garki.',
      'like_new', 11000, 55000, 'Abuja', 'Wuse', 'available'),
    (owner, 'sample-mig-welder-idu-abuja',
      'MIG welder and cart', 'tools',
      'MIG welding plant on a cart, earth clamp and face shield. Pickup at Idu industrial area.',
      'good', 14000, 70000, 'Abuja', 'Garki', 'available'),
    (owner, 'sample-overlock-wuse-abuja',
      'Overlock sewing machine', 'tools',
      '4-thread overlock for finishing garments. Includes spare knives. Pickup in Wuse.',
      'good', 7000, 35000, 'Abuja', 'Wuse', 'available'),
    (owner, 'sample-rollup-banners-jabi-abuja',
      'Pair of roll-up banners', 'events',
      'Two 85×200 cm roll-up stands. You print your own media or use the blank canvas. Pickup at Jabi.',
      'like_new', 4000, 18000, 'Abuja', 'Jabi', 'available'),

    -- Ogun
    (owner, 'sample-firman-3-5kva-abeokuta-ogun',
      'Firman 3.5kVA generator', 'generators',
      'Reliable 3.5kVA for a shop or room. Pickup off IBB Boulevard, Abeokuta.',
      'good', 12000, 60000, 'Ogun', 'Abeokuta', 'available'),
    (owner, 'sample-thicknesser-sango-ogun',
      'Wood thicknesser and clamps', 'tools',
      'Benchtop thicknesser, sash clamps and a straight edge. For carpentry workshops in Sango / Agbara.',
      'good', 13000, 65000, 'Ogun', 'Sango Ota', 'available'),
    (owner, 'sample-welding-plant-ijebu-ogun',
      'Welding plant and cutting torch', 'tools',
      'Arc plant plus oxy-cutting torch (no gas). Pickup in Ijebu Ode. Deposit required for the torch.',
      'fair', 9000, 45000, 'Ogun', 'Ijebu Ode', 'available'),
    (owner, 'sample-electrical-testers-magboro-ogun',
      'Electrical testers and cable roller', 'tools',
      'Megger, socket tester, cable roller and a drill. Pickup near Magboro bus stop.',
      'good', 7000, 35000, 'Ogun', 'Magboro', 'available'),
    (owner, 'sample-tailoring-kit-abeokuta-ogun',
      'Tailoring steam iron and mannequin', 'tools',
      'Industrial steam iron, board and a full-size dress form. Pair it with your own machine or rent ours separately.',
      'like_new', 5000, 25000, 'Ogun', 'Abeokuta', 'available'),

    -- Oyo
    (owner, 'sample-elepaq-2-5kva-ibadan-oyo',
      'Elepaq 2.5kVA generator', 'generators',
      'Small petrol generator for a room or kiosk. Pickup in Bodija.',
      'good', 9000, 45000, 'Oyo', 'Bodija', 'available'),
    (owner, 'sample-carpentry-kit-bodija-oyo',
      'Carpentry hand-tool and clamp kit', 'tools',
      'Chisels, hand planes, sash clamps and a spirit level. For site carpentry around Ibadan.',
      'good', 6000, 30000, 'Oyo', 'Bodija', 'available'),
    (owner, 'sample-cable-drill-iwo-road-oyo',
      'Electrical drill and cable puller', 'tools',
      'SDS drill, fish tape and a set of hole saws. Pickup on Iwo Road.',
      'like_new', 6500, 32000, 'Oyo', 'Ibadan', 'available'),
    (owner, 'sample-sewing-steam-ogbomosho-oyo',
      'Butterfly sewing machine and steam iron', 'tools',
      'Domestic/industrial hybrid machine plus steam iron. Pickup in Ogbomosho.',
      'good', 5500, 27000, 'Oyo', 'Ogbomosho', 'available'),
    (owner, 'sample-projector-ring-road-oyo',
      'Projector and 80-inch screen', 'electronics',
      'Portable projector, HDMI and a pull-up screen. Good for churches and halls on Ring Road.',
      'good', 10000, 50000, 'Oyo', 'Ibadan', 'available'),

    -- Port Harcourt
    (owner, 'sample-diesel-10kva-transamadi-ph',
      '10kVA diesel generator', 'generators',
      'Lister-style 10kVA for a small workshop or event. Pickup in Trans Amadi. You supply diesel.',
      'good', 35000, 180000, 'Port Harcourt', 'Trans Amadi', 'available'),
    (owner, 'sample-welding-cutting-gra-ph',
      'Welding generator and cutting set', 'tools',
      'Engine-driven welder plus cutting torch (no gas). For fabrication yards around GRA and Trans Amadi.',
      'good', 18000, 90000, 'Port Harcourt', 'GRA', 'available'),
    (owner, 'sample-rollup-backdrop-rumuola-ph',
      'Roll-up banners and backdrop stand', 'events',
      'Two roll-ups and an 8ft backdrop frame. You bring printed media. Pickup in Rumuola.',
      'like_new', 6000, 28000, 'Port Harcourt', 'Rumuola', 'available'),
    (owner, 'sample-pa-speakers-gra-ph',
      'PA speakers and mixer', 'electronics',
      'Pair of active speakers, mixer and two mics. For a small hall or outdoor programme.',
      'good', 15000, 75000, 'Port Harcourt', 'GRA', 'available')
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    condition = excluded.condition,
    price_per_day = excluded.price_per_day,
    price_per_week = excluded.price_per_week,
    pickup_city = excluded.pickup_city,
    pickup_area = excluded.pickup_area,
    status = 'available',
    lender_id = owner,
    updated_at = now();

  delete from public.item_media
  where item_id in (select id from public.items where slug like 'sample-%' and lender_id = owner);

  insert into public.item_media (item_id, url, sort_order)
  select i.id, v.url, 0
  from public.items i
  join (
    values
      ('sample-elepaq-3-5kva-ikeja-lagos', '/images/listing-ikoyi.jpg'),
      ('sample-table-saw-yaba-lagos', '/images/listing-gwarinpa.jpg'),
      ('sample-arc-welder-isolo-lagos', '/images/listing-lekki.jpg'),
      ('sample-electrical-kit-ikeja-lagos', '/images/listing-ikoyi.jpg'),
      ('sample-industrial-sewing-surulere-lagos', '/images/listing-gwarinpa.jpg'),
      ('sample-epson-projector-lekki-lagos', '/images/listing-lekki.jpg'),
      ('sample-tiger-5kva-gwarinpa-abuja', '/images/listing-gwarinpa.jpg'),
      ('sample-planer-router-wuse-abuja', '/images/listing-ikoyi.jpg'),
      ('sample-mig-welder-idu-abuja', '/images/listing-lekki.jpg'),
      ('sample-overlock-wuse-abuja', '/images/listing-gwarinpa.jpg'),
      ('sample-rollup-banners-jabi-abuja', '/images/mytenant-hero.jpg'),
      ('sample-firman-3-5kva-abeokuta-ogun', '/images/listing-ikoyi.jpg'),
      ('sample-thicknesser-sango-ogun', '/images/listing-gwarinpa.jpg'),
      ('sample-welding-plant-ijebu-ogun', '/images/listing-lekki.jpg'),
      ('sample-electrical-testers-magboro-ogun', '/images/listing-ikoyi.jpg'),
      ('sample-tailoring-kit-abeokuta-ogun', '/images/listing-gwarinpa.jpg'),
      ('sample-elepaq-2-5kva-ibadan-oyo', '/images/listing-ikoyi.jpg'),
      ('sample-carpentry-kit-bodija-oyo', '/images/listing-gwarinpa.jpg'),
      ('sample-cable-drill-iwo-road-oyo', '/images/listing-lekki.jpg'),
      ('sample-sewing-steam-ogbomosho-oyo', '/images/listing-gwarinpa.jpg'),
      ('sample-projector-ring-road-oyo', '/images/listing-lekki.jpg'),
      ('sample-diesel-10kva-transamadi-ph', '/images/listing-gwarinpa.jpg'),
      ('sample-welding-cutting-gra-ph', '/images/listing-lekki.jpg'),
      ('sample-rollup-backdrop-rumuola-ph', '/images/mytenant-hero.jpg'),
      ('sample-pa-speakers-gra-ph', '/images/listing-ikoyi.jpg')
  ) as v(slug, url) on i.slug = v.slug
  where i.lender_id = owner;
end
$$;
