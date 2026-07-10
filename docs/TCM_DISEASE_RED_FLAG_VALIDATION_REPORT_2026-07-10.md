# 中医内科病种红线与家庭处置验证报告

日期：2026-07-10

范围：中医 Skill v3 `31-37` 七个内科病种 reference；52 个主病种、689 条非空原文行、22 张 Markdown 表、133 个表格数据行、83 条关键词风险候选和 308 条广义可执行处置候选。现代 comparator 来自 CDC、AHA/American Red Cross、NIDDK、NIH MedlinePlus、WHO、HRSA Poison Help、American Red Cross 与 NHLBI。

结论：`pass_with_all_candidates_blocked`。2,589 项自动审计 0 失败，证明完整原文 inventory、两个筛选视图、20 个重点裁决、来源哈希和运行时阻断可重复。83 条关键词风险候选和 308 条广义处置候选都只是人工复核优先级视图，不代表完整临床语义验证。它不是对 52 个病种的中医病机、辨证、方药、剂量、检查或疗效授证；这些内容全部继续 blocked。

## 结果摘要

| 层 | 规模 | 结果 |
|---|---:|---|
| 主病种 | 52 | 全部保留为候选；治疗字段均 blocked |
| 原文完整 inventory | 689 行 / 22 表 / 133 表格行 | 逐行精确保留；不是逐句医学正确性通过 |
| 关键词风险候选 | 83 行 | 固定关键词命中；不是完整风险面，全部 blocked |
| 广义处置候选 | 308 行 | 剂量、方药、现场动作、禁忌、检查和就医指令的优先复核视图；全部 blocked |
| 明确冲突/无依据 | 9 | 两条催吐/探吐、尿潴留家庭法、乌头中毒家庭解毒、胸痛通用中成药、晕厥灌糖水、三年中风预测、出血剂量和急腹症方药替代 |
| 官方支持的红线 | 9 | 癫痫、卒中、心梗、心悸伴心肺警讯、急性尿潴留、消化道出血、两条急腹症升级、重症哮喘 |
| 混合边界 | 2 | 自杀风险原文缺即时危险升级；痉证气道护理混入可能诱发口腔操作的措辞 |
| 运行时旁路 | 84 个文本文件 | 未导入候选 core 或 finding ID |

## 确认冲突与无依据内容

### 1. 食物中毒催吐/洗胃与“误吞毒物当探吐”

`33-内科-脾胃系病证.md` 两处要求食物中毒催吐/洗胃或误吞毒物探吐。HRSA Poison Help 要求立即联系毒物专家；NIH MedlinePlus 明确不得自行催吐，除非毒物中心或医护人员指示，也不得给无意识者任何口服物。两条均标为 `conflict_do_not_induce_vomiting`。

### 2. 急性尿潴留的取嚏、探吐、吹鼻、热熨与贴脐

`35-内科-肾系病证.md` 在尿潴留章节给出皂角末吹鼻、探吐、250g 热盐熨腹、蒜/栀子贴脐、葱白热熨和流水诱导，失败后才导尿。NIDDK 将突然无法排尿定义为可能危及生命、需立即急诊的急性尿潴留。这组家庭方法可能造成刺激、烫伤和延误，整段标为 `conflict_emergency_retention_home_methods`。

### 3. 乌头类中毒的绿豆甘草汤

`37-内科-肢体经络病证.md` 在附子、川乌、草乌中毒表现后要求停服并“绿豆甘草汤频饮”，危重才急救。疑似中毒应立即联系急救/毒物中心，不应以口服家庭解毒替代。该行同时包含具体剂量和炮制减毒文字，全部 blocked。

### 4. 胸痛时通用含化苏合香丸/麝香保心丸

`32-内科-心系病证.md` 对寒凝胸痛要求“即刻含化苏合香丸/麝香保心丸类并叫急救”。AHA 要求疑似心梗立即启动 EMS；2024 AHA/Red Cross 急救指南只在明确条件下讨论阿司匹林，并不支持把未个体化的中成药作为通用等待期步骤。急救呼叫本身正确，药物指令 `unsupported_universal_tcm_rescue_pill`。

### 5. 晕厥后灌服温糖水

`32-内科-心系病证.md` 将一类晕厥写成平卧并“灌服温糖水”。Red Cross 要求先检查反应和呼吸、按情形使用恢复体位、持续观察并升级；意识和吞咽安全未确定时不能把口服糖水设为通用步骤。该动作标为 `conflict_oral_intake_after_syncope`。

### 6. “大指、次指麻木，三年内中风”

`34-内科-肝胆病证.md` 把古训写成三年风险预测。CDC 的卒中识别依据是突然出现的面、臂、语言、视力、平衡和剧烈头痛等症状；本轮没有支持固定“三年内”的预测证据。突然单侧麻木/语言异常应按卒中急症处理，但三年预测标为 `unsupported_three_year_stroke_prediction`。

### 7. 上消化道出血“大黄粉 3~5g 日 4 次”

`36-内科-气血津液病证.md` 在吐血表格中把大黄写成上消化道出血首选并给出固定剂量。MedlinePlus 只支持呕血、咖啡渣样物、黑便及伴随头晕、呼吸/胸部症状或剧烈腹痛的紧急评估，本轮没有取得支持该固定药物和剂量的现代证据。该行标为 `unsupported_emergency_gi_bleed_dose`，不得由产品输出。

### 8. 急腹症红线旁的方药替代

`33-内科-脾胃系病证.md` 正确写出腹肌紧张、反跳痛和剧痛伴冷汗/呕吐需立即急诊，但相邻分证又给出“胆囊炎样痛用大柴胡汤、阑尾炎样痛大黄牡丹皮汤”。急腹症识别与升级获支持，方药替代标为 `unsupported_acute_abdomen_formula_substitution` 并继续 blocked。

## 获得支持的红线

以下红线方向与现代官方来源一致，但只授证识别与升级，不授证同段中医治疗：

| 来源病种 | Skill 红线 | Comparator | 裁决 |
|---|---|---|---|
| 痫病 | 侧卧/防伤、不按压、不塞口；超过 5 分钟、连续或首次发作叫急救 | CDC seizure first aid | supported，仍 blocked 待本地化 |
| 中风 | 突然口眼歪斜、偏瘫、语言障碍立即急救 | CDC stroke signs | supported |
| 真心痛 | 持续胸痛、汗出、气促等立即呼叫急救 | AHA heart-attack warnings | supported |
| 心悸 | 心胸疼痛、喘促、肢冷汗出或晕厥立即就医 | AHA heart-attack warnings | supported urgent escalation；不能替代 EMS 判断 |
| 癃闭 | 突然无法排尿、膀胱胀满需就医 | NIDDK urinary retention | supported；家庭法冲突 |
| 胃痛/出血 | 呕血、黑便等立即急诊 | NIH MedlinePlus GI bleeding | supported |
| 腹痛 | 腹肌紧张/反跳痛，或剧痛伴冷汗、呕吐不止立即急诊 | NIH MedlinePlus abdominal pain | 两条升级红线 supported；相邻方药不获支持 |
| 哮病 | 紫绀、不能成句、意识改变、持续不缓解立即急诊 | NHLBI asthma attack | supported |

## 混合边界

- `36-内科-气血津液病证.md` 对自杀/自伤风险只写“及早就诊”和精神科主责。WHO 支持寻求专业帮助，并要求在即时危险时联系急救/危机服务且不要让当事人独处。裁决降为 `supported_professional_help_but_immediate_danger_escalation_missing`，不得称为完整即时升级指引。
- `37-内科-肢体经络病证.md` 的痉证护理包含保持气道通畅、勿强行按压等合理方向，也包含“清除假牙异物”。CDC 癫痫急救明确不得把任何东西放入口中；为避免诱发发作期口腔操作，整行标为 `mixed_convulsion_first_aid_mouth_action_blocked`。

CDC 的 DKA 与疟疾资料也进入 comparator 快照，用于后续扩大逐条裁决。本批没有因为来源存在就自动授证相邻的消渴、疟疾、喘证或腹痛全部段落。

## 数据与可重复入口

- 规范候选：`database/tcm/normalized/tcm-disease-red-flag-candidates.json`
  - SHA256：`cb43b2f189f7dba249f47596b0acf71aa4bdc6730d285bc0a52ef0941f434238`
- 红线 comparator：`database/tcm/sources/disease-red-flag-evidence.json`
  - SHA256：`a39866694958d6674f33b6db67cf4a88a837be89d7f064d0af61f1c601ef74ea`
- 审计 artifact：`docs/validation/artifacts/tcm-disease-red-flags-audit-2026-07-10.json`
  - SHA256：`931b5c694bfb5fc022ab8be9925ed8abeba11875a4ea5d339d64cd6a4ae76a26`

## 可重复命令

```bash
npm run audit:tcm-disease-red-flags
node --test test/tcm/tcm-disease-red-flags-*.test.mjs
```

## 主要来源

- [CDC: Signs and Symptoms of Stroke](https://www.cdc.gov/stroke/signs-symptoms/index.html)
- [AHA: Warning Signs of a Heart Attack](https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack)
- [CDC: First Aid for Seizures](https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html)
- [NIDDK: Urinary Retention](https://www.niddk.nih.gov/health-information/urologic-diseases/urinary-retention/definition-facts)
- [NIH MedlinePlus: Gastrointestinal Bleeding](https://medlineplus.gov/ency/article/003133.htm)
- [NIH MedlinePlus: Abdominal Pain](https://medlineplus.gov/ency/article/003120.htm)
- [WHO: Suicide](https://www.who.int/news-room/questions-and-answers/item/suicide)
- [HRSA Poison Help](https://poisonhelp.hrsa.gov/what-you-can-do)
- [NIH MedlinePlus: Poisoning First Aid](https://medlineplus.gov/ency/article/007579.htm)
- [American Red Cross: Fainting](https://www.redcross.org/take-a-class/resources/learn-first-aid/fainting)
- [NHLBI: Asthma Attack](https://www.nhlbi.nih.gov/health/asthma/attacks)
- [CDC: Diabetic Ketoacidosis](https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html)
- [CDC: Malaria Diagnosis and Treatment](https://www.cdc.gov/malaria/php/public-health-strategy/case-diagnosis-treatment.html)

## 下一验证批次

1. `31-37` 中未逐条裁决的检查建议、药物、方剂、剂量、调护和 A/B/C 标签继续 blocked，并转交药典/方剂及疗效验证层。
2. `01-14` 基础理论、四诊和辨证已在后续批次完成 blocked inventory 与现代外推审计，见 `TCM_THEORY_DIAGNOSIS_VALIDATION_REPORT_2026-07-10.md`。
3. 当前转入 `15-30` 完整中药与方剂；之后单独审计食疗/药食两用、长期养生与体质建议。
