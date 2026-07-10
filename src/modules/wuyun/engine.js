/**
 * 五运六气 — Five Movements & Six Qi Engine
 */
import {
  TIANGAN,
  DIZHI,
  TIANGAN_YUN,
  DIZHI_QI,
  SANYINSANYANG_ORDER,
  PRIMARY_YUN,
  PRIMARY_QI,
  WUXING_ORDER,
  QI_INFO,
  WUYUN_VALIDATION,
} from './data.js';

function assertYear(year) {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError('year must be an integer from 1 through 9999');
  }
}

function requireStem(yearStem) {
  const data = TIANGAN_YUN[yearStem];
  if (!data) throw new RangeError(`invalid year stem: ${yearStem}`);
  return data;
}

function requireBranch(yearBranch) {
  const data = DIZHI_QI[yearBranch];
  if (!data) throw new RangeError(`invalid year branch: ${yearBranch}`);
  return data;
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

/**
 * Get year's heavenly stem and earthly branch.
 */
export function getYearGanZhi(year) {
  assertYear(year);
  const ganIdx = mod(year - 4, 10);
  const zhiIdx = mod(year - 4, 12);
  return {
    gan: TIANGAN[ganIdx],
    zhi: DIZHI[zhiIdx],
    ganzi: TIANGAN[ganIdx] + DIZHI[zhiIdx],
  };
}

/**
 * Get the year's central transport (大运/中运).
 */
export function getWuYun(yearStem) {
  const data = requireStem(yearStem);
  return {
    element: data.yun,
    tone: data.tone,
    excess: data.excess,
    label: `${data.yun}运${data.excess ? '太过' : '不及'}`,
  };
}

/**
 * Get the fixed main-movement elements and the year's tai-shao pattern.
 */
export function getZhuYun(yearStem) {
  const central = requireStem(yearStem);
  const centralIndex = WUXING_ORDER.indexOf(central.yun);
  return PRIMARY_YUN.map((item, index) => {
    const samePolarity = Math.abs(index - centralIndex) % 2 === 0;
    const excess = samePolarity ? central.excess : !central.excess;
    return {
      stage: item.stage,
      element: item.element,
      tone: item.tone,
      excess,
      label: `${excess ? '太' : '少'}${item.tone}`,
    };
  });
}

/**
 * Get guest transport sequence (客运, 5 stages).
 * Starts from the central transport element, follows 五行相生 order.
 */
export function getKeYun(yearStem) {
  const central = requireStem(yearStem);
  const startIdx = WUXING_ORDER.indexOf(central.yun);
  return Array.from({ length: 5 }, (_, i) => {
    const element = WUXING_ORDER[(startIdx + i) % 5];
    const isExcess = i % 2 === 0 ? central.excess : !central.excess;
    const tone = PRIMARY_YUN[WUXING_ORDER.indexOf(element)].tone;
    return {
      stage: PRIMARY_YUN[i].stage,
      element,
      tone,
      excess: isExcess,
      label: `${isExcess ? '太' : '少'}${tone}`,
    };
  });
}

/**
 * Get the year's sitian (司天) and zaiquan (在泉).
 */
export function getLiuQi(yearBranch) {
  const data = requireBranch(yearBranch);
  return {
    sitian: data.sitian,
    zaiquan: data.zaiquan,
    sitianInfo: QI_INFO[data.sitian],
    zaiquanInfo: QI_INFO[data.zaiquan],
  };
}

/**
 * Get guest qi sequence (客气, 6 stages).
 * Sitian is always at stage 3 (三气), zaiquan at stage 6 (终气).
 */
export function getKeQi(yearBranch) {
  const data = requireBranch(yearBranch);
  const sitianIdx = SANYINSANYANG_ORDER.indexOf(data.sitian);
  // Sitian is at position 3 (三气, index 2), so start 2 before
  return Array.from({ length: 6 }, (_, i) => {
    const qi = SANYINSANYANG_ORDER[(sitianIdx - 2 + i + 6) % 6];
    return { stage: PRIMARY_QI[i].stage, qi, info: QI_INFO[qi] };
  });
}

/**
 * Full year analysis.
 */
export function analyzeYear(year) {
  const ganZhi = getYearGanZhi(year);
  const wuYun = getWuYun(ganZhi.gan);
  const zhuYun = getZhuYun(ganZhi.gan);
  const keYun = getKeYun(ganZhi.gan);
  const liuQi = getLiuQi(ganZhi.zhi);
  const keQi = getKeQi(ganZhi.zhi);

  // Build combined timeline (主运 vs 客运, 主气 vs 客气)
  const yunTimeline = PRIMARY_YUN.map((py, i) => ({
    ...py,
    primary: py.element,
    primaryTone: zhuYun[i].tone,
    primaryExcess: zhuYun[i].excess,
    guest: keYun[i]?.element || py.element,
    guestTone: keYun[i]?.tone,
    guestExcess: keYun[i]?.excess,
  }));

  const qiTimeline = PRIMARY_QI.map((pq, i) => ({
    ...pq,
    primary: pq.qi,
    guest: keQi[i]?.qi || pq.qi,
    guestInfo: keQi[i]?.info,
  }));

  return {
    year, ganZhi, wuYun, zhuYun, keYun, liuQi, keQi,
    yunTimeline, qiTimeline,
    validation: WUYUN_VALIDATION,
  };
}

/**
 * Format for AI.
 */
export function formatForAI(result) {
  const { ganZhi, wuYun, liuQi, yunTimeline, qiTimeline } = result;

  const lines = ['【五运六气分析】'];
  lines.push(`年份: ${result.year}年 (${ganZhi.ganzi}年)`);
  lines.push(`中运/岁运: ${wuYun.label} (天干${ganZhi.gan}化${wuYun.element})`);
  lines.push(`司天: ${liuQi.sitian} (地支${ganZhi.zhi})`);
  lines.push(`在泉: ${liuQi.zaiquan}`);
  lines.push('验证状态: 基础年结构已按固定来源校核；古法交司时刻及现实解释未实现');

  lines.push('\n【五运 — 主运 vs 客运】');
  yunTimeline.forEach(y => {
    lines.push(`${y.stage} (${y.time}): 主运${y.primary}${y.primaryExcess ? '太' : '少'} / 客运${y.guest}${y.guestExcess ? '太' : '少'}`);
  });

  lines.push('\n【六气 — 主气 vs 客气】');
  qiTimeline.forEach(q => {
    lines.push(`${q.stage} (${q.time}): 主气${q.primary} / 客气${q.guest}`);
  });

  return lines.join('\n');
}
