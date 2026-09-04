import api from './api';

export async function fetchRecurring() {
  const res = await api.get('/recurring-expenses');
  return res.data.data.recurring;
}

export async function createRecurring(payload) {
  const res = await api.post('/recurring-expenses', payload);
  return res.data.data.recurring;
}

export async function updateRecurring(id, payload) {
  const res = await api.put(`/recurring-expenses/${id}`, payload);
  return res.data.data.recurring;
}

export async function deleteRecurring(id) {
  await api.delete(`/recurring-expenses/${id}`);
}
