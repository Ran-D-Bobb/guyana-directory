-- Add missing tourism photos for experiences without images
-- This migration adds primary photos for the 7 experiences that are missing cover images

-- Rupununi Savannah Wildlife Safari
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1534188753412-5df1d4d4c823?w=1200&h=800&fit=crop',
  'Rupununi savannah landscape',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'rupununi-wildlife-safari';

-- Essequibo River Sunset Cruise
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
  'Sunset cruise on the river',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'essequibo-sunset-cruise';

-- Shell Beach Turtle Watching Expedition
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop',
  'Sea turtle on the beach',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'shell-beach-turtle-watching';

-- Amerindian Village Cultural Experience
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1604498619990-d6bcf8e9a2c4?w=1200&h=800&fit=crop',
  'Traditional village crafts',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'amerindian-village-experience';

-- Guyana Birding Photography Tour
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&h=800&fit=crop',
  'Exotic tropical bird',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'birding-photography-tour';

-- Demerara Rum Distillery Tour
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1582218953225-f9fcf48e9d52?w=1200&h=800&fit=crop',
  'Rum barrels aging in the distillery',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'demerara-rum-tour';

-- Mount Roraima Expedition
INSERT INTO public.tourism_photos (experience_id, image_url, caption, photo_type, display_order, is_primary)
SELECT
  id,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
  'Mount Roraima summit',
  'cover',
  0,
  true
FROM tourism_experiences WHERE slug = 'mount-roraima-expedition';
