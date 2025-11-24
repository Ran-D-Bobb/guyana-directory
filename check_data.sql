-- Check tourism experiences pricing
SELECT
  COUNT(*) as total_experiences,
  COUNT(price_per_person) as with_price,
  COUNT(CASE WHEN price_per_person IS NULL OR price_per_person = 0 THEN 1 END) as null_or_zero_price,
  MIN(price_per_person) as min_price,
  MAX(price_per_person) as max_price,
  AVG(price_per_person) as avg_price
FROM tourism_experiences
WHERE is_approved = true;

-- Check events
SELECT COUNT(*) as total_events FROM events;

-- Check rental photos
SELECT
  COUNT(DISTINCT r.id) as total_rentals,
  COUNT(rp.id) as total_photos,
  COUNT(CASE WHEN rp.image_url IS NULL OR rp.image_url = '' THEN 1 END) as empty_urls
FROM rentals r
LEFT JOIN rental_photos rp ON r.id = rp.rental_id
WHERE r.is_approved = true;

-- Sample tourism experiences without prices
SELECT id, title, price_per_person, is_approved
FROM tourism_experiences
WHERE is_approved = true AND (price_per_person IS NULL OR price_per_person = 0)
LIMIT 5;

-- Sample events
SELECT id, title, start_date, end_date
FROM events
ORDER BY created_at DESC
LIMIT 5;

-- Sample rental photos
SELECT r.name, rp.image_url, rp.is_primary
FROM rentals r
LEFT JOIN rental_photos rp ON r.id = rp.rental_id
WHERE r.is_approved = true
LIMIT 5;
