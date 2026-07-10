# 八字历法核心修复设计

- 日期：2026-07-09
- 状态：完成；四柱/节令第二独立验证与 fresh code review 均已通过
- 依据：`docs/BAZI_VALIDATION_REPORT_2026-07-09.md`
- 范围：四柱历法核心、大运起运、太阳时日期修正

## 1. 目标

修复当前八字工具中已经复现的确定性错误，同时保留已经验证有效的 UI、账户、历史、盘面结构与解释接口。

完成后：

- 1920-2027 不再使用手写三年节气表或正负一天近似公式决定年柱/月柱。
- 日柱不再依赖浏览器本地时区的 `Date`。
- 一月出生的大运能找到真正相邻的前/后节，并保存声明口径下的起运年月日与精度元数据。
- 真太阳时加入均时差；未取得历史民用时区证据的场景明确保留为标准时口径。
- 历史 `d47165b` 日柱修复成为自动回归，不能再次退化。

## 2. 方案选择

采用现有 MIT 依赖 `lunar-javascript@1.7.7` 作为八字历法适配层。

未采用：

- 继续扩充 `JIEQI_PRECISE`：仍需长期手工维护，当前三年表本身已有分钟级错误。
- 保留 `approxJieqiDate` 作为生产边界：只能给日期近似，不能支撑分钟级排盘。
- 自写太阳黄经与历法算法：验证成本和维护风险高于项目当前需要。

`lunar-javascript` 已被紫微和奇门模块使用，本轮不新增依赖。它是运行实现，不因此成为知识库权威；关键 fixture 继续由 HKO、NOAA、历史校准例与后续第二实现提供外部证据。

## 3. 架构

新增 `src/modules/bazi/calendar.js`，只负责：

- 从公历年月日时分创建 `Solar` / `EightChar`。
- 固定 `sect=1`，保持当前 23:00 子初换日口径。
- 输出稳定的年、月、日、时四柱。
- 输出当前月令对应的节名。
- 从 `EightChar.getYun()` 输出大运方向、传统时辰精度的起运间隔、交运公历日期、口径元数据和八步大运。

`engine.js` 继续负责十神、藏干、纳音、长生、强弱、关系和神煞。它不再读取 `JIEQI_PRECISE` 或 `approxJieqiDate`。

```text
用户时间（可选太阳时修正）
  -> calendar.js 精确四柱 / 大运
  -> engine.js 传统关系与解释结构
  -> UI / 历史 / AI Prompt
```

## 4. 输出合同

保留现有字段：

- `pillars.year/month/day/hour`
- `adjustedYear`
- `isApprox`
- `jieqiName`
- `dayun[].stem/branch/startAge/endAge/nayin/shiShen`

新增：

```js
calendar: {
  engine: 'lunar-javascript',
  version: '1.7.7',
  dayBoundarySect: 1,
}

dayunStart: {
  years: 1,
  months: 3,
  days: 20,
  solarDate: '2026-04-21',
  roundedAge: 1,
}
```

`isApprox` 对新历法核心固定为 `false`。`startAge` 保持当前整数展示语义，按声明的传统时辰口径折算后四舍五入且最小为 1；年月日、交运日期和口径元数据保存在 `dayunStart`，避免再次丢失。

## 5. 太阳时合同

NOAA 口径：

```text
true solar adjustment = equation of time + 4 * (longitude - standard meridian)
```

现有 API 使用“需要从钟表时间中减去的分钟数”，因此实现为：

```text
offsetToSubtract = 4 * (standard meridian - longitude) - equation of time
```

`calcTrueSolarTimeOffset` 增加日期参数；八字、八字健康、紫微和奇门调用点均传入排盘日期。没有日期时保留旧经度修正仅用于兼容，但 runtime 调用不得再走无日期路径。

本轮不宣称解决全球历史夏令时。城市仍按 `stdMeridian` 的标准时口径计算；IANA 时区、历史 DST 和地方民用时变更进入下一 validation 单元。UI 显示改为“真太阳时（标准时口径）”。

## 6. 测试

使用 Node 内置 `node:test`，避免新增测试依赖。

必须先失败再修复的回归：

1. `1999-06-07 09:11` 月柱必须为庚午。
2. `2026-02-04 03:53` 仍为乙巳年己丑月；`04:03` 才进入丙午年庚寅月。
3. `2025-01-01` 男/女起运整数分别为 1/9，传统时辰精度值分别约为 1年3月20日/8年6月10日。
4. `TZ=UTC` 与 `TZ=Pacific/Apia` 下 `2011-12-30` 日柱一致。
5. 历史 `2000-10-17 14:00` 保持庚辰、丙戌、戊申、己未。
6. 太阳时 offset 包含均时差，并能跨日调整。

通过后再运行 30 例审计、1,296 节令边界适配测试、build、targeted lint 和 supervisor validator。

## 7. 非目标

- 不在本批修改身强 40/40/20、用神、神煞或午未六合。
- 不同时修六爻、紫微、奇门本体算法。
- 不把 `lunar-javascript` 的输出写成 Database accepted 知识条目。
- 不在缺少 IANA 历史时区验证时声称全球民用出生时间已完全复原。

## 8. 完成条件

- 上述失败 fixture 全部通过。
- 当前八字 runtime 不再消费手写/近似节气边界。
- 修复前 30 例中的四柱和大运 mismatch 清零。
- 新旧输出合同兼容，新增起运间隔、交运日期与口径元数据可保存。
- 文档、ledger、artifact 和 supervisor 反映修复后证据，且不覆盖修复前 artifact。
