/**
 * 子午流注 — Meridian Clock Engine
 */
import { ZIWU_LIUZHU } from './data.js';

/**
 * Get the current active shichen (时辰) and meridian.
 * @param {Date} [date] — defaults to now
 * @returns {{ index, entry, progress }}
 */
export function getCurrentShichen(date) {
  const d = date || new Date();
  const hour = d.getHours();
  const minute = d.getMinutes();

  // Find the matching entry (子时 starts at 23:00)
  let index = -1;
  for (let i = 0; i < ZIWU_LIUZHU.length; i++) {
    const start = ZIWU_LIUZHU[i].hourStart;
    const end = (start + 2) % 24;
    if (start > end) {
      // Wraps midnight (子时: 23-01)
      if (hour >= start || hour < end) { index = i; break; }
    } else {
      if (hour >= start && hour < end) { index = i; break; }
    }
  }
  if (index === -1) index = 0; // fallback

  const entry = ZIWU_LIUZHU[index];

  // Progress within this 2-hour block (0-100)
  let minutesIn;
  if (entry.hourStart > 22) {
    // 子时 wraps midnight
    minutesIn = hour >= entry.hourStart
      ? (hour - entry.hourStart) * 60 + minute
      : (hour + 24 - entry.hourStart) * 60 + minute;
  } else {
    minutesIn = (hour - entry.hourStart) * 60 + minute;
  }
  const progress = Math.min(100, Math.round((minutesIn / 120) * 100));

  return { index, entry, progress };
}

/**
 * Get the next shichen info.
 */
export function getNextShichen(currentIndex) {
  const nextIdx = (currentIndex + 1) % 12;
  return ZIWU_LIUZHU[nextIdx];
}

/**
 * Format current meridian info for AI.
 */
export function formatForAI(date) {
  const d = date || new Date();
  const { entry, progress } = getCurrentShichen(d);
  const timeStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

  const lines = ['【子午流注·当前时辰】'];
  lines.push(`时间: ${timeStr}`);
  lines.push(`时辰: ${entry.shichen}时 (${entry.hours})`);
  lines.push(`当令经络: ${entry.meridian}`);
  lines.push(`对应脏腑: ${entry.organ}`);
  lines.push(`五行: ${entry.wuxing}`);
  lines.push(`时辰进度: ${progress}%`);
  lines.push(`\n养生要点: ${entry.yangsheng}`);
  lines.push(`常见病症: ${entry.illness}`);
  lines.push(`建议: ${entry.advice}`);

  // Add all 12 for context
  lines.push('\n【十二时辰完整表】');
  for (const e of ZIWU_LIUZHU) {
    const marker = e.shichen === entry.shichen ? ' ← 当前' : '';
    lines.push(`${e.shichen}时 ${e.hours} ${e.organ}(${e.meridian})${marker}`);
  }

  return lines.join('\n');
}
