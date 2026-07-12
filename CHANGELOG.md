# Changelog

## 2026-07-11 - PRD v2：产品主线翻转为修仙恋爱教学游戏

- 重写 `docs/PRD.md`（v2.0）：主线从"数据库治理优先"翻转为"游戏本体优先"——玩的过程就是在用知识，角色即课程，权威数据库为底色（世界物理法则），寓教于乐。旧 V0→P4 串行阶段结构作废。
- 新增教学体系设计：知识点模型（KP，典籍出处硬要求）、五阶掌握度状态机（见过→用过→掌握→内化，剧情行为驱动）、五类教学时刻（示范/引导/独立/教授/回响）、认知负荷规则（每章 ≤3 新 KP）、间隔复用规则、隐形评估（抉择点即测验，verdict + source_ref 可 lint）。
- 修仙融合：境界=学习阶段映射、渡劫=综合剧情案例（非考试）、灵力/掌握度/好感三数值分离。
- 新增 bonus 章节体系（情感章/游戏章/私教章）与 NPC 性别可选方案（角色位双性别变体，骨架共享，成本 +25% 非 ×2）。
- 数据库条款处置：DB/SAFE/TOOL/DATA 与四层来源模型原样继承；ASM/EDU/GAME 变形继承；审计改跟随制（章节 KP 清单牵引）；知识库首期走 `database/knowledge/` 文件层不建表。
- 旧 PRD v0.1 归档至 `docs/archive/PRD_v0.1_governance_2026-07-11.md`；新建 `CUSTOMER_REQUIREMENTS.md`（F1–F6）。
- 首个垂直切片定为六爻域《第一卦》：3 个 KP、真实摇卦交互（复用已验证引擎）、验收含"玩家通关后能独立起卦"。

## 2026-07-11 - 完成《素问要义》首轮引文人工裁决

- 在 adjudication/normalized 层将错误拼接的 `逆春气则伤肝,夏为寒变` 校正为底本原句 `逆之则伤肝,夏为寒变`，并记录同篇另一句 `逆春气,则少阳不生,肝气内变`；导入的 Skill 原文件保持原哈希不改。
- 对其余 28 条机械未命中项逐条分类并回接原文行：删节、拼接、改写、编辑性说明、王冰注、后世概括、现代括注和遗篇 OCR 差异不再混称为《素问》直引。
- 111 条引文现为 12 条原字符命中、64 条规范化连续命中、7 条省略分段命中、28 条人工形态裁决，待人工 0；693 项审计 0 fail，全部内容仍 blocked。

## 2026-07-11 - 建立中央参考文献与典籍来源库

- 将 `database/sources/` 定为全项目统一来源入口，新增可重建的 `source-library.json` 和使用说明；现有正文保持单一 canonical 文件，不复制、不静默搬动。
- 索引 252 个来源文件：43 份中医原文/状态、50 份中医整理稿、14 份现代边界证据、两套各 70 份 compendium、共享文本见证、相术来源清单、GeoNames 与许可文件。
- vision-api compendium 中 46 份仍与 canonical 相同，24 份因后续校正已成为历史变体；索引逐文件标记并固定 SHA256。

## 2026-07-11 - 《素问要义》引文原文命中清单

- 从 `42-经典-素问要义.md` 抽取 111 段显式引文，对照本地《黄帝内经素问》全文：12 段原字符连续命中、63 段去格式/标点后连续命中、7 段省略号分段命中、29 段进入人工裁决。
- 新增 `tcm-classic-quote-provenance.json`、构建/审计脚本和专项测试；561 项来源哈希、定位、唯一性与运行时阻断检查 0 fail。
- 文本命中只证明所选本地见证存在相应字符，不自动授证整理稿解释、现代医学类比、方药剂量或产品用途；全部记录继续 blocked。

## 2026-07-11 - 相术两份 raw 完成逐行裁决

- 将课程标签、编辑性师父引语、JavaScript 外壳、AI 功能说明、免责声明和导航与传统知识分开；它们保留在 raw，但不再虚增“待找古籍出处”数量。
- 以《神相全编》气色段和《Indian Palmistry》辅助线见证裁决剩余气色、命运线、太阳线与健康/肝线；婚姻线、耳低人格、小指歪斜人格仍明确记为未定位来源。
- 两份相术 raw 的 386 条非空行现为 100 条结构行、286 条已裁决行、0 条无人裁决；7 个来源记录、37 段摘录、45 条规范主张、41 条旧文裁决共 534 项审计 0 fail。未定位、冲突和扩写项继续 blocked，不以“待办为 0”冒充内容全对。

## 2026-07-11 - 相术五官旧文逐组裁决

- 回接《神相全编》当前见证中的额、眉、眼、鼻、口、颏六组原文；原典存在的传统判断进入 source-pinned core，旧库附加的现代人格、能力、职业、健康和数值阈值不随之晋升。
- 六组旧文统一裁定为“部分有见证、附加主张未定位”，继续保留原 raw；相术累计 191 条记录已裁决、95 条待找出处，34 段摘录、42 条规范主张、24 条旧文裁决共 453 项审计 0 fail。

## 2026-07-11 - 相术十二宫与掌相传统分层

- 以《神相全编》当前见证逐宫校正十二宫位置：田宅宫由旧库“眉眼之间”改为“两眼”，保留妻妾/夫妻、男女/子女、奴仆/交友的新旧称，并记录编号十二宫以相貌宫收尾、父母宫另见总诀的版本差异。
- 识典《神相全编》卷八见证固定三才纹、天/地/人纹与一般指形原文，但不据此把现代生命线/智慧线/感情线映射及具体手指能力扩写晋升为已验证内容。
- 行星掌丘明确归类为西方手相传统，与中国八卦掌位分层；仅来源支持的名称和位置可进入文化学习运行时，火星正丘/负丘/平原及人格吉凶解释继续待证。
- 相术 raw 仍为 386 条非空行，已裁决记录增至 142 条，待找出处降至 144 条；6 个来源记录、28 段界定摘录、36 条规范主张、18 条旧文裁决共 381 项审计 0 fail。

## 2026-07-10 - 数据库改为典籍见证优先

- 新增 `DATABASE_SOURCE_DOCTRINE.md`，把典籍见证、传统解释、现代边界和产品呈现拆成四层；卫健委、药监与药典只承担现代身份/安全/使用边界，不替代传统文献。
- 建立相术首批来源核心：两份 raw 的 386 条非空行全部入 inventory，31 条已进入首批裁决、255 条知识承载行待找出处；4 个文献见证、11 段短摘录、18 条传统条目和 13 条旧 compendium 裁决共 199 项审计 0 fail，原文件哈希不变。
- 确认《神相全编》等确有外观到衣禄、贵劳等传统判断；旧“上停长少年得志、学业佳”与当前见证“上停长少年忙”冲突，按原文/现代扩写分层保存。
- 面相/手相运行时策略从整体排除解释改为只允许 source-pinned 文化讲解；无出处扩写和医疗、财务等现实决策用途继续 blocked。

## 2026-07-10 - 相术几何旋转不变性修复

- 面部对称性改为沿额头到下巴中轴的法向投影，不再直接比较图片 x 坐标。
- 小指是否达到无名指关节改为沿腕点到无名指尖轴投影，不再直接比较图片 y 坐标。
- 新增合成关键点旋转属性测试：面部旋转 30°、手部旋转 90° 前后结果保持一致。

## 2026-07-10 - 手部几何单位与掌丘伪测量修复

- 修正手指间距单位错配：MediaPipe 路径输出角度，运行时改为直接显示逐指角度，不再用 `0.06` 归一化阈值误判宽窄。
- 移除以 MCP/PIP/腕点深度冒充掌丘饱满度的估算；21 个手部关键点不支持掌丘表面测量，AI 输入和 UI 不再显示该伪结果。
- 新增合成关键点回归，固定 `moundEstimates` 不得重新进入特征合同，并验证旧字段即使出现也不会进入 AI prompt。

## 2026-07-10 - 面相与手相解释层隔离

- 面相三停、眉距和下巴描述只保留几何差异，不再把比例直接写成少年/中年/晚年运、人格或行动力。
- 手相指长、指缝、掌纹和丘位只保留外观描述；人格、职业、能力、财富、关系与现实运势推断统一 blocked。
- 面相/手相 prompt 与模块说明改为传统术语学习边界；新增运行时回归固定结构字段和 AI 输入不得消费未验证解释。

## 2026-07-10 - 中医附方实体化与来源计数缺口

- 将 `24-30` 方剂分册中的显式附方拆成 180 个独立 blocked 实体，逐条保留来源文件、行号和原文。
- 发现第 25 分册声称 45 个附方但正文只明确列出 43 个；不补造缺失方名，新增 finding 并保持 2 个来源缺口开启。
- `audit:tcm-formula-catalog` 扩展到 21 个 finding、11,762 项检查，0 fail；84 个运行时及相邻文件仍未消费该候选 core。

## 2026-07-10 - TCM food-medicine directory adjudication

- 固定国家卫健委当前 106 项食药物质目录：2002 年 87 项、2019 年 6 项、2023 年 9 项、2024 年 4 项。
- 逐项裁决 Skill A 级清单 15 项和 8 条明确食疗/药食配方主张；15 项中 13 项匹配目录，绿豆、核桃仁不继承目录身份。
- 38 个配方原料引用中 18 个匹配、5 个身份/炮制缺口、15 个不在目录；所有配方、剂量、病种和特殊人群用法继续 blocked。
- 新增 48 项 0 fail 审计、6 项专项测试与 84 文件运行时旁路扫描。

## 2026-07-10 - TCM runtime semantic closeout

- 修复望诊 follow-up UI 与安全 prompt 不一致：移除“追问具体调养方法”，统一为颜色、形态和拍摄质量范围提示。
- 移除普通八字的健康快捷分析与诱导示例；手相和面相不再把生命线、疾厄宫或几何特征转化为体质、疾病、寿命或养生结论。
- 去掉面型几何分类中无法由当前模型证明的面白/青/黑/红/黄字段。
- 增加运行时回归，覆盖望诊、八字、手相和面相的首轮与追问边界；奇门疾病用神、风水病符/化解旧表保持未消费且未授证。

## 2026-07-10 - TCM classics and food-therapy inventory

- 完成剩余 `references/42-48` 的 1,142 条非空行、8 表/79 表格行和 145 标题完整 blocked inventory；TCM 50 个 reference 至此全部进入逐批 inventory。
- 新增 603 条重叠窄风险视图、20 个重点裁决、官方 comparator、6 项专项测试与 `audit:tcm-classics-food`；14,281 项检查 0 fail。
- A/B 级、食疗级和药食两用均降为来源自述；旧 `tcm-data.js` 无 importer，八字健康食疗 runtime blocked；106 项食药物质和逐条剂量/疗效仍待现行裁决。

## 2026-07-10 - TCM formula catalog inventory and safety boundaries

- 完成 `references/24-30` 的 820 条非空行、8 表/171 表格行、81 标题和 186 个格式化方剂定义的完整 blocked inventory。
- 新增 522 条重叠窄风险视图（含 158 条禁忌/慎用）、20 个重点裁决、官方 comparator、6 项专项测试与 `audit:tcm-formula-catalog`；11,395 项检查 0 fail。
- 修复括号出处格式漏掉九味羌活汤、黄连解毒汤、九仙散、紫雪的问题；182 个教材正方逐分册计数匹配，4 个经典锚点另计。同名异方、青木香、重金属、急症替代、催吐、妊娠和现代适应证均保持 blocked。

## 2026-07-10 - TCM herb catalog inventory and safety boundaries

- 完成 `references/15-23` 的 1,331 条非空行、45 表/279 表格行、122 标题和 100 条实际病证反查完整 blocked inventory。
- 新增 663 条重叠风险候选、20 个重点裁决、官方 comparator、8 项专项测试与 `audit:tcm-herb-catalog`；14,281 项检查 0 fail。
- 确认原文“103 条”实际缺 52-54，并有 `47→36`、`60→55` 两处逆序；儿童比例剂量、6 条毒物处置、49 条外用路线、马兜铃酸、砷汞铅、21 条现代用途/疗效和急症反查均保持 blocked。

## 2026-07-10

### fix: 全量归一化并审计中医基础理论、四诊与辨证候选层

- 全量 inventory Skill `01-14` 的 14 个 reference、836 条非空行、31 张表、157 个表格行和 124 个二/三级标题；全部保持 product blocked。
- 新增 127 条诊断、治疗、预防、剂量和现代外推优先视图；该视图只作人工复核路由，不代表完整临床语义。
- 用 NCCIH、WHO、CDC、CCMQ 与诊断一致性/脉诊可靠性系统综述建立现代证据边界；确认 14 个代表性 finding。
- 阻断板蓝根/大青叶防流感、地域/体型定剂量、“胜毒”、体质决定发病、小儿指纹判危、舌脉直接定位疾病和固定卒中先兆等外推。
- 新增规范候选、证据快照、6 项专项测试和 `audit:tcm-theory-diagnosis`；5,064 项检查 0 fail，84 个运行时/邻接文本文件未导入该候选 core 或 finding ID。
- fresh review 纠正“诊断/外治旁路为 0”的过宽文档声明；旧 `tcm-data` 与望诊追问仍含未授证传统诊断/食疗文字，留作后续运行时语义审计。

### fix: 全量归一化并审计中医内科病种红线

- 全量 inventory `31-37` 的 52 个主病种、689 条非空行、22 张表、133 个表格行；另建 83 条关键词风险和 308 条广义可执行处置候选视图，全部保持 product blocked。
- 用 CDC、AHA/Red Cross、NIDDK、NIH MedlinePlus、WHO、HRSA、Red Cross 和 NHLBI 官方资料核验现代急症识别与升级边界。
- 确认 9 条冲突/无依据内容，新增阻断上消化道出血固定剂量和急腹症方药替代；9 条现代急症升级红线获有边界支持。
- 自杀风险原文缺即时危险升级，痉证气道护理混入口腔操作措辞，2 条均按混合边界 blocked。
- fresh review 发现 83 条关键词视图不能代表完整风险面；新增 308 条广义处置扫描并明确两种视图都不是临床语义全量授证。
- 新增规范候选、官方 comparator、8 项专项测试和 `audit:tcm-disease-red-flags`；2,589 项检查 0 fail，84 个运行时/邻接文本消费者无旁路。

### fix: 全量归一化并审计中医穴位与外治安全候选层

- 全量解析 Skill `38-41` 的 361 经穴、40 奇穴、3 级操作标签、240 条操作/风险声明和 27 组病证处方；30 个旧运行时穴位全部建立候选映射。
- 以 GB/T 12346-2021、GB/T 40997-2021 确认现行状态与 362/51 范围；逐名比较降级为固定二级转录候选，提示本地缺 1/17、3 个经穴名差异、6 个未匹配奇穴及 2 类身份/重复问题。
- 确认 `GB31 风市` 保留旧版腘横纹上 7 寸，现行标准为 9 寸；因未保存现行完整定位正文，全部 401 条定位继续 blocked。
- 否定全局 A 级家庭按压、A- 家庭艾灸和针刺处方向家庭按压/艾灸的无证据外推；胎位不正固定成功率与晕针家庭处置扩展一并阻断。
- fresh review 发现风险正则漏掉普通按摩/耳穴表格后，补齐 763 条非空原文行、27 表/471 表格行的 blocked inventory；14 项专项测试和 4,904 项审计 0 fail，84 个运行时/邻接文本消费者无旁路。

### fix: 全量归一化中医妊娠、配伍、马兜铃酸与方剂警示候选层

- 将 Skill 的妊娠 3 行/35 项、十八反 3 组、十九畏 9 组、马兜铃酸说明及 31 行/37 方名警示拆为稳定候选记录；全部保持 product blocked。
- 为 109 个比较药名建立 2025 药典一部目录身份索引和 2020 数字药典历史注意字段快照；记录 13 条妊娠等级冲突，且不把 2020 历史支持冒充 2025 现行结论。
- 展开十八反 50 个主表药对和 2 个明确补充药对，52/52 有历史注意字段支持；十九畏 10 对仅 7 对有历史支持，另有 2 个名称类扩展缺支持。
- 按 2003/2004 监管通知纠正 Skill 马兜铃酸名单混批次、遗漏朱砂莲及混同广防己的问题；现行处方/标准状态未完全裁决前不作法律结论。
- 阻断瓜蒂散、三圣散两行家庭催吐/处置式内容；新增来源快照、规范候选、13 项专项测试和 `audit:tcm-pregnancy-compatibility`，1,969 项检查 0 fail。
- fresh review 未发现 parser/core 的 P0/P1；修复 runtime 旁路只扫描 `src` 的 P2，现显式覆盖 84 个前端、服务端、JSON、入口和配置文本文件。

### fix: 全量归一化并审计中医药典候选层

- 将 Skill 安全表 100 行/101 味逐行转为可回指 raw locator 的候选 schema；所有剂量和运行时字段保持 blocked。
- 以 2025 版药典一部品名目录核对身份：79 味命中、22 味缺失或未裁决；校正“三棵针”为“三颗针”，保留贯众歧义和光慈菇/山慈菇边界。
- 以国家药典委员会 2020 数字药典作历史对照：79 味命中，41 味克数覆盖一致，38 味存在数量差异；不把 2020 值冒充 2025 现行标准。
- 检出并阻断 11 行急救/居家解毒内容；记录十八反主表“沙参(苦参)”混名错误，当前中医运行时剂量和急救旁路均为 0。
- 新增固定来源快照、规范候选、6 项专项测试和 `audit:tcm-pharmacopoeia`；2,468 项全量检查 0 fail。

### fix: 固定并验证共享城市与民用时区核心

- 将 374 个现有城市标签绑定 GeoNames ID、WGS84 坐标、国家码、IANA zone 和固定原始行快照；拉斯维加斯由错误山地时区改为 `America/Los_Angeles`。
- 真太阳时由固定标准经线改为按当地民用日期解析历史 UTC offset/DST；重复和跳过时刻默认拒绝，不静默归一化。
- 按 NOAA 修正闰年 fractional-year 分母为 366；八字、八字健康、紫微、奇门和城市选择器统一使用共享 API。
- 132,836 项审计 0 fail，含 374 条来源行、276 个中国城市省级行政区合同、73,414 日均时差、17,952 城市时点和 10 个转换 fixture；全库测试 103/103，桌面和 390×844 用户路径通过。
- 宿主 tzdb 版本、任意坐标、时区边界多边形和重复时刻前/后实例选择保持明确边界。

### fix: 固定并全量验证子午基础时辰经脉对应

- 按《针灸大成》固定 12 时辰、12 经脉、脏腑标签和循环顺序；明确使用分钟精度的本地民用时钟。
- 全天 1,440 分钟、12 行有限表、循环、来源见证和运行时边界共 4,457 项审计 0 fail；专项测试 7/7。
- 裁定原文连续段“午时手太阴心经”为本地 OCR/排印冲突，依据同书总表与心经章采用“手少阴心经”，并保留裁定记录。
- 移除 Ziwu 页面及八字健康旁路的“经当令、排毒、最佳补肾、提示肺问题”等旧医学化文案。
- 纳甲、纳子、六十六穴开穴、灵龟八法、针刺补泻和所有临床解释继续 `not_implemented/blocked`。

### docs: 完成第二轮主 PRD fresh review

- 独立只读 reviewer 结论为 `HOLD`：5 个 P1、2 个 P2，无 P0 finding。
- 记录无界 V0、P1 缺最小工具闭环、P0 缺可消费 Database、规范答案缺流派口径、掌握度与反刷题无算法合同等问题。
- 当前按用户明确要求继续全库验证；PRD 后续不得把本轮任务固化为首个教学切片的永久串行门槛。

### fix: 修复并全量验证五运六气基础年结构

- 以《素问》《医宗金鉴》和教材交叉固定十干中运、主客运太少、十二支司天在泉与主客六气。
- 补齐旧实现缺失的主运太少；五运边界改为春分后 13 日、芒种后 10 日、处暑后 7 日、立冬后 4 日交运。
- 修复非法年份/干支静默接受和“厥阴风木”被截成“阴风木”的 UI 问题。
- 60 年基础结构自动审计 3,325 项 0 fail；专项测试 9/9，桌面与 390×844 产品路径通过。
- 古法交司时刻、平气/天符/岁会/胜复和现实气候/医学解释继续 `not_implemented/blocked`。

### fix: 隔离未验证中医消费并建立首批安全规范库

- 核验中医 Skill v3 的 98 个 manifest 条目、50 个 reference 和 42 个原文 txt；本地与安装副本及上游 `966a88a` 一致，本地仅增加 SHA256 manifest。
- 归档旧体质/子午消费：34 题、9 套调养、28 个药物标签、22 个具体计量项和 30 个去重穴位；体质判定和药茶/艾灸方案暂停。
- 子午流注仅保留传统结构；五运六气移除脏腑/疾病/食疗；望诊限制为可见图像特征；八字健康继续 blocked。
- 规范化 28 项法定毒性中药 blocklist；Skill 的 100 行/101 药名剂量表因未按 2025 药典逐药校准继续 blocked。
- 新增 `audit:tcm-safety`、9 项中医测试、规范/legacy JSON 和验证报告；自动审计 213 项 0 fail。
- 体质、子午、五运、望诊在桌面和 390×844 移动端完成产品路径回归；旧医疗动作词为 0、无横向溢出、console 0 error/warning。

### fix: 修复并全量验证风水下卦确定性核心

- 声明“玄空飞星·沈氏下卦·正向盘”口径，修正二十四山三元龙/阴阳、山向盘同元龙顺逆、立春年界、节令月界和 2000 年后八宅命卦公式。
- 下卦只接受每山中线左右各 4.5 度；替卦、兼向与出卦未实现时显式拒绝。
- 项目内 216 张盘、6,469 项检查 0 fail；`@soul-atelier/xuankong@0.2.1` 的 6,048 个盘面字段 0 mismatch；tyme4ts 对 10,228 时刻的 30,684 个年/月边界字段 0 mismatch。
- 新增 `database/fengshui/fengshui-core.json`、双审计 artifact 和验证报告；旧 Vision API 副本标为 non-canonical。
- UI/AI 移除吉凶色、疾病财务组合、摆件/施工化解建议；只保留已验证盘面结构，传统解释继续 `not_validated`。

### fix: 修复并全量验证奇门遁甲确定性核心

- 声明“时家奇门·拆补转盘·中五寄坤二·天禽随天芮”口径，修复节气整日切换、符头三元、九宫地盘、六甲遁干、值符值使、九星八门八神和天盘干。
- 奇门输入增加分钟并贯通真太阳时与历史记录；非法日期、小时和分钟改为显式拒绝。
- 项目内 2020-2024 共 23,751 盘、1,900,230 项检查 0 fail；`3meta@2.6.0` 奇门核心 0 mismatch；`kinqimen@0.3.1` 共享口径 189,789 字段 0 mismatch。
- 新增 `database/qimen/qimen-core.json`、三层审计脚本和 9 项回归测试；旧 Vision API 副本标为 non-canonical。
- 格局、用神、疾病、诉讼、财务、方位和现实预测保持 `not_validated`；AI/UI 改为文化学习边界。

### fix: 修复并全量验证紫微斗数确定性核心

- 以整除/奇偶余数公式重建紫微安星表，修正旧表 100/150 格错误，并修复廉贞偏移、辛年魁钺、大限起宫和宫干。
- 无效公历日期、时辰、性别及内部不可能状态改为显式拒绝，不再静默归一化或回退到土五局/子宫。
- 项目内 2,880 盘、314,200 项检查全部通过；隔离 `iztro@2.5.8` 对照 325,440 字段，0 mismatch。
- 新增 `database/ziwei/ziwei-core.json`、`audit:ziwei`、第二实现审计和 7 项回归测试。
- 星性、格局、婚财、健康、飞星与流年断语保持 `not_validated`；AI/UI 已阻断疾病和高风险事实推断。

### fix: 校勘并规范化《周易》六十四卦核心库

- 逐条解析 64 卦、450 条卦爻辞，与维基文库固定快照对照，并用中国哲学书电子化计划裁决 12 卦差异。
- 修正 7 处经文问题，将剩余字形、转录与版本分歧写入 19 条 adjudication registry；革卦已/巳/己分歧不宣称唯一定本。
- 机械重算六爻错综互变换和京房八宫，修正 16 处综卦、5 处八宫和 48 处世爻错误。
- 修正铜钱起卦示例、上爻命名代码与《说卦传》「旉」摘录；传统作者说、固定吉凶和多动爻取法改为有边界的教学表述。
- 新增 `database/yijing/zhouyi-core.json`、`audit:yijing` 与 7 项回归测试；1,446 项审计检查全部通过。
- 关键词、简释、整卦吉凶和现实预测仍为 `not_validated`，不进入规范核心库。

### fix: 修复并全量验证梅花易数确定性结构

- 修复八卦二进制被二次反转造成的互卦、变卦错误，并纠正 Compendium 中“风泽中孚初爻变巽为风”的错误例题。
- 时间起卦改用农历月日、农历年支和时支；闰月明确沿用本月序数，不再使用公历近似。
- 删除错误手抄笔画表和 Unicode 码位估算，改用 Unicode 17.0 Unihan 机械生成的 20,992 字版本化数据库。
- 全量验证 64 卦名、384 种动爻结构、4,096 组报数、经典观梅例、农历边界与全部笔画条目；63,061 项检查均无差异。
- 体用只保留结构关系；现实吉凶与预测标为 `not_validated`，现代文字法标为 `source_pinned_modern_adaptation`。

### fix: 修复并全量验证六爻确定性排盘

- 按《卜筮正宗》修复乾外纳壬、坤外纳癸；纳甲 schema 拆分内外天干。
- 六爻年建、月建与日辰改用已验证历法适配层，移除固定日期近似；非法爻值改为显式拒绝。
- 全量验证 64 静卦、4,032 个动爻组合、八宫世应、六亲六神、旬空与伏神；17,026 项项目内检查及第二实现 33,408 字段比较均无差异。
- 排盘结构标为 `validated_deterministic`；现实预测与吉凶解释标为 `not_validated`，AI 不再输出无条件成败或高风险行动建议。

## 2026-07-09

### fix: 完成八字关系查表并隔离合化与吉凶

- 全量核验天干五合、地支六合/六冲/三合/三会/六害/相刑/自刑，以及桃花、驿马、华盖 36 项映射。
- 修复寅巳申、丑戌未只有三支齐全才报刑的漏检；两支相刑现在按方向输出，三支齐全只汇总一次。
- 三合、三会不再用标签宣称已化出五行，候选化神与 `not_evaluated` 状态分离。
- 相破因古籍版本差异保持 inactive；关系与神煞 UI 使用中性色并明确不判合化或吉凶。

### fix: 降级未校勘身强用神并阻断八字健康推断

- 以两条《滴天髓阐微》命例复核旧版身强/用神模型，确认 `/100` 无经典量表依据，统一“身旺喜克泄耗”存在直接反例。
- 身强分数仅保留作历史兼容；UI 与 AI 输入改为 `heuristic_only` 初筛，不再显示 `/100` 或确定用神方向。
- 五行条形图明确为“天干 1、藏干 0.5”的结构计数，不再暗示五行旺衰。
- 八字健康模块加入硬 validation gate；当前、旧历史与 AI 通道均不再生成脏腑风险、疾病、食疗或大运健康结论。

### fix: 修复八字历法核心、大运与太阳时

- 以现有 `lunar-javascript@1.7.7` 适配层替换八字 runtime 的手写节气、近似节气和本地 `Date` 日柱计算。
- 修复一月出生的大运前/后节搜索，固定 `Yun Sect 1 / traditional_shichen` 口径，新增起运年月日、交运公历日期和口径元数据，同时保留整数年龄兼容字段。
- 真太阳时标准时口径加入 NOAA 均时差；四个排盘调用点和城市预览统一使用日期化 offset。
- 均时差严格使用 NOAA 公式固定的 365 日分母，避免闰年年末出现约 27 秒的额外偏差。
- 新增 15 项八字回归/属性测试：30 例修复后 mismatch 清零，1920-2027 的 2,592 次节令侧检查与 39,447 日连续性通过。
- 以隔离安装的 `sxtwl@2.0.7` 做第二实现复核：30/30 四柱一致，1,296 个节令时刻最大差 20 秒；同时纠正审计脚本跨年取小寒的问题。
- 使用 `sxtwl` 相邻节令与《渊海子平》《三命通会》规则独立推导 30 例大运，方向、交运日期和首运干支 30/30 一致；结论仅覆盖声明口径，不包含吉凶解释。
- 第二审计强制先重建当前 runtime artifact，并记录 commit、dirty 状态、关键源码与 primary artifact SHA256，关闭 fresh review 发现的陈旧证据风险。
- 天干五合、地支六合输出不再把两干/两支同现直接写成“合化”；午未的火/土分歧保留为候选元数据，runtime 只显示可确认的“午未合”。
- 历史夏令时、身强/用神、地支关系与神煞继续留在 validation ledger，不随本次确定性修复自动通过。

### docs: 恢复天机卷主线与数据库治理基线

- 新增 `docs/PRD.md`，把当前排盘/问诊/相术工具定位为 Product A，并恢复 Product B 教学游戏与 Product C 统一产品主线。
- 新增 `docs/DATABASE_COVERAGE_MATRIX.md`，记录各知识域的 raw、runtime、normalized、reviewed 与 learning 覆盖。
- 新增 `docs/PROMINENT_SOURCE_MANIFEST.md`，登记玄学 compendium、中医 Skill 和当前代码的来源、版本关系、许可与校验状态。
- 新增项目术语表、路线图、任务监督器和校验脚本。
- 将项目 README 从 Vite 模板改为天机卷入口文档。

## 2026-03-13c

### feat: 面相 + 手相模块 (Face & Palm Reading Modules)

Added two new xiangshu (相术) modules using MediaPipe browser-side ML for feature extraction. Photos never leave the device — only structured text is sent to the LLM.

#### Face Module (`src/modules/face/`)
- **`data.js`**: Five-element face types (金/木/水/火/土), three-stop labels, twelve palaces, descriptor functions for eyes/nose/mouth/brows/chin/yintang/symmetry
- **`engine.js`**: `buildFaceTextMessage()` converts ML-extracted 468-point features into structured Chinese text for LLM
- **`prompt.js`**: System prompt with embedded 面相学 knowledge — 五行面型, 三停, 五官, 十二宫, analysis order, style requirements
- **`FaceModule.jsx`**: Camera capture → MediaPipe face detection → feature extraction → text-only LLM analysis → chat with follow-up

#### Palm Module (`src/modules/palm/`)
- **`data.js`**: Five-element hand types, 4-question palm line questionnaire (life/head/heart/fate lines with multiple-choice options), mound names (九大掌丘), finger meanings, descriptor functions
- **`engine.js`**: `buildPalmTextMessage()` combines ML features + questionnaire answers into structured text; `buildPalmVisionMessage()` for optional Vision API deep analysis
- **`prompt.js`**: System prompt with hand reading knowledge — palm lines (includes "生命线长短≠寿命" disclaimer), mounds, finger analysis, 2D:4D ratio
- **`PalmModule.jsx`**: Multi-step flow: capture → ML hand analysis → palm line questionnaire → text LLM → chat. Optional "AI视觉深度分析" button sends photo to Vision API for detailed palmistry

#### Shared Components
- **`PalmLineQuestionnaire.jsx`**: 4-question radio-button questionnaire for palm lines (MediaPipe can't detect fine skin lines)

#### App Integration
- **`App.jsx`**: Added face/palm imports, two new tabs under "相术" divider section, multi-divider support (`tab.id.startsWith('divider')`)
- **`HistoryDrawer.jsx`**: Added `face: '面相'` and `palm: '手相'` to MODULE_LABELS with face shape / hand type summaries

## 2026-03-13b

### feat: 用户账号系统 (Username/Password Authentication)

Added Express + SQLite backend with JWT authentication. Each user has isolated history records.

#### Backend (`server/`)
- **`server/db.js`**: SQLite database (`tianji.db`) with `users`, `history`, `config` tables. Auto-seeds `junshi` (user) and `admin` (admin) accounts on first run. WAL mode for concurrent reads.
- **`server/auth.js`**: bcryptjs password hashing + JWT (30-day expiry) sign/verify utilities. Secret auto-generated and stored in SQLite `config` table.
- **`server/middleware.js`**: `requireAuth` middleware — extracts Bearer token, validates JWT, attaches `req.userId/username/role`.
- **`server/routes/auth.js`**: `POST /register`, `POST /login`, `GET /me` endpoints. Input validation, duplicate username check, role assignment.
- **`server/routes/history.js`**: Full CRUD (`GET /`, `POST /`, `DELETE /:id`) + `POST /migrate` (bulk import, idempotent INSERT OR IGNORE) + `GET /export` + `DELETE /all`. All queries scoped to authenticated user.
- **`server/index.js`**: Express entry point on port 5821, JSON body limit 10MB, health check at `/api/health`.

#### Frontend Changes
- **`src/lib/api.js`** (new): Auth-aware `apiFetch()` wrapper — auto-injects JWT from localStorage, handles 401 with logout callback.
- **`src/lib/history.js`** (rewritten): All functions now call server API instead of localStorage. Keeps `loadHistoryFromStorage()` for one-time migration detection. Retains `formatTimestamp()`.
- **`src/components/LoginPage.jsx`** (new): Xianxia-themed login/register page with toggle, form validation, error display. Uses existing CSS variables for consistent theming.
- **`src/App.jsx`**: Added `user`/`authLoading` state, token validation on mount (`GET /me`), conditional `<LoginPage>` rendering, localStorage→server migration on first login, optimistic history upsert with async server sync, logout handler. All 11 module components unchanged (same 7-prop interface).
- **`src/components/SettingsPanel.jsx`**: Added "账号信息" section showing username + admin badge + logout button. Export/import/clear now use API endpoints.

#### Config Changes
- **`vite.config.js`**: Added `/api` proxy to `http://localhost:5821` for dev
- **`package.json`**: Added `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `concurrently`. Dev script runs both Vite and Express via `concurrently`.
- **`.gitignore`**: Added `tianji.db`

#### Seed Accounts
- `junshi` / `tianji123` (role: user) — existing localStorage records auto-migrate here
- `admin` / `admin123` (role: admin) — empty history

#### Migration
On first login, if `tianji-history` exists in localStorage, all records are bulk-imported to the user's server account via `/api/history/migrate` (idempotent). localStorage is cleaned after successful migration.

---

## 2026-03-13

### feat: 望诊模块 + 真太阳时校正

Added visual diagnosis (望诊) as the 11th module, and true solar time correction for birth-time modules.

#### Module 11: 望诊 (Visual Diagnosis via AI Vision)
- **`src/modules/wangzhen/data.js`** (~70行): 3 diagnosis types — tongue (舌诊, 6 dimensions), face (面诊, 8 dimensions), palm (手诊, 5 dimensions), each with capture guidance
- **`src/modules/wangzhen/engine.js`** (~50行): `buildVisionMessage()` constructs Anthropic multimodal message (image + text), `buildFollowUpMessage()` for follow-up
- **`src/modules/wangzhen/prompt.js`**: 6-step analysis system prompt (整体印象→逐项分析→脏腑判断→体质倾向→调养建议→进一步建议) + medical disclaimer
- **`src/modules/wangzhen/WangzhenModule.jsx`** (~280行): Standard 7-prop module — diagnosis type picker (3 cards), capture guidance with dimensions, optional symptom input, camera/upload → AI vision analysis (streaming) → follow-up chat. History stores type+note only (no base64 images)

#### Camera & Vision Infrastructure
- **`src/lib/camera.js`** (~60行): `openCamera()` (prefers user-facing camera, Chinese error messages), `captureFrame()` (canvas→JPEG base64 at 0.85 quality), `stopCamera()`
- **`src/components/CameraCapture.jsx`** (~210行): States: idle→requesting→streaming→captured→error. Supports live camera capture AND file upload fallback. Mirror preview, dashed guide overlay, 10MB file size limit
- **`src/lib/ai.js`**: Added `normalizeMessagesForOpenAI()` to convert Anthropic image blocks to OpenAI `image_url` format for OpenRouter compatibility. `callAnthropic()` unchanged (native support)

#### True Solar Time Correction (真太阳时校正)
- **`src/lib/cities.js`** (~480行): ~300 Chinese cities (all provinces + municipalities + overseas Chinese centers like Singapore, Tokyo, Vancouver) with `{ name, province, lng }`. Key functions: `searchCities()`, `calcTrueSolarTimeOffset()` (`(120-lng)*4` minutes), `adjustBirthTime()` (handles day/month boundaries via Date.UTC), `adjustHourBranch()` (for Ziwei branch-string hours), `formatTrueSolarTime()`, `formatOffset()`
- **`src/components/BirthCityPicker.jsx`** (~130行): Shared toggle+search component — "真太阳时校正" switch → fuzzy city search dropdown → displays longitude + offset. Outside-click to close
- **Integrated into 4 modules**:
  - `bazi/BaziModule.jsx`: Advanced settings, adjusts numeric time before paiBazi, shows "☀ 真太阳时" indicator
  - `bazihealth/BaziHealthModule.jsx`: Below gender buttons, adjusts before runHealthAnalysis
  - `ziwei/ZiweiModule.jsx`: Advanced settings, uses `adjustHourBranch()` for branch-string conversion
  - `qimen/QimenModule.jsx`: Advanced settings with caveat "部分派别使用真太阳时起课"

#### App Integration
- **App.jsx**: Import + register wangzhen tab (after bazihealth, before divider end)
- **HistoryDrawer.jsx**: `wangzhen: '望诊'` label + diagnosis type summary

## 2026-03-12

### feat: Phase 4 — 中医问诊模块 (TCM Wellness Modules)

Added 4 new TCM wellness modules with tab bar grouping (占算 | 问诊 divider).

#### Shared Infrastructure
- **`src/lib/tcm-data.js`** (~100行): Shared TCM reference data — WUZANG (五脏), WUXING_ORGAN_MAP, FOOD_QI (四气), FOOD_WUWEI (五味), WUXING_FOOD_THERAPY, JIEQI_YANGSHENG (24节气)
- **`src/components/ModuleIntro.jsx`**: Fixed to accept both string and array for `strengths` prop
- **`src/index.css`**: Added `.scrollbar-none` utility for horizontal tab scrolling
- **Tab bar grouping**: Visual divider between 占算 and 问诊 categories, horizontal scroll for 10 tabs

#### Module 7: 体质辨识 (Constitution Assessment)
- **data.js** (~250行): 9 constitution types (王琦九种体质), 34 questions, 9 therapy plans (food/tea/acupoints/exercise)
- **engine.js** (~80行): `assessConstitution()` scoring 0-100 per type, primary/secondary detection, `formatForAI()`
- **TizhiModule.jsx** (~500行): Step-by-step questionnaire (5-point Likert), SVG radar chart (9 axes), constitution result card, collapsible therapy plans, AI streaming chat

#### Module 8: 子午流注 (Meridian Clock)
- **data.js** (~180行): 12 shichen entries with organ/meridian/wuxing/yangsheng/illness, per-organ acupoints
- **engine.js** (~60行): `getCurrentShichen()` real-time detection, progress%, `formatForAI()`
- **ZiwuModule.jsx** (~300行): SVG 12-segment circular clock with animated hand, real-time update (30s interval), meridian detail card, acupoints display, expandable full-day table, AI chat

#### Module 9: 五运六气 (Five Movements Six Qi)
- **data.js** (~130行): TIANGAN_YUN, DIZHI_QI, QI_INFO, PRIMARY_YUN/QI, RECENT_YUNQI (2024-2029)
- **engine.js** (~120行): `getYearGanZhi()`, `getWuYun()` (太过/不及), `getKeYun()` (客运5段), `getLiuQi()` (司天/在泉), `getKeQi()` (客气6段), `analyzeYear()`, `formatForAI()`
- **WuyunModule.jsx** (~280行): Year selector (2020-2049) with ganzi, overview card (大运+司天+在泉), five transport + six qi color-coded timelines, detail sections, AI chat

#### Module 10: 八字看健康 (BaZi Health)
- **data.js** (~100行): WUXING_HEALTH (5 elements → organs/symptoms/risks/nurture), LIUYIN (6 pathogens), QIQING (7 emotions), SHICHEN_HEALTH
- **engine.js** (~120行): `analyzeBaziHealth()` (element distribution → organ mapping), `getLifeStageRisks()` (dayun → health focus), `getDietPlan()`, `runHealthAnalysis()` wrapper, `formatForAI()`
- **BaziHealthModule.jsx** (~350行): Birth info form (reuses bazi SHICHEN data), five element bar chart, expandable organ risk cards, life stage timeline with current decade highlight, diet therapy cards, AI chat

#### App Integration
- **App.jsx**: Import 4 modules, tab bar with divider + horizontal scroll, 4 conditional rendering blocks
- **HistoryDrawer.jsx**: 4 new module labels + summary formatters (constitution type / meridian / year analysis / health)
- **Bug fix**: Fixed 5-arg `upsertHistory()` calls in tizhi/ziwu/wuyun to correct 4-arg signature

## 2026-03-09

### feat: 风水飞星模块 (Fengshui Flying Star)
- **排盘引擎** (`engine.js` ~270行): paiFengshui() 玄空飞星完整排盘
  - 三元九运: 180年周期 (1864-2063), 20年一运, 建造年份定运数
  - 九宫飞星: 洛书路径 [5,6,7,8,9,1,2,3,4] 顺/逆飞, wrap 1-9
  - 运盘: 运数入中宫永远顺飞
  - 山盘: 运盘坐方星入中宫, 阳山顺飞/阴山逆飞
  - 向盘: 运盘向方星入中宫, 同上阴阳判断
  - 年飞星: `((9 - ((year-2000)%9) + 9) % 9) || 9` 公式
  - 月飞星: 年支分组→正月中宫数 (8/5/2) 逐月递减
  - 二十四山查找: 度数→山名, 处理子山跨0°边界
  - 格局分析: 旺山旺向/上山下水/双星到向/双星到山 自动判断
  - 飞星组合断事: 21条吉凶组合匹配 (二五交加/斗牛煞/穿心煞/交剑煞等)
  - 八宅法本命卦: 出生年+性别→东四命/西四命
  - formatForAI() 生成完整盘面文本供AI解读
- **静态数据表** (`data.js` ~160行): 九宫/飞星路径/三元九运/二十四山(24条含度数/卦/三元/五行/阴阳)/九星属性/飞星组合断事(21条)/九星化解催旺/八宅法(8卦×8方位)/五行中文
- **AI系统提示** (`prompt.js`): 6步分析流程 (格局总览→逐宫分析→年星叠加→重点位置→化解方案→催旺建议)
- **九宫格UI** (`FengshuiModule.jsx` ~500行):
  - CSS Grid 3×3 传统九宫布局 [巽4/离9/坤2 | 震3/中5/兑7 | 艮8/坎1/乾6]
  - 每宫显示: 卦名+方位、运星/山星/向星 + 年飞星, 吉凶着色
  - 飞星组合 badge (吉绿/凶红) 自动匹配显示
  - 格局徽章: 旺山旺向(绿)/上山下水(红)/双星到向(金)/双星到山(蓝)
  - 宫位详情弹窗: 点击查看完整星曜分析 + 组合断事 + 化解/催旺建议
  - 输入区: 建造年份下拉(1864-2063) + 坐山方位(双模式: 24山快选Grid / 度数精确输入) + 分析年份
  - 高级设置: 八宅法(出生年+性别→本命卦)
  - 专题分析按钮: 大门/主卧/财运/健康/年星/化解总结
  - 完整AI解读: 流式输出 + 追问 + 专题深入
- **集成**: App.jsx 新增 fengshui tab + HistoryDrawer 风水摘要(XX山XX向 · 格局名 · X运)
- 四主题适配 (ink/jade/dao/dark)
- **验证**: 年飞星公式 (2024→3碧, 2025→2黑, 2026→1白), flyStars顺逆飞, findMountain边界(0°=子/180°=午/352°=壬), 九运子山午向完整排盘 (双星到向) 全部正确

### feat: 奇门遁甲模块 (Qimen Dunjia)
- **排盘引擎** (`engine.js` ~350行): paiQimen() 转盘法·拆补法全流程
  - 公历→干支 (lunar-javascript): 年月日时四柱干支 + 五鼠遁时
  - 节气查找: getJieQi() + getNextJieQi() + getPrevJieQi() 三重检测，修复节气交接日遗漏
  - 定阴阳遁 + 局数: 24节气×上中下元 = 72局完整查表
  - 拆补法三元: 节气后首个甲/己日起算，5天一元
  - 布地盘: 阳遁顺排/阴遁逆排三奇六仪于洛书九宫
  - 布天盘: 值符(九星)随时干转动，天禽寄坤二宫
  - 天盘奇仪: 九星各携原宫地盘干同步旋转
  - 布人盘: 八门随值使转动
  - 布神盘: 八神从时干宫起排（阳顺阴逆）
  - 格局分析: 6吉格 + 10凶格自动检测
  - formatForAI() 生成完整盘面文本供AI解读
- **静态数据表** (`data.js` ~180行): 九宫/九星/八门/八神/三奇六仪/节气局数/吉凶格局/用神速查
- **AI系统提示** (`prompt.js`): 8步分析流程（概述→找自己→找目标→找阻碍→看格局→看三奇→综合→方位）
- **九宫格UI** (`QimenModule.jsx` ~550行):
  - CSS Grid 3×3 传统九宫布局 [巽4/离9/坤2 | 震3/中5/兑7 | 艮8/坎1/乾6]
  - 每宫显示: 天盘干/地盘干、九星(吉绿凶红)、八门(吉绿凶红)、八神
  - 日干所在宫 ★我 标记 + 值符宫高亮
  - 盘面摘要条: 阴阳遁+局数+节气+三元+值符值使+日干落宫
  - 格局标签: 吉格(jade)/凶格(cinnabar)彩色badge
  - 宫位详情弹窗: 点击任一宫查看完整五行分析
  - 专题分析按钮: 求财/事业/出行/感情/健康/诉讼
  - 完整AI解读: 流式输出 + 追问 + 专题深入
  - 日期时间4组下拉 + "用当前时间"按钮
- **集成**: App.jsx 新增 qimen tab + HistoryDrawer 奇门摘要(阴阳遁+局数+值符+值使)
- 四主题适配 (ink/jade/dao/dark)

## 2026-03-08

### feat: 模块引导介绍卡片
- 新建共享组件 `ModuleIntro.jsx`：可折叠"关于此术"卡片，展示来源 + 擅长领域
- 四个模块（六爻/梅花/八字/紫微）顶部各加一段引导文字
- 折叠状态按模块分别存 localStorage，刷新后记忆
- 用 `--color-surface-border` 浅边框，视觉上低于输入区层级
- 四主题适配 (ink/jade/dao/dark)

### feat: 紫微斗数模块 (Ziwei Purple Star Astrology)
- **完整排盘引擎** (`engine.js` ~300行): paiZiwei() 基于 lunar-javascript 公历→农历转换，10步排盘流程
  - Step 1-2: 定命宫身宫 + 安十二宫 (模运算公式)
  - Step 3: 五虎遁定宫干 → 纳音五行 → 五行局数 (水2/木3/金4/土5/火6)
  - Step 4-5: 安紫微 (查表150条) + 天府 (镜像公式)
  - Step 6-7: 安紫微系6星 + 天府系8星 = 14颗主星全部落宫
  - Step 8-9: 安六吉星 (文昌文曲左辅右弼天魁天钺) + 六煞星 (擎羊陀罗火星铃星地空地劫) + 禄存天马红鸾天喜
  - Step 10: 四化标记 (禄权科忌)
  - 大运推算: 起运年龄=局数, 阳男阴女顺排/反之逆排, 每步10年
  - formatForAI() 生成命盘文本摘要供 AI 解读
- **静态数据表** (`data.js` ~290行): 18+ 查表
  - 60甲子纳音、纳音五行自动派生、五行局映射
  - 紫微安星表 (5局×30日=150条)、紫微系/天府系偏移序列
  - 六吉星表 (文昌/文曲/左辅/右弼/天魁/天钺)
  - 六煞星表 (擎羊/陀罗/火星/铃星/地空/地劫)
  - 四化表 (10年干×4化=40条)、禄存/天马/红鸾/天喜表
  - 星曜元数据 STAR_INFO (五行属性+分类)、五行配色
- **十二宫盘面UI** (`ZiweiModule.jsx` ~600行):
  - 4×4 CSS Grid 传统方阵布局: 外圈12宫按地支顺序排列，中央2×2合并显示命盘摘要
  - PalaceCell 组件: 宫名+地支+主星(五行着色)+辅星+四化徽章(禄=绿/权=红/科=蓝/忌=棕)
  - 命宫★金色高亮边框、身宫☆虚线标记
  - 点击宫位弹出详情面板 (PalaceDetailModal)
  - 公历输入 + 实时农历预览 (useMemo + lunar-javascript)
  - 12时辰地支下拉 + 性别切换
  - 可折叠高级设置: 详细分析模式 (6分项按钮: 事业/财运/感情/健康/福德/迁移)
  - AI 解读: 流式输出 + 追问对话 + 分项深入分析
  - 历史加载/保存: 标准7-prop接口
- **AI system prompt** (`prompt.js`): 紫微斗数专用 prompt，8步分析流程 + 星曜解读规则 + 四化重点
- **App.jsx**: 新增紫微斗数 tab + import + 条件渲染
- **HistoryDrawer.jsx**: 新增 ziwei 模块标签 + 命宫主星摘要 (如 "命宫子 紫微天府 · 火六局")
- **排盘验证**: 两组测试用例四化+大运方向全部正确
  - 1990三月初十辰时男: 庚年→太阳化禄/武曲化权/太阴化科/天同化忌 ✓, 阳男顺排 ✓
  - 1985八月二十酉时女: 乙年→天机化禄/天梁化权/紫微化科/太阴化忌 ✓, 阴女顺排 ✓
- **四主题适配**: ink/jade/dao/dark 四套主题下宫格、星曜五行色、四化徽章均正常显示
- **新增依赖**: `lunar-javascript` (公历↔农历转换)
- **新增文件**: `src/modules/ziwei/data.js`, `engine.js`, `prompt.js`, `ZiweiModule.jsx`
- **修改文件**: `src/App.jsx`, `src/components/HistoryDrawer.jsx`

## 2026-03-08

### feat: 多 Provider 支持 + 模型选择 + 历史管理 + 八字高级设置

- **多 AI Provider 支持**: 新增 OpenRouter 接入，支持在 Anthropic 直连与 OpenRouter 间切换
  - 新建 `src/lib/aiProviders.js`: Provider/Model 配置表，`getActiveApiKey()`, `getDefaultModel()` helpers
  - 重构 `src/lib/ai.js`: `aiInterpret(apiKey, ...)` → `aiInterpret(config, ...)` (config = {apiKey, provider, model})
  - 拆分 `callAnthropic()` / `callOpenRouter()` + 共享 `readSSE()` SSE 解析器
  - OpenRouter 使用 OpenAI 兼容格式 (`/api/v1/chat/completions`)
  - 可选模型: Anthropic (Sonnet 4, Haiku 4) / OpenRouter (Sonnet 4, Haiku 4, Gemini 2.5 Flash, DeepSeek V3)
- **设置面板重写** (`SettingsPanel.jsx`):
  - Provider 分段切换按钮 (Anthropic 直连 / OpenRouter)
  - 双 API Key 输入 (切换 provider 自动显示对应 key)
  - 模型下拉选择 (按 provider 动态切换可选模型列表)
  - 历史记录管理区: 导出/导入/清空 (两步确认)
- **历史记录增强** (`history.js`):
  - `MAX_HISTORY` 50 → 500
  - 新增 `exportHistory()`: 导出 JSON 字符串
  - 新增 `importHistory(jsonString)`: 解析 + 按 id 去重合并 + 时间排序 + 保存
  - `saveHistoryToStorage()` 加 try/catch quota 超限保护
- **八字高级设置** (`BaziModule.jsx`):
  - 新增可折叠"高级设置"面板 (▶/▼ 切换)
  - "详细分析模式"开关: 开启后 AI 综合分析完成后显示 6 个分项按钮 (财运/事业/感情/子女/父母/健康)
  - 点击分项按钮 → 作为 follow-up 追问发送，复用完整对话历史，AI 直接深入该方面
  - 已查看分项显示 ✓ 标记
- **全局 aiConfig 重构** (`App.jsx`):
  - `apiKey` state → `aiConfig` object (provider, anthropicKey, openrouterKey, model)
  - 所有三个模块 props 统一为 `aiConfig={aiConfig}`
  - 新增 `handleHistoryChange` 回调给 SettingsPanel
- **Prompt 更新** (`bazi/prompt.js`): 追加分项分析指令，500-800字深入专项
- **修改文件**: `ai.js`, `history.js`, `App.jsx`, `SettingsPanel.jsx`, `BaziModule.jsx`, `LiuyaoModule.jsx`, `MeihuaModule.jsx`, `bazi/prompt.js`
- **新增文件**: `src/lib/aiProviders.js`

## 2026-03-08

### feat: 八字命理模块 (BaZi / Four Pillars of Destiny)
- **完整排盘引擎** (`engine.js` ~400行): paiBazi() 计算四柱天干地支、十神、藏干十神、纳音、长生十二宫、身强弱评估、大运推算、五行统计、空亡、神煞
  - 日柱基准复用六爻已验证基准 (2024-02-04 = 甲子)
  - 节气精确时间表 2024-2026 硬编码 UTC 时间戳，范围外近似公式 + 警告
  - 子时(23:00)自动换日、立春前自动归上一年
  - 身强弱三要素评分：月令得令(40%) + 帮身泄身(40%) + 通根(20%)
  - 大运推算：阳年男/阴年女顺排，反之逆排，起运年龄 = 距节气天数÷3
- **静态数据表** (`data.js` ~260行): 十天干地支、五行映射、藏干表、60甲子纳音、长生起始位、地支关系(六合/六冲/三合/三会/六害/三刑)、天干五合、桃花驿马华盖、时辰表
- **排盘UI** (`BaziModule.jsx` ~470行):
  - 出生信息输入：年(1920-2027)/月/日/时辰(12时辰)/性别 下拉选择
  - 四柱网格 PillarGrid：4列×8行 (标签/十神/天干/地支/藏干/藏干十神/纳音/长生)，日柱金色高亮，天干地支按五行着色
  - 身强弱摘要 StrengthSummary：日主五行 + 身旺/中和/身弱 badge + 分数 + 判断因素
  - 五行分布条形图 WuxingBar：五行色带 + 空亡显示
  - 大运时间线 DayunTimeline：8步横向可滚动卡片，当前年龄区段高亮
  - 命局关系 InteractionsPanel：六合/六冲/三合/三刑/六害/天干合/神煞
  - AI 解读 + 流式输出 + 追问对话
- **AI system prompt** (`prompt.js`): 八字命理专用 prompt，七步分析流程 + 核心规则 + 通俗表达要求
- **App.jsx**: 新增八字命理 tab + import + 条件渲染
- **HistoryDrawer.jsx**: 新增 bazi 模块标签 + 四柱摘要显示 (如 "庚午 壬午 丁丑 丙午")
- **精度验证**: 手动验证多组已知八字 (1990-06-15午时、2025-01-15辰时立春前、2024-06-15子时换日)，四柱/十神/纳音/长生均准确
- **四主题适配**: ink/jade/dao/dark 四套主题下排盘网格、五行色、大运卡片均正常显示
- **新增文件**: `src/modules/bazi/data.js`, `engine.js`, `prompt.js`, `BaziModule.jsx`
- **修改文件**: `src/App.jsx`, `src/components/HistoryDrawer.jsx`

## 2026-03-08 (earlier)

### feat: 深色主题 + 铜钱动画 + 梅花动画 + 视觉升级
- **深色主题「夜观星象」**: 新增高对比度暗色主题 (deep navy #0f1118)，47 个 CSS 变量，fal 生成星空夜山背景 (bg-dark.webp)，半透明卡片 backdrop-blur，金/翡翠/朱砂配色
- **六爻铜钱动画重做**: 文字铜钱 div → fal 生成古铜钱图片 (coin-front.webp / coin-back.webp)，新增 coin-toss (抛起旋转)、coin-bounce (弹跳落地)、coin-shadow (地面阴影) 三组 CSS 动画，交错 stagger 效果
- **梅花起卦动画**: 新增 CastingAnimation 组件 (旋转太极 ☯ 符号 + 脉冲)，1.2s 延迟后显示结果；MeihuaDisplay 各区域 staggered reveal (trigram-grow + meihua-reveal) 渐次展开
- **Banner 全宽修复**: 移除 `max-w-3xl` 约束，banner 改为 `w-full` 全屏宽度，消除两侧断裂
- **视觉增强工具类**: `.card-hover` (悬浮微抬), `.btn-glow` (按钮光晕), `.input-focus-ring` (输入框聚焦光环), `.animate-divider-shimmer` (分割线微光呼吸)
- **fal 新素材**: coin-front.webp (104KB), coin-back.webp (89KB), bg-dark.webp (75KB)
- **修改文件**: index.css (+180 lines), App.jsx, ThemePicker.jsx, LiuyaoModule.jsx, MeihuaModule.jsx, generate-assets.js

## 2026-03-07

### feat: 品牌素材集成 + API 错误优化
- **Banner 横幅**: header 下方添加仙山云鹤全宽横幅，半透明渐隐效果
- **Tab 图标**: 用 fal 生成的铜钱/梅花图标替换原来的 emoji (☰/❀)
- **云纹分割线**: footer 上方添加金色云纹装饰分割线
- **背景纹理**: 三套主题都有各自的 fal 生成背景 (ink=水墨山、jade=玉石纹、dao=宣纸)
- **API 错误信息中文化**: 解析 Anthropic API 错误 JSON，映射为友好中文提示
  - 余额不足 → "API 余额不足，请前往 Anthropic Console 充值后重试"
  - Key 无效 → "API Key 无效，请在设置中检查并重新输入"
  - 频率限制 → "请求过于频繁，请稍后再试"
  - 服务繁忙 → "Claude 服务繁忙，请稍后再试"

### fix: CSS 变量继承 + 素材生成
- **修复主题切换不生效 bug**: `data-theme` 属性原错误放在 `<body>` 上，导致 `[data-theme="ink"]` 选择器匹配 body 覆盖了 html 上的 jade/dao 变量。修复：移至 `<html>`，body 不再设置 data-theme
- **移除 `@theme` 变量**: Tailwind v4 的 `@theme` 用 `@property { inherits: false }` 注册变量，阻止 html→body 继承。改为 `:root` 常规 CSS 变量 + `[data-theme]` 覆盖
- **fal API 素材生成完成**: 运行 `generate-assets.js` 生成全套 8 个素材 (3 背景 + 3 图标 + banner + divider)

### feat: 修仙风 light 主题系统 (三套方案)
- **主题切换系统**: 三套 light 修仙风主题通过 `data-theme` CSS 变量切换
  - **水墨留白** (`ink`): 米色宣纸底、深墨棕文字、水墨远山背景
  - **仙府玉石** (`jade`): 月白色底、琥珀金强调、玉石半透明卡片 + backdrop-blur
  - **道观清修** (`dao`): 纯净暖白底、檀木色强调、极简克制
- **ThemePicker 组件**: 三套主题预览卡片 (名称+描述+色板)，一键切换，存 localStorage
- **全局 CSS 变量重构**: 将所有组件中 50+ 处硬编码 `rgba(...)` 色值替换为语义化 CSS 变量
  - `--color-gold-bg`, `--color-gold-border`, `--color-surface-dim`, `--color-placeholder` 等 25+ 语义变量
  - 三套主题各自定义完整变量集，切换主题无需改动组件代码
- **字体优化**: 引入 Google Fonts `Noto Serif SC` (标题) + `Noto Sans SC` (正文)
  - `.font-title` 衬线体用于卦名、标题
  - `.font-body` 无衬线体用于正文、按钮
- **五行色 light 适配**: 加深五行颜色确保浅色背景上对比度达标
- **fal API 素材生成脚本**: `scripts/generate-assets.js` 可批量生成背景纹理、模块图标、banner、分割线 (需 FAL_KEY)
- **新增文件**: `src/components/ThemePicker.jsx`, `scripts/generate-assets.js`
- **修改文件**: `index.css`, `App.jsx`, `SettingsPanel.jsx`, `HistoryDrawer.jsx`, `LiuyaoModule.jsx`, `MeihuaModule.jsx`, `index.html`

### feat: multi-module architecture + 梅花易数
- **Tab navigation**: Header redesigned with "天机卷" title + tab bar (六爻占卜 | 梅花易数)
- **Modular architecture**: Monolithic App.jsx (~800 lines) split into:
  - `src/App.jsx` — Tab shell + shared state (~170 lines)
  - `src/lib/ai.js` — Generic Claude streaming API caller (shared)
  - `src/lib/history.js` — History persistence helpers (shared)
  - `src/components/SettingsPanel.jsx` — Settings modal (shared)
  - `src/components/HistoryDrawer.jsx` — History drawer with module badge & filtering (shared)
  - `src/modules/liuyao/LiuyaoModule.jsx` — Full liuyao UI + state (~530 lines)
  - `src/modules/meihua/MeihuaModule.jsx` — Full meihua UI + state (~450 lines)
- **梅花易数 (Plum Blossom Divination)** — New module with:
  - Three casting methods: 报数起卦 (numbers), 时间起卦 (time), 文字起卦 (text/strokes)
  - Full hexagram display: 本卦, 上下卦 with 先天八卦数 symbols, 体/用 labels, 五行 colors
  - 体用关系 analysis with verdict (用生体✅ / 体生用⚠️ / 用克体❌ / 体克用🔶 / 比和➡️)
  - 互卦 (process) and 变卦 (result) calculation and display
  - AI interpretation with module-specific system prompt + follow-up questions
  - `engine.js`: castByNumber, castByTime, castByText, formatForAI
  - `data.js`: 先天八卦数, 万物类象, 五行生克, 汉字笔画表 (~1500 characters)
- **History**: Added `module` field to history items; drawer filters by active tab, shows module badge (六爻/梅花)
- Page title changed to "天机卷 · 术数工具"

### feat: divination history
- **History drawer**: Right-side slide-out panel showing past divination sessions
- **Auto-save**: Sessions saved to localStorage after AI interpretation, updated on follow-up questions
- **Full restore**: Click a history entry to restore hexagram display + full AI conversation, can continue asking follow-ups
- **Delete**: Remove individual history entries (hover to reveal delete button)
- **Persistence**: Up to 50 entries stored in localStorage, survives page refresh
- `App.jsx`: Add `HistoryDrawer` component, `history`/`showHistory`/`activeHistoryId` state, `upsertHistory`/`handleLoadHistory`/`handleDeleteHistory` callbacks
- `index.css`: Add `drawer-in`/`drawer-out` keyframe animations

### feat: follow-up questions + coin animation
- **Multi-turn AI chat**: After initial interpretation, users can ask follow-up questions with full conversation history sent to Claude
- **Coin toss animation**: 3D rotateY spinning + bounce-landing CSS animation when shaking coins one-by-one
- `ai.js`: Export `SYSTEM_PROMPT`, change `aiInterpret` to accept full `messages[]` array, increase `max_tokens` to 4000
- `App.jsx`: Replace single `aiText` with `chatMessages[]` + `streamingText` + `followUpInput`; add `CoinAnimation` component and `animatingCoins` state
- `index.css`: Add `@keyframes coin-spin` and `@keyframes coin-land` with utility classes

### feat: initial Liuyao divination MVP
- Single-page React app for six-line (六爻) divination
- Coin tossing: one-by-one or quick-throw modes
- Full hexagram display: 本卦/变卦, 六神, 六亲, 纳甲, 世应, 空亡, 伏神
- Claude AI interpretation with streaming output
- Dark theme with gold/jade accents
- API key stored in localStorage (browser-only)
