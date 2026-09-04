import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchExpense, updateExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [expense, setExpense] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchExpense(id);
        setExpense(data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(values) {
    try {
      await updateExpense(id, values);
      showToast('Expense updated');
      navigate('/expenses');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Edit expense</h1>
          <p>Update the details of this transaction.</p>
        </div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingSpinner /> : expense && (
        <div className="card" style={{ maxWidth: 620 }}>
          <ExpenseForm initial={expense} onSubmit={handleSubmit} onCancel={() => navigate('/expenses')} submitLabel="Save changes" />
        </div>
      )}
    </>
  );
}
