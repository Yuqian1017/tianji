# 天机卷中央来源库

`database/sources/` 是全项目统一的参考文献、典籍见证、外部数据集和现代边界证据入口。

## 当前合同

- `source-library.json` 登记每个来源文件的分类、角色、canonical 路径、字节数和 SHA256。
- 原文只保留一份 canonical 文件。中央库不复制现有正文，避免两个副本发生漂移。
- 现有中医原文、Skill 整理稿、compendium 和监管快照暂时保留原路径，由中央索引统一指向。
- 新增外部典籍或数据见证优先放入 `database/sources/<repository-or-domain>/`，再由 normalized core 引用。
- 未来迁移旧正文时必须同时提供兼容路径映射，不允许静默移动或删除。

## 分类

| Group | 内容 |
|---|---|
| `tcm_original_texts` | 中医古籍和教材全文及其状态索引 |
| `tcm_curated_references` | 中医 Skill 的 50 份整理稿 |
| `tcm_modern_boundaries` | 药典、监管、标准与现代安全 comparator 快照 |
| `xuanxue_compendium` | 玄学 compendium canonical 历史资料与旧规格 |
| `xuanxue_compendium_mirror` | vision-api 历史镜像或后续分化版本 |
| `shared_wikisource_witnesses` | 维基文库等固定文本见证 |
| `shared_ctext_witnesses` | 中国哲学书电子化计划等固定文本或目录见证 |
| `external_source_manifests` | 外部二手资料的固定版本、许可、溯源与吸收边界档案 |
| `xiangshu_source_registry` | 相术典籍见证清单 |
| `shared_datasets` | GeoNames 等外部数据集 |
| `licenses` | 外部来源许可文本 |

## 重建与验证

```bash
npm run build:source-library
npm run audit:source-library
```

索引完整不等于内容正确。是否可进入产品仍由各领域 normalized core、adjudication 和 validation ledger 决定。
