# 天干地支完整数据表

> 纯数据速查。含藏干、合冲刑害破全部关系。

## 十天干

```javascript
const TIANGAN = [
  { gan:'甲', yinyang:'yang', wuxing:'wood', num:1, he:'己', hehua:'earth' },
  { gan:'乙', yinyang:'yin',  wuxing:'wood', num:2, he:'庚', hehua:'metal' },
  { gan:'丙', yinyang:'yang', wuxing:'fire', num:3, he:'辛', hehua:'water' },
  { gan:'丁', yinyang:'yin',  wuxing:'fire', num:4, he:'壬', hehua:'wood' },
  { gan:'戊', yinyang:'yang', wuxing:'earth',num:5, he:'癸', hehua:'fire' },
  { gan:'己', yinyang:'yin',  wuxing:'earth',num:6, he:'甲', hehua:'earth' },
  { gan:'庚', yinyang:'yang', wuxing:'metal',num:7, he:'乙', hehua:'metal' },
  { gan:'辛', yinyang:'yin',  wuxing:'metal',num:8, he:'丙', hehua:'water' },
  { gan:'壬', yinyang:'yang', wuxing:'water',num:9, he:'丁', hehua:'wood' },
  { gan:'癸', yinyang:'yin',  wuxing:'water',num:10,he:'戊', hehua:'fire' }
];

// 天干冲
const TIANGAN_CHONG = [['甲','庚'],['乙','辛'],['丙','壬'],['丁','癸']];
```

## 十二地支

```javascript
const DIZHI = [
  { zhi:'子', yinyang:'yang', wuxing:'water', shengxiao:'鼠', month:11, hour:'23-01', dir:'N',
    canggan:['癸'], canggan_detail:{ben:'癸'} },
  { zhi:'丑', yinyang:'yin',  wuxing:'earth', shengxiao:'牛', month:12, hour:'01-03', dir:'NE',
    canggan:['己','癸','辛'], canggan_detail:{ben:'己',zhong:'癸',yu:'辛'} },
  { zhi:'寅', yinyang:'yang', wuxing:'wood',  shengxiao:'虎', month:1,  hour:'03-05', dir:'ENE',
    canggan:['甲','丙','戊'], canggan_detail:{ben:'甲',zhong:'丙',yu:'戊'} },
  { zhi:'卯', yinyang:'yin',  wuxing:'wood',  shengxiao:'兔', month:2,  hour:'05-07', dir:'E',
    canggan:['乙'], canggan_detail:{ben:'乙'} },
  { zhi:'辰', yinyang:'yang', wuxing:'earth', shengxiao:'龙', month:3,  hour:'07-09', dir:'ESE',
    canggan:['戊','乙','癸'], canggan_detail:{ben:'戊',zhong:'乙',yu:'癸'} },
  { zhi:'巳', yinyang:'yin',  wuxing:'fire',  shengxiao:'蛇', month:4,  hour:'09-11', dir:'SSE',
    canggan:['丙','庚','戊'], canggan_detail:{ben:'丙',zhong:'庚',yu:'戊'} },
  { zhi:'午', yinyang:'yang', wuxing:'fire',  shengxiao:'马', month:5,  hour:'11-13', dir:'S',
    canggan:['丁','己'], canggan_detail:{ben:'丁',zhong:'己'} },
  { zhi:'未', yinyang:'yin',  wuxing:'earth', shengxiao:'羊', month:6,  hour:'13-15', dir:'SSW',
    canggan:['己','丁','乙'], canggan_detail:{ben:'己',zhong:'丁',yu:'乙'} },
  { zhi:'申', yinyang:'yang', wuxing:'metal', shengxiao:'猴', month:7,  hour:'15-17', dir:'WSW',
    canggan:['庚','壬','戊'], canggan_detail:{ben:'庚',zhong:'壬',yu:'戊'} },
  { zhi:'酉', yinyang:'yin',  wuxing:'metal', shengxiao:'鸡', month:8,  hour:'17-19', dir:'W',
    canggan:['辛'], canggan_detail:{ben:'辛'} },
  { zhi:'戌', yinyang:'yang', wuxing:'earth', shengxiao:'狗', month:9,  hour:'19-21', dir:'WNW',
    canggan:['戊','辛','丁'], canggan_detail:{ben:'戊',zhong:'辛',yu:'丁'} },
  { zhi:'亥', yinyang:'yin',  wuxing:'water', shengxiao:'猪', month:10, hour:'21-23', dir:'NNW',
    canggan:['壬','甲'], canggan_detail:{ben:'壬',zhong:'甲'} }
];
```

## 地支关系完整数据

```javascript
const DIZHI_RELATIONS = {
  // 六合
  liuhe: [
    {pair:['子','丑'], hua:'earth'},
    {pair:['寅','亥'], hua:'wood'},
    {pair:['卯','戌'], hua:'fire'},
    {pair:['辰','酉'], hua:'metal'},
    {pair:['巳','申'], hua:'water'},
    {pair:['午','未'], hua:'fire'}
  ],
  
  // 三合
  sanhe: [
    {members:['申','子','辰'], hua:'water', changsheng:'申', diwang:'子', muku:'辰'},
    {members:['亥','卯','未'], hua:'wood',  changsheng:'亥', diwang:'卯', muku:'未'},
    {members:['寅','午','戌'], hua:'fire',  changsheng:'寅', diwang:'午', muku:'戌'},
    {members:['巳','酉','丑'], hua:'metal', changsheng:'巳', diwang:'酉', muku:'丑'}
  ],
  
  // 三会
  sanhui: [
    {members:['寅','卯','辰'], hua:'wood',  dir:'东方'},
    {members:['巳','午','未'], hua:'fire',  dir:'南方'},
    {members:['申','酉','戌'], hua:'metal', dir:'西方'},
    {members:['亥','子','丑'], hua:'water', dir:'北方'}
  ],
  
  // 六冲
  liuchong: [
    {pair:['子','午'], type:'水火冲'},
    {pair:['丑','未'], type:'土土冲'},
    {pair:['寅','申'], type:'木金冲'},
    {pair:['卯','酉'], type:'木金冲'},
    {pair:['辰','戌'], type:'土土冲'},
    {pair:['巳','亥'], type:'火水冲'}
  ],
  
  // 六害
  liuhai: [
    {pair:['子','未']},
    {pair:['丑','午']},
    {pair:['寅','巳']},
    {pair:['卯','辰']},
    {pair:['申','亥']},
    {pair:['酉','戌']}
  ],
  
  // 三刑
  sanxing: [
    {members:['寅','巳','申'], type:'无恩之刑', note:'恩将仇报'},
    {members:['丑','戌','未'], type:'持势之刑', note:'恃宠而骄'},
    {pair:['子','卯'], type:'无礼之刑', note:'无礼无仪'}
  ],
  
  // 自刑
  zixing: ['辰','午','酉','亥'],
  
  // 相破
  po: [
    {pair:['子','酉']}, {pair:['丑','辰']}, {pair:['寅','亥']},
    {pair:['卯','午']}, {pair:['巳','申']}, {pair:['未','戌']}
  ]
};
```

## 空亡表

```javascript
const KONGWANG_TABLE = {
  '甲子': ['戌','亥'], '甲戌': ['申','酉'], '甲申': ['午','未'],
  '甲午': ['辰','巳'], '甲辰': ['寅','卯'], '甲寅': ['子','丑']
};

// 通用计算
function getKongWang(dayStem, dayBranch) {
  const si = '甲乙丙丁戊己庚辛壬癸'.indexOf(dayStem);
  const bi = '子丑寅卯辰巳午未申酉戌亥'.indexOf(dayBranch);
  const branches = '子丑寅卯辰巳午未申酉戌亥';
  const start = (bi - si + 12) % 12;
  return [branches[(start+10)%12], branches[(start+11)%12]];
}
```

## 地支半合·暗合·拱合

```javascript
// 半合（三合局缺一支）
const BANHE = [
  // 水局半合
  {pair:['申','子'], hua:'water', missing:'辰', type:'生地半合'},
  {pair:['子','辰'], hua:'water', missing:'申', type:'墓地半合'},
  // 木局半合
  {pair:['亥','卯'], hua:'wood', missing:'未', type:'生地半合'},
  {pair:['卯','未'], hua:'wood', missing:'亥', type:'墓地半合'},
  // 火局半合
  {pair:['寅','午'], hua:'fire', missing:'戌', type:'生地半合'},
  {pair:['午','戌'], hua:'fire', missing:'寅', type:'墓地半合'},
  // 金局半合
  {pair:['巳','酉'], hua:'metal', missing:'丑', type:'生地半合'},
  {pair:['酉','丑'], hua:'metal', missing:'巳', type:'墓地半合'}
];
// 生地半合力量 > 墓地半合

// 地支暗合（藏干相合）
const ANHE = [
  {pair:['寅','丑'], note:'寅藏甲+丑藏己=甲己合·寅藏丙+丑藏辛=丙辛合'},
  {pair:['卯','申'], note:'卯藏乙+申藏庚=乙庚合'},
  {pair:['巳','申'], note:'巳藏丙+申藏辛=丙辛合（也是六合）'},
  {pair:['午','亥'], note:'午藏丁+亥藏壬=丁壬合'},
];

// 天干五合
const TIANHE = {
  '甲己':'土', '乙庚':'金', '丙辛':'水', '丁壬':'木', '戊癸':'火'
};

// 综合关系判断
function getAllRelations(branch1, branch2) {
  const rels = [];
  // 检查六合
  for (const h of DIZHI.liuhe) {
    if (h.pair.includes(branch1) && h.pair.includes(branch2))
      rels.push({type:'六合', hua:h.hua});
  }
  // 检查六冲
  for (const c of DIZHI.liuchong) {
    if (c.pair.includes(branch1) && c.pair.includes(branch2))
      rels.push({type:'六冲', detail:c.type});
  }
  // 检查半合
  for (const b of BANHE) {
    if (b.pair.includes(branch1) && b.pair.includes(branch2))
      rels.push({type:'半合', hua:b.hua, detail:b.type});
  }
  // 检查六害
  for (const h of DIZHI.liuhai) {
    if (h.pair.includes(branch1) && h.pair.includes(branch2))
      rels.push({type:'六害'});
  }
  // 检查暗合
  for (const a of ANHE) {
    if (a.pair.includes(branch1) && a.pair.includes(branch2))
      rels.push({type:'暗合', note:a.note});
  }
  return rels;
}
```
