import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

import { TIZHI_VALIDATION } from '../../src/modules/tizhi/data.js';
import { assessConstitution } from '../../src/modules/tizhi/engine.js';
import { ZIWU_LIUZHU } from '../../src/modules/ziwu/data.js';
import { formatForAI as formatZiwuForAI } from '../../src/modules/ziwu/engine.js';
import { analyzeYear, formatForAI as formatWuyunForAI } from '../../src/modules/wuyun/engine.js';
import { buildVisionMessage } from '../../src/modules/wangzhen/engine.js';
import { buildFaceTextMessage } from '../../src/modules/face/engine.js';
import { buildPalmTextMessage } from '../../src/modules/palm/engine.js';
import { analyzeHandFeatures } from '../../src/lib/mediapipe.js';
import {
  FACE_INTERPRETATION_VALIDATION,
  THREE_STOP_LABELS,
  TWELVE_PALACES,
  WUXING_FACE_TYPES,
} from '../../src/modules/face/data.js';
import {
  FINGER_MEANINGS,
  HAND_WUXING_TYPES,
  MOUND_NAMES,
  PALM_INTERPRETATION_VALIDATION,
  describeFingerGaps,
} from '../../src/modules/palm/data.js';

const ROOT = new URL('../../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, ROOT), 'utf8');
}

async function sourceTree(path) {
  const entries = await readdir(new URL(`${path}/`, ROOT), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await sourceTree(child));
    if (entry.isFile() && /\.(?:js|jsx)$/.test(entry.name)) {
      files.push({ path: child, content: await source(child) });
    }
  }
  return files;
}

test('blocks the incomplete historical constitution questionnaire', async () => {
  assert.equal(TIZHI_VALIDATION.status, 'blocked_unvalidated_questionnaire');
  assert.equal(TIZHI_VALIDATION.canonicalStandard, 'ZYYXH/T 157-2009');
  assert.throws(
    () => assessConstitution([]),
    /历史简化问卷未达到 ZYYXH\/T 157-2009 的完整条目与判定要求/,
  );

  const ui = await source('src/modules/tizhi/TizhiModule.jsx');
  assert.match(ui, /功能暂停/);
  assert.doesNotMatch(ui, /AI 调养解读|推荐茶饮|艾灸为主/);
});

test('keeps the meridian clock structural and non-clinical', async () => {
  assert.equal(ZIWU_LIUZHU.length, 12);
  for (const entry of ZIWU_LIUZHU) {
    assert.deepEqual(
      Object.keys(entry).sort(),
      ['hours', 'hourStart', 'meridian', 'organ', 'shichen', 'wuxing'].sort(),
    );
  }

  const aiText = formatZiwuForAI(new Date('2026-07-10T10:00:00+08:00'));
  assert.doesNotMatch(aiText, /养生|疾病|症状|穴位|排毒|最佳/);

  const prompt = await source('src/modules/ziwu/prompt.js');
  assert.match(prompt, /文化结构/);
  assert.doesNotMatch(prompt, /生理特点|养生建议|保健穴位|饮食/);
});

test('keeps Five Movements and Six Qi output away from health claims', async () => {
  const result = analyzeYear(2026);
  assert.equal(result.validation.interpretation, 'not_validated');
  assert.equal('affectedOrgans' in result, false);

  const aiText = formatWuyunForAI(result);
  assert.doesNotMatch(aiText, /重点关注脏腑|疾病|食疗|健康风险/);

  const data = await source('src/modules/wuyun/data.js');
  assert.doesNotMatch(data, /heart|心血管|呼吸道|脾胃关注|心肾关注/);

  const prompt = await source('src/modules/wuyun/prompt.js');
  assert.match(prompt, /文化结构/);
  assert.doesNotMatch(prompt, /健康指导|易发疾病|食疗方案|健康风险/);
});

test('limits visual inspection to observable image features', async () => {
  const message = buildVisionMessage('ZmFrZQ==', 'tongue', '仅测试');
  const textPart = message.content.find(part => part.type === 'text').text;
  assert.match(textPart, /只描述照片中可见/);
  assert.doesNotMatch(textPart, /综合判断|调养建议|脏腑|体质/);

  const prompt = await source('src/modules/wangzhen/prompt.js');
  assert.match(prompt, /客观观察助手/);
  assert.doesNotMatch(prompt, /脏腑判断|体质倾向|调养建议/);

  const ui = await source('src/modules/wangzhen/WangzhenModule.jsx');
  assert.match(ui, /WANGZHEN_FOLLOWUP_HINT/);
  assert.doesNotMatch(ui, /追问具体调养方法/);
});

test('does not expose concrete herbal doses through active TCM runtime paths', async () => {
  const paths = [
    'src/modules/tizhi/data.js',
    'src/modules/tizhi/prompt.js',
    'src/modules/ziwu/data.js',
    'src/modules/ziwu/prompt.js',
    'src/modules/wuyun/data.js',
    'src/modules/wuyun/prompt.js',
    'src/modules/wangzhen/data.js',
    'src/modules/wangzhen/prompt.js',
  ];
  const content = (await Promise.all(paths.map(source))).join('\n');
  assert.doesNotMatch(content, /\d+(?:\.\d+)?\s*(?:g|克)\b/i);
});

test('blocks health inference in active bazi and palm AI paths', async () => {
  const baziPrompt = await source('src/modules/bazi/prompt.js');
  const baziUi = await source('src/modules/bazi/BaziModule.jsx');
  assert.match(baziPrompt, /不得根据八字.*健康/);
  assert.doesNotMatch(baziUi, /id: 'jiankang'|五行偏枯可能影响的身体部位|财运、健康/);

  const palmPrompt = await source('src/modules/palm/prompt.js');
  const palmData = await source('src/modules/palm/data.js');
  assert.match(palmPrompt, /不得根据手掌或掌纹.*健康/);
  assert.doesNotMatch(palmPrompt, /健康提示|生命线反映的是生命力强弱和健康状况变化/);
  assert.doesNotMatch(palmData, /体质一般·宜注意养生|曾经历变故·需注意健康|沟通·商才·健康/);
});

test('blocks health inference in the active face-reading AI path', async () => {
  const facePrompt = await source('src/modules/face/prompt.js');
  const faceData = await source('src/modules/face/data.js');
  const faceEngine = await source('src/modules/face/engine.js');
  assert.match(facePrompt, /不得根据面部特征.*健康/);
  assert.doesNotMatch(facePrompt, /疾厄宫\(山根\)→健康|健康提示/);
  assert.doesNotMatch(faceData, /健康·抗病力|面白|面青|面黑润|面红|面黄/);
  assert.match(faceEngine, /不作健康、体质、寿命或医疗推断/);
});

test('keeps face and palm geometry separate from personality, career, and fortune claims', async () => {
  assert.equal(FACE_INTERPRETATION_VALIDATION.status, 'blocked_unvalidated_interpretation');
  assert.equal(PALM_INTERPRETATION_VALIDATION.status, 'blocked_unvalidated_interpretation');
  assert.ok(Object.values(WUXING_FACE_TYPES).every(item => !('personality' in item) && !('career' in item)));
  assert.ok(Object.values(HAND_WUXING_TYPES).every(item => !('personality' in item) && !('career' in item)));
  assert.ok(Object.values(THREE_STOP_LABELS).every(item => !('period' in item) && !('governs' in item)));
  assert.ok(Object.values(TWELVE_PALACES).every(item => item.interpretationStatus === 'not_validated'));
  assert.ok(Object.values(MOUND_NAMES).every(item => item.interpretationStatus === 'not_validated'));
  assert.ok(Object.values(FINGER_MEANINGS).every(item => item.interpretationStatus === 'not_validated'));

  const faceMessage = buildFaceTextMessage({
    faceShape: 'metal', widthHeightRatio: 0.8, jawCheekRatio: 0.9,
    threeStops: { upper: 36, middle: 32, lower: 32 },
    eyes: { aspect: 0.3, toFaceRatio: 0.11, interEyeToEye: 1 },
    nose: { toFaceRatio: 0.18, bridgeDepth: 0.03 },
    mouth: { toFaceRatio: 0.22, lipRatio: 1 },
    brows: { gapToEye: 1.6 }, yintang: { toFaceRatio: 0.06 },
    chin: { toFaceRatio: 0.3 }, symmetry: 90,
  });
  assert.doesNotMatch(faceMessage.content, /少年得志|学业佳|事业心强|晚年有福|子女孝顺|心胸开阔|晚年运佳|行动力强/);

  const palmMessage = buildPalmTextMessage({
    handType: 'earth', handedness: 'Right', palmRatio: 1,
    indexRingRatio: 1.03, fingerGaps: { a: 0.07 }, pinkyReachesRingJoint: true,
    moundEstimates: { jupiter: 0.7 },
  }, {
    lifeLine: '长且深·弧度大', headLine: '直线·很长',
    heartLine: '很多分叉', fateLine: '有且清晰',
  });
  assert.doesNotMatch(palmMessage.content, /理性主导|感性\/冒险|性格开放|谨慎保守|思维理性|艺术天分|感情经历丰富|事业目标明确|主领导力/);

  const facePrompt = await source('src/modules/face/prompt.js');
  const palmPrompt = await source('src/modules/palm/prompt.js');
  assert.match(facePrompt, /不得把几何比例.*人格、职业或现实运势/);
  assert.match(palmPrompt, /不得把手部比例或掌纹.*人格、职业、能力或现实运势/);
  assert.doesNotMatch(facePrompt, /三停均匀最佳|高挺=有主见事业心|圆润有肉=聚财/);
  assert.doesNotMatch(palmPrompt, /食指>无名指|运动\/艺术天赋|有且清晰=目标明确/);
});

test('does not present hand-landmark proxies as palm-mound measurements', () => {
  const landmarks = Array.from({ length: 21 }, (_, index) => ({
    x: (index % 5) * 0.04 + Math.floor(index / 5) * 0.01,
    y: Math.floor(index / 5) * 0.08 + (index % 3) * 0.01,
    z: -index * 0.001,
  }));
  const features = analyzeHandFeatures(landmarks, 'Right');
  assert.equal('moundEstimates' in features, false);

  const gapText = describeFingerGaps({ thumbIndex: 28.4, indexMiddle: 12.1 });
  assert.match(gapText, /28\.4°/);
  assert.match(gapText, /12\.1°/);
  assert.doesNotMatch(gapText, /较宽|较窄|性格/);

  const promptMessage = buildPalmTextMessage({
    ...features,
    moundEstimates: { jupiter: 'prominent' },
  }, {});
  assert.doesNotMatch(promptMessage.content, /丘位估计|木星丘|饱满|平坦/);
});

test('keeps unvalidated legacy medical lookup tables out of runtime consumers', async () => {
  const files = await sourceTree('src');
  const withoutDeclarations = files.filter(({ path }) => ![
    'src/lib/tcm-data.js',
    'src/modules/qimen/data.js',
    'src/modules/fengshui/data.js',
  ].includes(path));
  const consumers = withoutDeclarations.map(({ content }) => content).join('\n');

  assert.doesNotMatch(consumers, /tcm-data\.js|QIMEN_YONGSHEN|STAR_COMBO|STAR_REMEDY/);
});
