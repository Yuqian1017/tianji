// Face reading data — wuxing types, three stops, feature descriptors, twelve palaces

export const WUXING_FACE_TYPES = {
  metal: {
    name: '金形面',
    element: '金',
    shape: '方脸',
    features: '骨骼分明·线条硬朗·面白',
    personality: '果断·重义·刚毅',
    career: '金融·军警·管理',
  },
  wood: {
    name: '木形面',
    element: '木',
    shape: '长脸',
    features: '瘦长·额窄颧高·面青',
    personality: '仁慈·有创意·善思考',
    career: '文教·艺术·研究',
  },
  water: {
    name: '水形面',
    element: '水',
    shape: '圆脸',
    features: '肉多圆润·面黑润·下巴圆',
    personality: '智慧·灵活·善交际',
    career: '贸易·物流·传媒',
  },
  fire: {
    name: '火形面',
    element: '火',
    shape: '尖脸',
    features: '额宽下巴窄·面红·眼锐',
    personality: '热情·急躁·有魄力',
    career: '科技·能源·餐饮',
  },
  earth: {
    name: '土形面',
    element: '土',
    shape: '方圆脸',
    features: '敦厚·鼻大·面黄·肉厚',
    personality: '稳重·诚信·包容',
    career: '地产·农业·教育',
  },
};

export const THREE_STOP_LABELS = {
  upper: { name: '上停', period: '少年运(15-30岁)', governs: '智慧·祖荫·父母缘' },
  middle: { name: '中停', period: '中年运(31-50岁)', governs: '事业·意志·自我' },
  lower: { name: '下停', period: '晚年运(51岁后)', governs: '财富·子女·晚景' },
};

export function describeThreeStops(upper, middle, lower) {
  const stops = [
    { name: '上停', val: upper },
    { name: '中停', val: middle },
    { name: '下停', val: lower },
  ];
  const sorted = [...stops].sort((a, b) => b.val - a.val);
  const diff = sorted[0].val - sorted[2].val;

  if (diff < 5) return '三停均匀，一生运势平稳';
  if (sorted[0].name === '上停') return '上停偏长，少年得志·学业佳';
  if (sorted[0].name === '中停') return '中停偏长，事业心强·中年发力';
  return '下停偏长，晚年有福·子女孝顺';
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
  if (gapToEye > 1.5) return '眉间距宽·心胸开阔';
  if (gapToEye > 1.0) return '眉间距适中';
  return '眉间距窄·心思细密';
}

export function describeYintang(toFaceRatio) {
  if (toFaceRatio > 0.08) return '印堂宽阔';
  if (toFaceRatio > 0.05) return '印堂适中';
  return '印堂偏窄';
}

export function describeChin(toFaceRatio) {
  if (toFaceRatio > 0.28) return '下巴长·晚年运佳';
  if (toFaceRatio > 0.22) return '下巴适中';
  return '下巴短·行动力强';
}

export function describeSymmetry(score) {
  if (score > 92) return '高度对称';
  if (score > 80) return '基本对称';
  return '略有不对称';
}

export const TWELVE_PALACES = {
  '命宫': { location: '两眉之间·印堂', governs: '总运·性格·精神' },
  '财帛宫': { location: '鼻头', governs: '财运·理财能力' },
  '兄弟宫': { location: '眉毛', governs: '兄弟朋友·人际' },
  '夫妻宫': { location: '眼尾', governs: '婚姻·感情' },
  '子女宫': { location: '眼下', governs: '子女·生育·桃花' },
  '疾厄宫': { location: '山根', governs: '健康·抗病力' },
  '迁移宫': { location: '额头两侧', governs: '出行·外出运' },
  '交友宫': { location: '腮部', governs: '下属·社交' },
  '官禄宫': { location: '额头中央', governs: '事业·权力' },
  '田宅宫': { location: '眉眼之间', governs: '不动产·家庭' },
  '福德宫': { location: '眉尾上方', governs: '精神·福气' },
  '父母宫': { location: '额头左右', governs: '父母缘·遗传' },
};
