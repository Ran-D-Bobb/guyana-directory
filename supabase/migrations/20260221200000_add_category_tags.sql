-- ============================================
-- Curated Tags for Businesses
-- Tags are scoped to categories (admin-defined)
-- Businesses can have multiple tags from their category
-- ============================================

-- 1. Create category_tags table
CREATE TABLE category_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 2. Create business_tags junction table
CREATE TABLE business_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES category_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, tag_id)
);

-- 3. Indexes
CREATE INDEX idx_category_tags_category ON category_tags(category_id);
CREATE INDEX idx_category_tags_slug ON category_tags(slug);
CREATE INDEX idx_category_tags_display_order ON category_tags(category_id, display_order);
CREATE INDEX idx_business_tags_business ON business_tags(business_id);
CREATE INDEX idx_business_tags_tag ON business_tags(tag_id);
CREATE INDEX idx_business_tags_tag_business ON business_tags(tag_id, business_id);

-- 4. Enable RLS
ALTER TABLE category_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_tags ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for category_tags
CREATE POLICY "Category tags are viewable by everyone" ON category_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert category tags" ON category_tags
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update category tags" ON category_tags
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete category tags" ON category_tags
  FOR DELETE USING (is_admin());

-- 6. RLS Policies for business_tags
CREATE POLICY "Business tags are viewable by everyone" ON business_tags
  FOR SELECT USING (true);

CREATE POLICY "Business owners can add their tags" ON business_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_tags.business_id
      AND businesses.owner_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Business owners can remove their tags" ON business_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_tags.business_id
      AND businesses.owner_id = auth.uid()
    ) OR is_admin()
  );
