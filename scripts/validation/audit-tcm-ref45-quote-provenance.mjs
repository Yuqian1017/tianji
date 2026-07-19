import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CORE_PATH = 'database/tcm/normalized/tcm-classic-ref45-quote-provenance.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classic-ref45-quote-provenance-audit-2026-07-18.json';

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
const publicWitnessCore = JSON.parse(sourceTexts.get('ref45-public-transcription-witnesses'));
const publicWitnessIds = new Set(publicWitnessCore.witnesses.map(witness => witness.id));
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('scope', core.scope === 'reference_45_jingui_explicit_quotes', core.scope);
check('schema-version', core.schemaVersion === 1, core.schemaVersion);
check('status', core.status === 'text_match_and_manual_form_adjudication_not_content_acceptance', core.status);
check('record-count', core.records.length === core.counts.quotes, core.records.length);
check('expected-quote-count', core.counts.quotes === 113, core.counts.quotes);
check('expected-located-count', core.counts.located === 96, core.counts.located);
check('expected-exact-count', core.counts.exactText === 14, core.counts.exactText);
check('expected-normalized-count', core.counts.normalizedContiguous === 71, core.counts.normalizedContiguous);
check('expected-segmented-count', core.counts.segmentedEllipsis === 11, core.counts.segmentedEllipsis);
check('expected-unresolved-count', core.counts.unresolved === 17, core.counts.unresolved);
check('expected-manual-count', core.counts.manualAdjudicated === 17, core.counts.manualAdjudicated);
check('pending-manual-zero', core.counts.pendingManual === 0, core.counts.pendingManual);
check('expected-multi-source-count', core.counts.multiSource === 4, core.counts.multiSource);
check('source-mismatch-zero', core.counts.sourceMismatch === 0, core.counts.sourceMismatch);
check('expected-external-allusion-count', core.counts.externalClassicalAllusion === 1, core.counts.externalClassicalAllusion);
check('expected-public-witness-records', core.counts.publicWitnessSupported === 3, core.counts.publicWitnessSupported);
check('expected-secondary-locator-records', core.counts.secondaryLocatorLinked === 3, core.counts.secondaryLocatorLinked);

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

  const selected = record.selectedSourceMatch;
  const computedSourceMismatch = Boolean(selected && !record.expectedSourceIds.includes(selected.sourceId));
  check(`source-mismatch:${record.id}`, record.sourceMismatch === computedSourceMismatch, record.sourceMismatch);
  check(
    `external-allusion:${record.id}`,
    record.externalClassicalAllusion === (record.expectedSourceIds[0] !== 'jingui-yaolue-local-text'),
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
      record.sourceMatches.length === 0
        && record.selectedSourceMatch === null
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
      record.sourceMatches.length > 0
        && Boolean(record.selectedSourceMatch)
        && record.matchType === record.selectedSourceMatch.matchType
        && record.reviewStatus === expectedStatus
        && record.manualAdjudication === null,
      record.reviewStatus,
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
    for (const locatorRef of adjudication.secondaryLocatorRefs) {
      check(
        `secondary-locator:${record.id}:${locatorRef}`,
        locatorRef.startsWith('external.nihaisha-nishi-tcm.e3cb5135:'),
        locatorRef,
      );
    }
  }
}

const multiSourceIds = core.records.filter(record => record.multiSource).map(record => record.id).sort();
check(
  'multi-source-identities',
  JSON.stringify(multiSourceIds) === JSON.stringify([
    'tcm.classic.ref45.quote.L0044Q1',
    'tcm.classic.ref45.quote.L0044Q5',
    'tcm.classic.ref45.quote.L0054Q3',
    'tcm.classic.ref45.quote.L0058Q4',
  ]),
  multiSourceIds,
);

const externalAllusionIds = core.records.filter(record => record.externalClassicalAllusion).map(record => record.id).sort();
check(
  'external-allusion-identities',
  JSON.stringify(externalAllusionIds) === JSON.stringify(['tcm.classic.ref45.quote.L0064Q1']),
  externalAllusionIds,
);

const failures = checks.filter(item => !item.pass);
const artifact = {
  audit: 'tcm-classic-ref45-quote-provenance',
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
