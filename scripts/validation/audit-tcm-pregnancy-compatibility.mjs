import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';
import {
  ARISTOLOCHIC_SKILL_NAMES,
  COMPATIBILITY_SUPPLEMENTS,
  REGULATORY_ARISTOLOCHIC_NAMES,
  SAFETY_REFERENCE_PATH,
  UNSUPPORTED_COMPATIBILITY_EXTENSIONS,
  parseAristolochicSkillCandidates,
  parseDoseTablePregnancyClaims,
  parseEighteenIncompatibilities,
  parseFormulaWarnings,
  parseNineteenFears,
  parsePregnancyTable,
  uniqueComparatorNames,
} from './lib/tcm-pregnancy-compatibility.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-pregnancy-compatibility-formula-candidates.json';
const CHP2020_PATH = 'database/tcm/sources/chp2020-tcm-pregnancy-compatibility.json';
const CHP2025_PATH = 'database/tcm/sources/chp2025-tcm-pregnancy-compatibility-index.json';
const REGULATORY_PATH = 'database/tcm/sources/aristolochic-regulatory-2003-2004.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-pregnancy-compatibility-audit-2026-07-10.json';

const EXPECTED_COUNTS = {
  pregnancyTableRows: 3,
  pregnancyTableItems: 35,
  dosePregnancyClaimRows: 54,
  pregnancyOfficial2020Conflicts: 13,
  pregnancyCurrentIdentityGaps: 15,
  pregnancyOfficial2020Silences: 16,
  eighteenSourceRows: 3,
  eighteenExpandedPairs: 50,
  eighteenSupplementPairs: 2,
  unsupportedNameClassExtensions: 2,
  eighteenPairsSupportedByOfficial2020: 52,
  nineteenSourceRows: 9,
  nineteenExpandedPairs: 10,
  nineteenPairsSupportedByOfficial2020: 7,
  formulaWarningRows: 31,
  formulaNames: 37,
  formulaHomeTreatmentRows: 2,
  skillAristolochicNames: 6,
  regulatoryAristolochicNames: 7,
};

const EXPECTED_MISSING_TITLES = [
  '冬葵子', '瓜蒂', '关木通', '贯众', '广防己', '昆明山海棠', '雷公藤', '藜芦',
  '马兜铃', '虻虫', '密陀僧', '砒石', '砒霜', '青木香', '水银', '天仙藤',
  '五灵脂', '犀角', '雪上一枝蒿', '寻骨风', '泽漆', '樟脑', '朱砂莲',
];

const EXPECTED_CONFLICT_SOURCE_NAMES = [
  '蟾酥', '木鳖子', '硫黄', '常山',
  '附子(温里)', '桃仁(活血)', '益母草(活血)', '天南星(化痰)',
  '洋金花(止咳)', '全蝎(息风)', '硫黄(攻毒)', '蟾酥(攻毒)', '木鳖子(攻毒)',
];

const checks = [];

function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

const runtimeConsumerPaths = await tcmRuntimeConsumerPaths(ROOT);
const [coreText, safetyText, chp2020Text, chp2025Text, regulatoryText, ...sourceTexts] = await Promise.all([
  readFile(path.join(ROOT, CORE_PATH), 'utf8'),
  readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8'),
  readFile(path.join(ROOT, CHP2020_PATH), 'utf8'),
  readFile(path.join(ROOT, CHP2025_PATH), 'utf8'),
  readFile(path.join(ROOT, REGULATORY_PATH), 'utf8'),
  ...runtimeConsumerPaths.map(relativePath => readFile(path.join(ROOT, relativePath), 'utf8')),
]);
const core = JSON.parse(coreText);
const chp2020 = JSON.parse(chp2020Text);
const chp2025 = JSON.parse(chp2025Text);
const regulatory = JSON.parse(regulatoryText);
const historicalByName = new Map(chp2020.items.map(item => [item.requestedName, item]));
const currentByName = new Map(chp2025.items.map(item => [item.requestedName, item]));

const pregnancySource = parsePregnancyTable(safetyText);
const dosePregnancySource = parseDoseTablePregnancyClaims(safetyText);
const eighteenSource = parseEighteenIncompatibilities(safetyText);
const nineteenSource = parseNineteenFears(safetyText);
const formulaSource = parseFormulaWarnings(safetyText);
const aristolochicSource = parseAristolochicSkillCandidates(safetyText);
const comparatorNames = uniqueComparatorNames(safetyText);

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'domain', core.domain, 'tcm_pregnancy_compatibility_aristolochic_formula_safety_candidates');
record('contract', 'status', core.status, 'normalized_candidate_full_source_domain_blocked');
record('contract', 'root_product_eligibility', core.productEligibility, 'blocked');
record('contract', 'counts', core.counts, EXPECTED_COUNTS);

record('source_integrity', 'raw_safety_sha256', core.sourceRefs.skillSafetyReference.sha256, sha256(safetyText));
record('source_integrity', 'chp2020_sha256', core.sourceRefs.chp2020Digital.sha256, sha256(chp2020Text));
record('source_integrity', 'chp2025_sha256', core.sourceRefs.chp2025Catalog.sha256, sha256(chp2025Text));
record('source_integrity', 'regulatory_sha256', core.sourceRefs.aristolochicRegulation.sha256, sha256(regulatoryText));
record('source_integrity', 'chp2025_pdf_sha256', core.sourceRefs.chp2025Catalog.sourcePdfSha256, chp2025.catalogPdfSha256);

record('snapshot', 'comparator_name_count', comparatorNames.length, 109);
record('snapshot', 'chp2020_requested_names', chp2020.counts.requestedNames, 109);
record('snapshot', 'chp2020_found', chp2020.counts.officialMonographsFound, 86);
record('snapshot', 'chp2020_missing', chp2020.counts.missingExactTitles, 23);
record('snapshot', 'chp2020_attention_fields', chp2020.counts.attentionFieldsFound, 73);
record('snapshot', 'chp2020_pregnancy_prohibited', chp2020.counts.pregnancyProhibited, 25);
record('snapshot', 'chp2020_pregnancy_caution', chp2020.counts.pregnancyCaution, 20);
record('snapshot', 'chp2025_requested_names', chp2025.counts.requestedNames, 109);
record('snapshot', 'chp2025_found', chp2025.counts.currentMonographTitles, 86);
record('snapshot', 'chp2025_missing', chp2025.counts.currentTitlesMissing, 23);
record('snapshot', 'chp2020_missing_names', chp2020.items.filter(item => !item.found).map(item => item.requestedName), EXPECTED_MISSING_TITLES);
record('snapshot', 'chp2025_missing_names', chp2025.items.filter(item => !item.titleIn2025Catalog).map(item => item.requestedName), EXPECTED_MISSING_TITLES);

for (const name of comparatorNames) {
  record('snapshot_item', `${name}:chp2020_present`, historicalByName.has(name), true);
  record('snapshot_item', `${name}:chp2025_present`, currentByName.has(name), true);
  record(
    'snapshot_item',
    `${name}:edition_identity_parity`,
    historicalByName.get(name).found,
    currentByName.get(name).titleIn2025Catalog,
  );
}

record('raw_inventory', 'pregnancy_rows', pregnancySource.rows.length, 3);
record('raw_inventory', 'pregnancy_items', pregnancySource.items.length, 35);
record('raw_inventory', 'dose_pregnancy_rows', dosePregnancySource.length, 54);
record('raw_inventory', 'eighteen_rows', eighteenSource.rows.length, 3);
record('raw_inventory', 'eighteen_pairs', eighteenSource.pairs.length, 50);
record('raw_inventory', 'eighteen_supplements', COMPATIBILITY_SUPPLEMENTS.length, 2);
record('raw_inventory', 'unsupported_name_extensions', UNSUPPORTED_COMPATIBILITY_EXTENSIONS.length, 2);
record('raw_inventory', 'nineteen_rows', nineteenSource.rows.length, 9);
record('raw_inventory', 'nineteen_pairs', nineteenSource.pairs.length, 10);
record('raw_inventory', 'formula_rows', formulaSource.length, 31);
record('raw_inventory', 'formula_names', formulaSource.flatMap(row => row.formulaNames).length, 37);
record('raw_inventory', 'skill_aristolochic_names', aristolochicSource.map(item => item.name), ARISTOLOCHIC_SKILL_NAMES);

for (const [index, source] of pregnancySource.items.entries()) {
  const normalized = core.pregnancy.tableItems[index];
  record('pregnancy_preservation', `${source.id}:id`, normalized?.id, source.id);
  record('pregnancy_preservation', `${source.id}:source_item`, normalized?.sourceItem, source.sourceItem);
  record('pregnancy_preservation', `${source.id}:source_category`, normalized?.sourceCategory, source.sourceCategory);
  record('pregnancy_preservation', `${source.id}:canonical_name`, normalized?.canonicalName, source.canonicalName);
  record('pregnancy_preservation', `${source.id}:alternatives`, normalized?.alternatives, source.alternatives);
  record('pregnancy_preservation', `${source.id}:route_scope`, normalized?.routeScope, source.routeScope);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

for (const [index, source] of dosePregnancySource.entries()) {
  const normalized = core.pregnancy.doseTableClaims[index];
  record('pregnancy_preservation', `${source.id}:id`, normalized?.id, source.id);
  record('pregnancy_preservation', `${source.id}:source_name`, normalized?.sourceName, source.sourceName);
  record('pregnancy_preservation', `${source.id}:source_clauses`, normalized?.sourceClauses, source.sourceClauses);
  record('pregnancy_preservation', `${source.id}:classification`, normalized?.sourceClassification, source.sourceClassification);
  record('pregnancy_preservation', `${source.id}:comparator_names`, normalized?.comparatorNames, source.comparatorNames);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

const pregnancyRecords = [...core.pregnancy.tableItems, ...core.pregnancy.doseTableClaims];
for (const recordItem of pregnancyRecords) {
  for (const comparison of recordItem.comparisons) {
    const historical = historicalByName.get(comparison.name);
    const current = currentByName.get(comparison.name);
    record('pregnancy_comparator', `${recordItem.id}/${comparison.name}:current_title`, comparison.current2025.titleInCatalog, current.titleIn2025Catalog);
    record('pregnancy_comparator', `${recordItem.id}/${comparison.name}:historical_found`, comparison.official2020.found, historical.found);
    if (historical.found) {
      record('pregnancy_comparator', `${recordItem.id}/${comparison.name}:attention`, comparison.official2020.attention, historical.attention);
      record('pregnancy_comparator', `${recordItem.id}/${comparison.name}:pregnancy_class`, comparison.official2020.pregnancyClassification, historical.pregnancyClassification);
      record('pregnancy_comparator', `${recordItem.id}/${comparison.name}:html_sha256`, comparison.official2020.htmlContentSha256, historical.htmlContentSha256);
    }
  }
}

record(
  'pregnancy_summary',
  'conflict_source_names',
  pregnancyRecords
    .filter(item => item.aggregateStatus === 'contains_official_2020_classification_conflict')
    .map(item => item.sourceItem ?? item.sourceName),
  EXPECTED_CONFLICT_SOURCE_NAMES,
);
record(
  'pregnancy_summary',
  'unique_conflict_medicines',
  [...new Set(pregnancyRecords
    .filter(item => item.aggregateStatus === 'contains_official_2020_classification_conflict')
    .flatMap(item => item.comparisons.map(comparison => comparison.name)))],
  ['蟾酥', '木鳖子', '硫黄', '常山', '附子', '桃仁', '益母草', '天南星', '洋金花', '全蝎'],
);

const compatibilitySections = [
  ['eighteen', core.compatibility.eighteenPairs, eighteenSource.pairs],
  ['eighteen_supplement', core.compatibility.supplements, COMPATIBILITY_SUPPLEMENTS],
  ['unsupported_extension', core.compatibility.unsupportedNameClassExtensions, UNSUPPORTED_COMPATIBILITY_EXTENSIONS],
  ['nineteen', core.compatibility.nineteenPairs, nineteenSource.pairs],
];
for (const [section, normalizedPairs, sourcePairs] of compatibilitySections) {
  for (const [index, sourcePair] of sourcePairs.entries()) {
    const normalized = normalizedPairs[index];
    record('compatibility_preservation', `${section}/${sourcePair.id}:left`, normalized?.leftName, sourcePair.leftName);
    record('compatibility_preservation', `${section}/${sourcePair.id}:right`, normalized?.rightName, sourcePair.rightName);
    record('safety_gate', `${section}/${sourcePair.id}:blocked`, normalized?.productEligibility, 'blocked');
    record('safety_gate', `${section}/${sourcePair.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
    const leftAttention = historicalByName.get(sourcePair.leftName)?.attention ?? '';
    const rightAttention = historicalByName.get(sourcePair.rightName)?.attention ?? '';
    const expectedEvidence = [];
    if (leftAttention.includes(sourcePair.rightName)) expectedEvidence.push({ monograph: sourcePair.leftName, mentions: sourcePair.rightName });
    if (rightAttention.includes(sourcePair.leftName)) expectedEvidence.push({ monograph: sourcePair.rightName, mentions: sourcePair.leftName });
    record('compatibility_comparator', `${section}/${sourcePair.id}:evidence`, normalized?.official2020AttentionEvidence, expectedEvidence);
  }
}

record(
  'compatibility_summary',
  'eighteen_all_supported',
  [...core.compatibility.eighteenPairs, ...core.compatibility.supplements]
    .filter(pair => pair.official2020AttentionEvidence.length > 0).length,
  52,
);
record(
  'compatibility_summary',
  'unsupported_name_extensions',
  core.compatibility.unsupportedNameClassExtensions
    .filter(pair => pair.official2020AttentionEvidence.length === 0).length,
  2,
);
record(
  'compatibility_summary',
  'nineteen_unsupported_pairs',
  core.compatibility.nineteenPairs
    .filter(pair => pair.official2020AttentionEvidence.length === 0)
    .map(pair => [pair.leftName, pair.rightName]),
  [['水银', '砒霜'], ['川乌', '犀角'], ['草乌', '犀角']],
);

for (const [index, source] of formulaSource.entries()) {
  const normalized = core.formulaWarnings[index];
  record('formula_preservation', `${source.id}:formula_cell`, normalized?.sourceFormulaCell, source.sourceFormulaCell);
  record('formula_preservation', `${source.id}:formula_names`, normalized?.formulaNames, source.formulaNames);
  record('formula_preservation', `${source.id}:toxic_source`, normalized?.toxicSource, source.toxicSource);
  record('formula_preservation', `${source.id}:warning`, normalized?.warning, source.warning);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}
record(
  'formula_summary',
  'home_treatment_rows',
  core.formulaWarnings.filter(row => row.containsHomeTreatmentInstruction).map(row => row.sourceFormulaCell),
  ['瓜蒂散', '三圣散'],
);

record('regulatory', 'source_document_ids', regulatory.sourceDocuments.map(item => item.id), ['CN-NMPA-2003-121', 'CN-SFDA-2004-379']);
record('regulatory', 'regulatory_names', regulatory.medicineAdjudications.map(item => item.name), REGULATORY_ARISTOLOCHIC_NAMES);
record('regulatory', '2003_cancelled', regulatory.sourceDocuments[0].facts.cancelledMedicinalStandards, ['关木通']);
record('regulatory', '2003_replacement', regulatory.sourceDocuments[0].facts.requiredFormulaReplacements, [{ from: '关木通', to: '木通' }]);
record('regulatory', '2004_cancelled', regulatory.sourceDocuments[1].facts.cancelledMedicinalStandards, ['广防己', '青木香']);
record('regulatory', '2004_four_medicine_group', regulatory.sourceDocuments[1].facts.fourMedicineFormulaGroup, ['马兜铃', '寻骨风', '天仙藤', '朱砂莲']);
record('regulatory', 'skill_omits_zhushalian', ARISTOLOCHIC_SKILL_NAMES.includes('朱砂莲'), false);
record('regulatory', 'normalized_finding_ids', core.aristolochicAcid.findings.map(item => item.id), ['TCM-AA-001', 'TCM-AA-002', 'TCM-AA-003']);
for (const candidate of core.aristolochicAcid.regulatoryCandidates) {
  record('regulatory', `${candidate.name}:current_catalog_absent`, candidate.pharmacopoeia.current2025.titleInCatalog, false);
  record('safety_gate', `${candidate.name}:blocked`, candidate.productEligibility, 'blocked');
  record('safety_gate', `${candidate.name}:runtime_fields`, candidate.runtimeEligibleFields, []);
}

const runtimeText = sourceTexts.join('\n');
record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-pregnancy-compatibility-formula-candidates/g)].length, 0);
record('runtime_gate', 'normalized_finding_id_imports', [...runtimeText.matchAll(/TCM-AA-00[123]/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);

const artifact = {
  audit: 'tcm-pregnancy-compatibility-aristolochic-formula-candidates',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_all_candidates_blocked' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    comparatorNames: comparatorNames.length,
    runtimeConsumerFilesScanned: runtimeConsumerPaths.length,
    ...core.counts,
  },
  categories,
  runtimeConsumerPaths,
  findings: [
    {
      id: 'TCM-PREG-001',
      severity: 'critical',
      status: 'blocked',
      description: 'Thirteen Skill source records across ten medicines conflict with the official 2020 monograph pregnancy classification.',
    },
    {
      id: 'TCM-COMPAT-001',
      severity: 'high',
      status: 'bounded_historical_support',
      description: 'All 52 expanded eighteen-incompatibility main/supplement pairs have 2020 official attention support, while two name-class extensions do not.',
    },
    {
      id: 'TCM-COMPAT-002',
      severity: 'high',
      status: 'partially_supported',
      description: 'Seven of ten expanded nineteen-fear pairs have 2020 official attention support; 水银/砒霜 and both 犀角 pairs do not.',
    },
    ...core.aristolochicAcid.findings,
    {
      id: 'TCM-FORMULA-001',
      severity: 'critical',
      status: 'blocked',
      description: '瓜蒂散 and 三圣散 source warnings contain home-treatment instructions for persistent vomiting; retained for audit only.',
    },
  ],
  evidenceBoundary: core.boundaries,
  sourceRefs: core.sourceRefs,
  relevantSha256: {
    normalizedCore: sha256(coreText),
    rawSafetyReference: sha256(safetyText),
    chp2020Snapshot: sha256(chp2020Text),
    chp2025Snapshot: sha256(chp2025Text),
    aristolochicRegulatorySnapshot: sha256(regulatoryText),
  },
  failures: failures.slice(0, 100),
};

await mkdir(path.dirname(path.join(ROOT, ARTIFACT_PATH)), { recursive: true });
await writeFile(path.join(ROOT, ARTIFACT_PATH), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({
  result: artifact.result,
  ...artifact.summary,
  categories,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;
