# 择日补充 · 黄黑道日 + 实用择日流程

> 补完择日体系中最常用的黄黑道十二值日和特殊吉凶日。

---

## 一、黄黑道十二日

十二建除是一套体系，黄黑道是另一套独立体系。两者并用可提高择日精度。

### 十二值日（黄道六吉·黑道六凶）

| 值日 | 类型 | 吉凶 | 含义 | 宜忌 |
|------|------|------|------|------|
| **青龙** | 黄道 | 大吉 | 吉神当值·百事皆宜 | 宜：嫁娶·开业·动工·出行 |
| **明堂** | 黄道 | 大吉 | 光明正大·贵人辅佐 | 宜：开业·见贵·赴任 |
| **天刑** | 黑道 | 凶 | 刑罚·牢狱 | 忌：诉讼·签约。宜：祭祀 |
| **朱雀** | 黑道 | 凶 | 口舌·是非·文书不利 | 忌：开业·签约。宜：收债 |
| **金匮** | 黄道 | 吉 | 财帛·纳采·修造 | 宜：求财·嫁娶·修缮 |
| **天德** | 黄道 | 大吉 | 天德贵人·逢凶化吉 | 宜：一切吉事·尤利嫁娶 |
| **白虎** | 黑道 | 凶 | 血光·丧服·意外 | 忌：嫁娶·出行。宜：军事·安葬 |
| **玉堂** | 黄道 | 大吉 | 贵人·升迁·荣华 | 宜：开业·赴任·嫁娶·求学 |
| **天牢** | 黑道 | 凶 | 囚禁·阻碍·官非 | 忌：出行·开业。宜：收捕 |
| **玄武** | 黑道 | 凶 | 盗贼·暗昧·欺诈 | 忌：签约·投资·出行 |
| **司命** | 黄道 | 吉 | 主命·生育 | 宜：嫁娶·求嗣·入宅 |
| **勾陈** | 黑道 | 凶 | 纠缠·牢狱·迟滞 | 忌：嫁娶·诉讼·出行 |

### 黄黑道排法

以月建地支为起点排列：

```javascript
const HUANGHEIDAO_ORDER = [
  '青龙','明堂','天刑','朱雀','金匮','天德',
  '白虎','玉堂','天牢','玄武','司命','勾陈'
];

// 各月起始地支
const HUANGHEIDAO_START = {
  '寅': '子', '卯': '寅', '辰': '辰', '巳': '午',
  '午': '申', '未': '戌', '申': '子', '酉': '寅',
  '戌': '辰', '亥': '午', '子': '申', '丑': '戌'
};

function getHuangheidao(monthBranch, dayBranch) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const startBranch = HUANGHEIDAO_START[monthBranch];
  const startIdx = branches.indexOf(startBranch);
  const dayIdx = branches.indexOf(dayBranch);
  const offset = (dayIdx - startIdx + 12) % 12;
  return HUANGHEIDAO_ORDER[offset];
}

function isHuangdao(monthBranch, dayBranch) {
  const name = getHuangheidao(monthBranch, dayBranch);
  return ['青龙','明堂','金匮','天德','玉堂','司命'].includes(name);
}
```

---

## 二、特殊吉日

### 天赦日

一年中最大的赦免吉日，百无禁忌。

```javascript
const TIANSHE_RI = {
  // 春(寅卯月)：戊寅日  夏(巳午月)：甲午日
  // 秋(申酉月)：戊申日  冬(亥子月)：甲子日
  // 四季月(辰未戌丑)各有对应
  '春': '戊寅', '夏': '甲午', '秋': '戊申', '冬': '甲子'
};
// 一年约4-5个天赦日
```

### 天愿日

天干地支纳音和合之日。

### 天恩日

甲子·乙丑·丙寅·丁卯 四日组为天恩日。

### 母仓日

```javascript
const MUCANG = {
  '春': ['亥子'], // 春季亥子日为母仓
  '夏': ['寅卯'],
  '秋': ['辰戌丑未'],
  '冬': ['巳午']
};
```

---

## 三、特殊凶日

### 四离日

四季分界点前一天：春分前一天·夏至前一天·秋分前一天·冬至前一天。

### 四绝日

四立前一天：立春前一天·立夏前一天·立秋前一天·立冬前一天。

### 杨公忌日（民间十三忌）

```javascript
const YANGGONG_JI = [
  { month:1,  day:13 },
  { month:2,  day:11 },
  { month:3,  day:9  },
  { month:4,  day:7  },
  { month:5,  day:5  },
  { month:6,  day:3  },
  { month:7,  day:1  },
  { month:7,  day:29 },
  { month:8,  day:27 },
  { month:9,  day:25 },
  { month:10, day:23 },
  { month:11, day:21 },
  { month:12, day:19 }
]; // 农历日期
```

### 月破日·岁破日

```
月破日：日支与月支六冲
  例：寅月见申日、卯月见酉日...

岁破日：日支与年支六冲
  例：子年见午日、丑年见未日...
```

---

## 四、实用择日完整流程

```
第一步：确定事项类型
  嫁娶/开业/搬家/动工/安葬/出行

第二步：排除大凶日（一票否决）
  □ 四离四绝日
  □ 月破日
  □ 岁破日
  □ 杨公忌日（民间忌）

第三步：排除事项专属忌日
  □ 嫁娶忌：破日·白虎·天刑
  □ 开业忌：闭日·死门·玄武
  □ 搬家忌：破日·平日
  □ 动工忌：月建日（当月地支日）·太岁方

第四步：选择吉日（叠加筛选）
  □ 十二建除：选建/满/成/开日（按事项）
  □ 黄黑道：选黄道日（青龙·明堂·金匮·天德·玉堂·司命）
  □ 两套都吉 → 优先选择

第五步：与命主八字配合
  □ 所选日干为命主喜用神？
  □ 所选日不冲命主日柱？
  □ 不在命主空亡之日？

第六步：选择吉时
  □ 日课四柱（年月日时）整体和谐
  □ 吉时配合吉日效果最佳
```

### 综合评分算法

```javascript
function evaluateDate(date, monthBranch, yearBranch, personBazi) {
  let score = 60; // 基础分
  
  const dayBranch = getDayBranch(date);
  const dayStem = getDayStem(date);
  
  // 一票否决
  if (isSiLiSiJue(date)) return { score: 0, reason: '四离四绝' };
  if (isYuePo(monthBranch, dayBranch)) return { score: 0, reason: '月破' };
  if (isSuiPo(yearBranch, dayBranch)) return { score: 0, reason: '岁破' };
  
  // 十二建除
  const jianchu = getTwelveDay(monthBranch, dayBranch);
  if (['成','开','满'].includes(jianchu)) score += 15;
  if (['建','定'].includes(jianchu)) score += 10;
  if (['破','危'].includes(jianchu)) score -= 20;
  
  // 黄黑道
  if (isHuangdao(monthBranch, dayBranch)) score += 15;
  else score -= 10;
  
  // 与命主配合
  if (isXiyong(dayStem, personBazi)) score += 10; // 日干为喜用神
  if (isChong(dayBranch, personBazi.dayBranch)) score -= 25; // 冲日柱
  
  // 天赦日等特殊吉日加分
  if (isTianshe(date)) score += 20;
  
  return { score: Math.max(0, Math.min(100, score)), jianchu, huangheidao: getHuangheidao(monthBranch, dayBranch) };
}
```

---

**← 返回** [择日基础](../reference/zeri-basics.md)
