import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CORE_PATH = 'database/tcm/normalized/tcm-classic-ref48-quote-provenance.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classic-ref48-quote-provenance-audit-2026-07-18.json';

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

const publicWitnessCore = JSON.parse(sourceTexts.get('ref48-public-transcription-witnesses'));
const publicWitnessIds = new Set(publicWitnessCore.witnesses.map(witness => witness.id));
const nihaishaCore = JSON.parse(sourceTexts.get('nihaisha-nishi-tcm-locator-manifest'));
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('scope', core.scope === 'reference_48_yixuezhongzhong_explicit_quotes', core.scope);
check('schema-version', core.schemaVersion === 1, core.schemaVersion);
check(
  'status',
  core.status === 'text_match_attribution_and_reviewed_form_adjudication_not_content_acceptance',
  core.status,
);
check('record-count', core.records.length === core.counts.quotes, core.records.length);

const expectedCounts = {
  quotes: 256,
  located: 149,
  exactText: 75,
  normalizedContiguous: 69,
  segmentedEllipsis: 5,
  unresolved: 107,
  manualAdjudicated: 120,
  reviewedApproximateLocator: 84,
  specialAdjudicated: 36,
  locatedWithSpecialAdjudication: 13,
  pendingManual: 0,
  multiSource: 12,
  crossSourceUnselectedMatches: 6,
  sourceMismatch: 0,
  externalClassicalAllusion: 16,
  publicWitnessSupported: 4,
  referenceCorrected: 3,
  laterCommentaryOrNamedQuotation: 19,
  modernEditorial: 7,
  encodingOrOcrAdjudicated: 1,
  secondaryLocatorLinked: 0,
};
for (const [name, expected] of Object.entries(expectedCounts)) {
  check(`expected-count:${name}`, core.counts[name] === expected, core.counts[name]);
}
check(
  'reviewed-locator-fingerprint',
  core.reviewedLocatorFingerprint === '2467be8a92e4c7cb32b2b312e60e4b7f75f8ec5e58d4b14a206d9197857ebbe6',
  core.reviewedLocatorFingerprint,
);
check('reference-finding-count', core.referenceFindings.length === 6, core.referenceFindings.length);
check(
  'reference-finding-identities',
  JSON.stringify(core.referenceFindings.map(finding => finding.id)) === JSON.stringify([
    'F-TCM-REF48-001',
    'F-TCM-REF48-002',
    'F-TCM-REF48-003',
    'F-TCM-REF48-004',
    'F-TCM-REF48-005',
    'F-TCM-REF48-006',
  ]),
  core.referenceFindings.map(finding => finding.id),
);
check(
  'nihaisha-secondary-only',
  nihaishaCore.sourceRole === 'secondary_course_evidence_and_classical_locator_candidate'
    && nihaishaCore.status === 'reviewed_locator_only_blocked_for_content_ingestion',
  { sourceRole: nihaishaCore.sourceRole, status: nihaishaCore.status },
);
check('public-witness-count', publicWitnessCore.witnesses.length === 4, publicWitnessCore.witnesses.length);
const publicWitnesses = new Map(publicWitnessCore.witnesses.map(witness => [witness.id, witness]));
check(
  'jicheng-edition-identified',
  publicWitnesses.get('jicheng-yixuezhongzhong-hebei-1977-second-edition')?.edition
    === '《医学衷中参西录》，河北人民出版社 1977 年 2 版',
  publicWitnesses.get('jicheng-yixuezhongzhong-hebei-1977-second-edition'),
);
check(
  'wikisource-shared-chain-boundary',
  publicWitnesses.get('wikisource-yixuezhongzhong-full')?.sourceRole
    === 'public_transcription_error_propagation_witness',
  publicWitnesses.get('wikisource-yixuezhongzhong-full'),
);
check(
  'ctext-version-missing-boundary',
  publicWitnesses.get('ctext-yixuezhongzhong-version-missing')?.limitations.includes('暂缺'),
  publicWitnesses.get('ctext-yixuezhongzhong-version-missing'),
);
check(
  'catalog-not-character-evidence',
  publicWitnesses.get('guoxuedashi-yixuezhongzhong-xuantong-catalog')?.sourceRole
    === 'bibliographic_edition_locator_only',
  publicWitnesses.get('guoxuedashi-yixuezhongzhong-xuantong-catalog'),
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
  JSON.stringify(externalAllusionIds) === JSON.stringify([
    'tcm.classic.ref48.quote.L0012Q1',
    'tcm.classic.ref48.quote.L0026Q2',
    'tcm.classic.ref48.quote.L0047Q1',
    'tcm.classic.ref48.quote.L0047Q2',
    'tcm.classic.ref48.quote.L0072Q1',
    'tcm.classic.ref48.quote.L0113Q1',
    'tcm.classic.ref48.quote.L0137Q3',
    'tcm.classic.ref48.quote.L0146Q1',
    'tcm.classic.ref48.quote.L0150Q2',
    'tcm.classic.ref48.quote.L0211Q1',
    'tcm.classic.ref48.quote.L0248Q1',
    'tcm.classic.ref48.quote.L0252Q1',
    'tcm.classic.ref48.quote.L0267Q1',
    'tcm.classic.ref48.quote.L0274Q1',
    'tcm.classic.ref48.quote.L0291Q2',
    'tcm.classic.ref48.quote.L0337Q1',
  ]),
  externalAllusionIds,
);

const correctionIds = core.records.filter(record => record.referenceCorrection).map(record => record.id).sort();
check(
  'reference-correction-identities',
  JSON.stringify(correctionIds) === JSON.stringify([
    'tcm.classic.ref48.quote.L0044Q1',
    'tcm.classic.ref48.quote.L0243Q1',
    'tcm.classic.ref48.quote.L0359Q1',
  ]),
  correctionIds,
);

const criticalExpectations = [
  ['tcm.classic.ref48.quote.L0016Q1', '徐灵胎'],
  ['tcm.classic.ref48.quote.L0044Q1', '闟'],
  ['tcm.classic.ref48.quote.L0054Q1', '吕沧洲'],
  ['tcm.classic.ref48.quote.L0086Q1', '陆九芝'],
  ['tcm.classic.ref48.quote.L0113Q1', '藏于精者'],
  ['tcm.classic.ref48.quote.L0133Q1', 'modern_cross_text_summary'],
  ['tcm.classic.ref48.quote.L0134Q2', '叶氏用药法'],
  ['tcm.classic.ref48.quote.L0209Q1', '吴鞠通白虎禁例'],
  ['tcm.classic.ref48.quote.L0210Q1', '名医别录'],
  ['tcm.classic.ref48.quote.L0243Q1', '脉搏力减，而谵语益甚'],
  ['tcm.classic.ref48.quote.L0267Q1', 'selected local Suwen witness'],
  ['tcm.classic.ref48.quote.L0271Q1', '陈修园'],
  ['tcm.classic.ref48.quote.L0291Q1', '吴鞠通《医医病书》'],
  ['tcm.classic.ref48.quote.L0320Q1', 'recurring_headings_not_a_single_source_quote'],
  ['tcm.classic.ref48.quote.L0359Q1', '胀满去而其人或至于虚脱'],
];
for (const [id, expectedText] of criticalExpectations) {
  const record = core.records.find(item => item.id === id);
  check(`critical-reading:${id}:${expectedText}`, JSON.stringify(record).includes(expectedText), record);
}

const failures = checks.filter(item => !item.pass);
const artifact = {
  audit: 'tcm-classic-ref48-quote-provenance',
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
