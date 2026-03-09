/**
 * 风水飞星 · 排盘引擎（玄空飞星法）
 * 参考: 07-fengshui/01-xuankong-feixing.md + 03-luopan-data.md
 */

import {
  SANYUAN_JIUYUN, ERSHISI_SHAN, FLY_ORDER, GUA_TO_GONG,
  JIUGONG, STAR_INFO, STAR_COMBO, STAR_REMEDY, WUXING_CN,
} from './data.js';

// ===== 1. 三元九运 =====

/** 根据年份查找所属运数 (支持180年循环) */
export function getCurrentYun(year) {
  const found = SANYUAN_JIUYUN.find(y => year >= y.start && year <= y.end);
  if (found) return found;

  // 180年循环: 1864前或2043后
  const cycle = 180;
  const base = 1864;
  const offset = ((year - base) % cycle + cycle) % cycle;
  const normalized = base + offset;
  const fallback = SANYUAN_JIUYUN.find(y => normalized >= y.start && normalized <= y.end);
  if (fallback) return { ...fallback, start: year - offset + (fallback.start - base), end: year - offset + (fallback.end - base) };

  console.warn('[风水] 无法确定运数，默认九运');
  return SANYUAN_JIUYUN[8];
}

// ===== 2. 九宫飞星核心 =====

/**
 * 飞星布局
 * @param {number} centerStar 中宫星数 (1-9)
 * @param {boolean} forward 是否顺飞
 * @returns {{ [gong: number]: number }} 各宫星数
 */
export function flyStars(centerStar, forward = true) {
  const result = {};
  for (let i = 0; i < 9; i++) {
    let star;
    if (forward) {
      star = ((centerStar - 1 + i) % 9) + 1;
    } else {
      star = ((centerStar - 1 - i + 18) % 9) + 1;
    }
    result[FLY_ORDER[i]] = star;
  }
  return result;
}

// ===== 3. 二十四山 =====

/** 根据度数找到对应的二十四山 */
export function findMountain(degree) {
  degree = ((degree % 360) + 360) % 360;
  return ERSHISI_SHAN.find(m => {
    if (m.start < m.end) {
      return degree >= m.start && degree < m.end;
    }
    // 跨0度: 子山 352.5-7.5
    return degree >= m.start || degree < m.end;
  });
}

/** 根据朝向度数计算坐向 */
export function getSittingFacing(facingDegree) {
  const facing = findMountain(facingDegree);
  const sittingDegree = (facingDegree + 180) % 360;
  const sitting = findMountain(sittingDegree);
  return { sitting, facing, sittingDegree, facingDegree };
}

// ===== 4. 运盘 =====

/** 运盘: 运数入中宫顺飞 */
function getYunPan(yunNum) {
  return flyStars(yunNum, true);
}

// ===== 5. 山盘 & 向盘 =====

/**
 * 判断山/向星的飞行方向（顺飞或逆飞）
 * 规则: 看该二十四山的阴阳属性
 * 阳山 → 顺飞, 阴山 → 逆飞
 */
function determineFlyDirection(mountain) {
  return mountain.yinyang === '阳';
}

/** 山盘: 坐山所在宫位的运星入中宫 */
function getShanPan(yunPan, sitting) {
  const sittingGong = GUA_TO_GONG[sitting.gua];
  const shanCenter = yunPan[sittingGong];
  const forward = determineFlyDirection(sitting);
  return flyStars(shanCenter, forward);
}

/** 向盘: 朝向所在宫位的运星入中宫 */
function getXiangPan(yunPan, facing) {
  const facingGong = GUA_TO_GONG[facing.gua];
  const xiangCenter = yunPan[facingGong];
  const forward = determineFlyDirection(facing);
  return flyStars(xiangCenter, forward);
}

// ===== 6. 年飞星 & 月飞星 =====

/** 年飞星: 以2000年九紫入中为基准逆推 */
export function getYearFlyStar(year) {
  const center = ((9 - ((year - 2000) % 9) + 9) % 9) || 9;
  return flyStars(center, true);
}

/** 月飞星 */
export function getMonthFlyStar(year, month) {
  const DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const yearBranch = DIZHI[((year - 4) % 12 + 12) % 12];

  let janCenter;
  if ('子午卯酉'.includes(yearBranch)) janCenter = 8;
  else if ('辰戌丑未'.includes(yearBranch)) janCenter = 5;
  else janCenter = 2;

  const center = ((janCenter - ((month - 1) % 9) + 9) % 9) || 9;
  return flyStars(center, true);
}

// ===== 7. 本命卦（八宅法）=====

/** 计算本命卦 */
export function getBenMingGua(year, gender) {
  let sum = 0, y = year;
  while (y > 0) { sum += y % 10; y = Math.floor(y / 10); }
  while (sum >= 10) {
    let s = 0, n = sum;
    while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    sum = s;
  }

  let gua;
  if (gender === 'male') {
    gua = year < 2000 ? ((11 - sum) % 9 || 9) : ((10 - sum) % 9 || 9);
  } else {
    gua = year < 2000 ? ((sum + 4) % 9 || 9) : ((sum + 5) % 9 || 9);
  }
  if (gua === 5) gua = gender === 'male' ? 2 : 8;

  const names = { 1:'坎', 2:'坤', 3:'震', 4:'巽', 6:'乾', 7:'兑', 8:'艮', 9:'离' };
  const group = [1,3,4,9].includes(gua) ? '东四命' : '西四命';
  return { number: gua, name: names[gua], group };
}

// ===== 8. 格局分析 =====

/**
 * 判断格局类型
 * 旺山旺向: 当运星(yunNum)在山盘的坐方 + 在向盘的向方
 * 上山下水: 当运星在山盘的向方 + 在向盘的坐方
 * 双星到向: 山盘+向盘的当运星都到了向方
 * 双星到山: 都到了坐方
 */
function analyzeGeju(shanPan, xiangPan, yunNum, sittingGua, facingGua) {
  const sittingGong = GUA_TO_GONG[sittingGua];
  const facingGong = GUA_TO_GONG[facingGua];

  const shanAtSitting = shanPan[sittingGong] === yunNum;
  const shanAtFacing = shanPan[facingGong] === yunNum;
  const xiangAtSitting = xiangPan[sittingGong] === yunNum;
  const xiangAtFacing = xiangPan[facingGong] === yunNum;

  if (shanAtSitting && xiangAtFacing) {
    return { type: 'wang-shan-wang-xiang', label: '旺山旺向', nature: '最吉', desc: '丁财两旺，大吉格局' };
  }
  if (shanAtFacing && xiangAtSitting) {
    return { type: 'shang-shan-xia-shui', label: '上山下水', nature: '最凶', desc: '损丁破财，大凶格局' };
  }
  if (shanAtFacing && xiangAtFacing) {
    return { type: 'shuang-xing-dao-xiang', label: '双星到向', nature: '中', desc: '向方宜开阔有水，旺财但丁稍弱' };
  }
  if (shanAtSitting && xiangAtSitting) {
    return { type: 'shuang-xing-dao-shan', label: '双星到山', nature: '中', desc: '坐方宜有山有靠，旺丁但财稍弱' };
  }

  return { type: 'other', label: '普通格局', nature: '平', desc: '需逐宫分析吉凶' };
}

// ===== 9. 宫位组合分析 =====

function findCombos(yunStar, shanStar, xiangStar, yearStar) {
  const stars = [
    { type: '山向', s1: shanStar, s2: xiangStar },
    { type: '运山', s1: yunStar, s2: shanStar },
    { type: '运向', s1: yunStar, s2: xiangStar },
  ];
  if (yearStar) {
    stars.push({ type: '年山', s1: yearStar, s2: shanStar });
    stars.push({ type: '年向', s1: yearStar, s2: xiangStar });
  }

  const found = [];
  for (const pair of stars) {
    const combo = STAR_COMBO.find(c => c.s1 === pair.s1 && c.s2 === pair.s2);
    if (combo) {
      found.push({ ...combo, pairType: pair.type });
    }
  }
  return found;
}

// ===== 10. 主函数 =====

/**
 * 风水飞星排盘主入口
 * @param {number} constructionYear 建造年份
 * @param {number} sittingDegree 坐山度数 (0-360)
 * @param {number} analysisYear 分析年份 (默认当年)
 * @param {number|null} analysisMonth 分析月份 (null=不算月飞星)
 */
export function paiFengshui(constructionYear, sittingDegree, analysisYear = new Date().getFullYear(), analysisMonth = null) {
  // 1. 确定运数
  const yunInfo = getCurrentYun(constructionYear);
  const yunNum = yunInfo.yun;

  // 2. 确定坐向
  const sitting = findMountain(sittingDegree);
  const facingDegree = (sittingDegree + 180) % 360;
  const facing = findMountain(facingDegree);

  if (!sitting || !facing) {
    console.error('[风水] 无法确定坐向', sittingDegree);
    return null;
  }

  // 3. 排运盘
  const yunPan = getYunPan(yunNum);

  // 4. 排山盘 & 向盘
  const shanPan = getShanPan(yunPan, sitting);
  const xiangPan = getXiangPan(yunPan, facing);

  // 5. 年飞星
  const yearPan = getYearFlyStar(analysisYear);
  const yearCenter = ((9 - ((analysisYear - 2000) % 9) + 9) % 9) || 9;

  // 6. 月飞星 (optional)
  const monthPan = analysisMonth ? getMonthFlyStar(analysisYear, analysisMonth) : null;

  // 7. 格局判断
  const geju = analyzeGeju(shanPan, xiangPan, yunNum, sitting.gua, facing.gua);

  // 8. 组装九宫数据
  const palaces = {};
  for (let num = 1; num <= 9; num++) {
    const gInfo = JIUGONG.find(g => g.num === num);
    const yunStar = yunPan[num];
    const shanStar = shanPan[num];
    const xiangStar = xiangPan[num];
    const yearStar = yearPan[num];
    const monthStar = monthPan ? monthPan[num] : null;

    const combos = findCombos(yunStar, shanStar, xiangStar, yearStar);

    // 判断该宫总体吉凶
    const hasXiong = combos.some(c => c.nature === '大凶' || c.nature === '凶');
    const hasJi = combos.some(c => c.nature === '吉');
    const has5or2 = [yunStar, shanStar, xiangStar, yearStar].some(s => s === 5 || s === 2);

    let assessment = '平';
    if (hasXiong || has5or2) assessment = '凶';
    if (hasJi && !hasXiong) assessment = '吉';

    const remedy = STAR_REMEDY[yearStar];

    palaces[num] = {
      num,
      name: gInfo.name,
      dir: gInfo.dir,
      wuxing: gInfo.wuxing,
      yunStar,
      shanStar,
      xiangStar,
      yearStar,
      monthStar,
      combos,
      assessment,
      remedy,
    };
  }

  return {
    meta: {
      yunNum,
      yunName: `${yunNum}运`,
      yuanName: yunInfo.yuan,
      constructionYear,
      sittingDegree,
      sittingName: sitting.name,
      sittingGua: sitting.gua,
      facingDegree,
      facingName: facing.name,
      facingGua: facing.gua,
      analysisYear,
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
    input: { constructionYear, sittingDegree, analysisYear, analysisMonth },
  };
}

// ===== 11. AI 格式化 =====

export function formatForAI(result) {
  if (!result) return '';
  const { meta, palaces, geju } = result;

  let text = `# 玄空飞星风水分析\n\n`;
  text += `建造年份: ${meta.constructionYear}年 → ${meta.yuanName}${meta.yunName}\n`;
  text += `坐向: 坐${meta.sittingName}(${meta.sittingGua})朝${meta.facingName}(${meta.facingGua})\n`;
  text += `坐山度数: ${meta.sittingDegree}°\n`;
  text += `格局: ${geju.label} (${geju.desc})\n`;
  text += `分析年份: ${meta.analysisYear}年 (年飞星中宫: ${STAR_INFO[meta.yearCenter]?.short})\n\n`;

  text += `## 九宫飞星\n\n`;
  for (let num = 1; num <= 9; num++) {
    const p = palaces[num];
    const starNames = [
      `运${STAR_INFO[p.yunStar]?.short}`,
      `山${STAR_INFO[p.shanStar]?.short}`,
      `向${STAR_INFO[p.xiangStar]?.short}`,
      `年${STAR_INFO[p.yearStar]?.short}`,
    ];
    text += `${p.name}${num}宫(${p.dir}): ${starNames.join(' ')} | 评估: ${p.assessment}\n`;
    if (p.combos.length > 0) {
      text += `  组合: ${p.combos.map(c => `${c.name}(${c.nature})`).join(', ')}\n`;
    }
  }

  text += `\n## 当运星信息\n`;
  text += `当旺星: 九紫(9) | 生气星: 一白(1) | 衰死星: 二黑(2)·三碧(3)·五黄(5)·七赤(7)\n`;

  return text;
}
