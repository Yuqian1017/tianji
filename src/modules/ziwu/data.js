/**
 * 子午流注 — Meridian Clock Data
 * 12 meridians × 2-hour blocks (时辰)
 */

export const ZIWU_LIUZHU = [
  {
    shichen: '子', hours: '23:00-01:00', hourStart: 23, organ: '胆',
    meridian: '足少阳胆经', wuxing: 'wood',
    yangsheng: '深度睡眠。胆汁分泌旺盛，此时不睡则胆汁代谢不良。',
    illness: '失眠·口苦·偏头痛·胆囊疾病',
    advice: '务必入睡。子时不睡最伤阳气。',
  },
  {
    shichen: '丑', hours: '01:00-03:00', hourStart: 1, organ: '肝',
    meridian: '足厥阴肝经', wuxing: 'wood',
    yangsheng: '肝藏血。此时肝脏进行解毒和血液净化。',
    illness: '面色青灰·烦躁·两胁痛·月经不调',
    advice: '熟睡养肝。丑时醒来多为肝气郁结。',
  },
  {
    shichen: '寅', hours: '03:00-05:00', hourStart: 3, organ: '肺',
    meridian: '手太阴肺经', wuxing: 'metal',
    yangsheng: '肺朝百脉。气血从肺开始新一轮输布。',
    illness: '咳嗽·气喘·胸闷（此时段咳嗽加重提示肺有问题）',
    advice: '深度睡眠或静养。老年人此时醒来可做深呼吸。',
  },
  {
    shichen: '卯', hours: '05:00-07:00', hourStart: 5, organ: '大肠',
    meridian: '手阳明大肠经', wuxing: 'metal',
    yangsheng: '大肠传导排泄。起床后喝温水，促进排便。',
    illness: '便秘·腹泻·痔疮·牙痛',
    advice: '起床排便。最佳排毒时间。',
  },
  {
    shichen: '辰', hours: '07:00-09:00', hourStart: 7, organ: '胃',
    meridian: '足阳明胃经', wuxing: 'earth',
    yangsheng: '胃受纳腐熟。消化功能最强时段。',
    illness: '胃痛·反酸·口臭',
    advice: '吃早餐！此时不吃最伤胃。早餐宜温热丰盛。',
  },
  {
    shichen: '巳', hours: '09:00-11:00', hourStart: 9, organ: '脾',
    meridian: '足太阴脾经', wuxing: 'earth',
    yangsheng: '脾主运化。将早餐营养输送全身。',
    illness: '腹胀·水肿·肌肉无力·嗜睡',
    advice: '可以工作学习。脾运化好，头脑清醒，效率最高。',
  },
  {
    shichen: '午', hours: '11:00-13:00', hourStart: 11, organ: '心',
    meridian: '手少阴心经', wuxing: 'fire',
    yangsheng: '心主血脉。阴阳交替，宜小憩养心。',
    illness: '心悸·失眠·舌尖红·多汗',
    advice: '午休20-30分钟。午时小睡养心神。',
  },
  {
    shichen: '未', hours: '13:00-15:00', hourStart: 13, organ: '小肠',
    meridian: '手太阳小肠经', wuxing: 'fire',
    yangsheng: '小肠分清泌浊。吸收午餐营养。',
    illness: '腹痛·吸收不良',
    advice: '午餐后适量饮水助消化。',
  },
  {
    shichen: '申', hours: '15:00-17:00', hourStart: 15, organ: '膀胱',
    meridian: '足太阳膀胱经', wuxing: 'water',
    yangsheng: '膀胱气化排毒。代谢废物排出。',
    illness: '尿频·尿急·背痛·头痛',
    advice: '多饮水排毒。适合运动锻炼。',
  },
  {
    shichen: '酉', hours: '17:00-19:00', hourStart: 17, organ: '肾',
    meridian: '足少阴肾经', wuxing: 'water',
    yangsheng: '肾藏精纳气。精气充盈时段。',
    illness: '腰酸·耳鸣·水肿·生殖问题',
    advice: '宜进晚餐（不宜过饱）。补肾食物此时吸收最佳。',
  },
  {
    shichen: '戌', hours: '19:00-21:00', hourStart: 19, organ: '心包',
    meridian: '手厥阴心包经', wuxing: 'fire',
    yangsheng: '心包代心行令。保护心脏，适合社交。',
    illness: '胸闷·心悸·失眠前兆',
    advice: '散步·轻松社交·读书。准备入眠。',
  },
  {
    shichen: '亥', hours: '21:00-23:00', hourStart: 21, organ: '三焦',
    meridian: '手少阳三焦经', wuxing: 'fire',
    yangsheng: '三焦通行气血。全身气血归于安宁。',
    illness: '水肿·耳鸣·咽喉肿',
    advice: '准备入睡。亥时百脉皆通，此时入睡最有利恢复。',
  },
];

// 当令经络的推荐穴位
export const MERIDIAN_ACUPOINTS = {
  '胆': [{ point: '风池', location: '后脑勺发际两侧凹陷', benefit: '疏风·清头目·治偏头痛' }, { point: '阳陵泉', location: '小腿外侧腓骨小头下凹陷', benefit: '利胆·舒筋·治胁痛' }],
  '肝': [{ point: '太冲', location: '足背第1-2跖骨间', benefit: '疏肝·降压·清头目' }, { point: '期门', location: '乳头直下第六肋间', benefit: '疏肝理气·治胁痛' }],
  '肺': [{ point: '列缺', location: '腕横纹上1.5寸桡骨边', benefit: '宣肺·利咽·通鼻窍' }, { point: '合谷', location: '手虎口', benefit: '止痛·疏风·万能穴' }],
  '大肠': [{ point: '合谷', location: '手虎口', benefit: '通便·止痛·清热' }, { point: '曲池', location: '肘横纹外端', benefit: '清热·调肠胃' }],
  '胃': [{ point: '足三里', location: '膝下3寸胫骨外', benefit: '健脾胃·强体·长寿穴' }, { point: '中脘', location: '脐上4寸', benefit: '健脾胃·消食' }],
  '脾': [{ point: '三阴交', location: '内踝上3寸', benefit: '健脾·养血·妇科要穴' }, { point: '足三里', location: '膝下3寸胫骨外', benefit: '健脾胃·补气' }],
  '心': [{ point: '内关', location: '腕横纹上2寸两筋间', benefit: '宁心·止呕·治胸闷' }, { point: '神门', location: '腕横纹尺侧端凹陷', benefit: '安神·治失眠' }],
  '小肠': [{ point: '后溪', location: '握拳小指根下横纹端', benefit: '通督脉·利颈椎' }, { point: '听宫', location: '耳屏前凹陷', benefit: '聪耳·治耳鸣' }],
  '膀胱': [{ point: '委中', location: '膝后窝正中', benefit: '治腰背痛·清热' }, { point: '昆仑', location: '外踝后方凹陷', benefit: '通经·止头痛' }],
  '肾': [{ point: '涌泉', location: '足底前1/3凹陷', benefit: '补肾·降火·安眠' }, { point: '太溪', location: '内踝后方凹陷', benefit: '滋肾阴·治腰酸' }],
  '心包': [{ point: '内关', location: '腕横纹上2寸', benefit: '宁心·止呕·安神' }, { point: '劳宫', location: '握拳中指尖处', benefit: '清心·泻火' }],
  '三焦': [{ point: '外关', location: '腕背横纹上2寸', benefit: '疏经·通络·治耳鸣' }, { point: '支沟', location: '腕背横纹上3寸', benefit: '通便·理气' }],
};

// 五行配色 (for SVG clock)
export const WUXING_COLORS = {
  wood: '#22c55e',
  fire: '#ef4444',
  earth: '#eab308',
  metal: '#9ca3af',
  water: '#3b82f6',
};
