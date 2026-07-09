# 八字排盘完整算法规格

> ⚠️ **CC注意**：日柱计算是最大难点——无公式，必须查表或用基准日推算。基准日方案见 APP-SPEC.md 第十一章。实现后务必用已知名人生辰验证四柱正确性。

> 纯技术参考，供 Claude Code 开发八字排盘工具时直接引用。

## 核心数据

### 天干数据

```javascript
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const STEM_WUXING = { '甲':'wood','乙':'wood','丙':'fire','丁':'fire','戊':'earth','己':'earth','庚':'metal','辛':'metal','壬':'water','癸':'water' };
const STEM_YINYANG = { '甲':'yang','乙':'yin','丙':'yang','丁':'yin','戊':'yang','己':'yin','庚':'yang','辛':'yin','壬':'yang','癸':'yin' };
```

### 地支数据

```javascript
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const HIDDEN_STEMS = {
  '子': ['癸'],
  '丑': ['己','癸','辛'],
  '寅': ['甲','丙','戊'],
  '卯': ['乙'],
  '辰': ['戊','乙','癸'],
  '巳': ['丙','庚','戊'],
  '午': ['丁','己'],
  '未': ['己','丁','乙'],
  '申': ['庚','壬','戊'],
  '酉': ['辛'],
  '戌': ['戊','辛','丁'],
  '亥': ['壬','甲']
};
```

### 十神计算

```javascript
function getShishen(dayStem, otherStem) {
  const di = STEMS.indexOf(dayStem);
  const oi = STEMS.indexOf(otherStem);
  const samePolarity = (di % 2) === (oi % 2);
  const elementDiff = (Math.floor(oi/2) - Math.floor(di/2) + 5) % 5;
  
  const map = {
    0: samePolarity ? '比肩' : '劫财',
    1: samePolarity ? '食神' : '伤官',
    2: samePolarity ? '偏财' : '正财',
    3: samePolarity ? '七杀' : '正官',
    4: samePolarity ? '偏印' : '正印'
  };
  return map[elementDiff];
}
```

## 排盘算法

### 年柱

```javascript
function yearPillar(year) {
  // ⚠️ 需结合立春精确时间判断
  return { stem: STEMS[(year-4) % 10], branch: BRANCHES[(year-4) % 12] };
}
```

### 月柱

```javascript
// 节气分月表（月支固定，月干由年干推）
const MONTH_BRANCHES = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
const JIEQI_MONTHS = [
  {name:'立春', month:0}, {name:'惊蛰', month:1}, {name:'清明', month:2},
  {name:'立夏', month:3}, {name:'芒种', month:4}, {name:'小暑', month:5},
  {name:'立秋', month:6}, {name:'白露', month:7}, {name:'寒露', month:8},
  {name:'立冬', month:9}, {name:'大雪', month:10}, {name:'小寒', month:11}
];

function monthPillar(yearStem, monthIdx) {
  // monthIdx: 0=寅月 ... 11=丑月
  const startStem = (STEMS.indexOf(yearStem) % 5) * 2 + 2;
  return {
    stem: STEMS[(startStem + monthIdx) % 10],
    branch: MONTH_BRANCHES[monthIdx]
  };
}
```

### 日柱

```javascript
// 基准日：2000-01-01 = 甲子日 (甲=0, 子=0) → 干支序号0
// ⚠️ 生产环境应使用经过验证的万年历数据库

function dayPillar(year, month, day) {
  const base = new Date(2000, 0, 1);
  const target = new Date(year, month - 1, day);
  const diff = Math.floor((target - base) / 86400000);
  const idx = ((diff % 60) + 60) % 60;
  return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12] };
}
```

### 时柱

```javascript
function hourPillar(dayStem, hour) {
  const branchIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  const startStem = (STEMS.indexOf(dayStem) % 5) * 2;
  return {
    stem: STEMS[(startStem + branchIdx) % 10],
    branch: BRANCHES[branchIdx]
  };
}
```

## 大运排法

```javascript
function getDayun(yearStem, monthStem, monthBranch, gender) {
  // gender: 'male' or 'female'
  const yearYang = STEMS.indexOf(yearStem) % 2 === 0; // 阳年
  const isMale = gender === 'male';
  const forward = (yearYang && isMale) || (!yearYang && !isMale);
  
  const step = forward ? 1 : -1;
  const si = STEMS.indexOf(monthStem);
  const bi = BRANCHES.indexOf(monthBranch);
  
  return Array.from({length: 8}, (_, i) => ({
    stem: STEMS[((si + (i+1)*step) % 10 + 10) % 10],
    branch: BRANCHES[((bi + (i+1)*step) % 12 + 12) % 12],
    startAge: null // 需另算起运年龄
  }));
}
```

## 天干五合

```javascript
const STEM_COMBINE = [
  { pair: ['甲','己'], hua: 'earth' },
  { pair: ['乙','庚'], hua: 'metal' },
  { pair: ['丙','辛'], hua: 'water' },
  { pair: ['丁','壬'], hua: 'wood' },
  { pair: ['戊','癸'], hua: 'fire' }
];
```

## 地支关系（完整）

```javascript
const BRANCH_RELATIONS = {
  liuhe:  [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']],
  liuchong: [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']],
  sanhe: [
    { members:['申','子','辰'], hua:'water' },
    { members:['亥','卯','未'], hua:'wood' },
    { members:['寅','午','戌'], hua:'fire' },
    { members:['巳','酉','丑'], hua:'metal' }
  ],
  sanhui: [
    { members:['寅','卯','辰'], hua:'wood' },
    { members:['巳','午','未'], hua:'fire' },
    { members:['申','酉','戌'], hua:'metal' },
    { members:['亥','子','丑'], hua:'water' }
  ],
  liuhai: [['子','未'],['丑','午'],['寅','巳'],['卯','辰'],['申','亥'],['酉','戌']],
  sanxing: [
    { members:['寅','巳','申'], type:'无恩之刑' },
    { members:['丑','戌','未'], type:'持势之刑' },
    { members:['子','卯'], type:'无礼之刑' },
  ],
  zixing: ['辰','午','酉','亥'],
  po: [['子','酉'],['丑','辰'],['寅','亥'],['卯','午'],['巳','申'],['未','戌']]
};
```

## 纳音五行

```javascript
const NAYIN = {
  '甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火',
  '戊辰':'大林木','己巳':'大林木','庚午':'路旁土','辛未':'路旁土',
  '壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火',
  '丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土',
  '庚辰':'白蜡金','辛巳':'白蜡金','壬午':'杨柳木','癸未':'杨柳木',
  '甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',
  '戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木',
  '壬辰':'长流水','癸巳':'长流水','甲午':'沙中金','乙未':'沙中金',
  '丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',
  '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金',
  '甲辰':'覆灯火','乙巳':'覆灯火','丙午':'天河水','丁未':'天河水',
  '戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金',
  '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水',
  '丙辰':'沙中土','丁巳':'沙中土','戊午':'天上火','己未':'天上火',
  '庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'
};
```
