const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function register({ name, email, password }) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name.trim(), email.toLowerCase(), passwordHash]
  );

  const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase() };
  const token = signToken(user.id);
  return { user, token };
}

async function login({ email, password }) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  if (rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const dbUser = rows[0];
  const matches = await bcrypt.compare(password, dbUser.password);
  if (!matches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
  const token = signToken(user.id);
  return { user, token };
}

async function getProfile(userId) {
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) throw new ApiError(404, 'User not found');
  return rows[0];
}

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = { register, login, getProfile };
