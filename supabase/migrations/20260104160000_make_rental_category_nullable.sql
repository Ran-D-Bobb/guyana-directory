-- Make category_id nullable since property_type serves the same purpose
ALTER TABLE rentals ALTER COLUMN category_id DROP NOT NULL;
