# 大六壬基础算法

> 纯技术参考。大六壬以日干为核心，起四课取三传，配十二天将断事。

---

## 一、核心数据

### 十二天将

```javascript
const SHIER_TIANJIANG = [
  { name: '贵人', alias: '天乙贵人', wuxing: 'earth', jixiong: '大吉', desc: '贵人·尊长' },
  { name: '螣蛇', alias: '螣蛇',     wuxing: 'fire',  jixiong: '凶',   desc: '惊恐·怪异·虚幻' },
  { name: '朱雀', alias: '朱雀',     wuxing: 'fire',  jixiong: '凶',   desc: '口舌·文书·信息' },
  { name: '六合', alias: '六合',     wuxing: 'wood',  jixiong: '吉',   desc: '婚姻·合作·交易' },
  { name: '勾陈', alias: '勾陈',     wuxing: 'earth', jixiong: '凶',   desc: '牢狱·争讼·田土' },
  { name: '青龙', alias: '青龙',     wuxing: 'wood',  jixiong: '吉',   desc: '喜庆·财帛·文章' },
  { name: '天空', alias: '天空',     wuxing: 'earth', jixiong: '凶',   desc: '欺诈·虚空·僧道' },
  { name: '白虎', alias: '白虎',     wuxing: 'metal', jixiong: '凶',   desc: '丧服·疾病·血光' },
  { name: '太常', alias: '太常',     wuxing: 'earth', jixiong: '吉',   desc: '饮食·衣服·宴会' },
  { name: '玄武', alias: '玄武',     wuxing: 'water', jixiong: '凶',   desc: '盗贼·暗昧·奸淫' },
  { name: '太阴', alias: '太阴',     wuxing: 'metal', jixiong: '吉',   desc: '阴人·密事·暗助' },
  { name: '天后', alias: '天后',     wuxing: 'water', jixiong: '吉',   desc: '妻妾·母亲·阴柔' }
];
```

### 贵人起法

贵人由**日干**确定落在哪个地支上，白天和夜晚不同：

```javascript
const GUIREN = {
  '甲': { day: '丑', night: '未' },
  '乙': { day: '子', night: '申' },
  '丙': { day: '亥', night: '酉' },
  '丁': { day: '亥', night: '酉' },  // 丙丁同
  '戊': { day: '丑', night: '未' },  // 戊与甲同
  '己': { day: '子', night: '申' },  // 己与乙同
  '庚': { day: '丑', night: '未' },
  '辛': { day: '午', night: '寅' },
  '壬': { day: '卯', night: '巳' },
  '癸': { day: '卯', night: '巳' }   // 壬癸同
};
```

### 十二天将排布

```javascript
/**
 * 排十二天将
 * 贵人确定位置后，其他天将按固定顺序排列
 * 白天：贵人起于昼贵位，顺排
 * 夜晚：贵人起于夜贵位，逆排
 */
const TIANJIANG_ORDER = [
  '贵人','螣蛇','朱雀','六合','勾陈','青龙',
  '天空','白虎','太常','玄武','太阴','天后'
];

function placeTianjiang(dayStem, isDaytime) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const guirenPos = GUIREN[dayStem][isDaytime ? 'day' : 'night'];
  const startIdx = branches.indexOf(guirenPos);
  
  const result = {};
  for (let i = 0; i < 12; i++) {
    const branchIdx = isDaytime
      ? (startIdx + i) % 12     // 白天顺排
      : (startIdx - i + 12) % 12; // 夜晚逆排
    result[branches[branchIdx]] = TIANJIANG_ORDER[i];
  }
  return result;
}
```

---

## 二、天地盘（月将加时）

六壬的天地盘是将十二地支叠成两层（天盘转动覆盖地盘）。

### 月将

月将由当月节气确定（与六壬月将不同于八字月建）：

| 节气 | 月将 | 名称 |
|------|------|------|
| 雨水后 | 亥 | 登明 |
| 春分后 | 戌 | 河魁 |
| 谷雨后 | 酉 | 从魁 |
| 小满后 | 申 | 传送 |
| 夏至后 | 未 | 小吉 |
| 大暑后 | 午 | 胜光 |
| 处暑后 | 巳 | 太乙 |
| 秋分后 | 辰 | 天罡 |
| 霜降后 | 卯 | 太冲 |
| 小雪后 | 寅 | 功曹 |
| 冬至后 | 丑 | 大吉 |
| 大寒后 | 子 | 神后 |

```javascript
const YUEJIANG = {
  '雨水': '亥', '春分': '戌', '谷雨': '酉', '小满': '申',
  '夏至': '未', '大暑': '午', '处暑': '巳', '秋分': '辰',
  '霜降': '卯', '小雪': '寅', '冬至': '丑', '大寒': '子'
};
```

### 天地盘布局

```javascript
/**
 * 月将加时
 * 将月将放在时辰地支的位置上，其他地支顺排
 */
function layoutTiandiPan(yuejiang, hourBranch) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const yjIdx = branches.indexOf(yuejiang);
  const hourIdx = branches.indexOf(hourBranch);
  
  const tianPan = {}; // 天盘
  // 月将放在时辰位上，其他顺推
  for (let i = 0; i < 12; i++) {
    const diIdx = (hourIdx + i) % 12;      // 地盘位置（固定）
    const tianIdx = (yjIdx + i) % 12;      // 天盘地支
    tianPan[branches[diIdx]] = branches[tianIdx];
  }
  
  return tianPan; // key=地盘地支, value=天盘地支
}
```

---

## 三、起四课

四课从日干日支推出，每课有上下两个地支。

```javascript
/**
 * 起四课
 * 第一课：日干寄宫的天盘地支（上） / 日干寄宫（下）
 * 第二课：第一课上的天盘地支（上） / 第一课的上（下）
 * 第三课：日支的天盘地支（上） / 日支（下）
 * 第四课：第三课上的天盘地支（上） / 第三课的上（下）
 */

// 天干寄宫
const GAN_JIGONG = {
  '甲': '寅', '乙': '辰', '丙': '巳', '丁': '未',
  '戊': '巳', '己': '未', '庚': '申', '辛': '戌',
  '壬': '亥', '癸': '丑'
};

function qiSike(dayStem, dayBranch, tianPan) {
  const ganGong = GAN_JIGONG[dayStem];
  
  // 第一课
  const ke1_xia = ganGong;
  const ke1_shang = tianPan[ganGong];
  
  // 第二课
  const ke2_xia = ke1_shang;
  const ke2_shang = tianPan[ke1_shang];
  
  // 第三课
  const ke3_xia = dayBranch;
  const ke3_shang = tianPan[dayBranch];
  
  // 第四课
  const ke4_xia = ke3_shang;
  const ke4_shang = tianPan[ke3_shang];
  
  return [
    { shang: ke1_shang, xia: ke1_xia },
    { shang: ke2_shang, xia: ke2_xia },
    { shang: ke3_shang, xia: ke3_xia },
    { shang: ke4_shang, xia: ke4_xia }
  ];
}
```

---

## 四、取三传

三传是六壬判断的核心动态——初传（发用）、中传、末传。

取三传的规则较为复杂，有多种情况：

### 九宗门（取初传的九种方法）

| 方法 | 条件 | 取法 |
|------|------|------|
| **贼克** | 四课中有下克上 | 取下克上者为初传 |
| **比用** | 贼克多个 | 取与日干阴阳同者 |
| **涉害** | 比用仍有多个 | 取涉害深者（从地盘到天盘经过克的步数多者） |
| **遥克** | 四课无贼克 | 找四课中上克下者 |
| **昴星** | 无克关系 | 取酉上神为初传 |
| **别责** | 昴星不适用 | 阳日取日合干上神，阴日取日支三合首支上神 |
| **八专** | 干支同位 | 取上两课下取阳神 |
| **伏吟** | 天地盘相同 | 阳日取日干克支，阴日取驿马 |
| **返吟** | 天地盘全冲 | 取驿马为初传 |

```javascript
// 简化版：仅处理最常见的贼克法
function getChuChuan(sike, dayStem) {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  
  // 找下克上（贼克）
  const zeike = [];
  for (let i = 0; i < 4; i++) {
    const shangWx = getBranchWuxing(sike[i].shang);
    const xiaWx = getBranchWuxing(sike[i].xia);
    if (isRestrict(xiaWx, shangWx)) { // 下克上
      zeike.push(sike[i]);
    }
  }
  
  if (zeike.length === 1) {
    return zeike[0].shang; // 初传 = 被克的上神
  }
  
  if (zeike.length > 1) {
    // 比用法：取与日干阴阳同者
    // ... 进一步处理
  }
  
  // 其他情况需要更复杂的判断
  return null;
}
```

### 中传和末传

```
初传确定后：
中传 = 初传在地盘上对应的天盘地支
末传 = 中传在地盘上对应的天盘地支
```

```javascript
function getSanChuan(chuChuan, tianPan) {
  const zhongChuan = tianPan[chuChuan];
  const moChuan = tianPan[zhongChuan];
  
  return {
    chu: chuChuan,    // 初传（发用）
    zhong: zhongChuan, // 中传
    mo: moChuan        // 末传
  };
}
```

---

## 五、六壬用神速查

| 问事 | 用神 | 备注 |
|------|------|------|
| 求财 | 天财(日干所克之支) | 看财爻旺衰 |
| 婚姻 | 天后·六合 | 男看天后，女看太常/青龙 |
| 官讼 | 勾陈·朱雀 | 勾陈=牢狱，朱雀=口舌 |
| 疾病 | 天医 | 看日干有无救 |
| 出行 | 驿马 | 马上神定吉凶 |
| 失物 | 玄武 | 玄武所临方位=失物方向 |
| 天气 | 太阳·玄武 | 阳明则晴，玄暗则雨 |
| 来人 | 初传 | 初传定来人性质 |

> ⚠️ 大六壬体系极为庞大，以上仅为入门框架。完整学习需专门典籍如《大六壬指南》《六壬大全》。
