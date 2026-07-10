/**
 * 玄空飞星下卦排盘引擎。
 *
 * 声明口径：沈氏玄空常用下卦法、正向盘、运盘顺飞；山向盘按入中星
 * 原宫的同元龙阴阳定顺逆，五黄借实际坐/向山阴阳。
 */

import { createBaziCalendar } from '../bazi/calendar.js';
import {
  ERSHISI_SHAN,
  FLY_ORDER,
  GUA_TO_GONG,
  JIUGONG,
  STAR_INFO,
} from './data.js';

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const GUA_BY_GONG = Object.fromEntries(Object.entries(GUA_TO_GONG).map(([gua, gong]) => [gong, gua]));

export const FENGSHUI_CALCULATION_MODEL = Object.freeze({
  school: '玄空飞星·沈氏下卦·正向盘',
  chartType: '下卦',
  calendar: 'lunar-javascript@1.7.7; exact solar-term boundary',
  validation: 'validated_declared_school',
  interpretationValidation: 'not_validated',
  unsupported: ['替卦', '兼向', '出卦', '形煞', '现实吉凶与化解'],
});

function wrap1to9(value) {
  return ((((value - 1) % 9) + 9) % 9) + 1;
}

function assertIntegerInRange(name, value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${label} ${name} 必须是 ${min}-${max} 的整数，收到 ${value}`);
  }
}

function assertYear(year, label = '年份') {
  assertIntegerInRange('year', year, 1, 9999, label);
}

function validateCivilDateTime(year, month, day, hour, minute) {
  assertYear(year, '公历');
  assertIntegerInRange('month', month, 1, 12, '公历');
  assertIntegerInRange('day', day, 1, 31, '公历');
  assertIntegerInRange('hour', hour, 0, 23, '时间');
  assertIntegerInRange('minute', minute, 0, 59, '时间');

  const probe = new Date(0);
  probe.setUTCHours(hour, minute, 0, 0);
  probe.setUTCFullYear(year, month - 1, day);
  if (
    probe.getUTCFullYear() !== year
    || probe.getUTCMonth() !== month - 1
    || probe.getUTCDate() !== day
  ) {
    throw new RangeError(`公历中不存在该日期 ${year}-${month}-${day}`);
  }
}

/** 根据已完成立春切换的太阳年查三元九运。 */
export function getCurrentYun(year) {
  assertYear(year);
  const cycleOffset = ((year - 1864) % 180 + 180) % 180;
  const yun = Math.floor(cycleOffset / 20) + 1;
  const cycleStart = year - cycleOffset;
  const start = cycleStart + (yun - 1) * 20;
  const yuan = yun <= 3 ? '上元' : yun <= 6 ? '中元' : '下元';
  return { yuan, yun, start, end: start + 19 };
}

/** 按真实立春时刻确定建造日期所属运。 */
export function getCurrentYunForDate(year, month, day, hour = 0, minute = 0) {
  validateCivilDateTime(year, month, day, hour, minute);
  const calendar = createBaziCalendar(year, month, day, hour, minute);
  return {
    ...getCurrentYun(calendar.adjustedYear),
    effectiveYear: calendar.adjustedYear,
    boundary: 'exact_lichun',
  };
}

/** 九星沿固定洛书路径飞布；顺飞数字递增，逆飞数字递减。 */
export function flyStars(centerStar, forward = true) {
  assertIntegerInRange('centerStar', centerStar, 1, 9, '飞星');
  if (typeof forward !== 'boolean') {
    throw new TypeError(`forward 必须是 boolean，收到 ${forward}`);
  }

  return Object.fromEntries(FLY_ORDER.map((palace, index) => [
    palace,
    wrap1to9(centerStar + (forward ? index : -index)),
  ]));
}

/** 根据罗盘度数定位二十四山；0 度为正北，顺时针增加。 */
export function findMountain(degree) {
  if (!Number.isFinite(degree)) {
    throw new RangeError(`坐向度数必须是 finite 有效数字，收到 ${degree}`);
  }
  const normalized = ((degree % 360) + 360) % 360;
  const mountain = ERSHISI_SHAN.find(item => (
    item.start < item.end
      ? normalized >= item.start && normalized < item.end
      : normalized >= item.start || normalized < item.end
  ));
  if (!mountain) throw new Error(`无法定位坐向度数 ${degree}`);
  return mountain;
}

/** 输入朝向度数，返回相对的坐山与朝向。 */
export function getSittingFacing(facingDegree) {
  if (!Number.isFinite(facingDegree)) {
    throw new RangeError(`朝向度数必须是 finite 有效数字，收到 ${facingDegree}`);
  }
  const normalizedFacing = ((facingDegree % 360) + 360) % 360;
  const sittingDegree = (normalizedFacing + 180) % 360;
  return {
    sitting: findMountain(sittingDegree),
    facing: findMountain(normalizedFacing),
    sittingDegree,
    facingDegree: normalizedFacing,
  };
}

function mountainCenter(mountain) {
  if (mountain.start < mountain.end) return (mountain.start + mountain.end) / 2;
  return ((mountain.start + mountain.end + 360) / 2) % 360;
}

function angularDistance(left, right) {
  const difference = Math.abs((((left - right) % 360) + 360) % 360);
  return Math.min(difference, 360 - difference);
}

function assertLowerChartDegree(degree, mountain) {
  if (angularDistance(((degree % 360) + 360) % 360, mountainCenter(mountain)) > 4.5 + 1e-9) {
    throw new RangeError(
      `${degree}° 超出${mountain.name}山下卦正向中间九度范围；替卦/兼向尚未实现，不能给出下卦盘`,
    );
  }
}

function findMountainByGuaAndYuan(gua, sanyuan) {
  const mountain = ERSHISI_SHAN.find(item => item.gua === gua && item.sanyuan === sanyuan);
  if (!mountain) throw new Error(`找不到 ${gua} 宫 ${sanyuan}元龙`);
  return mountain;
}

function determineFlyDirection(centerStar, sourceMountain) {
  if (centerStar === 5) return sourceMountain.yinyang === '阳';
  const homeGua = GUA_BY_GONG[centerStar];
  const substitute = findMountainByGuaAndYuan(homeGua, sourceMountain.sanyuan);
  return substitute.yinyang === '阳';
}

function getYunPan(yunNum) {
  return flyStars(yunNum, true);
}

function getShanPan(yunPan, sitting) {
  const center = yunPan[GUA_TO_GONG[sitting.gua]];
  return flyStars(center, determineFlyDirection(center, sitting));
}

function getXiangPan(yunPan, facing) {
  const center = yunPan[GUA_TO_GONG[facing.gua]];
  return flyStars(center, determineFlyDirection(center, facing));
}

function getYearCenter(year) {
  assertYear(year);
  return wrap1to9(9 - (year - 2000));
}

/** 输入的是已经按立春切换后的太阳年。 */
export function getYearFlyStar(year) {
  return flyStars(getYearCenter(year), true);
}

export function getYearFlyStarForDate(year, month, day, hour = 0, minute = 0) {
  validateCivilDateTime(year, month, day, hour, minute);
  const calendar = createBaziCalendar(year, month, day, hour, minute);
  return getYearFlyStar(calendar.adjustedYear);
}

export function getMonthFlyStarByBranches(yearBranch, monthBranch) {
  const monthBranchIndex = BRANCHES.indexOf(monthBranch);
  if (!BRANCHES.includes(yearBranch) || monthBranchIndex === -1) {
    throw new RangeError(`年支和月支必须是有效地支，收到 ${yearBranch}/${monthBranch}`);
  }
  const firstMonthCenter = '子午卯酉'.includes(yearBranch)
    ? 8
    : '辰戌丑未'.includes(yearBranch)
      ? 5
      : 2;
  const monthOffset = (monthBranchIndex - BRANCHES.indexOf('寅') + 12) % 12;
  return flyStars(wrap1to9(firstMonthCenter - monthOffset), true);
}

/** 兼容年+节令月序号接口：1 为寅月，12 为丑月，不是公历月。 */
export function getMonthFlyStar(year, solarMonthOrdinal) {
  assertYear(year);
  assertIntegerInRange('solarMonthOrdinal', solarMonthOrdinal, 1, 12, '节令月');
  const yearBranch = BRANCHES[((year - 4) % 12 + 12) % 12];
  const monthBranch = BRANCHES[(solarMonthOrdinal + 1) % 12];
  return getMonthFlyStarByBranches(yearBranch, monthBranch);
}

export function getMonthFlyStarForDate(year, month, day, hour = 0, minute = 0) {
  validateCivilDateTime(year, month, day, hour, minute);
  const calendar = createBaziCalendar(year, month, day, hour, minute);
  return getMonthFlyStarByBranches(calendar.pillars.year.branch, calendar.pillars.month.branch);
}

/** 八宅命卦年表的世纪常数；仅表达该传统算法，不代表现实属性。 */
export function getBenMingGua(year, gender) {
  assertYear(year, '出生年份');
  if (!['male', 'female'].includes(gender)) {
    throw new RangeError(`性别 gender 必须是 male 或 female，收到 ${gender}`);
  }

  const lastTwoDigits = year % 100;
  let raw;
  if (year < 2000) {
    raw = gender === 'male' ? 100 - lastTwoDigits : lastTwoDigits - 4;
  } else {
    raw = gender === 'male' ? 99 - lastTwoDigits : lastTwoDigits + 6;
  }
  let number = ((raw % 9) + 9) % 9;
  if (number === 0) number = 9;
  if (number === 5) number = gender === 'male' ? 2 : 8;

  const names = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兑', 8: '艮', 9: '离' };
  return {
    number,
    name: names[number],
    group: [1, 3, 4, 9].includes(number) ? '东四命' : '西四命',
  };
}

function analyzeFormation(shanPan, xiangPan, yunNum, sittingGua, facingGua) {
  const sittingGong = GUA_TO_GONG[sittingGua];
  const facingGong = GUA_TO_GONG[facingGua];
  const shanAtSitting = shanPan[sittingGong] === yunNum;
  const shanAtFacing = shanPan[facingGong] === yunNum;
  const xiangAtSitting = xiangPan[sittingGong] === yunNum;
  const xiangAtFacing = xiangPan[facingGong] === yunNum;

  let type;
  let label;
  if (shanAtSitting && xiangAtFacing) {
    type = 'wang-shan-wang-xiang';
    label = '旺山旺向';
  } else if (shanAtFacing && xiangAtSitting) {
    type = 'shang-shan-xia-shui';
    label = '上山下水';
  } else if (shanAtFacing && xiangAtFacing) {
    type = 'shuang-xing-dao-xiang';
    label = '双星到向';
  } else if (shanAtSitting && xiangAtSitting) {
    type = 'shuang-xing-dao-shan';
    label = '双星到坐';
  } else {
    throw new Error(`无法从 ${yunNum} 运 ${sittingGua}山${facingGua}向盘识别结构格局`);
  }

  return {
    type,
    label,
    validation: 'validated_structural_label',
    interpretationValidation: 'not_validated',
  };
}

/**
 * 年份参数均表示“该年立春后”的太阳年标签；精确边界请调用日期版辅助函数。
 */
export function paiFengshui(
  constructionYear,
  sittingDegree,
  analysisYear = new Date().getFullYear(),
  analysisMonth = null,
) {
  assertYear(constructionYear, '建造年份');
  assertYear(analysisYear, '分析年份');
  if (analysisMonth !== null) {
    assertIntegerInRange('analysisMonth', analysisMonth, 1, 12, '节令月');
  }

  const sitting = findMountain(sittingDegree);
  assertLowerChartDegree(sittingDegree, sitting);
  const normalizedSittingDegree = ((sittingDegree % 360) + 360) % 360;
  const facingDegree = (normalizedSittingDegree + 180) % 360;
  const facing = findMountain(facingDegree);
  const yunInfo = getCurrentYun(constructionYear);
  const yunPan = getYunPan(yunInfo.yun);
  const shanPan = getShanPan(yunPan, sitting);
  const xiangPan = getXiangPan(yunPan, facing);
  const yearPan = getYearFlyStar(analysisYear);
  const monthPan = analysisMonth === null ? null : getMonthFlyStar(analysisYear, analysisMonth);
  const yearCenter = yearPan[5];
  const geju = analyzeFormation(shanPan, xiangPan, yunInfo.yun, sitting.gua, facing.gua);

  const palaces = Object.fromEntries(JIUGONG.map(gong => [gong.num, {
    num: gong.num,
    name: gong.name,
    dir: gong.dir,
    wuxing: gong.wuxing,
    yunStar: yunPan[gong.num],
    shanStar: shanPan[gong.num],
    xiangStar: xiangPan[gong.num],
    yearStar: yearPan[gong.num],
    monthStar: monthPan?.[gong.num] ?? null,
    interpretationValidation: 'not_validated',
  }]));

  return {
    meta: {
      ...FENGSHUI_CALCULATION_MODEL,
      yunNum: yunInfo.yun,
      yunName: `${yunInfo.yun}运`,
      yuanName: yunInfo.yuan,
      constructionYear,
      constructionBoundary: 'solar_year_after_lichun',
      sittingDegree: normalizedSittingDegree,
      sittingName: sitting.name,
      sittingGua: sitting.gua,
      facingDegree,
      facingName: facing.name,
      facingGua: facing.gua,
      sanyuan: sitting.sanyuan,
      analysisYear,
      analysisBoundary: 'solar_year_after_lichun',
      analysisMonth,
      yearCenter,
    },
    yunPan,
    shanPan,
    xiangPan,
    yearPan,
    monthPan,
    palaces,
    geju,
    input: { constructionYear, sittingDegree: normalizedSittingDegree, analysisYear, analysisMonth },
  };
}

/** 只把已验证的盘面结构提供给 AI，不注入吉凶、疾病、财务或化解断语。 */
export function formatForAI(result) {
  if (!result) return '';
  const { meta, palaces, geju } = result;
  const lines = [
    '# 玄空飞星下卦盘',
    `建造太阳年: ${meta.constructionYear}（立春后） -> ${meta.yuanName}${meta.yunName}`,
    `坐向: 坐${meta.sittingName}(${meta.sittingGua})朝${meta.facingName}(${meta.facingGua})`,
    `坐山度数: ${meta.sittingDegree}°；三元龙: ${meta.sanyuan}元龙`,
    `结构格局标签: ${geju.label}（只验证位置关系，传统解释尚未验证）`,
    `分析太阳年: ${meta.analysisYear}（立春后）；年星中宫: ${STAR_INFO[meta.yearCenter]?.short}`,
    '',
    '## 九宫确定性结构',
  ];

  for (let num = 1; num <= 9; num += 1) {
    const palace = palaces[num];
    lines.push(
      `${palace.name}${num}宫(${palace.dir}): 运${palace.yunStar} 山${palace.shanStar} 向${palace.xiangStar} 年${palace.yearStar}`,
    );
  }

  lines.push('', '排盘核心已按声明流派验证；星性、格局解释及现实建议尚未验证。');
  return lines.join('\n');
}
