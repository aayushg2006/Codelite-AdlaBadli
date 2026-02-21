require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/api/items/nearby', async (req, res) => {
  const { lat, lon } = req.query;

  if (lat === undefined || lat === '' || lon === undefined || lon === '') {
    return res.status(400).json({ error: 'Query parameters lat and lon are required' });
  }

  const user_lat = parseFloat(lat);
  const user_lon = parseFloat(lon);

  if (Number.isNaN(user_lat) || Number.isNaN(user_lon)) {
    return res.status(400).json({ error: 'lat and lon must be valid numbers' });
  }

  const radius_meters = 5000;

  const { data, error } = await supabase.rpc('get_items_within_radius', {
    user_lat,
    user_lon,
    radius_meters
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

app.post('/api/listings/ai-webhook', async (req, res) => {
  const body = req.body;
  const {
    itemName,
    description,
    category,
    suggestedPriceINR,
    estimatedWeightKg,
    lat,
    lon,
    user_id
  } = body;

  const missing = [];
  if (itemName === undefined || itemName === '') missing.push('itemName');
  if (category === undefined || category === '') missing.push('category');
  if (suggestedPriceINR === undefined) missing.push('suggestedPriceINR');
  if (estimatedWeightKg === undefined) missing.push('estimatedWeightKg');
  if (lat === undefined) missing.push('lat');
  if (lon === undefined) missing.push('lon');
  if (user_id === undefined || user_id === '') missing.push('user_id');

  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing
    });
  }

  const p_user_lat = typeof lat === 'number' ? lat : parseFloat(lat);
  const p_user_lon = typeof lon === 'number' ? lon : parseFloat(lon);
  if (Number.isNaN(p_user_lat) || Number.isNaN(p_user_lon)) {
    return res.status(400).json({ error: 'lat and lon must be valid numbers' });
  }

  const authHeader = req.headers.authorization;
  const supabaseUserClient = authHeader
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: { headers: { Authorization: authHeader } }
      })
    : supabase;

  const mappedData = {
    p_title: itemName,
    p_description: description ?? null,
    p_category: category,
    p_price: suggestedPriceINR,
    p_ai_metadata: { estimatedWeightKg },
    p_user_id: user_id,
    p_user_lat,
    p_user_lon
  };

  const { data, error } = await supabaseUserClient.rpc('insert_listing_with_location', mappedData);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
});

app.post('/api/swaps/propose', requireAuth, async (req, res) => {
  const { desired_listing_id, offered_listing_id } = req.body;

  if (!desired_listing_id || !offered_listing_id) {
    return res.status(400).json({
      error: 'Both desired_listing_id and offered_listing_id are required'
    });
  }

  const user_1_id = req.user.id;

  const { data: desiredListing, error: fetchError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', desired_listing_id)
    .single();

  if (fetchError || !desiredListing) {
    return res.status(500).json({
      error: fetchError?.message || 'Desired listing not found or database error'
    });
  }

  const user_2_id = desiredListing.user_id;

  const { data: match, error: insertError } = await supabase
    .from('matches')
    .insert({
      user_1_id,
      user_2_id,
      listing_1_id: offered_listing_id,
      listing_2_id: desired_listing_id,
      status: 'pending'
    })
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(201).json(match);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
