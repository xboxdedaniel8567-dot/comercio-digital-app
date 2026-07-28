/*
# Idempotent schema safety net for public store profile

## Purpose
The public store profile page (/tiendas/[slug]) references several columns and
a related table that may or may not exist depending on when migrations were
applied. This migration ensures ALL of them exist so the page never crashes
with a 500/Error 1101 due to a missing column or relation.

This migration is fully idempotent — every statement uses IF NOT EXISTS or
DROP-then-CREATE for policies, so it can be re-run safely.

## Changes

### 1. businesses.cover_url
- Adds `cover_url` (text, nullable) to `businesses` if it does not exist.
- Used for the store profile cover image.

### 2. products.is_featured
- Adds `is_featured` (boolean, default false) to `products` if it does not exist.
- Used for the "Destacados" tab on the store profile.

### 3. products.view_count
- Adds `view_count` (integer, default 0) to `products` if it does not exist.
- Used for the "Mas consultados" tab on the store profile.

### 4. business_gallery_images table
- Creates the table if it does not exist, with:
  - id (uuid, primary key, default gen_random_uuid())
  - business_id (uuid, not null, references businesses(id) on delete cascade)
  - url (text, not null)
  - alt_text (text, nullable)
  - sort_order (integer, default 0)
  - created_at (timestamptz, default now())
- Adds an index on business_id for efficient lookups.

### 5. Foreign keys
- business_gallery_images.business_id -> businesses.id (ON DELETE CASCADE)

### 6. RLS on business_gallery_images
- Enables RLS.
- Public SELECT: anyone can read images belonging to active businesses.
- Owner INSERT/UPDATE/DELETE: only the business owner can manage their images.
- Admin ALL: admins and super_admins can manage any business's images.

### 7. Indexes
- Index on business_gallery_images.business_id for query performance.

## Data Safety
- No existing data is deleted, renamed, or modified.
- All statements are additive and conditional (IF NOT EXISTS).
- RLS policies are dropped before creation to ensure idempotency.

## Important Notes
1. If any of these objects already exist, the migration skips them.
2. The migration does NOT change existing column types or constraints.
3. The migration does NOT disable or weaken any existing RLS policies.
*/

-- ─── 1. businesses.cover_url ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'businesses'
      AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE businesses ADD COLUMN cover_url text;
  END IF;
END $$;

-- ─── 2. products.is_featured ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ─── 3. products.view_count ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'view_count'
  ) THEN
    ALTER TABLE products ADD COLUMN view_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─── 4. business_gallery_images table ───
CREATE TABLE IF NOT EXISTS business_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 5. Index on business_id ───
CREATE INDEX IF NOT EXISTS idx_business_gallery_images_business_id
  ON business_gallery_images(business_id);

-- ─── 6. RLS on business_gallery_images ───
ALTER TABLE business_gallery_images ENABLE ROW LEVEL SECURITY;

-- Public SELECT: anyone can read images of active businesses
DROP POLICY IF EXISTS "Public can read active business gallery images" ON business_gallery_images;
CREATE POLICY "Public can read active business gallery images"
  ON business_gallery_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_gallery_images.business_id
        AND businesses.status = 'active'
    )
  );

-- Owner INSERT: only the business owner can add images
DROP POLICY IF EXISTS "Owners can insert own business gallery images" ON business_gallery_images;
CREATE POLICY "Owners can insert own business gallery images"
  ON business_gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_gallery_images.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Owner UPDATE: only the business owner can update their images
DROP POLICY IF EXISTS "Owners can update own business gallery images" ON business_gallery_images;
CREATE POLICY "Owners can update own business gallery images"
  ON business_gallery_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_gallery_images.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_gallery_images.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Owner DELETE: only the business owner can delete their images
DROP POLICY IF EXISTS "Owners can delete own business gallery images" ON business_gallery_images;
CREATE POLICY "Owners can delete own business gallery images"
  ON business_gallery_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_gallery_images.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Admin ALL: admins and super_admins can manage any business's images
DROP POLICY IF EXISTS "Admins can manage business gallery images" ON business_gallery_images;
CREATE POLICY "Admins can manage business gallery images"
  ON business_gallery_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );
