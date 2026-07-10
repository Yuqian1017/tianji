const BATCHES = {
  'nhc-2002-51': {
    year: 2002,
    notice: '卫法监发〔2002〕51号',
    url: 'https://www.nhc.gov.cn/wjw/gfxwj/200203/5e9768a72af64db89acb45fe30a810af.shtml',
    fieldSourceIds: ['nhc-2002-51'],
  },
  'nhc-2019-8': {
    year: 2019,
    notice: '2019年第8号',
    url: 'https://zwfw.nhc.gov.cn/kzx/tzgg/qt_235/202001/t20200106_1452.html',
    fieldSourceIds: ['nhc-2019-8'],
  },
  'nhc-2023-9': {
    year: 2023,
    notice: '2023年第9号',
    url: 'https://www.nhc.gov.cn/sps/c100088/202311/5b062dd13fe646198b56c7d76a99aab4.shtml',
    fieldSourceIds: ['nhc-2023-9', 'nhc-2023-9-interpretation'],
  },
  'nhc-2024-4': {
    year: 2024,
    notice: '2024年第4号',
    url: 'https://www.nhc.gov.cn/sps/c100088/202408/53150d0918ec40899b5293147ec0dd01.shtml',
    fieldSourceIds: ['nhc-2024-4', 'nhc-2024-4-interpretation'],
  },
};

const LEGACY_NAMES = [
  '丁香', '八角茴香', '刀豆', '小茴香', '小蓟', '山药', '山楂', '马齿苋', '乌梢蛇',
  '乌梅', '木瓜', '火麻仁', '代代花', '玉竹', '甘草', '白芷', '白果', '白扁豆',
  '白扁豆花', '龙眼肉', '决明子', '百合', '肉豆蔻', '肉桂', '余甘子', '佛手',
  '杏仁', '沙棘', '牡蛎', '芡实', '花椒', '赤小豆', '阿胶', '鸡内金', '麦芽',
  '昆布', '枣', '罗汉果', '郁李仁', '金银花', '青果', '鱼腥草', '姜', '枳椇子',
  '枸杞子', '栀子', '砂仁', '胖大海', '茯苓', '香橼', '香薷', '桃仁', '桑叶',
  '桑椹', '桔红', '桔梗', '益智仁', '荷叶', '莱菔子', '莲子', '高良姜', '淡竹叶',
  '淡豆豉', '菊花', '菊苣', '黄芥子', '黄精', '紫苏', '紫苏籽', '葛根', '黑芝麻',
  '黑胡椒', '槐米', '槐花', '蒲公英', '蜂蜜', '榧子', '酸枣仁', '鲜白茅根',
  '鲜芦根', '蝮蛇', '橘皮', '薄荷', '薏苡仁', '薤白', '覆盆子', '藿香',
];

if (LEGACY_NAMES.length !== 87) {
  throw new Error(`Expected 87 legacy food-medicine entries, received ${LEGACY_NAMES.length}`);
}

const LEGACY_ALIASES = {
  龙眼肉: ['桂圆'],
  杏仁: ['甜杏仁', '苦杏仁'],
  枣: ['大枣', '酸枣', '黑枣'],
  姜: ['生姜', '干姜'],
  金银花: ['银花', '鲜银花'],
  枸杞子: ['枸杞'],
  桑椹: ['桑葚'],
  薏苡仁: ['薏仁'],
  鲜白茅根: ['鲜茅根'],
  鲜芦根: ['鲜苇根'],
  蒲公英: ['鲜蒲公英'],
};

const ADDITIONS_2019 = [
  ['当归', '根', 'Angelica sinensis (Oliv.) Diels'],
  ['山柰', '根茎', 'Kaempferia galanga L.'],
  ['西红花', '柱头', 'Crocus sativus L.', ['藏红花']],
  ['草果', '果实', 'Amomum tsao-ko Crevost et Lemaire'],
  ['姜黄', '根茎', 'Curcuma longa L.'],
  ['荜茇', '果穗', 'Piper longum L.'],
];

const BATCH_2023_POPULATION = '孕妇、哺乳期妇女及婴幼儿等特殊人群不推荐食用';
const ADDITIONS_2023 = [
  ['党参', '干燥根', 'Codonopsis pilosula / C. pilosula var. modesta / C. tangshen', [], '不宜与藜芦同用'],
  ['肉苁蓉（荒漠）', '干燥带鳞叶的肉质茎', 'Cistanche deserticola Y.C. Ma'],
  ['铁皮石斛', '干燥茎', 'Dendrobium officinale Kimura et Migo'],
  ['西洋参', '干燥根', 'Panax quinquefolium L.', [], '不宜与藜芦同用'],
  ['黄芪', '干燥根', 'Astragalus membranaceus var. mongholicus / A. membranaceus'],
  ['灵芝', '干燥子实体', 'Ganoderma lucidum / Ganoderma sinense'],
  ['山茱萸', '干燥成熟果肉', 'Cornus officinalis Sieb. et Zucc.'],
  ['天麻', '干燥块茎', 'Gastrodia elata Bl.', [], '过敏体质人群不宜食用'],
  ['杜仲叶', '干燥叶', 'Eucommia ulmoides Oliv.'],
];

const BATCH_2024_POPULATION = '孕妇、哺乳期妇女及婴幼儿等特殊人群不推荐食用';
const ADDITIONS_2024 = [
  ['地黄', '新鲜或干燥块根', 'Rehmannia glutinosa Libosch.', ['熟地黄'], '熟地黄仅限由地黄按传统加工方式制成'],
  ['麦冬', '干燥块根', 'Ophiopogon japonicus (L.f.) Ker-Gawl.'],
  ['天冬', '干燥块根', 'Asparagus cochinchinensis (Lour.) Merr.'],
  ['化橘红', '未成熟或近成熟果实的干燥外层果皮', 'Citrus grandis “Tomentosa” / Citrus grandis'],
];

function directoryItem({
  name,
  batchId,
  index,
  part = null,
  latinName = null,
  aliases = [],
  foodUseScope = 'traditional_food_use_subject_to_item_identity_and_applicable_rules',
  populationRestriction = null,
  batchPopulationRestriction = null,
  specificRestriction = null,
}) {
  return Object.freeze({
    id: `nhc-food-medicine-${String(index).padStart(3, '0')}`,
    name,
    aliases: Object.freeze([...aliases]),
    batchId,
    batch: BATCHES[batchId],
    fieldSourceIds: Object.freeze([...BATCHES[batchId].fieldSourceIds]),
    part,
    latinName,
    foodUseScope,
    populationRestriction,
    batchPopulationRestriction,
    specificRestriction,
    directoryMembership: 'official_current_directory',
    productEligibility: 'blocked_pending_use_specific_review',
    runtimeEligibleFields: Object.freeze([]),
  });
}

let index = 0;
const legacy = LEGACY_NAMES.map(name => directoryItem({
  name,
  batchId: 'nhc-2002-51',
  index: ++index,
  aliases: LEGACY_ALIASES[name] ?? [],
  foodUseScope: 'legacy_directory_name_only_part_and_processing_not_fixed_by_2002_list',
}));
const additions2019 = ADDITIONS_2019.map(([name, part, latinName, aliases = []]) => directoryItem({
  name,
  batchId: 'nhc-2019-8',
  index: ++index,
  part,
  latinName,
  aliases,
  foodUseScope: 'spice_and_condiment_only',
}));
const additions2023 = ADDITIONS_2023.map(([name, part, latinName, aliases = [], specificRestriction = null]) => directoryItem({
  name,
  batchId: 'nhc-2023-9',
  index: ++index,
  part,
  latinName,
  aliases,
  batchPopulationRestriction: BATCH_2023_POPULATION,
  populationRestriction: name === '天麻' ? specificRestriction : null,
  specificRestriction: name === '天麻' ? null : specificRestriction,
}));
const additions2024 = ADDITIONS_2024.map(([name, part, latinName, aliases = [], specificRestriction = null]) => directoryItem({
  name,
  batchId: 'nhc-2024-4',
  index: ++index,
  part,
  latinName,
  aliases,
  batchPopulationRestriction: BATCH_2024_POPULATION,
  specificRestriction,
}));

export const FOOD_MEDICINE_DIRECTORY = Object.freeze([
  ...legacy,
  ...additions2019,
  ...additions2023,
  ...additions2024,
]);

const DIRECTORY_BY_NAME = new Map();
for (const item of FOOD_MEDICINE_DIRECTORY) {
  DIRECTORY_BY_NAME.set(item.name, item);
  for (const alias of item.aliases) DIRECTORY_BY_NAME.set(alias, item);
}

const AMBIGUOUS_OR_PROCESS_VARIANTS = new Map([
  ['鲜扁豆花', { directoryName: '白扁豆花', reason: 'source omits the official white-bean identity' }],
  ['鲜竹叶心', { directoryName: '淡竹叶', reason: 'plant part and material identity are not equivalent' }],
  ['鲜小蓟根', { directoryName: '小蓟', reason: 'root-only material is not established by the legacy name-only listing' }],
  ['枣肉', { directoryName: '枣', reason: 'processed edible part is not fixed by the legacy name-only listing' }],
  ['煅牡蛎', { directoryName: '牡蛎', reason: 'calcined medicinal material is not the same use form as a food-directory name' }],
]);

export function adjudicateFoodMedicineName(sourceName) {
  const normalized = sourceName.trim();
  const item = DIRECTORY_BY_NAME.get(normalized);
  if (item) {
    return {
      sourceName,
      matchStatus: 'matched_current_directory',
      directoryName: item.name,
      directoryId: item.id,
      aliases: [...item.aliases],
      part: item.part,
      foodUseScope: item.foodUseScope,
      populationRestriction: item.populationRestriction,
      batchPopulationRestriction: item.batchPopulationRestriction,
      specificRestriction: item.specificRestriction,
      productEligibility: item.productEligibility,
      runtimeEligibleFields: [],
    };
  }

  const ambiguous = AMBIGUOUS_OR_PROCESS_VARIANTS.get(normalized);
  if (ambiguous) {
    return {
      sourceName,
      matchStatus: 'identity_or_process_variant_unadjudicated',
      directoryName: ambiguous.directoryName,
      reason: ambiguous.reason,
      productEligibility: 'blocked_pending_use_specific_review',
      runtimeEligibleFields: [],
    };
  }

  return {
    sourceName,
    matchStatus: 'not_in_current_directory',
    directoryName: null,
    reason: 'Absence from this directory is not a finding that the item is unsafe or not an ordinary food; it only cannot inherit food-medicine directory status.',
    productEligibility: 'blocked_pending_use_specific_review',
    runtimeEligibleFields: [],
  };
}

export const SKILL_A_FOOD_SUBSTANCES = Object.freeze([
  '山药', '大枣', '枸杞', '蜂蜜', '薏苡仁', '绿豆', '生姜', '山楂', '莲子', '芡实',
  '百合', '龙眼肉', '黑芝麻', '桑椹', '核桃仁',
]);

const CLAIM_SPECS = [
  ['TCM-FOOD-CLAIM-001', '47-温病-卫气营血三焦方证条文.md', 195, 'A 级食疗性质', ['梨', '荸荠', '鲜苇根', '麦冬', '藕'], 'mixed_ordinary_food_and_directory_items_no_formula_eligibility'],
  ['TCM-FOOD-CLAIM-002', '47-温病-卫气营血三焦方证条文.md', 210, 'A 级药食边界方', ['荷叶', '鲜银花', '西瓜翠衣', '鲜扁豆花', '丝瓜皮', '鲜竹叶心', '杏仁', '薏仁', '滑石'], 'mixed_identity_and_non_directory_ingredients_formula_blocked'],
  ['TCM-FOOD-CLAIM-003', '45-经典-金匮要略杂病方证条文.md', 51, '药食同源名方', ['当归', '生姜', '羊肉'], 'spice_only_member_does_not_authorize_therapeutic_formula'],
  ['TCM-FOOD-CLAIM-004', '45-经典-金匮要略杂病方证条文.md', 68, '药食同源级配伍', ['甘草', '小麦', '大枣'], 'ingredient_food_status_does_not_validate_therapeutic_indication'],
  ['TCM-FOOD-CLAIM-005', '48-医家-衷中参西录要义.md', 53, '食疗级凉润方', ['鲜茅根', '鲜藕', '鲜小蓟根'], 'part_identity_and_treatment_claim_unadjudicated'],
  ['TCM-FOOD-CLAIM-006', '48-医家-衷中参西录要义.md', 87, '本门几乎全为药食两用', ['白术', '干姜', '鸡内金', '枣肉', '山药', '鸡子黄', '车前子', '滑石', '甘草', '龙眼肉', '硫黄'], 'overbroad_medicine_food_claim_contains_non_directory_and_process_variants'],
  ['TCM-FOOD-CLAIM-007', '48-医家-衷中参西录要义.md', 154, '药食两用之品', ['鲜蒲公英'], 'directory_membership_does_not_authorize_eye_treatment_or_external_route'],
  ['TCM-FOOD-CLAIM-008', '48-医家-衷中参西录要义.md', 157, '食疗级验案', ['煅牡蛎', '黄芪', '海带'], 'processed_medicinal_dose_and_disease_claim_not_food_eligible'],
];

export const SKILL_EXPLICIT_FOOD_CLAIMS = Object.freeze(CLAIM_SPECS.map(([
  id, file, sourceLine, sourceLabel, ingredientNames, adjudication,
]) => Object.freeze({
  id,
  sourcePath: `database/tcm/skill-v3/references/${file}`,
  sourceLine,
  sourceLabel,
  ingredientNames: Object.freeze([...ingredientNames]),
  ingredients: Object.freeze(ingredientNames.map(adjudicateFoodMedicineName)),
  adjudication,
  productEligibility: 'blocked',
  runtimeEligibleFields: Object.freeze([]),
})));

export const FOOD_MEDICINE_BATCHES = Object.freeze(BATCHES);
