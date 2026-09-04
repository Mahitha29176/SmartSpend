const pool = require('../database/db');
const ApiError = require('../utils/ApiError');

// Returns budgets for a given month/year joined against actual spend in that
// category/month, computed with SQL aggregation rather than in JS.
async function list(userId, month, year) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  const [rows] = await pool.query(
    `SELECT
        b.id,
        b.category,
        b.amount AS budget_amount,
        b.month,
        b.year,
        COALESCE(SUM(e.amount), 0) AS spent
     FROM budgets b
     LEFT JOIN expenses e
        ON e.user_id = b.user_id
       AND e.category = b.category
       AND MONTH(e.expense_date) = b.month
       AND YEAR(e.expense_date) = b.year
     WHERE b.user_id = ? AND b.month = ? AND b.year = ?
     GROUP BY b.id, b.category, b.amount, b.month, b.year
     ORDER BY b.category`,
    [userId, m, y]
  );

  return rows.map((row) => {
    const spent = Number(row.spent);
    const budgetAmount = Number(row.budget_amount);
    const percentUsed = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 1000) / 10 : 0;
    return {
      id: row.id,
      category: row.category,
      month: row.month,
      year: row.year,
      budget_amount: budgetAmount,
      spent,
      remaining: Math.round((budgetAmount - spent) * 100) / 100,
      percent_used: percentUsed,
      warning: percentUsed >= 80,
    };
  });
}

async function create(userId, data) {
  const { category, amount, month, year } = data;
  const [existing] = await pool.query(
    'SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?',
    [userId, category, month, year]
  );
  if (existing.length > 0) {
    throw new ApiError(400, `A budget for ${category} already exists for ${month}/${year}`);
  }

  const [result] = await pool.query(
    'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)',
    [userId, category, amount, month, year]
  );
  return { id: result.insertId, category, amount, month, year };
}

async function update(userId, id, data) {
  const { amount } = data;
  const [rows] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
  if (rows.length === 0) throw new ApiError(404, 'Budget not found');

  await pool.query('UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?', [amount, id, userId]);
  return { id, amount };
}

async function remove(userId, id) {
  const [rows] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
  if (rows.length === 0) throw new ApiError(404, 'Budget not found');
  await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = { list, create, update, remove };
