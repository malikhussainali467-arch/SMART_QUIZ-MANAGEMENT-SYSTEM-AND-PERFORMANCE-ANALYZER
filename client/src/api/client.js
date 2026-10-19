// The only place that talks to the server. Every call returns JSON or throws an Error with a readable message.
const TOKEN_KEY = 'smartquiz_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(method, url, body) {
  const token = tokenStore.get();
  let response;
  try {
    response = await fetch(`/api${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('auth-expired'));
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body = {}) => request('POST', url, body),
  put: (url, body = {}) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
};
