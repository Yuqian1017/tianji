# CHANGELOG.md — 变更日志与项目状态

> **CC必读**：每次修改任何文件后，必须更新本文件。这是项目的"活档案"。

---

## 当前状态

```
最后更新：2026-03-06
总文件数：67
总行数：~18,600
APP开发：未开始
CC入口：CC-FIRST-TASK.md（六爻MVP）
```

### 文件清单与状态

| 目录 | 文件数 | 行数 | 状态 |
|------|--------|------|------|
| 00-cosmology | 4 | 1,046 | ✅ 完成·已标难度 |
| 01-yijing | 4 | 775 | ✅ 完成·已标难度 |
| 02-liuyao | 7 | 1,926 | ✅ 完成·已标难度 |
| 03-meihua | 2 | 543 | ✅ 完成·已标难度 |
| 04-bazi | 5 | 1,089 | ✅ 完成·已标难度 |
| 05-ziwei | 4 | 1,359 | ✅ 完成·已标难度 |
| 06-qimen | 2 | 587 | ✅ 完成·已标难度 |
| 07-fengshui | 3 | 697 | ✅ 完成·已标难度 |
| 08-zhongyi | 5 | 1,257 | ✅ 完成·已标难度 |
| 09-xingming | 1 | 298 | ✅ 完成·已标难度 |
| reference | 20 | 5,293 | ✅ 完成·关键文件加验证警告 |
| 根目录 | 10 | ~3,700 | ✅ 索引+规格书+游戏设计 |

### APP开发进度

```
Phase 1 MVP（六爻+框架）      [ ] 未开始
Phase 2 命理（八字+梅花）       [ ] 未开始
Phase 3 高级术数（紫微+奇门+风水）[ ] 未开始
Phase 4 中医问诊                [ ] 未开始
Phase 5 工具（姓名+择日+64卦）   [ ] 未开始
Phase 6 教学+测验+游戏化         [ ] 未开始
```

---

## 变更记录

### 格式

```
## [日期] 修改摘要
- **新增** `path/file.md` — 说明
- **修改** `path/file.md` — 修改了什么（旧→新）
- **删除** `path/file.md` — 原因
- **修复** `path/file.md` — 修复了什么bug
- **APP** component/feature — 开发进度说明
```

### [2026-03-06] 初始版本建立

- **新增** `CHANGELOG.md` — 变更追踪机制
- **新增** `GAME-DESIGN.md` — 游戏化系统设计+道侣四线（含师父隐藏真线）
- **新增** `DIFFICULTY-MAP.md` — 难度分级总纲（必修/进阶/专研）
- **新增** `APP-SPEC-A.md` — 产品A排盘工具规格
- **新增** `APP-SPEC-B.md` — 产品B修仙学堂规格
- **新增** `CC-FIRST-TASK.md` — CC第一个任务（六爻MVP）
- **修改** 37个内容文件 — 添加难度标签
- **修改** 4个算法文件 — 添加验证警告（liuyao/bazi/ziwei/qimen algorithm）
- **修改** `CLAUDE.md` — CC入口指向CC-FIRST-TASK
- **修改** `APP-SPEC-A.md` — 强调先做六爻再扩展
- 开发策略：产品A先行（排盘工具）→ 产品B跟进（修仙学堂）→ 合并为C

### [2026-03-05~06] 知识体系构建（多轮迭代）

**第一轮（基础40文件）**
- 建立00-06目录 + reference，覆盖六爻·梅花·八字·紫微·奇门·六壬

**第二轮（扩展至46文件）**
- 新增07-fengshui/（玄空飞星·形煞·罗盘）
- 新增08-zhongyi/（藏象·经络·五运六气）
- 各模块补充算法规格、案例、口诀

**第三轮（补缺至54文件）**
- 新增05-ziwei/03-advanced-feixing.md（飞星四化·小限·流年）
- 新增06-qimen/02-zhifu-zhishi-cases.md（值符值使算法+案例）
- 新增08-zhongyi/04-shiliao-tizhi.md（食疗·九大体质方案）
- 新增08-zhongyi/05-jingfang.md（十大经方）
- 新增reference/zeri-advanced.md（黄黑道·择日流程）
- 新增09-xingming/01-wuge.md（五格剖象法）
- 扩充reference/wuxing-table.md（+15行多维对应）

**第四轮（完善至61文件）**
- 新增reference/64gua-yaoci-part1.md（上经30卦全部爻辞）
- 新增reference/64gua-yaoci-part2.md（下经34卦全部爻辞）
- 新增reference/64gua-search-engine.md（搜索引擎）
- 新增04-bazi/05-cases-hunyin.md（3个实战案例+合婚）
- 新增05-ziwei/04-star-details.md（14主星逐星详解）
- 扩充reference/tiangan-dizhi.md（半合·暗合·综合判断函数）

**APP规格书**
- 新增APP-SPEC.md（1,262行完整开发规格）
- 覆盖9大领域AI Prompt + Context管理 + UI设计

---

## CC工作指引

### 修改文件时

```
1. 修改文件
2. 测试/验证修改正确
3. 更新本CHANGELOG：
   a. 在「变更记录」顶部添加新条目
   b. 更新「当前状态」表中的行数和状态
   c. 如果是APP开发，更新进度条
4. 如果新增/删除文件，同步更新 CLAUDE.md 的文件索引
```

### 新增文件时

```
1. 创建文件
2. 更新 CLAUDE.md 的文件索引
3. 更新 README.md 的目录结构（如果目录变化）
4. 更新本 CHANGELOG
5. 如果涉及APP，更新 APP-SPEC.md 的文件索引表
```

### APP开发时

```
1. 按 APP-SPEC.md 的Phase顺序开发
2. 每完成一个Phase，更新本CHANGELOG的进度条
3. 遇到需要修改knowledge文件的情况（如算法有误），先改knowledge再改APP
4. 所有算法变更必须跑 reference/test-cases.md 中的验证用例
```
