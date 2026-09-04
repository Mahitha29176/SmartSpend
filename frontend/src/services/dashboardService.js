import api from './api';

export async function fetchSummary() {
  const res = await api.get('/dashboard/summary');
  return res.data.data;
}

export async function fetchCategorySummary() {
  const res = await api.get('/dashboard/category-summary');
  return res.data.data.categories;
}

export async function fetchMonthlySummary() {
  const res = await api.get('/dashboard/monthly-summary');
  return res.data.data.months;
}

export async function fetchInsights() {
  const res = await api.get('/dashboard/insights');
  return res.data.data.insights;
}
