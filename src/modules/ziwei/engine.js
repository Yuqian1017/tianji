// ===== 紫微斗数 · 排盘引擎 =====

import { Solar } from 'lunar-javascript';
import {
  STEMS, BRANCHES, STEM_YINYANG,
  PALACE_NAMES, NAYIN, NAYIN_WUXING, WUXING_JU_MAP,
  ZIWEI_TABLE, ZIWEI_SERIES, TIANFU_SERIES, MAIN_STARS,
  WENCHANG_TABLE, WENQU_TABLE, ZUOFU_TABLE, YOUBI_TABLE,
  TIANKUI_TABLE, TIANYUE_TABLE,
  QINGYANG_TABLE, TUOLUO_TABLE,
  HUOXING_START, LINGXING_START,
  DIKONG_TABLE, DIJIE_TABLE,
  SIHUA_TABLE, LUCUN_TABLE, TIANMA_TABLE,
  HONGLUAN_TABLE, TIANXI_TABLE,
  STAR_INFO,
} from './data.js';

// ========== Helper functions ==========

function branchIdx(b) { return BRANCHES.indexOf(b); }
function stemIdx(s) { return STEMS.indexOf(s); }

/**
 * Find year-branch group for fire/bell star lookup
 */
function findYearBranchGroup(yearBranch, table) {
  for (const [group, pos] of Object.entries(table)) {
    if (group.includes(yearBranch)) {
      return pos;
    }
  }
  console.warn(`findYearBranchGroup: yearBranch "${yearBranch}" not found in table`);
  return null;
}

// ========== Step 1: Solar → Lunar conversion ==========

/**
 * Convert solar date to lunar date using lunar-javascript
 * @returns { lunarYear, lunarMonth, lunarDay, yearStem, yearBranch, isLeapMonth, lunarMonthDisplay, lunarDayDisplay }
 */
export function solarToLunar(solarYear, solarMonth, solarDay) {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  const lunar = solar.getLunar();

  return {
    lunarYear: lunar.getYear(),
    lunarMonth: Math.abs(lunar.getMonth()), // negative month means leap month
    lunarDay: lunar.getDay(),
    yearStem: lunar.getYearGan(),
    yearBranch: lunar.getYearZhi(),
    isLeapMonth: lunar.getMonth() < 0,
    // Display strings
    lunarYearDisplay: `${lunar.getYearGan()}${lunar.getYearZhi()}年`,
    lunarMonthDisplay: lunar.getMonthInChinese() + '月',
    lunarDayDisplay: lunar.getDayInChinese(),
  };
}

// ========== Step 2: Ming Gong & Shen Gong ==========

/**
 * Find mingGong (Life Palace) position
 * From 寅 count forward to month, then from that position count backward to hour
 */
function findMingGong(lunarMonth, hourBranch) {
  const hourIdx = branchIdx(hourBranch);
  // From 寅(idx=2) start at month 1, count forward to birth month
  const monthPos = (2 + lunarMonth - 1) % 12;
  // From that position, start at 子(hour 0), count backward to birth hour
  const mingGongIdx = (monthPos - hourIdx + 12) % 12;
  return BRANCHES[mingGongIdx];
}

/**
 * Find shenGong (Body Palace) position
 * From 寅 count forward to month, then from that position count forward to hour
 */
function findShenGong(lunarMonth, hourBranch) {
  const hourIdx = branchIdx(hourBranch);
  const monthPos = (2 + lunarMonth - 1) % 12;
  const shenGongIdx = (monthPos + hourIdx) % 12;
  return BRANCHES[shenGongIdx];
}

// ========== Step 3: Arrange Twelve Palaces ==========

/**
 * From mingGong position, arrange 12 palaces counterclockwise
 * Returns map: { palaceName: branchPosition }
 */
function arrangePalaces(mingGongBranch) {
  const startIdx = branchIdx(mingGongBranch);
  const palaceMap = {}; // palaceName → branch
  const branchToPalace = {}; // branch → palaceName

  for (let i = 0; i < 12; i++) {
    // Counterclockwise = decreasing index
    const bIdx = (startIdx - i + 12) % 12;
    palaceMap[PALACE_NAMES[i]] = BRANCHES[bIdx];
    branchToPalace[BRANCHES[bIdx]] = PALACE_NAMES[i];
  }

  return { palaceMap, branchToPalace };
}

// ========== Step 4: Determine Wu Xing Ju (Five Element Bureau) ==========

/**
 * Get palace heavenly stem using 五虎遁 (Five Tiger Escape)
 * Year stem determines the starting stem for 寅 palace
 */
function getPalaceStem(yearStem, palaceBranch) {
  const ysIdx = stemIdx(yearStem);
  // 五虎遁: year stem → 寅 palace starting stem
  const yinStemIdx = (ysIdx % 5) * 2 + 2; // 甲/己→丙, 乙/庚→戊, 丙/辛→庚, 丁/壬→壬, 戊/癸→甲
  const pIdx = branchIdx(palaceBranch);
  const yinIdx = 2; // 寅 index
  const offset = (pIdx - yinIdx + 12) % 12;
  return STEMS[(yinStemIdx + offset) % 10];
}

/**
 * Determine wuxing ju (bureau number) from ming gong stem+branch nayin
 */
function getWuxingJu(yearStem, mingGongBranch) {
  const mingGongStem = getPalaceStem(yearStem, mingGongBranch);
  const ganZhi = mingGongStem + mingGongBranch;
  const nayinName = NAYIN[ganZhi];
  if (!nayinName) {
    console.warn(`getWuxingJu: no nayin for "${ganZhi}"`);
    return 5; // fallback to 土五局
  }
  const wuxingChar = NAYIN_WUXING[ganZhi];
  const ju = WUXING_JU_MAP[wuxingChar];
  if (!ju) {
    console.warn(`getWuxingJu: unknown wuxing "${wuxingChar}" from nayin "${nayinName}"`);
    return 5;
  }
  return ju;
}

// ========== Step 5 & 6: Place Ziwei & Tianfu ==========

function placeZiwei(lunarDay, ju) {
  const table = ZIWEI_TABLE[ju];
  if (!table) {
    console.warn(`placeZiwei: no table for ju=${ju}`);
    return '子';
  }
  const pos = table[lunarDay];
  if (!pos) {
    console.warn(`placeZiwei: no entry for ju=${ju}, day=${lunarDay}`);
    return '子';
  }
  return pos;
}

function placeTianfu(ziweiPos) {
  const ziIdx = branchIdx(ziweiPos);
  // Tianfu mirrors Ziwei across the 寅-申 axis
  const tianfuIdx = (4 - ziIdx + 12) % 12;
  return BRANCHES[tianfuIdx];
}

// ========== Step 7: Place all 14 main stars ==========

function placeMainStars(ziweiPos, tianfuPos) {
  const starPositions = {}; // starName → branch

  // Ziwei series: offset from ziwei (counterclockwise = negative)
  const ziBase = branchIdx(ziweiPos);
  for (const { name, offset } of ZIWEI_SERIES) {
    const idx = (ziBase + offset + 12) % 12;
    starPositions[name] = BRANCHES[idx];
  }

  // Tianfu series: offset from tianfu (clockwise = positive)
  const tfBase = branchIdx(tianfuPos);
  for (const { name, offset } of TIANFU_SERIES) {
    const idx = (tfBase + offset) % 12;
    starPositions[name] = BRANCHES[idx];
  }

  return starPositions;
}

// ========== Step 8: Place auxiliary stars ==========

function placeAuxStars(yearStem, yearBranch, lunarMonth, hourBranch) {
  const starPositions = {};
  const hourIdx = branchIdx(hourBranch);

  // === Six Auspicious Stars (六吉) ===
  starPositions['文昌'] = WENCHANG_TABLE[hourBranch];
  starPositions['文曲'] = WENQU_TABLE[hourBranch];
  starPositions['左辅'] = ZUOFU_TABLE[lunarMonth];
  starPositions['右弼'] = YOUBI_TABLE[lunarMonth];
  starPositions['天魁'] = TIANKUI_TABLE[yearStem];
  starPositions['天钺'] = TIANYUE_TABLE[yearStem];

  // === Six Malefic Stars (六煞) ===
  starPositions['擎羊'] = QINGYANG_TABLE[yearStem];
  starPositions['陀罗'] = TUOLUO_TABLE[yearStem];

  // Fire star: year branch group + hour offset
  const huoStart = findYearBranchGroup(yearBranch, HUOXING_START);
  if (huoStart) {
    const huoStartIdx = branchIdx(huoStart);
    starPositions['火星'] = BRANCHES[(huoStartIdx + hourIdx) % 12];
  }

  // Bell star
  const lingStart = findYearBranchGroup(yearBranch, LINGXING_START);
  if (lingStart) {
    const lingStartIdx = branchIdx(lingStart);
    starPositions['铃星'] = BRANCHES[(lingStartIdx + hourIdx) % 12];
  }

  starPositions['地空'] = DIKONG_TABLE[hourBranch];
  starPositions['地劫'] = DIJIE_TABLE[hourBranch];

  // === Miscellaneous Stars (杂曜) ===
  starPositions['禄存'] = LUCUN_TABLE[yearStem];
  starPositions['天马'] = TIANMA_TABLE[yearBranch];
  starPositions['红鸾'] = HONGLUAN_TABLE[yearBranch];
  starPositions['天喜'] = TIANXI_TABLE[yearBranch];

  return starPositions;
}

// ========== Step 9: Apply Four Transformations (四化) ==========

function applySihua(yearStem) {
  const table = SIHUA_TABLE[yearStem];
  if (!table) {
    console.warn(`applySihua: no entry for yearStem "${yearStem}"`);
    return {};
  }
  // Returns: { starName: transformType }
  const result = {};
  for (const [transform, starName] of Object.entries(table)) {
    result[starName] = transform; // e.g. '太阳': '禄'
  }
  return result;
}

// ========== Step 10: Dayun (Major Cycles) ==========

function computeDayun(mingGongBranch, ju, yearStem, gender) {
  const isYangYear = stemIdx(yearStem) % 2 === 0;
  const isMale = gender === 'male';
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale);

  const startAge = ju; // Starting age = bureau number
  const step = forward ? 1 : -1;
  const baseIdx = branchIdx(mingGongBranch);

  // Get ming gong stem for dayun stem calculation
  const baseStemIdx = stemIdx(getPalaceStem(yearStem, mingGongBranch));

  const dayun = [];
  for (let i = 0; i < 12; i++) {
    const bIdx = (baseIdx + (i + 1) * step + 120) % 12;
    const sIdx = (baseStemIdx + (i + 1) * step + 100) % 10;
    const stem = STEMS[sIdx];
    const branch = BRANCHES[bIdx];
    dayun.push({
      stem,
      branch,
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1,
      nayin: NAYIN[stem + branch] || '',
    });
  }
  return { dayun, forward };
}

// ========== Build 12-palace data structure ==========

function buildPalaceGrid(palaceMap, branchToPalace, shenGongBranch, allStarPositions, sihua) {
  // Create 12 palace objects indexed by branch
  const palaces = BRANCHES.map(branch => {
    const palaceName = branchToPalace[branch] || '';
    const isMingGong = palaceName === '命宫';
    const isShenGong = branch === shenGongBranch;

    // Collect stars in this palace
    const mainStars = [];
    const auxStars = [];

    for (const [starName, starBranch] of Object.entries(allStarPositions)) {
      if (starBranch !== branch) continue;
      const info = STAR_INFO[starName];
      const sihuaMark = sihua[starName] || null;

      if (MAIN_STARS.includes(starName)) {
        mainStars.push({ name: starName, wuxing: info?.wuxing, sihua: sihuaMark });
      } else {
        auxStars.push({ name: starName, wuxing: info?.wuxing, category: info?.category, sihua: sihuaMark });
      }
    }

    return {
      branch,
      palaceName,
      palaceStem: '', // will be set later
      isMingGong,
      isShenGong,
      mainStars,
      auxStars,
    };
  });

  return palaces;
}

// ========== Main entry function ==========

/**
 * Full Ziwei Dou Shu paipan
 * @param solarYear  Solar calendar year
 * @param solarMonth Solar calendar month (1-12)
 * @param solarDay   Solar calendar day
 * @param hourBranch Birth hour as 地支 string ('子','丑',...,'亥')
 * @param gender     'male' or 'female'
 */
export function paiZiwei(solarYear, solarMonth, solarDay, hourBranch, gender) {
  // Step 0: Solar → Lunar conversion
  const lunar = solarToLunar(solarYear, solarMonth, solarDay);
  const { lunarMonth, lunarDay, yearStem, yearBranch, isLeapMonth } = lunar;

  // Handle leap month: use the original month for calculation
  const effectiveMonth = lunarMonth;

  // Step 1: Find Ming Gong and Shen Gong
  const mingGongBranch = findMingGong(effectiveMonth, hourBranch);
  const shenGongBranch = findShenGong(effectiveMonth, hourBranch);

  // Step 2: Arrange twelve palaces
  const { palaceMap, branchToPalace } = arrangePalaces(mingGongBranch);

  // Step 3: Determine Wu Xing Ju
  const ju = getWuxingJu(yearStem, mingGongBranch);
  const juNames = { 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' };
  const juName = juNames[ju] || `${ju}局`;

  // Step 4: Place Ziwei star
  const ziweiPos = placeZiwei(lunarDay, ju);

  // Step 5: Place Tianfu star
  const tianfuPos = placeTianfu(ziweiPos);

  // Step 6 & 7: Place all 14 main stars
  const mainStarPositions = placeMainStars(ziweiPos, tianfuPos);

  // Step 8: Place auxiliary stars
  const auxStarPositions = placeAuxStars(yearStem, yearBranch, effectiveMonth, hourBranch);

  // Merge all star positions
  const allStarPositions = { ...mainStarPositions, ...auxStarPositions };

  // Step 9: Apply four transformations
  const sihua = applySihua(yearStem);

  // Step 10: Compute dayun
  const { dayun, forward: dayunForward } = computeDayun(mingGongBranch, ju, yearStem, gender);

  // Set palace stems
  const palaceStemsMap = {};
  for (const branch of BRANCHES) {
    palaceStemsMap[branch] = getPalaceStem(yearStem, branch);
  }

  // Build palace grid
  const palaces = buildPalaceGrid(palaceMap, branchToPalace, shenGongBranch, allStarPositions, sihua);

  // Set palace stems on each palace
  for (const p of palaces) {
    p.palaceStem = palaceStemsMap[p.branch];
  }

  // Ming gong stem for display
  const mingGongStem = getPalaceStem(yearStem, mingGongBranch);
  const mingGongNayin = NAYIN[mingGongStem + mingGongBranch] || '';

  // Find ming gong main stars for summary
  const mingGongStars = [];
  for (const [starName, starBranch] of Object.entries(mainStarPositions)) {
    if (starBranch === mingGongBranch) {
      mingGongStars.push(starName);
    }
  }

  // Birth year info
  const birthYearGanZhi = yearStem + yearBranch;

  return {
    // Input echo
    solar: { year: solarYear, month: solarMonth, day: solarDay },
    lunar,
    hourBranch,
    gender,

    // Core calculations
    mingGong: { branch: mingGongBranch, stem: mingGongStem, nayin: mingGongNayin },
    shenGong: { branch: shenGongBranch, palaceName: branchToPalace[shenGongBranch] || '' },
    ju, juName,
    ziweiPos, tianfuPos,
    birthYearGanZhi,

    // Star positions
    mainStarPositions,
    auxStarPositions,
    allStarPositions,
    sihua,

    // Palace grid (12 palaces)
    palaces,
    palaceMap,
    branchToPalace,

    // Dayun
    dayun,
    dayunForward,

    // Summary
    mingGongStars,
    isLeapMonth,
  };
}

// ========== Format for AI ==========

export function formatForAI(result, question) {
  const lines = [];

  // Basic info
  lines.push(`命主信息：${result.gender === 'male' ? '男' : '女'}命`);
  lines.push(`阳历：${result.solar.year}年${result.solar.month}月${result.solar.day}日`);
  lines.push(`农历：${result.lunar.lunarYearDisplay}${result.lunar.lunarMonthDisplay}${result.lunar.lunarDayDisplay}${result.isLeapMonth ? '（闰月）' : ''}`);
  lines.push(`时辰：${result.hourBranch}时`);
  lines.push('');

  // Core structure
  lines.push(`命宫：${result.mingGong.stem}${result.mingGong.branch}（${result.mingGong.nayin}）`);
  lines.push(`身宫：${result.shenGong.branch}（${result.shenGong.palaceName}）`);
  lines.push(`五行局：${result.juName}`);
  lines.push(`命宫主星：${result.mingGongStars.length > 0 ? result.mingGongStars.join('、') : '无主星（空宫）'}`);
  lines.push('');

  // Four transformations
  const sihuaEntries = Object.entries(result.sihua);
  if (sihuaEntries.length > 0) {
    const yearStem = result.lunar.yearStem;
    lines.push(`本命四化（${yearStem}干）：`);
    // Find which palace each transformed star is in
    for (const [starName, transform] of sihuaEntries) {
      const starBranch = result.allStarPositions[starName];
      const palaceName = starBranch ? result.branchToPalace[starBranch] : '?';
      lines.push(`  ${starName}化${transform} → ${palaceName || '?'}（${starBranch || '?'}）`);
    }
    lines.push('');
  }

  // Twelve palaces and their stars
  lines.push('十二宫星曜分布：');
  for (const palace of result.palaces) {
    if (!palace.palaceName) continue;
    const markers = [];
    if (palace.isMingGong) markers.push('★命宫');
    if (palace.isShenGong) markers.push('☆身宫');

    const mainNames = palace.mainStars.map(s => {
      const mark = s.sihua ? `(化${s.sihua})` : '';
      return s.name + mark;
    }).join('、');

    const auxNames = palace.auxStars.map(s => {
      const mark = s.sihua ? `(化${s.sihua})` : '';
      return s.name + mark;
    }).join('、');

    const starStr = [mainNames, auxNames].filter(Boolean).join(' / ');
    const markerStr = markers.length > 0 ? ` ${markers.join(' ')}` : '';
    lines.push(`  ${palace.palaceName}（${palace.branch}）${markerStr}：${starStr || '（空宫）'}`);
  }
  lines.push('');

  // Dayun
  lines.push(`大运（${result.dayunForward ? '顺行' : '逆行'}，${result.juName}起运）：`);
  for (const d of result.dayun) {
    lines.push(`  ${d.startAge}-${d.endAge}岁 ${d.stem}${d.branch}〔${d.nayin}〕`);
  }
  lines.push('');

  // Question
  lines.push(question ? `命主想了解：${question}` : '请做全面分析。');
  lines.push('');
  lines.push('请按照紫微斗数理论全面分析此命盘。');

  return lines.join('\n');
}
