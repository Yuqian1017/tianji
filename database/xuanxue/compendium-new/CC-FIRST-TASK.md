# CC-FIRST-TASK.md — CC的第一个任务

> **CC，只看这个文件就够了。做完这个再看其他。**

---

## 任务：做一个六爻摇卦+AI断卦的 Web App

### 就这一件事。不做八字，不做紫微，不做游戏，不做教学。

---

## 技术栈

```
Vite + React + Tailwind CSS
不需要后端。纯前端项目。
Claude API 在前端直接调用（用户自己输入API key）。
```

## API Key 处理

```
这是独立部署的项目，不在 claude.ai Artifact 环境里。
所以需要用户自己提供 Anthropic API key。

实现方式：
1. 首次打开 → 显示设置面板，要求输入 API key
2. 保存到 localStorage（键名：tianji-api-key）
3. 每次调用 Claude API 时从 localStorage 取
4. 设置里可以修改/清除 key
5. 请求头加上：headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }
6. ⚠️ 注意：浏览器直接调 Anthropic API 会有 CORS 问题
   解决方案（选一个）：
   a. 用 Vite 的 proxy 配置（开发时有效）
   b. 写一个极简的 API 代理（如 vite plugin 或 express middleware）
   c. 如果 Anthropic 已支持 CORS 则直接调用（先试）
   d. 用 anthropic-dangerous-direct-browser-access: true header
```

```javascript
// API调用封装
async function askAI(systemPrompt, userMessage) {
  const apiKey = localStorage.getItem('tianji-api-key');
  if (!apiKey) throw new Error('请先设置API Key');
  
  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
  if (!res.ok) throw new Error(`API错误: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "解读暂时不可用";
}
```

## 功能

```
1. 用户输入占问事项（一行文本框）
2. 点击「摇卦」按钮，模拟三枚铜钱×6次
   - 每次随机生成三枚铜钱正反（正=3分 反=2分）
   - 三枚总分：6=老阴 7=少阳 8=少阴 9=老阳
   - 从初爻到上爻摇6次
   - 也可以提供「一键随机起卦」（6个数一次生成）
3. 自动装卦：
   - 确定本卦上下卦 → 查卦名
   - 确定动爻 → 求变卦
   - 纳甲（地支上卦）
   - 安世应
   - 安六亲
   - 安六神（需要日干，用当天的）
4. 显示卦面（文字版即可，不需要花哨UI）
5. 调用 Claude API 断卦
6. 显示AI解读
```

## 算法

读这两个文件，里面有完整的纳甲表、世应表、六亲算法：
- `reference/liuyao-algorithm.md`（301行·排盘全流程）
- `reference/liuyao-fushen.md`（255行·飞伏神表）

关键数据结构直接从这两个文件的代码块里复制：
- `NAJIA` 对象：八卦纳甲表（每卦对应哪些地支）
- `BAGONG` 对象：64卦八宫归属
- `SHIYAO_POS` 对象：世应爻位
- `LIUQIN` 函数：根据五行生克关系安六亲
- `LIUSHEN` 数组：根据日干安六神

## AI断卦

```javascript
const SYSTEM_PROMPT = `你是一位精通六爻占卜的术数师。说话通俗易懂，善于用比喻。

断卦流程：
1. 先看卦名，总论此卦对问事的方向
2. 根据问事确定用神：
   - 事业/考试 → 官鬼  - 财运 → 妻财
   - 感情(男) → 妻财  - 感情(女) → 官鬼  
   - 健康 → 世爻+子孙
3. 看用神旺衰：月建生克？日辰生克？
4. 看动爻对用神的影响
5. 看世应关系
6. 给出结论和建议

核心规则：
- 用神旺相不受克 = 吉
- 用神休囚受克 = 凶
- 六冲卦 = 事散
- 六合卦 = 事合
- 世爻空亡 = 心不诚或事不成

最后加一句免责：仅供参考。`;

// user prompt里把排盘结果全部传进去
```

## UI

暗色背景 + 赤金强调色就行。不用花太多时间在UI上。核心是能用。

```
布局：上面输入+摇卦，中间卦面，下面AI解读
配色：背景 #0a0a0f，文字 #e8e0d4，强调 #c8956c
```

## 验证

做完后用这个例子测试：
- 随机起一卦
- 检查：卦名是否正确（上下卦对应）
- 检查：纳甲是否正确（对照 reference/liuyao-algorithm.md 的表）
- 检查：世应是否正确
- 检查：六亲是否正确（卦宫五行与各爻五行的生克）
- 检查：AI是否能正常返回解读

## 做完之后

跑通了告诉用户。然后再看 `APP-SPEC-A.md` 加八字模块。

---

## ⚠️ 不要做的事

```
❌ 不做八字排盘
❌ 不做紫微斗数
❌ 不做风水飞星
❌ 不做游戏系统/境界/灵力
❌ 不做教学模块
❌ 不做NPC角色
❌ 不做道侣系统
❌ 不做持久化存储
❌ 不做多页面路由

只做：六爻摇卦 → 装卦 → AI断卦。一个页面。
```
