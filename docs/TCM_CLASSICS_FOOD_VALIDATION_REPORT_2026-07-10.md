# 中医 `42-48` 经典、医家与食疗资料验证报告

日期：2026-07-10
结论：通过“剩余 reference 完整 inventory、重点食疗/医疗风险裁决和产品阻断”门槛；本报告生成时**尚未通过逐条经典校勘、现行食药物质目录、食疗剂量或临床疗效授证**。后续 106 项目录裁决见 `TCM_FOOD_MEDICINE_DIRECTORY_VALIDATION_REPORT_2026-07-10.md`。

## 范围与结果

- 7 个 reference，1,142 条非空原文。
- 8 个 Markdown 表、79 个表格数据行、145 个二三级标题。
- 603 条重叠窄风险视图：85 条食疗、76 条食物疾病映射、161 条剂量、150 条毒性/受限药、343 条禁忌、144 条急症、64 条现代疾病、105 条特殊人群、53 条居家动作、50 条来源等级。
- 20 个重点 finding，全部 `foodEligibility=not_adjudicated`、`productEligibility=blocked`。
- `audit:tcm-classics-food`：14,281 项检查，0 fail；扫描 84 个运行时及相邻文本文件。

这里的 `pass` 只证明原文保全、来源定位、风险可见性和阻断可重复。603 条是类别重叠的窄优先视图，不是完整临床语义或食疗实体库；“A级”“食疗级”“药食两用”均只是来源自述。

## 已确认问题

1. `42-48` 把经典原文、医家经验、现代红线、项目自定 A/B 级和“可直接用”混在同一层，不能直接作为产品等级。
2. 五味入脏、五脏病所宜、按颜色/五行配食属于传统映射，不是现代营养或疾病治疗合同。
3. “药食两用”不等于已核入当前 106 项食药物质目录。本报告后的目录子批次已固定 106 项并裁决明示主张，但具体配方、剂量、加工、限量和人群仍未授权。
4. 山药四两煮汁当茶、枸杞睡前嚼服一两、石榴连续三月、海带汤/牡蛎治颈部肿块等包含药物级剂量或疾病疗效，不能作为一般食物建议。
5. 小儿泄泻“第一方”、产后/妊娠、老弱和大失血等特殊人群表述缺逐项临床安全合同。
6. 目赤剧痛/视力骤降、霍乱、砷中毒、结核、胃癌、卒中等必须走现代急症或规范治疗；蒲公英、冰/梨、鸡子清、食疗或方药不得替代。
7. 铅丹/黄丹、朱砂、雄黄、硫黄、水蛭、甘遂、乌附、半夏、罂粟壳等内容虽有部分“存目/禁”注记，原始剂量和动作仍全部 blocked。
8. `src/lib/tcm-data.js` 的五行食疗与节气养生表没有 importer，状态为 `legacy_unconsumed`，但源码语义仍未验证；不能称已删除。
9. 八字健康食疗 data 仍被模块 import，但按钮 disabled、引擎返回空风险/空食疗、AI formatter 抛错，状态为 `runtime_blocked`。

## 证据边界

- [国家卫健委食药物质目录管理规定](https://www.nhc.gov.cn/wjw/c100175/202111/aac61b41730f4062bee4eefcf51933f4.shtml)：食药物质须有传统食用历史、药典身份并经目录和安全审查，且不得声称疾病预防治疗。
- [国家卫健委 2025 答复](https://www.nhc.gov.cn/wjw/jiany/202508/6141c788fa794723afb4e71af48b3d93.shtml)：当前目录为 106 种并动态管理，不能靠历史“药食同源”标签自动推定。
- [中国公民健康素养释义](https://www.nhc.gov.cn/xcs/c100122/202405/f251e896a50a49ff8c632b4b3da93126/files/1734001844015_12363.pdf)：保健食品是食品，不是药物，不能替代药物治疗疾病。
- [WHO healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet)：健康饮食以充足、平衡、适度、多样和安全为核心，不支持固定五行脏腑配食作为现代营养合同。
- [NCCIH dietary and herbal supplements](https://www.nccih.nih.gov/health/dietary-and-herbal-supplements) 与 [FDA approval facts](https://www.fda.gov/consumers/consumer-updates/10-facts-about-what-fda-does-and-does-not-approve)：草药/补充剂可有相互作用与风险，食品或补充剂身份不授予疾病治疗适应证。
- [NLM poisoning first aid](https://medlineplus.gov/ency/article/007579.htm)、[CDC TB treatment](https://www.cdc.gov/tb/treatment/index.html)、[NCI cancer treatment](https://www.cancer.gov/about-cancer/treatment/types)：中毒、结核和癌症不能由家庭食疗或历史方药替代。

## 产物

- 候选 core：`database/tcm/normalized/tcm-classics-food-candidates.json`
- comparator：`database/tcm/sources/classics-food-evidence.json`
- 审计 artifact：`docs/validation/artifacts/tcm-classics-food-audit-2026-07-10.json`
- 解析与审计：`scripts/validation/lib/tcm-classics-food.mjs`、`build-tcm-classics-food-core.mjs`、`audit-tcm-classics-food.mjs`
- 回归：`test/tcm/tcm-classics-food-parser.test.mjs`、`test/tcm/tcm-classics-food-core.test.mjs`

当前 SHA256：core `f57f0f2a62922b09802e3d9f3817de90a8e4292fb1025b9e4d4c05d8067dbf5b`；evidence `66d8f3034d7b1f5b7ed2ac5203e1e7f8228a5a9cb09c3fca241a7a93235fd94e`；artifact `e73924083c9789e991e92dd0b4345381865d502c3aaf33cfe046ed825fa2bf6c`。

## 下一批

TCM Skill 的 50 个 reference 已全部进入逐批完整 inventory。后续已完成运行时健康语义收尾和 106 项食药目录身份裁决；下一步继续取得适用现行药典、逐穴定位、逐药逐方正文和附方实体。全库验证总门槛继续保持开启。
