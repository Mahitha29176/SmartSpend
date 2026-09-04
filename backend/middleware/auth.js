const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Verifies the JWT sent as "Authorization: Bearer <token>" and attaches the
// decoded user id to req.user. Every route that touches a user's own data
// (expenses, budgets, recurring expenses) sits behind this.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = requireAuth;
