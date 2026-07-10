import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import {
  BAZI_STRENGTH_MODEL,
  BAZI_WUXING_COUNT_MODEL,
  formatForAI as formatBaziForAI,
  paiBazi,
} from '../../src/modules/bazi/engine.js';
import {
  BAZI_HEALTH_VALIDATION_GATE,
  runHealthAnalysis,
} from '../../src/modules/bazihealth/engine.js';

const outputPath = path.resolve(
  'docs/validation/artifacts/bazi-strength-audit-2026-07-09.json',
);

const fixtures = [
  {
    id: 'DTS-WANGJI-01',
    input: [2012, 2, 23, 12, 0, 'male'],
    expectedPillars: ['壬辰', '壬寅', '甲寅', '庚午'],
    sourceAssessment: '旺极；午火为用；庚金为病，不可把官杀与食伤一并判喜',
    legacyGenericDirection: '喜克泄耗：官杀·食伤·财星',
    conflict: true,
  },
  {
    id: 'DTS-CONGSHI-01',
    input: [1993, 12, 8, 18, 0, 'male'],
    expectedPillars: ['癸酉', '甲子', '癸亥', '辛酉'],
    sourceAssessment: '金水旺极，取金水而不取火土；顺势结论与普通身旺扶抑方向相反',
    legacyGenericDirection: '喜克泄耗：官杀·食伤·财星',
    conflict: true,
  },
].map((fixture) => {
  const result = paiBazi(...fixture.input);
  const pillars = Object.values(result.pillars)
    .map(({ stem, branch }) => stem + branch);
  const aiText = formatBaziForAI(result);
  return {
    ...fixture,
    pillars,
    pillarsMatch: JSON.stringify(pillars) === JSON.stringify(fixture.expectedPillars),
    runtimeUnderlyingModel: {
      score: result.strength.score,
      label: result.strength.label,
      displayLabel: result.strength.displayLabel,
      validationStatus: result.strength.validationStatus,
    },
    productExposure: {
      numericScoreSentToAI: /\/100/.test(aiText),
      fixedYongShenSentToAI: /用神方向：/.test(aiText),
      heuristicWarningSentToAI: /未校勘启发式/.test(aiText),
    },
  };
});

const healthResult = runHealthAnalysis(1993, 12, 8, 18, 0, 'male');
const sourceFiles = [
  'src/modules/bazi/engine.js',
  'src/modules/bazi/prompt.js',
  'src/modules/bazi/BaziModule.jsx',
  'src/modules/bazihealth/engine.js',
  'src/modules/bazihealth/BaziHealthModule.jsx',
  'src/modules/bazihealth/prompt.js',
  'scripts/validation/audit-bazi-strength.mjs',
];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const dirtyFiles = git('status', '--short').split('\n').filter(Boolean);

const report = {
  auditDate: '2026-07-09',
  conclusion: 'failed_as_authoritative_model_product_exposure_mitigated',
  sourceProvenance: {
    gitCommit: git('rev-parse', 'HEAD'),
    workingTreeDirty: dirtyFiles.length > 0,
    dirtyFiles,
    sourceSha256: Object.fromEntries(sourceFiles.map((file) => [
      file,
      crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    ])),
  },
  sources: {
    compendiumSimplification: 'database/xuanxue/compendium-new/04-bazi/03-geju.md',
    diTianSuiStrength: 'https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93/12',
    diTianSuiCases: 'https://ctext.org/wiki.pl?chapter=126492&if=gb',
    ziPingYongShen: 'https://ctext.org/wiki.pl?chapter=974137&if=gb',
  },
  modelContract: {
    strength: BAZI_STRENGTH_MODEL,
    wuxingCount: BAZI_WUXING_COUNT_MODEL,
    sourceVsRuntime: {
      compendium: '月令五行关系；三透干各 10；有根加 15；阈值为正负 20',
      runtime: '月令十二长生 36/24/14/6；透干与统一 0.5 藏干折为 40；有根 16/4；阈值 58/38',
      sameAlgorithm: false,
    },
  },
  classicalCounterexamples: fixtures,
  healthGate: {
    ...BAZI_HEALTH_VALIDATION_GATE,
    organRisksProduced: healthResult.healthResult.organRisks.length,
    lifeStagesProduced: healthResult.lifeStages.length,
    dietPlansProduced: healthResult.dietPlan.length,
  },
  limitations: [
    'The classical examples validate contradictions in the former generic rule; they do not establish a replacement algorithm.',
    'No percentage or hidden-stem weight has been accepted as canonical.',
    'Health inference remains blocked pending separate traditional-knowledge and medical-safety evidence.',
  ],
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

const passed = (
  fixtures.every((fixture) => (
    fixture.pillarsMatch
    && fixture.conflict
    && fixture.runtimeUnderlyingModel.validationStatus === 'heuristic_only'
    && !fixture.productExposure.numericScoreSentToAI
    && !fixture.productExposure.fixedYongShenSentToAI
    && fixture.productExposure.heuristicWarningSentToAI
  ))
  && report.healthGate.status === 'blocked'
  && report.healthGate.organRisksProduced === 0
  && report.healthGate.lifeStagesProduced === 0
  && report.healthGate.dietPlansProduced === 0
);

console.log(JSON.stringify({
  conclusion: report.conclusion,
  fixtures: fixtures.map(({ id, pillarsMatch, productExposure }) => ({
    id,
    pillarsMatch,
    productExposure,
  })),
  healthGate: report.healthGate,
  output: outputPath,
}, null, 2));

process.exitCode = passed ? 0 : 1;
