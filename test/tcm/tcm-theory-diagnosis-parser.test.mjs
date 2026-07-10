import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import * as theoryDiagnosis from '../../scripts/validation/lib/tcm-theory-diagnosis.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from '../../scripts/validation/lib/tcm-acupoint-external-safety.mjs';

const SOURCE_PATHS = Object.fromEntries(Array.from({ length: 14 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  const names = [
    '总论与哲学基础', '脏象', '脏腑关系', '精气血津液', '病因', '病机', '治则',
    '经络与体质', '望诊闻诊', '问诊切诊', '八纲辨证', '病因与气血津液辨证',
    '脏腑辨证', '六经卫气营血三焦经络辨证',
  ];
  return [`ref${number}`, `database/tcm/skill-v3/references/${number}-${names[index]}.md`];
}));
const sourceTexts = Object.fromEntries(await Promise.all(Object.entries(SOURCE_PATHS)
  .map(async ([sourceId, filePath]) => [sourceId, await readFile(filePath, 'utf8')])));

test('pins every theory and diagnosis source line and Markdown table row', () => {
  const inventories = Object.entries(sourceTexts).map(([sourceId, text]) => ({
    lines: parseSourceLineInventory(sourceId, text),
    tables: parseMarkdownTableInventory(sourceId, text),
  }));

  assert.equal(inventories.reduce((count, item) => count + item.lines.length, 0), 836);
  assert.equal(inventories.reduce((count, item) => count + item.tables.length, 0), 31);
  assert.equal(inventories.reduce((count, item) => count
    + item.tables.reduce((rows, table) => rows + table.dataRows.length, 0), 0), 157);
  assert.ok(inventories.flatMap(item => item.lines)
    .every(line => line.productEligibility === 'blocked'));
});

test('parses all second- and third-level sections with a theory or diagnosis domain', () => {
  assert.equal(typeof theoryDiagnosis.parseTheoryDiagnosisSections, 'function');
  const sections = Object.entries(sourceTexts)
    .flatMap(([sourceId, text]) => theoryDiagnosis.parseTheoryDiagnosisSections(sourceId, text));

  assert.equal(sections.length, 124);
  assert.equal(sections.filter(section => section.sourceDomain === 'traditional_theory').length, 67);
  assert.equal(sections.filter(section => section.sourceDomain === 'traditional_diagnosis').length, 57);
  assert.ok(sections.every(section => section.productEligibility === 'blocked'));
});

test('priority sweep captures modern-looking diagnosis, prevention and dosing extrapolations', () => {
  assert.equal(typeof theoryDiagnosis.collectTheoryDiagnosisPriorityLines, 'function');
  const candidates = Object.entries(sourceTexts)
    .flatMap(([sourceId, text]) => theoryDiagnosis.collectTheoryDiagnosisPriorityLines(sourceId, text));
  const joined = candidates.map(item => item.sourceText).join('\n');

  assert.match(joined, /舌为内脏缩影/);
  assert.match(joined, /西北高寒,病多寒宜辛温、药量可稍重/);
  assert.match(joined, /板蓝根大青叶防流感之类/);
  assert.match(joined, /体质强弱决定正气虚实、是否发病及发病类型/);
  assert.match(joined, /皆\*\*胜毒\*\*/);
  assert.match(joined, /舌尖候心肺、舌中候脾胃、舌根候肾、舌边候肝胆/);
  assert.match(joined, /透关射甲.*病情危重/);
  assert.match(joined, /左寸心、左关肝胆、左尺肾/);
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
  assert.ok(candidates.every(item => item.runtimeEligibleFields.length === 0));
});
