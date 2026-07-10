/**
 * 八字看健康 — BaZi Health Analysis Engine
 */
import { paiBazi } from '../bazi/engine.js';

export const BAZI_HEALTH_VALIDATION_GATE = Object.freeze({
  status: 'blocked',
  code: 'UNVALIDATED_BAZI_HEALTH_INFERENCE',
  reason: '八字五行结构计数尚未通过旺衰验证，也没有医学证据支持其推导脏腑风险、食疗或健康走势。',
});

/**
 * Analyze BaZi for health implications.
 * @param {object} baziResult — result from paiBazi()
 * @returns {object} health analysis
 */
export function analyzeBaziHealth(baziResult) {
  const { dayMasterWuxing, strength, pillars } = baziResult;

  return {
    validationStatus: BAZI_HEALTH_VALIDATION_GATE.status,
    blockCode: BAZI_HEALTH_VALIDATION_GATE.code,
    blockReason: BAZI_HEALTH_VALIDATION_GATE.reason,
    elementStatus: {},
    weakElements: [],
    excessElements: [],
    organRisks: [],
    dayMasterWuxing,
    dayMasterHealth: null,
    strength,
    shichenNote: '',
    hourBranch: pillars.hour.branch,
  };
}

/**
 * Get life-stage health risks from dayun periods.
 */
export function getLifeStageRisks() {
  return [];
}

/**
 * Get diet plan based on weak elements.
 */
export function getDietPlan() {
  return [];
}

/**
 * Run paiBazi and then health analysis — convenience wrapper for the module.
 */
export function runHealthAnalysis(year, month, day, hour, minute, gender) {
  const baziResult = paiBazi(year, month, day, hour, minute, gender);
  const healthResult = analyzeBaziHealth(baziResult);
  const lifeStages = [];
  const dietPlan = [];
  return { baziResult, healthResult, lifeStages, dietPlan };
}

/**
 * Format health analysis for AI interpretation.
 */
export function formatForAI() {
  throw new Error('BaZi health validation is blocked; AI health inference is disabled.');
}
