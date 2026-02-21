require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
