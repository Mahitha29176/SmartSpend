import { useEffect, useState } from 'react';
import { fetchSummary, fetchCategorySummary, fetchMonthlySummary } from '../services/dashboardService';
import { formatCurrency, formatDate, monthLabel } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SummaryCard from '../components/SummaryCard';
import { extractErrorMessage } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, c, m] = await Promise.all([fetchSummary(), fetchCategorySummary(), fetchMonthlySummary()]);
        setSummary(s);
        setCategories(c);
        setMonths(m);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  const maxCategory = Math.max(...categories.map((c) => c.total), 1);
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your spending at a glance.</p>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Total expenses" value={formatCurrency(summary.total_expenses)} />
        <SummaryCard label="This month" value={formatCurrency(summary.this_month_expenses)} />
        <SummaryCard label="Today" value={formatCurrency(summary.today_expenses)} />
        <SummaryCard label="Average daily" value={formatCurrency(summary.average_daily_expense)} />
      </div>

      <div className="two-col">
        <div className="card">
          <h3 className="section-title">Spending by category</h3>
          {categories.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>No expenses recorded yet.</p>}
          {categories.map((c) => (
            <div className="bar-row" key={c.category}>
              <span>{c.category}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.total / maxCategory) * 100}%` }} /></div>
              <span className="bar-amount figure">{formatCurrency(c.total)}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="section-title">Recent transactions</h3>
          {summary.recent_transactions.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Nothing yet.</p>}
          {summary.recent_transactions.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--hairline)', fontSize: 13.5 }}>
              <div>
                <div>{t.description || t.category}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(t.expense_date)} · {t.category}</div>
              </div>
              <div className="figure" style={{ fontWeight: 600 }}>{formatCurrency(t.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {months.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 className="section-title">Monthly spending</h3>
          {months.map((m) => (
            <div className="bar-row" key={m.month}>
              <span>{monthLabel(m.month)}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(m.total / maxMonth) * 100}%` }} /></div>
              <span className="bar-amount figure">{formatCurrency(m.total)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
