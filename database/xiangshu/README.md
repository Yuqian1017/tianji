# 相术规范数据库

本目录以可定位的典籍见证为核心，不以现代科学结论或监管目录替代传统文献。

- `sources/xiangshu-source-manifest.json`：版本、转录见证、归属争议和短摘录定位。
- `normalized/xiangshu-classical-claims.json`：由原文归一化出的传统说法；原文和现代转述分开保存。
- `normalized/xiangshu-compendium-adjudications.json`：旧 compendium 条目与典籍见证的逐条裁决样板。
- `normalized/xiangshu-raw-line-inventory.json`：两份 canonical 相术 Markdown 的全部非空行 inventory；未找到出处的内容保持待裁决，不会被静默丢弃。

`runtimeEligible: true` 只表示可在文化学习场景中连同出处展示，不表示该说法已被现代科学验证，也不授权医疗、雇佣、财务或其他现实决策。
