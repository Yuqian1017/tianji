# CLAUDE.md — 玄学综典·天机卷 Claude Code 指引

> 本文件供 Claude Code / AI Agent 自动索引使用。

## 项目概述

中国传统术数·风水·中医·姓名学完整知识体系。九大领域 + 完整算法 + 实战案例。

### ⭐⭐⭐ CC第一步
- `CC-FIRST-TASK.md` → **先只看这个文件。做完六爻MVP再看其他。**
- `CC-TASK-XIANGSHU.md` → **面相+手相模块**（摄像头拍照→Claude Vision API分析）

### 开发规格书
- `APP-SPEC.md` → 总规格书（完整版C参考·1262行）
- `APP-SPEC-A.md` → **产品A：排盘工具**（CC先做这个）
- `APP-SPEC-B.md` → **产品B：修仙学堂**（CC第二个做）
- `GAME-DESIGN.md` → 游戏化系统+道侣系统（1307行）
- `DIFFICULTY-MAP.md` → **难度分级总纲**（必修/进阶/专研）
- `CHANGELOG.md` → 变更日志（CC每次修改必须更新）

## 文件结构

### 00 宇宙观基础（练气期）
- `00-cosmology/01-taiji-yinyang.md` → 太极·阴阳
- `00-cosmology/02-wuxing.md` → 五行生克
- `00-cosmology/03-tiangan-dizhi.md` → 天干地支
- `00-cosmology/04-bagua-64gua.md` → 八卦·六十四卦

### 01 易经（筑基期）
- `01-yijing/01-64gua-reference.md` → 64卦速查
- `01-yijing/02-guaci-yaoci.md` → 卦辞爻辞·十翼
- `01-yijing/03-interpretation.md` → 解卦方法论
- `01-yijing/04-guabian-data.md` → 互卦·错卦·综卦·64卦结构化数据

### 02 六爻（金丹期 ⭐7章）
- `02-liuyao/01-qigua.md` → 起卦
- `02-liuyao/02-zhuanggua.md` → 装卦
- `02-liuyao/03-yongshen.md` → 用神·伏神·月日·空亡
- `02-liuyao/04-jifa.md` → 生克·合冲·进退·应期
- `02-liuyao/05-duangua.md` → 分类占断
- `02-liuyao/06-case-studies.md` → 6个实战卦例
- `02-liuyao/07-koujue.md` → 断卦口诀集

### 03 梅花（金丹期）
- `03-meihua/01-meihua-yishu.md` → 起卦·体用·取象
- `03-meihua/02-quxiang-cases.md` → 取象案例集

### 04 八字（元婴期 5章）
- `04-bazi/01-paipan.md` → 四柱排盘
- `04-bazi/02-shishen.md` → 十神体系
- `04-bazi/03-geju.md` → 格局·用神·大运
- `04-bazi/04-geju-detailed.md` → 经典格局详解
- `04-bazi/05-cases-hunyin.md` → ⭐实战案例3个+合婚算法

### 05 紫微（化神期 4章）
- `05-ziwei/01-overview.md` → 十二宫·主星·四化
- `05-ziwei/02-geju-patterns.md` → 星曜格局·庙旺利陷
- `05-ziwei/03-advanced-feixing.md` → ⭐飞星四化·小限·流年断法
- `05-ziwei/04-star-details.md` → ⭐十四主星逐星详解

### 06 奇门三式（合体期 2章）
- `06-qimen/01-qimen.md` → 奇门·六壬·太乙概述
- `06-qimen/02-zhifu-zhishi-cases.md` → ⭐值符值使算法+实战案例

### 07 风水（渡劫期 3章）
- `07-fengshui/01-xuankong-feixing.md` → 玄空飞星排盘
- `07-fengshui/02-xingsha-catalog.md` → 形煞图鉴
- `07-fengshui/03-luopan-data.md` → 罗盘·二十四山·八宅

### 08 中医（大乘期 5章）
- `08-zhongyi/01-zangxiang.md` → 藏象·脏腑·四诊·辨证
- `08-zhongyi/02-jingluo-ziwu.md` → 经络·子午流注·穴位
- `08-zhongyi/03-wuyun-liuqi.md` → 五运六气
- `08-zhongyi/04-shiliao-tizhi.md` → ⭐食疗·九大体质调理方案
- `08-zhongyi/05-jingfang.md` → ⭐十大经方·方剂逻辑

### 09 姓名学（⭐NEW）
- `09-xingming/01-wuge.md` → 五格剖象法·康熙笔画·数理吉凶·三才配置

### 10 相术（⭐NEW·摄像头AI分析）
- `10-xiangshu/01-mianxiang.md` → 面相（三停·五岳·五官·十二宫·气色）
- `10-xiangshu/02-shouxiang.md` → 手相（三大主线·辅助线·掌丘·手型）

### 算法规格（reference/ 20个文件）
- `reference/liuyao-algorithm.md` → 六爻算法
- `reference/liuyao-fushen.md` → 飞伏神表
- `reference/bazi-algorithm.md` → 八字算法
- `reference/ziwei-algorithm.md` → ⭐紫微安星规则
- `reference/qimen-algorithm.md` → 奇门排盘算法
- `reference/liuren-algorithm.md` → 大六壬算法
- `reference/64gua-lookup.md` → 64卦速查
- `reference/64gua-yaoci-part1.md` → ⭐64卦爻辞全文（上经1-30）
- `reference/64gua-yaoci-part2.md` → ⭐64卦爻辞全文（下经31-64）
- `reference/64gua-search-engine.md` → ⭐64卦搜索引擎（关键词·主题·铜钱起卦）
- `reference/tiangan-dizhi.md` → 干支完整数据
- `reference/wuxing-table.md` → 五行归类全表
- `reference/changsheng-table.md` → 十二长生表
- `reference/shensha-table.md` → 八字神煞
- `reference/jieqi-table.md` → 节气时间表+算法
- `reference/zeri-basics.md` → 择日基础
- `reference/zeri-advanced.md` → ⭐黄黑道·实用择日流程
- `reference/fengshui-basics.md` → 风水入门
- `reference/glossary.md` → 术语总表
- `reference/test-cases.md` → 算法验证用例

## 开发指引

### 六爻排盘
`reference/liuyao-algorithm.md` → `02-liuyao/02-zhuanggua.md` → `reference/liuyao-fushen.md`

### 八字排盘
`reference/bazi-algorithm.md` → `reference/jieqi-table.md` → `reference/changsheng-table.md` → `04-bazi/02-shishen.md`

### 紫微排盘
`reference/ziwei-algorithm.md` → `05-ziwei/03-advanced-feixing.md`

### 奇门排盘
`reference/qimen-algorithm.md` → `06-qimen/02-zhifu-zhishi-cases.md`

### 风水排盘
`07-fengshui/03-luopan-data.md` → `07-fengshui/01-xuankong-feixing.md`

### 五运六气
`08-zhongyi/03-wuyun-liuqi.md` → `reference/jieqi-table.md`

### 姓名分析
`09-xingming/01-wuge.md` → `reference/wuxing-table.md` → `04-bazi/03-geju.md`（用神）

### 择日
`reference/zeri-basics.md` → `reference/zeri-advanced.md` → `reference/jieqi-table.md`

### 体质分析（八字+中医）
`04-bazi/01-paipan.md` → `08-zhongyi/03-wuyun-liuqi.md` → `08-zhongyi/04-shiliao-tizhi.md`

### 验证算法
`reference/test-cases.md`
