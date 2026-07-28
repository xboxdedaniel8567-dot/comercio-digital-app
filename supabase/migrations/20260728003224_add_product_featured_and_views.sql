/*
# Add featured flag and view count to products

1. Purpose
   The public store profile needs to show "Destacados" (featured products) and
   "Mas consultados" (most-viewed products) tabs. These require two new columns
   on the existing products table. No existing data is changed or removed.

2. New Columns on `products`
   - `is_featured` (boolean, default false): marks a product as featured by the
     merchant or admin. Used for the "Destacados" tab on the store profile.
   - `view_count` (integer, default 0): counts product-detail page views.
     Used for the "Mas consultados" tab. We name it "Mas consultados" (not
     "Mas vendidos") because views are not sales.

3. Security
   - RLS remains enabled on `products` (no change).
   - No policy changes — existing policies already govern SELECT/INSERT/UPDATE/DELETE.
   - The new columns are readable by anyone who can already SELECT products,
     and writable by anyone who can already UPDATE products.

4. Reversibility
   - Both columns are additive with safe defaults.
   - To reverse: ALTER TABLE products DROP COLUMN is_featured, DROP COLUMN view_count;
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN products.is_featured IS 'Marks a product as featured for the store profile Destacados tab.';
COMMENT ON COLUMN products.view_count IS 'Number of product-detail page views, used for Mas consultados tab.';
