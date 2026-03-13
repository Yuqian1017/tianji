// History persistence — API-based (with localStorage migration support)
import { apiFetch } from './api.js';

export const HISTORY_KEY = 'tianji-history';
export const MAX_HISTORY = 500;

/**
 * Load history from server.
 * @param {string} [module] - Optional module filter
 * @returns {Promise<Array>}
 */
export async function loadHistoryFromServer(module) {
  try {
    const url = module ? `/api/history?module=${encodeURIComponent(module)}` : '/api/history';
    return await apiFetch(url);
  } catch (err) {
    console.error('[history] Failed to load from server:', err);
    return [];
  }
}

/**
 * Save (upsert) a single history record to server.
 * @param {object} item - History record
 * @returns {Promise<void>}
 */
export async function saveHistoryRecord(item) {
  try {
    await apiFetch('/api/history', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  } catch (err) {
    console.error('[history] Failed to save record:', err);
  }
}

/**
 * Delete a single history record.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteHistoryRecord(id) {
  try {
    await apiFetch(`/api/history/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('[history] Failed to delete record:', err);
  }
}

/**
 * Migrate localStorage history to server (one-time).
 * @param {Array} items - History records from localStorage
 * @returns {Promise<{ inserted: number, total: number }>}
 */
export async function migrateLocalHistory(items) {
  return apiFetch('/api/history/migrate', {
    method: 'POST',
    body: JSON.stringify(items),
  });
}

/**
 * Export all history from server as JSON string.
 * @returns {Promise<string>}
 */
export async function exportHistoryFromServer() {
  const items = await apiFetch('/api/history/export');
  return JSON.stringify(items, null, 2);
}

/**
 * Import history from a JSON string (merge into user's records).
 * @param {string} jsonString
 * @returns {Promise<{ inserted: number, total: number }>}
 */
export async function importHistoryFromJson(jsonString) {
  const imported = JSON.parse(jsonString);
  if (!Array.isArray(imported)) {
    throw new Error('导入数据格式错误：不是数组');
  }
  return migrateLocalHistory(imported);
}

/**
 * Clear all history for current user.
 * @returns {Promise<{ deleted: number }>}
 */
export async function clearAllHistory() {
  return apiFetch('/api/history/all', {
    method: 'DELETE',
  });
}

// === Legacy localStorage helpers (for migration detection) ===

export function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) {
      console.warn('History data is not an array, resetting');
      return [];
    }
    return items;
  } catch (e) {
    console.warn('Failed to load history from localStorage:', e);
    return [];
  }
}

/**
 * Format timestamp for display.
 * @param {number} ts
 * @returns {string}
 */
export function formatTimestamp(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
