import {
  BAGUA, BINARY_TO_GUA, NAJIA, BRANCH_WUXING, TIANGAN, DIZHI,
  SIX_SPIRITS_ORDER, SPIRIT_START, JINGFANG, PURE_GUA_LIUQIN,
  WUXING_CN, YAO_NAMES,
} from './data.js';
import { createBaziCalendar } from '../bazi/calendar.js';

// ===== 五行关系 =====
const WUXING_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

export const LIUYAO_VALIDATION_MODEL = Object.freeze({
  school: 'jingfang_eight_palaces_najia',
  chartStatus: 'validated_deterministic',
  interpretationStatus: 'not_validated',
});

export function wuxingRelation(from, to) {
  if (from === to) return 'same';
  const fi = WUXING_ORDER.indexOf(from);
  const ti = WUXING_ORDER.indexOf(to);
  const diff = (ti - fi + 5) % 5;
  // 1=我生 2=我克 3=克我 4=生我
  return ['same', 'generate', 'restrict', 'restricted_by', 'generated_by'][diff];
}

// ===== 六亲判定 =====
// 以卦宫五行为"我"
export function getLiuqin(palaceWuxing, yaoWuxing) {
  const rel = wuxingRelation(palaceWuxing, yaoWuxing);
  const map = {
    'same': '兄弟',
    'generate': '子孙',       // 我生
    'restrict': '妻财',       // 我克
    'restricted_by': '官鬼',  // 克我
    'generated_by': '父母',   // 生我
  };
  return map[rel];
}

// ===== 六神 =====
export function getSixSpirits(dayStem) {
  const start = SPIRIT_START[dayStem];
  return Array.from({ length: 6 }, (_, i) => SIX_SPIRITS_ORDER[(start + i) % 6]);
}

// ===== 空亡计算 =====
export function getKongWang(dayStem, dayBranch) {
  const si = TIANGAN.indexOf(dayStem);
  const bi = DIZHI.indexOf(dayBranch);
  const xunStart = (bi - si + 12) % 12;
  return [DIZHI[(xunStart + 10) % 12], DIZHI[(xunStart + 11) % 12]];
}

// ===== 三枚铜钱随机 =====
export function throwCoins() {
  // 每枚铜钱: 背面(无字)=3 字面(有字)=2
  // 典籍口径（《卜筮正宗·以钱代蓍法》/《增删卜易·占卦法》互证，2026-07-12 跟随制审计）:
  // 一背为单(7 少阳) 两背为拆(8 少阴) 三背为重(9 老阳,动) 三字为交(6 老阴,动)
  // 即「以背记数」: coins 数组中 3 = 背面。见 database/knowledge/kp-ly-002.json CONFLICT-COIN-FACE。
  const coins = [0, 0, 0].map(() => (Math.random() < 0.5 ? 3 : 2));
  const total = coins.reduce((a, b) => a + b, 0);
  return { coins, total }; // total: 6=老阴 7=少阳 8=少阴 9=老阳（数值→卦的映射不变）
}

// ===== 一键随机起卦 =====
export function randomThrows() {
  return Array.from({ length: 6 }, () => throwCoins().total);
}

// ===== 根据六爻值确定上下卦 =====
function getYaoYinyang(value) {
  return (value === 7 || value === 9) ? 1 : 0; // 1=阳 0=阴
}

export function getTrigramFromValues(values) {
  // values: 三个爻的值 (从下到上)
  const binary = values.map(v => getYaoYinyang(v)).join('');
  return BINARY_TO_GUA[binary];
}

// ===== 查卦宫 =====
function findPalaceInfo(upperName, lowerName) {
  for (const [palaceName, palace] of Object.entries(JINGFANG)) {
    for (const gua of palace.gua) {
      if (gua.upper === upperName && gua.lower === lowerName) {
        return {
          palace: palaceName,
          palaceWuxing: palace.wuxing,
          guaName: gua.name,
          guaType: gua.type,
          world: gua.world,
          response: gua.response,
        };
      }
    }
  }
  console.warn(`Palace not found for ${upperName}/${lowerName}`);
  return null;
}

// ===== 纳甲 =====
function applyNajia(lowerGua, upperGua) {
  const lowerNajia = NAJIA[lowerGua];
  const upperNajia = NAJIA[upperGua];
  const lines = [];
  for (let i = 0; i < 3; i++) {
    lines.push({
      stem: lowerNajia.innerStem,
      branch: lowerNajia.inner[i],
    });
  }
  for (let i = 0; i < 3; i++) {
    lines.push({
      stem: upperNajia.outerStem,
      branch: upperNajia.outer[i],
    });
  }
  return lines; // lines[0]=初爻 ... lines[5]=上爻
}

// ===== 查伏神 =====
function findFushen(palaceGua, targetLiuqin, currentLines) {
  const pureGua = PURE_GUA_LIUQIN[palaceGua];
  if (!pureGua) return null;

  for (const line of pureGua.lines) {
    if (line.liuqin === targetLiuqin) {
      const flyingLine = currentLines[line.pos - 1];
      return {
        position: line.pos,
        najia: line.najia,
        branch: line.branch,
        wuxing: line.wx,
        liuqin: line.liuqin,
        feishenNajia: flyingLine.stem + flyingLine.branch,
      };
    }
  }
  return null;
}

function getCurrentLocalDateParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
}

function getDivinationCalendar(dateParts = getCurrentLocalDateParts()) {
  const { year, month, day, hour = 0, minute = 0 } = dateParts;
  return createBaziCalendar(year, month, day, hour, minute);
}

// ===== 获取当前日干支 =====
export function getTodayGanzhi(dateParts) {
  const day = getDivinationCalendar(dateParts).pillars.day;
  const idx = Array.from({ length: 60 }, (_, i) => i).find((i) => (
    TIANGAN[i % 10] === day.stem && DIZHI[i % 12] === day.branch
  ));

  return {
    ...day,
    idx,
  };
}

// ===== 获取当前月建（地支）=====
export function getCurrentMonthBranch(dateParts) {
  return getDivinationCalendar(dateParts).pillars.month.branch;
}

// ===== 获取当前年干支 =====
export function getCurrentYearGanzhi(dateParts) {
  return getDivinationCalendar(dateParts).pillars.year;
}

// ===== 主排盘函数 =====
export function paipan(rawValues, dateParts) {
  // rawValues: [7,8,8,9,7,6] 从初爻到上爻
  if (!rawValues || rawValues.length !== 6) {
    throw new Error('需要6个爻值');
  }
  if (rawValues.some((value) => ![6, 7, 8, 9].includes(value))) {
    throw new Error('爻值必须为 6、7、8 或 9');
  }

  // 1. 确定本卦上下卦
  const lowerBinary = rawValues.slice(0, 3).map(v => getYaoYinyang(v)).join('');
  const upperBinary = rawValues.slice(3, 6).map(v => getYaoYinyang(v)).join('');
  const lowerGua = BINARY_TO_GUA[lowerBinary];
  const upperGua = BINARY_TO_GUA[upperBinary];

  if (!lowerGua || !upperGua) {
    throw new Error(`无法识别卦象: lower=${lowerBinary}, upper=${upperBinary}`);
  }

  // 2. 查卦宫
  const palaceInfo = findPalaceInfo(upperGua, lowerGua);
  if (!palaceInfo) {
    throw new Error(`无法找到卦宫: ${upperGua}/${lowerGua}`);
  }

  // 3. 纳甲
  const najiaLines = applyNajia(lowerGua, upperGua);

  // 4. 确定动爻
  const movingLines = [];
  rawValues.forEach((v, i) => {
    if (v === 6 || v === 9) movingLines.push(i);
  });

  // 5. 求变卦
  let bianGuaInfo = null;
  if (movingLines.length > 0) {
    const changedValues = rawValues.map(v => {
      if (v === 9) return 8; // 老阳变阴
      if (v === 6) return 7; // 老阴变阳
      return v;
    });
    const bianLowerBinary = changedValues.slice(0, 3).map(v => getYaoYinyang(v)).join('');
    const bianUpperBinary = changedValues.slice(3, 6).map(v => getYaoYinyang(v)).join('');
    const bianLower = BINARY_TO_GUA[bianLowerBinary];
    const bianUpper = BINARY_TO_GUA[bianUpperBinary];
    if (bianLower && bianUpper) {
      bianGuaInfo = findPalaceInfo(bianUpper, bianLower);
      if (bianGuaInfo) {
        bianGuaInfo.najiaLines = applyNajia(bianLower, bianUpper);
      }
    }
  }

  // 6. 安六亲
  const palaceGua = palaceInfo.palace.replace('宫', '');
  const liuqinList = najiaLines.map(line => {
    const yaoWx = BRANCH_WUXING[line.branch];
    return getLiuqin(palaceInfo.palaceWuxing, yaoWx);
  });

  // 7. 获取日干支和月建
  const calendar = getDivinationCalendar(dateParts);
  const dayGanzhi = calendar.pillars.day;
  const monthBranch = calendar.pillars.month.branch;
  const yearGanzhi = calendar.pillars.year;

  // 8. 安六神
  const spirits = getSixSpirits(dayGanzhi.stem);

  // 9. 空亡
  const kongWang = getKongWang(dayGanzhi.stem, dayGanzhi.branch);

  // 10. 组装六爻信息
  const lines = najiaLines.map((nj, i) => {
    const yaoWx = BRANCH_WUXING[nj.branch];
    const isMoving = movingLines.includes(i);

    let bianYaoInfo = null;
    if (isMoving && bianGuaInfo?.najiaLines) {
      const bianLine = bianGuaInfo.najiaLines[i];
      const bianWx = BRANCH_WUXING[bianLine.branch];
      bianYaoInfo = {
        stem: bianLine.stem,
        branch: bianLine.branch,
        wuxing: bianWx,
        wuxingCn: WUXING_CN[bianWx],
        liuqin: getLiuqin(palaceInfo.palaceWuxing, bianWx),
      };
    }

    return {
      position: i + 1,
      positionName: YAO_NAMES[i],
      yinyang: getYaoYinyang(rawValues[i]) === 1 ? 'yang' : 'yin',
      rawValue: rawValues[i],
      stem: nj.stem,
      branch: nj.branch,
      wuxing: yaoWx,
      wuxingCn: WUXING_CN[yaoWx],
      liuqin: liuqinList[i],
      spirit: spirits[i],
      isWorld: i + 1 === palaceInfo.world,
      isResponse: i + 1 === palaceInfo.response,
      isEmpty: kongWang.includes(nj.branch),
      isMoving,
      bianYao: bianYaoInfo,
    };
  });

  // 11. 查伏神（找缺失的六亲）
  const existingLiuqin = new Set(liuqinList);
  const allLiuqin = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
  const missingLiuqin = allLiuqin.filter(lq => !existingLiuqin.has(lq));
  const fushenList = [];
  for (const missing of missingLiuqin) {
    const fs = findFushen(palaceGua, missing, najiaLines);
    if (fs) {
      fushenList.push(fs);
    }
  }

  return {
    // 本卦
    benGua: {
      name: palaceInfo.guaName,
      upper: upperGua,
      lower: lowerGua,
      palace: palaceInfo.palace,
      palaceWuxing: palaceInfo.palaceWuxing,
      palaceWuxingCn: WUXING_CN[palaceInfo.palaceWuxing],
      guaType: palaceInfo.guaType,
    },
    // 变卦
    bianGua: bianGuaInfo ? {
      name: bianGuaInfo.guaName,
      palace: bianGuaInfo.palace,
    } : null,
    // 六爻详情
    lines,
    // 动爻
    movingLines,
    // 伏神
    fushen: fushenList,
    // 日期信息
    date: {
      yearStem: yearGanzhi.stem,
      yearBranch: yearGanzhi.branch,
      monthBranch,
      dayStem: dayGanzhi.stem,
      dayBranch: dayGanzhi.branch,
    },
    // 空亡
    kongWang,
    // 原始数据
    rawValues,
    validationModel: LIUYAO_VALIDATION_MODEL,
  };
}

// ===== 格式化排盘结果为文本 (给AI用) =====
export function formatForAI(result, question) {
  const lines = result.lines.slice().reverse(); // 从上爻到初爻显示
  const fushenStr = result.fushen.length > 0
    ? result.fushen.map(f => `伏${f.liuqin}${f.najia}(${WUXING_CN[f.wuxing]}) 伏于第${f.position}爻下`).join('；')
    : '无伏神';

  return `占问事项：${question}
排盘口径：${result.validationModel?.school || LIUYAO_VALIDATION_MODEL.school}
排盘结构：${result.validationModel?.chartStatus || LIUYAO_VALIDATION_MODEL.chartStatus}
解释状态：${result.validationModel?.interpretationStatus || LIUYAO_VALIDATION_MODEL.interpretationStatus}

${result.date.yearStem}${result.date.yearBranch}年 ${result.date.monthBranch}月 ${result.date.dayStem}${result.date.dayBranch}日

本卦：${result.benGua.name}（${result.benGua.palace}·${result.benGua.palaceWuxingCn}·${result.benGua.guaType}）
变卦：${result.bianGua ? result.bianGua.name : '无动爻'}
动爻：${result.movingLines.length > 0 ? result.movingLines.map(i => YAO_NAMES[i]).join('、') : '无'}
空亡：${result.kongWang.join('、')}

六神 │ 六爻详情
─────┼──────────────────
${lines.map(l => `${l.spirit.padEnd(3, '　')}│ ${l.positionName} ${l.yinyang === 'yang' ? '⚊' : '⚋'} ${l.liuqin}${l.stem}${l.branch}${l.wuxingCn}${l.isWorld ? ' 世' : ''}${l.isResponse ? ' 应' : ''}${l.isMoving ? ` ○→${l.bianYao.liuqin}${l.bianYao.stem}${l.bianYao.branch}` : ''}${l.isEmpty ? '(空)' : ''}`).join('\n')}

伏神：${fushenStr}`;
}
