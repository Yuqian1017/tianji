# 中医穴位与外治安全全量验证报告

日期：2026-07-10

范围：中医 Skill v3 的 `38-41` 针灸 reference、361 条经穴、40 条本地奇穴、3 级外治操作标签、27 组病证配穴、240 条操作/风险声明，以及已从产品移除的 30 个运行时穴位。外部对照包括现行 GB/T 12346-2021、GB/T 40997-2021、WHO 穴位名称与定位标准、WHO 针灸/推拿执业安全基准、FDA P6 止吐按压设备审查、Cochrane 胎位不正艾灸综述和艾灸不良事件综述。

结论：`pass_with_all_candidates_blocked`。4,904 项自动审计 0 失败；`38-41` 的 763 条非空原文行、27 张 Markdown 表和 471 个表格数据行已完整进入 blocked inventory，所有高风险候选均被阻断，84 个运行时/邻接文本消费者没有绕过 gate。它不表示每一行已完成语义/临床核验，也不表示 401 条定位、病证疗效或家庭操作已经获得临床授证。

## 结果摘要

| 层 | 规模 | 核验结果 |
|---|---:|---|
| 原文完整 inventory | 763 行 / 27 表 / 471 表格行 | 每条精确保留并 blocked；关键词风险索引不再承担全量覆盖 |
| 十四经穴 Skill 表 | 361 条 | 官方现行范围为 362；二级转录候选提示缺 `GV29 印堂` |
| 经穴名称 | 361 条 | 与固定二级转录比对为 358 条一致、3 条不同；不是官方逐名核验 |
| 经外奇穴 Skill 表 | 40 条 | 官方现行范围为 51；与固定二级转录比对为 34 条匹配、缺 17 条、另有 6 条未匹配 |
| 奇穴身份异常 | 2 条 | `膝眼` 混合内膝眼与犊鼻/外膝眼；`落枕穴` 与 `外劳宫` 定位重复 |
| 穴位定位 | 401 条 | 全部 blocked；确认 `GB31 风市` 仍写旧版腘横纹上 7 寸，现行为 9 寸 |
| 外治安全分级 | 3 级 | Skill 的 A/A-/B 标签全部只保留为 source claim，不转成产品资格 |
| 操作/风险声明 | 240 条 | 全量候选化；全部 blocked |
| 病证配穴 | 27 组 | 全部保留；针刺处方向家庭按压/艾灸的跨模态转换无独立证据，全部 blocked |
| 历史运行时穴位 | 30 个 | 全部映射到审计实体；没有恢复任何操作建议 |
| 运行时旁路 | 84 个文本文件 | 未导入候选 core、finding ID 或恢复被阻断操作 |

## 穴位目录核对

### 经穴

国家标准全文公开系统确认 GB/T 12346-2021 现行，范围为 362 个经穴。Skill 与 WHO 2008 均为 361 穴；固定二级转录候选用 `GV29 印堂` 补足 362 项，但项目内没有可合法复现的官方逐名目录，因此该名称差异只作为 blocked candidate，不作为官方逐名裁决。

与固定二级转录的 3 个名称差异：

| 编码 | Skill | 二级转录候选 | 裁决 |
|---|---|---|---|
| BL45 | 譩嘻 | 譩譆 | 待官方逐名证据；blocked |
| TE11 | 清冷渊 | 清泠渊 | 待官方逐名证据；blocked |
| TE18 | 瘛脉 | 瘈脉 | 待官方逐名证据；blocked |

### 经外奇穴

国家标准全文公开系统确认 GB/T 40997-2021 现行，范围为 51 个常用经外奇穴。Skill 的 40 条中有 34 条可与固定二级转录匹配。

相对于二级转录候选缺少的 17 条名称：当阳、聚泉、海泉、颈百劳、新设、血压点、提托、接脊、痞根、腰宜、中泉、大骨空、小骨空、髋骨、里内庭、独阴、气端。

Skill 中未匹配二级 51 名转录的 6 条：上明、夹承浆、三角灸、腰奇、落枕穴、环中。“未匹配转录”不等于传统资料中不存在，也不能反向宣称它们不在官方目录；在官方逐名证据可复现前只保留差异候选。

`膝眼` 一行同时描述内膝眼和外膝眼，但外膝眼对应十四经穴 `ST35 犊鼻`，不能作为一个经外奇穴身份合并。`落枕穴` 与 `外劳宫` 使用相同定位，需在后续版本/别名研究中裁决，当前均 blocked。

## 定位边界

本轮完整保存了 Skill 的 401 条定位文字，但项目没有镜像现行中国标准的完整定位正文。因此不能把“名称和数量目录核对通过”写成“逐穴定位已核验通过”。

已确认一条现行冲突：

- `GB31 风市`：Skill 为“大腿外侧中线，腘横纹上 7 寸；简便：直立垂手中指尖处”。GB/T 12346-2021 已改为腘横纹上 9 寸，并使用髂胫束区域的解剖定位语境。该条标为 `source_error_confirmed`。

其余 400 条没有因暂未发现冲突而获准进入产品。全部定位字段继续 `productEligibility=blocked`，等待合法取得的现行逐穴正文或其他同等级可复核依据。

## 外治安全结论

### 全局 A 级按压/自我按摩不成立

Skill 把所有穴位按压和自我按摩统一列为“零门槛直接建议”。WHO 的推拿执业基准要求知情同意、个体筛查、禁忌判断和损伤处理；FDA 的低风险审查只覆盖 P6 腕部止吐按压设备，不能外推到所有穴位、病证、力度、时长或孕妇场景。因此全局 A 级不进入 normalized 产品资格。

### 艾灸家庭方案继续 blocked

WHO 安全资料明确要求防止灼伤，并对感觉/循环障碍、皮肤病和瘢痕灸提出额外约束。系统综述记录了灼伤、过敏、感染、呼吸道反应和胎儿相关伤害等案例；这些案例不能估计发生率，但足以否定“无条件低风险”。

胎位不正条目给出每日 1-2 次、每次 15-20 分钟、直至转正并声称 80% 以上成功率。Cochrane 综述提示艾灸加常规护理可能减少分娩时非头位，但多项产科结局和不良事件仍不确定，不能支持固定 80% 成功率或不受监督的家庭持续操作。该条作为产科干预保持 blocked。

### 针刺处方不能自动改成家庭按压/艾灸

27 组病证章节把教材针刺处方全局转换为“家庭按压或艾灸”。不同操作方式的剂量、风险和证据不能互相替代，因此 27 组转换全部标为 `unsupported_cross_modality_conversion`。其中包含中风、中暑、痫证、阑尾炎、哮喘和妊娠胎位等急症或高风险场景，不能生成家庭处置建议。

### 晕针处置存在来源冲突

Skill 在强刺激后晕厥处置中增加温糖水和穴位按压。WHO 当前事件处理基准强调停止操作、适当体位、评估并按需转诊；本轮来源不能支持把糖水/按穴当作通用急救步骤，因此整段家庭急救扩展 blocked。

### 专业针刺边界仅方向性支持

WHO 对消毒、进针角度/深度、孕妇禁区、凝血障碍、癫痫、重要器官邻近危险区和针刺事故处理的要求，支持“禁止自行针刺”的方向。但这不授予 Skill 中任何具体针刺、刺血、穴位注射、拔罐或直接灸操作产品资格；程序性文字仍全部 blocked。

## 数据与可重复入口

- 规范候选：`database/tcm/normalized/tcm-acupoint-external-safety-candidates.json`
  - SHA256：`5d939a5135c4ab9bf6eadfad4840201da2283105c5ea50c085f794f85cb71ef7`
- WHO 2008 名称索引：`database/tcm/sources/who2008-acupoint-name-index.json`
  - SHA256：`15efb2be8f1208028554a9bbb26733b96347dba573cb3e58677dcb176dbd9a67`
  - WHO PDF SHA256：`c9d4095383c636f85e61b5bc5d7631a658308c0336e8f691b0eb29f517d5bf5b`
- 现行中国标准目录快照：`database/tcm/sources/cn2021-acupoint-standard-catalog.json`
  - SHA256：`b121d0a3d34bb48f8ed9a3b5d850cb5b65c78a76c493e2cb9affcd4558f53a38`
- 外治安全证据摘录：`database/tcm/sources/external-treatment-safety-evidence.json`
  - SHA256：`461c23d704bd490910fedb44b1cda123f9d34a382ff8863e6954fb512921ee94`
- 审计 artifact：`docs/validation/artifacts/tcm-acupoint-external-safety-audit-2026-07-10.json`
  - SHA256：`37f2118ef580b7448bed24685378a4238ba4d2eff71f5478a62f03abcea80c5e`

结构化逐名候选由 MIT 许可的 `luthepath/TCM-Input-Method` 固定 commit `1a0bc95d3e15f01d1d7be8293ca8deac40ab058f` 辅助转录；它不是权威来源。只有标准现行状态和 362/51 范围数量由国家标准全文公开系统授证；逐名差异均标为 `secondary_transcription_candidate_not_officially_reproducible_in_repo`。WHO 2008 是历史/国际 primary comparator。

## 可重复命令

```bash
WHO_ACUPOINT_PDF=/path/to/who.pdf WHO_ACUPOINT_TEXT=/path/to/who.txt npm run source:tcm-acupoints:who2008
CN_MERIDIAN_TRANSCRIPTION=/path/to/meridian.yaml CN_EXTRA_TRANSCRIPTION=/path/to/extra.yaml npm run source:tcm-acupoints:cn2021
npm run audit:tcm-acupoint-external-safety
node --test test/tcm/tcm-acupoint-external-safety-*.test.mjs
```

## 主要来源

- [国家标准全文公开系统：GB/T 12346-2021 经穴名称与定位](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=397548AE7248D3D87DD15E0AB8107185)
- [国家标准全文公开系统：GB/T 40997-2021 经外奇穴名称与定位](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=D2AEF8AD07C0150E19859079579EF99F)
- [WHO Standard Acupuncture Point Locations in the Western Pacific Region](https://iris.who.int/items/f188654a-d8a7-4519-9979-8e2de713c060)
- [WHO benchmarks for the practice of acupuncture](https://www.who.int/publications/i/item/978-92-4-001688-0)
- [WHO benchmarks for the practice of tuina](https://iris.who.int/server/api/core/bitstreams/ba223703-8c4d-4db8-9695-bece3fc7bfba/content)
- [FDA: Acupressure devices for nausea](https://www.fda.gov/media/149637/download)
- [Cochrane: Moxibustion for turning a baby in breech position](https://www.cochrane.org/evidence/CD003928_moxibustion-turning-baby-breech-position)
- [Safety of Moxibustion: A Systematic Review of Case Reports](https://pmc.ncbi.nlm.nih.gov/articles/PMC4058265/)

## 下一验证批次

1. 进入 `31-37` 病种层，先抽取全部病种、红旗征象、急症/转诊边界和家庭处置文字；红线与治疗建议分开验证。
2. 建立现代医学急症/红旗 comparator，优先核验胸痛、卒中、中暑、癫痫、急腹症、呼吸困难、出血和妊娠相关场景。
3. 在合法取得现行逐穴定位正文前，401 条定位和所有穴位操作继续 blocked；不得只凭名称目录通过而恢复消费。
