import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestPath = new URL(
  '../../database/sources/external/nihaixia-skill-v2.1.0-2026-07-18.json',
  import.meta.url,
);

test('Ni Haixia source remains a pinned metadata-only secondary candidate', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  assert.match(manifest.repository.commit, /^[a-f0-9]{40}$/);
  assert.equal(manifest.repository.commit, manifest.repository.tree);
  assert.equal(manifest.sourceRole, 'secondary_school_commentary_candidate');
  assert.equal(manifest.status, 'metadata_only_blocked');
  assert.equal(manifest.ingestionDecision.mode, 'metadata_only');
  assert.equal(manifest.productEligibility, 'blocked');
  assert.deepEqual(manifest.runtimeEligibleFields, []);
});

test('Ni Haixia source records license and primary-witness blockers', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  assert.equal(manifest.license.status, 'unresolved');
  assert.equal(manifest.license.repositoryLicenseFilePresent, false);
  assert.equal(manifest.rawWitnesses.availableInPinnedRepository, false);
  assert.ok(manifest.ingestionDecision.forbiddenUses.includes('classical_primary_witness'));
  assert.ok(manifest.ingestionDecision.forbiddenUses.includes('accepted_claim_source'));
  assert.ok(manifest.ingestionDecision.forbiddenUses.includes('runtime_medical_guidance'));
  assert.ok(manifest.ingestionDecision.promotionRequirements.length >= 5);
});

test('Ni Haixia coverage map cannot silently promote distilled modules', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  assert.equal(manifest.coverageGapAssessment.length, 7);
  assert.ok(manifest.coverageGapAssessment.some(item => item.topic === '医案语料'));
  assert.ok(manifest.coverageGapAssessment.some(item => item.topic === '访谈、闭门课与汉唐文章'));
  for (const item of manifest.coverageGapAssessment) {
    assert.ok(
      ['discovery_only', 'blocked_structural_gap'].includes(item.ingestionStatus),
      `${item.topic} must remain non-ingestible`,
    );
  }
});
