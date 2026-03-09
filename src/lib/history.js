// Shared history persistence helpers
export const HISTORY_KEY = 'tianji-history';
export const MAX_HISTORY = 500;

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
    console.error('Failed to save history to localStorage. Consider exporting and clearing old records.', e);
  }
  return trimmed;
}

export function exportHistory() {
  return localStorage.getItem(HISTORY_KEY) || '[]';
}

export function importHistory(jsonString) {
  const imported = JSON.parse(jsonString);
  if (!Array.isArray(imported)) {
    throw new Error('导入数据格式错误：不是数组');
  }
  const existing = loadHistoryFromStorage();
  const existingIds = new Set(existing.map(h => h.id));
  const newItems = imported.filter(h => h.id && !existingIds.has(h.id));
  const merged = [...newItems, ...existing];
  merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return saveHistoryToStorage(merged);
}

export function formatTimestamp(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
