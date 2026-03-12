/**
 * 体质辨识 — Constitution Assessment Data
 * Based on 王琦九种体质分类法 (Wang Qi's Nine Constitution Classification)
 */

// 9种体质定义
export const TIZHI_TYPES = [
  {
    id: 'pinghe', name: '平和质', wuxing: '平衡',
    characteristics: ['体态适中', '精力充沛', '睡眠好', '面色红润', '适应力强'],
    susceptible: '少病',
    regulation: '维持均衡',
    brief: '阴阳气血调和，体态适中，面色红润'
  },
  {
    id: 'qixu', name: '气虚质', wuxing: 'earth',
    characteristics: ['疲乏无力', '气短懒言', '易感冒', '声音低弱', '舌淡胖有齿痕'],
    susceptible: '感冒·内脏下垂·慢性疲劳',
    regulation: '补气健脾',
    brief: '元气不足，疲乏气短，抵抗力弱'
  },
  {
    id: 'yangxu', name: '阳虚质', wuxing: 'fire',
    characteristics: ['畏寒怕冷', '手脚冰凉', '精神不振', '小便清长', '大便溏'],
    susceptible: '水肿·腹泻·关节冷痛',
    regulation: '温阳补火',
    brief: '阳气不足，畏寒肢冷，喜热饮食'
  },
  {
    id: 'yinxu', name: '阴虚质', wuxing: 'water',
    characteristics: ['口干咽燥', '手足心热', '盗汗', '皮肤干燥', '舌红少苔'],
    susceptible: '失眠·便秘·干燥症',
    regulation: '滋阴清热',
    brief: '阴液亏少，口燥咽干，手足心热'
  },
  {
    id: 'tanshi', name: '痰湿质', wuxing: 'earth',
    characteristics: ['体形肥胖', '腹部胀满', '痰多', '口黏', '舌胖苔腻'],
    susceptible: '高血脂·糖尿病·脂肪肝',
    regulation: '化痰祛湿',
    brief: '痰湿凝聚，体胖腹满，面部油光'
  },
  {
    id: 'shire', name: '湿热质', wuxing: 'earth',
    characteristics: ['面垢油光', '口苦口臭', '大便黏臭', '小便黄', '易生痤疮'],
    susceptible: '痤疮·泌尿感染·黄疸',
    regulation: '清热利湿',
    brief: '湿热内蕴，面垢油光，口苦口臭'
  },
  {
    id: 'xueyu', name: '血瘀质', wuxing: 'wood',
    characteristics: ['面色晦暗', '唇色紫暗', '舌有瘀斑', '固定刺痛', '皮肤干燥'],
    susceptible: '心脑血管·肿瘤·痛经',
    regulation: '活血化瘀',
    brief: '血行不畅，面色晦暗，易生瘀斑'
  },
  {
    id: 'qiyu', name: '气郁质', wuxing: 'wood',
    characteristics: ['情绪低落', '多叹气', '胁肋胀痛', '咽有异物感', '失眠多梦'],
    susceptible: '抑郁·乳腺增生·甲状腺疾病',
    regulation: '疏肝理气',
    brief: '气机郁滞，情志抑郁，多愁善感'
  },
  {
    id: 'tebiao', name: '特禀质', wuxing: '先天',
    characteristics: ['过敏体质', '对花粉/尘螨过敏', '易起荨麻疹', '打喷嚏', '哮喘'],
    susceptible: '哮喘·荨麻疹·花粉症',
    regulation: '益气固表',
    brief: '先天特殊体质，易对外界过敏'
  },
];

// 体质问卷 — 每种体质3-4题，共33题
// score: 1=从不, 2=很少, 3=有时, 4=经常, 5=总是
export const TIZHI_QUESTIONS = [
  // 平和质 (4题, 正向计分)
  { q: '您精力充沛吗？', type: 'pinghe' },
  { q: '您容易疲乏吗？', type: 'pinghe', reverse: true },
  { q: '您说话声音洪亮吗？', type: 'pinghe' },
  { q: '您适应能力强吗（如换环境、换气候）？', type: 'pinghe' },

  // 气虚质 (4题)
  { q: '您容易气短（呼吸短促、接不上气）吗？', type: 'qixu' },
  { q: '您容易感冒吗？', type: 'qixu' },
  { q: '您喜欢安静、懒得说话吗？', type: 'qixu' },
  { q: '您活动量稍大就容易出虚汗吗？', type: 'qixu' },

  // 阳虚质 (4题)
  { q: '您手脚发凉吗？', type: 'yangxu' },
  { q: '您胃脘部、背部或腰膝部怕冷吗？', type: 'yangxu' },
  { q: '您比别人容易受不了寒冷吗？', type: 'yangxu' },
  { q: '您吃（喝）凉的东西会感到不舒服或者怕吃（喝）凉东西吗？', type: 'yangxu' },

  // 阴虚质 (4题)
  { q: '您感到手脚心发热吗？', type: 'yinxu' },
  { q: '您感到身体、脸上发热吗？', type: 'yinxu' },
  { q: '您皮肤或口唇干吗？', type: 'yinxu' },
  { q: '您口唇的颜色比一般人红吗？', type: 'yinxu' },

  // 痰湿质 (3题)
  { q: '您感到胸闷或腹部胀满吗？', type: 'tanshi' },
  { q: '您体形偏胖吗（尤其腹部）？', type: 'tanshi' },
  { q: '您额头部位容易出油吗？', type: 'tanshi' },
  { q: '您上眼睑比别人肿（上眼睑有轻微隆起的现象）吗？', type: 'tanshi' },

  // 湿热质 (3题)
  { q: '您面部或鼻部有油腻感或者油亮发光吗？', type: 'shire' },
  { q: '您容易生痤疮或者疮疖吗？', type: 'shire' },
  { q: '您口中有苦味或嘴里异味吗？', type: 'shire' },

  // 血瘀质 (3题)
  { q: '您皮肤在不知不觉中会出现青紫瘀斑吗？', type: 'xueyu' },
  { q: '您两颧部有细微红丝吗？', type: 'xueyu' },
  { q: '您身体上有哪里疼痛吗？', type: 'xueyu' },
  { q: '您面色晦暗或者容易出现褐斑吗？', type: 'xueyu' },

  // 气郁质 (3题)
  { q: '您感到闷闷不乐、情绪低沉吗？', type: 'qiyu' },
  { q: '您容易精神紧张、焦虑不安吗？', type: 'qiyu' },
  { q: '您多愁善感、感情脆弱吗？', type: 'qiyu' },
  { q: '您容易感到害怕或受到惊吓吗？', type: 'qiyu' },

  // 特禀质 (3题)
  { q: '您没有感冒也会打喷嚏吗？', type: 'tebiao' },
  { q: '您没有感冒也会鼻塞、流鼻涕吗？', type: 'tebiao' },
  { q: '您有因季节变化、温度变化或异味等原因而咳喘的现象吗？', type: 'tebiao' },
];

// 体质调养方案
export const TIZHI_PLANS = {
  pinghe: {
    food: { grains: ['五谷杂粮均衡'], meats: ['适量各类'], veg: ['时令蔬果'], medicinal: ['枸杞', '菊花'] },
    tea: '枸杞菊花茶（日常保健）',
    acupoints: ['足三里'],
    acuMethod: '每日按揉保健',
    exercise: ['每周3-5次中等强度运动'],
    sleep: '规律作息，早睡早起',
    avoid: ['暴饮暴食', '过度劳累', '无需特别忌口'],
  },
  qixu: {
    food: { grains: ['小米粥', '山药粥', '糯米'], meats: ['鸡肉', '牛肉', '黄鳝'], veg: ['山药', '土豆', '南瓜', '香菇', '红枣', '桂圆'], medicinal: ['黄芪', '党参', '白术', '茯苓'] },
    tea: '黄芪红枣茶（黄芪15g + 红枣5枚 + 枸杞10g）',
    acupoints: ['足三里', '气海', '关元'],
    acuMethod: '艾灸或按揉',
    exercise: ['太极拳', '八段锦', '散步'],
    sleep: '早睡(22:00前)·午休20分钟',
    avoid: ['生冷食物', '过度劳累', '大汗淋漓的运动'],
  },
  yangxu: {
    food: { grains: ['糯米', '高粱'], meats: ['羊肉', '虾', '海参'], veg: ['韭菜', '洋葱', '南瓜', '核桃', '板栗', '荔枝'], medicinal: ['肉桂', '干姜'] },
    tea: '肉桂红糖姜茶（肉桂3g + 生姜3片 + 红糖适量）',
    acupoints: ['命门', '关元', '神阙'],
    acuMethod: '艾灸为主',
    exercise: ['慢跑', '快走', '阳光下运动'],
    sleep: '早睡·冬季注意保暖·睡前泡脚',
    avoid: ['冰饮', '西瓜', '螃蟹', '空调过低', '熬夜'],
  },
  yinxu: {
    food: { grains: ['小麦', '粳米'], meats: ['鸭肉', '猪肉', '甲鱼'], veg: ['百合', '银耳', '梨', '藕', '黑芝麻', '桑葚', '枸杞'], medicinal: ['麦冬', '石斛', '玉竹', '沙参'] },
    tea: '枸杞菊花茶（枸杞15g + 菊花5朵 + 麦冬10g）',
    acupoints: ['三阴交', '太溪', '涌泉'],
    acuMethod: '按揉为主，少灸',
    exercise: ['游泳', '瑜伽', '太极(忌大汗)'],
    sleep: '保证睡眠·减少熬夜·环境保湿',
    avoid: ['辛辣', '煎炸', '烧烤', '熬夜', '桑拿'],
  },
  tanshi: {
    food: { grains: ['薏米', '赤小豆', '玉米'], meats: ['鲫鱼', '鲤鱼'], veg: ['冬瓜', '白萝卜', '芹菜', '海带', '荷叶'], medicinal: ['陈皮', '茯苓', '薏仁', '白扁豆'] },
    tea: '薏米陈皮茶（薏米30g + 陈皮6g + 茯苓10g，煮水）',
    acupoints: ['丰隆', '足三里', '阴陵泉'],
    acuMethod: '按揉+艾灸',
    exercise: ['快走', '跑步', '爬山(需出汗排湿)'],
    sleep: '少坐多动·避免潮湿环境',
    avoid: ['甜食', '肥肉', '冰饮', '乳制品过量', '久坐'],
  },
  shire: {
    food: { grains: ['薏米', '绿豆'], meats: ['鸭肉', '兔肉'], veg: ['苦瓜', '黄瓜', '冬瓜', '绿豆芽', '马齿苋'], medicinal: ['蒲公英', '金银花', '栀子'] },
    tea: '蒲公英金银花茶（蒲公英10g + 金银花10g + 菊花5g）',
    acupoints: ['曲池', '合谷', '阴陵泉'],
    acuMethod: '按揉泻法',
    exercise: ['游泳', '中强度有氧'],
    sleep: '清淡饮食·保持皮肤清洁·忌烟酒',
    avoid: ['辣椒', '煎炸', '甜腻', '烟酒', '火锅', '熬夜'],
  },
  xueyu: {
    food: { grains: ['黑米', '紫米', '燕麦'], meats: ['适量红肉补血'], veg: ['山楂', '黑木耳', '洋葱', '藕', '桃仁'], medicinal: ['当归', '丹参', '红花', '三七'] },
    tea: '玫瑰山楂茶（玫瑰花6朵 + 山楂5g + 红糖适量）',
    acupoints: ['血海', '三阴交', '太冲'],
    acuMethod: '按揉活血',
    exercise: ['有氧运动', '拉伸', '舞蹈'],
    sleep: '避免久坐·保持运动·情绪舒畅',
    avoid: ['寒凉食物(使血更瘀)', '久坐不动', '抑郁'],
  },
  qiyu: {
    food: { grains: ['正常饮食'], meats: ['正常'], veg: ['柑橘', '佛手', '金橘', '薄荷', '茼蒿'], medicinal: ['香附', '郁金', '合欢花', '玫瑰花'] },
    tea: '玫瑰薄荷疏肝茶（玫瑰花6朵 + 薄荷3g + 佛手5g）',
    acupoints: ['太冲', '期门', '膻中'],
    acuMethod: '按揉疏肝理气',
    exercise: ['跑步', '唱歌', '社交运动', '瑜伽'],
    sleep: '多社交·培养兴趣·避免独处过久·听音乐',
    avoid: ['独处', '压抑情绪', '过度思虑', '咖啡因过量'],
  },
  tebiao: {
    food: { grains: ['正常(避开过敏原)'], meats: ['选不过敏的种类'], veg: ['山药', '大枣'], medicinal: ['黄芪', '防风', '白术(玉屏风散)'] },
    tea: '黄芪防风茶（黄芪15g + 防风6g + 白术10g）',
    acupoints: ['足三里', '肺俞', '风池'],
    acuMethod: '增强免疫',
    exercise: ['适度运动增强体质'],
    sleep: '避免过敏原·保持环境清洁',
    avoid: ['已知过敏原', '辛辣刺激', '环境污染'],
  },
};
