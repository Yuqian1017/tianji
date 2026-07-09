# 易经补充 · 互卦·错卦·综卦 + 64卦结构化数据

> **难度标签**：🔴专研：卦变数据

> 卦的变换关系是深度解卦的关键工具。

---

## 一、三种卦变

### 互卦（Nuclear Hexagram）

取本卦的二三四爻为下卦，三四五爻为上卦，组成新卦。

```javascript
function getHuGua(lines) {
  // lines = [初爻, 二爻, 三爻, 四爻, 五爻, 上爻]
  // 互卦下卦 = 二三四爻
  // 互卦上卦 = 三四五爻
  const huLower = [lines[1], lines[2], lines[3]];
  const huUpper = [lines[2], lines[3], lines[4]];
  return { lower: huLower, upper: huUpper };
}
// 含义：互卦揭示事物的内在本质·隐藏因素
```

### 错卦（Inverse Hexagram）

本卦每一爻取反（阳变阴，阴变阳）。

```javascript
function getCuoGua(lines) {
  return lines.map(l => l === 1 ? 0 : 1);
}
// 含义：错卦是事物的对立面·反面·另一种可能
```

### 综卦（Reverse Hexagram）

本卦上下颠倒（翻转180度）。

```javascript
function getZongGua(lines) {
  return [...lines].reverse();
}
// 含义：综卦是换一个角度看同一件事·立场互换
```

### 实例：以「天火同人」为例

```
本卦：天火同人 ☰☲ （上乾下离）
lines = [1,0,1,1,1,1]

互卦：取2345爻 → 下卦[0,1,1]=巽 上卦[1,1,1]=乾 → 天风姤
错卦：每爻取反 → [0,1,0,0,0,0] → 上坤下坎 → 地水师
综卦：上下颠倒 → [1,1,1,1,0,1] → 上离下乾 → 火天大有
```

---

## 二、64卦结构化数据

```javascript
const GUA_64 = [
  // 卦序(周易), 卦名, 上卦, 下卦, 八宫, 世爻, 错卦, 综卦, 关键词
  { seq:1,  name:'乾为天',   upper:'乾', lower:'乾', gong:'乾', shi:6, cuo:'坤为地',   zong:'乾为天',   key:'刚健·创始·天行健' },
  { seq:2,  name:'坤为地',   upper:'坤', lower:'坤', gong:'坤', shi:6, cuo:'乾为天',   zong:'坤为地',   key:'柔顺·承载·厚德载物' },
  { seq:3,  name:'水雷屯',   upper:'坎', lower:'震', gong:'坎', shi:2, cuo:'火风鼎',   zong:'山水蒙',   key:'初始·困难·萌芽' },
  { seq:4,  name:'山水蒙',   upper:'艮', lower:'坎', gong:'离', shi:2, cuo:'泽火革',   zong:'水雷屯',   key:'蒙昧·启蒙·教育' },
  { seq:5,  name:'水天需',   upper:'坎', lower:'乾', gong:'乾', shi:1, cuo:'火地晋',   zong:'天水讼',   key:'等待·耐心·需求' },
  { seq:6,  name:'天水讼',   upper:'乾', lower:'坎', gong:'离', shi:1, cuo:'地火明夷', zong:'水天需',   key:'争讼·是非·冲突' },
  { seq:7,  name:'地水师',   upper:'坤', lower:'坎', gong:'坎', shi:1, cuo:'天火同人', zong:'水地比',   key:'军队·纪律·统帅' },
  { seq:8,  name:'水地比',   upper:'坎', lower:'坤', gong:'坤', shi:1, cuo:'火天大有', zong:'地水师',   key:'亲近·辅佐·合作' },
  { seq:9,  name:'风天小畜', upper:'巽', lower:'乾', gong:'巽', shi:1, cuo:'雷地豫',   zong:'天风姤',   key:'积蓄·小有·节制' },
  { seq:10, name:'天泽履',   upper:'乾', lower:'兑', gong:'艮', shi:1, cuo:'地山谦',   zong:'泽天夬',   key:'履行·礼仪·慎行' },
  { seq:11, name:'地天泰',   upper:'坤', lower:'乾', gong:'乾', shi:3, cuo:'天地否',   zong:'天地否',   key:'通泰·和谐·亨通' },
  { seq:12, name:'天地否',   upper:'乾', lower:'坤', gong:'坤', shi:3, cuo:'地天泰',   zong:'地天泰',   key:'闭塞·不通·否极泰来' },
  { seq:13, name:'天火同人', upper:'乾', lower:'离', gong:'离', shi:1, cuo:'地水师',   zong:'火天大有', key:'同心·团结·和同' },
  { seq:14, name:'火天大有', upper:'离', lower:'乾', gong:'乾', shi:1, cuo:'水地比',   zong:'天火同人', key:'大有·丰收·光明' },
  { seq:15, name:'地山谦',   upper:'坤', lower:'艮', gong:'艮', shi:1, cuo:'天泽履',   zong:'雷地豫',   key:'谦虚·谦逊·吉' },
  { seq:16, name:'雷地豫',   upper:'震', lower:'坤', gong:'巽', shi:1, cuo:'风天小畜', zong:'地山谦',   key:'喜悦·豫备·安乐' },
  { seq:17, name:'泽雷随',   upper:'兑', lower:'震', gong:'震', shi:2, cuo:'山风蛊',   zong:'风山渐',   key:'随从·跟随·适时' },
  { seq:18, name:'山风蛊',   upper:'艮', lower:'巽', gong:'巽', shi:2, cuo:'泽雷随',   zong:'风山渐',   key:'蛊惑·整治·革弊' },
  { seq:19, name:'地泽临',   upper:'坤', lower:'兑', gong:'坤', shi:2, cuo:'天山遁',   zong:'泽地萃',   key:'亲临·治理·居上临下' },
  { seq:20, name:'风地观',   upper:'巽', lower:'坤', gong:'乾', shi:2, cuo:'雷天大壮', zong:'地风升',   key:'观察·示范·仰观' },
  { seq:21, name:'火雷噬嗑', upper:'离', lower:'震', gong:'巽', shi:4, cuo:'水风井',   zong:'山水蒙',   key:'咬合·刑法·决断' },
  { seq:22, name:'山火贲',   upper:'艮', lower:'离', gong:'艮', shi:4, cuo:'泽水困',   zong:'火山旅',   key:'文饰·装饰·外美' },
  { seq:23, name:'山地剥',   upper:'艮', lower:'坤', gong:'乾', shi:4, cuo:'泽天夬',   zong:'地雷复',   key:'剥落·衰败·小人' },
  { seq:24, name:'地雷复',   upper:'坤', lower:'震', gong:'坤', shi:4, cuo:'天风姤',   zong:'山地剥',   key:'复归·回归·一阳来复' },
  { seq:25, name:'天雷无妄', upper:'乾', lower:'震', gong:'巽', shi:3, cuo:'地风升',   zong:'泽天夬',   key:'无妄·纯正·天真' },
  { seq:26, name:'山天大畜', upper:'艮', lower:'乾', gong:'艮', shi:3, cuo:'泽地萃',   zong:'天山遁',   key:'大蓄·积累·止健' },
  { seq:27, name:'山雷颐',   upper:'艮', lower:'震', gong:'巽', shi:5, cuo:'泽风大过', zong:'山雷颐',   key:'颐养·饮食·养生' },
  { seq:28, name:'泽风大过', upper:'兑', lower:'巽', gong:'震', shi:5, cuo:'山雷颐',   zong:'泽风大过', key:'大过·过度·栋梁' },
  { seq:29, name:'坎为水',   upper:'坎', lower:'坎', gong:'坎', shi:6, cuo:'离为火',   zong:'坎为水',   key:'坎险·险难·水' },
  { seq:30, name:'离为火',   upper:'离', lower:'离', gong:'离', shi:6, cuo:'坎为水',   zong:'离为火',   key:'附丽·光明·火' },
  { seq:31, name:'泽山咸',   upper:'兑', lower:'艮', gong:'兑', shi:4, cuo:'山泽损',   zong:'雷风恒',   key:'感应·交感·夫妇' },
  { seq:32, name:'雷风恒',   upper:'震', lower:'巽', gong:'震', shi:4, cuo:'风雷益',   zong:'泽山咸',   key:'恒久·持久·不变' },
  { seq:33, name:'天山遁',   upper:'乾', lower:'艮', gong:'乾', shi:2, cuo:'地泽临',   zong:'雷天大壮', key:'退遁·隐退·避让' },
  { seq:34, name:'雷天大壮', upper:'震', lower:'乾', gong:'坤', shi:2, cuo:'风地观',   zong:'天山遁',   key:'壮大·刚健·壮盛' },
  { seq:35, name:'火地晋',   upper:'离', lower:'坤', gong:'乾', shi:5, cuo:'水天需',   zong:'地火明夷', key:'晋升·进步·向明' },
  { seq:36, name:'地火明夷', upper:'坤', lower:'离', gong:'坎', shi:5, cuo:'天水讼',   zong:'火地晋',   key:'光明受损·韬光' },
  { seq:37, name:'风火家人', upper:'巽', lower:'离', gong:'巽', shi:3, cuo:'雷水解',   zong:'火泽睽',   key:'家庭·治家·齐家' },
  { seq:38, name:'火泽睽',   upper:'离', lower:'兑', gong:'艮', shi:3, cuo:'水山蹇',   zong:'风火家人', key:'乖离·矛盾·对立' },
  { seq:39, name:'水山蹇',   upper:'坎', lower:'艮', gong:'兑', shi:3, cuo:'火泽睽',   zong:'雷水解',   key:'蹇难·阻碍·艰难' },
  { seq:40, name:'雷水解',   upper:'震', lower:'坎', gong:'震', shi:3, cuo:'风火家人', zong:'水山蹇',   key:'解除·解脱·缓和' },
  { seq:41, name:'山泽损',   upper:'艮', lower:'兑', gong:'艮', shi:4, cuo:'泽山咸',   zong:'风雷益',   key:'减损·舍得·损上益下' },
  { seq:42, name:'风雷益',   upper:'巽', lower:'震', gong:'巽', shi:4, cuo:'雷风恒',   zong:'山泽损',   key:'增益·利益·损上益下' },
  { seq:43, name:'泽天夬',   upper:'兑', lower:'乾', gong:'坤', shi:4, cuo:'山地剥',   zong:'天风姤',   key:'决断·决裂·刚决' },
  { seq:44, name:'天风姤',   upper:'乾', lower:'巽', gong:'乾', shi:4, cuo:'地雷复',   zong:'泽天夬',   key:'遇合·邂逅·不期而遇' },
  { seq:45, name:'泽地萃',   upper:'兑', lower:'坤', gong:'兑', shi:2, cuo:'山天大畜', zong:'地风升',   key:'聚集·集合·荟萃' },
  { seq:46, name:'地风升',   upper:'坤', lower:'巽', gong:'震', shi:2, cuo:'天雷无妄', zong:'泽地萃',   key:'上升·进升·生长' },
  { seq:47, name:'泽水困',   upper:'兑', lower:'坎', gong:'兑', shi:3, cuo:'山火贲',   zong:'水风井',   key:'困厄·困难·受困' },
  { seq:48, name:'水风井',   upper:'坎', lower:'巽', gong:'震', shi:3, cuo:'火雷噬嗑', zong:'泽水困',   key:'水井·养民·不变' },
  { seq:49, name:'泽火革',   upper:'兑', lower:'离', gong:'坎', shi:5, cuo:'山水蒙',   zong:'火风鼎',   key:'变革·革新·改变' },
  { seq:50, name:'火风鼎',   upper:'离', lower:'巽', gong:'离', shi:5, cuo:'水雷屯',   zong:'泽火革',   key:'鼎新·烹饪·稳重' },
  { seq:51, name:'震为雷',   upper:'震', lower:'震', gong:'震', shi:6, cuo:'巽为风',   zong:'震为雷',   key:'震动·惊恐·雷' },
  { seq:52, name:'艮为山',   upper:'艮', lower:'艮', gong:'艮', shi:6, cuo:'兑为泽',   zong:'艮为山',   key:'止静·稳定·山' },
  { seq:53, name:'风山渐',   upper:'巽', lower:'艮', gong:'艮', shi:2, cuo:'雷泽归妹', zong:'雷泽归妹', key:'渐进·循序·女归' },
  { seq:54, name:'雷泽归妹', upper:'震', lower:'兑', gong:'兑', shi:2, cuo:'风山渐',   zong:'风山渐',   key:'归妹·少女出嫁·配' },
  { seq:55, name:'雷火丰',   upper:'震', lower:'离', gong:'坎', shi:4, cuo:'风水涣',   zong:'火山旅',   key:'丰盛·盛大·光明' },
  { seq:56, name:'火山旅',   upper:'离', lower:'艮', gong:'离', shi:4, cuo:'水泽节',   zong:'雷火丰',   key:'旅行·漂泊·客居' },
  { seq:57, name:'巽为风',   upper:'巽', lower:'巽', gong:'巽', shi:6, cuo:'震为雷',   zong:'巽为风',   key:'顺入·柔和·风' },
  { seq:58, name:'兑为泽',   upper:'兑', lower:'兑', gong:'兑', shi:6, cuo:'艮为山',   zong:'兑为泽',   key:'喜悦·口舌·泽' },
  { seq:59, name:'风水涣',   upper:'巽', lower:'坎', gong:'离', shi:5, cuo:'雷火丰',   zong:'水泽节',   key:'涣散·分散·离散' },
  { seq:60, name:'水泽节',   upper:'坎', lower:'兑', gong:'坎', shi:5, cuo:'火山旅',   zong:'风水涣',   key:'节制·节约·节度' },
  { seq:61, name:'风泽中孚', upper:'巽', lower:'兑', gong:'艮', shi:5, cuo:'雷山小过', zong:'雷山小过', key:'诚信·中正·信实' },
  { seq:62, name:'雷山小过', upper:'震', lower:'艮', gong:'兑', shi:5, cuo:'风泽中孚', zong:'风泽中孚', key:'小过·小有过越·谦卑' },
  { seq:63, name:'水火既济', upper:'坎', lower:'离', gong:'坎', shi:4, cuo:'火水未济', zong:'火水未济', key:'完成·已成·功成' },
  { seq:64, name:'火水未济', upper:'离', lower:'坎', gong:'离', shi:4, cuo:'水火既济', zong:'水火既济', key:'未完成·将成·希望' }
];
```

---

## 三、卦变关系查询

```javascript
function getGuaTransforms(guaName) {
  const gua = GUA_64.find(g => g.name === guaName);
  if (!gua) return null;
  
  const lines = getGuaLines(gua.upper, gua.lower);
  
  return {
    benGua: gua,
    huGua: findGuaByLines(getHuGua(lines)),
    cuoGua: GUA_64.find(g => g.name === gua.cuo),
    zongGua: GUA_64.find(g => g.name === gua.zong)
  };
}
```

---

## 四、解卦中的卦变应用

```
本卦 → 现状·问题本身
变卦 → 发展方向·结果
互卦 → 隐藏因素·内在原因·中间过程
错卦 → 对立面·另一种可能·换个角度看
综卦 → 对方立场·换位思考
```

**实例**：占问事业，得「天火同人」

```
本卦：天火同人 → 当前需要合作·团结
互卦：天风姤 → 内在隐患：可能遇到意外的人/事
错卦：地水师 → 对立面：若不合作则需独自作战
综卦：火天大有 → 换角度：合作成功后将大有收获
```
