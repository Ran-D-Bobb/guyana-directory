-- Update Featured Experiences
-- Mark key tourism experiences as featured for display on kiosk

-- Set featured experiences based on slug
UPDATE tourism_experiences
SET is_featured = true
WHERE slug IN (
  'kaieteur-falls-day-trip',
  'iwokrama-canopy-walkway',
  'rupununi-wildlife-safari',
  'shell-beach-turtle-watching',
  'amerindian-village-experience'
);

-- Ensure at least 5-6 featured experiences exist
-- Set featured to false for others to maintain a curated selection
UPDATE tourism_experiences
SET is_featured = false
WHERE slug NOT IN (
  'kaieteur-falls-day-trip',
  'iwokrama-canopy-walkway',
  'rupununi-wildlife-safari',
  'shell-beach-turtle-watching',
  'amerindian-village-experience'
);
