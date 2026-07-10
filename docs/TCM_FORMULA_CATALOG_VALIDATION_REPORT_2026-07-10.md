# 中医 `24-30` 方剂资料验证报告

日期：2026-07-10
结论：通过“完整原文 inventory、方剂定义计数、重点安全裁决和产品阻断”门槛；**未通过逐方组成版本、现行剂量、临床适应证或处方权授证**。

## 范围与结果

- 7 个 reference，820 条非空原文。
- 8 个 Markdown 表、171 个表格数据行、81 个二三级标题。
- 186 个格式化方剂定义，其中 182 个教材正方候选、4 个后加经典锚点。
- 522 条重叠风险候选：193 条剂量、73 条毒性、8 条给药、43 条急症、10 条现代用途、62 条脆弱人群、158 条禁忌/慎用、4 条中毒处置、186 条方剂定义、151 条场景“首选”查表。
- 20 个重点 finding，全部 `productEligibility=blocked`、`runtimeEligibleFields=[]`。
- `audit:tcm-formula-catalog`：11,395 项检查，0 fail；扫描 84 个运行时及相邻文本文件。

这里的 `pass` 只证明原文保全、格式差异可见、来源定位、风险边界和阻断可重复。186 个格式化定义不是 186 个已校勘处方；522 条是重叠的窄优先复核视图，不是完整临床语义、附方实体或处方数据库。

## 已确认问题

1. 六个方剂分册自称共有 182 个正方，修复 parser 后逐分册均能找到对应数量。九味羌活汤、黄连解毒汤、九仙散、紫雪四方使用括号出处格式，旧 parser 曾漏计；清中汤、黄连阿胶汤、半夏秫米汤、启膈散四个“经典锚点”另计，因此总定义为 186。附方的 182 只固定了来源声明，本轮尚未全部实体化。
2. “原方折现代用量”和“古一两今一钱”的统一换算没有逐方、逐药、炮制和制剂依据，不能作为现代克数合同。
3. “同性毒力共振、异性毒力相制”不能为毒性药合方或剂量提供安全授权。
4. 汤剂日服、呕吐后续服、昏迷鼻饲、注射急救等通用给药文字不得进入消费者自我操作。
5. 151 条场景“首选”表只是来源内索引，不是现代诊断或处方权威。
6. 清中汤存在同名异方；回阳救急汤存在两个组成版本。未建立方名、出处、版本和组成主键前不能自动合并。
7. 紫雪与苏合香丸资料仍出现青木香，但相关药用标准已被历史监管通知取消并要求替代，必须逐版本裁决。
8. 含朱砂、雄黄等重金属或法定毒性药的方剂给出精确剂量，只能保留作审计，不得转为消费者建议。
9. 中风闭证、昏迷、鼻饲、消化道出血“急救止血”以及休克注射等内容不能替代现代急救和医疗评估。
10. 催吐、羽毛探喉、麝香/丁香等所谓中毒“解救”动作与现代中毒急救边界冲突；十枣汤等高毒攻下方不得作为家庭治疗。
11. 妊娠使用、现代高血压、肝硬化、肿瘤等适应证需要逐方、逐适应证证据；传统归属或教材摘要不能直接授权。

## 证据边界

- [中国药典 2025 版公告](https://english.nmpa.gov.cn/2025-06/11/c_1102172.htm)：现代药物身份、炮制、剂量和注意需药物级权威正文核对，历史单位不能统一折算成现行剂量。
- [FDA dietary supplement safety](https://www.fda.gov/consumers/consumer-updates/fda-101-dietary-supplements) 与 [NCCIH TCM overview](https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know)：草药可产生强效、相互作用和不良事件；传统方名或来源不等于现代疾病疗效已证实。
- [中国药监马兜铃酸历史通知见证](https://amr.hainan.gov.cn/himpa/adr/tzgg/ypblfyxxtb/201708/t20170802_460140.html) 与 [FDA aristolochic acid alert](https://www.accessdata.fda.gov/cms_ia/importalert_141.html)：青木香身份、替代和马兜铃酸暴露必须显式裁决。
- [医疗用毒性药品管理规定](https://mpa.jl.gov.cn/xxgk_84894/zcfg/xzfg/202303/t20230301_8673915.html) 与 [FDA heavy-metal warning](https://www.fda.gov/drugs/fraudulent-products/fda-warns-about-heavy-metal-poisoning-associated-certain-unapproved-ayurvedic-drug-products)：毒性药和砷、汞、铅暴露不能由传统组成或剂量文本授予自我治疗资格。
- [NLM poisoning first aid](https://medlineplus.gov/ency/article/007579.htm)：未经毒物中心或专业人员指示不得催吐、通用解毒或自行中和。
- [CDC stroke signs](https://www.cdc.gov/stroke/signs-symptoms/index.html) 与 [MedlinePlus gastrointestinal bleeding](https://medlineplus.gov/ency/article/003133.htm)：突发神经症状、呕血和黑便等需要即时现代医疗评估，方剂查表不能延误。

## 产物

- 候选 core：`database/tcm/normalized/tcm-formula-catalog-candidates.json`
- comparator：`database/tcm/sources/formula-catalog-evidence.json`
- 审计 artifact：`docs/validation/artifacts/tcm-formula-catalog-audit-2026-07-10.json`
- 解析与审计：`scripts/validation/lib/tcm-formula-catalog.mjs`、`build-tcm-formula-catalog-core.mjs`、`audit-tcm-formula-catalog.mjs`
- 回归：`test/tcm/tcm-formula-catalog-parser.test.mjs`、`test/tcm/tcm-formula-catalog-core.test.mjs`

当前 SHA256：core `d2314d0f575286c2d046a97822e0102983bf5be1d6e32ad799e905204ffcee2f`；evidence `f47e3ab36c1db2addb801231bdd12768b7fed000b022e8b0e986a72989d12097`；artifact `05d721c7ba88cb6601224b6cec4eea98dede639ab94c11934e72d63e863ace71`。

## 下一批

转入食疗、药食两用与养生建议，先盘点实际 source 和 runtime 消费，再按药物身份、剂量、特殊人群、疾病替代与现代营养证据分层。方剂逐方现行药典正文、制剂版本、处方组成和临床适应证仍是后续独立校勘批次。

Fresh reviewer `019f4d8f-75a1-7192-8138-1e5a804aecf7` 未发现 P0。其两项 P1 促成统一 `186=182+4` 新口径并撤销错误的“四分册各缺一方”结论；P2 促成新增 158 条禁忌/慎用视图，并把方剂学史、辞典数量和“现代用量”从现代疗效 taxonomy 排除。运行时扫描只证明 blocked core/finding ID 未被导入，不证明旧运行时不存在同义方药文字。
