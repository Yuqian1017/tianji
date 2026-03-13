// Palm reading data — hand types, palm line questions, mound names, finger meanings

export const HAND_WUXING_TYPES = {
  metal: {
    name: '金形手',
    element: '金',
    shape: '方掌短指',
    features: '掌方正·指节分明·骨感',
    personality: '果断·重规矩·执行力强',
    career: '法律·军警·金融·管理',
  },
  wood: {
    name: '木形手',
    element: '木',
    shape: '长掌长指',
    features: '修长·关节突出·指尖略尖',
    personality: '仁慈·有创意·善思考',
    career: '文教·艺术·研究·写作',
  },
  water: {
    name: '水形手',
    element: '水',
    shape: '圆掌短指',
    features: '肉厚柔软·指根粗·手背圆',
    personality: '智慧·灵活·善交际·随和',
    career: '贸易·服务·传媒·外交',
  },
  fire: {
    name: '火形手',
    element: '火',
    shape: '尖掌尖指',
    features: '指尖尖细·掌薄·红润',
    personality: '热情·急躁·直觉力强',
    career: '科技·创业·演艺·设计',
  },
  earth: {
    name: '土形手',
    element: '土',
    shape: '厚掌粗指',
    features: '厚实·粗壮·手掌宽大',
    personality: '稳重·踏实·耐力好',
    career: '农业·地产·工程·制造',
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
  jupiter: { name: '木星丘', location: '食指根部', governs: '领导力·野心·自信' },
  saturn: { name: '土星丘', location: '中指根部', governs: '责任·思考·命运' },
  apollo: { name: '太阳丘', location: '无名指根部', governs: '才华·名誉·创造力' },
  mercury: { name: '水星丘', location: '小指根部', governs: '沟通·商才·健康' },
  venus: { name: '金星丘', location: '拇指根部（大鱼际）', governs: '爱情·精力·生命力' },
  luna: { name: '月丘', location: '小鱼际', governs: '想象力·直觉·旅行' },
  mars_positive: { name: '火星正丘', location: '拇指与木星丘之间', governs: '勇气·攻击性' },
  mars_negative: { name: '火星负丘', location: '水星丘与月丘之间', governs: '忍耐·防御力' },
  mars_plain: { name: '火星平原', location: '掌心中央', governs: '意志力·平衡' },
};

export const FINGER_MEANINGS = {
  thumb: { name: '拇指', governs: '意志力·逻辑·领导' },
  index: { name: '食指', governs: '野心·权力·自我' },
  middle: { name: '中指', governs: '责任·命运·平衡' },
  ring: { name: '无名指', governs: '才华·审美·名誉' },
  pinky: { name: '小指', governs: '沟通·商才·子女' },
};

export function describeHandType(palmRatio) {
  if (palmRatio > 1.15) return '掌长指短型';
  if (palmRatio > 0.95) return '掌指均衡型';
  return '指长掌短型';
}

export function describeFingerRatio(indexRingRatio) {
  if (indexRingRatio > 1.02) return '食指长于无名指（理性主导）';
  if (indexRingRatio > 0.96) return '食指与无名指等长（平衡型）';
  return '无名指长于食指（感性/冒险型）';
}

export function describeFingerGaps(gaps) {
  const wide = Object.values(gaps).filter(g => g > 0.06).length;
  if (wide >= 3) return '指缝较大·性格开放';
  if (wide >= 1) return '指缝适中';
  return '指缝紧密·谨慎保守';
}

export function describePalmLineAnswer(questionId, answer) {
  if (answer === '看不清') return '不明显';

  const descriptions = {
    lifeLine: {
      '长且深·弧度大': '生命力旺盛·精力充沛',
      '长但浅·贴近拇指': '体质一般·宜注意养生',
      '短但清晰': '行动力强·注重当下',
      '有断裂或圈': '曾经历变故·需注意健康',
    },
    headLine: {
      '直线·很长': '思维理性·逻辑强',
      '略弯·中等': '思维灵活·兼顾理性与感性',
      '明显下弯': '想象力丰富·艺术天分',
      '和生命线连在一起': '谨慎稳重·深思熟虑',
      '和生命线分开': '独立果断·行动力强',
    },
    heartLine: {
      '很长到食指下': '理想主义·对感情要求高',
      '到中指下结束': '以自我为中心·务实',
      '食指中指之间': '平衡型·感情观健康',
      '比较直平': '理性对待感情',
      '很多分叉': '感情经历丰富·情感细腻',
    },
    fateLine: {
      '有且清晰': '事业目标明确·自律强',
      '断断续续': '经历多次变化·转型多',
      '从中间才开始': '中年后事业渐明',
      '没有': '自由型·不受拘束',
    },
  };

  return descriptions[questionId]?.[answer] || answer;
}
