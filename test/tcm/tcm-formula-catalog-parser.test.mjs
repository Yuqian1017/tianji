import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const formulaCatalog = await import('../../scripts/validation/lib/tcm-formula-catalog.mjs')
  .catch(() => ({}));
const files = (await readdir('database/tcm/skill-v3/references'))
  .filter(fileName => /^(?:2[4-9]|30)-/.test(fileName))
  .sort();
const sources = Object.fromEntries(await Promise.all(files.map(async fileName => [
  `ref${fileName.slice(0, 2)}`,
  await readFile(`database/tcm/skill-v3/references/${fileName}`, 'utf8'),
])));

test('pins all H2 and H3 sections in references 24-30', () => {
  assert.equal(typeof formulaCatalog.parseFormulaCatalogSections, 'function');
  const sections = Object.entries(sources)
    .flatMap(([sourceId, text]) => formulaCatalog.parseFormulaCatalogSections(sourceId, text));
  assert.equal(files.length, 7);
  assert.equal(sections.length, 81);
  assert.equal(sections.filter(item => item.sourceDomain === 'formula_general_principles').length, 11);
  assert.equal(sections.filter(item => item.sourceDomain === 'formula_monographs').length, 70);
  assert.ok(sections.every(item => item.productEligibility === 'blocked'));
});

test('captures all 182 textbook formulas across both source-attribution formats and four added anchors', () => {
  assert.equal(typeof formulaCatalog.parseFormulaDefinitions, 'function');
  assert.equal(typeof formulaCatalog.parseFormulaCountClaim, 'function');
  const definitions = Object.entries(sources)
    .flatMap(([sourceId, text]) => formulaCatalog.parseFormulaDefinitions(sourceId, text));
  const claims = Object.entries(sources).flatMap(([sourceId, text]) => (
    formulaCatalog.parseFormulaCountClaim(sourceId, text) ?? []
  ));

  assert.equal(definitions.length, 186);
  assert.equal(definitions.filter(item => item.definitionType === 'textbook_primary_candidate').length, 182);
  assert.equal(definitions.filter(item => item.definitionType === 'classic_anchor_addition').length, 4);
  assert.deepEqual(definitions.filter(item => item.definitionType === 'classic_anchor_addition')
    .map(item => item.formulaName), ['清中汤', '黄连阿胶汤', '半夏秫米汤', '启膈散']);
  assert.deepEqual(claims.map(item => [item.sourceId, item.claimedPrimary, item.claimedAttached]), [
    ['ref25', 33, 45], ['ref26', 33, 39], ['ref27', 28, 27],
    ['ref28', 33, 28], ['ref29', 37, 30], ['ref30', 18, 13],
  ]);
  assert.deepEqual(definitions.filter(item => item.definitionType === 'textbook_primary_candidate')
    .reduce((counts, item) => ({ ...counts, [item.sourceId]: (counts[item.sourceId] ?? 0) + 1 }), {}), {
    ref25: 33, ref26: 33, ref27: 28, ref28: 33, ref29: 37, ref30: 18,
  });
  assert.deepEqual(definitions.filter(item => item.sourceFormat === 'parenthetical_attribution')
    .map(item => item.formulaName), ['九味羌活汤', '黄连解毒汤', '九仙散', '紫雪']);
  assert.ok(definitions.every(item => item.productEligibility === 'blocked'));
});

test('materializes every explicit attached formula and exposes the two-entity source-count gap', () => {
  assert.equal(typeof formulaCatalog.parseAttachedFormulaEntities, 'function');
  const entities = Object.entries(sources)
    .flatMap(([sourceId, text]) => formulaCatalog.parseAttachedFormulaEntities(sourceId, text));

  assert.equal(entities.length, 180);
  assert.deepEqual(entities.reduce((counts, item) => ({
    ...counts,
    [item.sourceId]: (counts[item.sourceId] ?? 0) + 1,
  }), {}), {
    ref25: 43, ref26: 39, ref27: 27, ref28: 28, ref29: 30, ref30: 13,
  });
  assert.ok(entities.every(item => Number.isInteger(item.sourceLine)));
  assert.ok(entities.every(item => item.formulaName.length > 0));
  assert.equal(new Set(entities.map(item => item.id)).size, entities.length);
  assert.ok(entities.every(item => item.sourceText.includes(item.formulaName)));
  assert.ok(entities.every(item => item.definitionType === 'textbook_attached_candidate'));
  assert.ok(entities.every(item => item.productEligibility === 'blocked'));
  assert.ok(entities.every(item => item.runtimeEligibleFields.length === 0));
  assert.ok(entities.some(item => item.formulaName === '延胡索汤'));
  assert.ok(entities.every(item => !item.formulaName.startsWith('寒证用')));
});

test('priority sweep captures dose, toxic ingredient, emergency, modern use and decision-table risks', () => {
  assert.equal(typeof formulaCatalog.collectFormulaCatalogPriorityLines, 'function');
  const candidates = Object.entries(sources)
    .flatMap(([sourceId, text]) => formulaCatalog.collectFormulaCatalogPriorityLines(sourceId, text));
  const byText = needle => candidates.find(item => item.sourceText.includes(needle));

  assert.ok(byText('剂量为原方折现代用量(g)').doseTerms.includes('原方折现代用量'));
  assert.ok(byText('同性毒力共振').toxicityTerms.includes('同性毒力共振'));
  assert.ok(byText('**★苏合香丸**').toxicityTerms.includes('青木香'));
  assert.ok(byText('昏迷鼻饲').administrationTerms.includes('鼻饲'));
  assert.ok(byText('吐不止解救').poisoningActionTerms.includes('毒物处置'));
  assert.ok(byText('现代高血压常用方').modernUseTerms.includes('现代'));
  assert.ok(byText('| 高血压头痛失眠 |').decisionLookupTerms.includes('场景首选反查'));
  assert.ok(byText('四禁').contraindicationTerms.includes('禁'));
  assert.ok(byText('非火盛者不宜').contraindicationTerms.includes('不宜'));
  assert.ok(byText('忌辛香耗津').contraindicationTerms.includes('忌'));
  assert.ok(byText('纯虚无实者禁').contraindicationTerms.includes('禁'));
  assert.equal(byText('现代方剂学雏形'), undefined);
  assert.equal(byText('中医方剂大辞典'), undefined);
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
  assert.ok(candidates.every(item => item.runtimeEligibleFields.length === 0));
});
