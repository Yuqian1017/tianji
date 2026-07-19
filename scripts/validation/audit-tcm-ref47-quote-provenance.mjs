import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CORE_PATH = 'database/tcm/normalized/tcm-classic-ref47-quote-provenance.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classic-ref47-quote-provenance-audit-2026-07-18.json';

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

const publicWitnessCore = JSON.parse(sourceTexts.get('ref47-public-transcription-witnesses'));
const publicWitnessIds = new Set(publicWitnessCore.witnesses.map(witness => witness.id));
const nihaishaCore = JSON.parse(sourceTexts.get('nihaisha-nishi-tcm-locator-manifest'));
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('scope', core.scope === 'reference_47_wenbing_explicit_quotes', core.scope);
check('schema-version', core.schemaVersion === 1, core.schemaVersion);
check(
  'status',
  core.status === 'text_match_attribution_and_reviewed_form_adjudication_not_content_acceptance',
  core.status,
);
check('record-count', core.records.length === core.counts.quotes, core.records.length);

const expectedCounts = {
  quotes: 365,
  located: 278,
  exactText: 89,
  normalizedContiguous: 159,
  segmentedEllipsis: 30,
  unresolved: 87,
  manualAdjudicated: 100,
  reviewedApproximateLocator: 67,
  specialAdjudicated: 33,
  locatedWithSpecialAdjudication: 13,
  pendingManual: 0,
  multiSource: 52,
  crossSourceUnselectedMatches: 0,
  sourceMismatch: 0,
  externalClassicalAllusion: 1,
  publicWitnessSupported: 25,
  referenceCorrected: 2,
  laterCommentaryOrNamedQuotation: 10,
  modernEditorial: 18,
  encodingOrOcrAdjudicated: 7,
  secondaryLocatorLinked: 0,
};
for (const [name, expected] of Object.entries(expectedCounts)) {
  check(`expected-count:${name}`, core.counts[name] === expected, core.counts[name]);
}
check(
  'reviewed-locator-fingerprint',
  core.reviewedLocatorFingerprint === '3ff157430cd955305f310cf25b7c6c7ce490ad41b409227f492a306665ca3252',
  core.reviewedLocatorFingerprint,
);
check('reference-finding-count', core.referenceFindings.length === 5, core.referenceFindings.length);
check(
  'reference-finding-identities',
  JSON.stringify(core.referenceFindings.map(finding => finding.id)) === JSON.stringify([
    'F-TCM-REF47-001',
    'F-TCM-REF47-002',
    'F-TCM-REF47-003',
    'F-TCM-REF47-004',
    'F-TCM-REF47-005',
  ]),
  core.referenceFindings.map(finding => finding.id),
);
check(
  'nihaisha-secondary-only',
  nihaishaCore.sourceRole === 'secondary_course_evidence_and_classical_locator_candidate'
    && nihaishaCore.status === 'reviewed_locator_only_blocked_for_content_ingestion',
  { sourceRole: nihaishaCore.sourceRole, status: nihaishaCore.status },
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
  check(`attribution:${record.id}`, Boolean(record.attribution?.layer && record.attribution?.attributedTo), record.attribution);
  check(`multi-source:${record.id}`, record.multiSource === (record.sourceMatches.length > 1), record.multiSource);
  check(`source-mismatch:${record.id}`, record.sourceMismatch === false, record.sourceMismatch);
  check(
    `external-allusion:${record.id}`,
    record.externalClassicalAllusion === (record.attribution.layer === 'external_classical_allusion'),
    record.attribution.layer,
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
        && record.reviewStatus === 'manual_form_or_attribution_adjudication_complete_not_content_acceptance'
        && Boolean(record.manualAdjudication),
      record.reviewStatus,
    );
  } else {
    const expectedStatus = record.manualAdjudication
      ? 'manual_form_or_attribution_adjudication_complete_not_content_acceptance'
      : record.externalClassicalAllusion
        ? 'external_classical_allusion_text_match_only_not_content_acceptance'
        : 'text_match_only_not_content_adjudication';
    check(
      `located-contract:${record.id}`,
      Boolean(record.selectedSourceMatch)
        && record.expectedSourceIds.includes(record.selectedSourceMatch.sourceId)
        && record.matchType === record.selectedSourceMatch.matchType
        && record.reviewStatus === expectedStatus,
      record.reviewStatus,
    );
  }

  if (record.locatorEvidence) {
    check(
      `locator-type:${record.id}`,
      record.locatorEvidence.matchType === 'reviewed_bigram_recall_locator',
      record.locatorEvidence.matchType,
    );
    check(`locator-source:${record.id}`, record.expectedSourceIds.includes(record.locatorEvidence.sourceId), record.locatorEvidence.sourceId);
    check(
      `locator-score:${record.id}`,
      record.locatorEvidence.bigramRecall >= 0 && record.locatorEvidence.bigramRecall <= 1,
      record.locatorEvidence.bigramRecall,
    );
    if (record.manualAdjudication?.category === 'abridged_or_modernized_source_paragraph') {
      check(
        `default-locator-threshold:${record.id}`,
        record.locatorEvidence.bigramRecall >= 0.6,
        record.locatorEvidence.bigramRecall,
      );
    }
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
  JSON.stringify(externalAllusionIds) === JSON.stringify(['tcm.classic.ref47.quote.L0332Q5']),
  externalAllusionIds,
);

const correctionIds = core.records.filter(record => record.referenceCorrection).map(record => record.id).sort();
check(
  'reference-correction-identities',
  JSON.stringify(correctionIds) === JSON.stringify([
    'tcm.classic.ref47.quote.L0210Q1',
    'tcm.classic.ref47.quote.L0266Q1',
  ]),
  correctionIds,
);

const criticalExpectations = [
  ['tcm.classic.ref47.quote.L0012Q1', '舌胀大不能出口'],
  ['tcm.classic.ref47.quote.L0051Q1', '津与汗'],
  ['tcm.classic.ref47.quote.L0129Q1', '徐洄溪'],
  ['tcm.classic.ref47.quote.L0210Q1', '肺经气分'],
  ['tcm.classic.ref47.quote.L0266Q1', '撑不死的痢疾'],
  ['tcm.classic.ref47.quote.L0332Q5', '黄帝内经素问'],
  ['tcm.classic.ref47.quote.L0372Q4', '䐜'],
  ['tcm.classic.ref47.quote.L0372Q4', '撑'],
  ['tcm.classic.ref47.quote.L0372Q8', '䗪虫'],
  ['tcm.classic.ref47.quote.L0372Q9', '𤺏'],
];
for (const [id, expectedText] of criticalExpectations) {
  const record = core.records.find(item => item.id === id);
  check(`critical-reading:${id}:${expectedText}`, JSON.stringify(record).includes(expectedText), record);
}

const failures = checks.filter(item => !item.pass);
const artifact = {
  audit: 'tcm-classic-ref47-quote-provenance',
  generatedAt: '2026-07-18',
  scope: core.scope,
  counts: {
    ...core.counts,
    checks: checks.length,
    failures: failures.length,
  },
  findings: core.referenceFindings,
  boundaries: core.boundaries,
  failures,
  checks,
};

await mkdir('docs/validation/artifacts', { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.counts));
if (failures.length > 0) process.exitCode = 1;
