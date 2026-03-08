// Shared history persistence helpers
export const HISTORY_KEY = 'tianji-history';
export const MAX_HISTORY = 50;

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

export function saveHistoryToStorage(items) {
  const trimmed = items.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save history to localStorage:', e);
  }
  return trimmed;
}

export function formatTimestamp(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
