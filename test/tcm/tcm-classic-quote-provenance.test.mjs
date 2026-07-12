import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const corePath = new URL(
  '../../database/tcm/normalized/tcm-classic-quote-provenance.json',
  import.meta.url,
);

async function readCore() {
  return JSON.parse(await readFile(corePath, 'utf8'));
}

test('inventories every explicit quote in the Suwen summary', async () => {
  const core = await readCore();

  assert.equal(core.doctrine, 'classical_source_first');
  assert.equal(core.scope, 'reference_42_suwen_explicit_quotes');
  assert.equal(core.schemaVersion, 2);
  assert.deepEqual(core.counts, {
    quotes: 111,
    exactText: 12,
    normalizedContiguous: 64,
    segmentedEllipsis: 7,
    unresolved: 28,
    manualAdjudicated: 28,
    pendingManual: 0,
    referenceCorrected: 1,
  });
  assert.equal(core.records.length, 111);
  assert.equal(new Set(core.records.map(item => item.id)).size, 111);
});

test('keeps every quote blocked and manually classifies every mechanical unresolved item', async () => {
  const core = await readCore();

  for (const record of core.records) {
    assert.ok(record.quoteText.length >= 4);
    assert.ok(record.referenceLine > 0);
    assert.equal(record.productEligibility, 'blocked');
    assert.deepEqual(record.runtimeEligibleFields, []);

    if (record.matchType === 'unresolved') {
      assert.deepEqual(record.sourceLines, []);
      assert.equal(record.reviewStatus, 'manual_form_adjudication_complete_not_content_acceptance');
      assert.ok(record.manualAdjudication, record.id);
      assert.ok(record.manualAdjudication.category, record.id);
      assert.ok(record.manualAdjudication.verdict, record.id);
    } else {
      assert.ok(record.sourceLines.length > 0, record.id);
      assert.equal(
        record.reviewStatus,
        record.referenceCorrection
          ? 'reference_correction_applied_text_match_only_not_content_acceptance'
          : 'text_match_only_not_content_adjudication',
      );
      assert.equal(record.manualAdjudication, null);
    }
  }
});

test('separates source-body excerpts from editorial prose and later commentary', async () => {
  const core = await readCore();
  const byId = new Map(core.records.map(record => [record.id, record]));

  assert.equal(byId.get('tcm.classic.ref42.quote.L0004Q1').manualAdjudication.verdict, 'not_a_classical_quote');
  assert.equal(byId.get('tcm.classic.ref42.quote.L0025Q2').referenceCorrection.originalText, '逆春气则伤肝,夏为寒变');
  assert.equal(byId.get('tcm.classic.ref42.quote.L0025Q2').quoteText, '逆春气则伤肝,夏为寒变');
  assert.equal(byId.get('tcm.classic.ref42.quote.L0025Q2').effectiveQuoteText, '逆之则伤肝,夏为寒变');
  assert.equal(byId.get('tcm.classic.ref42.quote.L0025Q2').matchType, 'normalized_contiguous');
  assert.equal(byId.get('tcm.classic.ref42.quote.L0091Q2').manualAdjudication.verdict, 'not_suwen_body_text');
  assert.deepEqual(byId.get('tcm.classic.ref42.quote.L0069Q1').manualAdjudication.sourceLines, [324, 325, 326]);
  assert.equal(byId.get('tcm.classic.ref42.quote.L0105Q1').manualAdjudication.category, 'ocr_variant_in_apocryphal_appendix');
});
