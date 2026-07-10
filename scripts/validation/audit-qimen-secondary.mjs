import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packagePath = process.env.THREEMETA_PACKAGE_PATH || '/tmp/tianji-qimen-validator/node_modules/3meta';
const packageJsonPath = path.join(packagePath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  throw new Error('3meta is missing; install 3meta@2.6.0 in /tmp/tianji-qimen-validator or set THREEMETA_PACKAGE_PATH');
}
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== '3meta' || packageJson.version !== '2.6.0') {
  throw new Error(`expected 3meta@2.6.0, received ${packageJson.name}@${packageJson.version}`);
}
if (process.env.TZ !== 'Asia/Shanghai') {
  throw new Error('secondary Qimen audit must run with TZ=Asia/Shanghai to avoid host DST normalization in 3meta/dayjs');
}

const { QimenChart } = await import(pathToFileURL(path.join(packagePath, 'lib/index.js')));
const { paiQimen } = await import('../../src/modules/qimen/engine.js');
const HOURS = [...Array.from({ length: 12 }, (_, index) => index * 2), 23];
const categories = {};
const examples = [];
let charts = 0;
let fields = 0;

function normalize(value) {
  if (Array.isArray(value)) return value[0];
  if (value === '无门' || value === '无神') return '';
  if (value === '腾蛇') return '螣蛇';
  return value;
}

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

for (let year = 2020; year <= 2024; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= days; day += 1) {
      for (const hour of HOURS) {
        const minute = 30;
        const id = `${year}-${month}-${day} ${hour}:${minute}`;
        const ours = paiQimen(year, month, day, hour, minute);
        const reference = QimenChart.fromSolar(year, month, day, hour, minute, 0).toJSON();
        const referencePalaces = Object.fromEntries(reference.palaces.map(palace => [palace.position, palace]));
        charts += 1;

        compare('calendar', `${id}/term`, ours.meta.jieqi, reference.timeInfo.solarTerm);
        compare('calendar', `${id}/year`, ours.meta.yearGZ, reference.timeInfo.chineseYear);
        compare('calendar', `${id}/month`, ours.meta.monthGZ, reference.timeInfo.chineseMonth);
        compare('calendar', `${id}/day`, ours.meta.dayGZ, reference.timeInfo.chineseDay);
        compare('calendar', `${id}/hour`, ours.meta.hourGZ, reference.timeInfo.chineseTime);
        compare('core', `${id}/dun`, ours.meta.dunTypeCn, reference.ju.type);
        compare('core', `${id}/ju`, ours.meta.juNum, reference.ju.number);
        compare('core', `${id}/yuan`, ours.meta.yuan, reference.yuan);
        compare('core', `${id}/xun`, ours.meta.xunShou, reference.timeInfo.xunShou);
        compare('duty', `${id}/star`, ours.zhifu, reference.zhiFu.star);
        compare('duty', `${id}/star_destination`, ours.zhifuGong, reference.zhiFu.position);
        compare('duty', `${id}/gate`, ours.zhishi, reference.zhiShi.gate);
        compare('duty', `${id}/door_destination`, ours.zhishiGong, reference.zhiShi.position);

        for (let palace = 1; palace <= 9; palace += 1) {
          const oursPalace = ours.gongs[palace];
          const referencePalace = referencePalaces[palace];
          compare('earth_plate', `${id}/${palace}`, oursPalace.diGan, normalize(referencePalace.earthlyStem));
          compare('heaven_plate', `${id}/${palace}/stem`, oursPalace.tianGan, normalize(referencePalace.heavenlyStem));
          compare('heaven_plate', `${id}/${palace}/star`, oursPalace.star, normalize(referencePalace.star));
          compare('human_plate', `${id}/${palace}`, oursPalace.gate, normalize(referencePalace.gate));
          compare('deity_plate', `${id}/${palace}`, oursPalace.shen, normalize(referencePalace.deity));
        }
      }
    }
  }
}

const mismatches = Object.values(categories).reduce((sum, category) => sum + category.mismatches, 0);
const unexpectedExamples = examples.filter(example => (
  example.category !== 'calendar' || !example.id.endsWith('/year')
));
const unexpectedMismatches = unexpectedExamples.length;
const source = [
  'lib/qimen/QimenChart.js',
  'lib/qimen/calculator.js',
  'lib/data/constants.js',
].map(relativePath => fs.readFileSync(path.join(packagePath, relativePath), 'utf8')).join('\n');
const artifact = {
  audit: 'qimen_secondary_3meta',
  generatedAt: '2026-07-10',
  result: unexpectedMismatches === 0
    ? (mismatches === 0 ? 'pass' : 'pass_core_with_known_lichun_year_boundary_variance')
    : 'fail',
  secondaryImplementation: {
    package: `${packageJson.name}@${packageJson.version}`,
    license: packageJson.license,
    repository: packageJson.repository,
    relevantSourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  },
  environment: { TZ: process.env.TZ },
  summary: { charts, fields, mismatches, unexpectedMismatches, categories },
  boundaries: [
    '3meta is an independent implementation, not evidence for predictive interpretation.',
    'Comparison fixes Asia/Shanghai because 3meta/dayjs normalizes nonexistent host-DST wall times.',
    '3meta switches the year pillar for the whole Lichun civil day; the project uses the exact Lichun moment. These year-only differences are counted but are not Qimen-core failures.',
    'Array-valued center-lodging fields compare their primary stem/star; the declared Tianqin lodging is separately tested internally.',
  ],
  examples,
};
const outputPath = path.join(root, 'docs/validation/artifacts/qimen-secondary-audit-2026-07-10.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.summary, null, 2));
if (unexpectedMismatches > 0) process.exitCode = 1;
