const MERIDIAN_SECTIONS = [
  ['LU', '手太阴肺经', 11],
  ['LI', '手阳明大肠经', 20],
  ['ST', '足阳明胃经', 45],
  ['SP', '足太阴脾经', 21],
  ['HT', '手少阴心经', 9],
  ['SI', '手太阳小肠经', 19],
  ['BL', '足太阳膀胱经', 67],
  ['KI', '足少阴肾经', 27],
  ['PC', '手厥阴心包经', 9],
  ['TE', '手少阳三焦经', 23],
  ['GB', '足少阳胆经', 44],
  ['LR', '足厥阴肝经', 14],
  ['GV', '督脉', 28],
  ['CV', '任脉', 24],
];

export const TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES = [
  '四神聪', '当阳', '鱼腰', '太阳', '耳尖', '球后', '上迎香', '内迎香', '聚泉', '海泉',
  '金津玉液', '翳明', '颈百劳', '安眠', '牵正', '新设', '血压点',
  '子宫', '提托',
  '定喘', '夹脊', '胃脘下俞', '接脊', '痞根', '腰宜', '腰眼', '十七椎',
  '肩前',
  '肘尖', '二白', '中泉', '中魁', '大骨空', '小骨空', '腰痛点', '外劳宫', '八邪', '四缝', '十宣',
  '髋骨', '鹤顶', '百虫窝', '内膝眼', '胆囊', '阑尾', '内踝尖', '外踝尖', '八风', '里内庭', '独阴', '气端',
];

const EXTRA_NAME_ADJUDICATIONS = {
  '夹脊': { transcribedCurrentName: '夹脊', identityStatus: 'secondary_transcription_exact' },
  '膝眼': { transcribedCurrentName: '内膝眼', identityStatus: 'mixed_extra_and_meridian_identity' },
  '胆囊穴': { transcribedCurrentName: '胆囊', identityStatus: 'secondary_transcription_alias' },
  '阑尾穴': { transcribedCurrentName: '阑尾', identityStatus: 'secondary_transcription_alias' },
};

const OPERATION_TERMS = [
  '穴位注射', '艾条悬灸', '艾炷直接灸', '温针灸', '耳穴压豆', '正骨推拿',
  '点刺放血', '刺血拔罐', '三棱针', '针刺', '点刺', '刺血', '放血',
  '艾灸', '悬灸', '灸法', '温针', '按穴', '按压', '按揉', '按摩', '推拿',
  '热熨', '熏洗', '敷贴', '拔罐', '刮痧', '压豆', '耳针', '头针', '发泡疗法',
  '吹药', '泡脚', '坐浴',
];

const CLAIM_PATTERN = /针刺|点刺|刺血|放血|艾灸|悬灸|灸|按压|按揉|按摩|推拿|热熨|熏洗|敷贴|拔罐|刮痧|压豆|耳针|头针|穴位注射|发泡|吹药|泡脚|坐浴|孕妇|妊娠|危险|禁用|禁自行|禁按|禁深|烫伤|气胸|延髓|脊髓|血管|出血|急救|红线|就医/;

function sectionHeadings(text) {
  return [...text.matchAll(/^## ([^\n]+)$/gm)].map(match => ({
    title: match[1],
    index: match.index,
  }));
}

function cleanMarkdown(value) {
  return String(value).replace(/\*\*/g, '').replace(/★/g, '').trim();
}

function canonicalPointName(sourceName) {
  return cleanMarkdown(sourceName).replace(/\([^)]*\)/g, '').trim();
}

function pointAliases(sourceName) {
  return [...cleanMarkdown(sourceName).matchAll(/\(([^)]*)\)/g)]
    .flatMap(match => match[1].split(/[、/;]/))
    .map(value => value.trim())
    .filter(Boolean);
}

function tableRows(section) {
  return section
    .split('\n')
    .filter(line => /^\|/.test(line))
    .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()))
    .filter(cells => cells.length > 0 && !['穴', '级', '级别'].includes(cleanMarkdown(cells[0])))
    .filter(cells => !cells.every(cell => /^-+$/.test(cell)));
}

function sourceLineType(sourceText) {
  if (/^#{1,6}\s/.test(sourceText)) return 'heading';
  if (/^\|/.test(sourceText)) return 'table';
  if (/^(?:[-*+] |\d+\. )/.test(sourceText)) return 'list';
  if (/^>/.test(sourceText)) return 'quote';
  return 'prose';
}

export function parseSourceLineInventory(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText) return [];
    return [{
      id: `tcm-${sourceId}-source-line-${String(index + 1).padStart(4, '0')}`,
      sourceId,
      sourceLine: index + 1,
      lineType: sourceLineType(sourceText),
      sourceText,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}

export function parseMarkdownTableInventory(sourceId, text) {
  const lines = text.split('\n');
  const tables = [];
  let headingPath = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      headingPath = headingPath.slice(0, level - 1);
      headingPath[level - 1] = heading[2];
      index += 1;
      continue;
    }
    if (!trimmed.startsWith('|')) {
      index += 1;
      continue;
    }

    const rawRows = [];
    while (index < lines.length && lines[index].trim().startsWith('|')) {
      const sourceText = lines[index].trim();
      rawRows.push({
        sourceLine: index + 1,
        sourceText,
        cells: sourceText.split('|').slice(1, -1).map(cell => cell.trim()),
      });
      index += 1;
    }

    const hasSeparator = rawRows.length >= 2
      && rawRows[1].cells.length > 0
      && rawRows[1].cells.every(cell => /^:?-{3,}:?$/.test(cell));
    const tableNumber = tables.length + 1;
    const dataRows = rawRows.slice(hasSeparator ? 2 : 0).map((row, rowIndex) => ({
      id: `tcm-${sourceId}-table-${String(tableNumber).padStart(2, '0')}-row-${String(rowIndex + 1).padStart(3, '0')}`,
      sourceLine: row.sourceLine,
      sourceText: row.sourceText,
      cells: row.cells,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }));
    tables.push({
      id: `tcm-${sourceId}-table-${String(tableNumber).padStart(2, '0')}`,
      sourceId,
      headingPath: headingPath.filter(Boolean),
      startLine: rawRows[0].sourceLine,
      endLine: rawRows.at(-1).sourceLine,
      headerCells: hasSeparator ? rawRows[0].cells : null,
      separatorText: hasSeparator ? rawRows[1].sourceText : null,
      dataRows,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    });
  }
  return tables;
}

export function parseMeridianPoints(pointText) {
  const headings = sectionHeadings(pointText);
  const points = [];
  for (const [sectionIndex, [meridianCode, meridianName, expectedCount]] of MERIDIAN_SECTIONS.entries()) {
    const heading = headings[sectionIndex];
    if (!heading?.title.includes(meridianName)) {
      throw new Error(`Missing meridian section ${meridianName}`);
    }
    const section = pointText.slice(heading.index, headings[sectionIndex + 1]?.index ?? pointText.length);
    const rows = tableRows(section);
    if (rows.length !== expectedCount) {
      throw new Error(`${meridianName} expected ${expectedCount} rows, found ${rows.length}`);
    }
    rows.forEach(([sourceName, location, indications, attention], index) => {
      const sequence = index + 1;
      points.push({
        id: `tcm-meridian-point-${meridianCode.toLowerCase()}-${String(sequence).padStart(2, '0')}`,
        code: `${meridianCode}${sequence}`,
        meridianCode,
        meridianName,
        sequence,
        sourceName: cleanMarkdown(sourceName),
        canonicalName: canonicalPointName(sourceName),
        aliases: pointAliases(sourceName),
        location: cleanMarkdown(location),
        indications: cleanMarkdown(indications),
        attention: cleanMarkdown(attention),
        sourceLocator: `${heading.title} / row ${sequence}`,
        productEligibility: 'blocked',
        runtimeEligibleFields: [],
      });
    });
  }
  return points;
}

export function parseExtraPoints(pointText) {
  const start = pointText.indexOf('## 十八、经外奇穴');
  if (start < 0) throw new Error('Missing extra-point section');
  const lines = pointText.slice(start).split('\n');
  const points = [];
  let region = null;
  for (const line of lines) {
    if (line.startsWith('### ')) {
      region = line.slice(4).trim();
      continue;
    }
    if (!/^\|/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells.length !== 4 || cells[0] === '穴' || cells.every(cell => /^-+$/.test(cell))) continue;
    const [sourceName, location, indications, attention] = cells;
    const canonicalName = canonicalPointName(sourceName);
    const adjudication = EXTRA_NAME_ADJUDICATIONS[canonicalName]
      ?? (TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES.includes(canonicalName)
        ? { transcribedCurrentName: canonicalName, identityStatus: 'secondary_transcription_exact' }
        : { transcribedCurrentName: null, identityStatus: 'not_in_secondary_51_name_transcription' });
    points.push({
      id: `tcm-extra-point-source-${String(points.length + 1).padStart(2, '0')}`,
      sourceRowNumber: points.length + 1,
      sourceName: cleanMarkdown(sourceName),
      canonicalName,
      aliases: pointAliases(sourceName),
      region,
      location: cleanMarkdown(location),
      indications: cleanMarkdown(indications),
      attention: cleanMarkdown(attention),
      transcribedCurrentName: adjudication.transcribedCurrentName,
      identityStatus: adjudication.identityStatus,
      duplicateLocationOf: canonicalName === '落枕穴' ? '外劳宫' : null,
      sourceLocator: `## 十八、经外奇穴 / ${region} / row ${points.length + 1}`,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    });
  }
  return points;
}

export function parseOperationSafetyClasses(operationText) {
  const section = operationText.split('## 一、')[1]?.split('## 二、')[0];
  if (!section) throw new Error('Missing operation safety-level section');
  return tableRows(section).map(([sourceLevel, sourceDefinition, sourceExamples], index) => ({
    id: `tcm-operation-source-level-${index + 1}`,
    sourceLevel: cleanMarkdown(sourceLevel).replace(/\([^)]*\)/g, '').trim(),
    sourceDefinition: cleanMarkdown(sourceDefinition),
    sourceExamples: cleanMarkdown(sourceExamples),
    sourceLocator: `## 一、非药物手段安全分级 / row ${index + 1}`,
    validationStatus: 'source_claim_not_independently_validated',
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
}

function namesInText(sourceText, points) {
  const names = [...new Set(points.flatMap(point => [
    point.canonicalName,
    point.transcribedCurrentName,
    ...(point.aliases ?? []),
  ]).filter(Boolean))].sort((a, b) => b.length - a.length);
  return names.filter(name => sourceText.includes(name));
}

function operationsInText(sourceText) {
  return OPERATION_TERMS.filter(term => sourceText.includes(term));
}

export function parseDiseasePrescriptions(diseaseText, points) {
  const headings = [...diseaseText.matchAll(/^### (\d+)\. ([^\n]+)$/gm)];
  return headings.map((heading, index) => {
    const sourceTitle = heading[2].trim();
    const sourceText = diseaseText.slice(heading.index, headings[index + 1]?.index ?? diseaseText.length).trim();
    return {
      id: `tcm-acupoint-disease-prescription-${String(index + 1).padStart(2, '0')}`,
      sourceNumber: Number(heading[1]),
      name: sourceTitle.split(/[ (（⚠]/)[0],
      sourceTitle,
      sourceText,
      pointNames: namesInText(sourceText, points),
      operationTerms: operationsInText(sourceText),
      sourceLocator: `### ${heading[1]}. ${sourceTitle}`,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    };
  });
}

export function mapLegacyAcupoints(legacy, meridianPoints, extraPoints) {
  const uniqueNames = [...new Set([
    ...legacy.constitution.acupoints,
    ...legacy.meridianClock.acupoints,
  ])];
  const points = [...meridianPoints, ...extraPoints];
  const pointByName = new Map();
  for (const point of points) {
    for (const name of [point.canonicalName, point.sourceName, point.transcribedCurrentName, ...(point.aliases ?? [])]) {
      if (name) pointByName.set(name, point);
    }
  }
  const items = uniqueNames.map((name, index) => {
    const point = pointByName.get(name);
    return {
      id: `tcm-legacy-acupoint-${String(index + 1).padStart(2, '0')}`,
      name,
      pointId: point?.id ?? null,
      pointCode: point?.code ?? null,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    };
  });
  return {
    uniqueNames,
    items,
    unresolved: items.filter(item => !item.pointId).map(item => item.name),
  };
}

function lineClaims(sourceId, text) {
  return text.split('\n').flatMap((line, index) => {
    const sourceText = line.trim();
    if (!sourceText || !CLAIM_PATTERN.test(sourceText)) return [];
    return [{
      id: `${sourceId}-claim-${String(index + 1).padStart(3, '0')}`,
      sourceId,
      sourceLine: index + 1,
      sourceText,
      operationTerms: operationsInText(sourceText),
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    }];
  });
}

export function collectExternalTreatmentClaims({ generalText, pointText, operationText, diseaseText }) {
  const diseaseClaims = parseDiseasePrescriptions(
    diseaseText,
    [...parseMeridianPoints(pointText), ...parseExtraPoints(pointText)],
  ).filter(item => CLAIM_PATTERN.test(item.sourceText)).map(item => ({
    id: `${item.id}-claim`,
    sourceId: 'tcm-reference-41',
    sourceLine: null,
    sourceText: item.sourceText,
    operationTerms: item.operationTerms,
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  }));
  return [
    ...lineClaims('tcm-reference-38', generalText),
    ...lineClaims('tcm-reference-39', pointText),
    ...lineClaims('tcm-reference-40', operationText),
    ...lineClaims('tcm-reference-41', diseaseText),
    ...diseaseClaims,
  ];
}
