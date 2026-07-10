# 排盘算法验证用例

> **LEGACY / NON-CANONICAL（2026-07-10）**：本副本的奇门用例仍含旧错误地盘。奇门规范 fixture 见 `database/xuanxue/compendium-new/reference/test-cases.md` 和 `test/qimen/qimen-core.test.mjs`。

> 用于验证各术数排盘算法的正确性。每个用例包含输入和预期输出。

---

## 一、紫微斗数验证用例

### 用例1：1990年农历三月初十辰时 男命

```javascript
const input1 = {
  lunarYear: 1990, // 庚午年
  lunarMonth: 3,
  lunarDay: 10,
  hour: '辰', // 7-9时
  gender: 'male',
  yearStem: '庚',
  yearBranch: '午'
};

const expected1 = {
  // 步骤1：命宫
  mingGong: '午', // 从寅起正月逆数到三月=子，从子顺数到辰时=辰...具体推算
  shenGong: '申',
  
  // 步骤2：五行局
  // 命宫在午，命宫天干由年干起五虎遁得出
  // 庚年：丙寅起，丁卯，戊辰，己巳，庚午 → 命宫天干=庚
  // 庚午→纳音路旁土→土五局
  wuxingJu: 5, // 土五局
  
  // 步骤3：紫微星
  // 土五局 + 初十日 → 查表 → 紫微在某宫
  ziwei: '丑', // 五局十日→紫微在丑
  
  // 步骤4：天府星
  // 紫微在丑 → 天府在亥（紫微天府对称关系）
  tianfu: '亥',
  
  // 步骤5：年干四化
  // 庚年：太阳化禄·武曲化权·太阴化科·天同化忌
  sihua: {
    lu: '太阳',
    quan: '武曲',
    ke: '太阴',
    ji: '天同'
  }
};
```

### 用例2：1985年农历八月二十酉时 女命

```javascript
const input2 = {
  lunarYear: 1985, // 乙丑年
  lunarMonth: 8,
  lunarDay: 20,
  hour: '酉',
  gender: 'female',
  yearStem: '乙',
  yearBranch: '丑'
};

const expected2 = {
  // 乙年四化
  sihua: {
    lu: '天机',
    quan: '天梁',
    ke: '紫微',
    ji: '太阴'
  },
  
  // 大运方向：乙（阴干）+ 女命 → 顺行
  dayunDirection: 'forward'
};
```

### 验证清单

```
□ 命宫定位：年月→命宫地支
□ 身宫定位：年月时→身宫地支
□ 十二宫排列：从命宫逆排
□ 五行局确定：命宫天干地支→纳音→局数
□ 紫微定位：局数+日数→查表
□ 天府定位：与紫微对称
□ 紫微系列14星：按固定间隔排列
□ 天府系列14星：按固定间隔排列
□ 六吉星位置：文昌文曲左辅右弼天魁天钺
□ 六煞星位置：擎羊陀罗火星铃星地空地劫
□ 四化落宫：年干→四化星→所在宫位
□ 大运：命宫五行局→起运年龄→顺逆排列
```

---

## 二、八字排盘验证用例

### 用例1：2024年2月4日16:27出生（立春后）

```javascript
const input_bazi1 = {
  solarDate: '2024-02-04',
  solarTime: '16:27',
  timezone: 'Asia/Shanghai'
};

const expected_bazi1 = {
  // 2024年2月4日16:27 = 立春后 → 甲辰年
  yearPillar: { stem:'甲', branch:'辰' },
  // 立春后雨水前 → 丙寅月
  monthPillar: { stem:'丙', branch:'寅' },
  // 需查万年历
  dayPillar: { stem:'壬', branch:'午' }, // 需验证
  // 16:27 = 申时
  hourPillar: { stem:'戊', branch:'申' }, // 壬日起戊申
  
  // 日主：壬水
  dayMaster: '壬',
  dayMasterWuxing: 'water',
  
  // 十神
  // 年干甲(木) vs 日主壬(水)：水生木 → 食神
  yearStemShishen: '食神',
  // 月干丙(火) vs 日主壬(水)：水克火 → 偏财
  monthStemShishen: '偏财'
};
```

### 用例2：1990年6月15日子时（阳历）

```javascript
const input_bazi2 = {
  solarDate: '1990-06-15',
  solarTime: '00:30'
};

const expected_bazi2 = {
  yearPillar: { stem:'庚', branch:'午' },
  monthPillar: { stem:'壬', branch:'午' }, // 芒种后
  // 日柱需查万年历
};
```

### 验证清单

```
□ 年柱：立春为界（非元旦，非春节）
□ 月柱：节气为界（不是中气）
□ 日柱：查万年历或算法（23时换日的争议）
□ 时柱：日干+时支→五鼠遁时
□ 十神推算：日干 vs 其他七字
□ 藏干：地支→藏干→透干判断
□ 地支关系：三合·六合·六冲·三刑·相害
□ 空亡：日柱所在旬→空亡地支
□ 纳音：干支组合→纳音五行
```

---

## 三、六爻排盘验证用例

### 用例：甲辰年 丙寅月 壬午日 占事业

```javascript
const input_liuyao = {
  yearBranch: '辰',
  monthBranch: '寅',
  dayStem: '壬',
  dayBranch: '午',
  coins: [7, 8, 7, 9, 8, 7] // 从初爻到六爻
  // 7=少阳(—)  8=少阴(--)  9=老阳(—○动)  6=老阴(--×动)
};

const expected_liuyao = {
  // 本卦：初阳二阴三阳四动阳→阴五阴六阳
  benGua: {
    lines: ['阳','阴','阳','阳→阴','阴','阳'], // 第四爻动
    // 下卦：阳阴阳=离  上卦：阳阴阳=离 → 不对，需重新看
    // 实际：初7阳·二8阴·三7阳=离(下) / 四9阳·五8阴·六7阳=离(上)
    guaName: '离为火',
    gong: '离宫'
  },
  // 变卦：第四爻阳变阴
  bianGua: {
    guaName: '山火贲', // 上艮下离
    gong: '艮宫'
  },
  
  // 装卦
  // 离宫属火，世在六爻
  shiyao: 6,
  yingyao: 3,
  
  // 纳甲
  // 离卦内卦纳己：己卯·己丑·己亥
  // 离卦外卦纳己：己巳·己未·己酉... 需查纳甲表
  
  // 空亡
  // 壬午日 → 甲申旬 → 空亡午未
  kongwang: ['午', '未']
};
```

### 验证清单

```
□ 铜钱值→爻（6789对应正确）
□ 上下卦→卦名（查八卦对照表）
□ 八宫归属正确
□ 世应位置正确
□ 纳甲（内外卦天干地支）
□ 六亲（以卦宫五行定六亲）
□ 六神（以日干定六神起始）
□ 动爻变卦正确
□ 空亡地支正确（以日柱定旬）
```

---

## 四、奇门遁甲验证用例

### 用例：2024年3月20日（春分后）甲子时 阳遁

```javascript
const input_qimen = {
  datetime: '2024-03-20T23:00', // 甲子时
  jieqi: '春分',
  yuan: '上元' // 需按拆补法确定
};

const expected_qimen = {
  dunType: 'yang', // 春分=阳遁
  juNum: 3, // 春分上元=三局
  
  // 地盘：三局 → 戊在震三宫起，顺排
  diPan: {
    3: '戊', 4: '己', 9: '庚', 2: '辛',
    7: '壬', 6: '癸', 1: '丁', 8: '丙', 5: '乙'
    // ⚠️ 需要按洛书飞星顺序精确排列
  },
  
  // 时干甲子 → 甲隐于戊 → 找戊在地盘位置=三宫
  zhifuGong: 3,
  zhifu: '天冲', // 三宫原有九星
  zhishi: '伤门', // 三宫原有八门
};
```

### 验证清单

```
□ 阴阳遁判断正确
□ 节气→局数对照正确
□ 三元（上中下）确定正确
□ 地盘三奇六仪排列正确
□ 旬首甲→六仪对应正确
□ 值符值使确定正确
□ 天盘转动正确
□ 人盘转动正确
□ 神盘排布正确
□ 奇仪格局判断正确
```

---

## 五、通用验证方法

```javascript
/**
 * 自动化验证框架
 */
function runTestCase(name, inputFn, expectedOutput) {
  try {
    const actual = inputFn();
    const passed = deepEqual(actual, expectedOutput);
    console.log(`${passed ? '✅' : '❌'} ${name}`);
    if (!passed) {
      console.log('  预期:', JSON.stringify(expectedOutput));
      console.log('  实际:', JSON.stringify(actual));
    }
    return passed;
  } catch (e) {
    console.log(`❌ ${name}: 异常 - ${e.message}`);
    return false;
  }
}

// 运行所有测试
function runAllTests() {
  let pass = 0, fail = 0;
  
  // 紫微测试
  // runTestCase('紫微-用例1', () => ziweiPaipan(input1), expected1) ? pass++ : fail++;
  
  // 八字测试
  // runTestCase('八字-用例1', () => baziPaipan(input_bazi1), expected_bazi1) ? pass++ : fail++;
  
  // 六爻测试
  // runTestCase('六爻-用例1', () => liuyaoPaipan(input_liuyao), expected_liuyao) ? pass++ : fail++;
  
  console.log(`\n总计: ${pass + fail} 用例, ${pass} 通过, ${fail} 失败`);
}
```
