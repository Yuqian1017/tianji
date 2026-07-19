import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestPath = new URL(
  '../../database/sources/external/nihaixia-skill-v2.1.0-2026-07-18.json',
  import.meta.url,
);
const nishiManifestPath = new URL(
  '../../database/sources/external/nihaisha-nishi-tcm-2026-07-18.json',
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

test('nihaisha-nishi-tcm remains a pinned evidence locator, not an ingestible content source', async () => {
  const manifest = JSON.parse(await readFile(nishiManifestPath, 'utf8'));

  assert.equal(manifest.repository.commit, 'e3cb51359a5ef9fc0725132814d474168bb8de24');
  assert.equal(manifest.repository.tree, 'fe50e135ddaec3f405bf72e117fdfee06f23a970');
  assert.equal(manifest.repositoryInventory.files, 3094);
  assert.equal(manifest.repositoryInventory.screenshotWebpFiles, 2986);
  assert.equal(manifest.sourceRole, 'secondary_course_evidence_and_classical_locator_candidate');
  assert.equal(manifest.adoptionDecision.mode, 'ingest_transformed_metadata_and_validation_routes_only');
  assert.equal(manifest.productEligibility, 'blocked');
  assert.deepEqual(manifest.runtimeEligibleFields, []);
});

test('nihaisha-nishi-tcm records source identity and rights blockers', async () => {
  const manifest = JSON.parse(await readFile(nishiManifestPath, 'utf8'));

  assert.equal(manifest.license.repositoryLicenseFilePresent, false);
  assert.match(manifest.license.status, /no_standard_open_source_license/);
  assert.equal(manifest.evidenceArchitecture.pdfEvidence.documents, 22);
  assert.equal(manifest.evidenceArchitecture.pdfEvidence.physicalPageCards, 10538);
  assert.equal(manifest.evidenceArchitecture.pdfEvidence.documentsWithSourceSha256, 0);
  assert.equal(manifest.evidenceArchitecture.pdfEvidence.documentsWithEditionOrPublicationMetadata, 0);
  assert.ok(manifest.adoptionDecision.forbiddenUses.includes('bulk_course_or_screenshot_copy'));
  assert.ok(manifest.adoptionDecision.forbiddenUses.includes('classical_primary_witness'));
});

test('nihaisha-nishi-tcm routes all four pending classics without promoting corrections', async () => {
  const manifest = JSON.parse(await readFile(nishiManifestPath, 'utf8'));
  const works = manifest.classicalValidationRouting.map(item => item.work);

  assert.deepEqual(works, ['黄帝内经灵枢', '难经', '伤寒论', '金匮要略']);
  assert.ok(manifest.classicalValidationRouting.every(
    item => item.ingestionStatus === 'locator_only_independent_primary_witness_required',
  ));
  assert.equal(manifest.classicalSignalAudit.lingshu.standaloneSourceManifestEntry, false);
  assert.equal(manifest.classicalSignalAudit.nanjing.standaloneSourceManifestEntry, false);
  assert.equal(manifest.crossRepositoryCorrectionReview.upstreamDecisionRows, 51);
  assert.equal(manifest.crossRepositoryCorrectionReview.directCorrectionsApplied, 0);
});
