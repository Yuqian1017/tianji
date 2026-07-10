const SOURCE_DOMAINS = {
  ref42: 'classic_suwen',
  ref43: 'classic_lingshu_nanjing',
  ref44: 'classic_shanghan',
  ref45: 'classic_jingui',
  ref46: 'physician_yixuexinwu',
  ref47: 'warm_disease_classics',
  ref48: 'physician_zhongxi_canxi',
};

const FOOD_TERMS = [
  '食疗', '食养', '药食同源', '药食两用', '饮食', '食物', '五谷', '五果', '五畜',
  '五菜', '谷肉果菜', '粥', '饼', '当茶', '茶汤', '汤饮', '汁饮', '果汁', '菜汤',
  '点心', '食补', '食用', '配膳',
];
const TOXICITY_TERMS = [
  '有毒', '大毒', '剧毒', '中毒', '铅制剂', '铅丹', '黄丹', '朱砂', '雄黄', '雌黄',
  '砒', '硫黄', '水蛭', '甘遂', '乌头', '附子', '半夏', '罂粟壳', '穿山甲', '马兜铃酸',
  '麝香', '鸦胆子',
];
const CONTRAINDICATION_TERMS = [
  '禁用', '禁服', '禁忌', '慎用', '慎服', '不宜', '不可', '勿', '忌', '禁',
  '中病即止', '得效即止', '不可久服', '存目', '不可仿',
];
const EMERGENCY_TERMS = [
  '急救', '立即就医', '急诊', '红线', '休克', '昏迷', '暴脱', '亡阳', '亡阴', '中风',
  '卒中', '真心痛', '真头痛', '霍乱', '白喉', '疟疾', '结核', '吐血', '呕血',
  '大出血', '脓毒', '视力骤降', '法定检疫', '法定管理',
];
const MODERN_DISEASE_TERMS = [
  '高血压', '糖尿病', '癌', '肿瘤', '结核', '卒中', '中风', '霍乱', '疟疾',
  '青光眼', '白血病', '肺炎', '心源性', '颅内', '内镜', '手术', '化疗',
];
const VULNERABLE_TERMS = [
  '孕妇', '妊娠', '产后', '小儿', '儿童', '婴儿', '老人', '老弱', '年老体弱',
  '高年', '虚弱', '大失血', '大汗', '大泄',
];
const HOME_ACTION_TERMS = [
  '当茶', '泡饮', '频饮', '顿饮', '嚼服', '吞服', '送服', '煮汁', '煮粥', '烙饼',
  '当点心', '熏洗', '外敷', '点眼', '滴鼻', '灌服', '鼻饲', '探喉', '涌吐', '服食',
  '每晚食', '睡前', '日日', '自制',
];
const SOURCE_GRADE_TERMS = ['A 级', 'A级', 'B 级', 'B级', '食疗级', '食疗性质', '药食同源', '药食两用'];

function termsInText(sourceText, terms) {
  const compact = sourceText.replace(/\s/g, '');
  return [...new Set(terms.filter(term => compact.includes(term.replace(/\s/g, ''))))];
}

function doseTermsInText(sourceText) {
  const arabic = sourceText.match(/\d+(?:\.\d+)?(?:\s*[~～-]\s*\d+(?:\.\d+)?)?\s*(?:mg|g|克|毫克|两|钱|分|升|合|斤|枚|片|个|碗)/gi) ?? [];
  const chinese = sourceText.match(/[一二三四五六七八九十百千半数]+(?:两|钱|分|升|合|斤|枚|片|个|碗)(?:半)?/g) ?? [];
  const suffixHalf = sourceText.match(/(?:两|钱|分|升|合|斤)半/g) ?? [];
  return [...new Set([...arabic, ...chinese, ...suffixHalf].map(term => term.replace(/\s/g, '')))];
}

function diseaseFoodMappingTermsInText(sourceText, foodTherapyTerms) {
  if (foodTherapyTerms.length === 0) return [];
  return /病|证|治|疗|补|泻|止|救|预防|善后|宜|禁|癌|瘤|痨/.test(sourceText)
    ? ['食物疾病映射']
    : [];
}

export function classicsFoodSourceDomain(sourceId) {
  return SOURCE_DOMAINS[sourceId] ?? 'classic_or_physician_source';
}

export function parseClassicsFoodSections(sourceId, text) {
  return [...text.matchAll(/^(##|###) ([^\n]+)$/gm)].map((match, index) => ({
    id: `tcm-${sourceId}-classic-section-${String(index + 1).padStart(3, '0')}`,
    sourceId,
    sourceLine: text.slice(0, match.index).split('\n').length,
    level: match[1].length,
    title: match[2].trim(),
    sourceDomain: classicsFoodSourceDomain(sourceId),
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
}

export function collectClassicsFoodPriorityLines(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText) return [];
    const foodTherapyTerms = termsInText(sourceText, FOOD_TERMS);
    const doseTerms = doseTermsInText(sourceText);
    const toxicityTerms = termsInText(sourceText, TOXICITY_TERMS);
    const contraindicationTerms = termsInText(sourceText, CONTRAINDICATION_TERMS);
    const emergencyTerms = termsInText(sourceText, EMERGENCY_TERMS);
    const modernDiseaseTerms = termsInText(sourceText, MODERN_DISEASE_TERMS);
    const vulnerablePopulationTerms = termsInText(sourceText, VULNERABLE_TERMS);
    const homeActionTerms = termsInText(sourceText, HOME_ACTION_TERMS);
    const sourceGradeTerms = termsInText(sourceText, SOURCE_GRADE_TERMS)
      .map(term => term.replace(/\s/g, ''));
    const diseaseFoodMappingTerms = diseaseFoodMappingTermsInText(sourceText, foodTherapyTerms);
    if ([
      foodTherapyTerms, doseTerms, toxicityTerms, contraindicationTerms, emergencyTerms,
      modernDiseaseTerms, vulnerablePopulationTerms, homeActionTerms, sourceGradeTerms,
      diseaseFoodMappingTerms,
    ].every(terms => terms.length === 0)) return [];
    return [{
      id: `tcm-${sourceId}-classic-priority-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      sourceDomain: classicsFoodSourceDomain(sourceId),
      foodTherapyTerms,
      diseaseFoodMappingTerms,
      doseTerms,
      toxicityTerms,
      contraindicationTerms,
      emergencyTerms,
      modernDiseaseTerms,
      vulnerablePopulationTerms,
      homeActionTerms,
      sourceGradeTerms,
      foodEligibility: 'not_adjudicated',
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}
