// Chapter 1 《第一卦》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_1_SCRIPT_v1.md (M0-approved 2026-07-12, 3-round review converged)
// This file is a FAITHFUL transcription of the approved script into node flow.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// ── Node type reference ─────────────────────────────────────────────
// sceneHeader     { type, scene, title, time, ambience?, m1Note?, next }
// narration       { type, text | variants:{female,male}, next }
// dialogue        { type, speaker, text | variants, aside?, next }   // aside = 舞台指示
// choice          { type, prompt?, options:[{text, response?, effects?:{favor}, next}] }  // 风味选择，不计分
// scoredChoice    { type, cpId, testsKp:[], prompt, context?, options:[{key, text, verdict, basis, sourceRef:[], next}], rewards:{optimal:{...}}, onWrong }
// castInteraction { type, castId, mode:'fixed'|'random', throws?, question, perThrow:[{throwIndex, result, coinFaces, lineName, speakerLine, interleaveNode?}], saveAs?, next }
// teachMoment     { type, kpId, stage:'demo'|'guided'|'independent', masteryTo, lingli, note?, next }  // 状态事件节点，播放器静默结算
// settings        { type, fields:[], next }
// chapterEnd      { type, rewards:{lingli}, hooks:[], nextChapterTeaser }
//
// ── Template variables (renderer substitutes) ───────────────────────
// {{senior}} 师姐/师兄 · {{ta}} 她/他 · {{junior}} 师妹/师弟 · {{player}} 玩家名
// Gender variants: ONLY via `variants` field (skeleton must stay identical — PRD §6.2)
//
// ── Coin-face convention (canonical, per 卜筮正宗/增删卜易) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)
// NOTE: engine.js:56 comment is inverted vs classics — UI must follow THIS convention (M1-5).

export const CHAPTER_1 = {
  id: 'ch1',
  title: '第一卦',
  scriptVersion: 'v1.0-M0-approved-2026-07-12',
  entryNode: 'ch1-settings',

  // 剧情固定卦象：山火贲 · 初爻动 · 变艮为山（引擎实测 2026-07-12）
  fixedCase: {
    throws: [9, 8, 7, 8, 8, 7], // 初爻→上爻
    benGua: '山火贲',
    bianGua: '艮为山',
    movingLineIndex: 0,
  },

  knowledgePoints: ['KP-LY-001', 'KP-LY-002', 'KP-LY-003'],

  nodes: {
    // ═══════════════ 开局设置 ═══════════════
    'ch1-settings': {
      type: 'settings',
      fields: ['playerName', 'playerGender', 'seniorGender'],
      next: 'ch1-s1-header',
    },

    // ═══════════════ 第一幕 · 入山门 ═══════════════
    'ch1-s1-header': {
      type: 'sceneHeader', scene: 1, title: '入山门',
      time: '清晨', ambience: '太卜宗山门 → 接引殿。山雾未散。',
      next: 'ch1-s1-010',
    },
    'ch1-s1-010': {
      type: 'narration',
      text: '雾从山脚往上爬。你数过了，从山门到接引殿，一共六百级台阶——数台阶不是为了别的，只是不数点什么，你就会去想家里那件事。',
      next: 'ch1-s1-020',
    },
    'ch1-s1-020': {
      type: 'narration',
      text: '三个月前，家里出了一件事。事情本身不大，坏就坏在：所有人都解释不了。你问遍了能问的人，最后换来同一句话——',
      next: 'ch1-s1-030',
    },
    'ch1-s1-030': {
      type: 'narration',
      text: '「去太卜宗问问吧。」',
      next: 'ch1-s1-040',
    },
    'ch1-s1-040': {
      type: 'narration',
      text: '于是你来了。',
      next: 'ch1-s1-050',
    },
    'ch1-s1-050': {
      type: 'narration',
      text: '太卜宗，立宗四百余年，以卦入道。世人传言：官府断不了的案、大夫治不了的病、钦天监算不准的天时，最后都会走到这道山门前。传言七分夸张——但剩下那三分，足以让这道山门四百年香火不断。',
      next: 'ch1-s1-060',
    },
    'ch1-s1-060': {
      type: 'narration',
      text: '接引殿里很静。一名穿灰袍的弟子坐在长案后，面前摊着名册。',
      next: 'ch1-s1-070',
    },
    'ch1-s1-070': {
      type: 'dialogue', speaker: '接引弟子',
      text: '名字。',
      next: 'ch1-s1-080',
    },
    'ch1-s1-080': {
      type: 'narration',
      text: '你报上姓名。他提笔录入，头也不抬。',
      next: 'ch1-s1-090',
    },
    'ch1-s1-090': {
      type: 'dialogue', speaker: '接引弟子',
      text: '{{player}}。嗯，名册上有你。——弟子牌，收好，进出各殿凭它。门规抄本一册，回去抄一遍，三日后交。《入门须知》一册，今晚看完。',
      next: 'ch1-s1-100',
    },
    'ch1-s1-100': {
      type: 'narration',
      text: '他把三样东西推过案来，终于抬眼看了看你。',
      next: 'ch1-s1-110',
    },
    'ch1-s1-110': {
      type: 'dialogue', speaker: '接引弟子',
      text: '门规第一页第一句，我替你先念了：太卜掌三易之法——咱们这一门，是从周官太卜一脉传下来的规矩。在这里，卦不是江湖把戏。官府来求断的案子，宗门排出的卦，是能入卷宗的。',
      next: 'ch1-s1-120',
    },
    'ch1-s1-120': {
      type: 'dialogue', speaker: '接引弟子',
      text: '门中规矩，新弟子随一位内门弟子习艺半年。这一季带新人的——',
      aside: '他翻到名册末页，用笔杆敲了敲一个名字。',
      next: 'ch1-s1-130',
    },
    'ch1-s1-130': {
      type: 'dialogue', speaker: '接引弟子',
      text: '疏桐{{senior}}。喏，出门左手边，过了蓍圃就是明蓍堂，{{ta}}这个时辰多半在堂后廊亭。自己去。',
      next: 'ch1-s1-140',
    },
    'ch1-s1-140': {
      type: 'narration',
      text: '你收好三样东西，走到门口，又听见身后补了一句。',
      next: 'ch1-s1-150',
    },
    'ch1-s1-150': {
      type: 'dialogue', speaker: '接引弟子',
      text: '——提醒你一声。{{ta}}带人，半年里能把人带哭三回。',
      next: 'ch1-s1-160',
    },
    'ch1-s1-160': {
      type: 'dialogue', speaker: '接引弟子',
      text: '不过{{ta}}带出来的人，没有一个不会摇卦。',
      aside: '他顿了顿。',
      next: 'ch1-s2-header',
    },

    // ═══════════════ 第二幕 · 初见{{senior}} ═══════════════
    'ch1-s2-header': {
      type: 'sceneHeader', scene: 2, title: '初见{{senior}}',
      time: '上午', ambience: '明蓍堂后廊亭。',
      next: 'ch1-s2-010',
    },
    'ch1-s2-010': {
      type: 'narration',
      text: '廊亭三面临风，一面靠着蓍圃。亭中石案上摆着一具小香炉，一个人背对你坐着，正在给案上一盆兰花——起卦。',
      next: 'ch1-s2-020',
    },
    'ch1-s2-020': {
      type: 'narration',
      text: '三枚铜钱在{{ta}}指间转了个圈，收进袖中一只洗得发白的旧钱囊里。你还没看清{{ta}}的动作，钱囊已经收好了，只留下极轻的一声脆响。',
      next: 'ch1-s2-030',
    },
    'ch1-s2-030': {
      type: 'narration',
      variants: {
        female: '沈疏桐转过身来。眉眼很淡，像工笔画里勾坏了会重画一百遍的那种淡。她上下打量你，目光不重，但你莫名觉得自己六百级台阶白爬了——在她眼里，你大概还站在山脚。',
        male: '沈疏桐转过身来。身形清瘦，袖口磨得起了毛边，偏偏坐得比殿里的碑还直。他上下打量你，目光不重，但你莫名觉得自己六百级台阶白爬了——在他眼里，你大概还站在山脚。',
      },
      next: 'ch1-s2-040',
    },
    'ch1-s2-040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '嗯。名字我看过名册了，不用报。',
      next: 'ch1-s2-050',
    },
    'ch1-s2-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你信这个吗？',
      aside: '{{ta}}指了指石案对面。你还没坐稳，第一个问题就到了。{{ta}}朝案上的铜钱努了努下巴。',
      next: 'ch1-s2-060',
    },
    'ch1-s2-060': {
      type: 'choice',
      prompt: null, // 直接呈现三个回答
      options: [
        {
          text: '信',
          response: { speaker: '沈疏桐', text: '信得这么快？蠢。你连它是什么都不知道。' },
          next: 'ch1-s2-070',
        },
        {
          text: '不信',
          response: { speaker: '沈疏桐', text: '不信，还爬六百级台阶来拜师。你这个人不诚实——或者，闲。' },
          next: 'ch1-s2-070',
        },
        {
          text: '不知道',
          response: {
            speaker: '沈疏桐',
            text: '……诚实。不知道，是个好起点。比「信」和「不信」都好。',
            aside: '{{ta}}难得没有立刻接第二句，看了你半息。',
          },
          effects: { favor: 1 }, // 风味好感（不计分抉择）
          next: 'ch1-s2-070',
        },
      ],
    },
    'ch1-s2-070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '规矩先说清楚。我只带你半年。半年后你要还分不清阴爻阳爻——',
      aside: '{{ta}}伸出两根手指，在空中很轻地一划。',
      next: 'ch1-s2-080',
    },
    'ch1-s2-080': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '——我会亲手把你的弟子牌摘了。省得你出去丢人，还说是我带的。',
      next: 'ch1-s2-090',
    },
    'ch1-s2-090': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '今天没你的课。回去把《入门须知》看完，明天卯时，蓍圃找我。',
      aside: '风穿过廊亭。{{ta}}把那盆兰花往边上挪了挪，像是想起了什么，又补了一句。',
      next: 'ch1-s2-100',
    },
    'ch1-s2-100': {
      type: 'narration',
      text: '你退出廊亭时回头看了一眼。{{ta}}重新背对着你坐下，兰花、香炉、一动不动的背影——像一张安静的卦。',
      next: 'ch1-s2-110',
    },
    'ch1-s2-110': {
      type: 'narration',
      text: '你当时还不知道「安静的卦」是什么意思。\n\n你很快就会知道了。',
      next: 'ch1-s3-header',
    },

    // ═══════════════ 第三幕 · 失窃（转录待续：M1-2b） ═══════════════
    'ch1-s3-header': {
      type: 'sceneHeader', scene: 3, title: '失窃',
      time: '次日凌晨，天未亮', ambience: '弟子舍 → 藏经阁前。',
      next: 'ch1-s3-TODO',
    },
    'ch1-s3-TODO': {
      type: 'narration',
      text: '[TRANSCRIPTION PENDING — scenes 3-8 to be transcribed per M1-2b, following the paradigm established in scenes 1-2]',
      next: null,
    },
  },
};

export default CHAPTER_1;
