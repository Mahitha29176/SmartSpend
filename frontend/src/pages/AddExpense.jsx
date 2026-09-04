import { useNavigate } from 'react-router-dom';
import { createExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import ErrorMessage from '../components/ErrorMessage';
import { useState } from 'react';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddExpense() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  async function handleSubmit(values) {
    try {
      await createExpense(values);
      showToast('Expense added');
      navigate('/expenses');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Add expense</h1>
          <p>Log a new transaction.</p>
        </div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="card" style={{ maxWidth: 620 }}>
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => navigate('/expenses')} submitLabel="Add expense" />
      </div>
    </>
  );
}
