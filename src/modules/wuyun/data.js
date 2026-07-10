/**
 * 五运六气 — Five Movements & Six Qi Data
 */

export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干化运 (Heavenly Stem → Transport)
export const TIANGAN_YUN = {
  '甲': { yun: '土', tone: '宫', excess: true },  '己': { yun: '土', tone: '宫', excess: false },
  '乙': { yun: '金', tone: '商', excess: false }, '庚': { yun: '金', tone: '商', excess: true },
  '丙': { yun: '水', tone: '羽', excess: true },  '辛': { yun: '水', tone: '羽', excess: false },
  '丁': { yun: '木', tone: '角', excess: false }, '壬': { yun: '木', tone: '角', excess: true },
  '戊': { yun: '火', tone: '徵', excess: true },  '癸': { yun: '火', tone: '徵', excess: false },
};

// 地支化气 (Earthly Branch → Qi)
export const DIZHI_QI = {
  '子': { sitian: '少阴君火', zaiquan: '阳明燥金' },
  '午': { sitian: '少阴君火', zaiquan: '阳明燥金' },
  '丑': { sitian: '太阴湿土', zaiquan: '太阳寒水' },
  '未': { sitian: '太阴湿土', zaiquan: '太阳寒水' },
  '寅': { sitian: '少阳相火', zaiquan: '厥阴风木' },
  '申': { sitian: '少阳相火', zaiquan: '厥阴风木' },
  '卯': { sitian: '阳明燥金', zaiquan: '少阴君火' },
  '酉': { sitian: '阳明燥金', zaiquan: '少阴君火' },
  '辰': { sitian: '太阳寒水', zaiquan: '太阴湿土' },
  '戌': { sitian: '太阳寒水', zaiquan: '太阴湿土' },
  '巳': { sitian: '厥阴风木', zaiquan: '少阳相火' },
  '亥': { sitian: '厥阴风木', zaiquan: '少阳相火' },
};

// 三阴三阳六气顺序 (for guest qi calculation)
export const SANYINSANYANG_ORDER = ['厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水'];

// 六气属性
export const QI_INFO = {
  '厥阴风木': { element: '木', climate: '风', color: '#22c55e' },
  '少阴君火': { element: '火', climate: '热', color: '#ef4444' },
  '太阴湿土': { element: '土', climate: '湿', color: '#eab308' },
  '少阳相火': { element: '火', climate: '暑', color: '#f97316' },
  '阳明燥金': { element: '金', climate: '燥', color: '#9ca3af' },
  '太阳寒水': { element: '水', climate: '寒', color: '#3b82f6' },
};

// 主运 (Primary Transport — fixed every year)
export const PRIMARY_YUN = [
  { stage: '初运', time: '大寒日→春分后第12日', element: '木', tone: '角', season: '春', character: '风' },
  { stage: '二运', time: '春分后第13日→芒种后第9日', element: '火', tone: '徵', season: '夏', character: '热' },
  { stage: '三运', time: '芒种后第10日→处暑后第6日', element: '土', tone: '宫', season: '长夏', character: '湿' },
  { stage: '四运', time: '处暑后第7日→立冬后第3日', element: '金', tone: '商', season: '秋', character: '燥' },
  { stage: '终运', time: '立冬后第4日→小寒末', element: '水', tone: '羽', season: '冬', character: '寒' },
];

// 主气 (Primary Qi — fixed every year)
export const PRIMARY_QI = [
  { stage: '初气', time: '大寒→春分', qi: '厥阴风木', character: '风' },
  { stage: '二气', time: '春分→小满', qi: '少阴君火', character: '热' },
  { stage: '三气', time: '小满→大暑', qi: '少阳相火', character: '暑' },
  { stage: '四气', time: '大暑→秋分', qi: '太阴湿土', character: '湿' },
  { stage: '五气', time: '秋分→小雪', qi: '阳明燥金', character: '燥' },
  { stage: '终气', time: '小雪→大寒', qi: '太阳寒水', character: '寒' },
];

// 五行顺序 (for guest transport)
export const WUXING_ORDER = ['木', '火', '土', '金', '水'];

// 近年运气速查
export const RECENT_YUNQI = [
  { year: 2024, ganzi: '甲辰', wuyun: '土运太过', sitian: '太阳寒水', zaiquan: '太阴湿土' },
  { year: 2025, ganzi: '乙巳', wuyun: '金运不及', sitian: '厥阴风木', zaiquan: '少阳相火' },
  { year: 2026, ganzi: '丙午', wuyun: '水运太过', sitian: '少阴君火', zaiquan: '阳明燥金' },
  { year: 2027, ganzi: '丁未', wuyun: '木运不及', sitian: '太阴湿土', zaiquan: '太阳寒水' },
  { year: 2028, ganzi: '戊申', wuyun: '火运太过', sitian: '少阳相火', zaiquan: '厥阴风木' },
  { year: 2029, ganzi: '己酉', wuyun: '土运不及', sitian: '阳明燥金', zaiquan: '少阴君火' },
];

// 五行配色
export const WUXING_COLORS = {
  '木': '#22c55e', '火': '#ef4444', '土': '#eab308', '金': '#9ca3af', '水': '#3b82f6',
};

export const WUYUN_VALIDATION = Object.freeze({
  deterministicCore: 'source_pinned_basic_annual_structure',
  interpretation: 'not_validated',
  productScope: 'traditional_structure_learning_only',
  sourceBasis: [
    '黄帝内经素问·天元纪大论/五运行大论/六微旨大论',
    '医宗金鉴·运气要诀',
  ],
  unimplemented: [
    '古法交司时刻',
    '平气与正化对化',
    '天符、岁会、太乙天符等同化层',
    '不迁正、不退位与胜复',
    '现实气候、疾病与个人健康解释',
  ],
});
