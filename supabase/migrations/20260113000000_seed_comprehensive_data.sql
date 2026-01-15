-- Comprehensive Seed Data Migration
-- Creates auth users first, then seeds all tables in dependency order
-- Date: 2026-01-13

-- ============================================
-- 1. CREATE AUTH USERS (Required for FKs)
-- ============================================

-- User 1: General landlord/business owner
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'owner1@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- User 2: Event organizer
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'events@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- User 3: Tourism operator
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'tourism@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- User 4: Second landlord
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'landlord2@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- User 5: Business owner 2
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'business2@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE PROFILES FOR USERS
-- ============================================

INSERT INTO profiles (id, name, email, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'John Smith', 'owner1@example.com', '592-600-1111'),
  ('22222222-2222-2222-2222-222222222222', 'Sarah Johnson', 'events@example.com', '592-600-2222'),
  ('33333333-3333-3333-3333-333333333333', 'Michael Brown', 'tourism@example.com', '592-600-3333'),
  ('44444444-4444-4444-4444-444444444444', 'Emily Davis', 'landlord2@example.com', '592-600-4444'),
  ('55555555-5555-5555-5555-555555555555', 'David Wilson', 'business2@example.com', '592-600-5555')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. SEED REGIONS (if not exists)
-- ============================================

INSERT INTO regions (name, slug, type, latitude, longitude) VALUES
  ('Georgetown', 'georgetown', 'city', 6.8013, -58.1551),
  ('New Amsterdam', 'new-amsterdam', 'city', 6.2426, -57.5120),
  ('Linden', 'linden', 'city', 6.0019, -58.3039),
  ('Anna Regina', 'anna-regina', 'town', 7.2622, -58.4933),
  ('Bartica', 'bartica', 'town', 6.4030, -58.6219),
  ('Lethem', 'lethem', 'town', 3.3803, -59.7968),
  ('Corriverton', 'corriverton', 'town', 5.8833, -57.1667),
  ('Rose Hall', 'rose-hall', 'town', 6.2667, -57.3500),
  ('Demerara-Mahaica', 'demerara-mahaica', 'region', 6.7500, -58.1000),
  ('East Berbice-Corentyne', 'east-berbice-corentyne', 'region', 5.8500, -57.3500),
  ('Upper Demerara-Berbice', 'upper-demerara-berbice', 'region', 5.5000, -58.0000),
  ('Essequibo Islands-West Demerara', 'essequibo-islands-west-demerara', 'region', 6.8000, -58.4000),
  ('Mahaica-Berbice', 'mahaica-berbice', 'region', 6.2500, -57.6500),
  ('Upper Takutu-Upper Essequibo', 'upper-takutu-upper-essequibo', 'region', 3.4000, -59.0000),
  ('Pomeroon-Supenaam', 'pomeroon-supenaam', 'region', 7.0000, -58.6000),
  ('Cuyuni-Mazaruni', 'cuyuni-mazaruni', 'region', 6.2000, -59.5000),
  ('Potaro-Siparuni', 'potaro-siparuni', 'region', 4.9000, -59.3000),
  ('Barima-Waini', 'barima-waini', 'region', 7.5000, -59.8000)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. SEED BUSINESS CATEGORIES (if not exists)
-- ============================================

INSERT INTO categories (name, slug, icon, description) VALUES
  ('Restaurants & Dining', 'restaurants-dining', 'UtensilsCrossed', 'Restaurants, cafes, fast food, and dining establishments'),
  ('Grocery & Supermarkets', 'grocery-supermarkets', 'ShoppingCart', 'Supermarkets, grocery stores, and food markets'),
  ('Beauty & Personal Care', 'beauty-personal-care', 'Scissors', 'Salons, barbershops, spas, and beauty services'),
  ('Health & Medical', 'health-medical', 'Stethoscope', 'Doctors, clinics, pharmacies, and medical services'),
  ('Automotive Services', 'automotive-services', 'Car', 'Auto repair, car wash, mechanics, and vehicle services'),
  ('Home & Garden', 'home-garden', 'Home', 'Hardware stores, furniture, home improvement, and gardening'),
  ('Construction & Trades', 'construction-trades', 'Hammer', 'Contractors, electricians, plumbers, and construction services'),
  ('Technology & Electronics', 'technology-electronics', 'Laptop', 'Computer repair, phone shops, IT services, and electronics'),
  ('Fashion & Clothing', 'fashion-clothing', 'Shirt', 'Clothing stores, boutiques, and fashion retailers'),
  ('Education & Training', 'education-training', 'GraduationCap', 'Schools, tutoring, training centers, and educational services'),
  ('Professional Services', 'professional-services', 'Briefcase', 'Lawyers, accountants, consultants, and business services'),
  ('Entertainment & Events', 'entertainment-events', 'PartyPopper', 'Event planning, DJ services, entertainment venues'),
  ('Fitness & Sports', 'fitness-sports', 'Dumbbell', 'Gyms, fitness centers, sports facilities, and training'),
  ('Pet Services', 'pet-services', 'PawPrint', 'Veterinarians, pet stores, grooming, and pet care'),
  ('Real Estate', 'real-estate', 'Building2', 'Real estate agents, property rentals, and housing services'),
  ('Financial Services', 'financial-services', 'Banknote', 'Banks, insurance, cambios, and financial advisors'),
  ('Hospitality & Lodging', 'hospitality-lodging', 'Hotel', 'Hotels, guesthouses, and accommodation services'),
  ('Transportation & Logistics', 'transportation-logistics', 'Truck', 'Courier services, moving companies, and delivery services'),
  ('Photography & Media', 'photography-media', 'Camera', 'Photographers, videographers, and media production'),
  ('Other Services', 'other-services', 'MoreHorizontal', 'Miscellaneous services and businesses')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 5. SEED EVENT CATEGORIES (if not exists)
-- ============================================

INSERT INTO event_categories (name, slug, icon) VALUES
  ('Concert', 'concert', 'Music'),
  ('Workshop', 'workshop', 'GraduationCap'),
  ('Community', 'community', 'Users'),
  ('Festival', 'festival', 'PartyPopper'),
  ('Sports', 'sports', 'Trophy'),
  ('Business Networking', 'business-networking', 'Briefcase'),
  ('Food & Drink', 'food-drink', 'Utensils'),
  ('Art & Culture', 'art-culture', 'Palette'),
  ('Charity', 'charity', 'Heart'),
  ('Nightlife', 'nightlife', 'Moon'),
  ('Family', 'family', 'Users'),
  ('Other', 'other', 'Calendar')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. SEED RENTAL CATEGORIES (if not exists)
-- ============================================

INSERT INTO rental_categories (name, slug, icon, description, display_order) VALUES
  ('Apartments', 'apartments', 'Building2', 'Modern apartments and flats for rent', 1),
  ('Houses', 'houses', 'Home', 'Single-family homes and townhouses', 2),
  ('Vacation Homes', 'vacation-homes', 'Palmtree', 'Short-term vacation rentals', 3),
  ('Room Rentals', 'room-rentals', 'BedDouble', 'Single rooms in shared accommodations', 4),
  ('Office Spaces', 'office-spaces', 'Briefcase', 'Commercial office spaces', 5),
  ('Commercial', 'commercial', 'Store', 'Retail spaces and warehouses', 6),
  ('Shared Housing', 'shared-housing', 'Users', 'Shared apartments with roommates', 7),
  ('Land', 'land', 'Mountain', 'Residential and commercial land', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 7. SEED TOURISM CATEGORIES (if not exists)
-- ============================================

INSERT INTO tourism_categories (name, slug, icon, description, display_order) VALUES
  ('Nature & Wildlife', 'nature-wildlife', 'Trees', 'Rainforests, waterfalls, and wildlife', 1),
  ('Adventure Activities', 'adventure', 'Activity', 'Hiking, kayaking, and expeditions', 2),
  ('Cultural Experiences', 'culture', 'Users', 'Indigenous villages and traditions', 3),
  ('Eco-Lodges & Stays', 'eco-lodges', 'Home', 'Sustainable accommodations', 4),
  ('Tours & Guides', 'tours-guides', 'Map', 'Professional guided tours', 5),
  ('Water Activities', 'water-activities', 'Waves', 'River cruises and fishing', 6),
  ('Food & Culinary', 'food-culinary', 'Utensils', 'Local cuisine and food tours', 7),
  ('Historical & Heritage', 'history-heritage', 'Landmark', 'Museums and colonial architecture', 8),
  ('Photography Tours', 'photography', 'Camera', 'Photo expeditions', 9),
  ('Bird Watching', 'bird-watching', 'Bird', 'World-class birding tours', 10),
  ('Multi-Day Expeditions', 'expeditions', 'Compass', 'Extended adventure packages', 11),
  ('Airport & Transfers', 'transfers', 'Car', 'Transportation services', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 8. SEED BUSINESSES
-- ============================================

INSERT INTO businesses (
  name, slug, description, phone, email, website, address,
  category_id, region_id, owner_id,
  is_verified, is_featured, rating, review_count, view_count,
  latitude, longitude, hours
) VALUES
-- Restaurant 1
(
  'Oasis Cafe',
  'oasis-cafe-georgetown',
  'Trendy cafe serving artisan coffee, fresh pastries, and healthy breakfast options. Free WiFi and cozy atmosphere perfect for remote work.',
  '592-225-1234',
  'hello@oasiscafe.gy',
  'https://oasiscafe.gy',
  '45 Robb Street, Georgetown',
  (SELECT id FROM categories WHERE slug = 'restaurants-dining'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '11111111-1111-1111-1111-111111111111',
  true, true, 4.5, 23, 456,
  6.8045, -58.1553,
  '{"monday": {"open": "07:00", "close": "18:00"}, "tuesday": {"open": "07:00", "close": "18:00"}, "wednesday": {"open": "07:00", "close": "18:00"}, "thursday": {"open": "07:00", "close": "18:00"}, "friday": {"open": "07:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "16:00"}, "sunday": {"closed": true}}'::jsonb
),
-- Restaurant 2
(
  'Backyard BBQ Grill',
  'backyard-bbq-grill',
  'Authentic Caribbean BBQ with smoked meats, jerk chicken, and local sides. Family-friendly with outdoor seating and live music on weekends.',
  '592-226-5678',
  'info@backyardbbq.gy',
  NULL,
  '123 Sheriff Street, Georgetown',
  (SELECT id FROM categories WHERE slug = 'restaurants-dining'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '55555555-5555-5555-5555-555555555555',
  true, true, 4.7, 45, 892,
  6.8123, -58.1489,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'::jsonb
),
-- Grocery Store
(
  'Fresh Mart Supermarket',
  'fresh-mart-supermarket',
  'Full-service supermarket with fresh produce, imported goods, and household essentials. Weekly specials and loyalty program available.',
  '592-227-9012',
  'shop@freshmart.gy',
  'https://freshmart.gy',
  '78 Camp Street, Georgetown',
  (SELECT id FROM categories WHERE slug = 'grocery-supermarkets'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '11111111-1111-1111-1111-111111111111',
  true, false, 4.2, 67, 1234,
  6.8067, -58.1612,
  '{"monday": {"open": "08:00", "close": "21:00"}, "tuesday": {"open": "08:00", "close": "21:00"}, "wednesday": {"open": "08:00", "close": "21:00"}, "thursday": {"open": "08:00", "close": "21:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "09:00", "close": "18:00"}}'::jsonb
),
-- Beauty Salon
(
  'Glamour Studio Salon',
  'glamour-studio-salon',
  'Full-service beauty salon offering hair styling, braids, weaves, manicures, and makeup services. Experienced stylists and relaxing atmosphere.',
  '592-228-3456',
  'book@glamourstudio.gy',
  NULL,
  '56 Middle Street, Georgetown',
  (SELECT id FROM categories WHERE slug = 'beauty-personal-care'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '55555555-5555-5555-5555-555555555555',
  true, true, 4.8, 89, 567,
  6.8089, -58.1534,
  '{"monday": {"closed": true}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "19:00"}, "saturday": {"open": "08:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "15:00"}}'::jsonb
),
-- Auto Services
(
  'QuickFix Auto Repair',
  'quickfix-auto-repair',
  'Reliable auto repair and maintenance services. Specializing in Japanese and American vehicles. Free estimates and honest pricing.',
  '592-229-7890',
  'service@quickfixauto.gy',
  NULL,
  '234 East Coast Road, Georgetown',
  (SELECT id FROM categories WHERE slug = 'automotive-services'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '11111111-1111-1111-1111-111111111111',
  true, false, 4.4, 34, 289,
  6.8156, -58.1423,
  '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "17:00"}, "saturday": {"open": "08:00", "close": "13:00"}, "sunday": {"closed": true}}'::jsonb
),
-- Gym
(
  'PowerHouse Fitness',
  'powerhouse-fitness-gym',
  'Modern gym with cardio equipment, free weights, and group fitness classes. Personal training available. AC throughout.',
  '592-230-1234',
  'join@powerhousegy.com',
  'https://powerhousegy.com',
  '89 Vlissengen Road, Georgetown',
  (SELECT id FROM categories WHERE slug = 'fitness-sports'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '55555555-5555-5555-5555-555555555555',
  true, true, 4.6, 56, 678,
  6.8034, -58.1567,
  '{"monday": {"open": "05:00", "close": "22:00"}, "tuesday": {"open": "05:00", "close": "22:00"}, "wednesday": {"open": "05:00", "close": "22:00"}, "thursday": {"open": "05:00", "close": "22:00"}, "friday": {"open": "05:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "18:00"}}'::jsonb
),
-- Tech Shop
(
  'TechZone Electronics',
  'techzone-electronics',
  'Electronics store and repair center. Phones, laptops, accessories, and expert repair services. Authorized dealer for major brands.',
  '592-231-5678',
  'sales@techzone.gy',
  NULL,
  '12 Regent Street, Georgetown',
  (SELECT id FROM categories WHERE slug = 'technology-electronics'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '11111111-1111-1111-1111-111111111111',
  true, false, 4.3, 78, 945,
  6.8078, -58.1598,
  '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "16:00"}, "sunday": {"closed": true}}'::jsonb
),
-- Restaurant in New Amsterdam
(
  'Riverside Seafood',
  'riverside-seafood-na',
  'Fresh seafood restaurant with river views. Specializing in local catch, curry dishes, and traditional Berbician cuisine.',
  '592-333-1234',
  'dine@riversideseafood.gy',
  NULL,
  '45 Strand, New Amsterdam',
  (SELECT id FROM categories WHERE slug = 'restaurants-dining'),
  (SELECT id FROM regions WHERE slug = 'new-amsterdam'),
  '55555555-5555-5555-5555-555555555555',
  true, true, 4.6, 34, 456,
  6.2456, -57.5089,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:00", "close": "21:00"}, "wednesday": {"open": "11:00", "close": "21:00"}, "thursday": {"open": "11:00", "close": "21:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'::jsonb
),
-- Hardware Store in Linden
(
  'Builders Hardware Depot',
  'builders-hardware-depot-linden',
  'Complete hardware and building supplies. Lumber, cement, tools, plumbing, and electrical supplies. Delivery available.',
  '592-444-5678',
  'sales@buildershardware.gy',
  NULL,
  '67 Mackenzie, Linden',
  (SELECT id FROM categories WHERE slug = 'home-garden'),
  (SELECT id FROM regions WHERE slug = 'linden'),
  '11111111-1111-1111-1111-111111111111',
  true, false, 4.1, 23, 345,
  6.0045, -58.3012,
  '{"monday": {"open": "07:00", "close": "17:00"}, "tuesday": {"open": "07:00", "close": "17:00"}, "wednesday": {"open": "07:00", "close": "17:00"}, "thursday": {"open": "07:00", "close": "17:00"}, "friday": {"open": "07:00", "close": "17:00"}, "saturday": {"open": "07:00", "close": "14:00"}, "sunday": {"closed": true}}'::jsonb
),
-- Hotel
(
  'Palm Court Hotel',
  'palm-court-hotel',
  'Boutique hotel in central Georgetown. Comfortable rooms, restaurant, pool, and conference facilities. Airport transfers available.',
  '592-225-9999',
  'reservations@palmcourt.gy',
  'https://palmcourt.gy',
  '35 Main Street, Georgetown',
  (SELECT id FROM categories WHERE slug = 'hospitality-lodging'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '55555555-5555-5555-5555-555555555555',
  true, true, 4.5, 89, 1567,
  6.8034, -58.1623,
  '{"monday": {"open": "00:00", "close": "23:59"}, "tuesday": {"open": "00:00", "close": "23:59"}, "wednesday": {"open": "00:00", "close": "23:59"}, "thursday": {"open": "00:00", "close": "23:59"}, "friday": {"open": "00:00", "close": "23:59"}, "saturday": {"open": "00:00", "close": "23:59"}, "sunday": {"open": "00:00", "close": "23:59"}}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 9. SEED EVENTS
-- ============================================

INSERT INTO events (
  user_id, title, slug, description,
  start_date, end_date, location,
  category_id, region_id,
  is_featured, view_count, interest_count,
  latitude, longitude, email
) VALUES
-- Weekend Festival
(
  '22222222-2222-2222-2222-222222222222',
  'Georgetown Music Festival 2026',
  'georgetown-music-festival-2026',
  'Annual music festival featuring local and international artists. Multiple stages, food vendors, and family activities. Three days of non-stop entertainment!',
  '2026-02-14 16:00:00+00',
  '2026-02-16 23:00:00+00',
  'National Park, Georgetown',
  (SELECT id FROM event_categories WHERE slug = 'festival'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  true, 2345, 567,
  6.8123, -58.1534,
  'info@gtmusicfest.gy'
),
-- Business Workshop
(
  '22222222-2222-2222-2222-222222222222',
  'Entrepreneur Workshop: Starting Your Business',
  'entrepreneur-workshop-jan-2026',
  'Learn the essentials of starting a business in Guyana. Topics include registration, financing, marketing, and legal requirements. Networking session included.',
  '2026-01-25 09:00:00+00',
  '2026-01-25 16:00:00+00',
  'Pegasus Hotel, Georgetown',
  (SELECT id FROM event_categories WHERE slug = 'workshop'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  true, 234, 89,
  6.8067, -58.1578,
  'workshops@bizgy.com'
),
-- Sports Event
(
  '22222222-2222-2222-2222-222222222222',
  'Guyana Cricket Cup Final',
  'guyana-cricket-cup-final-2026',
  'The exciting final of the Guyana Cricket Cup. Come support your favorite team! Food and beverages available.',
  '2026-02-08 13:00:00+00',
  '2026-02-08 20:00:00+00',
  'Providence Stadium',
  (SELECT id FROM event_categories WHERE slug = 'sports'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  true, 1234, 456,
  6.7856, -58.1423,
  'tickets@guyanacricket.gy'
),
-- Food Festival
(
  '22222222-2222-2222-2222-222222222222',
  'Taste of Guyana Food Fair',
  'taste-of-guyana-food-fair-2026',
  'Celebrate Guyanese cuisine with dishes from all regions. Local vendors, cooking demonstrations, and eating competitions!',
  '2026-03-01 10:00:00+00',
  '2026-03-01 21:00:00+00',
  'Stabroek Market Square',
  (SELECT id FROM event_categories WHERE slug = 'food-drink'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  true, 567, 234,
  6.8012, -58.1645,
  'info@tasteofguyana.gy'
),
-- Art Exhibition
(
  '22222222-2222-2222-2222-222222222222',
  'Contemporary Guyanese Art Exhibition',
  'contemporary-art-exhibition-2026',
  'Featuring works by emerging Guyanese artists. Paintings, sculptures, and mixed media. Opening night reception with artists.',
  '2026-01-20 18:00:00+00',
  '2026-02-20 17:00:00+00',
  'Castellani House, Georgetown',
  (SELECT id FROM event_categories WHERE slug = 'art-culture'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  false, 189, 67,
  6.8134, -58.1512,
  'gallery@castellanihouse.gy'
),
-- Community Event
(
  '22222222-2222-2222-2222-222222222222',
  'Georgetown Beach Cleanup',
  'georgetown-beach-cleanup-jan-2026',
  'Join us for a community beach cleanup! Help keep our coastline beautiful. Gloves and bags provided. Refreshments for all volunteers.',
  '2026-01-18 07:00:00+00',
  '2026-01-18 12:00:00+00',
  'Seawall, Georgetown',
  (SELECT id FROM event_categories WHERE slug = 'community'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  false, 123, 45,
  6.8234, -58.1389,
  'volunteer@cleangy.org'
),
-- Concert
(
  '22222222-2222-2222-2222-222222222222',
  'Reggae Night Live',
  'reggae-night-live-feb-2026',
  'Live reggae music featuring top Caribbean artists. Outdoor venue with great vibes, food, and drinks.',
  '2026-02-21 19:00:00+00',
  '2026-02-21 23:59:00+00',
  'Palm Court, Georgetown',
  (SELECT id FROM event_categories WHERE slug = 'concert'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  true, 456, 189,
  6.8034, -58.1623,
  'tickets@reggaenightgy.com'
),
-- New Amsterdam Event
(
  '22222222-2222-2222-2222-222222222222',
  'Berbice Expo 2026',
  'berbice-expo-2026',
  'Annual trade and cultural expo showcasing Berbice businesses, agriculture, and heritage. Entertainment and activities for all ages.',
  '2026-03-15 09:00:00+00',
  '2026-03-17 21:00:00+00',
  'New Amsterdam Sports Ground',
  (SELECT id FROM event_categories WHERE slug = 'community'),
  (SELECT id FROM regions WHERE slug = 'new-amsterdam'),
  true, 345, 123,
  6.2478, -57.5123,
  'info@berbiceexpo.gy'
),
-- Charity Event
(
  '22222222-2222-2222-2222-222222222222',
  'Charity Fun Run 5K',
  'charity-fun-run-5k-2026',
  'Run or walk for a good cause! Proceeds support children education programs. T-shirt and medal for all participants.',
  '2026-02-01 06:00:00+00',
  '2026-02-01 10:00:00+00',
  'Promenade Gardens, Georgetown',
  (SELECT id FROM event_categories WHERE slug = 'charity'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  false, 234, 78,
  6.8156, -58.1534,
  'run@charitygy.org'
),
-- Linden Event
(
  '22222222-2222-2222-2222-222222222222',
  'Linden Town Week Celebrations',
  'linden-town-week-2026',
  'Week-long celebration of Linden Town. Parades, concerts, sports, and cultural events throughout the week.',
  '2026-05-01 09:00:00+00',
  '2026-05-07 23:00:00+00',
  'Various Locations, Linden',
  (SELECT id FROM event_categories WHERE slug = 'festival'),
  (SELECT id FROM regions WHERE slug = 'linden'),
  true, 567, 234,
  6.0019, -58.3039,
  'info@lindentownweek.gy'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 10. SEED RENTALS
-- Disable trigger first to allow multiple rentals per user
-- ============================================

DROP TRIGGER IF EXISTS trigger_check_rental_listing_limit ON rentals;

INSERT INTO rentals (
  landlord_id, name, slug, description, property_type,
  category_id, region_id,
  address, location_details,
  bedrooms, bathrooms, max_guests, square_feet,
  price_per_night, price_per_week, price_per_month, security_deposit,
  amenities, utilities_included, house_rules,
  phone, email,
  is_approved, is_featured, view_count, inquiry_count,
  latitude, longitude
) VALUES
-- Apartment 1
(
  '11111111-1111-1111-1111-111111111111',
  'Modern 2BR Apartment in Bel Air',
  'modern-2br-bel-air-seed',
  'Beautiful modern apartment in quiet Bel Air neighborhood. Features AC, WiFi, secure parking, and fully equipped kitchen. Perfect for professionals or small families.',
  'apartment',
  (SELECT id FROM rental_categories WHERE slug = 'apartments'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '45 Bel Air Gardens, Georgetown',
  'Near Bel Air Park, 5 mins from downtown',
  2, 1.5, 4, 1200,
  NULL, NULL, 180000, 180000,
  '["wifi", "ac", "parking", "kitchen", "tv", "hot_water", "furnished", "security"]'::jsonb,
  '["water", "internet"]'::jsonb,
  '["no_smoking", "no_pets"]'::jsonb,
  '592-600-1001',
  'rentals@example.com',
  true, true, 234, 45,
  6.8089, -58.1523
),
-- Apartment 2
(
  '44444444-4444-4444-4444-444444444444',
  'Cozy Studio with WiFi - Kitty',
  'cozy-studio-kitty-seed',
  'Affordable studio apartment with high-speed WiFi included. Great for remote workers and students. Close to shops and restaurants.',
  'apartment',
  (SELECT id FROM rental_categories WHERE slug = 'apartments'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '78 Kitty Village, Georgetown',
  'Main road access, near markets',
  0, 1.0, 2, 450,
  NULL, NULL, 75000, 75000,
  '["wifi", "kitchen", "hot_water", "furnished"]'::jsonb,
  '["water", "internet", "electricity"]'::jsonb,
  '["no_smoking", "quiet_hours"]'::jsonb,
  '592-600-4001',
  'emily@rentals.gy',
  true, false, 156, 23,
  6.8145, -58.1478
),
-- House 1
(
  '11111111-1111-1111-1111-111111111111',
  'Spacious 4BR Family Home with Pool',
  'spacious-4br-pool-seed',
  'Large family home with private pool, AC throughout, and beautiful garden. Perfect for families. Gated community with 24/7 security.',
  'house',
  (SELECT id FROM rental_categories WHERE slug = 'houses'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '123 Prashad Nagar, Georgetown',
  'Gated community, premium location',
  4, 3.0, 8, 3500,
  NULL, NULL, 450000, 500000,
  '["wifi", "ac", "parking", "pool", "kitchen", "washer_dryer", "tv", "hot_water", "furnished", "security", "generator", "yard"]'::jsonb,
  '["water"]'::jsonb,
  '["no_smoking"]'::jsonb,
  '592-600-1002',
  'premium@rentals.gy',
  true, true, 567, 89,
  6.8012, -58.1634
),
-- Room Rental
(
  '44444444-4444-4444-4444-444444444444',
  'Affordable Room in Shared House',
  'affordable-room-linden-seed',
  'Clean and comfortable room in a shared house. Shared kitchen and bathroom. WiFi included. Great for students and young professionals.',
  'room',
  (SELECT id FROM rental_categories WHERE slug = 'room-rentals'),
  (SELECT id FROM regions WHERE slug = 'linden'),
  '34 Mackenzie, Linden',
  'Central Linden, near town center',
  1, 1.0, 1, 200,
  NULL, NULL, 35000, 35000,
  '["wifi", "kitchen", "hot_water"]'::jsonb,
  '["water", "internet", "electricity"]'::jsonb,
  '["no_smoking", "no_pets", "quiet_hours"]'::jsonb,
  '592-600-4002',
  NULL,
  true, false, 78, 12,
  6.0034, -58.3023
),
-- Vacation Home
(
  '11111111-1111-1111-1111-111111111111',
  'Riverfront Vacation Retreat',
  'riverfront-retreat-bartica-seed',
  'Stunning riverfront property with breathtaking views. Perfect for weekend getaways. Features AC, WiFi, and private dock.',
  'vacation_home',
  (SELECT id FROM rental_categories WHERE slug = 'vacation-homes'),
  (SELECT id FROM regions WHERE slug = 'bartica'),
  'Essequibo River, Bartica',
  'Waterfront property, boat access',
  3, 2.0, 6, 2000,
  25000, 150000, 500000, 200000,
  '["wifi", "ac", "parking", "kitchen", "tv", "hot_water", "furnished", "generator", "yard"]'::jsonb,
  '["water"]'::jsonb,
  '["no_smoking", "no_parties"]'::jsonb,
  '592-600-1003',
  'vacation@rentals.gy',
  true, true, 456, 78,
  6.4078, -58.6234
),
-- Office Space
(
  '44444444-4444-4444-4444-444444444444',
  'Prime Office Space - Camp Street',
  'prime-office-camp-st-seed',
  'Professional office space in prime location. High-speed internet, AC, and 24/7 security. Perfect for startups and small businesses.',
  'office',
  (SELECT id FROM rental_categories WHERE slug = 'office-spaces'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '567 Camp Street, Georgetown',
  'Central Business District',
  0, 2.0, 10, 1500,
  NULL, NULL, 250000, 300000,
  '["wifi", "ac", "parking", "security", "elevator"]'::jsonb,
  '["water", "internet", "electricity"]'::jsonb,
  '[]'::jsonb,
  '592-600-4003',
  'office@rentals.gy',
  true, false, 123, 34,
  6.8056, -58.1612
),
-- House in New Amsterdam
(
  '11111111-1111-1111-1111-111111111111',
  'Family House with AC - New Amsterdam',
  'family-house-na-seed',
  'Comfortable 3-bedroom house with AC and covered parking. Large yard perfect for families with children. Quiet neighborhood.',
  'house',
  (SELECT id FROM rental_categories WHERE slug = 'houses'),
  (SELECT id FROM regions WHERE slug = 'new-amsterdam'),
  '78 Main Street, New Amsterdam',
  'Central location, near schools',
  3, 2.0, 6, 2200,
  NULL, NULL, 150000, 150000,
  '["ac", "parking", "kitchen", "tv", "hot_water", "furnished", "yard"]'::jsonb,
  '["water"]'::jsonb,
  '["no_smoking"]'::jsonb,
  '592-600-1004',
  NULL,
  true, false, 89, 15,
  6.2467, -57.5134
),
-- Budget Apartment
(
  '44444444-4444-4444-4444-444444444444',
  'Budget-Friendly 1BR Apartment',
  'budget-1br-bartica-seed',
  'Affordable 1-bedroom apartment. Basic amenities, perfect for budget-conscious renters in Bartica.',
  'apartment',
  (SELECT id FROM rental_categories WHERE slug = 'apartments'),
  (SELECT id FROM regions WHERE slug = 'bartica'),
  '23 Second Avenue, Bartica',
  'Near town center',
  1, 1.0, 2, 550,
  NULL, NULL, 55000, 55000,
  '["kitchen", "hot_water"]'::jsonb,
  '["water"]'::jsonb,
  '["no_smoking", "no_pets"]'::jsonb,
  '592-600-4004',
  NULL,
  true, false, 45, 8,
  6.4012, -58.6189
),
-- Executive Studio
(
  '11111111-1111-1111-1111-111111111111',
  'Executive Studio - Downtown GT',
  'executive-studio-downtown-seed',
  'Premium studio apartment with all amenities. WiFi, AC, and secure parking. Perfect for business travelers. Walking distance to downtown.',
  'apartment',
  (SELECT id FROM rental_categories WHERE slug = 'apartments'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '45 Water Street, Georgetown',
  'Near Stabroek Market, downtown',
  0, 1.0, 2, 500,
  12000, 70000, 120000, 120000,
  '["wifi", "ac", "parking", "kitchen", "tv", "hot_water", "furnished", "security", "washer_dryer"]'::jsonb,
  '["water", "internet", "electricity"]'::jsonb,
  '["no_smoking", "no_pets", "quiet_hours"]'::jsonb,
  '592-600-1005',
  'executive@rentals.gy',
  true, true, 234, 56,
  6.8023, -58.1656
),
-- Commercial Space
(
  '44444444-4444-4444-4444-444444444444',
  'Retail Space - Regent Street',
  'retail-space-regent-seed',
  'Prime retail location on busy Regent Street. High foot traffic, perfect for boutique or service business.',
  'commercial',
  (SELECT id FROM rental_categories WHERE slug = 'commercial'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '89 Regent Street, Georgetown',
  'High traffic area, main shopping district',
  0, 1.0, 0, 800,
  NULL, NULL, 300000, 400000,
  '["ac", "security"]'::jsonb,
  '["water"]'::jsonb,
  '[]'::jsonb,
  '592-600-4005',
  'commercial@rentals.gy',
  true, false, 67, 12,
  6.8078, -58.1589
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 11. SEED TOURISM EXPERIENCES
-- ============================================

INSERT INTO tourism_experiences (
  name, slug, description,
  tourism_category_id, region_id, operator_id,
  experience_type, duration, difficulty_level,
  group_size_min, group_size_max, age_requirement,
  location_details, meeting_point,
  phone, email, website,
  operator_name, operator_license,
  price_from, price_currency, price_notes,
  includes, excludes,
  available_months, best_season,
  booking_required, advance_booking_days,
  is_verified, is_featured, is_approved, is_tourism_authority_approved,
  accessibility_info, safety_requirements,
  what_to_bring, languages, tags,
  rating, review_count, view_count,
  latitude, longitude
) VALUES
-- Kaieteur Falls
(
  'Kaieteur Falls Day Trip',
  'kaieteur-falls-day-trip-seed',
  'Experience the world''s largest single-drop waterfall on this unforgettable day trip. Fly over pristine rainforest and witness the magnificent 741-foot cascade.',
  (SELECT id FROM tourism_categories WHERE slug = 'nature-wildlife'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '33333333-3333-3333-3333-333333333333',
  'tour', 'Full Day', 'easy',
  2, 12, 'All ages',
  'Kaieteur National Park, Potaro-Siparuni Region',
  'Ogle International Airport, Georgetown',
  '592-621-5555', 'info@kaietourtours.gy', 'https://kaietourtours.gy',
  'Kaietour Adventures', 'GTA-2024-001',
  45000, 'GYD', 'Per person',
  'Round-trip flight, Park entrance fees, Guided tour, Light refreshments',
  'Lunch, Personal expenses, Tips',
  ARRAY['Year-round'], 'Dry season (September - April)',
  true, 3,
  true, true, true, true,
  'Moderate walking required. Not wheelchair accessible.',
  'Follow guide instructions. Stay on marked paths.',
  ARRAY['Camera', 'Sunscreen', 'Hat', 'Water bottle', 'Light jacket'],
  ARRAY['English', 'Portuguese'],
  ARRAY['nature', 'photography', 'iconic', 'must-see', 'waterfall'],
  4.9, 156, 3456,
  5.1756, -59.4892
),
-- Iwokrama Canopy Walkway
(
  'Iwokrama Canopy Walkway Adventure',
  'iwokrama-canopy-walkway-seed',
  'Walk among the treetops on suspension bridges 30 meters above the forest floor. Spot exotic birds, monkeys, and experience the rainforest from above.',
  (SELECT id FROM tourism_categories WHERE slug = 'adventure'),
  (SELECT id FROM regions WHERE slug = 'upper-demerara-berbice'),
  '33333333-3333-3333-3333-333333333333',
  'activity', '3 hours', 'moderate',
  1, 15, '12+',
  'Iwokrama International Centre for Rainforest Conservation',
  'Iwokrama River Lodge',
  '592-677-5555', 'canopy@iwokrama.org', 'https://iwokrama.org',
  'Iwokrama International Centre', 'GTA-2024-002',
  8500, 'GYD', 'Per person',
  'Canopy walkway access, Safety equipment, Expert guide, Wildlife spotting',
  'Transportation to Iwokrama, Meals, Accommodation',
  ARRAY['Year-round'], 'Dawn and dusk for best wildlife viewing',
  true, 1,
  true, true, true, false,
  'Good physical fitness required. Not suitable for those with fear of heights.',
  'Safety harness provided and mandatory.',
  ARRAY['Comfortable walking shoes', 'Binoculars', 'Camera', 'Water', 'Insect repellent'],
  ARRAY['English', 'Spanish'],
  ARRAY['adventure', 'nature', 'wildlife', 'canopy', 'eco-tourism'],
  4.7, 89, 1234,
  4.6734, -58.8512
),
-- Georgetown Heritage Tour
(
  'Georgetown Colonial Heritage Walking Tour',
  'georgetown-heritage-tour-seed',
  'Discover Georgetown''s rich colonial history through its stunning wooden architecture, including St. George''s Cathedral, City Hall, and Stabroek Market.',
  (SELECT id FROM tourism_categories WHERE slug = 'history-heritage'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '33333333-3333-3333-3333-333333333333',
  'tour', '2.5 hours', 'easy',
  2, 20, 'All ages',
  'Central Georgetown, starting at St. George''s Cathedral',
  'St. George''s Cathedral main entrance',
  '592-624-5555', 'tours@georgetownheritage.gy', NULL,
  'Heritage Guyana Tours', 'GTA-2024-003',
  3500, 'GYD', 'Per person',
  'Professional guide, Historical insights, Photo opportunities, Water bottle',
  'Entrance fees to museums, Meals, Transportation',
  ARRAY['Year-round'], 'Morning tours recommended',
  false, 0,
  true, false, true, true,
  'Wheelchair accessible route available upon request.',
  'Sun protection recommended. Stay with group.',
  ARRAY['Comfortable walking shoes', 'Sun hat', 'Camera', 'Small umbrella'],
  ARRAY['English', 'Dutch', 'Portuguese'],
  ARRAY['history', 'culture', 'architecture', 'city-tour', 'photography'],
  4.5, 67, 890,
  6.8156, -58.1589
),
-- Rupununi Safari
(
  'Rupununi Savannah Wildlife Safari',
  'rupununi-wildlife-safari-seed',
  'Explore the vast Rupununi savannahs, home to giant anteaters, giant river otters, jaguars, and over 400 bird species. Experience authentic Amerindian culture.',
  (SELECT id FROM tourism_categories WHERE slug = 'expeditions'),
  (SELECT id FROM regions WHERE slug = 'upper-takutu-upper-essequibo'),
  '33333333-3333-3333-3333-333333333333',
  'tour', '4 days / 3 nights', 'moderate',
  4, 8, '16+',
  'Rupununi Savannah, Region 9',
  'Lethem Airport',
  '592-772-5555', 'safari@rupununiadventures.gy', 'https://rupununiadventures.gy',
  'Rupununi Trails', 'GTA-2024-004',
  125000, 'GYD', 'Per person (all-inclusive)',
  'All meals, Accommodation, Transportation, Guides, Village visits',
  'Flights to Lethem, Alcoholic beverages, Tips',
  ARRAY['Year-round'], 'Dry season (October - April)',
  true, 7,
  true, true, true, true,
  'Basic fitness required for nature walks.',
  'Malaria prevention recommended.',
  ARRAY['Light clothing', 'Hat', 'Sunscreen', 'Insect repellent', 'Binoculars', 'Camera'],
  ARRAY['English', 'Portuguese'],
  ARRAY['wildlife', 'safari', 'culture', 'indigenous', 'adventure', 'multi-day'],
  4.8, 45, 678,
  3.3803, -59.7968
),
-- Essequibo River Cruise
(
  'Essequibo River Sunset Cruise',
  'essequibo-sunset-cruise-seed',
  'Cruise along South America''s third-largest river while enjoying a spectacular sunset. Spot river dolphins, caimans, and numerous bird species.',
  (SELECT id FROM tourism_categories WHERE slug = 'water-activities'),
  (SELECT id FROM regions WHERE slug = 'bartica'),
  '33333333-3333-3333-3333-333333333333',
  'activity', '3 hours', 'easy',
  4, 25, 'All ages',
  'Essequibo River, departing from Bartica',
  'Bartica Stelling (Wharf)',
  '592-655-5555', 'cruises@essequiboriver.gy', NULL,
  'River Adventures Guyana', 'GTA-2024-005',
  6500, 'GYD', 'Per person',
  'River cruise, Snacks and beverages, Wildlife guide, Life jackets',
  'Transportation to Bartica, Dinner',
  ARRAY['Year-round'], 'Best from 4:30 PM',
  true, 1,
  true, false, true, false,
  'Suitable for all ages. Life jackets provided.',
  'Life jackets mandatory.',
  ARRAY['Camera', 'Light jacket', 'Sunglasses', 'Binoculars'],
  ARRAY['English'],
  ARRAY['river', 'sunset', 'relaxation', 'wildlife', 'photography'],
  4.6, 78, 567,
  6.4030, -58.6219
),
-- Amerindian Village Experience
(
  'Amerindian Village Cultural Experience',
  'amerindian-village-experience-seed',
  'Immerse yourself in indigenous culture at Surama Village. Learn traditional crafts, taste cassava bread, and participate in cultural performances.',
  (SELECT id FROM tourism_categories WHERE slug = 'culture'),
  (SELECT id FROM regions WHERE slug = 'upper-demerara-berbice'),
  '33333333-3333-3333-3333-333333333333',
  'activity', '2 days / 1 night', 'easy',
  2, 12, 'All ages',
  'Surama Village, North Rupununi',
  'Surama Village Centre',
  '592-677-5556', 'visits@suramaecolodge.com', 'https://suramaecolodge.com',
  'Surama Eco-Lodge', 'GTA-2024-007',
  28000, 'GYD', 'Per person',
  'Accommodation, All meals, Cultural activities, Village tour',
  'Transportation to Surama, Souvenirs',
  ARRAY['Year-round'], 'Year-round',
  true, 3,
  true, true, true, true,
  'Basic accommodation in traditional benabs.',
  'Respect local customs. Ask permission before photography.',
  ARRAY['Modest clothing', 'Walking shoes', 'Insect repellent', 'Camera'],
  ARRAY['English', 'Makushi'],
  ARRAY['culture', 'indigenous', 'traditional', 'crafts', 'community'],
  4.7, 56, 456,
  4.1234, -59.0456
),
-- Demerara Rum Tour
(
  'Demerara Rum Distillery Tour',
  'demerara-rum-tour-seed',
  'Tour the historic Demerara Distillery, home of El Dorado rum. Learn about 300 years of rum-making tradition and enjoy premium tastings.',
  (SELECT id FROM tourism_categories WHERE slug = 'food-culinary'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  '33333333-3333-3333-3333-333333333333',
  'tour', '2 hours', 'easy',
  4, 20, '18+',
  'Diamond, East Bank Demerara',
  'Demerara Distillery Main Gate',
  '592-265-5555', 'tours@demeraradistillery.com', 'https://theeldoradorumtour.com',
  'Demerara Distillers Limited', 'GTA-2024-009',
  4500, 'GYD', 'Per person',
  'Guided tour, Rum tasting (5 varieties), Souvenir glass',
  'Transportation, Meals, Rum purchases',
  ARRAY['Year-round'], 'Monday to Friday, 9 AM - 3 PM',
  true, 2,
  true, false, true, true,
  'Walking tour of production facility. Closed-toe shoes required.',
  'Must be 18+ for tasting.',
  ARRAY['Closed-toe shoes', 'Camera', 'ID for verification'],
  ARRAY['English'],
  ARRAY['culinary', 'rum', 'history', 'tasting', 'cultural'],
  4.4, 123, 987,
  6.7456, -58.1234
),
-- Bird Watching Tour
(
  'Guyana Birding Photography Tour',
  'birding-photography-tour-seed',
  'Specialized tour for bird photographers targeting Guyana''s 800+ bird species including the Guianan Cock-of-the-rock, Harpy Eagle, and endemic species.',
  (SELECT id FROM tourism_categories WHERE slug = 'bird-watching'),
  (SELECT id FROM regions WHERE slug = 'cuyuni-mazaruni'),
  '33333333-3333-3333-3333-333333333333',
  'tour', '5 days / 4 nights', 'moderate',
  2, 6, '18+',
  'Multiple locations including Kaieteur, Iwokrama, and Atta Lodge',
  'Eugene F. Correia International Airport',
  '592-644-5555', 'birds@guyanaphototours.com', 'https://guyanaphototours.com',
  'Wilderness Explorers', 'GTA-2024-008',
  185000, 'GYD', 'Per person',
  'All accommodation, Meals, Expert birding guide, Transportation, Park fees',
  'International flights, Photography equipment, Tips',
  ARRAY['Year-round'], 'October - April (dry season)',
  true, 14,
  true, false, true, false,
  'Early morning starts. Moderate hiking required.',
  'Quiet observation required.',
  ARRAY['Camera with telephoto lens', 'Binoculars', 'Field guide', 'Neutral clothing', 'Rain gear'],
  ARRAY['English'],
  ARRAY['birding', 'photography', 'wildlife', 'endemic-species', 'specialized'],
  4.9, 34, 345,
  6.2000, -59.5000
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 12. SEED PHOTOS FOR TOURISM EXPERIENCES
-- ============================================

INSERT INTO tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&h=800&fit=crop', 'Majestic Kaieteur Falls', 'cover', 0, true
FROM tourism_experiences WHERE slug = 'kaieteur-falls-day-trip-seed'
ON CONFLICT DO NOTHING;

INSERT INTO tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop', 'Canopy walkway through the rainforest', 'cover', 0, true
FROM tourism_experiences WHERE slug = 'iwokrama-canopy-walkway-seed'
ON CONFLICT DO NOTHING;

INSERT INTO tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop', 'Colonial architecture of Georgetown', 'cover', 0, true
FROM tourism_experiences WHERE slug = 'georgetown-heritage-tour-seed'
ON CONFLICT DO NOTHING;

INSERT INTO tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=800&fit=crop', 'Wildlife on the Rupununi savannah', 'cover', 0, true
FROM tourism_experiences WHERE slug = 'rupununi-wildlife-safari-seed'
ON CONFLICT DO NOTHING;

INSERT INTO tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', 'Sunset on the Essequibo River', 'cover', 0, true
FROM tourism_experiences WHERE slug = 'essequibo-sunset-cruise-seed'
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. SEED BUSINESS PHOTOS
-- ============================================

INSERT INTO business_photos (business_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', 0, true
FROM businesses WHERE slug = 'oasis-cafe-georgetown'
ON CONFLICT DO NOTHING;

INSERT INTO business_photos (business_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop', 0, true
FROM businesses WHERE slug = 'backyard-bbq-grill'
ON CONFLICT DO NOTHING;

INSERT INTO business_photos (business_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop', 0, true
FROM businesses WHERE slug = 'fresh-mart-supermarket'
ON CONFLICT DO NOTHING;

INSERT INTO business_photos (business_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop', 0, true
FROM businesses WHERE slug = 'glamour-studio-salon'
ON CONFLICT DO NOTHING;

INSERT INTO business_photos (business_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop', 0, true
FROM businesses WHERE slug = 'powerhouse-fitness-gym'
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. SEED RENTAL PHOTOS
-- ============================================

INSERT INTO rental_photos (rental_id, image_url, caption, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', 'Modern living room', 0, true
FROM rentals WHERE slug = 'modern-2br-bel-air-seed'
ON CONFLICT DO NOTHING;

INSERT INTO rental_photos (rental_id, image_url, caption, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 'Cozy studio interior', 0, true
FROM rentals WHERE slug = 'cozy-studio-kitty-seed'
ON CONFLICT DO NOTHING;

INSERT INTO rental_photos (rental_id, image_url, caption, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop', 'Family home with pool', 0, true
FROM rentals WHERE slug = 'spacious-4br-pool-seed'
ON CONFLICT DO NOTHING;

INSERT INTO rental_photos (rental_id, image_url, caption, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop', 'Riverfront retreat exterior', 0, true
FROM rentals WHERE slug = 'riverfront-retreat-bartica-seed'
ON CONFLICT DO NOTHING;

INSERT INTO rental_photos (rental_id, image_url, caption, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', 'Professional office space', 0, true
FROM rentals WHERE slug = 'prime-office-camp-st-seed'
ON CONFLICT DO NOTHING;

-- ============================================
-- DONE! Comprehensive seed data created.
-- ============================================
