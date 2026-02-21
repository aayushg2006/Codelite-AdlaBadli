-- Run this script in the Supabase SQL Editor to create the insert_listing_with_location function.
-- Requires: listings table with columns title, category, price, ai_metadata, user_id, location (geography).
-- PostGIS uses (longitude, latitude) order for ST_MakePoint.

-- Parameter names must match the keys sent from Express: title, category, price, ai_metadata, user_id, user_lat, user_lon

CREATE OR REPLACE FUNCTION insert_listing_with_location(
  title TEXT,
  category TEXT,
  price NUMERIC,
  ai_metadata JSONB,
  user_id UUID,
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row RECORD;
BEGIN
  INSERT INTO listings (
    title,
    category,
    price,
    ai_metadata,
    user_id,
    location
  ) VALUES (
    title,
    category,
    price,
    ai_metadata,
    user_id,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
  )
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row);
END;
$$;
