# 天机卷 Database Validation Ledger

- 状态：执行中
- 更新日期：2026-07-10
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
| VAL-SHARED-001 | P0 | 共享历法 | 公农历、节气、时区、真太阳时 | 精确确定性 | V3 | in_progress | 节令时刻 V3；日柱 runtime 时区依赖和均时差已修复；全球历史民用时区/DST 仍待 IANA 数据与 fixture |
| VAL-BZH-001 | P0 | 八字健康 | 五行计数到脏腑风险、疾病、食疗与大运健康的推导 | 医学安全/跨域推断 | V4+安全审查 | blocked | 未验证结构计数不能成为医学证据；runtime、旧历史和 AI 通道已硬阻断 |
| VAL-TCM-001 | P0 | 中医 | 当前 app 中具体药味/剂量/穴位/艾灸与图像推断 | 医疗/安全 | V4+V5 | in_progress | 旧 34 题、9 调养方案、28 药物标签、22 计量项、30 去重穴位已归档；运行时剂量/裸艾灸/疾病推断已隔离，待逐项权威复核 |
| VAL-TCM-002 | P0 | 中医 | Skill v3 安全表、毒性、妊娠、配伍与剂量 | 医疗/来源 | V4 | in_progress | 98 manifest 文件和安装/上游副本一致；法定毒性清单 28/28；100 行/101 药名剂量表结构通过但未按 2025 药典校准，继续 blocked |
| VAL-WY-001 | P1 | 五运六气 | 十干中运、主客运太少、十二支司天在泉、主客六气与日级边界标签 | 传统来源确定性 | V2+V5 | pass | 《素问》《医宗金鉴》与教材交叉固定有限规则；60 年、3,325 项 0 fail；桌面/390×844 通过；古法时刻、派生层与现实解释不在授证范围 |
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
| VAL-PRD-001 | P1 | 产品 | 主 PRD fresh review | 产品/证据 | independent review | pass | Fresh reviewer 给出 hold；主线程已逐项回看 PRD、当前中医消费点与旧规格，见 `PRD_FRESH_REVIEW_2026-07-09.md` |

## Findings

用户关于早期八字工具“排盘完全错误”的报告记为高优先级历史证据，不等同于当前 repo 已复现。

| Finding ID | Priority | Case | Status | Observation | Required proof |
|---|---|---|---|---|---|
| F-BZ-001 | P1 | VAL-BZ-001 | verified_remediated | 近似节气已移出 runtime；`sxtwl` 第二实现 30/30 四柱一致，1,296 节令时刻最大差 20 秒 | 保持 V5 用户路径回归 |
| F-BZ-002 | P1 | VAL-BZ-002 | verified_remediated | 一月非连续节令搜索已删除；传统时辰精度的起运间隔、交运公历日期与口径元数据已保存 | 30 例独立推导 0 mismatch；其他流派另建 validation 单元 |
| F-BZ-003 | P1 | VAL-BZ-003 | mitigated | 身强 `/100` 和统一用神方向无可靠来源且被原典反例否定 | 底层仅留作兼容；UI/AI 标为未校勘启发式，移除分数与用神结论；正式算法需重新选派别并建 fixture |
| F-BZ-004 | P1 | VAL-BZ-004 | resolved_school_difference | 旧表把两支同现直接显示为“午未合火”，混淆六合关系与有条件的合化，且未披露火/土分歧 | runtime 改为“午未合”；`huaCandidates` 保留火/土，不判断条件时不宣称合化 |
| F-BZ-005 | P2 | VAL-SHARED-001 | remediated | 日柱改由历法适配层计算；UTC 与 Pacific/Apia 同一输入回归一致，39,447 日连续性通过 | 保持跨 TZ 回归 |
| F-FS-001 | P1 | VAL-FS-001 | verified_remediated | 二十四山把每卦前两山的地元龙/天元龙整列对调，并误标 7 山玄空阴阳 | 24 山有限表与独立实现全量一致 |
| F-FS-002 | P1 | VAL-FS-001 | verified_remediated | 山盘/向盘错误地直接按实际坐山/向首阴阳定顺逆 | 改为入中星原宫的同元龙阴阳；216 盘从 1,648 字段差异降为 0 |
| F-FS-003 | P1 | VAL-FS-001 | verified_remediated | 月飞星把公历月当节令月，未按十二节切换 | 复用精确节令历法；2020-2026 与 tyme4ts 10,228 时刻 0 mismatch |
| F-FS-004 | P1 | VAL-FS-001 | verified_remediated | 年份接口未声明立春边界，2000 年后八宅命卦常数错一位 | 增加精确日期辅助函数、太阳年标签；1900-2099 两性 400 值枚举通过 |
| F-FS-005 | P1 | VAL-FS-001 | verified_remediated | 任意 15 度山向都静默套用下卦，没有区分兼向/替卦 | 只接受山中线左右 4.5 度；超出范围显式拒绝 |
| F-FS-006 | P0 | VAL-FS-002 | mitigated | Runtime 把未验证星性、疾病财务断语和摆件化解显示为确定建议 | 用户界面与 AI 上下文只保留盘面结构；传统解释统一 blocked |
| F-BZ-006 | P1 | VAL-SHARED-001 | partially_remediated | NOAA 均时差已加入并按固定 365 日分母校正闰年；UI 标准时口径已明确；历史时区/夏令时仍未解决 | IANA 时区数据与历史 DST fixture |
| F-BZ-007 | P2 | VAL-BZ-002 | remediated | 已新增 `dayunStart` 传统时辰精度年月日、`solarDate` 与口径元数据，整数年龄继续兼容 | 历史记录 schema/version 验证 |
| F-BZH-001 | P0 | VAL-BZH-001 | mitigated_blocked | 旧 runtime 以天干 1/藏干 0.5 和固定阈值推导脏腑风险、疾病、食疗和大运健康 | 当前消费路径、旧历史和 AI prompt 均 blocked；独立传统与医学证据通过前不得恢复 |
| F-TCM-001 | P0 | VAL-TCM-001 | mitigated_blocked | 体质模块用 34 题历史简化稿冒充 ZYYXH/T 157-2009 正式量表，并输出药茶、克数、穴位与艾灸方案 | 功能暂停；旧内容完整归档为 `removed_pending_review`；取得合法完整量表和独立验证前不得恢复 |
| F-TCM-002 | P0 | VAL-TCM-001 | mitigated | 子午流注把传统时辰对应扩写为排毒、疾病提示和最佳吸收时段 | 运行时只保留时辰/经脉/脏腑名称/五行标签；临床解释与穴位动作移除 |
| F-TCM-003 | P0 | VAL-TCM-001/VAL-WY-001 | verified_remediated_basic_scope | 五运六气旧算法直接生成重点脏腑、疾病风险和食疗建议 | 基础年结构已来源固定并全量核验；所有健康、疾病和现实气候预测继续 blocked |
| F-TCM-004 | P0 | VAL-TCM-001 | mitigated | 望诊视觉模型从单张照片推断脏腑、体质并给调养建议 | prompt/UI 限制为可见颜色、形态、纹理与拍摄质量描述，不作医学推断 |
| F-TCM-005 | P0 | VAL-TCM-002 | blocked | Skill 的 100 行/101 药名剂量表来自七版教材且自述未按现行药典校准 | 所有剂量 product eligibility=`blocked`；逐药对照 2025 药典后再评审 |
| F-TCM-006 | P1 | VAL-TCM-002 | recorded_source_drift | 政府发布页对法定毒性中药出现 27/28 数量漂移；27 项页遗漏红升丹 | 规范库保留 NMPA 指导原则所称 28 项及深圳政府 2026 完整附录，并显式记录冲突 |
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
| 2026-07-09 | VAL-SHARED-001 | NOAA fractional-year 公式与闰年年末回归 | 分母改为官方公式固定的 365；修复 2024-12-31 约 27 秒额外偏差 |
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
| 2026-07-10 | VAL-WY-001 | `audit-wuyun.mjs`；《素问》《医宗金鉴》《中医基础理论》；规范 JSON；桌面/390×844 | 60 年基础年结构 3,325 项 0 fail；修复主运太少、五运交司日标签、非法输入和六气名称截断；复杂派生层与现实/医学解释 excluded |
