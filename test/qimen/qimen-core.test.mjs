import assert from 'node:assert/strict';
import test from 'node:test';

import * as qimen from '../../src/modules/qimen/engine.js';

const JIAZI = Array.from({ length: 60 }, (_, index) => {
  const stems = '甲乙丙丁戊己庚辛壬癸';
  const branches = '子丑寅卯辰巳午未申酉戌亥';
  return stems[index % 10] + branches[index % 12];
});

const XUN_HEADS = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
const YUAN_BY_FUTOU_BRANCH = {
  子: '上元', 午: '上元', 卯: '上元', 酉: '上元',
  寅: '中元', 申: '中元', 巳: '中元', 亥: '中元',
  辰: '下元', 戌: '下元', 丑: '下元', 未: '下元',
};

const EARTH_STEMS = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

function expectedEarthPlate(juNum, dunType) {
  return Object.fromEntries(EARTH_STEMS.map((stem, offset) => {
    const delta = dunType === 'yang' ? offset : -offset;
    const palace = ((juNum - 1 + delta + 9) % 9) + 1;
    return [palace, stem];
  }));
}

function compactGongs(result) {
  return Object.fromEntries(Object.entries(result.gongs).map(([palace, gong]) => [
    palace,
    {
      earth: gong.diGan,
      sky: gong.tianGan,
      star: gong.star,
      lodgedStar: gong.lodgedStar || '',
      gate: gong.gate,
      deity: gong.shen,
    },
  ]));
}

test('exports deterministic Qimen core helpers for exhaustive validation', () => {
  assert.equal(typeof qimen.getXunInfo, 'function');
  assert.equal(typeof qimen.getSanyuan, 'function');
  assert.equal(typeof qimen.layoutDipan, 'function');
});

test('maps all 60 ganzhi to the correct xun head and hidden instrument', () => {
  const instruments = ['戊', '己', '庚', '辛', '壬', '癸'];

  for (const [index, ganzhi] of JIAZI.entries()) {
    assert.deepEqual(qimen.getXunInfo(ganzhi), {
      index,
      xunIndex: Math.floor(index / 10),
      xunHead: XUN_HEADS[Math.floor(index / 10)],
      hiddenStem: instruments[Math.floor(index / 10)],
      steps: index % 10,
    });
  }
});

test('maps all 60 day ganzhi to upper, middle, or lower yuan by the preceding Jia/Ji futou', () => {
  for (const [index, dayGZ] of JIAZI.entries()) {
    const daysSinceFuTou = index % 5;
    const fuTou = JIAZI[(index - daysSinceFuTou + 60) % 60];
    const expected = YUAN_BY_FUTOU_BRANCH[fuTou[1]];
    assert.deepEqual(qimen.getSanyuan(dayGZ), {
      index: ['上元', '中元', '下元'].indexOf(expected),
      name: expected,
      fuTou,
    });
  }
});

test('lays out all 18 Yin/Yang earth plates in numeric nine-palace order', () => {
  for (const dunType of ['yang', 'yin']) {
    for (let juNum = 1; juNum <= 9; juNum += 1) {
      assert.deepEqual(qimen.layoutDipan(juNum, dunType), expectedEarthPlate(juNum, dunType));
    }
  }
});

test('uses the exact solar-term moment instead of switching at midnight', () => {
  const beforeMangzhong = qimen.paiQimen(2024, 6, 5, 12, 9);
  const afterMangzhong = qimen.paiQimen(2024, 6, 5, 12, 10);
  const beforeSummerSolstice = qimen.paiQimen(2024, 6, 21, 4, 50);
  const afterSummerSolstice = qimen.paiQimen(2024, 6, 21, 4, 51);

  assert.deepEqual(
    [beforeMangzhong.meta.jieqi, beforeMangzhong.meta.dunType, beforeMangzhong.meta.juNum, beforeMangzhong.meta.yuan],
    ['小满', 'yang', 2, '中元'],
  );
  assert.deepEqual(
    [afterMangzhong.meta.jieqi, afterMangzhong.meta.dunType, afterMangzhong.meta.juNum, afterMangzhong.meta.yuan],
    ['芒种', 'yang', 3, '中元'],
  );
  assert.deepEqual(
    [beforeSummerSolstice.meta.jieqi, beforeSummerSolstice.meta.dunType, beforeSummerSolstice.meta.juNum, beforeSummerSolstice.meta.yuan],
    ['芒种', 'yang', 3, '中元'],
  );
  assert.deepEqual(
    [afterSummerSolstice.meta.jieqi, afterSummerSolstice.meta.dunType, afterSummerSolstice.meta.juNum, afterSummerSolstice.meta.yuan],
    ['夏至', 'yin', 3, '中元'],
  );
});

test('matches the declared ChaiBu turntable chart for 2024-06-15 14:30', () => {
  const result = qimen.paiQimen(2024, 6, 15, 14, 30);

  assert.deepEqual(result.meta, {
    dunType: 'yang',
    dunTypeCn: '阳遁',
    juNum: 6,
    jieqi: '芒种',
    jieqiTime: '2024-06-05 12:09:54',
    yuan: '上元',
    fuTou: '己酉',
    xunShou: '甲戌',
    yearGZ: '甲辰',
    monthGZ: '庚午',
    dayGZ: '庚戌',
    hourGZ: '癸未',
    dayStem: '庚',
    hourStem: '癸',
    actualHourStem: '癸',
    method: '拆补法·转盘法',
    school: '时家奇门·拆补转盘·中五寄坤二·天禽随天芮',
    validation: 'validated_declared_school',
    interpretationValidation: 'not_validated',
  });
  assert.equal(result.zhifu, '天柱');
  assert.equal(result.zhishi, '惊门');
  assert.equal(result.zhifuOrigGong, 7);
  assert.equal(result.zhifuGong, 2);
  assert.equal(result.zhishiGong, 7);
  assert.deepEqual(compactGongs(result), {
    1: { earth: '壬', sky: '庚', star: '天任', lodgedStar: '', gate: '休门', deity: '六合' },
    2: { earth: '癸', sky: '己', star: '天柱', lodgedStar: '', gate: '死门', deity: '值符' },
    3: { earth: '丁', sky: '丙', star: '天辅', lodgedStar: '', gate: '伤门', deity: '玄武' },
    4: { earth: '丙', sky: '辛', star: '天英', lodgedStar: '', gate: '杜门', deity: '九地' },
    5: { earth: '乙', sky: '乙', star: '天禽', lodgedStar: '', gate: '', deity: '' },
    6: { earth: '戊', sky: '壬', star: '天蓬', lodgedStar: '', gate: '开门', deity: '太阴' },
    7: { earth: '己', sky: '戊', star: '天心', lodgedStar: '', gate: '惊门', deity: '螣蛇' },
    8: { earth: '庚', sky: '丁', star: '天冲', lodgedStar: '', gate: '生门', deity: '白虎' },
    9: { earth: '辛', sky: '癸', star: '天芮', lodgedStar: '天禽', gate: '景门', deity: '九天' },
  });
});

test('uses each Jia hour xun-head instrument instead of treating every Jia as Jia-Zi-Wu', () => {
  const expected = {
    甲子: '戊',
    甲戌: '己',
    甲申: '庚',
    甲午: '辛',
    甲辰: '壬',
    甲寅: '癸',
  };

  for (const [ganzhi, hiddenStem] of Object.entries(expected)) {
    assert.equal(qimen.getXunInfo(ganzhi).hiddenStem, hiddenStem);
  }
});

test('starts the duty-door count from Kun 2 when the xun-head instrument is in center 5', () => {
  const result = qimen.paiQimen(2024, 1, 4, 8, 30);

  assert.equal(result.meta.hourGZ, '甲辰');
  assert.equal(result.meta.actualHourStem, '壬');
  assert.equal(result.zhifu, '天禽');
  assert.equal(result.zhifuOrigGong, 5);
  assert.equal(result.zhifuGong, 2);
  assert.equal(result.zhishi, '死门');
  assert.equal(result.zhishiGong, 2);
  assert.equal(result.gongs[2].gate, '死门');
});

test('rejects invalid civil dates and time fields instead of normalizing or falling back', () => {
  assert.throws(() => qimen.paiQimen(2023, 2, 29, 12, 0), /不存在|invalid/i);
  assert.throws(() => qimen.paiQimen(2024, 13, 1, 12, 0), /month|月份|1-12/i);
  assert.throws(() => qimen.paiQimen(2024, 6, 15, 24, 0), /hour|小时|0-23/i);
  assert.throws(() => qimen.paiQimen(2024, 6, 15, 12, 60), /minute|分钟|0-59/i);
});

test('keeps unvalidated pattern labels neutral in the AI context', () => {
  const result = qimen.paiQimen(2024, 1, 1, 0, 30);
  const context = qimen.formatForAI(result, '说明盘面结构');

  assert.match(context, /传统格局标签（解释层尚未验证）/);
  assert.doesNotMatch(context, /百事大吉|大凶|官灾/);
  assert.ok(result.geju.every(pattern => pattern.desc === '传统格局标签，解释层尚未验证'));
});
