/**
 * 风水飞星 · 静态数据表
 * 参考: 07-fengshui/01-xuankong-feixing.md + 03-luopan-data.md
 */

// ===== 九宫 =====

export const JIUGONG = [
  { num: 1, name: '坎', dir: '北',   wuxing: 'water' },
  { num: 2, name: '坤', dir: '西南', wuxing: 'earth' },
  { num: 3, name: '震', dir: '东',   wuxing: 'wood'  },
  { num: 4, name: '巽', dir: '东南', wuxing: 'wood'  },
  { num: 5, name: '中', dir: '中',   wuxing: 'earth' },
  { num: 6, name: '乾', dir: '西北', wuxing: 'metal' },
  { num: 7, name: '兑', dir: '西',   wuxing: 'metal' },
  { num: 8, name: '艮', dir: '东北', wuxing: 'earth' },
  { num: 9, name: '离', dir: '南',   wuxing: 'fire'  },
];

// 洛书飞星路径: 中→乾→兑→艮→离→坎→坤→震→巽
export const FLY_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4];

// 卦→宫位映射
export const GUA_TO_GONG = {
  '坎': 1, '坤': 2, '震': 3, '巽': 4,
  '中': 5, '乾': 6, '兑': 7, '艮': 8, '离': 9,
};

// ===== 三元九运 =====

export const SANYUAN_JIUYUN = [
  { yuan: '上元', yun: 1, start: 1864, end: 1883, wuxing: 'water' },
  { yuan: '上元', yun: 2, start: 1884, end: 1903, wuxing: 'earth' },
  { yuan: '上元', yun: 3, start: 1904, end: 1923, wuxing: 'wood'  },
  { yuan: '中元', yun: 4, start: 1924, end: 1943, wuxing: 'wood'  },
  { yuan: '中元', yun: 5, start: 1944, end: 1963, wuxing: 'earth' },
  { yuan: '中元', yun: 6, start: 1964, end: 1983, wuxing: 'metal' },
  { yuan: '下元', yun: 7, start: 1984, end: 2003, wuxing: 'metal' },
  { yuan: '下元', yun: 8, start: 2004, end: 2023, wuxing: 'earth' },
  { yuan: '下元', yun: 9, start: 2024, end: 2043, wuxing: 'fire'  },
];

// ===== 二十四山 =====

export const ERSHISI_SHAN = [
  // 北方·坎
  { name: '壬', start: 337.5, end: 352.5, gua: '坎', sanyuan: '天', wuxing: 'water', yinyang: '阳' },
  { name: '子', start: 352.5, end:   7.5, gua: '坎', sanyuan: '地', wuxing: 'water', yinyang: '阳' },
  { name: '癸', start:   7.5, end:  22.5, gua: '坎', sanyuan: '人', wuxing: 'water', yinyang: '阴' },
  // 东北·艮
  { name: '丑', start:  22.5, end:  37.5, gua: '艮', sanyuan: '天', wuxing: 'earth', yinyang: '阴' },
  { name: '艮', start:  37.5, end:  52.5, gua: '艮', sanyuan: '地', wuxing: 'earth', yinyang: '阳' },
  { name: '寅', start:  52.5, end:  67.5, gua: '艮', sanyuan: '人', wuxing: 'wood',  yinyang: '阳' },
  // 东方·震
  { name: '甲', start:  67.5, end:  82.5, gua: '震', sanyuan: '天', wuxing: 'wood',  yinyang: '阳' },
  { name: '卯', start:  82.5, end:  97.5, gua: '震', sanyuan: '地', wuxing: 'wood',  yinyang: '阴' },
  { name: '乙', start:  97.5, end: 112.5, gua: '震', sanyuan: '人', wuxing: 'wood',  yinyang: '阴' },
  // 东南·巽
  { name: '辰', start: 112.5, end: 127.5, gua: '巽', sanyuan: '天', wuxing: 'earth', yinyang: '阳' },
  { name: '巽', start: 127.5, end: 142.5, gua: '巽', sanyuan: '地', wuxing: 'wood',  yinyang: '阴' },
  { name: '巳', start: 142.5, end: 157.5, gua: '巽', sanyuan: '人', wuxing: 'fire',  yinyang: '阴' },
  // 南方·离
  { name: '丙', start: 157.5, end: 172.5, gua: '离', sanyuan: '天', wuxing: 'fire',  yinyang: '阳' },
  { name: '午', start: 172.5, end: 187.5, gua: '离', sanyuan: '地', wuxing: 'fire',  yinyang: '阴' },
  { name: '丁', start: 187.5, end: 202.5, gua: '离', sanyuan: '人', wuxing: 'fire',  yinyang: '阴' },
  // 西南·坤
  { name: '未', start: 202.5, end: 217.5, gua: '坤', sanyuan: '天', wuxing: 'earth', yinyang: '阴' },
  { name: '坤', start: 217.5, end: 232.5, gua: '坤', sanyuan: '地', wuxing: 'earth', yinyang: '阴' },
  { name: '申', start: 232.5, end: 247.5, gua: '坤', sanyuan: '人', wuxing: 'metal', yinyang: '阳' },
  // 西方·兑
  { name: '庚', start: 247.5, end: 262.5, gua: '兑', sanyuan: '天', wuxing: 'metal', yinyang: '阳' },
  { name: '酉', start: 262.5, end: 277.5, gua: '兑', sanyuan: '地', wuxing: 'metal', yinyang: '阴' },
  { name: '辛', start: 277.5, end: 292.5, gua: '兑', sanyuan: '人', wuxing: 'metal', yinyang: '阴' },
  // 西北·乾
  { name: '戌', start: 292.5, end: 307.5, gua: '乾', sanyuan: '天', wuxing: 'earth', yinyang: '阳' },
  { name: '乾', start: 307.5, end: 322.5, gua: '乾', sanyuan: '地', wuxing: 'metal', yinyang: '阳' },
  { name: '亥', start: 322.5, end: 337.5, gua: '乾', sanyuan: '人', wuxing: 'water', yinyang: '阴' },
];

// ===== 九星属性（以九运 2024-2043 为基准）=====

export const STAR_INFO = {
  1: { name: '一白贪狼', short: '一白', wuxing: 'water', nature: '吉',   desc: '桃花人缘·升迁（九运生气星）' },
  2: { name: '二黑巨门', short: '二黑', wuxing: 'earth', nature: '凶',   desc: '病符·疾病' },
  3: { name: '三碧禄存', short: '三碧', wuxing: 'wood',  nature: '凶',   desc: '是非官讼' },
  4: { name: '四绿文曲', short: '四绿', wuxing: 'wood',  nature: '中',   desc: '文昌学业' },
  5: { name: '五黄廉贞', short: '五黄', wuxing: 'earth', nature: '大凶', desc: '灾祸煞·忌动土' },
  6: { name: '六白武曲', short: '六白', wuxing: 'metal', nature: '中',   desc: '武权偏财' },
  7: { name: '七赤破军', short: '七赤', wuxing: 'metal', nature: '凶',   desc: '口舌盗贼' },
  8: { name: '八白左辅', short: '八白', wuxing: 'earth', nature: '吉',   desc: '正财地产（八运余气）' },
  9: { name: '九紫右弼', short: '九紫', wuxing: 'fire',  nature: '吉',   desc: '喜庆名利（九运当旺星）' },
};

// ===== 飞星组合断事 =====

export const STAR_COMBO = [
  // 大凶
  { s1: 2, s2: 5, name: '二五交加', nature: '大凶', desc: '主疾病伤亡，损主伤丁' },
  { s1: 5, s2: 2, name: '五二交加', nature: '大凶', desc: '主重病破大财' },
  // 凶
  { s1: 2, s2: 3, name: '斗牛煞', nature: '凶', desc: '争吵是非·口舌官非' },
  { s1: 3, s2: 2, name: '斗牛煞', nature: '凶', desc: '口舌·肝病' },
  { s1: 3, s2: 7, name: '穿心煞', nature: '凶', desc: '盗贼·劫掠' },
  { s1: 7, s2: 3, name: '穿心煞', nature: '凶', desc: '贼劫·口舌' },
  { s1: 6, s2: 7, name: '交剑煞', nature: '凶', desc: '口舌刑伤·刀伤' },
  { s1: 7, s2: 6, name: '交剑煞', nature: '凶', desc: '刀兵·口舌' },
  { s1: 9, s2: 7, name: '回禄之灾', nature: '凶', desc: '火灾' },
  { s1: 7, s2: 9, name: '回禄之灾', nature: '凶', desc: '火灾·目疾' },
  { s1: 5, s2: 9, name: '紫黄毒药', nature: '凶', desc: '火灾·大凶（九运尤甚）' },
  { s1: 9, s2: 5, name: '紫黄毒药', nature: '凶', desc: '火灾·瘟疫' },
  // 吉
  { s1: 1, s2: 4, name: '一四同宫', nature: '吉', desc: '文昌科甲·利读书考试' },
  { s1: 4, s2: 1, name: '四一同宫', nature: '吉', desc: '利学业·桃花' },
  { s1: 1, s2: 6, name: '金水相生', nature: '吉', desc: '利文官·利财' },
  { s1: 6, s2: 1, name: '金水相生', nature: '吉', desc: '官贵·利远行' },
  { s1: 6, s2: 8, name: '六八同宫', nature: '吉', desc: '富贵双全·利地产' },
  { s1: 8, s2: 6, name: '八六同宫', nature: '吉', desc: '财旺·利置业' },
  { s1: 8, s2: 9, name: '八九紫白', nature: '吉', desc: '大吉·利婚嫁喜事' },
  { s1: 9, s2: 9, name: '九紫双旺', nature: '吉', desc: '九运最旺·喜庆名利' },
  { s1: 1, s2: 1, name: '双一白', nature: '吉', desc: '桃花旺·人缘佳' },
];

// ===== 九星化解/催旺建议 =====

export const STAR_REMEDY = {
  1: { type: 'ji', enhance: '金属摆件·白色·圆形物', note: '九运生气星' },
  2: { type: 'xiong', remedy: '铜葫芦·六帝古钱', avoid: '忌黄色·红色装饰', note: '病符星' },
  3: { type: 'xiong', remedy: '红色物品·火属物', avoid: '忌绿色·蓝色（助长木气）', note: '是非星' },
  4: { type: 'zhong', enhance: '水养富贵竹四支', note: '文昌位宜书房' },
  5: { type: 'xiong', remedy: '铜风铃·六帝古钱·金属重物', avoid: '忌动土·忌红色（火生土加重）', note: '大凶煞' },
  6: { type: 'zhong', enhance: '黄色·土属物（土生金）', note: '利管理层·军警' },
  7: { type: 'xiong', remedy: '清水·蓝黑色物品', avoid: '忌金属利器·忌红色', note: '退运星' },
  8: { type: 'ji', enhance: '红色·火属物（火生土）', note: '八运余气·仍有财力' },
  9: { type: 'ji', enhance: '木属物·绿色植物（木生火）', note: '九运最旺之星' },
};

// ===== 八宅法 =====

export const BAZHAI = {
  '坎': { group: '东四命', 生气: '震', 天医: '巽', 延年: '离', 伏位: '坎', 绝命: '坤', 五鬼: '艮', 六煞: '乾', 祸害: '兑' },
  '离': { group: '东四命', 生气: '巽', 天医: '震', 延年: '坎', 伏位: '离', 绝命: '乾', 五鬼: '兑', 六煞: '坤', 祸害: '艮' },
  '震': { group: '东四命', 生气: '坎', 天医: '离', 延年: '巽', 伏位: '震', 绝命: '兑', 五鬼: '乾', 六煞: '艮', 祸害: '坤' },
  '巽': { group: '东四命', 生气: '离', 天医: '坎', 延年: '震', 伏位: '巽', 绝命: '艮', 五鬼: '坤', 六煞: '兑', 祸害: '乾' },
  '乾': { group: '西四命', 生气: '兑', 天医: '艮', 延年: '坤', 伏位: '乾', 绝命: '离', 五鬼: '震', 六煞: '坎', 祸害: '巽' },
  '坤': { group: '西四命', 生气: '艮', 天医: '兑', 延年: '乾', 伏位: '坤', 绝命: '震', 五鬼: '巽', 六煞: '离', 祸害: '坎' },
  '兑': { group: '西四命', 生气: '乾', 天医: '坤', 延年: '艮', 伏位: '兑', 绝命: '震', 五鬼: '离', 六煞: '巽', 祸害: '坎' },
  '艮': { group: '西四命', 生气: '坤', 天医: '乾', 延年: '兑', 伏位: '艮', 绝命: '巽', 五鬼: '离', 六煞: '震', 祸害: '坎' },
};

// ===== 五行 =====

export const WUXING_CN = { water: '水', wood: '木', fire: '火', earth: '土', metal: '金' };
