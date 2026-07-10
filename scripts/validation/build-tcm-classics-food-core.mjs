import { readFile, writeFile } from 'node:fs/promises';

import {
  classicsFoodSourceDomain,
  collectClassicsFoodPriorityLines,
  parseClassicsFoodSections,
} from './lib/tcm-classics-food.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const PATHS = {
  ref42: 'database/tcm/skill-v3/references/42-经典-素问要义.md',
  ref43: 'database/tcm/skill-v3/references/43-经典-灵枢与难经要义.md',
  ref44: 'database/tcm/skill-v3/references/44-经典-伤寒论六经方证条文.md',
  ref45: 'database/tcm/skill-v3/references/45-经典-金匮要略杂病方证条文.md',
  ref46: 'database/tcm/skill-v3/references/46-医家-医学心悟要义.md',
  ref47: 'database/tcm/skill-v3/references/47-温病-卫气营血三焦方证条文.md',
  ref48: 'database/tcm/skill-v3/references/48-医家-衷中参西录要义.md',
  evidence: 'database/tcm/sources/classics-food-evidence.json',
  runtimeTcmData: 'src/lib/tcm-data.js',
  runtimeBaziData: 'src/modules/bazihealth/data.js',
  runtimeBaziEngine: 'src/modules/bazihealth/engine.js',
  runtimeBaziModule: 'src/modules/bazihealth/BaziHealthModule.jsx',
};
const OUTPUT_PATH = 'database/tcm/normalized/tcm-classics-food-candidates.json';
const sources = Object.fromEntries(await Promise.all(Object.entries(PATHS).map(async ([sourceId, filePath]) => {
  const text = await readFile(filePath, 'utf8');
  return [sourceId, { path: filePath, text, sha256: sha256(text) }];
})));
const referenceIds = Object.keys(PATHS).filter(sourceId => sourceId.startsWith('ref'));
const evidence = JSON.parse(sources.evidence.text);
const evidenceIds = new Set(evidence.sources.map(source => source.id));

const sourceInventory = Object.fromEntries(referenceIds.map(sourceId => [sourceId, {
  evidenceState: 'secondary_classic_or_physician_summary_without_page_level_primary_source',
  lines: parseSourceLineInventory(sourceId, sources[sourceId].text).map(line => ({
    ...line,
    sourceDomain: classicsFoodSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  })),
  tables: parseMarkdownTableInventory(sourceId, sources[sourceId].text),
}]));
const sections = referenceIds.flatMap(sourceId => parseClassicsFoodSections(sourceId, sources[sourceId].text));
const priorityLines = referenceIds.flatMap(sourceId => collectClassicsFoodPriorityLines(sourceId, sources[sourceId].text));
const allSourceLines = Object.fromEntries(Object.entries(sources).map(([sourceId, source]) => [
  sourceId,
  parseSourceLineInventory(sourceId, source.text),
]));

function sourceLine(sourceId, needle) {
  const matches = allSourceLines[sourceId].filter(line => line.sourceText.includes(needle));
  if (matches.length !== 1) throw new Error(`Expected one ${sourceId} line with ${needle}, found ${matches.length}`);
  return matches[0];
}

const findingSpecs = [
  ['TCM-CF-001', 'source_grade', 'classic_food_grade_not_product_authority', 'ref42', '能食养不用药', ['CN-NHC-FOOD-MEDICINE-RULE-2021', 'WHO-HEALTHY-DIET']],
  ['TCM-CF-002', 'disease_food_mapping', 'five_organ_food_mapping_not_modern_nutrition', 'ref43', '五脏病所宜', ['WHO-HEALTHY-DIET']],
  ['TCM-CF-003', 'source_grade', 'author_grade_a_not_independent_safety_grade', 'ref46', 'A 级养生说理直接可用', ['WHO-HEALTHY-DIET']],
  ['TCM-CF-004', 'source_grade', 'warm_disease_grade_a_food_therapy_not_adjudicated', 'ref47', 'A 级食疗性质', ['CN-NHC-FOOD-MEDICINE-RULE-2021']],
  ['TCM-CF-005', 'food_identity', 'medicine_food_label_not_current_directory_adjudication', 'ref48', '药食两用之品', ['CN-NHC-FOOD-MEDICINE-106-2025']],
  ['TCM-CF-006', 'dose_and_disease', 'high_dose_yam_tea_disease_claim_blocked', 'ref48', '生怀山药四两煮汁当茶', ['CN-NHC-HEALTH-LITERACY-2024', 'NCCIH-SUPPLEMENT-SAFETY']],
  ['TCM-CF-007', 'efficacy', 'cooked_yam_zero_effect_claim_unsupported', 'ref48', '若用炒熟山药则分毫无效', ['FDA-DIETARY-SUPPLEMENT-DISEASE-CLAIMS']],
  ['TCM-CF-008', 'pediatric', 'pediatric_diarrhea_first_formula_claim_blocked', 'ref48', '小儿秋夏滑泻', ['CN-NHC-HEALTH-LITERACY-2024']],
  ['TCM-CF-009', 'dose', 'goji_one_liang_bedtime_dose_not_food_guidance', 'ref48', '睡前嚼服一两', ['NCCIH-SUPPLEMENT-SAFETY', 'WHO-HEALTHY-DIET']],
  ['TCM-CF-010', 'efficacy', 'pomegranate_three_month_lung_claim_blocked', 'ref48', '每晚食之三月愈案', ['CDC-TB-TREATMENT', 'FDA-DIETARY-SUPPLEMENT-DISEASE-CLAIMS']],
  ['TCM-CF-011', 'eye_emergency', 'eye_disease_dandelion_self_treatment_blocked', 'ref48', '今凡目赤剧痛/视力骤降', ['CN-NHC-HEALTH-LITERACY-2024']],
  ['TCM-CF-012', 'mass_emergency', 'neck_mass_kelp_and_oyster_cure_claim_blocked', 'ref48', '日日煮海带汤', ['NCI-CANCER-TREATMENT']],
  ['TCM-CF-013', 'infectious_emergency', 'cholera_food_and_ice_rescue_blocked', 'ref48', '霍乱今为法定检疫传染病', ['CN-NHC-HEALTH-LITERACY-2024']],
  ['TCM-CF-014', 'poisoning', 'arsenic_antidote_and_emesis_recipe_blocked', 'ref48', '解砒石毒方', ['NLM-POISON-FIRST-AID']],
  ['TCM-CF-015', 'heavy_metal', 'lead_formula_explicitly_prohibited', 'ref48', '铅制剂绝对禁服', ['NCCIH-SUPPLEMENT-SAFETY']],
  ['TCM-CF-016', 'infectious_disease', 'tuberculosis_food_or_herb_substitution_blocked', 'ref48', '今结核必抗痨规范治疗', ['CDC-TB-TREATMENT']],
  ['TCM-CF-017', 'cancer', 'gastric_cancer_food_or_formula_substitution_blocked', 'ref48', '今胃癌必内镜确诊', ['NCI-CANCER-TREATMENT']],
  ['TCM-CF-018', 'disease_recipe', 'pear_and_five_juice_disease_recipe_not_general_food_advice', 'ref47', '口渴甚**雪梨浆**', ['WHO-HEALTHY-DIET', 'CN-NHC-HEALTH-LITERACY-2024']],
  ['TCM-CF-019', 'runtime_legacy', 'legacy_wuxing_food_tables_unconsumed_but_unvalidated', 'runtimeTcmData', 'export const WUXING_FOOD_THERAPY', ['WHO-HEALTHY-DIET']],
  ['TCM-CF-020', 'runtime_block', 'bazi_health_food_inference_runtime_blocked', 'runtimeBaziData', "nurture: { foods: ['枸杞'", ['WHO-HEALTHY-DIET', 'CN-NHC-HEALTH-LITERACY-2024']],
];
const findings = findingSpecs.map(([id, kind, status, sourceId, needle, comparatorSourceIds]) => {
  for (const comparatorSourceId of comparatorSourceIds) {
    if (!evidenceIds.has(comparatorSourceId)) throw new Error(`Unknown comparator ${comparatorSourceId}`);
  }
  const source = sourceLine(sourceId, needle);
  return {
    id, kind, status, sourceId, sourceLine: source.sourceLine, sourceText: source.sourceText,
    comparatorSourceIds, foodEligibility: 'not_adjudicated', productEligibility: 'blocked', runtimeEligibleFields: [],
  };
});

const runtimeConsumerPaths = await tcmRuntimeConsumerPaths();
const runtimeTexts = Object.fromEntries(await Promise.all(runtimeConsumerPaths.map(async filePath => [
  filePath,
  await readFile(filePath, 'utf8'),
])));
const tcmDataImporters = Object.entries(runtimeTexts)
  .filter(([filePath, text]) => filePath !== PATHS.runtimeTcmData && /tcm-data(?:\.js)?/.test(text))
  .map(([filePath]) => filePath);
const runtimeLegacy = {
  tcmData: {
    path: PATHS.runtimeTcmData,
    status: tcmDataImporters.length === 0 ? 'legacy_unconsumed' : 'runtime_consumed',
    importers: tcmDataImporters,
    productEligibility: 'blocked',
  },
  baziHealth: {
    dataPath: PATHS.runtimeBaziData,
    enginePath: PATHS.runtimeBaziEngine,
    modulePath: PATHS.runtimeBaziModule,
    status: sources.runtimeBaziEngine.text.includes("status: 'blocked'")
      && sources.runtimeBaziModule.text.includes('disabled')
      && sources.runtimeBaziEngine.text.includes('return []')
      ? 'runtime_blocked'
      : 'runtime_status_unverified',
    productEligibility: 'blocked',
  },
};

const inventoryTotals = Object.values(sourceInventory).reduce((totals, inventory) => ({
  sourceNonEmptyLines: totals.sourceNonEmptyLines + inventory.lines.length,
  sourceMarkdownTables: totals.sourceMarkdownTables + inventory.tables.length,
  sourceMarkdownTableRows: totals.sourceMarkdownTableRows
    + inventory.tables.reduce((count, table) => count + table.dataRows.length, 0),
}), { sourceNonEmptyLines: 0, sourceMarkdownTables: 0, sourceMarkdownTableRows: 0 });
const priorityCategoryCounts = {
  foodTherapy: priorityLines.filter(item => item.foodTherapyTerms.length).length,
  diseaseFoodMapping: priorityLines.filter(item => item.diseaseFoodMappingTerms.length).length,
  dose: priorityLines.filter(item => item.doseTerms.length).length,
  toxicity: priorityLines.filter(item => item.toxicityTerms.length).length,
  contraindication: priorityLines.filter(item => item.contraindicationTerms.length).length,
  emergency: priorityLines.filter(item => item.emergencyTerms.length).length,
  modernDisease: priorityLines.filter(item => item.modernDiseaseTerms.length).length,
  vulnerablePopulation: priorityLines.filter(item => item.vulnerablePopulationTerms.length).length,
  homeAction: priorityLines.filter(item => item.homeActionTerms.length).length,
  sourceGrade: priorityLines.filter(item => item.sourceGradeTerms.length).length,
};
const counts = {
  references: referenceIds.length,
  ...inventoryTotals,
  sections: sections.length,
  priorityLineCandidates: priorityLines.length,
  findings: findings.length,
};

const output = {
  schemaVersion: 1,
  domain: 'tcm_classics_food_candidates',
  generatedAt: '2026-07-10',
  status: 'full_remaining_reference_inventory_with_food_and_medical_boundaries_blocked',
  foodEligibility: 'not_adjudicated',
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  sourceRefs: Object.fromEntries(Object.entries(sources).map(([sourceId, source]) => [sourceId, {
    path: source.path, sha256: source.sha256,
  }])),
  counts,
  priorityCategoryCounts,
  sourceInventory,
  sections,
  priorityLines,
  runtimeLegacy,
  comparatorSourceIds: evidence.sources.map(item => item.id),
  findings,
  boundaries: [
    'All 1,142 non-empty source lines and 79 Markdown table rows are preserved as blocked candidates; preservation is not historical-text, food, dose or clinical validation.',
    'The 603 overlapping priority lines are narrow review views, not complete clinical semantics or a food-recipe entity catalog.',
    'A/B grades and food-therapy or medicine-food labels are source assertions only; current 106-item directory identity, edible part, processing, limits and population scope remain unadjudicated.',
    'No dose, disease mapping, pediatric or pregnancy use, poisoning action, emergency substitution, cancer/TB claim, self-treatment or home procedure is runtime eligible.',
    'Legacy tcm-data food tables remain in source but have no importer; BaZi health food data remains imported only behind a hard runtime block.',
  ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ counts, priorityCategoryCounts, runtimeLegacy }, null, 2));
