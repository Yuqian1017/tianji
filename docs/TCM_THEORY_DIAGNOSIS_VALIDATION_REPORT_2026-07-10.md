# 中医基础理论、四诊与辨证验证报告

日期：2026-07-10

范围：中医 Skill v3 `01-14`；14 个 reference、836 条非空原文、31 张 Markdown 表、157 个表格数据行、124 个二/三级标题，以及 127 条诊断、预防、治疗、剂量、预后或现代外推优先候选。

结论：`pass_with_all_candidates_blocked`。5,064 项自动审计 0 失败，证明完整原文 inventory、来源哈希、优先视图、14 个重点裁决和 84 个运行时/相邻文件阻断可重复。原文是 Skill 对教材和经典的二次整理，没有页码级教材引证；因此本次通过不等于逐句内容正确，更不等于现代医学授证。

## 结果摘要

| 层 | 规模 | 结果 |
|---|---:|---|
| 基础理论 `01-08` | 67 个二/三级标题 | 作为传统体系候选保留；不得改写成现代解剖、生理或因果事实 |
| 四诊辨证 `09-14` | 57 个二/三级标题 | 作为传统诊断框架候选保留；不得作为单独诊断、预后或治疗答案 |
| 完整原文 | 836 行 / 31 表 / 157 表格行 | 逐行精确保留并 blocked；不是逐句医学正确性通过 |
| 优先复核视图 | 127 行 | 只用于定位诊断/治疗/预后外推，不代表完整临床语义面 |
| 人工裁决 | 14 | 全部 blocked；见下文 |
| 运行时旁路 | 84 个文本文件 | 未导入候选 core 或 finding ID |

## 主要裁决

### 1. 传统脏腑、气血、经络不是现代解剖等价物

`心主血脉、藏神`、`肺通调水道`、`肾藏精`、经络联系脏腑等内容可以作为有明确归属的传统概念教学，但不能被产品翻译成现代器官功能、病因或病理机制。NCCIH 与 WHO 的当前边界都是按具体实践分别要求安全性和有效性证据，不因历史体系完整而整体授证。

### 2. 舌诊、脉诊和辨证表不能作为临床标准答案

Skill 把舌尖/舌中/舌根/舌边映射到脏腑，把寸关尺映射到脏腑，并列出 28 病脉和大量证候表。同行评议综述显示，中医诊断者间一致性总体为低到中等；2019 系统综述相应子集的平均两两一致率为 57%，平均 Cohen kappa 为 0.34。脉诊综述指出，较可靠结果依赖清晰的操作定义，而经典术语的模糊性会降低一致性。因此这些表可作传统术语学习材料，不能直接成为患者诊断、AI 判证或测验中的临床真值。

### 3. 体质层混合了不同分类体系和因果外推

`08` 采用阴阳平和/偏阳/偏阴三类叙述；CCMQ 基准则是 60 项、9 类体质及专门计分合同。三类文字不是 CCMQ 的短版，也不能替代 9 类量表。`体质决定是否发病及发病类型`、`决定从化传变`、按体质直接决定药性和剂量等句子超出量表证据，全部 blocked。

### 4. 板蓝根/大青叶防流感没有本轮证据

`07` 把“板蓝根大青叶防流感”并列为未病先防。CDC 当前预防主线是季节性流感疫苗；NCCIH 对中药产品的一般结论是研究质量和结果不一，不能据此给出该具体预防结论。本条标为 `unsupported_banlangen_influenza_prevention`，不得进入预防建议。

### 5. 地域、体型和“胜毒”不得决定药量

`西北药量稍重、东南药量稍轻`、`体壮量大体弱量小`、`胃厚色黑大骨肥者胜毒`都是传统经验表达，不能作为产品剂量算法。现代用药剂量必须按具体药物、制剂、适应证、年龄、肝肾功能、相互作用和专业处方确定；这些句子标为不支持或不安全。

### 6. 儿科指纹、声音呼吸和固定卒中先兆不能判危重/病位

小儿“透关射甲=病情危重”、闻声直接定位骨节/心膈/头中疾病、呼吸形态直接判“不治”，以及拇食指麻木作为固定中风先兆，均缺少本轮现代诊断证据。真实呼吸困难、意识改变、突然单侧麻木或语言异常应走现代急症识别路径，不能依赖这些传统映射。

## 证据边界

- 传统术语的历史和体系内一致性，与现代生物医学有效性是两个问题。
- `01-14` 没有页码级教材来源快照，当前只能确认 Skill 文件内容被完整保留，不能确认每句准确转录教材。
- 诊断一致性研究衡量重复性，不等于证明或否定全部传统概念的效度；但足以否定把这些表当作未经校准的临床标准答案。
- 127 条优先视图是宽筛选，未命中不表示安全；完整审查单位仍是 836 条 blocked 原文。
- 84 文件运行时检查只证明本候选 core 和 `TCM-TD-*` finding ID 未被导入；它不证明旧 `tcm-data`、望诊交互或其他既有语义已完成临床清零。
- 本报告不提供诊断、处方、剂量或患者建议。

## 数据与可重复入口

- 规范候选：`database/tcm/normalized/tcm-theory-diagnosis-candidates.json`
  - SHA256：`467874707b5eb6f96d042410fce6241d4cdea3e08dfff412a04c1ec58de75cc7`
- 现代证据与标准化 comparator：`database/tcm/sources/theory-diagnosis-evidence.json`
  - SHA256：`f11dc234e41e723b8cf2d69180292ef334bb94eccc0e06b6a78c09cf5aab9d4a`
- 审计 artifact：`docs/validation/artifacts/tcm-theory-diagnosis-audit-2026-07-10.json`
  - SHA256：`92ff55fc2c5f68dd185f3a45267599edb76de47ad5ca40c6a8a485270689650b`

```bash
npm run audit:tcm-theory-diagnosis
node --test test/tcm/tcm-theory-diagnosis-*.test.mjs
```

## 主要来源

- [NCCIH: Traditional Chinese Medicine - What You Need To Know](https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know)
- [WHO: Global traditional medicine strategy 2025-2034](https://www.who.int/teams/integrated-health-services/traditional-complementary-and-integrative-medicine/global-strategies)
- [Jacobson et al. 2019: TCM inter-rater agreement systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC6864748/)
- [O'Brien and Birch 2009: reliability of traditional East Asian medicine diagnoses](https://pubmed.ncbi.nlm.nih.gov/19388857/)
- [Bilton and Zaslawski 2016: manual pulse diagnosis reliability](https://pubmed.ncbi.nlm.nih.gov/27314975/)
- [CCMQ 60-item / nine-constitution reference](https://pmc.ncbi.nlm.nih.gov/articles/PMC10617149/)
- [CDC: Seasonal Flu Vaccine Basics](https://www.cdc.gov/flu/vaccines/index.html)
- [TCM diagnostic instruments for functional dyspepsia systematic review](https://pubmed.ncbi.nlm.nih.gov/33665098/)

## 下一验证批次

1. `15-23` 中药总论与完整药物条目：逐味建立身份、来源、药典、毒性、剂量和禁忌合同。
2. `24-30` 方剂：逐方核组成、剂量、药典/教材版本、禁忌和高风险适应证，不把方义当疗效证据。
3. 食疗、药食两用和养生建议单列，核食品身份、禁忌、相互作用与不得替代治疗的边界。
