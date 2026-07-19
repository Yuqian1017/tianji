import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CORE_PATH = 'database/tcm/normalized/tcm-classic-ref46-quote-provenance.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classic-ref46-quote-provenance-audit-2026-07-18.json';

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

const core = JSON.parse(await readFile(CORE_PATH, 'utf8'));
const sourceTexts = new Map();
const sourceLines = new Map();
for (const [sourceId, sourceRef] of Object.entries(core.sourceRefs)) {
  const text = await readFile(sourceRef.path, 'utf8');
  sourceTexts.set(sourceId, text);
  sourceLines.set(sourceId, text.split('\n'));
}
const publicWitnessCore = JSON.parse(sourceTexts.get('ref46-public-transcription-witnesses'));
const publicWitnessIds = new Set(publicWitnessCore.witnesses.map(witness => witness.id));
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('scope', core.scope === 'reference_46_yixuexinwu_explicit_quotes', core.scope);
check('schema-version', core.schemaVersion === 1, core.schemaVersion);
check(
  'status',
  core.status === 'text_match_and_reviewed_form_adjudication_not_content_acceptance',
  core.status,
);
check('record-count', core.records.length === core.counts.quotes, core.records.length);
check('expected-quote-count', core.counts.quotes === 357, core.counts.quotes);
check('expected-located-count', core.counts.located === 240, core.counts.located);
check('expected-exact-count', core.counts.exactText === 82, core.counts.exactText);
check('expected-normalized-count', core.counts.normalizedContiguous === 150, core.counts.normalizedContiguous);
check('expected-segmented-count', core.counts.segmentedEllipsis === 8, core.counts.segmentedEllipsis);
check('expected-unresolved-count', core.counts.unresolved === 117, core.counts.unresolved);
check('expected-manual-count', core.counts.manualAdjudicated === 117, core.counts.manualAdjudicated);
check(
  'expected-reviewed-approximate-count',
  core.counts.reviewedApproximateLocator === 95,
  core.counts.reviewedApproximateLocator,
);
check('expected-special-count', core.counts.specialAdjudicated === 22, core.counts.specialAdjudicated);
check('pending-manual-zero', core.counts.pendingManual === 0, core.counts.pendingManual);
check('expected-multi-source-count', core.counts.multiSource === 11, core.counts.multiSource);
check('cross-source-unselected-zero', core.counts.crossSourceUnselectedMatches === 0, core.counts.crossSourceUnselectedMatches);
check('source-mismatch-zero', core.counts.sourceMismatch === 0, core.counts.sourceMismatch);
check('expected-external-allusion-count', core.counts.externalClassicalAllusion === 1, core.counts.externalClassicalAllusion);
check('expected-public-witness-records', core.counts.publicWitnessSupported === 5, core.counts.publicWitnessSupported);
check('expected-reference-corrections', core.counts.referenceCorrected === 2, core.counts.referenceCorrected);
check('secondary-locator-zero', core.counts.secondaryLocatorLinked === 0, core.counts.secondaryLocatorLinked);
check(
  'reviewed-locator-fingerprint',
  core.reviewedLocatorFingerprint === '4e13d5f70221e207fb4fe84d5a1a37d9bcb62e9d5e20f2ee755b6927d7b500b7',
  core.reviewedLocatorFingerprint,
);

for (const [sourceId, sourceRef] of Object.entries(core.sourceRefs)) {
  check(`source-hash:${sourceId}`, sha256(sourceTexts.get(sourceId)) === sourceRef.sha256, sourceRef.path);
}

const ids = new Set();
for (const record of core.records) {
  check(`unique:${record.id}`, !ids.has(record.id), record.id);
  ids.add(record.id);
  check(`reference-line:${record.id}`, record.referenceLine > 0, record.referenceLine);
  check(`quote-text:${record.id}`, record.quoteText.length >= 4, record.quoteText.length);
  check(
    `blocked:${record.id}`,
    record.productEligibility === 'blocked' && record.runtimeEligibleFields.length === 0,
    record.productEligibility,
  );
  check(`multi-source:${record.id}`, record.multiSource === (record.sourceMatches.length > 1), record.multiSource);
  check(`source-mismatch:${record.id}`, record.sourceMismatch === false, record.sourceMismatch);
  check(
    `external-allusion:${record.id}`,
    record.externalClassicalAllusion === (record.expectedSourceIds[0] !== 'yixuexinwu-local-text'),
    record.externalClassicalAllusion,
  );

  for (const sourceMatch of record.sourceMatches) {
    check(`known-match-source:${record.id}:${sourceMatch.sourceId}`, sourceLines.has(sourceMatch.sourceId), sourceMatch.sourceId);
    check(
      `match-type:${record.id}:${sourceMatch.sourceId}`,
      ['exact_text', 'normalized_contiguous', 'segmented_ellipsis'].includes(sourceMatch.matchType),
      sourceMatch.matchType,
    );
    check(
      `match-snippet-count:${record.id}:${sourceMatch.sourceId}`,
      sourceMatch.sourceLines.length === sourceMatch.sourceSnippets.length,
      sourceMatch.sourceLines.length,
    );
    for (const lineNumber of sourceMatch.sourceLines) {
      check(
        `match-line:${record.id}:${sourceMatch.sourceId}:${lineNumber}`,
        Number.isInteger(lineNumber) && lineNumber > 0 && lineNumber <= sourceLines.get(sourceMatch.sourceId).length,
        lineNumber,
      );
    }
  }

  if (record.matchType === 'unresolved') {
    check(
      `unresolved-contract:${record.id}`,
      record.selectedSourceMatch === null
        && record.reviewStatus === 'manual_form_adjudication_complete_not_content_acceptance'
        && Boolean(record.manualAdjudication),
      record.reviewStatus,
    );
  } else {
    const expectedStatus = record.externalClassicalAllusion
      ? 'external_classical_allusion_text_match_only_not_content_acceptance'
      : 'text_match_only_not_content_adjudication';
    check(
      `located-contract:${record.id}`,
      Boolean(record.selectedSourceMatch)
        && record.expectedSourceIds.includes(record.selectedSourceMatch.sourceId)
        && record.matchType === record.selectedSourceMatch.matchType
        && record.reviewStatus === expectedStatus
        && record.manualAdjudication === null,
      record.reviewStatus,
    );
  }

  if (record.locatorEvidence) {
    check(
      `locator-type:${record.id}`,
      record.locatorEvidence.matchType === 'reviewed_bigram_recall_locator',
      record.locatorEvidence.matchType,
    );
    check(
      `locator-source:${record.id}`,
      record.locatorEvidence.sourceId === 'yixuexinwu-local-text',
      record.locatorEvidence.sourceId,
    );
    check(
      `locator-score:${record.id}`,
      record.locatorEvidence.bigramRecall >= 0 && record.locatorEvidence.bigramRecall <= 1,
      record.locatorEvidence.bigramRecall,
    );
  }

  if (record.manualAdjudication) {
    const adjudication = record.manualAdjudication;
    check(`adjudication-category:${record.id}`, Boolean(adjudication.category), adjudication.category);
    check(`adjudication-verdict:${record.id}`, Boolean(adjudication.verdict), adjudication.verdict);
    check(`adjudication-note:${record.id}`, Boolean(adjudication.note), adjudication.note);

    for (const [kind, locations] of [
      ['source', adjudication.sourceLocations],
      ['related', adjudication.relatedSourceLocations],
    ]) {
      for (const location of locations) {
        check(`adjudication-known-source:${record.id}:${location.sourceId}`, sourceLines.has(location.sourceId), location.sourceId);
        check(
          `adjudication-snippet-count:${record.id}:${location.sourceId}`,
          location.lines.length === location.sourceSnippets.length,
          location.lines.length,
        );
        for (const lineNumber of location.lines) {
          check(
            `adjudication-${kind}-line:${record.id}:${location.sourceId}:${lineNumber}`,
            Number.isInteger(lineNumber) && lineNumber > 0 && lineNumber <= sourceLines.get(location.sourceId).length,
            lineNumber,
          );
        }
      }
    }
    for (const witnessId of adjudication.externalWitnessIds) {
      check(`public-witness:${record.id}:${witnessId}`, publicWitnessIds.has(witnessId), witnessId);
    }
    check(
      `secondary-locator-contract:${record.id}`,
      adjudication.secondaryLocatorRefs.length === 0,
      adjudication.secondaryLocatorRefs,
    );
  }

  if (record.referenceCorrection) {
    check(
      `correction-effective-text:${record.id}`,
      record.effectiveQuoteText === record.referenceCorrection.correctedText,
      record.effectiveQuoteText,
    );
    check(
      `correction-original-text:${record.id}`,
      record.quoteText === record.referenceCorrection.originalText,
      record.quoteText,
    );
    for (const witnessId of record.referenceCorrection.externalWitnessIds) {
      check(`correction-witness:${record.id}:${witnessId}`, publicWitnessIds.has(witnessId), witnessId);
    }
  } else {
    check(`uncorrected-effective-text:${record.id}`, record.effectiveQuoteText === record.quoteText, record.effectiveQuoteText);
  }
}

const externalAllusionIds = core.records.filter(record => record.externalClassicalAllusion).map(record => record.id);
check(
  'external-allusion-identity',
  JSON.stringify(externalAllusionIds) === JSON.stringify(['tcm.classic.ref46.quote.L0135Q1']),
  externalAllusionIds,
);

const correctionIds = core.records.filter(record => record.referenceCorrection).map(record => record.id).sort();
check(
  'reference-correction-identities',
  JSON.stringify(correctionIds) === JSON.stringify([
    'tcm.classic.ref46.quote.L0172Q2',
    'tcm.classic.ref46.quote.L0248Q1',
  ]),
  correctionIds,
);

const editorialIds = core.records
  .filter(record => /editorial|database|modern_clinical/.test(record.manualAdjudication?.category ?? ''))
  .map(record => record.id);
check('expected-editorial-count', editorialIds.length === 15, editorialIds);

const criticalExpectations = [
  ['tcm.classic.ref46.quote.L0014Q1', '喜冷饮食'],
  ['tcm.classic.ref46.quote.L0172Q2', '或救十中之一二'],
  ['tcm.classic.ref46.quote.L0209Q1', '耆'],
  ['tcm.classic.ref46.quote.L0248Q1', '擀'],
];
for (const [id, expectedText] of criticalExpectations) {
  const record = core.records.find(item => item.id === id);
  const evidenceText = JSON.stringify({
    effectiveQuoteText: record?.effectiveQuoteText,
    manualAdjudication: record?.manualAdjudication,
    referenceCorrection: record?.referenceCorrection,
  });
  check(`critical-reading:${id}`, evidenceText.includes(expectedText), evidenceText);
}

const failures = checks.filter(item => !item.pass);
const artifact = {
  audit: 'tcm-classic-ref46-quote-provenance',
  generatedAt: '2026-07-18',
  scope: core.scope,
  counts: {
    ...core.counts,
    checks: checks.length,
    failures: failures.length,
  },
  boundaries: core.boundaries,
  failures,
  checks,
};

await mkdir('docs/validation/artifacts', { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.counts));
if (failures.length > 0) process.exitCode = 1;
