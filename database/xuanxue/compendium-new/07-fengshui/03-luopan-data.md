# 风水篇 · 罗盘与二十四山数据

> **难度标签**：🟡进阶：二十四山·八宅 | 🔴专研：三元龙

> 纯技术参考。罗盘是风水理气派的核心工具。

---

## 一、二十四山

罗盘将360°分为24等分，每山15°。由天干·地支·四维（乾坤艮巽）组成。

```javascript
const ERSHISI_SHAN = [
  // 北方水局
  { idx:0,  name:'壬',  degree:[337.5, 352.5], gua:'坎', sanyuan:'天', wuxing:'water', yinyang:'阳' },
  { idx:1,  name:'子',  degree:[352.5,   7.5], gua:'坎', sanyuan:'地', wuxing:'water', yinyang:'阳' },
  { idx:2,  name:'癸',  degree:[  7.5,  22.5], gua:'坎', sanyuan:'人', wuxing:'water', yinyang:'阴' },
  // 东北土局
  { idx:3,  name:'丑',  degree:[ 22.5,  37.5], gua:'艮', sanyuan:'天', wuxing:'earth', yinyang:'阴' },
  { idx:4,  name:'艮',  degree:[ 37.5,  52.5], gua:'艮', sanyuan:'地', wuxing:'earth', yinyang:'阳' },
  { idx:5,  name:'寅',  degree:[ 52.5,  67.5], gua:'艮', sanyuan:'人', wuxing:'wood',  yinyang:'阳' },
  // 东方木局
  { idx:6,  name:'甲',  degree:[ 67.5,  82.5], gua:'震', sanyuan:'天', wuxing:'wood',  yinyang:'阳' },
  { idx:7,  name:'卯',  degree:[ 82.5,  97.5], gua:'震', sanyuan:'地', wuxing:'wood',  yinyang:'阴' },
  { idx:8,  name:'乙',  degree:[ 97.5, 112.5], gua:'震', sanyuan:'人', wuxing:'wood',  yinyang:'阴' },
  // 东南木局
  { idx:9,  name:'辰',  degree:[112.5, 127.5], gua:'巽', sanyuan:'天', wuxing:'earth', yinyang:'阳' },
  { idx:10, name:'巽',  degree:[127.5, 142.5], gua:'巽', sanyuan:'地', wuxing:'wood',  yinyang:'阴' },
  { idx:11, name:'巳',  degree:[142.5, 157.5], gua:'巽', sanyuan:'人', wuxing:'fire',  yinyang:'阴' },
  // 南方火局
  { idx:12, name:'丙',  degree:[157.5, 172.5], gua:'离', sanyuan:'天', wuxing:'fire',  yinyang:'阳' },
  { idx:13, name:'午',  degree:[172.5, 187.5], gua:'离', sanyuan:'地', wuxing:'fire',  yinyang:'阴' },
  { idx:14, name:'丁',  degree:[187.5, 202.5], gua:'离', sanyuan:'人', wuxing:'fire',  yinyang:'阴' },
  // 西南土局
  { idx:15, name:'未',  degree:[202.5, 217.5], gua:'坤', sanyuan:'天', wuxing:'earth', yinyang:'阴' },
  { idx:16, name:'坤',  degree:[217.5, 232.5], gua:'坤', sanyuan:'地', wuxing:'earth', yinyang:'阴' },
  { idx:17, name:'申',  degree:[232.5, 247.5], gua:'坤', sanyuan:'人', wuxing:'metal', yinyang:'阳' },
  // 西方金局
  { idx:18, name:'庚',  degree:[247.5, 262.5], gua:'兑', sanyuan:'天', wuxing:'metal', yinyang:'阳' },
  { idx:19, name:'酉',  degree:[262.5, 277.5], gua:'兑', sanyuan:'地', wuxing:'metal', yinyang:'阴' },
  { idx:20, name:'辛',  degree:[277.5, 292.5], gua:'兑', sanyuan:'人', wuxing:'metal', yinyang:'阴' },
  // 西北金局
  { idx:21, name:'戌',  degree:[292.5, 307.5], gua:'乾', sanyuan:'天', wuxing:'earth', yinyang:'阳' },
  { idx:22, name:'乾',  degree:[307.5, 322.5], gua:'乾', sanyuan:'地', wuxing:'metal', yinyang:'阳' },
  { idx:23, name:'亥',  degree:[322.5, 337.5], gua:'乾', sanyuan:'人', wuxing:'water', yinyang:'阴' }
];
```

---

## 二、坐向判定

```javascript
/**
 * 根据度数找到对应的山
 * @param degree 罗盘度数 (0-360, 0°=正北)
 */
function findMountain(degree) {
  degree = ((degree % 360) + 360) % 360;
  return ERSHISI_SHAN.find(m => {
    if (m.degree[0] < m.degree[1]) {
      return degree >= m.degree[0] && degree < m.degree[1];
    }
    return degree >= m.degree[0] || degree < m.degree[1];
  });
}

/**
 * 获取坐向
 * @param facingDegree 朝向度数
 */
function getSittingFacing(facingDegree) {
  const facing = findMountain(facingDegree);
  const sittingDegree = (facingDegree + 180) % 360;
  const sitting = findMountain(sittingDegree);
  
  return {
    sitting: sitting,  // 坐山
    facing: facing,    // 朝向
    label: `坐${sitting.name}朝${facing.name}`
  };
}
```

---

## 三、三元龙（天地人）

二十四山分为三元龙，决定玄空飞星的顺逆飞。

```javascript
// 三元龙分组
const SANYUAN_LONG = {
  '天元龙': ['壬','丑','甲','辰','丙','未','庚','戌'], // 第1位
  '地元龙': ['子','艮','卯','巽','午','坤','酉','乾'], // 第2位
  '人元龙': ['癸','寅','乙','巳','丁','申','辛','亥']  // 第3位
};

// 阴阳（决定飞星顺逆）
// 天元龙和人元龙中：阳山顺飞，阴山逆飞
// 地元龙中：看卦的先天八卦阴阳
```

---

## 四、八宅法完整数据

### 本命卦速查

```javascript
function getBenMingGua(year, gender) {
  // 将年份各位数字求和至个位
  let sum = 0, y = year;
  while (y > 0) { sum += y % 10; y = Math.floor(y / 10); }
  while (sum >= 10) {
    let s = 0, n = sum;
    while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    sum = s;
  }
  
  let gua;
  if (gender === 'male') {
    gua = year < 2000 ? ((11 - sum) % 9 || 9) : ((10 - sum) % 9 || 9);
  } else {
    gua = year < 2000 ? ((sum + 4) % 9 || 9) : ((sum + 5) % 9 || 9);
  }
  if (gua === 5) gua = gender === 'male' ? 2 : 8;
  
  const names = { 1:'坎', 2:'坤', 3:'震', 4:'巽', 6:'乾', 7:'兑', 8:'艮', 9:'离' };
  const group = [1,3,4,9].includes(gua) ? '东四命' : '西四命';
  
  return { number: gua, name: names[gua], group };
}
```

### 东四命·西四命匹配

```
东四命（坎1·震3·巽4·离9）→ 宜住东四宅（坎·震·巽·离宅）
西四命（坤2·乾6·兑7·艮8）→ 宜住西四宅（坤·乾·兑·艮宅）

命宅搭配原则：
✓ 东四命 + 东四宅 → 吉
✓ 西四命 + 西四宅 → 吉
✗ 东四命 + 西四宅 → 不利
✗ 西四命 + 东四宅 → 不利
```

---

## 五、流年飞星方位化解速查

```javascript
const YEARLY_STAR_REMEDY = {
  5: { // 五黄廉贞
    element: 'earth',
    danger: '大凶·灾祸·意外·重病',
    remedy: '铜器·金属·六帝钱。忌红色·忌动土。',
    avoid: '不宜坐卧在此方位'
  },
  2: { // 二黑巨门
    element: 'earth',
    danger: '病符·疾病·产厄',
    remedy: '铜葫芦·金属风铃。忌黄色泥土。',
    avoid: '体弱者避开此方位'
  },
  3: { // 三碧禄存
    element: 'wood',
    danger: '是非·官非·争斗',
    remedy: '红色物品·火属物。忌水·忌绿色。',
    avoid: '办公桌勿面向此方'
  },
  7: { // 七赤破军
    element: 'metal',
    danger: '口舌·盗贼·破财',
    remedy: '水养植物·蓝黑色。忌红色。',
    avoid: '门窗方位注意安全'
  },
  1: { // 一白贪狼
    element: 'water',
    benefit: '桃花·人缘·升迁',
    enhance: '金属摆件·白色·圆形物',
    note: '九运生气星'
  },
  8: { // 八白左辅
    element: 'earth',
    benefit: '财运·置业·喜庆',
    enhance: '红色·火属物（火生土）',
    note: '八运余气·仍有财力'
  },
  9: { // 九紫右弼
    element: 'fire',
    benefit: '当运旺星·喜庆·名利',
    enhance: '木属物·绿色（木生火）',
    note: '九运最旺之星'
  },
  4: { // 四绿文曲
    element: 'wood',
    benefit: '文昌·学业·考试',
    enhance: '水养富贵竹四支',
    note: '书房宜在四绿方'
  },
  6: { // 六白武曲
    element: 'metal',
    benefit: '权力·武权·偏财',
    enhance: '黄色·土属（土生金）',
    note: '利管理层·军警'
  }
};
```

---

## 六、风水排盘开发提示

### 最小可用产品

```
输入：建造年份 + 坐向度数
输出：
1. 运盘（9宫运星）
2. 山盘（9宫山星）
3. 向盘（9宫向星）
4. 判断旺山旺向/上山下水
5. 年飞星叠加
6. 各宫吉凶点评
```

### 开发顺序建议

1. 先实现二十四山查找（度数→山名）
2. 再实现年运盘（年份→中宫星→飞星九宫）
3. 再实现山向盘（需要三元龙阴阳判断顺逆飞）
4. 最后实现年月飞星叠加
