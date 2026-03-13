// Face module engine — builds text messages from ML-extracted features

import {
  WUXING_FACE_TYPES,
  describeThreeStops,
  describeEyes,
  describeNose,
  describeMouth,
  describeBrows,
  describeYintang,
  describeChin,
  describeSymmetry,
} from './data.js';

/**
 * Build a text-only user message from ML-extracted face features.
 * No image is sent — only structured text.
 */
export function buildFaceTextMessage(features, userNote) {
  const wuxing = WUXING_FACE_TYPES[features.faceShape] || WUXING_FACE_TYPES.wood;
  const { threeStops, eyes, nose, mouth, brows, yintang, chin, symmetry } = features;

  const lines = [
    `【面部特征数据】（本地AI提取，照片未上传服务器）`,
    ``,
    `面型：${wuxing.name}（${wuxing.element}） — ${wuxing.shape}`,
    `  宽高比：${features.widthHeightRatio}  下颌/颧骨比：${features.jawCheekRatio}`,
    `  特征：${wuxing.features}`,
    ``,
    `三停比例：上停 ${threeStops.upper}% · 中停 ${threeStops.middle}% · 下停 ${threeStops.lower}%`,
    `  ${describeThreeStops(threeStops.upper, threeStops.middle, threeStops.lower)}`,
    ``,
    `五官：`,
    `  眼睛：${describeEyes(eyes.aspect, eyes.toFaceRatio)}（眼面比 ${eyes.toFaceRatio}，纵横比 ${eyes.aspect}，两眼间距/眼宽 ${eyes.interEyeToEye}）`,
    `  眉毛：${describeBrows(brows.gapToEye)}（眉间距/眼宽 ${brows.gapToEye}）`,
    `  鼻子：${describeNose(nose.toFaceRatio, nose.bridgeDepth)}（鼻面比 ${nose.toFaceRatio}，鼻梁深度 ${nose.bridgeDepth}）`,
    `  嘴巴：${describeMouth(mouth.toFaceRatio, mouth.lipRatio)}（口面比 ${mouth.toFaceRatio}，上下唇比 ${mouth.lipRatio}）`,
    ``,
    `印堂：${describeYintang(yintang.toFaceRatio)}（印堂/面宽 ${yintang.toFaceRatio}）`,
    `下巴：${describeChin(chin.toFaceRatio)}（下巴/面高 ${chin.toFaceRatio}）`,
    `对称性：${describeSymmetry(symmetry)}（${symmetry}%）`,
    ``,
    `说明：以上数据由浏览器端 MediaPipe 面部骨骼点提取，无法判断气色、痣、纹路等皮肤层面特征。分析基于骨骼结构比例。`,
  ];

  if (userNote) {
    lines.push('', `用户补充说明：${userNote}`);
  }

  lines.push('', '请根据以上面部特征数据，按照面相学进行综合分析。');

  return { role: 'user', content: lines.join('\n') };
}

/**
 * Build a follow-up text message.
 */
export function buildFollowUpMessage(text) {
  return { role: 'user', content: text };
}
