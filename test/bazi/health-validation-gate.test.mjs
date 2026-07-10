import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BAZI_HEALTH_VALIDATION_GATE,
  formatForAI,
  runHealthAnalysis,
} from '../../src/modules/bazihealth/engine.js';

test('blocks BaZi-derived health, diet, and life-stage claims', () => {
  const result = runHealthAnalysis(1993, 12, 8, 18, 0, 'male');

  assert.equal(BAZI_HEALTH_VALIDATION_GATE.status, 'blocked');
  assert.equal(result.healthResult.validationStatus, 'blocked');
  assert.deepEqual(result.healthResult.organRisks, []);
  assert.deepEqual(result.healthResult.weakElements, []);
  assert.deepEqual(result.healthResult.excessElements, []);
  assert.deepEqual(result.lifeStages, []);
  assert.deepEqual(result.dietPlan, []);
});

test('prevents blocked BaZi health data from reaching the AI prompt', () => {
  const result = runHealthAnalysis(2012, 2, 23, 12, 0, 'male');

  assert.throws(
    () => formatForAI(
      result.baziResult,
      result.healthResult,
      result.lifeStages,
      result.dietPlan,
    ),
    /validation is blocked/i,
  );
});
