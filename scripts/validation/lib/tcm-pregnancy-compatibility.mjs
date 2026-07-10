import {
  SAFETY_REFERENCE_PATH,
  officialLookupForRow,
  parseDoseRows,
  parseMarkdownTable,
} from './tcm-pharmacopoeia.mjs';

export { SAFETY_REFERENCE_PATH };

const EIGHTEEN_LEFT_EXPANSIONS = {
  乌头: ['川乌', '草乌', '附子'],
  甘草: ['甘草'],
  藜芦: ['藜芦'],
};

const EIGHTEEN_RIGHT_EXPANSIONS = {
  贝母: ['川贝母', '浙贝母', '平贝母', '伊贝母', '湖北贝母'],
  瓜蒌: ['瓜蒌', '瓜蒌子', '瓜蒌皮', '天花粉'],
  半夏: ['半夏'],
  白及: ['白及'],
  白蔹: ['白蔹'],
  甘遂: ['甘遂'],
  大戟: ['京大戟', '红大戟'],
  海藻: ['海藻'],
  芫花: ['芫花'],
  人参: ['人参'],
  丹参: ['丹参'],
  玄参: ['玄参'],
  '沙参(苦参)': ['南沙参', '北沙参', '苦参'],
  细辛: ['细辛'],
  芍药: ['白芍', '赤芍'],
};

const NINETEEN_NAME_ADJUDICATIONS = {
  '朴硝(芒硝)': { canonicalNames: ['芒硝'], aliases: ['朴硝'] },
  砒霜: { canonicalNames: ['砒霜'] },
  密陀僧: { canonicalNames: ['密陀僧'] },
  牵牛: { canonicalNames: ['牵牛子'], aliases: ['牵牛'] },
  郁金: { canonicalNames: ['郁金'] },
  '牙硝(芒硝)': { canonicalNames: ['芒硝'], aliases: ['牙硝'] },
  犀角: { canonicalNames: ['犀角'] },
  五灵脂: { canonicalNames: ['五灵脂'] },
  赤石脂: { canonicalNames: ['赤石脂'] },
  硫黄: { canonicalNames: ['硫黄'] },
  水银: { canonicalNames: ['水银'] },
  狼毒: { canonicalNames: ['狼毒'] },
  巴豆: { canonicalNames: ['巴豆'] },
  丁香: { canonicalNames: ['丁香'] },
  '川乌、草乌': { canonicalNames: ['川乌', '草乌'] },
  人参: { canonicalNames: ['人参'] },
  '官桂(肉桂)': { canonicalNames: ['肉桂'], aliases: ['官桂'] },
  三棱: { canonicalNames: ['三棱'] },
};

const PREGNANCY_NAME_ADJUDICATIONS = {
  牵牛: {
    canonicalName: '牵牛子',
    identityStatus: 'official_title_normalized',
  },
  大戟: {
    canonicalName: null,
    identityStatus: 'ambiguous_generic_name',
    alternatives: ['京大戟', '红大戟'],
  },
  大蒜忌灌肠用: {
    canonicalName: '大蒜',
    identityStatus: 'route_specific_source_claim',
    routeScope: 'enema_only',
  },
};

const FORMULA_NAME_OVERRIDES = {
  '牵正散/玉真散': ['牵正散', '玉真散'],
  '凉开三宝(安宫牛黄丸/紫雪/至宝丹)': ['安宫牛黄丸', '紫雪', '至宝丹'],
  '苏合香丸/冠心苏合丸': ['苏合香丸', '冠心苏合丸'],
  '紫金锭(玉枢丹)': ['紫金锭'],
  '九仙散/真人养脏汤': ['九仙散', '真人养脏汤'],
  '木香槟榔丸/舟车丸类': ['木香槟榔丸', '舟车丸类'],
  '黑锡丹(《内科学》喘脱急救提及)': ['黑锡丹'],
  '紫金丹(《内科学》冷哮沉寒痼冷条)': ['紫金丹'],
};

export const ARISTOLOCHIC_SKILL_NAMES = [
  '关木通', '广防己', '寻骨风', '青木香', '天仙藤', '马兜铃',
];

export const REGULATORY_ARISTOLOCHIC_NAMES = [
  '关木通', '广防己', '青木香', '马兜铃', '寻骨风', '天仙藤', '朱砂莲',
];

export const COMPATIBILITY_SUPPLEMENTS = [
  {
    id: 'tcm-compatibility-supplement-001',
    system: 'eighteen_incompatibilities',
    leftName: '藜芦',
    rightName: '西洋参',
    sourceLocator: '## 五、配伍备注 / 补虚章藜芦反落实',
    sourceStatus: 'explicit_supplement',
    productEligibility: 'blocked',
  },
  {
    id: 'tcm-compatibility-supplement-002',
    system: 'eighteen_incompatibilities',
    leftName: '藜芦',
    rightName: '党参',
    sourceLocator: '## 五、配伍备注 / 补虚章藜芦反落实',
    sourceStatus: 'explicit_supplement',
    productEligibility: 'blocked',
  },
];

export const UNSUPPORTED_COMPATIBILITY_EXTENSIONS = [
  {
    id: 'tcm-compatibility-extension-001',
    leftName: '藜芦',
    rightName: '太子参',
    sourceLocator: '## 五、配伍备注 / 补虚章藜芦反落实',
    sourceStatus: 'source_admits_no_explicit_text_generalized_by_name_class',
    productEligibility: 'blocked',
  },
  {
    id: 'tcm-compatibility-extension-002',
    leftName: '藜芦',
    rightName: '明党参',
    sourceLocator: '## 五、配伍备注 / 补虚章藜芦反落实',
    sourceStatus: 'source_admits_no_explicit_text_generalized_by_name_class',
    productEligibility: 'blocked',
  },
];

function sectionBetween(text, start, end) {
  const section = text.split(start)[1]?.split(end)[0];
  if (!section) throw new Error(`Missing section between ${start} and ${end}`);
  return section;
}

export function stripMarkdown(value) {
  return String(value)
    .replace(/\*\*/g, '')
    .replace(/^各论续补:/, '')
    .trim();
}

export function parseEighteenIncompatibilities(safetyText) {
  const rows = parseMarkdownTable(sectionBetween(safetyText, '## 一、', '## 二、'));
  const pairs = [];
  for (const [rowIndex, [leftCell, rightCell]] of rows.entries()) {
    const leftGroup = stripMarkdown(leftCell).replace(/\([^)]*\)/g, '');
    const leftNames = EIGHTEEN_LEFT_EXPANSIONS[leftGroup];
    if (!leftNames) throw new Error(`Unadjudicated eighteen-incompatibility left group: ${leftCell}`);
    const rightGroups = rightCell.split('、');
    for (const rightGroup of rightGroups) {
      const rightNames = EIGHTEEN_RIGHT_EXPANSIONS[rightGroup];
      if (!rightNames) throw new Error(`Unadjudicated eighteen-incompatibility right group: ${rightGroup}`);
      for (const leftName of leftNames) {
        for (const rightName of rightNames) {
          pairs.push({
            id: `tcm-eighteen-pair-${String(pairs.length + 1).padStart(3, '0')}`,
            system: 'eighteen_incompatibilities',
            sourceRowNumber: rowIndex + 1,
            sourceLocator: `## 一、配伍禁忌:十八反 / row ${rowIndex + 1}`,
            sourceLeftCell: leftCell,
            sourceRightCell: rightCell,
            sourceLeftGroup: leftGroup,
            sourceRightGroup: rightGroup,
            leftName,
            rightName,
            productEligibility: 'blocked',
          });
        }
      }
    }
  }
  return { rows, pairs };
}

function adjudicateNineteenCell(cell) {
  const adjudication = NINETEEN_NAME_ADJUDICATIONS[stripMarkdown(cell)];
  if (!adjudication) throw new Error(`Unadjudicated nineteen-fear name: ${cell}`);
  return adjudication;
}

export function parseNineteenFears(safetyText) {
  const rows = parseMarkdownTable(sectionBetween(safetyText, '## 二、', '## 三、'));
  const pairs = [];
  for (const [rowIndex, [leftCell, rightCell]] of rows.entries()) {
    const left = adjudicateNineteenCell(leftCell);
    const right = adjudicateNineteenCell(rightCell);
    for (const leftName of left.canonicalNames) {
      for (const rightName of right.canonicalNames) {
        pairs.push({
          id: `tcm-nineteen-pair-${String(pairs.length + 1).padStart(3, '0')}`,
          system: 'nineteen_fears',
          sourceRowNumber: rowIndex + 1,
          sourceLocator: `## 二、配伍禁忌:十九畏 / row ${rowIndex + 1}`,
          sourceLeftCell: leftCell,
          sourceRightCell: rightCell,
          leftName,
          rightName,
          leftAliases: left.aliases ?? [],
          rightAliases: right.aliases ?? [],
          productEligibility: 'blocked',
        });
      }
    }
  }
  return { rows, pairs };
}

function pregnancyCategory(value) {
  const normalized = stripMarkdown(value).replace(/\([^)]*\)/g, '');
  if (normalized === '禁用') return 'prohibited_source_claim';
  if (normalized === '慎用') return 'caution_source_claim';
  throw new Error(`Unknown pregnancy category: ${value}`);
}

export function parsePregnancyTable(safetyText) {
  const rows = parseMarkdownTable(sectionBetween(safetyText, '## 三、', '## 四、'));
  const items = [];
  for (const [rowIndex, cells] of rows.entries()) {
    const [level, characteristic, medicineCell, handling] = cells;
    const sourceItems = medicineCell.split(/[、;]/).map(stripMarkdown).filter(Boolean);
    for (const sourceItem of sourceItems) {
      const parenthetical = sourceItem.match(/\(([^)]*)\)/)?.[1] ?? null;
      const baseSourceName = sourceItem.replace(/\([^)]*\)/g, '');
      const adjudication = PREGNANCY_NAME_ADJUDICATIONS[baseSourceName] ?? {
        canonicalName: baseSourceName,
        identityStatus: 'same_as_source_name',
      };
      items.push({
        id: `tcm-pregnancy-table-item-${String(items.length + 1).padStart(3, '0')}`,
        sourceRowNumber: rowIndex + 1,
        sourceLocator: `## 三、妊娠用药禁忌 / row ${rowIndex + 1}`,
        sourceLevel: level,
        sourceCharacteristic: characteristic,
        sourceMedicineCell: medicineCell,
        sourceItem,
        sourceParenthetical: parenthetical,
        sourceHandling: handling,
        sourceCategory: pregnancyCategory(level),
        canonicalName: adjudication.canonicalName,
        identityStatus: adjudication.identityStatus,
        alternatives: adjudication.alternatives ?? [],
        routeScope: adjudication.routeScope ?? 'general',
        productEligibility: 'blocked',
      });
    }
  }
  return { rows, items };
}

function formulaNames(sourceFormulaCell) {
  if (FORMULA_NAME_OVERRIDES[sourceFormulaCell]) return FORMULA_NAME_OVERRIDES[sourceFormulaCell];
  return [sourceFormulaCell.replace(/\([^)]*\)/g, '').trim()];
}

export function parseFormulaWarnings(safetyText) {
  const rows = parseMarkdownTable(sectionBetween(
    safetyText,
    '### 含毒性药的成方',
    '### 妊娠禁忌方剂',
  ));
  return rows.map(([sourceFormulaCell, toxicSource, warning], index) => ({
    id: `tcm-formula-warning-row-${String(index + 1).padStart(3, '0')}`,
    sourceRowNumber: index + 1,
    sourceLocator: `## 七、方剂级安全警示 / 含毒性药的成方 / row ${index + 1}`,
    sourceFormulaCell,
    formulaNames: formulaNames(sourceFormulaCell),
    toxicSource,
    warning,
    productEligibility: 'blocked',
  }));
}

export function parseAristolochicSkillCandidates(safetyText) {
  const line = safetyText.split('\n').find(value => value.includes('⚠马兜铃酸警示'));
  if (!line) throw new Error('Missing aristolochic-acid warning line');
  for (const name of ARISTOLOCHIC_SKILL_NAMES) {
    if (!line.includes(name)) throw new Error(`Aristolochic warning missing ${name}`);
  }
  return ARISTOLOCHIC_SKILL_NAMES.map((name, index) => ({
    id: `tcm-aristolochic-skill-item-${String(index + 1).padStart(2, '0')}`,
    name,
    sourceLocator: '## 五、配伍备注 / 马兜铃酸警示',
    sourceLine: line,
    productEligibility: 'blocked',
  }));
}

function pregnancyClauses(value) {
  return String(value)
    .split(/[;；。]/)
    .map(clause => clause.trim())
    .filter(clause => /孕妇|妊娠/.test(clause));
}

export function classifyPregnancyText(value) {
  const clauses = pregnancyClauses(value);
  if (clauses.length === 0) return 'not_stated';
  const contexts = clauses.map((clause) => {
    const markerIndex = Math.min(
      ...['孕妇', '妊娠']
        .map(marker => clause.indexOf(marker))
        .filter(index => index >= 0),
    );
    return clause.slice(markerIndex);
  });
  if (contexts.some(context => /禁用|禁服|忌用|忌服|孕妇[^;；。]*忌|孕妇[^;；。]*禁/.test(context))) {
    return 'prohibited';
  }
  if (contexts.some(context => /慎用|慎服|宜慎|孕妇[^;；。]*慎|孕妇[^;；。]*不宜/.test(context))) {
    return 'caution';
  }
  return 'pregnancy_mentioned_unclassified';
}

export function parseDoseTablePregnancyClaims(safetyText) {
  return parseDoseRows(safetyText)
    .map(row => {
      const combined = `${row.raw.method};${row.raw.warning}`;
      const clauses = pregnancyClauses(combined);
      if (clauses.length === 0) return null;
      return {
        id: `tcm-dose-pregnancy-${row.id.slice(-3)}`,
        sourceRowId: row.id,
        sourceName: row.sourceName,
        sourceSubstanceNames: row.substanceNames,
        comparatorNames: officialLookupForRow(row)
          .map(item => item.officialTitle ?? item.substanceName),
        sourceLocator: row.sourceLocator,
        sourceClauses: clauses,
        sourceClassification: classifyPregnancyText(combined),
        productEligibility: 'blocked',
      };
    })
    .filter(Boolean);
}

export function uniqueComparatorNames(safetyText) {
  const pregnancy = parsePregnancyTable(safetyText).items.flatMap(item => (
    item.canonicalName ? [item.canonicalName] : item.alternatives
  ));
  const eighteen = parseEighteenIncompatibilities(safetyText).pairs
    .flatMap(pair => [pair.leftName, pair.rightName]);
  const nineteen = parseNineteenFears(safetyText).pairs
    .flatMap(pair => [pair.leftName, pair.rightName]);
  const dosePregnancy = parseDoseTablePregnancyClaims(safetyText)
    .flatMap(item => item.comparatorNames);
  const supplements = COMPATIBILITY_SUPPLEMENTS.flatMap(pair => [pair.leftName, pair.rightName]);
  const unsupported = UNSUPPORTED_COMPATIBILITY_EXTENSIONS
    .flatMap(pair => [pair.leftName, pair.rightName]);
  return [...new Set([
    ...pregnancy,
    ...eighteen,
    ...nineteen,
    ...dosePregnancy,
    ...supplements,
    ...unsupported,
    ...REGULATORY_ARISTOLOCHIC_NAMES,
  ])].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}
