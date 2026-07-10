import { Solar } from 'lunar-javascript';

import { XIANTIAN, wuxingRelation, getHexagramName, getTotalStrokes, getStrokeCount, WUXING_CN } from './data.js';

const DIZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const MEIHUA_VALIDATION_MODEL = Object.freeze({
  school: 'meihua_yishu_declared_methods',
  chartStatus: 'validated_deterministic',
  interpretationStatus: 'not_validated',
});

/**
 * Cast hexagram by two numbers (报数起卦).
 * @param {number} num1 - First number (any positive integer)
 * @param {number} num2 - Second number (any positive integer)
 * @returns {object} Full meihua result
 */
export function castByNumber(num1, num2) {
  if (!Number.isInteger(num1) || num1 < 1 || !Number.isInteger(num2) || num2 < 1) {
    throw new Error('报数起卦需要两个正整数');
  }
  const upperNum = num1 % 8 || 8;
  const lowerNum = num2 % 8 || 8;
  const dong = (num1 + num2) % 6 || 6;

  return buildMeihuaChart({
    method: 'number',
    input: { num1, num2 },
    upperNum,
    lowerNum,
    dong,
  });
}

/**
 * Cast hexagram by current time (时间起卦).
 * Uses lunar month/day and the lunar year's earthly branch.
 * @param {Date} [date] - Date to use (default: now)
 * @returns {object} Full meihua result
 */
export function castByTime(date) {
  const d = date ?? new Date();
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    throw new Error('时间起卦需要有效日期');
  }
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();

  const lunar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    d.getSeconds(),
  ).getLunar();
  const lunarYear = lunar.getYear();
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const isLeapMonth = lunar.getMonth() < 0;
  const yearBranch = lunar.getYearZhi();
  const hourBranch = lunar.getTimeZhi();
  const yearBranchIdx = DIZHI_NAMES.indexOf(yearBranch) + 1;
  const hourBranchIdx = DIZHI_NAMES.indexOf(hourBranch) + 1;

  const sum1 = yearBranchIdx + lunarMonth + lunarDay;
  const sum2 = sum1 + hourBranchIdx;

  const upperNum = sum1 % 8 || 8;
  const lowerNum = sum2 % 8 || 8;
  const dong = sum2 % 6 || 6;

  return buildMeihuaChart({
    method: 'time',
    input: {
      calendar: 'lunar',
      year,
      month,
      day,
      hour,
      minute,
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeapMonth,
      leapMonthPolicy: 'reuse_base_month_number',
      lunarYearGanzhi: lunar.getYearInGanZhi(),
      lunarMonthName: lunar.getMonthInChinese(),
      lunarDayName: lunar.getDayInChinese(),
      yearBranch,
      hourBranch,
      yearBranchIdx,
      hourBranchIdx,
      timeStr: `${year}年${month}月${day}日 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}（农历${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}·${hourBranch}时）`,
    },
    upperNum,
    lowerNum,
    dong,
  });
}

/**
 * Cast hexagram by Chinese text / stroke counting (文字起卦).
 * @param {string} text - Chinese text input
 * @returns {object} Full meihua result
 */
export function castByText(text) {
  const chars = [...text.trim()]; // Handle multi-byte characters properly
  if (chars.length === 0) {
    throw new Error('请输入至少一个汉字');
  }

  let upperStrokes, lowerStrokes, totalStrokes;

  if (chars.length === 1) {
    // 1 character: strokes → both upper & lower; strokes → moving line
    const strokes = getStrokeCount(chars[0]);
    upperStrokes = strokes;
    lowerStrokes = strokes;
    totalStrokes = strokes;
  } else if (chars.length === 2) {
    // 2 characters: 1st → upper, 2nd → lower, total → moving line
    upperStrokes = getStrokeCount(chars[0]);
    lowerStrokes = getStrokeCount(chars[1]);
    totalStrokes = upperStrokes + lowerStrokes;
  } else {
    // 3+ characters: front half → upper, back half → lower, total → moving line
    const mid = Math.floor(chars.length / 2);
    const frontChars = chars.slice(0, mid);
    const backChars = chars.slice(mid);
    upperStrokes = getTotalStrokes(frontChars.join(''));
    lowerStrokes = getTotalStrokes(backChars.join(''));
    totalStrokes = upperStrokes + lowerStrokes;
  }

  const upperNum = upperStrokes % 8 || 8;
  const lowerNum = lowerStrokes % 8 || 8;
  const dong = totalStrokes % 6 || 6;

  return buildMeihuaChart({
    method: 'text',
    input: {
      text: text.trim(),
      charCount: chars.length,
      upperStrokes,
      lowerStrokes,
      totalStrokes,
    },
    upperNum,
    lowerNum,
    dong,
  });
}

/**
 * Build the complete meihua result from casting parameters.
 */
export function buildMeihuaChart({ method, input, upperNum, lowerNum, dong }) {
  if (!Number.isInteger(upperNum) || upperNum < 1 || upperNum > 8
    || !Number.isInteger(lowerNum) || lowerNum < 1 || lowerNum > 8) {
    throw new Error(`Invalid trigram number: upper=${upperNum}, lower=${lowerNum}`);
  }
  if (!Number.isInteger(dong) || dong < 1 || dong > 6) {
    throw new Error(`Invalid moving line: ${dong}`);
  }
  const upper = XIANTIAN[upperNum];
  const lower = XIANTIAN[lowerNum];

  // 体用判断: moving line in lower trigram (1-3) → lower=用, upper=体
  //            moving line in upper trigram (4-6) → upper=用, lower=体
  const tiPosition = dong <= 3 ? 'upper' : 'lower';
  const yongPosition = dong <= 3 ? 'lower' : 'upper';

  const tiGua = tiPosition === 'upper' ? upper : lower;
  const yongGua = yongPosition === 'upper' ? upper : lower;
  const tiNum = tiPosition === 'upper' ? upperNum : lowerNum;
  const yongNum = yongPosition === 'upper' ? upperNum : lowerNum;

  // 体用关系
  const tiYong = wuxingRelation(tiGua.wuxing, yongGua.wuxing);

  // 本卦 name (from 64 hexagram lookup)
  const benGuaName = getHexagramName(upper.name, lower.name);

  // 六爻 lines for 互卦/变卦 calculation
  // Build 6 lines from upper (lines 4,5,6) and lower (lines 1,2,3)
  // Binary: '1' = yang, '0' = yin; binary is bottom-to-top within each trigram
  const lowerLines = lower.binary.split('').map(Number); // [line1, line2, line3]
  const upperLines = upper.binary.split('').map(Number); // [line4, line5, line6]
  const allLines = [...lowerLines, ...upperLines]; // [line1, line2, line3, line4, line5, line6]

  // 互卦 (Mutual Hexagram): lower mutual = lines 2,3,4; upper mutual = lines 3,4,5
  const huLowerBinary = [allLines[1], allLines[2], allLines[3]].join('');
  const huUpperBinary = [allLines[2], allLines[3], allLines[4]].join('');
  const huUpperName = binaryToGuaName(huUpperBinary);
  const huLowerName = binaryToGuaName(huLowerBinary);
  const huGuaName = getHexagramName(huUpperName, huLowerName);

  // 变卦 (Changing Hexagram): flip the moving line
  const bianLines = [...allLines];
  bianLines[dong - 1] = bianLines[dong - 1] === 1 ? 0 : 1;
  const bianLowerBinary = [bianLines[0], bianLines[1], bianLines[2]].join('');
  const bianUpperBinary = [bianLines[3], bianLines[4], bianLines[5]].join('');
  const bianUpperName = binaryToGuaName(bianUpperBinary);
  const bianLowerName = binaryToGuaName(bianLowerBinary);
  const bianGuaName = getHexagramName(bianUpperName, bianLowerName);

  return {
    method,
    input,
    upper: { num: upperNum, ...upper },
    lower: { num: lowerNum, ...lower },
    dong,
    tiGua: { position: tiPosition, num: tiNum, ...tiGua },
    yongGua: { position: yongPosition, num: yongNum, ...yongGua },
    benGua: { name: benGuaName },
    huGua: {
      name: huGuaName,
      upper: { name: huUpperName, wuxing: getGuaWuxing(huUpperName) },
      lower: { name: huLowerName, wuxing: getGuaWuxing(huLowerName) },
    },
    bianGua: {
      name: bianGuaName,
      upper: { name: bianUpperName, wuxing: getGuaWuxing(bianUpperName) },
      lower: { name: bianLowerName, wuxing: getGuaWuxing(bianLowerName) },
    },
    tiYong: tiYong,
    validationModel: {
      ...MEIHUA_VALIDATION_MODEL,
      castingMethodStatus: method === 'text'
        ? 'source_pinned_modern_adaptation'
        : 'validated_declared_method',
      ...(method === 'text'
        ? { strokeDataStatus: 'unicode_unihan_17_informative' }
        : {}),
    },
  };
}

/**
 * Convert 3-digit binary string to trigram name.
 * Binary format: bottom line first, e.g. '100'=震, '001'=艮.
 */
function binaryToGuaName(binary) {
  for (const [, info] of Object.entries(XIANTIAN)) {
    if (info.binary === binary) return info.name;
  }
  console.warn(`Unknown trigram binary: ${binary}`);
  return '?';
}

/**
 * Get wuxing for a trigram name.
 */
function getGuaWuxing(name) {
  for (const [, info] of Object.entries(XIANTIAN)) {
    if (info.name === name) return info.wuxing;
  }
  return 'earth';
}

/**
 * Format meihua result for AI interpretation.
 * @param {object} result - Output from castByNumber/castByTime/castByText
 * @param {string} question - User's question
 * @returns {string} Formatted text for AI
 */
export function formatForAI(result, question) {
  const methodNames = {
    number: '报数起卦',
    time: '时间起卦',
    text: '文字起卦',
  };

  let inputDesc = '';
  if (result.method === 'number') {
    inputDesc = `报数：${result.input.num1}、${result.input.num2}`;
  } else if (result.method === 'time') {
    inputDesc = `时间：${result.input.timeStr}`;
  } else if (result.method === 'text') {
    inputDesc = `文字："${result.input.text}"（共${result.input.charCount}字，上卦笔画${result.input.upperStrokes}，下卦笔画${result.input.lowerStrokes}，总笔画${result.input.totalStrokes}）`;
  }

  return `占问事项：${question || '综合运势'}

起卦方式：${methodNames[result.method] || result.method}
${inputDesc}

本卦：${result.benGua.name}
上卦：${result.upper.name}（${result.upper.nature}·${WUXING_CN[result.upper.wuxing]}）${result.tiGua.position === 'upper' ? '← 体卦' : '← 用卦'}
下卦：${result.lower.name}（${result.lower.nature}·${WUXING_CN[result.lower.wuxing]}）${result.tiGua.position === 'lower' ? '← 体卦' : '← 用卦'}
动爻：第${result.dong}爻（${result.dong <= 3 ? '下卦动' : '上卦动'}）

结构状态：${result.validationModel.chartStatus}
起卦口径：${result.validationModel.castingMethodStatus}
解释状态：${result.validationModel.interpretationStatus}

体卦：${result.tiGua.name}（${WUXING_CN[result.tiGua.wuxing]}）
用卦：${result.yongGua.name}（${WUXING_CN[result.yongGua.wuxing]}）
传统解释标签：${result.tiYong.desc}（标签本身不证明现实吉凶）

互卦：${result.huGua.name}（上${result.huGua.upper.name}${WUXING_CN[result.huGua.upper.wuxing]}，下${result.huGua.lower.name}${WUXING_CN[result.huGua.lower.wuxing]}）
变卦：${result.bianGua.name}（上${result.bianGua.upper.name}${WUXING_CN[result.bianGua.upper.wuxing]}，下${result.bianGua.lower.name}${WUXING_CN[result.bianGua.lower.wuxing]}）

请将以上内容分为“结构观察”“传统文化解释”“现实边界”三部分说明。互卦和变卦只能称为传统解释对象，不得写成已经发生的过程或必然结果。`;
}
