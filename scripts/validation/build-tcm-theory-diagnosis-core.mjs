import { readFile, writeFile } from 'node:fs/promises';

import {
  collectTheoryDiagnosisPriorityLines,
  parseTheoryDiagnosisSections,
  theoryDiagnosisSourceDomain,
} from './lib/tcm-theory-diagnosis.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const REFERENCE_NAMES = [
  '总论与哲学基础', '脏象', '脏腑关系', '精气血津液', '病因', '病机', '治则',
  '经络与体质', '望诊闻诊', '问诊切诊', '八纲辨证', '病因与气血津液辨证',
  '脏腑辨证', '六经卫气营血三焦经络辨证',
];
const PATHS = Object.fromEntries(REFERENCE_NAMES.map((name, index) => {
  const number = String(index + 1).padStart(2, '0');
  return [`ref${number}`, `database/tcm/skill-v3/references/${number}-${name}.md`];
}));
PATHS.evidence = 'database/tcm/sources/theory-diagnosis-evidence.json';
const OUTPUT_PATH = 'database/tcm/normalized/tcm-theory-diagnosis-candidates.json';

const sources = Object.fromEntries(await Promise.all(Object.entries(PATHS).map(async ([sourceId, filePath]) => {
  const text = await readFile(filePath, 'utf8');
  return [sourceId, { path: filePath, text, sha256: sha256(text) }];
})));
const referenceIds = Object.keys(PATHS).filter(sourceId => sourceId.startsWith('ref'));
const evidence = JSON.parse(sources.evidence.text);
const evidenceIds = new Set(evidence.sources.map(source => source.id));

const sourceInventory = Object.fromEntries(referenceIds.map(sourceId => [sourceId, {
  evidenceState: 'secondary_skill_summary_without_page_level_primary_source',
  lines: parseSourceLineInventory(sourceId, sources[sourceId].text).map(line => ({
    ...line,
    sourceDomain: theoryDiagnosisSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  })),
  tables: parseMarkdownTableInventory(sourceId, sources[sourceId].text),
}]));
const sections = referenceIds.flatMap(sourceId => parseTheoryDiagnosisSections(sourceId, sources[sourceId].text));
const priorityLines = referenceIds
  .flatMap(sourceId => collectTheoryDiagnosisPriorityLines(sourceId, sources[sourceId].text));

function sourceLine(sourceId, needle) {
  const matches = sourceInventory[sourceId].lines.filter(line => line.sourceText.includes(needle));
  if (matches.length !== 1) {
    throw new Error(`Expected one ${sourceId} source line containing ${needle}, found ${matches.length}`);
  }
  return matches[0];
}

const findingSpecs = [
  ['TCM-TD-001', 'framework_boundary', 'traditional_construct_not_biomedical_anatomy', 'ref02', '主血脉', ['NCCIH-TCM-OVERVIEW', 'WHO-TCIM-STRATEGY-2025']],
  ['TCM-TD-002', 'unsupported_diagnostic', 'unsupported_standalone_tongue_organ_diagnosis', 'ref09', '舌尖候心肺', ['PUBMED-TEAM-DIAGNOSIS-RELIABILITY-2009', 'JACM-TCM-INTER-RATER-2019']],
  ['TCM-TD-003', 'reliability_limit', 'diagnostic_framework_low_to_moderate_inter_rater_agreement', 'ref14', '证候诊断七步骤', ['JACM-TCM-INTER-RATER-2019', 'PUBMED-FD-TCM-INSTRUMENTS-2021']],
  ['TCM-TD-004', 'reliability_limit', 'pulse_diagnosis_reliability_requires_operational_definition', 'ref10', '28 病脉分类', ['PUBMED-PULSE-RELIABILITY-2016']],
  ['TCM-TD-005', 'scope_mismatch', 'incomplete_constitution_taxonomy_not_ccmq_equivalent', 'ref08', '分类(阴阳分类法)', ['PMC-CCMQ-60-9']],
  ['TCM-TD-006', 'unsupported_causal', 'unsupported_constitution_determines_disease_claim', 'ref08', '体质强弱决定正气虚实', ['PMC-CCMQ-60-9', 'WHO-TCIM-STRATEGY-2025']],
  ['TCM-TD-007', 'unsupported_prevention', 'unsupported_banlangen_influenza_prevention', 'ref07', '板蓝根大青叶防流感', ['CDC-FLU-VACCINE', 'NCCIH-TCM-OVERVIEW']],
  ['TCM-TD-008', 'unsupported_treatment', 'unsupported_geography_based_drug_and_dose_rule', 'ref07', '西北高寒,病多寒宜辛温', ['NCCIH-TCM-OVERVIEW', 'WHO-TCIM-STRATEGY-2025']],
  ['TCM-TD-009', 'unsafe_treatment', 'unsafe_body_type_poison_tolerance_rule', 'ref08', '皆**胜毒**', ['NCCIH-TCM-OVERVIEW', 'WHO-TCIM-STRATEGY-2025']],
  ['TCM-TD-010', 'unsupported_diagnostic', 'unsupported_pediatric_finger_vein_severity_diagnosis', 'ref09', '透关射甲', ['JACM-TCM-INTER-RATER-2019', 'NCCIH-TCM-OVERVIEW']],
  ['TCM-TD-011', 'unsupported_prognostic', 'unsupported_voice_breathing_disease_localization_and_prognosis', 'ref09', '闻声定病位', ['PUBMED-TEAM-DIAGNOSIS-RELIABILITY-2009', 'NCCIH-TCM-OVERVIEW']],
  ['TCM-TD-012', 'unsupported_diagnostic', 'unsupported_pulse_position_organ_diagnosis', 'ref10', '左寸心、左关肝胆', ['PUBMED-PULSE-RELIABILITY-2016']],
  ['TCM-TD-013', 'unsupported_prediction', 'unsupported_fixed_stroke_prodrome_prediction', 'ref07', '拇食指麻木', ['NCCIH-TCM-OVERVIEW']],
  ['TCM-TD-014', 'reliability_limit', 'traditional_pattern_tables_not_validated_clinical_answer_key', 'ref14', '辨病与辨证结合', ['JACM-TCM-INTER-RATER-2019', 'PUBMED-FD-TCM-INSTRUMENTS-2021']],
];

const findings = findingSpecs.map(([id, kind, status, sourceId, needle, comparatorSourceIds]) => {
  for (const comparatorSourceId of comparatorSourceIds) {
    if (!evidenceIds.has(comparatorSourceId)) throw new Error(`Unknown comparator ${comparatorSourceId}`);
  }
  const source = sourceLine(sourceId, needle);
  return {
    id,
    kind,
    status,
    sourceId,
    sourceLine: source.sourceLine,
    sourceText: source.sourceText,
    comparatorSourceIds,
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  };
});

const inventoryTotals = Object.values(sourceInventory).reduce((totals, inventory) => ({
  sourceNonEmptyLines: totals.sourceNonEmptyLines + inventory.lines.length,
  sourceMarkdownTables: totals.sourceMarkdownTables + inventory.tables.length,
  sourceMarkdownTableRows: totals.sourceMarkdownTableRows
    + inventory.tables.reduce((count, table) => count + table.dataRows.length, 0),
}), { sourceNonEmptyLines: 0, sourceMarkdownTables: 0, sourceMarkdownTableRows: 0 });
const counts = {
  references: referenceIds.length,
  ...inventoryTotals,
  sections: sections.length,
  priorityLineCandidates: priorityLines.length,
  findings: findings.length,
};

const output = {
  schemaVersion: 1,
  domain: 'tcm_theory_and_diagnosis_candidates',
  generatedAt: '2026-07-10',
  status: 'full_source_inventory_with_modern_evidence_boundaries_blocked',
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  sourceRefs: Object.fromEntries(Object.entries(sources).map(([sourceId, source]) => [sourceId, {
    path: source.path,
    sha256: source.sha256,
  }])),
  counts,
  sourceInventory,
  sections,
  priorityLines,
  comparatorSourceIds: evidence.sources.map(source => source.id),
  findings,
  boundaries: [
    'All 836 non-empty lines and 157 Markdown table rows are preserved as blocked candidates.',
    'The raw files are secondary Skill summaries without page-level textbook citations; source preservation is not content validation.',
    'Traditional theory may be taught only with attribution and must not be translated into biomedical anatomy, etiology or causal fact.',
    'Tongue, pulse, pattern, constitution and channel tables are not validated standalone diagnostic or treatment answer keys.',
    'No drug, dose, prevention, prognosis, emergency or pediatric claim in this layer is runtime eligible.',
  ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(counts, null, 2));
