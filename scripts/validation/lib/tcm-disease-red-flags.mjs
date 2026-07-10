const RISK_PATTERN = /红线|危重|危象|危候|立即急救|立即急诊|呼叫急救|叫急救|急症|急诊|住院|自杀|自伤|中毒|昏迷|神昏|大出血|呼吸困难|不能成句|发作超过\s*5\s*分钟|催吐|洗胃|取嚏|探吐|吹鼻|热熨|贴脐|灌服|含化|棉塞鼻|绿豆甘草汤|低流量给氧|导尿|三年内有中风/;

const ACTION_TERMS = [
  '催吐', '洗胃', '取嚏', '探吐', '吹鼻', '热熨', '贴脐', '灌服', '含化', '棉塞鼻',
  '绿豆甘草汤', '低流量给氧', '导尿', '口服补液', '冷敷', '侧卧', '平卧',
];
const EMERGENCY_TERMS = [
  '红线', '危重', '危象', '危候', '立即急救', '立即急诊', '呼叫急救', '叫急救',
  '急症', '急诊', '住院', '自杀', '自伤', '中毒', '昏迷', '神昏', '大出血',
  '呼吸困难', '不能成句', '发作超过5分钟', '三年内有中风',
];
const ACTIONABLE_TERMS = [
  ...EMERGENCY_TERMS,
  ...ACTION_TERMS,
  '立即就医', '及时就医', '尽快就医', '及早就诊', '立即送医', '呼叫急救',
  '现场处置', '保持呼吸道通畅', '清除假牙异物', '防窒息', '勿强行按压',
  '治疗', '治法', '代表方', '经验方', '用药', '服药', '口服', '煎服', '含服',
  '首选', '剂量', '加减', '调护', '护理', '检查', '禁食', '禁用', '不宜',
  '不可', '慎用', '医师范畴', '医疗处置', '住院治疗',
];
const DOSE_PATTERN = /\d+(?:\.\d+)?\s*(?:~|～|-|—|至)?\s*\d*(?:\.\d+)?\s*(?:mg|g|ml|mL|克|毫克|毫升|次\/分|次|分钟|小时|日|天)(?![\p{L}\p{N}])/giu;
const FORMULA_PATTERN = /[\p{Script=Han}]{2,16}(?:汤|丸|散|饮|丹|膏|方)(?:\b|[（(,，;；、/]|$)/gu;

function cleanName(sourceName) {
  return sourceName.replace(/\([^)]*\)|（[^）]*）/g, '').trim();
}

function termsInText(sourceText, terms) {
  return terms.filter(term => sourceText.replace(/\s/g, '').includes(term));
}

export function parseDiseaseReference(sourceId, text) {
  const headings = [...text.matchAll(/^## ([^\n]+)$/gm)];
  const sections = headings.flatMap((heading, index) => {
    const sourceTitle = heading[1].trim();
    if (sourceTitle.startsWith('总说')) return [];
    const sourceText = text.slice(heading.index, headings[index + 1]?.index ?? text.length).trim();
    const sourceLine = text.slice(0, heading.index).split('\n').length;
    return [{
      id: `tcm-${sourceId}-disease-${String(index + 1).padStart(2, '0')}`,
      sourceId,
      sourceTitle,
      name: cleanName(sourceTitle),
      sourceLine,
      sourceText,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
  return {
    sourceId,
    sections,
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  };
}

export function collectDiseaseRiskLines(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText || !RISK_PATTERN.test(sourceText)) return [];
    return [{
      id: `tcm-${sourceId}-disease-risk-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      emergencyTerms: termsInText(sourceText, EMERGENCY_TERMS),
      actionTerms: termsInText(sourceText, ACTION_TERMS),
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}

export function collectDiseaseActionableLines(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText) return [];
    const actionTerms = termsInText(sourceText, ACTIONABLE_TERMS);
    const doseExpressions = [...sourceText.matchAll(DOSE_PATTERN)].map(match => match[0]);
    const formulaExpressions = [...sourceText.matchAll(FORMULA_PATTERN)].map(match => match[0]);
    if (actionTerms.length === 0 && doseExpressions.length === 0 && formulaExpressions.length === 0) return [];
    return [{
      id: `tcm-${sourceId}-disease-actionable-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      actionTerms,
      doseExpressions,
      formulaExpressions,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}
