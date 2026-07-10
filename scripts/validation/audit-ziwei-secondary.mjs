import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BRANCHES } from '../../src/modules/ziwei/data.js';
import { paiZiwei } from '../../src/modules/ziwei/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packagePath = process.env.IZTRO_PACKAGE_PATH || '/tmp/tianji-ziwei-validator/node_modules/iztro';
const packageJsonPath = path.join(packagePath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  throw new Error('iztro is missing; install iztro@2.5.8 in /tmp/tianji-ziwei-validator or set IZTRO_PACKAGE_PATH');
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'iztro' || packageJson.version !== '2.5.8') {
  throw new Error(`expected iztro@2.5.8, received ${packageJson.name}@${packageJson.version}`);
}

const require = createRequire(import.meta.url);
const { astro } = require(packagePath);
const categories = {};
const examples = [];
let charts = 0;
let fields = 0;

function compare(category, id, actual, expected) {
  fields += 1;
  const summary = categories[category] ?? { fields: 0, mismatches: 0 };
  summary.fields += 1;
  if (actual !== expected) {
    summary.mismatches += 1;
    if (examples.length < 100) examples.push({ category, id, actual, expected });
  }
  categories[category] = summary;
}

const normalizePalace = (name) => (name.startsWith('仆役') ? '交友' : name.replace('宫', ''));

for (let year = 1990; year <= 1999; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    for (let timeIndex = 0; timeIndex < 12; timeIndex += 1) {
      for (const gender of ['male', 'female']) {
        const day = 15;
        const ours = paiZiwei(year, month, day, BRANCHES[timeIndex], gender);
        const reference = astro.bySolar(
          `${year}-${month}-${day}`,
          timeIndex,
          gender === 'male' ? '男' : '女',
          false,
          'zh-CN',
        );
        charts += 1;
        const id = `${year}-${month}-${day}/${BRANCHES[timeIndex]}/${gender}`;

        compare('lunar', `${id}:month`, ours.lunar.lunarMonth, reference.rawDates.lunarDate.lunarMonth);
        compare('lunar', `${id}:day`, ours.lunar.lunarDay, reference.rawDates.lunarDate.lunarDay);
        compare('lunar', `${id}:stem`, ours.lunar.yearStem, reference.rawDates.chineseDate.yearly[0]);
        compare('lunar', `${id}:branch`, ours.lunar.yearBranch, reference.rawDates.chineseDate.yearly[1]);
        compare('core', `${id}:ming`, ours.mingGong.branch, reference.earthlyBranchOfSoulPalace);
        compare('core', `${id}:shen`, ours.shenGong.branch, reference.earthlyBranchOfBodyPalace);
        compare('core', `${id}:bureau`, ours.juName, reference.fiveElementsClass);

        const referencePalaces = {};
        const referenceStars = {};
        const referenceSihua = {};
        for (const palace of reference.palaces) {
          referencePalaces[normalizePalace(palace.name)] = {
            branch: palace.earthlyBranch,
            stem: palace.heavenlyStem,
          };
          for (const star of [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars]) {
            referenceStars[star.name] = palace.earthlyBranch;
            if (star.mutagen) referenceSihua[star.name] = star.mutagen;
          }
        }

        for (const palace of ours.palaces) {
          const name = palace.palaceName.replace('宫', '');
          compare('palace', `${id}:${name}:branch`, palace.branch, referencePalaces[name]?.branch);
          compare('palace', `${id}:${name}:stem`, palace.palaceStem, referencePalaces[name]?.stem);
        }
        for (const [name, branch] of Object.entries(ours.mainStarPositions)) {
          compare('main_stars', `${id}:${name}`, branch, referenceStars[name]);
        }
        for (const [name, branch] of Object.entries(ours.auxStarPositions)) {
          compare('aux_stars', `${id}:${name}`, branch, referenceStars[name]);
        }
        for (const [name, transform] of Object.entries(ours.sihua)) {
          compare('four_transformations', `${id}:${name}`, transform, referenceSihua[name]);
        }

        const referenceDayun = reference.palaces
          .map((palace) => ({
            stem: palace.decadal.heavenlyStem,
            branch: palace.decadal.earthlyBranch,
            startAge: palace.decadal.range[0],
            endAge: palace.decadal.range[1],
          }))
          .sort((a, b) => a.startAge - b.startAge);
        ours.dayun.forEach((period, index) => {
          for (const key of ['stem', 'branch', 'startAge', 'endAge']) {
            compare('dayun', `${id}:${index}:${key}`, period[key], referenceDayun[index]?.[key]);
          }
        });
      }
    }
  }
}

const mismatches = Object.values(categories).reduce((sum, category) => sum + category.mismatches, 0);
const relevantSource = fs.readFileSync(path.join(packagePath, 'lib/star/location.js'), 'utf8');
const artifact = {
  audit: 'ziwei_secondary_iztro',
  generatedAt: '2026-07-10',
  result: mismatches === 0 ? 'pass' : 'fail',
  secondaryImplementation: {
    package: `${packageJson.name}@${packageJson.version}`,
    license: packageJson.license,
    repository: packageJson.repository,
    starLocationSourceSha256: crypto.createHash('sha256').update(relevantSource).digest('hex'),
  },
  conventions: {
    leapMonth: 'fixLeap=false; reuse base lunar month number',
    palaceAlias: 'project 交友 equals reference 仆役',
    language: 'zh-CN',
  },
  summary: { charts, fields, mismatches, categories },
  boundaries: [
    'iztro is an independent implementation, not proof that traditional predictive claims are factual.',
    'The comparison covers the declared shared star-table and leap-month conventions only.',
    'No personality, health, marriage, wealth, timing, or fate interpretation is compared.',
  ],
  examples,
};
const outputPath = path.join(root, 'docs/validation/artifacts/ziwei-secondary-audit-2026-07-10.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.summary, null, 2));
if (mismatches > 0) process.exitCode = 1;
