import { Converter } from 'opencc-js';

const toSimplified = Converter({ from: 'tw', to: 'cn' });

export const BAGUA_BINARY = Object.freeze({
  '乾': '111',
  '兑': '110',
  '离': '101',
  '震': '100',
  '巽': '011',
  '坎': '010',
  '艮': '001',
  '坤': '000',
});

const BINARY_BAGUA = new Map(
  Object.entries(BAGUA_BINARY).map(([name, binary]) => [binary, name]),
);

function simplify(text) {
  return toSimplified(text);
}

function simplifyTitle(text) {
  return simplify(text.replaceAll('乾', '__QIAN__')).replaceAll('__QIAN__', '乾');
}

export function normalizeScriptureText(text) {
  return simplify(text)
    .normalize('NFKC')
    .replaceAll('羣', '群')
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

function stripWikiMarkup(text) {
  return text
    .replace(/^-\{([\s\S]*?)\}-$/g, '$1')
    .replace(/-\{([\s\S]*?)\}-/g, '$1')
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/'''?/g, '')
    .trim();
}

export function parseLocalScripture(files) {
  const combined = files.join('\n');
  const headingPattern = /^## 第(\d+)卦\s+(\S+)\s+(\S+)\s+(.+)$/gm;
  const headings = [...combined.matchAll(headingPattern)];

  return headings.map((heading, index) => {
    const start = heading.index;
    const end = headings[index + 1]?.index ?? combined.length;
    const section = combined.slice(start, end);
    const guaci = section.match(/^\*\*卦辞\*\*：(.+)$/m)?.[1]?.trim();
    const lines = [];

    for (const row of section.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm)) {
      const position = row[1].trim();
      if (/^(初[六九]|[六九][二三四五]|上[六九]|用[六九])$/.test(position)) {
        lines.push({ position, text: row[2].trim(), meaning: row[3].trim() });
      }
    }

    return {
      sequence: Number(heading[1]),
      shortName: heading[2],
      symbol: heading[3],
      fullName: heading[4].trim(),
      guaci,
      lines,
    };
  });
}

export function parseWikisourceSnapshot(snapshot) {
  const pageByTitle = new Map(snapshot.pages.map((page) => [page.title.replace(/^.*\//, ''), page]));

  return snapshot.requestedTitles.map((requestedTitle, index) => {
    const page = pageByTitle.get(requestedTitle);
    if (!page) throw new Error(`Missing Wikisource page: ${requestedTitle}`);
    const traditionalTitle = page.title.replace(/^.*\//, '');
    const shortName = simplifyTitle(traditionalTitle);
    const contentLines = page.content.split(/\r?\n/);
    const start = contentLines.findIndex((line) => line.includes('易經：'));
    const end = contentLines.findIndex((line, lineIndex) => lineIndex > start && line.includes('彖曰'));
    const scriptureLines = contentLines.slice(start + 1, end === -1 ? undefined : end);
    const guaciFragments = [];
    const lines = [];

    for (const sourceLine of scriptureLines) {
      if (/^\*\*\*?<span[^>]*color:blue/i.test(sourceLine)) {
        guaciFragments.push(stripWikiMarkup(sourceLine.replace(/^\*\*\*?<span[^>]*>/i, '')));
        continue;
      }

      if (/^\*#<span[^>]*color:blue/i.test(sourceLine)) {
        const stripped = simplify(stripWikiMarkup(sourceLine.replace(/^\*#<span[^>]*>/i, '')));
        const match = stripped.match(/^(初[六九]|[六九][二三四五]|上[六九]|用[六九])(?:[:：，,])?(.*)$/);
        if (match) lines.push({ position: match[1], text: match[2].trim() });
      }
    }

    let guaci = simplify(guaciFragments.join(''));
    const sourceGuaciTitle = traditionalTitle === '坎' ? '习坎' : simplify(traditionalTitle);
    if (traditionalTitle !== '坎' && guaci.startsWith(`${sourceGuaciTitle}：`)) {
      guaci = guaci.slice(sourceGuaciTitle.length + 1);
    }
    guaci = guaci.trim();

    return {
      sequence: index + 1,
      shortName,
      sourceTitle: page.title,
      pageId: page.pageid,
      guaci,
      lines,
    };
  });
}

export function parseGuabianData(markdown) {
  const entries = [];
  const pattern = /\{\s*seq:(\d+),\s*name:'([^']+)',\s*upper:'([^']+)',\s*lower:'([^']+)',\s*gong:'([^']+)',\s*shi:(\d+),\s*cuo:'([^']+)',\s*zong:'([^']+)',\s*key:'([^']+)'\s*\}/g;

  for (const match of markdown.matchAll(pattern)) {
    entries.push({
      sequence: Number(match[1]),
      name: match[2],
      upper: match[3],
      lower: match[4],
      palace: match[5],
      world: Number(match[6]),
      inverse: match[7],
      reverse: match[8],
      keywords: match[9],
    });
  }

  return entries;
}

export function parseHexagramOverview(markdown) {
  const entries = [];
  const pattern = /^\|\s*(\d+)\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*([乾兑离震巽坎艮坤])\([^)]*\)\s*\|\s*([乾兑离震巽坎艮坤])\([^)]*\)\s*\|/gm;
  for (const match of markdown.matchAll(pattern)) {
    entries.push({
      sequence: Number(match[1]),
      shortName: match[2],
      upper: match[3],
      lower: match[4],
    });
  }
  return entries;
}

export function parseHexagramLookup(markdown) {
  const entries = [];
  const pattern = /'([乾兑离震巽坎艮坤]{2})':'([^']+)'/g;
  for (const match of markdown.matchAll(pattern)) {
    entries.push({ upper: match[1][0], lower: match[1][1], name: match[2] });
  }
  return entries;
}

export function parseHexagramMatrix(markdown, lowerOrder) {
  const entries = [];
  const rowPattern = /^\|\s*\*\*([乾兑离震巽坎艮坤])[^*]*\*\*\s*\|(.+)\|$/gm;
  for (const row of markdown.matchAll(rowPattern)) {
    const cells = row[2].split('|').map((cell) => cell.trim());
    if (cells.length !== lowerOrder.length) continue;
    cells.forEach((cell, index) => {
      const match = cell.match(/^(\d+)?([^\s]+)$/);
      if (!match) return;
      entries.push({
        sequence: match[1] ? Number(match[1]) : undefined,
        shortName: match[2],
        upper: row[1],
        lower: lowerOrder[index],
      });
    });
  }
  return entries;
}

export function buildStructuralIndex(entries) {
  return new Map(entries.map((entry) => [
    `${BAGUA_BINARY[entry.lower]}${BAGUA_BINARY[entry.upper]}`,
    entry,
  ]));
}

export function computeTransforms(entry, structuralIndex) {
  const bits = `${BAGUA_BINARY[entry.lower]}${BAGUA_BINARY[entry.upper]}`;
  const inverseBits = [...bits].map((bit) => bit === '1' ? '0' : '1').join('');
  const reverseBits = [...bits].reverse().join('');
  const nuclearBits = `${bits.slice(1, 4)}${bits.slice(2, 5)}`;

  return {
    binary: bits,
    inverse: structuralIndex.get(inverseBits)?.name,
    reverse: structuralIndex.get(reverseBits)?.name,
    nuclear: structuralIndex.get(nuclearBits)?.name,
    nuclearLower: BINARY_BAGUA.get(bits.slice(1, 4)),
    nuclearUpper: BINARY_BAGUA.get(bits.slice(2, 5)),
  };
}

export function buildJingfangIndex(jingfang) {
  const index = new Map();
  for (const [palaceName, palace] of Object.entries(jingfang)) {
    for (const gua of palace.gua) {
      index.set(gua.name, {
        palace: palaceName.replace('宫', ''),
        world: gua.world,
        response: gua.response,
        type: gua.type,
      });
    }
  }
  return index;
}
