const pool = require('../database/db');

// All figures below are computed with SQL aggregation (SUM, AVG, GROUP BY,
// date functions) rather than fetching every row and reducing in JS -- this
// is the "SQL does the math" requirement in practice.

async function summary(userId) {
  const [[totals]] = await pool.query(
    `SELECT
        COALESCE(SUM(amount), 0) AS total,
        COALESCE(SUM(CASE WHEN MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) AS this_month,
        COALESCE(SUM(CASE WHEN expense_date = CURDATE() THEN amount ELSE 0 END), 0) AS today
     FROM expenses WHERE user_id = ?`,
    [userId]
  );

  const [[dayCount]] = await pool.query(
    `SELECT COUNT(DISTINCT expense_date) AS days FROM expenses WHERE user_id = ?`,
    [userId]
  );

  const days = dayCount.days || 1;
  const avgDaily = Number(totals.total) / days;

  const [recent] = await pool.query(
    `SELECT id, amount, category, description, expense_date, payment_method
     FROM expenses WHERE user_id = ? ORDER BY expense_date DESC, id DESC LIMIT 5`,
    [userId]
  );

  return {
    total_expenses: Number(totals.total),
    this_month_expenses: Number(totals.this_month),
    today_expenses: Number(totals.today),
    average_daily_expense: Math.round(avgDaily * 100) / 100,
    recent_transactions: recent,
  };
}

async function categorySummary(userId) {
  const [rows] = await pool.query(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count
     FROM expenses WHERE user_id = ?
     GROUP BY category
     ORDER BY total DESC`,
    [userId]
  );
  return rows.map((r) => ({ category: r.category, total: Number(r.total), count: r.count }));
}

async function monthlySummary(userId) {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, SUM(amount) AS total
     FROM expenses WHERE user_id = ?
     GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
     ORDER BY month ASC
     LIMIT 12`,
    [userId]
  );
  return rows.map((r) => ({ month: r.month, total: Number(r.total) }));
}

module.exports = { summary, categorySummary, monthlySummary };
