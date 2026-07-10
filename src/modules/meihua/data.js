import { getUnihanStrokeCount } from './strokes-unihan-17.js';

// ===== 先天八卦数 (Xiantian / Earlier Heaven Trigram Numbers) =====
export const XIANTIAN = {
  1: { name: '乾', wuxing: 'metal', symbol: '☰', nature: '天', binary: '111' },
  2: { name: '兑', wuxing: 'metal', symbol: '☱', nature: '泽', binary: '110' },
  3: { name: '离', wuxing: 'fire',  symbol: '☲', nature: '火', binary: '101' },
  4: { name: '震', wuxing: 'wood',  symbol: '☳', nature: '雷', binary: '100' },
  5: { name: '巽', wuxing: 'wood',  symbol: '☴', nature: '风', binary: '011' },
  6: { name: '坎', wuxing: 'water', symbol: '☵', nature: '水', binary: '010' },
  7: { name: '艮', wuxing: 'earth', symbol: '☶', nature: '山', binary: '001' },
  8: { name: '坤', wuxing: 'earth', symbol: '☷', nature: '地', binary: '000' },
};

// Name → xiantian number reverse lookup
export const GUA_TO_XIANTIAN = {};
for (const [num, info] of Object.entries(XIANTIAN)) {
  GUA_TO_XIANTIAN[info.name] = Number(num);
}

// ===== 五行数据 =====
export const WUXING_CN = {
  metal: '金', wood: '木', water: '水', fire: '火', earth: '土',
};

// Five-element generation cycle: wood→fire→earth→metal→water→wood
const SHENG_CYCLE = ['wood', 'fire', 'earth', 'metal', 'water'];

// Five-element control cycle: wood→earth→water→fire→metal→wood
const KE_CYCLE = ['wood', 'earth', 'water', 'fire', 'metal'];

/**
 * Determine the five-element relationship between two elements.
 * Perspective: how does `b` relate to `a` (what does b do to a).
 * @returns {{ relation: string, desc: string }}
 */
export function wuxingRelation(tiWuxing, yongWuxing) {
  if (tiWuxing === yongWuxing) {
    return { relation: 'bihe', desc: '体用比和' };
  }

  const tiIdx = SHENG_CYCLE.indexOf(tiWuxing);
  const yongIdx = SHENG_CYCLE.indexOf(yongWuxing);

  // Check whether yong generates ti.
  if (SHENG_CYCLE[(yongIdx + 1) % 5] === tiWuxing) {
    return { relation: 'yongShengTi', desc: '用生体' };
  }
  // Check whether ti generates yong.
  if (SHENG_CYCLE[(tiIdx + 1) % 5] === yongWuxing) {
    return { relation: 'tiShengYong', desc: '体生用' };
  }
  // Check whether yong controls ti.
  if (KE_CYCLE[(KE_CYCLE.indexOf(yongWuxing) + 1) % 5] === tiWuxing) {
    return { relation: 'yongKeTi', desc: '用克体' };
  }
  // Check whether ti controls yong.
  if (KE_CYCLE[(KE_CYCLE.indexOf(tiWuxing) + 1) % 5] === yongWuxing) {
    return { relation: 'tiKeYong', desc: '体克用' };
  }

  // Fallback (should not reach here with valid inputs)
  console.warn(`Unexpected wuxing relation: ti=${tiWuxing}, yong=${yongWuxing}`);
  return { relation: 'unknown', desc: '关系不明' };
}

// ===== 万物类象 (Trigram Correspondences) =====
export const WANWU_LEIXIANG = {
  '乾': {
    人物: '领导·父亲·老人·有权者',
    身体: '头·骨骼·大肠',
    场所: '首都·高楼·政府机关',
    物品: '金银珠宝·圆形物·钟表·帽子',
    动物: '马·龙·狮子·天鹅',
    行为: '统领·决策·前进·掌控',
    特征: '刚健·圆满·尊贵·寒冷',
  },
  '坤': {
    人物: '母亲·妻子·大众·农民',
    身体: '腹·脾胃·肌肉',
    场所: '田野·平原·农村·仓库',
    物品: '布帛·方形物·陶器·粮食',
    动物: '牛·母马·蚂蚁',
    行为: '承载·包容·服从·收藏',
    特征: '柔顺·厚重·宽广·黄色',
  },
  '震': {
    人物: '长男·青年·运动员·司机',
    身体: '足·肝·声带·神经',
    场所: '闹市·车站·运动场·森林',
    物品: '乐器·鞭炮·电器·汽车',
    动物: '龙·蛇·善鸣之鸟',
    行为: '行动·惊动·奔跑·呐喊',
    特征: '动·快·急躁·绿色·春天',
  },
  '巽': {
    人物: '长女·僧尼·商人·教师',
    身体: '大腿·胆·呼吸系统',
    场所: '邮局·寺庙·通风处·机场',
    物品: '绳子·羽毛·扇子·长条物',
    动物: '鸡·蛇·蚯蚓·蜻蜓',
    行为: '进入·渗透·犹豫·传播',
    特征: '入·柔·风·犹豫不决·白色',
  },
  '坎': {
    人物: '中男·渔夫·盗贼·间谍',
    身体: '耳·肾·血液·泌尿系统',
    场所: '河流·湖泊·酒吧·暗处',
    物品: '水具·酒·墨水·轮子',
    动物: '猪·鱼·狐狸·老鼠',
    行为: '陷入·流动·隐藏·冒险',
    特征: '险·暗·弯曲·黑色·冬天',
  },
  '离': {
    人物: '中女·军人·文人·美女',
    身体: '眼·心脏·血管·小肠',
    场所: '窗户·法院·图书馆·南方',
    物品: '文书·照片·灯·眼镜',
    动物: '孔雀·锦鸡·螃蟹·龟',
    行为: '发现·照亮·装饰·分离',
    特征: '明·丽·空虚·红色·夏天',
  },
  '艮': {
    人物: '少男·童子·僧人·守门人',
    身体: '手·指·背·鼻·关节',
    场所: '山·门口·台阶·银行·墓地',
    物品: '石头·门·钥匙·桌子',
    动物: '狗·虎·穴居之鼠',
    行为: '停止·阻拦·等待·固守',
    特征: '止·静·高·坚·黄棕色',
  },
  '兑': {
    人物: '少女·歌手·演说家·情人',
    身体: '口·舌·牙·肺·咽喉',
    场所: '湖泊·餐厅·娱乐场·西方',
    物品: '餐具·刀·镜子·乐器',
    动物: '羊·猿',
    行为: '说·唱·笑·交流·享乐',
    特征: '悦·缺·破·白色·秋天',
  },
};

// ===== 64卦名查找 =====
// Build from upper+lower trigram binary → hexagram name
// We import JINGFANG from liuyao/data.js for the 64 hexagram lookup
import { JINGFANG } from '../liuyao/data.js';

// Build lookup: "upperName_lowerName" → hexagram name
const _hexagramNameMap = {};
for (const palace of Object.values(JINGFANG)) {
  for (const gua of palace.gua) {
    _hexagramNameMap[`${gua.upper}_${gua.lower}`] = gua.name;
  }
}

/**
 * Look up 64-hexagram name from upper and lower trigram names.
 * @param {string} upperName - e.g. '乾'
 * @param {string} lowerName - e.g. '巽'
 * @returns {string} e.g. '天风姤'
 */
export function getHexagramName(upperName, lowerName) {
  const name = _hexagramNameMap[`${upperName}_${lowerName}`];
  if (!name) {
    console.warn(`Hexagram not found for upper=${upperName}, lower=${lowerName}`);
    return `${upperName}${lowerName}卦`;
  }
  return name;
}

// ===== Unicode Unihan 笔画数 =====
/**
 * Get stroke count for a Chinese character.
 * Returns the Unicode 17.0 Unihan kTotalStrokes value for U+4E00-U+9FFF.
 * @param {string} char - Single character
 * @returns {number} Stroke count
 */
export function getStrokeCount(char) {
  const count = getUnihanStrokeCount(char);
  if (count !== null) {
    return count;
  }
  throw new Error(`笔画数据库未收录字符“${char}”（当前范围 U+4E00-U+9FFF）`);
}

/**
 * Get total stroke count for a string of characters.
 * @param {string} text
 * @returns {number}
 */
export function getTotalStrokes(text) {
  let total = 0;
  for (const char of text) {
    total += getStrokeCount(char);
  }
  return total;
}
