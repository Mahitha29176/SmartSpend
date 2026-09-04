import { useEffect, useState, useCallback } from 'react';
import { fetchRecurring, createRecurring, updateRecurring, deleteRecurring } from '../services/recurringService';
import { extractErrorMessage } from '../services/api';
import { CATEGORIES, FREQUENCIES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

const emptyForm = { amount: '', category: 'Bills', description: '', frequency: 'monthly', start_date: new Date().toISOString().slice(0, 10) };

export default function Recurring() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchRecurring());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    try {
      await createRecurring({ ...form, amount: Number(form.amount) });
      setForm(emptyForm);
      setFormOpen(false);
      showToast('Recurring expense added');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function toggleActive(item) {
    try {
      await updateRecurring(item.id, { ...item, active: !item.active });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function confirmDelete() {
    try {
      await deleteRecurring(pendingDelete.id);
      showToast('Recurring expense deleted');
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
          <h1>Recurring expenses</h1>
          <p>Rent, bills, subscriptions — set once, logged automatically when due.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Close' : '+ Add recurring expense'}
        </button>
      </div>

      {formOpen && (
        <form className="card" style={{ marginBottom: 20, maxWidth: 620 }} onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="field">
              <label>Amount (₹)</label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Start date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="field full">
              <label>Description (optional)</label>
              <input type="text" placeholder="e.g. Hostel rent" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Save</button>
        </form>
      )}

      <ErrorMessage>{error}</ErrorMessage>

      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <div className="empty-state">
          <div className="title">No recurring expenses yet</div>
          <p>Add rent, subscriptions, or bills so they're logged automatically.</p>
        </div>
      ) : (
        <div className="card">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Next due</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} style={{ opacity: r.active ? 1 : 0.5 }}>
                  <td>{r.description || r.category}</td>
                  <td><span className="category-tag">{r.category}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{r.frequency}</td>
                  <td>{formatDate(r.next_due_date)}</td>
                  <td className="amount figure">{formatCurrency(r.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(r)}>
                        {r.active ? 'Pause' : 'Resume'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(r)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this recurring expense?"
          message={`"${pendingDelete.description || pendingDelete.category}" will no longer be logged automatically.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
