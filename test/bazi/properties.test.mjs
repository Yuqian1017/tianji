import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDayPillar,
  getHourPillar,
  getMonthPillar,
} from '../../src/modules/bazi/engine.js';

const stems = '甲乙丙丁戊己庚辛壬癸';
const branches = '子丑寅卯辰巳午未申酉戌亥';
const cycle = Array.from({ length: 60 }, (_, index) => (
  stems[index % 10] + branches[index % 12]
));

function pillarString(pillar) {
  return pillar.stem + pillar.branch;
}

test('day pillar advances through the 60-cycle for every supported date', () => {
  let previousIndex = null;
  let checkedDays = 0;
  const end = Date.UTC(2027, 11, 31);

  for (let timestamp = Date.UTC(1920, 0, 1); timestamp <= end; timestamp += 86400000) {
    const date = new Date(timestamp);
    const pillar = pillarString(getDayPillar(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      12,
    ));
    const index = cycle.indexOf(pillar);
    assert.notEqual(index, -1, `${date.toISOString().slice(0, 10)} returned ${pillar}`);
    if (previousIndex !== null) {
      assert.equal(
        index,
        (previousIndex + 1) % 60,
        `day cycle broke at ${date.toISOString().slice(0, 10)}`,
      );
    }
    previousIndex = index;
    checkedDays += 1;
  }

  assert.equal(checkedDays, 39447);
});

test('five-tiger month stems follow the declared table', () => {
  const starts = {
    甲: '丙寅', 己: '丙寅',
    乙: '戊寅', 庚: '戊寅',
    丙: '庚寅', 辛: '庚寅',
    丁: '壬寅', 壬: '壬寅',
    戊: '甲寅', 癸: '甲寅',
  };

  for (const [yearStem, expected] of Object.entries(starts)) {
    assert.equal(pillarString(getMonthPillar(yearStem, 0)), expected);
  }
});

test('five-mouse Zi-hour stems follow the declared table', () => {
  const starts = {
    甲: '甲子', 己: '甲子',
    乙: '丙子', 庚: '丙子',
    丙: '戊子', 辛: '戊子',
    丁: '庚子', 壬: '庚子',
    戊: '壬子', 癸: '壬子',
  };

  for (const [dayStem, expected] of Object.entries(starts)) {
    assert.equal(pillarString(getHourPillar(dayStem, 23)), expected);
  }
});
