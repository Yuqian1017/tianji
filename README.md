# 天机卷

天机卷是一套以中国传统术数与中医知识为底座、结合教学、练习、实战工具和修仙式进度的互动系统。

当前 repo 主要完成了实战工具层（Product A）：六爻、梅花、八字、紫微、奇门、风水、体质、子午流注、五运六气、八字健康、望诊、面相和手相。教学游戏层（Product B）尚未实现，下一阶段将先建立课程、规范练习、掌握度、灵力和渡劫闭环。

## 主文档

- [主 PRD](docs/PRD.md)
- [Database Coverage Matrix](docs/DATABASE_COVERAGE_MATRIX.md)
- [Prominent Source Manifest](docs/PROMINENT_SOURCE_MANIFEST.md)
- [项目路线图](docs/meta/TIANJI_PROJECT_ROADMAP.md)
- [主线恢复记录](docs/MAINLINE_RECOVERY_2026-07-09.md)
- [中医数据库审计](docs/TCM_DATABASE_AUDIT_2026-07-09.md)

历史 `APP-SPEC*`、`GAME-DESIGN.md` 和 compendium 已保存在 `database/xuanxue/compendium-new/`。中医 Skill raw source 已保存在 `database/tcm/skill-v3/`。

## 开发

```bash
npm install
npm run dev
```

- Frontend: Vite
- Backend/API: Express + SQLite
- Supervisor validation: `npm run validate:supervisor`
- Production build: `npm run build`
- Lint: `npm run lint`

## 数据边界

`database/` 当前保存 raw/reference source；规范数据库尚未建立。程序仍主要消费 `src/modules/*/data.js` 和 `src/lib/` 中的静态数据。

中医资料只用于学习参考。方药、剂量、针灸、艾灸、身体不适和急症内容必须经过条目级来源与安全门槛，不能只依赖页面免责声明或 AI 输出。
