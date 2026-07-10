import { readFile, writeFile } from 'node:fs/promises';

import {
  FOOD_MEDICINE_BATCHES,
  FOOD_MEDICINE_DIRECTORY,
  SKILL_A_FOOD_SUBSTANCES,
  SKILL_EXPLICIT_FOOD_CLAIMS,
  adjudicateFoodMedicineName,
} from './lib/tcm-food-medicine-directory.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const GENERATED_AT = '2026-07-10';
const SOURCE_OUTPUT = 'database/tcm/sources/nhc-food-medicine-directory.json';
const CORE_OUTPUT = 'database/tcm/normalized/tcm-food-medicine-adjudications.json';
const SKILL_PATH = 'database/tcm/skill-v3/SKILL.md';

const sourcePaths = [...new Set([
  SKILL_PATH,
  ...SKILL_EXPLICIT_FOOD_CLAIMS.map(claim => claim.sourcePath),
])];
const sourceTexts = Object.fromEntries(await Promise.all(sourcePaths.map(async sourcePath => [
  sourcePath,
  await readFile(sourcePath, 'utf8'),
])));

function sourceLineAt(sourcePath, sourceLine, expectedLabel) {
  const sourceText = sourceTexts[sourcePath].split('\n')[sourceLine - 1];
  if (!sourceText?.includes(expectedLabel)) {
    throw new Error(`Expected ${sourcePath}:${sourceLine} to include ${expectedLabel}`);
  }
  return sourceText.trim();
}

const skillASourceLine = 16;
const skillASourceText = sourceLineAt(SKILL_PATH, skillASourceLine, '仅限教材注明药食兼用之品');
for (const substance of SKILL_A_FOOD_SUBSTANCES) {
  if (!skillASourceText.includes(substance)) {
    throw new Error(`Skill A-level source line no longer contains ${substance}`);
  }
}

const directorySource = {
  schemaVersion: 1,
  domain: 'nhc_food_medicine_directory',
  generatedAt: GENERATED_AT,
  status: 'official_directory_transcription_with_bounded_fields',
  currentCount: FOOD_MEDICINE_DIRECTORY.length,
  sources: [
    {
      id: 'CN-NHC-FOOD-MEDICINE-RULE-2021',
      url: 'https://www.nhc.gov.cn/wjw/c100175/202111/aac61b41730f4062bee4eefcf51933f4.shtml',
      role: 'current_directory_management_rule',
      facts: ['Directory membership requires traditional food use, Pharmacopoeia listing, safety review, and official publication.', 'Food labels and marketing may not claim disease prevention or treatment.'],
    },
    ...Object.entries(FOOD_MEDICINE_BATCHES).map(([id, batch]) => ({ id, ...batch, role: 'official_directory_batch' })),
    {
      id: 'nhc-2023-9-interpretation',
      url: 'https://www.nhc.gov.cn/sps/c100088/202311/a7e49f9f0285437b82b842576fa8ede9.shtml',
      role: 'official_item_identity_part_and_restriction_interpretation',
    },
    {
      id: 'nhc-2024-4-interpretation',
      url: 'http://www.nhc.gov.cn/sps/c100087/202408/aa9a6f7bce8e4b4cbcc4b38591676ed6.shtml',
      role: 'official_item_identity_part_and_restriction_interpretation',
    },
    {
      id: 'CN-NHC-FOOD-MEDICINE-106-2025',
      url: 'https://www.nhc.gov.cn/wjw/jiany/202508/6141c788fa794723afb4e71af48b3d93.shtml',
      role: 'current_count_confirmation',
      facts: ['NHC states that the current directory contains 106 substances and is dynamically managed.'],
    },
  ],
  counts: {
    total: FOOD_MEDICINE_DIRECTORY.length,
    byBatch: Object.fromEntries(Object.keys(FOOD_MEDICINE_BATCHES).map(batchId => [
      batchId,
      FOOD_MEDICINE_DIRECTORY.filter(item => item.batchId === batchId).length,
    ])),
  },
  items: FOOD_MEDICINE_DIRECTORY,
  boundaries: [
    'The 2002 source is a grouped name list and does not itself fix Latin identity, edible part, processing form, serving amount, population, or therapeutic use for each of its 87 entries.',
    'The 2019 additions are limited to spice and condiment use; membership does not authorize therapeutic recipes.',
    'The 2023 and 2024 additions carry batch-level special-population restrictions, plus item-specific restrictions where stated.',
    'Directory membership is an ingredient identity and food-law fact, not proof of disease efficacy, a medicinal dose, or formula safety.',
  ],
};

const skillAAdjudications = SKILL_A_FOOD_SUBSTANCES.map(adjudicateFoodMedicineName);
const explicitClaims = SKILL_EXPLICIT_FOOD_CLAIMS.map(claim => ({
  ...claim,
  sourceText: sourceLineAt(claim.sourcePath, claim.sourceLine, claim.sourceLabel),
  sourceSha256: sha256(sourceTexts[claim.sourcePath]),
}));
const allClaimIngredients = explicitClaims.flatMap(claim => claim.ingredients);

const normalized = {
  schemaVersion: 1,
  domain: 'tcm_food_medicine_adjudications',
  generatedAt: GENERATED_AT,
  status: 'current_directory_identity_and_skill_claims_adjudicated_all_product_blocked',
  directorySource: SOURCE_OUTPUT,
  sourceRefs: Object.fromEntries(sourcePaths.map(sourcePath => [sourcePath, {
    sha256: sha256(sourceTexts[sourcePath]),
  }])),
  counts: {
    directoryEntries: FOOD_MEDICINE_DIRECTORY.length,
    skillAFoodSubstances: skillAAdjudications.length,
    skillAMatchedCurrentDirectory: skillAAdjudications.filter(item => item.matchStatus === 'matched_current_directory').length,
    skillANotInCurrentDirectory: skillAAdjudications.filter(item => item.matchStatus === 'not_in_current_directory').length,
    explicitFoodClaims: explicitClaims.length,
    explicitClaimIngredients: allClaimIngredients.length,
    claimIngredientsMatchedCurrentDirectory: allClaimIngredients.filter(item => item.matchStatus === 'matched_current_directory').length,
    claimIngredientIdentityOrProcessGaps: allClaimIngredients.filter(item => item.matchStatus === 'identity_or_process_variant_unadjudicated').length,
    claimIngredientsNotInCurrentDirectory: allClaimIngredients.filter(item => item.matchStatus === 'not_in_current_directory').length,
  },
  skillAList: {
    sourcePath: SKILL_PATH,
    sourceLine: skillASourceLine,
    sourceText: skillASourceText,
    adjudications: skillAAdjudications,
    finding: 'The source label “教材注明药食兼用” is not an official current-directory adjudication. Green bean and walnut kernel are not current directory entries; that does not deny ordinary-food status.',
    productEligibility: 'blocked_pending_use_specific_review',
    runtimeEligibleFields: [],
  },
  explicitClaims,
  findings: [
    {
      id: 'TCM-FM-001',
      status: 'source_scope_overstated_blocked',
      observation: 'Skill A-level wording treats 15 listed foods as “药食兼用”; 13 map to current directory and two do not.',
      affected: skillAAdjudications.filter(item => item.matchStatus !== 'matched_current_directory'),
    },
    {
      id: 'TCM-FM-002',
      status: 'spice_only_scope_blocked',
      observation: 'The 2019 directory addition for 当归 is spice-and-condiment-only and cannot authorize 当归生姜羊肉汤 as a therapeutic food formula.',
      affectedClaimIds: ['TCM-FOOD-CLAIM-003'],
    },
    {
      id: 'TCM-FM-003',
      status: 'formula_inheritance_blocked',
      observation: 'Ingredient membership does not transfer to formula, processing form, medicinal dose, disease indication, pediatric use, or external route.',
      affectedClaimIds: explicitClaims.map(claim => claim.id),
    },
    {
      id: 'TCM-FM-004',
      status: 'overbroad_recipe_group_blocked',
      observation: 'The claim that the diarrhea recipe group is almost entirely medicine-food contains non-directory substances and unadjudicated processed parts.',
      affectedClaimIds: ['TCM-FOOD-CLAIM-006'],
    },
  ].map(finding => ({ ...finding, productEligibility: 'blocked', runtimeEligibleFields: [] })),
  productEligibility: 'blocked',
  runtimeEligibleFields: [],
  boundaries: [
    'Current directory membership is preserved separately from ordinary-food status; not-in-directory is not a finding of non-food or unsafe status.',
    'All aliases and processing forms are fail-closed unless the official item identity or announcement explicitly supports them.',
    'No recipe, medicinal dose, treatment claim, pediatric use, eye application, or disease self-treatment becomes eligible through one or more directory ingredients.',
    'This slice adjudicates the Skill A-level list and every explicit 药食同源/药食两用/食疗级 recipe claim; it does not validate general nutrition advice or every implicit food mention.',
  ],
};

await writeFile(SOURCE_OUTPUT, `${JSON.stringify(directorySource, null, 2)}\n`);
await writeFile(CORE_OUTPUT, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(JSON.stringify({ source: directorySource.counts, normalized: normalized.counts }, null, 2));
