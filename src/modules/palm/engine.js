// Palm module engine — builds text messages from ML features + questionnaire answers

import {
  HAND_WUXING_TYPES,
  describeHandType,
  describeFingerRatio,
  describeFingerGaps,
  describePalmLineAnswer,
  MOUND_NAMES,
} from './data.js';

/**
 * Build a text-only user message from ML hand features + questionnaire answers.
 * No image is sent — only structured text.
 */
export function buildPalmTextMessage(features, answers, userNote) {
  const handType = features?.handType || 'earth';
  const wuxing = HAND_WUXING_TYPES[handType] || HAND_WUXING_TYPES.earth;

  const lines = [
    '【手相特征数据】（本地AI提取 + 用户自述掌纹，照片未上传服务器）',
    '',
    `手别：${features?.handedness === 'Right' ? '右手' : '左手'}`,
    `手型：${wuxing.name}（${wuxing.element}） — ${wuxing.shape}`,
    `  特征：${wuxing.features}`,
    `  掌指比例：${features?.palmRatio || '未知'}（${describeHandType(features?.palmRatio || 1)}）`,
    '',
    '手指特征：',
    `  食指/无名指比：${features?.indexRingRatio || '未知'}（${describeFingerRatio(features?.indexRingRatio || 1)}）`,
    `  指缝：${describeFingerGaps(features?.fingerGaps || {})}`,
    `  小指是否到达无名指第一关节：${features?.pinkyReachesRingJoint ? '是' : '否'}`,
    '',
  ];

  // Finger lengths
  if (features?.fingerLengths) {
    const fl = features.fingerLengths;
    lines.push(
      '手指长度（相对掌长比例）：',
      `  拇指 ${fl.thumb || '?'} · 食指 ${fl.index || '?'} · 中指 ${fl.middle || '?'} · 无名指 ${fl.ring || '?'} · 小指 ${fl.pinky || '?'}`,
      ''
    );
  }

  // Mound estimates
  if (features?.moundEstimates) {
    lines.push('丘位估计（基于骨骼凸起程度）：');
    for (const [key, val] of Object.entries(features.moundEstimates)) {
      const mound = MOUND_NAMES[key];
      if (mound) {
        lines.push(`  ${mound.name}（${mound.location}）：${val > 0.6 ? '饱满' : val > 0.4 ? '适中' : '平坦'} — 主${mound.governs}`);
      }
    }
    lines.push('');
  }

  // Questionnaire answers (palm lines that ML can't detect)
  lines.push('掌纹自述（用户观察，ML无法检测皮肤纹路）：');
  if (answers?.lifeLine) {
    lines.push(`  生命线：${answers.lifeLine} → ${describePalmLineAnswer('lifeLine', answers.lifeLine)}`);
  }
  if (answers?.headLine) {
    lines.push(`  智慧线：${answers.headLine} → ${describePalmLineAnswer('headLine', answers.headLine)}`);
  }
  if (answers?.heartLine) {
    lines.push(`  感情线：${answers.heartLine} → ${describePalmLineAnswer('heartLine', answers.heartLine)}`);
  }
  if (answers?.fateLine) {
    lines.push(`  命运线：${answers.fateLine} → ${describePalmLineAnswer('fateLine', answers.fateLine)}`);
  }
  lines.push('');

  lines.push(
    '说明：手部骨骼数据由浏览器端 MediaPipe 21点手部关键点提取。掌纹（生命线、智慧线等）为用户自述，因ML无法识别皮肤纹路。',
  );

  if (userNote) {
    lines.push('', `用户补充说明：${userNote}`);
  }

  lines.push('', '请根据以上手相特征数据，按照手相学进行综合分析。');

  return { role: 'user', content: lines.join('\n') };
}

/**
 * Build a Vision API message with the palm photo for deep analysis.
 * Only used when user explicitly clicks "AI视觉深度分析".
 */
export function buildPalmVisionMessage(base64, features, answers) {
  const textPart = [
    '这是一张手掌照片，请结合以下ML提取数据和用户自述掌纹进行深度手相分析：',
    '',
    `手型：${(HAND_WUXING_TYPES[features?.handType] || HAND_WUXING_TYPES.earth).name}`,
    `掌指比：${features?.palmRatio || '未知'}`,
    `食指/无名指比：${features?.indexRingRatio || '未知'}`,
    '',
    '用户自述掌纹：',
    `  生命线：${answers?.lifeLine || '未填'}`,
    `  智慧线：${answers?.headLine || '未填'}`,
    `  感情线：${answers?.heartLine || '未填'}`,
    `  命运线：${answers?.fateLine || '未填'}`,
    '',
    '请重点分析照片中可见的：掌纹走向、纹路深浅、特殊标记（岛纹、星纹、十字纹等）、手指关节比例、大小鱼际丰满度。这些是ML无法提取的皮肤层面特征。',
  ].join('\n');

  return {
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
      { type: 'text', text: textPart },
    ],
  };
}

/**
 * Build a follow-up text message.
 */
export function buildFollowUpMessage(text) {
  return { role: 'user', content: text };
}
