# 紫微斗数安星完整规则

> ⚠️ **CC注意**：紫微安星规则极其复杂（627行）。建议最后再做此模块。实现时逐步验证：先验命宫位置→再验五行局→再验紫微星位置→最后验辅星。参考 reference/test-cases.md。

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
  // 紫微安星专用查表
  // 规则：以局数为步长，在地支上跳跃
  // 具体为：日数除以局数的商决定跳几步，余数决定调整
  
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  
  // 完整查表（按五行局×日数）
  // 以下为水二局的紫微落宫
  const ZIWEI_TABLE = {
    2: { // 水二局
      1:'丑', 2:'寅', 3:'寅', 4:'卯', 5:'卯', 6:'辰',
      7:'辰', 8:'巳', 9:'巳', 10:'午', 11:'午', 12:'未',
      13:'未', 14:'申', 15:'申', 16:'酉', 17:'酉', 18:'戌',
      19:'戌', 20:'亥', 21:'亥', 22:'子', 23:'子', 24:'丑',
      25:'丑', 26:'寅', 27:'寅', 28:'卯', 29:'卯', 30:'辰'
    },
    3: { // 木三局
      1:'辰', 2:'辰', 3:'巳', 4:'巳', 5:'巳', 6:'午',
      7:'午', 8:'午', 9:'未', 10:'未', 11:'未', 12:'申',
      13:'申', 14:'申', 15:'酉', 16:'酉', 17:'酉', 18:'戌',
      19:'戌', 20:'戌', 21:'亥', 22:'亥', 23:'亥', 24:'子',
      25:'子', 26:'子', 27:'丑', 28:'丑', 29:'丑', 30:'寅'
    },
    4: { // 金四局
      1:'未', 2:'未', 3:'未', 4:'申', 5:'申', 6:'申',
      7:'申', 8:'酉', 9:'酉', 10:'酉', 11:'酉', 12:'戌',
      13:'戌', 14:'戌', 15:'戌', 16:'亥', 17:'亥', 18:'亥',
      19:'亥', 20:'子', 21:'子', 22:'子', 23:'子', 24:'丑',
      25:'丑', 26:'丑', 27:'丑', 28:'寅', 29:'寅', 30:'寅'
    },
    5: { // 土五局
      1:'戌', 2:'戌', 3:'戌', 4:'戌', 5:'亥', 6:'亥',
      7:'亥', 8:'亥', 9:'亥', 10:'子', 11:'子', 12:'子',
      13:'子', 14:'子', 15:'丑', 16:'丑', 17:'丑', 18:'丑',
      19:'丑', 20:'寅', 21:'寅', 22:'寅', 23:'寅', 24:'寅',
      25:'卯', 26:'卯', 27:'卯', 28:'卯', 29:'卯', 30:'辰'
    },
    6: { // 火六局
      1:'丑', 2:'丑', 3:'丑', 4:'丑', 5:'丑', 6:'寅',
      7:'寅', 8:'寅', 9:'寅', 10:'寅', 11:'寅', 12:'卯',
      13:'卯', 14:'卯', 15:'卯', 16:'卯', 17:'卯', 18:'辰',
      19:'辰', 20:'辰', 21:'辰', 22:'辰', 23:'辰', 24:'巳',
      25:'巳', 26:'巳', 27:'巳', 28:'巳', 29:'巳', 30:'午'
    }
  };
  
  return ZIWEI_TABLE[ju][lunarDay];
}
```

> ⚠️ **上表为标准安星表，不同门派可能有微调。此处采用最通行版本。生产环境务必验证。**

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
  // 顺序：紫微→天机(-1)→空(-2)→太阳(-3)→武曲(-4)→天同(-5)→空(-6)→廉贞(-7)
  stars: [
    { name: '紫微', offset: 0 },
    { name: '天机', offset: -1 },
    // 空一宫
    { name: '太阳', offset: -3 },
    { name: '武曲', offset: -4 },
    { name: '天同', offset: -5 },
    // 空一宫
    { name: '廉贞', offset: -7 }
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
  '甲':'丑', '乙':'子', '丙':'亥', '丁':'酉',
  '戊':'丑', '己':'子', '庚':'丑', '辛':'午',
  '壬':'卯', '癸':'卯'
};

const TIANYUE_TABLE = {
  '甲':'未', '乙':'申', '丙':'酉', '丁':'亥',
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
  
  // 宫干也需要同步排
  const baseStemIdx = stems.indexOf(getPalaceStem(yearStem, mingGongBranch));
  
  const dayun = [];
  for (let i = 0; i < 12; i++) {
    const branchIdx = (baseIdx + (i + 1) * step + 12) % 12;
    const stemIdx = (baseStemIdx + (i + 1) * step + 10) % 10;
    dayun.push({
      stem: stems[stemIdx],
      branch: branches[branchIdx],
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
