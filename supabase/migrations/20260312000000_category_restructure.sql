-- Category Restructure: Government category, merge Construction into Home & Garden
-- Date: 2026-03-12

-- 1. Create Government & Public Services category
INSERT INTO categories (name, slug, icon, description)
VALUES (
  'Government & Public Services',
  'government-public-services',
  'Landmark',
  'Police stations, courts, government offices, and public service institutions in Guyana'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Move government-related businesses from Other Services to new category
UPDATE businesses
SET category_id = (SELECT id FROM categories WHERE slug = 'government-public-services')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'other-services')
  AND (
    name ILIKE '%police station%'
    OR name ILIKE '%magistrate%'
    OR name ILIKE '%parliament%'
    OR name ILIKE '%prison%'
    OR name ILIKE '%correctional%'
    OR name ILIKE '%government%'
    OR name ILIKE '%ministry of%'
  );

-- Also catch any government entries in other categories
UPDATE businesses
SET category_id = (SELECT id FROM categories WHERE slug = 'government-public-services')
WHERE name ILIKE '%police station%'
   OR name ILIKE '%magistrate%court%';

-- 3. Merge Construction & Trades (8 businesses) into Home & Garden
-- First, update the businesses
UPDATE businesses
SET category_id = (SELECT id FROM categories WHERE slug = 'home-garden')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'construction-trades');

-- Move any category_tags from construction-trades to home-garden
UPDATE category_tags
SET category_id = (SELECT id FROM categories WHERE slug = 'home-garden')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'construction-trades');

-- Rename Home & Garden to include trades
UPDATE categories
SET name = 'Home, Garden & Trades',
    description = 'Hardware stores, furniture, home improvement, gardening, contractors, electricians, and plumbers'
WHERE slug = 'home-garden';

-- 4. Rename Other Services to General Services
UPDATE categories
SET name = 'General Services',
    description = 'Laundry, postal services, storage, and other miscellaneous services in Guyana'
WHERE slug = 'other-services';
