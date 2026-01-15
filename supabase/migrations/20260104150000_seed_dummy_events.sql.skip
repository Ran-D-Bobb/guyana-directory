-- Seed dummy events for user 8bd87ee0-920d-461c-992a-e55bf7d5f588
-- This migration adds various sample events across different categories and timeframes

DO $$
DECLARE
  target_user_id UUID := '8bd87ee0-920d-461c-992a-e55bf7d5f588';
  concert_cat_id UUID;
  workshop_cat_id UUID;
  community_cat_id UUID;
  festival_cat_id UUID;
  sports_cat_id UUID;
  networking_cat_id UUID;
  food_cat_id UUID;
  art_cat_id UUID;
  charity_cat_id UUID;
  other_cat_id UUID;
  georgetown_region_id UUID;
  berbice_region_id UUID;
  demerara_region_id UUID;
BEGIN
  -- Get event category IDs
  SELECT id INTO concert_cat_id FROM event_categories WHERE slug = 'concert' LIMIT 1;
  SELECT id INTO workshop_cat_id FROM event_categories WHERE slug = 'workshop' LIMIT 1;
  SELECT id INTO community_cat_id FROM event_categories WHERE slug = 'community' LIMIT 1;
  SELECT id INTO festival_cat_id FROM event_categories WHERE slug = 'festival' LIMIT 1;
  SELECT id INTO sports_cat_id FROM event_categories WHERE slug = 'sports' LIMIT 1;
  SELECT id INTO networking_cat_id FROM event_categories WHERE slug = 'business-networking' LIMIT 1;
  SELECT id INTO food_cat_id FROM event_categories WHERE slug = 'food-drink' LIMIT 1;
  SELECT id INTO art_cat_id FROM event_categories WHERE slug = 'art-culture' LIMIT 1;
  SELECT id INTO charity_cat_id FROM event_categories WHERE slug = 'charity' LIMIT 1;
  SELECT id INTO other_cat_id FROM event_categories WHERE slug = 'other' LIMIT 1;

  -- Get region IDs
  SELECT id INTO georgetown_region_id FROM regions WHERE slug = 'georgetown' LIMIT 1;
  SELECT id INTO berbice_region_id FROM regions WHERE slug = 'new-amsterdam' OR slug = 'berbice' LIMIT 1;
  SELECT id INTO demerara_region_id FROM regions WHERE slug = 'east-coast-demerara' OR slug = 'demerara' LIMIT 1;

  -- Insert dummy events

  -- 1. Tech Startup Pitch Night (Upcoming - 3 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, is_featured, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Tech Startup Pitch Night',
    'tech-startup-pitch-night-2025',
    'Calling all entrepreneurs! Present your innovative tech ideas to a panel of investors and industry experts. Each startup gets 5 minutes to pitch followed by Q&A. Network with fellow founders and potential collaborators. Prizes for top 3 pitches including mentorship and seed funding opportunities.',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '4 hours',
    'Marriott Hotel, Kingston, Georgetown',
    networking_cat_id, georgetown_region_id,
    'pitchnight@guyanatech.org',
    TRUE, 89, 34
  ) ON CONFLICT (slug) DO NOTHING;

  -- 2. Caribbean Food & Wine Festival (Upcoming - 7 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, is_featured, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Caribbean Food & Wine Festival',
    'caribbean-food-wine-festival-2025',
    'Indulge in an exquisite culinary journey through the Caribbean! Sample dishes from top chefs, enjoy wine pairings, and learn cooking techniques in live demonstrations. Features cuisines from Guyana, Trinidad, Jamaica, Barbados, and more. Live music and entertainment all day.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '8 days',
    'Providence Stadium, East Bank',
    food_cat_id, demerara_region_id,
    'foodfest@caribbeancuisine.gy',
    TRUE, 234, 87
  ) ON CONFLICT (slug) DO NOTHING;

  -- 3. Art in the Park Exhibition (Upcoming - 5 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Art in the Park Exhibition',
    'art-in-the-park-exhibition-jan-2025',
    'Experience the best of Guyanese contemporary art in this outdoor exhibition. Featuring works from 30+ local artists including paintings, sculptures, and installations. Meet the artists, watch live art creation, and purchase unique pieces. Free entry for all!',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '6 hours',
    'Promenade Gardens, Georgetown',
    art_cat_id, georgetown_region_id,
    'art@guyanaarts.org',
    156, 45
  ) ON CONFLICT (slug) DO NOTHING;

  -- 4. Morning Yoga on the Seawall (Upcoming - 2 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Morning Yoga on the Seawall',
    'morning-yoga-seawall-jan-2025',
    'Start your weekend with sunrise yoga overlooking the Atlantic Ocean! All levels welcome. Our certified instructors will guide you through a refreshing 90-minute session. Bring your own mat or rent one on-site. Light healthy refreshments provided after class.',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
    'Georgetown Seawall, Kitty',
    sports_cat_id, georgetown_region_id,
    'yoga@wellnessgy.com',
    78, 29
  ) ON CONFLICT (slug) DO NOTHING;

  -- 5. Charity Gala for Children's Education (Upcoming - 14 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, is_featured, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Charity Gala for Children''s Education',
    'charity-gala-childrens-education-2025',
    'Join us for an elegant evening supporting education in underserved communities. Includes cocktail reception, gourmet dinner, live entertainment, and silent auction. All proceeds go directly to providing school supplies, uniforms, and scholarships for children in need. Black tie attire.',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '5 hours',
    'Pegasus Hotel Ballroom, Georgetown',
    charity_cat_id, georgetown_region_id,
    'gala@educationforall.gy',
    TRUE, 312, 95
  ) ON CONFLICT (slug) DO NOTHING;

  -- 6. Live Reggae Night (Upcoming - 4 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Live Reggae Night featuring Local Artists',
    'live-reggae-night-jan-2025',
    'Feel the rhythm of reggae with live performances by Guyana''s top reggae artists! Featuring The Vibration Band, Roots Collective, and special guests. Food and drinks available. Good vibes guaranteed! No cover charge, donations welcome.',
    NOW() + INTERVAL '4 days',
    NOW() + INTERVAL '4 days' + INTERVAL '5 hours',
    'Palm Court, Main Street, Georgetown',
    concert_cat_id, georgetown_region_id,
    'reggae@livemusicgy.com',
    145, 52
  ) ON CONFLICT (slug) DO NOTHING;

  -- 7. Small Business Workshop (Upcoming - 6 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Small Business Success Workshop',
    'small-business-success-workshop-2025',
    'Learn essential skills for growing your small business! Topics include financial management, digital marketing, customer service excellence, and accessing funding opportunities. Presented by successful local entrepreneurs and business consultants. Materials and lunch included.',
    NOW() + INTERVAL '6 days',
    NOW() + INTERVAL '6 days' + INTERVAL '6 hours',
    'IPED Training Centre, Sophia',
    workshop_cat_id, georgetown_region_id,
    'workshop@smallbizgy.org',
    98, 41
  ) ON CONFLICT (slug) DO NOTHING;

  -- 8. Beach Volleyball Tournament (Upcoming - 10 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Beach Volleyball Tournament',
    'beach-volleyball-tournament-jan-2025',
    'Grab your team and compete in our exciting beach volleyball tournament! 4-person teams compete for cash prizes and bragging rights. Categories: Men''s, Women''s, and Mixed. Registration fee includes team t-shirts. Spectators free, food vendors on-site.',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '8 hours',
    'Splashmins Resort, Linden Highway',
    sports_cat_id, demerara_region_id,
    'volleyball@sportsgy.com',
    167, 63
  ) ON CONFLICT (slug) DO NOTHING;

  -- 9. Community Clean-Up Drive (Upcoming - 1 day)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Neighborhood Clean-Up Drive',
    'neighborhood-cleanup-drive-jan-2025',
    'Help us beautify our community! Join neighbors and volunteers for a morning clean-up initiative. We''ll be cleaning streets, clearing drains, and planting trees. Gloves and equipment provided. Refreshments and certificates for all participants. Every hand makes a difference!',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '4 hours',
    'Campbellville Community Centre',
    community_cat_id, georgetown_region_id,
    'cleanup@greengeorgetown.org',
    54, 22
  ) ON CONFLICT (slug) DO NOTHING;

  -- 10. Open Mic Comedy Night (Upcoming - 8 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Open Mic Comedy Night',
    'open-mic-comedy-night-jan-2025',
    'Think you''re funny? Prove it! Open mic night for aspiring comedians. Each performer gets 5 minutes to make the crowd laugh. Seasoned comedians hosting and offering tips. Great atmosphere, drinks specials, and lots of laughs guaranteed. Sign up at the door!',
    NOW() + INTERVAL '8 days',
    NOW() + INTERVAL '8 days' + INTERVAL '3 hours',
    'Altitude Lounge, Sheriff Street',
    other_cat_id, georgetown_region_id,
    'comedy@laughsgy.com',
    89, 31
  ) ON CONFLICT (slug) DO NOTHING;

  -- 11. Photography Walk & Workshop (Upcoming - 9 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Georgetown Photography Walk',
    'georgetown-photography-walk-jan-2025',
    'Explore Georgetown through your lens! Join professional photographers on a guided walk through historic parts of the city. Learn composition, lighting, and street photography techniques. All camera types welcome, including smartphones. Share and critique session afterward at a local cafe.',
    NOW() + INTERVAL '9 days',
    NOW() + INTERVAL '9 days' + INTERVAL '4 hours',
    'Starting at City Hall, Georgetown',
    workshop_cat_id, georgetown_region_id,
    'photos@guyanashots.com',
    76, 28
  ) ON CONFLICT (slug) DO NOTHING;

  -- 12. Cultural Heritage Day (Upcoming - 12 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, is_featured, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Cultural Heritage Day Celebration',
    'cultural-heritage-day-jan-2025',
    'Celebrate Guyana''s rich multicultural heritage! Experience traditional music, dance, and cuisine from all six peoples of Guyana. Cultural displays, craft demonstrations, storytelling sessions, and performances throughout the day. A family-friendly celebration of our unity in diversity.',
    NOW() + INTERVAL '12 days',
    NOW() + INTERVAL '12 days' + INTERVAL '8 hours',
    'National Park, Georgetown',
    festival_cat_id, georgetown_region_id,
    'culture@heritage.gov.gy',
    TRUE, 287, 112
  ) ON CONFLICT (slug) DO NOTHING;

  -- 13. Berbice River Boat Cruise (Upcoming - 15 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Berbice River Sunset Cruise',
    'berbice-river-sunset-cruise-jan-2025',
    'Experience the beauty of the Berbice River at sunset! Relaxing boat cruise with live music, dinner buffet, and open bar. Watch the sun set over the river while enjoying good company. Perfect for couples, families, or groups of friends. Limited capacity, book early!',
    NOW() + INTERVAL '15 days',
    NOW() + INTERVAL '15 days' + INTERVAL '4 hours',
    'New Amsterdam Stelling, Berbice',
    other_cat_id, berbice_region_id,
    'cruise@berbiceadventures.gy',
    134, 56
  ) ON CONFLICT (slug) DO NOTHING;

  -- 14. Fitness Boot Camp Challenge (Upcoming - 11 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'New Year Fitness Boot Camp',
    'new-year-fitness-bootcamp-2025',
    'Kickstart your fitness goals with an intense but fun outdoor boot camp! Certified trainers will push you through cardio, strength, and team challenges. All fitness levels welcome - exercises can be modified. Prizes for top performers. Stay committed, stay strong!',
    NOW() + INTERVAL '11 days',
    NOW() + INTERVAL '11 days' + INTERVAL '2 hours',
    'National Park Running Track',
    sports_cat_id, georgetown_region_id,
    'fitness@bootcampgy.com',
    98, 44
  ) ON CONFLICT (slug) DO NOTHING;

  -- 15. Book Club Launch & Reading (Upcoming - 13 days)
  INSERT INTO events (
    user_id, title, slug, description, start_date, end_date, location,
    category_id, region_id, email, view_count, interest_count
  ) VALUES (
    target_user_id,
    'Georgetown Book Club Launch',
    'georgetown-book-club-launch-2025',
    'Calling all book lovers! Join the launch of Georgetown''s newest book club. Our first meeting features a reading and discussion of works by Caribbean authors. Meet fellow readers, discover new books, and share your love of literature. Coffee and light refreshments provided.',
    NOW() + INTERVAL '13 days',
    NOW() + INTERVAL '13 days' + INTERVAL '2 hours',
    'Austin''s Book Services, Church Street',
    community_cat_id, georgetown_region_id,
    'books@gtownreaders.org',
    67, 25
  ) ON CONFLICT (slug) DO NOTHING;

END $$;
