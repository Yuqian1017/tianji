# 天机卷 Database Validation Ledger

- 状态：执行中
- 更新日期：2026-07-09
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
| VAL-BZ-004 | P1 | 八字 | 天干五合、地支六合与“午未合火/土” | 来源忠实性 | V3 | school_difference | 合与合化已拆开；《三命通会》确认午未六合，compendium 明示火/土有争议。runtime 只显示“甲己合”“午未合”，候选化神留作元数据 |
| VAL-SHARED-001 | P0 | 共享历法 | 公农历、节气、时区、真太阳时 | 精确确定性 | V3 | in_progress | 节令时刻 V3；日柱 runtime 时区依赖和均时差已修复；全球历史民用时区/DST 仍待 IANA 数据与 fixture |
| VAL-BZH-001 | P0 | 八字健康 | 五行计数到脏腑风险、疾病、食疗与大运健康的推导 | 医学安全/跨域推断 | V4+安全审查 | blocked | 未验证结构计数不能成为医学证据；runtime、旧历史和 AI 通道已硬阻断 |
| VAL-TCM-001 | P0 | 中医 | 当前 app 中具体药味/剂量/艾灸建议 | 医疗/安全 | V4+V5 | planned | 全量抽取消费点并反查安全表/现行来源 |
| VAL-LY-001 | P1 | 六爻 | 纳甲、世应、六亲、六神、变卦 | 精确/流派确定性 | V3+V5 | planned | 复用现有测试入口，补独立 fixtures |
| VAL-ZW-001 | P1 | 紫微 | 十二宫、主星、四化、辅煞星 | 流派确定性 | V3 | planned | 先声明流派与版本 |
| VAL-QM-001 | P1 | 奇门 | 节气、阴阳遁、局数、四盘 | 流派确定性 | V3 | planned | 来源已标简化，默认高风险 |
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
| F-BZ-006 | P1 | VAL-SHARED-001 | partially_remediated | NOAA 均时差已加入并按固定 365 日分母校正闰年；UI 标准时口径已明确；历史时区/夏令时仍未解决 | IANA 时区数据与历史 DST fixture |
| F-BZ-007 | P2 | VAL-BZ-002 | remediated | 已新增 `dayunStart` 传统时辰精度年月日、`solarDate` 与口径元数据，整数年龄继续兼容 | 历史记录 schema/version 验证 |
| F-BZH-001 | P0 | VAL-BZH-001 | mitigated_blocked | 旧 runtime 以天干 1/藏干 0.5 和固定阈值推导脏腑风险、疾病、食疗和大运健康 | 当前消费路径、旧历史和 AI prompt 均 blocked；独立传统与医学证据通过前不得恢复 |
| F-BZ-008 | P1 | VAL-BZ-001 | verified_remediated | 手写“精确节”已退出八字 runtime，修复前数据保留在 before artifact；第二实现全范围复核通过 | 保持无 runtime import 回归 |
| F-BZ-009 | P1 | VAL-BZ-004 | resolved | 天干两干同现原本直接显示“合化某五行”，未检查成化条件 | 五合标签只显示关系，候选化神留作元数据 |

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
