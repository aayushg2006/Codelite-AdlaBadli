require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Supabase & Gemini
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// -------------------------------------------------------------------
// 1. THE AI SCANNER ROUTE
// -------------------------------------------------------------------
app.post('/api/scan', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl in request body" });
    }

    console.log("Downloading image for AI analysis:", imageUrl);

    // 1. Fetch the image from the public Supabase URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from Supabase: ${imageResponse.statusText}`);
    }
    
    // 2. Convert the image to Base64 format for Gemini
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 3. Initialize the Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analyze the provided image of a secondhand item. Return strictly a JSON object with no markdown formatting or backticks. 
      The JSON must include exactly these keys: 
      "itemName" (a short, catchy title), 
      "description" (A highly detailed, engaging 2-3 sentence description of the item, noting its visual condition, utility, and appeal based on the image),
      "category" (e.g., Electronics, Furniture, Clothing, Books), 
      "suggestedPriceINR" (a realistic secondhand price in INR as an integer),
      "estimatedWeightKg" (a realistic number for carbon offset math as a float).
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    // 4. Send to Gemini
    console.log("Sending to Gemini...");
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // 5. Clean up the response to ensure it is valid JSON
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    console.log("AI Analysis Complete:", parsedData);
    
    // 6. Return the data to React
    return res.json(parsedData);

  } catch (error) {
    console.error("AI Scan Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});


// -------------------------------------------------------------------
// 2. GEOFENCED LISTINGS ROUTE
// -------------------------------------------------------------------
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
    user_lat, user_lon, radius_meters
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});


// -------------------------------------------------------------------
// 3. SAVE LISTING ROUTE
// -------------------------------------------------------------------
app.post('/api/listings/ai-webhook', async (req, res) => {
  const body = req.body;
  const { itemName, description, category, suggestedPriceINR, estimatedWeightKg, lat, lon, user_id } = body;

  const missing = [];
  if (!itemName) missing.push('itemName');
  if (!category) missing.push('category');
  if (suggestedPriceINR === undefined) missing.push('suggestedPriceINR');
  if (estimatedWeightKg === undefined) missing.push('estimatedWeightKg');
  if (lat === undefined) missing.push('lat');
  if (lon === undefined) missing.push('lon');
  if (!user_id) missing.push('user_id');

  if (missing.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', missing });
  }

  const p_user_lat = typeof lat === 'number' ? lat : parseFloat(lat);
  const p_user_lon = typeof lon === 'number' ? lon : parseFloat(lon);
  const weightNum = typeof estimatedWeightKg === 'number' ? estimatedWeightKg : parseFloat(estimatedWeightKg);

  const authHeader = req.headers.authorization;
  const supabaseUserClient = authHeader
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, { global: { headers: { Authorization: authHeader } } })
    : supabase;

  const mappedData = {
    title: itemName,
    description: description ?? itemName,
    category: category,
    price: suggestedPriceINR,
    ai_metadata: { estimatedWeightKg: weightNum },
    user_id: user_id,
    user_lat: p_user_lat,
    user_lon: p_user_lon
  };

  const { data, error } = await supabaseUserClient.rpc('insert_listing_with_location', mappedData);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});


// -------------------------------------------------------------------
// 4. SWAP PROPOSAL ROUTES
// -------------------------------------------------------------------
app.post('/api/swaps/propose', requireAuth, async (req, res) => {
  const { desired_listing_id, offered_listing_id } = req.body;

  if (!desired_listing_id || !offered_listing_id) {
    return res.status(400).json({ error: 'Both desired_listing_id and offered_listing_id are required' });
  }

  const user_1_id = req.user.id;

  const { data: desiredListing, error: fetchError } = await supabase
    .from('listings').select('user_id').eq('id', desired_listing_id).single();

  if (fetchError || !desiredListing) return res.status(500).json({ error: 'Desired listing not found' });

  const user_2_id = desiredListing.user_id;

  const { data: match, error: insertError } = await supabase
    .from('matches')
    .insert({ user_1_id, user_2_id, listing_1_id: offered_listing_id, listing_2_id: desired_listing_id, status: 'pending' })
    .select().single();

  if (insertError) return res.status(500).json({ error: insertError.message });
  return res.status(201).json(match);
});


app.put('/api/swaps/:id/respond', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;
  const user_id = req.user.id;

  if (!['accept', 'reject'].includes(response)) return res.status(400).json({ error: "Response must be 'accept' or 'reject'" });

  const { data: match, error: fetchError } = await supabase
    .from('matches').select('*').eq('id', id).eq('user_2_id', user_id).eq('status', 'pending').single();

  if (fetchError || !match) return res.status(404).json({ error: 'Pending match not found or unauthorized' });

  const newStatus = response === 'accept' ? 'accepted' : 'rejected';

  const { data: updatedMatch, error: updateError } = await supabase
    .from('matches').update({ status: newStatus }).eq('id', id).select().single();

  if (updateError) return res.status(500).json({ error: updateError.message });
  return res.json(updatedMatch);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));