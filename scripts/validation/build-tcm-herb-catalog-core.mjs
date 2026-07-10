import { readFile, writeFile } from 'node:fs/promises';

import {
  analyzeDiseaseHerbIndexNumbering,
  collectHerbCatalogPriorityLines,
  herbCatalogSourceDomain,
  parseDiseaseHerbIndexEntries,
  parseHerbCatalogSections,
} from './lib/tcm-herb-catalog.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const PATHS = {
  ref15: 'database/tcm/skill-v3/references/15-中药总论.md',
  ref16: 'database/tcm/skill-v3/references/16-解表药.md',
  ref17: 'database/tcm/skill-v3/references/17-清热药.md',
  ref18: 'database/tcm/skill-v3/references/18-泻下祛风湿化湿利水温里药.md',
  ref19: 'database/tcm/skill-v3/references/19-理气消食驱虫止血活血药.md',
  ref20: 'database/tcm/skill-v3/references/20-化痰止咳平喘安神平肝息风开窍药.md',
  ref21: 'database/tcm/skill-v3/references/21-补虚药.md',
  ref22: 'database/tcm/skill-v3/references/22-收涩涌吐攻毒拔毒药.md',
  ref23: 'database/tcm/skill-v3/references/23-病证用药索引.md',
  evidence: 'database/tcm/sources/herb-catalog-evidence.json',
};
const OUTPUT_PATH = 'database/tcm/normalized/tcm-herb-catalog-candidates.json';

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
    sourceDomain: herbCatalogSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  })),
  tables: parseMarkdownTableInventory(sourceId, sources[sourceId].text),
}]));
const sections = referenceIds.flatMap(sourceId => (
  parseHerbCatalogSections(sourceId, sources[sourceId].text)
));
const priorityLines = referenceIds.flatMap(sourceId => (
  collectHerbCatalogPriorityLines(sourceId, sources[sourceId].text)
));
const indexEntries = parseDiseaseHerbIndexEntries(sources.ref23.text);
const claimedIndexEntries = 103;
const indexNumbering = analyzeDiseaseHerbIndexNumbering(sources.ref23.text, claimedIndexEntries);

function sourceLine(sourceId, needle) {
  const matches = sourceInventory[sourceId].lines.filter(line => line.sourceText.includes(needle));
  if (matches.length !== 1) {
    throw new Error(`Expected one ${sourceId} source line containing ${needle}, found ${matches.length}`);
  }
  return matches[0];
}

const findingSpecs = [
  ['TCM-HC-001', 'source_integrity', 'source_count_and_order_mismatch_103_claim_vs_100_entries', 'ref23', '103 条', ['SOURCE-INVENTORY-DIRECT-COUNT']],
  ['TCM-HC-002', 'poisoning_first_aid', 'unsafe_home_antidote_generalization', 'ref15', '生姜杀半夏毒、绿豆杀巴豆毒、防风杀砒霜毒', ['HRSA-POISON-HELP', 'NLM-POISON-FIRST-AID']],
  ['TCM-HC-003', 'pediatric_dosing', 'unsupported_universal_pediatric_fractional_dosing', 'ref15', '5岁以下用成人1/4', ['FDA-SUPPLEMENT-MEDICATION-CHILDREN']],
  ['TCM-HC-004', 'dose_safety', 'fixed_decoction_time_not_product_safety_authority', 'ref15', '附子、乌头等毒药先煎45~60分钟', ['NMPA-PHARMACOPOEIA-2025', 'FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-HC-005', 'poison_tolerance', 'unsafe_body_type_poison_tolerance', 'ref15', '皆**胜毒**', ['FDA-DIETARY-SUPPLEMENTS-101', 'HRSA-POISON-HELP']],
  ['TCM-HC-006', 'dose_extrapolation', 'unsupported_geography_based_dosing', 'ref16', '南方炎热量宜轻', ['FDA-DIETARY-SUPPLEMENTS-101', 'NMPA-PHARMACOPOEIA-2025']],
  ['TCM-HC-007', 'administration_efficacy', 'unsupported_intranasal_single_herb_effectiveness', 'ref16', '鼻腔给药单用有效', ['FDA-DIETARY-SUPPLEMENTS-101', 'NCCIH-TCM-OVERVIEW']],
  ['TCM-HC-008', 'modern_efficacy', 'unsupported_modern_antihypertensive_claim', 'ref16', '现代:扩血管降压', ['NCCIH-TCM-OVERVIEW', 'FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-HC-009', 'regulatory_identity', 'cancelled_qingmuxiang_standard_but_dose_and_indication_present', 'ref19', '**青木香** ⚠', ['CN-NMPA-ARISTOLOCHIC-2003-2004', 'FDA-ARISTOLOCHIC-IMPORT-54-10']],
  ['TCM-HC-010', 'regulatory_identity', 'restricted_tianxianteng_but_dose_and_indication_present', 'ref19', '| 天仙藤 |', ['CN-NMPA-ARISTOLOCHIC-2003-2004', 'FDA-ARISTOLOCHIC-IMPORT-54-10']],
  ['TCM-HC-011', 'regulatory_identity', 'cancelled_guanmutong_standard_but_dose_and_indication_present', 'ref18', '**关木通** ⚠', ['CN-NMPA-ARISTOLOCHIC-2003-2004', 'FDA-ARISTOLOCHIC-IMPORT-54-10']],
  ['TCM-HC-012', 'regulatory_identity', 'restricted_madouling_but_dose_and_indication_present', 'ref20', '**马兜铃** ⚠', ['CN-NMPA-ARISTOLOCHIC-2003-2004', 'FDA-ARISTOLOCHIC-IMPORT-54-10']],
  ['TCM-HC-013', 'pediatric_dosing', 'unsupported_per_year_pediatric_deworming_dose', 'ref19', '小儿每岁1~1.5粒', ['FDA-SUPPLEMENT-MEDICATION-CHILDREN', 'FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-HC-014', 'poisoning_first_aid', 'unsafe_home_induced_vomiting_instruction', 'ref22', '翎毛探喉', ['HRSA-POISON-HELP', 'NLM-POISON-FIRST-AID']],
  ['TCM-HC-015', 'heavy_metal_safety', 'arsenic_compound_dose_and_external_use_not_consumer_eligible', 'ref22', '内服一次 **0.002~0.004g**', ['CN-LEGAL-TOXIC-MEDICINES', 'FDA-HEAVY-METAL-HERBAL-2025']],
  ['TCM-HC-016', 'heavy_metal_safety', 'mercury_compound_oral_dose_not_consumer_eligible', 'ref20', '只入丸散0.1~0.5g', ['CN-LEGAL-TOXIC-MEDICINES', 'FDA-HEAVY-METAL-HERBAL-2025']],
  ['TCM-HC-017', 'reverse_index_safety', 'toxic_heavy_metal_reverse_lookup_not_prescribing_authority', 'ref23', '79. **脓成不溃**', ['CN-LEGAL-TOXIC-MEDICINES', 'FDA-HEAVY-METAL-HERBAL-2025']],
  ['TCM-HC-018', 'modern_efficacy', 'modern_efficacy_claim_requires_indication_specific_evidence', 'ref21', '治克山病', ['NCCIH-TCM-OVERVIEW', 'FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-HC-019', 'emergency_care', 'emergency_disease_reverse_lookup_must_not_delay_standard_care', 'ref23', '28. **破伤风**', ['CDC-TETANUS-CLINICAL-CARE', 'CDC-MALARIA-TREATMENT']],
  ['TCM-HC-020', 'reverse_index_boundary', 'full_reverse_index_not_validated_prescribing_authority', 'ref23', '辨证选药的反查表', ['FDA-DIETARY-SUPPLEMENTS-101', 'NCCIH-TCM-OVERVIEW']],
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
const priorityCategoryCounts = {
  dose: priorityLines.filter(line => line.doseTerms.length > 0).length,
  toxicity: priorityLines.filter(line => line.toxicityTerms.length > 0).length,
  heavyMetal: priorityLines.filter(line => line.heavyMetalTerms.length > 0).length,
  modernEfficacy: priorityLines.filter(line => line.modernEfficacyTerms.length > 0).length,
  vulnerablePopulation: priorityLines.filter(line => line.vulnerablePopulationTerms.length > 0).length,
  homeAction: priorityLines.filter(line => line.homeActionTerms.length > 0).length,
  externalAdministration: priorityLines.filter(line => line.externalAdministrationTerms.length > 0).length,
  reverseIndex: priorityLines.filter(line => line.reverseIndexTerms.length > 0).length,
};
const counts = {
  references: referenceIds.length,
  ...inventoryTotals,
  sections: sections.length,
  priorityLineCandidates: priorityLines.length,
  diseaseHerbIndexEntries: indexEntries.length,
  claimedDiseaseHerbIndexEntries: claimedIndexEntries,
  missingDiseaseHerbIndexNumbers: indexNumbering.missing.length,
  findings: findings.length,
};

const output = {
  schemaVersion: 1,
  domain: 'tcm_herb_catalog_candidates',
  generatedAt: '2026-07-10',
  status: 'full_source_inventory_with_high_risk_herb_boundaries_blocked',
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  sourceRefs: Object.fromEntries(Object.entries(sources).map(([sourceId, source]) => [sourceId, {
    path: source.path,
    sha256: source.sha256,
  }])),
  counts,
  priorityCategoryCounts,
  sourceInventory,
  sections,
  priorityLines,
  diseaseHerbIndex: {
    claimedCount: claimedIndexEntries,
    actualCount: indexEntries.length,
    entries: indexEntries,
    numbering: indexNumbering,
    evidenceState: 'unvalidated_reverse_lookup_not_prescribing_authority',
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  },
  comparatorSourceIds: evidence.sources.map(source => source.id),
  findings,
  boundaries: [
    'All 1,331 non-empty lines and 279 Markdown table rows are preserved as blocked candidates; preservation is not clinical validation.',
    'The 663 priority lines are a broad risk view with overlapping categories, not a complete medicine-entity catalog or a validated prescribing dataset.',
    'Reference 23 contains 100 entries despite claiming 103; numbers 52, 53 and 54 are missing, with source-order inversions 47 to 36 and 60 to 55; no content was inferred or silently reordered in the numbering audit.',
    'Every dose, route, poisoning action, pediatric rule, pregnancy rule, disease mapping and modern efficacy claim remains blocked.',
    'Cancelled or restricted aristolochic-acid medicines and arsenic, mercury or lead materials are not consumer or runtime eligible.',
    'Runtime scanning only proves this blocked core and its finding IDs are not imported; it does not clear legacy TCM semantics elsewhere.',
  ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ counts, priorityCategoryCounts }, null, 2));
