-- Add display_order to categories for reordering
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add display_order to regions for reordering
ALTER TABLE regions ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing categories with sequential display_order based on name
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 as new_order
  FROM categories
)
UPDATE categories
SET display_order = ordered.new_order
FROM ordered
WHERE categories.id = ordered.id;

-- Update existing regions with sequential display_order based on name
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 as new_order
  FROM regions
)
UPDATE regions
SET display_order = ordered.new_order
FROM ordered
WHERE regions.id = ordered.id;

-- Create indexes for display_order
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_regions_display_order ON regions(display_order);

-- Add RLS policies for admin management of categories
CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (is_admin());

-- Add RLS policies for admin management of regions
CREATE POLICY "Admins can insert regions" ON regions
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update regions" ON regions
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete regions" ON regions
  FOR DELETE USING (is_admin());

-- Function to reorder categories (shift others down when moving one up)
CREATE OR REPLACE FUNCTION reorder_category(
  category_id UUID,
  new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  old_order INTEGER;
BEGIN
  -- Get current order
  SELECT display_order INTO old_order FROM categories WHERE id = category_id;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Category not found';
  END IF;

  IF old_order = new_order THEN
    RETURN;
  END IF;

  -- Shift other categories
  IF new_order < old_order THEN
    -- Moving up: shift items between new and old position down
    UPDATE categories
    SET display_order = display_order + 1
    WHERE display_order >= new_order AND display_order < old_order AND id != category_id;
  ELSE
    -- Moving down: shift items between old and new position up
    UPDATE categories
    SET display_order = display_order - 1
    WHERE display_order > old_order AND display_order <= new_order AND id != category_id;
  END IF;

  -- Set new position
  UPDATE categories SET display_order = new_order WHERE id = category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder regions
CREATE OR REPLACE FUNCTION reorder_region(
  region_id UUID,
  new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  old_order INTEGER;
BEGIN
  -- Get current order
  SELECT display_order INTO old_order FROM regions WHERE id = region_id;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Region not found';
  END IF;

  IF old_order = new_order THEN
    RETURN;
  END IF;

  -- Shift other regions
  IF new_order < old_order THEN
    -- Moving up: shift items between new and old position down
    UPDATE regions
    SET display_order = display_order + 1
    WHERE display_order >= new_order AND display_order < old_order AND id != region_id;
  ELSE
    -- Moving down: shift items between old and new position up
    UPDATE regions
    SET display_order = display_order - 1
    WHERE display_order > old_order AND display_order <= new_order AND id != region_id;
  END IF;

  -- Set new position
  UPDATE regions SET display_order = new_order WHERE id = region_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
