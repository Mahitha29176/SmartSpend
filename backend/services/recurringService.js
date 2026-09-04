const pool = require('../database/db');
const ApiError = require('../utils/ApiError');

async function list(userId) {
  const [rows] = await pool.query(
    `SELECT id, amount, category, description, frequency, start_date, next_due_date, active
     FROM recurring_expenses WHERE user_id = ? ORDER BY next_due_date ASC`,
    [userId]
  );
  return rows;
}

async function create(userId, data) {
  const { amount, category, description, frequency, start_date } = data;
  const [result] = await pool.query(
    `INSERT INTO recurring_expenses (user_id, amount, category, description, frequency, start_date, next_due_date, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [userId, amount, category, description || null, frequency, start_date, start_date]
  );
  return getById(userId, result.insertId);
}

async function getById(userId, id) {
  const [rows] = await pool.query(
    'SELECT * FROM recurring_expenses WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (rows.length === 0) throw new ApiError(404, 'Recurring expense not found');
  return rows[0];
}

async function update(userId, id, data) {
  await getById(userId, id);
  const { amount, category, description, frequency, active } = data;
  await pool.query(
    `UPDATE recurring_expenses
     SET amount = ?, category = ?, description = ?, frequency = ?, active = ?
     WHERE id = ? AND user_id = ?`,
    [amount, category, description || null, frequency, active !== undefined ? active : true, id, userId]
  );
  return getById(userId, id);
}

async function remove(userId, id) {
  await getById(userId, id);
  await pool.query('DELETE FROM recurring_expenses WHERE id = ? AND user_id = ?', [id, userId]);
}

// Advances next_due_date by one frequency step in MySQL, e.g. monthly -> +1 MONTH.
const INTERVAL_SQL = {
  daily: 'INTERVAL 1 DAY',
  weekly: 'INTERVAL 1 WEEK',
  monthly: 'INTERVAL 1 MONTH',
  yearly: 'INTERVAL 1 YEAR',
};

// Called on a schedule (e.g. once a day via a cron job or on server start)
// to turn any due recurring expense into a real expense row and roll its
// next_due_date forward. Kept idempotent-per-day by only processing rows
// whose next_due_date has actually arrived.
async function processDueRecurring() {
  const [due] = await pool.query(
    `SELECT * FROM recurring_expenses WHERE active = TRUE AND next_due_date <= CURDATE()`
  );

  for (const item of due) {
    await pool.query(
      `INSERT INTO expenses (user_id, amount, category, description, expense_date, payment_method)
       VALUES (?, ?, ?, ?, ?, 'Bank Transfer')`,
      [item.user_id, item.amount, item.category, item.description || `Recurring: ${item.category}`, item.next_due_date]
    );

    const interval = INTERVAL_SQL[item.frequency];
    await pool.query(
      `UPDATE recurring_expenses SET next_due_date = DATE_ADD(next_due_date, ${interval}) WHERE id = ?`,
      [item.id]
    );
  }

  return due.length;
}

module.exports = { list, create, update, remove, processDueRecurring };
