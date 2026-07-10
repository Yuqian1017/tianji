// Face reading data — wuxing types, three stops, feature descriptors, twelve palaces

export const FACE_INTERPRETATION_VALIDATION = Object.freeze({
  status: 'blocked_unvalidated_interpretation',
  acceptedScope: 'observable_geometry_only',
  runtimeEligibleFields: Object.freeze(['shape', 'ratio', 'symmetry', 'location_label']),
});

export const WUXING_FACE_TYPES = {
  metal: {
    name: '金形面',
    element: '金',
    shape: '方脸',
    features: '骨骼分明·线条硬朗',
  },
  wood: {
    name: '木形面',
    element: '木',
    shape: '长脸',
    features: '瘦长·额窄颧高',
  },
  water: {
    name: '水形面',
    element: '水',
    shape: '圆脸',
    features: '轮廓圆润·下巴圆',
  },
  fire: {
    name: '火形面',
    element: '火',
    shape: '尖脸',
    features: '额宽下巴窄·轮廓尖',
  },
  earth: {
    name: '土形面',
    element: '土',
    shape: '方圆脸',
    features: '方圆·鼻部较宽·下颌圆厚',
  },
};

export const THREE_STOP_LABELS = {
  upper: { name: '上停', segment: '发际至眉部' },
  middle: { name: '中停', segment: '眉部至鼻尖' },
  lower: { name: '下停', segment: '鼻尖至下巴' },
};

export function describeThreeStops(upper, middle, lower) {
  const stops = [
    { name: '上停', val: upper },
    { name: '中停', val: middle },
    { name: '下停', val: lower },
  ];
  const sorted = [...stops].sort((a, b) => b.val - a.val);
  const diff = sorted[0].val - sorted[2].val;

  if (diff < 5) return '三停比例接近';
  if (sorted[0].name === '上停') return '上停相对较长';
  if (sorted[0].name === '中停') return '中停相对较长';
  return '下停相对较长';
}

export function describeEyes(aspect, toFaceRatio) {
  const size = toFaceRatio > 0.13 ? '大眼' : toFaceRatio > 0.10 ? '中等' : '小眼';
  const shape = aspect > 0.35 ? '圆润有神' : aspect > 0.25 ? '适中' : '细长';
  return `${size}·${shape}`;
}

export function describeNose(toFaceRatio, bridgeDepth) {
  const width = toFaceRatio > 0.22 ? '鼻翼较宽' : toFaceRatio > 0.17 ? '鼻翼适中' : '鼻翼较窄';
  const height = bridgeDepth > 0.04 ? '鼻梁高挺' : bridgeDepth > 0.02 ? '鼻梁适中' : '鼻梁偏低';
  return `${height}·${width}`;
}

export function describeMouth(toFaceRatio, lipRatio) {
  const size = toFaceRatio > 0.25 ? '大嘴' : toFaceRatio > 0.20 ? '中等' : '小嘴';
  const lips = lipRatio > 1.2 ? '上唇厚' : lipRatio < 0.8 ? '下唇厚' : '唇型均匀';
  return `${size}·${lips}`;
}

export function describeBrows(gapToEye) {
  if (gapToEye > 1.5) return '眉间距较宽';
  if (gapToEye > 1.0) return '眉间距适中';
  return '眉间距较窄';
}

export function describeYintang(toFaceRatio) {
  if (toFaceRatio > 0.08) return '印堂宽阔';
  if (toFaceRatio > 0.05) return '印堂适中';
  return '印堂偏窄';
}

export function describeChin(toFaceRatio) {
  if (toFaceRatio > 0.28) return '下巴相对较长';
  if (toFaceRatio > 0.22) return '下巴适中';
  return '下巴相对较短';
}

export function describeSymmetry(score) {
  if (score > 92) return '高度对称';
  if (score > 80) return '基本对称';
  return '略有不对称';
}

export const TWELVE_PALACES = {
  '命宫': { location: '两眉之间·印堂', interpretationStatus: 'not_validated' },
  '财帛宫': { location: '鼻头', interpretationStatus: 'not_validated' },
  '兄弟宫': { location: '眉毛', interpretationStatus: 'not_validated' },
  '夫妻宫': { location: '眼尾', interpretationStatus: 'not_validated' },
  '子女宫': { location: '眼下', interpretationStatus: 'not_validated' },
  '疾厄宫': { location: '山根', interpretationStatus: 'not_validated' },
  '迁移宫': { location: '额头两侧', interpretationStatus: 'not_validated' },
  '交友宫': { location: '腮部', interpretationStatus: 'not_validated' },
  '官禄宫': { location: '额头中央', interpretationStatus: 'not_validated' },
  '田宅宫': { location: '眉眼之间', interpretationStatus: 'not_validated' },
  '福德宫': { location: '眉尾上方', interpretationStatus: 'not_validated' },
  '父母宫': { location: '额头左右', interpretationStatus: 'not_validated' },
};
