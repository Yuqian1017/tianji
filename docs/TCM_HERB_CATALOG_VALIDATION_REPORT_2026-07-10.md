# 中医 `15-23` 中药资料验证报告

日期：2026-07-10
结论：通过“完整原文 inventory、重点风险裁决和产品阻断”门槛；**未通过逐味药现行药典、处方剂量或临床疗效授证**。

## 范围与结果

- 9 个 reference，1,331 条非空原文。
- 45 个 Markdown 表、279 个表格数据行、122 个二三级标题。
- 663 条重叠风险候选：472 条剂量、125 条毒性、42 条重金属、21 条现代用途/疗效、150 条脆弱人群、6 条毒物处置、49 条外用路线、100 条病证反查。
- 20 个重点 finding，全部 `productEligibility=blocked`、`runtimeEligibleFields=[]`。
- `audit:tcm-herb-catalog`：14,281 项检查，0 fail；扫描 84 个运行时及相邻文本文件。

这里的 `pass` 只证明原文保全、来源定位、风险可见性、证据边界和阻断可重复。663 条是优先复核视图，不是完整药物实体目录，也不证明 470 余味药已经逐味通过现行药典。

## 已确认问题

1. `23-病证用药索引.md` 自称 103 条，实际只有 100 条，缺编号 52、53、54，并有 `47→36`、`60→55` 两处原始顺序逆转。项目同时保存排序候选和原始顺序，不补造缺失内容。
2. “生姜/绿豆/防风解毒”和毒物中毒后自行服用的表述不能替代毒物中心或医疗处置；现代中毒指引也反对自行使用通用解毒法。
3. “5 岁以下成人 1/4、5 岁以上减半”和“使君子每岁若干粒”不是可靠的通用儿童剂量合同。
4. “附子、乌头先煎 45-60 分钟”不能单独授予毒性药物产品安全性；仍需逐药、炮制、制剂、处方和现行药典核验。
5. 按体型判断“胜毒/不胜毒”和按南北地域增减剂量均不得进入剂量算法。
6. 鹅不食草鼻腔给药“单用有效”、葛根降压、羊红膻治克山病等现代疗效句缺适应证级证据，不能作为产品事实。
7. 青木香、关木通的药用标准已被历史监管通知取消；天仙藤、马兜铃等含马兜铃酸材料受限制。原文仍给出适应证和剂量，构成高风险来源冲突。
8. “饮热开水助吐、翎毛探喉”与现代中毒急救边界冲突，禁止作为家庭动作。
9. 砒石/砒霜、朱砂、轻粉、雄黄、铅丹等砷汞铅内容含内服或外用剂量，只保留作审计，不进入消费者建议。
10. 病证反查把破伤风、疟疾、中风闭脱证及脓成不溃等直接连到药物组；100 条全部不是现代诊断或处方权威，不得延误标准诊疗。

## 证据边界

- [FDA dietary supplement safety](https://www.fda.gov/consumers/consumer-updates/fda-101-dietary-supplements)：草药/补充剂可产生强生物效应、相互作用和不良事件，上市前也不等于已获安全有效审批。
- [FDA children and supplement interactions](https://www.fda.gov/consumers/consumer-updates/mixing-medications-and-dietary-supplements-can-endanger-your-health)：儿童不同年龄代谢不同，不能用统一成人比例替代药物级儿科剂量。
- [HRSA Poison Help](https://poisonhelp.hrsa.gov/what-you-can-do) 与 [NLM poisoning first aid](https://medlineplus.gov/ency/article/007579.htm)：疑似中毒应立即联系专业服务；未经指导不要催吐、不要自行中和或使用通用解毒法。
- [FDA aristolochic acid import alert](https://www.accessdata.fda.gov/cms_ia/importalert_141.html) 与 [中国药监历史通知见证](https://amr.hainan.gov.cn/himpa/adr/tzgg/ypblfyxxtb/201708/t20170802_460140.html)：固定马兜铃酸的肾毒、致癌与药名监管边界。
- [FDA heavy-metal warning](https://www.fda.gov/drugs/fraudulent-products/fda-warns-about-heavy-metal-poisoning-associated-certain-unapproved-ayurvedic-drug-products)：砷、汞、铅暴露可造成严重和累积性伤害。
- [CDC tetanus care](https://www.cdc.gov/tetanus/hcp/clinical-care/index.html) 与 [CDC malaria treatment](https://www.cdc.gov/malaria/treatment/index.html)：两者均需标准诊疗，不能由病证反查表替代。

## 产物

- 候选 core：`database/tcm/normalized/tcm-herb-catalog-candidates.json`
- comparator：`database/tcm/sources/herb-catalog-evidence.json`
- 审计 artifact：`docs/validation/artifacts/tcm-herb-catalog-audit-2026-07-10.json`
- 解析与审计：`scripts/validation/lib/tcm-herb-catalog.mjs`、`build-tcm-herb-catalog-core.mjs`、`audit-tcm-herb-catalog.mjs`
- 回归：`test/tcm/tcm-herb-catalog-parser.test.mjs`、`test/tcm/tcm-herb-catalog-core.test.mjs`

当前 SHA256：core `034cc84bc81732ef89edb773118a2df5ff3bfe6b9b16547d21d54cd59a8e70c2`；evidence `3175dfe1f95f352f8ff904898eae8ef3c5a597b6d8272f7f707edb5f8343fb8b`；artifact `b5b5a626e3797abd08f47d4a1a188640cdccfca9ee6f624f03239d394756e3b5`。

## 下一批

转入 `24-30` 方剂资料：820 条非空行、8 表/171 表格行、81 个标题。重点核对方名、组成版本、剂量、炮制、禁忌、毒性、适应证与现代急症替代风险。中药逐味现行药典正文和食疗/药食两用仍是后续独立批次。

Fresh reviewer `019f4d76-0bb5-7393-9d17-a92c6a7e0705` 未发现 P0/P1。两项 P2 已关闭：普通“清热解毒”不再误计为家庭动作；反查表两处原始编号逆序已进入 parser、core、audit 和回归测试。
