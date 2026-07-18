// Chapter 4 《旺衰》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_4_SCRIPT_v1.md (owner-gate passed 2026-07-17
// delegated 「你自己审，自己往下推」; 4-round review converged: R1-R3 technical +
// R4 teachability). This file is a FAITHFUL transcription of the approved script.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1/2/3.js headers. ch4 uses NO new node types.
// ch4-specific conventions:
// - Occult period is FIXED by script (卯月辛巳日) — castInteraction runs mode:'fixed',
//   no runtime paipan, so no fixedDate engine contract is needed (evaluated 2026-07-17:
//   Player.jsx only builds dateParts for mode:'random'+saveAs natal casts).
// - dressingUpdate revealed[] entries may carry optional `wangshuai` (e.g. '旺·月生日临')
//   displayed after liuqin by CastPanel.DressingBoard — ONLY the 用神 line (初爻父母巳火)
//   of the 地泽临 case chart carries it. Rendered as 「巳火·父母·旺」 style.
// - favorBranch anchor is MID-CHAPTER (幕六末, threshold 25) — before it, 沈疏桐 dialogue
//   uses neutral address only (no {{junior}}, no {{player}} direct-name); enforced by lint.
// - Bare 她 in rendered text = 白芷 only (natally female); 沈疏桐 always {{ta}}.
//   Bare 他 = 宋补之/崔小砚/郑司书/案犯 (natally male). Enforced by lint whitelist.
//
// ── Coin-face convention (canonical, per 卜筮正宗/增删卜易) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_4 = {
  id: 'ch4',
  title: '旺衰',
  scriptVersion: 'v1.2-owner-approved-2026-07-17',
  entryNode: 'ch4-s1-header',

  // 剧情固定卦象：地泽临 · 六爻安静（坤宫二世，世二应五；引擎实测 2026-07-17，卯月辛巳日）
  // 教学复盘卦：乾为天（世六应三）；「点偏半分」谱页：风地观（乾宫四世，五爻辛巳官鬼）；
  // 山地剥（ch3 案卦）应二官鬼巳火本章旺衰复读。
  fixedCase: {
    throws: [7, 7, 8, 8, 8, 8], // 初爻→上爻
    benGua: '地泽临',
    bianGua: null,              // 六爻安静
    movingLineIndex: null,
  },

  knowledgePoints: ['KP-LY-010', 'KP-LY-011', 'KP-LY-012'],

  nodes: {
  // ═══════════════ 第一幕 · 隔页的点 ═══════════════
  'ch4-s1-header': {
    type: 'sceneHeader', scene: 1, title: '隔页的点',
    time: '晨', ambience: '明蓍堂 → 藏经阁二层（bg-cangjinge-nei）。',
    m1Note: '本幕功能：兑现 ch3 章末悬念（「点偏半分」是哪一页）；风地观世点＋装五爻小交互（KP-LY-005 复习）；「又是巳」中场钩；引出本章课题。剧情固定卦象：风地观（谱页，卦纸摆读不新掷）。',
    next: 'ch4-s1-010',
  },
  'ch4-s1-010': {
    type: 'narration',
    text: '你睡醒了。',
    next: 'ch4-s1-020',
  },
  'ch4-s1-020': {
    type: 'narration',
    text: '醒得比往日早——昨夜那句「睡醒了再说」，在枕头上翻来覆去说了一夜。',
    next: 'ch4-s1-030',
  },
  'ch4-s1-030': {
    type: 'narration',
    text: '推开明蓍堂的门，香才烧了小半指。沈疏桐已经坐在案后，案上摊着{{ta}}那张单子——三十一页卦名抄成一列，墨笔在其中一行底下压了一道线。',
    next: 'ch4-s1-040',
  },
  'ch4-s1-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '醒了。',
    next: 'ch4-s1-050',
  },
  'ch4-s1-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坐。',
    aside: '{{ta}}头也没抬，',
    next: 'ch4-s1-060',
  },
  'ch4-s1-060': {
    type: 'narration',
    text: '你坐下。{{ta}}把单子转过来，推到你面前。压线的那一行——',
    next: 'ch4-s1-070',
  },
  'ch4-s1-070': {
    type: 'narration',
    text: '乾宫，第五。风地观。',
    next: 'ch4-s1-080',
  },
  'ch4-s1-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三十页真页，二十九页的世点，笔笔落在爻位正中。只有这一页——',
    next: 'ch4-s1-090',
  },
  'ch4-s1-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '观。世点从一开始，就朝上偏了半分。',
    aside: '{{ta}}的指尖在卦名上一顿，',
    next: 'ch4-s1-100',
  },
  'ch4-s1-100': {
    type: 'dialogue', speaker: '{{player}}',
    text: '偏了……多少？',
    next: 'ch4-s1-110',
  },
  'ch4-s1-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '半分。笔锋一提的事。装帧师傅看不出，誊录的眼睛看不出——挑不出错，因为它不是错。',
    next: 'ch4-s1-120',
  },
  'ch4-s1-120': {
    type: 'narration',
    text: '{{ta}}站起身。',
    next: 'ch4-s1-130',
  },
  'ch4-s1-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '口说无凭。看原件。',
    next: 'ch4-s1-140',
  },
  // ── 藏经阁二层（同幕内场景切换，见 script 分隔线）──
  'ch4-s1-140': {
    type: 'narration',
    text: '藏经阁二层。晨光从高窗斜下来，切在格架上。郑司书验讫归格的那半册《遗卦残谱》，就躺在乾字格的第三格里。',
    next: 'ch4-s1-150',
  },
  'ch4-s1-150': {
    type: 'narration',
    text: '沈疏桐取册的手续做得一丝不苟：名帖、批条、点数、登记——',
    next: 'ch4-s1-160',
  },
  'ch4-s1-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '上月点验是我经手回的『验讫』。复核装订，名正言顺。',
    aside: '落笔登记时，淡淡',
    next: 'ch4-s1-170',
  },
  'ch4-s1-170': {
    type: 'narration',
    text: '册子摊开在格前的条案上。{{ta}}一页页翻过去：乾为天、天风姤、天山遁、天地否——',
    next: 'ch4-s1-180',
  },
  'ch4-s1-180': {
    type: 'narration',
    text: '每一页都只有一副卦画，六道墨痕，和一枚小小的世点。无一字。',
    next: 'ch4-s1-190',
  },
  'ch4-s1-190': {
    type: 'narration',
    text: '第五页。',
    next: 'ch4-s1-200',
  },
  'ch4-s1-200': {
    type: 'narration',
    text: '风地观。四道断，两道连。世点落在四爻——',
    next: 'ch4-s1-210',
  },
  'ch4-s1-210': {
    type: 'narration',
    text: '你俯下身。晨光正好。那枚墨点端端正正的……不，不对。',
    next: 'ch4-s1-220',
  },
  'ch4-s1-220': {
    type: 'narration',
    text: '你看了两息才看出来：以爻画为准，那枚点比正中高了半分。真的只有半分——若不是二十九页正点在先，谁也不会多看它一眼。',
    next: 'ch4-s1-230',
  },
  'ch4-s1-230': {
    type: 'dialogue', speaker: '{{player}}',
    text: '朝上……它朝上偏。',
    next: 'ch4-s1-240',
  },
  'ch4-s1-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '朝上是什么？',
    next: 'ch4-s1-250',
  },
  'ch4-s1-250': {
    type: 'narration',
    text: '你直起身。四爻再往上，是五爻。',
    next: 'ch4-s1-260',
  },
  'ch4-s1-260': {
    type: 'dialogue', speaker: '{{player}}',
    text: '五爻。它指着五爻？',
    next: 'ch4-s1-270',
  },
  'ch4-s1-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '谱上无字，点就是话。',
    next: 'ch4-s1-280',
  },
  'ch4-s1-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '五爻是什么，装出来才知道。——装。',
    aside: '{{ta}}把册子微微转正，',
    next: 'ch4-s1-290',
  },
  'ch4-s1-290': {
    type: 'narration',
    text: '风地观：坤在内，巽在外。外卦巽，纳支未、巳、卯——四爻未，五爻——',
    next: 'ch4-s1-300',
  },
  // 交互 · 装支（单爻）| 风地观 · 五爻 | KP-LY-005 复习 · 不计分
  // 答错不惩罚、逼重查（{{senior}}纠正即过）——与 ch2 幕二「查轴子」同款容错。
  'ch4-s1-300': {
    type: 'choice',
    prompt: null, // 装支（单爻）· 风地观五爻 · KP-LY-005 复习 · 不计分
    options: [
      {
        text: '巳',
        response: {
          speaker: '{{player}}',
          text: '巽外卦：未、巳、卯。四爻未，五爻——巳。',
        },
        next: 'ch4-s1-310',
      },
      {
        text: '卯',
        response: {
          text: '你数到头上去了——卯是上爻。退半步重数：四未、五巳、六卯。',
        },
        next: 'ch4-s1-310',
      },
      {
        text: '午',
        response: {
          text: '午是乾宫外卦的支。这是巽。你翻回宫图重查：未、巳、卯。',
        },
        next: 'ch4-s1-310',
      },
    ],
  },
  'ch4-s1-310': {
    type: 'narration',
    text: '笔落。五爻旁边多了一个小字：巳。',
    next: 'ch4-s1-320',
  },
  'ch4-s1-320': {
    type: 'narration',
    text: '巳火。乾宫属金——火克金，克我者——',
    next: 'ch4-s1-330',
  },
  'ch4-s1-330': {
    type: 'dialogue', speaker: '{{player}}',
    text: '官鬼。巳火官鬼。',
    next: 'ch4-s1-340',
  },
  'ch4-s1-340': {
    type: 'narration',
    text: '你握笔的手停在半空。',
    next: 'ch4-s1-350',
  },
  'ch4-s1-350': {
    type: 'narration',
    text: '山地剥，应爻，巳火官鬼——「应上坐贼」。',
    next: 'ch4-s1-360',
  },
  'ch4-s1-360': {
    type: 'narration',
    text: '风地观，世点上偏半分，指着的——又是巳火官鬼。',
    next: 'ch4-s1-370',
  },
  'ch4-s1-370': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}——又是巳。又是官鬼。',
    next: 'ch4-s1-380',
  },
  'ch4-s1-380': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。',
    next: 'ch4-s1-390',
  },
  'ch4-s1-390': {
    type: 'narration',
    text: '{{ta}}的平静让你后背发凉。{{ta}}早就装过这一爻了。',
    next: 'ch4-s1-400',
  },
  'ch4-s1-400': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有一件事，你顺手就能看见。',
    next: 'ch4-s1-410',
  },
  'ch4-s1-410': {
    type: 'narration',
    text: '{{ta}}把观这一页轻轻向后翻——',
    next: 'ch4-s1-420',
  },
  'ch4-s1-420': {
    type: 'narration',
    text: '下一页。乾宫第六。',
    next: 'ch4-s1-430',
  },
  'ch4-s1-430': {
    type: 'narration',
    text: '山地剥。',
    next: 'ch4-s1-440',
  },
  'ch4-s1-440': {
    type: 'narration',
    text: '观的下一页就是剥。偏半分的点，与「应上坐贼」的卦，在谱上贴着背躺了不知多少年。',
    next: 'ch4-s1-450',
  },
  'ch4-s1-450': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '谱不会说话。可这两页挨着的样子，我昨夜看了很久。',
    next: 'ch4-s1-460',
  },
  'ch4-s1-460': {
    type: 'narration',
    text: '{{ta}}合上册子，归格，落锁。做完这一切，{{ta}}才转过身来，晨光在{{ta}}肩上落了薄薄一层。',
    next: 'ch4-s1-470',
  },
  'ch4-s1-470': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '点是人点的。话是人说的。物证人证，从来不缺——缺的是一杆秤：哪句话有分量，哪句话没有。',
    next: 'ch4-s1-480',
  },
  'ch4-s1-480': {
    type: 'dialogue', speaker: '{{player}}',
    text: '秤？',
    next: 'ch4-s1-490',
  },
  'ch4-s1-490': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦上叫旺衰。',
    next: 'ch4-s1-500',
  },
  'ch4-s1-500': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '回堂。今日一课，教你看爻的强弱——爻有名分，还有时令。名分你会认了；从今日起，学看它当不当令。',
    aside: '{{ta}}朝门外走，',
    next: 'ch4-s2-header',
  },

  // ═══════════════ 第二幕 · 月令当值 ═══════════════
  'ch4-s2-header': {
    type: 'sceneHeader', scene: 2, title: '月令当值',
    time: '上午', ambience: '明蓍堂。',
    m1Note: '本幕功能：KP-LY-010 示范＋引导；乾为天十二月轮讲；当月（卯月）活例；月破一句话概念；卯戌合克彩蛋（超纲带过位，不教不考）。剧情固定卦象：乾为天（复盘，不新掷）。',
    next: 'ch4-s2-010',
  },
  'ch4-s2-010': {
    type: 'narration',
    text: '案上摆开的，是一张你闭着眼都画得出的卦纸——乾为天。六道连画，父母戌土在最上头坐着「世」位。',
    next: 'ch4-s2-020',
  },
  'ch4-s2-020': {
    type: 'dialogue', speaker: '{{player}}',
    text: '又是它。',
    next: 'ch4-s2-030',
  },
  'ch4-s2-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '又是它。',
    next: 'ch4-s2-040',
  },
  'ch4-s2-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '六親歌你在它身上学的，安世应你在它身上练的。老熟人有个好处——它不分你的神。今日要看的东西比名分细，就用最熟的卦。',
    aside: '{{ta}}把卦纸抚平，',
    next: 'ch4-s2-050',
  },
  'ch4-s2-050': {
    type: 'narration',
    text: '{{ta}}提笔，在卦纸空白处写下四个字：年、月、日、辰。',
    next: 'ch4-s2-060',
  },
  'ch4-s2-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '起卦那日我教过你的规矩：落纸先写年月日。当时你问为什么，我说『到时候还你』。——到时候了。',
    next: 'ch4-s2-070',
  },
  'ch4-s2-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '先记一句话：卦是死的，令是活的。同一张乾为天，正月里问和五月里问，世爻戌土的处境，天差地别。',
    next: 'ch4-s2-080',
  },
  'ch4-s2-080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '处境……爻还有处境？',
    next: 'ch4-s2-090',
  },
  'ch4-s2-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '人有没有？',
    next: 'ch4-s2-100',
  },
  'ch4-s2-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '同一个人，当值的时辰说话有分量，卸了值说话就轻。爻也一样。谁给它分量？——月建。当月的地支，这个月的令官。三十天里，卦里六个爻，全在它眼皮底下当差。',
    aside: '{{ta}}反问，',
    next: 'ch4-s2-110',
  },
  'ch4-s2-110': {
    type: 'narration',
    text: '{{ta}}的笔尖点在世爻戌土上。',
    next: 'ch4-s2-120',
  },
  'ch4-s2-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '就拿它问。戌，土。月建对它，无非四种手势——我一个月一个月给你数过去。原书教这一课，就是拿一张卦把十二个月坐穿；咱们照做。',
    next: 'ch4-s2-130',
  },
  'ch4-s2-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '巳月、午月。巳午属火，火生土——月建生它，它就旺相：手里有令，诸事可为。未月丑月，土帮土，同类撑腰，也算旺相。',
    next: 'ch4-s2-140',
  },
  'ch4-s2-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '寅月、卯月。寅卯属木，木克土——月建克它，它就休囚：像被上头压着的人，说话没分量。',
    next: 'ch4-s2-150',
  },
  'ch4-s2-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '戌月。戌土自己当月建——自家人正在令上，这叫当时。一年里它最硬气的三十天。',
    next: 'ch4-s2-160',
  },
  'ch4-s2-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '申酉月，亥子月。金要它去生，水要它去管——都是往外掏的活，气自然漏。不生不克，可气都漏在别人身上了，也归休囚，无力。',
    next: 'ch4-s2-170',
  },
  'ch4-s2-170': {
    type: 'narration',
    text: '四种手势在纸上排开：生、克、临、泄。{{ta}}的笔停了停。',
    next: 'ch4-s2-180',
  },
  'ch4-s2-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有第五样，单拎出来说——辰月。辰与戌，一东一西打个对脸——隔六位，正对头。这叫相沖。',
    next: 'ch4-s2-190',
  },
  'ch4-s2-190': {
    type: 'narration',
    text: '{{ta}}怕你混，先堵一句：',
    next: 'ch4-s2-200',
  },
  'ch4-s2-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '五行圈上『隔一位是克』，那是五行的圈；这是十二支的圈，隔的是六位。两个圈，别叠一块儿。——月建沖爻，这一爻就叫月破。',
    next: 'ch4-s2-210',
  },
  'ch4-s2-210': {
    type: 'dialogue', speaker: '{{player}}',
    text: '破？',
    next: 'ch4-s2-220',
  },
  'ch4-s2-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '破格的破。',
    next: 'ch4-s2-230',
  },
  'ch4-s2-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '器物裂了纹——看着还是个碗，盛不得水了。原书的话：百无所为。月破是四手势之外最重的一记，先把名字记住，细账往后算。',
    aside: '{{ta}}在纸角画了个小圈，笔锋一挑，圈上裂了道口，',
    next: 'ch4-s2-tm1',
  },
  'ch4-s2-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-010', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '月建四手势：生／临（帮扶并入旺相）＝旺相，克＝休囚，沖＝月破（一句话概念，细账不展开），当月本支＝当时。以乾为天世爻戌土通讲十二月，原书借法教学的口语化（「他爻多有變出回頭生克，借此以為法也」，witness 提取行 583-585）；月破「百无所为」原文照录（witness 提取行 567）。',
    next: 'ch4-s2-240',
  },
  'ch4-s2-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '现在——',
    next: 'ch4-s2-250',
  },
  'ch4-s2-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日是几月？',
    aside: '{{ta}}把笔搁下，',
    next: 'ch4-s2-260',
  },
  'ch4-s2-260': {
    type: 'dialogue', speaker: '{{player}}',
    text: '仲春……卯月。',
    next: 'ch4-s2-270',
  },
  'ch4-s2-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卯月。卯属什么，戌土此月如何？',
    next: 'ch4-s2-280',
  },
  // 引导应答 · KP-LY-010 · 好感位
  'ch4-s2-280': {
    type: 'choice',
    prompt: null,
    options: [
      {
        text: '卯属木，木克土——世爻休囚',
        response: {
          speaker: '沈疏桐',
          text: '不错。就是这个月——你眼前这张卦上的戌土，此刻正被月建压着，说话没分量。书上的话和眼前的月份对上了，这一课才算进了身。',
        },
        effects: { favor: 1 },
        next: 'ch4-s2-290',
      },
      {
        text: '卯属木，木生土——旺相',
        response: {
          speaker: '沈疏桐',
          text: '木生的是火。烧过灶没有？木生火、火生土——隔了一层。卯对戌，是克。此月它休囚。',
          aside: '{{ta}}顿了顿，',
        },
        next: 'ch4-s2-290',
      },
      {
        text: '卯月……戌土当时',
        response: {
          speaker: '沈疏桐',
          text: '当时是自家当令——戌月才轮得到它。卯与戌一个木一个土，木克土：休囚。',
        },
        next: 'ch4-s2-290',
      },
    ],
  },
  'ch4-s2-290': {
    type: 'narration',
    text: '你看着卦纸上的戌土。同一枚字，你在三章里见了它三回——今日头一回，觉得它有点可怜。',
    next: 'ch4-s2-tm2',
  },
  'ch4-s2-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-010', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家在提示（本月即卯月）下独立判断月建对世爻戌土的手势——卯木克戌土＝休囚。答错不惩罚：{{senior}}纠正（灶膛添柴喻生向、或当时须自家当令两说）后继续，不计 wrong。',
    next: 'ch4-s2-300',
  },
  'ch4-s2-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '先别急着可怜它。',
    aside: '收玩笑不收课',
    next: 'ch4-s2-310',
  },
  'ch4-s2-310': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '有人会翻出旧书问：卯与戌，除了克，还合——又克又合，算哪样？',
    aside: '{{ta}}指尖在「卯」字上敲了敲，',
    next: 'ch4-s2-320',
  },
  'ch4-s2-320': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……还能又克又合？',
    next: 'ch4-s2-330',
  },
  'ch4-s2-330': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '能。地支的账比五行细一层。原书自己也只答了一句：五行相合章，注解极明——意思是：另开一章的事。',
    next: 'ch4-s2-340',
  },
  'ch4-s2-340': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '下章的下章。今日只记四手势加一破。贪多，嚼不烂。',
    aside: '{{ta}}把这个话头合上，动作干脆得像合上那本册子，',
    next: 'ch4-s3-header',
  },

  // ═══════════════ 第三幕 · 今日司权 ═══════════════
  'ch4-s3-header': {
    type: 'sceneHeader', scene: 3, title: '今日司权',
    time: '近午', ambience: '明蓍堂。',
    m1Note: '本幕功能：CP-01（KP-LY-010 独立）；KP-LY-011 示范＋引导（同构自推）；暗動／當令得權两个新名目；「辰」一字两名对照。',
    next: 'ch4-s3-010',
  },
  'ch4-s3-010': {
    type: 'narration',
    text: '{{ta}}换了一张纸，笔走得很快——你凑过去看，纸头上写的是：',
    next: 'ch4-s3-020',
  },
  'ch4-s3-020': {
    type: 'narration',
    text: '一、月建能生克沖合。',
    next: 'ch4-s3-030',
  },
  'ch4-s3-030': {
    type: 'narration',
    text: '底下密密一列，正是方才那一课的账。写完，{{ta}}另起一行：',
    next: 'ch4-s3-040',
  },
  'ch4-s3-040': {
    type: 'narration',
    text: '二、日辰能——',
    next: 'ch4-s3-050',
  },
  'ch4-s3-050': {
    type: 'narration',
    text: '笔停了。{{ta}}把笔递给你。',
    next: 'ch4-s3-060',
  },
  'ch4-s3-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '接着写。',
    next: 'ch4-s3-070',
  },
  'ch4-s3-070': {
    type: 'dialogue', speaker: '{{player}}',
    text: '我？',
    next: 'ch4-s3-080',
  },
  'ch4-s3-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '月建是当月的令官，管三十天。日辰是当日的司权，管这一天。',
    next: 'ch4-s3-090',
  },
  'ch4-s3-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '格局一样，字换一个。你若真听懂了上一课，这一课本就不用我教——写。',
    aside: '{{ta}}把手一摊，',
    next: 'ch4-s3-100',
  },
  'ch4-s3-100': {
    type: 'narration',
    text: '你接过笔。戌土。若在寅卯日占卦——木克土，受伤。若在巳午日——火生土，生旺。若在未丑日——土帮土，得助。若在……',
    next: 'ch4-s3-110',
  },
  'ch4-s3-110': {
    type: 'narration',
    text: '你一路写下去，笔越走越顺。写到「戌日」，你顿了顿：',
    next: 'ch4-s3-120',
  },
  'ch4-s3-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '戌日占卦，世爻自己临着日辰——也叫『当时』？',
    next: 'ch4-s3-130',
  },
  'ch4-s3-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '意思到了，名目差半个字。临日建，叫当令得权。',
    next: 'ch4-s3-140',
  },
  'ch4-s3-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '月建给的是一个月的时；日辰给的是今天的权。当时是在时上，得权是权在手——今日之内，它说话最响。',
    aside: '{{ta}}接回笔，在你的字旁补上这四个字，',
    next: 'ch4-s3-150',
  },
  'ch4-s3-150': {
    type: 'dialogue', speaker: '{{player}}',
    text: '那……辰日呢？辰沖戌——日辰沖爻，也叫破？',
    next: 'ch4-s3-160',
  },
  'ch4-s3-160': {
    type: 'narration',
    text: '{{ta}}看了你一眼——这一眼里有点东西，像是你问到了{{ta}}等着的地方。',
    next: 'ch4-s3-170',
  },
  'ch4-s3-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问得好。不叫破。',
    next: 'ch4-s3-180',
  },
  'ch4-s3-180': {
    type: 'narration',
    text: '{{ta}}写下两个字：暗動。',
    next: 'ch4-s3-190',
  },
  'ch4-s3-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '同一个辰字，月里遇上，是月破——器裂了，坏事。日里遇上，叫暗動——静爻被今日一沖，暗地里动了。',
    next: 'ch4-s3-200',
  },
  'ch4-s3-200': {
    type: 'dialogue', speaker: '{{player}}',
    text: '动了……是好是坏？',
    next: 'ch4-s3-210',
  },
  'ch4-s3-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '先记名字。',
    next: 'ch4-s3-220',
  },
  'ch4-s3-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '动出来的是吉是凶，要看动的是谁、动了做什么——那是往后的细账。今日你只须认得：月沖为破，日沖为動。一个字，两个名，轻重两样。',
    aside: '{{ta}}把「暗動」两个字圈起来，圈得很轻，',
    next: 'ch4-s3-tm1',
  },
  'ch4-s3-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-011', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '日辰同构镜像月建四手势，另立两个新名目：临日建＝當令得權（区别于月建的「当时」）；日沖为暗動（区别于月建的「月破」）——月沖为破，日沖为動，一字两名，轻重两样。依据《增删卜易》「2、日辰能生克沖合」（witness 提取行 571）。',
    next: 'ch4-s3-230',
  },
  'ch4-s3-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '收个尾。申酉亥子这四个日子，对戌土——',
    next: 'ch4-s3-240',
  },
  // 引导应答 · KP-LY-011 · 好感位
  // 原文不对称如实处理：月原文作「泄气之時…休囚無力」（出向），日原文作「無克無生」（受向）——
  // {{senior}}按「两处对着读」收口，不强造对称。
  'ch4-s3-240': {
    type: 'choice',
    prompt: null,
    options: [
      {
        text: '无克无生——可它的气还是漏的，同月建一样，归休囚',
        response: {
          speaker: '沈疏桐',
          text: '嗯。原书在日辰这一处只落了四个字：『无克无生』——没人打它，也没人扶它。气数漏不漏，方才月建课上你已会看。两处对着读，账就全了。',
        },
        effects: { favor: 1 },
        next: 'ch4-s3-tm2',
      },
      {
        text: '日辰不管这四个字',
        response: {
          speaker: '沈疏桐',
          text: '管。日辰管卦里每一个爻——只是对戌土，这四日无克无生，不出手罢了。不出手，不等于不在场。',
        },
        next: 'ch4-s3-tm2',
      },
    ],
  },
  'ch4-s3-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-011', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家在提示下推断申酉亥子四日对戌土「无克无生」，与月建课「泄气休囚」两处对读补全账目。答错不惩罚：{{senior}}纠正「日辰管每一爻，不出手不等于不在场」后继续，不计 wrong。',
    next: 'ch4-s3-250',
  },
  'ch4-s3-250': {
    type: 'narration',
    text: '近午的日光落在两列字上。月建一列，日辰一列，像两队当值的差役，格局一模一样，各管各的时辰。',
    next: 'ch4-s3-260',
  },
  'ch4-s3-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '同构的东西，学一遍，用两次。',
    next: 'ch4-s3-270',
  },
  'ch4-s3-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '这张你收着。往后看卦，先把这两位——月里的令官，今日的司权——请出来站好，再开口。',
    aside: '{{ta}}把纸推给你，',
    next: 'ch4-s3-280',
  },
  // ── 3.2 考较 · CP-01 ──
  'ch4-s3-280': {
    type: 'narration',
    text: '{{ta}}却没让你歇。卦纸转回来，指尖从世爻戌土滑下去，停在四爻——',
    next: 'ch4-s3-290',
  },
  'ch4-s3-290': {
    type: 'narration',
    text: '官鬼午火。',
    next: 'ch4-s3-300',
  },
  'ch4-s3-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '换个人问。午火，卯月——旺衰如何？',
    next: 'ch4-s3-310',
  },
  'ch4-s3-310': {
    type: 'narration',
    text: '{{ta}}抱起手臂。这个姿势你认得：不提示。',
    next: 'ch4-s3-cp01',
  },
  // 抉择点 CP-01 · 计分 · KP-LY-010 独立应用 · 无提示（本幕主计分点）
  'ch4-s3-cp01': {
    type: 'scoredChoice', cpId: 'CH4-CP-01', testsKp: ['KP-LY-010'],
    prompt: '月建独立应用（卯月 × 官鬼午火）',
    context: '（午，火。卯，木。木与火——月建对它，是哪种手势？）',
    options: [
      {
        key: 'A',
        text: '卯木生午火——旺相',
        verdict: 'optimal',
        basis: '相生循环『木生火』：卯月建生午火，月建生爻＝旺相。换爻独立判月建手势，KP-LY-010 完整闭环（示范在世爻戌土，考较换官鬼午火——防背答案）。',
        sourceRef: [
          '《增删卜易》「1、月建能生克沖合」：「若在巳午月占卦﹐巳午之火乃是官鬼﹐能生戌土﹐謂之火旺土相」（同段生克同构，ctext wiki chapter=950329 提取行 567）',
          '《增删卜易·五行相生章第十一》：「木生火﹐火生土」（提取行 819）',
        ],
        next: 'ch4-s3-cp01a010',
      },
      {
        key: 'B',
        text: '卯木克午火——休囚',
        verdict: 'wrong',
        basis: '生克认反：木生火（柴薪之象），不是克。卯月的午火得月建之生，正旺。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「木生火﹐火生土﹐土生金」（ctext wiki chapter=950329 提取行 819）',
        ],
        next: 'ch4-s3-cp01b010',
      },
      {
        key: 'C',
        text: '午火当令——当时',
        verdict: 'suboptimal',
        basis: '『当时』是爻支与月建同字（午火须午月）——卯月当值的是卯，不是午。混淆了『月建生我』与『我临月建』两种手势：都算旺，名目不同，账不能混。',
        sourceRef: [
          '《增删卜易》：「若在戌月占卦﹐世爻戌土而為月建﹐此旺相以當時也」（提取行 567）',
        ],
        next: 'ch4-s3-cp01c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 1, mastery: 'KP-LY-010 → 掌握' },
      suboptimal: { plot: '{{senior}}把生与临两本账当场分开重讲，玩家重答后过', mastery: 'KP-LY-010 标记待复习' },
    },
    onWrong: '{{senior}}以灶膛添柴示生向（木生火），玩家重答后过。KP-LY-010 标记待复习。不锁主线。',
  },
  // ── CP-01 选 A（optimal）──
  'ch4-s3-cp01a010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '旺相。',
    next: 'ch4-s3-cp01a020',
  },
  'ch4-s3-cp01a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '示范给你的是戌土，你答上来的是午火——账没背，是会算了。这一课，成了。',
    aside: '{{ta}}点头点得很轻，可你看得出那半分满意，',
    next: 'ch4-s4-header',
  },
  // ── CP-01 选 B（wrong）──
  'ch4-s3-cp01b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卯木克午火？',
    next: 'ch4-s3-cp01b020',
  },
  'ch4-s3-cp01b020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '添柴是让火灭，还是让火旺？——木生火。卯月的午火，得生，旺相。重答。',
    aside: '{{ta}}朝堂角的灶膛抬了抬下巴，',
    m1Note: 'KP-LY-010 标记待复习。',
    next: 'ch4-s4-header',
  },
  // ── CP-01 选 C（suboptimal）──
  'ch4-s3-cp01c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '当时？当时是自家临月建——午火要等午月。如今当值的是卯。',
    next: 'ch4-s3-cp01c020',
  },
  'ch4-s3-cp01c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '月建生我，一本账；我临月建，另一本。都算旺，名目不能混——混了名目，往后细账全乱。',
    aside: '{{ta}}竖起两根手指，',
    m1Note: 'KP-LY-010 标记待复习。',
    next: 'ch4-s4-header',
  },

  // ═══════════════ 第四幕 · 数生克 ═══════════════
  'ch4-s4-header': {
    type: 'sceneHeader', scene: 4, title: '数生克',
    time: '午后', ambience: '明蓍堂。',
    m1Note: '本幕功能：CP-02（KP-LY-011 独立）；KP-LY-012 示范＋引导（合断三档口诀）；「四处」框架总览（动爻／变爻半句带过，第五章候选）；向查案的过渡句。',
    next: 'ch4-s4-010',
  },
  'ch4-s4-010': {
    type: 'narration',
    text: '午后。{{ta}}先把上午的账收了个尾。',
    next: 'ch4-s4-020',
  },
  // ── 4.1 考较 · CP-02 ──
  'ch4-s4-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '日辰那一列是你自己写的。写出来的东西，未必答得出来——',
    next: 'ch4-s4-030',
  },
  'ch4-s4-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日辛巳日。日辰对世爻戌土，是哪种手势？',
    aside: '{{ta}}指尖回到世爻戌土，',
    next: 'ch4-s4-cp02',
  },
  // 抉择点 CP-02 · 计分 · KP-LY-011 独立应用 · 无提示
  'ch4-s4-cp02': {
    type: 'scoredChoice', cpId: 'CH4-CP-02', testsKp: ['KP-LY-011'],
    prompt: '日辰独立应用（辛巳日 × 世爻戌土）',
    context: '（巳，火。戌，土。今日的司权对它——）',
    options: [
      {
        key: 'A',
        text: '巳火生戌土——日辰生它，生旺',
        verdict: 'optimal',
        basis: '巳属火，火生土：日辰生爻＝生旺。原文同例直证：「若在巳午日占卦﹐巳午之火卽是官鬼能生戌土。此謂之世爻逢官鬼而生旺」。且考的是今日（辛巳）——玩家须把课堂知识落到当下时令。',
        sourceRef: [
          '《增删卜易》「2、日辰能生克沖合」（ctext wiki chapter=950329 提取行 571）',
        ],
        next: 'ch4-s4-cp02a010',
      },
      {
        key: 'B',
        text: '巳沖戌——暗動',
        verdict: 'wrong',
        basis: '沖戌的是辰（辰戌正对）——巳与戌不沖。暗動的名字刚立，别见着日辰就喊動。',
        sourceRef: [
          '《增删卜易》「2、日辰能生克沖合」：「若在辰日占卦﹐辰沖戌土﹐謂之世爻暗動」——沖戌者辰，非巳（提取行 571）',
        ],
        next: 'ch4-s4-cp02b010',
      },
      {
        key: 'C',
        text: '戌临日建——当令得权',
        verdict: 'suboptimal',
        basis: '临日建须爻支与日辰同字——今日巳日，临日建的是巳火爻，不是戌土。又是『生我』与『我临』两本账（CP-01 同款陷阱，换到日辰重考）。',
        sourceRef: [
          '《增删卜易》：「若在戌日占卦﹐謂之世爻臨日建當令得權」（提取行 571）',
        ],
        next: 'ch4-s4-cp02c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-011 → 掌握' },
      suboptimal: { plot: '{{senior}}重摆『生我／我临』两本账（日辰版），玩家重答后过', mastery: 'KP-LY-011 标记待复习' },
    },
    onWrong: '{{senior}}把十二支在案上排成一圈，指给你看辰与戌正对而巳不对，玩家重答后过。KP-LY-011 标记待复习。不锁主线。',
  },
  // ── CP-02 选 A（optimal）──
  'ch4-s4-cp02a010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '生旺。',
    next: 'ch4-s4-cp02a020',
  },
  'ch4-s4-cp02a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '月建课我喂到你嘴边，日辰课你自己写的、自己答的。同构的东西学一遍用两次——你把两次都用上了。',
    aside: '{{ta}}难得地把下巴支在手背上看了你一瞬，',
    next: 'ch4-s4-050',
  },
  // ── CP-02 选 B（wrong）──
  'ch4-s4-cp02b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '巳沖戌？',
    next: 'ch4-s4-cp02b020',
  },
  'ch4-s4-cp02b020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '沖是正对面那一位——辰对戌，巳不对。暗動的名字才立半天，别见着日辰就喊動。重看，重答。',
    aside: '{{ta}}把十二个地支在案上排成一圈，辰与戌两枚隔圈正对，',
    m1Note: 'KP-LY-011 标记待复习。',
    next: 'ch4-s4-050',
  },
  // ── CP-02 选 C（suboptimal）──
  'ch4-s4-cp02c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '当令得权，要同字——今日巳日，得权的是卦里的巳火，不是戌土。',
    next: 'ch4-s4-cp02c020',
  },
  'ch4-s4-cp02c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '上午才分过的两本账：日辰生我，我临日建。换个考法你又混——回去把这两句抄十遍不必，记牢必须。',
    aside: '{{ta}}屈起两根手指，',
    m1Note: 'KP-LY-011 标记待复习。',
    next: 'ch4-s4-050',
  },
  // ── 4.2 合断 · 三档口诀 ──
  'ch4-s4-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '令官认全了，最后一步——合起来断。',
    next: 'ch4-s4-060',
  },
  'ch4-s4-060': {
    type: 'narration',
    text: '{{ta}}铺开一张新纸，写下两行字：',
    next: 'ch4-s4-070',
  },
  'ch4-s4-070': {
    type: 'narration',
    text: '月建一票，日辰一票。',
    next: 'ch4-s4-080',
  },
  'ch4-s4-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一个爻的处境，眼下你会看两处：月怎么待它，日怎么待它。两票合起来数——',
    next: 'ch4-s4-090',
  },
  'ch4-s4-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '生多克少，吉断。两处全来生扶，旺上加旺，诸事可为。',
    next: 'ch4-s4-100',
  },
  'ch4-s4-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '克多生少，凶推。两处全来克沖，休囚到底，百事艰难。',
    next: 'ch4-s4-110',
  },
  'ch4-s4-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一生一克，打平——看旺衰。帮它的那位旺，事可为；伤它的那位旺，事难成。',
    next: 'ch4-s4-120',
  },
  'ch4-s4-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '打平了……还能再比？拿什么比？',
    next: 'ch4-s4-130',
  },
  'ch4-s4-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '拿令比。',
    next: 'ch4-s4-140',
  },
  'ch4-s4-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '眼前就有一局。世爻戌土，卯月克它，巳日生它——一克一生，正打平。再看两位下注的：克它的卯木，这个月自己当令；生它的巳火，得卯月的木来生（木生火——方才午火那局刚算过），也旺——可当令的是卯，不是它。',
    aside: '{{ta}}朝窗外的春光抬了抬下巴，',
    next: 'ch4-s4-tm1',
  },
  'ch4-s4-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-012', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '合断三档口诀：生多克少吉断／克多生少凶推／一生一克打平看旺衰（帮它的旺则可为，伤它的旺则难成）。以世爻戌土实局示范：卯月克、巳日生，一克一生打平——克它的卯木本月当令，生它的巳火虽得月木相生也旺，但当令的是卯不是它，故此局戌土危。依据原文四处相持规则（「若有兩處克兩處生者﹐須看旺衰。生用神之神旺相者則以吉斷﹐克用神之神旺相者可以凶推」，witness 提取行 581）。',
    next: 'ch4-s4-150',
  },
  'ch4-s4-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你说，这一局，戌土是安是危？',
    next: 'ch4-s4-160',
  },
  // 引导应答 · KP-LY-012 · 好感位
  'ch4-s4-160': {
    type: 'choice',
    prompt: null,
    options: [
      {
        text: '当令的说了算——克它的正在令上，这局它危',
        response: {
          speaker: '沈疏桐',
          text: '对。旺者的话作数。打平不是没输赢，是把秤再往细里称一道。这句口诀收好——它比前两句都值钱。',
        },
        effects: { favor: 1 },
        next: 'ch4-s4-tm2',
      },
      {
        text: '打平就是不好不坏',
        response: {
          speaker: '沈疏桐',
          text: '打平是账面平——两边的分量还没称。克它的正当令，生它的不在令上：一头重，一头轻。称完了，它危。',
        },
        next: 'ch4-s4-tm2',
      },
    ],
  },
  'ch4-s4-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-012', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家在打平实局（世爻戌土：卯月克／巳日生）上应用「旺者的话作数」——克它的卯木当令则局危。答错不惩罚：{{senior}}纠正账面平≠称完平后继续，不计 wrong。',
    next: 'ch4-s4-170',
  },
  // ── 4.3 四处的另一半 ──
  'ch4-s4-170': {
    type: 'narration',
    text: '{{ta}}把三句口诀写完，却在纸的下半页画了四个格子，只填了两个：月建。日辰。',
    next: 'ch4-s4-180',
  },
  'ch4-s4-180': {
    type: 'dialogue', speaker: '{{player}}',
    text: '还有两格？',
    next: 'ch4-s4-190',
  },
  'ch4-s4-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '有。原书数的是四处生克沖合——月建、日辰之外，还有卦里的动爻，和动爻自己变出来的爻。',
    next: 'ch4-s4-200',
  },
  'ch4-s4-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你如今的卦，六爻安静，用不上那两处。等你认得动爻翻身，再开那两本账。',
    aside: '{{ta}}把笔搁在空格上，没有落，',
    next: 'ch4-s4-210',
  },
  'ch4-s4-210': {
    type: 'dialogue', speaker: '{{player}}',
    text: '所以今日学的，是半张秤？',
    next: 'ch4-s4-220',
  },
  'ch4-s4-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '是称得准眼下所有卦的半张秤。',
    next: 'ch4-s4-230',
  },
  'ch4-s4-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '另半张，秤杆已经给你看过了——格子留在这儿，字迟早会填上。',
    aside: '{{ta}}纠正得不紧不慢，',
    next: 'ch4-s4-240',
  },
  // ── 4.4 过渡 · 秤离案 ──
  'ch4-s4-240': {
    type: 'narration',
    text: '日头偏西了一线。{{ta}}把三张纸——月建的账、日辰的账、合断的口诀——叠齐，却没有收进匣子，而是折起来揣进了袖中。',
    next: 'ch4-s4-250',
  },
  'ch4-s4-250': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}这是要出门？',
    next: 'ch4-s4-260',
  },
  'ch4-s4-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '带着秤，去称几句人话。',
    next: 'ch4-s4-270',
  },
  'ch4-s4-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '爻有时令，话也有。同一句话，几时说的、说时当不当令——分量差得远。',
    aside: '{{ta}}起身理袖，',
    next: 'ch4-s4-280',
  },
  'ch4-s4-280': {
    type: 'narration',
    text: '{{ta}}走到门口，回头看你一眼。',
    next: 'ch4-s4-290',
  },
  'ch4-s4-290': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '修书房。三句旧话，该重新过秤了。',
    next: 'ch4-s5-header',
  },
  // ═══════════════ 第五幕 · 人证的时令 ═══════════════
  'ch4-s5-header': {
    type: 'sceneHeader', scene: 5, title: '人证的时令',
    time: '午后至傍晚', ambience: '修书房（bg-xiushufang）。',
    m1Note: '本幕功能：案情主推进——当值簿（巳时地利）／工籍册（生肖档案位）／崔小砚证词重估（时令重问）／白芷托话（远景回响）；「人证也有旺衰」金句；好感风味 +1。红线执行：巳时／生肖＝地支常识，她口头运用不立 KP（§ 0 第 8 条）；窄化不闭合，「谁」不揭（§ 0 第 12 条）。',
    next: 'ch4-s5-010',
  },

  // ── 5.1 两本簿子 ──
  'ch4-s5-010': {
    type: 'narration',
    text: '修书房还是那个修书房：前屋誊录案上笔耕不辍，后院晒架的浆布在春风里晃。郑司书迎出来，袖口还沾着一点浆糊。',
    next: 'ch4-s5-020',
  },
  'ch4-s5-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '郑司书，借两本簿子——当值簿，和工籍册。',
    next: 'ch4-s5-030',
  },
  'ch4-s5-030': {
    type: 'dialogue', speaker: '郑司书',
    text: '簿子？要查哪一位的……',
    aside: '一愣',
    next: 'ch4-s5-040',
  },
  'ch4-s5-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '例行复核。上月点验的尾账。顺带——去岁腊月至正月，修书房每日各时辰谁在何处当值，簿上可全？',
    aside: '{{ta}}答得滴水不漏，',
    next: 'ch4-s5-050',
  },
  'ch4-s5-050': {
    type: 'dialogue', speaker: '郑司书',
    text: '全！老朽管这院子，头一条就是簿册齐整——',
    next: 'ch4-s5-060',
  },
  'ch4-s5-060': {
    type: 'narration',
    text: '两本簿子摊开在前屋案上。沈疏桐翻当值簿，你翻工籍册。',
    next: 'ch4-s5-070',
  },
  'ch4-s5-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你来看。裱活的规矩——浆糊怕潮，晾书要赶日头。每日什么时辰上浆晾书？',
    aside: '翻到腊月，指尖顺着时辰格往下走',
    next: 'ch4-s5-080',
  },
  'ch4-s5-080': {
    type: 'narration',
    text: '当值簿上写得分明：裱案上浆，辰末开工；晾架翻书，巳时当值——宋。',
    next: 'ch4-s5-090',
  },
  'ch4-s5-090': {
    type: 'dialogue', speaker: '{{player}}',
    text: '巳时……',
    next: 'ch4-s5-100',
  },
  'ch4-s5-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '日上三竿到晌午前，古称隅中。巳时。晾架在后院。也就是说，重装那一个月，每日巳时，后院里必定站着宋补之——日日如此，风雨无阻，浆糊说了算。',
    aside: '{{ta}}的指尖在那个「宋」字上停了一停，',
    next: 'ch4-s5-110',
  },
  'ch4-s5-110': {
    type: 'dialogue', speaker: '{{player}}',
    text: '后窗……就开在后院。',
    next: 'ch4-s5-120',
  },
  'ch4-s5-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。记下，不下断语：巳时的后院，是宋师傅的地界。——这是『地利』，不是罪名。晾书是他的活计，站在那儿天经地义。',
    aside: '{{ta}}翻过一页，语气平得像在念账，',
    m1Note: '依据自查：宋补之裱匠当值＝ch3 立人「裱、补、裁、揭全能」的日常化；晾浆赶日头＝ch2 幕六「领去重装书脊」工序的自然延伸。「巳时」在此为时刻表事实，与卦中巳火的勾连由下文她亲口点破边界。',
    next: 'ch4-s5-130',
  },

  // ── 5.2 工籍册 · 生肖 ──
  'ch4-s5-130': {
    type: 'narration',
    text: '你这边的工籍册翻到了修书房那一页。姓名、籍贯、入门年份——还有一栏：生年。',
    next: 'ch4-s5-140',
  },
  'ch4-s5-140': {
    type: 'narration',
    text: '你想起藏经阁里那枚上偏半分的点，想起山地剥应位上那枚巳火。巳……巳年生人，属蛇。',
    next: 'ch4-s5-150',
  },
  'ch4-s5-150': {
    type: 'narration',
    text: '你一行行看下去——',
    next: 'ch4-s5-160',
  },
  'ch4-s5-160': {
    type: 'narration',
    text: '宋补之，酉年生，属鸡。',
    next: 'ch4-s5-170',
  },
  'ch4-s5-170': {
    type: 'narration',
    text: '崔小砚，子年生，属鼠。',
    next: 'ch4-s5-180',
  },
  'ch4-s5-180': {
    type: 'narration',
    text: '白芷，未年生，属羊。',
    next: 'ch4-s5-190',
  },
  'ch4-s5-190': {
    type: 'narration',
    text: '你又从头数了一遍。修书房在册三人，连同管辖的郑司书（辰年，属龙）——',
    next: 'ch4-s5-200',
  },
  'ch4-s5-200': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……没有属蛇的。',
    next: 'ch4-s5-210',
  },
  'ch4-s5-210': {
    type: 'narration',
    text: '沈疏桐从当值簿上抬起眼。{{ta}}接过工籍册，自己又数了一遍——{{ta}}核账从来不省这一遍。',
    next: 'ch4-s5-220',
  },
  'ch4-s5-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '没有。',
    next: 'ch4-s5-230',
  },
  'ch4-s5-230': {
    type: 'dialogue', speaker: '{{player}}',
    text: '那卦上的巳——',
    next: 'ch4-s5-240',
  },
  'ch4-s5-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '先把话说在明处。巳作巳时解、作属相解，是地支的常识，纪时纪年，人人会用——不是断卦的法。卦把巳火放在应位，没说它是时辰还是属相，更没画谁的脸。我拿它当查案的方向使，跟拿灯照路一个道理——灯不是路。',
    aside: '{{ta}}合上册子，神色是上课时那种一字不让的认真，',
    next: 'ch4-s5-250',
  },
  'ch4-s5-250': {
    type: 'dialogue', speaker: '{{player}}',
    text: '可这两个方向，一个照见了巳时的后院——',
    next: 'ch4-s5-260',
  },
  'ch4-s5-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一个照出了名册之外。修书房里没有属蛇的。要么，巳字不作属相解；要么——',
    aside: '{{ta}}把两本簿子叠齐，声音沉下去，',
    next: 'ch4-s5-270',
  },
  'ch4-s5-270': {
    type: 'narration',
    text: '{{ta}}没说完。这半句话悬在浆糊味的空气里，比说完更沉。',
    next: 'ch4-s5-280',
  },
  'ch4-s5-280': {
    type: 'narration',
    text: '——要么，那个人不在这三个里。你想起白芷那句「第四个」没说出口的话，想起夜里不点灯的影子。',
    m1Note: '窄化不闭合自查（§ 0 第 12 条）：两条地支线索分叉——时辰线圈住宋（地利，非罪名），生肖线指向名册之外（呼应 ch3「或者第四个」正典暗线）——互不闭合，谁也不指认。她的「灯不是路」＝ch3「卦不替你点名」纪律的本章变体。生肖设定为新立正典（工籍册首次翻开）：宋酉鸡／崔子鼠／白未羊／郑辰龙，后续章节勿漂移。',
    next: 'ch4-s5-290',
  },

  // ── 5.3 三遍的时令 ──
  'ch4-s5-290': {
    type: 'narration',
    text: '誊录案后，崔小砚早就竖着耳朵了——簿册一响他就搁了笔，这会儿下巴照旧抬着，眼里却藏不住地想知道你们在翻什么。',
    next: 'ch4-s5-300',
  },
  'ch4-s5-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '小崔师傅。上回你说过一句话，我记到今日——那册谱的世点，一点不错。',
    next: 'ch4-s5-310',
  },
  'ch4-s5-310': {
    type: 'dialogue', speaker: '崔小砚',
    text: '我说错了？',
    aside: '下巴又高半寸',
    next: 'ch4-s5-320',
  },
  'ch4-s5-320': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '没有。我今日来，不问你说的对不对——问你说的几时。',
    next: 'ch4-s5-330',
  },
  'ch4-s5-330': {
    type: 'narration',
    text: '崔小砚一怔。',
    next: 'ch4-s5-340',
  },
  'ch4-s5-340': {
    type: 'narration',
    text: '{{ta}}侧过身，把问话的位子让了半步给你——这个动作你在集市见过一回。',
    next: 'ch4-s5-350',
  },
  // 走访风味 · 不计分；三选项殊途同归（同一条时间线索、好感等值 +1）——考的是玩家把
  // 「时令」思路亲手用到人证上（幕四过渡句的落实）。崔的三遍钉死在腊月初二至初五＝
  // 重装之初、伪页调换窗口（重装一个月）之前沿——新立正典，勿漂移。
  'ch4-s5-350': {
    type: 'choice',
    prompt: null,
    m1Note: '三选项殊途同归（同一条时间线索、好感等值）——考的是玩家把「时令」思路亲手用到人证上（幕四过渡句的落实）。崔的三遍钉死在腊月初二至初五＝重装之初、伪页调换窗口（重装一个月）之前沿——新立正典，勿漂移。',
    options: [
      {
        text: '崔师傅，你说翻过三遍——三遍，各在几时？',
        response: {
          speaker: '崔小砚',
          aside: '崔小砚张口就答：他答得太快，反倒自己愣了一下，补道：',
          text: '腊月初二、初三、初五。书一到我就翻的。誊录的规矩，接书先查内页有无残字可誊——那册谱无字，我翻三遍是……是想把卦画的次序录下来。',
        },
        effects: { favor: 1 },
        next: 'ch4-s5-360',
      },
      {
        text: '翻三遍的时候，宋师傅动工了没有？',
        response: {
          speaker: '崔小砚',
          aside: '他随即明白了什么，声音低下去，',
          text: '没有。书刚到，浆都没开。初二到初五……我翻的时候，装帧一根线都没拆。',
        },
        effects: { favor: 1 },
        next: 'ch4-s5-360',
      },
      {
        text: '你誊的《卦名次序抄》——是照那册谱录的？',
        response: {
          speaker: '崔小砚',
          aside: '崔小砚的耳根红了红：',
          text: '……起头是。腊月初，书一到我就照着录卦序——就翻了三遍，初二初三初五。后头宋师傅开了工，书上了裱案，我就没再碰。',
        },
        effects: { favor: 1 },
        next: 'ch4-s5-360',
      },
    ],
  },
  // ── 三线汇合 ──
  'ch4-s5-360': {
    type: 'narration',
    text: '沈疏桐点点头，忽然问了一句不相干的：',
    next: 'ch4-s5-370',
  },
  'ch4-s5-370': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '初五之后，再没翻过？',
    next: 'ch4-s5-380',
  },
  'ch4-s5-380': {
    type: 'dialogue', speaker: '崔小砚',
    text: '书在裱案上摊着筋骨，谁碰谁挨骂。正月里还回藏经阁，我……我没再见着它。',
    aside: '他顿了顿，那点倨傲忽然瘪了下去，',
    next: 'ch4-s5-390',
  },
  'ch4-s5-390': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '好。听见了？他那句「一点不错」，说的是腊月初的谱——伪页换上去，是那之后的事。他的话没错——错的是拿它去称正月的谱。',
    aside: '{{ta}}转向你，就在崔小砚面前，把账当场算给你看，',
    next: 'ch4-s5-400',
  },
  'ch4-s5-400': {
    type: 'dialogue', speaker: '{{player}}',
    text: '证词……也有它的时令。',
    next: 'ch4-s5-410',
  },
  'ch4-s5-410': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '人证也有旺衰。',
    next: 'ch4-s5-420',
  },
  'ch4-s5-420': {
    type: 'narration',
    text: '{{ta}}说这六个字的时候，看的不是你，是誊录案后那个愣住的年轻人。',
    next: 'ch4-s5-430',
  },
  'ch4-s5-430': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '得令的话未必真，失令的话未必假——先问它是几月说的。小崔师傅这句话，在它自己的令里，是真的。',
    next: 'ch4-s5-440',
  },
  'ch4-s5-440': {
    type: 'narration',
    text: '崔小砚站在案后，嘴唇动了动，最后只说出四个字：',
    next: 'ch4-s5-450',
  },
  // UNCERTAINTY：脚本原文此处硬编码「师姐」而非 {{senior}} 模板变量（崔小砚为 NPC 对话，
  // 全书唯一一处 NPC 称呼沈疏桐用字面「师姐」——若 seniorGender='male' 会误显「师姐」）。
  // 按 VERBATIM 铁律逐字保留，未擅自改写为 {{senior}}；已在最终报告 UNCERTAINTIES 中标注。
  'ch4-s5-450': {
    type: 'dialogue', speaker: '崔小砚',
    text: '……多谢{{senior}}。',
    next: 'ch4-s5-460',
  },
  'ch4-s5-460': {
    type: 'narration',
    text: '他大约自己也不知道在谢什么。可你看得出来，那句压在他头上三天的「一点不错」，落了地。',
    m1Note: '证词重估结算（§ 0 第 12 条）：ch3 悬置的「三种可能」落定第一种（翻阅在调换之前）——崔嫌疑降级不出局（若他连「几时翻的」也一并撒谎，则另当别论——她不说这层，账面上留着）。「人证也有旺衰」金句＝策划案 § 2 原句照落。红线自查：重估全程未用卦断人——用的是当值簿与问话（人间的笨功夫）；旺衰在此为譬喻迁移（课程与查案同构），她明说「先问几时说的」是查案纪律不是卦法。',
    next: 'ch4-s5-470',
  },

  // ── 5.4 捎回来的一句话 ──
  'ch4-s5-470': {
    type: 'narration',
    text: '出修书房时，日头已经贴着西墙了。郑司书送到门口，忽然想起什么，一拍脑门。',
    next: 'ch4-s5-480',
  },
  // 裸「她」= 白芷（HARD RULE #10 指代分诊白名单）。
  'ch4-s5-480': {
    type: 'dialogue', speaker: '郑司书',
    text: '险些忘了！前日老朽下山采买，顺道去集上看了看白芷——老人儿了，总得看一眼。她还是那样，话少。临走了，就问了老朽一句——',
    next: 'ch4-s5-490',
  },
  'ch4-s5-490': {
    type: 'narration',
    text: '老人学得很像，连那点平平的语气都学了出来：',
    next: 'ch4-s5-500',
  },
  'ch4-s5-500': {
    type: 'dialogue', speaker: '郑司书',
    text: '『院里那扇窗，修了没有。』',
    next: 'ch4-s5-510',
  },
  'ch4-s5-510': {
    type: 'narration',
    text: '风从后院晒架那头吹过来，浆布哗啦一响。',
    next: 'ch4-s5-520',
  },
  // 裸「她」= 白芷。
  'ch4-s5-520': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '她还惦记那扇窗。',
    aside: '站定',
    next: 'ch4-s5-530',
  },
  // 裸「她」×2 = 白芷。
  'ch4-s5-530': {
    type: 'dialogue', speaker: '郑司书',
    text: '老朽答她：插销是你走前才换的新，能坏到哪儿去？她『嗯』了一声，就低头拧衣裳了。……怪话。窗又没坏，修什么？',
    aside: '挠头',
    next: 'ch4-s5-540',
  },
  'ch4-s5-540': {
    type: 'narration',
    text: '沈疏桐没接话。{{ta}}朝后院的方向看了一眼——晒架，浆布，和浆布后头那扇小小的、上着新插销的后窗。',
    next: 'ch4-s5-550',
  },
  // 裸「她」= 白芷。
  'ch4-s5-550': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '窗没坏。她怕的东西，不是坏窗。',
    aside: '声音很低，只有你听得见',
    m1Note: '远景回响（策划案 § 2 暗线红线）：白芷不出场，一句托话——「那扇窗」＝她十年守规矩的人最后修的东西、也是她「怕」的具象出口；不展开、不解释（她怕什么留后章）。本句同时为幕六「去看窗」递刀。',
    next: 'ch4-s6-header',
  },

  // ═══════════════ 第六幕 · 窗台与临 ═══════════════
  'ch4-s6-header': {
    type: 'sceneHeader', scene: 6, title: '窗台与临',
    time: '入夜', ambience: '修书房后院（bg-xiushufang 沿用）→ 明蓍堂。',
    m1Note: '本幕功能：窗台实物揭出（策划案 § 2 明线兑现）；摇卦交互（地泽临）；CP-03（KP-LY-012 案卦实断——主计分点，前置 KP-LY-009 复用小问）；「临」卦名共振；favorBranch 锚点（§ 0 第 3 条）。剧情固定卦象：地泽临 · 六爻安静，掷序（初→上）[7,7,8,8,8,8]（引擎已验证，见 § 0 第 1 条）。',
    next: 'ch4-s6-010',
  },

  // ── 6.1 那扇窗 ──
  'ch4-s6-010': {
    type: 'narration',
    text: '郑司书前头引路，绕过晒架。后院比前屋安静，浆布的影子在墙上晃。',
    next: 'ch4-s6-020',
  },
  'ch4-s6-020': {
    type: 'narration',
    text: '那扇后窗比你想的还小——一人高的墙上开的一方口，窗框旧得发乌，独独插销是新的，木色白净：白芷走前削的那根。',
    next: 'ch4-s6-030',
  },
  'ch4-s6-030': {
    type: 'narration',
    text: '沈疏桐先验插销：拨开，合上，再拨开。滑顺，严丝合缝——修插销的人手艺很尽心。',
    next: 'ch4-s6-040',
  },
  // 裸「她」×2 = 白芷（HARD RULE #10：6.1 段内成对出现）。
  'ch4-s6-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '窗是好的。白芷惦记的不是窗坏——郑司书也说了，插销是她走前才换的新。那她惦记什么？',
    aside: '{{ta}}收回手，眉却没松，',
    next: 'ch4-s6-050',
  },
  'ch4-s6-050': {
    type: 'narration',
    text: '你站在窗前。夕照从晒架的缝里漏过来，斜斜切在窗台上——那是一条打磨过的旧条石，与窗框之间嵌得很实。',
    next: 'ch4-s6-060',
  },
  'ch4-s6-060': {
    type: 'narration',
    text: '嵌得很实……不对。',
    next: 'ch4-s6-070',
  },
  'ch4-s6-070': {
    type: 'narration',
    text: '靠外的那一角，条石与窗框之间有一道缝——细得插不进一枚铜钱。可缝口的灰，比别处浅。',
    next: 'ch4-s6-080',
  },
  'ch4-s6-080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}——这道缝，动过。',
    next: 'ch4-s6-090',
  },
  'ch4-s6-090': {
    type: 'narration',
    text: '{{ta}}俯身看了一眼，从发间抽下簪子，簪尖入缝，轻轻一挑——',
    next: 'ch4-s6-100',
  },
  'ch4-s6-100': {
    type: 'narration',
    text: '一个油纸小包，薄得像一片压扁的叶子，从缝里出来了。',
    m1Note: '玩家高光纪律：缝是玩家看见的（灰色深浅——白芷式的「眼睛记事」，玩家从她身上学来的看法）；她只负责取。与 ch3「结论由玩家说出」同款分工。',
    next: 'ch4-s6-110',
  },

  // ── 6.2 一列点 ──
  'ch4-s6-110': {
    type: 'narration',
    text: '回到明蓍堂，灯下。油纸包展开——里头只有一页对折的薄纸。',
    next: 'ch4-s6-120',
  },
  'ch4-s6-120': {
    type: 'narration',
    text: '纸已经泛黄发脆，折痕处几乎要断。展开来，纸上无字。',
    next: 'ch4-s6-130',
  },
  'ch4-s6-130': {
    type: 'narration',
    text: '只有点。',
    next: 'ch4-s6-140',
  },
  'ch4-s6-140': {
    type: 'narration',
    text: '一列墨点，十来枚，从上到下，排得整整齐齐。每一枚都极小，极圆——你把纸凑到灯前，看了两息，后背一点点凉上来：',
    next: 'ch4-s6-150',
  },
  'ch4-s6-150': {
    type: 'narration',
    text: '每一枚点，都在各自的位置上，朝上偏了半分。',
    next: 'ch4-s6-160',
  },
  'ch4-s6-160': {
    type: 'narration',
    text: '同一个方向。同一个分寸。同一枚点，点了一列——像印章铺子里，掌柜压在匣底的那张印鉴底样。',
    next: 'ch4-s6-170',
  },
  'ch4-s6-170': {
    type: 'dialogue', speaker: '{{player}}',
    text: '观页上那枚点……不是笔误，也不是一时兴起。是——',
    next: 'ch4-s6-180',
  },
  'ch4-s6-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记号。',
    next: 'ch4-s6-190',
  },
  'ch4-s6-190': {
    type: 'narration',
    text: '{{ta}}把薄纸接过去，对着灯。灯焰把纸照成暖黄色，那列点像一行没有字的字。',
    next: 'ch4-s6-200',
  },
  'ch4-s6-200': {
    type: 'narration',
    text: '{{ta}}看了很久。比方才验插销久，比在藏经阁看那页观还久。',
    next: 'ch4-s6-210',
  },
  'ch4-s6-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '我认得这个起笔。',
    aside: '声音很低',
    next: 'ch4-s6-220',
  },
  'ch4-s6-220': {
    type: 'narration',
    text: '你等{{ta}}说下去。{{ta}}没有。',
    next: 'ch4-s6-230',
  },
  'ch4-s6-230': {
    type: 'narration',
    text: '{{ta}}把纸按原折痕折好，搁在案上，压平——做这几个动作的时候，{{ta}}的指尖比平日慢了半拍。',
    next: 'ch4-s6-240',
  },
  'ch4-s6-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '这页纸说了两件事。第一，观页那半分不是错——是有来历的记号，有底样为证。第二——',
    aside: '再开口时，{{ta}}的声音已经回到了课上的温度，',
    next: 'ch4-s6-250',
  },
  'ch4-s6-250': {
    type: 'narration',
    text: '{{ta}}的指尖点在油纸包上。',
    next: 'ch4-s6-260',
  },
  'ch4-s6-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '白芷换新插销在正月，这包在缝里、灰口还是浅的——放它的人，来得比插销晚。窗一直是好的，东西是新放的。',
    next: 'ch4-s6-270',
  },
  'ch4-s6-270': {
    type: 'dialogue', speaker: '{{player}}',
    text: '书早还回藏经阁了。他不来找书——他来放这个。可、可为什么？藏东西，有的是地方，为什么偏偏是案发的窗台？',
    next: 'ch4-s6-280',
  },
  'ch4-s6-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '两个解。最险的地方最安全——人人查过的窗台，没人再看第二眼。或者——',
    aside: '{{ta}}竖起一根手指，又竖起一根，',
    next: 'ch4-s6-290',
  },
  'ch4-s6-290': {
    type: 'narration',
    text: '{{ta}}顿住了。灯焰跳了一下。',
    next: 'ch4-s6-300',
  },
  'ch4-s6-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '放给会来看的人。',
    next: 'ch4-s6-310',
  },
  'ch4-s6-310': {
    type: 'narration',
    text: '屋里静了一息。窗外的夜风把这句话的分量压进你心里：如果是后一个解——那扇窗，是一处接头的地方。',
    next: 'ch4-s6-320',
  },
  'ch4-s6-320': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '两个解，眼下断不了。人的账算到这儿，算尽了。——问卦。',
    aside: '{{ta}}收回手，看向案角那三枚旧钱，',
    m1Note: '实物结算（§ 0 第 13 条）：样张＝泛黄旧纸（抄谱年代之物）＋新近放置（灰口／插销时序）——「偏半分＝记号」实锤 ch3「故意的」，「记号编码何意／谁放／给谁看」全部悬置（第五章）。「我认得这个起笔」不解释：《钱囊》线玩家自会对上师承，未玩番外读作「点验三十页时认熟的」——双层读法皆通，主线不依赖番外（ch3 § 0 第 8 条红线延续，「师父」字样全程不出现）。「放」的两解＝ch3 5.4 原文两句台词的正典兑现：找（第一解的反面）已被「书不在」排除，放（第二解）落地为实物；接头之疑为第五章「守株待兔」递刀。',
    next: 'ch4-s6-330',
  },

  // ── 6.3 问卦 · 地泽临 ──
  'ch4-s6-330': {
    type: 'narration',
    text: '净手。焚香。三枚旧钱在香上过——第四张案卦了，这套动作你做得比呼吸还稳。',
    next: 'ch4-s6-340',
  },
  'ch4-s6-340': {
    type: 'narration',
    text: '沈疏桐坐在案对面。{{ta}}先把一件事说在摇卦前头：',
    next: 'ch4-s6-350',
  },
  'ch4-s6-350': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今夜不问人。问人看应，山地剥问过了——他在对面，卦已答过一次，不必问第二遍。今夜问物。问这页纸、这桩事——还活不活。',
    aside: '{{ta}}的指尖落在那页折好的薄纸上，',
    next: 'ch4-s6-360',
  },
  'ch4-s6-360': {
    type: 'dialogue', speaker: '{{player}}',
    text: '天何言哉，叩之即应。弟子{{player}}，为修书房窗台藏纸事关心，其物何主，其事未了否，罔释厥疑。惟神惟灵，若可若否，望垂昭报。',
    aside: '默诵，落声',
    next: 'ch4-s6-cast',
  },
  // 案卦：固定卦象 地泽临 · 六爻安静。掷序 [7,7,8,8,8,8]（初→上）。
  // 剧本原文：第 1-3 掷各有独立台词（单／单／兑上缺内卦成）；第 4-6 掷剧本 marker 下无文字——
  // 「后三掷，三个拆。外卦六断——坤」的揭示与「地泽——临」定名，是三掷全部落定*之后*才发生
  // 的内容，不属于任何单一掷的台词。
  // 引擎契约核对（Player.jsx handleThrow，2026-07-17 读源码实测）：thrown.length===6 时函数
  // 提前 return 结算，从不检查 cNode.perThrow[5].interleaveNode——挂在第 6 掷上的 interleaveNode
  // 永远不会被引擎消费（interleave 机制只对 throwIndex 1-5 有效，见 handleThrow 内
  // `const interleave = cNode.perThrow?.[i]?.interleaveNode` 这一行在 length===6 分支之后才执行）。
  // 故第 4/5/6 掷 speakerLine 留空字符串——CastPanel 在 lastLine 为空时不渲染发言行（只显示铜钱
  // 与爻结果），忠实对应剧本「marker 下无文字」的事实；「后三掷…临」整段改走 castInteraction.next，
  // 见 ch4-s6-370 起。UNCERTAINTY：已用引擎源码验证此为技术正确选择，非风格猜测，仍列出供复核。
  'ch4-s6-cast': {
    type: 'castInteraction', castId: 'ch4-angua', mode: 'fixed',
    throws: [7, 7, 8, 8, 8, 8],
    question: '修书房窗台藏纸，其物何主，其事未了否？',
    perThrow: [
      {
        throwIndex: 1, result: '单', coinFaces: '一背两字', lineName: '初爻',
        speaker: '{{player}}',
        speakerLine: '（钱落盘。一个背。）单。阳爻。',
      },
      {
        throwIndex: 2, result: '单', coinFaces: '一背两字', lineName: '二爻',
        speaker: '{{player}}',
        speakerLine: '又是单。',
      },
      {
        throwIndex: 3, result: '拆', coinFaces: '两背一字', lineName: '三爻',
        speaker: '{{player}}',
        speakerLine: '（三掷落定。下卦：阳、阳、阴——）兑上缺。内卦，泽。',
      },
      {
        throwIndex: 4, result: '拆', coinFaces: '两背一字', lineName: '四爻',
        speaker: '{{player}}',
        speakerLine: '',
      },
      {
        throwIndex: 5, result: '拆', coinFaces: '两背一字', lineName: '五爻',
        speaker: '{{player}}',
        speakerLine: '',
      },
      {
        throwIndex: 6, result: '拆', coinFaces: '两背一字', lineName: '上爻',
        speaker: '{{player}}',
        speakerLine: '',
      },
    ],
    next: 'ch4-s6-370',
  },
  // ── 六掷落定：「地泽——临」揭示 ──
  'ch4-s6-370': {
    type: 'narration',
    text: '后三掷，三个拆。外卦六断——坤。地在上，泽在下。',
    next: 'ch4-s6-380',
  },
  'ch4-s6-380': {
    type: 'dialogue', speaker: '{{player}}',
    text: '地泽——临。',
    next: 'ch4-s6-390',
  },
  'ch4-s6-390': {
    type: 'narration',
    text: '「临」字出口的一瞬，你自己先怔住了。',
    next: 'ch4-s6-400',
  },
  'ch4-s6-400': {
    type: 'narration',
    text: '临月建的临。临日建的临。今日一整天，这个字在课上落了多少遍——此刻它端端正正，坐在卦名里。',
    next: 'ch4-s6-410',
  },
  'ch4-s6-410': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坤宫，第三卦，二世。六爻安静。——装。',
    aside: '看着卦纸，眼里那点东西你读不出是冷是热',
    next: 'ch4-s6-420',
  },
  'ch4-s6-420': {
    type: 'narration',
    text: '装支、安世应、装亲，你的手比脑子先动完：兑内巳、卯、丑，坤外丑、亥、酉；二世，世安二爻，应落五爻；坤宫属土，土为我——',
    next: 'ch4-s6-430',
  },
  'ch4-s6-430': {
    type: 'narration',
    text: '初爻巳火，生我者——父母。二爻卯木，克我者——官鬼，坐着世。五爻亥水，我克者——妻财，坐着应。',
    next: 'ch4-s6-440',
  },
  'ch4-s6-440': {
    type: 'narration',
    text: '六个名分落定。{{ta}}看你装完，一个字没纠——这一手，你已经不会错了。',
    next: 'ch4-s6-dr1',
  },
  // 装卦快带（装支/世应/装亲 一段式熟练演示，不设逐爻交互）：FULL cumulative board。
  // 地泽临六亲（初→上，卯月辛巳日）：父母巳火／官鬼卯木[世]／兄弟丑土／兄弟丑土／
  // 妻财亥水[应]／子孙酉金。此刻只亮六亲，旺衰未判——wangshuai 待 CP-03 判罢才补
  // （见 ch4-s6-dr2），避免棋盘提前泄题（CP-03 三个选项的分歧正是「旺不旺」）。
  'ch4-s6-dr1': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 7, 8, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '巳', wuxing: '火', liuqin: '父母' },
        { pos: 2, branch: '卯', wuxing: '木', liuqin: '官鬼' },
        { pos: 3, branch: '丑', wuxing: '土', liuqin: '兄弟' },
        { pos: 4, branch: '丑', wuxing: '土', liuqin: '兄弟' },
        { pos: 5, branch: '亥', wuxing: '水', liuqin: '妻财' },
        { pos: 6, branch: '酉', wuxing: '金', liuqin: '子孙' },
      ],
      marks: { world: 2, response: 5 },
    },
    next: 'ch4-s6-450',
  },

  // ── 6.4 抉择 · CP-03 ──
  'ch4-s6-450': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问的是这页纸。纸，择谁为用神？',
    next: 'ch4-s6-precp',
  },
  // 前置小问 · KP-LY-009 复用 · 引导式不计分（无 favor，三选项一律指向同一汇合点）。
  'ch4-s6-precp': {
    type: 'choice',
    prompt: null,
    context: '（问什么事，看哪一亲——第三课的功夫。纸是什么？）',
    options: [
      {
        text: '纸是文书——择父母爻，初爻巳火',
        response: { speaker: '沈疏桐', text: '文书书册，庇护我身者——父母。初爻巳火，用神立定。' },
        next: 'ch4-s6-460',
      },
      {
        text: '贼放的东西——择官鬼',
        response: { speaker: '沈疏桐', text: '官鬼是拘我者——问贼看官鬼，问贼的物件还是看物件本身的亲。纸是文书，归父母。别把人的账记到物头上。' },
        next: 'ch4-s6-460',
      },
      {
        text: '一页值钱的纸——妻财',
        response: { speaker: '沈疏桐', text: '值不值钱要看是什么纸。文书章册，父母爻——第三课教过的：问书，看父母。' },
        next: 'ch4-s6-460',
      },
    ],
  },
  // ── 三线汇合：用神立定 ──
  'ch4-s6-460': {
    type: 'narration',
    text: '用神：父母巳火，初爻。',
    next: 'ch4-s6-470',
  },
  'ch4-s6-470': {
    type: 'narration',
    text: '——又是巳火。你已经不数第几回了。',
    next: 'ch4-s6-480',
  },
  'ch4-s6-480': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '用神立定，最后一步。卯月，辛巳日。月建对它，日辰对它——合断。',
    aside: '{{ta}}抱起手臂，靠进椅背——这个姿势整整一天没出现过了，',
    next: 'ch4-s6-cp03',
  },
  // ── CP-03 · 计分 · KP-LY-012 独立应用（案卦实断）· 无提示 · 本章主计分点 ──
  'ch4-s6-cp03': {
    type: 'scoredChoice', cpId: 'CH4-CP-03', testsKp: ['KP-LY-012'],
    prompt: '案卦合断（地泽临 · 用神父母巳火 × 卯月辛巳日）',
    context: '（巳，火。卯月——木与火。辛巳日——巳与巳。两票，合起来数。）',
    options: [
      {
        key: 'A',
        text: '卯木生巳火，月建生它；巳日同字，临日建当令得权——两处全向着它：旺。',
        verdict: 'optimal',
        basis: '木生火：卯月建生巳火用神（生＝旺相）；辛巳日与用神同字：临日建＝當令得權。两处皆扶，无克——合断三档之『生多克少，吉断』：用神旺。月建手势＋日辰名目＋合断口诀三 KP 全链独立联用——本章主计分点。',
        sourceRef: [
          '《增删卜易》「1、月建能生克沖合」：生扶＝旺相（ctext wiki chapter=950329 提取行 567）',
          '《增删卜易》「2、日辰能生克沖合」：「若在戌日占卦﹐謂之世爻臨日建當令得權」（同构移用于巳爻巳日，提取行 571）',
          '《增删卜易》合断段：「以上四處若得全來生合用神者﹐諸占全吉」（提取行 581，练气期缩二处）',
        ],
        next: 'ch4-s6-cp03a010',
      },
      {
        key: 'B',
        text: '卯木克巳火，月建克它——休囚。',
        verdict: 'wrong',
        basis: '木生火，不是克（灶膛添柴——幕三刚烤过的错）。且今日辛巳，用神与日辰同字，临日建——两处皆扶，何来休囚。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「木生火﹐火生土」（提取行 819）',
        ],
        next: 'ch4-s6-cp03b010',
      },
      {
        key: 'C',
        text: '一生一克，两两相持——看旺衰。',
        verdict: 'suboptimal',
        basis: '『相持』须真有一克——此局月生日临，两票全是扶，没有克票。口诀背下了，数票数错：合断第一步永远是把每一票的手势先认对，再数多少。',
        sourceRef: [
          '《增删卜易》合断段：「若有兩處克兩處生者﹐須看旺衰」——相持有其明文前提（两两相对），不可虚设（提取行 581）',
        ],
        next: 'ch4-s6-cp03c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-012 → 掌握' },
      suboptimal: { plot: '{{senior}}令玩家把两票的手势逐票重认（卯对巳＝生、巳对巳＝临），重数后过', mastery: 'KP-LY-012 标记待复习' },
    },
    onWrong: '{{senior}}以灶膛添柴复示木生火，再指日辰同字——玩家重答后过。KP-LY-012 标记待复习。不锁主线。',
  },
  // ── CP-03 选 A（optimal）──
  'ch4-s6-cp03a010': {
    type: 'narration',
    text: '「旺」字落下，{{ta}}看了你两息。',
    next: 'ch4-s6-cp03a020',
  },
  'ch4-s6-cp03a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '月建的手势，日辰的名目，合断的账——三样功夫，一口气用在一张真卦上。今日之课，你出师了——出的是今日这一课的师。',
    aside: '{{ta}}微微颔首，',
    next: 'ch4-s6-500',
  },
  // ── CP-03 选 B（wrong）──
  'ch4-s6-cp03b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '又烧回去了？添柴，火旺——木生火。还有今日的日子你忘了看：辛巳日，用神巳火，同字为临。重数。',
    aside: '{{ta}}朝灶膛抬下巴，',
    m1Note: 'KP-LY-012 标记待复习。',
    next: 'ch4-s6-500',
  },
  // ── CP-03 选 C（suboptimal）──
  'ch4-s6-cp03c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '相持要真有一克。卯对巳，什么手势？——生。巳日对巳爻呢？——临。两票全是扶，你把哪一票数成克了？口诀不救数错的票——先认手势，再数票。重来。',
    aside: '{{ta}}把两根手指并到你眼前，',
    m1Note: 'KP-LY-012 标记待复习。',
    next: 'ch4-s6-500',
  },

  // ── 6.5 临（CP-03 三线汇合）──
  'ch4-s6-500': {
    type: 'narration',
    text: '断完的卦摊在灯下：用神父母巳火，月生，日临——旺。',
    next: 'ch4-s6-dr2',
  },
  // CP-03 判罢，「旺」字对全体分支一律成立（三线殊途同归，见 6.5 开篇叙述）——此刻补上
  // wangshuai，仅用神一爻（pos 1）挂此字段；FULL cumulative board，其余五爻同 dr1。
  'ch4-s6-dr2': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 7, 8, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '巳', wuxing: '火', liuqin: '父母', wangshuai: '旺' },
        { pos: 2, branch: '卯', wuxing: '木', liuqin: '官鬼' },
        { pos: 3, branch: '丑', wuxing: '土', liuqin: '兄弟' },
        { pos: 4, branch: '丑', wuxing: '土', liuqin: '兄弟' },
        { pos: 5, branch: '亥', wuxing: '水', liuqin: '妻财' },
        { pos: 6, branch: '酉', wuxing: '金', liuqin: '子孙' },
      ],
      marks: { world: 2, response: 5 },
    },
    next: 'ch4-s6-510',
  },
  'ch4-s6-510': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '听卦说话。我只转述——',
    next: 'ch4-s6-520',
  },
  'ch4-s6-520': {
    type: 'narration',
    text: '{{ta}}的声音沉下来，像每一次读卦那样。',
    next: 'ch4-s6-530',
  },
  'ch4-s6-530': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '用神旺，其事未了。这页纸不是弃物——纸是死的，可它背后那桩事，正活着。今日之内，它的分量最重：藏它的手，惦记它的心思，都还在令上。',
    next: 'ch4-s6-540',
  },
  'ch4-s6-540': {
    type: 'dialogue', speaker: '{{player}}',
    text: '还没完……他还会来。',
    next: 'ch4-s6-550',
  },
  'ch4-s6-550': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦名替你说了。地泽临。临者，至也。',
    aside: '{{ta}}的指尖落在卦名上，一字一顿，',
    next: 'ch4-s6-560',
  },
  'ch4-s6-560': {
    type: 'narration',
    text: '灯焰静静烧着。你想起昨夜{{ta}}在明蓍堂门口说的那句话——',
    next: 'ch4-s6-570',
  },
  'ch4-s6-570': {
    type: 'dialogue', speaker: '{{player}}',
    text: '『等他自己走到卦里来。』',
    next: 'ch4-s6-580',
  },
  'ch4-s6-580': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。卦应了这句话。他会来——来取，或者来看。那扇窗，如今是他的必经之路。',
    aside: '{{ta}}把卦纸折起，与那页薄纸并排放好，',
    m1Note: '读卦边界自查：断语两句全部由已教结构拼出（用神旺＝其事未了／临＝至——卦名字义为地支常识同级的字面训释，她口头点意象不立断法）；不指名、不指日、不指身份——「他会来」的「他」承 ch3「应作他人」正典指代，无新指认。「临者至也」为通行字义，非六爻断法，不入 KP。',
    next: 'ch4-s6-drclear',
  },
  // 案卦离案（两样物证收进匣子落锁）——清盘，mirrors ch3-s6-drclear。
  'ch4-s6-drclear': {
    type: 'dressingUpdate',
    board: null,
    next: 'ch4-s6-fb',
  },

  // ── 幕六末称谓分支（favorBranch · threshold 25 · § 0 第 3 条）——按 save.favor 静默路由 ──
  // 锚点之前全章沈疏桐台词一律中性称谓（无 {{junior}}/直呼名）；pass/fail 两分支才现称谓分野。
  // 两分支好感 +1 等值，合流入幕七。
  'ch4-s6-fb': {
    type: 'favorBranch', threshold: 25,
    pass: 'ch4-s6-pass010',
    fail: 'ch4-s6-fail010',
  },
  // ── 好感 ≥ 25（pass）：ch3-pass 线是延续，容错补档线读来是「第一次」，两头兼容 ──
  'ch4-s6-pass010': {
    type: 'narration',
    text: '{{ta}}把两样东西收进匣子，落锁。然后{{ta}}抬起头，隔着一盏灯看你——',
    next: 'ch4-s6-pass020',
  },
  'ch4-s6-pass020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。',
    next: 'ch4-s6-pass030',
  },
  'ch4-s6-pass030': {
    type: 'narration',
    text: '{{ta}}叫你的名字。灯焰在{{ta}}眼里烧成很小的一点，亮得很稳。',
    next: 'ch4-s6-pass040',
  },
  'ch4-s6-pass040': {
    type: 'narration',
    text: '名字从{{ta}}口中落下来，像一枚落进静水的石子——不重，可水纹一圈圈漾开，漾得很远。',
    next: 'ch4-s6-pass050',
  },
  'ch4-s6-pass050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日起，你我轮值——看住那扇窗。他来取，我们人赃并获；他来看——我们看他。',
    next: 'ch4-s6-pass060',
  },
  'ch4-s6-pass060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……好。',
    next: 'ch4-s6-pass070',
  },
  'ch4-s6-pass070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不问为什么带上你？',
    next: 'ch4-s6-pass080',
  },
  'ch4-s6-pass080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '你说过了。是我们查。',
    aside: '你听见自己的声音很稳，',
    next: 'ch4-s6-pass090',
  },
  'ch4-s6-pass090': {
    type: 'narration',
    text: '{{ta}}看了你一息，唇角那点弧度浅得几乎不存在——可你看见了。',
    next: 'ch4-s6-pass100',
  },
  'ch4-s6-pass100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记性不错。',
    effects: { favor: 1 },
    m1Note: '章末事件「轮值之约」（好感 +1，自动触发）。档位演出注（§ 0 第 3 条）：「{{player}}」——ch3-pass 线读来是延续（她已这么叫），容错补档线（章内累积过 25）读来即「第一次」——中性独白（石子落水）两头兼容，不指涉次数；「是我们查」回收 ch3 幕七 pass 版正典句。两分支好感 +1 等值——档位本身已是奖惩。',
    next: 'ch4-s7-header',
  },
  // ── 好感 ＜ 25（fail，容错线，本章未跨档）：称谓照旧，留复读动机 ──
  'ch4-s6-fail010': {
    type: 'narration',
    text: '{{ta}}把两样东西收进匣子，落锁。然后{{ta}}抬起头——',
    next: 'ch4-s6-fail020',
  },
  'ch4-s6-fail020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{junior}}。',
    next: 'ch4-s6-fail030',
  },
  'ch4-s6-fail030': {
    type: 'narration',
    text: '还是这两个字。可今夜这两个字，比平日多压了一点分量。',
    next: 'ch4-s6-fail040',
  },
  'ch4-s6-fail040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日起，你我轮值——看住那扇窗。他来取，人赃并获；他来看，我们看他。',
    next: 'ch4-s6-fail050',
  },
  'ch4-s6-fail050': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……我也算一个？',
    next: 'ch4-s6-fail060',
  },
  'ch4-s6-fail060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你装的卦，你断的旺衰。案走到这一步，有你的一份功夫。守窗的活计，自然也有你的一份。——把待复习的几处磨掉，往后能给你的活，不止守窗。',
    aside: '{{ta}}把匣子往案角一推，',
    effects: { favor: 1 },
    m1Note: '章末事件「轮值之约」（好感 +1，自动触发）。档位演出注（§ 0 第 3 条）：仍称「{{junior}}」+「磨掉待复习」呼应 ch3 fail 版「毛糙」线，留复读动机；「不止守窗」留待复读。两分支好感 +1 等值——档位本身已是奖惩。',
    next: 'ch4-s7-header',
  },

  // ═══════════════ 第七幕 · 旺者作数 ═══════════════
  'ch4-s7-header': {
    type: 'sceneHeader', scene: 7, title: '旺者作数',
    time: '夜', ambience: '明蓍堂门口，廊下。',
    m1Note: '本幕功能：章末收束；秤的意象合拢；第五章预告；结算。',
    next: 'ch4-s7-010',
  },
  'ch4-s7-010': {
    type: 'narration',
    text: '{{ta}}送你到廊下。夜风里有春天松动泥土的气味。',
    next: 'ch4-s7-020',
  },
  'ch4-s7-020': {
    type: 'narration',
    text: '你忽然回想这一天：晨起时它还只是一句「睡醒了再说」；此刻你怀里揣着一列偏半分的点、一张写着「临」字的卦，和一杆看不见的秤。',
    next: 'ch4-s7-030',
  },
  'ch4-s7-030': {
    type: 'narration',
    text: '一天。四种手势，两个令官，三句口诀。你的卦纸上，从此又多了一层字。',
    next: 'ch4-s7-040',
  },
  'ch4-s7-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日教你的东西，说破了就一句话——万物有时令。',
    next: 'ch4-s7-050',
  },
  'ch4-s7-050': {
    type: 'narration',
    text: '{{ta}}望着廊外的夜。',
    next: 'ch4-s7-060',
  },
  'ch4-s7-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '爻有旺衰，话有旺衰。今日旺的，未必明日旺；此刻衰的，未必一直衰。所以查案的人不能懒——每一句证词、每一样物证，都得问一遍：你是几月的？你还当不当令？',
    aside: '{{ta}}顿了顿，',
    next: 'ch4-s7-070',
  },
  'ch4-s7-070': {
    type: 'dialogue', speaker: '{{player}}',
    text: '那句话我记下了——旺者的话，作数。',
    next: 'ch4-s7-080',
  },
  'ch4-s7-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记下还不够。还要记它的反面：作数的话，也有失令的一天。今日你断它旺，明日月建一换，秤就得重称。卦不是一锤子的买卖——是活的。',
    aside: '{{ta}}转过身，夜色里{{ta}}的目光很亮，',
    next: 'ch4-s7-090',
  },
  'ch4-s7-090': {
    type: 'narration',
    text: '这句话在夜风里站了一会儿。',
    next: 'ch4-s7-100',
  },
  'ch4-s7-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日巳时，你先值。晒架后头有个堆柴的棚，看得见窗，窗看不见你。带上你的卦纸——守窗的时辰长，正好温书。',
    aside: '{{ta}}说回正事，语气利落如常，',
    next: 'ch4-s7-110',
  },
  'ch4-s7-110': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}值什么时辰？',
    next: 'ch4-s7-120',
  },
  'ch4-s7-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '夜里。',
    next: 'ch4-s7-130',
  },
  'ch4-s7-130': {
    type: 'narration',
    text: '你想起白芷的话——夜里来的人，不点灯。你张了张口，想说夜里换我来——',
    next: 'ch4-s7-140',
  },
  'ch4-s7-140': {
    type: 'narration',
    text: '{{ta}}已经抬手把你后面的话按了回去。',
    next: 'ch4-s7-150',
  },
  'ch4-s7-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '他若真来，多半在夜里——所以夜里归我。放心。我比他熟这座山。',
    aside: '{{ta}}说得不容商量，随即语气又松了半分，',
    next: 'ch4-s7-160',
  },

  // ── 章末结算 ──
  'ch4-s7-160': {
    type: 'narration',
    text: '回房的路上，你把今日的账在心里又盘了一遍：一枚偏半分的点，原来是记号；一句「一点不错」，原来没说错——只是失了令；一页藏进窗缝的纸，原来还活着。',
    next: 'ch4-s7-170',
  },
  'ch4-s7-170': {
    type: 'narration',
    text: '人人都说卦难学。可你今日觉得，最难的不是卦——是人心里那杆秤：几时的话，称几时的分量。',
    next: 'ch4-s7-180',
  },
  'ch4-s7-180': {
    type: 'narration',
    text: '卦，不过是把这杆秤，明明白白画在纸上。',
    next: 'ch4-end',
  },

  // ═══════════════ 第四章 · 终 ═══════════════
  'ch4-end': {
    type: 'chapterEnd',
    title: '【第四章 · 终】',
    rewards: { lingli: 10 },
    hooks: [
      '窗台样张——偏半分＝记号实锤（有底样），编码何意／谁放／给谁看全悬（第五章）',
      '「临」卦——用神旺、其事未了、「他会来」——守窗轮值开启（第五章开局的行动位）',
      '巳三重不闭合——巳时后院＝宋的地界（地利）／属蛇者不在名册（指向圈外）／卦上巳火两见（观五爻·剥应爻）——分叉悬置',
      '「我认得这个起笔」——她收着没说的一层（师承线，双层读法）',
      '白芷所惧——「窗没坏，她怕的不是坏窗」（远景回响已给，实底留后章）',
    ],
    nextChapterTeaser: '断一爻的旺衰，看的还只是它自己——可爻和人一样，有帮它的，有伤它的；帮你的人自己站不站得住？第五课：元神忌神。',
  },
  },
};

export default CHAPTER_4;
