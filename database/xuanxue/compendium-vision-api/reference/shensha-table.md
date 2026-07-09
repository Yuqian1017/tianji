# 八字神煞速查表

> 纯数据。神煞是八字中的辅助判断因素，不可单独论吉凶，须结合十神格局。

---

## 一、吉神

### 天乙贵人（最重要的贵人星）

遇难有贵人相助·逢凶化吉。

```javascript
const TIANYI_GUIREN = {
  '甲': ['丑','未'], '戊': ['丑','未'],
  '乙': ['子','申'], '己': ['子','申'],
  '丙': ['亥','酉'], '丁': ['亥','酉'],
  '庚': ['丑','未'], '辛': ['寅','午'],
  '壬': ['卯','巳'], '癸': ['卯','巳']
};
// 用法：以日干查，四柱地支中见即有
```

### 文昌贵人

利学业·考试·文书。

```javascript
const WENCHANG_GUIREN = {
  '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
  '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
  '壬': '寅', '癸': '卯'
};
```

### 太极贵人

利学术·研究·宗教·命理。

```javascript
const TAIJI_GUIREN = {
  '甲': ['子','午'], '己': ['子','午'],
  '乙': ['卯','酉'], '庚': ['卯','酉'],
  '丙': ['子','午'], '辛': ['寅','亥'],
  '丁': ['卯','酉'], '壬': ['寅','亥'],
  '戊': ['辰','戌','丑','未'], '癸': ['辰','戌','丑','未']
};
```

### 天德贵人·月德贵人

天降福德·化解灾难。

```javascript
const TIANDE = {
  '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛',
  '午': '亥', '未': '甲', '申': '癸', '酉': '寅',
  '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚'
};

const YUEDE = {
  '寅': '丙', '午': '丙', '戌': '丙',
  '申': '壬', '子': '壬', '辰': '壬',
  '亥': '甲', '卯': '甲', '未': '甲',
  '巳': '庚', '酉': '庚', '丑': '庚'
};
```

### 禄神

日干的临官位·代表俸禄·财禄。

```javascript
const LUSHEN = {
  '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
  '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子'
};
```

### 金舆

利车马出行·贵人之车。

```javascript
const JINYU = {
  '甲': '辰', '乙': '巳', '丙': '未', '丁': '申',
  '戊': '未', '己': '申', '庚': '戌', '辛': '亥',
  '壬': '丑', '癸': '寅'
};
```

---

## 二、凶神

### 羊刃（阳刃）

日干帝旺位·代表极端·暴烈·意外伤害。

```javascript
const YANGREN = {
  '甲': '卯', '丙': '午', '戊': '午',
  '庚': '酉', '壬': '子'
  // 阴干无羊刃（部分流派有，但主流不取）
};
```

**特征**：
- 阳刃在日支 → 配偶性格刚烈
- 阳刃在月令 → 性格暴躁但有魄力
- 阳刃逢冲 → 血光之灾
- 阳刃配七杀 → 权威（杀刃格·武将之命）

### 亡神

做事有始无终·暗中损耗。

```javascript
const WANGSHEN = {
  '寅': '巳', '午': '巳', '戌': '巳',
  '申': '亥', '子': '亥', '辰': '亥',
  '巳': '申', '酉': '申', '丑': '申',
  '亥': '寅', '卯': '寅', '未': '寅'
};
```

### 劫煞

外来侵害·盗窃·事故。

```javascript
const JIESHA = {
  '寅': '亥', '午': '亥', '戌': '亥',
  '申': '巳', '子': '巳', '辰': '巳',
  '巳': '寅', '酉': '寅', '丑': '寅',
  '亥': '申', '卯': '申', '未': '申'
};
```

### 灾煞

天灾·意外·不可控因素。

```javascript
const ZAISHA = {
  '寅': '子', '午': '子', '戌': '子',
  '申': '午', '子': '午', '辰': '午',
  '巳': '卯', '酉': '卯', '丑': '卯',
  '亥': '酉', '卯': '酉', '未': '酉'
};
```

### 空亡（重要！六爻八字共用）

详见 reference/tiangan-dizhi.md 中的空亡表。

空亡的含义因术数体系不同而异：
- **六爻**：空亡力量大减，动爻空=有心无力
- **八字**：空亡减力但不完全无用。吉神空=贵人不力，凶神空=灾祸减轻

---

## 三、桃花类神煞

### 咸池（桃花）

异性缘·感情·艺术天赋。（见十二长生表中的桃花数据）

### 红艳

风流·感情丰富·异性缘极旺。

```javascript
const HONGYAN = {
  '甲': '午', '乙': '申', '丙': '寅', '丁': '未',
  '戊': '辰', '己': '辰', '庚': '戌', '辛': '酉',
  '壬': '子', '癸': '申'
};
```

### 天喜·红鸾

婚姻·喜庆之事。（见紫微部分数据）

---

## 四、学堂类神煞

### 学堂

利正规教育·学历。

```javascript
const XUETANG = {
  'wood': '亥',  // 木命见亥（水生木·长生位）
  'fire': '寅',  // 火命见寅
  'metal': '巳', // 金命见巳
  'water': '申', // 水命见申
  'earth': '申'  // 土命见申（部分说寅）
};
```

### 词馆

利文学·写作·口才。

```javascript
const CIGUAN = {
  'wood': '寅',
  'fire': '巳',
  'metal': '申',
  'water': '亥',
  'earth': '巳'
};
```

---

## 五、神煞使用原则

> *"神煞是调味料，不是主菜。格局用神才是根本。"——二师兄*

1. **不可单独论断**：神煞只做辅助参考
2. **结合格局看**：天乙贵人在用神位上 = 大吉；在忌神位上 = 贵人帮倒忙
3. **多煞看组合**：单个神煞力量有限，多个同类叠加才显效
4. **贵人优先**：天乙贵人 > 其他吉神
5. **羊刃最重**：所有凶煞中，羊刃影响最大

```javascript
/**
 * 批量查询八字神煞
 * @param pillars 四柱 { year, month, day, hour } 各含stem和branch
 * @returns 神煞列表
 */
function findShensha(pillars) {
  const results = [];
  const dayStem = pillars.day.stem;
  const allBranches = [pillars.year.branch, pillars.month.branch, 
                       pillars.day.branch, pillars.hour.branch];
  const positions = ['年支','月支','日支','时支'];
  
  // 天乙贵人
  const tianyi = TIANYI_GUIREN[dayStem] || [];
  allBranches.forEach((br, i) => {
    if (tianyi.includes(br)) {
      results.push({ name: '天乙贵人', position: positions[i], branch: br });
    }
  });
  
  // 文昌贵人
  const wenchang = WENCHANG_GUIREN[dayStem];
  allBranches.forEach((br, i) => {
    if (br === wenchang) {
      results.push({ name: '文昌贵人', position: positions[i], branch: br });
    }
  });
  
  // 羊刃
  const yangren = YANGREN[dayStem];
  if (yangren) {
    allBranches.forEach((br, i) => {
      if (br === yangren) {
        results.push({ name: '羊刃', position: positions[i], branch: br, type: '凶' });
      }
    });
  }
  
  // 禄神
  const lushen = LUSHEN[dayStem];
  allBranches.forEach((br, i) => {
    if (br === lushen) {
      results.push({ name: '禄神', position: positions[i], branch: br });
    }
  });
  
  // 桃花（以年支和日支查）
  [pillars.year.branch, pillars.day.branch].forEach(baseBr => {
    const th = TAOHUA[baseBr];
    if (th) {
      allBranches.forEach((br, i) => {
        if (br === th) {
          results.push({ name: '桃花(咸池)', position: positions[i], branch: br, from: baseBr });
        }
      });
    }
  });
  
  // 驿马
  [pillars.year.branch, pillars.day.branch].forEach(baseBr => {
    const ym = YIMA[baseBr];
    if (ym) {
      allBranches.forEach((br, i) => {
        if (br === ym) {
          results.push({ name: '驿马', position: positions[i], branch: br, from: baseBr });
        }
      });
    }
  });
  
  return results;
}
```
