# 天机卷 Prominent Source Manifest

- 中文名：主要来源与溯源清单
- 文档状态：来源基线
- 版本：0.1
- 更新日期：2026-07-18
- 配套文档：`PRD.md`、`DATABASE_COVERAGE_MATRIX.md`

## 1. 用途

本文件中的 Prominent 指“主要来源”，同时承担 provenance（溯源）清单的职责。

它回答：

- 哪些资料是当前项目的主要上游。
- 两份近似 compendium 哪份是 canonical，哪份只作对照。
- 中医 Skill、原书层和当前 app 各自能证明什么。
- 每个来源的许可、完整性、整理状态和使用边界是什么。
- 规范化条目以后必须如何回指来源。

本清单登记 source package 和主要 source group，不替代未来的逐条 `source_ref`。逐条溯源在规范化阶段生成。全量文件级入口为 `database/sources/source-library.json`；本文保留重要来源的人工说明与使用边界。

## 2. 来源状态词

| 状态 | 含义 |
|---|---|
| `canonical_raw` | 同类原始资料中当前采用的主副本；不表示内容全部正确 |
| `alternate_raw` | 保留作差异、历史或备选路线对照的副本 |
| `historical_spec` | 证明旧产品意图和开发顺序的历史规格 |
| `candidate_reference` | 可用于提取候选知识条目的整理资料 |
| `metadata_only_blocked` | 只登记固定版本、许可、范围和溯源缺口；正文不得进入候选/accepted/runtime |
| `reviewed_schema_reference` | 已审计的外部结构/流程设计来源；可按许可改造，但不自动成为知识内容或 runtime 合同 |
| `primary_or_textbook_text` | 原典或教材文本层；仍需记录版本、权利和整理状态 |
| `runtime_truth` | 能证明当前产品实际行为的代码或数据；不自动成为知识权威 |
| `normalized` | 已转为稳定 schema，但尚未必校勘 |
| `accepted` | 已按预定规则校勘并允许目标消费场景使用 |
| `validation_anchor` | 用于验证具体算法/事实的外部依据；只证明其明确覆盖的范围 |

## 3. Source Package 清单

### SRC-PKG-XUAN-NEW

| 字段 | 值 |
|---|---|
| 名称 | 玄学综典 · 天机卷 canonical 副本 |
| 项目路径 | `database/xuanxue/compendium-new/` |
| 原始路径 | `/Users/junshi/xuanxue-compendium-new/` |
| 导入日期 | 2026-07-09 |
| 状态 | `canonical_raw` + `historical_spec` + `candidate_reference` |
| 规模 | 72 文件；70 个 Markdown；约 19,416 行 Markdown |
| 内容 | 11 个领域目录、20 个 reference 文件、产品规格、游戏设计、难度映射、Claude 任务入口 |
| 主副本理由 | `CC-TASK-XIANGSHU.md` 采用前端 ML 特征提取再发送结构化文本，与当前 Face/Palm 实现一致 |
| 完整性 | `SHA256SUMS.txt` 校验通过；清单排除 `.DS_Store` 与自身 |
| Manifest SHA256 | `7e42530d00f5c3148273eb76bd47b921ff6b88e3425905c89784dac809cd0a48` |
| 许可 | 未发现 LICENSE 或逐文件权利声明，状态为 `unknown` |
| 主要限制 | Markdown-first；逐条来源不足；部分算法自述简化/近似/待验证 |
| 允许用途 | 项目恢复、内部研究、候选提取、差异审计 |
| 发布门槛 | 补权利状态、逐条来源和目标领域校勘 |

### SRC-PKG-XUAN-VISION

| 字段 | 值 |
|---|---|
| 名称 | 玄学综典 Vision API 备选副本 |
| 项目路径 | `database/xuanxue/compendium-vision-api/` |
| 原始路径 | `/Users/junshi/xuanxue-compendium-vision api/` |
| 导入日期 | 2026-07-09 |
| 状态 | `alternate_raw` + `historical_spec` |
| 与主副本差异 | 除 `.DS_Store` 与 `CC-TASK-XIANGSHU.md` 外基本一致；相术路线直接把图像发往 Vision API |
| 完整性 | `SHA256SUMS.txt` 校验通过；清单排除 `.DS_Store` 与自身 |
| Manifest SHA256 | `08327627f6de5e4a896a9d641c188eec03534b07798127f27463aaa15cc5743c` |
| 许可 | 未发现 LICENSE，状态为 `unknown` |
| 使用规则 | 不作为重复知识的第二票；只用于相术路线差异、历史和回退参考 |

### SRC-PKG-TCM-SKILL-V3

| 字段 | 值 |
|---|---|
| 名称 | 中医 Skill v3.0 本地导入 |
| 项目路径 | `database/tcm/skill-v3/` |
| 导入来源 | `/Users/junshi/.codex/skills/中医/` |
| 上游标识 | `YuanZHAO321/TCM.Skill` commit `966a88acf942b6b8684575db3d1d3f261442b8a4`；2026-07-10 通过 GitHub API 与隔离 clone 核对 |
| 导入日期 | 2026-07-09 |
| 状态 | `canonical_raw` + `candidate_reference`，仅限天机卷当前 TCM 候选层 |
| 规模 | 99 文件；50 个 references；42 个原文 txt；另有原文状态索引 |
| 内容 | 理论、四诊、辨证、内科病种、中药、方剂、针灸、经典、医家、温病、安全表与原文库 |
| 自述版本 | v3.0 终版 |
| 完整性 | `SHA256SUMS.txt` 校验通过 |
| Manifest SHA256 | `4ce12d86950f84dc3a0388332834ddd665597e6bcbdb41e39b69980a2f3f87db` |
| 上游一致性 | 上游 98 文件；本地除新增 `SHA256SUMS.txt` 外逐文件相同；安装副本的 98 个 manifest 条目也全部同 hash |
| 包声明许可 | `CC BY-NC 4.0` |
| 权利提醒 | 包许可不自动消除其中现代教材/第三方原文可能存在的独立权利；公开或商业使用需单独审查 |
| 元数据漂移 | `SKILL.md`/README 口径为 42 部原书，`sources/_目录与状态.md` 文件头仍写 39 部；实际 txt 数为 42 |
| 安全限制 | 剂量主要来自七版教材，Skill 自述尚未按现行《药典》校准；不可据此直接开方或替代诊疗 |
| 允许用途 | 内部研究、候选提取、当前 TCM 静态表审计、安全规则设计、非商业范围内按许可使用 |
| 发布门槛 | 许可审查、现行标准校核、项目独立复核、条目级安全策略 |

### SRC-EXT-NIHAIXIA-SKILL

| 字段 | 值 |
|---|---|
| 名称 | 倪海厦 skill · 经方中医 AI 外部候选来源 |
| 来源 | `https://jangviktor-web.github.io/nihaixia/`；`https://github.com/jangviktor-web/nihaixia` |
| 固定版本 | 默认分支 `StableV2026.5.23`；commit/tree `ec03c594ed239b570e997cbd396c2fc186b6ad91` |
| 项目档案 | `database/sources/external/nihaixia-skill-v2.1.0-2026-07-18.json` |
| 审计日期 | 2026-07-18 |
| 状态 | `metadata_only_blocked` + `secondary_school_commentary_candidate` |
| 当前仓库规模 | 32 个非 Git 文件、28 个 Markdown、9 个模块、6 个案例文件、10 个研究文件；约 4.59 MB / 51,258 行 |
| 自述覆盖 | 129 条伤寒、23 章金匮、71 篇内经、345 味本草、849 案例、10 套讲课资料；这些是 README 声明，尚未独立授证 |
| 可用价值 | 发现倪派讲授主题、建立待查缺口、寻找一手讲义和原典锚点 |
| 覆盖映射 | 伤寒、金匮、内经、针灸/本草与现有库重叠；医案 provenance、学派讲义/口述史是结构缺口；研究稿只作产品线索。7 组均保持 discovery-only 或 blocked |
| 许可结论 | README 声称 MulanPSL-2.0，但固定仓库树无 `LICENSE`，GitHub 元数据未识别许可证；第三方讲义/病例再授权范围也未证明 |
| 溯源断点 | README 说明 v2.0.0 已移除约 110 MB 原始资料；研究索引保留的 Windows `books` 路径不可访问，多数正文只标讲义名称而无稳定页码/段落 |
| 禁止用途 | 不得作为《伤寒论》《金匮要略》《黄帝内经》等原典见证，不得直接校正 accepted 主张，不得进入运行时医疗知识，不批量复制正文 |
| 晋升门槛 | 取得实际许可和第三方权利边界；恢复原始讲义/PDF；逐条补版本和页码；古籍引文与独立一手见证复核；学派阐释与原典分层 |

### SRC-EXT-NIHAISHA-NISHI-TCM

| 字段 | 值 |
|---|---|
| 名称 | `nihaisha-nishi-tcm` 倪海厦课程证据与古籍定位候选 |
| 来源 | `https://github.com/JuneYaooo/nihaisha-nishi-tcm` |
| 固定版本 | `main` commit `e3cb51359a5ef9fc0725132814d474168bb8de24`；tree `fe50e135ddaec3f405bf72e117fdfee06f23a970` |
| 项目档案 | `database/sources/external/nihaisha-nishi-tcm-2026-07-18.json` |
| 审计报告 | `docs/TCM_NIHAISHA_NISHI_SOURCE_AUDIT_2026-07-18.md` |
| 状态 | `reviewed_locator_only_blocked_for_content_ingestion` |
| 仓库规模 | 3,094 文件、约 144.1 MB；2,986 张 WebP 截图；69 个 reference 文件 |
| 证据结构 | 22 个 PDF source 记录、10,538 张页级文本卡、8,814,414 个抽取字符；另有 1 份 183 节非 PDF 文本证据；外置 RAG 自述约 3.68 GB，本批未下载验证 |
| 来源分层 | 课程蒸馏、课程截图、课程/整理 PDF 页卡、倪师推荐补充资料、非 PDF 补充、病例与外置 RAG 分开；推荐资料不得并入倪师本人资料 |
| 经典定位价值 | 页卡中《灵枢》题名信号 207 张、《难经》227 张、《伤寒论》1,159 张、《金匮要略》59 张；仅表示页内出现题名，不表示引文正确或作品覆盖完整 |
| 版本缺口 | 22 个 PDF manifest 条目均未登记 source SHA256、版本、出版社或出版年；原 PDF 未随仓库提供；《灵枢》《难经》无独立 source manifest 文献 |
| 勘误交叉检查 | 上游 51 条决定拆出 58 个词形，13 个在天机 TCM 目录有命中；逐项复核后 0 条直接覆盖。raw 底本保留原貌，只有独立原典支持后才写 adjudication/normalized 修正 |
| 许可结论 | GitHub 许可证元数据为空，仓库无 `LICENSE`；项目仅声明个人学习/研究/技术交流/非商业，课程、截图、转录和 PDF 文本的第三方权利另行保留 |
| 当前吸收 | 只吸收固定元数据、证据层盘点、经典信号、勘误比对结论与四部典籍验证路由；不复制截图、课程正文、病例或页卡全文 |
| 下一步 | 用作《灵枢》《难经》《伤寒论》《金匮要略》的定位/异文线索，再回到独立版本原典逐条核验 |

### SRC-EXT-XUANXUE-DATABASE-SKILL

| 字段 | 值 |
|---|---|
| 名称 | xuanxue-database-skill 外部数据库设计来源 |
| 来源 | `https://github.com/yanouyuan-bit/xuanxue-database-skill` |
| 固定版本 | `main` commit `926d0b56154c8764b68e9ddf2661949e9b5b5f11`；tree `06afe033a72bfe7a8216af068a3c037824eb3909` |
| 项目档案 | `database/sources/external/xuanxue-database-skill-2026-07-18.json` |
| 审计日期 | 2026-07-18 |
| 状态 | `reviewed_schema_reference` + `external_database_design_reference` |
| 规模 | 14 文件、858 行、约 41 KB；1 个 Skill、5 个 reference、6 个模板和 1 个 LICENSE |
| 许可 | MIT；许可证副本 `database/licenses/XUANXUE_DATABASE_SKILL_MIT.txt` 已纳入中央来源索引 |
| 内容性质 | 八字、六爻、紫微的个人命例/应事/方法三库 schema，支持 Notion 与本地 Markdown；不含原典全文、结构化传统知识或真实案例 |
| 可吸收内容 | 匿名命例、命盘-断语-应事-方法关联、事前可证伪写法、失败记录保留、本地优先与可迁移字段 |
| 直接采用风险 | 单一可靠度字段混合经典地位与个人战绩；3 次应验即可“已验证”；缺断语不可变版本、完整分母、证据等级、排盘版本和流派口径 |
| 天机卷改造 | 生成 `database/learning/practice-evidence-schema-candidate.json`；个人结果与典籍权威、KP 掌握度彻底分离，加入事前冻结、证伪合同、隐私和高风险排除 |
| 产品边界 | 当前只作设计候选，不进入 runtime；完成产品、隐私、迁移和 UI 工作流评审后再决定启用 |

### SRC-PKG-TIANJI-RUNTIME

| 字段 | 值 |
|---|---|
| 名称 | 当前天机卷代码与运行时静态数据 |
| 项目路径 | `src/`、`server/`、`test-liuyao.mjs` |
| Git 基线 | 初始盘点 HEAD 为 `d85505c`；2026-07-09 八字修复与验证记录见项目 changelog / validation artifacts |
| 状态 | `runtime_truth` |
| 内容 | 13 个业务模块、排盘引擎、Prompt、账户/历史、AI Provider、图像与城市/真太阳时能力 |
| 能证明 | 当前产品实际支持的输入、计算、展示、数据表和 AI 调用行为 |
| 不能证明 | 传统知识是否权威、算法是否完整校勘、中医建议是否安全 |
| 许可 | 项目根目录未发现独立 LICENSE，状态为 `project-internal/unknown` |
| 使用规则 | 作为反向审计来源；静态表和 Prompt 需要映射回候选/accepted 知识条目 |

### SRC-VAL-HKO-CALENDAR

| 字段 | 值 |
|---|---|
| 名称 | 香港天文台公农历对照表与二十四节气资料 |
| 状态 | `validation_anchor` |
| 机构 | 香港天文台 |
| 本轮 URL | `https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/1999e.pdf`、`https://www.hko.gov.hk/en/gts/time/24solarterms.htm` |
| 本轮用途 | 确认 1999 年芒种日期为 6 月 6 日；确认 24 节气由黄经每 15 度定义及节/中气关系 |
| 边界 | 1999 对照表只给日期，不单独提供该页的秒级时刻；分钟边界仍需更精细官方历表或天文算法 |

### SRC-VAL-NOAA-SOLAR

| 字段 | 值 |
|---|---|
| 名称 | NOAA General Solar Position Calculations |
| 状态 | `validation_anchor` |
| 机构 | NOAA Global Monitoring Laboratory |
| URL | `https://gml.noaa.gov/grad/solcalc/solareqns.PDF` |
| 本轮用途 | 确认 true solar time 的 offset 包含 equation of time、经度与时区，并确认闰年 fractional-year 分母使用 366 |
| 审计结果 | 已加入 NOAA 均时差公式并改为“民用时区口径”；1900-2100 共 73,414 日机械复算 0 fail |
| 边界 | 采用 NOAA 近似公式，不宣称天文台级历书精度 |

### SRC-VAL-GEONAMES-CITIES

| 字段 | 值 |
|---|---|
| 名称 | GeoNames Gazetteer `cities15000` / `cities500` |
| 状态 | `validation_anchor` + 当前城市规范核心的上游数据 |
| 上游 | `https://download.geonames.org/export/dump/` |
| 许可 | CC BY 4.0；项目规范核心保留来源、许可、GeoNames ID 与原始行 hash |
| 固定输入 | `cities15000.zip` SHA256 `5c952503722374275f73bbdd62fb31dc92c2e1776abb9d3281699d1fa5636991`；`cities500.zip` SHA256 `cdbe961f3e34d6378dc40eb5dceb0dd3649774b08fb810abaa42adade5fb5096`；`admin1CodesASCII.txt` SHA256 `34784457b76b988a669dff7c3e4b104e4902c0875643cff019281ac79dfa2992` |
| 精选快照 | `database/shared/geonames-selected-2026-07-10.tsv`，374 行，SHA256 `a197a1fa0ad749c3ae343fbfe23c91e5ad9b602f2b5d9d999bb825fa6499dcb6` |
| 规范核心 | `database/shared/cities-core.json`，SHA256 `04691f8bc18ff0cb384717e8dff0e3a847f24829cc261a8d5eac934069389d81` |
| 本轮证据 | 374/374 现有产品城市标签绑定稳定 GeoNames ID、WGS84 坐标、国家码、IANA zone 和原始记录 SHA256；276 个中国城市同时通过 31 个省级 `admin1` 合同 |
| 裁决 | 湘西、鄂尔多斯、格尔木、林芝、红河五项以固定 GeoNames ID 消歧；中国大陆统一采用法定民用 `Asia/Shanghai`，保留源 `Asia/Urumqi` 元数据 |
| 边界 | 不提供地址级地理编码、时区边界多边形或历史时区规则本身 |

### SRC-VAL-IANA-TZDB

| 字段 | 值 |
|---|---|
| 名称 | IANA Time Zone Database |
| 状态 | `validation_anchor`，民用时区标识与转换规则体系 |
| 上游 | `https://www.iana.org/time-zones`、`https://data.iana.org/time-zones/data/tz-link.html` |
| 审计时上游版本 | IANA 页面在 2026-07-10 显示最新发布为 `2026b`；此信息不代表当前 Node/浏览器宿主已使用该版本 |
| 产品实现 | GeoNames 提供 IANA zone ID；Node/浏览器 `Intl` 提供对应历史 UTC offset 与 DST 转换 |
| 本轮证据 | 纽约、伦敦、悉尼重复/跳时，上海 1990 历史 DST、上海当前时区和印度半小时 offset 共 10 个 fixture；17,952 个城市时点通过 |
| 安全策略 | 重复时刻返回 `ambiguous`，跳过时刻返回 `nonexistent`；默认拒绝，不静默归一化 |
| 边界 | `runtimeTzdbVersion=host_runtime_unreported`；未固定宿主 tzdb，未授证 IANA 体系前的地方平太阳时重建 |

### SRC-VAL-CHINA-CIVIL-TIME

| 字段 | 值 |
|---|---|
| 名称 | 中国法定民用时间口径 |
| 状态 | `validation_anchor`，中国大陆产品默认时区裁决 |
| 机构 | 中国科学院国家授时中心、紫金山天文台 |
| URL | `https://ntsc.cas.cn/xwzx_/yw/202109/t20210911_6200315.html`、`https://www.pmo.cas.cn/xwdt2019/kpdt2019/202203/t20220314_6389637.html` |
| 本轮用途 | 固定中国全国法定时间为东八区、120°E 北京时间；避免按 GeoNames `Asia/Urumqi` 自动推断非正式地方作息 |
| 产品策略 | 中国大陆城市默认 `Asia/Shanghai`；新疆地方时间若未来支持，必须由用户明确选择口径 |

### SRC-TOOL-PINYIN-PRO

| 字段 | 值 |
|---|---|
| 名称 | `pinyin-pro@3.27.0` |
| 状态 | 生成期匹配工具，不进入产品运行时 |
| 上游 | `https://github.com/zh-lx/pinyin-pro` |
| 许可 | 包元数据声明 MIT |
| 本轮用途 | 把旧中文城市标签与 GeoNames 拼音/别名候选对齐；最终选择仍受国家、经度、名称和五项固定裁决约束 |
| 边界 | 拼音匹配不是来源权威；运行时只消费已生成并审计的 JSON 快照 |

### SRC-VAL-LUNAR-JS

| 字段 | 值 |
|---|---|
| 名称 | `lunar-javascript@1.7.7` |
| 项目路径 | `node_modules/lunar-javascript/`；依赖声明见 `package.json` |
| 状态 | `runtime_truth`；修复前曾作为独立 comparator，修复后不再计作第二证据 |
| 许可 | 包元数据声明 MIT |
| 本轮用途 | 作为八字四柱、节令和大运 runtime 适配层；四柱固定 `sect=1` 对齐当前 23:00 换日口径，大运固定 Yun `sect=1` 并声明 `traditional_shichen` 精度 |
| 边界 | 运行依赖不能验证自己；2,592 次同库边界检查只证明接线和回归，大运验证依赖下列独立推导证据 |

### SRC-VAL-SXTWL

| 字段 | 值 |
|---|---|
| 名称 | `sxtwl@2.0.7` / 寿星天文历 C++ 实现 |
| 状态 | `validation_anchor`，第二独立实现 |
| 上游 | `https://github.com/yuangu/sxtwl_cpp` |
| 许可 | BSD-3-Clause |
| 本地使用 | 隔离安装于 `/tmp/tianji-sxtwl-venv`；不进入产品依赖 |
| 可重复入口 | `scripts/validation/audit-bazi-sxtwl.py`、`scripts/validation/requirements-bazi-secondary.txt`；脚本强制先重建 primary runtime artifact 并记录源码 SHA256 |
| 本轮结果 | 30/30 四柱一致；1920-2027 的 1,296 个节令时刻全部在 30 秒内，最大差 20 秒；其节令时刻用于独立手工推导 30 例大运 |
| 边界 | 不提供本项目所用的大运接口；大运规则来自经典并由项目审计脚本独立实现；一致仍不是数学证明，也不验证解释性八字规则 |

### SRC-VAL-IZTRO

| 字段 | 值 |
|---|---|
| 名称 | `iztro@2.5.8` 紫微斗数排盘实现 |
| 状态 | `validation_anchor`，第二实现 |
| 上游 | `https://github.com/SylarLong/iztro`；`https://iztro.com` |
| 许可 | 包元数据声明 MIT |
| 本地使用 | 隔离安装于 `/tmp/tianji-ziwei-validator`；不进入产品依赖 |
| 固定口径 | `zh-CN`、`fixLeap=false`，仆役宫与项目交友宫按别名归一 |
| 本轮证据 | 1990-1999 每月 15 日 × 12 时辰 × 男女，共 2,880 盘、325,440 字段，0 mismatch |
| 覆盖 | 农历月日/年干支、命身宫、五行局、十二宫干支、14 主星、16 辅曜、四化、12 步大限 |
| 边界 | 独立实现可验证接线与同派表，不证明星性、疾病、婚姻、财富或命运预测为事实 |

### SRC-VAL-QIMEN-CLASSICS

| 字段 | 值 |
|---|---|
| 名称 | 《奇门遁甲统宗·定三元法》与《奇门法窍》卷二 |
| 状态 | `validation_anchor`，符头定元与交节口径文本 |
| 在线校本 | `https://zh.wikisource.org/wiki/奇門遁甲統宗`、`https://ctext.org/wiki.pl?chapter=666094&if=gb&remap=gb`、`https://ctext.org/wiki.pl?chapter=118328&if=gb&remap=gb` |
| 本轮用途 | 锚定甲/己为符头；子午卯酉上元、寅申巳亥中元、辰戌丑未下元；节气须按交节时刻而非整日切换 |
| 边界 | 原典同时包含超神、接气、拆补、置闰等不同处理；本项目只授证已声明的现代时家拆补转盘口径，不宣称覆盖全部古法 |

### SRC-VAL-3META-QIMEN

| 字段 | 值 |
|---|---|
| 名称 | `3meta@2.6.0` 奇门遁甲实现 |
| 状态 | `validation_anchor`，第二实现 |
| 上游 | `https://github.com/3metaJun/3meta` |
| 许可 | MIT |
| 本地使用 | 隔离安装于 `/tmp/tianji-qimen-validator`；不进入产品依赖 |
| 固定环境 | `TZ=Asia/Shanghai`，避免其 `dayjs` 被运行机器 DST 静默归一化 |
| 本轮证据 | 2020-2024 共 23,751 盘、1,377,558 字段；奇门核心 0 mismatch；立春日年柱整日提前切换造成 38 个已知 calendar-only 差异 |
| 覆盖 | 节气、阴阳遁、局数、三元、旬首、值符值使、地盘、天盘干/九星、人盘八门与八神 |
| 边界 | 第二实现不证明传统预测为事实；其中立春日年柱不是本项目采用的精确时刻口径 |

### SRC-VAL-KINQIMEN

| 字段 | 值 |
|---|---|
| 名称 | `kinqimen@0.3.1` 时家奇门拆补实现 |
| 状态 | `validation_anchor`，第三实现的共享口径对照 |
| 上游 | npm 包 `https://www.npmjs.com/package/kinqimen` |
| 许可 | GPL-3.0-only；仅隔离验证，不复制代码、不进入产品依赖 |
| 本地使用 | 隔离安装于 `/tmp/tianji-qimen-validator` |
| 本轮证据 | 2024 年 4,758 盘、189,789 个共享字段 0 mismatch |
| 覆盖 | 节气、局数、旬首、值符/值使名称、地盘、天盘干、九星与八神 |
| 排除 | 其值使门按时干索引表计算，并保留中宫落点；与项目/`3meta` 的旬内步数和寄宫规则不同，全部值使落宫与八门字段明确不计入一致性 |

### SRC-VAL-XUANKONG-RULES

| 字段 | 值 |
|---|---|
| 名称 | 沈氏玄空下卦公开规则资料与二十四山三元龙表 |
| 状态 | `validation_anchor`，流派口径和有限表文本 |
| 参考 | 《沈氏玄空学》的下卦/紫白/九运体系；公开规则对照 `http://www.52cz.cn/bazisuanming/29043.html`、`https://www.d02.cn/html/suanming/zhouyisuanming/zhouyizatan/95226.html` |
| 本轮用途 | 锚定地/天/人元龙顺序、四正/四隅阴阳、同元龙决定山向盘顺逆、五黄借山、每山中间九度为下卦正向范围 |
| 边界 | 公开网页只作为可核对的规则转述，不授证风水预测；替卦、兼向、出卦及不同版本《沈氏玄空学》的解释差异均未纳入本轮通过范围 |

### SRC-VAL-SOUL-XUANKONG

| 字段 | 值 |
|---|---|
| 名称 | `@soul-atelier/xuankong@0.2.1` 与 `@soul-atelier/calendar@0.3.0` |
| 状态 | `validation_anchor`，下卦盘与节气历法第二实现 |
| 上游 | npm：`https://www.npmjs.com/package/@soul-atelier/xuankong`、`https://www.npmjs.com/package/@soul-atelier/calendar`；包元数据指向 `https://github.com/soul-atelier/sdks` |
| 许可 | MIT |
| 本地使用 | 隔离安装于 `/tmp/tianji-fengshui-validator`；不进入产品依赖 |
| 本轮证据 | 9 运 x 24 山共 216 张盘、6,048 个运/山/向盘与结构标签字段 0 mismatch；tyme4ts 后端对 2020-2026 共 10,228 时刻的太阳年、流年中宫与流月中宫 30,684 字段 0 mismatch |
| 边界 | 第二实现发布较新，只作为独立复算证据；不能验证星性、组合断语、形煞、化解或现实效果 |

### SRC-VAL-XIANGSHU-SHENXIANG-QUANBIAN

| 字段 | 值 |
|---|---|
| 名称 | 《神相全编》致和堂藏板明刊本见证 |
| 状态 | `classical_text_with_scan_witness`；首批相术典籍核心 |
| 版本线索 | 题宋陈抟秘传、明袁忠彻订正；书格著录为十二卷首一卷、致和堂藏板明刊本 |
| 影印见证 | `https://old.shuge.org/ebook/shen-xiang-quan-bian/` |
| 可搜索转录 | `https://ctext.org/wiki.pl?chapter=905153&if=en`，CTP URN `ctp:ws905153` |
| 已固定内容 | 三停原文与“不可一体而断”；五岳、五行面型及十二宫位置；当前编号十二宫与父母宫总诀的版本差异；额、眉、眼、鼻、口、颏及气色界定原文 |
| 归属边界 | 书名页传统题署不等于宋代作者身份已被现代版本学确认；关键条目仍需与影印页逐页复核 |

### SRC-VAL-XIANGSHU-TIEGUANDAO

| 字段 | 值 |
|---|---|
| 名称 | 《神相铁关刀》卷三相掌秘诀 |
| 状态 | `classical_text_transcription_candidate`；作者、年代与底本待进一步版本学核定 |
| 可搜索转录 | `https://ctext.org/wiki.pl?chapter=351787&if=en` |
| 已固定内容 | 巽离坤三宫传统关联、掌形与掌纹断语、身面掌相配原则 |
| 边界 | 当前只固定短摘录和行定位，影印本尚未绑定；不把转录无误或传统预测效力视为已证明 |

### SRC-VAL-XIANGSHU-XUFU

| 字段 | 值 |
|---|---|
| 名称 | 《许负相法》相手篇第十一 |
| 状态 | `classical_text_with_scan_witness`；传统题汉许负，文本层次有明确争议 |
| 影印/转录 | `https://zh.wikisource.org/wiki/File:許負相法.pdf`；`https://zh.wikisource.org/wiki/許負相法/相手篇第十一`；CText chapter `897562` |
| 已固定内容 | “掌四方，厚中央”等相手条目 |
| 内部校勘提示 | 该本序言自己写“虽多后世增色”，所以“现存文本有此句”和“该句确为汉许负原作”必须分开记录 |

### SRC-VAL-XIANGSHU-GONGDU

| 字段 | 值 |
|---|---|
| 名称 | 《公笃相法》上篇卷一手掌图说 |
| 状态 | `later_traditional_commentary`；不是古代早期原典替代品 |
| 可搜索转录 | `https://ctext.org/wiki.pl?chapter=419831&if=en` |
| 已固定内容 | 木长直、金方正、水圆短、土敦厚、火尖露的五形手分类 |
| 作者自限 | 同段明确写手掌相法“经验甚少”且“其它末敢必其为贵贱”；该保留意见与规则本身同时入库 |

### SRC-VAL-XIANGSHU-SHENXIANG-SHIDIAN-V8

| 字段 | 值 |
|---|---|
| 名称 | 识典古籍《神相全编》卷八转录见证 |
| 状态 | `classical_text_transcription_candidate`；书格影印交叉校勘待完成 |
| 转录/影印 | `https://www.shidianguji.com/zh/book/SDZJ0174/chapter/1k2ktfsndzlej`；`https://old.shuge.org/ebook/shen-xiang-quan-bian/` |
| 已固定内容 | “掌中三大纹”为三才纹；天、地、人纹的卷内次序与传统关联；一般性指形长短、柔硬条目 |
| 边界 | 当前见证不证明现代生命线、智慧线、感情线与地、人、天纹的一一对应，也不支持旧库按具体手指配置的现代能力标签 |

### SRC-VAL-XIANGSHU-WESTERN-PALMISTRY-1911

| 字段 | 值 |
|---|---|
| 名称 | 1911 Encyclopaedia Britannica `Palmistry` |
| 状态 | `historical_reference_witness`；西方手相史料，不是中国相术典籍 |
| 公开文本 | `https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Palmistry` |
| 已固定内容 | 金星、木星、土星、太阳、水星、火星与月丘的西方命名和位置描述 |
| 边界 | 只用于识别旧库中的跨传统来源；不支持中国五行配属、人格吉凶，也不支持旧库细分的火星正丘、负丘和平原 |

### SRC-VAL-XIANGSHU-INDIAN-PALMISTRY-LINES

| 字段 | 值 |
|---|---|
| 名称 | Helena Fenwick Dale, `Indian Palmistry: The Lines` |
| 状态 | `historical_reference_witness`；西式/印度手相历史材料，不是中国相术典籍 |
| 公开文本 | `https://en.wikisource.org/wiki/Indian_Palmistry/The_Lines` |
| 已固定内容 | 太阳线/Via Solis、命运/土星线和肝线的历史名称、位置及部分传统关联 |
| 边界 | 只用于识别跨传统术语和版本差异；不支持旧库职业年龄节点、婚姻线整套解释或通过掌纹作现代医学诊断 |

### SRC-VAL-TCM-OFFICIAL-SAFETY

| 字段 | 值 |
|---|---|
| 名称 | 国务院/NMPA 中药毒性管理与 2025 版《中国药典》公告 |
| 状态 | `validation_anchor`，法定毒性 blocklist 与现行药典版本边界 |
| 官方来源 | `https://mpa.jl.gov.cn/xxgk_84894/zcfg/xzfg/202303/t20230301_8673915.html`、`https://www.gov.cn/zhengce/zhengceku/2021-04/08/5598335/files/bfc3496e3daf4857abcd324b55bd39b3.pdf`、`https://english.nmpa.gov.cn/2025-06/11/c_1102172.htm` |
| 本轮用途 | 确认医疗用毒性药品法规范围、NMPA 所称 28 项毒性中药，以及 2025 药典自 2025-10-01 实施 |
| 本轮结果 | 28 项名称进入 `tcm-safety-core.json`；Skill 100 行/101 味剂量表进入全量候选层并保持 blocked |
| 发布漂移 | 北京政务页写 27 项并遗漏红升丹；深圳政府 2026 附录列出完整 28 项，冲突已记录，未静默抹平 |
| 边界 | 法定 28 项不是全部风险药物；公告本身不提供逐药剂量，不能替代药典逐味校准 |

### SRC-VAL-CHP-2025-CATALOG

| 字段 | 值 |
|---|---|
| 名称 | 2025 年版《中华人民共和国药典》一部品名目录 |
| 状态 | `validation_anchor`，仅用于当前版药材和饮片品名身份 |
| 公告 | `https://english.nmpa.gov.cn/2025-06/11/c_1102172.htm`；实施日期 2025-10-01 |
| 目录承载页 | `https://pharm.ncmi.cn/xwzx/202504/t20250407_426308.html` |
| 固定来源 | PDF SHA256 `ed7c610a248e654eaa9db7a7335593816f0ff6afa7783528fd4016df9037d721`；提取文本 SHA256 `800c8fd48f4996db593401d0911c4e1669568002ff88f1d61fac0033c4f2b895` |
| 项目快照 | 药典剂量候选：`database/tcm/sources/chp2025-part1-candidate-index.json`，SHA256 `4fab3ff363983550206c7d63669f91506b02041ed5e754d60c4ad776f41c9f53`；妊娠/配伍候选：`database/tcm/sources/chp2025-tcm-pregnancy-compatibility-index.json`，SHA256 `20653aea27d1483c1877d6a8e2640b9553696d9102ccca1147303eec5c0e781f` |
| 本轮结果 | 剂量候选 101 味中 79 味命中目录、22 味缺失或名称未裁决；妊娠/配伍比较集 109 味中 86 味命中、23 味缺失；“贯众”保留绵马贯众/紫萁贯众歧义 |
| 边界 | 公开附件是品名目录，不是药材正文；不能验证剂量、炮制、注意、禁忌、基原或临床用途 |

### SRC-VAL-CHP-2020-DIGITAL

| 字段 | 值 |
|---|---|
| 名称 | 国家药典委员会 2020 版数字药典一部 |
| 状态 | `validation_anchor`，官方历史剂量与注意字段 comparator |
| 官方入口 | `http://ydz.chp.org.cn/`；项目查询 API `https://ydz.chp.org.cn/front-api/` |
| 项目快照 | 药典剂量候选：`database/tcm/sources/chp2020-tcm-safety-selected.json`，SHA256 `decb0316a81ae7d864bc86f84db5b87bf6a1eb51cf29f8990ec36529511ad757`；妊娠/配伍候选：`database/tcm/sources/chp2020-tcm-pregnancy-compatibility.json`，SHA256 `78f7e661d8d28707582b1efddc7c845c88166cb6b192a37d33c386cd2bb81490` |
| 保存边界 | 只保存候选药的短字段、entry ID、入口 URL 与正文 SHA256，不镜像整部药典正文 |
| 本轮结果 | 剂量比较集 79 味命中历史正文，41 味的全部官方克数表达已见于 Skill、38 味至少有一项数量差异；妊娠/配伍比较集 86 味命中历史正文，73 味有注意字段，Skill 妊娠等级出现 13 条冲突，十八反 52/52、十九畏 7/10 有历史字段支持 |
| 边界 | 2020 正文只作历史官方对照，不能代表 2025 现行正文；数量一致也不授予产品剂量资格 |

### SRC-VAL-TCM-FOOD-MEDICINE-DIRECTORY

| 字段 | 值 |
|---|---|
| 名称 | 国家卫健委现行食药物质目录与增补公告 |
| 状态 | `validation_anchor`，当前目录成员、公告批次、明示部位和限制 |
| 官方来源 | 2002 年卫法监发〔2002〕51号基础名单；2019年第8号、2023年第9号、2024年第4号增补公告；2021 目录管理规定；2025 答复确认当前 106 项 |
| 项目快照 | `database/tcm/sources/nhc-food-medicine-directory.json`，SHA256 `e8e3d8c7cff2bde7058948fb5148f4c68edb08c2f983e33e132d671e99acf34b` |
| 规范裁决 | `database/tcm/normalized/tcm-food-medicine-adjudications.json`，SHA256 `a0efa2ed5bdb43e9c74b977149a98840575b48ee24eaa794fe9f6bb59958d613` |
| 本轮结果 | 106 项按 87+6+9+4 固定；Skill A 清单 15 项为 13 匹配、2 不在目录；8 条配方主张 38 个原料为 18 匹配、5 身份/炮制缺口、15 不在目录 |
| 边界 | 2002 名单只有分组名称；不在目录不等于不是普通食品；目录成员不授予配方、剂量、病种疗效、儿科或外用资格；所有产品用法 blocked |

### SRC-VAL-TCM-ARISTOLOCHIC-REGULATORY

| 字段 | 值 |
|---|---|
| 名称 | 2003 关木通与 2004 广防己/青木香等含马兜铃酸药材监管通知 |
| 状态 | `validation_anchor`，历史监管动作与药名边界 |
| 官方来源 | 国药监注〔2003〕121 号：取消关木通药用标准并以木通替代；国食药监注〔2004〕379 号：取消广防己、青木香标准，以防己（粉防己）、土木香（菊科土木香）替代，并列马兜铃、寻骨风、天仙藤、朱砂莲限制事项 |
| 在线见证 | `https://amr.hainan.gov.cn/himpa/adr/tzgg/ypblfyxxtb/201708/t20170802_460140.html`；`https://hubyjs.org.cn/view/1281.html?tid=6` |
| 项目快照 | `database/tcm/sources/aristolochic-regulatory-2003-2004.json`，SHA256 `c35d5f449a5d3f41ffe67e87747cdf7c0b2c3350ef4bc71d3c61c42fc8277b55` |
| 本轮结果 | Skill 的“六味”说明混合两批通知、遗漏朱砂莲，并把广防己与木防己/汉防己混同；规范层改为 7 个监管药名并保留替代关系 |
| 边界 | 通知证明发布时点的监管动作；2025 目录缺失不能单独证明不存在其他现行标准或当前违法，处方与标准现状未完全裁决前全部候选保持 blocked |

### SRC-VAL-TCM-CONSTITUTION

| 字段 | 值 |
|---|---|
| 名称 | ZYYXH/T 157-2009 与 CCMQ 量表研究 |
| 状态 | `validation_anchor`，体质量表版本与条目数 |
| 来源 | 中华中医药学会 2026 标准应用示范清单；PubMed `37904166`、`35294132`、`41636294` |
| 本轮用途 | 核对原 CCMQ 为 60 项，已发表短版为 23/26/27 项，并判断旧 34 题实现是否对应已验证版本 |
| 本轮结果 | 旧 34 题不匹配上述版本；体质判定与调养功能暂停 |
| 边界 | 本轮未导入受版权保护的完整量表条目；取得合法文本和对应评分规范前不恢复运行时 |

### SRC-VAL-TCM-ACUPOINT-STANDARDS

| 字段 | 值 |
|---|---|
| 名称 | GB/T 12346-2021《经穴名称与定位》、GB/T 40997-2021《经外奇穴名称与定位》与 WHO 2008 穴位标准 |
| 状态 | `validation_anchor`，官方现行状态/范围数量与历史国际 comparator；逐名清单为二级转录候选 |
| 官方来源 | `https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=397548AE7248D3D87DD15E0AB8107185`、`https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=D2AEF8AD07C0150E19859079579EF99F`、`https://iris.who.int/items/f188654a-d8a7-4519-9979-8e2de713c060` |
| 当前范围 | 现行中国目录为 362 经穴、51 经外奇穴；WHO 2008 comparator 为 361 经穴 |
| 项目快照 | `database/tcm/sources/who2008-acupoint-name-index.json`，SHA256 `15efb2be8f1208028554a9bbb26733b96347dba573cb3e58677dcb176dbd9a67`；`database/tcm/sources/cn2021-acupoint-standard-catalog.json`，SHA256 `b121d0a3d34bb48f8ed9a3b5d850cb5b65c78a76c493e2cb9affcd4558f53a38` |
| 转录支持 | `luthepath/TCM-Input-Method` commit `1a0bc95d3e15f01d1d7be8293ca8deac40ab058f`、MIT；只作结构化名称转录辅助，不能覆盖官方标准 |
| 本轮结果 | 官方授证现行 362/51 范围；二级转录候选提示 Skill 缺 `GV29 印堂`、3 个经穴名差异，40 个奇穴为 34 匹配/缺 17/另有 6 未匹配；确认 `GB31 风市` 保留旧 7 寸定位，现行为 9 寸 |
| 边界 | 项目不保存可复现的官方逐名清单或完整定位正文；逐名差异只作二级候选，401 条定位和传统主治全部 blocked |

### SRC-VAL-TCM-EXTERNAL-TREATMENT-SAFETY

| 字段 | 值 |
|---|---|
| 名称 | WHO 针灸/推拿执业基准、WHO 针灸安全指南、FDA P6 按压设备审查、Cochrane 胎位不正艾灸综述与艾灸不良事件综述 |
| 状态 | `validation_anchor`，外治操作风险、禁忌和证据外推边界 |
| 官方/研究来源 | `https://www.who.int/publications/i/item/978-92-4-001688-0`、WHO IRIS 针灸/推拿 PDF、`https://www.fda.gov/media/149637/download`、DOI `10.1002/14651858.CD003928.pub4`、PMCID `PMC4058265` |
| 项目快照 | `database/tcm/sources/external-treatment-safety-evidence.json`，SHA256 `461c23d704bd490910fedb44b1cda123f9d34a382ff8863e6954fb512921ee94` |
| 本轮结果 | 全局 A 级家庭按压无支持；家庭艾灸具体方案、针刺处方向按压/艾灸的跨模态转换、晕针糖水/按穴扩展均 blocked；禁止自行针刺的方向性边界得到支持 |
| 边界 | FDA 证据只覆盖 P6 止吐设备；病例综述证明危害种类而非发生率；专业操作边界不授予任何程序性家庭指导资格 |

### SRC-VAL-TCM-DISEASE-RED-FLAGS

| 字段 | 值 |
|---|---|
| 名称 | CDC/AHA/NIDDK/NIH/WHO/HRSA/Red Cross/NHLBI 病种红线与急救 comparator |
| 状态 | `validation_anchor`，现代急症识别、升级和家庭处置冲突边界 |
| 官方来源 | CDC 卒中/癫痫/DKA/疟疾；AHA 心梗与 2024 First Aid；NIDDK 尿潴留；NIH MedlinePlus 消化道出血/中毒/急腹症；WHO 自杀；HRSA Poison Help；Red Cross 晕厥；NHLBI 哮喘 |
| 项目快照 | `database/tcm/sources/disease-red-flag-evidence.json`，SHA256 `a39866694958d6674f33b6db67cf4a88a837be89d7f064d0af61f1c601ef74ea` |
| 本轮结果 | 52 病种、689 条非空行、22 表/133 表格行完整 inventory；83 条关键词风险和 308 条广义处置候选只作优先复核；9 条冲突、9 条现代急症红线获有边界支持、2 条混合边界 |
| 边界 | 只授证红线识别和升级方向；不授证传统病机、辨证、方剂、剂量、检查或疗效；急救号码和毒物服务必须按用户所在地本地化 |

### SRC-VAL-TCM-THEORY-DIAGNOSIS

| 字段 | 值 |
|---|---|
| 名称 | NCCIH/WHO/CDC 与同行评议中医诊断可靠性、体质量表 comparator |
| 状态 | `validation_anchor`，传统框架向现代诊断/治疗外推的证据边界 |
| 官方来源 | NCCIH TCM overview；WHO Global Traditional Medicine Strategy 2025-2034；CDC Seasonal Flu Vaccine Basics |
| 同行评议来源 | 2019 TCM inter-rater 系统综述；2009 TEAM 诊断可靠性综述；2016 脉诊可靠性综述；CCMQ 60 项/9 类研究；2021 功能性消化不良诊断量表系统综述 |
| 项目快照 | `database/tcm/sources/theory-diagnosis-evidence.json`，SHA256 `f11dc234e41e723b8cf2d69180292ef334bb94eccc0e06b6a78c09cf5aab9d4a` |
| 本轮结果 | `01-14` 的 836 条非空行、31 表/157 表格行、124 标题和 127 条优先候选完整 inventory；14 个外推/可靠性 finding 全部 blocked |
| 边界 | 只区分传统归属、证据可靠性和现代外推风险；不授证传统概念的现代效度，也不生成诊断、预后、预防、剂量或治疗建议 |

### SRC-VAL-TCM-HERB-CATALOG

| 字段 | 值 |
|---|---|
| 名称 | FDA/NCCIH/HRSA/NLM/CDC 与中国药监中药资料安全 comparator |
| 状态 | `validation_anchor`，中药剂量、毒性、家庭动作、儿科、监管与现代疗效边界 |
| 官方来源 | FDA 补充剂/儿童/马兜铃酸/重金属；HRSA Poison Help；NLM 中毒急救；CDC 破伤风/疟疾；中国药监 2003/2004 马兜铃酸与法定毒性来源 |
| 项目快照 | `database/tcm/sources/herb-catalog-evidence.json`，SHA256 `3175dfe1f95f352f8ff904898eae8ef3c5a597b6d8272f7f707edb5f8343fb8b` |
| 本轮结果 | `15-23` 的 1,331 条非空行、45 表/279 表格行、122 标题、663 条重叠风险候选和 20 finding；反查表实有 100 条、缺 52-54，并有两处原始逆序 |
| 边界 | 完整 inventory 与重点风险裁决不等于 470 余味逐味现行药典校准；所有剂量、用法、病证映射和疗效继续 blocked |

### SRC-VAL-TCM-FORMULA-CATALOG

| 字段 | 值 |
|---|---|
| 名称 | NMPA/FDA/NCCIH/NLM/CDC 与中国药监方剂资料安全 comparator |
| 状态 | `validation_anchor`，方剂计数、剂量、毒性、监管、急症和现代疗效边界 |
| 官方来源 | NMPA 2025 药典公告与马兜铃酸历史通知；FDA 补充剂/马兜铃酸/重金属；NCCIH 中医概览；NLM 中毒急救；CDC 卒中；MedlinePlus 消化道出血 |
| 项目快照 | `database/tcm/sources/formula-catalog-evidence.json`，SHA256 `f47e3ab36c1db2addb801231bdd12768b7fed000b022e8b0e986a72989d12097` |
| 规范裁决 | `database/tcm/normalized/tcm-formula-catalog-candidates.json`，SHA256 `8865c30e383701fc360754191a8f71d2da70a4d26e87b54d7146bbf7d4784c28` |
| 本轮结果 | `24-30` 的 820 条非空行、8 表/171 表格行、81 标题、186 个格式化定义、180 个显式附方实体、522 条重叠窄风险视图和 21 finding；第 25 分册附方声明 45、显式实体 43 |
| 边界 | 只授证完整 inventory、计数差异、实体可追溯、重点风险与阻断；2 个附方来源缺口保持开启，不授证逐方组成版本、现代剂量、处方权或临床疗效 |

### SRC-VAL-TCM-CLASSICS-FOOD

| 字段 | 值 |
|---|---|
| 名称 | NHC/WHO/NCCIH/FDA/CDC/NCI 经典与食疗安全 comparator |
| 状态 | `validation_anchor`，食药物质身份、健康饮食、补充剂、急症和疾病替代边界 |
| 项目快照 | `database/tcm/sources/classics-food-evidence.json`，SHA256 `66d8f3034d7b1f5b7ed2ac5203e1e7f8228a5a9cb09c3fca241a7a93235fd94e` |
| 本轮结果 | `42-48` 的 1,142 条非空行、8 表/79 表格行、145 标题、603 条重叠窄风险视图和 20 finding；旧食疗 runtime 状态单列 |
| 边界 | 只授证完整 inventory、重点风险与阻断；106 项目录身份已在 `SRC-VAL-TCM-FOOD-MEDICINE-DIRECTORY` 后续单元完成，但本层仍不授证经典校勘、配方剂量或临床疗效 |

### SRC-VAL-DAYUN-CLASSICS

| 字段 | 值 |
|---|---|
| 名称 | 《渊海子平·论起大运法》与《三命通会·论大运》 |
| 状态 | `validation_anchor`，传统大运规则文本 |
| 在线校本 | `https://www.shidianguji.com/book/NGJ892411999032112149610/chapter/1lqsbrapj4372`、`https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1vhnp` |
| 本轮用途 | 锚定阳男阴女顺、阴男阳女逆；取未来/过去相邻“节”；三日一岁；传统时辰折算 |
| 实现方式 | `audit-bazi-sxtwl.py` 仅使用 `sxtwl` 节令和四柱，独立实现规则，不调用 runtime `getYun()` |
| 本轮结果 | 30/30 大运方向、传统时辰精度交运日期和首运干支一致 |
| 边界 | 只验证已声明的传统时辰口径；不证明其他流派、连续分钟折算或任何吉凶解释 |

### SRC-VAL-BAZI-STRENGTH-CLASSICS

| 字段 | 值 |
|---|---|
| 名称 | 《滴天髓·衰旺论》《滴天髓阐微》命例与《子平真诠评注》用神论 |
| 状态 | `validation_anchor`，用于否证通用简化规则与界定术语分歧 |
| 在线校本 | `https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93/12`、`https://ctext.org/wiki.pl?chapter=126492&if=gb`、`https://ctext.org/wiki.pl?chapter=974137&if=gb` |
| 本轮用途 | 确认旺极/衰极等情形不能套用二分扶抑；以两条命例检验旧 runtime 的统一用神方向；确认“用神”在格局法与平衡法中含义不同 |
| 本轮结果 | 两条相同四柱 fixture 均复现 runtime 分数，但原典用神结论与旧通用输出冲突；`VAL-BZ-003 = fail` |
| 边界 | 原典反例足以否证旧通用规则，但不能单独产生可编程的替代算法；后续必须声明流派并另建完整 fixtures |

### SRC-VAL-BAZI-RELATIONS-SHENSHA

| 字段 | 值 |
|---|---|
| 名称 | 《三命通会》关系/神煞篇与《五行精纪》关系资料 |
| 状态 | `validation_anchor`，有限查表与条件边界 |
| 在线校本 | `https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1yasl`（六合）、`https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1ynfp`（三合）、`https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1z02t`（六害）、`https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1zcpx`（三刑）、`https://www.shidianguji.com/book/SK1610/chapter/1kt0ayvn4fjf7`（冲击）、`https://www.shidianguji.com/book/SK1610/chapter/1kf5v7gfo2iwj`（合化成局）、`https://zh.wikisource.org/wiki/三命通會/卷二`（咸池）、`https://ctext.org/wiki.pl?chapter=727777&if=gb`（五行精纪） |
| 本轮用途 | 全量核验五合、六合、六冲、三合、三会、六害、相刑、自刑及桃花/驿马/华盖查表；区分关系存在、成化成立和吉凶解释 |
| 本轮结果 | 有限关系表及三张神煞表匹配；修复两支相刑漏检；合化与吉凶不授证；相破因来源版本差异保持 inactive |
| 边界 | 三会主要由 compendium 与后期通行表支持；神煞起查基准存在流派选择；原典断语不作为现代人格、健康或事件事实 |

### SRC-VAL-LIUYAO-JINGFANG

| 字段 | 值 |
|---|---|
| 名称 | 《卜筮正宗》纳甲装卦、世应、六兽、旬空与伏神规则 |
| 状态 | `validation_anchor`，京房八宫纳甲确定性结构 |
| 在线校本 | `https://ctext.org/wiki.pl?chapter=889452&if=gb&remap=gb`（纳甲等基础表）、`https://ctext.org/wiki.pl?chapter=801184&if=gb&remap=gb`（伏神正传） |
| 第二实现 | `iching-shifa@1.8.0`，GPL-3.0-or-later；仅隔离于 `/tmp/tianji-liuyao-validator` 用于验证，不进入产品依赖 |
| 本轮用途 | 全量验证 64 卦卦宫/宫序/世应/纳甲/六亲/六神/旬空/伏神，以及 4,032 个动爻组合和 12,288 条变爻 |
| 本轮结果 | 修复乾外壬、坤外癸和节令近似；17,026 项独立检查与第二实现 33,408 字段比较均为 0 失败 |
| 边界 | 只授证声明口径下的排盘结构；用神、旺衰、成败、应期、健康和其他现实断语继续 `not_validated` |

### SRC-VAL-SANMING-LIUHE

| 字段 | 值 |
|---|---|
| 名称 | 《三命通会·论支元六合》 |
| 状态 | `validation_anchor`，经典关系定义 |
| 在线校本 | `https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1yasl` |
| 本轮用途 | 确认午未属于六合；区分“六合关系”与后续合化判断 |
| 项目对照 | `database/xuanxue/compendium-new/00-cosmology/03-tiangan-dizhi.md` 明示午未化火或土有争议 |
| 边界 | 原典不能单独决定所有现代流派的合化条件；runtime 因此只输出关系，不自动宣称成化 |

### SRC-VAL-MEIHUA-VOL1

| 字段 | 值 |
|---|---|
| 名称 | 《梅花易数》卷一“年月日時起例”“互卦起例”“字占”与观梅例 |
| 状态 | `validation_anchor`，声明口径与经典例题 |
| 在线校本 | `https://ctext.org/wiki.pl?chapter=867487&if=gb`；`https://zh.wikisource.org/wiki/梅花易數/卷一` |
| 本轮用途 | 锚定年支、农历月日、时支取数，互卦取二三四/三四五爻，以及辰年十二月十七日申时的泽火革例 |
| 本轮结果 | 经典例题本卦、初爻动、互见乾巽和变泽山咸 5 项通过；确认旧 runtime 的公历近似不符合声明口径 |
| 字占边界 | 原典一字看楷书左右画，四至十字主要用平仄四声，十一字以上按字数；当前统一累加笔画法只能标为现代适配 |
| 解释边界 | 原典中的应验叙事和吉凶断语不作为现代事实预测证据 |

### SRC-DATA-UNIHAN-17

| 字段 | 值 |
|---|---|
| 名称 | Unicode 17.0.0 Unihan `kTotalStrokes` |
| 状态 | `candidate_reference` + source-pinned runtime data |
| 官方来源 | `https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip`；属性说明 `https://www.unicode.org/reports/tr38/` |
| 项目范围 | U+4E00-U+9FFF，共 20,992 个基本区汉字 |
| 生成方式 | `scripts/validation/generate-unihan-strokes.mjs` 从 `Unihan_IRGSources.txt` 机械生成 `src/modules/meihua/strokes-unihan-17.js` |
| 源文件 SHA256 | `d1c817dd7db84295dab0643c277d97c2fa742c245f8824e6736c2a0935095325` |
| 许可 | Unicode License v3；项目副本见 `database/licenses/UNICODE_LICENSE_V3.txt` |
| 本轮结果 | 20,992/20,992 条目存在且为正整数；已替换错误手抄表和码位估算 |
| 边界 | Unicode 将 `kTotalStrokes` 标为 informative；可作稳定现代数据口径，不代表唯一字形、书写或术数笔画标准 |

### SRC-VAL-YIJING-CORE

| 字段 | 值 |
|---|---|
| 名称 | 《周易》64 卦受文与结构验证组 |
| 状态 | `validation_anchor` + `normalized`；仅限经文与确定性结构 |
| 本地主文本 | `database/xuanxue/compendium-new/reference/64gua-yaoci-part1.md` 与 `part2.md`，64 卦、450 条 |
| 第二文本见证 | 中文维基文库《周易》64 子页 MediaWiki API 快照，路径 `database/sources/wikisource/zhouyi-64-mediawiki-2026-07-10.json` |
| 快照 SHA256 | `597f936ea2c0849b086b39c33077a1c09cbeb0ae68bb11042d25d2a5bd1743a6` |
| 差异裁决 | 中国哲学书电子化计划 `https://ctext.org/book-of-changes/zhs` 相应章节；12 卦定点抽核，不批量复制其语料 |
| 《说卦传》核对 | `https://ctext.org/book-of-changes/shuo-gua/zhs`，用于修正「震为雷…为旉」摘录 |
| 版本分歧研究 | `https://www.airitilibrary.com/Article/Detail?DocID=18133738-202108-202109100010-202109100010-24-44`，用于界定革卦已/巳/己之辨 |
| 规范化输出 | `database/yijing/zhouyi-core.json`；64 条，含卦序、经文、二进制、互错综、京房八宫与世应 |
| 审计结果 | 1,446 项检查 0 失败；19 处文本差异全部裁决；7 处经文、69 处卦变/八宫字段、3 处教学代码/摘录已修正 |
| 权利边界 | 《周易》受文为公版；维基文库转录与 MediaWiki 标记的复用仍受 Wikimedia/Wikisource 条款约束，页名与 page ID 已保留 |
| 边界 | 不授证关键词、简释、固定吉凶、预测或现实决策；革卦已/巳/己读法继续显式保留分歧 |

### SRC-VAL-WUYUN-CORE

| 字段 | 值 |
|---|---|
| 名称 | 五运六气基础年结构验证组 |
| 状态 | `source_pinned_full_finite_domain`；仅限当前产品展示的基础年结构 |
| 原典锚点 | `database/tcm/skill-v3/sources/黄帝内经素问.txt` 的天元纪、五运行、六微旨；`database/tcm/skill-v3/sources/医宗金鉴.txt` 的运气要诀 |
| 教材交叉 | `database/tcm/skill-v3/sources/《中医基础理论》.txt`；主/客运太少与六步推导 |
| 外部受文/解释 | `https://zh.wikisource.org/zh-hans/医宗金鉴/卷四`；北京市中医药对外交流信息网 2023-12-20 文章 |
| 规范化输出 | `database/wuyun/wuyun-basic-annual-core.json` |
| 规范 SHA256 | `b8263d070a86dacee81ab32b07f35216ca49ce4e9341b4ea3745e969230a2200` |
| 审计 artifact | `docs/validation/artifacts/wuyun-audit-2026-07-10.json`；3,325 项 0 fail |
| 修复 | 补主运太少；修正五运交司日标签、非法输入与六气全名显示 |
| 边界 | 任意时刻的运气年归属、古法交司时刻、平气/天符/岁会/胜复等派生层未实现；气候与医学预测 blocked |

### SRC-VAL-ZIWU-BASIC

| 字段 | 值 |
|---|---|
| 名称 | 子午基础时辰经脉对应验证组 |
| 状态 | `source_pinned_full_finite_domain`；仅限 12 时辰基础对应表 |
| 原典锚点 | `database/tcm/skill-v3/sources/针灸大成.txt` 第 392-393 行的十二经循环；第 389 行及心经章的“手少阴心经”；第 469-470 行的六十六穴范围 |
| 机构/出版交叉 | 中国针灸学会《针灸大成》介绍；上海科学技术出版社《子午流注针法》目录 |
| 规范化输出 | `database/ziwu/ziwu-basic-meridian-clock.json` |
| 规范 SHA256 | `23b32edaf2da8251f09559c197c22cdca98acc9acf8414e6ae16f7e8e4743f6b` |
| 审计 artifact | `docs/validation/artifacts/ziwu-audit-2026-07-10.json`；4,457 项 0 fail |
| 文本裁定 | 连续段“午时手太阴心经”与同书总表、心经章冲突，裁定为“手少阴心经”，冲突原样登记 |
| 边界 | 纳甲、纳子、井荥输经合开穴、灵龟八法、针刺补泻未实现；器官功能高峰、疾病归因和治疗时机 blocked |

## 4. 历史产品规格来源

这些文件位于 `SRC-PKG-XUAN-NEW`，是本次主 PRD 重建的主要历史证据。

| Source ID | 文件 | 证明的内容 | 当前状态 |
|---|---|---|---|
| SPEC-MASTER-OLD | `APP-SPEC.md` | 原本设想一个同时含占算、问诊、工具、教学和测验的大应用 | `historical_spec`；被 `docs/PRD.md` 重新整理 |
| SPEC-A | `APP-SPEC-A.md` | Product A 是独立排盘+AI 工具，不含教学与游戏 | `historical_spec`；当前代码大体实现并扩展 |
| SPEC-B | `APP-SPEC-B.md` | Product B 是独立修仙学堂，核心循环为学习、答题、灵力、渡劫与解锁 | `historical_spec`；尚未实现 |
| SPEC-GAME | `GAME-DESIGN.md` | 境界、灵力、成就、NPC、道侣、每日与长期叙事设计 | `historical_spec` + design asset；非首版硬需求 |
| SPEC-DIFFICULTY | `DIFFICULTY-MAP.md` | 各领域必修/进阶/专研映射 | `candidate_reference`；需要转为知识点级难度 |
| SPEC-FIRST | `CC-FIRST-TASK.md` | “先做六爻 MVP，不做教学游戏”的阶段切分 | `historical_spec`；解释当前 repo 为什么先长成 Product A |
| SPEC-XIANGSHU | `CC-TASK-XIANGSHU.md` | 面相/手相的本地 ML + 结构化文本路线 | `historical_spec` + current lineage evidence |

自 2026-07-09 起，未来产品范围以 `docs/PRD.md` 为主；以上文件继续保存历史意图和未吸收设计，不再各自充当当前 PRD。

## 5. 玄学主要内容组

| Source Group ID | 路径 | 内容 | 候选用途 | 已知限制 |
|---|---|---|---|---|
| XUAN-COSMO | `00-cosmology/` | 阴阳、五行、干支、八卦、64 卦 | P1 基础课程、实体与关系 | 需拆成原子知识点并补逐条来源 |
| XUAN-YIJING | `01-yijing/` | 卦名卦序、卦爻辞、解卦、卦变 | 64 卦查询、易经课程、题目 | 经文/结构已抽入规范核心库；关键词、简释和预测解释继续 blocked |
| XUAN-LIUYAO | `02-liuyao/` | 起卦、装卦、用神、技法、断卦、案例、口诀 | 六爻课程、实战复盘、Prompt 审计 | 规则、口诀、案例需标适用条件和来源 |
| XUAN-MEIHUA | `03-meihua/` | 起卦、体用、取象、案例 | 梅花课程与案例练习 | 已修复一处变卦例题；现代笔画法与原典字占须分开；外应和取象保持主观解释标签 |
| XUAN-BAZI | `04-bazi/` | 排盘、十神、格局、案例 | 八字课程、引擎数据审计 | 日柱/节气算法含近似风险 |
| XUAN-ZIWEI | `05-ziwei/` | 十二宫、星曜、格局、飞化、断语 | 紫微课程、星曜实体、Prompt 审计 | 确定性结构已规范化；格局、星性、疾病、婚财与应期断语仍 blocked；两个主星详解文件不能互证 |
| XUAN-QIMEN | `06-qimen/` | 四盘、值符值使、九星八门、案例 | 奇门课程、盘面解释 | 确定性算法已按声明口径修正并规范化；格局、用神、克应和预测解释仍 blocked |
| XUAN-FENGSHUI | `07-fengshui/` | 飞星、形煞、罗盘、二十四山 | 风水课程、当前工具审计 | 下卦正向盘确定性核心已修正并规范化；替卦/兼向、星性、形煞、化解和现实预测 blocked |
| XUAN-TCM | `08-zhongyi/` | 藏象、经络子午、五运六气、食疗体质、经方 | 当前 TCM 模块来源追踪；与 TCM Skill 互补 | 覆盖浅；不能替代 Skill 的诊断/安全层 |
| XUAN-NAMING | `09-xingming/` | 五格、81 数理、三才 | 姓名工具候选 | 笔画数据、争议性和许可需核 |
| XUAN-XIANGSHU | `10-xiangshu/` | 面相、手相 | 当前 Face/Palm 数据映射 | 不与望诊或医学证据混同 |
| XUAN-REFERENCE | `reference/` | 算法、查表、测试、六壬、择日、64 卦搜索、术语 | 引擎审计、工具候选、fixture | 多个文件有简化/待验证声明 |

## 6. 中医主要内容组

| Source Group ID | 路径 | 内容 | 候选用途 | 边界 |
|---|---|---|---|---|
| TCM-INDEX | `references/00-证型直达选方总索引.md` | 证型、病种、针灸、经典路由 | 建立跨实体关系与检索路由 | 只用于路由，权威依据仍来自被指向条目 |
| TCM-THEORY | `references/01-08*` | 基础理论、脏象、气血津液、病因病机、治则、经络体质 | 完整 blocked inventory、理论实体、课程候选 | 传统构造不得外推为现代解剖、生理、病因、预防或剂量事实 |
| TCM-DIAGNOSIS | `references/09-14*` | 四诊、舌脉、八纲、脏腑、六经等辨证 | 完整 blocked inventory、observation/pattern 候选 | 诊断一致性有限；文字/图像、舌脉和证候表不能作为临床答案键 |
| TCM-HERBS | `references/15-23*` | 1,331 条非空行、45 表/279 表格行；中药分类、病证反查、剂量与注意 | 完整 blocked inventory、当前茶饮与药味审计 | 663 条风险视图和 20 finding 已裁决；反查实有 100 条而非 103，且有两处逆序；逐味现行药典仍未完成 |
| TCM-FORMULAS | `references/24-30*` | 820 条非空行、8 表/171 表格行、186 个格式化定义、180 个显式附方实体、方义、类方、使用注意 | 完整 blocked inventory、方剂定义/计数与重点风险审计 | 182 个教材正方加 4 个经典锚点；附方声明 182、显式实体 180且第 25 分册缺 2；不直接荐方 |
| TCM-DISEASES | `references/31-37*` | 52 个主病种、689 条非空行、22 表/133 表格行 | 病种、证型、鉴别、红线、调护候选 | 红线已做首轮现代 comparator；全部治疗字段 blocked，不替代现代医学诊断 |
| TCM-ACUPOINTS | `references/38-41*` | 763 条非空行、27 表/471 表格行；361 经穴、40 奇穴、定位、27 病证配穴、外治分级 | 全原文 inventory、穴位/外治候选和来源差异审计 | 官方仅授证现行 362/51 范围；逐名为二级转录，定位、疗效及家庭操作全部 blocked |
| TCM-CLASSICS | `references/42-45*` | 素问、灵枢、难经、伤寒、金匮要义与条文 | 经典出处、课程与解释 | 492 段显式引文首轮来源裁决完成；古方剂量不进入现代用药依据 |
| TCM-WENBING-AUTHORS | `references/46-48*` | 医学心悟、温病三书、衷中参西录 | 医家观点、温病与历史课程 | ref46-48 共 978 段显式引文首轮完成、待人工均为 0；医家观点和时代内容不覆盖教材安全层 |
| TCM-SAFETY | `references/安全-配伍妊娠禁忌与毒性药.md` | 配伍、妊娠、毒性、马兜铃酸、方剂级警示、忌口 | 第一批规范化；所有涉药消费硬门槛 | 仍需现行标准和项目复核 |
| TCM-SAFETY-CORE | `database/tcm/normalized/tcm-safety-core.json` | 28 项法定毒性中药 blocklist、来源和产品资格 | 当前唯一 accepted 的中医规范安全切片 | 不含药典剂量、妊娠、配伍、方剂或穴位授证 |
| TCM-PHARM-CANDIDATES | `database/tcm/normalized/tcm-pharmacopoeia-candidates.json` | 100 行/101 味原始剂量、2025 目录身份、2020 历史正文对照、名称裁决和急救标记 | 全量可审计候选层 | 101 味全部 blocked；不是 accepted 剂量库 |
| TCM-PREG-COMPAT-FORMULA-CANDIDATES | `database/tcm/normalized/tcm-pregnancy-compatibility-formula-candidates.json` | 妊娠表与剂量表、十八反十九畏、马兜铃酸监管药名、31 行/37 方名警示及逐条冲突 | 全量可审计候选层 | 所有记录 blocked；2020 历史支持不等于现行 product eligibility |
| TCM-ACUPOINT-EXTERNAL-CANDIDATES | `database/tcm/normalized/tcm-acupoint-external-safety-candidates.json` | 361 经穴、40 奇穴、3 级操作声明、240 条风险/操作、27 病证处方和 30 个旧运行时穴位映射 | 全量可审计候选层 | 名称/数量目录核对不授证定位或疗效；全部记录 blocked |
| TCM-DISEASE-RED-FLAG-CANDIDATES | `database/tcm/normalized/tcm-disease-red-flag-candidates.json` | `31-37` 的 52 病种、完整原文 inventory、83 条关键词风险、308 条广义处置候选和 20 个重点裁决 | 红线/家庭动作可审计候选层 | 两个筛选视图不代表完整临床语义；9 条支持红线不授证相邻治疗；所有记录 blocked |
| TCM-THEORY-DIAGNOSIS-CANDIDATES | `database/tcm/normalized/tcm-theory-diagnosis-candidates.json` | `01-14` 的完整原文 inventory、124 标题、127 条优先视图和 14 个重点裁决 | 传统框架/现代外推可审计候选层 | 原文无页码级教材引证；所有记录 blocked，不能作为临床答案键 |
| TCM-HERB-CATALOG-CANDIDATES | `database/tcm/normalized/tcm-herb-catalog-candidates.json` | `15-23` 完整原文 inventory、663 条风险视图、100 条病证反查和 20 个重点裁决 | 中药剂量/毒性/现代疗效与反查风险可审计候选层 | 风险视图类别重叠且不是完整实体授证；所有记录 blocked |
| TCM-FORMULA-CATALOG-CANDIDATES | `database/tcm/normalized/tcm-formula-catalog-candidates.json` | `24-30` 完整原文 inventory、186 个格式化定义、180 个显式附方实体、522 条重叠窄风险视图和 21 个重点裁决 | 方剂身份/计数、剂量、禁忌、毒性、急症与现代疗效风险可审计候选层 | 附方声明 182、显式实体 180且第 25 分册缺 2；所有记录 blocked |
| TCM-CLASSICS-FOOD-CANDIDATES | `database/tcm/normalized/tcm-classics-food-candidates.json` | `42-48` 完整原文 inventory、603 条重叠窄风险视图、20 个重点裁决和旧食疗 runtime 状态 | 经典/医家、食药身份、剂量、禁忌、急症与疾病替代风险候选层 | A/B/食疗/药食标签不授予资格；所有记录 blocked |
| TCM-CLASSIC-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-quote-adjudications.json` | `42-经典-素问要义.md` 的 111 段显式引文与本地《黄帝内经素问》逐段文本比对 | 经典引文连续/省略分段命中、人工形态裁决与 normalized 修正记录 | 83 段机械定位、28 段人工裁决、0 段待人工、1 条拼接误引覆盖校正；Skill 原包保持原哈希；文本命中不授证解释、医学等价或产品用途 |
| TCM-CLASSIC-REF43-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-ref43-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-ref43-quote-adjudications.json` | `43-经典-灵枢与难经要义.md` 的 98 段显式引文与本地《灵枢》《难经》《素问》逐段文本比对 | 连续/省略分段命中、跨书识别、人工形态裁决、公共转录校勘与倪海厦页卡二手定位 | 75 段机械定位、23 段人工裁决、0 段待人工；3 条《素问》跨书引文、3 处本地转录差异；所有记录 blocked，不授证解释或现代用法 |
| TCM-LINGSHU-NANJING-PUBLIC-WITNESSES | `database/sources/ctext/tcm-lingshu-nanjing-witnesses-2026-07-18.json` | CText《灵枢·经脉》《师传》、CText《难经》入口、Wikisource《灵枢》第三卷与《八十一难经》 | “问/间”“候/侯”“太阴/太阳”三处字符级校勘；固定 URL、抓取响应字节数与 SHA256 | 公共转录本不是已识别版本影印；动态网页重抓哈希可能变化，只作校勘见证 |
| TCM-CLASSIC-REF44-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-ref44-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-ref44-quote-adjudications.json` | `44-经典-伤寒论六经方证条文.md` 的 170 段显式引文与本地《伤寒论》《金匮要略》及三部声明互参典籍逐段比对 | 连续/省略分段命中、复本见证、跨书互参、后世评语归属、人工形态裁决与倪海厦二手定位 | 154 段机械定位、16 段人工裁决、0 段待人工；9 条《金匮》复本、4 条声明互参、0 来源错配；全部 blocked |
| TCM-SHANGHAN-PUBLIC-WITNESSES | `database/sources/ctext/tcm-shanghan-public-witnesses-2026-07-18.json` | CText 宋本《伤寒论》、Wikisource《伤寒论》《伤寒附翼》 | “几几”OCR 校正、“而解/解也”转录异文、`群方之魁` 后世评语归属；固定 URL、抓取响应字节数与 SHA256 | 公共转录本不是版本级影印；《伤寒附翼》只证明后世评语归属，不证明它属于《伤寒论》正文 |
| TCM-CLASSIC-REF45-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-ref45-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-ref45-quote-adjudications.json` | `45-经典-金匮要略杂病方证条文.md` 的 113 段显式引文与本地《金匮要略》《伤寒论》及《素问》逐段比对 | 连续/省略分段命中、复本见证、外部经典用语、人工形态裁决、公共转录校勘与倪海厦二手定位 | 96 段机械定位、17 段人工裁决、0 段待人工；4 条《伤寒》复本、1 条《素问》用语、0 来源错配；全部 blocked |
| TCM-JINGUI-PUBLIC-WITNESSES | `database/sources/ctext/tcm-jingui-public-witnesses-2026-07-18.json` | CText《金匮》第七、二十、二十一篇及 Wikisource 全本 | “大逆/火逆”“㽲/A2K0”“膀胱/膀肽”三组字符级校勘；固定 URL、抓取响应字节数与 SHA256 | 公共转录本不是版本级影印；只作字符校勘，不授证方证解释、剂量、疗效或现实使用 |
| TCM-CLASSIC-REF46-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-ref46-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-ref46-quote-adjudications.json` | `46-医家-医学心悟要义.md` 的 357 段显式引文与本地《医学心悟》及相关经典逐段比对 | 连续/省略分段命中、95 条冻结近似段落定位、22 条特殊裁决、公共底本校勘、现代编辑语和外部经典用语分层 | 240 段机械定位、117 段人工裁决、0 段待人工；2 条参考文字修正、15 条现代编辑语、1 条《伤寒论》用语；全部 blocked |
| TCM-YIXUEXINWU-PUBLIC-WITNESSES | `database/sources/ctext/tcm-yixuexinwu-public-witnesses-2026-07-18.json` | CText《医学心悟》版本元数据、Wikisource 全本与中醫笈成清经纶堂本整理文本 | “擀/捋”、十中之一二/什一、冷饮食/冷冻饮料食、耆/芪及缺字传播校勘；固定 URL、响应字节数与 SHA256 | 中醫笈成为绑定可识别扫描本的编辑转录，不是逐字影印转录；公共转录重复错误不算独立多数证据 |
| TCM-CLASSIC-REF47-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-ref47-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-ref47-quote-adjudications.json` | `47-温病-卫气营血三焦方证条文.md` 的 365 段显式引文与《温热论》《湿热病篇》《温病条辨》《温热经纬》及《素问》逐段比对 | 版本异文、复合传承文本、后世按语/具名转引、现代编辑语、转码占位符和参考稿错误分层 | 278 段机械定位、87 段非连续命中人工定位，另有 13 段机械命中兼特殊归属裁决；0 待人工、2 条参考修正、全部 blocked |
| TCM-WENBING-PUBLIC-WITNESSES | `database/sources/ctext/tcm-wenbing-public-witnesses-2026-07-18.json` | 中醫笈成绑定扫描本的《温热论》《温热经纬》《温病条辨》整理文本；Wikisource《温热论》《湿热条辨》；CText《温病条辨》版本入口 | “出口”“津与汗”、肺经气分、撑不死、䐜/㿗/䗪/𤺏及按语边界校勘；固定 URL、响应字节数与 SHA256 | 公共转录不构成无争议定本；稀见字仍是所选版本读法，所有现实使用字段 blocked |
| TCM-CLASSIC-REF48-QUOTE-PROVENANCE | `database/tcm/normalized/tcm-classic-ref48-quote-provenance.json`；`database/tcm/adjudications/tcm-classic-ref48-quote-adjudications.json` | `48-医家-衷中参西录要义.md` 的 256 段显式引文与《医学衷中参西录》及六部嵌套经典逐段比对 | 原文、经典转引、后世具名评论、现代编辑语、OCR 缺字和参考稿缩写分层 | 149 段机械定位、107 段人工形态裁决，另有 13 段机械命中兼特殊归属裁决；0 待人工、3 条参考修正、全部 blocked |
| TCM-YIXUEZHONGZHONG-PUBLIC-WITNESSES | `database/sources/ctext/tcm-yixuezhongzhong-public-witnesses-2026-07-18.json` | 中醫笈成所标河北人民出版社 1977 年 2 版整理文本、Wikisource 全本、CText 版本缺失入口、宣统元年铅印本书目线索 | 闟辟、脉搏力减而谵语益甚、若用开破之药开之三组校勘；固定 URL、响应字节数与 SHA256 | 1977 本仍是编辑转录；Wikisource 与本地为同一错误链；CText 与书目页不裁决字符；现实使用字段全部 blocked |
| TCM-FOOD-MEDICINE-ADJUDICATIONS | `database/tcm/normalized/tcm-food-medicine-adjudications.json` | 106 项目录、Skill A 清单 15 项、8 条食疗/药食配方和 38 个原料引用 | 食品身份、部位/炮制缺口和配方继承裁决 | 目录身份已固定；全部具体产品用法 blocked |
| TCM-VALIDATION-SOURCES | `database/tcm/sources/` | 药典/监管 5 份；穴位/外治 3 份；病种红线、理论诊断、中药、方剂、经典/食疗 comparator、106 项食药目录各 1 份，共 14 个文件 | 重建候选层和复核来源漂移 | 历史/二手 comparator 不覆盖官方现行来源；各快照的证据边界单独记录 |
| TCM-NIHAIXIA-CANDIDATE | `database/sources/external/nihaixia-skill-v2.1.0-2026-07-18.json` | 倪海厦 Skill 固定 commit、仓库规模、自述覆盖、许可冲突、原始见证断点和吸收边界 | 发现倪派资料可能覆盖的数据库缺口并寻找一手来源 | 仅元数据；不复制正文，不充当原典、accepted 主张或运行时来源 |
| TCM-NIHAISHA-NISHI-CANDIDATE | `database/sources/external/nihaisha-nishi-tcm-2026-07-18.json` | 3,094 文件固定树、2,986 张截图、22 文献/10,538 页卡、四部经典定位信号、51 条勘误交叉检查与许可边界 | 为灵枢、难经、伤寒、金匮逐条校勘提供页级定位和异文警报 | 只吸收转换后的元数据与验证路由；无标准开源许可、无原 PDF/版本哈希，不复制正文或自动改库 |
| TCM-RUNTIME-LEGACY | `database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json` | 旧 34 题、28 药物标签、22 计量项、30 去重穴位和风险动作 | 可逆审计与逐项复核 | `removed_pending_review`，不是候选处方或操作建议 |
| CENTRAL-SOURCE-LIBRARY | `database/sources/source-library.json` | 11 个来源组、272 个文件的角色、canonical 路径、字节数、SHA256 与镜像关系 | 全项目统一参考文献和典籍入口 | 索引完整不授证内容正确性；正文不复制，迁移必须保留兼容映射 |
| TCM-ORIGINALS | `sources/` | 42 个原文 txt 与整理状态 | 引用核对、缺口研读、争议追溯 | 已整理/未整理必须分别标；现代教材可能有独立权利 |

## 7. 当前 Runtime 来源组

| Source Group ID | 路径 | 作用 | 后续处理 |
|---|---|---|---|
| APP-ENGINES | `src/modules/*/engine.js` | 当前排盘、评分、分析计算事实 | 建立 algorithm_version、输入输出和 fixture 映射 |
| APP-DATA | `src/modules/*/data.js`、`src/lib/tcm-data.js` | 当前产品实际消费的查表与文案 | 逐项回指 source_ref；与候选源冲突时记录差异 |
| APP-PROMPTS | `src/modules/*/prompt.js` | 当前 AI 解释规则与输出结构 | 拆分知识事实、角色语气、安全指令和格式要求 |
| APP-UI | `src/modules/*/*Module.jsx` | 当前用户流程和信息展示 | 只证明产品行为，不作为知识来源 |
| APP-ACCOUNT-HISTORY | `server/`、`src/lib/history.js` | 当前账户、保存和历史结构 | 为学习档案与实战事件复用，不进入知识库 |

## 8. Canonical 关系

| 决策对象 | 当前 canonical | 对照/补充 | 规则 |
|---|---|---|---|
| 当前产品定义 | `docs/PRD.md` | 历史 `APP-SPEC*` 与 `GAME-DESIGN.md` | 旧规格提供证据和设计资产，不覆盖新 PRD 决策 |
| 玄学 raw source | `compendium-new/` | `compendium-vision-api/` | 重复内容不双重计票；只记录实质差异 |
| 相术规范知识 | `database/xiangshu/` 中逐条 source-pinned core | `compendium-new/10-xiangshu/` 与当前 runtime | compendium 保留 raw；有典籍见证的传统判断可进入文化层，无出处或冲突扩写保持候选/blocked |
| 中医候选 reference | `tcm/skill-v3/references/` | `compendium-new/08-zhongyi/`、当前 app legacy、原文 `sources/`、医经/本草/方书、药典/监管与 106 项食药目录快照；倪海厦 Skill 仅作 metadata-only 缺口发现来源 | Skill 补广度；传统内容由典籍与版本见证授证，现代药典/监管只授证现行身份、安全和使用边界；外部学派整理稿不能越过许可与逐条溯源门槛 |
| 当前产品行为 | 当前 `src/` 与 `server/` | CHANGELOG 与历史规格 | 代码证明“现在怎么工作”，测试证明到什么程度 |
| 实战证据候选 schema | `database/learning/practice-evidence-schema-candidate.json` | `xuanxue-database-skill` 三库模型与天机卷 PRD 的工具/掌握度闭环 | 外部模型提供结构灵感；天机卷版本强制分离典籍权威、个人观察与 KP 掌握度，当前不授予 runtime 资格 |
| 未来规范数据库 | 逐域建立；周易、紫微、奇门、风水、五运、子午、TCM 安全与共享城市已有规范核心 | 所有 raw/runtime 来源 | 不允许把某个 raw package 目录直接改名为 canonical database；每域要通过裁决和证据 gate |

## 9. 条目级溯源合同

未来每个规范化条目至少记录：

```yaml
id: stable-domain-id
domain: liuyao
type: rule
content: 规范化正文或结构化字段
source_refs:
  - source_id: XUAN-LIUYAO
    file: 02-liuyao/03-yongshen.md
    locator: heading-or-line-anchor
    relation: supports | supplements | conflicts | derived_from
source_type: classical_text_witness | later_commentary | modern_textbook | regulatory | runtime_legacy
original_text: 见证原文
normalized_claim: 与原文分开的现代整理
attribution_status: established | traditional | disputed | unresolved
witness_status: scan_verified | transcription_located | scan_crosscheck_pending
review_status: raw | normalized | reviewed | accepted | deprecated
review_basis: 校勘依据与决定
license_status: known | restricted | unknown
product_eligibility: internal_only | learning | runtime | blocked
version: 1
```

中医条目还必须增加：

```yaml
safety_level: A | A- | B | C | not_applicable
contraindications: []
pregnancy: none | caution | prohibited | unknown
toxicity: none_known | toxic | highly_toxic | unknown
dose_source: textbook | pharmacopoeia | classical_text | not_applicable
red_flags: []
escalation: self_care | clinician | urgent | emergency
```

`accepted` 只表示按项目预定流程通过，不表示跨流派、跨版本或医学上的绝对真理。

## 10. 冲突处理

1. 不修改 raw source 来消灭冲突。
2. 同一事实出现不同说法时，保留多条 source_ref 和 `conflicts` 关系。
3. 计算算法以回归用例、清晰派别和版本记录决定采用项。
4. 中医古籍原文完整保存在文化知识层；现代用量、毒性、禁忌和现实使用资格不从古籍直接继承，另接药典、监管和现代安全证据。
5. 当前代码与来源不一致时，分别记录“运行时现状”和“候选修正”，不静默覆盖。
6. `vision-api` 副本与 canonical 相同的内容只计一次来源，避免制造虚假的交叉印证。

## 11. 完整性、正确性与许可的分离

- SHA256 通过：证明导入副本在本地未意外变化。
- 文件盘点完成：证明知道有什么文件。
- 来源链建立：证明条目从哪里来。
- 校勘完成：证明按某套规则核过内容。
- Product eligible：证明当前许可、安全和场景允许消费。

五个状态不能互相替代。候选来源无需先达到生产数据库标准；内容数量也不能让来源自动取得 accepted 或 product-eligible 状态。

## 12. 下一步

1. 共享城市与民用时区当前 374 城市域已通过；若扩大为任意坐标或固定 tzdb 版本，另建来源快照和 validation 单元。
2. 以医经、本草、方书和医家版本为核心，逐方、逐药、逐理论条目建立原文见证；现行药典、逐穴正文和监管资料作为现代边界层并行核验。
3. 相术两份 Markdown 的 386 条非空行已逐行分类完成：100 条结构、286 条裁决、0 条无人裁决；7 个来源记录、37 段摘录、45 条条目和 41 条旧文裁决共 534 项 0 fail。下一步对 accepted 主张做 CText/识典与影印页逐条复核，并独立验证真实图片视觉测量。
4. 定义跨域 normalized schema、流派/口径字段和 review 状态机；现有逐域 core 不等于统一知识数据库已经完成。
5. 在继续全库验证的同时，按 fresh PRD review 单独收敛首个教学切片的最小数据合同和工具闭环，避免把无界审计永久设为产品总闸。
