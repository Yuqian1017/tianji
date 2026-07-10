import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  SAFETY_REFERENCE_PATH,
  parseDoseRows,
  sha256,
} from './lib/tcm-pharmacopoeia.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-pharmacopoeia-candidates.json';
const CHP2020_PATH = 'database/tcm/sources/chp2020-tcm-safety-selected.json';
const CHP2025_PATH = 'database/tcm/sources/chp2025-part1-candidate-index.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-pharmacopoeia-audit-2026-07-10.json';

const ACTIVE_RUNTIME_FILES = [
  'src/App.jsx',
  'src/lib/tcm-data.js',
];
const ACTIVE_RUNTIME_DIRECTORIES = [
  'src/modules/bazihealth',
  'src/modules/tizhi',
  'src/modules/ziwu',
  'src/modules/wuyun',
  'src/modules/wangzhen',
];

const EXPECTED_EMERGENCY_ROWS = [
  '川乌', '附子', '丁公藤', '使君子', '马钱子', '半夏',
  '天南星', '洋金花', '华山参', '瓜蒂', '胆矾',
];

const EXPECTED_CONFLICT_NAMES = [
  '苍耳子', '三颗针', '北豆根', '半边莲', '白薇', '甘遂', '芫花', '商陆',
  '牵牛子', '吴茱萸', '天山雪莲', '川楝子', '使君子', '苦楝皮', '鹤虱',
  '艾叶', '益母草', '水蛭', '半夏', '白附子', '苦杏仁', '洋金花', '赭石',
  '蒺藜', '罗布麻叶', '仙茅', '蛤蚧', '白扁豆', '补骨脂', '人参', '甘草',
  '肉豆蔻', '赤石脂', '禹余粮', '常山', '蛇床子', '木鳖子', '大蒜',
];

const checks = [];

function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

function flattenRows(rows) {
  return rows.flatMap(row => row.substances.map(substance => ({ row, substance })));
}

async function sourceFilesUnder(relativeDirectory) {
  const entries = await readdir(path.join(ROOT, relativeDirectory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await sourceFilesUnder(relativePath));
    } else if (/\.(?:js|jsx)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }
  return files;
}

const activeRuntimePaths = [
  ...ACTIVE_RUNTIME_FILES,
  ...(await Promise.all(ACTIVE_RUNTIME_DIRECTORIES.map(sourceFilesUnder))).flat(),
].sort();

const [
  coreText,
  safetyText,
  chp2020Text,
  chp2025Text,
  ...runtimeTexts
] = await Promise.all([
  readFile(path.join(ROOT, CORE_PATH), 'utf8'),
  readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8'),
  readFile(path.join(ROOT, CHP2020_PATH), 'utf8'),
  readFile(path.join(ROOT, CHP2025_PATH), 'utf8'),
  ...activeRuntimePaths.map(relativePath => readFile(path.join(ROOT, relativePath), 'utf8')),
]);

const core = JSON.parse(coreText);
const chp2020 = JSON.parse(chp2020Text);
const chp2025 = JSON.parse(chp2025Text);
const parsedRows = parseDoseRows(safetyText);
const normalizedSubstances = flattenRows(core.rows);
const chp2020ByRow = new Map(chp2020.rows.map(row => [row.rowId, row]));
const chp2025ByRow = new Map(chp2025.rows.map(row => [row.rowId, row]));

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'domain', core.domain, 'tcm_pharmacopoeia_safety_candidates');
record('contract', 'status', core.status, 'normalized_candidate_full_skill_dose_domain_blocked');
record('contract', 'source_rows', core.rows.length, 100);
record('contract', 'named_substances', normalizedSubstances.length, 101);
record('contract', 'unique_row_ids', new Set(core.rows.map(row => row.id)).size, 100);
record('contract', 'unique_substance_ids', new Set(normalizedSubstances.map(({ substance }) => substance.id)).size, 101);

record('source_integrity', 'raw_safety_sha256', core.sourceRefs.skillSafetyReference.sha256, sha256(safetyText));
record('source_integrity', 'chp2020_snapshot_sha256', core.sourceRefs.chp2020Digital.sha256, sha256(chp2020Text));
record('source_integrity', 'chp2025_snapshot_sha256', core.sourceRefs.chp2025Catalog.sha256, sha256(chp2025Text));
record('source_integrity', 'chp2025_pdf_sha256', core.sourceRefs.chp2025Catalog.sourcePdfSha256, chp2025.catalogPdfSha256);
record('source_integrity', 'chp2020_role', chp2020.sourceRole, 'official_historical_comparator_not_current_2025_authority');
record('source_integrity', 'chp2025_role', chp2025.sourceRole, 'current_edition_catalog_identity_only_not_monograph_content');
record('source_integrity', 'chp2025_effective_date', chp2025.effectiveDate, '2025-10-01');

for (const [index, parsed] of parsedRows.entries()) {
  const row = core.rows[index];
  const historicalRow = chp2020ByRow.get(parsed.id);
  const currentRow = chp2025ByRow.get(parsed.id);
  const key = parsed.id;

  record('row_preservation', `${key}:id`, row?.id, parsed.id);
  record('row_preservation', `${key}:source_name`, row?.sourceName, parsed.sourceName);
  record('row_preservation', `${key}:base_name`, row?.baseName, parsed.baseName);
  record('row_preservation', `${key}:locator`, row?.sourceLocator, parsed.sourceLocator);
  record('row_preservation', `${key}:raw_fields`, row?.sourceRaw, parsed.raw);
  record('row_preservation', `${key}:substance_count`, row?.substances.length, parsed.substanceNames.length);
  record('safety_gate', `${key}:row_blocked`, row?.productEligibility, 'blocked');
  record(
    'safety_gate',
    `${key}:emergency_content_blocked`,
    row?.emergencyInstructionEligibility,
    'blocked_do_not_surface_as_home_treatment',
  );
  record('snapshot_join', `${key}:chp2020_row_present`, Boolean(historicalRow), true);
  record('snapshot_join', `${key}:chp2025_row_present`, Boolean(currentRow), true);
  record('snapshot_join', `${key}:chp2020_source_name`, historicalRow?.sourceName, parsed.sourceName);
  record('snapshot_join', `${key}:chp2025_source_name`, currentRow?.sourceName, parsed.sourceName);

  for (const substance of row.substances) {
    const historical = historicalRow?.substances.find(item => (
      item.substanceName === substance.sourceSubstanceName
    ));
    const current = currentRow?.substances.find(item => (
      item.substanceName === substance.sourceSubstanceName
    ));
    const substanceKey = substance.id;

    record('snapshot_join', `${substanceKey}:chp2020_substance_present`, Boolean(historical), true);
    record('snapshot_join', `${substanceKey}:chp2025_substance_present`, Boolean(current), true);
    record('snapshot_join', `${substanceKey}:current_snapshot`, substance.current2025, current);
    record('safety_gate', `${substanceKey}:product_blocked`, substance.productEligibility, 'blocked');
    record('safety_gate', `${substanceKey}:runtime_fields_empty`, substance.runtimeEligibleFields, []);
    record(
      'safety_gate',
      `${substanceKey}:current_dose_blocked`,
      substance.currentPharmacopoeiaDoseValidation,
      'blocked_2025_monograph_text_not_available_in_project',
    );
    record(
      'identity',
      `${substanceKey}:canonical_name`,
      substance.name,
      current?.titleIn2025Catalog ? current.officialTitle : substance.sourceSubstanceName,
    );
    record(
      'historical_comparator',
      `${substanceKey}:found_status`,
      substance.official2020.found,
      historical?.found,
    );
    if (historical?.found) {
      record('historical_comparator', `${substanceKey}:entry_id`, substance.official2020.entryId, historical.entryId);
      record('historical_comparator', `${substanceKey}:title`, substance.official2020.title, historical.officialTitle);
      record('historical_comparator', `${substanceKey}:dose`, substance.official2020.dose, historical.dose);
      record('historical_comparator', `${substanceKey}:attention`, substance.official2020.attention, historical.attention);
      record(
        'historical_comparator',
        `${substanceKey}:html_sha256`,
        substance.official2020.htmlContentSha256,
        historical.htmlContentSha256,
      );
    } else {
      record('historical_comparator', `${substanceKey}:missing_reason`, substance.official2020.reason, historical?.reason);
    }
  }
}

const conflicts = normalizedSubstances
  .filter(({ substance }) => substance.validationStatus === 'conflicts_with_official_2020_dose_quantities')
  .map(({ substance }) => substance.name);
const emergencyRows = core.rows
  .filter(row => row.containsEmergencyTreatmentInstruction)
  .map(row => row.baseName);
const missingCurrentNames = normalizedSubstances
  .filter(({ substance }) => !substance.current2025.titleIn2025Catalog)
  .map(({ substance }) => substance.name);

record('summary', 'source_rows', core.counts.sourceRows, 100);
record('summary', 'named_substances', core.counts.namedSubstances, 101);
record('summary', 'current_2025_titles', core.counts.current2025CatalogTitles, 79);
record('summary', 'current_2025_missing_or_unresolved', core.counts.current2025MissingOrUnresolved, 22);
record('summary', 'ambiguous_current_names', core.counts.ambiguousCurrentNames, 1);
record('summary', 'official_2020_monographs', core.counts.official2020Monographs, 79);
record('summary', 'official_2020_quantity_concordant', core.counts.official2020QuantityConcordant, 41);
record('summary', 'official_2020_quantity_conflicts', core.counts.official2020QuantityConflicts, 38);
record('summary', 'emergency_instruction_rows', core.counts.emergencyInstructionRows, 11);
record('summary', 'historical_conflict_names', conflicts, EXPECTED_CONFLICT_NAMES);
record('summary', 'emergency_row_names', emergencyRows, EXPECTED_EMERGENCY_ROWS);

const bySourceName = new Map(normalizedSubstances.map(({ substance }) => (
  [substance.sourceSubstanceName, substance]
)));
record('adjudication', '三棵针:canonical_name', bySourceName.get('三棵针')?.name, '三颗针');
record('adjudication', '三棵针:2025_title', bySourceName.get('三棵针')?.current2025.titleIn2025Catalog, true);
record('adjudication', '贯众:identity_status', bySourceName.get('贯众')?.validationStatus, 'identity_ambiguous');
record(
  'adjudication',
  '贯众:current_alternatives',
  bySourceName.get('贯众')?.current2025.alternativesInCatalog,
  ['绵马贯众', '紫萁贯众'],
);
record('adjudication', '光慈菇:canonical_name', bySourceName.get('光慈菇')?.name, '光慈菇');
record('adjudication', '光慈菇:not_mapped_to_shancigu', bySourceName.get('光慈菇')?.current2025.titleIn2025Catalog, false);
for (const name of ['关木通', '青木香', '天仙藤', '马兜铃']) {
  record('adjudication', `${name}:not_current_catalog_title`, bySourceName.get(name)?.current2025.titleIn2025Catalog, false);
  record('adjudication', `${name}:blocked`, bySourceName.get(name)?.productEligibility, 'blocked');
}
record('adjudication', '附子:2020_dose', bySourceName.get('附子')?.official2020.dose, '3～15g，先煎，久煎。');
record(
  'adjudication',
  '沙参苦参:source_error',
  core.compatibilityFindings.find(item => item.id === 'TCM-COMPAT-NAME-001')?.status,
  'source_error_confirmed',
);

const activeRuntimeText = runtimeTexts.join('\n');
record(
  'runtime_gate',
  'concrete_gram_doses',
  [...activeRuntimeText.matchAll(/\d+(?:\.\d+)?\s*(?:g\b|克)/gi)].length,
  0,
);
record(
  'runtime_gate',
  'home_antidote_or_emergency_instructions',
  [...activeRuntimeText.matchAll(/催吐|洗胃|阿托品|利多卡因|活性炭|高锰酸钾|甘草煎|姜汁|稀醋|蛋清/g)].length,
  0,
);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);

const artifact = {
  audit: 'tcm-pharmacopoeia-candidates',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_all_candidates_blocked' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    activeRuntimeFilesScanned: activeRuntimePaths.length,
    ...core.counts,
  },
  categories,
  adjudicatedNames: {
    historicalQuantityConflicts: conflicts,
    current2025MissingOrUnresolved: missingCurrentNames,
    emergencyInstructionRows: emergencyRows,
  },
  findings: [
    {
      id: 'TCM-PHARM-001',
      severity: 'high',
      status: 'blocked',
      description: 'The 2025 public evidence in this project is a current title catalog, not monograph dose text; no Skill dose is current-edition validated.',
    },
    {
      id: 'TCM-PHARM-002',
      severity: 'high',
      status: 'recorded',
      description: 'Thirty-eight candidate substances differ from at least one gram quantity in the official 2020 digital monograph comparator.',
    },
    {
      id: 'TCM-ID-001',
      severity: 'high',
      status: 'corrected_in_normalized_layer',
      description: 'The Skill source name 三棵针 is normalized to the official title 三颗针; the immutable raw import is unchanged.',
    },
    {
      id: 'TCM-ID-002',
      severity: 'high',
      status: 'blocked',
      description: 'The generic identity 贯众 is ambiguous between at least 绵马贯众 and 紫萁贯众 in the 2025 catalog.',
    },
    {
      id: 'TCM-ID-003',
      severity: 'critical',
      status: 'blocked',
      description: '光慈菇 remains distinct and must not be mapped to the genuine 山慈菇 monograph.',
    },
    {
      id: 'TCM-SAFE-002',
      severity: 'critical',
      status: 'blocked',
      description: 'Eleven raw rows contain emergency or home-antidote instructions; they are retained for audit only and excluded from runtime.',
    },
    {
      id: 'TCM-COMPAT-NAME-001',
      severity: 'high',
      status: 'source_error_confirmed',
      description: 'The Skill compatibility table conflates 沙参 and 苦参 as 沙参(苦参); normalized consumers must keep them separate.',
    },
  ],
  evidenceBoundary: [
    '2025 catalog membership validates candidate identity only, not dose, preparation, contraindication, or clinical use.',
    '2020 digital monographs are official historical comparators and are not represented as current 2025 authority.',
    'Absence from the 2025 Pharmacopoeia catalog does not prove absence from every other applicable standard.',
    'All 101 substances remain product-blocked and expose no runtime-eligible fields.',
  ],
  relevantSha256: {
    normalizedCore: sha256(coreText),
    rawSafetyReference: sha256(safetyText),
    chp2020Snapshot: sha256(chp2020Text),
    chp2025Snapshot: sha256(chp2025Text),
  },
  sourceRefs: core.sourceRefs,
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
