# 六十四卦速查表

> 纯数据。按京房八宫序排列，含纳甲、世应、五行。

## 查询方式：上卦+下卦 → 卦名

```javascript
const GUA_LOOKUP = {
  '乾乾':'乾为天','乾巽':'天风姤','乾艮':'天山遁','乾坤':'天地否',
  '巽坤':'风地观','艮坤':'山地剥','离坤':'火地晋','离乾':'火天大有',
  '兑兑':'兑为泽','兑坎':'泽水困','兑坤':'泽地萃','兑艮':'泽山咸',
  '坎艮':'水山蹇','坤艮':'地山谦','震艮':'雷山小过','震兑':'雷泽归妹',
  '离离':'离为火','离艮':'火山旅','离巽':'火风鼎','离坎':'火水未济',
  '艮坎':'山水蒙','巽坎':'风水涣','乾坎':'天水讼','乾离':'天火同人',
  '震震':'震为雷','震坤':'雷地豫','震坎':'雷水解','震巽':'雷风恒',
  '坤巽':'地风升','坎巽':'水风井','兑巽':'泽风大过','兑震':'泽雷随',
  '巽巽':'巽为风','巽乾':'风天小畜','巽离':'风火家人','巽震':'风雷益',
  '乾震':'天雷无妄','离震':'火雷噬嗑','艮震':'山雷颐','艮巽':'山风蛊',
  '坎坎':'坎为水','坎兑':'水泽节','坎震':'水雷屯','坎离':'水火既济',
  '兑离':'泽火革','震离':'雷火丰','坤离':'地火明夷','坤坎':'地水师',
  '艮艮':'艮为山','艮离':'山火贲','艮乾':'山天大畜','艮兑':'山泽损',
  '离兑':'火泽睽','乾兑':'天泽履','巽兑':'风泽中孚','巽艮':'风山渐',
  '坤坤':'坤为地','坤震':'地雷复','坤兑':'地泽临','坤乾':'地天泰',
  '震乾':'雷天大壮','兑乾':'泽天夬','坎乾':'水天需','坎坤':'水地比'
};
```

## 八宫归属速查

```javascript
// 卦名 → { 宫, 五行, 世爻位, 应爻位, 类型 }
const GUA_PALACE = {
  '乾为天':   {palace:'乾',wuxing:'metal',world:6,response:3,type:'本宫'},
  '天风姤':   {palace:'乾',wuxing:'metal',world:1,response:4,type:'一世'},
  '天山遁':   {palace:'乾',wuxing:'metal',world:2,response:5,type:'二世'},
  '天地否':   {palace:'乾',wuxing:'metal',world:3,response:6,type:'三世'},
  '风地观':   {palace:'乾',wuxing:'metal',world:4,response:1,type:'四世'},
  '山地剥':   {palace:'乾',wuxing:'metal',world:5,response:2,type:'五世'},
  '火地晋':   {palace:'乾',wuxing:'metal',world:4,response:1,type:'游魂'},
  '火天大有': {palace:'乾',wuxing:'metal',world:3,response:6,type:'归魂'},
  
  '兑为泽':   {palace:'兑',wuxing:'metal',world:6,response:3,type:'本宫'},
  '泽水困':   {palace:'兑',wuxing:'metal',world:1,response:4,type:'一世'},
  '泽地萃':   {palace:'兑',wuxing:'metal',world:2,response:5,type:'二世'},
  '泽山咸':   {palace:'兑',wuxing:'metal',world:3,response:6,type:'三世'},
  '水山蹇':   {palace:'兑',wuxing:'metal',world:4,response:1,type:'四世'},
  '地山谦':   {palace:'兑',wuxing:'metal',world:5,response:2,type:'五世'},
  '雷山小过': {palace:'兑',wuxing:'metal',world:4,response:1,type:'游魂'},
  '雷泽归妹': {palace:'兑',wuxing:'metal',world:3,response:6,type:'归魂'},
  
  '离为火':   {palace:'离',wuxing:'fire',world:6,response:3,type:'本宫'},
  '火山旅':   {palace:'离',wuxing:'fire',world:1,response:4,type:'一世'},
  '火风鼎':   {palace:'离',wuxing:'fire',world:2,response:5,type:'二世'},
  '火水未济': {palace:'离',wuxing:'fire',world:3,response:6,type:'三世'},
  '山水蒙':   {palace:'离',wuxing:'fire',world:4,response:1,type:'四世'},
  '风水涣':   {palace:'离',wuxing:'fire',world:5,response:2,type:'五世'},
  '天水讼':   {palace:'离',wuxing:'fire',world:4,response:1,type:'游魂'},
  '天火同人': {palace:'离',wuxing:'fire',world:3,response:6,type:'归魂'},
  
  '震为雷':   {palace:'震',wuxing:'wood',world:6,response:3,type:'本宫'},
  '雷地豫':   {palace:'震',wuxing:'wood',world:1,response:4,type:'一世'},
  '雷水解':   {palace:'震',wuxing:'wood',world:2,response:5,type:'二世'},
  '雷风恒':   {palace:'震',wuxing:'wood',world:3,response:6,type:'三世'},
  '地风升':   {palace:'震',wuxing:'wood',world:4,response:1,type:'四世'},
  '水风井':   {palace:'震',wuxing:'wood',world:5,response:2,type:'五世'},
  '泽风大过': {palace:'震',wuxing:'wood',world:4,response:1,type:'游魂'},
  '泽雷随':   {palace:'震',wuxing:'wood',world:3,response:6,type:'归魂'},
  
  '巽为风':   {palace:'巽',wuxing:'wood',world:6,response:3,type:'本宫'},
  '风天小畜': {palace:'巽',wuxing:'wood',world:1,response:4,type:'一世'},
  '风火家人': {palace:'巽',wuxing:'wood',world:2,response:5,type:'二世'},
  '风雷益':   {palace:'巽',wuxing:'wood',world:3,response:6,type:'三世'},
  '天雷无妄': {palace:'巽',wuxing:'wood',world:4,response:1,type:'四世'},
  '火雷噬嗑': {palace:'巽',wuxing:'wood',world:5,response:2,type:'五世'},
  '山雷颐':   {palace:'巽',wuxing:'wood',world:4,response:1,type:'游魂'},
  '山风蛊':   {palace:'巽',wuxing:'wood',world:3,response:6,type:'归魂'},
  
  '坎为水':   {palace:'坎',wuxing:'water',world:6,response:3,type:'本宫'},
  '水泽节':   {palace:'坎',wuxing:'water',world:1,response:4,type:'一世'},
  '水雷屯':   {palace:'坎',wuxing:'water',world:2,response:5,type:'二世'},
  '水火既济': {palace:'坎',wuxing:'water',world:3,response:6,type:'三世'},
  '泽火革':   {palace:'坎',wuxing:'water',world:4,response:1,type:'四世'},
  '雷火丰':   {palace:'坎',wuxing:'water',world:5,response:2,type:'五世'},
  '地火明夷': {palace:'坎',wuxing:'water',world:4,response:1,type:'游魂'},
  '地水师':   {palace:'坎',wuxing:'water',world:3,response:6,type:'归魂'},
  
  '艮为山':   {palace:'艮',wuxing:'earth',world:6,response:3,type:'本宫'},
  '山火贲':   {palace:'艮',wuxing:'earth',world:1,response:4,type:'一世'},
  '山天大畜': {palace:'艮',wuxing:'earth',world:2,response:5,type:'二世'},
  '山泽损':   {palace:'艮',wuxing:'earth',world:3,response:6,type:'三世'},
  '火泽睽':   {palace:'艮',wuxing:'earth',world:4,response:1,type:'四世'},
  '天泽履':   {palace:'艮',wuxing:'earth',world:5,response:2,type:'五世'},
  '风泽中孚': {palace:'艮',wuxing:'earth',world:4,response:1,type:'游魂'},
  '风山渐':   {palace:'艮',wuxing:'earth',world:3,response:6,type:'归魂'},
  
  '坤为地':   {palace:'坤',wuxing:'earth',world:6,response:3,type:'本宫'},
  '地雷复':   {palace:'坤',wuxing:'earth',world:1,response:4,type:'一世'},
  '地泽临':   {palace:'坤',wuxing:'earth',world:2,response:5,type:'二世'},
  '地天泰':   {palace:'坤',wuxing:'earth',world:3,response:6,type:'三世'},
  '雷天大壮': {palace:'坤',wuxing:'earth',world:4,response:1,type:'四世'},
  '泽天夬':   {palace:'坤',wuxing:'earth',world:5,response:2,type:'五世'},
  '水天需':   {palace:'坤',wuxing:'earth',world:4,response:1,type:'游魂'},
  '水地比':   {palace:'坤',wuxing:'earth',world:3,response:6,type:'归魂'}
};
```
