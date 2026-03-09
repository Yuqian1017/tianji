/**
 * 奇门遁甲 · 排盘引擎（转盘法·拆补法）
 * 参考: reference/qimen-algorithm.md + 06-qimen/02-zhifu-zhishi-cases.md
 */

import { Solar } from 'lunar-javascript';
import {
  TIANGAN, DIZHI, LUOSHU_ORDER, STAR_BASE, GATE_BASE, BASHEN,
  SANQI_LIUYI_ORDER, JIEQI_JU, JIEQI_ORDER, JIEQI_APPROX,
  JI_GE, XIONG_GE, SANQI, JIUXING, BAMEN, JIUGONG,
  WUXING_CN, getDunType,
} from './data.js';

// ===== 1. 公历→干支 + 节气 =====

/**
 * 获取指定日期时间的干支信息（使用lunar-javascript）
 */
function getGanZhi(year, month, day, hour) {
  // 子时跨日处理: 23:00属于次日子时
  let adjYear = year, adjMonth = month, adjDay = day;
  if (hour >= 23) {
    const d = new Date(year, month - 1, day + 1);
    adjYear = d.getFullYear();
    adjMonth = d.getMonth() + 1;
    adjDay = d.getDate();
  }

  const solar = Solar.fromYmd(adjYear, adjMonth, adjDay);
  const lunar = solar.getLunar();

  // 八字干支（以节气为界）
  const yearGZ = lunar.getYearInGanZhiExact();
  const monthGZ = lunar.getMonthInGanZhiExact();
  const dayGZ = lunar.getDayInGanZhi();

  const dayStem = dayGZ[0];
  const dayBranch = dayGZ[1];

  // 时柱干支
  const hourBranchIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
  const hourBranch = DIZHI[hourBranchIdx];

  // 五鼠遁时: 日干→时干
  const dayStemIdx = TIANGAN.indexOf(dayStem);
  const hourStemStartIdx = (dayStemIdx % 5) * 2;
  const hourStem = TIANGAN[(hourStemStartIdx + hourBranchIdx) % 10];

  return {
    yearGZ, monthGZ, dayGZ,
    dayStem, dayBranch,
    hourStem, hourBranch,
    hourBranchIdx,
  };
}

/**
 * 找当前日期所在的节气（奇门遁甲用全部24节气）
 * 返回: { name, dunType, date }
 *
 * 策略: lunar-javascript 的 getPrevJieQi() 返回的是严格"之前"的节气。
 * 如果当天正好是节气交接日，当天的节气会出现在 getNextJieQi() 或
 * lunar.getCurrentJieQi()。所以我们需要同时检查:
 * 1) 当天或次日的节气（nextJieQi 可能落在当天）
 * 2) 前一天的 prevJieQi（确保不遗漏）
 */
function findCurrentJieqi(year, month, day) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // 方法A: 检查当天是否有节气（getCurrentJieQi 或 getJieQi）
  // lunar-javascript: lunar.getJieQi() 返回当天节气名或空字符串
  const todayJQ = lunar.getJieQi();
  if (todayJQ) {
    const dunType = getDunType(todayJQ);
    if (dunType) {
      return {
        name: todayJQ,
        dunType,
        date: new Date(year, month - 1, day),
      };
    }
  }

  // 方法B: 检查 nextJieQi 是否落在当天（处理 getPrevJieQi 跳过当天的情况）
  const nextJQ = lunar.getNextJieQi();
  if (nextJQ) {
    const nSolar = nextJQ.getSolar();
    if (nSolar.getYear() === year && nSolar.getMonth() === month && nSolar.getDay() === day) {
      const name = nextJQ.getName();
      const dunType = getDunType(name);
      if (dunType) {
        return { name, dunType, date: new Date(year, month - 1, day) };
      }
    }
  }

  // 方法C: 正常使用 prevJieQi
  const prevJQ = lunar.getPrevJieQi();
  if (prevJQ) {
    const name = prevJQ.getName();
    const dunType = getDunType(name);
    if (dunType) {
      const jqSolar = prevJQ.getSolar();
      return {
        name,
        dunType,
        date: new Date(jqSolar.getYear(), jqSolar.getMonth() - 1, jqSolar.getDay()),
      };
    }
  }

  // 方法D: 向前搜索最近的有效节气
  let searchDate = new Date(year, month - 1, day);
  for (let i = 1; i <= 45; i++) {
    const d = new Date(year, month - 1, day - i);
    const s = Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const l = s.getLunar();
    // 检查这一天是否是节气日
    const djq = l.getJieQi();
    if (djq) {
      const dt = getDunType(djq);
      if (dt) {
        return { name: djq, dunType: dt, date: d };
      }
    }
    // 也检查 prevJieQi
    const pjq = l.getPrevJieQi();
    if (pjq) {
      const nm = pjq.getName();
      const dt = getDunType(nm);
      if (dt) {
        const jqS = pjq.getSolar();
        return { name: nm, dunType: dt, date: new Date(jqS.getYear(), jqS.getMonth() - 1, jqS.getDay()) };
      }
    }
  }

  console.warn('[奇门] 无法确定当前节气，回退到近似算法');
  return findJieqiApprox(year, month, day);
}

/**
 * 近似算法回退: 根据月日估算节气
 */
function findJieqiApprox(year, month, day) {
  let found = null;
  for (const jq of JIEQI_ORDER) {
    const [m, d] = JIEQI_APPROX[jq];
    if (month > m || (month === m && day >= d)) {
      found = jq;
    }
  }
  // 如果没找到（1月初，小寒之前）→ 用上年冬至
  if (!found) found = '冬至';

  const dunType = getDunType(found);
  const [am, ad] = JIEQI_APPROX[found];
  const jqYear = (found === '冬至' && month === 1) ? year - 1 : year;
  return {
    name: found,
    dunType,
    date: new Date(jqYear, am - 1, ad),
  };
}

// ===== 2. 三元（拆补法简化版） =====

/**
 * 拆补法确定上中下元
 * 核心: 找节气后的甲/己日分界
 * 简化版: 计算日数差 ÷ 5 天为一组
 */
function getSanyuan(jieqiDate, targetDate) {
  const diff = Math.floor((targetDate.getTime() - jieqiDate.getTime()) / (1000 * 60 * 60 * 24));

  // 找节气日之后的第一个甲/己日（天干索引 %5 === 0）
  const jqSolar = Solar.fromYmd(jieqiDate.getFullYear(), jieqiDate.getMonth() + 1, jieqiDate.getDate());
  const jqDayGZ = jqSolar.getLunar().getDayInGanZhi();
  const jqDayStemIdx = TIANGAN.indexOf(jqDayGZ[0]);

  // 距离下一个甲/己日的天数
  const stepsToJiaJi = (5 - (jqDayStemIdx % 5)) % 5;

  // 从该甲/己日起，每5天一元
  const daysFromJiaJi = diff - stepsToJiaJi;

  if (daysFromJiaJi < 0) return 0; // 节气后、首个甲己日前 → 归上元
  if (daysFromJiaJi < 5) return 0; // 上元
  if (daysFromJiaJi < 10) return 1; // 中元
  return 2; // 下元
}

// ===== 3. 布地盘 =====

/**
 * 布地盘（三奇六仪）
 * 阳遁: 从juNum宫起「戊」，按洛书顺序顺排
 * 阴遁: 从juNum宫起「戊」，按洛书顺序逆排
 */
function layoutDipan(juNum, dunType) {
  const dipan = {};
  const startIdx = LUOSHU_ORDER.indexOf(juNum);
  if (startIdx === -1) {
    console.error(`[奇门] 布地盘失败: 局数 ${juNum} 不在洛书序列中`);
    return dipan;
  }

  for (let i = 0; i < 9; i++) {
    let gong;
    if (i === 8) {
      // 第9个（乙）放在中5宫
      gong = 5;
    } else if (dunType === 'yang') {
      gong = LUOSHU_ORDER[(startIdx + i) % 8];
    } else {
      gong = LUOSHU_ORDER[((startIdx - i) % 8 + 8) % 8];
    }
    dipan[gong] = SANQI_LIUYI_ORDER[i];
  }

  return dipan;
}

// ===== 4. 值符值使 =====

/**
 * 找时干所在旬的旬首甲对应的六仪
 * 用日干支+时干支推算时辰在六十甲子中的位置
 */
function getXunshouLiuyi(hourStem, hourBranch) {
  const stemIdx = TIANGAN.indexOf(hourStem);
  const branchIdx = DIZHI.indexOf(hourBranch);

  // 六十甲子序号: (stemIdx, branchIdx) → idx
  // 只有同奇同偶才能组合
  // idx = (stemIdx * 6 + ((branchIdx - stemIdx + 12) % 12) / 2) % 60
  // 简化: 六十甲子中，天干地支配合，每旬10个
  const ganzhiIdx = (stemIdx * 12 + branchIdx - stemIdx * 12 % 12 + 60) % 60;

  // 更直接的方法：
  // 60甲子序号 = (stemIdx + (branchIdx - stemIdx + 60) % 10 * 6) ... 太复杂
  // 用穷举法: 六十甲子表
  // 天干循环10, 地支循环12, LCM=60
  // 第n个甲子 = stem[n%10] + branch[n%12]
  // 反推: 已知stem和branch, 找n使得 n%10===stemIdx 且 n%12===branchIdx
  let n = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      n = i;
      break;
    }
  }

  if (n === -1) {
    console.warn(`[奇门] 无法找到干支组合: ${hourStem}${hourBranch}, 回退到直接查找`);
    return hourStem === '甲' ? '戊' : hourStem;
  }

  // 旬首 = 每10个一旬, 旬首序号 = Math.floor(n/10)*10
  const xunStartIdx = Math.floor(n / 10) * 10;
  const xunBranchIdx = xunStartIdx % 12;
  const xunShou = '甲' + DIZHI[xunBranchIdx]; // 甲子/甲戌/甲申/甲午/甲辰/甲寅

  const XUNSHOU_LIUYI = {
    '甲子': '戊', '甲戌': '己', '甲申': '庚',
    '甲午': '辛', '甲辰': '壬', '甲寅': '癸',
  };

  return XUNSHOU_LIUYI[xunShou] || '戊';
}

/**
 * 确定值符和值使
 * 值符 = 时干旬首六仪所在地盘宫位的原有九星
 * 值使 = 同宫位的原有八门
 */
function getZhifuZhishi(dipan, hourStem, hourBranch) {
  // 找时干旬首对应的六仪
  const liuyi = getXunshouLiuyi(hourStem, hourBranch);

  // 在地盘上找该六仪所在宫位
  let zhifuGong = null;
  for (const [gong, qiyi] of Object.entries(dipan)) {
    if (qiyi === liuyi) {
      zhifuGong = parseInt(gong);
      break;
    }
  }

  if (zhifuGong === null) {
    console.error(`[奇门] 找不到六仪 ${liuyi} 在地盘上的位置`);
    zhifuGong = 1;
  }

  // 值符 = 该宫原有的九星
  const zhifu = STAR_BASE[zhifuGong];

  // 值使 = 该宫原有的八门（5宫寄2宫）
  const gateGong = zhifuGong === 5 ? 2 : zhifuGong;
  const zhishi = GATE_BASE[gateGong];

  return { zhifu, zhishi, zhifuGong };
}

// ===== 5. 找时干在地盘的落宫 =====

function findHourStemGong(dipan, hourStem) {
  // 如果时干是甲，找其旬首六仪... 但对于天盘转动，
  // 需要找的是时干本身在地盘上的位置
  // 甲隐于六仪之下，所以甲X时找X对应的六仪
  let searchStem = hourStem;
  if (hourStem === '甲') searchStem = '戊'; // 甲遁于戊

  for (const [gong, qiyi] of Object.entries(dipan)) {
    if (qiyi === searchStem) {
      return parseInt(gong);
    }
  }

  console.warn(`[奇门] 找不到时干 ${hourStem}(search: ${searchStem}) 在地盘位置`);
  return 1;
}

// ===== 6. 布天盘（九星随值符转）=====

function layoutTianpan(zhifuGong, hourStemGong) {
  const tianpan = {};

  // 计算值符从原始宫位→时干宫位的转动步数
  const fromGong = zhifuGong === 5 ? 2 : zhifuGong;
  const toGong = hourStemGong === 5 ? 2 : hourStemGong;

  const fromIdx = LUOSHU_ORDER.indexOf(fromGong);
  const toIdx = LUOSHU_ORDER.indexOf(toGong);
  const shift = ((toIdx - fromIdx) % 8 + 8) % 8;

  // 所有九星按同样步数转动
  for (let i = 0; i < 8; i++) {
    const origGong = LUOSHU_ORDER[i];
    const origStar = STAR_BASE[origGong];
    const newIdx = (i + shift) % 8;
    const newGong = LUOSHU_ORDER[newIdx];
    tianpan[newGong] = origStar;
  }

  // 天禽（5宫之星）随值符走，寄到值符所到之宫（简化：标记在结果中）
  tianpan[5] = '天禽'; // 标记，实际寄坤二宫

  return tianpan;
}

// ===== 7. 布人盘（八门随值使转）=====

function layoutRenpan(zhishi, hourStemGong) {
  const renpan = {};

  // 值使原始宫位
  const zhishiBaseGong = BAMEN.find(g => g.name === zhishi)?.base;
  if (!zhishiBaseGong) {
    console.error(`[奇门] 找不到值使 ${zhishi} 的原始宫位`);
    return renpan;
  }

  const toGong = hourStemGong === 5 ? 2 : hourStemGong;
  const fromIdx = LUOSHU_ORDER.indexOf(zhishiBaseGong);
  const toIdx = LUOSHU_ORDER.indexOf(toGong);
  const shift = ((toIdx - fromIdx) % 8 + 8) % 8;

  // 所有八门按同样步数转动
  for (let i = 0; i < 8; i++) {
    const origGong = LUOSHU_ORDER[i];
    const origGate = GATE_BASE[origGong];
    if (!origGate) continue; // 5宫无门
    const newIdx = (i + shift) % 8;
    const newGong = LUOSHU_ORDER[newIdx];
    renpan[newGong] = origGate;
  }

  return renpan;
}

// ===== 8. 布神盘（八神）=====

function layoutShenpan(hourStemGong, dunType) {
  const shenpan = {};
  const bashen = dunType === 'yang' ? BASHEN.yang : BASHEN.yin;
  const startGong = hourStemGong === 5 ? 2 : hourStemGong;
  const startIdx = LUOSHU_ORDER.indexOf(startGong);

  for (let i = 0; i < 8; i++) {
    const gongIdx = ((startIdx + i) % 8 + 8) % 8;
    shenpan[LUOSHU_ORDER[gongIdx]] = bashen[i];
  }

  return shenpan;
}

// ===== 9. 天盘奇仪 =====

/**
 * 天盘奇仪: 九星转动后，每宫的天盘干
 * 值符带着自己原宫的地盘干（即旬首六仪）飞到时干宫位
 * 其他星也各带各的地盘干同步转动
 */
function getTianpanQiyi(dipan, zhifuGong, hourStemGong) {
  const tianpanQiyi = {};

  const fromGong = zhifuGong === 5 ? 2 : zhifuGong;
  const toGong = hourStemGong === 5 ? 2 : hourStemGong;
  const fromIdx = LUOSHU_ORDER.indexOf(fromGong);
  const toIdx = LUOSHU_ORDER.indexOf(toGong);
  const shift = ((toIdx - fromIdx) % 8 + 8) % 8;

  for (let i = 0; i < 8; i++) {
    const origGong = LUOSHU_ORDER[i];
    const origQiyi = dipan[origGong]; // 该宫地盘干
    const newIdx = (i + shift) % 8;
    const newGong = LUOSHU_ORDER[newIdx];
    tianpanQiyi[newGong] = origQiyi;
  }

  // 中5宫天盘干 = 地盘干（不动）
  tianpanQiyi[5] = dipan[5];

  return tianpanQiyi;
}

// ===== 10. 格局判断 =====

function analyzeGejU(gongs) {
  const results = [];

  for (const gong of Object.values(gongs)) {
    const tian = gong.tianGan;
    const di = gong.diGan;
    if (!tian || !di) continue;

    // 检查吉格
    for (const ge of JI_GE) {
      if (ge.tian === tian && ge.di === di) {
        results.push({ type: 'ji', gong: gong.num, ...ge });
      }
    }

    // 检查凶格
    for (const ge of XIONG_GE) {
      if (ge.tian === tian && ge.di === di) {
        results.push({ type: 'xiong', gong: gong.num, ...ge });
      }
    }

    // 三奇得使
    if (SANQI[tian]) {
      if ((tian === '乙' && gong.gate === '开门') ||
          (tian === '丙' && gong.gate === '休门') ||
          (tian === '丁' && gong.gate === '生门')) {
        results.push({ type: 'ji', gong: gong.num, name: `${tian}奇得使`, desc: '大吉' });
      }
    }
  }

  return results;
}

// ===== 主函数 =====

/**
 * 奇门遁甲排盘主入口
 * @param {number} year 公历年
 * @param {number} month 公历月
 * @param {number} day 公历日
 * @param {number} hour 小时 (0-23)
 * @returns 完整奇门盘
 */
export function paiQimen(year, month, day, hour) {
  // 1. 获取干支
  const gz = getGanZhi(year, month, day, hour);

  // 2. 确定节气 + 阴阳遁
  const jieqi = findCurrentJieqi(year, month, day);
  const dunType = jieqi.dunType;

  // 3. 确定三元 + 局数
  const targetDate = new Date(year, month - 1, day);
  const yuan = getSanyuan(jieqi.date, targetDate);
  const juArr = JIEQI_JU[dunType][jieqi.name];
  if (!juArr) {
    console.error(`[奇门] 节气 ${jieqi.name} 在 ${dunType} 局数表中找不到`);
    return null;
  }
  const juNum = juArr[yuan];

  // 4. 布地盘
  const dipan = layoutDipan(juNum, dunType);

  // 5. 确定值符值使
  const { zhifu, zhishi, zhifuGong } = getZhifuZhishi(dipan, gz.hourStem, gz.hourBranch);

  // 6. 找时干在地盘的落宫
  const hourStemGong = findHourStemGong(dipan, gz.hourStem);

  // 7. 布天盘
  const tianpan = layoutTianpan(zhifuGong, hourStemGong);
  const tianpanQiyi = getTianpanQiyi(dipan, zhifuGong, hourStemGong);

  // 8. 布人盘
  const renpan = layoutRenpan(zhishi, hourStemGong);

  // 9. 布神盘
  const shenpan = layoutShenpan(hourStemGong, dunType);

  // 10. 组装九宫数据
  const gongs = {};
  for (let num = 1; num <= 9; num++) {
    const gInfo = JIUGONG.find(g => g.num === num);
    gongs[num] = {
      num,
      name: gInfo.name,
      dir: gInfo.dir,
      wuxing: gInfo.wuxing,
      diGan: dipan[num] || '',           // 地盘干
      tianGan: tianpanQiyi[num] || '',    // 天盘干
      star: tianpan[num] || '',           // 九星
      gate: renpan[num] || '',            // 八门
      shen: shenpan[num] || '',           // 八神
      isZhifuGong: num === hourStemGong,  // 值符所到之宫
    };
  }

  // 处理中五宫: 寄坤二宫
  if (!gongs[5].gate) gongs[5].gate = gongs[2].gate; // 共用二宫门
  if (!gongs[5].shen) gongs[5].shen = ''; // 中宫无独立八神

  // 11. 格局分析
  const geju = analyzeGejU(gongs);

  // 12. 日干所在宫位（用于AI解读"自己"的位置）
  let dayGanGong = null;
  const daySearchStem = gz.dayStem === '甲' ? '戊' : gz.dayStem;
  for (const [gong, qiyi] of Object.entries(dipan)) {
    if (qiyi === daySearchStem) {
      dayGanGong = parseInt(gong);
      break;
    }
  }

  return {
    meta: {
      dunType,
      dunTypeCn: dunType === 'yang' ? '阳遁' : '阴遁',
      juNum,
      jieqi: jieqi.name,
      yuan: ['上元', '中元', '下元'][yuan],
      yearGZ: gz.yearGZ,
      monthGZ: gz.monthGZ,
      dayGZ: gz.dayGZ,
      hourGZ: gz.hourStem + gz.hourBranch,
      dayStem: gz.dayStem,
      hourStem: gz.hourStem,
    },
    gongs,
    zhifu,
    zhishi,
    zhifuGong: hourStemGong, // 值符转到的宫位
    zhifuOrigGong: zhifuGong, // 值符原始宫位
    dayGanGong,
    geju,
    dipan,
    input: { year, month, day, hour },
  };
}

// ===== 格式化为AI可读文本 =====

export function formatForAI(result, question) {
  if (!result) return '';

  const { meta, gongs, zhifu, zhishi, dayGanGong, geju } = result;

  const lines = [];
  lines.push(`# 奇门遁甲排盘`);
  lines.push(`时间: ${meta.yearGZ}年 ${meta.monthGZ}月 ${meta.dayGZ}日 ${meta.hourGZ}时`);
  lines.push(`${meta.dunTypeCn}${meta.juNum}局 · ${meta.jieqi} · ${meta.yuan}`);
  lines.push(`值符: ${zhifu} | 值使: ${zhishi}`);
  lines.push(`日干: ${meta.dayStem} (落${gongs[dayGanGong]?.name || '?'}${dayGanGong}宫)`);
  lines.push('');

  // 九宫信息
  lines.push('## 九宫盘面');
  const displayOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 九宫格显示顺序
  for (const num of displayOrder) {
    const g = gongs[num];
    if (!g) continue;
    const marker = num === dayGanGong ? ' [日干]' : '';
    lines.push(`${g.name}${num}宫${marker}: 天${g.tianGan} 地${g.diGan} | ${g.star} ${g.gate} ${g.shen}`);
  }

  // 格局
  if (geju.length > 0) {
    lines.push('');
    lines.push('## 格局');
    for (const ge of geju) {
      lines.push(`${ge.type === 'ji' ? '吉' : '凶'}: ${ge.name} (${ge.desc}) — ${gongs[ge.gong]?.name || ''}${ge.gong}宫`);
    }
  }

  if (question) {
    lines.push('');
    lines.push(`## 求测事项: ${question}`);
  }

  return lines.join('\n');
}
