# Changelog

## 2026-03-08

### feat: 八字命理模块 (BaZi / Four Pillars of Destiny)
- **完整排盘引擎** (`engine.js` ~400行): paiBazi() 计算四柱天干地支、十神、藏干十神、纳音、长生十二宫、身强弱评估、大运推算、五行统计、空亡、神煞
  - 日柱基准复用六爻已验证基准 (2024-02-04 = 甲子)
  - 节气精确时间表 2024-2026 硬编码 UTC 时间戳，范围外近似公式 + 警告
  - 子时(23:00)自动换日、立春前自动归上一年
  - 身强弱三要素评分：月令得令(40%) + 帮身泄身(40%) + 通根(20%)
  - 大运推算：阳年男/阴年女顺排，反之逆排，起运年龄 = 距节气天数÷3
- **静态数据表** (`data.js` ~260行): 十天干地支、五行映射、藏干表、60甲子纳音、长生起始位、地支关系(六合/六冲/三合/三会/六害/三刑)、天干五合、桃花驿马华盖、时辰表
- **排盘UI** (`BaziModule.jsx` ~470行):
  - 出生信息输入：年(1920-2027)/月/日/时辰(12时辰)/性别 下拉选择
  - 四柱网格 PillarGrid：4列×8行 (标签/十神/天干/地支/藏干/藏干十神/纳音/长生)，日柱金色高亮，天干地支按五行着色
  - 身强弱摘要 StrengthSummary：日主五行 + 身旺/中和/身弱 badge + 分数 + 判断因素
  - 五行分布条形图 WuxingBar：五行色带 + 空亡显示
  - 大运时间线 DayunTimeline：8步横向可滚动卡片，当前年龄区段高亮
  - 命局关系 InteractionsPanel：六合/六冲/三合/三刑/六害/天干合/神煞
  - AI 解读 + 流式输出 + 追问对话
- **AI system prompt** (`prompt.js`): 八字命理专用 prompt，七步分析流程 + 核心规则 + 通俗表达要求
- **App.jsx**: 新增八字命理 tab + import + 条件渲染
- **HistoryDrawer.jsx**: 新增 bazi 模块标签 + 四柱摘要显示 (如 "庚午 壬午 丁丑 丙午")
- **精度验证**: 手动验证多组已知八字 (1990-06-15午时、2025-01-15辰时立春前、2024-06-15子时换日)，四柱/十神/纳音/长生均准确
- **四主题适配**: ink/jade/dao/dark 四套主题下排盘网格、五行色、大运卡片均正常显示
- **新增文件**: `src/modules/bazi/data.js`, `engine.js`, `prompt.js`, `BaziModule.jsx`
- **修改文件**: `src/App.jsx`, `src/components/HistoryDrawer.jsx`

## 2026-03-08 (earlier)

### feat: 深色主题 + 铜钱动画 + 梅花动画 + 视觉升级
- **深色主题「夜观星象」**: 新增高对比度暗色主题 (deep navy #0f1118)，47 个 CSS 变量，fal 生成星空夜山背景 (bg-dark.webp)，半透明卡片 backdrop-blur，金/翡翠/朱砂配色
- **六爻铜钱动画重做**: 文字铜钱 div → fal 生成古铜钱图片 (coin-front.webp / coin-back.webp)，新增 coin-toss (抛起旋转)、coin-bounce (弹跳落地)、coin-shadow (地面阴影) 三组 CSS 动画，交错 stagger 效果
- **梅花起卦动画**: 新增 CastingAnimation 组件 (旋转太极 ☯ 符号 + 脉冲)，1.2s 延迟后显示结果；MeihuaDisplay 各区域 staggered reveal (trigram-grow + meihua-reveal) 渐次展开
- **Banner 全宽修复**: 移除 `max-w-3xl` 约束，banner 改为 `w-full` 全屏宽度，消除两侧断裂
- **视觉增强工具类**: `.card-hover` (悬浮微抬), `.btn-glow` (按钮光晕), `.input-focus-ring` (输入框聚焦光环), `.animate-divider-shimmer` (分割线微光呼吸)
- **fal 新素材**: coin-front.webp (104KB), coin-back.webp (89KB), bg-dark.webp (75KB)
- **修改文件**: index.css (+180 lines), App.jsx, ThemePicker.jsx, LiuyaoModule.jsx, MeihuaModule.jsx, generate-assets.js

## 2026-03-07

### feat: 品牌素材集成 + API 错误优化
- **Banner 横幅**: header 下方添加仙山云鹤全宽横幅，半透明渐隐效果
- **Tab 图标**: 用 fal 生成的铜钱/梅花图标替换原来的 emoji (☰/❀)
- **云纹分割线**: footer 上方添加金色云纹装饰分割线
- **背景纹理**: 三套主题都有各自的 fal 生成背景 (ink=水墨山、jade=玉石纹、dao=宣纸)
- **API 错误信息中文化**: 解析 Anthropic API 错误 JSON，映射为友好中文提示
  - 余额不足 → "API 余额不足，请前往 Anthropic Console 充值后重试"
  - Key 无效 → "API Key 无效，请在设置中检查并重新输入"
  - 频率限制 → "请求过于频繁，请稍后再试"
  - 服务繁忙 → "Claude 服务繁忙，请稍后再试"

### fix: CSS 变量继承 + 素材生成
- **修复主题切换不生效 bug**: `data-theme` 属性原错误放在 `<body>` 上，导致 `[data-theme="ink"]` 选择器匹配 body 覆盖了 html 上的 jade/dao 变量。修复：移至 `<html>`，body 不再设置 data-theme
- **移除 `@theme` 变量**: Tailwind v4 的 `@theme` 用 `@property { inherits: false }` 注册变量，阻止 html→body 继承。改为 `:root` 常规 CSS 变量 + `[data-theme]` 覆盖
- **fal API 素材生成完成**: 运行 `generate-assets.js` 生成全套 8 个素材 (3 背景 + 3 图标 + banner + divider)

### feat: 修仙风 light 主题系统 (三套方案)
- **主题切换系统**: 三套 light 修仙风主题通过 `data-theme` CSS 变量切换
  - **水墨留白** (`ink`): 米色宣纸底、深墨棕文字、水墨远山背景
  - **仙府玉石** (`jade`): 月白色底、琥珀金强调、玉石半透明卡片 + backdrop-blur
  - **道观清修** (`dao`): 纯净暖白底、檀木色强调、极简克制
- **ThemePicker 组件**: 三套主题预览卡片 (名称+描述+色板)，一键切换，存 localStorage
- **全局 CSS 变量重构**: 将所有组件中 50+ 处硬编码 `rgba(...)` 色值替换为语义化 CSS 变量
  - `--color-gold-bg`, `--color-gold-border`, `--color-surface-dim`, `--color-placeholder` 等 25+ 语义变量
  - 三套主题各自定义完整变量集，切换主题无需改动组件代码
- **字体优化**: 引入 Google Fonts `Noto Serif SC` (标题) + `Noto Sans SC` (正文)
  - `.font-title` 衬线体用于卦名、标题
  - `.font-body` 无衬线体用于正文、按钮
- **五行色 light 适配**: 加深五行颜色确保浅色背景上对比度达标
- **fal API 素材生成脚本**: `scripts/generate-assets.js` 可批量生成背景纹理、模块图标、banner、分割线 (需 FAL_KEY)
- **新增文件**: `src/components/ThemePicker.jsx`, `scripts/generate-assets.js`
- **修改文件**: `index.css`, `App.jsx`, `SettingsPanel.jsx`, `HistoryDrawer.jsx`, `LiuyaoModule.jsx`, `MeihuaModule.jsx`, `index.html`

### feat: multi-module architecture + 梅花易数
- **Tab navigation**: Header redesigned with "天机卷" title + tab bar (六爻占卜 | 梅花易数)
- **Modular architecture**: Monolithic App.jsx (~800 lines) split into:
  - `src/App.jsx` — Tab shell + shared state (~170 lines)
  - `src/lib/ai.js` — Generic Claude streaming API caller (shared)
  - `src/lib/history.js` — History persistence helpers (shared)
  - `src/components/SettingsPanel.jsx` — Settings modal (shared)
  - `src/components/HistoryDrawer.jsx` — History drawer with module badge & filtering (shared)
  - `src/modules/liuyao/LiuyaoModule.jsx` — Full liuyao UI + state (~530 lines)
  - `src/modules/meihua/MeihuaModule.jsx` — Full meihua UI + state (~450 lines)
- **梅花易数 (Plum Blossom Divination)** — New module with:
  - Three casting methods: 报数起卦 (numbers), 时间起卦 (time), 文字起卦 (text/strokes)
  - Full hexagram display: 本卦, 上下卦 with 先天八卦数 symbols, 体/用 labels, 五行 colors
  - 体用关系 analysis with verdict (用生体✅ / 体生用⚠️ / 用克体❌ / 体克用🔶 / 比和➡️)
  - 互卦 (process) and 变卦 (result) calculation and display
  - AI interpretation with module-specific system prompt + follow-up questions
  - `engine.js`: castByNumber, castByTime, castByText, formatForAI
  - `data.js`: 先天八卦数, 万物类象, 五行生克, 汉字笔画表 (~1500 characters)
- **History**: Added `module` field to history items; drawer filters by active tab, shows module badge (六爻/梅花)
- Page title changed to "天机卷 · 术数工具"

### feat: divination history
- **History drawer**: Right-side slide-out panel showing past divination sessions
- **Auto-save**: Sessions saved to localStorage after AI interpretation, updated on follow-up questions
- **Full restore**: Click a history entry to restore hexagram display + full AI conversation, can continue asking follow-ups
- **Delete**: Remove individual history entries (hover to reveal delete button)
- **Persistence**: Up to 50 entries stored in localStorage, survives page refresh
- `App.jsx`: Add `HistoryDrawer` component, `history`/`showHistory`/`activeHistoryId` state, `upsertHistory`/`handleLoadHistory`/`handleDeleteHistory` callbacks
- `index.css`: Add `drawer-in`/`drawer-out` keyframe animations

### feat: follow-up questions + coin animation
- **Multi-turn AI chat**: After initial interpretation, users can ask follow-up questions with full conversation history sent to Claude
- **Coin toss animation**: 3D rotateY spinning + bounce-landing CSS animation when shaking coins one-by-one
- `ai.js`: Export `SYSTEM_PROMPT`, change `aiInterpret` to accept full `messages[]` array, increase `max_tokens` to 4000
- `App.jsx`: Replace single `aiText` with `chatMessages[]` + `streamingText` + `followUpInput`; add `CoinAnimation` component and `animatingCoins` state
- `index.css`: Add `@keyframes coin-spin` and `@keyframes coin-land` with utility classes

### feat: initial Liuyao divination MVP
- Single-page React app for six-line (六爻) divination
- Coin tossing: one-by-one or quick-throw modes
- Full hexagram display: 本卦/变卦, 六神, 六亲, 纳甲, 世应, 空亡, 伏神
- Claude AI interpretation with streaming output
- Dark theme with gold/jade accents
- API key stored in localStorage (browser-only)
