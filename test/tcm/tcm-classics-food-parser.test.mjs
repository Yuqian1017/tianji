import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const parser = await import('../../scripts/validation/lib/tcm-classics-food.mjs')
  .catch(() => ({}));
const files = (await readdir('database/tcm/skill-v3/references'))
  .filter(fileName => /^(?:4[2-8])-/.test(fileName))
  .sort();
const sources = Object.fromEntries(await Promise.all(files.map(async fileName => [
  `ref${fileName.slice(0, 2)}`,
  await readFile(`database/tcm/skill-v3/references/${fileName}`, 'utf8'),
])));

test('pins every H2 and H3 section in references 42-48', () => {
  assert.equal(typeof parser.parseClassicsFoodSections, 'function');
  const sections = Object.entries(sources)
    .flatMap(([sourceId, text]) => parser.parseClassicsFoodSections(sourceId, text));
  assert.equal(files.length, 7);
  assert.equal(sections.length, 145);
  assert.deepEqual(Object.fromEntries(Object.keys(sources).map(sourceId => [
    sourceId, sections.filter(item => item.sourceId === sourceId).length,
  ])), { ref42: 10, ref43: 14, ref44: 14, ref45: 6, ref46: 10, ref47: 41, ref48: 50 });
  assert.ok(sections.every(item => item.productEligibility === 'blocked'));
});

test('priority sweep separates food therapy, dose, contraindication, toxic, emergency and home actions', () => {
  assert.equal(typeof parser.collectClassicsFoodPriorityLines, 'function');
  const candidates = Object.entries(sources)
    .flatMap(([sourceId, text]) => parser.collectClassicsFoodPriorityLines(sourceId, text));
  const byText = needle => candidates.find(item => item.sourceText.includes(needle));

  assert.ok(byText('五谷为养').foodTherapyTerms.length > 0);
  assert.ok(byText('五脏病所宜').diseaseFoodMappingTerms.length > 0);
  assert.ok(byText('一味薯蓣饮').foodTherapyTerms.length > 0);
  assert.ok(byText('生怀山药四两煮汁当茶').doseTerms.length > 0);
  assert.ok(byText('多液滋阴,大便不实者忌').contraindicationTerms.length > 0);
  assert.ok(byText('铅制剂绝对禁服').toxicityTerms.length > 0);
  assert.ok(byText('今胃癌必内镜确诊').modernDiseaseTerms.length > 0);
  assert.ok(byText('霍乱今为法定检疫传染病').emergencyTerms.length > 0);
  assert.ok(byText('睡前嚼服一两').homeActionTerms.length > 0);
  assert.ok(byText('小儿秋夏滑泻').vulnerablePopulationTerms.length > 0);
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
  assert.ok(candidates.every(item => item.runtimeEligibleFields.length === 0));
});

test('food eligibility is not inferred from A-level, food-therapy, or medicine-food labels', () => {
  assert.equal(typeof parser.collectClassicsFoodPriorityLines, 'function');
  const candidates = Object.entries(sources)
    .flatMap(([sourceId, text]) => parser.collectClassicsFoodPriorityLines(sourceId, text));
  const byText = needle => candidates.find(item => item.sourceText.includes(needle));

  assert.ok(byText('A 级食疗性质').sourceGradeTerms.includes('A级'));
  assert.ok(byText('药食两用之品').sourceGradeTerms.includes('药食两用'));
  assert.ok(byText('A 级养生说理直接可用').sourceGradeTerms.includes('A级'));
  assert.ok(candidates.every(item => item.foodEligibility === 'not_adjudicated'));
});
