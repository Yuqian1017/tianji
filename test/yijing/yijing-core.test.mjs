import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

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
} from '../../scripts/validation/lib/yijing-core.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const localScripture = parseLocalScripture([
  read('database/xuanxue/compendium-new/reference/64gua-yaoci-part1.md'),
  read('database/xuanxue/compendium-new/reference/64gua-yaoci-part2.md'),
]);
const externalScripture = parseWikisourceSnapshot(JSON.parse(
  read('database/sources/wikisource/zhouyi-64-mediawiki-2026-07-10.json'),
));
const adjudications = JSON.parse(read('database/yijing/zhouyi-text-adjudications.json'));
const guabian = parseGuabianData(
  read('database/xuanxue/compendium-new/01-yijing/04-guabian-data.md'),
);
const overview = parseHexagramOverview(
  read('database/xuanxue/compendium-new/01-yijing/01-64gua-reference.md'),
);
const lookup = parseHexagramLookup(
  read('database/xuanxue/compendium-new/reference/64gua-lookup.md'),
);
const cosmologyLesson = read('database/xuanxue/compendium-new/00-cosmology/04-bagua-64gua.md');
const cosmologyMatrix = parseHexagramMatrix(
  cosmologyLesson.slice(
    cosmologyLesson.indexOf('### 六十四卦速查表'),
    cosmologyLesson.indexOf('### 卦序系统'),
  ),
  ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'],
);
const searchEngineLesson = read('database/xuanxue/compendium-new/reference/64gua-search-engine.md');
const searchMatrix = parseHexagramMatrix(
  searchEngineLesson.slice(searchEngineLesson.indexOf('## 快速查卦索引')),
  ['乾', '坤', '震', '巽', '坎', '离', '艮', '兑'],
);

test('local scripture database contains all 64 hexagrams and 450 source entries', () => {
  assert.equal(localScripture.length, 64);
  assert.deepEqual(localScripture.map(({ sequence }) => sequence), Array.from({ length: 64 }, (_, i) => i + 1));
  assert.equal(localScripture.reduce((count, hexagram) => count + 1 + hexagram.lines.length, 0), 450);
  assert.equal(localScripture[0].lines.length, 7);
  assert.equal(localScripture[1].lines.length, 7);
  assert.ok(localScripture.slice(2).every(({ lines }) => lines.length === 6));
});

test('pinned Wikisource witness parses all 64 hexagrams and 450 source entries', () => {
  assert.equal(externalScripture.length, 64);
  assert.equal(externalScripture.reduce((count, hexagram) => count + 1 + hexagram.lines.length, 0), 450);
  assert.match(externalScripture[1].guaci, /元亨/); // multi-line Kun guaci
  assert.match(externalScripture[9].guaci, /履虎尾/); // title without colon is scripture text
  assert.equal(externalScripture[28].shortName, '坎');
  assert.equal(externalScripture[51].lines.length, 6); // malformed source span still parses
});

test('every local-to-witness scripture difference is explicitly adjudicated', () => {
  const externalBySequence = new Map(externalScripture.map((hexagram) => [hexagram.sequence, hexagram]));
  const mismatches = [];

  for (const local of localScripture) {
    const external = externalBySequence.get(local.sequence);
    if (normalizeScriptureText(local.guaci) !== normalizeScriptureText(external.guaci)) {
      mismatches.push(`${local.sequence}:卦辞`);
    }
    local.lines.forEach((line, index) => {
      const witnessLine = external.lines[index];
      if (line.position !== witnessLine?.position || normalizeScriptureText(line.text) !== normalizeScriptureText(witnessLine?.text ?? '')) {
        mismatches.push(`${local.sequence}:${line.position}`);
      }
    });
  }

  const expectedMismatches = adjudications.records
    .filter(({ status }) => status !== 'corrected_dual_witness')
    .map(({ id }) => id);
  assert.deepEqual(mismatches, expectedMismatches);

  for (const record of adjudications.records) {
    const local = localScripture[record.sequence - 1];
    const current = record.position === '卦辞'
      ? local.guaci
      : local.lines.find(({ position }) => position === record.position)?.text;
    assert.equal(
      normalizeScriptureText(current ?? ''),
      normalizeScriptureText(record.selected),
      `${record.id} selected reading must match the canonical raw file`,
    );
  }
});

test('all sequence, upper/lower, lookup, and runtime names agree', () => {
  assert.equal(overview.length, 64);
  assert.equal(lookup.length, 64);
  const overviewBySequence = new Map(overview.map((entry) => [entry.sequence, entry]));
  const lookupByPair = new Map(lookup.map((entry) => [`${entry.upper}${entry.lower}`, entry.name]));

  for (const entry of guabian) {
    const sourceText = localScripture[entry.sequence - 1];
    const summary = overviewBySequence.get(entry.sequence);
    assert.equal(entry.name, sourceText.fullName, `${entry.sequence} full name`);
    assert.equal(summary.shortName, sourceText.shortName, `${entry.sequence} short name`);
    assert.equal(summary.upper, entry.upper, `${entry.sequence} upper trigram`);
    assert.equal(summary.lower, entry.lower, `${entry.sequence} lower trigram`);
    assert.equal(lookupByPair.get(`${entry.upper}${entry.lower}`), entry.name, `${entry.sequence} lookup name`);
  }
});

test('both redundant 8 by 8 teaching matrices agree with canonical identities', () => {
  assert.equal(cosmologyMatrix.length, 64);
  assert.equal(searchMatrix.length, 64);
  const canonicalByPair = new Map(guabian.map((entry) => [`${entry.upper}${entry.lower}`, entry]));

  for (const entry of cosmologyMatrix) {
    const canonical = canonicalByPair.get(`${entry.upper}${entry.lower}`);
    assert.equal(entry.shortName, localScripture[canonical.sequence - 1]?.shortName, `${entry.upper}${entry.lower}`);
  }
  for (const entry of searchMatrix) {
    const canonical = canonicalByPair.get(`${entry.upper}${entry.lower}`);
    assert.equal(entry.sequence, canonical?.sequence, `${entry.upper}${entry.lower} sequence`);
    assert.equal(entry.shortName, localScripture[entry.sequence - 1]?.shortName, `${entry.upper}${entry.lower} name`);
  }
});

test('teaching code examples preserve line order and source wording', () => {
  const lesson = read('database/xuanxue/compendium-new/01-yijing/02-guaci-yaoci.md');
  assert.match(lesson, /return `上\$\{yinyang\}`;/);
  assert.doesNotMatch(lesson, /为专、为大涂/);
  assert.match(lesson, /为旉（敷）、为大涂/);

  const throws = [7, 7, 8, 9, 8, 7];
  const baseBits = throws.map((value) => value === 7 || value === 9 ? 1 : 0).join('');
  const changedBits = throws.map((value) => value === 9 ? 0 : value === 6 ? 1 : value === 7 ? 1 : 0).join('');
  const structural = buildStructuralIndex(guabian);
  assert.equal(structural.get(baseBits)?.name, '火泽睽');
  assert.equal(structural.get(changedBits)?.name, '山泽损');
  assert.match(searchEngineLesson, /benGua: 火泽睽, bianGua: 山泽损/);
});

test('all structural transforms and Jingfang palace fields are mechanically consistent', () => {
  assert.equal(guabian.length, 64);
  const structuralIndex = buildStructuralIndex(guabian);
  const jingfangIndex = buildJingfangIndex(JINGFANG);
  const mismatches = [];

  for (const entry of guabian) {
    const transforms = computeTransforms(entry, structuralIndex);
    const jingfang = jingfangIndex.get(entry.name);
    if (entry.inverse !== transforms.inverse) mismatches.push(`${entry.sequence}:${entry.name}:错卦:${entry.inverse}->${transforms.inverse}`);
    if (entry.reverse !== transforms.reverse) mismatches.push(`${entry.sequence}:${entry.name}:综卦:${entry.reverse}->${transforms.reverse}`);
    if (entry.palace !== jingfang?.palace) mismatches.push(`${entry.sequence}:${entry.name}:八宫:${entry.palace}->${jingfang?.palace}`);
    if (entry.world !== jingfang?.world) mismatches.push(`${entry.sequence}:${entry.name}:世爻:${entry.world}->${jingfang?.world}`);
  }

  assert.deepEqual(mismatches, []);
});
