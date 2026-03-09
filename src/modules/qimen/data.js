/**
 * 奇门遁甲 · 静态数据表
 * 参考: reference/qimen-algorithm.md + 06-qimen/02-zhifu-zhishi-cases.md
 */

// ===== 基础常量 =====

export const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// ===== 九宫 =====

export const JIUGONG = [
  { num: 1, name: '坎', dir: '北',  dirEn: 'N',  wuxing: 'water' },
  { num: 2, name: '坤', dir: '西南', dirEn: 'SW', wuxing: 'earth' },
  { num: 3, name: '震', dir: '东',  dirEn: 'E',  wuxing: 'wood'  },
  { num: 4, name: '巽', dir: '东南', dirEn: 'SE', wuxing: 'wood'  },
  { num: 5, name: '中', dir: '中',  dirEn: 'C',  wuxing: 'earth' }, // 寄坤二宫
  { num: 6, name: '乾', dir: '西北', dirEn: 'NW', wuxing: 'metal' },
  { num: 7, name: '兑', dir: '西',  dirEn: 'W',  wuxing: 'metal' },
  { num: 8, name: '艮', dir: '东北', dirEn: 'NE', wuxing: 'earth' },
  { num: 9, name: '离', dir: '南',  dirEn: 'S',  wuxing: 'fire'  },
];

// 洛书飞星顺序（8宫，去掉中5）
export const LUOSHU_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];

// ===== 九星 =====

export const JIUXING = [
  { name: '天蓬', wuxing: 'water', base: 1, jixiong: '凶' },
  { name: '天芮', wuxing: 'earth', base: 2, jixiong: '凶' },
  { name: '天冲', wuxing: 'wood',  base: 3, jixiong: '吉' },
  { name: '天辅', wuxing: 'wood',  base: 4, jixiong: '吉' },
  { name: '天禽', wuxing: 'earth', base: 5, jixiong: '中' }, // 寄坤二
  { name: '天心', wuxing: 'metal', base: 6, jixiong: '吉' },
  { name: '天柱', wuxing: 'metal', base: 7, jixiong: '凶' },
  { name: '天任', wuxing: 'earth', base: 8, jixiong: '吉' },
  { name: '天英', wuxing: 'fire',  base: 9, jixiong: '凶' },
];

// 九星原始宫位映射
export const STAR_BASE = {
  1: '天蓬', 2: '天芮', 3: '天冲', 4: '天辅',
  5: '天禽', 6: '天心', 7: '天柱', 8: '天任', 9: '天英',
};

// ===== 八门 =====

export const BAMEN = [
  { name: '休门', wuxing: 'water', base: 1, jixiong: '吉' },
  { name: '死门', wuxing: 'earth', base: 2, jixiong: '凶' },
  { name: '伤门', wuxing: 'wood',  base: 3, jixiong: '凶' },
  { name: '杜门', wuxing: 'wood',  base: 4, jixiong: '中' },
  { name: '开门', wuxing: 'metal', base: 6, jixiong: '吉' },
  { name: '惊门', wuxing: 'metal', base: 7, jixiong: '凶' },
  { name: '生门', wuxing: 'earth', base: 8, jixiong: '吉' },
  { name: '景门', wuxing: 'fire',  base: 9, jixiong: '中' },
];

// 八门原始宫位映射（5宫无门）
export const GATE_BASE = {
  1: '休门', 2: '死门', 3: '伤门', 4: '杜门',
  6: '开门', 7: '惊门', 8: '生门', 9: '景门',
};

// ===== 八神 =====

export const BASHEN = {
  yang: ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'], // 阳遁顺排
  yin:  ['值符','九天','九地','玄武','白虎','六合','太阴','螣蛇'], // 阴遁逆排
};

// ===== 三奇六仪 =====

// 地盘排列顺序
export const SANQI_LIUYI_ORDER = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];

// 甲遁于六仪
export const JIA_DUN = {
  '甲子': '戊', '甲戌': '己', '甲申': '庚',
  '甲午': '辛', '甲辰': '壬', '甲寅': '癸',
};

// 旬首→六仪 反查
export const LIUYI_TO_XUNSHOU = {
  '戊': '甲子', '己': '甲戌', '庚': '甲申',
  '辛': '甲午', '壬': '甲辰', '癸': '甲寅',
};

// 三奇标记
export const SANQI = { '乙': '日奇', '丙': '月奇', '丁': '星奇' };

// ===== 节气与局数对应表 =====

export const JIEQI_JU = {
  yang: { // 阳遁（冬至→芒种）
    '冬至': [1,7,4], '小寒': [2,8,5], '大寒': [3,9,6],
    '立春': [8,5,2], '雨水': [9,6,3], '惊蛰': [1,7,4],
    '春分': [3,9,6], '清明': [4,1,7], '谷雨': [5,2,8],
    '立夏': [4,1,7], '小满': [5,2,8], '芒种': [6,3,9],
  },
  yin: { // 阴遁（夏至→大雪）
    '夏至': [9,3,6], '小暑': [8,2,5], '大暑': [7,1,4],
    '立秋': [2,5,8], '处暑': [1,4,7], '白露': [9,3,6],
    '秋分': [7,1,4], '寒露': [6,9,3], '霜降': [5,8,2],
    '立冬': [6,9,3], '小雪': [5,8,2], '大雪': [4,7,1],
  },
};

// 24节气按年内时间顺序（用于查找当前节气）
// 注意：奇门遁甲用所有24节气（节+气都用），不像八字只用12节
export const JIEQI_ORDER = [
  '小寒','大寒','立春','雨水','惊蛰','春分',
  '清明','谷雨','立夏','小满','芒种','夏至',
  '小暑','大暑','立秋','处暑','白露','秋分',
  '寒露','霜降','立冬','小雪','大雪','冬至',
];

// 节气近似日期（月份, 近似日期）— 用于快速定位
export const JIEQI_APPROX = {
  '小寒': [1, 6],  '大寒': [1, 20], '立春': [2, 4],  '雨水': [2, 19],
  '惊蛰': [3, 6],  '春分': [3, 21], '清明': [4, 5],  '谷雨': [4, 20],
  '立夏': [5, 6],  '小满': [5, 21], '芒种': [6, 6],  '夏至': [6, 21],
  '小暑': [7, 7],  '大暑': [7, 23], '立秋': [8, 7],  '处暑': [8, 23],
  '白露': [9, 8],  '秋分': [9, 23], '寒露': [10, 8], '霜降': [10, 23],
  '立冬': [11, 7], '小雪': [11, 22],'大雪': [12, 7], '冬至': [12, 22],
};

// 判断某节气属于阳遁还是阴遁
export function getDunType(jieqiName) {
  return JIEQI_JU.yang[jieqiName] ? 'yang' : 'yin';
}

// ===== 奇门格局 =====

export const JI_GE = [
  { tian: '乙', di: '丙', name: '奇仪相佐', desc: '百事大吉' },
  { tian: '乙', di: '丁', name: '奇仪相佐', desc: '百事吉' },
  { tian: '丙', di: '丁', name: '星月相照', desc: '利谋略' },
  { tian: '乙', di: '己', name: '日奇入地', desc: '事可谋' },
  { tian: '丙', di: '戊', name: '月奇入地', desc: '利财利行' },
  { tian: '丁', di: '戊', name: '星奇入地', desc: '贵人相助' },
];

export const XIONG_GE = [
  { tian: '庚', di: '庚', name: '太白同宫', desc: '大凶' },
  { tian: '庚', di: '丙', name: '荧入太白', desc: '凶·被人告' },
  { tian: '丙', di: '庚', name: '太白入荧', desc: '凶·刑狱' },
  { tian: '庚', di: '癸', name: '大格', desc: '行事受阻' },
  { tian: '癸', di: '庚', name: '小格', desc: '事有阻碍' },
  { tian: '庚', di: '壬', name: '上格', desc: '不利行事' },
  { tian: '壬', di: '庚', name: '下格', desc: '较凶' },
  { tian: '辛', di: '壬', name: '入狱自刑', desc: '忧患' },
  { tian: '癸', di: '辛', name: '网盖天牢', desc: '凶·被困' },
  { tian: '辛', di: '癸', name: '天牢华盖', desc: '官灾' },
];

// ===== 用神速查 =====

export const QIMEN_YONGSHEN = {
  '求财': { star: '天任', gate: '生门', qi: '戊', desc: '生门+戊=财' },
  '求官': { star: '天心', gate: '开门', qi: '丁', desc: '开门+丁=官贵' },
  '婚姻': { gate: null, qi: '乙+庚', desc: '乙庚合=阴阳相合' },
  '出行': { gate: '开门', qi: '乙/丙/丁', desc: '三吉门+三奇' },
  '疾病': { star: '天芮', gate: '死门', desc: '芮星=病星，天心=医药' },
  '诉讼': { gate: '开门', qi: '值符', desc: '开门=法官，值符=权威' },
  '考试': { star: '天辅', gate: '景门', qi: '丁', desc: '天辅=文星，景门=文章' },
};

// ===== 五行颜色（CSS变量映射）=====

export const WUXING_COLORS = {
  water: 'var(--color-wx-water)',
  wood:  'var(--color-wx-wood)',
  fire:  'var(--color-wx-fire)',
  earth: 'var(--color-wx-earth)',
  metal: 'var(--color-wx-metal)',
};

export const WUXING_CN = {
  water: '水', wood: '木', fire: '火', earth: '土', metal: '金',
};

// ===== 时辰映射 =====

export const SHICHEN = [
  { branch: '子', label: '子时 (23-01)', range: '23:00-01:00' },
  { branch: '丑', label: '丑时 (01-03)', range: '01:00-03:00' },
  { branch: '寅', label: '寅时 (03-05)', range: '03:00-05:00' },
  { branch: '卯', label: '卯时 (05-07)', range: '05:00-07:00' },
  { branch: '辰', label: '辰时 (07-09)', range: '07:00-09:00' },
  { branch: '巳', label: '巳时 (09-11)', range: '09:00-11:00' },
  { branch: '午', label: '午时 (11-13)', range: '11:00-13:00' },
  { branch: '未', label: '未时 (13-15)', range: '13:00-15:00' },
  { branch: '申', label: '申时 (15-17)', range: '15:00-17:00' },
  { branch: '酉', label: '酉时 (17-19)', range: '17:00-19:00' },
  { branch: '戌', label: '戌时 (19-21)', range: '19:00-21:00' },
  { branch: '亥', label: '亥时 (21-23)', range: '21:00-23:00' },
];
