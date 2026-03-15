-- Add Spanish name column to all category tables
-- Used by i18n to display translated category names

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_es text;
ALTER TABLE event_categories ADD COLUMN IF NOT EXISTS name_es text;
ALTER TABLE tourism_categories ADD COLUMN IF NOT EXISTS name_es text;
ALTER TABLE rental_categories ADD COLUMN IF NOT EXISTS name_es text;

-- Add description_es too for category pages
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_es text;
ALTER TABLE event_categories ADD COLUMN IF NOT EXISTS description_es text;
ALTER TABLE tourism_categories ADD COLUMN IF NOT EXISTS description_es text;
ALTER TABLE rental_categories ADD COLUMN IF NOT EXISTS description_es text;

COMMENT ON COLUMN categories.name_es IS 'Spanish translation of category name';
COMMENT ON COLUMN categories.description_es IS 'Spanish translation of category description';
