-- Seed sample events for testing
DO $$
DECLARE
  fire_grill_id UUID;
  quick_bite_id UUID;
  golden_star_id UUID;
  beauty_plus_id UUID;
  riverside_id UUID;
  linden_grocers_id UUID;

  concert_cat_id UUID;
  workshop_cat_id UUID;
  sale_cat_id UUID;
  community_cat_id UUID;
  festival_cat_id UUID;
  food_cat_id UUID;
BEGIN
  -- Get business IDs
  SELECT id INTO fire_grill_id FROM businesses WHERE slug = 'the-fire-grill-restaurant' LIMIT 1;
  SELECT id INTO quick_bite_id FROM businesses WHERE slug = 'quick-bite-cafe' LIMIT 1;
  SELECT id INTO golden_star_id FROM businesses WHERE slug = 'golden-star-supermarket' LIMIT 1;
  SELECT id INTO beauty_plus_id FROM businesses WHERE slug = 'beauty-plus-salon' LIMIT 1;
  SELECT id INTO riverside_id FROM businesses WHERE slug = 'riverside-restaurant' LIMIT 1;
  SELECT id INTO linden_grocers_id FROM businesses WHERE slug = 'linden-grocers' LIMIT 1;

  -- Get event category IDs
  SELECT id INTO concert_cat_id FROM event_categories WHERE slug = 'concert' LIMIT 1;
  SELECT id INTO workshop_cat_id FROM event_categories WHERE slug = 'workshop' LIMIT 1;
  SELECT id INTO sale_cat_id FROM event_categories WHERE slug = 'sale' LIMIT 1;
  SELECT id INTO community_cat_id FROM event_categories WHERE slug = 'community' LIMIT 1;
  SELECT id INTO festival_cat_id FROM event_categories WHERE slug = 'festival' LIMIT 1;
  SELECT id INTO food_cat_id FROM event_categories WHERE slug = 'food-drink' LIMIT 1;

  -- Insert sample events
  INSERT INTO events (
    business_id,
    title,
    slug,
    description,
    start_date,
    end_date,
    location,
    event_type,
    category_id,
    is_featured,
    view_count,
    whatsapp_clicks
  ) VALUES
  (
    fire_grill_id,
    'Guyanese Food Festival 2025',
    'guyanese-food-festival-2025',
    'Join us for our annual Guyanese Food Festival! Sample traditional dishes, live cooking demonstrations, local music, and family activities. All proceeds support local charities.',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '12 days',
    '123 Main Street, Georgetown',
    'Festival',
    festival_cat_id,
    true,
    156,
    42
  ),
  (
    riverside_id,
    'Live Jazz Night Every Friday',
    'live-jazz-night-every-friday',
    'Experience the smooth sounds of local jazz musicians while enjoying our seafood specials. Starts at 7 PM, reservations recommended.',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '5 hours',
    '10 Strand, New Amsterdam',
    'Concert',
    concert_cat_id,
    true,
    89,
    28
  ),
  (
    golden_star_id,
    'Black Friday Super Sale',
    'black-friday-super-sale',
    'Massive discounts on groceries, household items, and electronics! Up to 50% off selected items. First 100 customers get free reusable bags.',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '32 days',
    '789 Water Street, Georgetown',
    'Sale',
    sale_cat_id,
    true,
    234,
    67
  ),
  (
    beauty_plus_id,
    'Natural Hair Care Workshop',
    'natural-hair-care-workshop',
    'Learn professional techniques for maintaining and styling natural hair. Workshop includes product demonstrations, hands-on practice, and take-home care guide. Limited to 15 participants.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
    '321 Sheriff Street, Georgetown',
    'Workshop',
    workshop_cat_id,
    false,
    45,
    18
  ),
  (
    quick_bite_id,
    'Coffee Tasting & Latte Art Class',
    'coffee-tasting-latte-art-class',
    'Discover the art of coffee! Professional barista will guide you through coffee origins, tasting notes, and teach you how to create beautiful latte art. Includes coffee and pastries.',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
    '456 Robb Street, Georgetown',
    'Workshop',
    workshop_cat_id,
    false,
    67,
    22
  ),
  (
    linden_grocers_id,
    'Community Food Drive',
    'community-food-drive-linden',
    'Help us support families in need! Drop off non-perishable food items at our store. All donations go to local food banks. Together we can make a difference.',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '20 days',
    'Mackenzie, Linden',
    'Charity',
    community_cat_id,
    false,
    112,
    31
  ),
  (
    fire_grill_id,
    'New Year''s Eve Celebration',
    'new-years-eve-celebration-2025',
    'Ring in the New Year with us! Special 5-course menu, live DJ, champagne toast at midnight, and party favors. Advanced booking required.',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '45 days' + INTERVAL '6 hours',
    '123 Main Street, Georgetown',
    'Celebration',
    food_cat_id,
    true,
    312,
    98
  ),
  (
    riverside_id,
    'Sunset Seafood BBQ Weekend',
    'sunset-seafood-bbq-weekend',
    'Weekend BBQ special featuring fresh catch of the day, grilled lobster, and our famous garlic butter shrimp. Watch the sunset over the river while you dine.',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '4 days',
    '10 Strand, New Amsterdam',
    'Food Event',
    food_cat_id,
    false,
    178,
    52
  );
END $$;
