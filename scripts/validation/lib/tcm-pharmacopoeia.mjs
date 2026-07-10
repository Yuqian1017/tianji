import { createHash } from 'node:crypto';

export const SAFETY_REFERENCE_PATH = 'database/tcm/skill-v3/references/安全-配伍妊娠禁忌与毒性药.md';

const NAME_ADJUDICATIONS = {
  三棵针: {
    officialTitle: '三颗针',
    status: 'source_name_error_corrected',
    note: 'Skill 写作“三棵针”；2020 数字药典和 2025 一部目录均使用“三颗针”。',
  },
  贯众: {
    officialTitle: null,
    status: 'ambiguous_generic_name',
    alternatives: ['绵马贯众', '紫萁贯众'],
    note: '现行药典按基原拆分，通用名“贯众”不能唯一确定药材或剂量。',
  },
  光慈菇: {
    officialTitle: null,
    status: 'non_pharmacopoeia_distinct_substance',
    alternatives: ['山慈菇'],
    note: 'Skill 已标注为山慈菇非正品；不得把光慈菇映射为山慈菇正品。',
  },
  天山雪莲花: {
    officialTitle: '天山雪莲',
    status: 'official_title_normalized',
  },
  禹白附: {
    officialTitle: '白附子',
    status: 'official_title_normalized',
  },
  皂荚: {
    officialTitle: '大皂角',
    status: 'official_title_normalized',
  },
  代赭石: {
    officialTitle: '赭石',
    status: 'official_title_normalized',
  },
  刺蒺藜: {
    officialTitle: '蒺藜',
    status: 'official_title_normalized',
  },
  罗布麻: {
    officialTitle: '罗布麻叶',
    status: 'official_title_normalized',
  },
  升药: {
    officialTitle: '红粉',
    status: 'official_title_normalized',
  },
  土鳖虫: {
    officialTitle: '土鳖虫（䗪虫）',
    searchName: '土鳖虫',
    status: 'official_title_normalized',
  },
  '砒石/砒霜': {
    officialTitle: null,
    status: 'combined_source_row_requires_split',
    substances: ['砒石', '砒霜'],
    note: '一个 Skill 行合并两个法定毒性名称；规范层拆为两个 substance，仍共享原始行证据。',
  },
};

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function parseMarkdownTable(section) {
  return section
    .split('\n')
    .filter(line => /^\|[^-|]/.test(line))
    .slice(1)
    .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
}

export function parseDoseRows(safetyText) {
  const section = safetyText.split('## 五、')[1]?.split('## 六、')[0];
  if (!section) throw new Error('Missing Skill dose-table section');
  return parseMarkdownTable(section).map((cells, index) => {
    if (cells.length !== 5 || cells.some(cell => !cell)) {
      throw new Error(`Invalid dose row ${index + 1}`);
    }
    const sourceName = cells[0];
    const baseName = sourceName.replace(/\([^)]*\)/g, '').trim();
    const adjudication = NAME_ADJUDICATIONS[baseName] ?? {
      officialTitle: baseName,
      status: 'same_as_source_name',
    };
    const substanceNames = adjudication.substances ?? [baseName];
    return {
      id: `tcm-skill-dose-row-${String(index + 1).padStart(3, '0')}`,
      rowNumber: index + 1,
      sourceName,
      baseName,
      sourceLocator: `## 五、毒性药剂量与使用注意表 / row ${index + 1}`,
      raw: {
        toxicity: cells[1],
        dose: cells[2],
        method: cells[3],
        warning: cells[4],
      },
      adjudication,
      substanceNames,
    };
  });
}

export function officialLookupForRow(row) {
  if (row.substanceNames.length > 1) {
    return row.substanceNames.map(name => ({
      substanceName: name,
      officialTitle: null,
      searchName: null,
      identityStatus: row.adjudication.status,
    }));
  }
  return [{
    substanceName: row.substanceNames[0],
    officialTitle: row.adjudication.officialTitle,
    searchName: row.adjudication.searchName
      ?? normalizeOfficialTitle(row.adjudication.officialTitle ?? row.substanceNames[0]),
    identityStatus: row.adjudication.status,
  }];
}

export function normalizeOfficialTitle(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/[（）]/g, match => (match === '（' ? '(' : ')'))
    .replace(/\s+/g, '')
    .trim();
}

export function stripHtml(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractLastHtmlSection(html, heading) {
  const marker = `<b>【${heading}】</b>`;
  const start = html.lastIndexOf(marker);
  if (start < 0) return null;
  const contentStart = start + marker.length;
  const remainder = html.slice(contentStart);
  const nextHeading = remainder.search(/<b>【[^】]+】<\/b>/);
  const content = nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
  return stripHtml(content);
}

export function extractGramQuantities(value) {
  const normalized = String(value ?? '')
    .replace(/[～—–－]/g, '~')
    .replace(/克/g, 'g')
    .replace(/\s+/g, '');
  return [...normalized.matchAll(/\d+(?:\.\d+)?(?:~\d+(?:\.\d+)?)?g/gi)]
    .map(match => match[0].toLowerCase());
}

export function compareDoseQuantities(skillDose, officialDose) {
  if (!officialDose) {
    return {
      status: 'official_2020_dose_missing',
      officialQuantities: [],
      skillQuantities: extractGramQuantities(skillDose),
      missingFromSkill: [],
    };
  }
  const officialQuantities = [...new Set(extractGramQuantities(officialDose))];
  const skillQuantities = [...new Set(extractGramQuantities(skillDose))];
  const missingFromSkill = officialQuantities.filter(quantity => !skillQuantities.includes(quantity));
  return {
    status: missingFromSkill.length === 0
      ? 'official_2020_quantities_present'
      : 'official_2020_quantities_conflict',
    officialQuantities,
    skillQuantities,
    missingFromSkill,
  };
}

export function containsEmergencyTreatmentInstruction(row) {
  return /救治|解救|解毒首选|洗胃|催吐|导泻|阿托品|利多卡因|高锰酸钾|活性炭|绿豆|甘草煎|姜汁|稀醋|蛋清/.test(
    `${row.raw.method} ${row.raw.warning}`,
  );
}

export function compatibilitySourceFindings(safetyText) {
  const section = safetyText.split('## 一、配伍禁忌:十八反')[1]?.split('## 二、')[0] ?? '';
  return [{
    id: 'TCM-COMPAT-NAME-001',
    severity: 'high',
    status: section.includes('沙参(苦参)') ? 'source_error_confirmed' : 'not_present',
    observation: 'Skill 主表把“沙参(苦参)”写成同一项，混淆两个不同药名。',
    normalizedDecision: ['沙参', '苦参'],
    productEligibility: 'blocked',
  }];
}
