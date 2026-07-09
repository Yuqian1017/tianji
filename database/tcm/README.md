# Tianji TCM Database

## 中文摘要

这里是天机卷项目内的中医资料库区，不是程序接入区。`skill-v3/` 是从已安装的中医 Skill 复制过来的完整 raw database，包含 `references/`、`sources/`、Skill 说明、变更记录、许可证和 SHA256 校验清单。

当前导入资料的许可证是 `CC BY-NC 4.0`，所以在商业化或公开产品使用前需要另行确认授权或重建可商用来源。现在它只应作为内部/个人研究资料与数据库校正底座。

This directory is the project-side TCM knowledge database area. It is intentionally separate from the app runtime code.

## Current Import

- Imported on: 2026-07-09
- Source skill: `/Users/junshi/.codex/skills/中医`
- Project copy: `database/tcm/skill-v3/`
- Source project recovered from: `YuanZHAO321/TCM.Skill`
- License in imported source: Creative Commons Attribution-NonCommercial 4.0 International (`CC BY-NC 4.0`)
- Integrity manifest: `database/tcm/skill-v3/SHA256SUMS.txt`

The import includes the full Skill package available locally at import time:

- `SKILL.md`
- `README.md`
- `CHANGELOG.md`
- `LICENSE.txt`
- `references/`
- `sources/`

## Boundary

This is a raw reference database import, not product integration.

Do not wire this directly into the app until the database layer has a normalized schema, attribution fields, safety gates, and a licensing decision. The imported material is non-commercial by license, so treat it as internal/personal research material unless separate permission or replacement sources are secured.

Medical safety is part of the database, not an afterthought. Any derived structured table that mentions herbs, formulas, acupuncture, moxibustion, prescriptions, symptoms, or body discomfort must preserve:

- source/provenance
- safety classification
- contraindications
- red-flag escalation rules
- dosage source and calibration status
- the distinction between educational reference and clinical advice

## Relationship To Current App Data

The current app has small static TCM tables under `src/lib/tcm-data.js` and `src/modules/*/data.js`. Those tables are feature-local UI material, not a complete knowledge database.

Going forward, the imported Skill should be treated as the reference layer to audit and rebuild those static tables from. Existing app tables should not be considered authoritative where they conflict with the imported safety/reference layer.

## Next Database Work

1. Build a coverage matrix mapping current Tianji data files to the imported Skill references.
2. Extract a normalized source map: topics, files, source texts, license, and safety boundary.
3. Normalize high-risk tables first: contraindications, toxic herbs, pregnancy restrictions, formula-level warnings, red flags.
4. Normalize educational tables next: theory, diagnostics, constitutions, disease patterns, herbs, formulas, acupoints, food therapy.
5. Only after the database is stable should app/game mechanics consume it.
