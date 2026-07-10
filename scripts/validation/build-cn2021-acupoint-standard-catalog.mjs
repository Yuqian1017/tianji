import { readFile, writeFile } from 'node:fs/promises';

import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES } from './lib/tcm-acupoint-external-safety.mjs';

const WHO_PATH = 'database/tcm/sources/who2008-acupoint-name-index.json';
const OUTPUT_PATH = 'database/tcm/sources/cn2021-acupoint-standard-catalog.json';
const MERIDIAN_TRANSCRIPTION_PATH = process.env.CN_MERIDIAN_TRANSCRIPTION;
const EXTRA_TRANSCRIPTION_PATH = process.env.CN_EXTRA_TRANSCRIPTION;
if (!MERIDIAN_TRANSCRIPTION_PATH || !EXTRA_TRANSCRIPTION_PATH) {
  throw new Error('Set CN_MERIDIAN_TRANSCRIPTION and CN_EXTRA_TRANSCRIPTION to the pinned transcription files');
}
const [whoText, meridianTranscriptionText, extraTranscriptionText] = await Promise.all([
  readFile(WHO_PATH, 'utf8'),
  readFile(MERIDIAN_TRANSCRIPTION_PATH, 'utf8'),
  readFile(EXTRA_TRANSCRIPTION_PATH, 'utf8'),
]);
const who = JSON.parse(whoText);

const currentNameByCode = new Map();
for (const line of meridianTranscriptionText.split('\n')) {
  const match = line.match(/^([\p{Script=Han}]+)\s+.*\[((?:LU|LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV)\d+)\]\s*$/u);
  if (match) currentNameByCode.set(match[2], match[1]);
}
if (currentNameByCode.size !== 362) {
  throw new Error(`Expected 362 transcribed current meridian names, found ${currentNameByCode.size}`);
}

const transcribedMeridianPoints = [...who.items, { code: 'GV29', meridianCode: 'GV', sequence: 29, pinyin: 'Yintang' }]
  .map(item => ({
    ...item,
    name: currentNameByCode.get(item.code),
    nameEvidence: 'secondary_transcription_candidate',
    source: item.code === 'GV29'
      ? 'Secondary transcription candidate beyond the WHO 361-point code domain; official page confirms only the current 362-point scope in this repository'
      : 'Secondary transcription candidate cross-checked against the WHO code domain',
  })).sort((a, b) => {
  const order = ['LU', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'TE', 'GB', 'LR', 'GV', 'CV'];
  return order.indexOf(a.meridianCode) - order.indexOf(b.meridianCode) || a.sequence - b.sequence;
});

const transcribedExtraNames = extraTranscriptionText.split('\n')
  .map(line => line.match(/^([\p{Script=Han}]+)\s+/u)?.[1])
  .filter(Boolean);
for (const name of TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES) {
  const found = name === '金津玉液'
    ? transcribedExtraNames.includes('金津') && transcribedExtraNames.includes('玉液')
    : transcribedExtraNames.includes(name);
  if (!found) throw new Error(`Missing current extra-point transcription support for ${name}`);
}

const output = {
  schemaVersion: 1,
  status: 'official_current_status_and_counts_with_secondary_name_transcription',
  generatedAt: '2026-07-10',
  sourceDocuments: [
    {
      id: 'CN-GBT-12346-2021',
      title: '经穴名称与定位',
      status: 'current',
      officialUrl: 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=397548AE7248D3D87DD15E0AB8107185',
      publishedAndEffective: '2021-11-26',
      statedScope: '362 meridian points',
    },
    {
      id: 'CN-GBT-40997-2021',
      title: '经外奇穴名称与定位',
      status: 'current',
      officialUrl: 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=D2AEF8AD07C0150E19859079579EF99F',
      publishedAndEffective: '2021-11-26',
      statedScope: '51 extra points in common use',
    },
  ],
  structuredTranscriptionSupport: {
    repository: 'https://github.com/luthepath/TCM-Input-Method',
    commit: '1a0bc95d3e15f01d1d7be8293ca8deac40ab058f',
    license: 'MIT',
    role: 'name-list transcription aid only; official standards control version and count',
    meridianFileSha256: sha256(meridianTranscriptionText),
    extraPointFileSha256: sha256(extraTranscriptionText),
    correctionsApplied: [
      'Merged 金津 and 玉液 into the single current-standard entry 金津玉液.',
      'Excluded the non-catalog test line 气室门天牖.',
      'Added the transcribed GV29 印堂 candidate to reconcile the secondary 362-name list with the official count.',
    ],
  },
  sourceRefs: {
    who2008NameIndex: {
      path: WHO_PATH,
      sha256: sha256(whoText),
      sourcePdfSha256: who.sourcePdfSha256,
    },
  },
  counts: {
    officialCurrentMeridianPointCount: 362,
    officialCurrentExtraPointCount: 51,
    transcribedMeridianPointNames: transcribedMeridianPoints.length,
    transcribedExtraPointNames: TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES.length,
    byMeridian: { ...who.counts.byMeridian, GV: 29 },
  },
  transcribedMeridianPoints,
  transcribedExtraPointNames: TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES,
  boundaries: [
    'The official pages establish current status and the 362/51 scope counts.',
    'The checked-in repository cannot reproduce the complete official per-name catalogs; all per-name comparisons are secondary-transcription candidates.',
    'The 361 WHO names are a primary-source historical/international comparator; the secondary transcription adds GV29 to reach the official 362 count.',
    'This snapshot does not reproduce the complete copyrighted Chinese location prose and therefore does not by itself validate every location sentence.',
    'The secondary transcription is not an independent authority and cannot override the official standard.',
  ],
};

if (output.counts.transcribedMeridianPointNames !== output.counts.officialCurrentMeridianPointCount
  || output.counts.transcribedExtraPointNames !== output.counts.officialCurrentExtraPointCount) {
  throw new Error('Current Chinese acupoint catalog count mismatch');
}

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.counts, null, 2));
