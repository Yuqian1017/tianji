# 中医数据库安全与当前消费点验证报告

日期：2026-07-10

范围：中医 Skill v3 导入完整性、当前运行时高风险消费点、法定毒性中药清单、Skill 剂量表的产品资格边界。
结论：`pass_with_blocked_medical_layers`。本轮通过的是包完整性、消费点清点、官方毒性清单和风险隔离；不是对全部中医内容的医学正确性背书。

## 结果摘要

- 自动审计：213 项检查，0 失败。
- 回归测试：中医专项 9/9、全库 validation 79/79；targeted ESLint 0 error/0 warning，production build 通过。
- 产品路径：体质、子午流注、五运六气、望诊在桌面 1440×900 和移动端 390×844 实测；旧医疗动作词为 0、无页面横向溢出、console 0 error/0 warning。
- Skill 导入：98 个 manifest 条目、50 个 reference、42 个原文 txt；本地副本与安装副本及上游 commit `966a88acf942b6b8684575db3d1d3f261442b8a4` 一致，本地仅增加 `SHA256SUMS.txt`。
- 上游许可：CC BY-NC 4.0；现代教材与第三方全文仍可能有独立权利，不能因仓库许可自动取得商业使用权。
- 法定毒性中药：28 个名称与 Skill 清单、NMPA 2021 指导原则所述数量及深圳政府 2026 附录清单一致；另记录北京政务页“27 种且遗漏红升丹”的发布漂移。
- Skill 毒性/剂量表：100 行、101 个药名，其中一行合并“砒石/砒霜”；字段结构完整，但剂量尚未逐药对照 2025 版《中华人民共和国药典》，全部保持 `blocked`。
- 旧运行时：34 题体质问卷、9 套调养方案、28 个药物标签、22 个具体计量项、30 个去重穴位已完整归档为 `removed_pending_review`。

## 产品路径回归

| 模块 | 当前可见边界 | 旧高风险内容 | 桌面 / 移动端 |
|---|---|---|---|
| 体质辨识 | 明示功能暂停、34/60 条目缺口 | 无测试入口、方药、穴位或艾灸动作 | pass / pass |
| 子午流注 | 仅时辰、经脉、脏腑名称和五行标签 | 无排毒、疾病、最佳服药或穴位建议 | pass / pass |
| 五运六气 | 明示算法/时间边界尚在校核，现实预测未验证 | 无疾病、重点脏腑、食疗或健康风险 | pass / pass |
| 望诊 | 仅拍摄质量和可见图像特征 | 无体质、脏腑、辨证或治疗建议 | pass / pass |

两种视口均无页面横向溢出；浏览器控制台 0 error / 0 warning。该回归只证明旧高风险消费路径已退出产品，不证明被保留的传统结构正确。

## 主要发现

### P0 体质问卷不是已验证量表

旧实现只有 34 题，却按 ZYYXH/T 157-2009 的转化分思路输出正式体质结论。该标准的原始 CCMQ 为 60 项；公开研究中的验证短版为 23、26 或 27 项，旧 34 题不对应这些版本。当前功能已暂停，旧药茶、克数、穴位和裸艾灸建议不再进入运行时。

### P0 传统结构被扩写成医疗事实

- 子午流注旧表把时辰对应扩写为“排毒、疾病提示、最佳吸收时段”；现只保留传统时辰、经脉、脏腑名称和五行标签。
- 五运六气旧表直接输出重点脏腑、疾病风险和食疗；现只展示候选排列结构，算法和时间边界仍待下一单元验证。
- 望诊旧 prompt 从照片推断脏腑与体质并给调养建议；现只允许描述可见颜色、形态、纹理和拍摄限制。
- 八字健康此前已硬阻断，本轮保持不变。

### P0 Skill 不能直接成为剂量数据库

2025 版《中国药典》自 2025-10-01 起施行。Skill 明确披露其剂量主要来自七版教材，未完成现行药典校准。因此，SHA256 完整性、教材内部一致性和安全表存在都不能把任一剂量提升为运行时可用数据。

## 规范数据

- `database/tcm/normalized/tcm-safety-core.json`
  - SHA256：`f69777017d1e32cf12b26a1cfcf19396b524938ce14dc9516fa318565ca0126f`
- `database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json`
  - SHA256：`fc0e038ea34ba7a75b5a1f07cd3705970232a1b39721f13aad55c969a11be585`
- `docs/validation/artifacts/tcm-safety-audit-2026-07-10.json`
  - SHA256：`9ff05858aa8a5b49d8a4c8ec23b5b1aaf4a378e30eef4fa4b2f73e2aafe2dcc8`

## 证据来源

- [国家药监局、国家卫生健康委：2025 版《中国药典》发布公告](https://english.nmpa.gov.cn/2025-06/11/c_1102151.htm)
- [国务院：医疗用毒性药品管理办法](https://mpa.jl.gov.cn/xxgk_84894/zcfg/xzfg/202303/t20230301_8673915.html)
- [国家药监局：已上市中药药学变更研究技术指导原则](https://www.gov.cn/zhengce/zhengceku/2021-04/08/5598335/files/bfc3496e3daf4857abcd324b55bd39b3.pdf)
- [中华中医药学会 2026 标准应用示范清单：继续列明 ZYYXH/T 157-2009](https://www.cacm.org.cn/wp-content/uploads/2026/04/%E9%99%84%E4%BB%B6%EF%BC%9A%E4%B8%AD%E5%8D%8E%E4%B8%AD%E5%8C%BB%E8%8D%AF%E5%AD%A6%E4%BC%9A%E5%9B%A2%E4%BD%93%E6%A0%87%E5%87%86%E5%BA%94%E7%94%A8%E7%A4%BA%E8%8C%83%E9%A1%B9%E7%9B%AE%EF%BC%88%E7%AC%AC%E4%B8%80%E6%89%B9%EF%BC%89%E6%B8%85%E5%8D%95.pdf)
- [PubMed：CCMQ 短版开发与评价](https://pubmed.ncbi.nlm.nih.gov/37904166/)
- [NCCIH：Traditional Chinese Medicine safety overview](https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know)
- [WHO：Benchmarks for the practice of acupuncture](https://www.who.int/publications/i/item/978-92-4-001688-0)

## 未完成门槛

1. 逐药对照 2025 版《中国药典》的法定名称、基原、炮制、用量、禁忌和毒性分级。
2. 对妊娠、十八反十九畏、马兜铃酸、方剂级警示做现行权威来源复核。
3. 对 361 穴定位、孕妇/危险区、按压、悬灸与有创操作分级逐项复核。
4. 继续验证五运六气确定性结构和时间边界；其健康解释继续 blocked。
5. 其余理论、诊断、病种、方剂、经典和医家层按来源/版本/适用范围继续逐项校勘。
