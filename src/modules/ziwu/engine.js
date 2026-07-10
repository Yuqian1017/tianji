import { ZIWU_LIUZHU, ZIWU_MODEL } from './data.js';

export function getCurrentShichen(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) throw new RangeError('Invalid date');

  const hour = d.getHours();
  const minute = d.getMinutes();
  const index = Math.floor(((hour + 1) % 24) / 2);

  const entry = ZIWU_LIUZHU[index];
  const minutesSinceStart = ((hour + 1) % 2) * 60 + minute;
  const progress = Math.round((minutesSinceStart / 120) * 100);

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
    '边界: 此对应只作传统文化结构展示，不代表器官功能高峰，不作个人身体判断或治疗时机判断。',
    `未实现层: ${ZIWU_MODEL.unimplemented.join('、')}`,
  ];
  return lines.join('\n');
}
