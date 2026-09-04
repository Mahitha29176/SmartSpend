import { useEffect, useState, useCallback } from 'react';
import { fetchBudgets, createBudget, deleteBudget } from '../services/budgetService';
import { extractErrorMessage } from '../services/api';
import { CATEGORIES } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BudgetCard from '../components/BudgetCard';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

const now = new Date();

export default function Budgets() {
  const { showToast } = useToast();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Food', amount: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBudgets(month, year);
      setBudgets(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter a budget amount greater than 0');
      return;
    }
    try {
      await createBudget({ category: form.category, amount: Number(form.amount), month, year });
      setForm({ category: 'Food', amount: '' });
      setFormOpen(false);
      showToast('Budget created');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function confirmDelete() {
    try {
      await deleteBudget(pendingDelete.id);
      showToast('Budget deleted');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p>Set monthly limits per category and track how close you are to them.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Close' : '+ Set a budget'}
        </button>
      </div>

      <div className="filter-panel" style={{ marginBottom: 16 }}>
        <div className="field">
          <label>Month</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('en-IN', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Year</label>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
      </div>

      {formOpen && (
        <form className="card" style={{ marginBottom: 20, maxWidth: 460 }} onSubmit={handleCreate}>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Monthly budget (₹)</label>
            <input type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Save budget</button>
        </form>
      )}

      <ErrorMessage>{error}</ErrorMessage>

      {loading ? <LoadingSpinner /> : budgets.length === 0 ? (
        <div className="empty-state">
          <div className="title">No budgets set for this month</div>
          <p>Set a category budget to start tracking against it.</p>
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map((b) => <BudgetCard key={b.id} budget={b} onDelete={setPendingDelete} />)}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this budget?"
          message={`This removes the ${pendingDelete.category} budget for this month.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
