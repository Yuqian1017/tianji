// Palm module engine — builds text messages from ML-extracted features + questionnaire

import {
  HAND_WUXING_TYPES,
  MOUND_NAMES,
  FINGER_MEANINGS,
  describeHandType,
  describeFingerRatio,
  describeFingerGaps,
  describePalmLineAnswer,
} from './data.js';

/**
 * Build a text-only user message from ML-extracted hand features + questionnaire answers.
 * No image is sent — only structured text.
 */
export function buildPalmTextMessage(features, lineAnswers, userNote) {
  const handType = HAND_WUXING_TYPES[features.handType] || HAND_WUXING_TYPES.earth;

  const lines = [
    `【手部特征数据】（本地AI提取，照片未上传服务器）`,
    ``,
    `手型：${handType.name}（${handType.element}） — ${handType.shape}`,
    `  特征：${handType.features}`,
    `  掌型：${describeHandType(features.palmRatio)}（掌指比 ${features.palmRatio}）`,
    `  惯用手：${features.handedness === 'Left' ? '左手' : '右手'}`,
    ``,
    `手指分析：`,
  ];

  // Finger lengths
  const fingerNames = ['拇指', '食指', '中指', '无名指', '小指'];
  const fingerKeys = ['thumb', 'index', 'middle', 'ring', 'pinky'];
  fingerKeys.forEach((key, i) => {
    const meaning = FINGER_MEANINGS[key];
    lines.push(`  ${fingerNames[i]}：相对长度 ${features.fingerLengths[key]} — ${meaning.governs}`);
  });

  lines.push(
    ``,
    `  食指/无名指比（2D:4D）：${features.indexRingRatio} — ${describeFingerRatio(features.indexRingRatio)}`,
    `  指缝：${describeFingerGaps(features.fingerGaps)}`,
  );

  if (features.pinkyReachesRingJoint !== undefined) {
    lines.push(`  小指是否过无名指第一关节：${features.pinkyReachesRingJoint ? '是' : '否'}`);
  }

  // Mound estimates
  lines.push(``, `掌丘估计（基于骨骼点，仅供参考）：`);
  const moundKeys = ['jupiter', 'saturn', 'apollo', 'mercury', 'venus', 'luna'];
  moundKeys.forEach(key => {
    const mound = MOUND_NAMES[key];
    const estimate = features.moundEstimates?.[key];
    if (estimate) {
      lines.push(`  ${mound.name}（${mound.location}）：隆起度 ${estimate} — ${mound.governs}`);
    }
  });

  // Palm line questionnaire answers
  lines.push(``, `掌纹（用户自行观察）：`);
  const lineLabels = {
    lifeLine: '生命线',
    headLine: '智慧线',
    heartLine: '感情线',
    fateLine: '命运线',
  };
  Object.entries(lineAnswers).forEach(([id, answer]) => {
    const label = lineLabels[id] || id;
    const desc = describePalmLineAnswer(id, answer);
    lines.push(`  ${label}：${answer} — ${desc}`);
  });

  lines.push(
    ``,
    `说明：手型与手指数据由浏览器端 MediaPipe 手部骨骼点提取。掌纹信息由用户自行观察填写，不一定完全准确。骨骼点无法判断掌纹细节、色泽、软硬等触觉特征。`,
  );

  if (userNote) {
    lines.push('', `用户补充说明：${userNote}`);
  }

  lines.push('', '请根据以上手相数据，按照手相学进行综合分析。');

  return { role: 'user', content: lines.join('\n') };
}

/**
 * Build a follow-up text message.
 */
export function buildFollowUpMessage(text) {
  return { role: 'user', content: text };
}

/**
 * Build a Vision API message with the palm image for deep analysis.
 */
export function buildPalmVisionMessage(base64Image) {
  return {
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Image,
        },
      },
      {
        type: 'text',
        text: '请仔细观察这张手掌照片，结合之前的骨骼数据分析，重点关注：\n1. 三大主线（生命线、智慧线、感情线）的深浅、长短、弯曲度\n2. 掌纹的细纹、分叉、岛纹\n3. 掌色和肤质\n4. 指甲形状\n请给出更深入的手相分析。',
      },
    ],
  };
}
