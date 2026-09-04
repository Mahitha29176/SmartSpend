import { useState } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

const empty = {
  amount: '',
  category: 'Food',
  description: '',
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: 'Cash',
};

export default function ExpenseForm({ initial, onSubmit, onCancel, submitLabel = 'Save expense' }) {
  const [values, setValues] = useState(initial ? { ...empty, ...initial } : empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!values.amount || Number(values.amount) <= 0) errs.amount = 'Enter an amount greater than 0';
    if (!values.expense_date) errs.expense_date = 'Pick a date';
    if (values.description && values.description.length > 255) errs.description = 'Keep it under 255 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...values, amount: Number(values.amount) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={values.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={values.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="expense_date">Date</label>
          <input
            id="expense_date"
            type="date"
            value={values.expense_date?.slice(0, 10)}
            onChange={(e) => set('expense_date', e.target.value)}
          />
          {errors.expense_date && <span className="field-error">{errors.expense_date}</span>}
        </div>

        <div className="field">
          <label htmlFor="payment_method">Payment method</label>
          <select id="payment_method" value={values.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="field full">
          <label htmlFor="description">Description (optional)</label>
          <input
            id="description"
            type="text"
            placeholder="e.g. Groceries at DMart"
            value={values.description || ''}
            onChange={(e) => set('description', e.target.value)}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
