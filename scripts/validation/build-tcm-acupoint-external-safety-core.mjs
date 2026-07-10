import { readFile, writeFile } from 'node:fs/promises';

import {
  collectExternalTreatmentClaims,
  mapLegacyAcupoints,
  parseDiseasePrescriptions,
  parseExtraPoints,
  parseMarkdownTableInventory,
  parseMeridianPoints,
  parseOperationSafetyClasses,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const PATHS = {
  general: 'database/tcm/skill-v3/references/38-针灸-经络与腧穴总论.md',
  points: 'database/tcm/skill-v3/references/39-针灸-十四经穴与奇穴.md',
  operations: 'database/tcm/skill-v3/references/40-针灸-灸法按摩与外治法.md',
  diseases: 'database/tcm/skill-v3/references/41-针灸-常见病证取穴.md',
  legacy: 'database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json',
  standardCatalog: 'database/tcm/sources/cn2021-acupoint-standard-catalog.json',
  externalSafety: 'database/tcm/sources/external-treatment-safety-evidence.json',
};
const OUTPUT_PATH = 'database/tcm/normalized/tcm-acupoint-external-safety-candidates.json';

const entries = await Promise.all(Object.entries(PATHS).map(async ([key, filePath]) => {
  const text = await readFile(filePath, 'utf8');
  return [key, { path: filePath, text, sha256: sha256(text) }];
}));
const sources = Object.fromEntries(entries);
const legacy = JSON.parse(sources.legacy.text);
const standardCatalog = JSON.parse(sources.standardCatalog.text);
const externalSafetyEvidence = JSON.parse(sources.externalSafety.text);

const sourceMeridianRows = parseMeridianPoints(sources.points.text);
const sourceExtraRows = parseExtraPoints(sources.points.text);
const transcribedByCode = new Map(standardCatalog.transcribedMeridianPoints.map(point => [point.code, point]));
const sourceCodeSet = new Set(sourceMeridianRows.map(point => point.code));

const meridianRows = sourceMeridianRows.map(point => {
  const transcribed = transcribedByCode.get(point.code);
  return {
    ...point,
    transcribedCurrentName: transcribed?.name ?? null,
    nameEvidence: 'secondary_transcription_candidate',
    nameStatus: transcribed?.name === point.canonicalName
      ? 'secondary_transcription_name_match'
      : 'secondary_transcription_name_difference',
    currentLocationValidation: point.code === 'GB31'
      ? 'source_conflict_confirmed'
      : 'blocked_complete_current_location_text_not_stored',
  };
});

const transcriptionCandidateMissing = standardCatalog.transcribedMeridianPoints
  .filter(point => !sourceCodeSet.has(point.code))
  .map(point => ({
    code: point.code,
    name: point.name,
    evidenceStatus: 'official_count_plus_secondary_name_transcription',
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
const transcriptionNameDifferences = meridianRows
  .filter(point => point.nameStatus === 'secondary_transcription_name_difference')
  .map(point => ({
    code: point.code,
    sourceName: point.canonicalName,
    transcribedCurrentName: point.transcribedCurrentName,
    evidenceStatus: 'secondary_transcription_candidate',
    productEligibility: 'blocked',
  }));
const locationFindings = [{
  id: 'TCM-ACU-LOC-001',
  code: 'GB31',
  name: '风市',
  sourceLocation: meridianRows.find(point => point.code === 'GB31').location,
  currentStandardDistance: '腘横纹上9寸',
  currentStandardContext: 'GB/T 12346-2021 revised the GB31 expression and uses the iliotibial-band anatomical landmark; the Skill retains the older 7-cun statement.',
  status: 'source_error_confirmed',
  productEligibility: 'blocked',
}];

const matchedTranscribedExtraNames = [...new Set(sourceExtraRows
  .map(point => point.transcribedCurrentName)
  .filter(Boolean))];
const extraTranscriptionCandidateMissing = standardCatalog.transcribedExtraPointNames
  .filter(name => !matchedTranscribedExtraNames.includes(name));
const nonTranscriptionRows = sourceExtraRows
  .filter(point => point.identityStatus === 'not_in_secondary_51_name_transcription')
  .map(point => point.canonicalName);
const mixedIdentityRows = sourceExtraRows
  .filter(point => point.identityStatus === 'mixed_extra_and_meridian_identity')
  .map(point => point.canonicalName);
const duplicateLocationRows = sourceExtraRows
  .filter(point => point.duplicateLocationOf)
  .map(point => ({
    sourceName: point.canonicalName,
    duplicateLocationOf: point.duplicateLocationOf,
  }));

const sourceLevels = parseOperationSafetyClasses(sources.operations.text);
const claims = collectExternalTreatmentClaims({
  generalText: sources.general.text,
  pointText: sources.points.text,
  operationText: sources.operations.text,
  diseaseText: sources.diseases.text,
});
const diseasePrescriptions = parseDiseasePrescriptions(
  sources.diseases.text,
  [...sourceMeridianRows, ...sourceExtraRows],
).map(item => ({
  ...item,
  safetyStatus: item.name === '胎位不正'
    ? 'blocked_obstetric_intervention'
    : 'blocked_disease_specific_treatment_claim',
}));
const legacyRuntime = mapLegacyAcupoints(legacy, sourceMeridianRows, sourceExtraRows);
const sourceInventory = Object.fromEntries(['general', 'points', 'operations', 'diseases'].map(sourceId => [sourceId, {
  lines: parseSourceLineInventory(sourceId, sources[sourceId].text),
  tables: parseMarkdownTableInventory(sourceId, sources[sourceId].text),
}]));
const sourceInventoryTotals = Object.values(sourceInventory).reduce((totals, inventory) => ({
  sourceNonEmptyLines: totals.sourceNonEmptyLines + inventory.lines.length,
  sourceMarkdownTables: totals.sourceMarkdownTables + inventory.tables.length,
  sourceMarkdownTableRows: totals.sourceMarkdownTableRows
    + inventory.tables.reduce((count, table) => count + table.dataRows.length, 0),
}), { sourceNonEmptyLines: 0, sourceMarkdownTables: 0, sourceMarkdownTableRows: 0 });

const findings = [
  {
    id: 'TCM-EXT-001',
    severity: 'critical',
    status: 'unsupported_global_home_grade_blocked',
    observation: 'Skill assigns all acupoint pressing and self-massage to A zero-threshold direct advice, but WHO treats tuina as screened practitioner care and FDA low-risk evidence is limited to P6 nausea devices.',
    productEligibility: 'blocked',
  },
  {
    id: 'TCM-EXT-002',
    severity: 'critical',
    status: 'moxibustion_home_protocols_blocked',
    observation: 'Skill assigns suspended moxibustion to A-minus and gives concrete home regimens, including pregnancy; WHO and systematic-review evidence document burn and other hazards, with obstetric adverse-event evidence uncertain.',
    productEligibility: 'blocked',
  },
  {
    id: 'TCM-EXT-003',
    severity: 'critical',
    status: 'cross_modality_conversion_unsupported_blocked',
    observation: 'Skill globally converts textbook needle prescriptions for 27 diseases into home pressing or moxibustion without independent modality-specific evidence.',
    productEligibility: 'blocked',
  },
  {
    id: 'TCM-EXT-004',
    severity: 'high',
    status: 'first_aid_source_conflict_blocked',
    observation: 'Skill adds warm sugar water and acupoint pressing to fainting management after strong treatment; current WHO incident guidance instead requires stopping, positioning, assessment and referral as appropriate.',
    productEligibility: 'blocked',
  },
  {
    id: 'TCM-EXT-005',
    severity: 'high',
    status: 'professional_only_boundary_supported',
    observation: 'The Skill B-grade prohibition on self-needling is directionally supported by WHO practitioner, infection-control, contraindication and incident-management requirements; procedural text still remains blocked from home instruction.',
    productEligibility: 'blocked',
  },
];

const counts = {
  meridianSourceRows: meridianRows.length,
  meridianOfficialCount: standardCatalog.counts.officialCurrentMeridianPointCount,
  meridianTranscriptionNameDifferences: transcriptionNameDifferences.length,
  meridianTranscriptionCandidateMissing: transcriptionCandidateMissing.length,
  extraPointSourceRows: sourceExtraRows.length,
  extraPointOfficialCount: standardCatalog.counts.officialCurrentExtraPointCount,
  extraPointTranscriptionMatches: matchedTranscribedExtraNames.length,
  extraPointTranscriptionMissing: extraTranscriptionCandidateMissing.length,
  extraPointNonTranscriptionRows: nonTranscriptionRows.length,
  extraPointMixedIdentityRows: mixedIdentityRows.length,
  extraPointDuplicateLocationRows: duplicateLocationRows.length,
  operationSourceLevels: sourceLevels.length,
  treatmentClaimRecords: claims.length,
  diseasePrescriptionRows: diseasePrescriptions.length,
  legacyAcupoints: legacyRuntime.uniqueNames.length,
  ...sourceInventoryTotals,
};

const output = {
  schemaVersion: 1,
  domain: 'tcm_acupoint_external_treatment_safety_candidates',
  generatedAt: '2026-07-10',
  status: 'normalized_candidate_full_source_domain_blocked',
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  evidenceStatus: {
    officialCurrentCounts: 'official_current_status_and_counts',
    perNameCatalog: 'secondary_transcription_candidate_not_officially_reproducible_in_repo',
    currentLocationProse: 'blocked_complete_current_location_text_not_stored',
  },
  sourceRefs: Object.fromEntries(Object.entries(sources).map(([key, source]) => [key, {
    path: source.path,
    sha256: source.sha256,
  }])),
  counts,
  meridianPoints: {
    sourceRows: meridianRows,
    transcriptionCandidateMissing,
    transcriptionNameDifferences,
    locationFindings,
  },
  extraPoints: {
    sourceRows: sourceExtraRows,
    transcriptionCandidateMissing: extraTranscriptionCandidateMissing,
    nonTranscriptionRows,
    mixedIdentityRows,
    duplicateLocationRows,
  },
  externalTreatmentSafety: {
    sourceLevels,
    claims,
    evidenceSourceIds: externalSafetyEvidence.sources.map(source => source.id),
    findings,
  },
  diseasePrescriptions,
  legacyRuntime,
  sourceInventory,
  boundaries: [
    'Official sources establish current status and the 362/51 scope counts; the checked-in per-name catalogs are secondary-transcription candidates, not independently reproducible official name lists.',
    'Every non-empty line and Markdown table row in references 38-41 is preserved in the blocked source inventory; structured semantic parsers cover the explicitly counted point, safety-level, claim and disease domains.',
    'The project does not store the complete current Chinese standard location prose; all 401 source location rows remain blocked, with GB31 recorded as a confirmed current-standard conflict.',
    'Traditional indications and disease prescriptions are not validated by point-name correctness.',
    'Professional-only agreement for needle procedures does not make procedural detail eligible for home use.',
    'No A, A-minus or B source label is copied into runtime eligibility.',
  ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(counts, null, 2));
