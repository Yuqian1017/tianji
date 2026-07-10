# 奇门遁甲排盘算法规格

> **LEGACY / NON-CANONICAL（2026-07-10）**：此近似副本保留旧实现证据，其中三元、地盘和值使代码已知错误。不要用于实现或教学答案；规范入口为 `database/xuanxue/compendium-new/reference/qimen-algorithm.md` 和 `database/qimen/qimen-core.json`。

> ⚠️ **CC注意**：奇门排盘涉及阴阳遁判断、三元确定、局数查表、四盘排布，每一步都可能出错。建议在产品A的Phase A3最后再做。值符值使算法的补完在 06-qimen/02-zhifu-zhishi-cases.md。

> 纯技术参考。以拆补法·转盘为基准。

---

## 一、核心数据

### 九宫

```javascript
const JIUGONG = [
  { num: 1, name: '坎', dir: 'N',  wuxing: 'water', branch: '子' },
  { num: 2, name: '坤', dir: 'SW', wuxing: 'earth', branch: '未申' },
  { num: 3, name: '震', dir: 'E',  wuxing: 'wood',  branch: '卯' },
  { num: 4, name: '巽', dir: 'SE', wuxing: 'wood',  branch: '辰巳' },
  { num: 5, name: '中', dir: 'C',  wuxing: 'earth', branch: '' }, // 寄坤二宫
  { num: 6, name: '乾', dir: 'NW', wuxing: 'metal', branch: '戌亥' },
  { num: 7, name: '兑', dir: 'W',  wuxing: 'metal', branch: '酉' },
  { num: 8, name: '艮', dir: 'NE', wuxing: 'earth', branch: '丑寅' },
  { num: 9, name: '离', dir: 'S',  wuxing: 'fire',  branch: '午' }
];

// 九宫飞星顺序（洛书轨迹）
const LUOSHU_ORDER = [1, 8, 3, 4, 9, 2, 7, 6]; // 实际使用8宫
```

### 九星

```javascript
const JIUXING = [
  { name: '天蓬', wuxing: 'water', base: 1, jixiong: '凶' },
  { name: '天芮', wuxing: 'earth', base: 2, jixiong: '凶' },
  { name: '天冲', wuxing: 'wood',  base: 3, jixiong: '吉' },
  { name: '天辅', wuxing: 'wood',  base: 4, jixiong: '吉' },
  { name: '天禽', wuxing: 'earth', base: 5, jixiong: '中' }, // 寄坤二
  { name: '天心', wuxing: 'metal', base: 6, jixiong: '吉' },
  { name: '天柱', wuxing: 'metal', base: 7, jixiong: '凶' },
  { name: '天任', wuxing: 'earth', base: 8, jixiong: '吉' },
  { name: '天英', wuxing: 'fire',  base: 9, jixiong: '中凶' }
];
```

### 八门

```javascript
const BAMEN = [
  { name: '休门', wuxing: 'water', base: 1, jixiong: '吉' },
  { name: '死门', wuxing: 'earth', base: 2, jixiong: '凶' },
  { name: '伤门', wuxing: 'wood',  base: 3, jixiong: '凶' },
  { name: '杜门', wuxing: 'wood',  base: 4, jixiong: '中' },
  // 中五宫无门
  { name: '开门', wuxing: 'metal', base: 6, jixiong: '吉' },
  { name: '惊门', wuxing: 'metal', base: 7, jixiong: '凶' },
  { name: '生门', wuxing: 'earth', base: 8, jixiong: '吉' },
  { name: '景门', wuxing: 'fire',  base: 9, jixiong: '中' }
];
```

### 八神

```javascript
const BASHEN = {
  yang: ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'], // 阳遁顺排
  yin:  ['值符','九天','九地','玄武','白虎','六合','太阴','螣蛇']  // 阴遁逆排
};
```

### 三奇六仪

```javascript
const SANQI_LIUYI = {
  // 排列顺序（阳遁正序，阴遁逆序）
  order: ['戊','己','庚','辛','壬','癸','丁','丙','乙'],
  // 甲遁于六仪
  jiaDun: {
    '戊': '甲子', '己': '甲戌', '庚': '甲申',
    '辛': '甲午', '壬': '甲辰', '癸': '甲寅'
  },
  // 三奇
  sanqi: { '乙': '日奇', '丙': '月奇', '丁': '星奇' }
};
```

---

## 二、节气与局数对应

### 阳遁九局（冬至后）

| 节气 | 上元 | 中元 | 下元 |
|------|------|------|------|
| 冬至 | 1局 | 7局 | 4局 |
| 小寒 | 2局 | 8局 | 5局 |
| 大寒 | 3局 | 9局 | 6局 |
| 立春 | 8局 | 5局 | 2局 |
| 雨水 | 9局 | 6局 | 3局 |
| 惊蛰 | 1局 | 7局 | 4局 |
| 春分 | 3局 | 9局 | 6局 |
| 清明 | 4局 | 1局 | 7局 |
| 谷雨 | 5局 | 2局 | 8局 |
| 立夏 | 4局 | 1局 | 7局 |
| 小满 | 5局 | 2局 | 8局 |
| 芒种 | 6局 | 3局 | 9局 |

### 阴遁九局（夏至后）

| 节气 | 上元 | 中元 | 下元 |
|------|------|------|------|
| 夏至 | 9局 | 3局 | 6局 |
| 小暑 | 8局 | 2局 | 5局 |
| 大暑 | 7局 | 1局 | 4局 |
| 立秋 | 2局 | 5局 | 8局 |
| 处暑 | 1局 | 4局 | 7局 |
| 白露 | 9局 | 3局 | 6局 |
| 秋分 | 7局 | 1局 | 4局 |
| 寒露 | 6局 | 9局 | 3局 |
| 霜降 | 5局 | 8局 | 2局 |
| 立冬 | 6局 | 9局 | 3局 |
| 小雪 | 5局 | 8局 | 2局 |
| 大雪 | 4局 | 7局 | 1局 |

```javascript
const JIEQI_JU = {
  yang: { // 阳遁
    '冬至': [1,7,4], '小寒': [2,8,5], '大寒': [3,9,6],
    '立春': [8,5,2], '雨水': [9,6,3], '惊蛰': [1,7,4],
    '春分': [3,9,6], '清明': [4,1,7], '谷雨': [5,2,8],
    '立夏': [4,1,7], '小满': [5,2,8], '芒种': [6,3,9]
  },
  yin: { // 阴遁
    '夏至': [9,3,6], '小暑': [8,2,5], '大暑': [7,1,4],
    '立秋': [2,5,8], '处暑': [1,4,7], '白露': [9,3,6],
    '秋分': [7,1,4], '寒露': [6,9,3], '霜降': [5,8,2],
    '立冬': [6,9,3], '小雪': [5,8,2], '大雪': [4,7,1]
  }
};
```

### 三元确定（拆补法）

```javascript
/**
 * 拆补法定三元
 * 每个节气15天左右，以甲/己日为节点分上中下三元
 * 上元：节气后第1个甲或己日起5天
 * 中元：第2个甲或己日起5天
 * 下元：第3个甲或己日起5天
 */
function getSanyuan(jieqiDate, targetDate) {
  // 找节气后的甲/己日
  // 简化：计算目标日到节气日的天数差，除以5取元
  const diffDays = daysBetween(jieqiDate, targetDate);
  
  // 拆补法需要精确计算甲己日，此处简化
  if (diffDays < 5) return 0; // 上元
  if (diffDays < 10) return 1; // 中元
  return 2; // 下元
}
```

---

## 三、排盘流程

```javascript
function qimenPaipan(datetime) {
  // 1. 确定阴阳遁
  const dunType = getYinYangDun(datetime); // 'yang' or 'yin'
  
  // 2. 确定节气和局数
  const jieqi = getCurrentJieqi(datetime);
  const yuan = getSanyuan(jieqi.date, datetime);
  const juNum = JIEQI_JU[dunType][jieqi.name][yuan];
  
  // 3. 布地盘（三奇六仪）
  const diPan = layoutDipan(juNum, dunType);
  
  // 4. 确定值符值使
  const { zhifu, zhishi } = getZhifuZhishi(datetime, diPan);
  
  // 5. 布天盘（九星随值符转）
  const tianPan = layoutTianpan(zhifu, datetime, dunType);
  
  // 6. 布人盘（八门随值使转）
  const renPan = layoutRenpan(zhishi, datetime, dunType);
  
  // 7. 布神盘（八神）
  const shenPan = layoutShenpan(zhifu, dunType);
  
  return { diPan, tianPan, renPan, shenPan, juNum, dunType };
}
```

### 布地盘

```javascript
function layoutDipan(juNum, dunType) {
  const order = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];
  const gongs = [1,2,3,4,5,6,7,8,9]; // 洛书宫位
  
  // 起始位置：局数对应的宫位
  // 阳遁从juNum宫起「戊」，顺排
  // 阴遁从juNum宫起「戊」，逆排
  
  const dipan = {};
  const luoshuSeq = [1,8,3,4,9,2,7,6]; // 8宫飞星顺序（去掉中5）
  
  // 找juNum在飞星序列中的位置
  const startIdx = luoshuSeq.indexOf(juNum);
  
  for (let i = 0; i < 9; i++) {
    let gongIdx;
    if (dunType === 'yang') {
      gongIdx = luoshuSeq[(startIdx + i) % 8];
    } else {
      gongIdx = luoshuSeq[(startIdx - i + 8) % 8];
    }
    dipan[gongIdx] = order[i];
  }
  
  return dipan;
}
```

---

## 四、奇门格局数据

### 吉格

```javascript
const JI_GE = [
  { tian: '乙', di: '丙', name: '奇仪相佐', desc: '百事大吉' },
  { tian: '乙', di: '丁', name: '奇仪相佐', desc: '百事吉' },
  { tian: '丙', di: '丁', name: '星月相照', desc: '利谋略' },
  { tian: '乙', di: '己', name: '日奇入地', desc: '事可谋' },
  { tian: '丙', di: '戊', name: '月奇入地', desc: '利财利行' },
  { tian: '丁', di: '戊', name: '星奇入地', desc: '贵人相助' },
  // 三奇得使
  { special: '乙临开门', name: '乙奇得使', desc: '大吉' },
  { special: '丙临休门', name: '丙奇得使', desc: '大吉' },
  { special: '丁临生门', name: '丁奇得使', desc: '大吉' },
  // 门迫
  { special: '开门在坎宫(金生水)', name: '门生宫', desc: '吉' },
];

const XIONG_GE = [
  { tian: '庚', di: '庚', name: '太白同宫', desc: '大凶' },
  { tian: '庚', di: '丙', name: '荧入太白', desc: '凶·被人告' },
  { tian: '丙', di: '庚', name: '太白入荧', desc: '凶·刑狱' },
  { tian: '庚', di: '癸', name: '大格', desc: '行事受阻' },
  { tian: '癸', di: '庚', name: '小格', desc: '事有阻碍' },
  { tian: '庚', di: '壬', name: '上格', desc: '不利行事' },
  { tian: '壬', di: '庚', name: '下格', desc: '较凶' },
  { tian: '辛', di: '壬', name: '入狱自刑', desc: '忧患' },
  { tian: '癸', di: '辛', name: '网盖天牢', desc: '凶·被困' },
  { tian: '辛', di: '癸', name: '天牢华盖', desc: '官灾' },
];
```

### 八门克应

```javascript
const MEN_KEYING = {
  '开门': {
    '临乙': '大吉·万事如意',
    '临丙': '吉·外出有利',
    '临丁': '吉·贵人相助',
    '临庚': '凶·口舌纷争',
    '临壬': '中·出行遇水',
    '临癸': '凶·暗昧不明'
  },
  '生门': {
    '临乙': '大吉·财喜双至',
    '临丁': '吉·贵人引荐',
    '临庚': '凶·求财受阻',
  },
  '休门': {
    '临乙': '吉·安逸',
    '临丙': '大吉·贵人',
    '临庚': '不吉·休息被扰'
  }
};
```

---

## 五、奇门用神速查

```javascript
const QIMEN_YONGSHEN = {
  '求财':   { star: '天任', gate: '生门', qi: '戊', desc: '生门+戊=财' },
  '求官':   { star: '天心', gate: '开门', qi: '丁', desc: '开门+丁=官贵' },
  '婚姻':   { star: null, gate: null, qi: '乙+庚', desc: '乙庚合=阴阳相合' },
  '出行':   { star: null, gate: '开门', qi: '乙/丙/丁', desc: '三吉门+三奇' },
  '疾病':   { star: '天芮', gate: '死门', qi: null, desc: '芮星=病星，天心=医药' },
  '诉讼':   { star: null, gate: '开门', qi: '值符', desc: '开门=法官，值符=权威' },
  '方位':   { star: null, gate: '开/休/生', qi: '乙/丙/丁', desc: '三吉门三奇所在方位可往' },
  '藏匿':   { star: null, gate: '杜门', qi: null, desc: '杜门=藏匿不出' },
  '考试':   { star: '天辅', gate: '景门', qi: '丁', desc: '天辅=文星，景门=文章' },
};
```
