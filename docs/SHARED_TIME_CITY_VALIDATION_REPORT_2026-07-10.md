# 天机卷共享城市与民用时区验证报告

- 日期：2026-07-10
- 验证单元：`VAL-SHARED-001`
- 结论：`pass`，限于当前 374 个城市标签、GeoNames 坐标、IANA 时区标识、宿主运行时可提供的历史民用时区规则，以及 NOAA 均时差公式
- 运行时解释边界：不授证命理或医学解释；不把无法唯一还原的民用时刻静默归一化

## 1. 本轮发现与修复

旧城市表只有显示名、近似经度和固定标准经线。92 个海外城市因此忽略历史夏令时；拉斯维加斯还被误归到美国山地时区，固定为 `-105°` 标准经线。旧均时差实现又在闰年始终使用 365 日分母，与 NOAA 对闰年使用 366 的说明不一致。

本轮完成以下修复：

1. 为全部 374 个现有产品城市标签绑定稳定 GeoNames ID、WGS84 经纬度、国家码、IANA 时区和原始记录 SHA256；276 个中国城市另用 31 个 GeoNames `admin1` 省级代码约束同名匹配。
2. 运行时由“固定标准经线”改为按出生地 IANA 时区和当地民用日期解析实际 UTC offset，覆盖历史夏令时。
3. 对重复时刻返回 `ambiguous`，对跳过时刻返回 `nonexistent`；默认均拒绝，不自动选择或平移。
4. 拉斯维加斯改为 `America/Los_Angeles`；纽约 2025 夏令时按 UTC-4 计算，上海 1990 历史夏令时按 UTC+9 计算。
5. NOAA fractional-year 在平年使用 365、闰年使用 366；1900-2100 每个公历日完成机械复算。
6. 八字、八字健康、奇门、紫微和共享城市选择器全部改用同一个民用时区 API；紫微以时辰中点解析时区状态。
7. 规范核心与运行时快照分离，避免把完整 provenance 字段装入前端 bundle。

## 2. 来源与裁决

| 来源 | 用途 | 本轮边界 |
|---|---|---|
| GeoNames `cities15000` / `cities500` | 城市 ID、WGS84 坐标、IANA 时区、原始记录快照 | GeoNames 是地名数据源，不单独证明历史时区转换规则 |
| IANA Time Zone Database | 民用 UTC offset、历史夏令时与转换语义 | 当前由 Node/浏览器宿主提供规则；宿主 tzdb 版本未报告，未打包固定版本 |
| NOAA General Solar Position Calculations | 均时差和 `time_offset = eqtime + 4*longitude - 60*timezone` | 采用其近似公式，不宣称天文台级历书精度 |
| 中科院国家授时中心 / 紫金山天文台 | 中国法定民用时间采用东八区、120°E 北京时间 | 新疆地方作息不自动推断；产品默认 `Asia/Shanghai`，保留 GeoNames `Asia/Urumqi` 为来源元数据 |

五个行政区或城市标签无法只靠名称机械消歧，已固定人工裁决：湘西→吉首、鄂尔多斯→Ordos、格尔木→Golmud、林芝→Nyingchi、红河→蒙自。每项均保留 GeoNames ID，不把裁决隐藏在模糊匹配中。

## 3. 可重复证据

运行 `npm run audit:shared-time` 生成 `docs/validation/artifacts/shared-time-cities-audit-2026-07-10.json`：

| 检查组 | 数量 | 结果 |
|---|---:|---|
| 总检查 | 132,836 | 0 fail |
| GeoNames 城市来源行 | 374 | 374/374 与规范核心逐字段一致；276 个中国城市省级合同一致 |
| NOAA 均时差日级枚举 | 73,414 | 1900-2100 全部一致 |
| 城市×月份×年份时间样本 | 17,952 | 374 城市 × 48 个时点全部可解析且公式一致 |
| 转换边界 fixture | 10 | 纽约、伦敦、悉尼重复/跳时，上海历史 DST、印度半小时时区均符合预期 |
| 运行时消费路径 | 5 | 均不再调用固定标准经线 API |

全库验证测试为 103/103；生产构建和本轮改动的定向 ESLint 通过。浏览器实测：

- 桌面端选择拉斯维加斯时显示 `America/Los_Angeles`，不再显示山地时区口径。
- 纽约 `2025-07-15 11:00` 显示 UTC-4 路径，真太阳时校正 `-62分`，排盘结果为 `09:58`。
- 结果明确显示“真太阳时（民用时区口径）”。
- 390×844 视口无水平溢出；初始两条 401 为登录前过期 token，登录后本轮交互没有新增 warning/error。

## 4. Artifact 与哈希

| Artifact | SHA256 |
|---|---|
| `database/shared/cities-core.json` | `04691f8bc18ff0cb384717e8dff0e3a847f24829cc261a8d5eac934069389d81` |
| `database/shared/geonames-selected-2026-07-10.tsv` | `a197a1fa0ad749c3ae343fbfe23c91e5ad9b602f2b5d9d999bb825fa6499dcb6` |
| `database/shared/legacy-city-baseline.json` | `f716e4d7f01b90c6f41b1f54d95d58f8c80b877cb6f3414aedeced64fba6e0c8` |
| `src/lib/cities.runtime.json` | `f20697f9c7cf37e661051928b17d971ecb08f51f7411714ebaf48309ac8a50ef` |
| `docs/validation/artifacts/shared-time-cities-audit-2026-07-10.json` | `fc6c86684b2c91159a3b5b7d2317b1b06d3ecc9960ad6ee75a4222fe1db12ec2` |

GeoNames 下载归档哈希记录在规范核心内；精选 TSV 保存实际采用的 374 条原始行，使后续上游更新不会改写本轮证据。

## 5. 仍未授证的范围

- 宿主运行时的 IANA tzdb 版本为 `host_runtime_unreported`。当前证据证明本机 Node/浏览器路径一致，不等于已固定 2026b 或任意指定版本。
- 重复民用时刻目前会安全拒绝，但产品还没有让用户选择“前一次/后一次”的控件。
- 不包含地址级地理编码、时区边界多边形、坐标自动反查时区，也不处理边界附近出生地点。
- 不自动使用非正式新疆地方时间；需要产品另设明确口径和用户选择。
- 不授证 IANA 体系之前的地方平太阳时重建，也不把 1900 年前后的历史 offset 当成完整地方档案学结论。
- `calcTrueSolarTimeOffset` 仅为历史测试兼容保留；活动产品路径已禁止调用。

因此，`VAL-SHARED-001` 可以在上述当前产品域内标记为 `pass`；若未来扩大城市、支持任意坐标、固定 tzdb 版本或允许重复时刻选择，必须新开 validation 单元。
