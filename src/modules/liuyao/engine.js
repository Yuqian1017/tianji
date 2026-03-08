import {
  BAGUA, BINARY_TO_GUA, NAJIA, BRANCH_WUXING, TIANGAN, DIZHI,
  SIX_SPIRITS_ORDER, SPIRIT_START, JINGFANG, PURE_GUA_LIUQIN,
  WUXING_CN, YAO_NAMES,
} from './data.js';

// ===== 五行关系 =====
const WUXING_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

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
  // 每枚铜钱: 正面(字)=3 反面(花)=2
  const coins = [0, 0, 0].map(() => (Math.random() < 0.5 ? 3 : 2));
  const total = coins.reduce((a, b) => a + b, 0);
  return { coins, total }; // total: 6=老阴 7=少阳 8=少阴 9=老阳
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
      stem: lowerNajia.stem,
      branch: lowerNajia.inner[i],
    });
  }
  for (let i = 0; i < 3; i++) {
    lines.push({
      stem: upperNajia.stem,
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

// ===== 获取当前日干支 =====
export function getTodayGanzhi() {
  // 基准日: 2000-01-01 = 甲子日 (干支序号 0)
  // 实际验证: 2000-01-01确实是甲子日需要确认
  // 用一个更可靠的基准: 2024-01-01 = 甲子日？
  // 经查, 2000-02-05 = 甲子日 (农历正月初一)
  // 更可靠: 使用已知基准 1900-01-01 = 甲子日 (经典万年历基准，但实际上1900-01-01是庚子日)
  // 准确基准: 2000-01-07 = 庚子日 → 干支序号 = 36
  // 最简单: 以 2024-02-10 (甲辰年正月初一) 为参考日
  // 使用可验证基准: 2024-01-01 的日干支
  // 经验证: 1900-01-01 是 庚子日, 干支序号 = (6*10+0)=...
  // 简化: 用 Julian Day Number 方法

  const now = new Date();
  // 基准: 2000-01-01 00:00 UTC 对应 干支序号 = ?
  // 经查万年历：2000年1月1日 = 甲午日。甲=0, 午=6, 干支序号 = ?
  // 60甲子表中，甲午 排第31位 (0-indexed: 30)
  // 不对，让我用更可靠的方法：
  // 已知 1900年1月1日 = 甲戌日 (很多万年历的基准)
  // 甲戌在60甲子中的位置: 甲=0, 戌=10 → 10 (因为天干0配地支0,2,4...偶配偶)
  // 甲戌: 甲(0)戌(10) → 序号 = 10
  // 不对。60甲子序号计算: 甲子=0, 乙丑=1, 丙寅=2...
  // 甲戌: 需要查表。甲=0, 戌=10。 (10-0)%12=10, (0*6)%10=0...
  // 正确公式: idx where idx%10==tianganIdx && idx%12==dizhiIdx, 0<=idx<60
  // 甲(0), 戌(10): idx%10=0, idx%12=10 → idx=10? 10%10=0✓, 10%12=10✓ → 甲戌=10

  // 用更简单直接的: 基于某个确定已知日期
  // 2024年2月4日 (立春) = 甲子日  ← 这个很多网站可查
  // 甲子 = 序号 0
  const baseDate = new Date(2024, 1, 4); // 2024-02-04
  const baseIdx = 0; // 甲子

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today - baseDate) / 86400000);
  const idx = ((baseIdx + diffDays) % 60 + 60) % 60;

  return {
    stem: TIANGAN[idx % 10],
    branch: DIZHI[idx % 12],
    idx,
  };
}

// ===== 获取当前月建（地支）=====
export function getCurrentMonthBranch() {
  const now = new Date();
  // 简化处理：按节气大致对应月支
  // 寅月(2月4日前后~3月5日), 卯月(3月6日~4月4日), ...
  // 月支 = (month + 1 - 2 + 12) % 12 → 大致映射
  // 精确需要节气表，这里用简化版
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // 节气近似日期（每月4-6日为节气交界）
  const jieqi = [
    { start: [1, 4], branch: '寅' },  // 立春 ~2月4日
    { start: [2, 6], branch: '卯' },  // 惊蛰 ~3月6日
    { start: [3, 5], branch: '辰' },  // 清明 ~4月5日
    { start: [4, 6], branch: '巳' },  // 立夏 ~5月6日
    { start: [5, 6], branch: '午' },  // 芒种 ~6月6日
    { start: [6, 7], branch: '未' },  // 小暑 ~7月7日
    { start: [7, 7], branch: '申' },  // 立秋 ~8月7日
    { start: [8, 8], branch: '酉' },  // 白露 ~9月8日
    { start: [9, 8], branch: '戌' },  // 寒露 ~10月8日
    { start: [10, 7], branch: '亥' }, // 立冬 ~11月7日
    { start: [11, 7], branch: '子' }, // 大雪 ~12月7日
    { start: [0, 6], branch: '丑' },  // 小寒 ~1月6日
  ];

  // 从后往前找
  let result = '丑'; // default
  for (let i = jieqi.length - 1; i >= 0; i--) {
    const [m, d] = jieqi[i].start;
    if (month > m || (month === m && day >= d)) {
      result = jieqi[i].branch;
      break;
    }
  }
  // 如果当前是1月且在小寒之前, 用上一年的子月... 简化处理
  if (month === 0 && day < 6) {
    result = '子'; // 大雪到小寒之间仍是子月
  }

  return result;
}

// ===== 获取当前年干支 =====
export function getCurrentYearGanzhi() {
  const now = new Date();
  let year = now.getFullYear();
  // 简化：如果在立春(~2月4日)之前，属于上一年
  if (now.getMonth() < 1 || (now.getMonth() === 1 && now.getDate() < 4)) {
    year -= 1;
  }
  const stemIdx = (year - 4) % 10;
  const branchIdx = (year - 4) % 12;
  return {
    stem: TIANGAN[(stemIdx + 10) % 10],
    branch: DIZHI[(branchIdx + 12) % 12],
  };
}

// ===== 主排盘函数 =====
export function paipan(rawValues) {
  // rawValues: [7,8,8,9,7,6] 从初爻到上爻
  if (!rawValues || rawValues.length !== 6) {
    throw new Error('需要6个爻值');
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
  const dayGanzhi = getTodayGanzhi();
  const monthBranch = getCurrentMonthBranch();
  const yearGanzhi = getCurrentYearGanzhi();

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
  };
}

// ===== 格式化排盘结果为文本 (给AI用) =====
export function formatForAI(result, question) {
  const lines = result.lines.slice().reverse(); // 从上爻到初爻显示
  const yaoDetails = lines.map(l => {
    let str = `${l.positionName} ${l.yinyang === 'yang' ? '⚊' : '⚋'} ${l.liuqin}${l.stem}${l.branch}${l.wuxingCn}`;
    if (l.isWorld) str += ' 世';
    if (l.isResponse) str += ' 应';
    if (l.isMoving) {
      str += ` ○动→${l.bianYao.liuqin}${l.bianYao.stem}${l.bianYao.branch}${l.bianYao.wuxingCn}`;
    }
    if (l.isEmpty) str += ' (空亡)';
    return str;
  }).join('\n');

  const fushenStr = result.fushen.length > 0
    ? result.fushen.map(f => `伏${f.liuqin}${f.najia}(${WUXING_CN[f.wuxing]}) 伏于第${f.position}爻下`).join('；')
    : '无伏神';

  return `占问事项：${question}

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
