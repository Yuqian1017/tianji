import { readFile, writeFile } from 'node:fs/promises';

import {
  collectDiseaseActionableLines,
  collectDiseaseRiskLines,
  parseDiseaseReference,
} from './lib/tcm-disease-red-flags.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const PATHS = {
  ref31: 'database/tcm/skill-v3/references/31-内科-肺系病证.md',
  ref32: 'database/tcm/skill-v3/references/32-内科-心系病证.md',
  ref33: 'database/tcm/skill-v3/references/33-内科-脾胃系病证.md',
  ref34: 'database/tcm/skill-v3/references/34-内科-肝胆病证.md',
  ref35: 'database/tcm/skill-v3/references/35-内科-肾系病证.md',
  ref36: 'database/tcm/skill-v3/references/36-内科-气血津液病证.md',
  ref37: 'database/tcm/skill-v3/references/37-内科-肢体经络病证.md',
  evidence: 'database/tcm/sources/disease-red-flag-evidence.json',
};
const OUTPUT_PATH = 'database/tcm/normalized/tcm-disease-red-flag-candidates.json';

const entries = await Promise.all(Object.entries(PATHS).map(async ([sourceId, filePath]) => {
  const text = await readFile(filePath, 'utf8');
  return [sourceId, { path: filePath, text, sha256: sha256(text) }];
}));
const sources = Object.fromEntries(entries);
const referenceIds = Object.keys(PATHS).filter(sourceId => sourceId.startsWith('ref'));
const evidence = JSON.parse(sources.evidence.text);
const evidenceIds = new Set(evidence.sources.map(source => source.id));

const references = referenceIds.map(sourceId => parseDiseaseReference(sourceId, sources[sourceId].text));
const keywordRiskLines = referenceIds
  .flatMap(sourceId => collectDiseaseRiskLines(sourceId, sources[sourceId].text));
const actionableLines = referenceIds
  .flatMap(sourceId => collectDiseaseActionableLines(sourceId, sources[sourceId].text));
const sourceInventory = Object.fromEntries(referenceIds.map(sourceId => [sourceId, {
  lines: parseSourceLineInventory(sourceId, sources[sourceId].text),
  tables: parseMarkdownTableInventory(sourceId, sources[sourceId].text),
}]));

function sourceLine(sourceId, needle) {
  const matches = sourceInventory[sourceId].lines.filter(line => line.sourceText.includes(needle));
  if (matches.length !== 1) {
    throw new Error(`Expected one ${sourceId} source line containing ${needle}, found ${matches.length}`);
  }
  return matches[0];
}

const findingSpecs = [
  ['TCM-DIS-001', 'conflict', 'conflict_do_not_induce_vomiting', 'ref33', '食物中毒→催吐/洗胃并就医', ['HRSA-POISON-HELP', 'MEDLINEPLUS-POISON-FIRST-AID']],
  ['TCM-DIS-002', 'conflict', 'conflict_emergency_retention_home_methods', 'ref35', '取嚏法', ['NIDDK-URINARY-RETENTION']],
  ['TCM-DIS-003', 'conflict', 'conflict_poisoning_home_antidote', 'ref37', '绿豆甘草汤频饮', ['HRSA-POISON-HELP', 'MEDLINEPLUS-POISON-FIRST-AID']],
  ['TCM-DIS-004', 'conflict', 'unsupported_universal_tcm_rescue_pill', 'ref32', '即刻含化苏合香丸', ['AHA-HEART-ATTACK-WARNING', 'AHA-RED-CROSS-FIRST-AID-2024']],
  ['TCM-DIS-005', 'conflict', 'conflict_oral_intake_after_syncope', 'ref32', '灌服温糖水', ['RED-CROSS-FAINTING']],
  ['TCM-DIS-006', 'conflict', 'unsupported_three_year_stroke_prediction', 'ref34', '三年内有中风之患', ['CDC-STROKE-SIGNS']],
  ['TCM-DIS-007', 'supported_red_flag', 'supported_seizure_first_aid', 'ref32', '发作期现场处置', ['CDC-SEIZURE-FIRST-AID']],
  ['TCM-DIS-008', 'supported_red_flag', 'supported_stroke_emergency', 'ref34', '红线之首:突然口眼歪斜', ['CDC-STROKE-SIGNS']],
  ['TCM-DIS-009', 'supported_red_flag', 'supported_heart_attack_emergency', 'ref32', '附·真心痛', ['AHA-HEART-ATTACK-WARNING']],
  ['TCM-DIS-010', 'supported_red_flag', 'supported_acute_urinary_retention_emergency', 'ref35', '先判断有无尿潴留', ['NIDDK-URINARY-RETENTION']],
  ['TCM-DIS-011', 'supported_red_flag', 'supported_gi_bleeding_emergency', 'ref33', '危重变证(红线)', ['MEDLINEPLUS-GI-BLEEDING']],
  ['TCM-DIS-012', 'mixed_boundary', 'supported_professional_help_but_immediate_danger_escalation_missing', 'ref36', '消极自杀念头', ['WHO-SUICIDE']],
  ['TCM-DIS-013', 'supported_red_flag', 'supported_severe_asthma_escalation', 'ref31', '危重指征(升级就医)', ['NHLBI-ASTHMA-ATTACK']],
  ['TCM-DIS-014', 'conflict', 'conflict_do_not_induce_vomiting', 'ref33', '误吞毒物当探吐', ['HRSA-POISON-HELP', 'MEDLINEPLUS-POISON-FIRST-AID']],
  ['TCM-DIS-015', 'supported_red_flag', 'supported_acute_abdomen_surgical_emergency', 'ref33', '外科急腹症', ['MEDLINEPLUS-ABDOMINAL-PAIN']],
  ['TCM-DIS-016', 'supported_red_flag', 'supported_severe_acute_abdomen_emergency', 'ref33', '腹痛剧烈、拒按', ['MEDLINEPLUS-ABDOMINAL-PAIN']],
  ['TCM-DIS-017', 'conflict', 'unsupported_emergency_gi_bleed_dose', 'ref36', '大黄为上消化道出血首选', ['MEDLINEPLUS-GI-BLEEDING']],
  ['TCM-DIS-018', 'mixed_boundary', 'mixed_convulsion_first_aid_mouth_action_blocked', 'ref37', '保持呼吸道通畅、清除假牙异物', ['CDC-SEIZURE-FIRST-AID']],
  ['TCM-DIS-019', 'conflict', 'unsupported_acute_abdomen_formula_substitution', 'ref33', '胆囊炎样痛用大柴胡汤', ['MEDLINEPLUS-ABDOMINAL-PAIN']],
  ['TCM-DIS-020', 'supported_red_flag', 'supported_urgent_cardiopulmonary_escalation', 'ref32', '中老年心悸频发伴心胸疼痛', ['AHA-HEART-ATTACK-WARNING']],
];

const findings = findingSpecs.map(([id, kind, status, sourceId, needle, comparatorSourceIds]) => {
  for (const comparatorSourceId of comparatorSourceIds) {
    if (!evidenceIds.has(comparatorSourceId)) throw new Error(`Unknown comparator source ${comparatorSourceId}`);
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
  diseaseSections: references.flatMap(reference => reference.sections).length,
  ...inventoryTotals,
  keywordRiskLineCandidates: keywordRiskLines.length,
  actionableLineCandidates: actionableLines.length,
  conflictFindings: findings.filter(finding => finding.kind === 'conflict').length,
  supportedRedFlagFindings: findings.filter(finding => finding.kind === 'supported_red_flag').length,
  mixedBoundaryFindings: findings.filter(finding => finding.kind === 'mixed_boundary').length,
};

const output = {
  schemaVersion: 1,
  domain: 'tcm_disease_red_flag_and_home_action_candidates',
  generatedAt: '2026-07-10',
  status: 'normalized_candidate_full_source_inventory_blocked',
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  sourceRefs: Object.fromEntries(Object.entries(sources).map(([sourceId, source]) => [sourceId, {
    path: source.path,
    sha256: source.sha256,
  }])),
  counts,
  references,
  sourceInventory,
  keywordRiskLines,
  actionableLines,
  comparatorSourceIds: evidence.sources.map(source => source.id),
  findings,
  boundaries: [
    'All 52 disease sections and every non-empty source line remain blocked candidates.',
    'The 83 keyword-risk lines and 308 broad actionable lines are prioritization subsets, not complete clinical-semantic validation.',
    'Supported emergency recognition does not validate adjacent pattern differentiation, formulas, doses, tests or treatment instructions.',
    'Conflict findings block the source home action; they do not replace individualized emergency-dispatch or clinician instructions.',
    'Emergency numbers, poison services and medicine rules require locale-specific product handling.',
    'Traditional mechanisms, pattern differentiation and treatments require separate source and efficacy review.',
  ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(counts, null, 2));
