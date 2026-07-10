import { ZIWU_LIUZHU, ZIWU_MODEL } from './data.js';

export function getCurrentShichen(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) throw new RangeError('Invalid date');

  const hour = d.getHours();
  const minute = d.getMinutes();
  let index = ZIWU_LIUZHU.findIndex(entry => entry.hourStart === hour || entry.hourStart + 1 === hour);
  if (hour === 0) index = 0;
  if (index < 0) throw new RangeError(`No traditional shichen mapping for hour ${hour}`);

  const entry = ZIWU_LIUZHU[index];
  const startMinutes = entry.hourStart === 23 ? 23 * 60 : entry.hourStart * 60;
  const currentMinutes = hour === 0 ? 24 * 60 + minute : hour * 60 + minute;
  const progress = Math.min(100, Math.round(((currentMinutes - startMinutes) / 120) * 100));

  return { index, entry, progress };
}

export function getNextShichen(currentIndex) {
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= ZIWU_LIUZHU.length) {
    throw new RangeError('currentIndex must be an integer from 0 to 11');
  }
  return ZIWU_LIUZHU[(currentIndex + 1) % ZIWU_LIUZHU.length];
}

export function formatForAI(date = new Date()) {
  const { entry, progress } = getCurrentShichen(date);
  const lines = [
    '【传统十二时辰经脉对应结构】',
    `时辰: ${entry.shichen}时 (${entry.hours})`,
    `常见对应: ${entry.organ} / ${entry.meridian}`,
    `五行标签: ${entry.wuxing}`,
    `时段进度: ${progress}%`,
    `验证状态: ${ZIWU_MODEL.structureStatus}`,
    '边界: 此对应只作传统文化结构展示，不代表器官功能高峰或医学判断。',
  ];
  return lines.join('\n');
}
