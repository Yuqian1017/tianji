import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  FACE_INTERPRETATION_VALIDATION,
  FACE_TRADITIONAL_CLAIM_IDS,
  PARENTS_PALACE_VARIANT,
  THREE_STOP_LABELS,
  TWELVE_PALACES,
  WUXING_FACE_TYPES,
} from '../../src/modules/face/data.js';
import { FACE_SYSTEM_PROMPT } from '../../src/modules/face/prompt.js';
import {
  PALM_INTERPRETATION_VALIDATION,
  PALM_TRADITIONAL_CLAIM_IDS,
  HAND_WUXING_TYPES,
  MOUND_NAMES,
} from '../../src/modules/palm/data.js';
import { PALM_SYSTEM_PROMPT } from '../../src/modules/palm/prompt.js';

const sourceManifestPath = new URL(
  '../../database/xiangshu/sources/xiangshu-source-manifest.json',
  import.meta.url,
);
const claimsPath = new URL(
  '../../database/xiangshu/normalized/xiangshu-classical-claims.json',
  import.meta.url,
);
const adjudicationsPath = new URL(
  '../../database/xiangshu/normalized/xiangshu-compendium-adjudications.json',
  import.meta.url,
);
const rawInventoryPath = new URL(
  '../../database/xiangshu/normalized/xiangshu-raw-line-inventory.json',
  import.meta.url,
);

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

test('raw xiangshu compendium witnesses remain byte-for-byte preserved', async () => {
  const fixtures = [
    [
      '../../database/xuanxue/compendium-new/10-xiangshu/01-mianxiang.md',
      '03a42815427be252bf091f0dfbaa3f3295a08e7f36add725671927a631fb3569',
    ],
    [
      '../../database/xuanxue/compendium-new/10-xiangshu/02-shouxiang.md',
      '48158daf73299a27fd8efb7fb7c08acf4b2428705e6bb281420d4601b0deadf9',
    ],
  ];

  for (const [relativePath, expectedHash] of fixtures) {
    const bytes = await readFile(new URL(relativePath, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash);
  }
});

test('raw inventory preserves every non-empty face and palm line', async () => {
  const inventory = await readJson(rawInventoryPath);
  const byFileAndLine = new Map(
    inventory.records.map((record) => [`${record.sourceFile}:${record.lineNumber}`, record]),
  );

  assert.equal(inventory.doctrine, 'classical_source_first');
  assert.equal(inventory.records.length, 386);
  assert.equal(inventory.counts.adjudicatedRecords, 286);
  assert.equal(inventory.counts.pendingSourceAdjudication, 0);

  for (const source of inventory.sourceFiles) {
    const rawText = await readFile(new URL(`../../${source.path}`, import.meta.url), 'utf8');
    const lines = rawText.split('\n');
    const nonEmptyLines = lines.filter((line) => line.trim());
    assert.equal(source.nonEmptyLines, nonEmptyLines.length);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const record = byFileAndLine.get(`${source.path}:${index + 1}`);
      assert.ok(record, `missing raw line ${source.path}:${index + 1}`);
      assert.equal(record.rawText, trimmed);
      assert.equal(record.preservationStatus, 'raw_preserved');
      assert.ok(record.adjudicationStatus);
      assert.ok(Array.isArray(record.adjudicationIds));
      assert.ok(Array.isArray(record.canonicalClaimIds));
      assert.ok(Array.isArray(record.sourceRefIds));
    });
  }
});

test('every normalized traditional claim resolves to a bounded document witness excerpt', async () => {
  const manifest = await readJson(sourceManifestPath);
  const core = await readJson(claimsPath);
  const excerptIndex = new Map();

  assert.equal(manifest.doctrine, 'classical_source_first');
  assert.equal(core.doctrine, 'classical_source_first');

  for (const source of manifest.sources) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.attributionStatus);
    assert.ok(source.witnessStatus);
    for (const excerpt of source.excerpts) {
      assert.ok(excerpt.locator);
      assert.ok(excerpt.originalText);
      assert.ok(!excerptIndex.has(excerpt.id), `duplicate excerpt id: ${excerpt.id}`);
      excerptIndex.set(excerpt.id, excerpt);
    }
  }

  for (const claim of core.claims) {
    assert.ok(claim.sourceRefIds.length > 0, `${claim.id} has no source refs`);
    assert.ok(claim.originalText);
    assert.ok(claim.normalizedClaim);
    assert.ok(claim.interpretationStatus);
    assert.ok(claim.runtimePolicy);
    for (const sourceRefId of claim.sourceRefIds) {
      assert.ok(excerptIndex.has(sourceRefId), `${claim.id} has unresolved ${sourceRefId}`);
    }
    if (claim.runtimeEligible) {
      assert.equal(claim.runtimePolicy, 'cultural_learning_with_citation');
    }
  }
});

test('compendium adjudications cannot promote unsupported paraphrases', async () => {
  const adjudications = await readJson(adjudicationsPath);

  for (const item of adjudications.items) {
    assert.ok(item.rawLocator);
    assert.ok(item.rawText);
    assert.ok(item.status);
    if (['exact_witness', 'close_paraphrase', 'supported_traditional_summary'].includes(item.status)) {
      assert.ok(item.canonicalClaimIds.length > 0, `${item.id} lacks canonical claim`);
    } else {
      assert.equal(item.runtimeEligible, false, `${item.id} must remain runtime blocked`);
    }
  }
});

test('face and palm runtime expose only source-pinned cultural claims', async () => {
  const core = await readJson(claimsPath);
  const runtimeIds = new Set(core.claims.filter((claim) => claim.runtimeEligible).map((claim) => claim.id));

  assert.equal(FACE_INTERPRETATION_VALIDATION.status, 'source_pinned_cultural_interpretation');
  assert.equal(PALM_INTERPRETATION_VALIDATION.status, 'source_pinned_cultural_interpretation');

  for (const claimId of [...FACE_TRADITIONAL_CLAIM_IDS, ...PALM_TRADITIONAL_CLAIM_IDS]) {
    assert.ok(runtimeIds.has(claimId), `runtime claim is not eligible: ${claimId}`);
  }
  for (const item of Object.values(WUXING_FACE_TYPES)) {
    assert.ok(runtimeIds.has(item.sourceClaimId), `${item.name} lacks a runtime-eligible source claim`);
  }
  for (const item of Object.values(THREE_STOP_LABELS)) {
    assert.ok(runtimeIds.has(item.sourceClaimId), `${item.name} lacks a runtime-eligible source claim`);
  }
  for (const item of Object.values(TWELVE_PALACES)) {
    assert.equal(item.interpretationStatus, 'source_pinned_location');
    assert.ok(runtimeIds.has(item.sourceClaimId), `${item.traditionalName} lacks a runtime-eligible source claim`);
  }
  assert.equal(Object.keys(TWELVE_PALACES).length, 12);
  assert.equal(PARENTS_PALACE_VARIANT.interpretationStatus, 'source_pinned_location');
  assert.ok(runtimeIds.has(PARENTS_PALACE_VARIANT.sourceClaimId));
  for (const item of Object.values(HAND_WUXING_TYPES)) {
    assert.ok(runtimeIds.has(item.sourceClaimId), `${item.name} lacks a runtime-eligible source claim`);
  }
  for (const item of Object.values(MOUND_NAMES)) {
    assert.equal(item.tradition, 'western_planetary_chiromancy');
    if (item.sourceClaimId) {
      assert.equal(item.interpretationStatus, 'source_pinned_location_only');
      assert.ok(runtimeIds.has(item.sourceClaimId), `${item.name} lacks a runtime-eligible source claim`);
    } else {
      assert.equal(item.interpretationStatus, 'source_not_yet_located');
    }
  }

  assert.match(FACE_SYSTEM_PROMPT, /逐条提供.*典籍.*出处/);
  assert.match(PALM_SYSTEM_PROMPT, /逐条提供.*典籍.*出处/);
  assert.match(FACE_SYSTEM_PROMPT, /传统记载/);
  assert.match(PALM_SYSTEM_PROMPT, /传统记载/);
});
