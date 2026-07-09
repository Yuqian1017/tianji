# 姓名学 · 五格剖象法

> **难度标签**：🟢必修：五格计算 | 🟡进阶：数理吉凶 | 🔴专研：三才·与八字结合

> *"名字是一个人一生被叫得最多的'咒语'。古人讲'名正言顺'，名字的五行和八字的五行如果配合得好，就像顺水推舟。"——师父*

---

## 一、五格的定义

五格剖象法将姓名的笔画数拆分为五个格，每格对应不同的人生层面。

```
假设姓名为三字：张 三 丰
姓氏笔画 = A (张=11画)
名第一字 = B (三=3画)  
名第二字 = C (丰=18画)

天格 = A + 1 = 12        → 先天运（祖荫，影响较小）
人格 = A + B = 14         → 主运（核心，性格+中年运势）
地格 = B + C = 21         → 前运（幼年到中年·35岁前）
外格 = 总格 - 人格 + 1 = 19 → 外运（社交·人际·副运）
总格 = A + B + C = 32     → 后运（晚年·一生总结）
```

### 两字姓名

```
姓名为两字：李 白
A = 李(7画)  B = 白(5画)

天格 = A + 1 = 8
人格 = A + B = 12
地格 = B + 1 = 6
外格 = 2（固定）
总格 = A + B = 12
```

### 复姓

```
姓名为四字：欧阳 修 文
A1 = 欧(15)  A2 = 阳(17)  B = 修(10)  C = 文(4)

天格 = A1 + A2 = 32
人格 = A2 + B = 27
地格 = B + C = 14
外格 = A1 + C = 19
总格 = A1 + A2 + B + C = 46
```

### 算法实现

```javascript
/**
 * 五格计算
 * @param surname 姓氏笔画数组 [11] 或 [15,17]（复姓）
 * @param givenName 名字笔画数组 [3,18] 或 [5]
 */
function calcWuge(surname, givenName) {
  const isCompoundSurname = surname.length === 2;
  const isSingleGiven = givenName.length === 1;
  
  const A = surname.reduce((a, b) => a + b, 0);
  const B_total = givenName.reduce((a, b) => a + b, 0);
  
  let tiange, renge, dige, waige, zongge;
  
  if (isCompoundSurname) {
    tiange = surname[0] + surname[1];
    renge = surname[1] + givenName[0];
    dige = isSingleGiven ? givenName[0] + 1 : givenName[0] + givenName[1];
    zongge = A + B_total;
    waige = zongge - renge + 1;
  } else {
    tiange = surname[0] + 1;
    renge = surname[0] + givenName[0];
    dige = isSingleGiven ? givenName[0] + 1 : givenName[0] + givenName[1];
    zongge = A + B_total;
    waige = isSingleGiven ? 2 : zongge - renge + 1;
  }
  
  return { tiange, renge, dige, waige, zongge };
}
```

---

## 二、笔画数的特殊规则

### 康熙字典笔画

五格剖象法使用**康熙字典笔画**（繁体），不是简体笔画。

```javascript
// 常见特殊笔画
const KANGXI_SPECIAL = {
  // 偏旁部首特殊算法
  '氵': 4,  // 三点水算4画（水=4）
  '扌': 4,  // 提手旁算4画（手=4）
  '忄': 4,  // 竖心旁算4画（心=4）
  '犭': 4,  // 反犬旁算4画（犬=4）
  '礻': 5,  // 示字旁算5画（示=5）
  '衤': 6,  // 衣字旁算6画（衣=6）
  '王': 5,  // 玉旁算5画（玉=5）
  '艹': 6,  // 草字头算6画（艸=6）
  '辶': 7,  // 走之底算7画（辵=7）
  '阝左': 8, // 左耳旁算8画（阜=8）
  '阝右': 7, // 右耳旁算7画（邑=7）
  '月(肉旁)': 6 // 肉月旁算6画（肉=6）
};

// 常用姓氏康熙笔画
const COMMON_SURNAMES = {
  '赵':14, '钱':16, '孙':10, '李':7,  '周':8,  '吴':7,
  '郑':19, '王':4,  '冯':12, '陈':16, '褚':15, '卫':15,
  '蒋':17, '沈':8,  '韩':17, '杨':13, '朱':6,  '秦':10,
  '许':11, '何':7,  '吕':7,  '张':11, '孔':4,  '曹':11,
  '刘':15, '黄':12, '林':8,  '徐':10, '马':10, '高':10,
  '梁':11, '郭':15, '罗':20, '胡':11, '邓':19, '萧':18,
  '唐':10, '宋':7,  '程':12, '于':3,  '潘':16, '丁':2,
  '叶':15, '余':7,  '苏':22, '魏':18, '谢':17, '邹':17,
  '白':5,  '方':4,  '石':5,  '崔':11, '董':15, '范':15
};
```

---

## 三、八十一数理吉凶

每个格的数字有固定的吉凶含义。若数字超过80则减80后查表。

```javascript
const SHULI_JIXIONG = {
  // 大吉
  1:  { jixiong:'大吉', desc:'万物起始·领导之数', wuxing:'wood' },
  3:  { jixiong:'大吉', desc:'进取如意·智仁勇备', wuxing:'fire' },
  5:  { jixiong:'大吉', desc:'福禄寿全·中正和谐', wuxing:'earth' },
  6:  { jixiong:'大吉', desc:'天德地祥·安稳吉庆', wuxing:'earth' },
  7:  { jixiong:'吉',   desc:'刚毅果断·独立进取', wuxing:'metal' },
  8:  { jixiong:'吉',   desc:'意志坚强·勤勉努力', wuxing:'metal' },
  11: { jixiong:'大吉', desc:'万象更新·富贵荣华', wuxing:'wood' },
  13: { jixiong:'大吉', desc:'才艺超群·智略过人', wuxing:'fire' },
  15: { jixiong:'大吉', desc:'福寿双全·慈祥有德', wuxing:'earth' },
  16: { jixiong:'大吉', desc:'贵人得助·天赋权威', wuxing:'earth' },
  21: { jixiong:'大吉', desc:'独立权威·光风霁月', wuxing:'wood' },
  23: { jixiong:'大吉', desc:'旭日东升·壮丽之数', wuxing:'fire' },
  24: { jixiong:'大吉', desc:'锦绣前程·家门余庆', wuxing:'fire' },
  25: { jixiong:'吉',   desc:'资性英敏·才略奇特', wuxing:'earth' },
  29: { jixiong:'吉',   desc:'智谋优秀·财力充裕', wuxing:'water' },
  31: { jixiong:'大吉', desc:'智勇得志·心想事成', wuxing:'wood' },
  32: { jixiong:'大吉', desc:'侥幸多望·贵人得助', wuxing:'wood' },
  33: { jixiong:'大吉', desc:'旭日升天·鸾凤相会', wuxing:'fire' },
  35: { jixiong:'吉',   desc:'温和平静·优雅发展', wuxing:'earth' },
  37: { jixiong:'吉',   desc:'权威显达·吉人天相', wuxing:'metal' },
  39: { jixiong:'吉',   desc:'富贵荣华·财帛丰盈', wuxing:'water' },
  41: { jixiong:'大吉', desc:'纯阳独秀·德望兼备', wuxing:'wood' },
  45: { jixiong:'吉',   desc:'新生泰和·顺风满帆', wuxing:'earth' },
  47: { jixiong:'吉',   desc:'点石成金·开花结果', wuxing:'metal' },
  48: { jixiong:'吉',   desc:'智谋兼备·德量荣达', wuxing:'metal' },
  
  // 凶
  2:  { jixiong:'凶', desc:'混沌未定·分离破败', wuxing:'wood' },
  4:  { jixiong:'凶', desc:'万事休止·进退不安', wuxing:'fire' },
  9:  { jixiong:'凶', desc:'兴尽凶始·穷迫逆境', wuxing:'water' },
  10: { jixiong:'凶', desc:'万事终局·空虚之数', wuxing:'water' },
  12: { jixiong:'凶', desc:'薄弱无力·孤立无助', wuxing:'wood' },
  14: { jixiong:'凶', desc:'沉沦破败·家庭缘薄', wuxing:'fire' },
  19: { jixiong:'凶', desc:'多难困苦·病弱短命', wuxing:'water' },
  20: { jixiong:'凶', desc:'屋下藏金·非业破运', wuxing:'water' },
  22: { jixiong:'凶', desc:'秋草逢霜·薄弱无力', wuxing:'wood' },
  26: { jixiong:'凶', desc:'变怪之谜·英雄多难', wuxing:'earth' },
  27: { jixiong:'半吉半凶', desc:'欲望过盛·自我矛盾', wuxing:'metal' },
  28: { jixiong:'凶', desc:'家亲缘薄·孤独遭难', wuxing:'metal' },
  30: { jixiong:'半吉半凶', desc:'浮沉不定·绝死逢生', wuxing:'water' },
  34: { jixiong:'凶', desc:'破家亡产·见识短小', wuxing:'fire' },
  36: { jixiong:'凶', desc:'波澜壮阔·风浪不息', wuxing:'earth' },
  40: { jixiong:'半吉半凶', desc:'谨慎保安·退守为吉', wuxing:'water' },
  42: { jixiong:'凶', desc:'博艺多能·十艺九不成', wuxing:'wood' },
  43: { jixiong:'凶', desc:'散财破产·诸事不如意', wuxing:'fire' },
  44: { jixiong:'凶', desc:'烦闷困苦·外祥内苦', wuxing:'fire' },
  46: { jixiong:'凶', desc:'载宝沉舟·浪里行船', wuxing:'earth' },
  49: { jixiong:'凶', desc:'吉凶难分·一成一败', wuxing:'water' },
  50: { jixiong:'半吉半凶', desc:'吉凶参半·一盛一衰', wuxing:'water' }
};

function getShuliJixiong(num) {
  const n = num > 80 ? num - 80 : num;
  return SHULI_JIXIONG[n] || { jixiong:'中', desc:'查表', wuxing:getNumWuxing(n) };
}
```

### 数字五行

```javascript
function getNumWuxing(num) {
  const lastDigit = num % 10;
  if (lastDigit === 1 || lastDigit === 2) return 'wood';
  if (lastDigit === 3 || lastDigit === 4) return 'fire';
  if (lastDigit === 5 || lastDigit === 6) return 'earth';
  if (lastDigit === 7 || lastDigit === 8) return 'metal';
  if (lastDigit === 9 || lastDigit === 0) return 'water';
}
```

---

## 四、三才配置

三才 = 天格·人格·地格的五行组合，判断整体运势走向。

```javascript
const SANCAI_JIXIONG = {
  // 格式：天-人-地
  '木木木': { jixiong:'大吉', desc:'成功顺利·基础安泰' },
  '木木火': { jixiong:'大吉', desc:'上下和顺·成功发展' },
  '木木土': { jixiong:'大吉', desc:'基础坚固·可获成功' },
  '木火木': { jixiong:'吉',   desc:'有热情·目标明确' },
  '木火火': { jixiong:'吉',   desc:'温暖向上·成功可期' },
  '火火火': { jixiong:'中',   desc:'急躁·成功后易失' },
  '土土土': { jixiong:'大吉', desc:'基础稳固·成功顺利' },
  '金金金': { jixiong:'中',   desc:'过刚·人际不利' },
  '水水水': { jixiong:'凶',   desc:'不安定·流动无根' },
  // 相克组合
  '火水火': { jixiong:'大凶', desc:'水克火·成功受阻·健康不利' },
  '金木金': { jixiong:'凶',   desc:'金克木·压制·挫折' },
  '木土木': { jixiong:'凶',   desc:'木克土·基础不稳' },
  // ... 共125种组合，此处列举典型
};

function getSancai(tiange, renge, dige) {
  const t = getNumWuxing(tiange);
  const r = getNumWuxing(renge);
  const d = getNumWuxing(dige);
  const wxNames = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };
  const key = wxNames[t] + wxNames[r] + wxNames[d];
  return { sancai: key, ...(SANCAI_JIXIONG[key] || { jixiong:'查表' }) };
}
```

---

## 五、与八字的结合

### 核心原则

```
人格五行 = 姓名的核心五行
八字用神 = 命主最需要的五行

最佳搭配：人格五行 = 八字用神
次佳：人格五行 生 八字用神
不利：人格五行 克 八字用神
```

### 起名流程

```
1. 排八字 → 确定用神（最需要的五行）
2. 确定人格画数范围 → 尾数对应用神五行
   用神木→人格尾数1或2  火→3或4  土→5或6  金→7或8  水→9或0
3. 反推名字笔画 → 人格=姓笔画+名首字笔画
4. 配地格·外格·总格 → 查数理吉凶表避凶
5. 查三才配置 → 避免天人地相克组合
6. 验证整体 → 五格无凶数+三才吉配+人格合用神
```

### 算法

```javascript
function evaluateName(surname, givenName, xiyongWuxing) {
  const wuge = calcWuge(surname, givenName);
  const sancai = getSancai(wuge.tiange, wuge.renge, wuge.dige);
  
  // 人格五行是否匹配用神
  const rengeWuxing = getNumWuxing(wuge.renge);
  const matchXiyong = rengeWuxing === xiyongWuxing;
  
  // 各格数理吉凶
  const scores = {
    tiange: getShuliJixiong(wuge.tiange),
    renge: getShuliJixiong(wuge.renge),
    dige: getShuliJixiong(wuge.dige),
    waige: getShuliJixiong(wuge.waige),
    zongge: getShuliJixiong(wuge.zongge)
  };
  
  // 综合评分
  let total = 0;
  if (matchXiyong) total += 30;
  if (scores.renge.jixiong.includes('吉')) total += 25;
  if (scores.dige.jixiong.includes('吉')) total += 15;
  if (scores.zongge.jixiong.includes('吉')) total += 15;
  if (sancai.jixiong.includes('吉')) total += 15;
  
  return { wuge, sancai, scores, matchXiyong, total };
}
```

> ⚠️ 五格剖象法源于日本熊崎健翁，并非中国传统命名法的全部。传统还有音韵学、字义学等维度。五格法争议较大，仅作参考。
