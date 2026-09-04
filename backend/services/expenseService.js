const pool = require('../database/db');
const ApiError = require('../utils/ApiError');

const SORTABLE_COLUMNS = { date: 'expense_date', amount: 'amount' };

// Builds a WHERE clause + params array from optional query filters.
// Every filter is appended with a parameterized placeholder -- never
// string-concatenated -- so this stays immune to SQL injection.
function buildFilters(userId, query) {
  const clauses = ['user_id = ?'];
  const params = [userId];

  if (query.category) {
    clauses.push('category = ?');
    params.push(query.category);
  }
  if (query.payment_method) {
    clauses.push('payment_method = ?');
    params.push(query.payment_method);
  }
  if (query.date) {
    clauses.push('expense_date = ?');
    params.push(query.date);
  }
  if (query.start_date) {
    clauses.push('expense_date >= ?');
    params.push(query.start_date);
  }
  if (query.end_date) {
    clauses.push('expense_date <= ?');
    params.push(query.end_date);
  }
  if (query.min_amount) {
    clauses.push('amount >= ?');
    params.push(Number(query.min_amount));
  }
  if (query.max_amount) {
    clauses.push('amount <= ?');
    params.push(Number(query.max_amount));
  }
  if (query.search) {
    clauses.push('description LIKE ?');
    params.push(`%${query.search}%`);
  }

  return { where: clauses.join(' AND '), params };
}

async function list(userId, query) {
  const { where, params } = buildFilters(userId, query);

  const sortColumn = SORTABLE_COLUMNS[query.sort_by] || 'expense_date';
  const sortDir = query.sort_dir === 'asc' ? 'ASC' : 'DESC';

  const [rows] = await pool.query(
    `SELECT id, amount, category, description, expense_date, payment_method, created_at
     FROM expenses
     WHERE ${where}
     ORDER BY ${sortColumn} ${sortDir}, id DESC`,
    params
  );
  return rows;
}

async function getById(userId, id) {
  const [rows] = await pool.query(
    `SELECT id, amount, category, description, expense_date, payment_method, created_at
     FROM expenses WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  if (rows.length === 0) throw new ApiError(404, 'Expense not found');
  return rows[0];
}

async function create(userId, data) {
  const { amount, category, description, expense_date, payment_method } = data;
  const [result] = await pool.query(
    `INSERT INTO expenses (user_id, amount, category, description, expense_date, payment_method)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, amount, category, description || null, expense_date, payment_method]
  );
  return getById(userId, result.insertId);
}

async function update(userId, id, data) {
  await getById(userId, id); // throws 404 if missing or not owned by this user
  const { amount, category, description, expense_date, payment_method } = data;
  await pool.query(
    `UPDATE expenses
     SET amount = ?, category = ?, description = ?, expense_date = ?, payment_method = ?
     WHERE id = ? AND user_id = ?`,
    [amount, category, description || null, expense_date, payment_method, id, userId]
  );
  return getById(userId, id);
}

async function remove(userId, id) {
  await getById(userId, id);
  await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = { list, getById, create, update, remove };
