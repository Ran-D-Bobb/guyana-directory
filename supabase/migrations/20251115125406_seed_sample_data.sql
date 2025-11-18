-- Insert sample regions for Guyana
INSERT INTO regions (name, slug, type) VALUES
  ('Georgetown', 'georgetown', 'city'),
  ('New Amsterdam', 'new-amsterdam', 'city'),
  ('Linden', 'linden', 'city'),
  ('Anna Regina', 'anna-regina', 'town'),
  ('Bartica', 'bartica', 'town'),
  ('Demerara-Mahaica', 'demerara-mahaica', 'region'),
  ('East Berbice-Corentyne', 'east-berbice-corentyne', 'region'),
  ('Upper Demerara-Berbice', 'upper-demerara-berbice', 'region'),
  ('Essequibo Islands-West Demerara', 'essequibo-islands-west-demerara', 'region'),
  ('Mahaica-Berbice', 'mahaica-berbice', 'region');

-- Insert sample businesses
-- Get category and region IDs for use in business inserts
DO $$
DECLARE
  restaurant_cat_id UUID;
  grocery_cat_id UUID;
  beauty_cat_id UUID;
  georgetown_id UUID;
  new_amsterdam_id UUID;
  linden_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO restaurant_cat_id FROM categories WHERE slug = 'restaurants-dining' LIMIT 1;
  SELECT id INTO grocery_cat_id FROM categories WHERE slug = 'grocery-supermarkets' LIMIT 1;
  SELECT id INTO beauty_cat_id FROM categories WHERE slug = 'beauty-personal-care' LIMIT 1;
  
  -- Get region IDs
  SELECT id INTO georgetown_id FROM regions WHERE slug = 'georgetown' LIMIT 1;
  SELECT id INTO new_amsterdam_id FROM regions WHERE slug = 'new-amsterdam' LIMIT 1;
  SELECT id INTO linden_id FROM regions WHERE slug = 'linden' LIMIT 1;

  -- Insert sample businesses
  INSERT INTO businesses (name, slug, description, phone, whatsapp_number, email, website, address, category_id, region_id, is_verified, is_featured, hours) VALUES
  (
    'The Fire Grill Restaurant',
    'the-fire-grill-restaurant',
    'Authentic Guyanese cuisine with a modern twist. Known for our pepper pot and cook-up rice. Family-friendly atmosphere with outdoor seating.',
    '592-222-1234',
    '5922221234',
    'info@firegrill.gy',
    'https://firegrill.gy',
    '123 Main Street, Georgetown',
    restaurant_cat_id,
    georgetown_id,
    true,
    true,
    '{"monday": {"open": "11:00", "close": "22:00", "closed": false}, "tuesday": {"open": "11:00", "close": "22:00", "closed": false}, "wednesday": {"open": "11:00", "close": "22:00", "closed": false}, "thursday": {"open": "11:00", "close": "22:00", "closed": false}, "friday": {"open": "11:00", "close": "23:00", "closed": false}, "saturday": {"open": "11:00", "close": "23:00", "closed": false}, "sunday": {"open": "12:00", "close": "21:00", "closed": false}}'::jsonb
  ),
  (
    'Quick Bite Cafe',
    'quick-bite-cafe',
    'Perfect spot for breakfast and lunch. Fresh coffee, pastries, and sandwiches made daily. Free WiFi available.',
    '592-222-5678',
    '5922225678',
    'hello@quickbite.gy',
    null,
    '456 Robb Street, Georgetown',
    restaurant_cat_id,
    georgetown_id,
    true,
    false,
    '{"monday": {"open": "07:00", "close": "17:00", "closed": false}, "tuesday": {"open": "07:00", "close": "17:00", "closed": false}, "wednesday": {"open": "07:00", "close": "17:00", "closed": false}, "thursday": {"open": "07:00", "close": "17:00", "closed": false}, "friday": {"open": "07:00", "close": "17:00", "closed": false}, "saturday": {"open": "08:00", "close": "15:00", "closed": false}, "sunday": {"closed": true}}'::jsonb
  ),
  (
    'Golden Star Supermarket',
    'golden-star-supermarket',
    'Your one-stop shop for groceries and household items. Fresh produce, meat, dairy, and imported goods. Weekly specials!',
    '592-333-1111',
    '5923331111',
    'contact@goldenstar.gy',
    null,
    '789 Water Street, Georgetown',
    grocery_cat_id,
    georgetown_id,
    true,
    true,
    '{"monday": {"open": "08:00", "close": "20:00", "closed": false}, "tuesday": {"open": "08:00", "close": "20:00", "closed": false}, "wednesday": {"open": "08:00", "close": "20:00", "closed": false}, "thursday": {"open": "08:00", "close": "20:00", "closed": false}, "friday": {"open": "08:00", "close": "21:00", "closed": false}, "saturday": {"open": "08:00", "close": "21:00", "closed": false}, "sunday": {"open": "09:00", "close": "18:00", "closed": false}}'::jsonb
  ),
  (
    'Beauty Plus Salon',
    'beauty-plus-salon',
    'Professional hair and beauty services. Specializing in braids, weaves, cuts, and color. Nail services also available.',
    '592-444-2222',
    '5924442222',
    null,
    null,
    '321 Sheriff Street, Georgetown',
    beauty_cat_id,
    georgetown_id,
    false,
    false,
    '{"monday": {"closed": true}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "friday": {"open": "09:00", "close": "19:00", "closed": false}, "saturday": {"open": "08:00", "close": "19:00", "closed": false}, "sunday": {"open": "10:00", "close": "16:00", "closed": false}}'::jsonb
  ),
  (
    'Riverside Restaurant',
    'riverside-restaurant',
    'Scenic waterfront dining with fresh seafood and local favorites. Live music on weekends. Perfect for special occasions.',
    '592-555-3333',
    '5925553333',
    'reservations@riverside.gy',
    'https://riverside.gy',
    '10 Strand, New Amsterdam',
    restaurant_cat_id,
    new_amsterdam_id,
    true,
    true,
    '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "22:00", "closed": false}, "wednesday": {"open": "11:30", "close": "22:00", "closed": false}, "thursday": {"open": "11:30", "close": "22:00", "closed": false}, "friday": {"open": "11:30", "close": "23:00", "closed": false}, "saturday": {"open": "11:30", "close": "23:00", "closed": false}, "sunday": {"open": "12:00", "close": "21:00", "closed": false}}'::jsonb
  ),
  (
    'Linden Grocers',
    'linden-grocers',
    'Community grocery store serving Linden for over 20 years. Competitive prices and friendly service.',
    '592-666-4444',
    '5926664444',
    null,
    null,
    'Mackenzie, Linden',
    grocery_cat_id,
    linden_id,
    false,
    false,
    '{"monday": {"open": "07:00", "close": "19:00", "closed": false}, "tuesday": {"open": "07:00", "close": "19:00", "closed": false}, "wednesday": {"open": "07:00", "close": "19:00", "closed": false}, "thursday": {"open": "07:00", "close": "19:00", "closed": false}, "friday": {"open": "07:00", "close": "19:00", "closed": false}, "saturday": {"open": "07:00", "close": "20:00", "closed": false}, "sunday": {"open": "08:00", "close": "17:00", "closed": false}}'::jsonb
  );
END $$;
