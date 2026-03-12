/**
 * Shared TCM (Traditional Chinese Medicine) reference data
 * Used across multiple 问诊 modules
 */

// 五脏 — Five Organs with correspondences
export const WUZANG = [
  { name: '肝', wuxing: 'wood', functions: ['主疏泄', '藏血', '主筋'], opens: '目', tissue: '筋', emotion: '怒', liquid: '泪', luster: '爪', fu: '胆' },
  { name: '心', wuxing: 'fire', functions: ['主血脉', '藏神', '主神志'], opens: '舌', tissue: '脉', emotion: '喜', liquid: '汗', luster: '面', fu: '小肠' },
  { name: '脾', wuxing: 'earth', functions: ['主运化', '统血', '主肌肉'], opens: '口', tissue: '肉', emotion: '思', liquid: '涎', luster: '唇', fu: '胃' },
  { name: '肺', wuxing: 'metal', functions: ['主气', '主宣降', '主皮毛'], opens: '鼻', tissue: '皮', emotion: '悲', liquid: '涕', luster: '毛', fu: '大肠' },
  { name: '肾', wuxing: 'water', functions: ['藏精', '主水', '主骨', '纳气'], opens: '耳', tissue: '骨', emotion: '恐', liquid: '唾', luster: '发', fu: '膀胱' },
];

// 五行→脏腑→症状映射
export const WUXING_ORGAN_MAP = {
  wood:  { organs: ['肝', '胆'], symptoms: '易怒·眼疾·筋骨·指甲脆', color: '青/绿', season: '春' },
  fire:  { organs: ['心', '小肠'], symptoms: '心悸·失眠·口舌生疮·多汗', color: '赤/红', season: '夏' },
  earth: { organs: ['脾', '胃'], symptoms: '消化差·肌肉松·水肿·思虑过度', color: '黄', season: '长夏' },
  metal: { organs: ['肺', '大肠'], symptoms: '咳嗽·皮肤干·便秘·悲伤', color: '白', season: '秋' },
  water: { organs: ['肾', '膀胱'], symptoms: '腰酸·耳鸣·水肿·夜尿·恐惧', color: '黑', season: '冬' },
};

// 食物四气
export const FOOD_QI = {
  '寒': { action: '清热泻火·凉血解毒', suited: '热证·阴虚', examples: ['苦瓜', '西瓜', '绿豆', '螃蟹', '梨'] },
  '凉': { action: '清热较缓·生津', suited: '偏热体质', examples: ['小麦', '绿茶', '豆腐', '鸭肉', '芹菜'] },
  '温': { action: '温中散寒·助阳', suited: '寒证·阳虚', examples: ['生姜', '羊肉', '桂圆', '韭菜', '核桃'] },
  '热': { action: '大补元阳·驱寒', suited: '极寒证', examples: ['辣椒', '花椒', '肉桂', '白酒', '胡椒'] },
  '平': { action: '性质平和·补益', suited: '任何体质', examples: ['大米', '猪肉', '山药', '红枣', '枸杞'] },
};

// 五味→入脏
export const FOOD_WUWEI = {
  '酸': { wuxing: 'wood', organ: '肝', foods: ['柠檬', '醋', '乌梅', '山楂', '石榴'], harm: '过酸伤脾' },
  '苦': { wuxing: 'fire', organ: '心', foods: ['苦瓜', '莲子心', '茶叶', '杏仁', '芥菜'], harm: '过苦伤肺' },
  '甘': { wuxing: 'earth', organ: '脾', foods: ['大枣', '蜂蜜', '山药', '南瓜', '糯米'], harm: '过甘伤肾' },
  '辛': { wuxing: 'metal', organ: '肺', foods: ['生姜', '大蒜', '葱', '薄荷', '花椒'], harm: '过辛伤肝' },
  '咸': { wuxing: 'water', organ: '肾', foods: ['海带', '紫菜', '虾', '蛤蜊', '食盐'], harm: '过咸伤心' },
};

// 五行食疗对应
export const WUXING_FOOD_THERAPY = {
  wood: { organ: ['肝', '胆'], weak: '酸味+绿色: 菠菜·西兰花·猕猴桃·枸杞·菊花', excess: '辛味制约: 萝卜·薄荷', tea: '枸杞菊花茶', avoid: '过多辛辣·熬夜·饮酒' },
  fire: { organ: ['心', '小肠'], weak: '苦味+红色: 红枣·西红柿·莲子·桂圆', excess: '咸味制约: 海带·紫菜', tea: '莲子心茶(泻火)/桂圆红枣茶(补火)', avoid: '过咸·冰冷食物' },
  earth: { organ: ['脾', '胃'], weak: '甘味+黄色: 南瓜·小米·山药·红薯·大枣', excess: '酸味制约: 山楂·乌梅', tea: '山药薏米茶', avoid: '生冷·过酸·暴饮暴食' },
  metal: { organ: ['肺', '大肠'], weak: '辛味+白色: 百合·银耳·梨·白萝卜·杏仁', excess: '苦味制约: 苦瓜·莲心', tea: '百合银耳羹', avoid: '过苦·干燥环境' },
  water: { organ: ['肾', '膀胱'], weak: '咸味+黑色: 黑芝麻·黑豆·核桃·栗子·海参', excess: '甘味制约: 南瓜·大枣', tea: '黑芝麻核桃糊', avoid: '过甘·纵欲·久站' },
};

// 二十四节气养生（12对）
export const JIEQI_YANGSHENG = [
  { jieqi: '立春-雨水', focus: '养肝·升发', foods: ['韭菜', '豆芽', '香椿'], note: '忌酸过多' },
  { jieqi: '惊蛰-春分', focus: '疏肝·防风', foods: ['菠菜', '荠菜', '枸杞'], note: '薄荷菊花提神' },
  { jieqi: '清明-谷雨', focus: '祛湿·健脾', foods: ['山药', '薏米', '白扁豆'], note: '雨水多注意祛湿' },
  { jieqi: '立夏-小满', focus: '养心·清热', foods: ['莲子', '苦瓜', '绿豆'], note: '忌贪凉伤脾' },
  { jieqi: '芒种-夏至', focus: '清暑·生津', foods: ['西瓜', '冬瓜', '酸梅汤'], note: '出汗多补盐分' },
  { jieqi: '小暑-大暑', focus: '防暑·养阴', foods: ['绿豆汤', '百合', '银耳'], note: '最热时段忌暴晒' },
  { jieqi: '立秋-处暑', focus: '润肺·收敛', foods: ['梨', '蜂蜜', '百合', '银耳'], note: '秋燥伤肺多润燥' },
  { jieqi: '白露-秋分', focus: '滋阴·润肺', foods: ['山药', '莲藕', '芝麻'], note: '减辛增酸' },
  { jieqi: '寒露-霜降', focus: '补肺·暖胃', foods: ['栗子', '核桃', '羊肉'], note: '添衣保暖' },
  { jieqi: '立冬-小雪', focus: '补肾·藏精', foods: ['黑芝麻', '黑豆', '羊肉'], note: '冬季进补开始' },
  { jieqi: '大雪-冬至', focus: '温阳·进补', foods: ['当归羊肉汤', '鹿茸'], note: '冬至最佳进补日' },
  { jieqi: '小寒-大寒', focus: '固肾·防寒', foods: ['牛肉', '核桃'], note: '最冷注意心血管' },
];

// 五行中文名
export const WUXING_CN = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

// 五行配色 CSS class
export const WUXING_COLOR = {
  wood: 'text-green-600', fire: 'text-red-500', earth: 'text-yellow-600',
  metal: 'text-gray-500', water: 'text-blue-600',
};
