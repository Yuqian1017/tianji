// Chapter 3 《六亲》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_3_SCRIPT_v1.md (owner-gate passed 2026-07-14,
// 3-round review converged incl. canon reconciliation with ch2).
// This file is a FAITHFUL transcription of the approved script into node flow.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1.js/chapter2.js headers. New in ch3:
// favorBranch { type, threshold, pass, fail, next? } — silent route by save.favor
//   (章末称谓分支: >=25 pass chain, else fail chain; both converge to ch3-end).
// dressingUpdate boards may carry liuqin per revealed entry ({pos,branch,wuxing,liuqin})
//   — displayed as 「丑土·官鬼」 by DressingBoard; boards remain FULL cumulative state.
// Act-5 note: pre-market ids step by 5 (ch3-s5-010..235) to fit below the STABLE
//   market anchor ch3-s5-300 (presentation keys on it); elsewhere step-10.

export const CHAPTER_3 = {
  id: 'ch3',
  title: '六亲',
  scriptVersion: 'v1.2-owner-approved-2026-07-14',
  entryNode: 'ch3-s1-header',

  // 剧情固定卦象：山地剥 · 六爻安静（乾宫五世，世五应二；引擎实测 2026-07-13）
  fixedCase: {
    throws: [8, 8, 8, 8, 8, 7], // 初爻→上爻
    benGua: '山地剥',
    bianGua: null,              // 六爻安静
    movingLineIndex: null,
  },

  knowledgePoints: ['KP-LY-007', 'KP-LY-008', 'KP-LY-009'],

  nodes: {
  // ═══════════════ 第一幕 · 旧卦重问 ═══════════════
  'ch3-s1-header': {
    type: 'sceneHeader', scene: 1, title: '旧卦重问',
    time: '掌灯', ambience: '明蓍堂。第二章夜摇案卦的次日。',
    m1Note: '本幕功能：承接修书房名单；明夷卦纸重摊——「一张卦你只读了一半」点火本章；主题词「亲」入场。',
    next: 'ch3-s1-010',
  },
  'ch3-s1-010': {
    type: 'narration',
    text: '名单在案上摊了一天，只有三个名字。',
    next: 'ch3-s1-020',
  },
  'ch3-s1-020': {
    type: 'narration',
    text: '它是郑司书的出纳册里抄出来的：去岁腊月，藏经阁把《遗卦残谱》发往修书房重装书脊；正月里还回，验讫归格。批条印信齐全，发书、收书，册上都有日子，有画押。',
    next: 'ch3-s1-030',
  },
  'ch3-s1-030': {
    type: 'narration',
    text: '经手的，拢共三人：裱匠宋补之，誊录崔小砚，洒扫白芷——就是那句「两位修书房的师兄，带一个打下手的杂役」。其中白芷，今年开春辞工下山了。',
    next: 'ch3-s1-040',
  },
  'ch3-s1-040': {
    type: 'narration',
    text: '一扇为期一个月的窗。一双能裁出那种切口的手，只需要其中一炷香的功夫。',
    next: 'ch3-s1-050',
  },
  'ch3-s1-050': {
    type: 'narration',
    text: '你和沈疏桐对着这三个名字坐了半晌。灯花爆了两回。',
    next: 'ch3-s1-060',
  },
  'ch3-s1-060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '就……三个人。挨个问过去，不就行了？',
    next: 'ch3-s1-070',
  },
  'ch3-s1-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问？',
    next: 'ch3-s1-080',
  },
  'ch3-s1-080': {
    type: 'narration',
    text: '{{ta}}抬起眼皮。',
    next: 'ch3-s1-090',
  },
  'ch3-s1-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问什么？『裁谱的是不是你』？——裁页的人等这一问，等了不止一季。你一开口，他就知道切口被人看见了。',
    next: 'ch3-s1-100',
  },
  'ch3-s1-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '暗账最怕的不是查，是打草。',
    next: 'ch3-s1-110',
  },
  'ch3-s1-110': {
    type: 'narration',
    text: '{{ta}}把名单往旁边一推，从匣子里取出另一张纸，在灯下慢慢展开。',
    next: 'ch3-s1-120',
  },
  'ch3-s1-120': {
    type: 'narration',
    text: '你认得它。昨夜你亲手摇的——地火明夷。六道爻，每一爻旁边都装好了地支：卯、丑、亥、丑、亥、酉。世在四爻，应在初爻。',
    next: 'ch3-s1-130',
  },
  'ch3-s1-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '先不问人。先把昨夜这张卦，问完。',
    next: 'ch3-s1-140',
  },
  'ch3-s1-140': {
    type: 'dialogue', speaker: '{{player}}',
    text: '问完？它不是……说完了吗？坎宫游魂，明入地中，藏起来了——',
    next: 'ch3-s1-150',
  },
  'ch3-s1-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '那是它说的第一句。',
    next: 'ch3-s1-160',
  },
  'ch3-s1-160': {
    type: 'narration',
    text: '{{ta}}的指尖从初爻卯木，一路点到上爻酉金。',
    next: 'ch3-s1-170',
  },
  'ch3-s1-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你给它装了名字，它报了籍贯——可这六个爻，到现在还只是六个名字。名字跟名字之间是什么关系，谁生谁，谁克谁，谁是一家人——你还没问。',
    next: 'ch3-s1-180',
  },
  'ch3-s1-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦跟人一样，{{junior}}。光知道名字，是路人；认清了亲疏，才是自家人。',
    next: 'ch3-s1-190',
  },
  'ch3-s1-190': {
    type: 'dialogue', speaker: '{{player}}',
    text: '爻……还有亲疏？',
    next: 'ch3-s1-200',
  },
  'ch3-s1-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '有。而且规矩得很——比人的亲疏规矩多了。',
    next: 'ch3-s1-210',
  },
  'ch3-s1-210': {
    type: 'narration',
    text: '{{ta}}把明夷卦纸抚平，像昨夜在藏经阁抚平残谱那样轻。你注意到{{ta}}是从一只旧木匣里取出这张卦纸的——匣子里还躺着几张更旧的、边角磨圆了的卦纸，不知是谁的、哪一年的。{{ta}}取纸的时候手很稳，合上匣盖的时候，轻得没有声音。',
    next: 'ch3-s1-220',
  },
  'ch3-s1-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '学会了这一课，这张卦会把第二句话说给你听。第二句说完——',
    next: 'ch3-s1-230',
  },
  'ch3-s1-230': {
    type: 'narration',
    text: '{{ta}}朝那张三个名字的名单抬了抬下巴。',
    next: 'ch3-s1-240',
  },
  'ch3-s1-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——我们再去见这三位。带着卦见人，跟空着手见人，是两回事。',
    next: 'ch3-s1-250',
  },
  'ch3-s1-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今夜的课，叫六亲。',
    next: 'ch3-s2-header',
  },

  // ═══════════════ 第二幕 · 一圈生，一圈克 ═══════════════
  'ch3-s2-header': {
    type: 'sceneHeader', scene: 2, title: '一圈生，一圈克',
    time: '同夜', ambience: '明蓍堂。',
    m1Note: '本幕功能：KP-LY-007 示范 → 引导。五行两循环用案头实物摆出来——不背表，先看「一圈」。',
    next: 'ch3-s2-010',
  },
  'ch3-s2-010': {
    type: 'narration',
    text: '{{ta}}起身，从案头、香炉、笔架上拢来五样东西，在桌面上摆开：',
    next: 'ch3-s2-020',
  },
  'ch3-s2-020': {
    type: 'narration',
    text: '一枚铜钱。一支木签。一盂清水。一盏灯焰。最后，{{ta}}用指尖从香炉里捻出一撮香灰。',
    next: 'ch3-s2-030',
  },
  'ch3-s2-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '金。木。水。火。土。',
    next: 'ch3-s2-040',
  },
  'ch3-s2-040': {
    type: 'narration',
    text: '{{ta}}逐样点过去。',
    next: 'ch3-s2-050',
  },
  'ch3-s2-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '装卦那课你已经见过它们——每个地支肚子里都揣着一个。卯是木，丑是土，亥是水，酉是金。那时我说：支里带着五行，先记着，回头用。',
    next: 'ch3-s2-060',
  },
  'ch3-s2-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '回头，就是今夜。',
    next: 'ch3-s2-070',
  },
  'ch3-s2-070': {
    type: 'narration',
    text: '{{ta}}把五样东西摆成一个圈：铜钱、水盂、木签、灯焰、香灰，首尾相衔。',
    next: 'ch3-s2-080',
  },
  'ch3-s2-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '先看生。',
    next: 'ch3-s2-090',
  },
  'ch3-s2-090': {
    type: 'narration',
    text: '{{ta}}的指尖沿着圈，一站一站地走：',
    next: 'ch3-s2-100',
  },
  'ch3-s2-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '金生水——金石之侧凝露水。水生木——浇水，树活。木生火——添柴，火旺。火生土——烧尽了，是灰。土生金——矿从土里来。',
    next: 'ch3-s2-110',
  },
  'ch3-s2-110': {
    type: 'narration',
    text: '指尖回到铜钱。一圈，走完了。',
    next: 'ch3-s2-120',
  },
  'ch3-s2-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '生是滋养，是母生子。转一圈，谁都有生它的，谁都有它生的——没有孤爻。',
    next: 'ch3-s2-tm1',
  },
  'ch3-s2-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-007', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '五行相生循环（金水木火土首尾相衔）。依据《增删卜易·五行相生章第十一》「金生水﹐水生木﹐木生火﹐火生土﹐土生金」原文照录（附录 KP-LY-007 卡）。',
    next: 'ch3-s2-130',
  },
  'ch3-s2-130': {
    type: 'narration',
    text: '{{ta}}忽然把五样东西重新摆过——还是一个圈，次序却变了：铜钱、木签、香灰、水盂、灯焰。',
    next: 'ch3-s2-140',
  },
  'ch3-s2-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '再看克。',
    next: 'ch3-s2-150',
  },
  'ch3-s2-150': {
    type: 'narration',
    text: '这一回，指尖走得重：',
    next: 'ch3-s2-160',
  },
  'ch3-s2-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '金克木——斧斫柴断。木克土——根须破土。土克水——堤坝拦水。水克火——一瓢浇灭。火克金——炉里熔金。',
    next: 'ch3-s2-170',
  },
  'ch3-s2-170': {
    type: 'narration',
    text: '指尖停在铜钱和木签之间。',
    next: 'ch3-s2-180',
  },
  'ch3-s2-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '克是制约，是管束。也转一圈——没有谁不受管，也没有谁管不了别人。',
    next: 'ch3-s2-190',
  },
  'ch3-s2-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '两个圈都在，天下五行，任取两个：非生即克，非克即同类。没有第四种关系。',
    next: 'ch3-s2-200',
  },
  'ch3-s2-200': {
    type: 'dialogue', speaker: '{{player}}',
    text: '隔一个……就是克？',
    next: 'ch3-s2-210',
  },
  'ch3-s2-210': {
    type: 'narration',
    text: '{{ta}}挑了下眉，难得没怼。',
    next: 'ch3-s2-220',
  },
  'ch3-s2-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '看出来了？生圈上隔一位，正是克——所以两圈其实是一张网。这个巧劲儿帮你记，不必背两遍。',
    next: 'ch3-s2-230',
  },
  'ch3-s2-230': {
    type: 'narration',
    text: '{{ta}}把五样东西拢在一处，随手抓乱，再摊开。',
    next: 'ch3-s2-240',
  },
  'ch3-s2-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '乱了。现在我问，你答——答错的，自己把圈摆回去。',
    next: 'ch3-s2-250',
  },
  'ch3-s2-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '土，与水。',
    next: 'ch3-s2-260',
  },
  'ch3-s2-260': {
    type: 'choice',
    prompt: null, // 引导应用 · KP-LY-007（土与水）；答错不惩罚，{{senior}}纠错即过，不计 wrong
    options: [
      {
        text: '土克水——堤坝拦水',
        response: {
          speaker: '沈疏桐',
          text: '对。土克水。记住这一对，今夜还会见到它。',
          aside: '{{ta}}指尖在香灰和水盂之间敲了一下。',
        },
        effects: { favor: 1 },
        next: 'ch3-s2-tm2',
      },
      {
        text: '水生土',
        response: {
          speaker: '沈疏桐',
          text: '水生的是木。浇水树活，浇水泥地你试试。——土与水，是克：堤坝拦水。',
        },
        next: 'ch3-s2-tm2',
      },
      {
        text: '土生水',
        response: {
          speaker: '沈疏桐',
          text: '土生的是金，矿从土里来。土对水没那份心思——它拦着水。土克水。',
        },
        next: 'ch3-s2-tm2',
      },
    ],
  },
  'ch3-s2-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-007', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家在两圈口诀提示下判断任意两行关系（土水对为主问——为幕三「丑土克亥水？不，本课只问关系不问吉凶」的世爻官鬼伏笔预热）。依据《增删卜易·五行相生章第十一》《五行相克章第十二》（附录 KP-LY-007 卡）。答错不惩罚，{{senior}}纠错即过。',
    next: 'ch3-s2-270',
  },
  'ch3-s2-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '圈就是这两个圈。往后你装出一张卦，六个爻的五行，跟一个『我』字一比——',
    next: 'ch3-s2-280',
  },
  'ch3-s2-280': {
    type: 'narration',
    text: '{{ta}}把明夷卦纸又拉回灯下。',
    next: 'ch3-s2-290',
  },
  'ch3-s2-290': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——亲疏，就出来了。',
    next: 'ch3-s3-header',
  },

  // ═══════════════ 第三幕 · 名分 ═══════════════
  'ch3-s3-header': {
    type: 'sceneHeader', scene: 3, title: '名分',
    time: '同夜，夜深', ambience: '明蓍堂。',
    m1Note: '本幕功能：KP-LY-008 示范 → 引导（明夷重读装六亲）；「世坐官鬼」高光；上爻父母（书）伏笔；装亲盘演出（DressingBoard 六亲扩展）。',
    next: 'ch3-s3-010',
  },
  'ch3-s3-010': {
    type: 'narration',
    text: '明夷的卦纸躺在灯下。六个装好地支的爻，安安静静，等着领名分。',
    next: 'ch3-s3-dr0',
  },
  // 装亲盘状态事件（dressingUpdate · ch3 扩展）：board 为累积全量状态；revealed[].liuqin
  // 为可选六亲字段（§ 0 第 2 条，向后兼容 ch2）；board:null 清盘。
  // dr0＝重摊第二章已装好的明夷盘面（支＋世应俱全，六亲未点亮）。
  'ch3-s3-dr0': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 8, 7, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '卯', wuxing: '木' },
        { pos: 2, branch: '丑', wuxing: '土' },
        { pos: 3, branch: '亥', wuxing: '水' },
        { pos: 4, branch: '丑', wuxing: '土' },
        { pos: 5, branch: '亥', wuxing: '水' },
        { pos: 6, branch: '酉', wuxing: '金' },
      ],
      marks: { world: 4, response: 1 },
    },
    next: 'ch3-s3-020',
  },
  'ch3-s3-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '定亲之前，先定『我』。',
    next: 'ch3-s3-030',
  },
  'ch3-s3-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '籍贯那课教过：同宫同姓。明夷是坎宫的卦，坎属水——所以这张卦里，水就是『我』。六个爻跟『我』比亲疏，比的就是跟水的生克。',
    next: 'ch3-s3-040',
  },
  'ch3-s3-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '规矩五句，一句一个名分——',
    next: 'ch3-s3-050',
  },
  'ch3-s3-050': {
    type: 'narration',
    text: '{{ta}}提笔，在卦纸空白处竖着写下五行小字，一边写一边念：',
    next: 'ch3-s3-060',
  },
  'ch3-s3-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '生我者为父母——生养我的，长辈。我生者为子孙——我生养的，晚辈。克我者为官鬼——管束我的。我克者为妻财——听我使唤的。比和者为兄弟——跟我同类的，平辈。',
    next: 'ch3-s3-070',
  },
  'ch3-s3-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '五句就是全部。剩下的，是把六个爻挨个比过去。看好，我装前三爻。',
    next: 'ch3-s3-080',
  },
  'ch3-s3-080': {
    type: 'narration',
    text: '{{ta}}的笔尖点在初爻。',
    next: 'ch3-s3-090',
  },
  'ch3-s3-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '初爻卯木。我是水——水生木，我生。我生者为——子孙。',
    next: 'ch3-s3-100',
  },
  'ch3-s3-100': {
    type: 'narration',
    text: '笔下两个小字：子孙。',
    next: 'ch3-s3-110',
  },
  'ch3-s3-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '二爻丑土。土与水——你方才自己答的。',
    next: 'ch3-s3-120',
  },
  'ch3-s3-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '土克水……克我。',
    next: 'ch3-s3-130',
  },
  'ch3-s3-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '克我者为官鬼。',
    next: 'ch3-s3-140',
  },
  'ch3-s3-140': {
    type: 'narration',
    text: '{{ta}}顿了半息，笔尖在「官鬼」两个字上悬了悬，没多说，落笔。',
    next: 'ch3-s3-150',
  },
  'ch3-s3-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三爻亥水。水见水，同类——比和者为兄弟。',
    next: 'ch3-s3-dr1',
  },
  // dr1＝{{ta}}装完前三爻：初子孙／二官鬼／三兄弟点亮。
  'ch3-s3-dr1': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 8, 7, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '卯', wuxing: '木', liuqin: '子孙' },
        { pos: 2, branch: '丑', wuxing: '土', liuqin: '官鬼' },
        { pos: 3, branch: '亥', wuxing: '水', liuqin: '兄弟' },
        { pos: 4, branch: '丑', wuxing: '土' },
        { pos: 5, branch: '亥', wuxing: '水' },
        { pos: 6, branch: '酉', wuxing: '金' },
      ],
      marks: { world: 4, response: 1 },
    },
    next: 'ch3-s3-tm1',
  },
  'ch3-s3-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-008', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '『我』＝卦宫五行；生克定亲五句；前三爻实装（子孙／官鬼／兄弟）。依据《卜筮正宗·六親相生相克》「生我者為父母，我生者為子孫，克我者為官鬼，我克者為妻財．比和者為兄弟」原文照录；《增删卜易·六親歌章第五》互证（附录 KP-LY-008 卡）。',
    next: 'ch3-s3-160',
  },
  'ch3-s3-160': {
    type: 'narration',
    text: '{{ta}}把笔递给你。',
    next: 'ch3-s3-170',
  },
  'ch3-s3-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '后三爻，你来。',
    next: 'ch3-s3-180',
  },
  'ch3-s3-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '四爻，丑土。——想想它在哪儿坐着，再答。',
    next: 'ch3-s3-190',
  },
  'ch3-s3-190': {
    type: 'choice',
    prompt: null, // 引导应用 · KP-LY-008（四爻）；答错不惩罚，{{senior}}纠正后继续，不计 wrong
    options: [
      {
        text: '土克水，克我——官鬼',
        response: {
          speaker: '沈疏桐',
          text: '官鬼。接着装。',
          aside: '{{ta}}接得很平，平得刻意。',
        },
        effects: { favor: 1 },
        next: 'ch3-s3-200',
      },
      {
        text: '跟二爻一样……兄弟？',
        response: {
          speaker: '沈疏桐',
          text: '二爻是丑土，不是亥水。同一个支，装出来永远是同一个亲——土克水，官鬼。别偷懒，一爻一比。',
        },
        next: 'ch3-s3-200',
      },
      {
        text: '土生金……父母？',
        response: {
          speaker: '沈疏桐',
          text: '你在替金认亲。『我』是水——土对水，是克。克我者，官鬼。',
        },
        next: 'ch3-s3-200',
      },
    ],
  },
  'ch3-s3-200': {
    type: 'narration',
    text: '你把「官鬼」两个字写在四爻旁边。写完才想起{{ta}}那句「想想它在哪儿坐着」——',
    next: 'ch3-s3-210',
  },
  'ch3-s3-210': {
    type: 'narration',
    text: '四爻旁边，还有一个字。',
    next: 'ch3-s3-220',
  },
  'ch3-s3-220': {
    type: 'narration',
    text: '世。',
    next: 'ch3-s3-230',
  },
  'ch3-s3-230': {
    type: 'narration',
    text: '昨夜装的。世为自己——你们两个人，此刻就坐在这一爻上。而它的名分，是官鬼：管束、拘系、压在头上的东西。',
    next: 'ch3-s3-240',
  },
  'ch3-s3-240': {
    type: 'narration',
    text: '你的笔尖停住了。',
    next: 'ch3-s3-250',
  },
  'ch3-s3-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '装完。剩两爻。',
    aside: '没看你，声音很平',
    next: 'ch3-s3-260',
  },
  'ch3-s3-260': {
    type: 'narration',
    text: '五爻亥水——兄弟。上爻酉金——金生水，生我，父母。你一笔一笔写完，最后一个名分落在最上头那道爻上。',
    next: 'ch3-s3-dr2',
  },
  // dr2＝后三爻装齐：六亲全部点亮（四官鬼[世]／五兄弟／上父母）。
  'ch3-s3-dr2': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 8, 7, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '卯', wuxing: '木', liuqin: '子孙' },
        { pos: 2, branch: '丑', wuxing: '土', liuqin: '官鬼' },
        { pos: 3, branch: '亥', wuxing: '水', liuqin: '兄弟' },
        { pos: 4, branch: '丑', wuxing: '土', liuqin: '官鬼' },
        { pos: 5, branch: '亥', wuxing: '水', liuqin: '兄弟' },
        { pos: 6, branch: '酉', wuxing: '金', liuqin: '父母' },
      ],
      marks: { world: 4, response: 1 },
    },
    next: 'ch3-s3-tm2',
  },
  'ch3-s3-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-008', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家亲手装后三爻（含世上官鬼与上爻父母）；同支同亲、一爻一比的操作纪律。依据《增删卜易·六親歌章第五》乾为天实装例同构（「照……裝之……餘卦仿此」）（附录 KP-LY-008 卡）。',
    next: 'ch3-s3-270',
  },
  'ch3-s3-270': {
    type: 'narration',
    text: '六个名分装齐了。沈疏桐把卦纸转了个方向，正对着你。',
    next: 'ch3-s3-280',
  },
  'ch3-s3-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '现在，听它说第二句话。',
    next: 'ch3-s3-290',
  },
  'ch3-s3-290': {
    type: 'narration',
    text: '{{ta}}的指尖落在四爻。',
    next: 'ch3-s3-300',
  },
  'ch3-s3-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '昨夜你问：裁走的那页在何处。卦答了『明入地中』——藏起来了。这是第一句。今夜它说：世坐官鬼。',
    next: 'ch3-s3-310',
  },
  'ch3-s3-310': {
    type: 'dialogue', speaker: '{{player}}',
    text: '世是……我们。',
    next: 'ch3-s3-320',
  },
  'ch3-s3-320': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问卦的人。宗门。你和我。',
    next: 'ch3-s3-330',
  },
  'ch3-s3-330': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '而官鬼，是拘束我们的东西——这桩案子里，它有名有姓：贼。',
    aside: '{{ta}}的指尖在丑土上按了按，',
    next: 'ch3-s3-340',
  },
  'ch3-s3-340': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '贼不在天边。它就坐在『我』的位子上——贴着我们坐。',
    next: 'ch3-s3-350',
  },
  'ch3-s3-350': {
    type: 'narration',
    text: '灯焰晃了一下。你想起藏经阁那道换了新条的木栅，想起伪页上那枚点错的世点——门里进得去的人，一直就在门里。',
    next: 'ch3-s3-360',
  },
  'ch3-s3-360': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有一句。',
    next: 'ch3-s3-370',
  },
  'ch3-s3-370': {
    type: 'narration',
    text: '指尖移到最上头。',
    next: 'ch3-s3-380',
  },
  'ch3-s3-380': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '上爻酉金，父母。',
    next: 'ch3-s3-390',
  },
  'ch3-s3-390': {
    type: 'dialogue', speaker: '{{player}}',
    text: '父母……长辈？残谱跟谁的长辈——',
    next: 'ch3-s3-400',
  },
  'ch3-s3-400': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日讲。今夜只记卦面：那页书的下落，卦用一个安安静静的父母爻，搁在最上头、离世最远的地方——',
    next: 'ch3-s3-410',
  },
  'ch3-s3-410': {
    type: 'narration',
    text: '{{ta}}收了笔，声音低下去半度。',
    next: 'ch3-s3-420',
  },
  'ch3-s3-420': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——收着，护着，没挪窝。它在等人去认。',
    next: 'ch3-s3-drclear',
  },
  // 幕三终：清盘（次日出明蓍堂，卦纸折好收进袖中——幕四开场即离案）。
  'ch3-s3-drclear': {
    type: 'dressingUpdate',
    board: null,
    next: 'ch3-s4-header',
  },

  // ═══════════════ 第四幕 · 问什么，看什么 ═══════════════
  'ch3-s4-header': {
    type: 'sceneHeader', scene: 4, title: '问什么，看什么',
    time: '次日辰时', ambience: '明蓍堂 → 修书房外的碑廊。',
    m1Note: '本幕功能：KP-LY-009 示范 → 引导（主事三锚）；CP-01（KP-LY-007 独立考较）；赴修书房。',
    next: 'ch3-s4-010',
  },
  'ch3-s4-010': {
    type: 'narration',
    text: '次日一早，{{ta}}把明夷卦纸折好收进袖中，带你出了明蓍堂。',
    next: 'ch3-s4-020',
  },
  'ch3-s4-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '昨夜你问了一句好问题：残谱跟谁的长辈。现在补上——六亲认的不是人，是事。',
    next: 'ch3-s4-030',
  },
  'ch3-s4-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '父母爻，不单是爹娘长辈。屋舍、舟车、衣服、文书书册——凡是庇护你的东西，卦里都管它叫父母。一册书护着满纸学问，不叫父母叫什么？',
    next: 'ch3-s4-040',
  },
  'ch3-s4-040': {
    type: 'dialogue', speaker: '{{player}}',
    text: '所以昨夜那个上爻……',
    next: 'ch3-s4-050',
  },
  'ch3-s4-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '书。问残谱，看父母爻——那一爻就是残谱在卦里的代表。行话叫用神：问什么事，先找这件事归哪一亲，那一爻替它答话。',
    next: 'ch3-s4-060',
  },
  'ch3-s4-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '官鬼也一样。不单是鬼神官府——贼盗、祸祟、忧疑，凡是拘着你的，都是官鬼。问贼，看官鬼。',
    next: 'ch3-s4-070',
  },
  'ch3-s4-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '再记一个：子孙。药饵、僧道、解忧避祸——凡是替你解开绳结的，是子孙。问解法，看子孙。',
    next: 'ch3-s4-080',
  },
  'ch3-s4-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '剩下两亲，半句带过：兄弟是同类，也是劫财的——抢你东西的，多半是自家人；妻财管钱物仆役。这两个，用到的时候再细讲。',
    next: 'ch3-s4-tm1',
  },
  'ch3-s4-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-009', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '六亲主事三锚——父母（庇护者：文书书册屋舍）／官鬼（拘束者：贼盗忧疑）／子孙（解忧者）；用神＝所问之事在卦中的代表。依据《增删卜易·用神章第八》「文書及書館文契也以父母爻為用神……一切庇護我身者是也」「占亂臣賊盜邪崇也以官鬼爻為用神……一切拘束我身者是也」；《卜筮正宗·用神分類定例第一》互证（附录 KP-LY-009 卡）。边界：兄弟（劫财）、妻财（财物妻仆）主事由{{senior}}上文已各半句带过，不教不考；旺衰吉凶不入本章。',
    next: 'ch3-s4-090',
  },
  'ch3-s4-090': {
    type: 'narration',
    text: '碑廊尽头就是修书房的院门。{{ta}}在最后一座碑前停下脚。',
    next: 'ch3-s4-100',
  },
  'ch3-s4-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '进门之前，再验一遍你昨夜学的。答利索了，才带你进去。',
    next: 'ch3-s4-110',
  },
  'ch3-s4-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '若我此刻单问残谱这册书的安危——明夷那张卦，你先看哪一爻？',
    next: 'ch3-s4-120',
  },
  'ch3-s4-120': {
    type: 'choice',
    prompt: null, // 引导应用 · KP-LY-009（问书看哪爻）；答错不惩罚，{{senior}}纠正即过，不计 wrong
    options: [
      {
        text: '上爻酉金父母——书是父母爻',
        response: {
          speaker: '沈疏桐',
          text: '对。问书看父母。找对爻，是问卦的一半。',
          aside: '{{ta}}指尖在袖口轻轻一叩。',
        },
        effects: { favor: 1 },
        next: 'ch3-s4-tm2',
      },
      {
        text: '四爻世——我们最要紧',
        response: {
          speaker: '沈疏桐',
          text: '世是你自己。你问的是书，不是你。——问书，看父母爻：上爻酉金。',
        },
        next: 'ch3-s4-tm2',
      },
      {
        text: '初爻应——书在别人手里',
        response: {
          speaker: '沈疏桐',
          text: '应是对家，可你问的不是『谁拿着』，是书本身。书归父母管——上爻酉金。问什么，找什么亲，别串。',
        },
        next: 'ch3-s4-tm2',
      },
    ],
  },
  'ch3-s4-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-009', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '择用神实操——问书看父母（明夷上爻）；「问什么找什么亲」的择爻纪律。依据《增删卜易·用神章第八》父母爻条（附录 KP-LY-009 卡）。',
    next: 'ch3-s4-130',
  },
  'ch3-s4-130': {
    type: 'narration',
    text: '{{ta}}正要抬脚，忽然又停住，回头看你——是那种「课没完」的眼神。',
    next: 'ch3-s4-140',
  },
  'ch3-s4-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有一验。进了修书房，我要跟郑司书和那三位周旋，顾不上你。你手里的卦，自己拿得住吗？',
    next: 'ch3-s4-150',
  },
  'ch3-s4-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坎宫的卦，水为我。卦里来一个金爻——它是我的什么？',
    aside: '{{ta}}屈指，在碑面上敲出三个字：',
    next: 'ch3-s4-cp01',
  },
  'ch3-s4-cp01': {
    type: 'scoredChoice', cpId: 'CH3-CP-01', testsKp: ['KP-LY-007'],
    prompt: '独立判断五行关系并落到亲属名分（进修书房前的考较）',
    options: [
      {
        key: 'A',
        text: '金生水，生我——父母。',
        verdict: 'optimal',
        basis: '相生循环『金生水』：金对水为生我，生我者为父母。生克方向与安亲五句的双重独立应用。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「金生水﹐水生木﹐木生火﹐火生土﹐土生金」（ctext wiki chapter=950329）',
          '《卜筮正宗·六親相生相克》：「生我者為父母」（ctext wiki chapter=889452）',
        ],
        next: 'ch3-s4-cp01a010',
      },
      {
        key: 'B',
        text: '水克金……我克——妻财。',
        verdict: 'wrong',
        basis: '相克循环记反：水克的是火（一瓢浇灭），克金的是火（炉里熔金）——水与金之间无克，只有金生水。',
        sourceRef: [
          '《增删卜易·五行相克章第十二》：「金克木﹐木克土﹐土克水﹐水克火﹐火克金」',
        ],
        next: 'ch3-s4-cp01b010',
      },
      {
        key: 'C',
        text: '金水相近，同气——兄弟。',
        verdict: 'suboptimal',
        basis: '『比和者为兄弟』只认同一行（水见水）；金与水是母子（金生水），不是同类。方向感对了一半（知道金水相近），名分认错。',
        sourceRef: [
          '《卜筮正宗·六親相生相克》：「比和者為兄弟」',
        ],
        next: 'ch3-s4-cp01c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 1, mastery: 'KP-LY-007 → 掌握' },
      suboptimal: { plot: '{{senior}}补讲『比和只认同行』后带入院', mastery: 'KP-LY-007 标记待复习' },
    },
    onWrong: '{{senior}}把两圈在碑面上重敲一遍（水克火、火克金各归各位），KP-LY-007 标记待复习。不锁主线，入院照常。',
  },

  // ── CP-01 选 A（optimal）──
  'ch3-s4-cp01a010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '父母。——嗯。',
    next: 'ch3-s4-cp01a020',
  },
  'ch3-s4-cp01a020': {
    type: 'narration',
    text: '第三声「嗯」的调子，你已经会听了。{{ta}}推开修书房的院门，把你让进去半步——让你走在{{ta}}身侧，不是身后。',
    next: 'ch3-s5-header',
  },

  // ── CP-01 选 B（wrong）──
  'ch3-s4-cp01b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '水克金？',
    next: 'ch3-s4-cp01b020',
  },
  'ch3-s4-cp01b020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '水克火，火克金。隔着一位呢。——金生水，生我者，父母。进门吧，进了门少开口。',
    aside: '{{ta}}在碑面上把克圈重敲了一遍，一字一顿，',
    m1Note: 'KP-LY-007 标记待复习。',
    next: 'ch3-s5-header',
  },

  // ── CP-01 选 C（suboptimal）──
  'ch3-s4-cp01c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '相近不等于同类。比和，是水见水——一模一样才算兄弟。金对水，是生：父母。',
    next: 'ch3-s4-cp01c020',
  },
  'ch3-s4-cp01c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不过你能看出金水亲近……方向没错，名分背熟。',
    aside: '{{ta}}顿了顿，语气松了半分，',
    m1Note: 'KP-LY-007 标记待复习。',
    next: 'ch3-s5-header',
  },

  // ═══════════════ 第五幕 · 三双手 ═══════════════
  'ch3-s5-header': {
    type: 'sceneHeader', scene: 5, title: '三双手',
    time: '辰时至晌午', ambience: '修书房（5.1/5.2/5.3）→ 山脚集市（5.3b，bg-jishi）。',
    m1Note: '本幕功能：三位新 NPC 立人（线索与反证并存，不定罪）；白芷已辞工下山（ch2 正典「一个开春下了山」）——修书房只见两人，第三人集市寻访；郑司书知情圈外的问话张力；走访风味选择（好感 +1）；收束到「问卦」。走访名义：郑司书引路，「点验后例行回访装帧」——裁页与伪页只字不提。',
    next: 'ch3-s5-010',
  },
  'ch3-s5-010': {
    type: 'narration',
    text: '修书房比你想的小：一进院子，三间平房，满院晒着浆糊味。郑司书领着你们进门，嗓门比在藏经阁大了一倍。',
    next: 'ch3-s5-015',
  },
  'ch3-s5-015': {
    type: 'dialogue', speaker: '郑司书',
    text: '都出来！明蓍堂的沈师父回访装帧——去年那册《遗卦残谱》，就是你们经的手！',
    next: 'ch3-s5-020',
  },
  'ch3-s5-020': {
    type: 'narration',
    text: '两个人从两个方向出来，一高一矮。',
    next: 'ch3-s5-025',
  },
  'ch3-s5-025': {
    type: 'narration',
    text: '你数了数，又看了看名单。三个名字，两个人。',
    next: 'ch3-s5-030',
  },
  'ch3-s5-030': {
    type: 'dialogue', speaker: '郑司书',
    text: '白芷开春就辞工了。回头说。',
    aside: '顺着你的目光，压低声音',
    next: 'ch3-s5-035',
  },

  // ── 5.1 宋补之 · 裱匠的手 ──
  'ch3-s5-035': {
    type: 'narration',
    text: '头一个迎上来的是个五十多岁的矮胖男人，围裙上全是浆糊印，手却干干净净——十根手指，指甲修得极短。',
    next: 'ch3-s5-040',
  },
  'ch3-s5-040': {
    type: 'dialogue', speaker: '宋补之',
    text: '沈师父！稀客稀客！那册残谱可是老朽经手三十年里头一件怪书——满页卦画一个字没有，可原裱是把好手，边角齐整，浆性也匀。裱的时候老朽还跟小崔说，这书怕不是给神仙看的……',
    next: 'ch3-s5-045',
  },
  'ch3-s5-045': {
    type: 'narration',
    text: '他一开口就收不住。{{senior}}只问了一句「书脊拆装可还顺手」，他答了一炷香：从纸性讲到浆性，从下刀讲到揭裱——',
    next: 'ch3-s5-050',
  },
  'ch3-s5-050': {
    type: 'dialogue', speaker: '宋补之',
    text: '……揭裱这活儿，讲究一个『稳』字。刀贴着书脊走，深一分伤字，浅一分揭不开——喏，就这么着——',
    next: 'ch3-s5-055',
  },
  'ch3-s5-055': {
    type: 'narration',
    text: '他随手抄起案上一册废书，一柄薄刀在指间转了个花，贴脊一划。',
    next: 'ch3-s5-060',
  },
  'ch3-s5-060': {
    type: 'narration',
    text: '纸响极轻。一页下来，切口平直，边缘不起一丝毛。',
    next: 'ch3-s5-065',
  },
  'ch3-s5-065': {
    type: 'narration',
    text: '你看着那道切口，后颈有点发凉——藏经阁那道细得几乎看不见的口子，你见过。这双手，裁得出来。',
    next: 'ch3-s5-070',
  },
  'ch3-s5-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '好手艺。这样的活，修书房只有宋师傅做得？',
    aside: '接过那页废纸，对着光看了看，语气随意',
    next: 'ch3-s5-075',
  },
  'ch3-s5-075': {
    type: 'dialogue', speaker: '宋补之',
    text: '哪能！小崔跟老朽学过两年，手也稳当。就是白丫头不成——她那双手是拿扫帚的，碰纸就皱。',
    aside: '摆手，笑得爽朗',
    next: 'ch3-s5-080',
  },
  'ch3-s5-080': {
    type: 'narration',
    text: '他说着把那柄薄刀往围裙上一插，忽然又想起什么，凑近半步压低嗓门——压了跟没压一样：',
    next: 'ch3-s5-085',
  },
  'ch3-s5-085': {
    type: 'dialogue', speaker: '宋补之',
    text: '说起那册谱，还有桩趣事。重装那阵，书摊在老朽案上晾浆，小崔隔三差五就来看——不动手，就站着看，一看半晌。老朽打趣他：没字的书有什么好看？他说——',
    next: 'ch3-s5-090',
  },
  'ch3-s5-090': {
    type: 'narration',
    text: '宋补之学着年轻人抬下巴的样子：',
    next: 'ch3-s5-095',
  },
  'ch3-s5-095': {
    type: 'dialogue', speaker: '宋补之',
    text: '『看画。』嘿，看画！老朽裱了三十年，头回听说卦画能看出滋味来。',
    next: 'ch3-s5-100',
  },
  'ch3-s5-100': {
    type: 'narration',
    text: '他自己先笑了。你没笑。沈疏桐也没笑，只是顺口接了一句：',
    next: 'ch3-s5-105',
  },
  'ch3-s5-105': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '晾浆的书，夜里也摊在案上？',
    next: 'ch3-s5-110',
  },
  'ch3-s5-110': {
    type: 'dialogue', speaker: '宋补之',
    text: '摊着啊，浆没干不能合书。不过沈师父放心——那阵子修书房夜里落锁，都是白丫头锁的，一天没落下过。',
    next: 'ch3-s5-115',
  },
  'ch3-s5-115': {
    type: 'narration',
    text: '他说到这儿，难得地停了半息，咂了咂嘴：',
    next: 'ch3-s5-120',
  },
  'ch3-s5-120': {
    type: 'dialogue', speaker: '宋补之',
    text: '……可惜喽。手脚那么稳当的一个人，说走就走。',
    next: 'ch3-s5-125',
  },
  'ch3-s5-125': {
    type: 'narration',
    text: '他答得毫无防备，答完又滔滔讲起浆糊的火候去了。',
    next: 'ch3-s5-130',
  },

  // ── 5.2 崔小砚 · 誊录的眼 ──
  'ch3-s5-130': {
    type: 'narration',
    text: '西屋是誊录的案。年轻人站在案后，二十出头，下巴抬得比问话的人高半寸。案上摊着他誊到一半的书——你瞥了一眼，是本卦书，页边誊着一行行卦画，卦画旁边还有小字：乾一兑二，宫名、次序，抄得密密麻麻。',
    next: 'ch3-s5-135',
  },
  'ch3-s5-135': {
    type: 'narration',
    text: '《卦名次序抄》。这不是誊录的活——这是他自己在学。',
    next: 'ch3-s5-140',
  },
  'ch3-s5-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '小崔师傅在预备内门的考课？',
    aside: '目光在那页小字上扫过，不动声色',
    next: 'ch3-s5-145',
  },
  'ch3-s5-145': {
    type: 'dialogue', speaker: '崔小砚',
    text: '誊录也是十年寒窗。宗门取内门弟子，不问出身，只问功课——我自己抄的书，犯哪条规矩了？',
    aside: '把书往回拢了半寸，下巴却抬得更高',
    next: 'ch3-s5-150',
  },
  'ch3-s5-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不犯。上进是好事。',
    next: 'ch3-s5-155',
  },
  'ch3-s5-155': {
    type: 'dialogue', speaker: '崔小砚',
    text: '回访？装帧是宋师傅的事。我只誊内页残字——那册谱没字可誊，我统共只翻过三遍。',
    next: 'ch3-s5-160',
  },
  'ch3-s5-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三遍，记得倒清楚。',
    next: 'ch3-s5-165',
  },
  'ch3-s5-165': {
    type: 'dialogue', speaker: '崔小砚',
    text: '过目的东西我都清楚。半册三十二卦，一页一卦，画得极规整。誊录这行，看的就是规整不规整。',
    aside: '他顿了顿，像是觉得这话不够，又补上一句，',
    next: 'ch3-s5-170',
  },
  'ch3-s5-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '哦——那你说，它画得规整在哪儿？',
    aside: '很轻地',
    next: 'ch3-s5-175',
  },
  'ch3-s5-175': {
    type: 'dialogue', speaker: '崔小砚',
    text: '爻是爻，点是点。旁的抄本，世应的点位十册里错三册；那册谱，一点不错。',
    aside: '下巴又抬高半寸',
    next: 'ch3-s5-180',
  },
  'ch3-s5-180': {
    type: 'narration',
    text: '他说完就闭了嘴，仿佛多说一个字都掉价。可临了，在你们转身要走的时候，他忽然又补了一句——声音低了一半，倨傲里头一回掺了点别的东西：',
    next: 'ch3-s5-185',
  },
  'ch3-s5-185': {
    type: 'dialogue', speaker: '崔小砚',
    text: '……那册谱要是丢了，可惜。那手卦画，宗门里没第二份。',
    next: 'ch3-s5-190',
  },
  'ch3-s5-190': {
    type: 'narration',
    text: '说完他就低头誊书去了，仿佛刚才开口的是别人。',
    next: 'ch3-s5-195',
  },
  'ch3-s5-195': {
    type: 'narration',
    text: '你心里轻轻「咯噔」一声：他看得懂世应的点位，看得出卦画的好坏。修书房里，有人懂装卦——哪怕只是皮毛。而且那个人，惦记着那册谱。',
    next: 'ch3-s5-200',
  },
  'ch3-s5-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '小崔师傅好眼力。誊你的书吧。',
    aside: '笑了笑，把话头岔开',
    next: 'ch3-s5-205',
  },

  // ── 5.3 白芷 · 扫帚与眼睛 ──
  'ch3-s5-205': {
    type: 'narration',
    text: '偏屋是堆料的，如今空着半间——原先住人的那半间，铺盖卷走了，只剩一把立在墙角的旧扫帚。',
    next: 'ch3-s5-210',
  },
  'ch3-s5-210': {
    type: 'dialogue', speaker: '郑司书',
    text: '白芷。在这儿干了十年，开春说走就走——工钱结到当月，铺盖一卷，人就下山了。老朽问她去处，她就一句：『山下。』',
    aside: '叹气',
    next: 'ch3-s5-215',
  },
  'ch3-s5-215': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '十年的老人，说走就走。走之前，可有什么异样？',
    next: 'ch3-s5-220',
  },
  'ch3-s5-220': {
    type: 'dialogue', speaker: '郑司书',
    text: '她那个人，十年也没让人看出过什么『样』来。……哦，就一件：走前那几日，她把院里能修的都修了一遍——门轴、窗销、晒架。像是……交代后事似的。',
    aside: '想了想，摇头',
    next: 'ch3-s5-225',
  },
  'ch3-s5-225': {
    type: 'narration',
    text: '沈疏桐与你交换了一个眼色。',
    next: 'ch3-s5-230',
  },
  'ch3-s5-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '她如今在山下何处？',
    next: 'ch3-s5-235',
  },
  'ch3-s5-235': {
    type: 'dialogue', speaker: '郑司书',
    text: '听浆洗坊的人说，在山脚集上摆了个浆洗摊。手脚干净，生意倒好。',
    next: 'ch3-s5-300',
  },

  // ── 5.3b 山脚集市 · 浆洗摊 ──
  // STABLE id：演出层在 ch3-s5-300 上切背景 bg-jishi（山门集市，《钱囊》幕二同景复用）。
  'ch3-s5-300': {
    type: 'narration',
    text: '下山的石阶尽头，集市正当晌午。你们在最西头找到那个浆洗摊：一根竹竿晾着浆好的布，一盆清水，一个瘦高的女人坐在矮凳上拧衣裳——手上动作又快又稳。',
    next: 'ch3-s5-310',
  },
  'ch3-s5-310': {
    type: 'narration',
    text: '她抬头看见郑司书，又看见你们身后的宗门袍角，手上的动作停了半拍——然后继续拧。',
    next: 'ch3-s5-320',
  },
  'ch3-s5-320': {
    type: 'dialogue', speaker: '白芷',
    text: '工钱结清了的。',
    next: 'ch3-s5-330',
  },
  'ch3-s5-330': {
    type: 'dialogue', speaker: '郑司书',
    text: '不是讨账！白芷，这两位是明蓍堂的——问你去年残谱重装的事。',
    next: 'ch3-s5-340',
  },
  'ch3-s5-340': {
    type: 'narration',
    text: '她不答话，把拧好的布搭上竹竿，站定，看着盆里的水。',
    next: 'ch3-s5-350',
  },
  'ch3-s5-350': {
    type: 'narration',
    text: '沈疏桐安静地看了她片刻，忽然侧过身，给你让出半步——',
    next: 'ch3-s5-360',
  },
  'ch3-s5-360': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你来问。',
    aside: '只对你，声音很轻',
    next: 'ch3-s5-370',
  },
  'ch3-s5-370': {
    type: 'narration',
    text: '你一怔。白芷也抬起眼——第一次正眼看你们。那双眼睛不躲，也不迎，就是看着，像檐下看雨的猫。',
    next: 'ch3-s5-380',
  },
  'ch3-s5-380': {
    type: 'choice',
    prompt: null, // 走访风味 · 不计分；三选项殊途同归（同一条线索、好感等值 +1，互斥）——考的不是对错，是「问对人」
    options: [
      {
        text: '蹲下去，帮她把滑落的布接住，重新搭上竹竿',
        response: {
          speaker: '白芷',
          text: '重装那阵，有人夜里来过院里。不点灯。两回。',
          aside: '她接过布角，看你的眼神松了一线。半晌，她忽然开口：',
        },
        effects: { favor: 1 },
        next: 'ch3-s5-390',
      },
      {
        text: '直接问：重装那阵，可有外人进出？',
        response: {
          speaker: '白芷',
          text: '白日里没有。夜里，有人来过院里。不点灯。两回。',
          aside: '她顿了顿，像是决定多给一句：',
        },
        effects: { favor: 1 },
        next: 'ch3-s5-400',
      },
      {
        text: '不说话，帮她把最后一盆水倒了',
        response: {
          speaker: '白芷',
          text: '你们要问的，是不是夜里来的那个。不点灯，来过两回。——没人问过我。',
          aside: '水泼在石缝里。她看着水痕，忽然自己开了口，声音很平：',
        },
        effects: { favor: 1 },
        next: 'ch3-s5-410',
      },
    ],
  },
  // ── 走访风味选项分支尾（选项一/二各有收束句，三线汇于 ch3-s5-410）──
  'ch3-s5-390': {
    type: 'narration',
    text: '说完又低头去拧衣裳，仿佛刚才什么都没说。',
    m1Note: '好感 +1——{{senior}}在旁边看着你，目光里那点东西，像是「教对人了」。',
    next: 'ch3-s5-410',
  },
  'ch3-s5-400': {
    type: 'narration',
    text: '郑司书愕然：「夜里？你怎么不报——」「没人问过。」她说。',
    next: 'ch3-s5-410',
  },
  'ch3-s5-410': {
    type: 'narration',
    text: '沈疏桐追问了两句。夜里来的人什么模样——「黑的，看不清」；从哪儿进——',
    next: 'ch3-s5-420',
  },
  'ch3-s5-420': {
    type: 'dialogue', speaker: '白芷',
    text: '不走门。门我锁，钥匙不离身，交工那日连钥匙一起交回的。走的是后窗。那插销，书还回去之后，松过一回——正月里的事。我自己削了根新的换上。',
    aside: '她的手在围裙上擦了擦，像还能摸到那串钥匙的分量，',
    next: 'ch3-s5-430',
  },
  'ch3-s5-430': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '书都还回去了，他又来。',
    next: 'ch3-s5-440',
  },
  'ch3-s5-440': {
    type: 'dialogue', speaker: '白芷',
    text: '嗯。没丢东西。我数过纸。',
    aside: '她想了想，补得很准：',
    next: 'ch3-s5-450',
  },
  'ch3-s5-450': {
    type: 'narration',
    text: '你们对视一眼：夜访那两回，书还摊在案上晾浆；插销松动，却在书离开修书房之后——他后来又来过。来找什么？书已经不在了。',
    next: 'ch3-s5-460',
  },
  'ch3-s5-460': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '白芷。你在山上十年——为什么开春走？',
    aside: '沉默半晌，忽然问',
    next: 'ch3-s5-470',
  },
  'ch3-s5-470': {
    type: 'narration',
    text: '她拧衣裳的手没停。水声里，她的答话轻得几乎听不见：',
    next: 'ch3-s5-480',
  },
  'ch3-s5-480': {
    type: 'dialogue', speaker: '白芷',
    text: '那院子不干净。',
    next: 'ch3-s5-490',
  },
  'ch3-s5-490': {
    type: 'narration',
    text: '郑司书刚要辩，她又补了三个字：',
    next: 'ch3-s5-500',
  },
  'ch3-s5-500': {
    type: 'dialogue', speaker: '白芷',
    text: '不是说脏。',
    next: 'ch3-s5-510',
  },
  'ch3-s5-510': {
    type: 'narration',
    text: '说完，她低下头，不再开口。竹竿上的布在风里晃，像一排没写字的幡。',
    next: 'ch3-s5-520',
  },

  // ── 5.4 打结 ──
  'ch3-s5-520': {
    type: 'narration',
    text: '从集市回山，石阶走到半程，日头偏了西。前后没有人，{{ta}}放慢脚步。',
    next: 'ch3-s5-530',
  },
  'ch3-s5-530': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '说说。三双手，你怎么看？',
    next: 'ch3-s5-540',
  },
  'ch3-s5-540': {
    type: 'dialogue', speaker: '{{player}}',
    text: '宋师傅的刀……裁得出那道切口。可他当着我们的面演，还主动说小崔也会——藏事的人，不这么大方。',
    next: 'ch3-s5-550',
  },
  'ch3-s5-550': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。',
    next: 'ch3-s5-560',
  },
  'ch3-s5-560': {
    type: 'dialogue', speaker: '{{player}}',
    text: '崔小砚懂点位。可他要真是换页的人，何必在我们面前露这一手……还有白芷说的，夜里来的人——',
    next: 'ch3-s5-570',
  },
  'ch3-s5-570': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——不点灯。',
    next: 'ch3-s5-580',
  },
  'ch3-s5-580': {
    type: 'narration',
    text: '{{ta}}停下来，望着半山的雾。',
    next: 'ch3-s5-590',
  },
  'ch3-s5-590': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '夜里进院不点灯，是怕人看见光。可他明知院里住着人——白芷就睡在偏屋——还是来了两回。',
    next: 'ch3-s5-600',
  },
  'ch3-s5-600': {
    type: 'dialogue', speaker: '{{player}}',
    text: '他不怕她？',
    next: 'ch3-s5-610',
  },
  'ch3-s5-610': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '他笃定那双眼睛不识字：看见了，也说不出个所以然，报不成案卷。他算错了一件事——眼睛不识字，可眼睛记事。',
    aside: '{{ta}}顿了半息，声音冷下来，',
    next: 'ch3-s5-620',
  },
  'ch3-s5-620': {
    type: 'narration',
    text: '风从石阶两侧的草里穿过去。',
    next: 'ch3-s5-630',
  },
  'ch3-s5-630': {
    type: 'dialogue', speaker: '{{player}}',
    text: '还有插销。书都还回去了，他又来了一回——走的还是窗。他在找什么？',
    next: 'ch3-s5-640',
  },
  'ch3-s5-640': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '或者，在放什么。',
    next: 'ch3-s5-650',
  },
  'ch3-s5-650': {
    type: 'narration',
    text: '你愣住。{{ta}}却不肯展开，只把这四个字搁在风里。',
    next: 'ch3-s5-660',
  },
  'ch3-s5-660': {
    type: 'dialogue', speaker: '{{player}}',
    text: '白芷呢？她要真看见了什么——为什么不报，反倒自己走了？',
    next: 'ch3-s5-670',
  },
  'ch3-s5-670': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '因为她不识字，报不了案卷；因为十年里没人问过她一句话；因为——她修好了院里每一道锁销才走。守规矩守到最后一日的人，不是心虚。是害怕。',
    aside: '{{ta}}顿了顿，',
    next: 'ch3-s5-680',
  },
  'ch3-s5-680': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '她怕的东西，比丢一册书大。',
    next: 'ch3-s5-690',
  },
  'ch3-s5-690': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有一根刺。小崔说，残谱的世点一点不错。',
    next: 'ch3-s5-700',
  },
  'ch3-s5-700': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……可艮宫第七那页，是错的。',
    next: 'ch3-s5-710',
  },
  'ch3-s5-710': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '所以这句话只有三种可能：他看的时候，假页还没换上；或者他的眼力没他嘴上那么灵；或者——',
    next: 'ch3-s5-720',
  },
  'ch3-s5-720': {
    type: 'narration',
    text: '{{ta}}没说完。第三种可能悬在半空，比说出来更冷。',
    next: 'ch3-s5-730',
  },
  'ch3-s5-730': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '线索打结了。人证物证——又是浑的。',
    next: 'ch3-s5-740',
  },
  'ch3-s5-740': {
    type: 'narration',
    text: '你们对视一眼。这句话你们都听过——第一章那个凌晨，韩长老在藏经阁前说的。那时接下这句的，是一张卦。',
    next: 'ch3-s5-750',
  },
  'ch3-s5-750': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '回明蓍堂。问卦。',
    next: 'ch3-s6-header',
  },

  // ═══════════════ 第六幕 · 应临官鬼 ═══════════════
  // 摇卦交互（山地剥，玩家自报爻）；装支复习快带 → 装亲（DressingBoard liuqin 扩展）；
  // CP-02（KP-LY-008 独立装亲）→ CP-03（KP-LY-009 独立择用神——主计分点）→ 本命卦装亲小节（红线内）。
  'ch3-s6-header': {
    type: 'sceneHeader', scene: 6, title: '应临官鬼',
    time: '当夜', ambience: '明蓍堂。',
    m1Note: '本幕功能：摇卦交互（山地剥）；装支复习快带；CP-02（KP-LY-008 独立装亲）；CP-03（KP-LY-009 独立择用神——主计分点）；本命卦装亲小节（红线内）。剧情固定卦象：山地剥 · 六爻安静，掷序（初→上）[8,8,8,8,8,7]（引擎已验证，见 § 0）。',
    next: 'ch3-s6-010',
  },
  'ch3-s6-010': {
    type: 'narration',
    text: '净手。焚香。三枚旧钱在香上过了一遍——这一套，你已经做得比系腰带还顺。',
    next: 'ch3-s6-020',
  },
  'ch3-s6-020': {
    type: 'narration',
    text: '沈疏桐坐在案对面，没有伸手的意思。第三张案卦，从头到尾，是你的。',
    next: 'ch3-s6-030',
  },
  'ch3-s6-030': {
    type: 'dialogue', speaker: '{{player}}',
    text: '天何言哉，叩之即应。弟子{{player}}，为修书房裁谱调页事关心——何人所为，不知休咎，罔释厥疑。惟神惟灵，若可若否，望垂昭报。',
    next: 'ch3-s6-cast',
  },
  // 案卦：固定卦象 山地剥 · 六爻安静。掷序 [8,8,8,8,8,7]（初→上）。
  // 玩家逐掷自报（ch2 精神续用）；本章掷间无 interleave 链（第 3 掷的续祝与自报同段，并入 speakerLine）。
  // 第 6 掷完成后进 cast.next（ch3-s6-040）。
  'ch3-s6-cast': {
    type: 'castInteraction', castId: 'ch3-angua', mode: 'fixed',
    throws: [8, 8, 8, 8, 8, 7],
    question: '修书房裁谱调页，何人所为？',
    perThrow: [
      {
        throwIndex: 1, result: '拆', coinFaces: '两背一字', lineName: '初爻',
        speaker: '{{player}}',
        speakerLine: '（钱落盘。两背。）拆。阴爻。',
      },
      {
        throwIndex: 2, result: '拆', coinFaces: '两背一字', lineName: '二爻',
        speaker: '{{player}}',
        speakerLine: '又是拆。',
      },
      {
        throwIndex: 3, result: '拆', coinFaces: '两背一字', lineName: '三爻',
        speaker: '{{player}}',
        speakerLine: '（三掷落定。你看着卦纸下半：断、断、断——六截短画。）坤六断……内卦，坤。（你顿了顿，声音放轻。）内象已成，再求外象三爻，以成一卦。',
      },
      {
        throwIndex: 4, result: '拆', coinFaces: '两背一字', lineName: '四爻',
        speaker: '{{player}}',
        speakerLine: '拆。',
      },
      {
        throwIndex: 5, result: '拆', coinFaces: '两背一字', lineName: '五爻',
        speaker: '{{player}}',
        speakerLine: '还是拆——五个了。',
      },
      {
        throwIndex: 6, result: '单', coinFaces: '一背两字', lineName: '上爻',
        speaker: '{{player}}',
        speakerLine: '（最后三枚钱停稳。一个背。）单。阳爻——就这一道，盖在最顶上。',
      },
    ],
    next: 'ch3-s6-040',
  },
  'ch3-s6-040': {
    type: 'narration',
    text: '你自己认：下三爻坤，上三爻断、断、整——倒扣的碗。',
    next: 'ch3-s6-050',
  },
  'ch3-s6-050': {
    type: 'dialogue', speaker: '{{player}}',
    text: '艮覆碗。山在上，地在下……山地剥。',
    next: 'ch3-s6-060',
  },
  'ch3-s6-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '乾宫，第六卦，五世。六爻安静。——装。',
    aside: '终于开口，声音听不出温度',
    m1Note: '「剥」字她没解。卦名即凶名（剥落、裁割）——她把这个字留给卦面自己说；她的克制＝张力。',
    next: 'ch3-s6-070',
  },
  'ch3-s6-070': {
    type: 'narration',
    text: '装支你已经熟了：坤在内，未、巳、卯；外卦艮，戌、子、寅。六个地支一笔笔落位；乾宫第六卦，五世——世安五爻，隔两位，应落二爻。两个小字写完，这是第二课的功夫，你的手比脑子先动完。',
    next: 'ch3-s6-dr1',
  },
  // 装卦盘状态事件（dressingUpdate）：board 为每次的累积全量状态；revealed[] 可带 liuqin（装亲扩展）。
  // 山地剥六亲（初→上）：父母未土／官鬼巳火[应]／妻财卯木／父母戌土／子孙子水[世]／妻财寅木。
  'ch3-s6-dr1': {
    type: 'dressingUpdate',
    board: {
      throws: [8, 8, 8, 8, 8, 7],
      revealed: [
        { pos: 1, branch: '未', wuxing: '土' },
        { pos: 2, branch: '巳', wuxing: '火' },
        { pos: 3, branch: '卯', wuxing: '木' },
        { pos: 4, branch: '戌', wuxing: '土' },
        { pos: 5, branch: '子', wuxing: '水' },
        { pos: 6, branch: '寅', wuxing: '木' },
      ],
      marks: { world: 5, response: 2 },
    },
    next: 'ch3-s6-080',
  },
  'ch3-s6-080': {
    type: 'narration',
    text: '然后是今夜的新功课。乾宫属金——金为我。',
    next: 'ch3-s6-090',
  },
  'ch3-s6-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '初爻未土，你装。',
    next: 'ch3-s6-100',
  },
  'ch3-s6-100': {
    type: 'dialogue', speaker: '{{player}}',
    text: '土生金，生我——父母。',
    next: 'ch3-s6-dr2',
  },
  'ch3-s6-dr2': {
    type: 'dressingUpdate',
    board: {
      throws: [8, 8, 8, 8, 8, 7],
      revealed: [
        { pos: 1, branch: '未', wuxing: '土', liuqin: '父母' },
        { pos: 2, branch: '巳', wuxing: '火' },
        { pos: 3, branch: '卯', wuxing: '木' },
        { pos: 4, branch: '戌', wuxing: '土' },
        { pos: 5, branch: '子', wuxing: '水' },
        { pos: 6, branch: '寅', wuxing: '木' },
      ],
      marks: { world: 5, response: 2 },
    },
    next: 'ch3-s6-110',
  },
  'ch3-s6-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '二爻。',
    next: 'ch3-s6-120',
  },
  'ch3-s6-120': {
    type: 'narration',
    text: '二爻巳火。你的笔尖悬住了——{{ta}}抱起手臂，一个字也不提示。',
    next: 'ch3-s6-cp02',
  },
  // ── CP-02 · 计分 · KP-LY-008 独立应用 · 无提示 ──
  'ch3-s6-cp02': {
    type: 'scoredChoice', cpId: 'CH3-CP-02', testsKp: ['KP-LY-008'],
    prompt: '独立装亲（乾宫金我 × 巳火爻）',
    context: '（乾宫金为我。二爻巳火——火与金，是什么关系，什么名分？）',
    options: [
      {
        key: 'A',
        text: '火克金，克我——官鬼。',
        verdict: 'optimal',
        basis: '相克循环『火克金』（炉里熔金）：巳火对金为克我，克我者为官鬼。生克方向 + 安亲五句独立联用，且装出的正是本卦关键爻（应临官鬼的『官鬼』半边）。',
        sourceRef: [
          '《增删卜易·五行相克章第十二》：「水克火﹐火克金」（ctext wiki chapter=950329）',
          '《卜筮正宗·六親相生相克》：「克我者為官鬼」（ctext wiki chapter=889452）',
        ],
        next: 'ch3-s6-cp02a010',
      },
      {
        key: 'B',
        text: '火生金……父母。',
        verdict: 'wrong',
        basis: '生圈记错：火生的是土（烧尽成灰），生金的是土（矿从土出）。火对金是克，不是生。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「木生火﹐火生土﹐土生金」',
        ],
        next: 'ch3-s6-cp02b010',
      },
      {
        key: 'C',
        text: '我克它——妻财。',
        verdict: 'suboptimal',
        basis: '知道金火之间是克，但方向认反：克圈是『火克金』（炉熔金），不是金克火（克火的是水）。方向反了，名分从官鬼变妻财——差一个方向，差出两重天。',
        sourceRef: [
          '《增删卜易·五行相克章第十二》：「土克水﹐水克火﹐火克金」',
        ],
        next: 'ch3-s6-cp02c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-008 → 掌握' },
      suboptimal: { plot: '{{senior}}以灯焰烤钱示克向（火熔金）后重装', mastery: 'KP-LY-008 标记待复习' },
    },
    onWrong: '{{senior}}把生圈在案上重摆一遍（火生土、土生金各归位），玩家重装此爻后过。KP-LY-008 标记待复习。不锁主线。',
  },
  // ── CP-02 选 A（optimal）──
  'ch3-s6-cp02a010': {
    type: 'narration',
    text: '「官鬼」两个字落在二爻旁边。{{ta}}的目光在那两个字上停了一瞬——然后看向二爻旁边另一个早就写好的字。你顺着{{ta}}的目光看过去，握笔的手指一紧。',
    next: 'ch3-s6-dr3',
  },
  // ── CP-02 选 B（wrong）：灯焰示克向重装线 ──
  'ch3-s6-cp02b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '火生金？搁这儿一炷香，它生出什么来？——熔了。火克金。克我者，官鬼。重装。',
    aside: '{{ta}}捻起一枚铜钱，悬在灯焰上方两寸，',
    next: 'ch3-s6-cp02b020',
  },
  'ch3-s6-cp02b020': {
    type: 'narration',
    text: '你重新落笔。然后你看见了二爻旁边那个早就写好的字。',
    m1Note: 'KP-LY-008 标记待复习。',
    next: 'ch3-s6-dr3',
  },
  // ── CP-02 选 C（suboptimal）：方向认反纠正线 ──
  'ch3-s6-cp02c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '金火之间是克，这步对。谁克谁？炉里熔金——火克金。方向一反，官鬼成了妻财，贼成了钱袋子。装卦的错都不大，就是差之毫厘。',
    aside: '{{ta}}朝灯焰抬了抬下巴，',
    next: 'ch3-s6-cp02c020',
  },
  'ch3-s6-cp02c020': {
    type: 'narration',
    text: '你改过来。然后你看见了那个字。',
    m1Note: 'KP-LY-008 标记待复习。',
    next: 'ch3-s6-dr3',
  },
  // ── CP-02 三线汇合：二爻官鬼落位 ──
  'ch3-s6-dr3': {
    type: 'dressingUpdate',
    board: {
      throws: [8, 8, 8, 8, 8, 7],
      revealed: [
        { pos: 1, branch: '未', wuxing: '土', liuqin: '父母' },
        { pos: 2, branch: '巳', wuxing: '火', liuqin: '官鬼' },
        { pos: 3, branch: '卯', wuxing: '木' },
        { pos: 4, branch: '戌', wuxing: '土' },
        { pos: 5, branch: '子', wuxing: '水' },
        { pos: 6, branch: '寅', wuxing: '木' },
      ],
      marks: { world: 5, response: 2 },
    },
    next: 'ch3-s6-130',
  },

  // ── 6.2 应临官鬼 ──
  'ch3-s6-130': {
    type: 'narration',
    text: '二爻旁边，方才装世应时落下的那个字，静静待着——',
    next: 'ch3-s6-140',
  },
  'ch3-s6-140': {
    type: 'narration',
    text: '应。',
    next: 'ch3-s6-150',
  },
  'ch3-s6-150': {
    type: 'narration',
    text: '官鬼，临应。你还没想明白这意味着什么，手已经把剩下的爻装完了：三爻卯木，金克木，妻财；四爻戌土，父母；五爻子水，金生水，我生——子孙，旁边一个「世」字；上爻寅木，妻财。',
    next: 'ch3-s6-dr4',
  },
  'ch3-s6-dr4': {
    type: 'dressingUpdate',
    board: {
      throws: [8, 8, 8, 8, 8, 7],
      revealed: [
        { pos: 1, branch: '未', wuxing: '土', liuqin: '父母' },
        { pos: 2, branch: '巳', wuxing: '火', liuqin: '官鬼' },
        { pos: 3, branch: '卯', wuxing: '木', liuqin: '妻财' },
        { pos: 4, branch: '戌', wuxing: '土', liuqin: '父母' },
        { pos: 5, branch: '子', wuxing: '水', liuqin: '子孙' },
        { pos: 6, branch: '寅', wuxing: '木', liuqin: '妻财' },
      ],
      marks: { world: 5, response: 2 },
    },
    next: 'ch3-s6-160',
  },
  'ch3-s6-160': {
    type: 'narration',
    text: '六个名分，两个标记。整张卦装完了，像一张摆好了子的棋盘。',
    next: 'ch3-s6-170',
  },
  'ch3-s6-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '装完了？好。',
    next: 'ch3-s6-180',
  },
  'ch3-s6-180': {
    type: 'narration',
    text: '{{ta}}向后靠进椅背，抱起手臂——考较的姿势。',
    next: 'ch3-s6-190',
  },
  'ch3-s6-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今夜这卦，问的是裁谱调页的人。满盘六个爻——你先看哪一爻？',
    next: 'ch3-s6-cp03',
  },
  // ── CP-03 · 计分 · KP-LY-009（联 KP-LY-006）独立应用 · 无提示 · 本章主计分点 ──
  'ch3-s6-cp03': {
    type: 'scoredChoice', cpId: 'CH3-CP-03', testsKp: ['KP-LY-009'],
    prompt: '案卦择用神（问人何为先看何爻——本章主计分点）',
    context: '（问的是「何人所为」。卦面：世临子孙（五爻子水），应临官鬼（二爻巳火），上爻寅木妻财，四爻戌土父母……）',
    options: [
      {
        key: 'A',
        text: '问人，看应爻——应作他人。应上坐的是官鬼：对面那个人，就是贼。',
        verdict: 'optimal',
        basis: '择用神两步独立联用：①问『何人所为』，所问是彼端之人——「世為自己，應作他人」，看应爻（KP-LY-006 含义句的应用）；②应爻巳火装出官鬼——「占亂臣賊盜邪崇也以官鬼爻為用神」：贼的用神与彼端之位重合，所问之人与贼在卦面合一。',
        sourceRef: [
          '《卜筮正宗·十八論·世應論用神第二》：「世為自己，應作他人」（ctext wiki chapter=889452）',
          '《增删卜易·用神章第八》：「占亂臣賊盜邪崇也以官鬼爻為用神……一切拘束我身者是也」（ctext wiki chapter=950329）',
        ],
        // yaml next_note：高光线——她的读卦全文（6.3）
        next: 'ch3-s6-cp03a010',
      },
      {
        key: 'B',
        text: '看世爻——世上是子孙，我们能解开这件事。',
        verdict: 'suboptimal',
        basis: '世是自己——问的却是『何人所为』，彼端之事。世临子孙（解忧之神持世）是真的、也是好兆头，但它答的是「我们怎么样」，不是「那人是谁」。看对了爻面，问错了方向。',
        sourceRef: [
          '《卜筮正宗·世應論用神第二》：「凡占……諸凡損益自身者，以世爻為用也」——反证：所问非自身',
        ],
        next: 'ch3-s6-cp03b010',
      },
      {
        key: 'C',
        text: '问书看父母——四爻戌土父母，书还在。',
        verdict: 'wrong',
        basis: '择爻纪律用错了对象：父母爻是书的用神，可今夜问的是人（何人所为）。问什么找什么亲——拿着前夜的问题读今夜的卦，答非所问。',
        sourceRef: [
          '《增删卜易·用神章第八》父母爻条——其所主为文书书册，非人',
        ],
        next: 'ch3-s6-cp03c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-009 → 掌握' },
      suboptimal: { plot: '{{senior}}先赞后纠（世临子孙是真的），再引到应爻', mastery: 'KP-LY-009 标记待复习' },
    },
    onWrong: '{{senior}}把前夜明夷与今夜剥并排：『前夜问书，看父母；今夜问人——问什么，找什么。』引回应爻后过。KP-LY-009 标记待复习。不锁主线。',
  },
  // ── CP-03 选 A（optimal）──
  'ch3-s6-cp03a010': {
    type: 'narration',
    text: '堂里静了三息。',
    next: 'ch3-s6-cp03a020',
  },
  'ch3-s6-cp03a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '……问人看应。应临官鬼。',
    next: 'ch3-s6-cp03a030',
  },
  'ch3-s6-cp03a030': {
    type: 'narration',
    text: '{{ta}}一字一字复述你的答案，像在案上钉钉子。然后{{ta}}松开抱着的手臂，倾身向前——',
    next: 'ch3-s6-cp03a040',
  },
  'ch3-s6-cp03a040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三课，你都拿住了。',
    next: 'ch3-s6-200',
  },
  // ── CP-03 选 B（suboptimal）：先赞后纠引回应爻线 ──
  'ch3-s6-cp03b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '世临子孙——看见了？好眼力。解忧的爻坐在我们自己位子上，这案子，解得开。可你问的是『何人所为』。人在彼端——世是你，应才是他。再看应爻。',
    aside: '{{ta}}顿了顿，',
    next: 'ch3-s6-cp03b020',
  },
  'ch3-s6-cp03b020': {
    type: 'narration',
    text: '你低头。二爻。巳火。官鬼。',
    m1Note: 'KP-LY-009 标记待复习。',
    next: 'ch3-s6-200',
  },
  // ── CP-03 选 C（wrong）：两卦并排问什么找什么线 ──
  'ch3-s6-cp03c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '四爻戌土是父母，没装错。可那是书的爻——前夜的问题。前夜问书，看父母。今夜问的是人。问什么，找什么亲——你拿前夜的钥匙，开今夜的锁。',
    aside: '{{ta}}把两张卦纸并排推开：明夷在左，剥在右，',
    next: 'ch3-s6-cp03c020',
  },
  'ch3-s6-cp03c020': {
    type: 'narration',
    text: '{{ta}}的指尖点在二爻。',
    m1Note: 'KP-LY-009 标记待复习；不锁主线。',
    next: 'ch3-s6-200',
  },

  // ── 6.3 读卦（三线汇合）──
  'ch3-s6-200': {
    type: 'narration',
    text: '三条线，最后都汇到同一个地方：二爻，巳火，官鬼，应。',
    next: 'ch3-s6-210',
  },
  'ch3-s6-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '听好。这是这张卦的话，我只替它转述——',
    next: 'ch3-s6-220',
  },
  'ch3-s6-220': {
    type: 'narration',
    text: '{{ta}}的声音沉下来，像第一章那个凌晨念爻辞时一样。',
    next: 'ch3-s6-230',
  },
  'ch3-s6-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '应作他人——你问『何人』，卦把那个人放在应位。应临官鬼——那个位子上坐着的，是拘着我们的东西：贼。',
    next: 'ch3-s6-240',
  },
  'ch3-s6-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问的人，答的人，就在对面。',
    next: 'ch3-s6-250',
  },
  'ch3-s6-250': {
    type: 'dialogue', speaker: '{{player}}',
    text: '对面……三个人里的一个？',
    next: 'ch3-s6-260',
  },
  'ch3-s6-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '或者第四个。应是彼端，不是名册——卦告诉你他在，在你看得见的对面；卦不替你点名。',
    next: 'ch3-s6-270',
  },
  // 「世临子孙」暖细节：无论 CP-03 选哪条线，6.3 末她都补这句（B 线玩家已先看见）。
  'ch3-s6-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有半句。世上坐着子孙——解忧避祸之神，在我们这一位。',
    aside: '收卦纸前，指尖在五爻停了一下',
    next: 'ch3-s6-280',
  },
  'ch3-s6-280': {
    type: 'narration',
    text: '{{ta}}把卦纸折好，却没有立刻收——{{ta}}把明夷的卦纸从袖中取出来，两张卦纸在案上并了排。',
    next: 'ch3-s6-290',
  },
  'ch3-s6-290': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '两夜，两卦。合起来听。',
    next: 'ch3-s6-300',
  },
  'ch3-s6-300': {
    type: 'narration',
    text: '{{ta}}的指尖先落在左边。',
    next: 'ch3-s6-310',
  },
  'ch3-s6-310': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '前夜问书——明入地中，父母静伏：藏着，护着，没挪窝。',
    next: 'ch3-s6-320',
  },
  'ch3-s6-320': {
    type: 'narration',
    text: '再落在右边。',
    next: 'ch3-s6-330',
  },
  'ch3-s6-330': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今夜问人——应临官鬼：他在对面，看得见的近处。',
    next: 'ch3-s6-340',
  },
  'ch3-s6-340': {
    type: 'narration',
    text: '两根指尖慢慢合到一处。',
    next: 'ch3-s6-350',
  },
  'ch3-s6-350': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '书藏着。人在近处。合起来一句话——',
    next: 'ch3-s6-360',
  },
  'ch3-s6-360': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……书，就藏在近处。',
    next: 'ch3-s6-370',
  },
  'ch3-s6-370': {
    type: 'narration',
    text: '{{ta}}看了你一眼，没纠正，也没夸。那一眼比夸重。',
    next: 'ch3-s6-380',
  },
  'ch3-s6-380': {
    type: 'narration',
    text: '{{ta}}把两张卦纸叠齐，折好，第一次在这桩案子里，语气里有了一点极淡的、类似笑意的东西。',
    next: 'ch3-s6-390',
  },
  'ch3-s6-390': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦说：这个结，解得开。',
    next: 'ch3-s6-drclear',
  },
  // 两张卦纸叠齐折好——案卦离案，清盘（6.4 本命卦为玩家真随机卦，不上装卦盘）。
  'ch3-s6-drclear': {
    type: 'dressingUpdate',
    board: null,
    next: 'ch3-s6-400',
  },

  // ── 6.4 你自己的卦（小节）——纯情感 beat，不设教学块不计分；装亲＝机械操作，不出吉凶语（红线）──
  'ch3-s6-400': {
    type: 'narration',
    text: '收拾案面的时候，你从怀里摸出自己那张本命卦的卦纸——第一章那个凌晨摇的；这些日子你自己练手，支早装全了，籍贯也查过，始终没解。',
    next: 'ch3-s6-410',
  },
  'ch3-s6-410': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}……籍贯能查，装亲——',
    next: 'ch3-s6-420',
  },
  'ch3-s6-420': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '装。',
    next: 'ch3-s6-430',
  },
  'ch3-s6-430': {
    type: 'narration',
    text: '{{ta}}答得干脆，头都没抬。',
    next: 'ch3-s6-440',
  },
  'ch3-s6-440': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '装亲是手上的功夫，不是解卦。你的卦你自己装——装完收好。还是不许解。',
    next: 'ch3-s6-450',
  },
  'ch3-s6-450': {
    type: 'narration',
    text: '你于是就着灯，把自己的卦一爻一爻装完。六个名分落定的时候，你盯着某一爻看了很久——它是什么亲，只有你自己知道。',
    next: 'ch3-s6-460',
  },
  'ch3-s6-460': {
    type: 'narration',
    text: '你把卦纸折好，贴身收起。它现在有支、有籍贯、有名分——像一封写完了姓名住址、还没拆开的信。',
    next: 'ch3-s7-header',
  },

  // ═══════════════ 第七幕 · 亲疏 ═══════════════
  'ch3-s7-header': {
    type: 'sceneHeader', scene: 7, title: '亲疏',
    time: '夜半', ambience: '明蓍堂门口。',
    m1Note: '本幕功能：章末收束；「点偏半分」新钩子；称谓高光（favorBranch ≥25，§ 0 第 3 条）；结算。',
    next: 'ch3-s7-010',
  },
  'ch3-s7-010': {
    type: 'narration',
    text: '夜半的明蓍堂，香烧到了最后一指。',
    next: 'ch3-s7-020',
  },
  'ch3-s7-020': {
    type: 'narration',
    text: '你忽然想起两夜之前的自己——那时「六亲」还只是个没听过的词，明夷还是一张只会说一句话的纸，修书房还只是名单上三个陌生的名字。',
    next: 'ch3-s7-030',
  },
  'ch3-s7-030': {
    type: 'narration',
    text: '两夜。一圈生，一圈克，五句名分，三个锚。你的卦纸上从此多了一层字。',
    next: 'ch3-s7-040',
  },
  'ch3-s7-040': {
    type: 'narration',
    text: '而这一切是从哪儿开始的？你想了想——是从{{ta}}那句「光知道名字，是路人」开始的。',
    next: 'ch3-s7-050',
  },
  'ch3-s7-050': {
    type: 'narration',
    text: '{{ta}}送你到门口。案卦折在{{ta}}袖中，你的本命卦贴在你怀里——一样的纸，两样的分量。',
    next: 'ch3-s7-060',
  },
  'ch3-s7-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日起，修书房那头先按兵不动。应临官鬼——他在对面看着我们，我们也看着他。谁先动，谁输一目。',
    next: 'ch3-s7-070',
  },
  'ch3-s7-070': {
    type: 'dialogue', speaker: '{{player}}',
    text: '那我们等什么？',
    next: 'ch3-s7-080',
  },
  'ch3-s7-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '等他自己走到卦里来。',
    next: 'ch3-s7-090',
  },
  'ch3-s7-090': {
    type: 'narration',
    text: '{{ta}}说完，却没有立刻转身进堂。夜风把灯焰压低了一线。{{ta}}望着廊下的黑，忽然开口，声音比方才低：',
    next: 'ch3-s7-100',
  },
  'ch3-s7-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有一件事。睡前想想，别想太久。',
    next: 'ch3-s7-110',
  },
  'ch3-s7-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你们唱名那日我就在想——抄这册谱的人，装卦从不出错。宋补之夸它装帧齐整，崔小砚说它点位一点不错。可我昨夜把在册三十页真页又过了一遍——',
    next: 'ch3-s7-120',
  },
  'ch3-s7-120': {
    type: 'narration',
    text: '{{ta}}转过头来，灯焰在{{ta}}眼里静静烧。',
    next: 'ch3-s7-130',
  },
  'ch3-s7-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '有一页的世点，从一开始就点偏了半分。不是错——错不会只偏半分。像是……故意的。',
    next: 'ch3-s7-140',
  },
  'ch3-s7-140': {
    type: 'dialogue', speaker: '{{player}}',
    text: '哪一页？',
    next: 'ch3-s7-150',
  },
  'ch3-s7-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '睡醒了再说。今夜你满脑子都是生克名分——这种时候看什么都像线索。歇了。',
    aside: '{{ta}}把这个话头收得干脆利落，',
    next: 'ch3-s7-branch',
  },
  // ── 章末称谓分支（favorBranch · threshold 25 · § 0 第 3 条）——按 save.favor 静默路由 ──
  // optimal 主线 20+10=30 必过 pass（她第一次直呼 {{player}} 名）；容错线 ≤24 走 fail（称谓照旧，留待复读）。
  'ch3-s7-branch': {
    type: 'favorBranch', threshold: 25,
    pass: 'ch3-s7-pass010',
    fail: 'ch3-s7-fail010',
  },
  // ── 好感 ≥ 25（「信任」档）：初次直呼其名 ──
  'ch3-s7-pass010': {
    type: 'narration',
    text: '你应了一声，转身下阶。走出两步，身后的声音又追上来——',
    next: 'ch3-s7-pass020',
  },
  'ch3-s7-pass020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。',
    next: 'ch3-s7-pass030',
  },
  'ch3-s7-pass030': {
    type: 'narration',
    text: '你顿住。',
    next: 'ch3-s7-pass040',
  },
  'ch3-s7-pass040': {
    type: 'narration',
    text: '不是「{{junior}}」。',
    next: 'ch3-s7-pass050',
  },
  'ch3-s7-pass050': {
    type: 'narration',
    text: '是你的名字。入门以来，{{ta}}第一次连名带姓地、清清楚楚地，叫你的名字。',
    next: 'ch3-s7-pass060',
  },
  'ch3-s7-pass060': {
    type: 'narration',
    variants: {
      female: '你回过头。她站在门里的灯影里，神色如常，仿佛刚才那两个字只是随口。可她的指尖在袖口上轻轻捻了一下——你见过这个小动作：她收着什么话的时候，就这样。',
      male: '你回过头。他站在门里的灯影里，抱了一整夜的手臂垂在身侧。灯焰把他的影子投在门板上，比平日松了一寸。',
    },
    next: 'ch3-s7-pass070',
  },
  'ch3-s7-pass070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三张卦纸，三课，你都接住了。——往后这案子，你不是跟着我查。',
    next: 'ch3-s7-pass080',
  },
  'ch3-s7-pass080': {
    type: 'narration',
    variants: {
      female: '她顿了半息，',
      male: '他把「我们」两个字说得很平，平得像怕它太响：',
    },
    next: 'ch3-s7-pass090',
  },
  'ch3-s7-pass090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '是我们查。',
    next: 'ch3-s7-pass100',
  },
  'ch3-s7-pass100': {
    type: 'narration',
    text: '门阖上了。你站在夜风里，怀里的卦纸贴着心口。',
    next: 'ch3-s7-pass110',
  },
  'ch3-s7-pass110': {
    type: 'narration',
    text: '名字比「{{junior}}」短，落在耳朵里，却重得多。',
    effects: { favor: 1 },
    m1Note: '章末事件「初次直呼其名」（好感 +1，自动触发）。两分支好感 +1 等值——档位本身已是奖惩。',
    next: 'ch3-s7-200',
  },
  // ── 好感 ＜ 25（容错线）：称谓照旧 ──
  'ch3-s7-fail010': {
    type: 'narration',
    text: '你应了一声，转身下阶。',
    next: 'ch3-s7-fail020',
  },
  'ch3-s7-fail020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{junior}}。',
    next: 'ch3-s7-fail030',
  },
  'ch3-s7-fail030': {
    type: 'narration',
    text: '你回头。{{ta}}站在门里的灯影里，看了你两息，最后只说：',
    next: 'ch3-s7-fail040',
  },
  'ch3-s7-fail040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三课，底子都在了，就是还毛糙。把待复习的那几处磨掉——磨掉了，有些话我才好说。',
    next: 'ch3-s7-fail050',
  },
  'ch3-s7-fail050': {
    type: 'narration',
    text: '门阖上了。你隐约觉得{{ta}}方才想说的不是这句——但那扇门已经关了。',
    effects: { favor: 1 },
    m1Note: '章末事件（好感 +1，自动触发）；「有些话」留待复读/后续章。两分支好感 +1 等值——档位本身已是奖惩。',
    next: 'ch3-s7-200',
  },

  // ── 章末结算（两分支汇合）──
  'ch3-s7-200': {
    type: 'narration',
    text: '这一夜你睡得很沉。梦里没有卦，只有五样东西在案上转：铜钱、木签、水盂、灯焰、香灰——一圈生，一圈克，转着转着，都变成了人：话密的、倨傲的、沉默的，和一个不点灯的影子。',
    next: 'ch3-s7-210',
  },
  'ch3-s7-210': {
    type: 'narration',
    text: '醒来时你想：卦里的六亲有名分有规矩，人间的亲疏——要难认得多。',
    next: 'ch3-s7-220',
  },
  'ch3-s7-220': {
    type: 'narration',
    text: '但你已经会认了。从爻认起。',
    next: 'ch3-end',
  },

  // ═══════════════ 第三章 · 终 ═══════════════
  'ch3-end': {
    type: 'chapterEnd',
    title: '【第三章 · 终】',
    rewards: { lingli: 10 },
    hooks: [
      '应临官鬼——「他在对面」（三人或第四人，夜访者未明）',
      '「点偏半分」的那一页（抄谱人的故意——残谱藏秘实质线索）',
      '巳火官鬼的「巳」（她收着没说——时辰/生肖关联，第四章）',
      '称谓变化（信任档开启——私教章①解锁条件已齐，见策划案 § 1.1）',
      '本命卦装亲完成（个人线推进：有支、有籍贯、有名分，未解）',
    ],
    nextChapterTeaser: '找对了爻，还要看它旺不旺——爻有名分，还有强弱：第四课，旺衰。',
  },
  },
};

export default CHAPTER_3;
