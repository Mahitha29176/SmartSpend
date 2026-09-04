import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchExpenses, deleteExpense } from '../services/expenseService';
import { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ExpenseTable from '../components/ExpenseTable';
import FilterPanel from '../components/FilterPanel';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function Expenses() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({ sort_by: 'date', sort_dir: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchExpenses(filters);
      setExpenses(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    try {
      await deleteExpense(pendingDelete.id);
      setExpenses((prev) => prev.filter((e) => e.id !== pendingDelete.id));
      showToast('Expense deleted');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPendingDelete(null);
    }
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>{expenses.length} expense{expenses.length !== 1 ? 's' : ''} · ₹{total.toFixed(2)} total</p>
        </div>
        <Link to="/expenses/new" className="btn btn-primary">+ Add expense</Link>
      </div>

      <FilterPanel filters={filters} onChange={setFilters} onReset={() => setFilters({ sort_by: 'date', sort_dir: 'desc' })} />

      <ErrorMessage>{error}</ErrorMessage>

      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <ExpenseTable expenses={expenses} onDelete={setPendingDelete} />
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this expense?"
          message={`This will permanently remove "${pendingDelete.description || pendingDelete.category}" (₹${pendingDelete.amount}).`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
