# 八字核心修复 Fresh Code Review

- 日期：2026-07-09
- Reviewer：fresh read-only subagent `019f49f1-4e13-7481-a276-ea33d57de668`
- 范围：八字历法适配层、引擎、太阳时、两条审计脚本与专项测试
- 结论：无 Critical；1 个 Important 已修复；1 个 Minor 已在后续独立验证中关闭

## Findings 与处理

### Important：第二审计可能读取陈旧 primary artifact

原 `audit-bazi-sxtwl.py` 直接读取固定 after-fix JSON，没有证明它由当前源码刚生成，存在旧 artifact 给新 runtime 假通过的风险。

处理：脚本现在强制先运行 `node scripts/validation/audit-bazi-current.mjs`，再执行 `sxtwl` 比较；独立 artifact 同时保存：

- 当前 Git commit 与 dirty 文件列表。
- `calendar.js`、`engine.js`、`cities.js` 和主审计脚本的 SHA256。
- 刚生成的 primary artifact SHA256。

复测：30/30 四柱一致；1,296/1,296 节令时刻均在 30 秒内，最大差 20 秒。

### Minor：大运没有第二实现（后续已关闭）

`sxtwl` 不提供当前所用大运接口。30 例大运 mismatch 清零只证明 runtime 与同一个 `lunar-javascript` 口径一致，不能算第二实现。

Review 当时的处理：不冒充通过，`VAL-BZ-002` 保持 `in_progress`。

后续关闭证据：审计只从 `sxtwl` 读取相邻节令时刻，不调用 runtime `getYun()`；再按《渊海子平·论起大运法》和《三命通会·论大运》的顺逆、三日一岁与传统时辰折算规则独立推导。30 例的方向、交运日期和首运干支 30/30 一致。`VAL-BZ-002` 因此只在 `Yun Sect 1 / traditional_shichen` 声明口径下通过 V3；其他流派和吉凶解释不在结论内。

## 最终验证要求

- `npm run test:bazi`
- 两条 audit 脚本
- targeted ESLint
- `npm run build`
- `npm run validate:supervisor`
- `git diff --check`

仓库全量 ESLint 的旧模块基线错误不属于本批修复，需与上述 targeted lint 分开报告。
