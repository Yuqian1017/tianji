# 天机卷 Database Validation Ledger

- 状态：执行中
- 更新日期：2026-07-18
- 计划：`DATABASE_VALIDATION_PLAN.md`

## 状态说明

`planned`、`in_progress`、`pass`、`fail`、`blocked`、`school_difference`。

`pass` 必须写明证据等级和具体范围。没有 evidence 的“看起来正确”仍是 `planned`。

## Active Cases

| ID | Priority | Domain | Validation unit | Contract | Evidence target | Status | Current evidence / next action |
|---|---|---|---|---|---|---|---|
| VAL-INV-001 | P0 | 全库 | Runtime engine/data/prompt 与 raw source inventory | 结构 | V1 | in_progress | 枚举文件、导出、表与规则单元 |
| VAL-BZ-001 | P0 | 八字 | 年月日时四柱与节气/日界口径 | 精确/流派确定性 | V3+V5 | in_progress | V3 已达：`sxtwl@2.0.7` 30/30 四柱一致，1,296 节令时刻最大差 20 秒；V5 UI/保存同路径证据待补 |
| VAL-BZ-002 | P0 | 八字 | 大运顺逆、起运岁数、交运时间 | 流派确定性 | V3 | pass | 明确采用 `Yun Sect 1 / traditional_shichen`；`sxtwl` 相邻节令加经典规则独立推导 30/30 方向、交运日期与首运干支一致；不覆盖其他流派或吉凶解释 |
| VAL-BZ-003 | P1 | 八字 | 身强评分、五行计数与用神方向 | 流派/启发式 | V2+来源声明 | fail | `/100` 无经典量表依据，runtime 也不忠实于 compendium 简化版；两条《滴天髓阐微》命例反驳统一用神方向。产品已降级为 `heuristic_only`，不再输出确定用神 |
| VAL-BZ-004 | P1 | 八字 | 天干五合与地支合冲刑害会有限表 | 来源忠实性 | V3 | pass | 五合、六合、六冲、三合、三会、六害、两支相刑和自刑全量枚举通过；关系只作 `lookup_only`，相破因版本差异保持 inactive |
| VAL-BZ-005 | P1 | 八字 | 桃花、驿马、华盖三张查表 | 流派查表 | V2+回归 | pass | 36/36 映射匹配传统分组；年支/日支并用明确为项目口径，只输出 `lookup_only` 标签，不作吉凶 |
| VAL-BZ-006 | P1 | 八字 | 天干/地支合化成立条件与关系吉凶 | 流派解释 | V3 | blocked | 当前不检查月令、透干、旺气、伤克等成化条件；候选五行仅作元数据，所有现实事件与吉凶解释保持未验证 |
| VAL-SHARED-001 | P0 | 共享历法 | 公农历、节气、时区、真太阳时 | 精确确定性 | V3+V5 | pass | 当前 374 城市域已绑定 GeoNames 坐标、行政区与 IANA zone；132,836 项审计 0 fail，含 276 个中国城市省级合同、73,414 日均时差、17,952 城市时点与 10 个 DST fixture；宿主 tzdb 版本、任意坐标与重复时刻选择不在授证范围 |
| VAL-BZH-001 | P0 | 八字健康 | 五行计数到脏腑风险、疾病、食疗与大运健康的推导 | 医学安全/跨域推断 | V4+安全审查 | blocked | 未验证结构计数不能成为医学证据；runtime、旧历史和 AI 通道已硬阻断 |
| VAL-TCM-001 | P0 | 中医 | 当前 app 中具体药味/剂量/穴位/艾灸与图像推断 | 医疗/安全 | V4+V5 | in_progress | 旧 34 题、9 调养方案、28 药物标签、22 计量项、30 去重穴位已归档；新 blocked candidate core 均未导入；旧 `tcm-data` 无 importer，望诊、八字、手相和面相的健康语义旁路已修复；等待 fresh runtime 复核并继续核验食疗、药食两用及养生解释 |
| VAL-TCM-002 | P0 | 中医 | Skill v3 安全表、毒性、妊娠、配伍、剂量、外治、病种红线与诊断外推 | 医疗/来源 | V4 | in_progress | 导入、法定毒性及八个高风险候选层已通过来源/阻断审计；现行药典正文、逐药逐方组成/剂量、逐穴定位正文、部分监管现状和食疗解释仍待核验 |
| VAL-TCM-003 | P0 | 中医 | Skill 100 行/101 味药典身份与剂量候选 | 医疗/来源 | V1+历史官方对照 | pass | 2,468 项 0 fail；2025 一部目录命中 79 味、22 味缺失/未裁决；2020 官方历史正文命中 79 味，41 味克数覆盖一致、38 味冲突；现行正文未取得，101 味全部 product blocked |
| VAL-TCM-004 | P0 | 中医 | 妊娠禁忌、十八反十九畏、马兜铃酸监管与方剂警示候选 | 医疗/来源 | V1+历史官方对照 | pass | 1,969 项 0 fail；109 个药名以 2025 目录核身份、2020 注意字段作历史对照；妊娠 13 条来源冲突，十八反 52/52、十九畏 7/10 有历史支持；31 行/37 方名与全部候选均 product blocked |
| VAL-TCM-005 | P0 | 中医 | 361 经穴、40 奇穴、外治分级、病证配穴与旧运行时穴位 | 医疗/来源 | V1+官方数量/二级逐名对照 | pass | 4,904 项 0 fail；763 条非空行、27 表/471 表格行完整 inventory；官方现行范围 362/51，缺 1/17 与 3 个名称差异仅为二级转录候选；GB31 定位错误单独确认，全部候选 product blocked |
| VAL-TCM-006 | P0 | 中医 | `31-37` 内科病种红线、急症升级与家庭处置 | 医疗/安全 | V1+现代官方 comparator | pass | 52 病种、689 条非空行、22 表/133 表格行完整 inventory；83 条关键词风险、308 条广义处置候选和 20 条人工裁决共 2,589 项 0 fail；9 条冲突、9 条支持红线、2 条混合边界；所有病机、辨证、方药、剂量和行动字段 product blocked |
| VAL-TCM-007 | P0 | 中医 | `01-14` 基础理论、四诊、体质与辨证 | 医疗/来源/可靠性 | V1+现代官方/系统综述 comparator | pass | 836 条非空行、31 表/157 表格行、124 标题、127 条优先候选和 14 个 finding 共 5,064 项 0 fail；只通过完整 inventory、证据边界与阻断，不授证现代解剖、病因、诊断、预后、预防、剂量或临床答案 |
| VAL-TCM-008 | P0 | 中医 | `15-23` 中药总论、各论与病证用药反查 | 医疗/来源/安全/疗效 | V1+现代官方 comparator | pass | 1,331 条非空行、45 表/279 表格行、122 标题、663 条重叠风险候选和 20 finding 共 14,281 项 0 fail；实际反查 100 条、缺 52-54 且有两处逆序；全部剂量、毒性、毒物处置、外用路线、儿童规则、现代疗效和病证映射 blocked |
| VAL-TCM-009 | P0 | 中医 | `24-30` 方剂总论、正方、附方、场景选方与现代适应证 | 医疗/来源/身份/安全/疗效 | V1+现代官方 comparator | pass | 820 条非空行、8 表/171 表格行、81 标题、186 个格式化定义、180 个显式附方实体、522 条重叠窄风险视图和 21 finding 共 11,762 项 0 fail；182 个教材正方逐分册计数匹配，另有 4 个经典锚点；附方声明 182 但第 25 分册正文少 2，全部方名、组成、剂量、给药、毒性、急症、妊娠和现代适应证字段 blocked |
| VAL-TCM-010 | P0 | 中医 | `42-48` 经典、医家、温病、食疗、药食两用与旧食疗 runtime | 医疗/来源/食品身份/安全/疗效 | V1+现代官方 comparator | pass | 1,142 条非空行、8 表/79 表格行、145 标题、603 条重叠窄风险视图和 20 finding 共 14,281 项 0 fail；A级/食疗级/药食两用均为来源自述；106 项目录另由 VAL-TCM-011 逐项裁决；旧 `tcm-data` 无 importer，八字健康食疗 runtime blocked，全部候选 blocked |
| VAL-TCM-011 | P0 | 中医 | 国家卫健委 106 项食药物质目录、Skill A 级清单与明确食疗/药食配方主张 | 食品身份/部位/限制/配方继承 | V2+官方公告 | pass | 106 项按 87+6+9+4 固定；Skill A 级 15 项中 13 项匹配、2 项不在目录；8 条配方主张的 38 个原料引用为 18 匹配、5 身份/炮制缺口、15 不在目录；48 项 0 fail，全部产品用法 blocked |
| VAL-TCM-012 | P0 | 中医/典籍 | `42-43`《素问》《灵枢》《难经》整理稿显式引文来源与形态 | 典籍文本/版本见证/逐条引用 | V2+本地全文+公共转录校勘 | pass | 《素问》111 段为 83 定位/28 人工/0 待办；《灵枢》《难经》98 段为 75 定位/23 人工/0 待办，1,073 项 0 fail；3 条实际来自《素问》，3 处本地转录差异获 CText/Wikisource 支持；全部 blocked，不授证解释或现代用法 |
| VAL-TCM-014 | P0 | 中医/典籍 | `44-经典-伤寒论六经方证条文.md` 显式引文来源与形态 | 典籍文本/复本见证/逐条引用 | V2+本地全文+公共转录校勘 | pass | 170 段为 154 机械定位/16 人工/0 待办；9 条同时见《金匮》、4 条声明互参、0 来源错配；后世《伤寒附翼》评语、OCR 占位符和公共转录异文已分层；2,149 项 0 fail，全部 blocked |
| VAL-TCM-015 | P0 | 中医/典籍 | `45-经典-金匮要略杂病方证条文.md` 显式引文来源与形态 | 典籍文本/复本见证/逐条引用 | V2+本地全文+公共转录校勘 | pass | 113 段为 96 机械定位/17 人工/0 待办；4 条同时见《伤寒》、1 条《素问》用语、0 来源错配；大逆/火逆、A2K0/㽲、膀肽/膀胱已分层；1,453 项 0 fail，全部 blocked |
| VAL-TCM-016 | P0 | 中医/医家 | `46-医家-医学心悟要义.md` 显式引文来源与形态 | 医家原著/转引经典/逐条引用 | V2+本地全文+可识别底本公共转录校勘 | pass | 357 段为 240 机械定位/117 人工/0 待办；95 条近似段落定位以指纹冻结，22 条特殊裁决；修正“擀/捋”和“十中之一二/什一”，15 条现代编辑语分层；5,481 项 0 fail，全部 blocked |
| VAL-SOURCE-002 | P1 | 中医/来源 | 倪海厦 Skill 外部仓库的版本、规模、许可、原始见证和可吸收边界 | 来源/许可/溯源 | V1+固定仓库审计 | pass | 固定 commit `ec03c594...`；32 文件/51,258 行；README 许可声明与仓库树不一致，原始参考资料已移除且本地 books 路径不可访问；只登记 metadata，runtime 字段为 0，正文不得晋升为原典或 accepted 主张 |
| VAL-SOURCE-003 | P1 | 数据库/教学 | xuanxue-database-skill 的三库 schema、回测合同、许可和天机卷吸收边界 | 来源/结构/隐私/证据 | V1+固定仓库审计 | pass | 固定 commit `926d0b56...`；14 文件/858 行，MIT LICENSE 完整；吸收匿名命例、冻结断语、观察与方法关联，拒绝少量应验自动验证、经典/个人可靠度混写和现实结果自动改变掌握度；候选 schema runtime 字段为 0 |
| VAL-SOURCE-004 | P1 | 中医/典籍 | `nihaisha-nishi-tcm` 课程证据库、页卡、古籍候选、许可和四部典籍路由 | 来源/许可/经典定位/勘误 | V1+固定仓库审计+交叉检查 | pass | 固定 commit `e3cb5135...`；3,094 文件、2,986 截图、22 文献/10,538 页卡；无标准开源许可，22 文献均缺版本/源哈希；51 条勘误交叉检查后 0 条直接覆盖，灵枢/难经/伤寒/金匮均保持 locator-only |
| VAL-WY-001 | P1 | 五运六气 | 十干中运、主客运太少、十二支司天在泉、主客六气与日级边界标签 | 传统来源确定性 | V2+V5 | pass | 《素问》《医宗金鉴》与教材交叉固定有限规则；60 年、3,325 项 0 fail；桌面/390×844 通过；古法时刻、派生层与现实解释不在授证范围 |
| VAL-ZWL-001 | P1 | 子午流注 | 12 时辰、民用时间边界、12 经脉顺序与基础文化展示 | 来源忠实性+有限表 | V2+V5 | pass | 《针灸大成》固定 12 行与循环；全天 1,440 分钟、4,457 项 0 fail；午时心经文本冲突已裁定；完整针法与医学解释 excluded |
| VAL-LY-001 | P1 | 六爻 | 纳甲、世应、六亲、六神、旬空、伏神、变卦 | 精确/流派确定性 | V3+V5 | pass | 京房八宫纳甲口径；17,026 项项目内全量检查 0 fail，`iching-shifa@1.8.0` 64 静卦与 4,032 动卦对拍 0 mismatch；Playwright 桌面/390px 全六老阳样例通过 |
| VAL-LY-002 | P1 | 六爻 | 用神、旺衰、冲合空亡与现实吉凶解释 | 流派解释 | V3+来源声明 | blocked | 排盘结构通过不授证现实预测；AI prompt 与 UI 已标 `not_validated`，禁止无条件成败、应期和高风险建议 |
| VAL-MH-001 | P1 | 梅花 | 报数/农历时间起卦、互卦、变卦、动爻、体用与笔画数据 | 精确/声明口径 | V3+V5 | pass | 63,061 项全量检查 0 fail；Playwright 报数、时间、文字三路径与桌面/390px 通过；结构可复用，现代文字法单列适配状态 |
| VAL-MH-002 | P1 | 梅花 | 体用、取象、外应与现实吉凶解释 | 流派解释 | V3+来源声明 | blocked | 结构通过不授证现实预测；体用移除吉凶 verdict，互卦/变卦不再称实际过程/结果，AI 标 `not_validated` |
| VAL-YJ-001 | P1 | 易经/64 卦 | 卦序、卦名、上下卦、卦爻辞、互错综、八宫世应 | 精确结构+来源忠实性 | V2+V3 | pass | 1,446 项检查 0 fail；450 条受文与固定维基文库见证对照，19 处差异逐条裁决，12 卦用 CText 抽核；结构核心已规范化 |
| VAL-YJ-002 | P1 | 易经解释 | 64 卦关键词、简释、吉凶卦级、动爻取法和现实预测 | 解释/流派 | 来源声明+教学审校 | blocked | 数据与课程已显式标 `not_validated`；固定吉凶、事业/感情/健康结论不进规范核心库 |
| VAL-ZW-001 | P1 | 紫微 | 命身宫、十二宫、五行局、主辅星、四化与大限 | 流派确定性 | V3 | pass | 声明常见《紫微斗数全书》系星表与闰月重复月序数口径；2,880 盘、314,200 项项目内检查及 `iztro@2.5.8` 325,440 字段对拍均无差异 |
| VAL-ZW-002 | P1 | 紫微解释 | 星性、庙旺陷、格局、宫位断语、飞星/小限/流年应期 | 流派解释 | V3+来源声明 | blocked | 两份主星详解互有差异且未逐条溯源；疾病、婚财、职业和现实吉凶不进规范核心，AI/UI 已加边界 |
| VAL-QM-001 | P1 | 奇门 | 节气、阴阳遁、局数、旬首、值符值使与四盘 | 流派确定性 | V3 | pass | 声明时家拆补转盘、中五寄坤二、天禽随天芮；23,751 盘、1,900,230 项内部检查 0 fail，`3meta@2.6.0` 奇门核心 0 mismatch，`kinqimen@0.3.1` 共享字段 0 mismatch |
| VAL-QM-002 | P1 | 奇门解释 | 九星八门八神吉凶、格局、用神、克应、方位与现实预测 | 流派解释 | V3+来源声明 | blocked | 排盘通过不授证断事；AI/UI 明确 `not_validated`，移除健康、诉讼、投资与吉方吉时建议入口 |
| VAL-FS-001 | P1 | 风水 | 三元九运、二十四山、下卦宅盘、年/月飞星与九宫布局 | 流派确定性 | V3 | pass | 声明沈氏玄空常用下卦正向盘口径；216 盘、6,469 项项目内检查 0 fail，独立实现 6,048 字段 0 mismatch；10,228 个时刻的历法边界 30,684 字段 0 mismatch |
| VAL-FS-002 | P1 | 风水解释 | 九星/组合吉凶、形煞、格局断语、化解、布局与现实预测 | 流派解释/安全 | V3+来源声明 | blocked | 排盘结构通过不授证住宅或个人结果；AI/UI 移除吉凶色、疾病财务映射、摆件施工建议；替卦/兼向/出卦也不在实现范围 |
| VAL-XIANG-001 | P1 | 面相/手相 | MediaPipe 几何、典籍见证与传统解释 | 观测可靠性+来源忠实性 | V1+V3+V5 | in_progress | 几何单位/旋转合同已修复；两份 raw 的 386 条非空行已全量 inventory，31 条已进入首批裁决、255 条待找出处；4 个见证、11 段短摘录、18 条传统条目和 13 条旧文裁决共 199 项 0 fail |
| VAL-PRD-001 | P1 | 产品 | 主 PRD fresh review | 产品/证据 | independent review | pass | 两轮 fresh reviewer 均给出 hold；第二轮聚焦无界 V0、P1 工具闭环、可消费 DB、流派口径和掌握度合同，见 `PRD_FRESH_REVIEW_2026-07-10.md` |

## Findings

用户关于早期八字工具“排盘完全错误”的报告记为高优先级历史证据，不等同于当前 repo 已复现。

| Finding ID | Priority | Case | Status | Observation | Required proof |
|---|---|---|---|---|---|
| F-BZ-001 | P1 | VAL-BZ-001 | verified_remediated | 近似节气已移出 runtime；`sxtwl` 第二实现 30/30 四柱一致，1,296 节令时刻最大差 20 秒 | 保持 V5 用户路径回归 |
| F-BZ-002 | P1 | VAL-BZ-002 | verified_remediated | 一月非连续节令搜索已删除；传统时辰精度的起运间隔、交运公历日期与口径元数据已保存 | 30 例独立推导 0 mismatch；其他流派另建 validation 单元 |
| F-BZ-003 | P1 | VAL-BZ-003 | mitigated | 身强 `/100` 和统一用神方向无可靠来源且被原典反例否定 | 底层仅留作兼容；UI/AI 标为未校勘启发式，移除分数与用神结论；正式算法需重新选派别并建 fixture |
| F-BZ-004 | P1 | VAL-BZ-004 | resolved_school_difference | 旧表把两支同现直接显示为“午未合火”，混淆六合关系与有条件的合化，且未披露火/土分歧 | runtime 改为“午未合”；`huaCandidates` 保留火/土，不判断条件时不宣称合化 |
| F-BZ-005 | P2 | VAL-SHARED-001 | remediated | 日柱改由历法适配层计算；UTC 与 Pacific/Apia 同一输入回归一致，39,447 日连续性通过 | 保持跨 TZ 回归 |
| F-SOURCE-002 | P1 | VAL-SOURCE-002 | verified_blocked | 倪海厦 Skill README 声称 MulanPSL-2.0，但固定仓库无 LICENSE，且 v2.0.0 已移除约 110 MB 原始参考资料，多数蒸馏条目无法回接稳定页码 | 仅允许缺口发现；取得许可、恢复原始见证并逐条回接独立典籍前，不吸收正文或校正 accepted 数据 |
| F-SOURCE-003 | P1 | VAL-SOURCE-003 | adapted_with_blockers | 外部三库模型把“经典所载、个人应验、试用、存疑”放进单一可靠度字段，并允许 3 次应验晋升“已验证”；没有冻结版本、分母、证据等级或排盘口径 | 天机卷拆分 authorityStatus/practiceStatus，要求事前锁定和完整分母；禁止自动提升知识权威或掌握度，产品/隐私评审前 schema 保持 blocked |
| F-FS-001 | P1 | VAL-FS-001 | verified_remediated | 二十四山把每卦前两山的地元龙/天元龙整列对调，并误标 7 山玄空阴阳 | 24 山有限表与独立实现全量一致 |
| F-FS-002 | P1 | VAL-FS-001 | verified_remediated | 山盘/向盘错误地直接按实际坐山/向首阴阳定顺逆 | 改为入中星原宫的同元龙阴阳；216 盘从 1,648 字段差异降为 0 |
| F-FS-003 | P1 | VAL-FS-001 | verified_remediated | 月飞星把公历月当节令月，未按十二节切换 | 复用精确节令历法；2020-2026 与 tyme4ts 10,228 时刻 0 mismatch |
| F-FS-004 | P1 | VAL-FS-001 | verified_remediated | 年份接口未声明立春边界，2000 年后八宅命卦常数错一位 | 增加精确日期辅助函数、太阳年标签；1900-2099 两性 400 值枚举通过 |
| F-FS-005 | P1 | VAL-FS-001 | verified_remediated | 任意 15 度山向都静默套用下卦，没有区分兼向/替卦 | 只接受山中线左右 4.5 度；超出范围显式拒绝 |
| F-FS-006 | P0 | VAL-FS-002 | mitigated | Runtime 把未验证星性、疾病财务断语和摆件化解显示为确定建议 | 用户界面与 AI 上下文只保留盘面结构；传统解释统一 blocked |
| F-BZ-006 | P1 | VAL-SHARED-001 | verified_remediated_bounded | NOAA 均时差已按平年 365/闰年 366 实现；374 城市使用 IANA 民用时区和历史 DST；UI 明确为民用时区口径 | 宿主 tzdb 版本未固定；重复时刻的前/后实例仍需产品控件 |
| F-SHARED-001 | P0 | VAL-SHARED-001 | verified_remediated | 92 个海外城市使用固定标准经线，无法反映历史夏令时；拉斯维加斯还被误列为美国山地时区 | 全部城市绑定 IANA zone；拉斯维加斯改为 `America/Los_Angeles`；纽约/伦敦/悉尼/上海历史转换 fixture 通过 |
| F-SHARED-002 | P1 | VAL-SHARED-001 | verified_remediated | 旧均时差在闰年仍固定使用 365 日分母 | 按 NOAA 说明改为闰年 366；1900-2100 共 73,414 个公历日机械复算 0 fail |
| F-SHARED-003 | P1 | VAL-SHARED-001 | bounded | 夏令时重复时刻和跳过时刻不能被唯一映射为 UTC 瞬间 | 引擎分别返回 `ambiguous`/`nonexistent` 并默认拒绝；当前 UI 不静默归一化，后续补前/后实例选择控件 |
| F-BZ-007 | P2 | VAL-BZ-002 | remediated | 已新增 `dayunStart` 传统时辰精度年月日、`solarDate` 与口径元数据，整数年龄继续兼容 | 历史记录 schema/version 验证 |
| F-BZH-001 | P0 | VAL-BZH-001 | mitigated_blocked | 旧 runtime 以天干 1/藏干 0.5 和固定阈值推导脏腑风险、疾病、食疗和大运健康 | 当前消费路径、旧历史和 AI prompt 均 blocked；独立传统与医学证据通过前不得恢复 |
| F-TCM-001 | P0 | VAL-TCM-001 | mitigated_blocked | 体质模块用 34 题历史简化稿冒充 ZYYXH/T 157-2009 正式量表，并输出药茶、克数、穴位与艾灸方案 | 功能暂停；旧内容完整归档为 `removed_pending_review`；取得合法完整量表和独立验证前不得恢复 |
| F-TCM-002 | P0 | VAL-TCM-001/VAL-ZWL-001 | verified_remediated_basic_scope | 子午流注把传统时辰对应扩写为排毒、疾病提示和最佳吸收时段，八字健康旁路仍残留同类旧句 | 12 行基础结构按《针灸大成》固定；Ziwu 与旁路旧句移除；4,457 项 0 fail；临床解释与完整针法 excluded |
| F-ZWL-001 | P1 | VAL-ZWL-001 | adjudicated | 本地《针灸大成》连续段写“午时手太阴心经”，与同书十二经表、心经章及午时歌冲突 | 规范库采用内部一致的“手少阴心经”，保留冲突及裁定依据，不把本地 OCR/排印错误复制到 runtime |
| F-ZWL-002 | P1 | VAL-ZWL-001 | bounded | 当前功能名“子午流注”可能让 12 行时辰表被误解为完整针法 | 模型明确只授证基础对应；纳甲、纳子、六十六穴开穴、灵龟八法和针刺补泻均 not_implemented/blocked |
| F-TCM-003 | P0 | VAL-TCM-001/VAL-WY-001 | verified_remediated_basic_scope | 五运六气旧算法直接生成重点脏腑、疾病风险和食疗建议 | 基础年结构已来源固定并全量核验；所有健康、疾病和现实气候预测继续 blocked |
| F-TCM-004 | P0 | VAL-TCM-001 | mitigated | 望诊视觉模型从单张照片推断脏腑、体质并给调养建议 | prompt/UI 限制为可见颜色、形态、纹理与拍摄质量描述，不作医学推断 |
| F-TCM-005 | P0 | VAL-TCM-002/003 | verified_blocked | Skill 的 100 行/101 味剂量表来自七版教材且自述未按现行药典校准；与 2020 官方历史正文对照有 38 味数量冲突 | 100/101 已全部规范化；所有剂量 product eligibility=`blocked`；取得适用 2025 正文并逐味核验后再评审 |
| F-TCM-006 | P1 | VAL-TCM-002 | recorded_source_drift | 政府发布页对法定毒性中药出现 27/28 数量漂移；27 项页遗漏红升丹 | 规范库保留 NMPA 指导原则所称 28 项及深圳政府 2026 完整附录，并显式记录冲突 |
| F-TCM-007 | P0 | VAL-TCM-003 | verified_blocked | Skill 把“三颗针”误写为“三棵针”；“贯众”不能唯一映射到绵马贯众或紫萁贯众；光慈菇不能映射为正品山慈菇 | normalized 层校正三颗针；贯众和光慈菇保持显式身份裁决与 blocked；raw 导入不改 |
| F-TCM-008 | P0 | VAL-TCM-003 | verified_blocked | 11 个剂量行含催吐、洗胃、药物急救或居家解毒指令 | 原文只保留审计；所有行标 `blocked_do_not_surface_as_home_treatment`，当前 22 个中医及相邻运行时源码文件的剂量/急救命中为 0 |
| F-TCM-009 | P0 | VAL-TCM-002/003 | source_error_confirmed | 十八反主表写“沙参(苦参)”，混淆两个不同药名 | normalized finding 拆为沙参与苦参；整张配伍表取得现行来源复核前继续 blocked |
| F-TCM-010 | P0 | VAL-TCM-004 | verified_blocked | Skill 妊娠主表和剂量表共有 13 条记录、10 个去重药名与 2020 官方历史注意字段的禁用/慎用等级冲突；附子、桃仁在 Skill 内部也前后不一 | 冲突逐条保留 source locator 与官方历史对照；不自动择一覆盖，全部候选继续 blocked，取得适用现行正文后再裁决 |
| F-TCM-011 | P0 | VAL-TCM-004 | historical_support_bounded | 十八反 50 个主表展开对加 2 个明确补充对均在 2020 历史注意字段出现；十九畏 10 对仅 7 对出现，藜芦/太子参和藜芦/明党参两个名称类扩展也未出现 | 只记录历史支持范围；2020 不能代表 2025 现行正文，未支持项与所有配伍候选均不得进入产品判断 |
| F-TCM-012 | P0 | VAL-TCM-004 | source_error_confirmed | Skill 的马兜铃酸“六味”说明混合 2003 与 2004 两批监管通知、遗漏朱砂莲，并把广防己与木防己/汉防己混同 | normalized 层按通知拆开 7 个监管药名和替代关系；当前目录缺失不等于已证明现行违法，现行处方/标准状态未完全裁决前全部 blocked |
| F-TCM-013 | P0 | VAL-TCM-004 | verified_blocked | 31 行方剂警示展开为 37 个方名，其中瓜蒂散和三圣散含居家催吐/处置式内容 | 原文只作审计证据；两行标 `blocked_do_not_surface_as_home_treatment`，全部方剂警示候选不得直接生成用方或家庭处置建议 |
| F-TCM-014 | P2 | VAL-TCM-004 | verified_remediated | fresh review 发现 runtime 旁路审计只扫描 `src/**/*.js|jsx`，遗漏 `server`、JSON、入口 HTML 与配置 | 改为共享显式清单，覆盖 84 个 `src`/`server`/`public` 文本文件及根入口/配置；完整路径写入 artifact，测试固定服务端、JSON 和入口哨兵 |
| F-TCM-015 | P0 | VAL-TCM-005 | evidence_bounded_blocked | 官方页确认 GB/T 12346-2021 现行且范围 362 穴；固定二级转录以 `GV29 印堂` 补足 362，并显示 BL45、TE11、TE18 名称差异，但 repo 内无可复现的官方逐名清单 | 官方状态/数量与二级逐名比较分开建模；4 项均 blocked，取得可合法固定的官方逐名证据前不得称为官方名称裁决 |
| F-TCM-016 | P0 | VAL-TCM-005 | secondary_transcription_gap_blocked | Skill 的 40 奇穴有 34 条匹配固定二级 51 名转录、缺 17 条、另有 6 条未匹配；`膝眼` 混合经穴/奇穴身份，`落枕穴` 与 `外劳宫` 定位重复 | 官方只授证现行 51 项范围；逐名差异、传统候选和身份冲突分别建模，未裁决项不得自动合并或补入产品 |
| F-TCM-017 | P0 | VAL-TCM-005 | source_error_confirmed_blocked | `GB31 风市` 仍写旧版腘横纹上 7 寸，现行 GB/T 12346-2021 已改为 9 寸 | 记录明确定位冲突；因未保存现行完整逐穴正文，401 条 Skill 定位全部 blocked，不能用单条修正冒充全表通过 |
| F-TCM-018 | P0 | VAL-TCM-005 | unsupported_global_grade_blocked | Skill 把所有穴位按压/自我按摩统一列为 A 级零门槛建议；WHO 推拿基准要求筛查和禁忌判断，FDA 低风险证据只覆盖 P6 止吐设备 | A 标签只保留为来源声明；所有按压病证、力度、时长与孕妇场景继续 blocked |
| F-TCM-019 | P0 | VAL-TCM-005 | verified_blocked | Skill 将悬灸列为 A- 并提供具体家庭方案，包括胎位不正每日操作及 80% 以上成功率 | WHO、Cochrane 和不良事件综述不能支持无条件家庭方案或固定成功率；全部艾灸方案 blocked |
| F-TCM-020 | P0 | VAL-TCM-005 | unsupported_conversion_blocked | 27 组病证把教材针刺处方全局转换为家庭按压/艾灸，覆盖中风、中暑、痫证、阑尾炎、哮喘和妊娠等高风险场景 | 不同操作方式不得互相外推；27 组处方和 240 条操作/风险声明全部候选化并 blocked |
| F-TCM-021 | P0 | VAL-TCM-005 | source_conflict_blocked | 晕针处置增加温糖水和穴位按压，超出 WHO 当前停止操作、体位、评估与按需转诊的事件处理边界 | 家庭急救扩展不进入产品；“禁止自行针刺”只获方向性支持，不授予具体针刺/刺血/拔罐/穴位注射程序资格 |
| F-TCM-022 | P1 | VAL-TCM-005 | verified_remediated | fresh review 发现 240 条风险关键词索引漏掉普通按摩手法和耳穴主治表，不能代表 `38-41` 全部原始内容 | 新增全部 763 条非空行及 27 表/471 表格数据行的精确 blocked inventory；风险索引降为额外视图，14/14 专项测试通过 |
| F-TCM-023 | P0 | VAL-TCM-006 | source_conflict_blocked | 呕吐章节两处要求食物中毒催吐/洗胃或误吞毒物探吐 | HRSA/NIH 中毒急救要求立即联系毒物专家且不得自行催吐；两处均 blocked，不得生成家庭中毒处置 |
| F-TCM-024 | P0 | VAL-TCM-006 | source_conflict_blocked | 急性尿潴留先给皂角吹鼻、取嚏、探吐、250g 热盐熨腹、蒜/栀子贴脐等，失败后才导尿 | NIDDK 将突然无法排尿列为可危及生命、需立即急诊；家庭刺激/热敷路径 blocked，防止延误与伤害 |
| F-TCM-025 | P0 | VAL-TCM-006 | source_conflict_blocked | 附子/川乌/草乌中毒后要求“绿豆甘草汤频饮”，危重才急救 | 疑似中毒第一路径应为急救/毒物中心，不提供家庭解毒替代；同一行剂量、炮制与解毒全部 blocked |
| F-TCM-026 | P0 | VAL-TCM-006 | unsupported_blocked | 胸痛章节要求通用含化苏合香丸/麝香保心丸再叫急救 | AHA 要求立即启动 EMS；本轮来源不支持未个体化中成药作为通用等待期步骤，药物指令 blocked |
| F-TCM-027 | P0 | VAL-TCM-006 | source_conflict_blocked | 厥证把一类晕厥写成平卧并“灌服温糖水” | Red Cross 要求先核反应/呼吸、恢复体位和监测；意识/吞咽未确定时口服指令 blocked |
| F-TCM-028 | P1 | VAL-TCM-006 | unsupported_prediction_blocked | 古训被写成“大指、次指麻木或不用者，三年内有中风之患” | 保留突然单侧麻木/语言异常的卒中急症升级；固定三年风险预测无本次现代证据，blocked |
| F-TCM-029 | P1 | VAL-TCM-006 | supported_red_flags_bounded | 癫痫发作、卒中、真心痛、心肺警讯、急性尿潴留、消化道出血、两条急腹症升级和重症哮喘 9 条红线与现代官方来源方向一致 | 只授证识别/升级边界；本地化急救号码前仍不进产品，且不授证相邻中医病机、方药或剂量 |
| F-TCM-030 | P0 | VAL-TCM-006 | unsupported_treatment_blocked | 吐血表格把大黄粉 3~5g 日 4 次写成上消化道出血首选；急腹症红线旁又给胆囊炎样痛/阑尾炎样痛方药 | 现代 comparator 只支持紧急评估，不支持该固定剂量或方药替代；两行全部 blocked |
| F-TCM-031 | P1 | VAL-TCM-006 | mixed_boundary_blocked | 自杀风险原文只有精神科主责与及早就诊，缺即时危险时的急救/危机服务；痉证护理混入“清除假牙异物”口腔操作措辞 | 两行降为 mixed boundary；不把不完整升级或可能诱发发作期口腔操作的文字授证为安全指引 |
| F-TCM-032 | P1 | VAL-TCM-006 | verified_remediated | fresh review 发现 83 条关键词风险索引漏掉出血剂量、痉证现场操作、急腹症方药和心肺警讯，不能代表 `31-37` 完整医学风险面 | 保留 689 条完整 blocked 原文 inventory，新增 308 条广义处置候选；两种筛选视图均明确为优先复核工具而非临床语义全量授证 |
| F-TCM-033 | P0 | VAL-TCM-007 | framework_boundary_blocked | Skill 把传统脏腑、气血、经络构造与器官功能/疾病机理并列，容易被产品外推为现代解剖生理事实 | 只允许有明确归属的传统理论教学；现代解剖、病因和生理等价字段为空且 blocked |
| F-TCM-034 | P0 | VAL-TCM-007 | reliability_limit_blocked | 舌部脏腑映射、寸关尺脏腑、28 病脉和证候表可能被当作单独诊断或临床答案键 | 系统综述显示总体诊断一致性低至中等、脉诊可靠性依赖操作定义；全部只能作为传统术语候选 |
| F-TCM-035 | P1 | VAL-TCM-007 | scope_mismatch_blocked | `08` 只列阴阳平和/偏阳/偏阴三类，却可能与 CCMQ 体质量表混同 | CCMQ 基准为 60 项/9 类及专门计分合同；三类教材叙述不是短版或等价量表 |
| F-TCM-036 | P0 | VAL-TCM-007 | unsupported_prevention_blocked | `07` 把板蓝根、大青叶防流感列入未病先防 | CDC 当前预防主线为季节性流感疫苗；本轮无该具体中药预防证据，不得输出为预防建议 |
| F-TCM-037 | P0 | VAL-TCM-007 | unsafe_dose_rule_blocked | 地域、体壮体弱和“胜毒/不胜毒”被用于决定药性与剂量 | 不能成为剂量算法；具体药物剂量仍由药典、制剂、适应证、个体临床因素和专业处方决定 |
| F-TCM-038 | P0 | VAL-TCM-007 | unsupported_diagnostic_prognostic_blocked | 小儿指纹“透关射甲”、闻声定病位/不治、固定拇食指麻木中风先兆等直接触发诊断与预后 | 传统映射全部 blocked；真实呼吸困难、意识改变或突发神经症状必须走现代急症红线 |
| F-TCM-039 | P2 | VAL-TCM-001/007 | documentation_claim_corrected | fresh review 发现文档把“候选 core/finding ID 未导入”过写为“诊断和外治旁路为 0”，但旧 `src/lib/tcm-data.js` 与望诊追问仍有同类文字 | 文档已缩窄证据边界；本批不改产品，旧运行时语义继续列为未完成审计，不能宣称临床面 release-clean |
| F-TCM-040 | P1 | VAL-TCM-008 | source_error_confirmed_blocked | 病证用药索引自称 103 条但实际只有 100 条，缺编号 52、53、54，且原始排列回跳 | 完整保留 100 条现有记录与缺号，不补造条目；整张反查表继续 blocked |
| F-TCM-041 | P0 | VAL-TCM-008 | unsafe_home_action_blocked | 原文把生姜、绿豆、防风写作毒物解毒，并建议热水助吐、翎毛探喉 | HRSA/NLM 中毒指引要求专业毒物处置且未经指示不得催吐或使用通用解毒法；全部家庭动作 blocked |
| F-TCM-042 | P0 | VAL-TCM-008 | unsupported_pediatric_dose_blocked | 原文给出“5 岁以下成人 1/4、5 岁以上减半”和使君子按每岁粒数的通用儿童剂量 | FDA 明确儿童不同年龄代谢不同；未取得药物、制剂、体重和适应证级儿科依据前不得进入剂量算法 |
| F-TCM-043 | P0 | VAL-TCM-008 | regulatory_conflict_blocked | 青木香、关木通、天仙藤、马兜铃等含马兜铃酸材料仍在各论中带适应证和剂量 | 2003/2004 中国药监通知与 FDA 进口警示固定取消/限制及肾毒致癌边界；全部相关字段 blocked |
| F-TCM-044 | P0 | VAL-TCM-008 | toxic_metal_use_blocked | 砒石/砒霜、朱砂、轻粉、雄黄、铅丹等砷汞铅材料带内服或外用剂量，并进入病证反查 | 法定毒性和现代重金属 comparator 只支持高风险阻断；不得生成消费者用法、剂量或处方 |
| F-TCM-045 | P1 | VAL-TCM-008 | modern_efficacy_unverified_blocked | 鹅不食草鼻腔单用有效、葛根降压、羊红膻治克山病等现代疗效句未带适应证级来源 | 21 条现代用途/疗效风险行全部 blocked；需逐药逐适应证证据审查，传统教材句不能直接升级为现代事实 |
| F-TCM-046 | P0 | VAL-TCM-008 | prescribing_index_blocked | 100 条病证反查把破伤风、疟疾、中风闭脱证及脓成不溃等直接连到药物组 | 反查只作来源审计；急症必须走标准诊疗，完整索引不是现代诊断或处方权威 |
| F-TCM-047 | P1 | VAL-TCM-009 | parser_format_gap_remediated | 九味羌活汤、黄连解毒汤、九仙散、紫雪使用括号出处格式，旧 parser 只认 `《出处》`，因此误报四个分册各缺 1 个正方 | parser 已兼容两种出处格式并固定四个回归样本；182 个教材正方逐分册计数现全部匹配 |
| F-TCM-048 | P1 | VAL-TCM-009 | source_identity_separated_blocked | 清中汤、黄连阿胶汤、半夏秫米汤、启膈散以“经典锚点”另行插入正文 | 独立标记 `classic_anchor_addition`，不混入 182 个教材正方；总定义 186，但仍不代表组成、剂量或疗效已校勘 |
| F-TCM-049 | P0 | VAL-TCM-009 | unsupported_conversion_blocked | 原文宣称“原方折现代用量”，并用“古一两今一钱”等统一换算 | 未取得逐方、逐药、炮制和制剂依据，所有现代克数换算 blocked |
| F-TCM-050 | P0 | VAL-TCM-009 | unsupported_toxicity_rule_blocked | 方剂总论用“同性毒力共振、异性毒力相制”解释毒性药合用 | 无法授权毒性药配伍或剂量安全，相关规则与处方全部 blocked |
| F-TCM-051 | P0 | VAL-TCM-009 | administration_blocked | 原文给出汤剂日服、呕吐续服、昏迷鼻饲和注射急救等通用路线 | 不得进入消费者自我给药；需制剂、处方、医疗场景和专业监督证据 |
| F-TCM-052 | P0 | VAL-TCM-009 | prescribing_lookup_blocked | 151 条场景表用“首选”把症状或病种直接映射到方剂 | 仅保留为来源索引；不是现代诊断、处方或临床决策权威 |
| F-TCM-053 | P1 | VAL-TCM-009 | same_name_formula_conflict_blocked | 清中汤存在同名异方；回阳救急汤存在两个组成版本 | 必须以方名、出处、版本、组成建立复合身份，当前禁止自动合并或推荐 |
| F-TCM-054 | P0 | VAL-TCM-009 | regulatory_identity_blocked | 紫雪和苏合香丸资料仍含青木香，相关药用标准已被历史监管通知取消并要求替代 | 逐版本裁决青木香/土木香身份前，组成、剂量和适应证全部 blocked |
| F-TCM-055 | P0 | VAL-TCM-009 | toxic_heavy_metal_formula_blocked | 含朱砂、雄黄等法定毒性或重金属药方仍给出精确剂量 | 只保留审计证据，不得生成消费者剂量、用法或家庭治疗 |
| F-TCM-056 | P0 | VAL-TCM-009 | coma_nasogastric_route_blocked | 方剂总论允许昏迷、吞咽困难者鼻饲 | 未取得具体医疗程序和专业监督证据，禁止作为家庭或通用给药说明 |
| F-TCM-057 | P0 | VAL-TCM-009 | stroke_emergency_substitution_blocked | 中风闭证资料称方剂“中风前中后皆可用”并配急救式给药 | 突发神经缺损必须立即走卒中急救；方剂不得延误现代评估 |
| F-TCM-058 | P0 | VAL-TCM-009 | unsafe_emesis_rescue_blocked | 原文提供吐不止后的麝香/丁香/葱白“解救”和羽毛探喉等动作 | NLM 中毒急救反对未经指导催吐和通用解毒；全部家庭动作 blocked |
| F-TCM-059 | P0 | VAL-TCM-009 | high_toxicity_purgative_blocked | 十枣汤等峻下逐水方含毒性药、精确剂量和家庭式服法 | 不得作为自我治疗；需处方、制剂和临床适应证级审查 |
| F-TCM-060 | P0 | VAL-TCM-009 | pregnancy_formula_blocked | 桂枝茯苓丸等方剂资料直接讨论妊娠使用 | 传统文字不能替代逐方、逐成分、孕期和临床场景证据，全部 blocked |
| F-TCM-061 | P1 | VAL-TCM-009 | modern_hypertension_claim_blocked | 原文称部分方为“现代高血压常用方” | 缺具体制剂、终点、比较和安全证据，不能升级为现代疗效事实 |
| F-TCM-062 | P0 | VAL-TCM-009 | modern_cancer_claim_blocked | 桂枝茯苓丸资料扩展到肝硬化、肿大和肿瘤 | 传统方义和教材摘要不授予肿瘤治疗适应证；全部 blocked |
| F-TCM-063 | P0 | VAL-TCM-009 | emergency_bleeding_formula_blocked | 原文把方剂标为“急救止血剂” | 呕血、黑便和大出血需紧急医疗评估，方剂不得作为急救或等待期自疗 |
| F-TCM-064 | P1 | VAL-TCM-009 | modern_efficacy_scope_blocked | 10 条现代用途/疗效风险行缺逐方逐适应证证据；方剂学史、辞典数量和“现代用量”已从该 taxonomy 排除 | 每个制剂和适应证须独立审查；传统出处不构成现代疗效证明 |
| F-TCM-065 | P1 | VAL-TCM-009 | vulnerable_population_scope_blocked | 62 条涉及妊娠、儿童、老人或虚弱人群的文字未形成可验证剂量/禁忌合同 | 特殊人群字段全部 blocked，后续需方剂级权威来源和临床审查 |
| F-TCM-066 | P1 | VAL-TCM-009 | attached_formula_entities_partially_remediated | 分册自称 182 个附方；现已从显式“附”条目恢复 180 个独立实体并固定来源行 | 180 个实体继续 blocked；不得把来源声明自动补成 182 |
| F-TCM-075 | P1 | VAL-TCM-009 | attached_formula_source_count_gap_blocked | 第 25 分册声明 45 个附方，但正文只明确列出 43 个；其余五册声明与显式实体数吻合 | 保留 2 个来源缺口，不把别名、加减描述或其他方名猜作缺失附方 |
| F-TCM-076 | P1 | VAL-TCM-012 | cross_work_attribution_separated | `43-经典-灵枢与难经要义.md` 有 3 条置于《灵枢》段落的显式引文只在本地《素问》连续命中 | imported Skill 保持不动；normalized provenance 标记 `crossSource` 并记录《素问》行号，不得继续作为《灵枢》直引 |
| F-TCM-077 | P1 | VAL-TCM-012 | public_witness_supported_transcription_variants | 本地底本出现“入国间俗/间所便”“九侯”“肺手太阳之脉”，与整理稿读法不一致 | CText/Wikisource 支持“问俗/问所便”“九候”“肺手太阴”；校勘结论写入 overlay，raw 底本不改写，版本级影印校勘仍 open |
| F-TCM-078 | P1 | VAL-TCM-012 | editorial_prose_separated | `FAST`、现代红旗症状串和“虚实核对”被引号抽取，但不是《灵枢》《难经》原文 | 明确裁为现代编辑文字，禁止以经典引文呈现；其独立现代证据与产品资格另审 |
| F-TCM-079 | P1 | VAL-TCM-012 | non_verbatim_forms_classified | 其余 20 条未连续命中项包含删节、拼接、列表压缩、补主语、现代括注与轻微省字 | 每条绑定本地来源行和形态裁决；可追溯不等于逐字引文，更不授证医学解释或现实使用 |
| F-TCM-080 | P1 | VAL-TCM-014 | later_commentary_attribution_corrected | `群方之魁` 被放在《伤寒论》方证段并加引号，但本地正文不载；Wikisource《伤寒附翼》见柯琴“此为仲景群方之魁” | 裁为后世评语，不再作为《伤寒论》正文直引；传统评注仍以独立作品和定位保留 |
| F-TCM-081 | P1 | VAL-TCM-014 | public_witness_supported_ocr_and_variant | 本地底本有“项背强A2K4A2K4”和“身濈然汗出解也”，整理稿分别作“几几”“而解” | CText 支持“几几”，CText/Wikisource 支持“而解”；overlay 记录校勘，raw 底本不改，版本级影印校勘仍 open |
| F-TCM-082 | P1 | VAL-TCM-014 | duplicate_recension_stitching_classified | 6 条人工项从本地重复篇章的不同文句拼接，另 9 条可在《伤寒论》《金匮要略》同时连续命中 | 拼接项标为非逐字引文；多书命中保留全部见证并按 ref44 语境选择《伤寒论》，不把复本重复当冲突 |
| F-TCM-083 | P1 | VAL-TCM-014 | declared_cross_work_references_preserved | 整理稿明确互参《难经》《灵枢》《素问》的 4 条文字不应被算作《伤寒论》错引 | 绑定声明作品；其中 3 条机械命中，1 条《难经》为倒序拼接人工裁决；来源错配计数为 0 |
| F-TCM-084 | P1 | VAL-TCM-014 | editorial_and_later_summary_separated | “六经提纲+主要方证...”“涉药四关”是编辑标签；“痞、满、燥、实”是后世方证归纳 | 不以《伤寒论》原句展示；后世方论可在独立来源层保留，现实用药与教学答案资格另审 |
| F-TCM-085 | P1 | VAL-TCM-015 | secondary_wording_error_rejected | 整理稿和倪海厦页卡均作“火逆上气”，但本地《金匮》、CText、Wikisource 一致作“大逆上气” | overlay 采用“大逆上气”来源结论；倪海厦页卡只记录错误传播和定位，不得覆盖原典 |
| F-TCM-086 | P1 | VAL-TCM-015 | public_witness_supported_local_ocr_corrections | 本地底本有“腹中A2K0痛”和“结在膀肽” | CText/Wikisource 支持“腹中㽲痛”“结在膀胱”；raw 不改写，版本级影印校勘仍 open |
| F-TCM-087 | P1 | VAL-TCM-015 | duplicate_shanghan_witnesses_preserved | 4 条显式引文同时在本地《金匮要略》《伤寒论》连续命中 | 保留两书定位并按 ref45 语境选《金匮》；复本重复不是来源冲突 |
| F-TCM-088 | P1 | VAL-TCM-015 | external_suwen_allusion_separated | “有故无殒”只在本地《素问》连续命中，整理稿用它说明《金匮》妊娠方的历史语境 | 标为外部经典用语，不算《金匮》正文，也不算来源错配 |
| F-TCM-089 | P1 | VAL-TCM-015 | non_verbatim_and_editorial_forms_classified | 17 条人工项包含相邻段拼接、删节、语序重排、方名异体、版本括注和现代缩写 | 每条绑定来源行与形态裁决；可追溯不等于逐字引文，不授证医学解释、急救或现实使用 |
| F-TCM-090 | P1 | VAL-TCM-016 | scan_based_character_correction | 整理稿作“常以手从心捋至脐下”，本地、CText、Wikisource 均缺该字；绑定香港中文大学扫描本的中醫笈成整理文本作“擀” | overlay 采用“擀”并保留版本限定；raw 不改写，待独立逐页检查扫描本后再提升见证等级 |
| F-TCM-091 | P1 | VAL-TCM-016 | quantitative_compression_rejected | 整理稿“或救什一”把可识别底本的“或救十中之一二”压成不同的比例；本地 raw 在“或救”后截断 | 不把“什一”视作等价原文；normalized 修正为底本读法，raw 保持原样 |
| F-TCM-092 | P1 | VAL-TCM-016 | shared_transcription_error_propagation | 本地与 Wikisource 均作“喜冷冻饮料食”，而可识别底本整理文本作“喜冷饮食” | 共同错误不能按见证数量投票；Wikisource 在此只证明传播链，校勘采用“喜冷饮食”并保留版本边界 |
| F-TCM-093 | P1 | VAL-TCM-016 | missing_herb_character_normalized | 本地/CText/Wikisource 多处出现“参、 、归、术”“人参、 、术”缺字，可识别底本作“耆” | 记录“耆→芪”的异体/现代药名规范化和缺字依据，不把整理稿现代字形伪装成 raw 原字符 |
| F-TCM-094 | P1 | VAL-TCM-016 | editorial_quotes_separated | 15 条双引号文字是现代教学问题、比较标签、解释或数据库规则，例如“为什么不能随便发汗”“感染好转/恶化” | 改判 editorial，不作为《医学心悟》直引；独立教学价值和现代证据另审 |
| F-TCM-095 | P1 | VAL-TCM-016 | reviewed_approximate_locators_frozen | 95 条非连续形式可稳定回接《医学心悟》同一段，主要涉及删节、标点重排、括注、等号化表达和现代缩写 | 逐条人工检查并冻结定位指纹；来源可追踪不等于逐字引文，也不授证解释或现实使用 |
| F-XIANG-001 | P1 | VAL-XIANG-001 | boundary_overreach_corrected | 旧运行时把无出处扩写直接当结论，首轮修复又把“无现代验证”误当成传统内容应整体排除 | 保留几何隔离，但改为典籍见证优先：有出处条目进入带引用文化层，无出处/冲突扩写保持候选或 blocked；不删除 raw |
| F-XIANG-002 | P1 | VAL-XIANG-001 | geometry_contract_remediated | 手指间距实际为度数却按 `0.06` 阈值判宽窄；掌丘估计返回字符串却按数值比较，且 21 点骨架本身不覆盖掌丘表面 | 指缝只显示逐指角度；删除 `moundEstimates` 计算、展示与 prompt 消费，合成关键点回归固定能力边界 |
| F-XIANG-003 | P1 | VAL-XIANG-001 | rotation_dependency_remediated | 面部对称性直接比较图片 x 坐标，小指关节判断直接比较 y 坐标；同一关键点旋转后结果改变 | 分别沿面部中轴法向和无名指轴投影；30°/90° 合成旋转属性测试固定结果不变 |
| F-XIANG-004 | P1 | VAL-XIANG-001 | source_conflict_confirmed | compendium 写“上停长：少年得志、学业佳”，当前定位《神相全编》见证为“上停长少年忙” | 旧扩写不得冒充原典；保留 raw，规范层采用原文并记录冲突，继续查其他版本/流派是否存在不同说法 |
| F-XIANG-005 | P1 | VAL-XIANG-001 | source_pinned_cultural_claims | 《神相全编》《神相铁关刀》《许负相法》确有由外观/掌纹联系衣禄、贵劳、财帛等传统判断 | 这些内容恢复为带作品、见证、定位和原文的文化知识；现代预测效力不在本次来源验证通过范围 |
| F-XIANG-006 | P1 | VAL-XIANG-001 | attribution_and_authorial_caution | 《许负相法》序言承认“多后世增色”；《公笃相法》手掌图说自陈经验甚少 | 同时保存文本见证、传统题署、归属争议和作者保留意见，不把书名题署或单段规则升级为无争议事实 |
| F-TCM-067 | P1 | VAL-TCM-001/010 | runtime_prompt_mismatch_remediated | 望诊 system prompt 每轮禁止医疗推断和调养建议，但 follow-up 输入框仍提示“追问具体调养方法”，主动诱导越界 | placeholder 改为复用 `WANGZHEN_FOLLOWUP_HINT`，只提示颜色、形态与拍摄质量；专项回归禁止旧文案恢复 |
| F-TCM-068 | P0 | VAL-TCM-001/VAL-BZ-003 | cross_domain_health_inference_remediated | 普通八字模块仍提供“健康”快捷分析，手相把生命线映射为体质、养生和健康变化；两条路径都进入 AI | 删除八字健康入口和诱导示例，system prompt 对自由追问硬拒绝；手相只描述掌纹外观并禁止健康、寿命和医疗推断 |
| F-TCM-069 | P0 | VAL-TCM-001 | face_health_inference_remediated | 面相 prompt 把疾厄宫直接映射健康并要求健康提示，面型数据还把几何分类写成面白/青/黑/红/黄 | 疾厄宫只保留传统名称；移除健康输出和伪肤色字段，首轮与追问统一禁止健康、疾病、寿命和医疗推断 |
| F-TCM-070 | P1 | VAL-TCM-001/VAL-QM-002/VAL-FS-002 | dead_unconsumed_bounded | 奇门 `QIMEN_YONGSHEN` 和风水 `STAR_COMBO`/`STAR_REMEDY` 仍含疾病、病符与化解文字，但当前无导入引用，formatter/UI 只消费数字和星名 | 归类为 `dead_unconsumed`，不授予正确性；保持无消费回归，未来若接入必须单独校勘和安全评审 |
| F-TCM-071 | P1 | VAL-TCM-011 | source_scope_overstated_blocked | Skill 把 15 项 A 级食物称为“教材注明药食兼用”，其中绿豆、核桃仁不在当前 106 项目录 | 不否定普通食品身份；但不得标食药物质目录成员，15 项具体用法仍逐项 blocked |
| F-TCM-072 | P0 | VAL-TCM-011 | spice_only_scope_blocked | 当归虽于 2019 年新增入目录，但公告限定仅作香辛料和调味品 | 不得用目录身份授权当归生姜羊肉汤的治疗食疗、剂量或特殊人群使用 |
| F-TCM-073 | P0 | VAL-TCM-011 | formula_inheritance_blocked | 8 条食疗/药食配方主张中，原料目录身份被直接外推到配方、炮制形态、疾病疗效、儿科或外用路径 | 38 个原料逐项裁决；配方和所有用法继续 blocked，不允许成员资格继承 |
| F-TCM-074 | P1 | VAL-TCM-011 | overbroad_recipe_group_blocked | “泄泻食疗方系几乎全为药食两用”实际包含白术、车前子、滑石、硫黄及未裁决加工部位 | 记录 18 匹配、5 身份/炮制缺口、15 不在目录；整组不得标药食两用 |
| F-WY-001 | P1 | VAL-WY-001 | verified_remediated | 五运旧时间轴把二至五运错误地直接切在春分、芒种、处暑、立冬 | 改为春分后 13 日、芒种后 10 日、处暑后 7 日、立冬后 4 日的来源固定日级规则 |
| F-WY-002 | P1 | VAL-WY-001 | verified_remediated | 旧实现缺少主运太少，且 UI 正则把六气全名截断 | 补齐十干主运太少；丙午/乙巳桌面和移动端显示完整主客运气 |
| F-WY-003 | P1 | VAL-WY-001 | bounded | 旧状态把“基础排列未验证”与“完整运气学未实现”混为一体 | 基础年结构标 source-pinned；交司时刻、平气/天符/岁会、胜复及现实解释显式 not_implemented/blocked |
| F-BZ-008 | P1 | VAL-BZ-001 | verified_remediated | 手写“精确节”已退出八字 runtime，修复前数据保留在 before artifact；第二实现全范围复核通过 | 保持无 runtime import 回归 |
| F-BZ-009 | P1 | VAL-BZ-004 | resolved | 天干两干同现原本直接显示“合化某五行”，未检查成化条件 | 五合标签只显示关系，候选化神留作元数据 |
| F-BZ-REL-001 | P1 | VAL-BZ-004 | verified_remediated | 寅巳申、丑戌未原本要求三支全齐，漏掉两支相刑 | 两支相刑方向 7/7 全量测试；三支齐全只汇总一个三刑 |
| F-BZ-REL-002 | P1 | VAL-BZ-006 | mitigated_blocked | 三合/三会标签原本直接写成合水、会木等已成化结果 | 标签改为关系，`huaCandidates` 与 `not_evaluated` 分离；UI/AI 不判合化或吉凶 |
| F-BZ-REL-003 | P2 | VAL-BZ-004 | school_difference | `po` 有六破候选表但来源版本不同且 runtime 未消费 | 明确 `school_difference_inactive`；选定版本前不启用 |
| F-LY-001 | P0 | VAL-LY-001 | verified_remediated | `NAJIA` 把内外纳干压成单一字段，乾外错用甲、坤外错用乙 | 拆为 `innerStem`/`outerStem`；乾外壬、坤外癸；64 静卦与 4,032 动卦第二实现对拍归零 |
| F-LY-002 | P1 | VAL-LY-001 | verified_remediated | 年建固定 2 月 4 日切换，月建用每月固定日期近似 | 复用已验证历法适配层；2026 立春前后回归通过 |
| F-LY-003 | P1 | VAL-LY-002 | mitigated_blocked | AI prompt 把六冲、六合和空亡写成无条件现实结论 | 解释层标记 `not_validated`，移除绝对规则并禁止高风险决策建议 |
| F-LY-004 | P2 | VAL-LY-001 | verified_remediated | 非 6/7/8/9 爻值也会被静默转换成卦 | 引擎入口增加值域验证和回归测试 |
| F-MH-001 | P0 | VAL-MH-001 | verified_remediated | 八卦 binary 已按自下而上编码，runtime 又反转一次，导致非对称卦的互卦和变卦错误 | 统一为自下而上；384 种上下卦/动爻全量复算 0 fail |
| F-MH-002 | P1 | VAL-MH-001 | verified_remediated | 时间起卦使用公历月日近似，和声明的农历法不一致 | 改用农历月日、农历年支和时支；新年前后与闰月 fixture 通过 |
| F-MH-003 | P0 | VAL-MH-001 | verified_remediated | 手抄笔画表含“亿=1”等错误，未知字按 Unicode 码位伪估算 | 改为 Unicode 17.0 Unihan URO 20,992 字机械生成表；未知字符显式拒绝 |
| F-MH-004 | P1 | VAL-MH-001 | verified_remediated | Compendium 把风泽中孚初爻变错写为巽为风 | 兑 `110` 初爻变为坎 `010`，正确变卦为风水涣；课程已修正 |
| F-MH-005 | P1 | VAL-MH-002 | mitigated_blocked | runtime/UI 把体用直接写成吉凶，并把互卦/变卦称为过程/结果 | 只保留五行关系标签；预测解释标 `not_validated` 并禁止高风险建议 |
| F-YJ-001 | P0 | VAL-YJ-001 | verified_remediated | `04-guabian-data.md` 有 16 处综卦、5 处八宫和 48 处世爻错误；错卦 64/64 正确 | 六爻二进制与已验证京房八宫全量重建；385 项结构检查通过 |
| F-YJ-002 | P1 | VAL-YJ-001 | verified_remediated | 450 条受文与外部见证有 19 处规范化差异，其中 7 处为本地可修正问题 | 修正号啕/佑/輹/曰/祗/入于/鸣鹤；余下 12 处变体或版本差异写入 adjudication registry |
| F-YJ-003 | P1 | VAL-YJ-001 | verified_remediated | 教学草案的铜钱例把火泽睽写成风泽中孚，`getYaoName` 丢失「上」，《说卦传》「旉」误为「专」 | 三处已修正并加入可重跑教学代码检查 |
| F-YJ-004 | P1 | VAL-YJ-002 | mitigated_blocked | 传统作者归属、整卦吉凶和多动爻取法被写成无条件事实 | 改为传统归属/教学启发式；解释不进 accepted core |
| F-ZW-001 | P0 | VAL-ZW-001 | verified_remediated | 旧紫微安星表 100/150 格不符合声明的整除与奇偶余数规则 | 改为公式机械生成；150 格全量检查及第二实现对拍通过 |
| F-ZW-002 | P1 | VAL-ZW-001 | verified_remediated | 廉贞相对紫微偏移写成 -7，少空一宫 | 修正为 -8；十四主星固定样例和 40,320 主星字段通过 |
| F-ZW-003 | P0 | VAL-ZW-001 | verified_remediated | 第一大限错误地从命宫下一宫开始，宫干也用简单递增/递减 | 第一大限改从命宫起；每宫按五虎遁重算宫干，138,240 项大限检查通过 |
| F-ZW-004 | P1 | VAL-ZW-001 | verified_remediated | 辛年天魁/天钺在 runtime 互换，Compendium 的丁年也互换 | 固定为丙丁亥酉、辛午寅；46,080 辅星字段及第二实现对拍通过 |
| F-ZW-005 | P1 | VAL-ZW-001 | verified_remediated | 无效公历日期和未知内部状态可被依赖归一化或回退为土五局/子宫 | 严格校验日期、时辰、性别；内部不可能状态显式抛错 |
| F-ZW-006 | P0 | VAL-ZW-002 | mitigated_blocked | Prompt 和专项入口把未校勘断语直接用于性格、婚财、事业和疾病预测 | 结果/UI/AI 均标 `not_validated`；移除健康专项并禁止医疗、法律、投资等高风险推断 |
| F-QM-001 | P0 | VAL-QM-001 | verified_remediated | 旧 runtime 在交节日 00:00 整天提前切换节气，并保留固定月日近似回退 | 改用分钟级精确交节；芒种、夏至前后分钟回归和第二实现对照通过 |
| F-QM-002 | P0 | VAL-QM-001 | verified_remediated | 旧三元按节气后首个甲/己日和天数区间近似，不符合符头支定元 | 改为当前日前最近甲/己符头；60 日干支全量通过 |
| F-QM-003 | P0 | VAL-QM-001 | verified_remediated | 旧地盘按外围八宫洛书顺序走并强制乙入中五，18 局均可能错误 | 改为九宫数字 1-9 阳顺阴逆；18 种地盘与两实现全量一致 |
| F-QM-004 | P0 | VAL-QM-001 | verified_remediated | 所有甲时都按甲子戊处理，未区分六旬遁干 | 六十甲子旬首和六种甲时遁干全量验证 |
| F-QM-005 | P0 | VAL-QM-001 | verified_remediated | 值使门直接随值符落到时干地盘宫，中五起数也未先寄宫 | 值使按旬内步数在九宫数字序列顺逆数；中五原位寄坤，落中阳寄艮/阴寄坤；八门全字段对照通过 |
| F-QM-006 | P1 | VAL-QM-001 | verified_remediated | 天禽只留中五，且值符、天盘干、八神等使用混杂转动顺序 | 声明天禽随天芮；九星/天盘干/八神按八宫几何顺逆转动并保留中五身份 |
| F-QM-007 | P0 | VAL-QM-002 | mitigated_blocked | Prompt 和快捷入口要求疾病、诉讼胜负、求财、吉方吉时等现实结论 | 改为文化学习说明；结果/UI/AI 分开确定性盘面与未验证解释，禁止医疗法律财务和方向时机建议 |

## Evidence Log

| Date | Case | Evidence | Result |
|---|---|---|---|
| 2026-07-09 | VAL-PRD-001 | Fresh read-only reviewer `019f48cd-c40a-7ff3-8275-5a7a43541ac0`；主线程复核 `docs/PRD.md`、`src/modules/tizhi/data.js`、`src/modules/bazihealth/prompt.js` 与旧 `APP-SPEC*` | hold；现有 shell 可复用，但具体引擎/静态表未验证前不得作为教学可信底座 |
| 2026-07-09 | VAL-BZ-001/002 | `node scripts/validation/audit-bazi-current.mjs`；30 例；`lunar-javascript@1.7.7`；HKO 1999 历表 | 2 个四柱 mismatch，6 个大运 mismatch；当前八字 gate 失败 |
| 2026-07-09 | VAL-SHARED-001 | NOAA true solar time 公式；`TZ=UTC/America/Chicago/Asia/Shanghai/Pacific/Apia` 跨时区复算 | 当前太阳时缺均时差；Apia 2011 跳日导致日柱偏移 |
| 2026-07-09 | VAL-BZ-001 | Git `d47165b` 与 `4f48bed` | 历史“立春误作甲子日基准”的 34 日偏移已修复；后续大运近似修复留下当前边界缺陷 |
| 2026-07-09 | VAL-BZ-001 | 1920-2027 × 12 节 = 1,296 边界全量独立复算 | 1,260 个边界差超 1 小时，最大不足 24 小时；风险集中在边界窗口，不是全年整体错误 |
| 2026-07-09 | VAL-BZ-001/002 | after-fix audit：30 例 + 1,296 节两侧 2,592 次 runtime 检查 | 四柱 0 mismatch，大运 0 mismatch，边界接线 0 mismatch，近似案例 0 |
| 2026-07-09 | VAL-BZ-001 | Node 属性测试 | 1920-2027 共 39,447 日严格按 60 甲子递进；五虎遁、五鼠遁声明表通过 |
| 2026-07-09 | VAL-SHARED-001 | NOAA 公式回归与跨 TZ 测试 | 均时差已实现；Apia 运行时偏移已消除；历史 DST 保持 open |
| 2026-07-09 | VAL-BZ-001/VAL-SHARED-001 | 独立 `sxtwl@2.0.7`：30 例四柱 + 1920-2027 全部 1,296 个节令时刻 | 四柱 30/30 一致；节令 1,296/1,296 在 30 秒内，最大差 20 秒；四柱/节令达到 V3 |
| 2026-07-09 | VAL-BZ-001 | 第二实现审计反查验证脚本 | 发现大写 `XIAO_HAN` 指向下一年；已改为同年 `小寒` 并加入年份断言，证据重新生成 |
| 2026-07-09 | VAL-BZ-004 | 《三命通会·论支元六合》、compendium `00-cosmology/03-tiangan-dizhi.md` 与 runtime 对照 | 午未六合可确认；合化火/土存在口径与条件差异。五合/六合均移除自动合化断言，15 项八字测试通过 |
| 2026-07-09 | VAL-SHARED-001 | NOAA fractional-year 公式与闰年年末回归 | 旧结论经 2026-07-10 复核纠正：NOAA 明确闰年使用 366；当前实现与报告已修复 |
| 2026-07-09 | VAL-BZ-001 | Fresh code reviewer `019f49f1-4e13-7481-a276-ea33d57de668` | 无 Critical；陈旧 primary artifact 的 Important 已修复并加 source/artifact SHA256；当时保留的大运证据缺口已由下一条独立推导关闭 |
| 2026-07-09 | VAL-BZ-002 | `sxtwl@2.0.7` 相邻节令 + 《渊海子平·论起大运法》《三命通会·论大运》规则的独立手工推导；30 例 | 未调用 runtime `getYun()`；方向、传统时辰精度交运日期和首运干支 30/30 一致，声明口径内达到 V3 |
| 2026-07-09 | VAL-BZ-003/VAL-BZH-001 | `audit-bazi-strength.mjs`；compendium 算法对照；《滴天髓》《滴天髓阐微》《子平真诠评注》 | 两条原典反例复现；权威模型判定 fail；UI/AI 虚假精度已移除，八字健康输出归零并硬阻断 |
| 2026-07-09 | VAL-BZ-004/005/006 | `audit-bazi-relations.mjs`；《三命通会》关系与神煞篇；《五行精纪》 | 关系与神煞有限表全量匹配；两支相刑漏检修复；合化/吉凶 blocked；相破保持流派差异 inactive |
| 2026-07-10 | VAL-LY-001/002 | `audit-liuyao.mjs`；《卜筮正宗》纳甲/伏神规则；隔离 `iching-shifa@1.8.0` | 17,026 项独立检查 0 fail；64 静卦、4,032 动卦第二实现对拍 0 mismatch；确定性排盘 pass，解释层 blocked |
| 2026-07-10 | VAL-LY-001 | Playwright 全六老阳固定样例；桌面与 390x844 | 乾外壬、坤外癸、六亲世应与解释边界可见；无截断或溢出 |
| 2026-07-10 | VAL-MH-001/002 | `audit-meihua.mjs`；《梅花易数》卷一；Unicode 17.0 Unihan | 64 卦名、384 动爻结构、4,096 报数、经典观梅例、4 个农历边界和 20,992 字共 63,061 项 0 fail；解释层 blocked |
| 2026-07-10 | VAL-MH-001 | Playwright 报数 5/2、当前时间、“天机卷”；桌面与 390x844 | 风泽中孚/山雷颐/风水涣和雷水解正确；验证状态可见；移动端水平溢出已修复并复测为 0 |
| 2026-07-10 | VAL-YJ-001/002 | `audit-yijing-core.mjs`；维基文库 64 页固定快照；CText 12 卦差异抽核；《说卦传》 | 1,446 项 0 fail；修正 7 处经文、69 处卦变/八宫字段和 3 处教学错误；解释层 blocked |
| 2026-07-10 | VAL-ZW-001/002 | `audit-ziwei.mjs`；《紫微斗数全书》安星口诀；隔离 `iztro@2.5.8` | 2,880 盘、314,200 项项目内检查 0 fail；325,440 字段第二实现对拍 0 mismatch；修复 100 格紫微表、廉贞、魁钺、大限和回退；解释层 blocked |
| 2026-07-10 | VAL-ZW-001/002 | Playwright 2000-08-16 寅时女命；桌面与 390×844 | 命宫午、木三局、紫微午、天府戌和首限壬午可见；验证边界可见；移动端无水平溢出，控制台 0 error |
| 2026-07-10 | VAL-QM-001/002 | `audit-qimen.mjs`；《奇门遁甲统宗》《奇门法窍》；隔离 `3meta@2.6.0` 与 `kinqimen@0.3.1` | 23,751 盘、1,900,230 项内部检查 0 fail；`3meta` 奇门核心 0 mismatch；`kinqimen` 189,789 共享字段 0 mismatch；三元、地盘、值使等根因已修复，解释层 blocked |
| 2026-07-10 | VAL-FS-001/002 | `audit-fengshui.mjs`；隔离 `@soul-atelier/xuankong@0.2.1`、`@soul-atelier/calendar@0.3.0`/tyme4ts | 216 张下卦盘项目内 6,469 项 0 fail；第二实现盘面 6,048 字段及 10,228 时刻年/月边界 30,684 字段 0 mismatch；解释、替卦与现实建议 blocked |
| 2026-07-10 | VAL-TCM-001/002 | `audit-tcm-safety.mjs`；Skill SHA manifest；上游 `966a88a`；国务院/NMPA/深圳政府毒性清单；2025 药典公告；CCMQ 研究；桌面/390×844 产品路径 | 213 项 0 fail；TCM 9/9、全库 79/79；28 项法定毒性清单规范化；100 行/101 药名剂量表保持 blocked；旧 22 计量项和 30 穴位归档并移出运行时；四个中医入口无旧医疗动作词、无水平溢出、console 0 error/warning |
| 2026-07-10 | VAL-TCM-003 | `audit-tcm-pharmacopoeia.mjs`；2025 一部品名目录；国家药典委员会 2020 数字药典固定字段快照 | 100 行/101 味、2,468 项 0 fail；79 味现行目录身份、22 味缺失/未裁决；41 味与 2020 克数覆盖一致、38 味冲突；三颗针/贯众/光慈菇身份裁决与 11 行急救内容全部 blocked |
| 2026-07-10 | VAL-TCM-004 | `audit-tcm-pregnancy-compatibility.mjs`；2025 一部品名目录；国家药典委员会 2020 数字药典注意字段；2003/2004 官方药品不良反应监管通知 | 109 个比较药名、1,969 项 0 fail；妊娠 13 条来源冲突；十八反 52/52、十九畏 7/10 有历史支持；马兜铃酸来源错误与 31 行/37 方名警示全部 normalized 并 blocked |
| 2026-07-10 | VAL-TCM-004 | Fresh read-only reviewer `019f4cde-0d58-74a0-b562-784522b54b93`；共享 runtime consumer inventory；专项回归 | 无 P0/P1；修复只扫 `src` 的 P2 后，84 个运行时及相邻文本文件进入旁路审计，13/13 专项测试通过 |
| 2026-07-10 | VAL-TCM-005 | `audit-tcm-acupoint-external-safety.mjs`；GB/T 12346-2021、GB/T 40997-2021、WHO 2008；WHO/FDA/Cochrane 外治安全证据 | 763 条非空行、27 表/471 表格行及结构化候选共 4,904 项 0 fail；官方现行范围和二级逐名差异分层；所有候选 blocked，84 个运行时/相邻文件无旁路 |
| 2026-07-10 | VAL-TCM-005 | Fresh read-only reviewer `019f4cfc-f97e-7d43-8343-7b931e07d9a0`；14 项专项回归 | 无 P0；P1 原文表格漏 inventory 已修复；P2 官方数量与二级逐名转录混用已降级并写入 schema/报告，逐名官方证据缺口保持 open |
| 2026-07-10 | VAL-TCM-006 | `audit-tcm-disease-red-flags.mjs`；CDC/AHA/NIDDK/NIH/WHO/HRSA/Red Cross/NHLBI 官方 comparator | 52 病种、689 条非空行、22 表/133 表格行完整 inventory；83 条关键词风险、308 条广义处置候选和 20 条裁决共 2,589 项 0 fail；9 冲突、9 支持红线、2 混合边界；全部候选 blocked，84 个运行时/相邻文件无旁路 |
| 2026-07-10 | VAL-TCM-006 | Fresh read-only reviewer `019f4d10-8e62-76b2-972b-8a1116dacaf2`；8 项专项回归 | P1 关键词风险索引过度代表完整风险面已修复；P2 急腹症 comparator 已逐行挂接，自杀风险表述已降级；四条漏扫样例进入广义处置视图 |
| 2026-07-10 | VAL-TCM-007 | `audit-tcm-theory-diagnosis.mjs`；NCCIH/WHO/CDC；CCMQ；4 组诊断一致性/量表系统综述 | `01-14` 的 836 条非空行、31 表/157 表格行、124 标题、127 条优先候选和 14 finding 共 5,064 项 0 fail；全部 blocked，84 个运行时/相邻文件未导入该 core/finding ID |
| 2026-07-10 | VAL-TCM-007 | Fresh read-only reviewer `019f4d63-f953-7471-9a1f-803a94b5b571`；6 项专项回归 | 无 P0/P1；独立重算全部 headline count 与哈希一致；P2 运行时清零声明已降级，P3 两处下一步陈旧路由已修正；旧 runtime 语义保持 open |
| 2026-07-10 | VAL-TCM-008 | `audit:tcm-herb-catalog`；FDA/NCCIH/HRSA/NLM/CDC；中国药监马兜铃酸与毒性药品来源 | `15-23` 的 1,331 条非空行、45 表/279 表格行、122 标题、663 条重叠风险候选和 20 finding 共 14,281 项 0 fail；全部 blocked，84 个运行时/相邻文件未导入该 core/finding ID |
| 2026-07-10 | VAL-TCM-008 | Fresh read-only reviewer `019f4d76-0bb5-7393-9d17-a92c6a7e0705`；8 项专项回归 | 无 P0/P1；修复 P2“家庭动作”误收普通解毒功效，并拆为 6 条毒物处置/49 条外用路线；新增 `47→36`、`60→55` 两处编号逆序审计，运行时证据边界保持不扩大 |
| 2026-07-10 | VAL-TCM-009 | `audit:tcm-formula-catalog`；NMPA/FDA/NCCIH/NLM/CDC/MedlinePlus 与中国药监 comparator | `24-30` 的 820 条非空行、8 表/171 表格行、81 标题、186 个格式化定义、180 个显式附方实体、522 条重叠窄风险视图和 21 finding 共 11,762 项 0 fail；附方声明仍缺 2 个显式实体，全部 blocked，84 个运行时/相邻文件未导入该 core/finding ID |
| 2026-07-10 | VAL-TCM-009 | Fresh read-only reviewer `019f4d8f-75a1-7192-8138-1e5a804aecf7`；6 项专项回归 | 无 P0；修复 P1 括号出处格式漏四方及文档旧口径；修复 P2 禁忌漏扫和“现代”误报，新增 158 条禁忌/慎用视图、现代用途收窄为 10 条；运行时证据边界保持不扩大 |
| 2026-07-10 | VAL-WY-001 | `audit-wuyun.mjs`；《素问》《医宗金鉴》《中医基础理论》；规范 JSON；桌面/390×844 | 60 年基础年结构 3,325 项 0 fail；修复主运太少、五运交司日标签、非法输入和六气名称截断；复杂派生层与现实/医学解释 excluded |
| 2026-07-10 | VAL-ZWL-001 | `audit-ziwu.mjs`；《针灸大成》；规范 JSON；Ziwu 与八字健康旁路回归；桌面/390×844 | 12 行有限表、全天 1,440 分钟共 4,457 项 0 fail；移除当令/排毒/最佳时段旧句；午时心经冲突已裁定；无横向溢出或行内裁切；完整针法与临床解释 excluded |
| 2026-07-10 | VAL-SHARED-001 | `audit-shared-time-cities.mjs`；GeoNames 374 条固定原始行和 `admin1`；IANA 民用时区；NOAA 均时差；中科院国家授时口径；桌面/390×844 | 132,836 项 0 fail；276 个中国城市省级合同、73,414 日、17,952 城市时点和 10 个转换 fixture 通过；拉斯维加斯时区、历史 DST、闰年分母和五条消费路径已修复；宿主 tzdb 版本与重复时刻选择保持 bounded |
| 2026-07-10 | VAL-XIANG-001 | `build-xiangshu-raw-inventory.mjs`、`audit-xiangshu-classical-sources.mjs`；《神相全编》明刊本书格著录/CText 转录；《神相铁关刀》；《许负相法》夷门广牍本；《公笃相法》 | 386 条 raw 非空行完整入库，31 条已裁决、255 条待找出处；4 个见证、11 段短摘录、18 条传统条目、13 条旧文裁决共 199 项 0 fail；两份 raw SHA256 不变；影印逐页校勘仍 open |
| 2026-07-11 | VAL-XIANG-002 | `audit-xiangshu-classical-sources.mjs`；《神相全编》CText 十二宫与识典卷八；书格影印著录；1911 Britannica/Wikisource `Palmistry` | 386 条 raw 非空行中 142 条已裁决、144 条待找出处；6 个来源记录、28 段摘录、36 条主张、18 条旧文裁决共 381 项 0 fail。修正田宅宫位置，保留相貌宫/父母宫版本差异；三才纹不等同现代三主线；行星掌丘归西方传统，未授证解释继续 blocked |
| 2026-07-11 | VAL-XIANG-003 | `audit-xiangshu-classical-sources.mjs`；《神相全编》CText p12/p48/p318/p554/p594/p605/p608/p700 等界定摘录 | 额、眉、眼、鼻、口、颏六组旧文共 49 条非空记录进入逐组裁决；累计 191 条已裁决、95 条待出处，34 段摘录、42 条规范主张、24 条旧文裁决共 453 项 0 fail。原典传统判断与旧库现代人格、能力、健康扩写分层，整组旧文不进入 runtime |
| 2026-07-11 | VAL-XIANG-004 | `audit-xiangshu-classical-sources.mjs`；《神相全编》CText p535 气色；Helena Fenwick Dale `Indian Palmistry/The Lines`；产品元数据逐行裁决 | 386 条 raw 非空行全部分类：100 条结构、286 条已裁决、0 条无人裁决；7 个来源记录、37 段摘录、45 条主张、41 条旧文裁决共 534 项 0 fail。气色传统断语与脏腑医学等价分开；命运/太阳/肝线归入西式历史见证；婚姻线等未定位项继续 blocked；影印页校勘 open |
| 2026-07-11 | VAL-TCM-012 | `audit:tcm-classic-quotes`；`42-经典-素问要义.md`；本地 `黄帝内经素问.txt` 固定哈希见证 | 抽取 111 段显式引文：12 段原字符连续命中、63 段规范化连续命中、7 段省略分段命中、29 段待人工裁决；561 项 0 fail。所有记录 blocked；本批只授证文本命中与定位，不授证解释、现代医学等价、剂量或产品用途 |
| 2026-07-18 | VAL-TCM-012 | `audit:tcm-classic-ref43-quotes`；本地《灵枢》《难经》《素问》；CText/Wikisource 公共转录见证；`nihaisha-nishi-tcm` 页卡 locator | 98 段显式引文为 6 原字符、60 规范化、9 省略分段、23 人工、0 待办；3 条跨书《素问》引文、3 处公共见证支持的本地转录差异和 3 条现代编辑文字均已分层；1,073 项 0 fail，全部 blocked |
| 2026-07-18 | VAL-TCM-014 | `audit:tcm-classic-ref44-quotes`；本地《伤寒论》《金匮要略》《素问》《灵枢》《难经》《方剂学》；CText/Wikisource；`nihaisha-nishi-tcm` 二级 locator | 170 段为 22 原字符、114 规范化、18 省略分段、16 人工、0 待办；9 条《伤寒》《金匮》复本命中、4 条声明跨书、0 来源错配；公共见证修正 1 个 OCR 占位符和 1 处转录异文，2,149 项 0 fail，全部 blocked |
| 2026-07-18 | VAL-TCM-015 | `audit:tcm-classic-ref45-quotes`；本地《金匮要略》《伤寒论》《素问》《灵枢》《难经》；CText/Wikisource；`nihaisha-nishi-tcm` 二级 locator | 113 段为 14 原字符、71 规范化、11 省略分段、17 人工、0 待办；4 条《金匮》《伤寒》复本、1 条《素问》用语、0 来源错配；确认“大逆”并校正 A2K0/㽲、膀肽/膀胱，1,453 项 0 fail，全部 blocked |
| 2026-07-18 | VAL-TCM-016 | `audit:tcm-classic-ref46-quotes`；本地《医学心悟》及相关经典；CText/Wikisource；中醫笈成清经纶堂本整理文本 | 357 段为 82 原字符、150 规范化、8 省略分段、117 人工、0 待办；95 条近似段落定位冻结、22 条特殊裁决、2 条参考文字修正、15 条现代编辑语；5,481 项 0 fail，全部 blocked |
| 2026-07-18 | VAL-TCM-017 | `audit:tcm-classic-ref47-quotes`；本地《温热论》《湿热病篇》《温病条辨》《温热经纬》《素问》；中醫笈成/Wikisource/CText 公共见证 | 365 段为 89 原字符、159 规范化、30 省略分段、87 非连续命中人工定位；另有 13 段机械命中兼特殊归属裁决，0 待办；2 条参考错误、10 条后世按语/具名转引、18 条现代编辑语、7 条编码/OCR 裁决；6,176 项 0 fail，全部 blocked |
| 2026-07-11 | VAL-SOURCE-001 | `audit:source-library`；9 个声明来源组；逐文件 SHA256、字节数、路径和镜像关系复算 | 252 个来源文件全部进入中央索引并可解析；46 个 compendium 镜像相同、24 个为历史变体；2 项专项测试 0 fail。通过只授证来源文件盘点与完整性，不授证内容正确性或产品资格 |
| 2026-07-11 | VAL-TCM-013 | `tcm-classic-quote-adjudications.json`；原样保留的 `42-经典-素问要义.md`；`audit:tcm-classic-quotes` | 原 29 条机械未命中项完成逐条裁决：1 条拼接误引在 normalized 覆盖层校正，28 条按删节/拼接/改写/编辑说明/后世注语/文本变体分类；Skill 原包保持原哈希。现为 83 条机械定位、28 条人工形态裁决、0 条待人工，693 项 0 fail。王冰注、后世口诀、现代括注和遗篇与核心篇章保持分层；全部 blocked |
| 2026-07-18 | VAL-SOURCE-002 | 固定 GitHub commit/tree `ec03c594ed239b570e997cbd396c2fc186b6ad91`；仓库树/README/研究索引；`external-source-manifests.test.mjs`；`audit:source-library` | 倪海厦 Skill 32 文件/51,258 行完成元数据审计；许可声明、原始讲义和页码级溯源均有阻断项，不吸收正文；7 组覆盖映射全部 discovery-only/blocked；中央来源库补入 9 份 CText 见证和该档案，现为 262 文件/11 组，5 项专项测试 0 fail |
| 2026-07-18 | VAL-SOURCE-003 | 固定 GitHub commit/tree `926d0b56154c8764b68e9ddf2661949e9b5b5f11`/`06afe033...`；MIT LICENSE；三库 schema/回测指南；`xuanxue-database-skill-schema.test.mjs`；`audit:source-library` | 14 文件/858 行完成设计审计；MIT 许可单独归档；天机卷候选 schema 强制事前冻结、版本化排盘、证伪条件、完整分母、隐私和高风险排除，且不自动改变权威/掌握度；中央来源库现为 264 文件/11 组，9 项来源专项测试 0 fail |
| 2026-07-18 | VAL-SOURCE-004 | 固定 GitHub commit/tree `e3cb51359a5ef9fc0725132814d474168bb8de24`/`fe50e135...`；全树清单；README/SKILL/用途声明；PDF/text source manifest；10,538 页卡定点检索；51 条 correction decision 与天机 TCM 交叉检查；3 项防误晋升测试 | 来源档案与报告完成；只吸收转换后的证据结构、经典信号、勘误比对和四部典籍路由，不复制截图/课程/病例；中央来源库现为 265 文件/11 组，12 项来源专项测试 0 fail |
