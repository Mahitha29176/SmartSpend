const authService = require('../services/authService');
const { success } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    success(res, { user, token }, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    success(res, { user, token });
  } catch (err) {
    next(err);
  }
}

// Logout is stateless with JWT -- the frontend simply discards the token.
// This endpoint exists for API completeness / a clean client-side contract.
function logout(req, res) {
  success(res, { message: 'Logged out' });
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
