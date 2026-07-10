# 紫微斗数安星完整规则

> **校核状态（2026-07-10）**：命身宫、十二宫、五行局、十四主星、当前辅煞星表、四化与大限已按本文声明口径通过项目内 314,200 项检查，并与 `iztro@2.5.8` 对照 325,440 字段无差异。闰月沿用所重复的月份序数。星性、格局、宫位断语与现实预测不在此结论内。

> 纯技术参考。按排盘顺序逐步安星，供开发紫微排盘工具使用。

---

## 一、前置准备

### 输入数据

```javascript
const input = {
  lunarYear: { stem: '甲', branch: '辰' },  // 农历年干支
  lunarMonth: 3,        // 农历月（1-12，闰月需特殊处理）
  lunarDay: 15,         // 农历日
  hour: '未',           // 出生时辰地支
  gender: 'male',       // 性别
  isLeapMonth: false    // 是否闰月
};
```

### 十二宫地支固定序列

```javascript
const PALACE_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
```

---

## 二、第一步：定命宫与身宫

### 命宫

从寅宫起正月，顺数到出生月，再从该宫起子时**逆数**到出生时辰。

```javascript
function findMingGong(lunarMonth, hourBranch) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const hourIdx = branches.indexOf(hourBranch);
  
  // 从寅(idx=2)起正月，顺数到出生月
  const monthPos = (2 + lunarMonth - 1) % 12;
  // 从该宫起子时，逆数到出生时辰
  const mingGongIdx = (monthPos - hourIdx + 12) % 12;
  
  return branches[mingGongIdx];
}
```

### 身宫

从寅宫起正月，顺数到出生月，再从该宫起子时**顺数**到出生时辰。

```javascript
function findShenGong(lunarMonth, hourBranch) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const hourIdx = branches.indexOf(hourBranch);
  const monthPos = (2 + lunarMonth - 1) % 12;
  const shenGongIdx = (monthPos + hourIdx) % 12;
  return branches[shenGongIdx];
}
```

---

## 三、第二步：安十二宫

从命宫位置起命宫，**逆时针**依次排列十二宫。

```javascript
function arrangeTwelvePalaces(mingGongBranch) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const palaceNames = [
    '命宫','兄弟宫','夫妻宫','子女宫','财帛宫','疾厄宫',
    '迁移宫','交友宫','官禄宫','田宅宫','福德宫','父母宫'
  ];
  
  const startIdx = branches.indexOf(mingGongBranch);
  const palaces = {};
  
  for (let i = 0; i < 12; i++) {
    // 逆时针 = 地支序号递减
    const branchIdx = (startIdx - i + 12) % 12;
    palaces[palaceNames[i]] = branches[branchIdx];
  }
  
  return palaces;
}
```

---

## 四、第三步：定五行局

五行局由**命宫地支**和**年干**查纳音五行确定。但紫微中有专用的定局方法：

### 命宫纳音定局表

以命宫所在地支 + 该宫天干确定纳音五行 → 定五行局。

**命宫天干的确定**：用年干起寅宫天干（五虎遁），依次排到命宫。

```javascript
function getPalaceStem(yearStem, palaceBranch) {
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  
  const yearStemIdx = stems.indexOf(yearStem);
  const yinStemIdx = (yearStemIdx % 5) * 2 + 2; // 寅宫天干起点
  
  const palaceIdx = branches.indexOf(palaceBranch);
  const yinIdx = 2; // 寅的索引
  const offset = (palaceIdx - yinIdx + 12) % 12;
  
  return stems[(yinStemIdx + offset) % 10];
}
```

### 五行局对应

| 纳音五行 | 局数 |
|---------|------|
| 水 | 水二局 |
| 木 | 木三局 |
| 金 | 金四局 |
| 土 | 土五局 |
| 火 | 火六局 |

```javascript
const WUXING_JU = { 'water': 2, 'wood': 3, 'metal': 4, 'earth': 5, 'fire': 6 };
```

### 宫干支纳音查表

```javascript
// 简化方法：命宫干+支 查纳音表（见 reference/bazi-algorithm.md 中的 NAYIN 表）
function getWuxingJu(mingGongStem, mingGongBranch) {
  const ganZhi = mingGongStem + mingGongBranch;
  const nayin = NAYIN[ganZhi]; // 如 "海中金" → 金
  const nayinWuxing = extractWuxing(nayin); // "金" → 'metal'
  return WUXING_JU[nayinWuxing];
}
```

---

## 五、第四步：安紫微星

紫微星的位置由**农历生日**和**五行局**共同决定。

### 紫微起法口诀表

用生日数除以局数，根据商和余数确定紫微落宫。

```javascript
/**
 * 安紫微星
 * @param lunarDay 农历日 (1-30)
 * @param ju 五行局数 (2,3,4,5,6)
 * @returns 紫微所在地支
 */
function placeZiwei(lunarDay, ju) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) throw new RangeError('invalid lunar day');
  if (![2, 3, 4, 5, 6].includes(ju)) throw new RangeError('invalid five-element bureau');

  // 日数加到能被局数整除。商从寅起顺数；所加数为偶则顺加，为奇则逆减。
  let adjustment = 0;
  while ((lunarDay + adjustment) % ju !== 0) adjustment += 1;
  const quotient = (lunarDay + adjustment) / ju;
  const directionAdjustment = adjustment % 2 === 0 ? adjustment : -adjustment;
  const indexFromYin = quotient - 1 + directionAdjustment;
  return branches[(2 + indexFromYin % 12 + 12) % 12];
}
```

> 运行时的 5×30 表由上式机械生成；旧手抄表有 100/150 格与该规则不符，已移除。其他安星口径应另建版本，不覆盖本表。

---

## 六、第五步：安天府星

天府与紫微的关系是**镜像**——以寅申线为轴对称。

```javascript
function placeTianfu(ziweiPos) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const ziIdx = branches.indexOf(ziweiPos);
  
  // 天府位置 = 寅申轴对称
  // 对称规则：紫微在X宫 → 天府在 (4 - X + 12) % 12 ... 不对
  // 正确规则：紫微和天府关于寅-申轴对称
  // 即：如果紫微在寅(2)，天府也在寅(2)
  // 紫微在卯(3)，天府在丑(1)
  // 紫微在辰(4)，天府在子(0)
  // 规律：天府idx = (2 + 2 - ziIdx + 12) % 12 = (4 - ziIdx + 12) % 12
  
  const tianfuIdx = (4 - ziIdx + 12) % 12;
  return branches[tianfuIdx];
}

// 验证：
// 紫微在寅(2) → 天府在(4-2)%12 = 2 → 寅 ✓（同宫）
// 紫微在卯(3) → 天府在(4-3+12)%12 = 1 → 丑 ✓
// 紫微在午(6) → 天府在(4-6+12)%12 = 10 → 戌 ✓
```

---

## 七、第六步：安紫微系诸星

紫微确定后，其余紫微系星的位置顺序固定。

### 从紫微出发逆时针安星

```javascript
const ZIWEI_SERIES = {
  // 紫微系：从紫微逆数（注意方向）
  // 顺序：紫微→天机(-1)→空(-2)→太阳(-3)→武曲(-4)→天同(-5)→空(-6,-7)→廉贞(-8)
  stars: [
    { name: '紫微', offset: 0 },
    { name: '天机', offset: -1 },
    // 空一宫
    { name: '太阳', offset: -3 },
    { name: '武曲', offset: -4 },
    { name: '天同', offset: -5 },
    // 空二宫
    { name: '廉贞', offset: -8 }
  ]
};

function placeZiweiSeries(ziweiPos) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const base = branches.indexOf(ziweiPos);
  
  const positions = {};
  ZIWEI_SERIES.stars.forEach(star => {
    const idx = (base + star.offset + 12) % 12;
    positions[star.name] = branches[idx];
  });
  
  return positions;
}
```

### 从天府出发顺时针安星

```javascript
const TIANFU_SERIES = {
  // 天府系：从天府顺数
  // 顺序：天府→太阴(+1)→贪狼(+2)→巨门(+3)→天相(+4)→天梁(+5)→七杀(+6)→空(+7)→空(+8)→空(+9)→破军(+10)
  stars: [
    { name: '天府', offset: 0 },
    { name: '太阴', offset: 1 },
    { name: '贪狼', offset: 2 },
    { name: '巨门', offset: 3 },
    { name: '天相', offset: 4 },
    { name: '天梁', offset: 5 },
    { name: '七杀', offset: 6 },
    // 空三宫
    { name: '破军', offset: 10 }
  ]
};

function placeTianfuSeries(tianfuPos) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const base = branches.indexOf(tianfuPos);
  
  const positions = {};
  TIANFU_SERIES.stars.forEach(star => {
    const idx = (base + star.offset) % 12;
    positions[star.name] = branches[idx];
  });
  
  return positions;
}
```

---

## 八、第七步：安六吉星

### 文昌·文曲

由**出生时辰**地支确定。

```javascript
const WENCHANG_TABLE = {
  '子':'戌', '丑':'酉', '寅':'申', '卯':'未',
  '辰':'午', '巳':'巳', '午':'辰', '未':'卯',
  '申':'寅', '酉':'丑', '戌':'子', '亥':'亥'
};

const WENQU_TABLE = {
  '子':'辰', '丑':'巳', '寅':'午', '卯':'未',
  '辰':'申', '巳':'酉', '午':'戌', '未':'亥',
  '申':'子', '酉':'丑', '戌':'寅', '亥':'卯'
};
```

### 左辅·右弼

由**农历生月**确定。

```javascript
const ZUOFU_TABLE = {
  1:'辰', 2:'巳', 3:'午', 4:'未', 5:'申', 6:'酉',
  7:'戌', 8:'亥', 9:'子', 10:'丑', 11:'寅', 12:'卯'
};

const YOUBI_TABLE = {
  1:'戌', 2:'酉', 3:'申', 4:'未', 5:'午', 6:'巳',
  7:'辰', 8:'卯', 9:'寅', 10:'丑', 11:'子', 12:'亥'
};
```

### 天魁·天钺

由**年干**确定。

```javascript
const TIANKUI_TABLE = {
  '甲':'丑', '乙':'子', '丙':'亥', '丁':'亥',
  '戊':'丑', '己':'子', '庚':'丑', '辛':'午',
  '壬':'卯', '癸':'卯'
};

const TIANYUE_TABLE = {
  '甲':'未', '乙':'申', '丙':'酉', '丁':'酉',
  '戊':'未', '己':'申', '庚':'未', '辛':'寅',
  '壬':'巳', '癸':'巳'
};
```

---

## 九、第八步：安六煞星

### 擎羊·陀罗

由**年干**确定。

```javascript
const QINGYANG_TABLE = {
  '甲':'卯', '乙':'辰', '丙':'午', '丁':'未',
  '戊':'午', '己':'未', '庚':'酉', '辛':'戌',
  '壬':'子', '癸':'丑'
};

const TUOLUO_TABLE = {
  '甲':'丑', '乙':'寅', '丙':'辰', '丁':'巳',
  '戊':'辰', '己':'巳', '庚':'未', '辛':'申',
  '壬':'戌', '癸':'亥'
};
```

### 火星·铃星

由**年支**和**出生时辰**确定。

```javascript
// 火星起宫（按年支分组，从起宫顺数到时辰）
const HUOXING_START = {
  '寅午戌': '丑',  // 寅年/午年/戌年出生，火星起于丑宫
  '申子辰': '寅',
  '巳酉丑': '卯',
  '亥卯未': '酉'
};

// 铃星起宫
const LINGXING_START = {
  '寅午戌': '卯',
  '申子辰': '戌',
  '巳酉丑': '戌',
  '亥卯未': '戌'
};

function placeHuoLing(yearBranch, hourBranch, type) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const table = type === '火星' ? HUOXING_START : LINGXING_START;
  
  // 找年支属于哪个组
  let startPos;
  for (const [group, pos] of Object.entries(table)) {
    if (group.includes(yearBranch)) {
      startPos = pos;
      break;
    }
  }
  
  const startIdx = branches.indexOf(startPos);
  const hourIdx = branches.indexOf(hourBranch);
  // 从起宫顺数到时辰
  const resultIdx = (startIdx + hourIdx) % 12;
  
  return branches[resultIdx];
}
```

### 地空·地劫

由**出生时辰**确定。

```javascript
const DIKONG_TABLE = {
  '子':'亥', '丑':'戌', '寅':'酉', '卯':'申',
  '辰':'未', '巳':'午', '午':'巳', '未':'辰',
  '申':'卯', '酉':'寅', '戌':'丑', '亥':'子'
};

const DIJIE_TABLE = {
  '子':'亥', '丑':'子', '寅':'丑', '卯':'寅',
  '辰':'卯', '巳':'辰', '午':'巳', '未':'午',
  '申':'未', '酉':'申', '戌':'酉', '亥':'戌'
};
```

---

## 十、第九步：安四化

由**年干**飞四化（见 05-ziwei/01-overview.md 中的四化表）。

```javascript
const SIHUA = {
  '甲': { 禄:'廉贞', 权:'破军', 科:'武曲', 忌:'太阳' },
  '乙': { 禄:'天机', 权:'天梁', 科:'紫微', 忌:'太阴' },
  '丙': { 禄:'天同', 权:'天机', 科:'文昌', 忌:'廉贞' },
  '丁': { 禄:'太阴', 权:'天同', 科:'天机', 忌:'巨门' },
  '戊': { 禄:'贪狼', 权:'太阴', 科:'右弼', 忌:'天机' },
  '己': { 禄:'武曲', 权:'贪狼', 科:'天梁', 忌:'文曲' },
  '庚': { 禄:'太阳', 权:'武曲', 科:'太阴', 忌:'天同' },
  '辛': { 禄:'巨门', 权:'太阳', 科:'文曲', 忌:'文昌' },
  '壬': { 禄:'天梁', 权:'紫微', 科:'左辅', 忌:'武曲' },
  '癸': { 禄:'破军', 权:'巨门', 科:'太阴', 忌:'贪狼' }
};
```

---

## 十一、第十步：安大运

### 大运起法

- **阳男阴女**：大运从命宫**顺时针**走
- **阴男阳女**：大运从命宫**逆时针**走

（阳年 = 年干为甲丙戊庚壬）

### 起运年龄

以五行局数决定：

| 五行局 | 第一大运起始年龄 |
|--------|----------------|
| 水二局 | 2岁 |
| 木三局 | 3岁 |
| 金四局 | 4岁 |
| 土五局 | 5岁 |
| 火六局 | 6岁 |

每步大运**10年**。

```javascript
function getDayun(mingGongBranch, ju, yearStem, gender) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  
  const isYangYear = stems.indexOf(yearStem) % 2 === 0;
  const isMale = gender === 'male';
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale);
  
  const startAge = ju;
  const step = forward ? 1 : -1;
  const baseIdx = branches.indexOf(mingGongBranch);
  
  const dayun = [];
  for (let i = 0; i < 12; i++) {
    // 第一大限就在命宫；宫干必须按五虎遁从实际宫支重算。
    const branchIdx = (baseIdx + i * step + 120) % 12;
    const branch = branches[branchIdx];
    dayun.push({
      stem: getPalaceStem(yearStem, branch),
      branch,
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1
    });
  }
  return dayun;
}
```

---

## 十二、其他杂星安法速查

### 天马

由**年支**确定。

```javascript
const TIANMA = {
  '寅':'申', '申':'寅', '巳':'亥', '亥':'巳',
  '子':'寅', '午':'申', '卯':'巳', '酉':'亥',
  '辰':'寅', '戌':'申', '丑':'亥', '未':'巳'
};
```

### 禄存

由**年干**确定。

```javascript
const LUCUN = {
  '甲':'寅', '乙':'卯', '丙':'巳', '丁':'午',
  '戊':'巳', '己':'午', '庚':'申', '辛':'酉',
  '壬':'亥', '癸':'子'
};
```

### 天伤·天使

由**命宫**确定。

```javascript
// 天伤在官禄宫对宫，天使在疾厄宫对宫（简化处理）
```

### 红鸾·天喜

由**年支**确定。

```javascript
const HONGLUAN = {
  '子':'卯', '丑':'寅', '寅':'丑', '卯':'子',
  '辰':'亥', '巳':'戌', '午':'酉', '未':'申',
  '申':'未', '酉':'午', '戌':'巳', '亥':'辰'
};

// 天喜 = 红鸾对宫（+6）
function getTianxi(yearBranch) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const hlPos = HONGLUAN[yearBranch];
  const hlIdx = branches.indexOf(hlPos);
  return branches[(hlIdx + 6) % 12];
}
```

---

## 排盘总流程

```javascript
function fullZiweiPaipan(input) {
  // 1. 安命宫身宫
  const mingGong = findMingGong(input.lunarMonth, input.hour);
  const shenGong = findShenGong(input.lunarMonth, input.hour);
  
  // 2. 排十二宫
  const palaces = arrangeTwelvePalaces(mingGong);
  
  // 3. 定五行局
  const mingStem = getPalaceStem(input.lunarYear.stem, mingGong);
  const ju = getWuxingJu(mingStem, mingGong);
  
  // 4. 安紫微
  const ziweiPos = placeZiwei(input.lunarDay, ju);
  
  // 5. 安天府
  const tianfuPos = placeTianfu(ziweiPos);
  
  // 6. 安紫微系
  const ziweiStars = placeZiweiSeries(ziweiPos);
  
  // 7. 安天府系
  const tianfuStars = placeTianfuSeries(tianfuPos);
  
  // 8. 安六吉六煞
  // ... (用上面的查表函数)
  
  // 9. 飞四化
  const sihua = SIHUA[input.lunarYear.stem];
  
  // 10. 安大运
  const dayun = getDayun(mingGong, ju, input.lunarYear.stem, input.gender);
  
  return { palaces, ziweiStars, tianfuStars, sihua, dayun, ju };
}
```
