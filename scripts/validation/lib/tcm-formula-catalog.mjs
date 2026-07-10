const TOXICITY_TERMS = [
  '有毒', '大毒', '剧毒', '朱砂', '雄黄', '青木香', '关木通', '川乌', '草乌',
  '附子', '巴豆', '藜芦', '礞石', '罂粟壳', '麝香', '同性毒力共振',
];
const ADMINISTRATION_TERMS = ['鼻饲', '嚼碎服', '注射液', '外敷', '吹鼻', '灌肠', '药捻'];
const EMERGENCY_TERMS = [
  '急救', '救急', '亡阳', '闭证', '神昏', '昏迷', '中风', '抽搐', '惊厥', '心绞痛',
  '出血急暴', '上消化道出血', '误食毒物', '白喉',
];
const MODERN_USE_TERMS = ['现用于', '用于中风后遗症', '高血压', '白血病', '肿瘤'];
const VULNERABLE_TERMS = ['孕妇', '妊娠', '小儿', '儿童', '年老体弱', '产后', '经期'];
const CONTRAINDICATION_TERMS = [
  '禁用', '禁服', '禁忌', '慎用', '慎服', '不宜', '不可', '勿', '忌', '禁',
  '中病即止', '得效即止', '病瘥即停', '只宜暂用', '不可久服',
];

function termsInText(sourceText, terms) {
  const compact = sourceText.replace(/\s/g, '');
  return terms.filter(term => compact.includes(term.replace(/\s/g, '')));
}

function formulaDefinitionMatch(sourceText) {
  const direct = sourceText.match(/^\*\*([★※⚠]?)([^*]+?)\*\*《([^》]+)》(.*)$/);
  if (direct) {
    return {
      marker: direct[1],
      formulaName: direct[2],
      sourceBook: direct[3],
      compositionText: direct[4],
      sourceFormat: 'guillemets_attribution',
    };
  }
  const parenthetical = sourceText.match(/^\*\*([★※⚠]?)([^*]+?)\*\*\(([^)]+)\)\s*(.*)$/);
  if (!parenthetical) return null;
  return {
    marker: parenthetical[1],
    formulaName: parenthetical[2],
    sourceBook: parenthetical[3],
    compositionText: parenthetical[4],
    sourceFormat: 'parenthetical_attribution',
  };
}

function doseTermsInText(sourceText) {
  const terms = [];
  if (sourceText.includes('原方折现代用量')) terms.push('原方折现代用量');
  if (sourceText.includes('现代用量须医师定')) terms.push('现代用量须医师定');
  if (formulaDefinitionMatch(sourceText) && /\d/.test(sourceText)) terms.push('方剂组成数量');
  const explicit = sourceText.match(/\d+(?:\.\d+)?(?:\s*[~～-]\s*\d+(?:\.\d+)?)?\s*(?:mg|g|克|毫克|两|钱|分|升|合|枚|片|个)/gi) ?? [];
  return [...new Set([...terms, ...explicit.map(term => term.replace(/\s/g, ''))])];
}

function poisoningActionTermsInText(sourceText) {
  return /吐不止解救|过剂服|葱白汤解|探喉助吐|快吐乃止|误食毒物/.test(sourceText)
    ? ['毒物处置']
    : [];
}

function modernUseTermsInText(sourceText) {
  const terms = termsInText(sourceText, MODERN_USE_TERMS);
  if (/现代[^。；;|]*(?:常用|用于|治疗)/.test(sourceText)) terms.unshift('现代');
  return [...new Set(terms)];
}

export function formulaCatalogSourceDomain(sourceId) {
  return sourceId === 'ref24' ? 'formula_general_principles' : 'formula_monographs';
}

export function parseFormulaCatalogSections(sourceId, text) {
  return [...text.matchAll(/^(##|###) ([^\n]+)$/gm)].map((match, index) => ({
    id: `tcm-${sourceId}-formula-section-${String(index + 1).padStart(3, '0')}`,
    sourceId,
    sourceLine: text.slice(0, match.index).split('\n').length,
    level: match[1].length,
    title: match[2].trim(),
    sourceDomain: formulaCatalogSourceDomain(sourceId),
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
}

export function parseFormulaCountClaim(sourceId, text) {
  const match = text.match(/正方\s*(\d+)\s*首\+附方\s*(\d+)\s*首/);
  if (!match) return null;
  return {
    sourceId,
    claimedPrimary: Number(match[1]),
    claimedAttached: Number(match[2]),
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  };
}

export function parseFormulaDefinitions(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    const match = formulaDefinitionMatch(sourceText);
    if (!match) return [];
    const marker = match.marker;
    return [{
      id: `tcm-${sourceId}-formula-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      marker: marker || null,
      formulaName: match.formulaName.trim(),
      sourceBook: match.sourceBook.trim(),
      sourceText,
      compositionText: match.compositionText.trim(),
      sourceFormat: match.sourceFormat,
      definitionType: marker === '※' ? 'classic_anchor_addition' : 'textbook_primary_candidate',
      evidenceState: 'secondary_skill_formula_summary_unverified',
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}

function splitTopLevel(text, separators) {
  const parts = [];
  let start = 0;
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '(' || character === '（') depth += 1;
    if (character === ')' || character === '）') depth = Math.max(0, depth - 1);
    if (depth === 0 && separators.has(character)) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

function attachedFormulaNames(fragment) {
  return splitTopLevel(fragment, new Set([';', '；', '、'])).flatMap(rawPart => {
    const part = rawPart.replaceAll('**', '').replace(/^[-—:：\s]+/, '').trim();
    if (!part) return [];
    const headingWithoutLeadingBook = part.replace(/^《[^》]+》\s*/, '');
    const nameText = headingWithoutLeadingBook.split(/[（(《]/, 1)[0]
      .replace(/^[★※⚠]/, '')
      .replace(/[★※⚠]+$/, '')
      .replace(/[。.,，\s]+$/, '')
      .trim();
    if (!nameText) return [];
    return nameText.split('/').map(name => name.trim()).filter(Boolean);
  });
}

export function parseAttachedFormulaEntities(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const nestedMarker = /(?:^|[;；。:：])(?:寒证用)?([\u3400-\u9fff]{2,20}(?:汤|散|丸|饮|丹|煎|膏|锭))\(附方[:：]/.exec(line);
    if (nestedMarker) {
      return [{
        id: `tcm-${sourceId}-attached-formula-${String(index + 1).padStart(4, '0')}-01`,
        sourceId,
        sourceLine: index + 1,
        formulaName: nestedMarker[1],
        sourceText: line.trim(),
        sourceFragment: nestedMarker[0],
        definitionType: 'textbook_attached_candidate',
        evidenceState: 'secondary_skill_attached_formula_summary_unverified',
        productEligibility: 'blocked',
        runtimeEligibleFields: [],
      }];
    }
    const marker = /(?:-\s*)?附(?:\([^)]*\)|四加味)?[:：]/.exec(line);
    if (!marker) return [];
    const fragment = line.slice(marker.index + marker[0].length);
    return attachedFormulaNames(fragment).map((formulaName, formulaIndex) => ({
      id: `tcm-${sourceId}-attached-formula-${String(index + 1).padStart(4, '0')}-${String(formulaIndex + 1).padStart(2, '0')}`,
      sourceId,
      sourceLine: index + 1,
      formulaName,
      sourceText: line.trim(),
      sourceFragment: fragment.trim(),
      definitionType: 'textbook_attached_candidate',
      evidenceState: 'secondary_skill_attached_formula_summary_unverified',
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }));
  });
}

export function collectFormulaCatalogPriorityLines(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText) return [];
    const doseTerms = doseTermsInText(sourceText);
    const toxicityTerms = termsInText(sourceText, TOXICITY_TERMS);
    const administrationTerms = termsInText(sourceText, ADMINISTRATION_TERMS);
    const emergencyTerms = termsInText(sourceText, EMERGENCY_TERMS);
    const modernUseTerms = modernUseTermsInText(sourceText);
    const vulnerablePopulationTerms = termsInText(sourceText, VULNERABLE_TERMS);
    const contraindicationTerms = termsInText(sourceText, CONTRAINDICATION_TERMS);
    const poisoningActionTerms = poisoningActionTermsInText(sourceText);
    const formulaDefinitionTerms = formulaDefinitionMatch(sourceText) ? ['方剂定义'] : [];
    const decisionLookupTerms = sourceId !== 'ref24'
      && /^\|/.test(sourceText)
      && !/^\|(?:---| 场景 \|)/.test(sourceText)
      ? ['场景首选反查']
      : [];
    if ([
      doseTerms, toxicityTerms, administrationTerms, emergencyTerms, modernUseTerms,
      vulnerablePopulationTerms, contraindicationTerms, poisoningActionTerms,
      formulaDefinitionTerms, decisionLookupTerms,
    ].every(terms => terms.length === 0)) return [];
    return [{
      id: `tcm-${sourceId}-formula-priority-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      sourceDomain: formulaCatalogSourceDomain(sourceId),
      doseTerms,
      toxicityTerms,
      administrationTerms,
      emergencyTerms,
      modernUseTerms,
      vulnerablePopulationTerms,
      contraindicationTerms,
      poisoningActionTerms,
      formulaDefinitionTerms,
      decisionLookupTerms,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}
