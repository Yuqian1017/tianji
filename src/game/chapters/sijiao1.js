// 私教章①《演卦》 — structured node-flow data (bonus/private-lesson spec)
// Source of truth: docs/script/BONUS_SIJIAO1_SCRIPT_v1.md (single-round review
// converged 2026-07-17, owner-delegated; commit 90ee88e).
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Spec: zero new KP / zero scoredChoice / zero mastery change. favor +7
// (考较1+观排1+核心5), lingli +5 (chapterEnd). Trigger gate (GameModule):
// ch4 done + favor >= 35 + natalHexagram present.
// ch-specific mechanics:
// - dressingUpdate nodes may carry dynamicNatalBoard: 'branches'|'marks'|'full'
//   → Player builds the board from natalDressingBoard(save.natalHexagram, stage)
//   (state.js). Missing natal → warn + null board (fail loud, no fake chart).
// - 幕四 卦名总述 node uses dynamicNatal + 〔…〕 placeholder (ch2 6.4 convention).
// - 幕二 考较 choice: all three options TERMINAL, each effects {favor:1} — the
//   re-answer is narrated inside the response text, no loop-back (no double count).
// - 幕五 opens with dressingUpdate {board:null} (收盘, per ch2/ch3 precedent).

export const CHAPTER_SIJIAO1 = {
  id: 'sijiao1',
  title: '演卦',
  scriptVersion: 'v1.0-reviewed-2026-07-17',
  entryNode: 'sj1-s1-header',

  knowledgePoints: [], // 零新 KP（bonus 章硬规则）

  nodes: {
  // ═══════════════ 第一幕 · 柴棚 ═══════════════
  'sj1-s1-header': {
    type: 'sceneHeader', scene: 1, title: '柴棚',
    time: '午后', ambience: '修书房后院，柴棚。守窗轮值期间。',
    m1Note: '本幕功能：私教由头（守窗轮值中她来换值，撞见玩家自练）；触发情境自然生成。',
    next: 'sj1-s1-010',
  },
  'sj1-s1-010': {
    type: 'narration',
    text: '守窗的第三日。',
    next: 'sj1-s1-020',
  },
  'sj1-s1-020': {
    type: 'narration',
    text: '柴棚里能看见那扇窗，窗看不见你——{{ta}}挑的位置，果然刁钻。巳时到未时，后院只有晒架上的浆布动，窗台上的灰纹丝没动。',
    next: 'sj1-s1-030',
  },
  'sj1-s1-030': {
    type: 'narration',
    text: '你把卦纸在膝上铺开——不是案卦，是你自己那张。守窗的时辰长，你数它的爻玩：这一爻生那一爻，那一爻克这一爻——四章学下来的东西，在这张纸上转圈。',
    next: 'sj1-s1-040',
  },
  'sj1-s1-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '背地里用功，被我撞见几回了？',
    next: 'sj1-s1-050',
  },
  'sj1-s1-050': {
    type: 'narration',
    text: '你一惊。{{ta}}不知什么时候立在柴棚口，手里提着换值的灯笼——今日{{ta}}来得早。',
    next: 'sj1-s1-060',
  },
  'sj1-s1-060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……第三回。',
    next: 'sj1-s1-070',
  },
  'sj1-s1-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '第四回。前日换值，你就蹲在这儿描八宫图——我没拆穿你。',
    next: 'sj1-s1-080',
  },
  'sj1-s1-080': {
    type: 'narration',
    text: '{{ta}}走进棚里，目光落在你膝上的卦纸上——你下意识把纸往回收了半寸。',
    next: 'sj1-s1-090',
  },
  'sj1-s1-090': {
    type: 'narration',
    text: '{{ta}}看见了这半寸。',
    next: 'sj1-s1-100',
  },
  'sj1-s1-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '怕什么。规矩是我立的——不许解。我几时说过，不许看？',
    next: 'sj1-s1-110',
  },
  'sj1-s1-110': {
    type: 'narration',
    text: '{{ta}}把灯笼搁下，在柴堆另一头坐了，隔着一棚的斜光看你。',
    next: 'sj1-s1-120',
  },
  'sj1-s1-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。今日窗归我，你歇。——歇之前，回明蓍堂一趟。',
    next: 'sj1-s1-130',
  },
  'sj1-s1-130': {
    type: 'dialogue', speaker: '{{player}}',
    text: '上课？',
    next: 'sj1-s1-140',
  },
  'sj1-s1-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不上课。',
    next: 'sj1-s1-150',
  },
  'sj1-s1-150': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}起身掸了掸衣角，',
    text: '四章的东西，你肚子里存了多少，我心里没数。今日盘一盘账——盘完，给你看样东西。',
    next: 'sj1-s2-header',
  },

  // ═══════════════ 第二幕 · 盘账 ═══════════════
  'sj1-s2-header': {
    type: 'sceneHeader', scene: 2, title: '盘账',
    time: '午后偏晚', ambience: '明蓍堂。',
    m1Note: '本幕功能：旧知识复习考较（四问快答，风味不计分不惩罚）；好感应答位 +1。复习卦＝乾为天；本命卦不上桌。',
    next: 'sj1-s2-010',
  },
  'sj1-s2-010': {
    type: 'narration',
    text: '明蓍堂的案上，{{ta}}摆的还是那张乾为天。',
    next: 'sj1-s2-020',
  },
  'sj1-s2-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '老规矩，老熟人。四问，答上来算你的，答不上算我教得不好——不计分，放心开口。',
    next: 'sj1-s2-030',
  },
  'sj1-s2-030': {
    type: 'narration',
    text: '{{ta}}指尖点在卦纸上。',
    next: 'sj1-s2-040',
  },
  'sj1-s2-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一问。乾为天，籍贯何处，行几，称什么？',
    next: 'sj1-s2-050',
  },
  'sj1-s2-050': {
    type: 'dialogue', speaker: '{{player}}',
    text: '乾宫，头一个——宫主，本宫卦。',
    next: 'sj1-s2-060',
  },
  'sj1-s2-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '二问。世应各在几爻？',
    next: 'sj1-s2-070',
  },
  'sj1-s2-070': {
    type: 'dialogue', speaker: '{{player}}',
    text: '世在上爻，应在三爻。',
    next: 'sj1-s2-080',
  },
  'sj1-s2-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三问。四爻午火，什么名分？',
    next: 'sj1-s2-090',
  },
  'sj1-s2-090': {
    type: 'dialogue', speaker: '{{player}}',
    text: '乾宫属金，火克金，克我者——官鬼。',
    next: 'sj1-s2-100',
  },
  'sj1-s2-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '末问。卯月占得此卦，世爻戌土，处境如何？',
    next: 'sj1-s2-110',
  },
  // 复习应答 · 三选项均 TERMINAL 各 favor+1（重答叙述内收，无 loop-back——注记 11）
  'sj1-s2-110': {
    type: 'choice',
    prompt: '（末问。卯月的戌土——）',
    options: [
      {
        text: '卯木克戌土——月建克它，休囚',
        response: { text: '「四问全中。」{{ta}}靠回椅背，看你的眼神像掌柜盘完一本干净的账，「四章的东西，一两没漏。……教你的人，勉强可以骄傲一下。」' },
        effects: { favor: 1 },
        next: 'sj1-s2-120',
      },
      {
        text: '卯木生戌土——旺相',
        response: { text: '「木生的是火。」{{ta}}抬手虚点灶膛，「灶膛那课再想一遍——卯对戌是克，休囚。重答。」你答对了。{{ta}}没再多怼——今日{{ta}}的耐心比平日长。' },
        effects: { favor: 1 },
        next: 'sj1-s2-120',
      },
      {
        text: '戌临月建——当时',
        response: { text: '「当值的是卯，不是戌。」{{ta}}摇头，语气却不重，「名目混了——回去把两本账再翻翻。今日先记：卯月的戌土，休囚。」' },
        effects: { favor: 1 },
        next: 'sj1-s2-120',
      },
    ],
  },
  'sj1-s2-120': {
    type: 'narration',
    text: '账盘完了。日头斜到案角。',
    next: 'sj1-s2-130',
  },
  'sj1-s2-130': {
    type: 'narration',
    text: '{{ta}}沉默了片刻——不是找话的沉默，是下决心的沉默。你见过{{ta}}几次这样：要把收着的东西拿出来之前，{{ta}}都先这样静一瞬。',
    next: 'sj1-s2-140',
  },
  'sj1-s2-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '把你的卦拿出来。',
    next: 'sj1-s3-header',
  },

  // ═══════════════ 第三幕 · 你的卦 ═══════════════
  'sj1-s3-header': {
    type: 'sceneHeader', scene: 3, title: '你的卦',
    time: '傍晚', ambience: '明蓍堂。',
    m1Note: '本幕功能：本命卦上桌；「不解」界碑重立；玩家的犹豫与交付。红线：全幕不指涉卦名/爻支/名分（随机卦约束）。',
    next: 'sj1-s3-010',
  },
  'sj1-s3-010': {
    type: 'narration',
    text: '你的手按在怀口上，没动。',
    next: 'sj1-s3-020',
  },
  'sj1-s3-020': {
    type: 'narration',
    text: '那张纸在你怀里贴了四章。三枚旧钱摇出来的第一卦；你自己装的支，自己查的籍贯，自己排的名分。一层一层，像给一封信写完了姓名住址——始终没拆开。',
    next: 'sj1-s3-030',
  },
  'sj1-s3-030': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}说过——不许解。',
    next: 'sj1-s3-040',
  },
  'sj1-s3-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日也不解。',
    next: 'sj1-s3-050',
  },
  'sj1-s3-050': {
    type: 'narration',
    text: '{{ta}}答得极稳。',
    next: 'sj1-s3-060',
  },
  'sj1-s3-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '解是解，排是排。你那张卦，支是你刚学装卦那阵装的，亲是你才安上没几日的——你的功夫一直在长，那张纸没跟着长。',
    next: 'sj1-s3-070',
  },
  'sj1-s3-070': {
    type: 'narration',
    text: '{{ta}}把案面清出一块空来，动作不紧不慢。',
    next: 'sj1-s3-080',
  },
  'sj1-s3-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日我替你，把它从头到尾重排一遍。用我的手，用你如今学过的所有规矩——支、宫、世应、名分，一样不落。',
    next: 'sj1-s3-090',
  },
  'sj1-s3-090': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……为什么？',
    next: 'sj1-s3-100',
  },
  'sj1-s3-100': {
    type: 'narration',
    text: '{{ta}}顿了一下。灯还没点，暮色从窗纸上渗进来，{{ta}}的脸在半明半暗里。',
    next: 'sj1-s3-110',
  },
  'sj1-s3-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '排给你看，是让你看清你手里有什么。断，还早。',
    next: 'sj1-s3-120',
  },
  'sj1-s3-120': {
    type: 'narration',
    text: '这句话{{ta}}说得很慢，像把一块界石放进土里。',
    next: 'sj1-s3-130',
  },
  'sj1-s3-130': {
    type: 'narration',
    text: '你把手伸进怀里。纸的边角已经被体温焐软了。你把它取出来，展开，抚平——推到{{ta}}面前。',
    next: 'sj1-s3-140',
  },
  'sj1-s3-140': {
    type: 'narration',
    text: '{{ta}}看了你一眼。这一眼没有话，可你读得懂：{{ta}}知道这张纸对你是什么，{{ta}}也知道你此刻把它交出来是什么。',
    next: 'sj1-s3-150',
  },
  'sj1-s3-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '好。',
    next: 'sj1-s4-header',
  },

  // ═══════════════ 第四幕 · 演卦 ═══════════════
  'sj1-s4-header': {
    type: 'sceneHeader', scene: 4, title: '演卦',
    time: '入夜', ambience: '明蓍堂，点灯。',
    m1Note: '本幕功能：演示级重排（动态 dressingUpdate 三步：支→世应→名分）；观排风味位 +1。台词零指涉——她只念动作，盘上自见。',
    next: 'sj1-s4-010',
  },
  'sj1-s4-010': {
    type: 'narration',
    text: '{{ta}}净手。焚香。三枚旧钱在香上过了一遍——虽然今夜不摇卦，{{ta}}还是把这套礼数走全了。',
    next: 'sj1-s4-020',
  },
  'sj1-s4-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你的卦，用你摇它那日的爻。我不动它一根画——动的只有笔。',
    next: 'sj1-s4-030',
  },
  'sj1-s4-030': {
    type: 'narration',
    text: '{{ta}}铺开一张新纸，把你那张旧卦纸摆在上首——像誊录抄书时，原本供在上头。',
    next: 'sj1-s4-040',
  },
  'sj1-s4-040': {
    type: 'narration',
    text: '第一步，装支。',
    next: 'sj1-s4-050',
  },
  'sj1-s4-050': {
    type: 'narration',
    text: '{{ta}}执笔，从初爻起，一枚一枚往上装。内卦三支，外卦三支——{{ta}}落笔比你快得多，可每一笔都放得很正，像把六枚钉钉进它们各自等了很久的位置。',
    next: 'sj1-s4-dr1',
  },
  'sj1-s4-dr1': {
    type: 'dressingUpdate', dynamicNatalBoard: 'branches',
    next: 'sj1-s4-060',
  },
  'sj1-s4-060': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '笔不停，',
    text: '纳甲装支，第二课。你装它的时候，查了半炷香的宫图——如今我替你装，一盏茶。不是我快，是路熟了。你如今再装一遍，也是一盏茶。',
    next: 'sj1-s4-070',
  },
  'sj1-s4-070': {
    type: 'narration',
    text: '第二步，安世应。',
    next: 'sj1-s4-080',
  },
  'sj1-s4-080': {
    type: 'narration',
    text: '{{ta}}翻了一眼你的旧纸——不是查，是核。然后两个小字落定，一个「世」，一个「应」。',
    next: 'sj1-s4-dr2',
  },
  'sj1-s4-dr2': {
    type: 'dressingUpdate', dynamicNatalBoard: 'marks',
    next: 'sj1-s4-090',
  },
  'sj1-s4-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '世是你，应是彼——第二课的后半。你的『世』坐在哪一爻，你自己早看熟了。',
    next: 'sj1-s4-100',
  },
  'sj1-s4-100': {
    type: 'narration',
    text: '第三步，安名分。',
    next: 'sj1-s4-110',
  },
  'sj1-s4-110': {
    type: 'narration',
    text: '宫五行为我，逐爻定亲。{{ta}}写这六个名分的时候慢了下来——每写一个，笔尖都在纸面上停半息，像点名的人念到熟人。',
    next: 'sj1-s4-dr3',
  },
  'sj1-s4-dr3': {
    type: 'dressingUpdate', dynamicNatalBoard: 'full',
    next: 'sj1-s4-120',
  },
  'sj1-s4-120': {
    type: 'narration',
    text: '六爻装全。{{ta}}把笔搁下，把新纸转过来，正对着你。',
    next: 'sj1-s4-130',
  },
  'sj1-s4-130': {
    type: 'dialogue', speaker: '沈疏桐', dynamicNatal: true,
    text: '你的卦：〔按玩家实际本命卦生成〕。六枚支，一对世应，六个名分——你手里有什么，如今全在这张纸上。',
    next: 'sj1-s4-140',
  },
  'sj1-s4-140': {
    type: 'narration',
    text: '灯焰照着满盘小字。你一爻一爻看过去——哪一爻是什么，你自己看，自己认，自己收。',
    next: 'sj1-s4-150',
  },
  // 观排风味 · 三选项 TERMINAL 各 favor+1
  'sj1-s4-150': {
    type: 'choice',
    prompt: '（看着看着，你忽然说不清心里是什么滋味——）',
    options: [
      {
        text: '像第一次真正看清了自己的手相',
        response: { text: '你把这话说出了口。{{ta}}没笑你。「嗯。」{{ta}}只应了一个字，「看清了，才谈得上往后。」' },
        effects: { favor: 1 },
        next: 'sj1-s5-header',
      },
      {
        text: '原来我这四章，都装在这张纸里',
        response: { text: '「反了。」{{ta}}摇头，唇角却是松的，「是这张纸，一直在等你这四章。」' },
        effects: { favor: 1 },
        next: 'sj1-s5-header',
      },
      {
        text: '说不出话，只是看',
        response: { text: '你什么也没说。{{ta}}也没催。灯焰烧了半指，{{ta}}才轻声开口：「看吧。这一眼，你等了四章——不急。」' },
        effects: { favor: 1 },
        next: 'sj1-s5-header',
      },
    ],
  },

  // ═══════════════ 第五幕 · 有人把它当回事 ═══════════════
  'sj1-s5-header': {
    type: 'sceneHeader', scene: 5, title: '有人把它当回事',
    time: '夜', ambience: '明蓍堂。',
    m1Note: '本幕功能：章核心事件 +5（「她愿意把你的卦当回事」）；收尾钩；结算。开局清盘（注记 10）。',
    next: 'sj1-s5-clear',
  },
  'sj1-s5-clear': {
    type: 'dressingUpdate', board: null, // 她把新纸拿回＝收盘（ch2/ch3 先例）
    next: 'sj1-s5-010',
  },
  'sj1-s5-010': {
    type: 'narration',
    text: '{{ta}}等你看够了，才伸手把新纸拿回去——对折，再对折，折痕压得极平。',
    next: 'sj1-s5-020',
  },
  'sj1-s5-020': {
    type: 'narration',
    text: '然后{{ta}}做了一件你没想到的事：{{ta}}把你那张旧卦纸也拿起来，两张叠在一处，齐了齐角，一起递还给你。',
    next: 'sj1-s5-030',
  },
  'sj1-s5-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '旧的是你自己的功夫，新的是我核过的账——两张都收好。',
    next: 'sj1-s5-040',
  },
  'sj1-s5-040': {
    type: 'narration',
    text: '你双手接过来。两张纸在掌心里，比一张沉。',
    next: 'sj1-s5-050',
  },
  'sj1-s5-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。',
    next: 'sj1-s5-060',
  },
  'sj1-s5-060': {
    type: 'narration',
    text: '{{ta}}忽然唤你，声音比方才低。',
    next: 'sj1-s5-070',
  },
  'sj1-s5-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '山里学卦的人不少。肯把自己的本命卦贴身揣四章、不偷解一个字的——我只见过你一个。',
    next: 'sj1-s5-080',
  },
  'sj1-s5-080': {
    type: 'narration',
    text: '{{ta}}顿了顿。灯焰在{{ta}}眼里烧成很小的一点。',
    next: 'sj1-s5-090',
  },
  'sj1-s5-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '所以今夜这一课，不是我赏你——是你挣的。',
    effects: { favor: 5 }, // 章核心事件「她把你的卦当回事」
    next: 'sj1-s5-100',
  },
  'sj1-s5-100': {
    type: 'narration',
    text: '你把两张卦纸贴身收好。它们挨着心口，一张带着你的体温，一张带着{{ta}}的笔墨。',
    next: 'sj1-s5-110',
  },
  'sj1-s5-110': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}——什么时候，才算『不早』？',
    next: 'sj1-s5-120',
  },
  'sj1-s5-120': {
    type: 'narration',
    text: '{{ta}}正收拾笔墨的手停了半息。',
    next: 'sj1-s5-130',
  },
  'sj1-s5-130': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}把香灰拨灭，夜色落满明蓍堂，',
    text: '等你会断的那天。自己的卦，自己断——那才算数。',
    next: 'sj1-s5-140',
  },
  'sj1-s5-140': {
    type: 'narration',
    text: '出门的时候，夜风正好。你怀里两张纸，脚下一条下山的路，路尽头一扇看得见的窗。',
    next: 'sj1-s5-150',
  },
  'sj1-s5-150': {
    type: 'narration',
    text: '你忽然觉得：这一卦摇出来四章了，如今才算真正握在了你手里。',
    next: 'sj1-end',
  },
  'sj1-end': {
    type: 'chapterEnd',
    title: '【私教 ·《演卦》· 终】',
    rewards: { lingli: 5 },
    hooks: [
      '「自己的卦，自己断」——远章目标锚（结局向）',
      '两张卦纸（旧的你的功夫＋新的她核过的账）——贴身收好',
    ],
    nextChapterTeaser: null, // bonus 章不推进主线，无预告
  },
  },
};

export default CHAPTER_SIJIAO1;
