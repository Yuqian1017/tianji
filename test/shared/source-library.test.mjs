import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexPath = new URL('../../database/sources/source-library.json', import.meta.url);

test('central source library inventories every declared source group', async () => {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));

  assert.equal(index.doctrine, 'single_canonical_file_with_central_registry');
  assert.equal(index.entries.length, 266);
  assert.deepEqual(index.counts.byGroup, {
    tcm_original_texts: 43,
    tcm_curated_references: 50,
    tcm_modern_boundaries: 14,
    xuanxue_compendium: 70,
    xuanxue_compendium_mirror: 70,
    shared_wikisource_witnesses: 2,
    shared_ctext_witnesses: 10,
    external_source_manifests: 3,
    xiangshu_source_registry: 1,
    shared_datasets: 1,
    licenses: 2,
  });
  assert.equal(index.counts.identicalCompendiumMirrors, 46);
  assert.equal(index.counts.historicalCompendiumVariants, 24);
});

test('every source-library entry resolves to one hashed canonical file', async () => {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));
  const ids = new Set();
  const paths = new Set();

  for (const entry of index.entries) {
    assert.ok(!ids.has(entry.id), `duplicate id ${entry.id}`);
    assert.ok(!paths.has(entry.canonicalPath), `duplicate path ${entry.canonicalPath}`);
    ids.add(entry.id);
    paths.add(entry.canonicalPath);

    const bytes = await readFile(new URL(`../../${entry.canonicalPath}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.canonicalPath);
    assert.equal(bytes.length, entry.bytes, entry.canonicalPath);
    assert.ok(entry.sourceRole);
    assert.ok(entry.group);
  }
});
