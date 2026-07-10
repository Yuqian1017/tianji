import assert from 'node:assert/strict';
import test from 'node:test';

import {
  analyzeYear,
  getKeQi,
  getKeYun,
  getLiuQi,
  getWuYun,
  getYearGanZhi,
  getZhuYun,
} from '../../src/modules/wuyun/engine.js';
import { PRIMARY_QI, PRIMARY_YUN, RECENT_YUNQI } from '../../src/modules/wuyun/data.js';

const STEM_ORACLE = {
  甲: { element: '土', tone: '宫', excess: true, main: [true, false, true, false, true], guest: ['土太', '金少', '水太', '木少', '火太'] },
  乙: { element: '金', tone: '商', excess: false, main: [true, false, true, false, true], guest: ['金少', '水太', '木少', '火太', '土少'] },
  丙: { element: '水', tone: '羽', excess: true, main: [true, false, true, false, true], guest: ['水太', '木少', '火太', '土少', '金太'] },
  丁: { element: '木', tone: '角', excess: false, main: [false, true, false, true, false], guest: ['木少', '火太', '土少', '金太', '水少'] },
  戊: { element: '火', tone: '徵', excess: true, main: [false, true, false, true, false], guest: ['火太', '土少', '金太', '水少', '木太'] },
  己: { element: '土', tone: '宫', excess: false, main: [false, true, false, true, false], guest: ['土少', '金太', '水少', '木太', '火少'] },
  庚: { element: '金', tone: '商', excess: true, main: [false, true, false, true, false], guest: ['金太', '水少', '木太', '火少', '土太'] },
  辛: { element: '水', tone: '羽', excess: false, main: [false, true, false, true, false], guest: ['水少', '木太', '火少', '土太', '金少'] },
  壬: { element: '木', tone: '角', excess: true, main: [true, false, true, false, true], guest: ['木太', '火少', '土太', '金少', '水太'] },
  癸: { element: '火', tone: '徵', excess: false, main: [true, false, true, false, true], guest: ['火少', '土太', '金少', '水太', '木少'] },
};

const BRANCH_ORACLE = {
  子: ['少阴君火', '阳明燥金', ['太阳寒水', '厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金']],
  午: ['少阴君火', '阳明燥金', ['太阳寒水', '厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金']],
  丑: ['太阴湿土', '太阳寒水', ['厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水']],
  未: ['太阴湿土', '太阳寒水', ['厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水']],
  寅: ['少阳相火', '厥阴风木', ['少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水', '厥阴风木']],
  申: ['少阳相火', '厥阴风木', ['少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水', '厥阴风木']],
  卯: ['阳明燥金', '少阴君火', ['太阴湿土', '少阳相火', '阳明燥金', '太阳寒水', '厥阴风木', '少阴君火']],
  酉: ['阳明燥金', '少阴君火', ['太阴湿土', '少阳相火', '阳明燥金', '太阳寒水', '厥阴风木', '少阴君火']],
  辰: ['太阳寒水', '太阴湿土', ['少阳相火', '阳明燥金', '太阳寒水', '厥阴风木', '少阴君火', '太阴湿土']],
  戌: ['太阳寒水', '太阴湿土', ['少阳相火', '阳明燥金', '太阳寒水', '厥阴风木', '少阴君火', '太阴湿土']],
  巳: ['厥阴风木', '少阳相火', ['阳明燥金', '太阳寒水', '厥阴风木', '少阴君火', '太阴湿土', '少阳相火']],
  亥: ['厥阴风木', '少阳相火', ['阳明燥金', '太阳寒水', '厥阴风木', '少阴君火', '太阴湿土', '少阳相火']],
};

const PRIMARY_YUN_TIMES = [
  '大寒日→春分后第12日',
  '春分后第13日→芒种后第9日',
  '芒种后第10日→处暑后第6日',
  '处暑后第7日→立冬后第3日',
  '立冬后第4日→小寒末',
];

const PRIMARY_QI_TIMES = [
  '大寒→春分',
  '春分→小满',
  '小满→大暑',
  '大暑→秋分',
  '秋分→小雪',
  '小雪→大寒',
];

test('maps all ten stems to the source-pinned central movement', () => {
  for (const [stem, expected] of Object.entries(STEM_ORACLE)) {
    const actual = getWuYun(stem);
    assert.deepEqual(
      { element: actual.element, tone: actual.tone, excess: actual.excess },
      { element: expected.element, tone: expected.tone, excess: expected.excess },
      stem,
    );
  }
});

test('derives the source-pinned main movement tai-shao pattern for all ten stems', () => {
  for (const [stem, expected] of Object.entries(STEM_ORACLE)) {
    const actual = getZhuYun(stem);
    assert.deepEqual(actual.map(item => item.excess), expected.main, stem);
    assert.deepEqual(actual.map(item => item.element), ['木', '火', '土', '金', '水'], stem);
  }
});

test('derives all ten guest movement sequences with alternating tai-shao', () => {
  for (const [stem, expected] of Object.entries(STEM_ORACLE)) {
    const actual = getKeYun(stem);
    assert.deepEqual(actual.map(item => `${item.element}${item.excess ? '太' : '少'}`), expected.guest, stem);
  }
});

test('matches all twelve sitian, zaiquan, and guest-qi rows', () => {
  for (const [branch, [sitian, zaiquan, guest]] of Object.entries(BRANCH_ORACLE)) {
    const annual = getLiuQi(branch);
    assert.equal(annual.sitian, sitian, branch);
    assert.equal(annual.zaiquan, zaiquan, branch);
    assert.deepEqual(getKeQi(branch).map(item => item.qi), guest, branch);
  }
});

test('uses the source-pinned five-movement and six-qi date labels', () => {
  assert.deepEqual(PRIMARY_YUN.map(item => item.time), PRIMARY_YUN_TIMES);
  assert.deepEqual(PRIMARY_QI.map(item => item.time), PRIMARY_QI_TIMES);
});

test('covers a complete sixty-year cycle without duplicate annual pillars', () => {
  const cycle = Array.from({ length: 60 }, (_, index) => getYearGanZhi(1984 + index).ganzi);
  assert.equal(cycle[0], '甲子');
  assert.equal(new Set(cycle).size, 60);
  for (let index = 0; index < 60; index += 1) {
    assert.equal(getYearGanZhi(2044 + index).ganzi, cycle[index]);
  }
});

test('rejects invalid years, stems, and branches instead of returning partial data', () => {
  for (const year of [0, 10000, 2026.5, NaN, '2026']) {
    assert.throws(() => getYearGanZhi(year), /year/i);
    assert.throws(() => analyzeYear(year), /year/i);
  }
  assert.throws(() => getWuYun('A'), /stem/i);
  assert.throws(() => getZhuYun('A'), /stem/i);
  assert.throws(() => getKeYun('A'), /stem/i);
  assert.throws(() => getLiuQi('A'), /branch/i);
  assert.throws(() => getKeQi('A'), /branch/i);
});

test('keeps recent lookup rows derived from the same annual structure', () => {
  for (const row of RECENT_YUNQI) {
    const result = analyzeYear(row.year);
    assert.deepEqual(
      { ganzi: row.ganzi, wuyun: row.wuyun, sitian: row.sitian, zaiquan: row.zaiquan },
      { ganzi: result.ganZhi.ganzi, wuyun: result.wuYun.label, sitian: result.liuQi.sitian, zaiquan: result.liuQi.zaiquan },
    );
  }
});

test('labels only the implemented annual structure as source-pinned', () => {
  const result = analyzeYear(2026);
  assert.equal(result.validation.deterministicCore, 'source_pinned_basic_annual_structure');
  assert.equal(result.validation.interpretation, 'not_validated');
  assert.equal(result.validation.unimplemented.includes('古法交司时刻'), true);
  assert.equal(result.yunTimeline.every(item => typeof item.primaryExcess === 'boolean'), true);
});
