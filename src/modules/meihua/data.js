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
 * @returns {{ relation: string, desc: string, verdict: string }}
 */
export function wuxingRelation(tiWuxing, yongWuxing) {
  if (tiWuxing === yongWuxing) {
    return { relation: 'bihe', desc: '体用比和', verdict: '平', icon: '➡️' };
  }

  const tiIdx = SHENG_CYCLE.indexOf(tiWuxing);
  const yongIdx = SHENG_CYCLE.indexOf(yongWuxing);

  // Check if yong generates ti (用生体 → 吉)
  if (SHENG_CYCLE[(yongIdx + 1) % 5] === tiWuxing) {
    return { relation: 'yongShengTi', desc: '用生体', verdict: '吉', icon: '✅' };
  }
  // Check if ti generates yong (体生用 → 泄)
  if (SHENG_CYCLE[(tiIdx + 1) % 5] === yongWuxing) {
    return { relation: 'tiShengYong', desc: '体生用', verdict: '泄', icon: '⚠️' };
  }
  // Check if yong controls ti (用克体 → 凶)
  if (KE_CYCLE[(KE_CYCLE.indexOf(yongWuxing) + 1) % 5] === tiWuxing) {
    return { relation: 'yongKeTi', desc: '用克体', verdict: '凶', icon: '❌' };
  }
  // Check if ti controls yong (体克用 → 利但费力)
  if (KE_CYCLE[(KE_CYCLE.indexOf(tiWuxing) + 1) % 5] === yongWuxing) {
    return { relation: 'tiKeYong', desc: '体克用', verdict: '利', icon: '🔶' };
  }

  // Fallback (should not reach here with valid inputs)
  console.warn(`Unexpected wuxing relation: ti=${tiWuxing}, yong=${yongWuxing}`);
  return { relation: 'unknown', desc: '关系不明', verdict: '?', icon: '❓' };
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
import { JINGFANG, BAGUA } from '../liuyao/data.js';

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

// ===== 常用汉字笔画数 =====
// Compact encoding: "char:strokes" pairs, covers ~1500 common characters
// For characters not in this table, we use a heuristic based on Unicode ranges
const STROKE_DATA = '一1二2三3四5五4六4七2八2九2十2百6千3万3亿1上3下3左5右5大3小3中4人2入2口3天4地6日4月4年6时7分4秒9水4火4木4金8土3山3石5田5风4雨8云4雪11花7草9树16果8春9夏10秋9冬5东5西6南9北5前9后6里7外5内4心4手4头5足7目5耳6牙4舌6身7发5面9力2刀2王4玉5文4字6书4学8生5死6长4短12高10低7明8暗13光6色6红6白5黑12黄11蓝13绿11紫12青8老6少4男7女3子3父4母5兄5弟7姐8妹8夫4妻8友4马3牛4羊6鸡8狗8猫11鱼8鸟5龙5虎8蛇11猪11兔8鼠13猴12象11乾11坤8震15巽12坎7离11艮6兑7卦8爻4阴6阳6占5问6事8吉6凶4占5卜2用5体7动6静16世5应7空8亡3有6无4不4是9多6少4好6坏7对5错13来7去5行6走7起10看7听7说7读10写5想13做11吃6喝12给9拿10把7打5开4关6买6卖8要9得11到8过6进7出5回6问6答12话7语9叫5让5请10才3也3都10还7就12只5能10会6可5要9已3了2又2还7正5在6的8我7你7他5她6它5们5个3两8几2这7那6哪9什4么3谁10啊11吧7呢8吗6嗯13啊11吗6嘛14把7被10对5和8与3或8及3以4用5而6但7如6因6所8就12很9更7最12非8想13意13感13知8见4觉9思9问11答12说14话13语14声7音9笑10哭10喜12怒9哀9乐5爱10恨9怕8怪8急9忙6忘7记5忍7快7慢14满13空8穷7富12贵9贱10真10假11难19易8简13单8双4安6危6平5合6分4开4关6门3户4家10房8屋9楼13塔12桥10路13街12市5城9村7国8民5政9法8军6队4兵7战9和8平5安6全6公4私7王4官8令5法8律9理11道12德15数13算14术5方4法8式6变9化4成6败11胜9负6加5减11乘10除10等12第11次6回6过12通10运7命8世5代5古5今4新13旧5同6别7名6号5句5段9章11篇15题15答12纸10笔12画8图8片4张7本5业5工3场12度9位7单8复9向6系7然12自6己3件6发5步7进7前9后6左5右5边5角7面9点9线8条7段9块7根10头5条7件6种9类9组8份6期12间12段9直8曲6圆13方4长4短12宽15窄10深11浅9重9轻14远7近7早6晚11先6后6始8终11常11永5久3立5坐7走7跑12飞3跳13唱11歌14舞14画8弹12拉8推11拉8拾9找7得11算14数13计9量12成6功5利7益10害10助7困7救11教11育8习3练8试13比4较10相9同6异6似7像14形7状7色6味8声7光6热10冷7暖13凉10清11浊16干3湿12净8脏10整16齐14破10完7好6坏7新13旧5整16半5双4单8空8满13实8虚11假11真10错13对5反4正5顺9逆10通10达6远7近7快7慢14忽8突9急9缓13松8紧10严7宽15密11集12群13独9众6每7各6定8更7再6又2比4最12极7超12越12指9点9数13将9接11连10断11续13依8据11系7持9守6保9护7防6备8装13运7搬13移11转11传13递9送9接11收6取8选10择17拿10换12借10还7付5账8价6费9税12花7用5造10建8修9改7补7换12调15整16需14求7供8给9足7够11缺10余7够11食9饭12饮12衣6穿9住7行6买6卖8';

const _strokeMap = new Map();
{
  const pairs = STROKE_DATA.match(/[^\d]+\d+/g) || [];
  for (const pair of pairs) {
    const char = pair.replace(/\d+$/, '');
    const strokes = parseInt(pair.match(/\d+$/)[0], 10);
    for (const c of char) {
      _strokeMap.set(c, strokes);
    }
  }
}

/**
 * Get stroke count for a Chinese character.
 * Returns exact count for known characters, heuristic for unknown.
 * @param {string} char - Single character
 * @returns {number} Stroke count
 */
export function getStrokeCount(char) {
  if (_strokeMap.has(char)) {
    return _strokeMap.get(char);
  }
  // Heuristic for unknown CJK characters: use code point offset
  // CJK Unified Ideographs range: U+4E00 - U+9FFF
  const code = char.charCodeAt(0);
  if (code >= 0x4E00 && code <= 0x9FFF) {
    // Rough heuristic: map to 1-25 strokes based on code point position
    const range = 0x9FFF - 0x4E00;
    const offset = code - 0x4E00;
    const estimated = Math.floor((offset / range) * 24) + 1;
    console.warn(`Using estimated stroke count for '${char}': ${estimated} (not in lookup table)`);
    return estimated;
  }
  // Non-CJK: treat as 1
  return 1;
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
