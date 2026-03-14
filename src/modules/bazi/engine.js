// ===== 八字命理 · 排盘引擎 =====

import {
  STEMS, BRANCHES, STEM_WUXING, STEM_YINYANG, BRANCH_WUXING, WUXING_CN,
  WUXING_ORDER, wuxingRelation,
  HIDDEN_STEMS, MONTH_BRANCHES, NAYIN,
  CHANGSHENG_LABELS, YANG_START, YIN_START,
  BRANCH_RELATIONS, STEM_COMBINE, TAOHUA, YIMA, HUAGAI,
  JIEQI_PRECISE, JIEQI_NAMES, approxJieqiDate,
} from './data.js';

// ========== 四柱计算 ==========

/**
 * 获取某年立春精确 UTC 时间戳
 * 优先查精确表，否则用近似公式
 */
function getLichunTime(year) {
  const precise = JIEQI_PRECISE[year];
  if (precise) return precise[0]; // 立春是每年数组的第一个
  // 回退近似公式
  const approx = approxJieqiDate(year, '立春');
  if (approx) return approx;
  console.warn(`getLichunTime: no data for year ${year}, falling back to Feb 4`);
  return Date.UTC(year, 1, 4, 0, 0); // 粗略回退
}

/**
 * 判断出生是否在立春之前，决定年柱归属
 */
function getAdjustedYear(year, month, day, hour, minute) {
  const lichun = getLichunTime(year);
  // 出生时间转 UTC（假设北京时间 UTC+8）
  const birthUtc = Date.UTC(year, month - 1, day, hour - 8, minute);
  return birthUtc < lichun ? year - 1 : year;
}

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
  const birthUtc = Date.UTC(year, month - 1, day, hour - 8, minute);
  let isApprox = false;

  // 构建当年的12个节气时间 + 上一年的大雪和小寒
  let boundaries = [];

  const precise = JIEQI_PRECISE[year];
  if (precise) {
    // 精确表包含：[立春(0), 惊蛰(1), ..., 大雪(10), 小寒-next(11)]
    boundaries = precise.map((time, idx) => ({ time, monthIdx: idx }));
  } else {
    isApprox = true;
    // 用近似公式
    const jieNames = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪'];
    jieNames.forEach((name, idx) => {
      boundaries.push({ time: approxJieqiDate(year, name), monthIdx: idx });
    });
    // 小寒属于次年1月，monthIdx=11
    boundaries.push({ time: approxJieqiDate(year + 1, '小寒'), monthIdx: 11 });
  }

  // 还需要上一年的小寒（丑月起点）和大雪（子月起点）来处理1月出生
  let prevDaxue, prevXiaohan;
  const prevPrecise = JIEQI_PRECISE[year - 1];
  if (prevPrecise) {
    prevDaxue = prevPrecise[10];  // 大雪 monthIdx=10
    prevXiaohan = prevPrecise[11]; // 小寒(当年) monthIdx=11
  } else {
    prevDaxue = approxJieqiDate(year - 1, '大雪');
    prevXiaohan = approxJieqiDate(year, '小寒');
    isApprox = true;
  }

  // 在立春之前的出生：可能在上年的子月(大雪后)或丑月(小寒后)
  if (birthUtc < boundaries[0].time) {
    // 在本年立春之前
    if (prevXiaohan && birthUtc >= prevXiaohan) {
      return { monthIdx: 11, jieqiName: '小寒', isApprox };
    }
    if (prevDaxue && birthUtc >= prevDaxue) {
      return { monthIdx: 10, jieqiName: '大雪', isApprox };
    }
    // 更早 → 查上年节气（需要递归，但实际上不太可能在这个范围）
    // 简化：如果在大雪之前，归为亥月(立冬后)
    return { monthIdx: 9, jieqiName: '立冬', isApprox: true };
  }

  // 从后往前找
  for (let i = boundaries.length - 1; i >= 0; i--) {
    if (birthUtc >= boundaries[i].time) {
      return { monthIdx: boundaries[i].monthIdx, jieqiName: JIEQI_NAMES[boundaries[i].monthIdx], isApprox };
    }
  }

  // 兜底
  console.warn('getMonthIndex: failed to determine month, defaulting to 寅月');
  return { monthIdx: 0, jieqiName: '立春', isApprox: true };
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
  let adjYear = year, adjMonth = month, adjDay = day;
  if (hour >= 23) {
    const d = new Date(year, month - 1, day + 1);
    adjYear = d.getFullYear();
    adjMonth = d.getMonth() + 1;
    adjDay = d.getDate();
  }

  const baseDate = new Date(2024, 0, 1); // 2024-01-01 = 甲子
  const target = new Date(adjYear, adjMonth - 1, adjDay);
  const diffDays = Math.round((target - baseDate) / 86400000);
  const idx = ((diffDays % 60) + 60) % 60;

  return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12] };
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
  // 干支序号
  const ganzhiIdx = (bi - si + 12) % 12;
  // 旬首地支序号 = 该旬第一个地支
  const xunStart = (bi - si + 12) % 12;
  // 空亡是旬中未被用到的两个地支
  // 每旬10个干支用掉10个地支，剩2个
  const kong1 = (xunStart + 10) % 12;
  const kong2 = (xunStart + 11) % 12;
  return [BRANCHES[kong1], BRANCHES[kong2]];
}

// ========== 日主强弱 ==========

/**
 * 评估日主强弱
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

  // 用神方向
  let yongShenDirection;
  if (label === '身旺') {
    yongShenDirection = '喜克泄耗：官杀·食伤·财星';
  } else if (label === '身弱') {
    yongShenDirection = '喜生扶：印星·比劫';
  } else {
    yongShenDirection = '中和偏稳，取平衡为宜';
  }

  return { score, label, factors, yongShenDirection };
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

// ========== 大运 ==========

function computeDayun(yearStem, monthPillar, gender, year, month, day, hour, minute) {
  const yearYang = STEMS.indexOf(yearStem) % 2 === 0;
  const isMale = gender === 'male';
  const forward = (yearYang && isMale) || (!yearYang && !isMale);

  // 起运年龄：出生到下/前一个节气的天数 ÷ 3
  const birthUtc = Date.UTC(year, month - 1, day, hour - 8, minute);
  let startAge = 1; // 默认起运年龄

  // 获取当年节气
  const precise = JIEQI_PRECISE[year];
  if (precise) {
    if (forward) {
      // 顺排：找出生后最近的节气
      let nextJieqi = null;
      for (const t of precise) {
        if (t > birthUtc) { nextJieqi = t; break; }
      }
      // 如果当年没有，查下一年
      if (!nextJieqi) {
        const nextYear = JIEQI_PRECISE[year + 1];
        if (nextYear) nextJieqi = nextYear[0];
      }
      if (nextJieqi) {
        const diffDays = (nextJieqi - birthUtc) / 86400000;
        startAge = Math.max(1, Math.round(diffDays / 3));
      }
    } else {
      // 逆排：找出生前最近的节气
      let prevJieqi = null;
      for (let i = precise.length - 1; i >= 0; i--) {
        if (precise[i] <= birthUtc) { prevJieqi = precise[i]; break; }
      }
      // 如果当年没有，查上一年
      if (!prevJieqi) {
        const prevYear = JIEQI_PRECISE[year - 1];
        if (prevYear) prevJieqi = prevYear[prevYear.length - 1];
      }
      if (prevJieqi) {
        const diffDays = (birthUtc - prevJieqi) / 86400000;
        startAge = Math.max(1, Math.round(diffDays / 3));
      }
    }
  }

  // 生成 8 步大运
  const step = forward ? 1 : -1;
  const si = STEMS.indexOf(monthPillar.stem);
  const bi = BRANCHES.indexOf(monthPillar.branch);

  return Array.from({ length: 8 }, (_, i) => {
    const stemIdx = ((si + (i + 1) * step) % 10 + 10) % 10;
    const branchIdx = ((bi + (i + 1) * step) % 12 + 12) % 12;
    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];
    return {
      stem,
      branch,
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1,
      nayin: NAYIN[stem + branch] || '',
    };
  });
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
  // Step 1: 年柱（立春分界）
  const adjustedYear = getAdjustedYear(year, month, day, hour, minute);
  const yearPillar = getYearPillar(adjustedYear);

  // Step 2: 月柱（节气分界 + 五虎遁）
  const { monthIdx, jieqiName, isApprox } = getMonthIndex(year, month, day, hour, minute);
  const monthPillar = getMonthPillar(yearPillar.stem, monthIdx);

  // Step 3: 日柱
  const dayPillar = getDayPillar(year, month, day, hour);

  // Step 4: 时柱
  const hourPillar = getHourPillar(dayPillar.stem, hour);

  const dayStem = dayPillar.stem;
  const pillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };

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
  const dayun = computeDayun(yearPillar.stem, monthPillar, gender, year, month, day, hour, minute);
  // 补充大运十神
  for (const d of dayun) {
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
    wuxingCount,
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
  lines.push(`身强/身弱：${result.strength.label}（评分 ${result.strength.score}/100）`);
  lines.push(`用神方向：${result.strength.yongShenDirection}`);

  const wc = result.wuxingCount;
  lines.push(`五行统计：木${wc.wood} 火${wc.fire} 土${wc.earth} 金${wc.metal} 水${wc.water}`);
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
