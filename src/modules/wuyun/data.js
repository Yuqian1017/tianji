/**
 * 五运六气 — Five Movements & Six Qi Data
 */

export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干化运 (Heavenly Stem → Transport)
export const TIANGAN_YUN = {
  '甲': { yun: '土', excess: true },  '己': { yun: '土', excess: false },
  '乙': { yun: '金', excess: false }, '庚': { yun: '金', excess: true },
  '丙': { yun: '水', excess: true },  '辛': { yun: '水', excess: false },
  '丁': { yun: '木', excess: false }, '壬': { yun: '木', excess: true },
  '戊': { yun: '火', excess: true },  '癸': { yun: '火', excess: false },
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
  '厥阴风木': { element: '木', climate: '多风·善变', organ: '肝胆', color: '#22c55e' },
  '少阴君火': { element: '火', climate: '温热·升发', organ: '心小肠', color: '#ef4444' },
  '太阴湿土': { element: '土', climate: '多湿·黏滞', organ: '脾胃', color: '#eab308' },
  '少阳相火': { element: '火', climate: '暑热·升腾', organ: '三焦胆', color: '#f97316' },
  '阳明燥金': { element: '金', climate: '干燥·收敛', organ: '肺大肠', color: '#9ca3af' },
  '太阳寒水': { element: '水', climate: '寒冷·凝滞', organ: '肾膀胱', color: '#3b82f6' },
};

// 主运 (Primary Transport — fixed every year)
export const PRIMARY_YUN = [
  { stage: '初运', time: '大寒→春分', element: '木', season: '春', character: '风' },
  { stage: '二运', time: '春分→芒种', element: '火', season: '夏', character: '热' },
  { stage: '三运', time: '芒种→处暑', element: '土', season: '长夏', character: '湿' },
  { stage: '四运', time: '处暑→立冬', element: '金', season: '秋', character: '燥' },
  { stage: '终运', time: '立冬→大寒', element: '水', season: '冬', character: '寒' },
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
  { year: 2024, ganzi: '甲辰', wuyun: '土运太过', sitian: '太阳寒水', zaiquan: '太阴湿土', feature: '寒湿交加·脾胃关注' },
  { year: 2025, ganzi: '乙巳', wuyun: '金运不及', sitian: '厥阴风木', zaiquan: '少阳相火', feature: '肺弱风盛·呼吸道+肝胆' },
  { year: 2026, ganzi: '丙午', wuyun: '水运太过', sitian: '少阴君火', zaiquan: '阳明燥金', feature: '水火交战·心肾关注' },
  { year: 2027, ganzi: '丁未', wuyun: '木运不及', sitian: '太阴湿土', zaiquan: '太阳寒水', feature: '肝弱湿重·关节脾胃' },
  { year: 2028, ganzi: '戊申', wuyun: '火运太过', sitian: '少阳相火', zaiquan: '厥阴风木', feature: '火旺伤金·心血管+呼吸' },
  { year: 2029, ganzi: '己酉', wuyun: '土运不及', sitian: '阳明燥金', zaiquan: '少阴君火', feature: '脾虚燥甚·消化+皮肤' },
];

// 五行配色
export const WUXING_COLORS = {
  '木': '#22c55e', '火': '#ef4444', '土': '#eab308', '金': '#9ca3af', '水': '#3b82f6',
};
