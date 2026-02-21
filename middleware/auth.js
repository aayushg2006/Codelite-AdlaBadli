/**
 * Mock auth middleware so server boots when running from repo root.
 * Replace with real Supabase JWT auth (see backend/middleware/auth.js) when using backend/server.js.
 */
function requireAuth(req, res, next) {
  req.user = { id: 'mock-user-id' };
  next();
}

module.exports = { requireAuth };
