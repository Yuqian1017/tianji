/**
 * 体质辨识 — Constitution Assessment Engine
 */
import { TIZHI_QUESTIONS, TIZHI_TYPES, TIZHI_PLANS } from './data.js';

/**
 * Assess constitution from questionnaire answers.
 * @param {number[]} answers — array of scores (1-5) matching TIZHI_QUESTIONS order
 * @returns {{ primary, secondary, scores, isBalanced, plans }}
 */
export function assessConstitution(answers) {
  // Group questions by type
  const typeQuestions = {};
  TIZHI_QUESTIONS.forEach((q, i) => {
    if (!typeQuestions[q.type]) typeQuestions[q.type] = [];
    typeQuestions[q.type].push({ index: i, reverse: q.reverse });
  });

  // Calculate raw score per type (0-100 scale)
  const scores = {};
  for (const [type, questions] of Object.entries(typeQuestions)) {
    let total = 0;
    for (const { index, reverse } of questions) {
      const raw = answers[index] || 3; // default middle
      total += reverse ? (6 - raw) : raw;
    }
    // Convert to 0-100: (sum - count) / (count * 4) * 100
    const count = questions.length;
    scores[type] = Math.round(((total - count) / (count * 4)) * 100);
  }

  // Sort by score descending (exclude pinghe for primary/secondary)
  const biased = Object.entries(scores)
    .filter(([t]) => t !== 'pinghe')
    .sort((a, b) => b[1] - a[1]);

  const pingheScore = scores.pinghe || 0;
  const isBalanced = pingheScore >= 60 && biased[0][1] < 40;

  const primaryId = isBalanced ? 'pinghe' : biased[0][0];
  const secondaryId = isBalanced ? (biased[0][1] >= 30 ? biased[0][0] : null) : (biased[1][1] >= 40 ? biased[1][0] : null);

  const primary = TIZHI_TYPES.find(t => t.id === primaryId);
  const secondary = secondaryId ? TIZHI_TYPES.find(t => t.id === secondaryId) : null;
  const primaryPlan = TIZHI_PLANS[primaryId];
  const secondaryPlan = secondaryId ? TIZHI_PLANS[secondaryId] : null;

  return { primary, secondary, scores, isBalanced, primaryPlan, secondaryPlan };
}

/**
 * Format assessment result for AI interpretation.
 */
export function formatForAI(result, answers) {
  const lines = ['【体质辨识结果】'];
  lines.push(`主体质: ${result.primary.name} (得分: ${result.scores[result.primary.id]})`);
  if (result.secondary) {
    lines.push(`兼夹体质: ${result.secondary.name} (得分: ${result.scores[result.secondary.id]})`);
  }
  lines.push(`平和质得分: ${result.scores.pinghe}`);
  lines.push(`是否平和: ${result.isBalanced ? '是' : '否'}`);

  lines.push('\n各体质得分:');
  for (const type of TIZHI_TYPES) {
    lines.push(`  ${type.name}: ${result.scores[type.id]}分`);
  }

  lines.push(`\n主体质特征: ${result.primary.characteristics.join('、')}`);
  lines.push(`易患疾病: ${result.primary.susceptible}`);
  lines.push(`调理方向: ${result.primary.regulation}`);

  if (result.primaryPlan) {
    const p = result.primaryPlan;
    lines.push(`\n推荐茶饮: ${p.tea}`);
    lines.push(`推荐穴位: ${p.acupoints.join('、')} (${p.acuMethod})`);
    lines.push(`运动建议: ${p.exercise.join('、')}`);
    lines.push(`忌口: ${p.avoid.join('、')}`);
  }

  return lines.join('\n');
}
