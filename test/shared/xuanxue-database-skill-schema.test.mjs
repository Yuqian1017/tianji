import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcePath = new URL(
  '../../database/sources/external/xuanxue-database-skill-2026-07-18.json',
  import.meta.url,
);
const schemaPath = new URL(
  '../../database/learning/practice-evidence-schema-candidate.json',
  import.meta.url,
);

test('xuanxue-database-skill is a pinned MIT design reference, not a knowledge source', async () => {
  const source = JSON.parse(await readFile(sourcePath, 'utf8'));

  assert.match(source.repository.commit, /^[a-f0-9]{40}$/);
  assert.match(source.repository.tree, /^[a-f0-9]{40}$/);
  assert.equal(source.license.spdx, 'MIT');
  assert.equal(source.license.repositoryLicenseFilePresent, true);
  assert.equal(source.license.localLicensePath, 'database/licenses/XUANXUE_DATABASE_SKILL_MIT.txt');
  assert.equal(source.contentScope.type, 'database_schema_and_workflow');
  assert.equal(source.contentScope.containsClassicalFullText, false);
  assert.equal(source.contentScope.containsStructuredTraditionalKnowledge, false);
  assert.equal(source.adoptionDecision.mode, 'adapt_schema_concepts_only');
  assert.deepEqual(source.runtimeEligibleFields, []);
});

test('practice evidence cannot promote source authority or learning mastery', async () => {
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
  const method = schema.entities.methodReference;

  assert.equal(schema.status, 'design_candidate_not_runtime');
  assert.ok(method.required.includes('authorityStatus'));
  assert.ok(method.required.includes('practiceStatus'));
  assert.match(method.rule, /cannot promote authority status/);
  assert.equal(schema.metricContract.automaticAuthorityPromotion, false);
  assert.equal(schema.metricContract.automaticMasteryUpdate, false);
  assert.equal(schema.entities.learningReflection.fields.masteryEffect, 'none');
  assert.deepEqual(schema.runtimeEligibleFields, []);
});

test('claims are reproducible, preregistered, append-only, and denominator-complete', async () => {
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
  const claim = schema.entities.predictionClaim;
  const requiredClaimFields = [
    'methodIds',
    'statement',
    'createdAt',
    'lockedAt',
    'timeWindow',
    'observableCriteria',
    'disconfirmationCriteria',
  ];

  for (const field of requiredClaimFields) assert.ok(claim.required.includes(field), field);
  for (const field of ['statement', 'timeWindow', 'observableCriteria', 'disconfirmationCriteria']) {
    assert.ok(claim.immutableAfterLock.includes(field), field);
  }
  assert.ok(schema.entities.practiceCase.required.includes('engineContract'));
  assert.ok(schema.entities.practiceCase.required.includes('schoolContract'));
  assert.ok(schema.metricContract.requiredDenominators.includes('not_supported'));
  assert.ok(schema.metricContract.requiredDenominators.includes('missing_follow_up'));
  assert.ok(schema.metricContract.requiredDenominators.includes('expired_unreviewed'));
  assert.equal(schema.metricContract.partialSupportDefault, 'reported_separately_not_counted_as_supported');
});

test('privacy and high-stakes exclusions fail closed', async () => {
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

  assert.equal(schema.privacyContract.defaultSubjectIdentity, 'pseudonymous');
  assert.equal(schema.privacyContract.publicExportDefault, 'deny');
  assert.equal(schema.privacyContract.cloudExactBirthDataDefault, 'do_not_store');
  assert.ok(schema.privacyContract.publicExportDeniedFields.includes('real_name'));
  assert.ok(schema.privacyContract.publicExportDeniedFields.includes('exact_birth_datetime'));
  assert.ok(schema.invariants.includes('high_stakes_medical_legal_financial_and_safety_claims_are_not_scored'));
  assert.match(schema.productEligibility, /^blocked_/);
});
