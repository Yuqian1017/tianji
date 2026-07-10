import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import * as diseaseRedFlags from '../../scripts/validation/lib/tcm-disease-red-flags.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from '../../scripts/validation/lib/tcm-acupoint-external-safety.mjs';

const SOURCE_PATHS = {
  ref31: 'database/tcm/skill-v3/references/31-内科-肺系病证.md',
  ref32: 'database/tcm/skill-v3/references/32-内科-心系病证.md',
  ref33: 'database/tcm/skill-v3/references/33-内科-脾胃系病证.md',
  ref34: 'database/tcm/skill-v3/references/34-内科-肝胆病证.md',
  ref35: 'database/tcm/skill-v3/references/35-内科-肾系病证.md',
  ref36: 'database/tcm/skill-v3/references/36-内科-气血津液病证.md',
  ref37: 'database/tcm/skill-v3/references/37-内科-肢体经络病证.md',
};
const sourceTexts = Object.fromEntries(await Promise.all(Object.entries(SOURCE_PATHS)
  .map(async ([sourceId, filePath]) => [sourceId, await readFile(filePath, 'utf8')])));
const {
  collectDiseaseRiskLines,
  parseDiseaseReference,
} = diseaseRedFlags;

test('parses all 52 disease sections without treating treatment text as product eligible', () => {
  const references = Object.entries(sourceTexts).map(([sourceId, text]) => parseDiseaseReference(sourceId, text));
  assert.deepEqual(references.map(reference => reference.sections.length), [8, 7, 9, 9, 5, 9, 5]);
  assert.equal(references.flatMap(reference => reference.sections).length, 52);
  assert.deepEqual(references[0].sections.map(section => section.name), ['感冒', '咳嗽', '哮病', '喘证', '肺痈', '肺痨', '肺胀', '肺痿']);
  assert.deepEqual(references.at(-1).sections.map(section => section.name), ['痹证', '痉证', '痿证', '颤证', '腰痛']);
  assert.ok(references.flatMap(reference => reference.sections).every(section => section.productEligibility === 'blocked'));
});

test('pins every non-empty line and Markdown table row in references 31-37', () => {
  const inventories = Object.entries(sourceTexts).map(([sourceId, text]) => ({
    lines: parseSourceLineInventory(sourceId, text),
    tables: parseMarkdownTableInventory(sourceId, text),
  }));
  assert.equal(inventories.reduce((count, item) => count + item.lines.length, 0), 689);
  assert.equal(inventories.reduce((count, item) => count + item.tables.length, 0), 22);
  assert.equal(inventories.reduce((count, item) => count + item.tables.reduce((rows, table) => rows + table.dataRows.length, 0), 0), 133);
  assert.ok(inventories.flatMap(item => item.lines).every(line => line.productEligibility === 'blocked'));
});

test('captures concrete emergency and home-treatment conflict candidates', () => {
  const risks = Object.entries(sourceTexts).flatMap(([sourceId, text]) => collectDiseaseRiskLines(sourceId, text));
  const joined = risks.map(item => item.sourceText).join('\n');
  assert.match(joined, /食物中毒→催吐\/洗胃并就医/);
  assert.match(joined, /取嚏法.*探吐法/);
  assert.match(joined, /绿豆甘草汤频饮/);
  assert.match(joined, /即刻含化苏合香丸\/麝香保心丸类并叫急救/);
  assert.match(joined, /灌服温糖水/);
  assert.match(joined, /三年内有中风之患/);
  assert.ok(risks.every(item => item.productEligibility === 'blocked'));
  assert.ok(risks.every(item => item.runtimeEligibleFields.length === 0));
});

test('broad actionable sweep captures doses, bedside actions, acute-abdomen formulas and escalation text', () => {
  assert.equal(typeof diseaseRedFlags.collectDiseaseActionableLines, 'function');
  const candidates = Object.entries(sourceTexts)
    .flatMap(([sourceId, text]) => diseaseRedFlags.collectDiseaseActionableLines(sourceId, text));
  const joined = candidates.map(item => item.sourceText).join('\n');

  assert.match(joined, /大黄为上消化道出血首选,粉剂3~5g日4次/);
  assert.match(joined, /保持呼吸道通畅、清除假牙异物防窒息/);
  assert.match(joined, /胆囊炎样痛用大柴胡汤、阑尾炎样痛大黄牡丹皮汤/);
  assert.match(joined, /心胸疼痛、喘促、肢冷汗出或晕厥——立即就医/);
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
  assert.ok(candidates.every(item => item.runtimeEligibleFields.length === 0));
});
