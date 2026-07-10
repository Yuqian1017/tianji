# 风水篇 · 玄空飞星排盘与断事

> **LEGACY / NON-CANONICAL**：此副本包含已知错误的三元龙、玄空阴阳和山向盘简化算法。规范资料见 `../../compendium-new/07-fengshui/01-xuankong-feixing.md` 与 `../../../fengshui/fengshui-core.json`，不得从本文件生成排盘或教学答案。

> **难度标签**：🟢必修：三元九运 | 🟡进阶：飞星组合 | 🔴专研：山盘向盘

> *"八宅法看大势，玄空飞星看精度。八宅法像GPS定位到城市，玄空飞星定位到门牌号。"——师父*

---

## 一、玄空飞星核心原理

### 三元九运（时间维度）

每180年为一个大三元，分上中下三元各60年，每元三运各20年。

```javascript
const SANYUAN_JIUYUN = [
  { yuan:'上元', yun:1, start:1864, end:1883, star:1, wuxing:'water' },
  { yuan:'上元', yun:2, start:1884, end:1903, star:2, wuxing:'earth' },
  { yuan:'上元', yun:3, start:1904, end:1923, star:3, wuxing:'wood' },
  { yuan:'中元', yun:4, start:1924, end:1943, star:4, wuxing:'wood' },
  { yuan:'中元', yun:5, start:1944, end:1963, star:5, wuxing:'earth' },
  { yuan:'中元', yun:6, start:1964, end:1983, star:6, wuxing:'metal' },
  { yuan:'下元', yun:7, start:1984, end:2003, star:7, wuxing:'metal' },
  { yuan:'下元', yun:8, start:2004, end:2023, star:8, wuxing:'earth' },
  { yuan:'下元', yun:9, start:2024, end:2043, star:9, wuxing:'fire' },
  // 下一轮
  { yuan:'上元', yun:1, start:2044, end:2063, star:1, wuxing:'water' },
];

function getCurrentYun(year) {
  return SANYUAN_JIUYUN.find(y => year >= y.start && year <= y.end);
}
```

### 当前九运（2024-2043）核心特征

```
当旺星：九紫（火）
生气星：一白（水·未来旺星）
退运星：八白（上一运·余气尚存）
衰死星：二黑·三碧·五黄·七赤（大凶需化解）
中性星：四绿·六白（各有利弊）
```

---

## 二、九宫飞星排法

### 洛书飞星轨迹

```
飞星按洛书轨迹飞行：中→乾六→兑七→艮八→离九→坎一→坤二→震三→巽四

顺飞：中→6→7→8→9→1→2→3→4
逆飞：中→4→3→2→1→9→8→7→6
```

```javascript
// 九宫位置（洛书）
const LUOSHU_POS = {
  1: { name:'坎', row:2, col:1, dir:'N' },
  2: { name:'坤', row:2, col:2, dir:'SW' },  // 实际右下→修正：应为九宫格
  3: { name:'震', row:1, col:0, dir:'E' },
  4: { name:'巽', row:0, col:0, dir:'SE' },
  5: { name:'中', row:1, col:1, dir:'C' },
  6: { name:'乾', row:2, col:2, dir:'NW' },
  7: { name:'兑', row:1, col:2, dir:'W' },
  8: { name:'艮', row:0, col:2, dir:'NE' },  // 修正为标准洛书
  9: { name:'离', row:0, col:1, dir:'S' }
};

// 飞星顺序（从中宫出发的飞行路径）
const FLY_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4]; // 中→乾→兑→艮→离→坎→坤→震→巽

/**
 * 九宫飞星
 * @param centerStar 中宫星数 (1-9)
 * @param forward 是否顺飞 (true=顺, false=逆)
 * @returns 各宫的星数 {1:x, 2:x, ..., 9:x}
 */
function flyStars(centerStar, forward = true) {
  const result = {};
  const positions = [5, 6, 7, 8, 9, 1, 2, 3, 4]; // 飞行顺序对应的宫位
  
  for (let i = 0; i < 9; i++) {
    let star;
    if (forward) {
      star = ((centerStar - 1 + i) % 9) + 1;
    } else {
      star = ((centerStar - 1 - i + 9) % 9) + 1;
    }
    result[positions[i]] = star;
  }
  
  return result;
}
```

---

## 三、宅盘排法

### 运盘

以建造年份所属之运数入中宫，顺飞九宫。

```javascript
function getYunPan(year) {
  const yun = getCurrentYun(year);
  return flyStars(yun.star, true); // 运盘永远顺飞
}
```

### 山盘与向盘

以坐山和朝向确定山星和向星入中宫，再根据阴阳决定顺逆飞。

```javascript
// 二十四山
const ERSHISI_SHAN = [
  { name:'壬', degree:[337.5, 352.5], gua:'坎', yin:true },
  { name:'子', degree:[352.5, 7.5],   gua:'坎', yin:false },
  { name:'癸', degree:[7.5, 22.5],    gua:'坎', yin:true },
  { name:'丑', degree:[22.5, 37.5],   gua:'艮', yin:false },
  { name:'艮', degree:[37.5, 52.5],   gua:'艮', yin:true },
  { name:'寅', degree:[52.5, 67.5],   gua:'艮', yin:false },
  { name:'甲', degree:[67.5, 82.5],   gua:'震', yin:true },
  { name:'卯', degree:[82.5, 97.5],   gua:'震', yin:false },
  { name:'乙', degree:[97.5, 112.5],  gua:'震', yin:true },
  { name:'辰', degree:[112.5, 127.5], gua:'巽', yin:false },
  { name:'巽', degree:[127.5, 142.5], gua:'巽', yin:true },
  { name:'巳', degree:[142.5, 157.5], gua:'巽', yin:false },
  { name:'丙', degree:[157.5, 172.5], gua:'离', yin:true },
  { name:'午', degree:[172.5, 187.5], gua:'离', yin:false },
  { name:'丁', degree:[187.5, 202.5], gua:'离', yin:true },
  { name:'未', degree:[202.5, 217.5], gua:'坤', yin:false },
  { name:'坤', degree:[217.5, 232.5], gua:'坤', yin:true },
  { name:'申', degree:[232.5, 247.5], gua:'坤', yin:false },
  { name:'庚', degree:[247.5, 262.5], gua:'兑', yin:true },
  { name:'酉', degree:[262.5, 277.5], gua:'兑', yin:false },
  { name:'辛', degree:[277.5, 292.5], gua:'兑', yin:true },
  { name:'戌', degree:[292.5, 307.5], gua:'乾', yin:false },
  { name:'乾', degree:[307.5, 322.5], gua:'乾', yin:true },
  { name:'亥', degree:[322.5, 337.5], gua:'乾', yin:false }
];

/**
 * 排宅盘（山星向星）
 * @param yunNum 运数
 * @param sittingDegree 坐山度数
 */
function getZhaiPan(yunNum, sittingDegree) {
  const facingDegree = (sittingDegree + 180) % 360;
  
  // 找坐山和朝向所在的二十四山
  const sitting = findShan(sittingDegree);
  const facing = findShan(facingDegree);
  
  // 运盘
  const yunPan = flyStars(yunNum, true);
  
  // 山星入中宫：运盘中坐山所在宫位的运星
  const sittingGong = getGongNum(sitting.gua);
  const shanCenter = yunPan[sittingGong];
  
  // 向星入中宫：运盘中朝向所在宫位的运星
  const facingGong = getGongNum(facing.gua);
  const xiangCenter = yunPan[facingGong];
  
  // 判断顺逆飞（三元龙阴阳）
  const shanForward = determineFlyDirection(sitting, shanCenter, yunNum);
  const xiangForward = determineFlyDirection(facing, xiangCenter, yunNum);
  
  const shanPan = flyStars(shanCenter, shanForward);
  const xiangPan = flyStars(xiangCenter, xiangForward);
  
  return { yunPan, shanPan, xiangPan, sitting, facing };
}

function findShan(degree) {
  return ERSHISI_SHAN.find(s => {
    if (s.degree[0] < s.degree[1]) {
      return degree >= s.degree[0] && degree < s.degree[1];
    }
    return degree >= s.degree[0] || degree < s.degree[1]; // 跨0度
  });
}
```

---

## 四、飞星组合断事

### 山星向星组合含义

每个宫位有三个星：运星（底盘）、山星（左上）、向星（右上）。

**山星管人丁健康，向星管财运事业。**

### 旺山旺向（最吉格局）

```
山星当旺到坐方（山位） + 向星当旺到朝向方（向位）
= 丁财两旺

例（九运）：
坐山方山星为9 + 朝向方向星为9 → 旺山旺向
```

### 上山下水（最凶格局）

```
山星当旺到朝向方（星上山=丁星下水）
向星当旺到坐方（星下水=财星上山）
= 损丁破财
```

### 双星到向 / 双星到山

```
双星到向：山星和向星的当旺星都飞到朝向方
→ 向方宜开阔有水，可旺财但丁稍弱

双星到山：两旺星都飞到坐山方  
→ 坐方宜有山有靠，旺丁但财稍弱
```

### 飞星组合速查

| 组合 | 含义(当运) | 含义(失运) |
|------|-----------|-----------|
| 1-1 | 桃花旺·人缘佳 | 耳疾·肾病 |
| 1-6 | 金水相生·利文官 | 头痛·孤独 |
| 2-3 | 斗牛煞·争吵 | 官非·疾病 |
| 2-5 | 二五交加·大凶 | 重病·破大财 |
| 3-2 | 同上 | 口舌·肝病 |
| 4-1 | 文昌旺·利考试 | 桃花劫·色灾 |
| 6-7 | 交剑煞·刀伤 | 盗贼·血光 |
| 6-8 | 财旺·利地产 | 筋骨病 |
| 8-8 | 双八大财·九运余气 | 小儿疾·关节 |
| 9-9 | 九运双旺 | 目疾·火灾 |
| 5-9 | 紫黄毒药·火灾 | 大凶（尤其九运） |

> ⚠️ 飞星组合的吉凶必须结合当运失运判断。同样的组合在不同运中效果可能相反。

---

## 五、年飞星与月飞星

### 年飞星

每年有不同的年飞星入中宫（用于判断当年各方位的吉凶）。

```javascript
function getYearFlyStar(year) {
  // 年飞星公式（逆推）
  // 以2000年为基准，2000年中宫为九紫
  const base = 9; // 2000年中宫星
  const diff = year - 2000;
  const center = ((base - diff % 9) + 9 - 1) % 9 + 1;
  return flyStars(center, true); // 年飞星顺飞
}

// 验证：
// 2024年中宫 = ((9 - 24%9) + 8) % 9 + 1 = ((9-6)+8)%9+1 = 11%9+1 = 3 → 三碧入中
// 2025年中宫 = ((9 - 25%9) + 8) % 9 + 1 = ((9-7)+8)%9+1 = 10%9+1 = 2 → 二黑入中
```

### 近年年飞星中宫

| 年份 | 中宫星 | 注意 |
|------|--------|------|
| 2024 | 三碧 | 是非星入中 |
| 2025 | 二黑 | 病符星入中 |
| 2026 | 一白 | 桃花星入中 |
| 2027 | 九紫 | 喜庆星入中 |
| 2028 | 八白 | 财星入中 |

### 月飞星

```javascript
function getMonthFlyStar(year, month) {
  // 月飞星规律：
  // 子午卯酉年：正月八白入中
  // 辰戌丑未年：正月五黄入中
  // 寅申巳亥年：正月二黑入中
  
  const yearBranch = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(year - 4) % 12];
  
  let janCenter;
  if ('子午卯酉'.includes(yearBranch)) janCenter = 8;
  else if ('辰戌丑未'.includes(yearBranch)) janCenter = 5;
  else janCenter = 2;
  
  // 月飞星逆推
  const center = ((janCenter - (month - 1) % 9) + 9 - 1) % 9 + 1;
  return flyStars(center, true);
}
```

---

## 六、常见风水化解

### 五黄煞化解

五黄飞临的方位为大凶，需用**金**属化泄（土生金→泄五黄土气）。

```
化解方法：
- 六帝铜钱（6枚铜钱→六白金）
- 铜葫芦（金属+葫芦收煞）
- 铜风铃（金属+声波化煞）
- 金属摆件
- 忌动土·忌红色（火生土加重五黄）
```

### 二黑病符化解

```
化解方法：
- 同五黄（用金属化泄）
- 铜葫芦（专门化病气）
- 忌黄色·红色装饰
```

### 三碧争斗星化解

```
化解方法：
- 红色物品（火泄木气）
- 九紫火来克化
- 忌绿色·蓝色（助长木气水生木）
```

---

**← 返回** [风水入门](../reference/fengshui-basics.md)
