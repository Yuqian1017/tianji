# Changelog

## 2026-07-18 (续五) - 完成《金匮要略》113 段显式引文校勘

- 对 `45-经典-金匮要略杂病方证条文.md` 抽取 113 段显式引文：14 段原字符、71 段规范化、11 段省略分段命中，17 段逐条人工形态裁决，待人工 0；1,453 项审计 0 fail。
- 保留 4 条《金匮要略》《伤寒论》复本见证和 1 条《素问》外部用语，来源错配为 0；本地、CText、Wikisource 一致支持“大逆上气”，拒绝整理稿与倪海厦页卡沿用的“火逆上气”。
- 公共见证支持“腹中㽲痛”“结在膀胱”，校正本地 A2K0 和膀肽转录问题；倪海厦页卡只贡献 3 个二级 locator。中央来源库更新为 11 组、268 文件，`42-45` 共 492 段首轮完成，下一批进入医家与温病。

## 2026-07-18 (续四) - 完成《伤寒论》170 段显式引文校勘

- 对 `44-经典-伤寒论六经方证条文.md` 抽取 170 段显式引文：22 段原字符、114 段规范化、18 段省略分段命中，16 段逐条人工形态裁决，待人工 0；2,149 项审计 0 fail。
- 保留 9 条《伤寒论》《金匮要略》复本见证和 4 条整理稿声明互参，来源错配为 0；`群方之魁` 归回柯琴《伤寒附翼》后世评语，`痞、满、燥、实` 与两条现代编辑标签不再冒充正文。
- CText/Wikisource 为“项背强几几”和“身濈然汗出而解”提供公共转录校勘；`nihaisha-nishi-tcm` 只贡献 2 个二级 locator。中央来源库更新为 11 组、267 文件，下一批进入《金匮要略》。

## 2026-07-18 (续三) - 完成《灵枢》《难经》98 段显式引文校勘

- 对 `43-经典-灵枢与难经要义.md` 抽取 98 段显式引文：6 段原字符、60 段规范化、9 段省略分段命中，23 段逐条人工形态裁决，待人工 0；1,073 项审计 0 fail。
- 识别 3 条实际来自《素问》的跨书引文；以 CText/Wikisource 支持“问/间”“候/侯”“太阴/太阳”三处本地转录差异，raw Skill 与底本保持不动。
- `nihaisha-nishi-tcm` 仅贡献 3 个二手页卡 locator；新增公共转录见证清单，中央来源库更新为 11 组、266 文件。下一批进入《伤寒论》。

## 2026-07-18 (续二) - 审计 nihaisha-nishi-tcm 并接回四部典籍验证主线

- 固定 `JuneYaooo/nihaisha-nishi-tcm` commit `e3cb51359a5ef9fc0725132814d474168bb8de24`；登记 3,094 文件、2,986 张截图、22 文献/10,538 页级证据卡和外置 RAG 边界。
- 将课程蒸馏、截图、PDF 页卡、倪师推荐补充、OCR/转录、病例和古籍候选分层；无标准开源许可、无原 PDF、无版本/源哈希的内容不得复制或晋升为原典。
- 对上游 51 条勘误拆出 58 个目标词形与天机 TCM 交叉检查；13 个有命中，0 条直接覆盖。新增《灵枢》《难经》《伤寒论》《金匮要略》 locator-only 验证路由，中央来源库更新为 11 组、265 文件。

## 2026-07-18 (续) - 吸收 xuanxue-database-skill 的实战证据结构

- 固定 `yanouyuan-bit/xuanxue-database-skill` commit `926d0b56154c8764b68e9ddf2661949e9b5b5f11`；登记 14 文件/858 行、MIT 许可、三库模型和直接采用风险，许可证文本单独存入 `database/licenses/`。
- 新建 `database/learning/practice-evidence-schema-candidate.json`：保留匿名命例、方法关联、事前断语、实际结果和复盘关系，补齐断语冻结、排盘/流派版本、证伪条件、证据等级、完整分母与隐私合同。
- 明确个人应验不能提升典籍/知识权威，不能自动更新 KP 掌握度；高风险医疗、法律、财务和安全预测不计分。中央来源库更新为 11 组、264 文件。

## 2026-07-18 - 登记倪海厦二手候选来源并补齐中央来源索引

- 固定审计 `jangviktor-web/nihaixia` commit `ec03c594ed239b570e997cbd396c2fc186b6ad91`，只保存来源元数据、规模、7 组覆盖缺口映射、许可冲突、原始见证缺口和吸收边界，不复制仓库中的蒸馏正文。
- 将该来源限定为 `secondary_school_commentary_candidate`：可用于发现待查主题和寻找一手出处，不得充当古籍底本、accepted 主张来源或运行时医疗知识。
- 将既有 9 份 CText 见证和 1 份外部来源档案纳入中央来源库；索引由 252 文件/9 组更新为 262 文件/11 组，并新增防误晋升测试。

## 2026-07-17 (续) - 第五章《元神忌神》全链（宗主委托自审模式）

- **feat(ch5): E2E 矩阵四轮全绿** — optimal 女 47 种子（190/57 精确，七幕探针全中：知心开场/粮道/虽有如无/人证元神/归魂/暗動/巳月）/ 43 档线分离带（fail 链全程 trail 实证「按档不按线」，零知心泄漏）/ 错线 B·C·B 40 种子（170/45，通关不锁，三卡入待复习）/ 男版 47（190/57 一致，male_ta+师兄+白芷保留三探针中，她收拢/师妹泄漏探针零命中）。console 零错误。
- **feat(ch5): 数据化 248 节点** — 双 agent 转录（A 125 + B 123）一次合并；audit:chapter5 lint 首跑全绿（37/10 对账）；lint 新四机检（favorBranch45 双链零 favor/全章禁 junior/仇神单点/wangshuai 全禁）；registry+GameModule 接线（第五章入口/重温/通关横幅）。
- **docs(ch5): 剧本 v1.1 两轮收敛（委托口径）** — R1 opus 七轴全量（1 P0 幕三物理错位——append 锚被中途修正移动的管线教训 + 1 P1 裸她 + 3 P2）→ R2 Explore delta（5 项全 VERIFIED + 抓 1 处修复未传播）。KP-LY-013/014/015 accepted。
- **feat(ch5): 跟随制审计第五批** — witness yuanji-shuaiwang（11 passages 程序化摘录 751-815+595）+ audit:chapter5-canon 60 checks 三层全绿；两处首跑抓错（CJK sort 断言 bug/「595 已在第四批」误记）。
- **feat(ch5): 策划案 CHAPTER_5_PREP** — 自审 6 findings 折毕（含 KP-015 同支退化重构：择旺三层判据 秤→临沖→临世应）；案卦 64 静卦系统扫描定火天大有（应巳官鬼三角/归魂/亥沖巳暗動回响位）；占期卯月丁亥日=守窗第七夜干支自洽。

## 2026-07-17 - 第四章《旺衰》全链（审计→剧本→四轮审查→数据化→E2E 四轮全绿）

- **feat(sijiao1): 私教章①《演卦》全链** — 剧本 v1（255 行五幕：柴棚/盘账/你的卦/演卦/有人把它当回事）→ 单轮审查（0 blocker，5 findings 全折修：时间量词/集市 backfill re-anchor/占位符约定/清盘+terminal 注记）→ 数据化 95 节点 + natalDressingBoard 三档 helper（node 层对撞 paipan 全 MATCH + null fail-loud）+ Player dynamicNatalBoard 分支 + gate 三条件 → E2E optimal 全绿（153/47 精确，掌握度零变动，动态盘视觉截图：水泽节坎宫六亲全对+占位符替换成功）。console 零错误。
- **test(ch4): E2E 矩阵四轮全绿** — optimal 女 148/40（pass 链实走）/ fail 链专测（种子 10→锚点 19<25，fail010-030 实走，favor 20 等值）/ 错线 B·C·B 133/35（verdicts 入 choiceLog，三 KP 待复习不锁进度）/ 男版 148/40（「多谢师兄」渲染实证、零师姐泄漏、零裸她泄漏）。console 四轮累积零错误；wangshuai 视觉截图过审（初爻「巳火·父母·旺」）。横向观察：重温模式重复计分为 Player 层既有行为，留真人玩测批裁定。
- **feat(ch4): 数据化合并 + 接线** — 双 agent 转录（A 幕一~四 167 节点 / B 幕五~七 161 节点）合并 328 节点；audit:chapter4 lint 首跑全绿（0 fail 0 warn，灵力 37 好感 10）；registry + GameModule 入口；CastPanel wangshuai 显示位；fixedDate 契约评估结论=零改动（fixed 模式不走运行时排盘）。脚本先行修复：崔小砚「多谢师姐」→{{senior}}（B agent 上报的男版穿帮）。lint 新增四机检：禁词扫描/favorBranch 前称谓中性/裸她白名单/wangshuai 限位。
- **docs(ch4): 剧本 v1.2 过目通过（宗主委托）** — 四轮审查收敛：R1 opus 全量（0 P0/1 P1/3 P2，1 驳回 false positive）→ R2 opus（新抓 P1 代词回归 58 处裸她→{{ta}}）→ R3 sonnet delta（convergence verified）→ R4 教学引导性专项（宗主指令「不要写得太生涩」——3 表达层修润：十二支圈 de-collision/相持局词锚/泄气机理白话）。KP-LY-010/011/012 升 accepted。
- **feat(ch4): 剧本 v1 完稿（994 行）** — 七幕：隔页的点/月令当值/今日司权/数生克/人证的时令/窗台与临/旺者作数 + 附录 A/B/C。剧本层 14 逐字引文 + 跨章 14 正典句程序化对撞全中。固定卦象四张 paipan 实测（卯月辛巳日）：乾为天复盘/风地观谱页/山地剥复读/地泽临案卦。
- **feat(ch4): 跟随制审计第四批** — witness wangshuai-sichu-2026-07-17.json（11 passages 程序化摘录，提取行 545-593）+ audit-chapter4-canon.mjs 三层对撞 85 checks 全绿 + KP-LY-010/011/012 建卡。

## 2026-07-14 - Session 收官：第四章策划案过目（自审抓 2 假引用）+ 交接文档

- **策划案自审**（宗主委托「你自己审了觉得可以就行」）：12 条正典锚点 grep 对撞——10 逐字 ✓、2 条凭记忆的假引用当场抓出修正（树洞句丢加粗标记；巳火「她收着不说」只存在于设计注层、正文无此台词——如实分层）。ch3 P0 教训递归应用到自己文档，升格为红线 #10「引用必 grep」。
- **交接文档** `docs/HANDOFF_2026-07-14_ch4.md`：状态全景（三章+番外全线可玩，E2E 矩阵各章四轮全绿）/ 诚实清单（真人玩测仍欠）/ 红线 10 条全集 / 技术契约（分段 push/walker/转录 spec 要点/ch4 预判契约）/ 下 session 交接 prompt。
- 状态：第四章《旺衰》全链交下一 session（审计→剧本→过目→数据化，管线成熟）。


## 2026-07-14 - 验证缺口清理：番外回归 + 视觉 pass（抓 1 真 bug）+ 藏经阁内景接线

- **番外《钱囊》新门槛位回归**：ch2 通关+好感 15 档按钮出现、全程通关 qn-end、好感 +7/灵力 +5 精确——handoff 未验证 #4 关闭。
- **视觉 pass 抓真 bug**：存档指在 ch2/ch3 中途时标题页「继续修行」被 `!finished(ch1)` 条件吞掉，玩家只能重温（重置章首丢进度）——修为 `hasProgress` 即显 + 标签动态带当前章名（「《六亲》· 灵力 64」）。
- **ch3 视觉两屏过审**：修书房（宋补之围裙沾浆一手刷子一手裱纸，人设命中）+ 山脚集市（白芷头巾拧衣裳配「工钱结清了的」）——双人构图宽屏舒展。
- **bg-cangjinge-nei 接线**：ch2 木梯节点（s1-150）+ 点验开工（s3-230）+ s4/s5 header 切内景，场景 fallback 同步，PRELOAD 补图——二层书架帙卷内景实渲染截图确认。
- Push：98 commits 分段推送至 origin/master（`ac24ae3` 双向一致，宗主 2026-07-14 授权）。


## 2026-07-14 - 第三章《六亲》数据化 + 四轮 E2E 全绿（三章主线全线可玩）

- **引擎扩展**（`8418139`）：favorBranch 静默路由节点（threshold/pass/fail，畸形数据 fail-loudly）+ DressingBoard 六亲显示列（「丑土·官鬼」，宽度自适应，ch2 向后兼容）+ ch3 场景演出配置（xiushufang/jishi/chenguang 弧线 + 集市锚 `ch3-s5-300`）+ 三新 NPC 立绘注册 + GameModule 第三章入口。
- **数据化**（`fe6d8b8`）：330 节点（双 agent 并行转录 132+198，自查全绿：字符串全覆盖扫描 + 图遍历 + 账目清点）；`audit:chapter3` 新增 favorBranch 出边 + **fail 专属链好感排除**语义 + 双卦装亲盘（明夷六亲复盘/山地剥全装）与 `paipan().lines[].liuqin` 直接对撞——首跑全绿 330/330。
- **四轮 E2E**（运行时全程通关，console 零错误）：①optimal 女版 111/30 精确、A×3、三 KP 掌握、**pass 链实走**（分支时好感 29≥25，称谓变化段探针命中）、明夷盘六亲实渲染 ②低好感档 **fail 链专测**（23<25 → failSeen ✓ passSeen ✗，24/96）③师兄版 111/30 + ♂ 变体节点实渲染 ④错线 B/C/B（wrong+suboptimal 两族，96/25，三 KP 待复习停「用过」，不锁进度）。
- 三章 + 番外全线可玩：ch1《第一卦》→ ch2《装卦》→《钱囊》（ch2 后解锁）→ ch3《六亲》。

## 2026-07-14 - 第三章《六亲》剧本三轮审查收敛（待宗主过目）

- **跟随制审计第三批**（`0928d6d`）：KP-LY-007 五行相生相克（《增删》相生章第十一/相克章第十二——转录本独立成章，行 817-841）/ KP-LY-008 六亲安法（《卜筮正宗》「生我者為父母…比和者為兄弟」+《增删》六親歌章第五 25 组逐宫展开）/ KP-LY-009 六亲主事简化（《卜筮正宗》用神分類定例第一五条全录——**父母爻主「章奏文章」＝残谱、官鬼爻主「盜賊邪崇」＝内应**，剧情锚典籍原生）。witness 提取件 `liuqin-sanjian-2026-07-13.json`；引擎对撞生克 10/10、六親歌 25/25、乾为天六亲 6/6 全绿。
- **剧本 v1**（`41452f5`，8.5k 字七幕）：明夷复盘「世坐官鬼」（拘束贴身）→ 五行两圈教学 → 装亲（DressingBoard 六亲扩展）→ 修书房走访立人三 NPC → 山地剥案卦「**应临官鬼**」（问人看应，应上坐贼）+「剥」卦名即裁割 → 好感跨「信任」档（25）她第一次直呼玩家名（favorBranch 新节点）。
- **三轮审查收敛**：R1（opus 全量）抓 **P0 正典冲突簇**——修书房窗口日期/时长与 ch2 出纳册相撞、「杂役开春下山」钩子被抹（handoff 漏带 + 未回读 ch2 正典，本 session 最大教训）→ 甲案裁定（ch3 服从 accepted 正典）：**白芷重构为辞工下山、山脚集市寻访**（bg-jishi 资产闭环；「那院子不干净。不是说脏。」辞工原因层）+ 12 处手术（`2fcc9e2`）。R2 抓重构余波 2 P1（5.4 衔接重摆到回山石阶；「夜里本就没人」反转为「他笃定那双眼睛不识字——眼睛不识字，可眼睛记事」）+ 4 P2（`cc717bd`）。R3（sonnet delta）**convergence verified 9/9，0 新 findings**（字数独立重数差 0.02%、引用 SHA256 对撞一致）。
- **数据化前置资产并行批**（审查等待间隙）：三背景 `bg-xiushufang`/`bg-cangjinge-nei`/`bg-jishi`（`06fa106`，顺带闭掉 ch2 藏经阁内景与《钱囊》集市两笔资产欠账）+ 三立绘 `portrait-song`/`cui`/`baizhi`（`c395eb9`）。
- 状态：**待宗主过目**；过目通过后数据化（含 favorBranch 节点类型 + DressingBoard liuqin 字段两个引擎小扩展）+ E2E。

## 2026-07-13 - 第三章《六亲》跟随制审计：三 KP 原文照录 + 引擎对撞全绿

- **跟随制审计第三批**（复用既有快照零重抓）：五行相生章第十一/相克章第十二（循环句干净照录）、六親歌章第五（五宫歌+乾为天实装例）、六親相生相克通则（生我者為父母…）、用神分類定例第一 × 用神章第八双典籍互证——**「文書及書館文契」以父母爻为用神（残谱＝父母爻）、「亂臣賊盜」以官鬼爻为用神（内应＝官鬼）两个剧情锚点典籍原生成立**；「一切庇護我身者／一切拘束我身者」本质定义句为教学主锚。提取件 `liuqin-sanjian-2026-07-13.json`。
- **三张 KP 卡**（kp-ly-00{7,8,9}.json，status=reviewed 待宗主 accept）：五行相生相克（循环）/ 六亲安法（生克定亲，宫五行为我）/ 六亲主事（用神初步·简化——只锚父母/官鬼/子孙三亲，找对爻不判吉凶）。
- **引擎程序化对撞**：生克循环 10/10（wuxingRelation）、六親歌 25 格 25/25（getLiuqin）、乾为天全卦六亲 6/6（PURE_GUA_LIUQIN）。
- 彩蛋见证：增删自述学序「先念渾天甲子、六親歌」——游戏第二/三章顺序与原书教学法同构。

## 2026-07-13 - UIUX 批次（宗主玩测反馈）：可读性 P0 根修 + NPC 立绘×3 + 对话框美术化

- **P0 根因**：`--color-surface` 在主题里根本未定义 → 全部游戏表面（对话框/摇卦面板/选择卡/居中卡）计算为 `rgba(0,0,0,0)` 全透明——M1.5 起一直如此，亮景遮丑、夜景+白袍立绘下彻底不可读（宗主「看不清字」直接命中）。
- **修法**：`game-ui.css` 游戏作用域视觉系统（`--g-*`：宣纸实底/墨字 17px·1.95/金线双框/印章红名牌/HUD 墨条/scrim 面板），与 App 主题彻底脱钩；透明度全部烘进 token，永不再用对 var() 静默失效的 Tailwind `/NN` 修饰符。Player/CastPanel/DressingBoard/GameModule 四文件全换轨。
- **NPC 立绘×3**（gpt-image-2 → fal birefnet 抠图 → webp，管线沿沈疏桐先例，`scripts/generate-npc-portraits.py` 可复用）：郑司书（抱函套如抱孙+袖口补丁）/顾小满（圆脸提灯）/韩长老（按剧本人设）；`NPC_PORTRAITS` 注册表 + Player 左槽舞台逻辑（sceneHeader 清场/NPC 开口上台/**说话者前置 z 序互换**——窄屏双人构图的 VN 惯例解法）。
- **装饰件**：祥云角花（multiply 混合免抠图，独立裁切层保名牌外探不被剪）。
- **验证**：改前/改后截图对比（夜景郑司书对白：改前文字浮在白袍上不可读→改后宣纸实底全读清+双人构图正确）；E2E 回归 optimal 全程通关（灵力 74/好感 20/三 KP 掌握，UI 大改零流程破坏）；console 零错误；eslint 干净。
- 遗留（下批）：立绘表情差分/集市+藏经阁内景图/摇卦 SFX/标题页「第一章」文案陈旧。

## 2026-07-13 - 第二章补验：错线 + 师兄版 E2E 全绿（验证标准对齐 ch1 M2）

- **错线 E2E**（CP 选 B/C/B，覆盖 suboptimal+wrong 两族分支）：choiceLog B/C/B 精确、灵力 37+22=59（教学 12+通关 10、无掌握奖）、好感 10+5=15（CP 零好感）、三 KP 全标待复习且掌握度停「用过」、错线不锁进度（ch2 completed）——全部与账目设计零偏差。
- **师兄版 optimal E2E**：灵力 74 / 好感 20 / 三 KP 掌握 / A·A·A；♂ 变体节点实渲染探针（「他用指节在案沿上敲了两下」）+ 师兄/师弟称谓双确认。
- **6.4 动态籍贯文本两分支全覆盖**：女版本命中孚→「艮宫第七，游魂」；男版本命贲→「艮宫第二，一世」。
- 工程注记：Browser pane 后台 tab 有 timer 节流（setInterval 被压到秒级），E2E walker 已换 MessageChannel 泵（macrotask 自调度不吃节流）——后续 walker 沿用此模式。

## 2026-07-13 - 第二章《装卦》全链交付：数据化 328 节点 + 装卦交互 + E2E 通关

- **过目通过**（宗主 2026-07-12「你来决定吧，接着往下推」）：KP-LY-004/005/006 升 accepted（`0fbe3f7`）；五项留白按委托裁定（谜面方向采纳/时长不注水/三人第三章立人/背景复用/番外回迁）。
- **引擎层扩展**（`0fbe3f7`）：CastPanel 掷后台词 speaker 字段（ch2 玩家自报）+ **DressingBoard 装卦盘**（逐爻地支五行 + 世应标记，复用 YaoLine——按交接注记扩展不重写）；Player 新增 `dressingUpdate` 节点（**全量态幂等**盘面事件，防重复防刷新丢失）+ 盘面常驻 overlay + 四处 ch1 写死点通用化（KP_SHORT/场景正则/章终标题/结算卡）；GameModule 第二章主线入口 + **番外《钱囊》门槛回迁第二章后**（策划案 § 1.2 原定，交接 § 3 第 7 条）；natalPalaceText 动态籍贯 helper。
- **数据化**（`8f46fd2`）：双并行转录 agent（幕1-3 116 节点 / 幕4-7 212 节点）→ 328 节点合并；双层验收（agent 全字符串 sweep + 主 session 抽查，字数保真 +1.7% 同口径）；**转录中抓出剧本 3 处 bug 反哺 doc**（两处「昨天」相对时间错 + 一处 {{ta}} 代词误用——三轮审查漏网，转录逐字比对捞出）。
- **lint**（`npm run audit:chapter2` 全绿）：328/328 可达、灵力 12+15+10=37、好感 max 语义恰 10、**装卦盘数据 ↔ 引擎 NAJIA/paipan 对撞**、KP accepted 门、interleave 边补进图检查。
- **E2E 两轮通关**（`f7f2c34`）：optimal 线全程——终账灵力 74（37+37 精确）/好感 20/六 KP 全掌握/3×optimal/双章 completed/console 零错误；摇卦 interleave-resume 状态机在新 cast 上走通；装卦盘跨节点常驻实证 + 世应标记可见（截图在案）；6.4 动态籍贯「风泽中孚——艮宫第七，游魂」渲染正确（E2E R1 抓到占位符直显 bug→修复→R2 复验）；通关后标题页双章状态 + 番外按钮亮起（门槛迁移正负两向验证：迁移前不亮/迁移后亮）。
- **可复用沉淀**：`scripts/e2e/chapter-walker.js`（MessageChannel 泵防 timer 节流——preview 后台 tab setInterval 被钳到 ~4s/tick 的坑 + 解法）。
- 未验证留待玩测：B/C 错线运行时遍历（lint 图连通已过，与 ch1 M1 同口径声明）；男版全程；装卦交互真人手感。

## 2026-07-12 - 第二章《装卦》剧本两轮审查收敛（待宗主过目）

- **剧本 v1**（`2ae0a6e`）：七幕 9,300+ 字——哑卦唱名点验（明线开局）→ 八宫课（卦轴+贲的籍贯）→ 世应课（世爻＝第一章动爻的高光）→ 缺页推断 CP-01（丰六师八缺七→游魂→明夷）→ 伪页识破 CP-02（中孚游魂世四被点在三）→ 夜摇案卦 CP-03（纳甲装支 + 明夷重现「它把自己的名字又报了一遍」）→ 章末灯影。三 KP 各走示范→引导→独立闭环；灵力 37 好感 10 与第一章同构；钱囊暗线只喂料不抢答（字迹/按囊/「等得起」倒影/灯下影子——《钱囊》回收位全预留）。
- **/iterative-review 两轮收敛**（`1543bca`）：R1（opus 全量）引擎 fresh 实跑七卦+引文逐字+账目清点全绿，抓 1 引文保真（漏 witness 疑衍「裝」字，补齐+衍字注记）+ 1 P1（伪页「31+1=32 天衣无缝」算术不成立→重写为「明账遮暗账」：裁明夷是明账、换中孚是暗账，拿两页只让人知道一页）；修复衍生堵洞：幕一「有一页算一页」措辞机关（官面登记算术自洽）+ 幕四「应有 32/在册 31」落地 + 数字卫生 5 处 + 震宫收尾句。R2（opus）F1/F2 一手证据验真 + 郑司书知情审计 + CP 公平性 + 账目重清点——**convergence verified 0 findings**。
- 状态：**待宗主过目**（M0 gate 同款）；过目通过后进数据化（管道复用）+ E2E。

## 2026-07-12 - 第二章《装卦》跟随制审计：三 KP 原文照录 + 引擎程序化对撞全绿

- **跟随制审计第二批**：《卜筮正宗》（ctext wiki chapter=889452）+《增删卜易》（chapter=950329）全书快照落 `database/sources/ctext/`（HTML×2 + 提取件 `zhuanggua-sanjian-2026-07-12.json`，提取口径：去 script/style + 去标签 + 逐行 strip 后行号定位）。
- **三张 KP 卡**（`database/knowledge/kp-ly-00{4,5,6}.json`，status=reviewed 待宗主 accept）：八宫与卦宫归属（增删八宮六十四卦卦名 + 歸魂遊魂章「遊魂＝各宮第七卦」）/ 纳甲装地支简化口径（增删渾天甲子章**原生只列地支五行**——简化有典籍背书）/ 世应（安世应诀 + 「隔世爻兩位卽是應爻」+「世為自己，應作他人」）。
- **引擎程序化对撞（本次审计 fresh 证据）**：八宫归属+宫内位次 64/64、纳甲装支+五行 24/24、世应位（诀→展开）64/64，全部与 `src/modules/liuyao/data.js` JINGFANG/NAJIA 一致。
- **转录讹字如实注记不代修**：卜筮正宗纳甲歌讹损较多（干＝乾、戍＝戌、離火「巳」＝「己」、兑句脱字）；增删「辰在內／外」＝艮、「天地觀」＝風地觀、「坤官」＝坤宮——均已双源互证复原，教学引用以增删为主、正宗歌存证。
- **剧情用卦引擎实证**：地火明夷 [7,8,7,8,8,8]（坎宫游魂·六爻安静·世四应初）/ 山火贲 [9,8,7,8,8,7]（艮宫一世·世初应四——**世爻＝第一章的动爻**）/ 风泽中孚 [7,7,8,8,7,7]（艮宫游魂·世四应初）；明夷（pageid 12601）中孚（12568）wikisource 见证在档。

## 2026-07-12 - M2 批次：修缮验证 + 番外《钱囊》全链交付

- **M2-1 修缮**（`b9f2f0a`）：全资产 webp 化（29MB→2.3MB）；立绘 Fal birefnet 抠图（深景鬼影根治，multiply 移除）；错线全通（CP-01B/02C/03C 运行时通关，pendingReview 三 KP、灵力 22 无掌握奖、好感 4——掉级账目全对）；师兄版立绘+变体渲染实测；发现并修复 resume 按钮残留缺陷。
- **多章基建**（`27640b6` `d532d26`）：Player 参数化（chapter prop + 注册表）；番外解锁按钮（注册表驱动 + 好感门槛）。
- **M2-2 番外《钱囊》**（`d532d26`→`2509ecd`）：六幕情感章剧本（3,762 字，零新 KP，假卦摊 KP-002 自然回响，师承线半揭，双钱结母题）→ fresh 审查抓 **2 P0**（钱囊持有权结构矛盾——前三幕反转为破帕裹钱/编络三拆，授囊高潮归位；执法堂误植拆保密线——一行归正）+ 2 P1（毒舌回填/好感演出收敛到相识档）+ 3 P2（卦轴去锚定/门槛 10→8 三处同步/变体位置记录保留）→ 数据化 121 节点 → **E2E 通关：favor +7 精确、lingli +5、双章 completed**；负向门槛（favor 4 不亮按钮）同验。
- 解锁门槛下修 8：容错一个大 CP 的玩家可进番外，策划案「相识」档同步 8–24。

## 2026-07-12 - Galgame 演出层 + M2 策划案 + 交接（session 收尾）

- **M1.5 Galgame 化**（`dabad7d`）：toolbox 生成 14 资产（8 场景背景/双性别立绘/标题图/4 BGM，水墨淡彩统一风格，14/14 成功）；presentation.js 演出配置层（节点级背景/BGM 切换 + 场景兜底 + 预加载）；Player 全屏背景/立绘（multiply 融合）/金框名牌对话框/BGM 循环。浏览器实测：标题页、幕间卡、接引殿精确切换、廊亭立绘融景 + 对话框完全体。已知 M2 项：立绘 rembg 抠图（深景鬼影）、webp 压缩、错线/师兄版运行时遍历。
- **美术知识边界原则**：生成美术中的卦纹为装饰元素不作教学参照，教学卦象一律代码绘制（assets README 声明）。
- **M2 策划案**：`docs/design/LOVE_AND_SYSTEMS_DESIGN.md`——好感五级解锁表、情感 bonus 章①《钱囊》框架（师承线半揭）、卦阵对弈草案（动变规则武器化，教学耦合）、RPG 元素克制清单（五行战斗明确不做——未教不考）、第二章《装卦》KP 预备。
- **交接**：`docs/HANDOFF_2026-07-12_m2.md`（状态全景/诚实的已验证清单/M2 优先级/红线全集/技术契约/交接 prompt）。

## 2026-07-12 - M1 垂直切片可玩：章节播放器 + 摇卦交互 + 三数值（浏览器 E2E 通关）

- **M1-4 章节播放器**（`2dcfab5`）：`src/game/Player.jsx` 节点流播放（9 类节点全渲染）、teachMoment 自动结算（StrictMode 防重复守卫）、计分抉择奖惩、双性别模板渲染、存档续档。
- **M1-5b 摇卦交互**：`CastPanel.jsx` 六掷演出（典籍口径：三背=重=老阳）、逐爻装卦带动爻圈记、掷间台词位；固定卦中断→interleave 教学→`resumeCast` 恢复→精确落点 s5-295 的完整状态机；本命卦真随机（paipan 现算存档）。
- **M1-6 三数值**：`state.js` 掌握度五阶（教学时刻只升不降/掉级仅经 CP）、灵力/好感、CP-03 动态选项文本（按实际本命卦生成）；章末结算卡 + 存档总览。
- **独立入口** `game.html`（无 auth 墙，玩测可直接分发）+ 主 App「天机·第一卦」tab。
- **浏览器 E2E 全通关验证**（optimal 线）：设置→八幕→章终；终账灵力 37（教学 12+CP 15+通关 10）/好感 10/三 KP 掌握/choiceLog 3×optimal/本命卦天水讼之天山遁落档——与 lint 期望值零偏差。eslint src/game 0 问题。**如实声明**：B/C 错线剧情仅 lint 图连通 + 人工核路由，运行时遍历留玩测。
- PRD § 9.3 验收对照：①完整摇卦交互×2 + 3 计分 CP ✅ ②lint 全绿 ✅ ④三数值记录+存档查看 ✅；③玩家现实测试（硬币起卦）与⑤双变体完整通关待玩测阶段。

## 2026-07-12 - M0 gate 通过 + M1 数据层完成（知识库/剧本数据化/lint/铜钱面修正）

- **M0 gate 通过**：宗主过目通过第一章剧本，三张 KP 卡升 accepted（`7ebee7d`）。
- **M1-1 知识库文件层**（`577ba54`）：`database/knowledge/kp-ly-00{1,2,3}.json`（PRD § 4.1 全字段 + statusHistory + 冲突/待核记录）；`database/sources/ctext/` 系辞/说卦 pinned 见证快照（原始 HTML×2 + 提取 JSON），闭合审查 advisory。
- **M1-2 剧本数据化**（`527f9b3` + `de2e053`）：`src/game/chapters/chapter1.js` 节点流 320 节点全章转录（9 种节点类型；CP-01/02/03 三线分支路由；固定掷序破案卦 + 真随机本命卦）。台词逐字忠实：agent 5 段 + 主 session 8 段抽查全 verbatim，Han-only 字数偏差 -2.35%。
- **M1-3 lint 管道**（`527f9b3`）：`npm run audit:chapter1`——图连通/CP 完整性（三档 verdict + basis + optimal 强制 sourceRef）/KP accepted gate/账目断言（灵力 12+15+10=37、好感 10）/KP 教学闭环/模板变量白名单/变体骨架 parity/掷序守卫。全章转录后全绿 exit 0。
- **M1-5a 铜钱面口径修正**（`0c98315`）：engine.js 注释 + LiuyaoModule 显示映射按典籍翻转（3=背；三背=重=老阳），label 花→背。排盘数学零改动：test:liuyao fail 0，audit:liuyao 17,026 项 0 fail。
- 下一批：M1-4 章节播放器 / M1-5b 摇卦交互组件 / M1-6 三数值系统。

## 2026-07-12 - 第一章剧本三轮 fresh-context 审查收敛

- /iterative-review 三轮收敛：R1 全量（opus）抓 2 P1——第七幕时辰倒退（丑末寅初早于第五幕寅时，改寅正）、KP-002 引导教学块缺失（六掷段补块，灵力账目口径改为「教学块 12 + CP 掌握奖 15 + 通关 10 = 37」）——及 3 P2（好感对账 +10、拼音禁直显 M1 注记、柴刀红鲱鱼收束）；R2（opus）验真全部修复 + 抓 2 P2（三线汇合点措辞矛盾→统一「岔路口」+ M1 路由标注；CP-03 B/C 分支散文化，闭合「卦从地里长出来」母题第三次回收）；R3（sonnet，delta）**convergence verified 0 findings**。
- 两轮审查均独立复核知识层：引擎实跑（贲之艮/泰）、双典籍 /tmp 缓存逐字比对、wikisource pageid 核对——**零硬伤**；铜钱面口径冲突注记被独立确认属实。
- 修复后正文 10,729 字，通关估算 34–56 分钟（CP-03 散文化顺带缓解原 31 分钟贴线风险）。commits: `2c26e3d`（R1 修复）、`f08df14`（R2 修复）。
- 状态：待宗主过目（M0 gate 不变）。

## 2026-07-12 - 第一章《第一卦》剧本 v1（M0 交付物，待宗主过目）

- 新增 `docs/script/CHAPTER_1_SCRIPT_v1.md`：人读版八幕剧本（正文实测 10,222 字，估算通关 31–54 分钟）。剧情固定卦象**山火贲·初爻动·变艮为山**，掷序 `[9,8,7,8,8,7]` 经 `engine.js paipan()` 实测验证；含 7 个教学时刻标注（3 KP 各走完示范→引导→独立闭环）、3 个计分抉择点（CP-01/02/03，YAML 完整标注 + source_ref 可回溯）、双性别模板变量全程书写（骨架一致，4 处风味并排）、章末三线钩子（本命卦/裁页内应/钱囊师承）。
- 跟随制审计首批产出（附录 A 三张 KP 卡，原文照录 + ctext/wikisource 定位）：系辞、说卦、《卜筮正宗·以钱代蓍法》、《增删卜易·占卦法/动变章第七》均已实核。
- **审计发现①（冲突，DB-006 记录）**：两典籍互证「以背记数」（三背=重=老阳 9），`engine.js:56` 注释「正面(字)=3」与典籍相反——排盘数学无损，M1 需修正注释与摇卦 UI 面向映射；剧本演出已按典籍口径。
- **审计发现②（归属修正）**：现存《火珠林》辑本全文检索无掷钱操作章句，PRD § 8.3「三钱起卦法源流」按见证现状降为纳甲断法早期见证 + ⚠️ 待核影印本；三钱操作法文字见证以《卜筮正宗》《增删卜易》为准。

## 2026-07-11 - PRD v2：产品主线翻转为修仙恋爱教学游戏

- 重写 `docs/PRD.md`（v2.0）：主线从"数据库治理优先"翻转为"游戏本体优先"——玩的过程就是在用知识，角色即课程，权威数据库为底色（世界物理法则），寓教于乐。旧 V0→P4 串行阶段结构作废。
- 新增教学体系设计：知识点模型（KP，典籍出处硬要求）、五阶掌握度状态机（见过→用过→掌握→内化，剧情行为驱动）、五类教学时刻（示范/引导/独立/教授/回响）、认知负荷规则（每章 ≤3 新 KP）、间隔复用规则、隐形评估（抉择点即测验，verdict + source_ref 可 lint）。
- 修仙融合：境界=学习阶段映射、渡劫=综合剧情案例（非考试）、灵力/掌握度/好感三数值分离。
- 新增 bonus 章节体系（情感章/游戏章/私教章）与 NPC 性别可选方案（角色位双性别变体，骨架共享，成本 +25% 非 ×2）。
- 数据库条款处置：DB/SAFE/TOOL/DATA 与四层来源模型原样继承；ASM/EDU/GAME 变形继承；审计改跟随制（章节 KP 清单牵引）；知识库首期走 `database/knowledge/` 文件层不建表。
- 旧 PRD v0.1 归档至 `docs/archive/PRD_v0.1_governance_2026-07-11.md`；新建 `CUSTOMER_REQUIREMENTS.md`（F1–F6）。
- 首个垂直切片定为六爻域《第一卦》：3 个 KP、真实摇卦交互（复用已验证引擎）、验收含"玩家通关后能独立起卦"。

## 2026-07-11 - 完成《素问要义》首轮引文人工裁决

- 在 adjudication/normalized 层将错误拼接的 `逆春气则伤肝,夏为寒变` 校正为底本原句 `逆之则伤肝,夏为寒变`，并记录同篇另一句 `逆春气,则少阳不生,肝气内变`；导入的 Skill 原文件保持原哈希不改。
- 对其余 28 条机械未命中项逐条分类并回接原文行：删节、拼接、改写、编辑性说明、王冰注、后世概括、现代括注和遗篇 OCR 差异不再混称为《素问》直引。
- 111 条引文现为 12 条原字符命中、64 条规范化连续命中、7 条省略分段命中、28 条人工形态裁决，待人工 0；693 项审计 0 fail，全部内容仍 blocked。

## 2026-07-11 - 建立中央参考文献与典籍来源库

- 将 `database/sources/` 定为全项目统一来源入口，新增可重建的 `source-library.json` 和使用说明；现有正文保持单一 canonical 文件，不复制、不静默搬动。
- 索引 252 个来源文件：43 份中医原文/状态、50 份中医整理稿、14 份现代边界证据、两套各 70 份 compendium、共享文本见证、相术来源清单、GeoNames 与许可文件。
- vision-api compendium 中 46 份仍与 canonical 相同，24 份因后续校正已成为历史变体；索引逐文件标记并固定 SHA256。

## 2026-07-11 - 《素问要义》引文原文命中清单

- 从 `42-经典-素问要义.md` 抽取 111 段显式引文，对照本地《黄帝内经素问》全文：12 段原字符连续命中、63 段去格式/标点后连续命中、7 段省略号分段命中、29 段进入人工裁决。
- 新增 `tcm-classic-quote-provenance.json`、构建/审计脚本和专项测试；561 项来源哈希、定位、唯一性与运行时阻断检查 0 fail。
- 文本命中只证明所选本地见证存在相应字符，不自动授证整理稿解释、现代医学类比、方药剂量或产品用途；全部记录继续 blocked。

## 2026-07-11 - 相术两份 raw 完成逐行裁决

- 将课程标签、编辑性师父引语、JavaScript 外壳、AI 功能说明、免责声明和导航与传统知识分开；它们保留在 raw，但不再虚增“待找古籍出处”数量。
- 以《神相全编》气色段和《Indian Palmistry》辅助线见证裁决剩余气色、命运线、太阳线与健康/肝线；婚姻线、耳低人格、小指歪斜人格仍明确记为未定位来源。
- 两份相术 raw 的 386 条非空行现为 100 条结构行、286 条已裁决行、0 条无人裁决；7 个来源记录、37 段摘录、45 条规范主张、41 条旧文裁决共 534 项审计 0 fail。未定位、冲突和扩写项继续 blocked，不以“待办为 0”冒充内容全对。

## 2026-07-11 - 相术五官旧文逐组裁决

- 回接《神相全编》当前见证中的额、眉、眼、鼻、口、颏六组原文；原典存在的传统判断进入 source-pinned core，旧库附加的现代人格、能力、职业、健康和数值阈值不随之晋升。
- 六组旧文统一裁定为“部分有见证、附加主张未定位”，继续保留原 raw；相术累计 191 条记录已裁决、95 条待找出处，34 段摘录、42 条规范主张、24 条旧文裁决共 453 项审计 0 fail。

## 2026-07-11 - 相术十二宫与掌相传统分层

- 以《神相全编》当前见证逐宫校正十二宫位置：田宅宫由旧库“眉眼之间”改为“两眼”，保留妻妾/夫妻、男女/子女、奴仆/交友的新旧称，并记录编号十二宫以相貌宫收尾、父母宫另见总诀的版本差异。
- 识典《神相全编》卷八见证固定三才纹、天/地/人纹与一般指形原文，但不据此把现代生命线/智慧线/感情线映射及具体手指能力扩写晋升为已验证内容。
- 行星掌丘明确归类为西方手相传统，与中国八卦掌位分层；仅来源支持的名称和位置可进入文化学习运行时，火星正丘/负丘/平原及人格吉凶解释继续待证。
- 相术 raw 仍为 386 条非空行，已裁决记录增至 142 条，待找出处降至 144 条；6 个来源记录、28 段界定摘录、36 条规范主张、18 条旧文裁决共 381 项审计 0 fail。

## 2026-07-10 - 数据库改为典籍见证优先

- 新增 `DATABASE_SOURCE_DOCTRINE.md`，把典籍见证、传统解释、现代边界和产品呈现拆成四层；卫健委、药监与药典只承担现代身份/安全/使用边界，不替代传统文献。
- 建立相术首批来源核心：两份 raw 的 386 条非空行全部入 inventory，31 条已进入首批裁决、255 条知识承载行待找出处；4 个文献见证、11 段短摘录、18 条传统条目和 13 条旧 compendium 裁决共 199 项审计 0 fail，原文件哈希不变。
- 确认《神相全编》等确有外观到衣禄、贵劳等传统判断；旧“上停长少年得志、学业佳”与当前见证“上停长少年忙”冲突，按原文/现代扩写分层保存。
- 面相/手相运行时策略从整体排除解释改为只允许 source-pinned 文化讲解；无出处扩写和医疗、财务等现实决策用途继续 blocked。

## 2026-07-10 - 相术几何旋转不变性修复

- 面部对称性改为沿额头到下巴中轴的法向投影，不再直接比较图片 x 坐标。
- 小指是否达到无名指关节改为沿腕点到无名指尖轴投影，不再直接比较图片 y 坐标。
- 新增合成关键点旋转属性测试：面部旋转 30°、手部旋转 90° 前后结果保持一致。

## 2026-07-10 - 手部几何单位与掌丘伪测量修复

- 修正手指间距单位错配：MediaPipe 路径输出角度，运行时改为直接显示逐指角度，不再用 `0.06` 归一化阈值误判宽窄。
- 移除以 MCP/PIP/腕点深度冒充掌丘饱满度的估算；21 个手部关键点不支持掌丘表面测量，AI 输入和 UI 不再显示该伪结果。
- 新增合成关键点回归，固定 `moundEstimates` 不得重新进入特征合同，并验证旧字段即使出现也不会进入 AI prompt。

## 2026-07-10 - 面相与手相解释层隔离

- 面相三停、眉距和下巴描述只保留几何差异，不再把比例直接写成少年/中年/晚年运、人格或行动力。
- 手相指长、指缝、掌纹和丘位只保留外观描述；人格、职业、能力、财富、关系与现实运势推断统一 blocked。
- 面相/手相 prompt 与模块说明改为传统术语学习边界；新增运行时回归固定结构字段和 AI 输入不得消费未验证解释。

## 2026-07-10 - 中医附方实体化与来源计数缺口

- 将 `24-30` 方剂分册中的显式附方拆成 180 个独立 blocked 实体，逐条保留来源文件、行号和原文。
- 发现第 25 分册声称 45 个附方但正文只明确列出 43 个；不补造缺失方名，新增 finding 并保持 2 个来源缺口开启。
- `audit:tcm-formula-catalog` 扩展到 21 个 finding、11,762 项检查，0 fail；84 个运行时及相邻文件仍未消费该候选 core。

## 2026-07-10 - TCM food-medicine directory adjudication

- 固定国家卫健委当前 106 项食药物质目录：2002 年 87 项、2019 年 6 项、2023 年 9 项、2024 年 4 项。
- 逐项裁决 Skill A 级清单 15 项和 8 条明确食疗/药食配方主张；15 项中 13 项匹配目录，绿豆、核桃仁不继承目录身份。
- 38 个配方原料引用中 18 个匹配、5 个身份/炮制缺口、15 个不在目录；所有配方、剂量、病种和特殊人群用法继续 blocked。
- 新增 48 项 0 fail 审计、6 项专项测试与 84 文件运行时旁路扫描。

## 2026-07-10 - TCM runtime semantic closeout

- 修复望诊 follow-up UI 与安全 prompt 不一致：移除“追问具体调养方法”，统一为颜色、形态和拍摄质量范围提示。
- 移除普通八字的健康快捷分析与诱导示例；手相和面相不再把生命线、疾厄宫或几何特征转化为体质、疾病、寿命或养生结论。
- 去掉面型几何分类中无法由当前模型证明的面白/青/黑/红/黄字段。
- 增加运行时回归，覆盖望诊、八字、手相和面相的首轮与追问边界；奇门疾病用神、风水病符/化解旧表保持未消费且未授证。

## 2026-07-10 - TCM classics and food-therapy inventory

- 完成剩余 `references/42-48` 的 1,142 条非空行、8 表/79 表格行和 145 标题完整 blocked inventory；TCM 50 个 reference 至此全部进入逐批 inventory。
- 新增 603 条重叠窄风险视图、20 个重点裁决、官方 comparator、6 项专项测试与 `audit:tcm-classics-food`；14,281 项检查 0 fail。
- A/B 级、食疗级和药食两用均降为来源自述；旧 `tcm-data.js` 无 importer，八字健康食疗 runtime blocked；106 项食药物质和逐条剂量/疗效仍待现行裁决。

## 2026-07-10 - TCM formula catalog inventory and safety boundaries

- 完成 `references/24-30` 的 820 条非空行、8 表/171 表格行、81 标题和 186 个格式化方剂定义的完整 blocked inventory。
- 新增 522 条重叠窄风险视图（含 158 条禁忌/慎用）、20 个重点裁决、官方 comparator、6 项专项测试与 `audit:tcm-formula-catalog`；11,395 项检查 0 fail。
- 修复括号出处格式漏掉九味羌活汤、黄连解毒汤、九仙散、紫雪的问题；182 个教材正方逐分册计数匹配，4 个经典锚点另计。同名异方、青木香、重金属、急症替代、催吐、妊娠和现代适应证均保持 blocked。

## 2026-07-10 - TCM herb catalog inventory and safety boundaries

- 完成 `references/15-23` 的 1,331 条非空行、45 表/279 表格行、122 标题和 100 条实际病证反查完整 blocked inventory。
- 新增 663 条重叠风险候选、20 个重点裁决、官方 comparator、8 项专项测试与 `audit:tcm-herb-catalog`；14,281 项检查 0 fail。
- 确认原文“103 条”实际缺 52-54，并有 `47→36`、`60→55` 两处逆序；儿童比例剂量、6 条毒物处置、49 条外用路线、马兜铃酸、砷汞铅、21 条现代用途/疗效和急症反查均保持 blocked。

## 2026-07-10

### fix: 全量归一化并审计中医基础理论、四诊与辨证候选层

- 全量 inventory Skill `01-14` 的 14 个 reference、836 条非空行、31 张表、157 个表格行和 124 个二/三级标题；全部保持 product blocked。
- 新增 127 条诊断、治疗、预防、剂量和现代外推优先视图；该视图只作人工复核路由，不代表完整临床语义。
- 用 NCCIH、WHO、CDC、CCMQ 与诊断一致性/脉诊可靠性系统综述建立现代证据边界；确认 14 个代表性 finding。
- 阻断板蓝根/大青叶防流感、地域/体型定剂量、“胜毒”、体质决定发病、小儿指纹判危、舌脉直接定位疾病和固定卒中先兆等外推。
- 新增规范候选、证据快照、6 项专项测试和 `audit:tcm-theory-diagnosis`；5,064 项检查 0 fail，84 个运行时/邻接文本文件未导入该候选 core 或 finding ID。
- fresh review 纠正“诊断/外治旁路为 0”的过宽文档声明；旧 `tcm-data` 与望诊追问仍含未授证传统诊断/食疗文字，留作后续运行时语义审计。

### fix: 全量归一化并审计中医内科病种红线

- 全量 inventory `31-37` 的 52 个主病种、689 条非空行、22 张表、133 个表格行；另建 83 条关键词风险和 308 条广义可执行处置候选视图，全部保持 product blocked。
- 用 CDC、AHA/Red Cross、NIDDK、NIH MedlinePlus、WHO、HRSA、Red Cross 和 NHLBI 官方资料核验现代急症识别与升级边界。
- 确认 9 条冲突/无依据内容，新增阻断上消化道出血固定剂量和急腹症方药替代；9 条现代急症升级红线获有边界支持。
- 自杀风险原文缺即时危险升级，痉证气道护理混入口腔操作措辞，2 条均按混合边界 blocked。
- fresh review 发现 83 条关键词视图不能代表完整风险面；新增 308 条广义处置扫描并明确两种视图都不是临床语义全量授证。
- 新增规范候选、官方 comparator、8 项专项测试和 `audit:tcm-disease-red-flags`；2,589 项检查 0 fail，84 个运行时/邻接文本消费者无旁路。

### fix: 全量归一化并审计中医穴位与外治安全候选层

- 全量解析 Skill `38-41` 的 361 经穴、40 奇穴、3 级操作标签、240 条操作/风险声明和 27 组病证处方；30 个旧运行时穴位全部建立候选映射。
- 以 GB/T 12346-2021、GB/T 40997-2021 确认现行状态与 362/51 范围；逐名比较降级为固定二级转录候选，提示本地缺 1/17、3 个经穴名差异、6 个未匹配奇穴及 2 类身份/重复问题。
- 确认 `GB31 风市` 保留旧版腘横纹上 7 寸，现行标准为 9 寸；因未保存现行完整定位正文，全部 401 条定位继续 blocked。
- 否定全局 A 级家庭按压、A- 家庭艾灸和针刺处方向家庭按压/艾灸的无证据外推；胎位不正固定成功率与晕针家庭处置扩展一并阻断。
- fresh review 发现风险正则漏掉普通按摩/耳穴表格后，补齐 763 条非空原文行、27 表/471 表格行的 blocked inventory；14 项专项测试和 4,904 项审计 0 fail，84 个运行时/邻接文本消费者无旁路。

### fix: 全量归一化中医妊娠、配伍、马兜铃酸与方剂警示候选层

- 将 Skill 的妊娠 3 行/35 项、十八反 3 组、十九畏 9 组、马兜铃酸说明及 31 行/37 方名警示拆为稳定候选记录；全部保持 product blocked。
- 为 109 个比较药名建立 2025 药典一部目录身份索引和 2020 数字药典历史注意字段快照；记录 13 条妊娠等级冲突，且不把 2020 历史支持冒充 2025 现行结论。
- 展开十八反 50 个主表药对和 2 个明确补充药对，52/52 有历史注意字段支持；十九畏 10 对仅 7 对有历史支持，另有 2 个名称类扩展缺支持。
- 按 2003/2004 监管通知纠正 Skill 马兜铃酸名单混批次、遗漏朱砂莲及混同广防己的问题；现行处方/标准状态未完全裁决前不作法律结论。
- 阻断瓜蒂散、三圣散两行家庭催吐/处置式内容；新增来源快照、规范候选、13 项专项测试和 `audit:tcm-pregnancy-compatibility`，1,969 项检查 0 fail。
- fresh review 未发现 parser/core 的 P0/P1；修复 runtime 旁路只扫描 `src` 的 P2，现显式覆盖 84 个前端、服务端、JSON、入口和配置文本文件。

### fix: 全量归一化并审计中医药典候选层

- 将 Skill 安全表 100 行/101 味逐行转为可回指 raw locator 的候选 schema；所有剂量和运行时字段保持 blocked。
- 以 2025 版药典一部品名目录核对身份：79 味命中、22 味缺失或未裁决；校正“三棵针”为“三颗针”，保留贯众歧义和光慈菇/山慈菇边界。
- 以国家药典委员会 2020 数字药典作历史对照：79 味命中，41 味克数覆盖一致，38 味存在数量差异；不把 2020 值冒充 2025 现行标准。
- 检出并阻断 11 行急救/居家解毒内容；记录十八反主表“沙参(苦参)”混名错误，当前中医运行时剂量和急救旁路均为 0。
- 新增固定来源快照、规范候选、6 项专项测试和 `audit:tcm-pharmacopoeia`；2,468 项全量检查 0 fail。

### fix: 固定并验证共享城市与民用时区核心

- 将 374 个现有城市标签绑定 GeoNames ID、WGS84 坐标、国家码、IANA zone 和固定原始行快照；拉斯维加斯由错误山地时区改为 `America/Los_Angeles`。
- 真太阳时由固定标准经线改为按当地民用日期解析历史 UTC offset/DST；重复和跳过时刻默认拒绝，不静默归一化。
- 按 NOAA 修正闰年 fractional-year 分母为 366；八字、八字健康、紫微、奇门和城市选择器统一使用共享 API。
- 132,836 项审计 0 fail，含 374 条来源行、276 个中国城市省级行政区合同、73,414 日均时差、17,952 城市时点和 10 个转换 fixture；全库测试 103/103，桌面和 390×844 用户路径通过。
- 宿主 tzdb 版本、任意坐标、时区边界多边形和重复时刻前/后实例选择保持明确边界。

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
