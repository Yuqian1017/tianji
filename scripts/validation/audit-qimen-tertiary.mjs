import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packagePath = process.env.KINQIMEN_PACKAGE_PATH || '/tmp/tianji-qimen-validator/node_modules/kinqimen';
const packageJsonPath = path.join(packagePath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  throw new Error('kinqimen is missing; install kinqimen@0.3.1 in /tmp/tianji-qimen-validator or set KINQIMEN_PACKAGE_PATH');
}
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'kinqimen' || packageJson.version !== '0.3.1') {
  throw new Error(`expected kinqimen@0.3.1, received ${packageJson.name}@${packageJson.version}`);
}

const { Qimen } = await import(pathToFileURL(path.join(packagePath, 'dist/index.js')));
const { paiQimen } = await import('../../src/modules/qimen/engine.js');
const palaceNames = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离' };
const numerals = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const deityNames = { 值符: '符', 螣蛇: '蛇', 太阴: '阴', 六合: '合', 白虎: '虎', 玄武: '玄', 九地: '地', 九天: '天' };
const HOURS = [...Array.from({ length: 12 }, (_, index) => index * 2), 23];
const categories = {};
const examples = [];
const exclusions = { dutyStarCenterPosition: 0, dutyDoorAlgorithmCharts: 0, dutyDoorAlgorithmFields: 0 };
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

for (let month = 1; month <= 12; month += 1) {
  const days = new Date(Date.UTC(2024, month, 0)).getUTCDate();
  for (let day = 1; day <= days; day += 1) {
    for (const hour of HOURS) {
      const minute = 30;
      const id = `2024-${month}-${day} ${hour}:${minute}`;
      const ours = paiQimen(2024, month, day, hour, minute);
      const reference = new Qimen({ year: 2024, month, day, hour, minute }).pan();
      charts += 1;

      compare('calendar', `${id}/term`, ours.meta.jieqi, reference.jieqi);
      compare('core', `${id}/xun`, ours.meta.xunShou, reference.xunHead);
      compare('core', `${id}/ju`, `${ours.meta.dunTypeCn[0]}${numerals[ours.meta.juNum]}局${ours.meta.yuan[0]}`, reference.ju);
      compare('duty', `${id}/star`, ours.zhifu.replace('天', ''), reference.zhifuZhishi.zhifuStarGong[0]);
      compare('duty', `${id}/gate`, ours.zhishi.replace('门', ''), reference.zhifuZhishi.zhishiDoorGong[0]);
      if (reference.zhifuZhishi.zhifuStarGong[1] === '中') {
        exclusions.dutyStarCenterPosition += 1;
      } else {
        compare('duty', `${id}/star_destination`, palaceNames[ours.zhifuGong], reference.zhifuZhishi.zhifuStarGong[1]);
      }

      exclusions.dutyDoorAlgorithmCharts += 1;
      exclusions.dutyDoorAlgorithmFields += 9;

      for (let palace = 1; palace <= 9; palace += 1) {
        const name = palaceNames[palace];
        const gong = ours.gongs[palace];
        compare('earth_plate', `${id}/${palace}`, gong.diGan, reference.earthPan[name]);
        compare('heaven_plate', `${id}/${palace}`, gong.tianGan, reference.skyPan[name]);
        if (palace !== 5) {
          const star = gong.lodgedStar ? '禽' : gong.star.replace('天', '');
          compare('star_plate', `${id}/${palace}`, star, reference.starPan[name]);
          compare('deity_plate', `${id}/${palace}`, deityNames[gong.shen], reference.godPan[name]);
        }
      }
    }
  }
}

const mismatches = Object.values(categories).reduce((sum, category) => sum + category.mismatches, 0);
const source = fs.readFileSync(path.join(packagePath, 'dist/index.js'), 'utf8');
const artifact = {
  audit: 'qimen_tertiary_kinqimen_shared_conventions',
  generatedAt: '2026-07-10',
  result: mismatches === 0 ? 'pass_shared_conventions' : 'fail',
  tertiaryImplementation: {
    package: `${packageJson.name}@${packageJson.version}`,
    license: packageJson.license,
    relevantSourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  },
  summary: { charts, fields, mismatches, exclusions, categories },
  boundaries: [
    'kinqimen indexes its duty-door table by hour-stem index; this differs from the declared xun-step duty-door algorithm used by the project and 3meta.',
    'All duty-door destinations and gate-plate fields are therefore excluded, counted, and not treated as agreement.',
    'kinqimen also reports center duty-star destinations as center; those positions are excluded and counted.',
    'All shared-convention fields must match with zero mismatches for this artifact to pass.',
    'The GPL package remains isolated and is not a product dependency.',
  ],
  examples,
};
const outputPath = path.join(root, 'docs/validation/artifacts/qimen-tertiary-audit-2026-07-10.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.summary, null, 2));
if (mismatches > 0) process.exitCode = 1;
