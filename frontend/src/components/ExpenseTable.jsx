import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';

export default function ExpenseTable({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="title">No expenses here yet</div>
        <p>Add your first expense or adjust your filters.</p>
      </div>
    );
  }

  return (
    <table className="ledger-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Payment</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id}>
            <td>{formatDate(e.expense_date)}</td>
            <td>{e.description || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
            <td><span className="category-tag">{e.category}</span></td>
            <td>{e.payment_method}</td>
            <td className="amount figure">{formatCurrency(e.amount)}</td>
            <td>
              <div className="row-actions">
                <Link to={`/expenses/${e.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(e)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
