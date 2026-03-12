/**
 * 八字看健康 — BaZi Health Analysis Engine
 */
import { paiBazi } from '../bazi/engine.js';
import { STEM_WUXING, BRANCH_WUXING, WUXING_CN, WUXING_ORDER } from '../bazi/data.js';
import { WUXING_HEALTH, SHICHEN_HEALTH } from './data.js';

/**
 * Analyze BaZi for health implications.
 * @param {object} baziResult — result from paiBazi()
 * @returns {object} health analysis
 */
export function analyzeBaziHealth(baziResult) {
  const { wuxingCount, dayMasterWuxing, strength, pillars } = baziResult;

  // Total element count for percentage calculation
  const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0) || 1;

  // Classify each element: weak (≤1), normal (2-3), excess (≥4)
  const elementStatus = {};
  for (const el of WUXING_ORDER) {
    const count = wuxingCount[el] || 0;
    const pct = Math.round((count / total) * 100);
    let status = 'normal';
    if (count <= 1) status = 'weak';
    else if (count >= 4) status = 'excess';
    elementStatus[el] = { count, pct, status };
  }

  // Find weak and excess elements
  const weakElements = WUXING_ORDER.filter(el => elementStatus[el].status === 'weak');
  const excessElements = WUXING_ORDER.filter(el => elementStatus[el].status === 'excess');

  // Map to organ risks
  const organRisks = [];
  for (const el of weakElements) {
    const health = WUXING_HEALTH[el];
    if (health) {
      organRisks.push({
        element: el,
        type: 'weak',
        organs: health.organs,
        description: health.weak,
        symptoms: health.symptoms,
        risks: health.risks,
        nurture: health.nurture,
      });
    }
  }
  for (const el of excessElements) {
    const health = WUXING_HEALTH[el];
    if (health) {
      organRisks.push({
        element: el,
        type: 'excess',
        organs: health.organs,
        description: health.excess,
        symptoms: health.symptoms,
        risks: health.risks,
        nurture: health.nurture,
      });
    }
  }

  // Birth hour health significance
  const hourBranch = pillars.hour.branch;
  const shichenNote = SHICHEN_HEALTH[hourBranch] || '';

  // Day master element health
  const dayMasterHealth = WUXING_HEALTH[dayMasterWuxing];

  return {
    elementStatus,
    weakElements,
    excessElements,
    organRisks,
    dayMasterWuxing,
    dayMasterHealth,
    strength,
    shichenNote,
    hourBranch,
  };
}

/**
 * Get life-stage health risks from dayun periods.
 */
export function getLifeStageRisks(baziResult) {
  const { dayun, dayMasterWuxing } = baziResult;
  if (!dayun?.length) return [];

  const currentYear = new Date().getFullYear();
  const birthYear = baziResult.birthInfo.year;
  const currentAge = currentYear - birthYear;

  return dayun.map(d => {
    const yunElement = STEM_WUXING[d.stem];
    const health = WUXING_HEALTH[yunElement];
    const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge;
    return {
      ...d,
      yunElement,
      healthFocus: health ? health.organs.join('·') : '',
      healthTip: health ? health.nurture.foods.slice(0, 3).join('、') : '',
      isCurrent,
    };
  });
}

/**
 * Get diet plan based on weak elements.
 */
export function getDietPlan(weakElements) {
  const plans = [];
  for (const el of weakElements) {
    const health = WUXING_HEALTH[el];
    if (health) {
      plans.push({
        element: el,
        elementCn: WUXING_CN[el],
        organs: health.organs,
        foods: health.nurture.foods,
        avoid: health.nurture.avoid,
      });
    }
  }
  return plans;
}

/**
 * Run paiBazi and then health analysis — convenience wrapper for the module.
 */
export function runHealthAnalysis(year, month, day, hour, minute, gender) {
  const baziResult = paiBazi(year, month, day, hour, minute, gender);
  const healthResult = analyzeBaziHealth(baziResult);
  const lifeStages = getLifeStageRisks(baziResult);
  const dietPlan = getDietPlan(healthResult.weakElements);
  return { baziResult, healthResult, lifeStages, dietPlan };
}

/**
 * Format health analysis for AI interpretation.
 */
export function formatForAI(baziResult, healthResult, lifeStages, dietPlan) {
  const p = baziResult.pillars;
  const lines = ['【八字健康分析】'];

  lines.push(`四柱: ${p.year.stem}${p.year.branch} ${p.month.stem}${p.month.branch} ${p.day.stem}${p.day.branch} ${p.hour.stem}${p.hour.branch}`);
  lines.push(`日主: ${baziResult.dayStem}(${WUXING_CN[baziResult.dayMasterWuxing]})`);
  lines.push(`身强弱: ${healthResult.strength.label}(${healthResult.strength.score}分)`);

  lines.push('\n五行分布:');
  for (const el of WUXING_ORDER) {
    const s = healthResult.elementStatus[el];
    lines.push(`  ${WUXING_CN[el]}: ${s.count}个(${s.pct}%) — ${s.status === 'weak' ? '偏弱' : s.status === 'excess' ? '偏旺' : '适中'}`);
  }

  if (healthResult.weakElements.length > 0) {
    lines.push(`\n偏弱五行: ${healthResult.weakElements.map(e => WUXING_CN[e]).join('、')}`);
  }
  if (healthResult.excessElements.length > 0) {
    lines.push(`偏旺五行: ${healthResult.excessElements.map(e => WUXING_CN[e]).join('、')}`);
  }

  lines.push('\n脏腑健康风险:');
  for (const risk of healthResult.organRisks) {
    lines.push(`  ${WUXING_CN[risk.element]}(${risk.type === 'weak' ? '偏弱' : '偏旺'}): ${risk.organs.join('·')}`);
    lines.push(`    症状: ${risk.description}`);
    lines.push(`    风险: ${risk.risks}`);
  }

  if (healthResult.shichenNote) {
    lines.push(`\n出生时辰(${healthResult.hourBranch}时): ${healthResult.shichenNote}`);
  }

  if (healthResult.dayMasterHealth) {
    lines.push(`\n日主${WUXING_CN[healthResult.dayMasterWuxing]}行 关联脏腑: ${healthResult.dayMasterHealth.organs.join('·')}`);
  }

  if (lifeStages.length > 0) {
    lines.push('\n大运健康关注:');
    for (const stage of lifeStages) {
      const marker = stage.isCurrent ? '← 当前' : '';
      lines.push(`  ${stage.startAge}-${stage.endAge}岁 ${stage.stem}${stage.branch}(${WUXING_CN[stage.yunElement]}) → 关注: ${stage.healthFocus} ${marker}`);
    }
  }

  if (dietPlan.length > 0) {
    lines.push('\n食疗建议:');
    for (const plan of dietPlan) {
      lines.push(`  补${plan.elementCn}(${plan.organs.join('·')}): ${plan.foods.join('、')}`);
      lines.push(`  忌: ${plan.avoid.join('、')}`);
    }
  }

  lines.push('\n请从中医五行角度全面分析此人的先天体质和健康趋势，给出具体的养生建议。');
  return lines.join('\n');
}
