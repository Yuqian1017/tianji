# TCM Database Audit - 2026-07-09

## 中文摘要

当前天机卷里的中医数据不能算完整可靠的中医 database。它主要是几个问诊/养生模块里的静态表，总量约 664 行，缺少来源、禁忌、安全分级、毒性药、妊娠禁忌、方剂级警示、病种红线和药典校准状态。

找回的 `xuanxue-compendium-new/08-zhongyi/` 解释了当前 app 中医数据的来源：它只有 5 个 Markdown 文件、约 1,267 行，覆盖藏象、经络子午、五运六气、食疗体质、十大经方。它适合作为教学/游戏素材，但不够做严肃完整中医数据库。

中医 Skill 已经完整导入到 `database/tcm/skill-v3/`，适合作为更完整的 raw reference database。它不应该直接接进程序，而应先被结构化为 source map、safety、ontology、derived app tables 和 game learning 层。

最优先的不是做界面，而是先把安全表结构化，再回头校正现有体质茶饮、穴位、望诊、八字健康等模块里的中医建议边界。

## Current Conclusion

The existing Tianji TCM data is not comprehensive enough to be treated as a reliable TCM database. It is a small set of feature-local static tables used by wellness modules.

The imported `中医` Skill is much closer to a real reference database: it has theory, diagnostics, herbs, formulas, internal medicine disease patterns, acupuncture, classics, medical authors, warm disease texts, and a dedicated safety table. It should become the reference layer for rebuilding Tianji's TCM database, not just a prompt or plugin.

## Imported Source

The full Skill was copied into:

`database/tcm/skill-v3/`

This copy includes `references/`, `sources/`, `SKILL.md`, `README.md`, `CHANGELOG.md`, `LICENSE.txt`, and `SHA256SUMS.txt`.

License boundary: the imported source is `CC BY-NC 4.0`. Treat it as internal/personal research data until commercial/product rights are clarified or the database is rebuilt from sources that permit the intended use.

## Current Tianji TCM Coverage

Current data files reviewed:

- `src/lib/tcm-data.js`
- `src/modules/tizhi/data.js`
- `src/modules/tizhi/prompt.js`
- `src/modules/ziwu/data.js`
- `src/modules/wuyun/data.js`
- `src/modules/bazihealth/data.js`
- `src/modules/wangzhen/data.js`
- `src/modules/wangzhen/prompt.js`

Total reviewed static TCM data: about 664 lines.

Existing coverage:

| Area | Current Tianji coverage | Skill coverage | Audit judgment |
|---|---|---|---|
| Basic theory | Five organs, five elements, food qi/flavors | full theory layer: yin-yang, five phases, zangxiang, qi-blood-fluid, etiology, pathogenesis, treatment principles | Tianji is shallow |
| Constitution | Wang Qi nine constitutions questionnaire and plans | constitution within theory plus broader diagnosis and regulation context | usable but needs source/safety cleanup |
| Diagnostics | Wangzhen photo categories and prompt | four diagnoses, tongue, pulse, asking, inspection, 28 pulses, pattern differentiation | Tianji is very incomplete |
| Herbs | scattered herbs in food/tea plans | 470+ herbs with properties, dosage, cautions | missing |
| Formulas | tea-like recommendations only | about 340 textbook formulas, composition, actions, indications, cautions | missing |
| Internal disease patterns | none as database | 50+ internal medicine diseases with differentiation, red flags, care | missing |
| Acupoints | a small set tied to constitution and meridian clock | 361 meridian points + 40 extra points, locating methods, cautions | very incomplete |
| Safety | only generic disclaimers in prompts | hard safety table: incompatibilities, pregnancy restrictions, toxic herbs, formula-level warnings, red flags | critical gap |
| Classics | none | Suwen, Lingshu, Nanjing, Shanghan, Jingui summaries and source texts | missing |
| Warm disease / medical authors | none | Wenre Lun, Shire Bing Pian, Wenbing Tiaobian, Yixue Xinwu, Yixue Zhongzhong Canxilu | missing |
| Five movements six qi | simplified app module | Skill explicitly marks Wuyun Liuqi as not systematically covered except source/classic traces | keep Tianji module but source-audit separately |

## High-Risk Current Data Problems

The current static tables present some medicinal items as concrete tea or regimen suggestions without the Skill's safety gates. Examples include Huangqi, Dangshen, Rougui, Honghua, Sanqi, and multiple acupoint/moxibustion suggestions.

Database-level corrections needed:

- distinguish food, drug-food homologous items, herbs, formulas, and medical prescriptions
- mark all herbs/formulas as `B: requires clinician review`
- preserve contraindications and pregnancy rules
- flag toxic herbs and formula-level warnings
- add red-flag escalation rules for symptoms and visual diagnosis
- avoid app-level prompts that encourage the model to produce concrete medicine recipes without safety lookup
- separate wellness education from diagnosis/treatment

## Database Strategy

Use a layered database, not direct prompt sprawl:

1. `raw`: immutable imported sources and references with license/provenance.
2. `source_map`: source files, books, sections, status, confidence, license.
3. `safety`: contraindications, pregnancy restrictions, toxic herbs, formula warnings, emergency red flags.
4. `ontology`: concepts, organs, five phases, qi-blood-fluid, pathogens, patterns, diseases, herbs, formulas, acupoints.
5. `derived_app_tables`: smaller feature-facing tables generated from the reference layer.
6. `game_learning`: concepts converted into lessons, quizzes, cases, mechanics, and progression.

The immediate priority should be safety and provenance, then coverage normalization. App/game usage comes after.

## Recommended Next Slice

1. Create a machine-readable manifest for all imported Skill reference files.
2. Extract the safety table first into structured JSON or SQLite.
3. Audit current `tizhi` tea/herb plans against the safety table.
4. Create a coverage matrix for each existing Tianji TCM module.
5. Only then design the first teaching/game exercise from the corrected database.
