# Tianji Xuanxue Compendium Sources

## 中文摘要

这里保存天机卷上游玄学综典资料的原始副本。用户在 2026-07-09 找回两个外部目录后，将它们作为 raw source 复制到项目内，避免再次散落在项目外。

结论: 这些目录就是当前天机卷的上游 database/compendium 和产品规格来源。所谓“PRD 没写”并不完全准确；它没有叫 `PRD.md`，而是拆成了:

- `APP-SPEC.md`: 总规格书
- `APP-SPEC-A.md`: 产品A，排盘工具
- `APP-SPEC-B.md`: 产品B，修仙学堂
- `GAME-DESIGN.md`: 游戏化系统和道侣系统
- `DIFFICULTY-MAP.md`: 教学/测验/渡劫难度映射
- `CC-FIRST-TASK.md`: 先做六爻 MVP 的 Claude Code 任务入口

## Imported Copies

| Project copy | Original path | Notes |
|---|---|---|
| `database/xuanxue/compendium-new/` | `/Users/junshi/xuanxue-compendium-new/` | Canonical newer copy for current Tianji lineage. Its `CC-TASK-XIANGSHU.md` uses frontend ML feature extraction + text LLM, matching the current app's Face/Palm direction. |
| `database/xuanxue/compendium-vision-api/` | `/Users/junshi/xuanxue-compendium-vision api/` | Near-duplicate older/alternate copy. Its `CC-TASK-XIANGSHU.md` sends images to Claude Vision directly. |

Both imported copies include `SHA256SUMS.txt` for local integrity checks.

## Relationship To Current App

The current Tianji app is downstream of these materials:

- `CC-FIRST-TASK.md` asked Claude Code to build only a Liuyao MVP first.
- `APP-SPEC-A.md` then planned product A as a pure paipan + AI interpretation tool.
- `APP-SPEC-B.md` planned product B as the teaching/game system, separate from product A.
- The current repo mostly implements and extends product A. Product B is still largely unimplemented.

## Database Quality Boundary

The compendium is useful as a broad East metaphysics learning and implementation source, but it is not fully validated as a production-grade database.

Known boundaries:

- Some algorithms are explicitly marked simplified or requiring validation.
- TCM coverage is shallow compared with the imported `database/tcm/skill-v3/` source.
- Source/provenance fields are not normalized.
- Licensing/provenance for individual knowledge claims is not machine-readable.
- The files are Markdown-first, not schema-first.

Next work should build structured manifests and coverage/audit matrices before product code consumes this as canonical data.
