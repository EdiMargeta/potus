const BASE = import.meta.env.VITE_API_URL || '';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Events
  getEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req(`/events${q ? '?' + q : ''}`);
  },
  getEvent: (id) => req(`/events/${id}`),

  // Promises
  getPromises: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req(`/promises${q ? '?' + q : ''}`);
  },
  getPromiseStats: () => req('/promises/stats'),

  // Comments
  getComments: (eventId) => req(`/comments/${eventId}`),
  postComment: (data) => req('/comments', { method: 'POST', body: data }),
  upvoteComment: (id) => req(`/comments/${id}/upvote`, { method: 'POST' }),
  flagComment: (id) => req(`/comments/${id}/flag`, { method: 'POST' }),

  // Reactions
  postReaction: (event_id, type) => req('/reactions', { method: 'POST', body: { event_id, type } }),

  // Admin
  verifyAdmin: (password) => req('/admin/verify', { method: 'POST', body: { password } }),
  adminReq: (path, method, body, password) =>
    req(`/admin${path}`, { method, body, headers: { 'x-admin-password': password } }),
};
