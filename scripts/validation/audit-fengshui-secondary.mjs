import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ERSHISI_SHAN } from '../../src/modules/fengshui/data.js';
import {
  getCurrentYunForDate,
  getMonthFlyStarForDate,
  getYearFlyStarForDate,
  paiFengshui,
} from '../../src/modules/fengshui/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packagePath = process.env.XUANKONG_PACKAGE_PATH
  || '/tmp/tianji-fengshui-validator/node_modules/@soul-atelier/xuankong';
const packageJsonPath = path.join(packagePath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  throw new Error('missing @soul-atelier/xuankong; install 0.2.1 in /tmp/tianji-fengshui-validator or set XUANKONG_PACKAGE_PATH');
}
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== '@soul-atelier/xuankong' || packageJson.version !== '0.2.1') {
  throw new Error(`expected @soul-atelier/xuankong@0.2.1, received ${packageJson.name}@${packageJson.version}`);
}

const calendarPath = path.resolve(packagePath, '../calendar');
const calendarJson = JSON.parse(fs.readFileSync(path.join(calendarPath, 'package.json'), 'utf8'));
const { buildChart } = await import(pathToFileURL(path.join(packagePath, 'dist/index.mjs')));
const { tymeEngine } = await import(pathToFileURL(path.join(calendarPath, 'dist/index.mjs')));
const keyToPalace = { kan: 1, kun: 2, zhen: 3, xun: 4, center: 5, qian: 6, dui: 7, gen: 8, li: 9 };
const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const categories = {};
const examples = [];
let charts = 0;
let calendarInstants = 0;
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

function centerDegree(mountain) {
  return mountain.start < mountain.end ? (mountain.start + mountain.end) / 2 : 0;
}

for (let period = 1; period <= 9; period += 1) {
  const year = 1864 + (period - 1) * 20;
  for (const mountain of ERSHISI_SHAN) {
    const ours = paiFengshui(year, centerDegree(mountain), 2024);
    const reference = buildChart(year, mountain.name);
    charts += 1;
    compare('chart', `${period}/${mountain.name}/formation`, ours.geju.label, reference.formation);
    for (const palace of reference.palaces) {
      const num = keyToPalace[palace.key];
      compare('period_plate', `${period}/${mountain.name}/${num}`, ours.yunPan[num], palace.period);
      compare('mountain_plate', `${period}/${mountain.name}/${num}`, ours.shanPan[num], palace.mountain);
      compare('water_plate', `${period}/${mountain.name}/${num}`, ours.xiangPan[num], palace.water);
    }
  }
}

function yearForBranch(civilYear, branch) {
  return [civilYear - 1, civilYear].find(year => branches[((year - 4) % 12 + 12) % 12] === branch);
}

function monthCenter(yearBranch, monthBranch) {
  const first = '子午卯酉'.includes(yearBranch) ? 8 : '辰戌丑未'.includes(yearBranch) ? 5 : 2;
  const offset = (branches.indexOf(monthBranch) - branches.indexOf('寅') + 12) % 12;
  return ((first - offset - 1 + 18) % 9) + 1;
}

for (let year = 2020; year <= 2026; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= days; day += 1) {
      for (const hour of [0, 6, 12, 18]) {
        const minute = 30;
        const reference = tymeEngine.fourPillars(year, month, day, hour, minute);
        const effectiveYear = yearForBranch(year, reference.year.branch);
        const id = `${year}-${month}-${day} ${hour}:${minute}`;
        calendarInstants += 1;
        compare('calendar_period', id, getCurrentYunForDate(year, month, day, hour, minute).effectiveYear, effectiveYear);
        compare(
          'annual_center',
          id,
          getYearFlyStarForDate(year, month, day, hour, minute)[5],
          ((9 - (effectiveYear - 2000) - 1 + 18) % 9) + 1,
        );
        compare(
          'monthly_center',
          id,
          getMonthFlyStarForDate(year, month, day, hour, minute)[5],
          monthCenter(reference.year.branch, reference.month.branch),
        );
      }
    }
  }
}

const mismatches = Object.values(categories).reduce((sum, item) => sum + item.mismatches, 0);
const sourceFiles = [
  path.join(packagePath, 'src/chart.ts'),
  path.join(packagePath, '../core/src/mountains.ts'),
  path.join(packagePath, '../core/src/flying.ts'),
  path.join(calendarPath, 'src/tyme.ts'),
];
const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const artifact = {
  audit: 'fengshui_secondary_soul_atelier',
  generatedAt: '2026-07-10',
  result: mismatches === 0 ? 'pass' : 'fail',
  secondaryImplementations: [
    { package: `${packageJson.name}@${packageJson.version}`, license: packageJson.license, repository: packageJson.repository },
    { package: `${calendarJson.name}@${calendarJson.version}`, license: calendarJson.license, repository: calendarJson.repository },
  ],
  relevantSourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  summary: { charts, calendarInstants, fields, mismatches, categories },
  boundaries: [
    'The packages are isolated validation evidence and are not product dependencies.',
    'Chart comparison covers lower-trigram deterministic structure, not interpretive combinations.',
    'Calendar comparison uses tyme4ts-backed four pillars to independently resolve Lichun and Jie boundaries.',
  ],
  examples,
};
const output = path.join(root, 'docs/validation/artifacts/fengshui-secondary-audit-2026-07-10.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.summary, null, 2));
if (mismatches > 0) process.exitCode = 1;
