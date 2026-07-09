# 六爻排盘完整算法规格

> ⚠️ **CC注意**：本文件中的算法为伪代码，未经实际运行验证。实现时务必用 reference/test-cases.md 的六爻用例交叉验证纳甲、世应、六亲的正确性。

> 本文件为纯技术参考，无叙事内容。供 Claude Code 开发六爻排盘工具时直接引用。

---

## 数据表

### 1. 八卦基础数据

```javascript
const BAGUA = {
  '乾': { xiantian: 1, houtian: 6, wuxing: 'metal', binary: '111' },
  '兑': { xiantian: 2, houtian: 7, wuxing: 'metal', binary: '110' },
  '离': { xiantian: 3, houtian: 9, wuxing: 'fire',  binary: '101' },
  '震': { xiantian: 4, houtian: 3, wuxing: 'wood',  binary: '001' },
  '巽': { xiantian: 5, houtian: 4, wuxing: 'wood',  binary: '011' },
  '坎': { xiantian: 6, houtian: 1, wuxing: 'water', binary: '010' },
  '艮': { xiantian: 7, houtian: 8, wuxing: 'earth', binary: '100' },
  '坤': { xiantian: 8, houtian: 2, wuxing: 'earth', binary: '000' }
};
```

### 2. 纳甲数据（核心·必须查表）

```javascript
const NAJIA = {
  '乾': { stem: '甲', inner: ['子','寅','辰'], outer: ['午','申','戌'] },
  '坤': { stem: '乙', inner: ['未','巳','卯'], outer: ['丑','亥','酉'] },
  '震': { stem: '庚', inner: ['子','寅','辰'], outer: ['午','申','戌'] },
  '巽': { stem: '辛', inner: ['丑','亥','酉'], outer: ['未','巳','卯'] },
  '坎': { stem: '戊', inner: ['寅','辰','午'], outer: ['申','戌','子'] },
  '离': { stem: '己', inner: ['卯','丑','亥'], outer: ['酉','未','巳'] },
  '艮': { stem: '丙', inner: ['辰','午','申'], outer: ['戌','子','寅'] },
  '兑': { stem: '丁', inner: ['巳','卯','丑'], outer: ['亥','酉','未'] }
};
```

### 3. 京房八宫数据（核心·必须查表）

```javascript
const JINGFANG = {
  '乾宫': {
    wuxing: 'metal',
    gua: [
      { name: '乾为天', upper: '乾', lower: '乾', type: '本宫', world: 6, response: 3 },
      { name: '天风姤', upper: '乾', lower: '巽', type: '一世', world: 1, response: 4 },
      { name: '天山遁', upper: '乾', lower: '艮', type: '二世', world: 2, response: 5 },
      { name: '天地否', upper: '乾', lower: '坤', type: '三世', world: 3, response: 6 },
      { name: '风地观', upper: '巽', lower: '坤', type: '四世', world: 4, response: 1 },
      { name: '山地剥', upper: '艮', lower: '坤', type: '五世', world: 5, response: 2 },
      { name: '火地晋', upper: '离', lower: '坤', type: '游魂', world: 4, response: 1 },
      { name: '火天大有', upper: '离', lower: '乾', type: '归魂', world: 3, response: 6 }
    ]
  },
  '兑宫': {
    wuxing: 'metal',
    gua: [
      { name: '兑为泽', upper: '兑', lower: '兑', type: '本宫', world: 6, response: 3 },
      { name: '泽水困', upper: '兑', lower: '坎', type: '一世', world: 1, response: 4 },
      { name: '泽地萃', upper: '兑', lower: '坤', type: '二世', world: 2, response: 5 },
      { name: '泽山咸', upper: '兑', lower: '艮', type: '三世', world: 3, response: 6 },
      { name: '水山蹇', upper: '坎', lower: '艮', type: '四世', world: 4, response: 1 },
      { name: '地山谦', upper: '坤', lower: '艮', type: '五世', world: 5, response: 2 },
      { name: '雷山小过', upper: '震', lower: '艮', type: '游魂', world: 4, response: 1 },
      { name: '雷泽归妹', upper: '震', lower: '兑', type: '归魂', world: 3, response: 6 }
    ]
  },
  '离宫': {
    wuxing: 'fire',
    gua: [
      { name: '离为火', upper: '离', lower: '离', type: '本宫', world: 6, response: 3 },
      { name: '火山旅', upper: '离', lower: '艮', type: '一世', world: 1, response: 4 },
      { name: '火风鼎', upper: '离', lower: '巽', type: '二世', world: 2, response: 5 },
      { name: '火水未济', upper: '离', lower: '坎', type: '三世', world: 3, response: 6 },
      { name: '山水蒙', upper: '艮', lower: '坎', type: '四世', world: 4, response: 1 },
      { name: '风水涣', upper: '巽', lower: '坎', type: '五世', world: 5, response: 2 },
      { name: '天水讼', upper: '乾', lower: '坎', type: '游魂', world: 4, response: 1 },
      { name: '天火同人', upper: '乾', lower: '离', type: '归魂', world: 3, response: 6 }
    ]
  },
  '震宫': {
    wuxing: 'wood',
    gua: [
      { name: '震为雷', upper: '震', lower: '震', type: '本宫', world: 6, response: 3 },
      { name: '雷地豫', upper: '震', lower: '坤', type: '一世', world: 1, response: 4 },
      { name: '雷水解', upper: '震', lower: '坎', type: '二世', world: 2, response: 5 },
      { name: '雷风恒', upper: '震', lower: '巽', type: '三世', world: 3, response: 6 },
      { name: '地风升', upper: '坤', lower: '巽', type: '四世', world: 4, response: 1 },
      { name: '水风井', upper: '坎', lower: '巽', type: '五世', world: 5, response: 2 },
      { name: '泽风大过', upper: '兑', lower: '巽', type: '游魂', world: 4, response: 1 },
      { name: '泽雷随', upper: '兑', lower: '震', type: '归魂', world: 3, response: 6 }
    ]
  },
  '巽宫': {
    wuxing: 'wood',
    gua: [
      { name: '巽为风', upper: '巽', lower: '巽', type: '本宫', world: 6, response: 3 },
      { name: '风天小畜', upper: '巽', lower: '乾', type: '一世', world: 1, response: 4 },
      { name: '风火家人', upper: '巽', lower: '离', type: '二世', world: 2, response: 5 },
      { name: '风雷益', upper: '巽', lower: '震', type: '三世', world: 3, response: 6 },
      { name: '天雷无妄', upper: '乾', lower: '震', type: '四世', world: 4, response: 1 },
      { name: '火雷噬嗑', upper: '离', lower: '震', type: '五世', world: 5, response: 2 },
      { name: '山雷颐', upper: '艮', lower: '震', type: '游魂', world: 4, response: 1 },
      { name: '山风蛊', upper: '艮', lower: '巽', type: '归魂', world: 3, response: 6 }
    ]
  },
  '坎宫': {
    wuxing: 'water',
    gua: [
      { name: '坎为水', upper: '坎', lower: '坎', type: '本宫', world: 6, response: 3 },
      { name: '水泽节', upper: '坎', lower: '兑', type: '一世', world: 1, response: 4 },
      { name: '水雷屯', upper: '坎', lower: '震', type: '二世', world: 2, response: 5 },
      { name: '水火既济', upper: '坎', lower: '离', type: '三世', world: 3, response: 6 },
      { name: '泽火革', upper: '兑', lower: '离', type: '四世', world: 4, response: 1 },
      { name: '雷火丰', upper: '震', lower: '离', type: '五世', world: 5, response: 2 },
      { name: '地火明夷', upper: '坤', lower: '离', type: '游魂', world: 4, response: 1 },
      { name: '地水师', upper: '坤', lower: '坎', type: '归魂', world: 3, response: 6 }
    ]
  },
  '艮宫': {
    wuxing: 'earth',
    gua: [
      { name: '艮为山', upper: '艮', lower: '艮', type: '本宫', world: 6, response: 3 },
      { name: '山火贲', upper: '艮', lower: '离', type: '一世', world: 1, response: 4 },
      { name: '山天大畜', upper: '艮', lower: '乾', type: '二世', world: 2, response: 5 },
      { name: '山泽损', upper: '艮', lower: '兑', type: '三世', world: 3, response: 6 },
      { name: '火泽睽', upper: '离', lower: '兑', type: '四世', world: 4, response: 1 },
      { name: '天泽履', upper: '乾', lower: '兑', type: '五世', world: 5, response: 2 },
      { name: '风泽中孚', upper: '巽', lower: '兑', type: '游魂', world: 4, response: 1 },
      { name: '风山渐', upper: '巽', lower: '艮', type: '归魂', world: 3, response: 6 }
    ]
  },
  '坤宫': {
    wuxing: 'earth',
    gua: [
      { name: '坤为地', upper: '坤', lower: '坤', type: '本宫', world: 6, response: 3 },
      { name: '地雷复', upper: '坤', lower: '震', type: '一世', world: 1, response: 4 },
      { name: '地泽临', upper: '坤', lower: '兑', type: '二世', world: 2, response: 5 },
      { name: '地天泰', upper: '坤', lower: '乾', type: '三世', world: 3, response: 6 },
      { name: '雷天大壮', upper: '震', lower: '乾', type: '四世', world: 4, response: 1 },
      { name: '泽天夬', upper: '兑', lower: '乾', type: '五世', world: 5, response: 2 },
      { name: '水天需', upper: '坎', lower: '乾', type: '游魂', world: 4, response: 1 },
      { name: '水地比', upper: '坎', lower: '坤', type: '归魂', world: 3, response: 6 }
    ]
  }
};
```

### 4. 地支五行与关系数据

```javascript
const BRANCH_WUXING = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
};

const SIX_CLASH = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];

const SIX_COMBINE = [
  {pair: ['子','丑'], hua: 'earth'},
  {pair: ['寅','亥'], hua: 'wood'},
  {pair: ['卯','戌'], hua: 'fire'},
  {pair: ['辰','酉'], hua: 'metal'},
  {pair: ['巳','申'], hua: 'water'},
  {pair: ['午','未'], hua: 'fire'}
];

const THREE_COMBINE = [
  {members: ['申','子','辰'], hua: 'water'},
  {members: ['亥','卯','未'], hua: 'wood'},
  {members: ['寅','午','戌'], hua: 'fire'},
  {members: ['巳','酉','丑'], hua: 'metal'}
];

const GRAVE = { wood: '未', fire: '戌', earth: '辰', metal: '丑', water: '辰' };
```

### 5. 空亡数据

```javascript
function getKongWang(dayStem, dayBranch) {
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const si = stems.indexOf(dayStem);
  const bi = branches.indexOf(dayBranch);
  const xunStart = (bi - si + 12) % 12;
  return [branches[(xunStart + 10) % 12], branches[(xunStart + 11) % 12]];
}
```

### 6. 六神数据

```javascript
const SIX_SPIRITS_ORDER = ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
const SPIRIT_START = { '甲':0,'乙':0,'丙':1,'丁':1,'戊':2,'己':3,'庚':4,'辛':4,'壬':5,'癸':5 };

function getSixSpirits(dayStem) {
  const start = SPIRIT_START[dayStem];
  return Array.from({length:6}, (_, i) => SIX_SPIRITS_ORDER[(start + i) % 6]);
}
```

---

## 完整排盘算法

```javascript
function fullPaipan(upperGua, lowerGua, rawValues, dayStem, dayBranch, monthBranch) {
  // 1. 确定卦名
  const guaName = lookupGuaName(upperGua, lowerGua); // 查表
  
  // 2. 确定卦宫
  const palace = findPalace(guaName); // 查八宫表
  
  // 3. 纳甲
  const najia = applyNajia(lowerGua, upperGua);
  
  // 4. 世应
  const worldResponse = { world: palace.world, response: palace.response };
  
  // 5. 六亲
  const liuqin = najia.map(yao => {
    const branchWuxing = BRANCH_WUXING[yao.branch];
    return getSixRelation(palace.wuxing, branchWuxing);
  });
  
  // 6. 六神
  const spirits = getSixSpirits(dayStem);
  
  // 7. 动爻与变卦
  const movingLines = rawValues.map((v, i) => (v === 6 || v === 9) ? i : -1).filter(i => i >= 0);
  const changedLines = rawValues.map(v => {
    if (v === 9) return 0; // 老阳变阴
    if (v === 6) return 1; // 老阴变阳
    return v % 2 === 1 ? 1 : 0; // 保持不变
  });
  
  // 8. 空亡
  const kongWang = getKongWang(dayStem, dayBranch);
  
  // 组装结果
  return {
    guaName,
    palace: palace.palace,
    palaceWuxing: palace.wuxing,
    lines: najia.map((yao, i) => ({
      position: i + 1,
      najia: yao.stem + yao.branch,
      branch: yao.branch,
      branchWuxing: BRANCH_WUXING[yao.branch],
      yinyang: rawValues[i] % 2 === 1 ? 'yang' : 'yin',
      moving: movingLines.includes(i),
      liuqin: liuqin[i],
      spirit: spirits[i],
      isWorld: i + 1 === worldResponse.world,
      isResponse: i + 1 === worldResponse.response,
      isEmpty: kongWang.includes(yao.branch),
      inGrave: yao.branch === GRAVE[BRANCH_WUXING[yao.branch]]
    })),
    movingLines,
    kongWang,
    monthBranch,
    dayBranch
  };
}
```

---

## 断卦辅助函数

```javascript
// 五行关系判定
function wuxingRelation(from, to) {
  const order = ['wood','fire','earth','metal','water'];
  if (from === to) return 'same';
  const diff = (order.indexOf(to) - order.indexOf(from) + 5) % 5;
  return ['same','generate','restrict','restricted_by','generated_by'][diff];
}

// 判断两个地支是否六冲
function isClash(branch1, branch2) {
  return SIX_CLASH.some(pair => pair.includes(branch1) && pair.includes(branch2));
}

// 判断两个地支是否六合
function isCombine(branch1, branch2) {
  return SIX_COMBINE.some(c => c.pair.includes(branch1) && c.pair.includes(branch2));
}

// 旺衰简易判定
function strengthLevel(yaoWuxing, monthBranch) {
  const monthWuxing = BRANCH_WUXING[monthBranch];
  const relation = wuxingRelation(monthWuxing, yaoWuxing);
  if (relation === 'same' || relation === 'generate') return '旺相';
  if (relation === 'restrict') return '受克';
  return '休囚';
}
```
