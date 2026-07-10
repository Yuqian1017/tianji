# Changelog

## 2026-07-10

### fix: 固定并全量验证子午基础时辰经脉对应

- 按《针灸大成》固定 12 时辰、12 经脉、脏腑标签和循环顺序；明确使用分钟精度的本地民用时钟。
- 全天 1,440 分钟、12 行有限表、循环、来源见证和运行时边界共 4,457 项审计 0 fail；专项测试 7/7。
- 裁定原文连续段“午时手太阴心经”为本地 OCR/排印冲突，依据同书总表与心经章采用“手少阴心经”，并保留裁定记录。
- 移除 Ziwu 页面及八字健康旁路的“经当令、排毒、最佳补肾、提示肺问题”等旧医学化文案。
- 纳甲、纳子、六十六穴开穴、灵龟八法、针刺补泻和所有临床解释继续 `not_implemented/blocked`。

### docs: 完成第二轮主 PRD fresh review

- 独立只读 reviewer 结论为 `HOLD`：5 个 P1、2 个 P2，无 P0 finding。
- 记录无界 V0、P1 缺最小工具闭环、P0 缺可消费 Database、规范答案缺流派口径、掌握度与反刷题无算法合同等问题。
- 当前按用户明确要求继续全库验证；PRD 后续不得把本轮任务固化为首个教学切片的永久串行门槛。

### fix: 修复并全量验证五运六气基础年结构

- 以《素问》《医宗金鉴》和教材交叉固定十干中运、主客运太少、十二支司天在泉与主客六气。
- 补齐旧实现缺失的主运太少；五运边界改为春分后 13 日、芒种后 10 日、处暑后 7 日、立冬后 4 日交运。
- 修复非法年份/干支静默接受和“厥阴风木”被截成“阴风木”的 UI 问题。
- 60 年基础结构自动审计 3,325 项 0 fail；专项测试 9/9，桌面与 390×844 产品路径通过。
- 古法交司时刻、平气/天符/岁会/胜复和现实气候/医学解释继续 `not_implemented/blocked`。

### fix: 隔离未验证中医消费并建立首批安全规范库

- 核验中医 Skill v3 的 98 个 manifest 条目、50 个 reference 和 42 个原文 txt；本地与安装副本及上游 `966a88a` 一致，本地仅增加 SHA256 manifest。
- 归档旧体质/子午消费：34 题、9 套调养、28 个药物标签、22 个具体计量项和 30 个去重穴位；体质判定和药茶/艾灸方案暂停。
- 子午流注仅保留传统结构；五运六气移除脏腑/疾病/食疗；望诊限制为可见图像特征；八字健康继续 blocked。
- 规范化 28 项法定毒性中药 blocklist；Skill 的 100 行/101 药名剂量表因未按 2025 药典逐药校准继续 blocked。
- 新增 `audit:tcm-safety`、9 项中医测试、规范/legacy JSON 和验证报告；自动审计 213 项 0 fail。
- 体质、子午、五运、望诊在桌面和 390×844 移动端完成产品路径回归；旧医疗动作词为 0、无横向溢出、console 0 error/warning。

### fix: 修复并全量验证风水下卦确定性核心

- 声明“玄空飞星·沈氏下卦·正向盘”口径，修正二十四山三元龙/阴阳、山向盘同元龙顺逆、立春年界、节令月界和 2000 年后八宅命卦公式。
- 下卦只接受每山中线左右各 4.5 度；替卦、兼向与出卦未实现时显式拒绝。
- 项目内 216 张盘、6,469 项检查 0 fail；`@soul-atelier/xuankong@0.2.1` 的 6,048 个盘面字段 0 mismatch；tyme4ts 对 10,228 时刻的 30,684 个年/月边界字段 0 mismatch。
- 新增 `database/fengshui/fengshui-core.json`、双审计 artifact 和验证报告；旧 Vision API 副本标为 non-canonical。
- UI/AI 移除吉凶色、疾病财务组合、摆件/施工化解建议；只保留已验证盘面结构，传统解释继续 `not_validated`。

### fix: 修复并全量验证奇门遁甲确定性核心

- 声明“时家奇门·拆补转盘·中五寄坤二·天禽随天芮”口径，修复节气整日切换、符头三元、九宫地盘、六甲遁干、值符值使、九星八门八神和天盘干。
- 奇门输入增加分钟并贯通真太阳时与历史记录；非法日期、小时和分钟改为显式拒绝。
- 项目内 2020-2024 共 23,751 盘、1,900,230 项检查 0 fail；`3meta@2.6.0` 奇门核心 0 mismatch；`kinqimen@0.3.1` 共享口径 189,789 字段 0 mismatch。
- 新增 `database/qimen/qimen-core.json`、三层审计脚本和 9 项回归测试；旧 Vision API 副本标为 non-canonical。
- 格局、用神、疾病、诉讼、财务、方位和现实预测保持 `not_validated`；AI/UI 改为文化学习边界。

### fix: 修复并全量验证紫微斗数确定性核心

- 以整除/奇偶余数公式重建紫微安星表，修正旧表 100/150 格错误，并修复廉贞偏移、辛年魁钺、大限起宫和宫干。
- 无效公历日期、时辰、性别及内部不可能状态改为显式拒绝，不再静默归一化或回退到土五局/子宫。
- 项目内 2,880 盘、314,200 项检查全部通过；隔离 `iztro@2.5.8` 对照 325,440 字段，0 mismatch。
- 新增 `database/ziwei/ziwei-core.json`、`audit:ziwei`、第二实现审计和 7 项回归测试。
- 星性、格局、婚财、健康、飞星与流年断语保持 `not_validated`；AI/UI 已阻断疾病和高风险事实推断。

### fix: 校勘并规范化《周易》六十四卦核心库

- 逐条解析 64 卦、450 条卦爻辞，与维基文库固定快照对照，并用中国哲学书电子化计划裁决 12 卦差异。
- 修正 7 处经文问题，将剩余字形、转录与版本分歧写入 19 条 adjudication registry；革卦已/巳/己分歧不宣称唯一定本。
- 机械重算六爻错综互变换和京房八宫，修正 16 处综卦、5 处八宫和 48 处世爻错误。
- 修正铜钱起卦示例、上爻命名代码与《说卦传》「旉」摘录；传统作者说、固定吉凶和多动爻取法改为有边界的教学表述。
- 新增 `database/yijing/zhouyi-core.json`、`audit:yijing` 与 7 项回归测试；1,446 项审计检查全部通过。
- 关键词、简释、整卦吉凶和现实预测仍为 `not_validated`，不进入规范核心库。

### fix: 修复并全量验证梅花易数确定性结构

- 修复八卦二进制被二次反转造成的互卦、变卦错误，并纠正 Compendium 中“风泽中孚初爻变巽为风”的错误例题。
- 时间起卦改用农历月日、农历年支和时支；闰月明确沿用本月序数，不再使用公历近似。
- 删除错误手抄笔画表和 Unicode 码位估算，改用 Unicode 17.0 Unihan 机械生成的 20,992 字版本化数据库。
- 全量验证 64 卦名、384 种动爻结构、4,096 组报数、经典观梅例、农历边界与全部笔画条目；63,061 项检查均无差异。
- 体用只保留结构关系；现实吉凶与预测标为 `not_validated`，现代文字法标为 `source_pinned_modern_adaptation`。

### fix: 修复并全量验证六爻确定性排盘

- 按《卜筮正宗》修复乾外纳壬、坤外纳癸；纳甲 schema 拆分内外天干。
- 六爻年建、月建与日辰改用已验证历法适配层，移除固定日期近似；非法爻值改为显式拒绝。
- 全量验证 64 静卦、4,032 个动爻组合、八宫世应、六亲六神、旬空与伏神；17,026 项项目内检查及第二实现 33,408 字段比较均无差异。
- 排盘结构标为 `validated_deterministic`；现实预测与吉凶解释标为 `not_validated`，AI 不再输出无条件成败或高风险行动建议。

## 2026-07-09

### fix: 完成八字关系查表并隔离合化与吉凶

- 全量核验天干五合、地支六合/六冲/三合/三会/六害/相刑/自刑，以及桃花、驿马、华盖 36 项映射。
- 修复寅巳申、丑戌未只有三支齐全才报刑的漏检；两支相刑现在按方向输出，三支齐全只汇总一次。
- 三合、三会不再用标签宣称已化出五行，候选化神与 `not_evaluated` 状态分离。
- 相破因古籍版本差异保持 inactive；关系与神煞 UI 使用中性色并明确不判合化或吉凶。

### fix: 降级未校勘身强用神并阻断八字健康推断

- 以两条《滴天髓阐微》命例复核旧版身强/用神模型，确认 `/100` 无经典量表依据，统一“身旺喜克泄耗”存在直接反例。
- 身强分数仅保留作历史兼容；UI 与 AI 输入改为 `heuristic_only` 初筛，不再显示 `/100` 或确定用神方向。
- 五行条形图明确为“天干 1、藏干 0.5”的结构计数，不再暗示五行旺衰。
- 八字健康模块加入硬 validation gate；当前、旧历史与 AI 通道均不再生成脏腑风险、疾病、食疗或大运健康结论。

### fix: 修复八字历法核心、大运与太阳时

- 以现有 `lunar-javascript@1.7.7` 适配层替换八字 runtime 的手写节气、近似节气和本地 `Date` 日柱计算。
- 修复一月出生的大运前/后节搜索，固定 `Yun Sect 1 / traditional_shichen` 口径，新增起运年月日、交运公历日期和口径元数据，同时保留整数年龄兼容字段。
- 真太阳时标准时口径加入 NOAA 均时差；四个排盘调用点和城市预览统一使用日期化 offset。
- 均时差严格使用 NOAA 公式固定的 365 日分母，避免闰年年末出现约 27 秒的额外偏差。
- 新增 15 项八字回归/属性测试：30 例修复后 mismatch 清零，1920-2027 的 2,592 次节令侧检查与 39,447 日连续性通过。
- 以隔离安装的 `sxtwl@2.0.7` 做第二实现复核：30/30 四柱一致，1,296 个节令时刻最大差 20 秒；同时纠正审计脚本跨年取小寒的问题。
- 使用 `sxtwl` 相邻节令与《渊海子平》《三命通会》规则独立推导 30 例大运，方向、交运日期和首运干支 30/30 一致；结论仅覆盖声明口径，不包含吉凶解释。
- 第二审计强制先重建当前 runtime artifact，并记录 commit、dirty 状态、关键源码与 primary artifact SHA256，关闭 fresh review 发现的陈旧证据风险。
- 天干五合、地支六合输出不再把两干/两支同现直接写成“合化”；午未的火/土分歧保留为候选元数据，runtime 只显示可确认的“午未合”。
- 历史夏令时、身强/用神、地支关系与神煞继续留在 validation ledger，不随本次确定性修复自动通过。

### docs: 恢复天机卷主线与数据库治理基线

- 新增 `docs/PRD.md`，把当前排盘/问诊/相术工具定位为 Product A，并恢复 Product B 教学游戏与 Product C 统一产品主线。
- 新增 `docs/DATABASE_COVERAGE_MATRIX.md`，记录各知识域的 raw、runtime、normalized、reviewed 与 learning 覆盖。
- 新增 `docs/PROMINENT_SOURCE_MANIFEST.md`，登记玄学 compendium、中医 Skill 和当前代码的来源、版本关系、许可与校验状态。
- 新增项目术语表、路线图、任务监督器和校验脚本。
- 将项目 README 从 Vite 模板改为天机卷入口文档。

## 2026-03-13c

### feat: 面相 + 手相模块 (Face & Palm Reading Modules)

Added two new xiangshu (相术) modules using MediaPipe browser-side ML for feature extraction. Photos never leave the device — only structured text is sent to the LLM.

#### Face Module (`src/modules/face/`)
- **`data.js`**: Five-element face types (金/木/水/火/土), three-stop labels, twelve palaces, descriptor functions for eyes/nose/mouth/brows/chin/yintang/symmetry
- **`engine.js`**: `buildFaceTextMessage()` converts ML-extracted 468-point features into structured Chinese text for LLM
- **`prompt.js`**: System prompt with embedded 面相学 knowledge — 五行面型, 三停, 五官, 十二宫, analysis order, style requirements
- **`FaceModule.jsx`**: Camera capture → MediaPipe face detection → feature extraction → text-only LLM analysis → chat with follow-up

#### Palm Module (`src/modules/palm/`)
- **`data.js`**: Five-element hand types, 4-question palm line questionnaire (life/head/heart/fate lines with multiple-choice options), mound names (九大掌丘), finger meanings, descriptor functions
- **`engine.js`**: `buildPalmTextMessage()` combines ML features + questionnaire answers into structured text; `buildPalmVisionMessage()` for optional Vision API deep analysis
- **`prompt.js`**: System prompt with hand reading knowledge — palm lines (includes "生命线长短≠寿命" disclaimer), mounds, finger analysis, 2D:4D ratio
- **`PalmModule.jsx`**: Multi-step flow: capture → ML hand analysis → palm line questionnaire → text LLM → chat. Optional "AI视觉深度分析" button sends photo to Vision API for detailed palmistry

#### Shared Components
- **`PalmLineQuestionnaire.jsx`**: 4-question radio-button questionnaire for palm lines (MediaPipe can't detect fine skin lines)

#### App Integration
- **`App.jsx`**: Added face/palm imports, two new tabs under "相术" divider section, multi-divider support (`tab.id.startsWith('divider')`)
- **`HistoryDrawer.jsx`**: Added `face: '面相'` and `palm: '手相'` to MODULE_LABELS with face shape / hand type summaries

## 2026-03-13b

### feat: 用户账号系统 (Username/Password Authentication)

Added Express + SQLite backend with JWT authentication. Each user has isolated history records.

#### Backend (`server/`)
- **`server/db.js`**: SQLite database (`tianji.db`) with `users`, `history`, `config` tables. Auto-seeds `junshi` (user) and `admin` (admin) accounts on first run. WAL mode for concurrent reads.
- **`server/auth.js`**: bcryptjs password hashing + JWT (30-day expiry) sign/verify utilities. Secret auto-generated and stored in SQLite `config` table.
- **`server/middleware.js`**: `requireAuth` middleware — extracts Bearer token, validates JWT, attaches `req.userId/username/role`.
- **`server/routes/auth.js`**: `POST /register`, `POST /login`, `GET /me` endpoints. Input validation, duplicate username check, role assignment.
- **`server/routes/history.js`**: Full CRUD (`GET /`, `POST /`, `DELETE /:id`) + `POST /migrate` (bulk import, idempotent INSERT OR IGNORE) + `GET /export` + `DELETE /all`. All queries scoped to authenticated user.
- **`server/index.js`**: Express entry point on port 5821, JSON body limit 10MB, health check at `/api/health`.

#### Frontend Changes
- **`src/lib/api.js`** (new): Auth-aware `apiFetch()` wrapper — auto-injects JWT from localStorage, handles 401 with logout callback.
- **`src/lib/history.js`** (rewritten): All functions now call server API instead of localStorage. Keeps `loadHistoryFromStorage()` for one-time migration detection. Retains `formatTimestamp()`.
- **`src/components/LoginPage.jsx`** (new): Xianxia-themed login/register page with toggle, form validation, error display. Uses existing CSS variables for consistent theming.
- **`src/App.jsx`**: Added `user`/`authLoading` state, token validation on mount (`GET /me`), conditional `<LoginPage>` rendering, localStorage→server migration on first login, optimistic history upsert with async server sync, logout handler. All 11 module components unchanged (same 7-prop interface).
- **`src/components/SettingsPanel.jsx`**: Added "账号信息" section showing username + admin badge + logout button. Export/import/clear now use API endpoints.

#### Config Changes
- **`vite.config.js`**: Added `/api` proxy to `http://localhost:5821` for dev
- **`package.json`**: Added `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `concurrently`. Dev script runs both Vite and Express via `concurrently`.
- **`.gitignore`**: Added `tianji.db`

#### Seed Accounts
- `junshi` / `tianji123` (role: user) — existing localStorage records auto-migrate here
- `admin` / `admin123` (role: admin) — empty history

#### Migration
On first login, if `tianji-history` exists in localStorage, all records are bulk-imported to the user's server account via `/api/history/migrate` (idempotent). localStorage is cleaned after successful migration.

---

## 2026-03-13

### feat: 望诊模块 + 真太阳时校正

Added visual diagnosis (望诊) as the 11th module, and true solar time correction for birth-time modules.

#### Module 11: 望诊 (Visual Diagnosis via AI Vision)
- **`src/modules/wangzhen/data.js`** (~70行): 3 diagnosis types — tongue (舌诊, 6 dimensions), face (面诊, 8 dimensions), palm (手诊, 5 dimensions), each with capture guidance
- **`src/modules/wangzhen/engine.js`** (~50行): `buildVisionMessage()` constructs Anthropic multimodal message (image + text), `buildFollowUpMessage()` for follow-up
- **`src/modules/wangzhen/prompt.js`**: 6-step analysis system prompt (整体印象→逐项分析→脏腑判断→体质倾向→调养建议→进一步建议) + medical disclaimer
- **`src/modules/wangzhen/WangzhenModule.jsx`** (~280行): Standard 7-prop module — diagnosis type picker (3 cards), capture guidance with dimensions, optional symptom input, camera/upload → AI vision analysis (streaming) → follow-up chat. History stores type+note only (no base64 images)

#### Camera & Vision Infrastructure
- **`src/lib/camera.js`** (~60行): `openCamera()` (prefers user-facing camera, Chinese error messages), `captureFrame()` (canvas→JPEG base64 at 0.85 quality), `stopCamera()`
- **`src/components/CameraCapture.jsx`** (~210行): States: idle→requesting→streaming→captured→error. Supports live camera capture AND file upload fallback. Mirror preview, dashed guide overlay, 10MB file size limit
- **`src/lib/ai.js`**: Added `normalizeMessagesForOpenAI()` to convert Anthropic image blocks to OpenAI `image_url` format for OpenRouter compatibility. `callAnthropic()` unchanged (native support)

#### True Solar Time Correction (真太阳时校正)
- **`src/lib/cities.js`** (~480行): ~300 Chinese cities (all provinces + municipalities + overseas Chinese centers like Singapore, Tokyo, Vancouver) with `{ name, province, lng }`. Key functions: `searchCities()`, `calcTrueSolarTimeOffset()` (`(120-lng)*4` minutes), `adjustBirthTime()` (handles day/month boundaries via Date.UTC), `adjustHourBranch()` (for Ziwei branch-string hours), `formatTrueSolarTime()`, `formatOffset()`
- **`src/components/BirthCityPicker.jsx`** (~130行): Shared toggle+search component — "真太阳时校正" switch → fuzzy city search dropdown → displays longitude + offset. Outside-click to close
- **Integrated into 4 modules**:
  - `bazi/BaziModule.jsx`: Advanced settings, adjusts numeric time before paiBazi, shows "☀ 真太阳时" indicator
  - `bazihealth/BaziHealthModule.jsx`: Below gender buttons, adjusts before runHealthAnalysis
  - `ziwei/ZiweiModule.jsx`: Advanced settings, uses `adjustHourBranch()` for branch-string conversion
  - `qimen/QimenModule.jsx`: Advanced settings with caveat "部分派别使用真太阳时起课"

#### App Integration
- **App.jsx**: Import + register wangzhen tab (after bazihealth, before divider end)
- **HistoryDrawer.jsx**: `wangzhen: '望诊'` label + diagnosis type summary

## 2026-03-12

### feat: Phase 4 — 中医问诊模块 (TCM Wellness Modules)

Added 4 new TCM wellness modules with tab bar grouping (占算 | 问诊 divider).

#### Shared Infrastructure
- **`src/lib/tcm-data.js`** (~100行): Shared TCM reference data — WUZANG (五脏), WUXING_ORGAN_MAP, FOOD_QI (四气), FOOD_WUWEI (五味), WUXING_FOOD_THERAPY, JIEQI_YANGSHENG (24节气)
- **`src/components/ModuleIntro.jsx`**: Fixed to accept both string and array for `strengths` prop
- **`src/index.css`**: Added `.scrollbar-none` utility for horizontal tab scrolling
- **Tab bar grouping**: Visual divider between 占算 and 问诊 categories, horizontal scroll for 10 tabs

#### Module 7: 体质辨识 (Constitution Assessment)
- **data.js** (~250行): 9 constitution types (王琦九种体质), 34 questions, 9 therapy plans (food/tea/acupoints/exercise)
- **engine.js** (~80行): `assessConstitution()` scoring 0-100 per type, primary/secondary detection, `formatForAI()`
- **TizhiModule.jsx** (~500行): Step-by-step questionnaire (5-point Likert), SVG radar chart (9 axes), constitution result card, collapsible therapy plans, AI streaming chat

#### Module 8: 子午流注 (Meridian Clock)
- **data.js** (~180行): 12 shichen entries with organ/meridian/wuxing/yangsheng/illness, per-organ acupoints
- **engine.js** (~60行): `getCurrentShichen()` real-time detection, progress%, `formatForAI()`
- **ZiwuModule.jsx** (~300行): SVG 12-segment circular clock with animated hand, real-time update (30s interval), meridian detail card, acupoints display, expandable full-day table, AI chat

#### Module 9: 五运六气 (Five Movements Six Qi)
- **data.js** (~130行): TIANGAN_YUN, DIZHI_QI, QI_INFO, PRIMARY_YUN/QI, RECENT_YUNQI (2024-2029)
- **engine.js** (~120行): `getYearGanZhi()`, `getWuYun()` (太过/不及), `getKeYun()` (客运5段), `getLiuQi()` (司天/在泉), `getKeQi()` (客气6段), `analyzeYear()`, `formatForAI()`
- **WuyunModule.jsx** (~280行): Year selector (2020-2049) with ganzi, overview card (大运+司天+在泉), five transport + six qi color-coded timelines, detail sections, AI chat

#### Module 10: 八字看健康 (BaZi Health)
- **data.js** (~100行): WUXING_HEALTH (5 elements → organs/symptoms/risks/nurture), LIUYIN (6 pathogens), QIQING (7 emotions), SHICHEN_HEALTH
- **engine.js** (~120行): `analyzeBaziHealth()` (element distribution → organ mapping), `getLifeStageRisks()` (dayun → health focus), `getDietPlan()`, `runHealthAnalysis()` wrapper, `formatForAI()`
- **BaziHealthModule.jsx** (~350行): Birth info form (reuses bazi SHICHEN data), five element bar chart, expandable organ risk cards, life stage timeline with current decade highlight, diet therapy cards, AI chat

#### App Integration
- **App.jsx**: Import 4 modules, tab bar with divider + horizontal scroll, 4 conditional rendering blocks
- **HistoryDrawer.jsx**: 4 new module labels + summary formatters (constitution type / meridian / year analysis / health)
- **Bug fix**: Fixed 5-arg `upsertHistory()` calls in tizhi/ziwu/wuyun to correct 4-arg signature

## 2026-03-09

### feat: 风水飞星模块 (Fengshui Flying Star)
- **排盘引擎** (`engine.js` ~270行): paiFengshui() 玄空飞星完整排盘
  - 三元九运: 180年周期 (1864-2063), 20年一运, 建造年份定运数
  - 九宫飞星: 洛书路径 [5,6,7,8,9,1,2,3,4] 顺/逆飞, wrap 1-9
  - 运盘: 运数入中宫永远顺飞
  - 山盘: 运盘坐方星入中宫, 阳山顺飞/阴山逆飞
  - 向盘: 运盘向方星入中宫, 同上阴阳判断
  - 年飞星: `((9 - ((year-2000)%9) + 9) % 9) || 9` 公式
  - 月飞星: 年支分组→正月中宫数 (8/5/2) 逐月递减
  - 二十四山查找: 度数→山名, 处理子山跨0°边界
  - 格局分析: 旺山旺向/上山下水/双星到向/双星到山 自动判断
  - 飞星组合断事: 21条吉凶组合匹配 (二五交加/斗牛煞/穿心煞/交剑煞等)
  - 八宅法本命卦: 出生年+性别→东四命/西四命
  - formatForAI() 生成完整盘面文本供AI解读
- **静态数据表** (`data.js` ~160行): 九宫/飞星路径/三元九运/二十四山(24条含度数/卦/三元/五行/阴阳)/九星属性/飞星组合断事(21条)/九星化解催旺/八宅法(8卦×8方位)/五行中文
- **AI系统提示** (`prompt.js`): 6步分析流程 (格局总览→逐宫分析→年星叠加→重点位置→化解方案→催旺建议)
- **九宫格UI** (`FengshuiModule.jsx` ~500行):
  - CSS Grid 3×3 传统九宫布局 [巽4/离9/坤2 | 震3/中5/兑7 | 艮8/坎1/乾6]
  - 每宫显示: 卦名+方位、运星/山星/向星 + 年飞星, 吉凶着色
  - 飞星组合 badge (吉绿/凶红) 自动匹配显示
  - 格局徽章: 旺山旺向(绿)/上山下水(红)/双星到向(金)/双星到山(蓝)
  - 宫位详情弹窗: 点击查看完整星曜分析 + 组合断事 + 化解/催旺建议
  - 输入区: 建造年份下拉(1864-2063) + 坐山方位(双模式: 24山快选Grid / 度数精确输入) + 分析年份
  - 高级设置: 八宅法(出生年+性别→本命卦)
  - 专题分析按钮: 大门/主卧/财运/健康/年星/化解总结
  - 完整AI解读: 流式输出 + 追问 + 专题深入
- **集成**: App.jsx 新增 fengshui tab + HistoryDrawer 风水摘要(XX山XX向 · 格局名 · X运)
- 四主题适配 (ink/jade/dao/dark)
- **验证**: 年飞星公式 (2024→3碧, 2025→2黑, 2026→1白), flyStars顺逆飞, findMountain边界(0°=子/180°=午/352°=壬), 九运子山午向完整排盘 (双星到向) 全部正确

### feat: 奇门遁甲模块 (Qimen Dunjia)
- **排盘引擎** (`engine.js` ~350行): paiQimen() 转盘法·拆补法全流程
  - 公历→干支 (lunar-javascript): 年月日时四柱干支 + 五鼠遁时
  - 节气查找: getJieQi() + getNextJieQi() + getPrevJieQi() 三重检测，修复节气交接日遗漏
  - 定阴阳遁 + 局数: 24节气×上中下元 = 72局完整查表
  - 拆补法三元: 节气后首个甲/己日起算，5天一元
  - 布地盘: 阳遁顺排/阴遁逆排三奇六仪于洛书九宫
  - 布天盘: 值符(九星)随时干转动，天禽寄坤二宫
  - 天盘奇仪: 九星各携原宫地盘干同步旋转
  - 布人盘: 八门随值使转动
  - 布神盘: 八神从时干宫起排（阳顺阴逆）
  - 格局分析: 6吉格 + 10凶格自动检测
  - formatForAI() 生成完整盘面文本供AI解读
- **静态数据表** (`data.js` ~180行): 九宫/九星/八门/八神/三奇六仪/节气局数/吉凶格局/用神速查
- **AI系统提示** (`prompt.js`): 8步分析流程（概述→找自己→找目标→找阻碍→看格局→看三奇→综合→方位）
- **九宫格UI** (`QimenModule.jsx` ~550行):
  - CSS Grid 3×3 传统九宫布局 [巽4/离9/坤2 | 震3/中5/兑7 | 艮8/坎1/乾6]
  - 每宫显示: 天盘干/地盘干、九星(吉绿凶红)、八门(吉绿凶红)、八神
  - 日干所在宫 ★我 标记 + 值符宫高亮
  - 盘面摘要条: 阴阳遁+局数+节气+三元+值符值使+日干落宫
  - 格局标签: 吉格(jade)/凶格(cinnabar)彩色badge
  - 宫位详情弹窗: 点击任一宫查看完整五行分析
  - 专题分析按钮: 求财/事业/出行/感情/健康/诉讼
  - 完整AI解读: 流式输出 + 追问 + 专题深入
  - 日期时间4组下拉 + "用当前时间"按钮
- **集成**: App.jsx 新增 qimen tab + HistoryDrawer 奇门摘要(阴阳遁+局数+值符+值使)
- 四主题适配 (ink/jade/dao/dark)

## 2026-03-08

### feat: 模块引导介绍卡片
- 新建共享组件 `ModuleIntro.jsx`：可折叠"关于此术"卡片，展示来源 + 擅长领域
- 四个模块（六爻/梅花/八字/紫微）顶部各加一段引导文字
- 折叠状态按模块分别存 localStorage，刷新后记忆
- 用 `--color-surface-border` 浅边框，视觉上低于输入区层级
- 四主题适配 (ink/jade/dao/dark)

### feat: 紫微斗数模块 (Ziwei Purple Star Astrology)
- **完整排盘引擎** (`engine.js` ~300行): paiZiwei() 基于 lunar-javascript 公历→农历转换，10步排盘流程
  - Step 1-2: 定命宫身宫 + 安十二宫 (模运算公式)
  - Step 3: 五虎遁定宫干 → 纳音五行 → 五行局数 (水2/木3/金4/土5/火6)
  - Step 4-5: 安紫微 (查表150条) + 天府 (镜像公式)
  - Step 6-7: 安紫微系6星 + 天府系8星 = 14颗主星全部落宫
  - Step 8-9: 安六吉星 (文昌文曲左辅右弼天魁天钺) + 六煞星 (擎羊陀罗火星铃星地空地劫) + 禄存天马红鸾天喜
  - Step 10: 四化标记 (禄权科忌)
  - 大运推算: 起运年龄=局数, 阳男阴女顺排/反之逆排, 每步10年
  - formatForAI() 生成命盘文本摘要供 AI 解读
- **静态数据表** (`data.js` ~290行): 18+ 查表
  - 60甲子纳音、纳音五行自动派生、五行局映射
  - 紫微安星表 (5局×30日=150条)、紫微系/天府系偏移序列
  - 六吉星表 (文昌/文曲/左辅/右弼/天魁/天钺)
  - 六煞星表 (擎羊/陀罗/火星/铃星/地空/地劫)
  - 四化表 (10年干×4化=40条)、禄存/天马/红鸾/天喜表
  - 星曜元数据 STAR_INFO (五行属性+分类)、五行配色
- **十二宫盘面UI** (`ZiweiModule.jsx` ~600行):
  - 4×4 CSS Grid 传统方阵布局: 外圈12宫按地支顺序排列，中央2×2合并显示命盘摘要
  - PalaceCell 组件: 宫名+地支+主星(五行着色)+辅星+四化徽章(禄=绿/权=红/科=蓝/忌=棕)
  - 命宫★金色高亮边框、身宫☆虚线标记
  - 点击宫位弹出详情面板 (PalaceDetailModal)
  - 公历输入 + 实时农历预览 (useMemo + lunar-javascript)
  - 12时辰地支下拉 + 性别切换
  - 可折叠高级设置: 详细分析模式 (6分项按钮: 事业/财运/感情/健康/福德/迁移)
  - AI 解读: 流式输出 + 追问对话 + 分项深入分析
  - 历史加载/保存: 标准7-prop接口
- **AI system prompt** (`prompt.js`): 紫微斗数专用 prompt，8步分析流程 + 星曜解读规则 + 四化重点
- **App.jsx**: 新增紫微斗数 tab + import + 条件渲染
- **HistoryDrawer.jsx**: 新增 ziwei 模块标签 + 命宫主星摘要 (如 "命宫子 紫微天府 · 火六局")
- **排盘验证**: 两组测试用例四化+大运方向全部正确
  - 1990三月初十辰时男: 庚年→太阳化禄/武曲化权/太阴化科/天同化忌 ✓, 阳男顺排 ✓
  - 1985八月二十酉时女: 乙年→天机化禄/天梁化权/紫微化科/太阴化忌 ✓, 阴女顺排 ✓
- **四主题适配**: ink/jade/dao/dark 四套主题下宫格、星曜五行色、四化徽章均正常显示
- **新增依赖**: `lunar-javascript` (公历↔农历转换)
- **新增文件**: `src/modules/ziwei/data.js`, `engine.js`, `prompt.js`, `ZiweiModule.jsx`
- **修改文件**: `src/App.jsx`, `src/components/HistoryDrawer.jsx`

## 2026-03-08

### feat: 多 Provider 支持 + 模型选择 + 历史管理 + 八字高级设置

- **多 AI Provider 支持**: 新增 OpenRouter 接入，支持在 Anthropic 直连与 OpenRouter 间切换
  - 新建 `src/lib/aiProviders.js`: Provider/Model 配置表，`getActiveApiKey()`, `getDefaultModel()` helpers
  - 重构 `src/lib/ai.js`: `aiInterpret(apiKey, ...)` → `aiInterpret(config, ...)` (config = {apiKey, provider, model})
  - 拆分 `callAnthropic()` / `callOpenRouter()` + 共享 `readSSE()` SSE 解析器
  - OpenRouter 使用 OpenAI 兼容格式 (`/api/v1/chat/completions`)
  - 可选模型: Anthropic (Sonnet 4, Haiku 4) / OpenRouter (Sonnet 4, Haiku 4, Gemini 2.5 Flash, DeepSeek V3)
- **设置面板重写** (`SettingsPanel.jsx`):
  - Provider 分段切换按钮 (Anthropic 直连 / OpenRouter)
  - 双 API Key 输入 (切换 provider 自动显示对应 key)
  - 模型下拉选择 (按 provider 动态切换可选模型列表)
  - 历史记录管理区: 导出/导入/清空 (两步确认)
- **历史记录增强** (`history.js`):
  - `MAX_HISTORY` 50 → 500
  - 新增 `exportHistory()`: 导出 JSON 字符串
  - 新增 `importHistory(jsonString)`: 解析 + 按 id 去重合并 + 时间排序 + 保存
  - `saveHistoryToStorage()` 加 try/catch quota 超限保护
- **八字高级设置** (`BaziModule.jsx`):
  - 新增可折叠"高级设置"面板 (▶/▼ 切换)
  - "详细分析模式"开关: 开启后 AI 综合分析完成后显示 6 个分项按钮 (财运/事业/感情/子女/父母/健康)
  - 点击分项按钮 → 作为 follow-up 追问发送，复用完整对话历史，AI 直接深入该方面
  - 已查看分项显示 ✓ 标记
- **全局 aiConfig 重构** (`App.jsx`):
  - `apiKey` state → `aiConfig` object (provider, anthropicKey, openrouterKey, model)
  - 所有三个模块 props 统一为 `aiConfig={aiConfig}`
  - 新增 `handleHistoryChange` 回调给 SettingsPanel
- **Prompt 更新** (`bazi/prompt.js`): 追加分项分析指令，500-800字深入专项
- **修改文件**: `ai.js`, `history.js`, `App.jsx`, `SettingsPanel.jsx`, `BaziModule.jsx`, `LiuyaoModule.jsx`, `MeihuaModule.jsx`, `bazi/prompt.js`
- **新增文件**: `src/lib/aiProviders.js`

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
