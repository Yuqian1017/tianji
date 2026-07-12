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
  assert.deepEqual(core.counts, {
    quotes: 111,
    exactText: 12,
    normalizedContiguous: 63,
    segmentedEllipsis: 7,
    unresolved: 29,
  });
  assert.equal(core.records.length, 111);
  assert.equal(new Set(core.records.map(item => item.id)).size, 111);
});

test('keeps unresolved quotes blocked and gives every located quote a source line', async () => {
  const core = await readCore();

  for (const record of core.records) {
    assert.ok(record.quoteText.length >= 4);
    assert.ok(record.referenceLine > 0);
    assert.equal(record.productEligibility, 'blocked');
    assert.deepEqual(record.runtimeEligibleFields, []);

    if (record.matchType === 'unresolved') {
      assert.deepEqual(record.sourceLines, []);
      assert.equal(record.reviewStatus, 'manual_adjudication_required');
    } else {
      assert.ok(record.sourceLines.length > 0, record.id);
      assert.equal(record.reviewStatus, 'text_match_only_not_content_adjudication');
    }
  }
});
