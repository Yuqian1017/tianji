# Changelog

## 2026-03-07

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
