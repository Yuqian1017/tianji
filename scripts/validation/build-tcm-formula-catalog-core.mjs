import { readFile, writeFile } from 'node:fs/promises';

import {
  collectFormulaCatalogPriorityLines,
  formulaCatalogSourceDomain,
  parseFormulaCatalogSections,
  parseFormulaCountClaim,
  parseFormulaDefinitions,
  parseAttachedFormulaEntities,
} from './lib/tcm-formula-catalog.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const PATHS = {
  ref24: 'database/tcm/skill-v3/references/24-方剂总论.md',
  ref25: 'database/tcm/skill-v3/references/25-解表泻下和解剂.md',
  ref26: 'database/tcm/skill-v3/references/26-清热祛暑温里剂.md',
  ref27: 'database/tcm/skill-v3/references/27-补益固涩剂.md',
  ref28: 'database/tcm/skill-v3/references/28-安神开窍理气理血剂.md',
  ref29: 'database/tcm/skill-v3/references/29-治风治燥祛湿剂.md',
  ref30: 'database/tcm/skill-v3/references/30-祛痰消食驱虫涌吐剂.md',
  evidence: 'database/tcm/sources/formula-catalog-evidence.json',
};
const OUTPUT_PATH = 'database/tcm/normalized/tcm-formula-catalog-candidates.json';
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
    sourceDomain: formulaCatalogSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  })),
  tables: parseMarkdownTableInventory(sourceId, sources[sourceId].text),
}]));
const sections = referenceIds.flatMap(sourceId => parseFormulaCatalogSections(sourceId, sources[sourceId].text));
const formulaDefinitions = referenceIds.flatMap(sourceId => parseFormulaDefinitions(sourceId, sources[sourceId].text));
const attachedFormulaEntities = referenceIds.flatMap(sourceId => (
  parseAttachedFormulaEntities(sourceId, sources[sourceId].text)
));
const countClaims = referenceIds.flatMap(sourceId => parseFormulaCountClaim(sourceId, sources[sourceId].text) ?? []);
const priorityLines = referenceIds.flatMap(sourceId => (
  collectFormulaCatalogPriorityLines(sourceId, sources[sourceId].text)
));

const actualTextbookCounts = formulaDefinitions
  .filter(item => item.definitionType === 'textbook_primary_candidate')
  .reduce((counts, item) => ({ ...counts, [item.sourceId]: (counts[item.sourceId] ?? 0) + 1 }), {});
const missingTextbookPrimaryBySource = Object.fromEntries(countClaims.flatMap(claim => {
  const missing = claim.claimedPrimary - (actualTextbookCounts[claim.sourceId] ?? 0);
  return missing > 0 ? [[claim.sourceId, missing]] : [];
}));
const classicAnchorNames = formulaDefinitions
  .filter(item => item.definitionType === 'classic_anchor_addition')
  .map(item => item.formulaName);
const parentheticalAttributionNames = formulaDefinitions
  .filter(item => item.sourceFormat === 'parenthetical_attribution')
  .map(item => item.formulaName);
const actualAttachedBySource = attachedFormulaEntities.reduce((counts, item) => ({
  ...counts,
  [item.sourceId]: (counts[item.sourceId] ?? 0) + 1,
}), {});
const attachedGapsBySource = Object.fromEntries(countClaims.flatMap(claim => {
  const gap = claim.claimedAttached - (actualAttachedBySource[claim.sourceId] ?? 0);
  return gap > 0 ? [[claim.sourceId, gap]] : [];
}));

function sourceLine(sourceId, needle) {
  const matches = sourceInventory[sourceId].lines.filter(line => line.sourceText.includes(needle));
  if (matches.length !== 1) throw new Error(`Expected one ${sourceId} line with ${needle}, found ${matches.length}`);
  return matches[0];
}

const findingSpecs = [
  ['TCM-FC-001', 'source_format', 'four_primary_formulas_use_parenthetical_source_format', 'ref25', '**★九味羌活汤**', ['FORMULA-SOURCE-DIRECT-INVENTORY']],
  ['TCM-FC-002', 'source_identity', 'classic_anchor_additions_separate_from_claimed_textbook_primary_count', 'ref26', '**※清中汤**', ['FORMULA-SOURCE-DIRECT-INVENTORY']],
  ['TCM-FC-003', 'dose_conversion', 'unsupported_blanket_original_to_modern_gram_conversion', 'ref25', '剂量为原方折现代用量', ['NMPA-PHARMACOPOEIA-2025']],
  ['TCM-FC-004', 'dose_conversion', 'historical_unit_conversion_not_modern_dose_authority', 'ref24', '汉一两≈', ['NMPA-PHARMACOPOEIA-2025']],
  ['TCM-FC-005', 'toxicity_rule', 'unsupported_same_nature_toxicity_resonance_rule', 'ref24', '同性毒力共振', ['CN-LEGAL-TOXIC-MEDICINES', 'FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-FC-006', 'administration', 'generic_route_and_schedule_instructions_not_product_eligible', 'ref24', '汤剂日 1 剂', ['FDA-DIETARY-SUPPLEMENTS-101', 'NMPA-PHARMACOPOEIA-2025']],
  ['TCM-FC-007', 'decision_lookup', 'scenario_first_choice_tables_not_prescribing_authority', 'ref25', '| 场景 | 首选 | 眼目 |', ['FDA-DIETARY-SUPPLEMENTS-101', 'NCCIH-TCM-OVERVIEW']],
  ['TCM-FC-008', 'formula_identity', 'same_name_qingzhong_formula_identity_conflict', 'ref26', '胃痛湿热中阻所引清中汤', ['FORMULA-SOURCE-DIRECT-INVENTORY']],
  ['TCM-FC-009', 'formula_identity', 'same_name_huiyangjiuji_formula_version_conflict', 'ref26', '附:**回阳救急汤**《重订通俗伤寒论》', ['FORMULA-SOURCE-DIRECT-INVENTORY']],
  ['TCM-FC-010', 'regulatory_identity', 'cancelled_qingmuxiang_present_in_zixue_formula', 'ref28', '青木香+朴硝', ['CN-NMPA-ARISTOLOCHIC-2003-2004', 'FDA-ARISTOLOCHIC-IMPORT-54-10']],
  ['TCM-FC-011', 'regulatory_identity', 'cancelled_qingmuxiang_present_in_suhexiang_formula', 'ref28', '**★苏合香丸**', ['CN-NMPA-ARISTOLOCHIC-2003-2004', 'FDA-ARISTOLOCHIC-IMPORT-54-10']],
  ['TCM-FC-012', 'heavy_metal_safety', 'heavy_metal_formula_doses_not_consumer_eligible', 'ref28', '朱砂含硫化汞', ['CN-LEGAL-TOXIC-MEDICINES', 'FDA-HEAVY-METAL-HERBAL-2025']],
  ['TCM-FC-013', 'administration_safety', 'coma_nasogastric_instruction_not_consumer_eligible', 'ref24', '昏迷吞咽困难鼻饲', ['FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-FC-014', 'emergency_care', 'stroke_and_closed_syndrome_formulas_must_not_delay_emergency_care', 'ref29', '中风前中后皆可用', ['CDC-STROKE-SIGNS']],
  ['TCM-FC-015', 'poisoning_first_aid', 'unsafe_home_emesis_and_overdose_rescue_instructions', 'ref30', '吐不止解救', ['NLM-POISON-FIRST-AID']],
  ['TCM-FC-016', 'toxic_formula', 'high_toxicity_purgative_formula_not_self_treatment', 'ref25', '**⚠十枣汤**', ['CN-LEGAL-TOXIC-MEDICINES', 'FDA-DIETARY-SUPPLEMENTS-101']],
  ['TCM-FC-017', 'pregnancy_safety', 'pregnancy_formula_use_requires_formula_specific_clinical_authority', 'ref28', '妊娠有癥只可渐消缓散', ['FDA-DIETARY-SUPPLEMENTS-101', 'NMPA-PHARMACOPOEIA-2025']],
  ['TCM-FC-018', 'modern_efficacy', 'modern_hypertension_formula_claim_unvalidated', 'ref29', '现代高血压常用方', ['NCCIH-TCM-OVERVIEW']],
  ['TCM-FC-019', 'modern_efficacy', 'modern_cancer_and_tumor_formula_claim_unvalidated', 'ref28', '现用于肝硬化、肝脾肿大、肿瘤', ['NCCIH-TCM-OVERVIEW']],
  ['TCM-FC-020', 'emergency_care', 'emergency_bleeding_formula_not_first_aid_authority', 'ref28', '急救止血剂', ['MEDLINEPLUS-GI-BLEEDING']],
  ['TCM-FC-021', 'source_count', 'attached_formula_count_claim_exceeds_explicit_entities', 'ref25', '正方 33 首+附方 45 首', ['FORMULA-SOURCE-DIRECT-INVENTORY']],
];
const findings = findingSpecs.map(([id, kind, status, sourceId, needle, comparatorSourceIds]) => {
  for (const comparatorSourceId of comparatorSourceIds) {
    if (!evidenceIds.has(comparatorSourceId)) throw new Error(`Unknown comparator ${comparatorSourceId}`);
  }
  const source = sourceLine(sourceId, needle);
  return {
    id, kind, status, sourceId, sourceLine: source.sourceLine, sourceText: source.sourceText,
    comparatorSourceIds, productEligibility: 'blocked', runtimeEligibleFields: [],
  };
});

const inventoryTotals = Object.values(sourceInventory).reduce((totals, inventory) => ({
  sourceNonEmptyLines: totals.sourceNonEmptyLines + inventory.lines.length,
  sourceMarkdownTables: totals.sourceMarkdownTables + inventory.tables.length,
  sourceMarkdownTableRows: totals.sourceMarkdownTableRows
    + inventory.tables.reduce((count, table) => count + table.dataRows.length, 0),
}), { sourceNonEmptyLines: 0, sourceMarkdownTables: 0, sourceMarkdownTableRows: 0 });
const priorityCategoryCounts = {
  dose: priorityLines.filter(item => item.doseTerms.length).length,
  toxicity: priorityLines.filter(item => item.toxicityTerms.length).length,
  administration: priorityLines.filter(item => item.administrationTerms.length).length,
  emergency: priorityLines.filter(item => item.emergencyTerms.length).length,
  modernUse: priorityLines.filter(item => item.modernUseTerms.length).length,
  vulnerablePopulation: priorityLines.filter(item => item.vulnerablePopulationTerms.length).length,
  contraindication: priorityLines.filter(item => item.contraindicationTerms.length).length,
  poisoningAction: priorityLines.filter(item => item.poisoningActionTerms.length).length,
  formulaDefinition: priorityLines.filter(item => item.formulaDefinitionTerms.length).length,
  decisionLookup: priorityLines.filter(item => item.decisionLookupTerms.length).length,
};
const counts = {
  references: referenceIds.length,
  ...inventoryTotals,
  sections: sections.length,
  formulaDefinitions: formulaDefinitions.length,
  textbookPrimaryFormulaDefinitions: formulaDefinitions.filter(item => item.definitionType === 'textbook_primary_candidate').length,
  classicAnchorAdditions: classicAnchorNames.length,
  claimedTextbookPrimaryFormulas: countClaims.reduce((sum, item) => sum + item.claimedPrimary, 0),
  claimedAttachedFormulas: countClaims.reduce((sum, item) => sum + item.claimedAttached, 0),
  explicitAttachedFormulaEntities: attachedFormulaEntities.length,
  priorityLineCandidates: priorityLines.length,
  findings: findings.length,
};

const output = {
  schemaVersion: 1,
  domain: 'tcm_formula_catalog_candidates',
  generatedAt: '2026-07-10',
  status: 'full_source_inventory_with_formula_identity_and_safety_boundaries_blocked',
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  sourceRefs: Object.fromEntries(Object.entries(sources).map(([sourceId, source]) => [sourceId, {
    path: source.path, sha256: source.sha256,
  }])),
  counts,
  priorityCategoryCounts,
  sourceInventory,
  sections,
  formulaDefinitions,
  attachedFormulaEntities,
  countClaims,
  definitionCountFindings: {
    actualTextbookCounts,
    missingTextbookPrimaryBySource,
    classicAnchorNames,
    parentheticalAttributionNames,
  },
  attachedFormulaCountFindings: {
    actualBySource: actualAttachedBySource,
    gapsBySource: attachedGapsBySource,
  },
  priorityLines,
  comparatorSourceIds: evidence.sources.map(item => item.id),
  findings,
  boundaries: [
    'All 820 non-empty lines and 171 Markdown table rows are preserved as blocked candidates; preservation is not formula validation.',
    'All 182 claimed textbook-primary formulas are present after recognizing four parenthetical source-attribution variants; four explicitly added classic anchors remain separate, for 186 total definitions.',
    'The six source headers claim 182 attached formulas, but only 180 explicit entities are recoverable; ref25 claims 45 and explicitly identifies 43, so the two-entity gap remains blocked rather than inferred.',
    'The 522 priority lines and 151 scenario lookup rows are overlapping narrow review views, not complete clinical semantics or prescriptions.',
    'Historical quantities, blanket gram conversions, formula compositions, routes, pregnancy use and modern indications are not current dose or clinical authority.',
    'No toxic, heavy-metal, aristolochic-acid, coma, stroke, bleeding, poisoning or emesis formula content is runtime eligible.',
    'Runtime scanning only proves this blocked core and finding IDs are not imported; it does not clear legacy TCM semantics elsewhere.',
  ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ counts, priorityCategoryCounts }, null, 2));
