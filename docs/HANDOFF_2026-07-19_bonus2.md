# 交接文档 — 第六章收官，bonus 章②《本命卦》预备（2026-07-19）

> 写给下一个 session 的落听潮。上一 session 完成 ch6《动爻》全链（宗主委托自审模式授权链沿用）。全部已 push。读完本文档再动手。

## 1. 三分钟状态全景

**能玩**：preview `tianji-dev`（端口 5926）→ `http://localhost:5926/game.html`。主线六章 + 两番外全线可玩：ch1《第一卦》→ ch2《装卦》→《钱囊》→ ch3《六亲》→ ch4《旺衰》→《演卦》→ ch5《元神忌神》→ ch6《动爻》。

**Push 状态**：全部同步 `origin/master`（本批与 TCM 数据库审计线共享 repo，混合 commits 一起推）。

**ch6 交付链**（`d7a9a21`→`eaa334c`）：策划案（fresh-context 自审 PASS-WITH-FIXES——2 P0 捏造引文教训在案）→ 审计第六批（witness `dongyao-andong` 10 passages + canon 90 checks）→ 剧本 v1.1（880 行七幕，R1 3P1+5P2 全折 / R2 delta 8/8 收敛）→ 数据化 320 节点（双 agent A:188+B:132 一次合并，lint 首跑仅 1 处我方杜撰字段修正后 ALL GREEN）→ E2E 四轮全绿。KP-LY-016/017/018 accepted；KP-015 补「择动」canonicalText。

## 2. 已验证 vs 未验证

**已验证**（运行时实测，console+server 双零错误）：ch6 E2E 四轮（optimal 女 227/67 精确 + fail 44<45 链实走 + **边界 46≥45 档线分离双向实证** + 男版 tick 级探针零泄漏）；audit:chapter6（320 节点 lint：favor 10/lingli 37/巳线 span 19/📘 parity 6）；audit:chapter6-canon（90 checks）；vite build；触碰面 eslint clean；装卦盘动爻+bian 列视觉截图。

**仍未验证**：
1. **真人玩测**（六章两番外全欠——宗主 2026-07-17 明示推迟，勿主动排期，欠账台账保持在案）
2. 重温重复计分（跨章既有行为，随玩测批裁定）
3. BGM/表情差分/SFX/标题页文案（美术打磨批，积欠五个 session）

## 3. 下一步待办（优先级）

1. **情感 bonus 章②《本命卦》全链**（ch6 策划案 § 5 已裁定位：ch6 后、ch7 前——「大战前夜的一次呼吸」）：主题＝「本命卦她主动提起」（LOVE § 1.1 知心档解锁物）。**已铺资产**：ch5 幕七欲言又止一钩＋ch6 幕六「目光停半息+咽回+说给我听」二钩（两钩同源——玩家旁白「像是同一句」）；ch6 natal 作业（「读完，说给我听」＝bonus② 的天然开场接口：她检查作业）；「你那卦，我替你读过」回收空间（ch6 策划案 § 3 natal 注记）。**约束**：情感层与案情层分离铁律沿用（bonus② 是情感章，案情零推进——ch5《演卦》先例）；解锁 gate 建议 ch6 通关+好感 ≥50+natal 存在（数值策划期裁定）；玩家 natal 任意卦（全静 17.8%——bonus② 若逐爻读 natal 必须 dynamicNatalBoard 式动态处理或作业汇报泛化——**ch6 泛化先例必读**，勿写死盘面）。先策划案（照 CHAPTER_6_PREP 模板）→ 自审 → 剧本（私教章量级 ~250 行）→ 数据化 → E2E。
2. **ch7 策划预研**（若余力）：巳月决战章——「谁」揭示（三环交集+老档名单）、笔帽主人、補写者、样张编码、「起笔」师承层——悬置大清算章。课目候选＝伏神（「面上没有的爻」两次余地话术：ch5 明夷+ch6 观之剥；ch6 章末预告意象「书要藏，人要藏——爻，也会藏」——**未锁名，策划期裁定**）。witness 素材：伏神章未录——需第七批提取。
3. 美术打磨批。

## 4. 红线（全集 12 条 + 本批新增 2 条）

1-12 条照 `HANDOFF_2026-07-18_ch6.md` § 4（知识正确性/≤3 KP/铜钱面/剧本先行/commit-push/卦纹/dressing 契约/MessageChannel 泵/正典回读/引用必 grep/脚本 assert/append 锚防移动）。白名单现状：ch6 已解禁 動爻生克/變爻/回頭生克/暗動/日破/沖散/择动；仍禁 仇神/旬空/伏神（ch7 天然候选）/六冲/六合/三合/三刑/接续相生/贪生忘克/化進退/化空/三墓/長生帝旺/沖空/沖起/合住/沖實。
13. **【新增】CP 正解位不恒首项**：ch6 CP-03 正解列 B（三题挑对测验设计）——walker「optimal 恒首项」假设已破，`cpPicks: {nodeId: optionIndex}` 已固化入 chapter-walker.js；今后每章数据化期整理 cpPicks 表进 E2E 记录。
14. **【新增】lint 派生先 grep 引擎正字段**（本批教训升级自 ch5 白名单教训）：ch6 lint 首跑 3 fail 全因我方杜撰 `kpId` 单值字段——scoredChoice 关联 KP 的正字段是 `testsKp` 数组（state.js 消费）。任何 lint 断言引用数据字段前先 grep state.js/Player.jsx/前章数据实况。

## 5. 技术备忘（坑与契约增量）

- **正典钉新增（ch6 立，bonus②/ch7 沿用勿漂移）**：铃响之夜＝辰月第三夜辛亥（挑线一半、双绞线、三息走脱、瓦灰蹬痕）；铜制笔帽（内侧修书房**旧制錾记**「物勒工名」——换章程后已废；帽口坑洼未解；主人 ch7 收）；郑司书主动启老档（近十年置办录在手，更早老档封库房底箱需时日——ch7 名单钩）；守窗章程 v3＝双股双路铃线（明诱暗报）；「三个旧字」（旧地/旧人/旧制）＝「懂六爻的旧人」收窄宣言（不点名）；「他知道我们算得出巳月」反预判正典；「他先失手」章末事件；第七课预告只给意象（「藏」）未落名；ch6 全程辰月（章末辰月中旬，巳月留 ch7）。
- **巳线第六笔**：观五爻辛巳官鬼動（前五：剥应巳/观五爻样张点/大有应巳/守窗「他近了」/natal 初爻巳——natal 之巳与案情之巳**两层分离**铁律已 lint 机检化）。
- **ch6 E2E 种子**：进章 190/57（optimal）；通关 **227/67**——bonus②/ch7 种子基线。fail 档 43→197/45；边界 45→192/47。cpPicks 表：`{'ch6-s6-cp03': 1}`（optimal 轮）。
- **幕六 favorBranch 模式**（ch6 首用非章首位）：fb 置幕六 natal 作业段（`ch6-s6-fb`）、判定前满拿 +9、双链零 favor、合流 `ch6-s6-merge`——lint 断言已 codify（audit-chapter6-script.mjs：fb 必须 s6 前缀+currency-neutral）。bonus② 若用 favorBranch 照 LOVE § 1.1 档位。
- **DressingBoard `bian` 可选列**（本批引擎增量，CastPanel.jsx）：revealed 行 `{moving: true, bian: '子·子孙'}` 渲染「→子·子孙」；lint 校验 bian 与引擎 bianYao 一致、静爻禁带。动爻爻形金标+○ 是 YaoLine 原生（ch1 起）。
- **转录管线第六轮注意**：`testsKp` 数组是 scoredChoice 正字段（红线 #14）；教学块 📘 标记 parity 已 lint 机检化（6 节点/每 KP 示范+1 引导+3——审律两次抓同类缺陷后的 codify）；agent spec 6 防御 block 照抄（pre-agent hook 强制）；B agent 裁量上报第三轮实证价值（抓 § 0 注记滞后于正文定稿）。
- **eslint**：`.worktrees` 已入 globalIgnores（并行 TCM session 工作区噪音 5143 errors——勿revert）；pre-existing errors 10 个在 walker/assets/server/App/Camera（非 ch6 批引入，未动）。
- witness 提取口径不变（`/tmp/ctext-950329.txt` 重生成，七锚校准——本批加 693/901/937/1075/1359/1381 六个章标题锚）。

## 6. 交接 prompt（宗主直接贴给下个 session）

```
项目：天机（修仙恋爱教学游戏，Galgame 形态），路径 ~/CC projects/projects/games/tianji/

先 ls docs/HANDOFF_*.md 找日期最新的一份交接文档读完（状态/红线 14 条/
正典钉/技术契约/待办），再按其指示行动。

当前状态基线（2026-07-19 收官）：主线六章 + 两番外全线可玩且 E2E 全绿
（ch6 四轮矩阵含档线分离双向实证），宗主委托自审模式授权链沿用，
真人玩测批次明示推迟。

本 session 任务：情感 bonus 章②《本命卦》全链（交接文档 § 3 第 1 条）——
先策划案过自审（注意 natal 全静 17.8% 泛化约束 + 情感/案情分离铁律），
再剧本 → 审查收敛 → 数据化 → E2E。若余力：ch7 策划预研（§ 3 第 2 条，
witness 第七批伏神章提取）。

红线照交接文档 § 4 全集 14 条（新增 #13 cpPicks 契约 / #14 lint 派生
先 grep 引擎正字段）。commit 随时，push 分段。
```
