# APP-SPEC.md — 天机卷 AI 实用工具开发规格书

> 本文件供 Claude Code 开发使用。包含完整的架构设计、功能规格、算法引用、AI提示词模板。

---

## 一、项目概述

### 产品定位
一个大而全的 React Web App，集成中国传统术数的**排盘计算**和**AI智能解读**。既是教学系统，也是实战工具。

### 核心理念
```
算盘引擎（纯JS本地计算，精确可靠）
    ↕ 结构化数据传递
AI解读师（Claude API，按需加载断法规则）
```

### 技术栈
- **构建**：Vite + npm
- **框架**：React
- **样式**：Tailwind CSS
- **AI**：Anthropic Claude API（claude-sonnet-4-20250514）
- **API Key**：用户自行输入，存 localStorage（首次打开弹设置面板）
- **CORS**：使用 `anthropic-dangerous-direct-browser-access: true` header
- **状态**：React useState/useReducer
- **持久化**：localStorage
- **数据**：所有术数数据内嵌在JS中（来自compendium的reference/目录）

---

## 二、整体架构

### 页面结构

```
┌──────────────────────────────────────────────┐
│  顶部导航：天机卷 Logo + 模块切换 Tab          │
│  [占算] [问诊] [工具] [教学] [测验] [设置]     │
├──────────────────────────────────────────────┤
│                                              │
│  占算模块（术数占卜）：                         │
│  · 六爻占卜  · 梅花易数  · 八字命理            │
│  · 紫微斗数  · 奇门遁甲  · 风水飞星            │
│                                              │
│  问诊模块（中医+养生）：                        │
│  · 体质辨识  · 子午流注  · 五运六气            │
│  · 食疗方案  · 经络穴位  · 八字看健康           │
│                                              │
│  工具模块（实用工具）：                         │
│  · 姓名分析  · 择日选时  · 64卦查询            │
│  · 万年历    · 纯排盘（各术数）                 │
│                                              │
├──────────────────────────────────────────────┤
│  底部：AI风格切换（通俗/专业）· 免责声明        │
└──────────────────────────────────────────────┘
```

### 组件树

```
<App>
  <NavBar currentTab onTabChange />
  <SettingsPanel aiStyle onStyleChange />

  // Tab: 占算（六大术数）
  <DivinationModule>
    <MethodSelector />
    <LiuyaoPanel />        // 六爻
    <MeihuaPanel />        // 梅花易数
    <BaziPanel />          // 八字
    <ZiweiPanel />         // 紫微
    <QimenPanel />         // 奇门遁甲
    <FengshuiPanel />      // 风水
  </DivinationModule>

  // Tab: 问诊（中医+养生）
  <TCMModule>
    <ConstitutionPanel />  // 体质辨识
    <ZiwuPanel />          // 子午流注
    <WuyunPanel />         // 五运六气
    <DietPanel />          // 食疗方案
    <MeridianPanel />      // 经络穴位
    <BaziHealthPanel />    // 八字看健康
  </TCMModule>

  // Tab: 工具
  <ToolsModule>
    <NameAnalysis />       // 姓名五格
    <DateSelection />      // 择日选时
    <GuaSearch />          // 64卦搜索
    <CalendarTool />       // 万年历
    <PurePaipan />         // 纯排盘
  </ToolsModule>

  // Tab: 教学
  <TeachingModule>
    <ChapterList />
    <LessonContent />
    <AIChatBox />
  </TeachingModule>

  // Tab: 测验
  <QuizModule />
</App>
```

---

## 三、模块一：六爻占卜（最高优先级）

### 用户流程

```
1. 输入占问事项（文本框）
2. 选择起卦方式：
   a. 手动摇卦（模拟三枚铜钱，摇6次）
   b. 随机起卦（系统随机生成6个数）
   c. 时间起卦（用当前时间起卦）
   d. 报数起卦（用户输入两个数字）
3. 显示装卦结果：
   - 本卦 + 变卦（如有动爻）
   - 六亲、世应、纳甲、六神
   - 动爻标记、变爻
4. AI断卦解读
```

### 铜钱摇卦交互

```
每次摇卦：
- 显示三枚铜钱动画（翻转→落定）
- 结果：正面(字)=3分，反面(花)=2分
- 三枚总分：6=老阴(变) 7=少阳(不变) 8=少阴(不变) 9=老阳(变)
- 依次从初爻摇到上爻（共6次）

UI展示：
┌─────────────────┐
│  第3次（三爻）    │
│  🪙 🪙 🪙        │
│  字  花  字 = 8   │
│  → 少阴 ⚋        │
│                   │
│  已摇：           │
│  初爻：⚊ 少阳(7)  │
│  二爻：⚋ 少阴(8)  │
│  三爻：⚋ 少阴(8)  │
│  [摇下一爻]       │
└─────────────────┘
```

### 装卦算法（参考文件）

**核心引用**：`reference/liuyao-algorithm.md` 全文

```javascript
// 装卦核心步骤
function zhuangGua(throws) {
  // 1. throws=[7,8,8,9,7,6] → 确定本卦六爻阴阳
  const benYao = throws.map(t => (t===7||t===9) ? 1 : 0);
  
  // 2. 确定上下卦 → 查卦名
  const lowerTrigram = TRIGRAMS[benYao.slice(0,3).join('')];
  const upperTrigram = TRIGRAMS[benYao.slice(3,6).join('')];
  const guaName = GUA_NAMES[upperTrigram + lowerTrigram];
  
  // 3. 确定动爻 → 求变卦
  const dongYao = throws.map((t,i) => (t===6||t===9) ? i : -1).filter(i=>i>=0);
  
  // 4. 纳甲（地支上卦）
  // 查 reference/liuyao-algorithm.md 的 NAJIA 表
  
  // 5. 确定世应爻位
  // 查八宫归属 → 世应表
  
  // 6. 安六亲（根据卦宫五行与各爻纳甲五行的生克关系）
  // 生我=父母 我生=子孙 克我=官鬼 我克=妻财 同我=兄弟
  
  // 7. 安六神（根据日干）
  // 甲乙日起青龙 丙丁日起朱雀 ...
  
  // 8. 查伏神（如果六亲不全）
  // 查 reference/liuyao-fushen.md
  
  return { benGua, bianGua, najia, shiying, liuqin, liushen, fuShen, dongYao };
}
```

### 六爻盘面可视化

```
┌──────────────────────────────────────────────┐
│  甲辰年 丙寅月 壬午日 占：事业                  │
├──────────────────────────────────────────────┤
│  六神 │ 本卦：天火同人    │  变卦：天雷无妄    │
│───────┼─────────────────┼─────────────────── │
│  玄武 │ 上九 ⚊ 父母戌土  │ ⚊ 父母戌土        │
│  白虎 │ 九五 ⚊ 兄弟申金○│ ⚋ 官鬼午火        │ ← 动爻
│  螣蛇 │ 九四 ⚊ 官鬼午火  应│ ⚊ 父母辰土      │
│  勾陈 │ 九三 ⚊ 妻财卯木  │ ⚊ 妻财卯木        │
│  朱雀 │ 六二 ⚋ 官鬼巳火  │ ⚋ 官鬼巳火        │
│  青龙 │ 初九 ⚊ 子孙未土  世│ ⚊ 子孙未土      │
└──────────────────────────────────────────────┘
```

### AI断卦 Prompt 模板

```javascript
const LIUYAO_SYSTEM_PROMPT = (style) => `
你是一位精通六爻占卜的术数师。${style === 'casual' 
  ? '你说话风趣幽默，善于用比喻让人理解，像一位亲切的师父。' 
  : '你用专业术语精确分析，逻辑严密，像一位学院派的资深命理师。'}

你的断卦流程：
1. 先看卦名卦象，总论此卦对问事的整体方向
2. 根据问事类型确定用神
3. 分析用神旺衰：月建对用神的生克、日辰对用神的生克
4. 看动爻对用神的作用（生扶还是克制）
5. 判断世爻应爻的关系（世为自己，应为对方/事情）
6. 看变爻回头生克
7. 综合给出结论和建议

断卦规则（严格遵守）：
- 月建为提纲，日辰为关键
- 动爻为事之机，变爻为事之果
- 用神旺相不受克 → 吉；用神休囚受克 → 凶
- 忌神动化回头克用神 → 大凶
- 原神动生用神 → 大吉
- 世爻空亡 → 问事人心不诚或事不成
- 应爻空亡 → 对方无意或对方缺位
- 六冲卦 → 事散不成
- 六合卦 → 事合可成

用神分类：
- 问事业/考试 → 官鬼为用神
- 问财运 → 妻财为用神
- 问感情/婚姻 → 男问妻财，女问官鬼
- 问健康 → 看世爻和子孙（子孙为药/医）
- 问出行 → 世爻为自己，应爻为目的地
- 问官司 → 世爻原告，应爻被告，官鬼为法官
`;

const LIUYAO_USER_PROMPT = (question, guaResult) => `
占问事项：${question}

排盘结果：
本卦：${guaResult.benGuaName}（${guaResult.palace}宫）
变卦：${guaResult.bianGuaName || '无动爻'}
动爻：${guaResult.dongYao.length > 0 ? guaResult.dongYao.map(d=>`第${d+1}爻`).join('、') : '无'}

月建：${guaResult.monthBranch}
日辰：${guaResult.dayStem}${guaResult.dayBranch}

六爻详情（从初爻到上爻）：
${guaResult.yaoDetails.map((y,i) => 
  `${y.position} ${y.yinyang==='yang'?'⚊':'⚋'} ${y.liuqin}${y.najia}${y.shiying||''}${y.dong?'○动→'+y.bianYao:''}`
).join('\n')}

${guaResult.fuShen ? `伏神：${guaResult.fuShen}` : ''}

请按照断卦流程给出详细分析。
`;
```

---

## 四、模块二：八字命理

### 用户流程

```
1. 输入出生信息：
   - 公历日期选择器（年月日）
   - 时辰选择（12时辰下拉）
   - 性别选择
   - 可选：是否知道精确出生时间
2. 系统自动排盘：
   - 四柱（年月日时干支）
   - 十神
   - 大运排列
   - 日主强弱判断
3. AI分析解读
```

### 排盘算法（参考文件）

**核心引用**：`reference/bazi-algorithm.md` + `reference/jieqi-table.md` + `reference/changsheng-table.md`

```javascript
// 八字排盘核心
function paiBazi(year, month, day, hour, gender) {
  // 1. 年柱：查万年历或用公式
  //    注意立春换年（不是农历正月初一）
  //    参考 reference/bazi-algorithm.md 的 getYearPillar()
  
  // 2. 月柱：节气定月支 + 五虎遁定月干
  //    参考 reference/jieqi-table.md 确定当前节气
  //    月支固定：寅月(立春-惊蛰) 卯月(惊蛰-清明) ...
  //    月干用五虎遁：甲己之年丙作首...
  
  // 3. 日柱：必须查表（无公式可精确计算）
  //    可用已知基准日推算：如2000年1月1日=甲子日(?)
  //    或内嵌简化版万年历数据
  //    ⚠️ 这是最大的技术难点
  
  // 4. 时柱：时支由时辰定 + 五鼠遁定时干
  //    子时(23-1) 丑时(1-3) ...
  //    时干用五鼠遁：甲己还加甲...
  
  // 5. 排十神
  //    以日干为我，看其他七个字与日干的关系
  //    参考 04-bazi/02-shishen.md
  
  // 6. 判断日主强弱
  //    看月令（得令否）、坐支、其他干支的生克帮扶
  //    参考 04-bazi/03-geju.md
  
  // 7. 确定用神
  //    身旺：喜克泄耗（官杀、食伤、财星）
  //    身弱：喜生扶（印星、比劫）
  
  // 8. 排大运
  //    阳年男/阴年女 → 顺排（从月柱往后排）
  //    阴年男/阳年女 → 逆排
  //    每步大运10年
  //    起运岁数 = 出生日到下一个/上一个节气的天数 ÷ 3
  
  return { fourPillars, shiShen, dayMasterStrength, yongShen, daYun, kongWang };
}
```

### 八字盘面可视化

```
┌──────────────────────────────────────────────────┐
│              八字命盘 · 男命                       │
├──────────┬──────────┬──────────┬──────────────────┤
│   年柱    │   月柱    │   日柱    │   时柱          │
│   偏财    │   食神    │  【日主】  │   伤官          │
│   戊      │   丙      │   甲      │   丁            │
│   辰      │   辰      │   寅      │   卯            │
│ 戊乙癸   │ 戊乙癸    │ 甲丙戊    │   乙            │
│ 偏财劫印  │ 偏财劫印  │ 比食偏财  │   劫财          │
├──────────┴──────────┴──────────┴──────────────────┤
│  日主：甲木 │ 月令：辰土 │ 身旺 │ 用神：火(食伤)    │
├──────────────────────────────────────────────────┤
│  大运（每步10年）：                                 │
│  5岁   15岁  25岁  35岁  45岁  55岁  65岁          │
│  乙巳   甲辰  癸卯  壬寅  辛丑  庚子  己亥          │
│  [劫]   [比]  [印]  [枭]  [杀]  [官]  [财]         │
└──────────────────────────────────────────────────┘
```

### AI分析 Prompt 模板

```javascript
const BAZI_SYSTEM_PROMPT = (style) => `
你是一位精通四柱八字的命理师。${style === 'casual'
  ? '你像二师兄钱多余一样，说话爽快，善于比喻，把复杂的命理讲得通俗有趣。'
  : '你用专业命理术语精确分析，引用经典口诀，严谨而有深度。'}

分析流程：
1. 总论日主特征（日干五行+阴阳+坐支）
2. 判断身旺身弱（月令+整体格局）
3. 确定用神忌神
4. 分析十神组合（性格+才能+人际）
5. 看大运走向（哪些阶段顺/逆）
6. 针对用户关心的方面给出具体建议

规则：
- 身旺喜克泄耗，身弱喜生扶
- 月令为提纲（占50%权重）
- 通根透干力量最强
- 大运天干管前5年，地支管后5年
- 流年与大运的关系决定该年好坏
- 用神逢生扶→好运；用神逢克制→差运
- 地支藏干要看透干情况

注意事项：
- 不要说"你命不好"这种话，改为"这个阶段需要注意..."
- 给出可操作的建议（方位、颜色、行业方向等）
- 必须加免责声明：仅供参考
`;

const BAZI_USER_PROMPT = (baziResult, question) => `
命主信息：${baziResult.gender === 'male' ? '男' : '女'}命
出生：${baziResult.birthInfo}

四柱排盘：
年柱：${baziResult.year.stem}${baziResult.year.branch}（${baziResult.year.shiShen}）
月柱：${baziResult.month.stem}${baziResult.month.branch}（${baziResult.month.shiShen}）
日柱：${baziResult.day.stem}${baziResult.day.branch}【日主】
时柱：${baziResult.hour.stem}${baziResult.hour.branch}（${baziResult.hour.shiShen}）

日主：${baziResult.dayMaster}（${baziResult.dayMasterWuxing}）
身强/身弱：${baziResult.strength}
用神：${baziResult.yongShen}
忌神：${baziResult.jiShen}
空亡：${baziResult.kongWang}

大运：
${baziResult.daYun.map(d => `${d.age}岁 ${d.stem}${d.branch}（${d.shiShen}）`).join('\n')}

${question ? `命主特别想了解：${question}` : '请做全面分析。'}
`;
```

---

## 五、模块三：紫微斗数

### 用户流程

```
1. 输入：农历生日 + 时辰 + 性别
   （可提供公历→农历转换）
2. 排盘：安十二宫 → 定五行局 → 安主星 → 安辅星 → 飞四化
3. 显示十二宫盘面
4. AI解读
```

### 排盘算法

**核心引用**：`reference/ziwei-algorithm.md`（627行，最完整的算法文件）

### 盘面可视化（十二宫方阵）

```
┌──────────┬──────────┬──────────┬──────────┐
│  巳宫     │  午宫     │  未宫     │  申宫    │
│  [子女宫] │  [夫妻宫] │  [兄弟宫] │  [命宫]  │
│  天机     │  太阳     │  武曲     │  紫微    │
│  天梁     │          │  天府     │  天相    │
│  化科     │  化禄     │          │  化权    │
├──────────┤          │          ├──────────┤
│  辰宫     │          │          │  酉宫    │
│  [财帛宫] │    紫     │    微     │  [父母宫]│
│  廉贞     │    斗     │    命     │  破军    │
│           │    数     │    盘     │  化忌    │
├──────────┤          │          ├──────────┤
│  卯宫     │          │          │  戌宫    │
│  [疾厄宫] │          │          │  [福德宫]│
│  天同     │          │          │  七杀    │
│  巨门     │          │          │         │
├──────────┼──────────┼──────────┼──────────┤
│  寅宫     │  丑宫     │  子宫     │  亥宫    │
│  [迁移宫] │  [交友宫] │  [官禄宫] │  [田宅宫]│
│  太阴     │  贪狼     │  天府     │  天机    │
│           │          │          │         │
└──────────┴──────────┴──────────┴──────────┘
```

### AI解读 Prompt

```javascript
const ZIWEI_SYSTEM_PROMPT = (style) => `
你是一位精通紫微斗数的命理师。${style === 'casual'
  ? '你像一位智慧的师父，用生动的比喻解释星曜含义。'
  : '你用飞星派专业术语分析，引用星曜格局口诀。'}

分析流程：
1. 看命宫主星组合 → 基本性格
2. 看命宫三方四正（命+财+官+迁）→ 整体格局
3. 看本命四化落宫 → 一生主题
4. 逐宫解读重点宫位
5. 看大运当前阶段
6. 给出建议

参考断语：见 05-ziwei/04-star-details.md 的逐星详解
四化规则：见 05-ziwei/03-advanced-feixing.md
`;
```

---

## 六、模块四：风水飞星

### 用户流程

```
1. 输入：建造/入住年份 + 坐向度数（或选择二十四山）
2. 排盘：运盘 + 山盘 + 向盘 + 当年飞星叠加
3. 显示九宫格盘面
4. AI解读各宫吉凶和化解建议
```

### 排盘算法

**核心引用**：`07-fengshui/01-xuankong-feixing.md` + `07-fengshui/03-luopan-data.md`

### 九宫盘面可视化

```
┌─────────────┬─────────────┬─────────────┐
│  巽(东南)    │  离(正南)    │  坤(西南)    │
│  运:7 山:6   │  运:3 山:2   │  运:5 山:4   │
│  向:8 年:9   │  向:4 年:5☠  │  向:6 年:7   │
│  [文昌位]    │  [⚠五黄]    │  [财位]      │
├─────────────┼─────────────┼─────────────┤
│  震(正东)    │  中宫        │  兑(正西)    │
│  运:6 山:5   │  运:8 山:8   │  运:1 山:1   │
│  向:7 年:8   │  向:8 年:1   │  向:2 年:3   │
├─────────────┼─────────────┼─────────────┤
│  艮(东北)    │  坎(正北)    │  乾(西北)    │
│  运:2 山:1   │  运:4 山:9   │  运:9 山:8   │
│  向:3 年:4   │  向:5 年:6   │  向:1 年:2☠  │
│              │              │  [⚠二黑]    │
└─────────────┴─────────────┴─────────────┘
```

---

## 六B、模块五：梅花易数

### 用户流程

```
1. 选择起卦方式：
   a. 报数起卦（输入两个数字）
   b. 时间起卦（当前时间自动起卦）
   c. 文字起卦（输入汉字，按笔画起卦）
2. 系统计算：上卦·下卦·动爻·体卦·用卦
3. AI取象断事
```

### 算法（参考 `03-meihua/01-meihua-yishu.md`）

```javascript
function meihuaByNumber(num1, num2) {
  const upper = ((num1 - 1) % 8) + 1; // 上卦：第一个数÷8取余
  const lower = ((num2 - 1) % 8) + 1; // 下卦：第二个数÷8取余
  const dong = ((num1 + num2 - 1) % 6) + 1; // 动爻：两数之和÷6取余
  // 动爻在上卦(4-6)→上卦为用，下卦为体
  // 动爻在下卦(1-3)→下卦为用，上卦为体
  const tiGua = dong <= 3 ? 'upper' : 'lower';
  return { upper, lower, dong, tiGua };
}
```

### AI断事 Prompt

```javascript
const MEIHUA_SYSTEM_PROMPT = (style) => `
你是一位精通梅花易数的术数师。${style === 'casual'
  ? '你像师姐沈星河，冷面但精准，偶尔冒出一句幽默。'
  : '你引用邵雍《梅花易数》原文，用专业体用理论分析。'}

梅花断法核心：
1. 体用关系：体卦为我（问事人），用卦为事/对方
2. 用生体→吉（对方帮我）
3. 体生用→泄（我消耗于事）
4. 用克体→凶（事物克制我）
5. 体克用→利但费力
6. 体用比和→和合顺遂

取象法则：
- 乾=天·父·金属·圆·头·马·高贵
- 坤=地·母·土·方·腹·牛·柔顺
- 震=雷·长男·木·动·足·龙·惊
- 巽=风·长女·木·入·股·鸡·散
- 坎=水·中男·水·陷·耳·豕·险
- 离=火·中女·火·丽·目·雉·明
- 艮=山·少男·土·止·手·狗·静
- 兑=泽·少女·金·悦·口·羊·说

外应（环境信息）也要纳入判断。
`;
```

---

## 六C、模块六：奇门遁甲

### 用户流程

```
1. 输入：日期时间（或使用当前时间）
2. 系统排盘：确定阴阳遁→局数→布地盘→天盘→人盘→神盘
3. 显示九宫完整奇门盘
4. AI解读
```

### 算法（参考 `reference/qimen-algorithm.md` + `06-qimen/02-zhifu-zhishi-cases.md`）

### AI断事 Prompt

```javascript
const QIMEN_SYSTEM_PROMPT = (style) => `
你是一位精通奇门遁甲的术数师。${style === 'casual'
  ? '你像大师兄，沉稳认真，对奇门有敬畏心，讲解清晰有条理。'
  : '你用奇门专业术语精确分析，引用经典格局口诀。'}

奇门断事核心：
1. 找自己（日干所在宫位）→ 看星·门·神·仪组合
2. 找目标（按问事类型确定代表符号）：
   - 求财→戊(财) | 求官→开门+丁 | 婚姻→六合+乙庚
   - 疾病→天心(医)+天芮(病) | 出行→开门方位
3. 找阻碍→庚(阻碍/对手)所在宫位
4. 看奇仪格局（吉格/凶格）
5. 看值符值使的状态
6. 综合判断

吉格：乙+丙+丁(三奇)+开休生(三吉门)
凶格：庚+死惊+白虎+天芮

断事速查：
- 三奇得使 → 大吉
- 五不遇时 → 时干克日干，不利
- 门迫 → 八门入墓，事不成
- 击刑 → 门所在宫受刑，有灾
`;
```

---

## 六D、模块七：中医问诊（⭐新增大模块）

### 功能概览

中医模块不是"治病"，而是**体质辨识+养生建议+术数交叉分析**。

### 子模块

#### 7A. 体质辨识

```
用户流程：
1. 回答20-30个自测问题（九大体质量表）
   - 你是否经常感觉疲乏无力？
   - 你的手脚是否经常冰凉？
   - 你是否容易出汗？
   ...
2. 系统计算体质得分 → 判定体质类型
3. AI给出个性化调理方案
```

```javascript
// 体质量表评分
const CONSTITUTION_QUESTIONS = [
  { q:'你是否经常感觉疲乏无力？', type:'气虚', weight:2 },
  { q:'你的手脚是否经常冰凉？', type:'阳虚', weight:2 },
  { q:'你是否经常口干、手心脚心发热？', type:'阴虚', weight:2 },
  { q:'你是否容易腹胀、身体偏胖？', type:'痰湿', weight:2 },
  { q:'你的面部是否容易出油、长痘？', type:'湿热', weight:2 },
  { q:'你的嘴唇颜色是否偏暗紫？', type:'血瘀', weight:2 },
  { q:'你是否经常叹气、情绪低落？', type:'气郁', weight:2 },
  { q:'你是否容易过敏（花粉、食物等）？', type:'特禀', weight:2 },
  // ... 每种体质3-4个问题，5级评分
];

function assessConstitution(answers) {
  const scores = { 气虚:0, 阳虚:0, 阴虚:0, 痰湿:0, 湿热:0, 血瘀:0, 气郁:0, 特禀:0, 平和:0 };
  // 计算各体质得分 → 排序 → 返回主体质+兼体质
  return { primary: '痰湿质', secondary: '气虚质', scores };
}
```

#### 7B. 子午流注

```
用户流程：
1. 显示当前时辰 → 对应经脉 → 当令脏腑
2. 给出当下的养生建议
3. 可查看全天12时辰养生时刻表
```

#### 7C. 五运六气

```
用户流程：
1. 输入年份（或自动取当年）
2. 系统计算：天干→五运（太过/不及） + 地支→六气（司天/在泉）
3. AI分析该年气候特点和易发疾病
```

#### 7D. 八字看健康

```
用户流程：
1. 输入八字（或从八字模块导入）
2. 分析五行偏弱 → 对应脏腑风险
3. 结合当年五运六气 → 流年健康提示
4. 给出饮食/穴位/运动建议
```

### AI中医师 Prompt

```javascript
const TCM_SYSTEM_PROMPT = (style, subModule) => `
你是一位精通中医理论的养生顾问。${style === 'casual'
  ? '你像一位慈祥的老中医，说话平和温暖，善于用生活化的语言解释中医概念，经常打比方。'
  : '你用专业中医术语分析，引用《黄帝内经》《伤寒论》等经典，辨证论治思路清晰。'}

核心知识体系：
1. 藏象学说（五脏六腑·五行对应）
   - 肝=木·胆·目·怒·酸·筋·春
   - 心=火·小肠·舌·喜·苦·脉·夏
   - 脾=土·胃·口·思·甘·肉·长夏
   - 肺=金·大肠·鼻·悲·辛·皮·秋
   - 肾=水·膀胱·耳·恐·咸·骨·冬

2. 辨证方法
   - 八纲辨证：表里·寒热·虚实·阴阳
   - 脏腑辨证：定位到具体脏腑
   - 气血津液辨证：气虚·气滞·血虚·血瘀·痰湿

3. 体质九分法
   - 平和质·气虚质·阳虚质·阴虚质·痰湿质
   - 湿热质·血瘀质·气郁质·特禀质
   - 每种体质有对应的食疗·穴位·运动·禁忌方案

4. 食物四气五味
   - 四气：寒凉温热平
   - 五味入五脏：酸入肝·苦入心·甘入脾·辛入肺·咸入肾
   - 五行食疗：缺什么补什么，旺什么泻什么

5. 经络与子午流注
   - 十二经脉对应十二时辰
   - 每个时辰有当令脏腑和养生要点

6. 五运六气
   - 天干化运（甲己=土运, 乙庚=金运...）
   - 地支化气（子午=少阴君火司天...）
   - 太过/不及影响当年疾病趋势

7. 常用方剂方向（仅供参考方向，不开具处方）
   - 气虚→四君子方向 | 血虚→四物方向
   - 肝郁→逍遥方向 | 肾虚→六味/金匮方向
   - 痰湿→二陈方向 | 血瘀→桃红方向

${subModule === 'constitution' ? `
当前任务：体质辨识分析。根据用户的自测结果，分析体质类型，给出个性化的：
- 饮食建议（宜吃/忌吃的食物）
- 推荐茶饮（具体配方和用量）
- 穴位保健（具体穴位和按揉方法）
- 运动建议
- 生活方式调整
- 当季特别注意事项
` : ''}

${subModule === 'wuyun' ? `
当前任务：五运六气分析。根据年份计算运气特征，分析：
- 该年五运（太过/不及）对哪些脏腑影响大
- 司天在泉的气候特点
- 容易流行的疾病方向
- 不同体质的人该年需要特别注意什么
- 饮食和生活方式的调整建议
` : ''}

${subModule === 'health' ? `
当前任务：八字看健康。根据八字五行分析先天体质：
- 五行偏弱→对应脏腑先天不足
- 五行偏旺→对应脏腑可能亢进
- 结合大运流年→哪些阶段需要注意健康
- 给出长期养生方向（食疗+穴位+运动）
` : ''}

⚠️ 重要：你是养生顾问而非医生。始终在回答结尾加上：
"以上为中医养生参考建议，如有身体不适请及时就医。"
不要开具具体处方剂量，只提供方向性建议。
`;

const TCM_USER_PROMPT = {
  constitution: (result) => `
用户体质自测结果：
主体质：${result.primary}（得分 ${result.scores[result.primary]}）
兼体质：${result.secondary}（得分 ${result.scores[result.secondary]}）

各项得分：
${Object.entries(result.scores).map(([k,v]) => `${k}: ${v}分`).join('\n')}

请给出详细的个性化调理方案。
`,

  wuyun: (year) => `
分析年份：${year}年

请计算该年的五运六气，并给出健康养生建议。
`,

  health: (baziResult) => `
命主八字：
年柱：${baziResult.year.stem}${baziResult.year.branch}
月柱：${baziResult.month.stem}${baziResult.month.branch}
日柱：${baziResult.day.stem}${baziResult.day.branch}
时柱：${baziResult.hour.stem}${baziResult.hour.branch}

日主：${baziResult.dayMaster}
五行分布：木${baziResult.wxCount.wood} 火${baziResult.wxCount.fire} 土${baziResult.wxCount.earth} 金${baziResult.wxCount.metal} 水${baziResult.wxCount.water}
偏弱五行：${baziResult.weakElements.join('、')}
偏旺五行：${baziResult.strongElements.join('、')}

请分析先天体质特点和养生建议。
`,

  ziwu: (currentHour) => `
当前时辰：${currentHour}
请告诉用户现在哪条经脉当令，该做什么不该做什么。
`
};
```

---

## 六E、模块八：姓名分析

### 用户流程

```
1. 输入姓名（中文）
2. 系统自动查康熙字典笔画 → 计算五格
3. 查数理吉凶 + 三才配置
4. 可选输入八字 → 分析人格五行是否匹配用神
5. AI综合解读
```

### 算法（参考 `09-xingming/01-wuge.md`）

### AI姓名师 Prompt

```javascript
const NAME_SYSTEM_PROMPT = (style) => `
你是一位精通姓名学的分析师。${style === 'casual'
  ? '你说话温和有趣，善于把枯燥的数字讲得有意思。'
  : '你引用81数理表和三才配置表，专业而精确。'}

分析流程：
1. 展示五格计算过程（天格·人格·地格·外格·总格）
2. 每格查数理吉凶（81数理表）
3. 分析三才配置（天人地五行组合）
4. 如有八字信息，判断人格五行是否匹配用神
5. 综合评分和建议

注意：
- 五格用康熙字典笔画（繁体），不是简体
- 数理超过80减去80后查表
- 人格（主运）权重最大
- 三才相克组合要重点提示
- 五格剖象法有争议，提醒用户仅作参考
`;
```

---

## 六F、模块九：择日选时

### 用户流程

```
1. 选择事项类型（嫁娶/开业/搬家/动工/出行...）
2. 选择日期范围
3. 可选输入命主八字
4. 系统计算每天的：十二建除 + 黄黑道 + 特殊凶日排除
5. 综合评分排序 → 推荐最佳日期
6. AI解读选中日期
```

### 算法（参考 `reference/zeri-basics.md` + `reference/zeri-advanced.md`）

### AI择日师 Prompt

```javascript
const ZERI_SYSTEM_PROMPT = (style) => `
你是一位精通择日的术数师。${style === 'casual'
  ? '你实用接地气，不故弄玄虚，直接告诉用户哪天好哪天不好。'
  : '你引用十二建除和黄黑道理论，解释每个日子的具体含义。'}

择日核心规则：
1. 一票否决：四离四绝日·月破日·岁破日·杨公忌日
2. 十二建除：建满平收黑，除危定执黄，成开皆可用，闭破不相当
3. 黄黑道：青龙·明堂·金匮·天德·玉堂·司命=黄道吉日
4. 事项专属忌日（嫁娶忌白虎天刑，开业忌闭死等）
5. 与命主八字配合（日干宜用神，日支不冲命主日柱）
6. 天赦日=最大吉日，百无禁忌
`;
```

---

## 九B、AI Context管理（完整版）

### 按需加载策略

每次AI调用，只加载对应领域的断法规则到system prompt。

```javascript
const CONTEXT_LOADER = {
  liuyao: () => loadRules([
    '02-liuyao/05-duangua.md',    // 分类断卦（精简至~200行）
    '02-liuyao/07-koujue.md',     // 口诀（精简至~100行）
  ]),
  
  meihua: () => loadRules([
    '03-meihua/01-meihua-yishu.md', // 体用·取象（精简至~150行）
  ]),
  
  bazi: () => loadRules([
    '04-bazi/02-shishen.md',      // 十神（精简至~100行）
    '04-bazi/03-geju.md',         // 格局（精简至~100行）
  ]),
  
  ziwei: () => loadRules([
    '05-ziwei/04-star-details.md', // 星曜断语（精简至~200行）
    '05-ziwei/03-advanced-feixing.md', // 飞星四化（精简至~150行）
  ]),
  
  qimen: () => loadRules([
    '06-qimen/02-zhifu-zhishi-cases.md', // 断事矩阵（精简至~100行）
  ]),
  
  fengshui: () => loadRules([
    '07-fengshui/01-xuankong-feixing.md', // 飞星组合断（精简至~150行）
  ]),
  
  tcm_constitution: () => loadRules([
    '08-zhongyi/04-shiliao-tizhi.md',  // 九大体质方案（精简至~200行）
  ]),
  
  tcm_wuyun: () => loadRules([
    '08-zhongyi/03-wuyun-liuqi.md',    // 五运六气（精简至~150行）
  ]),
  
  tcm_health: () => loadRules([
    '08-zhongyi/01-zangxiang.md',      // 藏象（精简至~100行）
    '08-zhongyi/04-shiliao-tizhi.md',  // 食疗（精简至~100行）
  ]),
  
  tcm_ziwu: () => loadRules([
    '08-zhongyi/02-jingluo-ziwu.md',   // 子午流注（精简至~100行）
  ]),
  
  tcm_jingfang: () => loadRules([
    '08-zhongyi/05-jingfang.md',       // 经方参考（精简至~100行）
  ]),
  
  naming: () => loadRules([
    '09-xingming/01-wuge.md',          // 五格（精简至~150行）
  ]),
  
  zeri: () => loadRules([
    'reference/zeri-advanced.md',       // 择日（精简至~100行）
  ]),
  
  teaching: (chapter) => loadRules([
    // 根据章节动态加载对应文件
    CHAPTER_FILE_MAP[chapter]
  ]),
};

// 每次加载控制在 1500-2000 tokens
// 精简策略：保留规则表和判断逻辑，去掉叙事文本和代码注释
```

---

## 七、教学模块

### 结构

```
从 compendium 的目录结构直接映射为课程章节：
00 练气期 → 宇宙观基础
01 筑基期 → 易经核心
02 金丹期 → 六爻占卜
03 金丹期 → 梅花易数
04 元婴期 → 八字命理
05 化神期 → 紫微斗数
06 合体期 → 奇门遁甲
07 渡劫期 → 堪舆风水
08 大乘期 → 岐黄医道
09 姓名学

每课有：
- 知识内容（从md文件渲染）
- 师父/师姐语音风格的讲解
- 随时可问AI的聊天框
- 课后小测
```

### AI教学助手 Prompt

```javascript
const TEACHING_SYSTEM_PROMPT = (chapter, style) => `
你是玄学综典的教学助手。当前学生正在学习：${chapter}

角色：
- 师父：教宇宙观、紫微、风水、中医（时正经时不正经）
- 师姐沈星河：教六爻、梅花（冷面严谨）
- 二师兄钱多余：教八字（话多爽快善比喻）
- 大师兄：教奇门遁甲、大六壬（沉稳有敬畏心）

根据当前章节自动选择对应角色说话。
回答学生问题时，引用compendium中的具体知识点。
用${style === 'casual' ? '通俗有趣' : '专业严谨'}的方式回答。
`;
```

---

## 八、测验模块

### 题型

```
1. 看卦断事：给一个六爻卦，问某个方面的吉凶
2. 十神辨认：给四柱，问某柱的十神
3. 星曜定位：给紫微盘，问某宫的星曜含义
4. 五行生克：基础五行关系判断
5. 飞星断事：给九宫飞星，问某方位吉凶

AI出题 → 用户作答 → AI评判+讲解
```

### AI出题 Prompt

```javascript
const QUIZ_SYSTEM_PROMPT = `
你是玄学测验出题官。根据用户选择的难度和领域出题。

出题格式（返回JSON）：
{
  "question": "题目文本",
  "options": ["A选项", "B选项", "C选项", "D选项"],
  "answer": "A",
  "explanation": "详细解释为什么答案是A",
  "difficulty": "初级/中级/高级",
  "domain": "六爻/八字/紫微/风水/基础"
}

出题规则：
- 初级：五行生克、基础概念、简单判断
- 中级：十神运用、用神判断、星曜组合
- 高级：综合断卦、格局判断、飞星化解
`;
```

---

## 九、AI调用架构

### API调用封装

```javascript
async function callAI(systemPrompt, userMessage) {
  const apiKey = localStorage.getItem('tianji-api-key');
  if (!apiKey) throw new Error('请先在设置中输入API Key');
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API错误: ${response.status}`);
  }
  const data = await response.json();
  return data.content?.[0]?.text || "AI解读暂时不可用";
}
```

// → 完整版Context管理见上方「九B、AI Context管理（完整版）」

---

## 十、UI设计规范

### 视觉风格

```
主题：东方玄学 × 现代极简
色调：
  - 主背景：深墨色 #0a0a0f 或暖黑 #12100e
  - 卡片背景：半透明暗色 rgba(20,18,15,0.9)
  - 主强调色：赤金 #c8956c（铜钱色）
  - 辅助色：玉青 #7ab8a8、朱砂 #c94043、靛蓝 #4a6fa5
  - 文字：米白 #e8e0d4
  - 五行色：木绿#6db870 火红#d4574a 土黄#d4a843 金白#c8c0b0 水蓝#5b8ec9

字体：
  - 标题：思源宋体 or serif回退（Noto Serif SC, serif）
  - 正文：思源黑体 or sans回退（Noto Sans SC, sans-serif）
  - 卦象/天干地支：等宽字体展示

特效：
  - 卡片微妙的内发光效果（box-shadow: inset 0 0 30px rgba(200,149,108,0.05)）
  - 铜钱/卦象的翻转动画
  - 页面切换的淡入淡出
  - AI文字逐字打出效果

布局：
  - 左侧：输入面板 / 术数选择
  - 右侧：盘面展示 + AI解读
  - 响应式：移动端上下布局
```

### 关键UI元素

```
1. 铜钱组件（六爻用）
   - 三枚铜钱可点击翻转
   - 正面显示"乾隆通宝"纹理
   - 背面显示满文
   - 翻转有3D动画

2. 卦象显示组件
   - 六爻从下到上排列
   - 阳爻：实线 ⚊
   - 阴爻：断线 ⚋
   - 动爻：闪烁或标注"○"
   - 变卦用箭头连接

3. 八字四柱组件
   - 四列卡片排列
   - 每列：天干（大字）+ 地支（大字）+ 藏干（小字）+ 十神标签
   - 五行颜色标注

4. 紫微十二宫组件
   - 4×3 方阵
   - 每宫显示：宫名 + 主星 + 四化标记
   - 命宫高亮
   - 点击某宫可展开详情

5. 九宫飞星组件
   - 3×3 网格
   - 每宫显示：运星 + 山星 + 向星 + 年星
   - 凶方红色标注，吉方绿色标注
```

---

## 十一、日柱计算方案

八字排盘中日柱无公式，需要查表。有两种方案：

### 方案A：基准日推算法（推荐）

```javascript
// 已知：2000年1月1日 = 甲子日 (干支序号0)
// 从基准日计算天数差，对60取模
const BASE_DATE = new Date(2000, 0, 1); // 2000-01-01
const BASE_GANZHI = 0; // 甲子

function getDayGanzhi(year, month, day) {
  const target = new Date(year, month - 1, day);
  const diffDays = Math.floor((target - BASE_DATE) / 86400000);
  const idx = ((BASE_GANZHI + diffDays) % 60 + 60) % 60;
  return {
    stem: TIANGAN[idx % 10],
    branch: DIZHI[idx % 12]
  };
}
// ⚠️ 需要验证基准日的干支是否正确
// 可用多个已知日期交叉验证
```

### 方案B：内嵌简化万年历

```javascript
// 每年1月1日的日干支序号表（1900-2100）
// 体积约800字节，够用
const YEAR_DAY1_GANZHI = {
  1900: 0, 1901: 5, 1902: 10, /* ... */
};
```

---

## 十二、免责声明

所有页面底部固定显示：

```
⚠️ 本工具基于中国传统文化知识体系，所有占算和分析结果仅供参考和学习。
不构成任何医疗、法律、财务或人生决策建议。重大决策请咨询专业人士。
```

---

## 十三、开发顺序建议

```
Phase 1（MVP）：
  ✅ 整体框架 + 导航 + 设置面板（5个Tab）
  ✅ 六爻完整链路（摇卦→装卦→AI断卦）
  ✅ AI调用集成 + 通俗/专业切换
  → 可以demo验证

Phase 2（命理）：
  ✅ 八字完整链路（输入→排盘→AI分析）
  ✅ 梅花易数（报数/时间起卦→AI断）

Phase 3（高级术数）：
  ✅ 紫微完整链路
  ✅ 奇门遁甲完整链路
  ✅ 风水飞星完整链路

Phase 4（中医问诊）：
  ✅ 体质辨识（问卷→评分→AI方案）
  ✅ 子午流注（实时经脉提示）
  ✅ 五运六气（年度分析）
  ✅ 八字看健康（五行→脏腑→食疗）

Phase 5（工具）：
  ✅ 姓名五格分析
  ✅ 择日选时
  ✅ 64卦查询搜索
  ✅ 纯排盘工具

Phase 6（教学+测验）：
  ✅ 教学模块（9领域章节）
  ✅ 测验模块
  ✅ 全面UI打磨
```

---

## 十四、Compendium 文件索引

开发时需要参考的核心文件：

| 功能 | 参考文件 | 用途 |
|------|---------|------|
| **六爻** | | |
| 六爻算法 | `reference/liuyao-algorithm.md` | 纳甲·世应·装卦 |
| 六爻伏神 | `reference/liuyao-fushen.md` | 飞伏神表 |
| 六爻断法 | `02-liuyao/05-duangua.md` | 分类断卦规则(AI用) |
| 六爻口诀 | `02-liuyao/07-koujue.md` | 断卦口诀(AI用) |
| 六爻案例 | `02-liuyao/06-case-studies.md` | 6个实战卦例 |
| **梅花** | | |
| 梅花总法 | `03-meihua/01-meihua-yishu.md` | 起卦·体用·取象 |
| 梅花案例 | `03-meihua/02-quxiang-cases.md` | 取象案例 |
| **八字** | | |
| 八字算法 | `reference/bazi-algorithm.md` | 排盘公式 |
| 八字十神 | `04-bazi/02-shishen.md` | 十神含义(AI用) |
| 八字格局 | `04-bazi/03-geju.md` | 格局判断(AI用) |
| 八字案例 | `04-bazi/05-cases-hunyin.md` | 实战+合婚 |
| 节气表 | `reference/jieqi-table.md` | 月柱计算 |
| 长生表 | `reference/changsheng-table.md` | 旺衰判断 |
| 神煞 | `reference/shensha-table.md` | 八字神煞 |
| **紫微** | | |
| 紫微算法 | `reference/ziwei-algorithm.md` | 安星规则(627行) |
| 紫微星曜 | `05-ziwei/04-star-details.md` | 星曜断语(AI用) |
| 紫微飞星 | `05-ziwei/03-advanced-feixing.md` | 四化断法(AI用) |
| **奇门** | | |
| 奇门算法 | `reference/qimen-algorithm.md` | 排盘算法 |
| 奇门断事 | `06-qimen/02-zhifu-zhishi-cases.md` | 值符值使+案例(AI用) |
| **风水** | | |
| 飞星风水 | `07-fengshui/01-xuankong-feixing.md` | 排盘+组合断(AI用) |
| 罗盘数据 | `07-fengshui/03-luopan-data.md` | 24山·八宅 |
| 形煞 | `07-fengshui/02-xingsha-catalog.md` | 形煞图鉴(AI用) |
| **中医** | | |
| 藏象理论 | `08-zhongyi/01-zangxiang.md` | 脏腑·四诊·辨证(AI用) |
| 经络穴位 | `08-zhongyi/02-jingluo-ziwu.md` | 子午流注·穴位(AI用) |
| 五运六气 | `08-zhongyi/03-wuyun-liuqi.md` | 运气推算(AI用) |
| 食疗体质 | `08-zhongyi/04-shiliao-tizhi.md` | 九大体质方案(AI用) |
| 方剂参考 | `08-zhongyi/05-jingfang.md` | 十大经方(AI用) |
| **姓名学** | | |
| 五格算法 | `09-xingming/01-wuge.md` | 计算+数理(AI用) |
| **择日** | | |
| 择日基础 | `reference/zeri-basics.md` | 十二建除 |
| 择日高级 | `reference/zeri-advanced.md` | 黄黑道+流程(AI用) |
| **通用数据** | | |
| 干支数据 | `reference/tiangan-dizhi.md` | 合冲刑害·半合暗合 |
| 五行表 | `reference/wuxing-table.md` | 全面对应关系 |
| 64卦爻辞 | `reference/64gua-yaoci-part1/2.md` | 完整卦辞爻辞 |
| 64卦搜索 | `reference/64gua-search-engine.md` | 查卦工具 |
| 验证用例 | `reference/test-cases.md` | 算法验证 |
