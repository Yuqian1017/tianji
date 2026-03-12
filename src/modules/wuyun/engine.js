/**
 * 五运六气 — Five Movements & Six Qi Engine
 */
import { TIANGAN, DIZHI, TIANGAN_YUN, DIZHI_QI, SANYINSANYANG_ORDER, PRIMARY_YUN, PRIMARY_QI, WUXING_ORDER, QI_INFO } from './data.js';

/**
 * Get year's heavenly stem and earthly branch.
 */
export function getYearGanZhi(year) {
  const ganIdx = (year - 4) % 10;
  const zhiIdx = (year - 4) % 12;
  return {
    gan: TIANGAN[ganIdx >= 0 ? ganIdx : ganIdx + 10],
    zhi: DIZHI[zhiIdx >= 0 ? zhiIdx : zhiIdx + 12],
    ganzi: TIANGAN[ganIdx >= 0 ? ganIdx : ganIdx + 10] + DIZHI[zhiIdx >= 0 ? zhiIdx : zhiIdx + 12],
  };
}

/**
 * Get the year's central transport (大运/中运).
 */
export function getWuYun(yearStem) {
  const data = TIANGAN_YUN[yearStem];
  if (!data) { console.warn(`Unknown stem: ${yearStem}`); return null; }
  return {
    element: data.yun,
    excess: data.excess,
    label: `${data.yun}运${data.excess ? '太过' : '不及'}`,
  };
}

/**
 * Get guest transport sequence (客运, 5 stages).
 * Starts from the central transport element, follows 五行相生 order.
 */
export function getKeYun(yearStem) {
  const central = TIANGAN_YUN[yearStem];
  if (!central) return [];
  const startIdx = WUXING_ORDER.indexOf(central.yun);
  return Array.from({ length: 5 }, (_, i) => {
    const element = WUXING_ORDER[(startIdx + i) % 5];
    // Odd stages follow central excess/deficiency, even stages opposite
    const isExcess = i % 2 === 0 ? central.excess : !central.excess;
    return { stage: PRIMARY_YUN[i].stage, element, excess: isExcess, label: `${element}${isExcess ? '太过' : '不及'}` };
  });
}

/**
 * Get the year's sitian (司天) and zaiquan (在泉).
 */
export function getLiuQi(yearBranch) {
  const data = DIZHI_QI[yearBranch];
  if (!data) { console.warn(`Unknown branch: ${yearBranch}`); return null; }
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
  const data = DIZHI_QI[yearBranch];
  if (!data) return [];
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
  const keYun = getKeYun(ganZhi.gan);
  const liuQi = getLiuQi(ganZhi.zhi);
  const keQi = getKeQi(ganZhi.zhi);

  // Build combined timeline (主运 vs 客运, 主气 vs 客气)
  const yunTimeline = PRIMARY_YUN.map((py, i) => ({
    ...py,
    primary: py.element,
    guest: keYun[i]?.element || py.element,
    guestExcess: keYun[i]?.excess,
  }));

  const qiTimeline = PRIMARY_QI.map((pq, i) => ({
    ...pq,
    primary: pq.qi,
    guest: keQi[i]?.qi || pq.qi,
    guestInfo: keQi[i]?.info,
  }));

  // Health focus: organs affected by central transport + sitian + zaiquan
  const affectedOrgans = new Set();
  if (wuYun) {
    const wuxingToOrgan = { '木': '肝胆', '火': '心小肠', '土': '脾胃', '金': '肺大肠', '水': '肾膀胱' };
    affectedOrgans.add(wuxingToOrgan[wuYun.element]);
  }
  if (liuQi?.sitianInfo) affectedOrgans.add(liuQi.sitianInfo.organ);
  if (liuQi?.zaiquanInfo) affectedOrgans.add(liuQi.zaiquanInfo.organ);

  return {
    year, ganZhi, wuYun, keYun, liuQi, keQi,
    yunTimeline, qiTimeline,
    affectedOrgans: [...affectedOrgans],
  };
}

/**
 * Format for AI.
 */
export function formatForAI(result) {
  const { ganZhi, wuYun, liuQi, yunTimeline, qiTimeline, affectedOrgans } = result;

  const lines = ['【五运六气分析】'];
  lines.push(`年份: ${result.year}年 (${ganZhi.ganzi}年)`);
  lines.push(`大运: ${wuYun.label} (天干${ganZhi.gan}化${wuYun.element})`);
  lines.push(`司天: ${liuQi.sitian} (地支${ganZhi.zhi})`);
  lines.push(`在泉: ${liuQi.zaiquan}`);
  lines.push(`重点关注脏腑: ${affectedOrgans.join('、')}`);

  lines.push('\n【五运 — 主运 vs 客运】');
  yunTimeline.forEach(y => {
    lines.push(`${y.stage} (${y.time}): 主运${y.primary} / 客运${y.guest}${y.guestExcess ? '太过' : '不及'}`);
  });

  lines.push('\n【六气 — 主气 vs 客气】');
  qiTimeline.forEach(q => {
    lines.push(`${q.stage} (${q.time}): 主气${q.primary} / 客气${q.guest}`);
  });

  return lines.join('\n');
}
