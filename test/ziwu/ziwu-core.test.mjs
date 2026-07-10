import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { SHICHEN_HEALTH } from '../../src/modules/bazihealth/data.js';
import { ZIWU_LIUZHU, ZIWU_MODEL } from '../../src/modules/ziwu/data.js';
import { formatForAI, getCurrentShichen, getNextShichen } from '../../src/modules/ziwu/engine.js';

const SOURCE_ORACLE = [
  { shichen: '子', hours: '23:00-01:00', hourStart: 23, organ: '胆', meridian: '足少阳胆经', wuxing: 'wood' },
  { shichen: '丑', hours: '01:00-03:00', hourStart: 1, organ: '肝', meridian: '足厥阴肝经', wuxing: 'wood' },
  { shichen: '寅', hours: '03:00-05:00', hourStart: 3, organ: '肺', meridian: '手太阴肺经', wuxing: 'metal' },
  { shichen: '卯', hours: '05:00-07:00', hourStart: 5, organ: '大肠', meridian: '手阳明大肠经', wuxing: 'metal' },
  { shichen: '辰', hours: '07:00-09:00', hourStart: 7, organ: '胃', meridian: '足阳明胃经', wuxing: 'earth' },
  { shichen: '巳', hours: '09:00-11:00', hourStart: 9, organ: '脾', meridian: '足太阴脾经', wuxing: 'earth' },
  { shichen: '午', hours: '11:00-13:00', hourStart: 11, organ: '心', meridian: '手少阴心经', wuxing: 'fire' },
  { shichen: '未', hours: '13:00-15:00', hourStart: 13, organ: '小肠', meridian: '手太阳小肠经', wuxing: 'fire' },
  { shichen: '申', hours: '15:00-17:00', hourStart: 15, organ: '膀胱', meridian: '足太阳膀胱经', wuxing: 'water' },
  { shichen: '酉', hours: '17:00-19:00', hourStart: 17, organ: '肾', meridian: '足少阴肾经', wuxing: 'water' },
  { shichen: '戌', hours: '19:00-21:00', hourStart: 19, organ: '心包', meridian: '手厥阴心包经', wuxing: 'fire' },
  { shichen: '亥', hours: '21:00-23:00', hourStart: 21, organ: '三焦', meridian: '手少阳三焦经', wuxing: 'fire' },
];

test('matches the source-pinned twelve-period meridian correspondence exactly', () => {
  assert.deepEqual(ZIWU_LIUZHU, SOURCE_ORACLE);
});

test('maps every local civil minute of a day to the expected two-hour period', () => {
  for (let minuteOfDay = 0; minuteOfDay < 24 * 60; minuteOfDay += 1) {
    const hour = Math.floor(minuteOfDay / 60);
    const minute = minuteOfDay % 60;
    const expectedIndex = Math.floor(((hour + 1) % 24) / 2);
    const actual = getCurrentShichen(new Date(2026, 0, 15, hour, minute));
    assert.equal(actual.index, expectedIndex, `${hour}:${String(minute).padStart(2, '0')}`);
    assert.equal(actual.entry, ZIWU_LIUZHU[expectedIndex]);
  }
});

test('reports monotonic minute-resolution progress from 0 to 99 within each period', () => {
  for (const entry of SOURCE_ORACLE) {
    let previous = -1;
    for (let offset = 0; offset < 120; offset += 1) {
      const totalMinutes = (entry.hourStart * 60 + offset) % (24 * 60);
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      const actual = getCurrentShichen(new Date(2026, 0, 15, hour, minute));
      assert.equal(actual.progress >= previous, true, `${entry.shichen} offset ${offset}`);
      previous = actual.progress;
    }
    const start = getCurrentShichen(new Date(2026, 0, 15, entry.hourStart, 0));
    const endMinutes = (entry.hourStart * 60 + 119) % (24 * 60);
    const end = getCurrentShichen(new Date(2026, 0, 15, Math.floor(endMinutes / 60), endMinutes % 60));
    assert.equal(start.progress, 0, entry.shichen);
    assert.equal(end.progress, 99, entry.shichen);
  }
});

test('cycles through all twelve periods in source order', () => {
  for (let index = 0; index < SOURCE_ORACLE.length; index += 1) {
    assert.deepEqual(getNextShichen(index), SOURCE_ORACLE[(index + 1) % SOURCE_ORACLE.length]);
  }
});

test('rejects invalid dates and indexes', () => {
  for (const value of [new Date('invalid'), 'not-a-date', NaN]) {
    assert.throws(() => getCurrentShichen(value), /date/i);
  }
  for (const value of [-1, 12, 1.5, '1', NaN]) {
    assert.throws(() => getNextShichen(value), /currentIndex/i);
  }
});

test('declares only the source-pinned basic correspondence as implemented', () => {
  assert.equal(ZIWU_MODEL.model, 'twelve_period_meridian_correspondence');
  assert.equal(ZIWU_MODEL.structureStatus, 'source_pinned_basic_meridian_clock');
  assert.equal(ZIWU_MODEL.timeBasis, 'local_civil_clock_minute_precision');
  assert.equal(ZIWU_MODEL.clinicalInterpretation, 'blocked_not_validated');
  assert.deepEqual(ZIWU_MODEL.unimplemented, ['纳甲法', '纳子法', '井荥输经合开穴', '灵龟八法', '针刺补泻']);
});

test('keeps runtime and adjacent lookup text free of medical timing claims', async () => {
  const aiText = formatForAI(new Date(2026, 0, 15, 23, 0));
  const uiText = await readFile(new URL('../../src/modules/ziwu/ZiwuModule.jsx', import.meta.url), 'utf8');
  const adjacentText = Object.values(SHICHEN_HEALTH).join('\n');
  const forbidden = /经当令|排毒|最佳|伤胆|伤阳|提示.{0,4}问题/;

  assert.doesNotMatch(aiText, forbidden);
  assert.doesNotMatch(uiText, forbidden);
  assert.doesNotMatch(adjacentText, forbidden);
});
