import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import {
  BRANCH_RELATIONS,
  HUAGAI,
  STEM_COMBINE,
  TAOHUA,
  YIMA,
} from '../../src/modules/bazi/data.js';
import {
  BAZI_RELATION_MODEL,
  BAZI_SHENSHA_MODEL,
  detectBranchInteractions,
  detectShensha,
} from '../../src/modules/bazi/engine.js';

const outputPath = path.resolve(
  'docs/validation/artifacts/bazi-relations-audit-2026-07-09.json',
);

const expected = {
  stemCombines: ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'],
  liuhe: ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'],
  liuchong: ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'],
  sanhe: ['申子辰', '亥卯未', '寅午戌', '巳酉丑'],
  sanhui: ['寅卯辰', '巳午未', '申酉戌', '亥子丑'],
  liuhai: ['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌'],
  sanxingPairs: ['寅巳', '巳申', '申寅', '丑戌', '戌未', '未丑', '子卯'],
  zixing: ['辰', '午', '酉', '亥'],
  poCandidate: ['子酉', '丑辰', '寅亥', '卯午', '巳申', '未戌'],
  taohua: {
    寅: '卯', 午: '卯', 戌: '卯',
    申: '酉', 子: '酉', 辰: '酉',
    巳: '午', 酉: '午', 丑: '午',
    亥: '子', 卯: '子', 未: '子',
  },
  yima: {
    寅: '申', 午: '申', 戌: '申',
    申: '寅', 子: '寅', 辰: '寅',
    巳: '亥', 酉: '亥', 丑: '亥',
    亥: '巳', 卯: '巳', 未: '巳',
  },
  huagai: {
    寅: '戌', 午: '戌', 戌: '戌',
    申: '辰', 子: '辰', 辰: '辰',
    巳: '丑', 酉: '丑', 丑: '丑',
    亥: '未', 卯: '未', 未: '未',
  },
};

const actual = {
  stemCombines: STEM_COMBINE.map(({ pair }) => pair.join('')),
  liuhe: BRANCH_RELATIONS.liuhe.map(({ pair }) => pair.join('')),
  liuchong: BRANCH_RELATIONS.liuchong.map(({ pair }) => pair.join('')),
  sanhe: BRANCH_RELATIONS.sanhe.map(({ members }) => members.join('')),
  sanhui: BRANCH_RELATIONS.sanhui.map(({ members }) => members.join('')),
  liuhai: BRANCH_RELATIONS.liuhai.map(({ pair }) => pair.join('')),
  sanxingPairs: BRANCH_RELATIONS.sanxing.flatMap(({ pairs }) => (
    pairs.map(({ pair }) => pair.join(''))
  )),
  zixing: BRANCH_RELATIONS.zixing,
  poCandidate: BRANCH_RELATIONS.po.map(({ pair }) => pair.join('')),
  taohua: TAOHUA,
  yima: YIMA,
  huagai: HUAGAI,
};

const compare = (key) => ({
  expected: expected[key],
  actual: actual[key],
  matches: JSON.stringify(expected[key]) === JSON.stringify(actual[key]),
});

const finiteTables = Object.fromEntries(Object.keys(expected).map((key) => [
  key,
  compare(key),
]));

const interactionProbes = {
  pairPunishment: detectBranchInteractions(['寅', '巳', '子', '丑']),
  completePunishment: detectBranchInteractions(['寅', '巳', '申', '子']),
  threeCombination: detectBranchInteractions(['申', '子', '辰', '午']),
  disputedBreaking: detectBranchInteractions(['子', '酉', '寅', '亥']),
};
const shenshaProbe = detectShensha('子', '午', ['午', '酉', '寅', '辰']);

const sourceFiles = [
  'src/modules/bazi/data.js',
  'src/modules/bazi/engine.js',
  'src/modules/bazi/BaziModule.jsx',
  'scripts/validation/audit-bazi-relations.mjs',
];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const dirtyFiles = git('status', '--short').split('\n').filter(Boolean);

const report = {
  auditDate: '2026-07-09',
  conclusion: 'relation_tables_pass_transformation_and_interpretation_blocked',
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
    stemAndBranchCompendium: 'database/xuanxue/compendium-new/00-cosmology/03-tiangan-dizhi.md',
    shenshaCompendium: 'database/xuanxue/compendium-new/reference/shensha-table.md',
    sanMingLiuhe: 'https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1yasl',
    sanMingSanhe: 'https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1ynfp',
    sanMingSixHarms: 'https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1z02t',
    sanMingPunishments: 'https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1zcpx',
    sanMingClashes: 'https://www.shidianguji.com/book/SK1610/chapter/1kt0ayvn4fjf7',
    sanMingTransformationConditions: 'https://www.shidianguji.com/book/SK1610/chapter/1kf5v7gfo2iwj',
    sanMingXianchi: 'https://zh.wikisource.org/wiki/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E4%BA%8C',
    sanMingYima: 'https://www.shidianguji.com/zh/book/SK1610/chapter/1kt6e3p8yn2uf',
    wuXingJingJi: 'https://ctext.org/wiki.pl?chapter=727777&if=gb',
  },
  contracts: {
    relation: BAZI_RELATION_MODEL,
    shensha: BAZI_SHENSHA_MODEL,
  },
  finiteTables,
  interactionProbes,
  shenshaProbe,
  limitations: [
    'The finite lookup tables are validated; no relationship is interpreted as inherently auspicious or harmful.',
    'Transformation candidates are metadata only because month command, exposed stems, obstruction, and strength conditions are not evaluated.',
    'Branch breaking remains inactive because source traditions disagree, especially for Yin-Hai and Si-Shen.',
    'Shensha lookup labels do not validate personality, health, event, or luck claims.',
  ],
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

const passed = (
  Object.values(finiteTables).every(({ matches }) => matches)
  && interactionProbes.pairPunishment.some(({ label }) => label === '寅刑巳')
  && interactionProbes.completePunishment.filter(({ type }) => type === '三刑').length === 1
  && interactionProbes.completePunishment.every(({ type }) => type !== '相刑')
  && interactionProbes.threeCombination.some(({ label, transformationStatus }) => (
    label === '申子辰三合' && transformationStatus === 'not_evaluated'
  ))
  && interactionProbes.disputedBreaking.every(({ type }) => type !== '相破')
  && shenshaProbe.length === 3
  && shenshaProbe.every(({ validationStatus }) => validationStatus === 'lookup_only')
);

console.log(JSON.stringify({
  conclusion: report.conclusion,
  finiteTables: Object.fromEntries(Object.entries(finiteTables).map(([key, value]) => [
    key,
    value.matches,
  ])),
  probes: {
    pairPunishment: interactionProbes.pairPunishment,
    completePunishment: interactionProbes.completePunishment,
    shensha: shenshaProbe,
  },
  output: outputPath,
}, null, 2));

process.exitCode = passed ? 0 : 1;
