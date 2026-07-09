# APP-SPEC-A.md — 产品A：天机卷·排盘工具

> CC优先开发此产品。一个纯粹好用的术数排盘+AI解读工具。
> 不含游戏系统·不含教学·不含NPC角色。做完即可用。

---

## 定位

输入 → 排盘（本地JS计算）→ AI解读（Claude API）→ 输出

**不做什么**：不做境界系统、不做NPC对话、不做教学、不做测验。
这些留给产品B。

---

## 技术栈

- **构建**：Vite + npm
- **框架**：React
- **样式**：Tailwind CSS
- **AI**：Anthropic Claude API（claude-sonnet-4-20250514）
- **API Key**：用户自行输入，存 localStorage
- **CORS**：使用 `anthropic-dangerous-direct-browser-access: true` header，或 Vite proxy
- **无后端·无登录**

---

## 功能列表（按开发顺序）

### Phase A1：六爻 + 八字（MVP）

```
六爻占卜：
  输入：问事文本 + 摇卦（手动/随机）
  计算：装卦（纳甲·世应·六亲·六神·伏神·动爻·变卦）
  输出：卦面展示 + AI断卦
  算法文件：reference/liuyao-algorithm.md + reference/liuyao-fushen.md

八字排盘：
  输入：出生年月日 + 时辰 + 性别
  计算：四柱 + 十神 + 日主强弱 + 用神 + 大运
  输出：四柱展示 + AI分析
  算法文件：reference/bazi-algorithm.md + reference/jieqi-table.md
```

### Phase A2：梅花 + 紫微

```
梅花易数：
  输入：两个数字 或 当前时间
  计算：上下卦 + 动爻 + 体用
  输出：卦象 + AI断事（体用生克+取象）
  算法文件：03-meihua/01-meihua-yishu.md

紫微斗数：
  输入：农历生日 + 时辰 + 性别
  计算：安十二宫 + 安主星 + 四化
  输出：十二宫方阵 + AI解盘
  算法文件：reference/ziwei-algorithm.md
```

### Phase A3：风水 + 奇门 + 工具

```
风水飞星：
  输入：坐向 + 建造/入住年份
  计算：运盘 + 山盘 + 向盘 + 年飞星
  输出：九宫盘 + AI断吉凶
  算法文件：07-fengshui/01-xuankong-feixing.md + 03-luopan-data.md

奇门遁甲：
  输入：日期时间
  计算：阴阳遁 + 局数 + 四盘
  输出：九宫奇门盘 + AI断事
  算法文件：reference/qimen-algorithm.md + 06-qimen/02-zhifu-zhishi-cases.md

小工具：
  - 姓名五格分析（09-xingming/01-wuge.md）
  - 择日评分（reference/zeri-advanced.md）
  - 64卦查询（reference/64gua-search-engine.md）
  - 体质自测（08-zhongyi/04-shiliao-tizhi.md）
  - 子午流注（08-zhongyi/02-jingluo-ziwu.md）
  - 五运六气（08-zhongyi/03-wuyun-liuqi.md）
```

---

## UI结构

```
┌─────────────────────────────────────────┐
│  天机卷 ·                    [通俗|专业]  │
├────┬────────────────────────────────────┤
│    │                                    │
│ 六 │  ┌────────────┐  ┌─────────────┐  │
│ 爻 │  │ 输入区      │  │             │  │
│    │  │(问事+摇卦)  │  │  AI 解 读   │  │
│ 八 │  ├────────────┤  │             │  │
│ 字 │  │ 排盘结果    │  │             │  │
│    │  │(卦面/四柱)  │  │             │  │
│ 梅 │  │            │  │             │  │
│ 花 │  └────────────┘  └─────────────┘  │
│    │                                    │
│ 紫 │                                    │
│ 微 │                                    │
│    │                                    │
│ 风 │                                    │
│ 水 │                                    │
│    │                                    │
│ 奇 │                                    │
│ 门 │                                    │
│    │                                    │
│ 工 │                                    │
│ 具 │                                    │
│    │                                    │
├────┴────────────────────────────────────┤
│ ⚠️ 仅供参考，不构成任何决策建议。         │
└─────────────────────────────────────────┘
```

---

## AI调用

### 统一封装

```javascript
async function askAI(systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "解读暂时不可用";
}
```

### 风格切换

```javascript
const STYLE_PREFIX = {
  casual: '用通俗易懂的语言解释，多用比喻，让没有基础的人也能理解。',
  professional: '用专业术语精确分析，引用经典口诀和规则，逻辑严密。'
};
```

### 各模块System Prompt

六爻·八字·紫微·风水·奇门·梅花的完整Prompt模板 → 见 `APP-SPEC.md` 对应章节。
中医·姓名·择日的Prompt模板 → 见 `APP-SPEC.md` 六D/六E/六F章节。

产品A直接复用APP-SPEC中的Prompt，不需要NPC角色包装。

---

## 视觉风格

```
色调：深墨背景 #0a0a0f · 赤金强调 #c8956c · 米白文字 #e8e0d4
五行色：木#6db870 火#d4574a 土#d4a843 金#c8c0b0 水#5b8ec9
卡片：rgba(20,18,15,0.9) + 内发光
字体：serif标题 + sans正文
动画：铜钱翻转·AI文字逐字打出·卦象淡入
```

---

## 开发提示

```
⭐ 最重要：先做六爻MVP。做完给用户看。确认能跑通再做下一个。
   详见 CC-FIRST-TASK.md。

1. 六爻是最容易验证的——摇6次就能看到完整结果+AI解读。
2. 做完六爻后加八字。日柱用基准日推算法（见APP-SPEC.md十一章）。
3. 紫微排盘最复杂（627行算法），放最后。
4. 算法文件是伪代码，每个都要跑验证用例（reference/test-cases.md）。
5. 每个术数模块独立——做完一个能用一个，不互相依赖。
6. 如果算法有bug，先修knowledge文件再改APP代码，然后更新CHANGELOG.md。
```
