// ===== 八卦基础数据 =====
export const BAGUA = {
  '乾': { wuxing: 'metal', binary: '111' },
  '兑': { wuxing: 'metal', binary: '110' },
  '离': { wuxing: 'fire',  binary: '101' },
  '震': { wuxing: 'wood',  binary: '100' },
  '巽': { wuxing: 'wood',  binary: '011' },
  '坎': { wuxing: 'water', binary: '010' },
  '艮': { wuxing: 'earth', binary: '001' },
  '坤': { wuxing: 'earth', binary: '000' },
};

// binary → 卦名 反查
export const BINARY_TO_GUA = {};
for (const [name, info] of Object.entries(BAGUA)) {
  BINARY_TO_GUA[info.binary] = name;
}

// ===== 纳甲表 =====
export const NAJIA = {
  '乾': { stem: '甲', inner: ['子','寅','辰'], outer: ['午','申','戌'] },
  '坤': { stem: '乙', inner: ['未','巳','卯'], outer: ['丑','亥','酉'] },
  '震': { stem: '庚', inner: ['子','寅','辰'], outer: ['午','申','戌'] },
  '巽': { stem: '辛', inner: ['丑','亥','酉'], outer: ['未','巳','卯'] },
  '坎': { stem: '戊', inner: ['寅','辰','午'], outer: ['申','戌','子'] },
  '离': { stem: '己', inner: ['卯','丑','亥'], outer: ['酉','未','巳'] },
  '艮': { stem: '丙', inner: ['辰','午','申'], outer: ['戌','子','寅'] },
  '兑': { stem: '丁', inner: ['巳','卯','丑'], outer: ['亥','酉','未'] },
};

// ===== 地支五行 =====
export const BRANCH_WUXING = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire',  '午': 'fire',  '未': 'earth',
  '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
};

// ===== 天干数据 =====
export const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// ===== 六神 =====
export const SIX_SPIRITS_ORDER = ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
export const SPIRIT_START = {
  '甲':0, '乙':0, '丙':1, '丁':1, '戊':2,
  '己':3, '庚':4, '辛':4, '壬':5, '癸':5,
};

// ===== 京房八宫 =====
export const JINGFANG = {
  '乾宫': {
    wuxing: 'metal',
    gua: [
      { name: '乾为天',   upper: '乾', lower: '乾', type: '本宫', world: 6, response: 3 },
      { name: '天风姤',   upper: '乾', lower: '巽', type: '一世', world: 1, response: 4 },
      { name: '天山遁',   upper: '乾', lower: '艮', type: '二世', world: 2, response: 5 },
      { name: '天地否',   upper: '乾', lower: '坤', type: '三世', world: 3, response: 6 },
      { name: '风地观',   upper: '巽', lower: '坤', type: '四世', world: 4, response: 1 },
      { name: '山地剥',   upper: '艮', lower: '坤', type: '五世', world: 5, response: 2 },
      { name: '火地晋',   upper: '离', lower: '坤', type: '游魂', world: 4, response: 1 },
      { name: '火天大有', upper: '离', lower: '乾', type: '归魂', world: 3, response: 6 },
    ],
  },
  '兑宫': {
    wuxing: 'metal',
    gua: [
      { name: '兑为泽',   upper: '兑', lower: '兑', type: '本宫', world: 6, response: 3 },
      { name: '泽水困',   upper: '兑', lower: '坎', type: '一世', world: 1, response: 4 },
      { name: '泽地萃',   upper: '兑', lower: '坤', type: '二世', world: 2, response: 5 },
      { name: '泽山咸',   upper: '兑', lower: '艮', type: '三世', world: 3, response: 6 },
      { name: '水山蹇',   upper: '坎', lower: '艮', type: '四世', world: 4, response: 1 },
      { name: '地山谦',   upper: '坤', lower: '艮', type: '五世', world: 5, response: 2 },
      { name: '雷山小过', upper: '震', lower: '艮', type: '游魂', world: 4, response: 1 },
      { name: '雷泽归妹', upper: '震', lower: '兑', type: '归魂', world: 3, response: 6 },
    ],
  },
  '离宫': {
    wuxing: 'fire',
    gua: [
      { name: '离为火',   upper: '离', lower: '离', type: '本宫', world: 6, response: 3 },
      { name: '火山旅',   upper: '离', lower: '艮', type: '一世', world: 1, response: 4 },
      { name: '火风鼎',   upper: '离', lower: '巽', type: '二世', world: 2, response: 5 },
      { name: '火水未济', upper: '离', lower: '坎', type: '三世', world: 3, response: 6 },
      { name: '山水蒙',   upper: '艮', lower: '坎', type: '四世', world: 4, response: 1 },
      { name: '风水涣',   upper: '巽', lower: '坎', type: '五世', world: 5, response: 2 },
      { name: '天水讼',   upper: '乾', lower: '坎', type: '游魂', world: 4, response: 1 },
      { name: '天火同人', upper: '乾', lower: '离', type: '归魂', world: 3, response: 6 },
    ],
  },
  '震宫': {
    wuxing: 'wood',
    gua: [
      { name: '震为雷',   upper: '震', lower: '震', type: '本宫', world: 6, response: 3 },
      { name: '雷地豫',   upper: '震', lower: '坤', type: '一世', world: 1, response: 4 },
      { name: '雷水解',   upper: '震', lower: '坎', type: '二世', world: 2, response: 5 },
      { name: '雷风恒',   upper: '震', lower: '巽', type: '三世', world: 3, response: 6 },
      { name: '地风升',   upper: '坤', lower: '巽', type: '四世', world: 4, response: 1 },
      { name: '水风井',   upper: '坎', lower: '巽', type: '五世', world: 5, response: 2 },
      { name: '泽风大过', upper: '兑', lower: '巽', type: '游魂', world: 4, response: 1 },
      { name: '泽雷随',   upper: '兑', lower: '震', type: '归魂', world: 3, response: 6 },
    ],
  },
  '巽宫': {
    wuxing: 'wood',
    gua: [
      { name: '巽为风',   upper: '巽', lower: '巽', type: '本宫', world: 6, response: 3 },
      { name: '风天小畜', upper: '巽', lower: '乾', type: '一世', world: 1, response: 4 },
      { name: '风火家人', upper: '巽', lower: '离', type: '二世', world: 2, response: 5 },
      { name: '风雷益',   upper: '巽', lower: '震', type: '三世', world: 3, response: 6 },
      { name: '天雷无妄', upper: '乾', lower: '震', type: '四世', world: 4, response: 1 },
      { name: '火雷噬嗑', upper: '离', lower: '震', type: '五世', world: 5, response: 2 },
      { name: '山雷颐',   upper: '艮', lower: '震', type: '游魂', world: 4, response: 1 },
      { name: '山风蛊',   upper: '艮', lower: '巽', type: '归魂', world: 3, response: 6 },
    ],
  },
  '坎宫': {
    wuxing: 'water',
    gua: [
      { name: '坎为水',   upper: '坎', lower: '坎', type: '本宫', world: 6, response: 3 },
      { name: '水泽节',   upper: '坎', lower: '兑', type: '一世', world: 1, response: 4 },
      { name: '水雷屯',   upper: '坎', lower: '震', type: '二世', world: 2, response: 5 },
      { name: '水火既济', upper: '坎', lower: '离', type: '三世', world: 3, response: 6 },
      { name: '泽火革',   upper: '兑', lower: '离', type: '四世', world: 4, response: 1 },
      { name: '雷火丰',   upper: '震', lower: '离', type: '五世', world: 5, response: 2 },
      { name: '地火明夷', upper: '坤', lower: '离', type: '游魂', world: 4, response: 1 },
      { name: '地水师',   upper: '坤', lower: '坎', type: '归魂', world: 3, response: 6 },
    ],
  },
  '艮宫': {
    wuxing: 'earth',
    gua: [
      { name: '艮为山',   upper: '艮', lower: '艮', type: '本宫', world: 6, response: 3 },
      { name: '山火贲',   upper: '艮', lower: '离', type: '一世', world: 1, response: 4 },
      { name: '山天大畜', upper: '艮', lower: '乾', type: '二世', world: 2, response: 5 },
      { name: '山泽损',   upper: '艮', lower: '兑', type: '三世', world: 3, response: 6 },
      { name: '火泽睽',   upper: '离', lower: '兑', type: '四世', world: 4, response: 1 },
      { name: '天泽履',   upper: '乾', lower: '兑', type: '五世', world: 5, response: 2 },
      { name: '风泽中孚', upper: '巽', lower: '兑', type: '游魂', world: 4, response: 1 },
      { name: '风山渐',   upper: '巽', lower: '艮', type: '归魂', world: 3, response: 6 },
    ],
  },
  '坤宫': {
    wuxing: 'earth',
    gua: [
      { name: '坤为地',   upper: '坤', lower: '坤', type: '本宫', world: 6, response: 3 },
      { name: '地雷复',   upper: '坤', lower: '震', type: '一世', world: 1, response: 4 },
      { name: '地泽临',   upper: '坤', lower: '兑', type: '二世', world: 2, response: 5 },
      { name: '地天泰',   upper: '坤', lower: '乾', type: '三世', world: 3, response: 6 },
      { name: '雷天大壮', upper: '震', lower: '乾', type: '四世', world: 4, response: 1 },
      { name: '泽天夬',   upper: '兑', lower: '乾', type: '五世', world: 5, response: 2 },
      { name: '水天需',   upper: '坎', lower: '乾', type: '游魂', world: 4, response: 1 },
      { name: '水地比',   upper: '坎', lower: '坤', type: '归魂', world: 3, response: 6 },
    ],
  },
};

// ===== 伏神基准表（八纯卦各爻六亲） =====
export const PURE_GUA_LIUQIN = {
  '乾': {
    wuxing: 'metal',
    lines: [
      { pos:1, najia:'甲子', branch:'子', wx:'water', liuqin:'子孙' },
      { pos:2, najia:'甲寅', branch:'寅', wx:'wood',  liuqin:'妻财' },
      { pos:3, najia:'甲辰', branch:'辰', wx:'earth', liuqin:'父母' },
      { pos:4, najia:'壬午', branch:'午', wx:'fire',  liuqin:'官鬼' },
      { pos:5, najia:'壬申', branch:'申', wx:'metal', liuqin:'兄弟' },
      { pos:6, najia:'壬戌', branch:'戌', wx:'earth', liuqin:'父母' },
    ],
  },
  '兑': {
    wuxing: 'metal',
    lines: [
      { pos:1, najia:'丁巳', branch:'巳', wx:'fire',  liuqin:'官鬼' },
      { pos:2, najia:'丁卯', branch:'卯', wx:'wood',  liuqin:'妻财' },
      { pos:3, najia:'丁丑', branch:'丑', wx:'earth', liuqin:'父母' },
      { pos:4, najia:'丁亥', branch:'亥', wx:'water', liuqin:'子孙' },
      { pos:5, najia:'丁酉', branch:'酉', wx:'metal', liuqin:'兄弟' },
      { pos:6, najia:'丁未', branch:'未', wx:'earth', liuqin:'父母' },
    ],
  },
  '离': {
    wuxing: 'fire',
    lines: [
      { pos:1, najia:'己卯', branch:'卯', wx:'wood',  liuqin:'父母' },
      { pos:2, najia:'己丑', branch:'丑', wx:'earth', liuqin:'子孙' },
      { pos:3, najia:'己亥', branch:'亥', wx:'water', liuqin:'官鬼' },
      { pos:4, najia:'己酉', branch:'酉', wx:'metal', liuqin:'妻财' },
      { pos:5, najia:'己未', branch:'未', wx:'earth', liuqin:'子孙' },
      { pos:6, najia:'己巳', branch:'巳', wx:'fire',  liuqin:'兄弟' },
    ],
  },
  '震': {
    wuxing: 'wood',
    lines: [
      { pos:1, najia:'庚子', branch:'子', wx:'water', liuqin:'父母' },
      { pos:2, najia:'庚寅', branch:'寅', wx:'wood',  liuqin:'兄弟' },
      { pos:3, najia:'庚辰', branch:'辰', wx:'earth', liuqin:'妻财' },
      { pos:4, najia:'庚午', branch:'午', wx:'fire',  liuqin:'子孙' },
      { pos:5, najia:'庚申', branch:'申', wx:'metal', liuqin:'官鬼' },
      { pos:6, najia:'庚戌', branch:'戌', wx:'earth', liuqin:'妻财' },
    ],
  },
  '巽': {
    wuxing: 'wood',
    lines: [
      { pos:1, najia:'辛丑', branch:'丑', wx:'earth', liuqin:'妻财' },
      { pos:2, najia:'辛亥', branch:'亥', wx:'water', liuqin:'父母' },
      { pos:3, najia:'辛酉', branch:'酉', wx:'metal', liuqin:'官鬼' },
      { pos:4, najia:'辛未', branch:'未', wx:'earth', liuqin:'妻财' },
      { pos:5, najia:'辛巳', branch:'巳', wx:'fire',  liuqin:'子孙' },
      { pos:6, najia:'辛卯', branch:'卯', wx:'wood',  liuqin:'兄弟' },
    ],
  },
  '坎': {
    wuxing: 'water',
    lines: [
      { pos:1, najia:'戊寅', branch:'寅', wx:'wood',  liuqin:'子孙' },
      { pos:2, najia:'戊辰', branch:'辰', wx:'earth', liuqin:'官鬼' },
      { pos:3, najia:'戊午', branch:'午', wx:'fire',  liuqin:'妻财' },
      { pos:4, najia:'戊申', branch:'申', wx:'metal', liuqin:'父母' },
      { pos:5, najia:'戊戌', branch:'戌', wx:'earth', liuqin:'官鬼' },
      { pos:6, najia:'戊子', branch:'子', wx:'water', liuqin:'兄弟' },
    ],
  },
  '艮': {
    wuxing: 'earth',
    lines: [
      { pos:1, najia:'丙辰', branch:'辰', wx:'earth', liuqin:'兄弟' },
      { pos:2, najia:'丙午', branch:'午', wx:'fire',  liuqin:'父母' },
      { pos:3, najia:'丙申', branch:'申', wx:'metal', liuqin:'子孙' },
      { pos:4, najia:'丙戌', branch:'戌', wx:'earth', liuqin:'兄弟' },
      { pos:5, najia:'丙子', branch:'子', wx:'water', liuqin:'妻财' },
      { pos:6, najia:'丙寅', branch:'寅', wx:'wood',  liuqin:'官鬼' },
    ],
  },
  '坤': {
    wuxing: 'earth',
    lines: [
      { pos:1, najia:'乙未', branch:'未', wx:'earth', liuqin:'兄弟' },
      { pos:2, najia:'乙巳', branch:'巳', wx:'fire',  liuqin:'父母' },
      { pos:3, najia:'乙卯', branch:'卯', wx:'wood',  liuqin:'官鬼' },
      { pos:4, najia:'癸丑', branch:'丑', wx:'earth', liuqin:'兄弟' },
      { pos:5, najia:'癸亥', branch:'亥', wx:'water', liuqin:'妻财' },
      { pos:6, najia:'癸酉', branch:'酉', wx:'metal', liuqin:'子孙' },
    ],
  },
};

// ===== 五行中文名 =====
export const WUXING_CN = {
  'metal': '金', 'wood': '木', 'water': '水', 'fire': '火', 'earth': '土',
};

// ===== 爻位名称 =====
export const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
