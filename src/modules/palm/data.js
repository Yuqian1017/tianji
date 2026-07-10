// Palm reading data — hand types, palm line questions, mound names, finger meanings

export const PALM_INTERPRETATION_VALIDATION = Object.freeze({
  status: 'blocked_unvalidated_interpretation',
  acceptedScope: 'observable_geometry_and_user_reported_line_shape_only',
  runtimeEligibleFields: Object.freeze(['shape', 'ratio', 'line_appearance', 'location_label']),
});

export const HAND_WUXING_TYPES = {
  metal: {
    name: '金形手',
    element: '金',
    shape: '方掌短指',
    features: '掌方正·指节分明·骨感',
  },
  wood: {
    name: '木形手',
    element: '木',
    shape: '长掌长指',
    features: '修长·关节突出·指尖略尖',
  },
  water: {
    name: '水形手',
    element: '水',
    shape: '圆掌短指',
    features: '肉厚柔软·指根粗·手背圆',
  },
  fire: {
    name: '火形手',
    element: '火',
    shape: '尖掌尖指',
    features: '指尖尖细·掌薄·红润',
  },
  earth: {
    name: '土形手',
    element: '土',
    shape: '厚掌粗指',
    features: '厚实·粗壮·手掌宽大',
  },
};

export const PALM_LINE_QUESTIONS = [
  {
    id: 'lifeLine',
    label: '生命线（围绕拇指的弧线）',
    options: [
      '长且深·弧度大',
      '长但浅·贴近拇指',
      '短但清晰',
      '有断裂或圈',
      '看不清',
    ],
  },
  {
    id: 'headLine',
    label: '智慧线（横穿掌心）',
    options: [
      '直线·很长',
      '略弯·中等',
      '明显下弯',
      '和生命线连在一起',
      '和生命线分开',
      '看不清',
    ],
  },
  {
    id: 'heartLine',
    label: '感情线（最上面横线）',
    options: [
      '很长到食指下',
      '到中指下结束',
      '食指中指之间',
      '比较直平',
      '很多分叉',
      '看不清',
    ],
  },
  {
    id: 'fateLine',
    label: '命运线（掌心纵线·有的人没有）',
    options: [
      '有且清晰',
      '断断续续',
      '从中间才开始',
      '没有',
      '看不清',
    ],
  },
];

export const MOUND_NAMES = {
  jupiter: { name: '木星丘', location: '食指根部', interpretationStatus: 'not_validated' },
  saturn: { name: '土星丘', location: '中指根部', interpretationStatus: 'not_validated' },
  apollo: { name: '太阳丘', location: '无名指根部', interpretationStatus: 'not_validated' },
  mercury: { name: '水星丘', location: '小指根部', interpretationStatus: 'not_validated' },
  venus: { name: '金星丘', location: '拇指根部（大鱼际）', interpretationStatus: 'not_validated' },
  luna: { name: '月丘', location: '小鱼际', interpretationStatus: 'not_validated' },
  mars_positive: { name: '火星正丘', location: '拇指与木星丘之间', interpretationStatus: 'not_validated' },
  mars_negative: { name: '火星负丘', location: '水星丘与月丘之间', interpretationStatus: 'not_validated' },
  mars_plain: { name: '火星平原', location: '掌心中央', interpretationStatus: 'not_validated' },
};

export const FINGER_MEANINGS = {
  thumb: { name: '拇指', interpretationStatus: 'not_validated' },
  index: { name: '食指', interpretationStatus: 'not_validated' },
  middle: { name: '中指', interpretationStatus: 'not_validated' },
  ring: { name: '无名指', interpretationStatus: 'not_validated' },
  pinky: { name: '小指', interpretationStatus: 'not_validated' },
};

export function describeHandType(palmRatio) {
  if (palmRatio > 1.15) return '掌长指短型';
  if (palmRatio > 0.95) return '掌指均衡型';
  return '指长掌短型';
}

export function describeFingerRatio(indexRingRatio) {
  if (indexRingRatio > 1.02) return '食指略长于无名指';
  if (indexRingRatio > 0.96) return '食指与无名指长度接近';
  return '无名指略长于食指';
}

export function describeFingerGaps(gaps) {
  const labels = {
    thumbIndex: '拇食指',
    indexMiddle: '食中指',
    middleRing: '中无名指',
    ringPinky: '无名小指',
  };
  const values = Object.entries(gaps)
    .filter(([, value]) => Number.isFinite(value))
    .map(([key, value]) => `${labels[key] ?? key} ${value}°`);
  return values.length > 0 ? values.join(' · ') : '未提取';
}

export function describePalmLineAnswer(questionId, answer) {
  if (answer === '看不清') return '不明显';

  const descriptions = {
    lifeLine: {
      '长且深·弧度大': '弧度较大·纹路清晰',
      '长但浅·贴近拇指': '贴近拇指·纹路较浅',
      '短但清晰': '线段较短·纹路清晰',
      '有断裂或圈': '线条不连续或带圈状纹',
    },
    headLine: {
      '直线·很长': '走向较直·延伸较长',
      '略弯·中等': '略有弯曲·长度中等',
      '明显下弯': '向掌缘方向明显下弯',
      '和生命线连在一起': '起点与生命线相连',
      '和生命线分开': '起点与生命线分开',
    },
    heartLine: {
      '很长到食指下': '延伸至食指下方',
      '到中指下结束': '在中指下方结束',
      '食指中指之间': '在食指与中指之间结束',
      '比较直平': '整体走向较直',
      '很多分叉': '末端或沿线分叉较多',
    },
    fateLine: {
      '有且清晰': '纵向线条较清晰',
      '断断续续': '纵向线条不连续',
      '从中间才开始': '纵向线条从掌心中部出现',
      '没有': '未观察到明显纵向线条',
    },
  };

  return descriptions[questionId]?.[answer] || answer;
}
