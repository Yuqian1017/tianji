const TOXICITY_TERMS = [
  '马兜铃酸', '有小毒', '有毒', '大毒', '剧毒', '中毒', '致死', '死亡', '肾衰',
  '肝肾损害', '心律失常', '呼吸循环衰竭', '不可过量', '不宜过量', '不可久服',
];
const HEAVY_METAL_TERMS = ['砷', '汞', '铅', '砒霜', '砒石', '雄黄', '朱砂', '轻粉', '铅丹', '升药'];
const MODERN_EFFICACY_TERMS = [
  '现代', '降压', '降脂', '抗癌', '抗菌', '抗病毒', '扩血管', '临床疗效', '临床应用',
  '单用有效', '特效', '治克山病',
];
const VULNERABLE_POPULATION_TERMS = [
  '5岁以下', '5岁以上', '小儿', '儿童', '婴幼儿', '老幼', '年老体弱', '孕妇', '妊娠',
  '哺乳期', '胎前产后',
];
const HOME_ACTION_PATTERNS = [
  ['促吐', /促使呕吐|探喉|药后不吐|饮热开水助之|有毒催吐/],
  ['解毒替代', /(?:杀|解)(?:生)?(?:半夏|南星|巴豆|砒霜)毒|救.{0,12}中毒|中毒.{0,30}(?:顿服|频服|大剂量服|煎服|滤汁|冷开水)|解.{0,12}药毒.{0,20}(?:同煎|服)/],
];
const EXTERNAL_ADMINISTRATION_TERMS = [
  '鼻腔给药', '吹喉', '点眼', '塞鼻', '灌肠', '外敷', '捣敷', '煎洗', '外洗',
  '调涂', '调敷', '撒布', '药捻',
];

function termsInText(sourceText, terms) {
  const compact = sourceText.replace(/\s/g, '');
  return terms.filter(term => compact.includes(term.replace(/\s/g, '')));
}

function doseTermsInText(sourceText) {
  const matches = sourceText.match(/\d+(?:\.\d+)?(?:\s*[~～-]\s*\d+(?:\.\d+)?)?\s*(?:mg|g|克|毫克|分钟|小时|粒|片|钱|分|两)/gi) ?? [];
  return [...new Set(matches.map(match => match.replace(/\s/g, '')))];
}

export function herbCatalogSourceDomain(sourceId) {
  if (sourceId === 'ref15') return 'herb_general_principles';
  if (sourceId === 'ref23') return 'disease_to_herb_reverse_index';
  return 'herb_monographs';
}

export function parseHerbCatalogSections(sourceId, text) {
  return [...text.matchAll(/^(##|###) ([^\n]+)$/gm)].map((match, index) => ({
    id: `tcm-${sourceId}-herb-section-${String(index + 1).padStart(3, '0')}`,
    sourceId,
    sourceLine: text.slice(0, match.index).split('\n').length,
    level: match[1].length,
    title: match[2].trim(),
    sourceDomain: herbCatalogSourceDomain(sourceId),
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
}

function diseaseHerbIndexEntriesInSourceOrder(text) {
  return text.split('\n').flatMap((line, index) => {
    const match = line.trim().match(/^(\d+)\. \*\*([^*]+)\*\*(.*)$/);
    if (!match) return [];
    return [{
      id: `tcm-ref23-disease-herb-index-${String(match[1]).padStart(3, '0')}`,
      sourceId: 'ref23',
      sourceLine: index + 1,
      sourceNumber: Number(match[1]),
      diseaseName: match[2].trim(),
      sourceText: line.trim(),
      sourceMappingText: match[3].replace(/^:/, '').trim(),
      evidenceState: 'unvalidated_reverse_lookup_not_prescribing_authority',
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}

export function parseDiseaseHerbIndexEntries(text) {
  return diseaseHerbIndexEntriesInSourceOrder(text)
    .sort((left, right) => left.sourceNumber - right.sourceNumber);
}

export function analyzeDiseaseHerbIndexNumbering(text, claimedCount) {
  const sourceEntries = diseaseHerbIndexEntriesInSourceOrder(text);
  const sourceOrder = sourceEntries.map(entry => entry.sourceNumber);
  const present = [...new Set(sourceOrder)].sort((left, right) => left - right);
  return {
    claimedCount,
    actualCount: sourceEntries.length,
    present,
    sourceOrder,
    missing: Array.from({ length: claimedCount }, (_, index) => index + 1)
      .filter(number => !present.includes(number)),
    duplicates: sourceOrder.filter((number, index) => sourceOrder.indexOf(number) !== index),
    inversions: sourceEntries.slice(1).flatMap((entry, index) => (
      entry.sourceNumber < sourceEntries[index].sourceNumber
        ? [{
          previous: sourceEntries[index].sourceNumber,
          current: entry.sourceNumber,
          sourceLine: entry.sourceLine,
        }]
        : []
    )),
  };
}

export function collectHerbCatalogPriorityLines(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText) return [];
    const doseTerms = doseTermsInText(sourceText);
    const toxicityTerms = termsInText(sourceText, TOXICITY_TERMS);
    const heavyMetalTerms = termsInText(sourceText, HEAVY_METAL_TERMS);
    const modernEfficacyTerms = termsInText(sourceText, MODERN_EFFICACY_TERMS);
    const vulnerablePopulationTerms = termsInText(sourceText, VULNERABLE_POPULATION_TERMS);
    const homeActionTerms = HOME_ACTION_PATTERNS
      .filter(([, pattern]) => pattern.test(sourceText))
      .map(([label]) => label);
    const externalAdministrationTerms = termsInText(sourceText, EXTERNAL_ADMINISTRATION_TERMS);
    const reverseIndexTerms = sourceId === 'ref23' && /^\d+\. /.test(sourceText)
      ? ['病证用药反查']
      : [];
    if ([
      doseTerms,
      toxicityTerms,
      heavyMetalTerms,
      modernEfficacyTerms,
      vulnerablePopulationTerms,
      homeActionTerms,
      externalAdministrationTerms,
      reverseIndexTerms,
    ].every(terms => terms.length === 0)) return [];

    return [{
      id: `tcm-${sourceId}-herb-priority-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      sourceDomain: herbCatalogSourceDomain(sourceId),
      doseTerms,
      toxicityTerms,
      heavyMetalTerms,
      modernEfficacyTerms,
      vulnerablePopulationTerms,
      homeActionTerms,
      externalAdministrationTerms,
      reverseIndexTerms,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}
