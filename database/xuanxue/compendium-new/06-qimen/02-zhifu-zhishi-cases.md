# 奇门遁甲 · 值符值使与四盘实例

> **状态（2026-07-10）**：本文件只保留已验证的拆补转盘排盘结构。旧版简化旬首、值使直接随时干宫、八宫洛书地盘等代码已废止。传统断事案例与用神矩阵为 `not_validated`，不再作为算法输入。

口径：**时家奇门·拆补法·转盘法·中五寄坤二·天禽随天芮**。

---

## 一、先分清三个宫位

| 字段 | 含义 |
|---|---|
| 值符原宫 | 时干支旬首遁干在地盘的宫位 |
| 值符落宫 | 当前时干在地盘的宫位；甲时改用本旬遁干；中五寄坤二 |
| 值使落宫 | 从值使原位按旬内步数在九宫数字序列中顺逆数得出 |

值符落宫和值使落宫不是同一个公式，不能用“门随星一起转”代替。

---

## 二、旬首与遁干

```javascript
const JIA_DUN = {
  '甲子':'戊', '甲戌':'己', '甲申':'庚',
  '甲午':'辛', '甲辰':'壬', '甲寅':'癸'
};

function getXunInfo(hourGZ) {
  const index = JIAZI.indexOf(hourGZ);
  if (index < 0) throw new Error('非法时干支');
  const xunIndex = Math.floor(index / 10);
  const xunHead = JIAZI[xunIndex * 10];
  return {
    xunHead,
    hiddenStem: JIA_DUN[xunHead],
    steps: index % 10
  };
}
```

六种甲时分别遁于戊、己、庚、辛、壬、癸。旧版 `if (hourStem === '甲') searchStem = '戊'` 只适用于甲子旬，已删除。

---

## 三、值符和值使原位

```javascript
function getDutyOrigin(diPan, hourGZ) {
  const xun = getXunInfo(hourGZ);
  const originalPalace = findStemPalace(diPan, xun.hiddenStem);
  const gatePalace = originalPalace === 5 ? 2 : originalPalace;
  return {
    xun,
    originalPalace,
    zhifu: STAR_BASE[originalPalace],
    zhishi: GATE_BASE[gatePalace]
  };
}
```

- 旬首遁干落坎一，值符天蓬、值使休门。
- 旬首遁干落中五，值符天禽；本口径以坤二死门为值使。

---

## 四、值符落宫

```javascript
const actualHourStem = hourStem === '甲'
  ? xun.hiddenStem
  : hourStem;

const rawZhifuDestination = findStemPalace(diPan, actualHourStem);
const zhifuDestination = rawZhifuDestination === 5
  ? 2
  : rawZhifuDestination;
```

九星和天盘干以值符原宫、值符落宫为两个锚点，在八宫几何顺序中保持相对位置旋转。

```javascript
const PALACE_CLOCKWISE = [2, 7, 6, 1, 8, 3, 4, 9];
```

天禽随天芮同宫，并携带中五地盘干；天芮仍携带坤二地盘干。

---

## 五、值使落宫

值使按旬首到当前时干支的步数走九宫数字序列：

```javascript
function getZhishiDestination(origin, steps, dunType) {
  const start = origin === 5 ? 2 : origin;
  const delta = dunType === 'yang' ? steps : -steps;
  const raw = ((start - 1 + delta + 18) % 9) + 1;
  if (raw !== 5) return raw;
  return dunType === 'yang' ? 8 : 2;
}
```

然后从值使落宫开始，按八宫几何顺时针顺序布八门：

```javascript
const GATE_SEQUENCE = ['休门','生门','伤门','杜门','景门','死门','惊门','开门'];
```

旧版把值使直接转到时干地盘宫，导致大量盘面值使和八门整体错位，已废止。

---

## 六、八神

```javascript
const DEITY_SEQUENCE = ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'];
```

- 起点是值符落宫。
- 阳遁沿八宫顺时针排。
- 阴遁沿八宫逆时针排。
- 中五无独立八神。

---

## 七、完整实例

### 输入

`2024-06-15 14:30`

### 起局

| 字段 | 结果 |
|---|---|
| 四柱 | 甲辰年、庚午月、庚戌日、癸未时 |
| 当前节气 | 芒种（2024-06-05 12:09:54 交节） |
| 符头 | 己酉 |
| 三元 | 上元 |
| 阴阳局 | 阳六局 |
| 时旬 | 甲戌旬，甲戌遁己 |
| 值符 | 天柱，原兑七，落坤二 |
| 值使 | 惊门，落兑七 |

### 四盘

| 宫 | 地盘干 | 天盘干 | 九星 | 八门 | 八神 |
|---:|---|---|---|---|---|
| 1 坎 | 壬 | 庚 | 天任 | 休门 | 六合 |
| 2 坤 | 癸 | 己 | 天柱 | 死门 | 值符 |
| 3 震 | 丁 | 丙 | 天辅 | 伤门 | 玄武 |
| 4 巽 | 丙 | 辛 | 天英 | 杜门 | 九地 |
| 5 中 | 乙 | 乙 | 天禽 | 无 | 无 |
| 6 乾 | 戊 | 壬 | 天蓬 | 开门 | 太阴 |
| 7 兑 | 己 | 戊 | 天心 | 惊门 | 螣蛇 |
| 8 艮 | 庚 | 丁 | 天冲 | 生门 | 白虎 |
| 9 离 | 辛 | 癸 | 天芮、天禽同宫 | 景门 | 九天 |

---

## 八、交节边界实例

| 输入 | 节气 | 局 |
|---|---|---|
| 2024-06-05 12:09 | 小满 | 阳二局中元 |
| 2024-06-05 12:10 | 芒种 | 阳三局中元 |
| 2024-06-21 04:50 | 芒种 | 阳三局中元 |
| 2024-06-21 04:51 | 夏至 | 阴三局中元 |

分钟是排盘必需输入。只输入整点会在交节小时内产生不可消除的歧义。

---

## 九、未验证内容

以下旧内容没有因为排盘修复而变成可靠结论：

- “某星等于某疾病、人物、财富或官司角色”。
- 九星、八门、八神的固定吉凶。
- 用神、克应、三奇得使、门迫等解释。
- 求财、婚姻、出行、诉讼、健康、方位和应期判断。

这些内容如需保留，应进入独立的解释层来源审计，不能写回确定性排盘规范。
