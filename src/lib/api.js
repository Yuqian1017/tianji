/**
 * Auth-aware fetch wrapper for API calls.
 * Automatically injects JWT token and handles 401 responses.
 */

const AUTH_TOKEN_KEY = 'tianji-auth-token';

let logoutCallback = null;

/**
 * Set a callback to be invoked when a 401 is received (token expired/invalid).
 * App.jsx sets this on mount.
 */
export function setLogoutCallback(fn) {
  logoutCallback = fn;
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Fetch wrapper that injects auth headers.
 * @param {string} path - API path (e.g. '/api/history')
 * @param {RequestInit} [options] - fetch options
 * @returns {Promise<any>} parsed JSON response
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    console.warn('[api] Received 401 — token expired or invalid');
    clearToken();
    if (logoutCallback) logoutCallback();
    throw new Error('登录已过期，请重新登录');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `请求失败 (${res.status})`);
  }

  return res.json();
}
