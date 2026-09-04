import api from './api';

export async function fetchBudgets(month, year) {
  const res = await api.get('/budgets', { params: { month, year } });
  return res.data.data.budgets;
}

export async function createBudget(payload) {
  const res = await api.post('/budgets', payload);
  return res.data.data.budget;
}

export async function updateBudget(id, payload) {
  const res = await api.put(`/budgets/${id}`, payload);
  return res.data.data.budget;
}

export async function deleteBudget(id) {
  await api.delete(`/budgets/${id}`);
}
