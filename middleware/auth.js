require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Express middleware to protect routes using Supabase JWT authentication.
 * Expects: Authorization: Bearer <token>
 * On success: sets req.user and calls next().
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  if (!data?.user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = data.user;
  next();
}

module.exports = { requireAuth };
