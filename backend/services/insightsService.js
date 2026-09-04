const pool = require('../database/db');

// Generates plain-English spending insights purely from SQL aggregates and
// arithmetic -- no AI API involved, per the project constraints.
async function insights(userId) {
  const results = [];

  // This month vs last month, overall.
  const [[monthCompare]] = await pool.query(
    `SELECT
        COALESCE(SUM(CASE WHEN YEAR(expense_date) = YEAR(CURDATE()) AND MONTH(expense_date) = MONTH(CURDATE()) THEN amount ELSE 0 END), 0) AS this_month,
        COALESCE(SUM(CASE WHEN YEAR(expense_date) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(expense_date) = MONTH(CURDATE() - INTERVAL 1 MONTH) THEN amount ELSE 0 END), 0) AS last_month
     FROM expenses WHERE user_id = ?`,
    [userId]
  );

  const thisMonth = Number(monthCompare.this_month);
  const lastMonth = Number(monthCompare.last_month);

  if (lastMonth > 0) {
    const diff = thisMonth - lastMonth;
    const pct = Math.round((Math.abs(diff) / lastMonth) * 1000) / 10;
    if (diff > 0) {
      results.push(`You spent ${pct}% more this month (₹${thisMonth.toFixed(2)}) than last month (₹${lastMonth.toFixed(2)}).`);
    } else if (diff < 0) {
      results.push(`You spent ₹${Math.abs(diff).toFixed(2)} less this month compared with last month, a ${pct}% drop.`);
    } else {
      results.push(`Your spending this month matches last month exactly.`);
    }
  }

  // Highest spending category overall.
  const [[topCategory]] = await pool.query(
    `SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ?
     GROUP BY category ORDER BY total DESC LIMIT 1`,
    [userId]
  );
  if (topCategory) {
    results.push(`Your highest spending category is ${topCategory.category} at ₹${Number(topCategory.total).toFixed(2)}.`);
  }

  // Average daily spend this month.
  const [[avgRow]] = await pool.query(
    `SELECT COALESCE(AVG(daily_total), 0) AS avg_daily FROM (
        SELECT expense_date, SUM(amount) AS daily_total
        FROM expenses
        WHERE user_id = ? AND YEAR(expense_date) = YEAR(CURDATE()) AND MONTH(expense_date) = MONTH(CURDATE())
        GROUP BY expense_date
     ) AS daily`,
    [userId]
  );
  results.push(`Your average daily spending this month is ₹${Number(avgRow.avg_daily).toFixed(2)}.`);

  // Category that grew the most vs last month (food-style comparison, generalized).
  const [categoryDeltas] = await pool.query(
    `SELECT
        category,
        COALESCE(SUM(CASE WHEN YEAR(expense_date) = YEAR(CURDATE()) AND MONTH(expense_date) = MONTH(CURDATE()) THEN amount ELSE 0 END), 0) AS this_month,
        COALESCE(SUM(CASE WHEN YEAR(expense_date) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(expense_date) = MONTH(CURDATE() - INTERVAL 1 MONTH) THEN amount ELSE 0 END), 0) AS last_month
     FROM expenses WHERE user_id = ?
     GROUP BY category`,
    [userId]
  );
  let biggestJump = null;
  for (const row of categoryDeltas) {
    const tm = Number(row.this_month);
    const lm = Number(row.last_month);
    if (lm > 0) {
      const pct = ((tm - lm) / lm) * 100;
      if (pct > 0 && (!biggestJump || pct > biggestJump.pct)) {
        biggestJump = { category: row.category, pct: Math.round(pct * 10) / 10 };
      }
    }
  }
  if (biggestJump) {
    results.push(`You spent ${biggestJump.pct}% more on ${biggestJump.category} this month than last month.`);
  }

  return results;
}

module.exports = { insights };
