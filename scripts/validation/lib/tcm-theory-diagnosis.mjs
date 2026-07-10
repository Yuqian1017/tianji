const ACTION_TERMS = [
  '治疗', '治法', '方药', '用药', '药量', '剂量', '量宜', '预防', '防流感', '针刺',
  '取穴', '按摩', '食疗', '立即就医', '急诊', '急救',
];
const DIAGNOSTIC_TERMS = [
  '诊断', '辨证', '主病', '候心', '候肺', '候脾', '候胃', '候肝', '候胆', '候肾',
  '分候脏腑', '测轻重', '病情危重', '先兆', '预后', '不治', '难治', '死', '凶候',
  '危候', '病危', '病位',
];
const EXTRAPOLATION_TERMS = [
  '内脏缩影', '决定', '易感', '长寿', '胜毒', '不胜毒', '地域南软北实',
  '西北高寒', '东南温热', '女子以肝为先天', '天年上限', '现代', '相当于',
];

export function theoryDiagnosisSourceDomain(sourceId) {
  const number = Number(sourceId.replace(/^ref/, ''));
  return number <= 8 ? 'traditional_theory' : 'traditional_diagnosis';
}

function termsInText(sourceText, terms) {
  const compact = sourceText.replace(/\s/g, '');
  return terms.filter(term => compact.includes(term));
}

export function parseTheoryDiagnosisSections(sourceId, text) {
  return [...text.matchAll(/^(##|###) ([^\n]+)$/gm)].map((match, index) => ({
    id: `tcm-${sourceId}-section-${String(index + 1).padStart(3, '0')}`,
    sourceId,
    sourceLine: text.slice(0, match.index).split('\n').length,
    level: match[1].length,
    title: match[2].trim(),
    sourceDomain: theoryDiagnosisSourceDomain(sourceId),
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
}

export function collectTheoryDiagnosisPriorityLines(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText) return [];
    const actionTerms = termsInText(sourceText, ACTION_TERMS);
    const diagnosticTerms = termsInText(sourceText, DIAGNOSTIC_TERMS);
    const extrapolationTerms = termsInText(sourceText, EXTRAPOLATION_TERMS);
    if (actionTerms.length === 0 && diagnosticTerms.length === 0 && extrapolationTerms.length === 0) return [];
    return [{
      id: `tcm-${sourceId}-priority-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      sourceDomain: theoryDiagnosisSourceDomain(sourceId),
      actionTerms,
      diagnosticTerms,
      extrapolationTerms,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}
