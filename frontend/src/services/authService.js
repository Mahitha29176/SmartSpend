import api from './api';

export async function registerUser(payload) {
  const res = await api.post('/auth/register', payload);
  return res.data.data;
}

export async function loginUser(payload) {
  const res = await api.post('/auth/login', payload);
  return res.data.data;
}

export async function logoutUser() {
  await api.post('/auth/logout');
}

export async function fetchProfile() {
  const res = await api.get('/auth/me');
  return res.data.data.user;
}
