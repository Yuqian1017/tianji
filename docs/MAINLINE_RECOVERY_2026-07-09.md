# Tianji Mainline Recovery - 2026-07-09

## 中文摘要

2026-07-09 用户找回 `/Users/junshi/xuanxue-compendium-new/` 和 `/Users/junshi/xuanxue-compendium-vision api/` 后，结论已更新: 这些就是天机卷的上游 compendium/database 和产品规格材料。

它确实没有写成 `PRD.md`，但不是没写产品规格；规格被拆成 `APP-SPEC.md`、`APP-SPEC-A.md`、`APP-SPEC-B.md`、`GAME-DESIGN.md`、`DIFFICULTY-MAP.md`、`CC-FIRST-TASK.md`。其中 `APP-SPEC-A` 是排盘工具，`APP-SPEC-B` 是修仙学堂/教学游戏，`CC-FIRST-TASK` 明确要求 Claude Code 先只做六爻 MVP。

判断: 当前 repo 已经完成并扩展了产品A的很多内容，但产品B的教学、测验、灵力、境界、NPC、道侣系统基本还没开始。不要从零推翻当前工具原型；应把找回的 compendium 纳入项目 raw database，再补结构化审计和产品B实施计划。

## Current Conclusion

The original upstream compendium/spec was found outside the current repo:

- `/Users/junshi/xuanxue-compendium-new/`
- `/Users/junshi/xuanxue-compendium-vision api/`

Both have now been copied into `database/xuanxue/` as raw project sources.

The full product plan was not named `PRD.md`; it was split across `APP-SPEC.md`, `APP-SPEC-A.md`, `APP-SPEC-B.md`, `GAME-DESIGN.md`, `DIFFICULTY-MAP.md`, and `CC-FIRST-TASK.md`.

This matches the remembered strategy: start from a small paipan tool first, instead of attempting the whole system at once.

## Found Upstream Compendium

`xuanxue-compendium-new` is the best canonical source for the current app lineage. It contains:

- `README.md`: "玄学综典 · 天机卷"
- `CLAUDE.md`: Claude Code index and task routing
- `APP-SPEC.md`: full app specification
- `APP-SPEC-A.md`: product A, paipan tool
- `APP-SPEC-B.md`: product B, cultivation school / teaching game
- `GAME-DESIGN.md`: cultivation progression, achievements, NPC and relationship systems
- `DIFFICULTY-MAP.md`: required/advanced/deep-study difficulty map
- `CC-FIRST-TASK.md`: first task, Liuyao MVP only
- 00~10 domain directories and `reference/` algorithm/data files

`xuanxue-compendium-vision api` is almost identical. The only meaningful content diff found so far is `CC-TASK-XIANGSHU.md`: the vision-api copy asks to send images directly to Claude Vision; the newer copy uses frontend MediaPipe-style feature extraction plus text LLM, matching the current app's later direction.

## Strongest Recovered Mainline Evidence

`projects/feather-duster/HANDOVER.md` records a planned `kb/metaphysics/` knowledge base with the explicit goals:

- enrich the "东玄系统"/天机卷
- build a metaphysics knowledge base
- use the material for game design

It also names direct mechanic translations:

- Liuyao -> card system
- Fengshui -> city-building system
- Qimen -> grid/time/strategy system, by implication from the same taxonomy

The intended content categories were:

- Daoist common knowledge
- Liuyao
- Qimen
- Fengshui
- Tarot
- other metaphysics / cross-domain material

The actual `kb/metaphysics/` directory was not present in the checked file tree, so this appears to have been planned but not landed, landed elsewhere, or lost.

## Current Tianji Repo State

The repo at `/Users/junshi/CC projects/projects/games/tianji` currently contains:

- React/Vite frontend
- Express + SQLite backend for accounts and history
- modules for Liuyao, Meihua, Bazi, Ziwei, Qimen, Fengshui, Tizhi, Ziwu Liuzhu, Wuyun Liuqi, Bazi Health, Wangzhen, Face, and Palm
- static module-local data files and prompts
- SQLite app tables for users/history/config
- recovered raw xuanxue compendium copies under `database/xuanxue/`
- imported TCM Skill raw reference database under `database/tcm/`

It still does not currently contain:

- a normalized current PRD distilled from the recovered specs
- a structured, schema-first content database
- a validated source/provenance manifest
- an implemented learning progression
- an implemented game loop
- source/provenance metadata for most knowledge tables

## Ruled-Out Leads

These were inspected and are not the target mainline PRD:

- `projects/games/shanhe-yisu/PRD.md`: unrelated ancient 3D action RPG/farming/roguelike project.
- `projects/work/viso/COMPENDIUM (2).md`: pathology platform compendium.
- `Codex Projects/ai-tarot-deck/docs/PRD.md`: separate tarot/oracle project.
- `projects/games/linglong-sha/COMPENDIUM.md`: separate BL xianxia mystery game.
- `projects/games/xueluo-tingfeng/PRD.md`: separate BL xianxia narrative game.

## Old Artifact

`projects/archive/old-zips/tianji_v1_liuyao_complete.zip` contains the early Liuyao MVP. Its README is still the default React/Vite template, and its changelog records the first Liuyao app, history drawer, coin toss animation, and follow-up AI chat. It is useful as lineage evidence, not as the missing broad PRD.

## Product Judgment

Do not restart the existing Tianji tool from scratch yet.

The right split is:

- keep the current tool as a working prototype and module probe
- rebuild the missing mainline documentation and database layer outside the app code
- only then decide what the teaching/game product should become

The current app is not the whole system, but it is not worthless. It already contains interaction patterns, paipan engines, UI affordances, and user-history infrastructure that can be reused after the broader database and PRD are recovered or rewritten.

## Missing Work

1. Convert `APP-SPEC-A/B` and `GAME-DESIGN.md` into a current project PRD/roadmap.
2. Build a structured source manifest for `database/xuanxue/compendium-new/`.
3. Audit algorithm files marked simplified or requiring validation.
4. Decide whether productB should be built inside the current app or as a sibling app that embeds productA later.
5. Normalize the compendium into a database layer before using it as canonical product data.
6. Keep current app work focused on productA unless explicitly starting productB.
