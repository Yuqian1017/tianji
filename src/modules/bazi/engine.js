// ===== 八字命理 · 排盘引擎 =====

import {
  STEMS, BRANCHES, STEM_WUXING, STEM_YINYANG, BRANCH_WUXING, WUXING_CN,
  WUXING_ORDER, wuxingRelation,
  HIDDEN_STEMS, MONTH_BRANCHES, NAYIN,
  CHANGSHENG_LABELS, YANG_START, YIN_START,
  BRANCH_RELATIONS, STEM_COMBINE, TAOHUA, YIMA, HUAGAI,
} from './data.js';
import {
  BAZI_CALENDAR_ENGINE,
  createBaziCalendar,
  createDayun,
} from './calendar.js';

// ========== 四柱计算 ==========

/**
 * 年柱
 */
export function getYearPillar(adjustedYear) {
  const si = ((adjustedYear - 4) % 10 + 10) % 10;
  const bi = ((adjustedYear - 4) % 12 + 12) % 12;
  return { stem: STEMS[si], branch: BRANCHES[bi] };
}

/**
 * 确定出生时间属于哪个月（基于节气）
 * 返回 { monthIdx: 0-11, jieqiName: string, isApprox: boolean }
 */
export function getMonthIndex(year, month, day, hour, minute) {
  const calendar = createBaziCalendar(year, month, day, hour, minute);
  return {
    monthIdx: calendar.monthIdx,
    jieqiName: calendar.jieqiName,
    isApprox: calendar.isApprox,
  };
}

/**
 * 月柱（五虎遁）
 */
export function getMonthPillar(yearStem, monthIdx) {
  const yearStemIdx = STEMS.indexOf(yearStem);
  const startStem = (yearStemIdx % 5) * 2 + 2;
  return {
    stem: STEMS[(startStem + monthIdx) % 10],
    branch: MONTH_BRANCHES[monthIdx],
  };
}

/**
 * 日柱
 * 基准日：2024-01-01 = 甲子日 (ganzhiIdx 0)
 * 注意：2024-02-04 是立春，用于年柱换算，不是日柱基准日
 * ⚠️ 子时(23:00)属于次日
 */
export function getDayPillar(year, month, day, hour) {
  return createBaziCalendar(year, month, day, hour, 0).pillars.day;
}

/**
 * 时柱（五鼠遁）
 */
export function getHourPillar(dayStem, hour) {
  const branchIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  const dayStemIdx = STEMS.indexOf(dayStem);
  const startStem = (dayStemIdx % 5) * 2;
  return {
    stem: STEMS[(startStem + branchIdx) % 10],
    branch: BRANCHES[branchIdx],
  };
}

// ========== 十神 ==========

/**
 * 计算十神关系
 * @param dayStem 日主天干
 * @param otherStem 另一个天干
 * @returns 十神名称
 */
export function getShiShen(dayStem, otherStem) {
  const di = STEMS.indexOf(dayStem);
  const oi = STEMS.indexOf(otherStem);
  if (di < 0 || oi < 0) {
    console.warn(`getShiShen: invalid stems "${dayStem}", "${otherStem}"`);
    return '?';
  }
  const samePolarity = (di % 2) === (oi % 2);
  const elementDiff = (Math.floor(oi / 2) - Math.floor(di / 2) + 5) % 5;
  const map = {
    0: samePolarity ? '比肩' : '劫财',
    1: samePolarity ? '食神' : '伤官',
    2: samePolarity ? '偏财' : '正财',
    3: samePolarity ? '七杀' : '正官',
    4: samePolarity ? '偏印' : '正印',
  };
  return map[elementDiff];
}

// ========== 长生十二宫 ==========

export function getChangsheng(stem, branch) {
  const stemIdx = STEMS.indexOf(stem);
  const branchIdx = BRANCHES.indexOf(branch);
  if (stemIdx < 0 || branchIdx < 0) return '?';

  const isYang = stemIdx % 2 === 0;
  const startBranch = isYang ? YANG_START[stem] : YIN_START[stem];

  let offset;
  if (isYang) {
    offset = (branchIdx - startBranch + 12) % 12;
  } else {
    offset = (startBranch - branchIdx + 12) % 12;
  }
  return CHANGSHENG_LABELS[offset];
}

// ========== 空亡 ==========

/**
 * 根据日柱算旬空（空亡）
 * 甲子旬空 戌亥，甲戌旬空 申酉，甲申旬空 午未...
 */
export function getKongWang(dayStem, dayBranch) {
  const si = STEMS.indexOf(dayStem);
  const bi = BRANCHES.indexOf(dayBranch);
  // 旬首地支序号 = 该旬第一个地支
  const xunStart = (bi - si + 12) % 12;
  // 空亡是旬中未被用到的两个地支
  // 每旬10个干支用掉10个地支，剩2个
  const kong1 = (xunStart + 10) % 12;
  const kong2 = (xunStart + 11) % 12;
  return [BRANCHES[kong1], BRANCHES[kong2]];
}

// ========== 日主强弱 ==========

export const BAZI_STRENGTH_MODEL = Object.freeze({
  method: 'simplified_support_balance_v1',
  validationStatus: 'heuristic_only',
  limitations: [
    '未处理从格、专旺、调候、格局、合化与藏干司令',
    '分数没有经典量表依据，不能确定用神、忌神或吉凶',
  ],
});

export const BAZI_WUXING_COUNT_MODEL = Object.freeze({
  method: 'visible_stem_1_hidden_stem_0_5',
  validationStatus: 'structural_count_only',
  limitation: '未计月令、藏干层级、透干通根与合化，不代表五行旺衰',
});

/**
 * 保留旧版分数用于历史兼容。该模型只允许作为未校勘初筛。
 */
function assessStrength(dayStem, pillars) {
  const dayWuxing = STEM_WUXING[dayStem];
  const monthBranch = pillars.month.branch;
  const factors = [];

  // === Factor 1: 月令 (40分) ===
  const monthCS = getChangsheng(dayStem, monthBranch);
  let monthScore = 0;
  if (['帝旺','临官','长生','冠带'].includes(monthCS)) {
    monthScore = 36; // 得令
    factors.push(`月令${monthBranch}(${monthCS})：得令，日主有力`);
  } else if (['沐浴','养'].includes(monthCS)) {
    monthScore = 24;
    factors.push(`月令${monthBranch}(${monthCS})：有余气`);
  } else if (['衰','墓'].includes(monthCS)) {
    monthScore = 14;
    factors.push(`月令${monthBranch}(${monthCS})：力量渐弱`);
  } else {
    monthScore = 6; // 病死绝胎
    factors.push(`月令${monthBranch}(${monthCS})：失令，日主无力`);
  }

  // === Factor 2: 其余柱帮身 (40分) ===
  let helpCount = 0;
  let drainCount = 0;
  const allStems = [pillars.year.stem, pillars.month.stem, pillars.hour.stem];
  for (const s of allStems) {
    const rel = wuxingRelation(dayWuxing, STEM_WUXING[s]);
    if (rel === 'same' || rel === 'generated_by') helpCount++;
    else drainCount++;
  }

  // 地支藏干中的帮扶
  const allBranches = [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch];
  for (const br of allBranches) {
    const hidden = HIDDEN_STEMS[br] || [];
    for (const hs of hidden) {
      const rel = wuxingRelation(dayWuxing, STEM_WUXING[hs]);
      if (rel === 'same' || rel === 'generated_by') helpCount += 0.5;
      else drainCount += 0.5;
    }
  }

  const total = helpCount + drainCount;
  const helpRatio = total > 0 ? helpCount / total : 0.5;
  const supportScore = Math.round(helpRatio * 40);
  factors.push(`帮身/泄身：帮${helpCount.toFixed(1)} vs 泄${drainCount.toFixed(1)}`);

  // === Factor 3: 通根 (20分) ===
  let hasRoot = false;
  for (const br of allBranches) {
    const hidden = HIDDEN_STEMS[br] || [];
    if (hidden.some(hs => STEM_WUXING[hs] === dayWuxing)) {
      hasRoot = true;
      break;
    }
  }
  const rootScore = hasRoot ? 16 : 4;
  factors.push(hasRoot ? '日主有根（地支藏干有同五行）' : '日主无根');

  const score = monthScore + supportScore + rootScore;
  let label;
  if (score >= 58) label = '身旺';
  else if (score >= 38) label = '中和';
  else label = '身弱';

  const displayLabel = {
    身旺: '简化模型偏强',
    中和: '简化模型居中',
    身弱: '简化模型偏弱',
  }[label];

  return {
    score,
    label,
    displayLabel,
    factors,
    ...BAZI_STRENGTH_MODEL,
  };
}

// ========== 神煞检测 ==========

function detectShensha(dayBranch, yearBranch, allBranches) {
  const result = [];
  const check = (table, name) => {
    // 以日支查
    const target = table[dayBranch];
    if (target && allBranches.includes(target)) {
      result.push(`${name}(${target}·日支见)`);
    }
    // 以年支查
    const target2 = table[yearBranch];
    if (target2 && target2 !== target && allBranches.includes(target2)) {
      result.push(`${name}(${target2}·年支见)`);
    }
  };
  check(TAOHUA, '桃花');
  check(YIMA, '驿马');
  check(HUAGAI, '华盖');
  return result;
}

// ========== 地支关系检测 ==========

function detectBranchInteractions(branchList) {
  const results = [];
  const branchSet = new Set(branchList);

  // 六合（两两配对）
  for (const { pair, label } of BRANCH_RELATIONS.liuhe) {
    if (branchSet.has(pair[0]) && branchSet.has(pair[1])) {
      results.push({ type: '六合', label });
    }
  }

  // 六冲
  for (const { pair, label } of BRANCH_RELATIONS.liuchong) {
    if (branchSet.has(pair[0]) && branchSet.has(pair[1])) {
      results.push({ type: '六冲', label });
    }
  }

  // 三合（需要三个都在）
  for (const { members, label } of BRANCH_RELATIONS.sanhe) {
    if (members.every(m => branchSet.has(m))) {
      results.push({ type: '三合', label });
    }
  }

  // 三会
  for (const { members, label } of BRANCH_RELATIONS.sanhui) {
    if (members.every(m => branchSet.has(m))) {
      results.push({ type: '三会', label });
    }
  }

  // 六害
  for (const { pair, label } of BRANCH_RELATIONS.liuhai) {
    if (branchSet.has(pair[0]) && branchSet.has(pair[1])) {
      results.push({ type: '六害', label });
    }
  }

  // 三刑
  for (const { members, label } of BRANCH_RELATIONS.sanxing) {
    if (members.every(m => branchSet.has(m))) {
      results.push({ type: '三刑', label });
    }
  }

  // 自刑（同支出现2次以上）
  for (const b of BRANCH_RELATIONS.zixing) {
    if (branchList.filter(x => x === b).length >= 2) {
      results.push({ type: '自刑', label: `${b}${b}自刑` });
    }
  }

  return results;
}

// ========== 天干合检测 ==========

function detectStemCombines(stemList) {
  const results = [];
  const stemSet = new Set(stemList);
  for (const { pair, label } of STEM_COMBINE) {
    if (stemSet.has(pair[0]) && stemSet.has(pair[1])) {
      results.push(label);
    }
  }
  return results;
}

// ========== 五行统计 ==========

function countWuxing(pillars) {
  const count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const allPillars = [pillars.year, pillars.month, pillars.day, pillars.hour];

  for (const p of allPillars) {
    // 天干
    const sw = STEM_WUXING[p.stem];
    if (sw) count[sw]++;
    // 地支藏干
    const hidden = HIDDEN_STEMS[p.branch] || [];
    for (const hs of hidden) {
      const hw = STEM_WUXING[hs];
      if (hw) count[hw] += 0.5; // 藏干权重 0.5
    }
  }

  return count;
}

// ========== 主排盘函数 ==========

export function paiBazi(year, month, day, hour, minute = 0, gender = 'male') {
  const calendar = createBaziCalendar(year, month, day, hour, minute);
  const { adjustedYear, jieqiName, isApprox } = calendar;
  const {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  } = calendar.pillars;
  const dayStem = dayPillar.stem;
  const pillars = calendar.pillars;

  // Step 5: 十神（年/月/时天干 vs 日主）
  const shiShen = {
    year: getShiShen(dayStem, yearPillar.stem),
    month: getShiShen(dayStem, monthPillar.stem),
    day: '日主',
    hour: getShiShen(dayStem, hourPillar.stem),
  };

  // Step 6: 藏干 + 藏干十神
  const hiddenStems = {};
  for (const key of ['year', 'month', 'day', 'hour']) {
    const branch = pillars[key].branch;
    const hidden = HIDDEN_STEMS[branch] || [];
    hiddenStems[key] = hidden.map(hs => ({
      stem: hs,
      shiShen: key === 'day' ? getShiShen(dayStem, hs) : getShiShen(dayStem, hs),
    }));
  }

  // Step 7: 纳音
  const nayin = {};
  for (const key of ['year', 'month', 'day', 'hour']) {
    const gz = pillars[key].stem + pillars[key].branch;
    nayin[key] = NAYIN[gz] || '';
  }

  // Step 8: 长生
  const changsheng = {};
  for (const key of ['year', 'month', 'day', 'hour']) {
    changsheng[key] = getChangsheng(dayStem, pillars[key].branch);
  }

  // Step 9: 日主强弱
  const strength = assessStrength(dayStem, pillars);

  // Step 10: 大运
  const { dayun, dayunStart } = createDayun(calendar.eightChar, gender);
  // 补充大运十神
  for (const d of dayun) {
    d.nayin = NAYIN[d.stem + d.branch] || '';
    d.shiShen = getShiShen(dayStem, d.stem);
  }

  // Step 11: 五行统计
  const wuxingCount = countWuxing(pillars);

  // Step 12: 地支关系
  const branchList = [yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
  const interactions = detectBranchInteractions(branchList);

  // Step 13: 天干合
  const stemList = [yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const stemCombines = detectStemCombines(stemList);

  // Step 14: 空亡
  const kongWang = getKongWang(dayPillar.stem, dayPillar.branch);

  // Step 15: 神煞
  const shensha = detectShensha(dayPillar.branch, yearPillar.branch, branchList);

  return {
    gender,
    birthInfo: { year, month, day, hour, minute },
    calendar: BAZI_CALENDAR_ENGINE,
    adjustedYear,
    pillars,
    dayStem,
    dayMasterWuxing: STEM_WUXING[dayStem],
    dayMasterYinyang: STEM_YINYANG[dayStem],
    shiShen,
    hiddenStems,
    nayin,
    changsheng,
    strength,
    dayun,
    dayunStart,
    wuxingCount,
    wuxingCountModel: BAZI_WUXING_COUNT_MODEL,
    interactions,
    stemCombines,
    kongWang,
    shensha,
    isApprox, // 节气是否为近似值
    jieqiName,
  };
}

// ========== 格式化给 AI ==========

export function formatForAI(result, question) {
  const p = result.pillars;
  const yy = result.dayMasterYinyang === 'yang' ? '阳' : '阴';
  const wx = WUXING_CN[result.dayMasterWuxing];

  const lines = [
    `命主信息：${result.gender === 'male' ? '男' : '女'}命`,
    `出生：${result.birthInfo.year}年${result.birthInfo.month}月${result.birthInfo.day}日 ${result.birthInfo.hour}时`,
    '',
    '四柱排盘：',
    `年柱：${p.year.stem}${p.year.branch}（${result.shiShen.year}）〔${result.nayin.year}〕`,
    `月柱：${p.month.stem}${p.month.branch}（${result.shiShen.month}）〔${result.nayin.month}〕`,
    `日柱：${p.day.stem}${p.day.branch}【日主】〔${result.nayin.day}〕`,
    `时柱：${p.hour.stem}${p.hour.branch}（${result.shiShen.hour}）〔${result.nayin.hour}〕`,
    '',
    '地支藏干：',
  ];

  for (const key of ['year', 'month', 'day', 'hour']) {
    const label = { year: '年', month: '月', day: '日', hour: '时' }[key];
    const hs = result.hiddenStems[key];
    lines.push(`${label}支${p[key].branch}藏：${hs.map(h => `${h.stem}(${h.shiShen})`).join(' ')}`);
  }

  lines.push('');
  lines.push(`日主：${result.dayStem}（${wx}·${yy}）`);
  lines.push(`长生状态：日坐${result.changsheng.day}`);
  lines.push(`身强弱初筛：${result.strength.displayLabel}（未校勘启发式，不提供用神结论）`);

  const wc = result.wuxingCount;
  lines.push(`五行结构计数（非旺衰）：木${wc.wood} 火${wc.fire} 土${wc.earth} 金${wc.metal} 水${wc.water}`);
  lines.push(`空亡：${result.kongWang.join('、')}`);

  if (result.interactions.length > 0) {
    lines.push(`地支关系：${result.interactions.map(i => i.label).join('；')}`);
  }
  if (result.stemCombines.length > 0) {
    lines.push(`天干合：${result.stemCombines.join('；')}`);
  }
  if (result.shensha.length > 0) {
    lines.push(`神煞：${result.shensha.join('、')}`);
  }

  lines.push('');
  lines.push('大运：');
  for (const d of result.dayun) {
    lines.push(`${d.startAge}-${d.endAge}岁 ${d.stem}${d.branch}（${d.shiShen}）〔${d.nayin}〕`);
  }

  if (result.isApprox) {
    lines.push('');
    lines.push('⚠️ 注意：该出生年份的节气时间为近似计算，月柱可能有误差。');
  }

  lines.push('');
  lines.push(question ? `命主想了解：${question}` : '请做全面分析。');
  lines.push('');
  lines.push('请按照四柱八字理论全面分析此命盘。');

  return lines.join('\n');
}
