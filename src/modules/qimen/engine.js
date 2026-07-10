/**
 * 奇门遁甲排盘引擎。
 *
 * 声明口径：时家奇门、拆补法、转盘法、中五寄坤二、天禽随天芮。
 */

import { Solar } from 'lunar-javascript';
import { createBaziCalendar } from '../bazi/calendar.js';
import {
  TIANGAN,
  DIZHI,
  STAR_BASE,
  GATE_BASE,
  JIA_DUN,
  SANQI_LIUYI_ORDER,
  JIEQI_JU,
  QIMEN_PALACE_CLOCKWISE,
  QIMEN_PALACE_COUNTER_CLOCKWISE,
  QIMEN_GATE_SEQUENCE,
  QIMEN_DEITY_SEQUENCE,
  YUAN_BY_FUTOU_BRANCH,
  JI_GE,
  XIONG_GE,
  SANQI,
  JIUGONG,
} from './data.js';

const JIAZI = Array.from({ length: 60 }, (_, index) => (
  TIANGAN[index % TIANGAN.length] + DIZHI[index % DIZHI.length]
));

export const QIMEN_CALCULATION_MODEL = Object.freeze({
  method: '拆补法·转盘法',
  school: '时家奇门·拆补转盘·中五寄坤二·天禽随天芮',
  calendar: 'lunar-javascript@1.7.7; sect=1',
  solarTermBoundary: 'exact_to_minute',
  validation: 'validated_declared_school',
  interpretationValidation: 'not_validated',
});

function assertIntegerInRange(name, value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${label} ${name} 必须是 ${min}-${max} 的整数，收到 ${value}`);
  }
}

function validateCivilDateTime(year, month, day, hour, minute) {
  assertIntegerInRange('year', year, 1, 9999, '公历');
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

function pillarToString(pillar) {
  return pillar.stem + pillar.branch;
}

function normalizePalaceForCenter(palace) {
  return palace === 5 ? 2 : palace;
}

function findStemPalace(dipan, stem) {
  for (const [palace, earthStem] of Object.entries(dipan)) {
    if (earthStem === stem) return Number(palace);
  }
  throw new Error(`地盘中找不到天干 ${stem}`);
}

function findCurrentJieqi(year, month, day, hour, minute) {
  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  const current = lunar.getPrevJieQi(false);
  if (!current) throw new Error('无法确定当前节气');

  const name = current.getName();
  const dunType = JIEQI_JU.yang[name]
    ? 'yang'
    : JIEQI_JU.yin[name]
      ? 'yin'
      : null;
  if (!dunType) throw new Error(`节气 ${name} 不在奇门局数表中`);

  return {
    name,
    dunType,
    time: current.getSolar().toYmdHms(),
  };
}

export function getXunInfo(ganzhi) {
  const index = JIAZI.indexOf(ganzhi);
  if (index === -1) {
    throw new RangeError(`干支必须是六十甲子之一，收到 ${ganzhi}`);
  }

  const xunIndex = Math.floor(index / 10);
  const xunHead = JIAZI[xunIndex * 10];
  return {
    index,
    xunIndex,
    xunHead,
    hiddenStem: JIA_DUN[xunHead],
    steps: index % 10,
  };
}

/**
 * 拆补法以当日之前最近的甲/己日为符头，按符头地支定上中下元。
 */
export function getSanyuan(dayGZ) {
  const dayIndex = JIAZI.indexOf(dayGZ);
  if (dayIndex === -1) {
    throw new RangeError(`日干支必须是六十甲子之一，收到 ${dayGZ}`);
  }

  const daysSinceFuTou = dayIndex % 5;
  const fuTou = JIAZI[(dayIndex - daysSinceFuTou + 60) % 60];
  const name = YUAN_BY_FUTOU_BRANCH[fuTou[1]];
  return {
    index: ['上元', '中元', '下元'].indexOf(name),
    name,
    fuTou,
  };
}

/**
 * 三奇六仪从局数宫起，阳遁按 1-9 顺排，阴遁按 9-1 逆排。
 */
export function layoutDipan(juNum, dunType) {
  assertIntegerInRange('juNum', juNum, 1, 9, '奇门');
  if (!['yang', 'yin'].includes(dunType)) {
    throw new RangeError(`遁型必须是 yang 或 yin，收到 ${dunType}`);
  }

  return Object.fromEntries(SANQI_LIUYI_ORDER.map((stem, offset) => {
    const delta = dunType === 'yang' ? offset : -offset;
    const palace = ((juNum - 1 + delta + 9) % 9) + 1;
    return [palace, stem];
  }));
}

function getDutyInfo(dipan, hourGZ) {
  const xun = getXunInfo(hourGZ);
  const originalPalace = findStemPalace(dipan, xun.hiddenStem);
  const effectivePalace = normalizePalaceForCenter(originalPalace);
  return {
    xun,
    hiddenStem: xun.hiddenStem,
    originalPalace,
    star: STAR_BASE[originalPalace],
    gate: GATE_BASE[effectivePalace],
  };
}

function getDutyDoorPalace(originalPalace, steps, dunType) {
  const delta = dunType === 'yang' ? steps : -steps;
  const rawPalace = ((originalPalace - 1 + delta + 9 * 2) % 9) + 1;
  if (rawPalace !== 5) return rawPalace;
  return dunType === 'yang' ? 8 : 2;
}

function rotatePerimeter(originalPalace, destinationPalace, valueAtOriginalPalace) {
  const from = normalizePalaceForCenter(originalPalace);
  const to = normalizePalaceForCenter(destinationPalace);
  const fromIndex = QIMEN_PALACE_CLOCKWISE.indexOf(from);
  const toIndex = QIMEN_PALACE_CLOCKWISE.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`无法在转盘八宫中旋转 ${originalPalace} -> ${destinationPalace}`);
  }
  const shift = (toIndex - fromIndex + QIMEN_PALACE_CLOCKWISE.length) % QIMEN_PALACE_CLOCKWISE.length;

  return Object.fromEntries(QIMEN_PALACE_CLOCKWISE.map((palace, index) => [
    QIMEN_PALACE_CLOCKWISE[(index + shift) % QIMEN_PALACE_CLOCKWISE.length],
    valueAtOriginalPalace(palace),
  ]));
}

function layoutTianpan(dipan, dutyOriginalPalace, dutyDestinationPalace) {
  const stars = rotatePerimeter(
    dutyOriginalPalace,
    dutyDestinationPalace,
    palace => STAR_BASE[palace],
  );
  const stems = rotatePerimeter(
    dutyOriginalPalace,
    dutyDestinationPalace,
    palace => dipan[palace],
  );

  stars[5] = '天禽';
  stems[5] = dipan[5];

  const tianruiPalace = Number(Object.keys(stars).find(palace => stars[palace] === '天芮'));
  return {
    stars,
    stems,
    lodgedStars: { [tianruiPalace]: '天禽' },
    lodgedStems: { [tianruiPalace]: dipan[5] },
  };
}

function layoutRenpan(dutyGate, dutyDoorPalace) {
  const startPalaceIndex = QIMEN_PALACE_CLOCKWISE.indexOf(dutyDoorPalace);
  const startGateIndex = QIMEN_GATE_SEQUENCE.indexOf(dutyGate);
  if (startPalaceIndex === -1 || startGateIndex === -1) {
    throw new Error(`无法布八门：${dutyGate} @ ${dutyDoorPalace}`);
  }

  return Object.fromEntries(Array.from({ length: 8 }, (_, offset) => [
    QIMEN_PALACE_CLOCKWISE[(startPalaceIndex + offset) % 8],
    QIMEN_GATE_SEQUENCE[(startGateIndex + offset) % 8],
  ]));
}

function layoutShenpan(dutyDestinationPalace, dunType) {
  const order = dunType === 'yang' ? QIMEN_PALACE_CLOCKWISE : QIMEN_PALACE_COUNTER_CLOCKWISE;
  const startIndex = order.indexOf(dutyDestinationPalace);
  if (startIndex === -1) {
    throw new Error(`无法布八神：值符落宫 ${dutyDestinationPalace}`);
  }

  return Object.fromEntries(QIMEN_DEITY_SEQUENCE.map((deity, offset) => [
    order[(startIndex + offset) % order.length],
    deity,
  ]));
}

function analyzeGeju(gongs) {
  const results = [];

  for (const gong of Object.values(gongs)) {
    for (const ge of JI_GE) {
      if (ge.tian === gong.tianGan && ge.di === gong.diGan) {
        results.push({
          type: 'traditional',
          gong: gong.num,
          tian: ge.tian,
          di: ge.di,
          name: ge.name,
          desc: '传统格局标签，解释层尚未验证',
        });
      }
    }
    for (const ge of XIONG_GE) {
      if (ge.tian === gong.tianGan && ge.di === gong.diGan) {
        results.push({
          type: 'traditional',
          gong: gong.num,
          tian: ge.tian,
          di: ge.di,
          name: ge.name,
          desc: '传统格局标签，解释层尚未验证',
        });
      }
    }
    if (
      SANQI[gong.tianGan]
      && (
        (gong.tianGan === '乙' && gong.gate === '开门')
        || (gong.tianGan === '丙' && gong.gate === '休门')
        || (gong.tianGan === '丁' && gong.gate === '生门')
      )
    ) {
      results.push({
        type: 'traditional',
        gong: gong.num,
        name: `${gong.tianGan}奇得使`,
        desc: '传统格局标签，解释层尚未验证',
      });
    }
  }

  return results;
}

/**
 * @param {number} year 公历年
 * @param {number} month 公历月
 * @param {number} day 公历日
 * @param {number} hour 小时，0-23
 * @param {number} minute 分钟，0-59
 */
export function paiQimen(year, month, day, hour, minute = 0) {
  validateCivilDateTime(year, month, day, hour, minute);

  const calendar = createBaziCalendar(year, month, day, hour, minute);
  const yearGZ = pillarToString(calendar.pillars.year);
  const monthGZ = pillarToString(calendar.pillars.month);
  const dayGZ = pillarToString(calendar.pillars.day);
  const hourGZ = pillarToString(calendar.pillars.hour);
  const jieqi = findCurrentJieqi(year, month, day, hour, minute);
  const yuan = getSanyuan(dayGZ);
  const juNum = JIEQI_JU[jieqi.dunType][jieqi.name]?.[yuan.index];
  if (!juNum) throw new Error(`无法确定 ${jieqi.name}${yuan.name}的局数`);

  const dipan = layoutDipan(juNum, jieqi.dunType);
  const duty = getDutyInfo(dipan, hourGZ);
  const actualHourStem = calendar.pillars.hour.stem === '甲'
    ? duty.hiddenStem
    : calendar.pillars.hour.stem;
  const dutyDestinationPalace = normalizePalaceForCenter(
    findStemPalace(dipan, actualHourStem),
  );
  const dutyDoorPalace = getDutyDoorPalace(
    normalizePalaceForCenter(duty.originalPalace),
    duty.xun.steps,
    jieqi.dunType,
  );

  const tianpan = layoutTianpan(dipan, duty.originalPalace, dutyDestinationPalace);
  const renpan = layoutRenpan(duty.gate, dutyDoorPalace);
  const shenpan = layoutShenpan(dutyDestinationPalace, jieqi.dunType);
  const gongs = {};

  for (let num = 1; num <= 9; num += 1) {
    const info = JIUGONG.find(gong => gong.num === num);
    gongs[num] = {
      num,
      name: info.name,
      dir: info.dir,
      wuxing: info.wuxing,
      diGan: dipan[num],
      tianGan: tianpan.stems[num] || '',
      lodgedTianGan: tianpan.lodgedStems[num] || '',
      star: tianpan.stars[num] || '',
      lodgedStar: tianpan.lodgedStars[num] || '',
      gate: renpan[num] || '',
      shen: shenpan[num] || '',
      isZhifuGong: num === dutyDestinationPalace,
      isZhishiGong: num === dutyDoorPalace,
    };
  }

  const dayXun = getXunInfo(dayGZ);
  const daySearchStem = calendar.pillars.day.stem === '甲'
    ? dayXun.hiddenStem
    : calendar.pillars.day.stem;
  const dayGanGong = findStemPalace(dipan, daySearchStem);
  const geju = analyzeGeju(gongs);

  return {
    meta: {
      dunType: jieqi.dunType,
      dunTypeCn: jieqi.dunType === 'yang' ? '阳遁' : '阴遁',
      juNum,
      jieqi: jieqi.name,
      jieqiTime: jieqi.time,
      yuan: yuan.name,
      fuTou: yuan.fuTou,
      xunShou: duty.xun.xunHead,
      yearGZ,
      monthGZ,
      dayGZ,
      hourGZ,
      dayStem: calendar.pillars.day.stem,
      hourStem: calendar.pillars.hour.stem,
      actualHourStem,
      method: QIMEN_CALCULATION_MODEL.method,
      school: QIMEN_CALCULATION_MODEL.school,
      validation: QIMEN_CALCULATION_MODEL.validation,
      interpretationValidation: QIMEN_CALCULATION_MODEL.interpretationValidation,
    },
    gongs,
    zhifu: duty.star,
    zhishi: duty.gate,
    zhifuGong: dutyDestinationPalace,
    zhifuOrigGong: duty.originalPalace,
    zhishiGong: dutyDoorPalace,
    dayGanGong,
    geju,
    dipan,
    input: { year, month, day, hour, minute },
  };
}

export function formatForAI(result, question) {
  if (!result) return '';

  const { meta, gongs, zhifu, zhishi, dayGanGong, geju } = result;
  const lines = [
    '# 奇门遁甲排盘',
    `时间: ${meta.yearGZ}年 ${meta.monthGZ}月 ${meta.dayGZ}日 ${meta.hourGZ}时`,
    `${meta.dunTypeCn}${meta.juNum}局 · ${meta.jieqi} · ${meta.yuan}`,
    `口径: ${meta.school}`,
    `值符: ${zhifu} | 值使: ${zhishi}`,
    `日干: ${meta.dayStem} (落${gongs[dayGanGong]?.name || '?'}${dayGanGong}宫)`,
    '',
    '## 九宫盘面',
  ];

  for (const num of [4, 9, 2, 3, 5, 7, 8, 1, 6]) {
    const gong = gongs[num];
    if (!gong) continue;
    const marker = num === dayGanGong ? ' [日干]' : '';
    const lodged = gong.lodgedStar ? `(${gong.lodgedStar}同宫)` : '';
    lines.push(
      `${gong.name}${num}宫${marker}: 天${gong.tianGan} 地${gong.diGan} | ${gong.star}${lodged} ${gong.gate} ${gong.shen}`,
    );
  }

  if (geju.length > 0) {
    lines.push('', '## 传统格局标签（解释层尚未验证）');
    for (const ge of geju) {
      lines.push(
        `${ge.name} - ${gongs[ge.gong]?.name || ''}${ge.gong}宫；组合条件: 天盘${ge.tian || '-'} / 地盘${ge.di || '-'}`,
      );
    }
  }

  if (question) lines.push('', `## 用户希望了解的事项: ${question}`);
  return lines.join('\n');
}
