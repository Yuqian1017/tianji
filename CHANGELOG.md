# Changelog

## 2026-03-07

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
