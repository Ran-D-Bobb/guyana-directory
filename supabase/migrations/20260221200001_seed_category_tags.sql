-- Seed curated tags for all 20 business categories
DO $$
DECLARE
  v_cat_id UUID;
BEGIN
  -- Restaurants & Dining
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'restaurants-dining';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Pizza', 'pizza', 0),
      (v_cat_id, 'Burgers', 'burgers', 1),
      (v_cat_id, 'Seafood', 'seafood', 2),
      (v_cat_id, 'Chinese', 'chinese', 3),
      (v_cat_id, 'Indian', 'indian', 4),
      (v_cat_id, 'BBQ', 'bbq', 5),
      (v_cat_id, 'Vegan', 'vegan', 6),
      (v_cat_id, 'Fast Food', 'fast-food', 7),
      (v_cat_id, 'Fine Dining', 'fine-dining', 8),
      (v_cat_id, 'Bakery & Pastries', 'bakery-pastries', 9),
      (v_cat_id, 'Creole', 'creole', 10),
      (v_cat_id, 'Caribbean', 'caribbean', 11),
      (v_cat_id, 'Halal', 'halal', 12),
      (v_cat_id, 'Breakfast', 'breakfast', 13),
      (v_cat_id, 'Takeout', 'takeout', 14),
      (v_cat_id, 'Cafe', 'cafe', 15),
      (v_cat_id, 'Bar & Grill', 'bar-grill', 16)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Grocery & Supermarkets
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'grocery-supermarkets';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Organic', 'organic', 0),
      (v_cat_id, 'Wholesale', 'wholesale', 1),
      (v_cat_id, 'Convenience Store', 'convenience-store', 2),
      (v_cat_id, 'Market', 'market', 3),
      (v_cat_id, 'International Foods', 'international-foods', 4),
      (v_cat_id, 'Butcher', 'butcher', 5),
      (v_cat_id, 'Bakery', 'bakery', 6),
      (v_cat_id, 'Beverages', 'beverages', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Beauty & Personal Care
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'beauty-personal-care';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Haircut', 'haircut', 0),
      (v_cat_id, 'Braids', 'braids', 1),
      (v_cat_id, 'Nails', 'nails', 2),
      (v_cat_id, 'Facial', 'facial', 3),
      (v_cat_id, 'Massage', 'massage', 4),
      (v_cat_id, 'Barber', 'barber', 5),
      (v_cat_id, 'Makeup', 'makeup', 6),
      (v_cat_id, 'Waxing', 'waxing', 7),
      (v_cat_id, 'Spa', 'spa', 8)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Health & Medical
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'health-medical';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Pharmacy', 'pharmacy', 0),
      (v_cat_id, 'Dentist', 'dentist', 1),
      (v_cat_id, 'General Practitioner', 'general-practitioner', 2),
      (v_cat_id, 'Specialist', 'specialist', 3),
      (v_cat_id, 'Lab & Diagnostics', 'lab-diagnostics', 4),
      (v_cat_id, 'Eye Care', 'eye-care', 5),
      (v_cat_id, 'Mental Health', 'mental-health', 6),
      (v_cat_id, 'Physical Therapy', 'physical-therapy', 7),
      (v_cat_id, 'Emergency', 'emergency', 8),
      (v_cat_id, 'Pediatrics', 'pediatrics', 9)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Automotive Services
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'automotive-services';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Repair', 'repair', 0),
      (v_cat_id, 'Car Wash', 'car-wash', 1),
      (v_cat_id, 'Tires', 'tires', 2),
      (v_cat_id, 'Oil Change', 'oil-change', 3),
      (v_cat_id, 'Body Work', 'body-work', 4),
      (v_cat_id, 'Towing', 'towing', 5),
      (v_cat_id, 'Parts', 'parts', 6),
      (v_cat_id, 'AC Repair', 'ac-repair', 7),
      (v_cat_id, 'Detailing', 'detailing', 8)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Home & Garden
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'home-garden';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Hardware', 'hardware', 0),
      (v_cat_id, 'Furniture', 'furniture', 1),
      (v_cat_id, 'Appliances', 'appliances', 2),
      (v_cat_id, 'Gardening', 'gardening', 3),
      (v_cat_id, 'Cleaning', 'cleaning', 4),
      (v_cat_id, 'Pest Control', 'pest-control', 5),
      (v_cat_id, 'Paint', 'paint', 6),
      (v_cat_id, 'Decor', 'decor', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Construction & Trades
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'construction-trades';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Electrical', 'electrical', 0),
      (v_cat_id, 'Plumbing', 'plumbing', 1),
      (v_cat_id, 'Carpentry', 'carpentry', 2),
      (v_cat_id, 'Welding', 'welding', 3),
      (v_cat_id, 'Painting', 'painting', 4),
      (v_cat_id, 'Roofing', 'roofing', 5),
      (v_cat_id, 'Masonry', 'masonry', 6),
      (v_cat_id, 'Tiling', 'tiling', 7),
      (v_cat_id, 'General Contractor', 'general-contractor', 8)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Technology & Electronics
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'technology-electronics';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Phone Repair', 'phone-repair', 0),
      (v_cat_id, 'Computer Repair', 'computer-repair', 1),
      (v_cat_id, 'IT Services', 'it-services', 2),
      (v_cat_id, 'Internet', 'internet', 3),
      (v_cat_id, 'CCTV', 'cctv', 4),
      (v_cat_id, 'Software', 'software', 5),
      (v_cat_id, 'Accessories', 'accessories', 6),
      (v_cat_id, 'Gaming', 'gaming', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Fashion & Clothing
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'fashion-clothing';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Men', 'men', 0),
      (v_cat_id, 'Women', 'women', 1),
      (v_cat_id, 'Children', 'children', 2),
      (v_cat_id, 'Shoes', 'shoes', 3),
      (v_cat_id, 'Accessories', 'accessories', 4),
      (v_cat_id, 'Tailoring', 'tailoring', 5),
      (v_cat_id, 'Fabric', 'fabric', 6),
      (v_cat_id, 'Uniforms', 'uniforms', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Education & Training
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'education-training';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Tutoring', 'tutoring', 0),
      (v_cat_id, 'Driving School', 'driving-school', 1),
      (v_cat_id, 'Language', 'language', 2),
      (v_cat_id, 'Vocational', 'vocational', 3),
      (v_cat_id, 'Music Lessons', 'music-lessons', 4),
      (v_cat_id, 'Computer Training', 'computer-training', 5),
      (v_cat_id, 'Preschool', 'preschool', 6),
      (v_cat_id, 'Test Prep', 'test-prep', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Professional Services
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'professional-services';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Legal', 'legal', 0),
      (v_cat_id, 'Accounting', 'accounting', 1),
      (v_cat_id, 'Consulting', 'consulting', 2),
      (v_cat_id, 'Insurance', 'insurance', 3),
      (v_cat_id, 'Notary', 'notary', 4),
      (v_cat_id, 'Customs', 'customs', 5),
      (v_cat_id, 'HR Services', 'hr-services', 6),
      (v_cat_id, 'Marketing', 'marketing', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Entertainment & Events
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'entertainment-events';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'DJ', 'dj', 0),
      (v_cat_id, 'Event Planning', 'event-planning', 1),
      (v_cat_id, 'Venue', 'venue', 2),
      (v_cat_id, 'Photography', 'photography', 3),
      (v_cat_id, 'Catering', 'catering', 4),
      (v_cat_id, 'Decoration', 'decoration', 5),
      (v_cat_id, 'Sound System', 'sound-system', 6),
      (v_cat_id, 'MC & Host', 'mc-host', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Fitness & Sports
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'fitness-sports';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Gym', 'gym', 0),
      (v_cat_id, 'Yoga', 'yoga', 1),
      (v_cat_id, 'Swimming', 'swimming', 2),
      (v_cat_id, 'Martial Arts', 'martial-arts', 3),
      (v_cat_id, 'Personal Training', 'personal-training', 4),
      (v_cat_id, 'Cricket', 'cricket', 5),
      (v_cat_id, 'Football', 'football', 6),
      (v_cat_id, 'Dance', 'dance', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Pet Services
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'pet-services';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Veterinarian', 'veterinarian', 0),
      (v_cat_id, 'Grooming', 'grooming', 1),
      (v_cat_id, 'Pet Store', 'pet-store', 2),
      (v_cat_id, 'Boarding', 'boarding', 3),
      (v_cat_id, 'Training', 'training', 4),
      (v_cat_id, 'Pet Food', 'pet-food', 5)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Real Estate
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'real-estate';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Residential', 'residential', 0),
      (v_cat_id, 'Commercial', 'commercial', 1),
      (v_cat_id, 'Land', 'land', 2),
      (v_cat_id, 'Valuation', 'valuation', 3),
      (v_cat_id, 'Property Management', 'property-management', 4),
      (v_cat_id, 'Rental Agent', 'rental-agent', 5)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Financial Services
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'financial-services';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Banking', 'banking', 0),
      (v_cat_id, 'Insurance', 'insurance', 1),
      (v_cat_id, 'Cambio', 'cambio', 2),
      (v_cat_id, 'Money Transfer', 'money-transfer', 3),
      (v_cat_id, 'Loans', 'loans', 4),
      (v_cat_id, 'Investment', 'investment', 5),
      (v_cat_id, 'Tax Services', 'tax-services', 6)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Hospitality & Lodging
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'hospitality-lodging';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Hotel', 'hotel', 0),
      (v_cat_id, 'Resort', 'resort', 1),
      (v_cat_id, 'Guesthouse', 'guesthouse', 2),
      (v_cat_id, 'Airbnb', 'airbnb', 3),
      (v_cat_id, 'Eco-Lodge', 'eco-lodge', 4),
      (v_cat_id, 'Hostel', 'hostel', 5),
      (v_cat_id, 'Bed & Breakfast', 'bed-breakfast', 6)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Transportation & Logistics
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'transportation-logistics';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Courier', 'courier', 0),
      (v_cat_id, 'Moving', 'moving', 1),
      (v_cat_id, 'Freight', 'freight', 2),
      (v_cat_id, 'Bus', 'bus', 3),
      (v_cat_id, 'Boat', 'boat', 4),
      (v_cat_id, 'Taxi', 'taxi', 5),
      (v_cat_id, 'Car Rental', 'car-rental', 6),
      (v_cat_id, 'Delivery', 'delivery', 7)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Photography & Media
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'photography-media';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Wedding', 'wedding', 0),
      (v_cat_id, 'Portrait', 'portrait', 1),
      (v_cat_id, 'Commercial', 'commercial', 2),
      (v_cat_id, 'Video', 'video', 3),
      (v_cat_id, 'Drone', 'drone', 4),
      (v_cat_id, 'Printing', 'printing', 5),
      (v_cat_id, 'Graphic Design', 'graphic-design', 6)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- Other Services
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'other-services';
  IF v_cat_id IS NOT NULL THEN
    INSERT INTO category_tags (category_id, name, slug, display_order) VALUES
      (v_cat_id, 'Laundry', 'laundry', 0),
      (v_cat_id, 'Printing', 'printing', 1),
      (v_cat_id, 'Security', 'security', 2),
      (v_cat_id, 'Recycling', 'recycling', 3),
      (v_cat_id, 'Cleaning', 'cleaning', 4),
      (v_cat_id, 'Storage', 'storage', 5)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

END $$;
