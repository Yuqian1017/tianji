import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CORE_PATH = 'database/tcm/normalized/tcm-classic-quote-provenance.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classic-quote-provenance-audit-2026-07-11.json';

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

const core = JSON.parse(await readFile(CORE_PATH, 'utf8'));
const sourceLines = (await readFile(core.sourceRefs['huangdi-neijing-suwen-local-text'].path, 'utf8')).split('\n');
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('scope', core.scope === 'reference_42_suwen_explicit_quotes', core.scope);
check('schema-version', core.schemaVersion === 2, core.schemaVersion);
check('status', core.status === 'text_match_and_manual_form_adjudication_not_content_acceptance', core.status);
check('record-count', core.records.length === core.counts.quotes, core.records.length);
check('unresolved-count', core.records.filter(item => item.matchType === 'unresolved').length === core.counts.unresolved, core.counts.unresolved);
check('manual-count', core.records.filter(item => item.manualAdjudication).length === core.counts.manualAdjudicated, core.counts.manualAdjudicated);
check('pending-manual-count', core.records.filter(item => item.matchType === 'unresolved' && !item.manualAdjudication).length === core.counts.pendingManual, core.counts.pendingManual);
check('reference-correction-count', core.records.filter(item => item.referenceCorrection).length === core.counts.referenceCorrected, core.counts.referenceCorrected);

for (const [sourceId, sourceRef] of Object.entries(core.sourceRefs)) {
  const sourceText = await readFile(sourceRef.path, 'utf8');
  check(`source-hash:${sourceId}`, sha256(sourceText) === sourceRef.sha256, sourceRef.path);
}

const ids = new Set();
for (const record of core.records) {
  check(`unique:${record.id}`, !ids.has(record.id), record.id);
  ids.add(record.id);
  check(`reference-line:${record.id}`, record.referenceLine > 0, record.referenceLine);
  check(`quote-text:${record.id}`, record.quoteText.length >= 4, record.quoteText.length);
  check(`blocked:${record.id}`, record.productEligibility === 'blocked' && record.runtimeEligibleFields.length === 0, record.productEligibility);
  if (record.matchType === 'unresolved') {
    check(
      `unresolved-contract:${record.id}`,
      record.sourceLines.length === 0
        && record.reviewStatus === 'manual_form_adjudication_complete_not_content_acceptance'
        && Boolean(record.manualAdjudication),
      record.reviewStatus,
    );
  } else {
    const expectedReviewStatus = record.referenceCorrection
      ? 'reference_correction_applied_text_match_only_not_content_acceptance'
      : 'text_match_only_not_content_adjudication';
    check(
      `located-contract:${record.id}`,
      record.sourceLines.length > 0
        && record.reviewStatus === expectedReviewStatus
        && record.manualAdjudication === null,
      record.sourceLines,
    );
  }

  if (record.manualAdjudication) {
    const adjudication = record.manualAdjudication;
    check(`adjudication-category:${record.id}`, Boolean(adjudication.category), adjudication.category);
    check(`adjudication-verdict:${record.id}`, Boolean(adjudication.verdict), adjudication.verdict);
    check(`adjudication-note:${record.id}`, Boolean(adjudication.note), adjudication.note);
    for (const [kind, lineNumbers] of [
      ['source', adjudication.sourceLines],
      ['related', adjudication.relatedSourceLines],
    ]) {
      for (const lineNumber of lineNumbers) {
        check(
          `adjudication-${kind}-line:${record.id}:${lineNumber}`,
          Number.isInteger(lineNumber) && lineNumber > 0 && lineNumber <= sourceLines.length,
          lineNumber,
        );
      }
    }
  }

  if (record.referenceCorrection) {
    const correction = record.referenceCorrection;
    check(
      `correction-result:${record.id}`,
      record.quoteText === correction.originalText
        && record.effectiveQuoteText === correction.correctedText
        && record.matchType !== 'unresolved',
      `${record.quoteText} -> ${record.effectiveQuoteText}`,
    );
    check(`correction-original:${record.id}`, correction.originalText !== correction.correctedText, correction.originalText);
    check(`correction-reason:${record.id}`, Boolean(correction.reason), correction.reason);
    for (const lineNumber of correction.sourceLines) {
      check(
        `correction-source-line:${record.id}:${lineNumber}`,
        Number.isInteger(lineNumber) && lineNumber > 0 && lineNumber <= sourceLines.length,
        lineNumber,
      );
    }
  }
}

const failures = checks.filter(item => !item.pass);
const artifact = {
  audit: 'tcm-classic-quote-provenance',
  generatedAt: new Date().toISOString(),
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
