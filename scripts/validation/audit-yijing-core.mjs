import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { JINGFANG } from '../../src/modules/liuyao/data.js';
import {
  buildJingfangIndex,
  buildStructuralIndex,
  computeTransforms,
  normalizeScriptureText,
  parseGuabianData,
  parseHexagramLookup,
  parseHexagramMatrix,
  parseHexagramOverview,
  parseLocalScripture,
  parseWikisourceSnapshot,
} from './lib/yijing-core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const paths = {
  scripture1: 'database/xuanxue/compendium-new/reference/64gua-yaoci-part1.md',
  scripture2: 'database/xuanxue/compendium-new/reference/64gua-yaoci-part2.md',
  guabian: 'database/xuanxue/compendium-new/01-yijing/04-guabian-data.md',
  overview: 'database/xuanxue/compendium-new/01-yijing/01-64gua-reference.md',
  lookup: 'database/xuanxue/compendium-new/reference/64gua-lookup.md',
  cosmology: 'database/xuanxue/compendium-new/00-cosmology/04-bagua-64gua.md',
  lesson2: 'database/xuanxue/compendium-new/01-yijing/02-guaci-yaoci.md',
  searchEngine: 'database/xuanxue/compendium-new/reference/64gua-search-engine.md',
  witness: 'database/sources/wikisource/zhouyi-64-mediawiki-2026-07-10.json',
  adjudications: 'database/yijing/zhouyi-text-adjudications.json',
  core: 'database/yijing/zhouyi-core.json',
  artifact: 'docs/validation/artifacts/yijing-core-audit-2026-07-10.json',
};

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sourceTexts = Object.fromEntries(
  Object.entries(paths)
    .filter(([key]) => !['core', 'artifact'].includes(key))
    .map(([key, relativePath]) => [key, read(relativePath)]),
);

const local = parseLocalScripture([sourceTexts.scripture1, sourceTexts.scripture2]);
const witness = parseWikisourceSnapshot(JSON.parse(sourceTexts.witness));
const adjudications = JSON.parse(sourceTexts.adjudications);
const guabian = parseGuabianData(sourceTexts.guabian);
const overview = parseHexagramOverview(sourceTexts.overview);
const lookup = parseHexagramLookup(sourceTexts.lookup);
const cosmologyMatrix = parseHexagramMatrix(
  sourceTexts.cosmology.slice(
    sourceTexts.cosmology.indexOf('### 六十四卦速查表'),
    sourceTexts.cosmology.indexOf('### 卦序系统'),
  ),
  ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'],
);
const searchMatrix = parseHexagramMatrix(
  sourceTexts.searchEngine.slice(sourceTexts.searchEngine.indexOf('## 快速查卦索引')),
  ['乾', '坤', '震', '巽', '坎', '离', '艮', '兑'],
);
const structuralIndex = buildStructuralIndex(guabian);
const jingfangIndex = buildJingfangIndex(JINGFANG);
const overviewBySequence = new Map(overview.map((entry) => [entry.sequence, entry]));
const lookupByPair = new Map(lookup.map((entry) => [`${entry.upper}${entry.lower}`, entry.name]));
const adjudicationById = new Map(adjudications.records.map((record) => [record.id, record]));
const checks = [];

function record(category, id, actual, expected) {
  checks.push({ category, id, pass: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
}

record('inventory', 'local_hexagrams', local.length, 64);
record('inventory', 'local_scripture_entries', local.reduce((sum, hexagram) => sum + 1 + hexagram.lines.length, 0), 450);
record('inventory', 'witness_hexagrams', witness.length, 64);
record('inventory', 'witness_scripture_entries', witness.reduce((sum, hexagram) => sum + 1 + hexagram.lines.length, 0), 450);
record('inventory', 'guabian_entries', guabian.length, 64);
record('inventory', 'overview_entries', overview.length, 64);
record('inventory', 'lookup_entries', lookup.length, 64);
record('inventory', 'cosmology_matrix_entries', cosmologyMatrix.length, 64);
record('inventory', 'search_matrix_entries', searchMatrix.length, 64);
record('inventory', 'adjudication_records', adjudications.records.length, 19);

for (const hexagram of local) {
  const external = witness[hexagram.sequence - 1];
  const guaciId = `${hexagram.sequence}:卦辞`;
  const guaciMatches = normalizeScriptureText(hexagram.guaci) === normalizeScriptureText(external.guaci);
  record('scripture', guaciId, guaciMatches || adjudicationById.has(guaciId), true);
  hexagram.lines.forEach((line, index) => {
    const externalLine = external.lines[index];
    const id = `${hexagram.sequence}:${line.position}`;
    const matches = line.position === externalLine?.position
      && normalizeScriptureText(line.text) === normalizeScriptureText(externalLine?.text ?? '');
    record('scripture', id, matches || adjudicationById.has(id), true);
  });
}

for (const adjudication of adjudications.records) {
  const hexagram = local[adjudication.sequence - 1];
  const current = adjudication.position === '卦辞'
    ? hexagram.guaci
    : hexagram.lines.find(({ position }) => position === adjudication.position)?.text;
  record(
    'adjudication',
    adjudication.id,
    normalizeScriptureText(current ?? ''),
    normalizeScriptureText(adjudication.selected),
  );
}

const coreHexagrams = guabian.map((entry) => {
  const sourceText = local[entry.sequence - 1];
  const summary = overviewBySequence.get(entry.sequence);
  const transforms = computeTransforms(entry, structuralIndex);
  const jingfang = jingfangIndex.get(entry.name);
  const pair = `${entry.upper}${entry.lower}`;

  record('identity', `${entry.sequence}:sequence`, sourceText.sequence, entry.sequence);
  record('identity', `${entry.sequence}:short_name`, summary?.shortName, sourceText.shortName);
  record('identity', `${entry.sequence}:full_name`, entry.name, sourceText.fullName);
  record('identity', `${entry.sequence}:upper`, summary?.upper, entry.upper);
  record('identity', `${entry.sequence}:lower`, summary?.lower, entry.lower);
  record('identity', `${entry.sequence}:lookup`, lookupByPair.get(pair), entry.name);
  record('structure', `${entry.sequence}:inverse`, entry.inverse, transforms.inverse);
  record('structure', `${entry.sequence}:reverse`, entry.reverse, transforms.reverse);
  record('structure', `${entry.sequence}:palace`, entry.palace, jingfang?.palace);
  record('structure', `${entry.sequence}:world`, entry.world, jingfang?.world);

  return {
    sequence: entry.sequence,
    shortName: sourceText.shortName,
    fullName: entry.name,
    trigramSymbols: sourceText.symbol,
    upper: entry.upper,
    lower: entry.lower,
    binaryBottomToTop: transforms.binary,
    guaci: sourceText.guaci,
    lines: sourceText.lines.map(({ position, text }) => ({ position, text })),
    transforms: {
      inverse: transforms.inverse,
      reverse: transforms.reverse,
      nuclear: transforms.nuclear,
    },
    jingfang: {
      palace: jingfang.palace,
      type: jingfang.type,
      world: jingfang.world,
      response: jingfang.response,
    },
  };
});

const canonicalByPair = new Map(guabian.map((entry) => [`${entry.upper}${entry.lower}`, entry]));
for (const entry of cosmologyMatrix) {
  const canonical = canonicalByPair.get(`${entry.upper}${entry.lower}`);
  record('redundant_matrix', `${entry.upper}${entry.lower}:cosmology_name`, entry.shortName, local[canonical.sequence - 1]?.shortName);
}
for (const entry of searchMatrix) {
  const canonical = canonicalByPair.get(`${entry.upper}${entry.lower}`);
  record('redundant_matrix', `${entry.upper}${entry.lower}:search_sequence`, entry.sequence, canonical?.sequence);
  record('redundant_matrix', `${entry.upper}${entry.lower}:search_name`, entry.shortName, local[canonical.sequence - 1]?.shortName);
}

record('teaching_code', 'upper_line_name', sourceTexts.lesson2.includes('return `上${yinyang}`;'), true);
record('teaching_code', 'shuogua_familiar_error_removed', sourceTexts.lesson2.includes('为专、为大涂'), false);
record('teaching_code', 'shuogua_fu_reading', sourceTexts.lesson2.includes('为旉（敷）、为大涂'), true);
const exampleThrows = [7, 7, 8, 9, 8, 7];
const exampleBase = exampleThrows.map((value) => value === 7 || value === 9 ? 1 : 0).join('');
const exampleChanged = exampleThrows.map((value) => value === 9 ? 0 : value === 6 ? 1 : value === 7 ? 1 : 0).join('');
record('teaching_code', 'coin_example_base', structuralIndex.get(exampleBase)?.name, '火泽睽');
record('teaching_code', 'coin_example_changed', structuralIndex.get(exampleChanged)?.name, '山泽损');
record('teaching_code', 'coin_example_documented', sourceTexts.searchEngine.includes('benGua: 火泽睽, bianGua: 山泽损'), true);

record('structure', 'unique_binaries', new Set(coreHexagrams.map(({ binaryBottomToTop }) => binaryBottomToTop)).size, 64);
for (const hexagram of coreHexagrams) {
  const inverse = coreHexagrams.find(({ fullName }) => fullName === hexagram.transforms.inverse);
  const reverse = coreHexagrams.find(({ fullName }) => fullName === hexagram.transforms.reverse);
  record('structure', `${hexagram.sequence}:inverse_involution`, inverse?.transforms.inverse, hexagram.fullName);
  record('structure', `${hexagram.sequence}:reverse_involution`, reverse?.transforms.reverse, hexagram.fullName);
}

const failures = checks.filter(({ pass }) => !pass);
const categories = Object.fromEntries(
  [...new Set(checks.map(({ category }) => category))].map((category) => {
    const categoryChecks = checks.filter((check) => check.category === category);
    return [category, {
      checks: categoryChecks.length,
      passed: categoryChecks.filter(({ pass }) => pass).length,
      failed: categoryChecks.filter(({ pass }) => !pass).length,
    }];
  }),
);

const core = {
  schemaVersion: 1,
  generatedAt: '2026-07-10',
  status: {
    sequenceAndStructure: 'accepted',
    receivedText: 'reviewed_with_adjudicated_variants',
    interpretationAndKeywords: 'not_validated_not_included',
  },
  conventions: {
    lineOrder: 'bottom_to_top',
    inverse: 'invert_all_six_lines',
    reverse: 'reverse_all_six_lines',
    nuclear: 'lines_2_3_4_lower_and_3_4_5_upper',
    palaceSchool: 'jingfang_eight_palaces',
  },
  sourceRefs: Object.fromEntries(
    Object.entries(sourceTexts).map(([key, text]) => [key, { path: paths[key], sha256: sha256(text) }]),
  ),
  adjudicationSummary: {
    records: adjudications.records.length,
    correctedDualWitness: adjudications.records.filter(({ status }) => status === 'corrected_dual_witness').length,
    preservedDeclaredDifferences: adjudications.records.filter(({ status }) => status !== 'corrected_dual_witness').length,
  },
  hexagrams: coreHexagrams,
};

const artifact = {
  audit: 'yijing_core',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass' : 'fail',
  summary: {
    checks: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    categories,
    correctionsApplied: {
      scripture: 7,
      reverseHexagram: 16,
      jingfangPalace: 5,
      worldLine: 48,
      teachingCodeAndQuote: 3,
      total: 79,
    },
    textWitnesses: {
      localEntries: 450,
      wikisourceEntries: 450,
      adjudicatedDifferences: 19,
      ctextSpotCheckedHexagrams: 12,
    },
  },
  boundaries: [
    'Sequence, upper/lower trigrams, binary transforms, and Jingfang palace/world fields are deterministic and accepted.',
    'Received text was compared against a pinned Wikisource snapshot; all 19 normalized differences were adjudicated, with 12 CText chapter spot checks.',
    'The unresolved yi/si/ji reading in hexagram 49 is retained as an explicit received-text variant, not a unique canonical claim.',
    'Keywords, modern meanings, divination verdicts, and predictive interpretations are not validated by this pass.',
    'The alternate compendium-vision-api copy remains historical and is not treated as an independent witness.',
  ],
  failures,
};

fs.mkdirSync(path.dirname(path.join(root, paths.core)), { recursive: true });
fs.mkdirSync(path.dirname(path.join(root, paths.artifact)), { recursive: true });
fs.writeFileSync(path.join(root, paths.core), `${JSON.stringify(core, null, 2)}\n`);
fs.writeFileSync(path.join(root, paths.artifact), `${JSON.stringify(artifact, null, 2)}\n`);

console.log(JSON.stringify(artifact.summary, null, 2));
if (failures.length > 0) process.exitCode = 1;
