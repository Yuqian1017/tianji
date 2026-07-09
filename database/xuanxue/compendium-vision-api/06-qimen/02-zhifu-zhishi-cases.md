# 奇门遁甲 · 值符值使算法补完 + 实战案例

> **难度标签**：🔴专研：排盘算法 | 🟡进阶：断事矩阵·案例

> 补完排盘核心缺环：值符值使确定 → 天盘转法 → 人盘转法 → 神盘布法 → 案例演示。

---

## 一、值符值使的确定

### 核心概念

```
值符 = 当值的九星（天盘的老大）
值使 = 当值的八门（人盘的老大）

确定方法：找到时干（起课时辰的天干）在地盘上的位置 → 
该位置原有的九星 = 值符
该位置原有的八门 = 值使
```

### 算法

```javascript
/**
 * 确定值符值使
 * @param diPan 地盘布局 { 宫号: 奇仪 }
 * @param hourStem 时干
 * @returns { zhifu, zhishi, zhifuGong }
 */
function getZhifuZhishi(diPan, hourStem) {
  // 九星原始位置
  const STAR_BASE = {
    1:'天蓬', 2:'天芮', 3:'天冲', 4:'天辅',
    5:'天禽', 6:'天心', 7:'天柱', 8:'天任', 9:'天英'
  };
  
  // 八门原始位置
  const GATE_BASE = {
    1:'休门', 2:'死门', 3:'伤门', 4:'杜门',
    // 5宫无门
    6:'开门', 7:'惊门', 8:'生门', 9:'景门'
  };
  
  // 甲遁于六仪：甲在哪个仪下面
  const JIA_DUN = {
    '甲':'戊', '乙':'乙', '丙':'丙', '丁':'丁',
    '戊':'戊', '己':'己', '庚':'庚', '辛':'辛', '壬':'壬', '癸':'癸'
  };
  
  // 如果时干是甲，甲隐于戊下，找戊
  let searchStem = hourStem;
  if (hourStem === '甲') searchStem = '戊';
  
  // ⚠️ 更精确的做法：找时干所在的旬首甲对应的六仪
  // 例：甲子时→戊，甲戌时→己，甲申时→庚...
  // 这里简化为直接找时干在地盘上的位置
  
  // 在地盘上找时干所在的宫位
  let zhifuGong = null;
  for (const [gong, qiyi] of Object.entries(diPan)) {
    if (qiyi === searchStem) {
      zhifuGong = parseInt(gong);
      break;
    }
  }
  
  // 值符 = 该宫原有的九星
  const zhifu = STAR_BASE[zhifuGong];
  
  // 值使 = 该宫原有的八门（5宫寄2宫）
  let gateGong = zhifuGong === 5 ? 2 : zhifuGong;
  const zhishi = GATE_BASE[gateGong];
  
  return { zhifu, zhishi, zhifuGong };
}
```

### 旬首甲的精确判定

```javascript
/**
 * 找当前时辰属于哪个旬（六十甲子中的哪个旬首甲）
 * 返回该旬首甲所隐的六仪
 */
const XUNZHONG_LIUYI = {
  '甲子': '戊', '甲戌': '己', '甲申': '庚',
  '甲午': '辛', '甲辰': '壬', '甲寅': '癸'
};

function getXunshouLiuyi(dayStem, dayBranch, hourStem, hourBranch) {
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  
  // 计算时辰在六十甲子中的序号
  const hourStemIdx = stems.indexOf(hourStem);
  const hourBranchIdx = branches.indexOf(hourBranch);
  const hourGanzhiIdx = (hourStemIdx * 6 + hourBranchIdx) % 60; // 简化
  
  // 找旬首：每10个一旬
  const xunIdx = Math.floor(hourGanzhiIdx / 10) * 10;
  const xunBranchIdx = xunIdx % 12;
  const xunShou = '甲' + branches[xunBranchIdx];
  
  return XUNZHONG_LIUYI[xunShou];
}
```

---

## 二、天盘转法（九星排布）

### 转盘法

```javascript
/**
 * 布天盘（转盘法）
 * 值符（当值九星）随时干转到时干所在的宫位
 * 其他八星按原始相对位置跟着转
 */
function layoutTianpan(zhifu, zhifuGong, hourStemGong, dunType) {
  const STAR_ORDER = ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英'];
  const GONG_ORDER = [1, 8, 3, 4, 9, 2, 7, 6]; // 洛书飞行顺序（8宫）
  
  // 值符原始宫位 = zhifuGong
  // 值符要转到 = hourStemGong（时干在地盘的位置）
  
  // 计算转动步数
  const fromIdx = GONG_ORDER.indexOf(zhifuGong === 5 ? 2 : zhifuGong);
  const toIdx = GONG_ORDER.indexOf(hourStemGong === 5 ? 2 : hourStemGong);
  const shift = (toIdx - fromIdx + 8) % 8;
  
  // 所有九星按同样步数转动
  const tianPan = {};
  for (let i = 0; i < 8; i++) {
    const origGong = GONG_ORDER[i];
    const origStar = getStarAtGong(origGong); // 原始九星
    const newGong = GONG_ORDER[(i + shift) % 8];
    tianPan[newGong] = origStar;
  }
  
  // 天禽（5宫之星）寄到2宫
  tianPan[2] = tianPan[2] || '天禽';
  
  return tianPan;
}
```

---

## 三、人盘转法（八门排布）

```javascript
/**
 * 布人盘（八门随值使转）
 * 值使（当值八门）转到时干所在的宫位
 * 其他七门按原始相对位置跟着转
 */
function layoutRenpan(zhishi, zhishiGong, hourStemGong, dunType) {
  const GATE_ORDER = ['休门','死门','伤门','杜门','开门','惊门','生门','景门'];
  const GONG_MAP = { '休门':1, '死门':2, '伤门':3, '杜门':4,
                     '开门':6, '惊门':7, '生门':8, '景门':9 };
  const GONG_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];
  
  const fromIdx = GONG_ORDER.indexOf(GONG_MAP[zhishi]);
  const toIdx = GONG_ORDER.indexOf(hourStemGong === 5 ? 2 : hourStemGong);
  const shift = (toIdx - fromIdx + 8) % 8;
  
  const renPan = {};
  for (let i = 0; i < 8; i++) {
    const origGong = GONG_ORDER[i];
    const origGate = getGateAtGong(origGong);
    const newGong = GONG_ORDER[(i + shift) % 8];
    renPan[newGong] = origGate;
  }
  
  return renPan;
}
```

---

## 四、神盘布法

```javascript
/**
 * 布神盘（八神随值符走）
 * 阳遁：值符所在宫起「值符」，顺时针排八神
 * 阴遁：值符所在宫起「值符」，逆时针排八神
 */
const BASHEN_YANG = ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'];
const BASHEN_YIN  = ['值符','九天','九地','玄武','白虎','六合','太阴','螣蛇'];

function layoutShenpan(zhifuGong_tianpan, dunType) {
  const GONG_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];
  const bashen = dunType === 'yang' ? BASHEN_YANG : BASHEN_YIN;
  
  const startIdx = GONG_ORDER.indexOf(zhifuGong_tianpan === 5 ? 2 : zhifuGong_tianpan);
  
  const shenPan = {};
  for (let i = 0; i < 8; i++) {
    const direction = dunType === 'yang' ? 1 : -1;
    const gongIdx = (startIdx + i * direction + 8) % 8;
    shenPan[GONG_ORDER[gongIdx]] = bashen[i];
  }
  
  return shenPan;
}
```

---

## 五、完整排盘流程（修订版）

```javascript
function qimenFullPaipan(datetime) {
  // 1. 确定阴阳遁 + 局数
  const dunType = getYinYangDun(datetime);
  const jieqi = getCurrentJieqi(datetime);
  const yuan = getSanyuan(jieqi.date, datetime);
  const juNum = JIEQI_JU[dunType][jieqi.name][yuan];
  
  // 2. 布地盘
  const diPan = layoutDipan(juNum, dunType);
  
  // 3. 确定时干及其在地盘的位置
  const hourStem = getHourStem(datetime);
  const hourStemGong = findStemInDipan(hourStem, diPan);
  
  // 4. 确定值符值使
  const { zhifu, zhishi, zhifuGong } = getZhifuZhishi(diPan, hourStem);
  
  // 5. 布天盘
  const tianPan = layoutTianpan(zhifu, zhifuGong, hourStemGong, dunType);
  
  // 6. 布人盘
  const renPan = layoutRenpan(zhishi, zhifuGong, hourStemGong, dunType);
  
  // 7. 布神盘
  const shenPan = layoutShenpan(hourStemGong, dunType);
  
  // 8. 汇总
  return {
    meta: { dunType, juNum, jieqi: jieqi.name, yuan },
    diPan,    // 地盘（三奇六仪）
    tianPan,  // 天盘（九星）
    renPan,   // 人盘（八门）
    shenPan,  // 神盘（八神）
    zhifu, zhishi, zhifuGong
  };
}
```

---

## 六、实战案例

### 案例一：问项目能否成功

**背景**：某人问一个商业项目能否做成。

**排盘结果**（简化展示关键信息）：

```
阳遁三局 · 甲子旬

日干：丙（代表求测人）
时干：庚

关键宫位分析：
- 丙（自己）在离九宫：天英星·景门·螣蛇
- 庚（阻碍/对手）在坎一宫：天蓬星·休门·六合
- 戊（财·项目目标）在震三宫：天冲星·伤门·太阴
```

**断法**：

1. **找自己**：日干丙在离九宫
   - 天英星（中凶）→ 自己方有些虚浮
   - 景门（中性·文章之门）→ 适合文化/创意类项目
   - 螣蛇 → 有虚幻·不踏实的倾向

2. **找目标**：戊（财）在震三宫
   - 天冲星（吉·行动星）→ 项目本身有活力
   - 伤门（凶）→ 但执行中有损伤·受阻
   - 太阴（暗助）→ 有隐藏的帮助

3. **找阻碍**：庚（阻碍·竞争者）在坎一宫
   - 天蓬星（凶）→ 对手手段不太光明
   - 休门（吉）→ 但对手目前很安逸
   - 六合（合作·中介）→ 阻碍可能来自合作方

4. **看奇仪格局**：丙(9宫) + 庚(1宫) → 相隔较远，不直接冲突

**结论**：项目有做头（天冲+太阴），但执行过程会受阻（伤门），自己心态要稳（螣蛇→不要虚浮），注意合作方可能带来的阻碍（庚临六合）。中等偏吉。

### 案例二：问出行方位

**方法**：

```
1. 排当时奇门盘
2. 找三吉门（开门·休门·生门）所在方位
3. 看该方位有无三奇（乙丙丁）加持
4. 避开五黄宫·死门·惊门方位

最佳方位：三吉门 + 三奇 + 吉星 + 吉神
最差方位：死门/惊门 + 庚（阻碍）+ 天芮（病）+ 白虎（凶）
```

### 案例三：问失物方位

```
1. 找值符（权威·重要物品）所在方位 → 失物大致方向
2. 找玄武（盗贼/丢失）所在方位 → 失物可能被移动的方向
3. 看六合（藏匿）所在方位 → 物品被收藏/隐藏的地方
4. 门的状态：
   - 开门 → 还能找到
   - 杜门 → 藏起来了·不容易找
   - 死门 → 找不回了
```

---

## 七、奇门断事速查矩阵

| 问事 | 自己 | 目标 | 阻碍 | 吉 | 凶 |
|------|------|------|------|-----|-----|
| 求财 | 日干 | 戊(财) | 庚 | 生门+戊 | 死门+庚 |
| 求官 | 日干 | 开门+丁 | 庚 | 开门+天心+丁 | 惊门+庚 |
| 婚姻 | 日干(男)·乙(女) | 六合+乙庚 | 庚(阻碍) | 六合方吉 | 白虎方凶 |
| 出行 | 日干 | 开门方位 | 死门方位 | 三奇+三吉门 | 庚+死惊门 |
| 疾病 | 日干 | 天心(医) | 天芮(病) | 天心+开门 | 天芮+死门 |
| 官司 | 日干(原告) | 值符(法官) | 对方(时干) | 值符向我 | 值符向彼 |
| 考试 | 日干 | 天辅+景门 | 庚 | 天辅+景门+丁 | 天柱+杜门 |
