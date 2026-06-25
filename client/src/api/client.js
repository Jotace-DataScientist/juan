const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  generateQuestion: (token, payload) => request('/questions/generate', { method: 'POST', body: payload, token }),
  getBank: (token, params) => request(`/questions/bank?${new URLSearchParams(params)}`, { token }),
  getFlashcards: (token) => request('/flashcards', { token }),
  createSession: (token, payload) => request('/sessions', { method: 'POST', body: payload, token }),
  logAttempt: (token, sessionId, payload) => request(`/sessions/${sessionId}/attempts`, { method: 'POST', body: payload, token }),
  finalizeSession: (token, sessionId, payload) => request(`/sessions/${sessionId}`, { method: 'PATCH', body: payload, token }),
  getHistory: (token, params) => request(`/history?${new URLSearchParams(params)}`, { token }),
  clearHistory: (token) => request('/history', { method: 'DELETE', token }),
  getDashboard: (token) => request('/dashboard', { token }),
};
