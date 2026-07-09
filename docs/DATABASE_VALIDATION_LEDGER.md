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
| VAL-BZ-001 | P0 | 八字 | 年月日时四柱与节气/日界口径 | 精确/流派确定性 | V3+V5 | fail | 30 例完成：2 例月柱 mismatch；1999 芒种日期有 HKO 官方锚点。见 `BAZI_VALIDATION_REPORT_2026-07-09.md` |
| VAL-BZ-002 | P0 | 八字 | 大运顺逆、起运岁数、交运时间 | 流派确定性 | V3 | fail | 30 例中 6 例整数年龄/首运 mismatch；2025-01-01 男女起运出现 8-10 年级偏差 |
| VAL-BZ-003 | P1 | 八字 | 身强评分、五行计数与用神方向 | 流派/启发式 | V2+来源声明 | in_progress | 当前为自定义 40/40/20 与藏干 0.5 权重，需确认来源及产品标签 |
| VAL-BZ-004 | P1 | 八字 | 地支关系“午未合火” | 来源忠实性 | V3 | in_progress | 与常见“午未合土”口径可能冲突，待独立来源核对 |
| VAL-SHARED-001 | P0 | 共享历法 | 公农历、节气、时区、真太阳时 | 精确确定性 | V3 | fail | NOAA 公式确认当前“真太阳时”缺均时差；Pacific/Apia 2011 跳日复现运行时 Date 导致日柱偏移 |
| VAL-TCM-001 | P0 | 中医 | 当前 app 中具体药味/剂量/艾灸建议 | 医疗/安全 | V4+V5 | planned | 全量抽取消费点并反查安全表/现行来源 |
| VAL-LY-001 | P1 | 六爻 | 纳甲、世应、六亲、六神、变卦 | 精确/流派确定性 | V3+V5 | planned | 复用现有测试入口，补独立 fixtures |
| VAL-ZW-001 | P1 | 紫微 | 十二宫、主星、四化、辅煞星 | 流派确定性 | V3 | planned | 先声明流派与版本 |
| VAL-QM-001 | P1 | 奇门 | 节气、阴阳遁、局数、四盘 | 流派确定性 | V3 | planned | 来源已标简化，默认高风险 |
| VAL-PRD-001 | P1 | 产品 | 主 PRD fresh review | 产品/证据 | independent review | pass | Fresh reviewer 给出 hold；主线程已逐项回看 PRD、当前中医消费点与旧规格，见 `PRD_FRESH_REVIEW_2026-07-09.md` |

## Findings

用户关于早期八字工具“排盘完全错误”的报告记为高优先级历史证据，不等同于当前 repo 已复现。

| Finding ID | Priority | Case | Status | Observation | Required proof |
|---|---|---|---|---|---|
| F-BZ-001 | P1 | VAL-BZ-001 | confirmed | 精确节气只覆盖 2024-2026；1999-06-06/07 月柱错误；1920-2027 的 1,296 边界已全量复算，最大差约 23 小时 14 分，累计暴露窗口约占时间轴 2.171% | 对极值和修复方案做官方锚定与回归 |
| F-BZ-002 | P1 | VAL-BZ-002 | confirmed | 一月大运前/后最近节搜索使用非连续时间序列；2025-01-01 男女起运分别偏约 10 年与 8 年 | 全量一月/年末与顺逆组合；补精确交运日期 |
| F-BZ-003 | P1 | VAL-BZ-003 | evidence_gap | 身强 /100、五行 0.5 权重和用神方向未见来源/流派声明 | 搜索来源并与当前 UI/Prompt 表达对照 |
| F-BZ-004 | P1 | VAL-BZ-004 | hypothesis | `午未合火` 可能与常见 `午未合土` 口径冲突 | 至少两条独立来源或明确流派依据 |
| F-BZ-005 | P2 | VAL-SHARED-001 | confirmed | 日柱使用运行环境本地 `Date`；Pacific/Apia 的 2011 跳日使同一输入较 UTC 偏移一日 | 改用与运行时区无关的公历序数，并全量属性测试 |
| F-BZ-006 | P1 | VAL-SHARED-001 | confirmed | UI 标为“真太阳时”，算法只有经度修正；NOAA true solar time 公式还要求均时差，当前也未处理历史时区/夏令时 | 固定术语与完整时间合同后再实现/验证 |
| F-BZ-007 | P2 | VAL-BZ-002 | confirmed | 大运只保存整数起运年龄，丢失月、日和实际交运日期 | 定义精确字段与 UI 展示口径，再按独立实现复算 |
| F-BZ-008 | P1 | VAL-BZ-001 | confirmed | 2024-2026 手写“精确节”36 个边界中，6 个与独立实现相差 8-14 分钟；2026 立春另有 HKO 04:02 官方锚点 | 逐项官方秒级复核，淘汰手写表 |

## Evidence Log

| Date | Case | Evidence | Result |
|---|---|---|---|
| 2026-07-09 | VAL-PRD-001 | Fresh read-only reviewer `019f48cd-c40a-7ff3-8275-5a7a43541ac0`；主线程复核 `docs/PRD.md`、`src/modules/tizhi/data.js`、`src/modules/bazihealth/prompt.js` 与旧 `APP-SPEC*` | hold；现有 shell 可复用，但具体引擎/静态表未验证前不得作为教学可信底座 |
| 2026-07-09 | VAL-BZ-001/002 | `node scripts/validation/audit-bazi-current.mjs`；30 例；`lunar-javascript@1.7.7`；HKO 1999 历表 | 2 个四柱 mismatch，6 个大运 mismatch；当前八字 gate 失败 |
| 2026-07-09 | VAL-SHARED-001 | NOAA true solar time 公式；`TZ=UTC/America/Chicago/Asia/Shanghai/Pacific/Apia` 跨时区复算 | 当前太阳时缺均时差；Apia 2011 跳日导致日柱偏移 |
| 2026-07-09 | VAL-BZ-001 | Git `d47165b` 与 `4f48bed` | 历史“立春误作甲子日基准”的 34 日偏移已修复；后续大运近似修复留下当前边界缺陷 |
| 2026-07-09 | VAL-BZ-001 | 1920-2027 × 12 节 = 1,296 边界全量独立复算 | 1,260 个边界差超 1 小时，最大不足 24 小时；风险集中在边界窗口，不是全年整体错误 |
