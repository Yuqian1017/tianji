import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const herbCatalog = await import('../../scripts/validation/lib/tcm-herb-catalog.mjs')
  .catch(() => ({}));

const referenceFiles = (await readdir('database/tcm/skill-v3/references'))
  .filter(fileName => /^(?:1[5-9]|2[0-3])-/.test(fileName))
  .sort();
const sourceTexts = Object.fromEntries(await Promise.all(referenceFiles.map(async fileName => {
  const sourceId = `ref${fileName.slice(0, 2)}`;
  return [sourceId, await readFile(`database/tcm/skill-v3/references/${fileName}`, 'utf8')];
})));

test('pins the complete 15-23 heading inventory as blocked candidates', () => {
  assert.equal(typeof herbCatalog.parseHerbCatalogSections, 'function');
  const sections = Object.entries(sourceTexts)
    .flatMap(([sourceId, text]) => herbCatalog.parseHerbCatalogSections(sourceId, text));

  assert.equal(referenceFiles.length, 9);
  assert.equal(sections.length, 122);
  assert.equal(sections.filter(item => item.sourceDomain === 'herb_general_principles').length, 11);
  assert.equal(sections.filter(item => item.sourceDomain === 'herb_monographs').length, 99);
  assert.equal(sections.filter(item => item.sourceDomain === 'disease_to_herb_reverse_index').length, 12);
  assert.ok(sections.every(item => item.productEligibility === 'blocked'));
  assert.ok(sections.every(item => item.runtimeEligibleFields.length === 0));
});

test('preserves the 100 present reverse-index entries and exposes the claimed 103-entry gap', () => {
  assert.equal(typeof herbCatalog.parseDiseaseHerbIndexEntries, 'function');
  const entries = herbCatalog.parseDiseaseHerbIndexEntries(sourceTexts.ref23);

  assert.equal(entries.length, 100);
  assert.deepEqual(
    Array.from({ length: 103 }, (_, index) => index + 1)
      .filter(number => !entries.some(item => item.sourceNumber === number)),
    [52, 53, 54],
  );
  assert.equal(entries[0].sourceNumber, 1);
  assert.equal(entries[0].diseaseName, '感冒');
  assert.equal(entries.at(-1).sourceNumber, 103);
  assert.equal(entries.at(-1).diseaseName, '耳鸣耳聋');
  assert.ok(entries.every(item => item.evidenceState === 'unvalidated_reverse_lookup_not_prescribing_authority'));
  assert.ok(entries.every(item => item.productEligibility === 'blocked'));
  assert.ok(entries.every(item => item.runtimeEligibleFields.length === 0));
});

test('reports both reverse-index source-order inversions instead of hiding them by sorting', () => {
  assert.equal(typeof herbCatalog.analyzeDiseaseHerbIndexNumbering, 'function');
  const numbering = herbCatalog.analyzeDiseaseHerbIndexNumbering(sourceTexts.ref23, 103);

  assert.deepEqual(numbering.missing, [52, 53, 54]);
  assert.deepEqual(numbering.duplicates, []);
  assert.deepEqual(numbering.inversions, [
    { previous: 47, current: 36, sourceLine: 61 },
    { previous: 60, current: 55, sourceLine: 83 },
  ]);
});

test('priority sweep separates dose, toxicity, home action, vulnerable population and modern efficacy claims', () => {
  assert.equal(typeof herbCatalog.collectHerbCatalogPriorityLines, 'function');
  const candidates = Object.entries(sourceTexts)
    .flatMap(([sourceId, text]) => herbCatalog.collectHerbCatalogPriorityLines(sourceId, text));
  const byText = needle => candidates.find(item => item.sourceText.includes(needle));

  assert.ok(byText('5岁以下用成人1/4').vulnerablePopulationTerms.includes('5岁以下'));
  assert.ok(byText('生姜杀半夏毒、绿豆杀巴豆毒、防风杀砒霜毒').homeActionTerms.includes('解毒替代'));
  assert.ok(byText('附子、乌头等毒药先煎45~60分钟').doseTerms.includes('45~60分钟'));
  assert.ok(byText('青木香').toxicityTerms.includes('马兜铃酸'));
  assert.ok(byText('药后不吐可饮热开水助之或翎毛探喉').homeActionTerms.includes('促吐'));
  assert.ok(byText('砒石').heavyMetalTerms.includes('砷'));
  assert.ok(byText('现代:扩血管降压').modernEfficacyTerms.includes('现代'));
  assert.ok(byText('小儿每岁1~1.5粒').vulnerablePopulationTerms.includes('小儿'));
  assert.ok(byText('79. **脓成不溃**').reverseIndexTerms.includes('病证用药反查'));
  assert.ok(byText('鼻腔给药单用有效').externalAdministrationTerms.includes('鼻腔给药'));
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
  assert.ok(candidates.every(item => item.runtimeEligibleFields.length === 0));
});

test('does not misclassify generic detoxification or active-ingredient prose as home action or modern efficacy', () => {
  const detox = herbCatalog.collectHerbCatalogPriorityLines('ref17', '清热解毒,凉血止血');
  const ingredient = herbCatalog.collectHerbCatalogPriorityLines('ref20', '有效成分易挥发,不入煎剂');

  assert.deepEqual(detox, []);
  assert.deepEqual(ingredient, []);
});
