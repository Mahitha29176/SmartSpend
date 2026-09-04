import api from './api';

export async function fetchExpenses(filters = {}) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
  const res = await api.get('/expenses', { params });
  return res.data.data.expenses;
}

export async function fetchExpense(id) {
  const res = await api.get(`/expenses/${id}`);
  return res.data.data.expense;
}

export async function createExpense(payload) {
  const res = await api.post('/expenses', payload);
  return res.data.data.expense;
}

export async function updateExpense(id, payload) {
  const res = await api.put(`/expenses/${id}`, payload);
  return res.data.data.expense;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
