import { XIANTIAN, wuxingRelation, getHexagramName, getTotalStrokes, getStrokeCount, WUXING_CN } from './data.js';

/**
 * Cast hexagram by two numbers (报数起卦).
 * @param {number} num1 - First number (any positive integer)
 * @param {number} num2 - Second number (any positive integer)
 * @returns {object} Full meihua result
 */
export function castByNumber(num1, num2) {
  const upperNum = num1 % 8 || 8;
  const lowerNum = num2 % 8 || 8;
  const dong = (num1 + num2) % 6 || 6;

  return buildResult({
    method: 'number',
    input: { num1, num2 },
    upperNum,
    lowerNum,
    dong,
  });
}

/**
 * Cast hexagram by current time (时间起卦).
 * Uses solar calendar as simplified approach for MVP.
 * Traditional method uses 农历 (lunar calendar).
 * @param {Date} [date] - Date to use (default: now)
 * @returns {object} Full meihua result
 */
export function castByTime(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  const hour = d.getHours();

  // 年支数: map year to earthly branch index (1-12)
  // The earthly branch cycle: 子=1, 丑=2, ... 亥=12
  // Year's earthly branch: (year - 4) % 12 → 0=子, 1=丑, ..., 11=亥
  // For meihua calculation we need 1-based: 子=1, 丑=2, ..., 亥=12
  const yearBranchIdx = ((year - 4) % 12) + 1;

  // 时辰支数: convert 24-hour to 12 earthly branches
  // 子时(23-1)=1, 丑时(1-3)=2, ..., 亥时(21-23)=12
  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2) + 1;

  const sum1 = yearBranchIdx + month + day;
  const sum2 = sum1 + hourBranchIdx;

  const upperNum = sum1 % 8 || 8;
  const lowerNum = sum2 % 8 || 8;
  const dong = sum2 % 6 || 6;

  const DIZHI_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const yearBranch = DIZHI_NAMES[(year - 4) % 12];
  const hourBranch = DIZHI_NAMES[Math.floor(((hour + 1) % 24) / 2)];

  return buildResult({
    method: 'time',
    input: {
      year, month, day, hour,
      yearBranch, hourBranch,
      yearBranchIdx, hourBranchIdx,
      timeStr: `${year}年${month}月${day}日 ${hour}时（${hourBranch}时）`,
      note: '使用公历日期（传统用农历，结果可能略有差异）',
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

  return buildResult({
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
function buildResult({ method, input, upperNum, lowerNum, dong }) {
  const upper = XIANTIAN[upperNum];
  const lower = XIANTIAN[lowerNum];

  if (!upper || !lower) {
    throw new Error(`Invalid trigram number: upper=${upperNum}, lower=${lowerNum}`);
  }

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
  const lowerLines = lower.binary.split('').reverse().map(Number); // [line1, line2, line3]
  const upperLines = upper.binary.split('').reverse().map(Number); // [line4, line5, line6]
  const allLines = [...lowerLines, ...upperLines]; // [line1, line2, line3, line4, line5, line6]

  // 互卦 (Mutual Hexagram): lower mutual = lines 2,3,4; upper mutual = lines 3,4,5
  const huLowerBinary = [allLines[1], allLines[2], allLines[3]].reverse().join('');
  const huUpperBinary = [allLines[2], allLines[3], allLines[4]].reverse().join('');
  const huUpperName = binaryToGuaName(huUpperBinary);
  const huLowerName = binaryToGuaName(huLowerBinary);
  const huGuaName = getHexagramName(huUpperName, huLowerName);

  // 变卦 (Changing Hexagram): flip the moving line
  const bianLines = [...allLines];
  bianLines[dong - 1] = bianLines[dong - 1] === 1 ? 0 : 1;
  const bianLowerBinary = [bianLines[0], bianLines[1], bianLines[2]].reverse().join('');
  const bianUpperBinary = [bianLines[3], bianLines[4], bianLines[5]].reverse().join('');
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
  };
}

/**
 * Convert 3-digit binary string to trigram name.
 * Binary format: MSB first (top line first), e.g. '111'=乾, '000'=坤
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

体卦：${result.tiGua.name}（${WUXING_CN[result.tiGua.wuxing]}）
用卦：${result.yongGua.name}（${WUXING_CN[result.yongGua.wuxing]}）
体用关系：${result.tiYong.desc} → ${result.tiYong.verdict}

互卦：${result.huGua.name}（上${result.huGua.upper.name}${WUXING_CN[result.huGua.upper.wuxing]}，下${result.huGua.lower.name}${WUXING_CN[result.huGua.lower.wuxing]}）
变卦：${result.bianGua.name}（上${result.bianGua.upper.name}${WUXING_CN[result.bianGua.upper.wuxing]}，下${result.bianGua.lower.name}${WUXING_CN[result.bianGua.lower.wuxing]}）

请按照梅花断法分析此卦，重点分析体用关系、互卦过程、变卦结果，并结合卦象取象给出判断和建议。`;
}
