-- Seed more sample events for testing
-- These are public events that don't require a user_id

DO $$
DECLARE
  sample_business_id UUID;
  restaurant_id UUID;
  tech_store_id UUID;
  concert_category_id UUID;
  workshop_category_id UUID;
  festival_category_id UUID;
  sports_category_id UUID;
  community_category_id UUID;
  networking_category_id UUID;
BEGIN
  -- Get some business IDs
  SELECT id INTO sample_business_id FROM businesses WHERE name = 'Joe''s Fresh Market' LIMIT 1;
  SELECT id INTO restaurant_id FROM businesses WHERE name = 'Tropical Fusion Restaurant' LIMIT 1;
  SELECT id INTO tech_store_id FROM businesses WHERE name = 'Tech Solutions Guyana' LIMIT 1;

  -- Get event category IDs
  SELECT id INTO concert_category_id FROM event_categories WHERE name = 'Concert' LIMIT 1;
  SELECT id INTO workshop_category_id FROM event_categories WHERE name = 'Workshop' LIMIT 1;
  SELECT id INTO festival_category_id FROM event_categories WHERE name = 'Festival' LIMIT 1;
  SELECT id INTO sports_category_id FROM event_categories WHERE name = 'Sports' LIMIT 1;
  SELECT id INTO community_category_id FROM event_categories WHERE name = 'Community' LIMIT 1;
  SELECT id INTO networking_category_id FROM event_categories WHERE name = 'Business Networking' LIMIT 1;

  -- Only insert if we have the required category data
  IF concert_category_id IS NOT NULL THEN

    -- 1. Georgetown Jazz Festival (Featured, Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id, business_id,
      whatsapp_number, email, is_featured, interest_count, view_count, whatsapp_clicks
    ) VALUES (
      'Georgetown Jazz Festival 2025',
      'georgetown-jazz-festival-2025',
      'Join us for the premier jazz festival in Guyana! Featuring local and international artists, food vendors, and an amazing atmosphere. This 2-day festival celebrates the best of jazz music with performances from renowned musicians across the Caribbean. Bring your family and friends for an unforgettable weekend of music, culture, and community. Gates open at 5 PM each day.',
      NOW() + INTERVAL '15 days',
      NOW() + INTERVAL '16 days',
      'National Park, Georgetown',
      concert_category_id, NULL,
      '+5926771234', 'info@gtjazzfest.gy',
      TRUE, 24, 156, 12
    );

    -- 2. Coding Workshop for Beginners (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id, business_id,
      whatsapp_number, email, is_featured, interest_count, view_count
    ) VALUES (
      'Introduction to Web Development',
      'intro-web-development-workshop',
      'Learn the basics of HTML, CSS, and JavaScript in this hands-on workshop. Perfect for absolute beginners! No prior experience required. We''ll cover the fundamentals of building modern websites and you''ll create your first web page by the end of the session. All materials provided. Limited spots available!',
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
      'Tech Hub Guyana, Brickdam',
      workshop_category_id, tech_store_id,
      '+5926785678', 'workshops@techhub.gy',
      FALSE, 18, 89
    );

    -- 3. Mashramani Cultural Parade (Upcoming, Featured)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id,
      whatsapp_number, email, is_featured, interest_count, view_count, whatsapp_clicks
    ) VALUES (
      'Mashramani Cultural Parade & Street Festival',
      'mashramani-cultural-parade-2025',
      'Celebrate Guyana''s Republic with the biggest street festival of the year! Colorful costumes, live music, traditional dances, and food from all regions of Guyana. Join thousands as we parade through Georgetown celebrating our independence and cultural heritage. Family-friendly event with activities for all ages.',
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '30 days' + INTERVAL '8 hours',
      'Main Street, Georgetown',
      festival_category_id,
      '+5926791234', 'mashramani@culture.gov.gy',
      TRUE, 142, 523, 45
    );

    -- 4. Business Networking Breakfast (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id, business_id,
      whatsapp_number, is_featured, interest_count, view_count
    ) VALUES (
      'Monthly Business Networking Breakfast',
      'business-networking-breakfast-dec',
      'Connect with fellow entrepreneurs and business leaders over breakfast. Great opportunity to expand your network, share ideas, and explore potential collaborations. Guest speaker will discuss digital marketing strategies for small businesses in Guyana. Continental breakfast included. Business attire recommended.',
      NOW() + INTERVAL '5 days',
      NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
      'Pegasus Hotel, Georgetown',
      networking_category_id, restaurant_id,
      '+5926123456',
      FALSE, 31, 67
    );

    -- 5. Community Beach Cleanup (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id,
      whatsapp_number, email, interest_count, view_count
    ) VALUES (
      'Seawall Beach Cleanup Initiative',
      'seawall-beach-cleanup-nov',
      'Join us in keeping our beautiful seawall clean! Bring your family and friends for a morning of community service. We provide gloves, bags, and refreshments. Together we can make a difference in preserving our coastline. Volunteer hours certificate available for students.',
      NOW() + INTERVAL '3 days',
      NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
      'Georgetown Seawall',
      community_category_id,
      '+5926445566', 'cleanup@greenguyana.org',
      45, 134
    );

    -- 6. Indoor Football Tournament (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id,
      whatsapp_number, interest_count, view_count, whatsapp_clicks
    ) VALUES (
      'Georgetown Indoor Football Championship',
      'georgetown-indoor-football-championship',
      'Annual 5-a-side football tournament featuring teams from across Georgetown. Fast-paced action, prizes for winners, and food vendors on site. Registration deadline: 3 days before event. Team registration fee: $5,000. Spectators welcome!',
      NOW() + INTERVAL '10 days',
      NOW() + INTERVAL '12 days',
      'Cliff Anderson Sports Hall',
      sports_category_id,
      '+5926998877',
      27, 98, 15
    );

    -- 7. Photography Workshop (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id,
      whatsapp_number, email, interest_count, view_count
    ) VALUES (
      'Smartphone Photography Masterclass',
      'smartphone-photography-masterclass',
      'Learn to take stunning photos with just your smartphone! Professional photographer will teach composition, lighting, editing, and more. Bring your smartphone and creative spirit. Small group setting ensures personalized attention. All skill levels welcome.',
      NOW() + INTERVAL '8 days',
      NOW() + INTERVAL '8 days' + INTERVAL '4 hours',
      'Botanical Gardens, Georgetown',
      workshop_category_id,
      '+5926334455', 'photo@artistscollective.gy',
      12, 54
    );

    -- 8. Farmers Market & Food Festival (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id, business_id,
      whatsapp_number, is_featured, interest_count, view_count, whatsapp_clicks
    ) VALUES (
      'Saturday Farmers Market & Food Festival',
      'saturday-farmers-market-food-festival',
      'Fresh produce, local crafts, and amazing street food! Support local farmers and artisans while enjoying live music and family activities. Every Saturday from 7 AM to 2 PM. Rain or shine! Free entry, bring your reusable bags.',
      NOW() + INTERVAL '2 days',
      NOW() + INTERVAL '2 days' + INTERVAL '7 hours',
      'Bourda Market Green',
      festival_category_id, sample_business_id,
      '+5926112233',
      TRUE, 67, 234, 28
    );

    -- 9. Youth Leadership Summit (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id,
      whatsapp_number, email, interest_count, view_count
    ) VALUES (
      'Youth Leadership Summit 2025',
      'youth-leadership-summit-2025',
      'Empowering the next generation of leaders! Day-long summit featuring workshops on leadership, entrepreneurship, and social impact. Guest speakers include successful young entrepreneurs and community leaders. Ages 16-25. Lunch provided. Register early as space is limited!',
      NOW() + INTERVAL '20 days',
      NOW() + INTERVAL '20 days' + INTERVAL '8 hours',
      'University of Guyana, Turkeyen Campus',
      networking_category_id,
      '+5926556677', 'youth@leadership.gy',
      38, 145
    );

    -- 10. Karaoke Night (Upcoming)
    INSERT INTO events (
      title, slug, description, start_date, end_date, location, category_id, business_id,
      whatsapp_number, interest_count, view_count
    ) VALUES (
      'Friday Night Karaoke Showdown',
      'friday-night-karaoke-showdown',
      'Show off your singing skills at our weekly karaoke night! Prizes for best performances, drink specials all night, and a fun atmosphere. Song catalog includes classics to current hits. No cover charge. First come, first served for song slots!',
      NOW() + INTERVAL '4 days',
      NOW() + INTERVAL '4 days' + INTERVAL '5 hours',
      'Tropical Fusion Restaurant',
      community_category_id, restaurant_id,
      '+5926223344',
      22, 87
    );

  END IF;
END $$;
