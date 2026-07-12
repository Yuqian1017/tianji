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

    // ═══════════════ 第三幕 · 失窃 ═══════════════
    'ch1-s3-header': {
      type: 'sceneHeader', scene: 3, title: '失窃',
      time: '次日凌晨，天未亮', ambience: '弟子舍 → 藏经阁前。',
      next: 'ch1-s3-010',
    },
    'ch1-s3-010': {
      type: 'narration',
      text: '钟声把你从梦里砸醒。',
      next: 'ch1-s3-020',
    },
    'ch1-s3-020': {
      type: 'narration',
      text: '三长，两短。停一息。又是三长，两短。',
      next: 'ch1-s3-030',
    },
    'ch1-s3-030': {
      type: 'narration',
      text: '弟子舍的门板接二连三地响，有人趿着鞋跑过廊下，声音发飘：「传讯钟！三长两短——藏经阁！」',
      next: 'ch1-s3-040',
    },
    'ch1-s3-040': {
      type: 'narration',
      text: '你赶到时，藏经阁前的空地上已经围了半圈人，灯笼一盏一盏亮起来，把人影投在阁楼的白墙上，晃得像皮影戏。',
      next: 'ch1-s3-050',
    },
    'ch1-s3-050': {
      type: 'narration',
      text: '阁门大开。二层「残卷格」的木栅被撬开一道口子，断茬很新。',
      next: 'ch1-s3-060',
    },
    'ch1-s3-060': {
      type: 'dialogue', speaker: '弟子甲',
      text: '丢了什么？银子？',
      aside: '压着嗓子。',
      next: 'ch1-s3-070',
    },
    'ch1-s3-070': {
      type: 'dialogue', speaker: '弟子乙',
      text: '藏经阁哪有银子……听说就丢了一册书。',
      next: 'ch1-s3-080',
    },
    'ch1-s3-080': {
      type: 'dialogue', speaker: '弟子甲',
      text: '什么书值得半夜撬栅栏？',
      next: 'ch1-s3-090',
    },
    'ch1-s3-090': {
      type: 'dialogue', speaker: '弟子乙',
      text: '怪就怪在这儿——《遗卦残谱》。半册残的，上头只有卦画，一个字都没有。搁在残卷格最左边落灰，几年没人借过了。',
      next: 'ch1-s3-100',
    },
    'ch1-s3-100': {
      type: 'dialogue', speaker: '弟子甲',
      text: '……偷这个干嘛？',
      next: 'ch1-s3-110',
    },
    'ch1-s3-110': {
      type: 'narration',
      text: '没人答得上来。人群安静了一瞬，随即嗡的一声炸开更多猜测。',
      next: 'ch1-s3-120',
    },
    'ch1-s3-120': {
      type: 'narration',
      text: '一个圆脸弟子被执法堂的人半扶半拎地带到阁前，脸白得像刚出锅的米糕——藏经阁值夜的顾小满。他手里死死攥着一张纸，攥得都出了汗印。',
      next: 'ch1-s3-130',
    },
    'ch1-s3-130': {
      type: 'dialogue', speaker: '韩长老',
      text: '顾小满。昨夜你值夜，说。',
      aside: '执法堂，声音不高，但空地上瞬间静了。',
      next: 'ch1-s3-140',
    },
    'ch1-s3-140': {
      type: 'dialogue', speaker: '顾小满',
      text: '弟、弟子三更巡到二层，栅栏还是好的！四更再上去就、就开了！弟子就看了一眼窗外——后山方向，有火光晃了一下，就一下，然后就没了！弟子发誓真的就一下——',
      next: 'ch1-s3-150',
    },
    'ch1-s3-150': {
      type: 'dialogue', speaker: '韩长老',
      text: '山门呢？',
      next: 'ch1-s3-160',
    },
    'ch1-s3-160': {
      type: 'dialogue', speaker: '执法堂弟子',
      text: '回长老，山门落锁完好，夜里无人出入。前山灯房说昨夜丢了一把柴刀，不知与此事有无干系。人证物证，都是浑的。',
      next: 'ch1-s3-170',
    },
    'ch1-s3-170': {
      type: 'narration',
      text: '浑的。你听见周围的议论声更乱了——有人说贼肯定翻后墙跑了，有人说没准还藏在阁里，有人已经开始猜是不是门里人干的。',
      next: 'ch1-s3-180',
    },
    'ch1-s3-180': {
      type: 'narration',
      text: '韩长老抬手，压下所有声音。他环视一圈，目光落在人群外侧。',
      next: 'ch1-s3-190',
    },
    'ch1-s3-190': {
      type: 'dialogue', speaker: '韩长老',
      text: '疏桐来了。',
      next: 'ch1-s3-200',
    },
    'ch1-s3-200': {
      type: 'narration',
      text: '人群让开一条缝。沈疏桐披着外袍站在那里，头发束得一丝不苟，仿佛{{ta}}不是被钟声砸起来的，是等这口钟等了半夜。',
      next: 'ch1-s3-210',
    },
    'ch1-s3-210': {
      type: 'dialogue', speaker: '韩长老',
      text: '人证物证既浑——照老规矩。疏桐，起一卦。',
      next: 'ch1-s3-220',
    },
    'ch1-s3-220': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '是。',
      next: 'ch1-s3-230',
    },
    'ch1-s3-230': {
      type: 'narration',
      text: '{{ta}}应下，目光扫过全场，最后落在——顾小满手里那张攥出汗印的纸上。',
      next: 'ch1-s3-240',
    },
    'ch1-s3-240': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '等等。小满，你手里攥的什么？',
      next: 'ch1-s3-250',
    },
    'ch1-s3-250': {
      type: 'dialogue', speaker: '顾小满',
      text: '没、没什么——',
      aside: '一哆嗦。',
      next: 'ch1-s3-260',
    },
    'ch1-s3-260': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '拿来。',
      next: 'ch1-s3-270',
    },
    'ch1-s3-270': {
      type: 'narration',
      text: '纸被展开。上面歪歪扭扭画着六道墨痕，有的连成一线，有的断成两截，墨迹还没干透。',
      next: 'ch1-s3-280',
    },
    'ch1-s3-280': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……你自己摇的？',
      next: 'ch1-s3-290',
    },
    'ch1-s3-290': {
      type: 'dialogue', speaker: '顾小满',
      text: '弟子怕、怕担干系……就想问问卦，弟子会不会……会不会背锅……',
      aside: '声若蚊蚋。',
      next: 'ch1-s3-300',
    },
    'ch1-s3-300': {
      type: 'narration',
      text: '人群里响起几声没憋住的笑。韩长老皱眉正要开口，沈疏桐却把那张纸抬了抬。',
      next: 'ch1-s3-310',
    },
    'ch1-s3-310': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '别笑。他摇得对不对另说——遇事先问卦，这个反应，比你们站在这儿干嚼舌头强。',
      next: 'ch1-s3-320',
    },
    'ch1-s3-320': {
      type: 'narration',
      text: '{{ta}}把纸铺在阁前的石案上，朝人群外招了下手。',
      next: 'ch1-s3-330',
    },
    'ch1-s3-330': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '{{player}}，过来。',
      next: 'ch1-s3-340',
    },
    'ch1-s3-340': {
      type: 'narration',
      text: '你在所有人的注视里走过去。{{ta}}把灯笼往纸上照了照。',
      next: 'ch1-s3-350',
    },
    'ch1-s3-350': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '本来你的课在明早。现在提前了。——都看着也行。今天这卦，就是新弟子的第一课。',
      next: 'ch1-s4-header',
    },
    // ═══════════════ 第四幕 · 示范：一张安静的卦 ═══════════════
    'ch1-s4-header': {
      type: 'sceneHeader', scene: 4, title: '示范：一张安静的卦',
      time: '灯笼下', ambience: '藏经阁前石案。',
      next: 'ch1-s4-010',
    },
    'ch1-s4-010': {
      type: 'narration',
      text: '六道墨痕在灯下排成一列。沈疏桐用指节从下往上敲过去。',
      next: 'ch1-s4-020',
    },
    'ch1-s4-020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '都凑近点。看清楚这六道画。',
      next: 'ch1-s4-030',
    },
    'ch1-s4-030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '连成一整条的，叫阳爻。',
      aside: '{{ta}}点了点最下面三道。',
      next: 'ch1-s4-040',
    },
    'ch1-s4-040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '断成两截的，叫阴爻。',
      aside: '又点了点上面三道。',
      next: 'ch1-s4-050',
    },
    'ch1-s4-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '一阴一阳，是这门学问里最小的两个字。天下的卦画得再花，拆到底，就这两种笔画。',
      next: 'ch1-s4-tm1',
    },
    'ch1-s4-tm1': {
      type: 'teachMoment', kpId: 'KP-LY-001', stage: 'demo', masteryTo: '见过', lingli: 1,
      note: '阴阳爻的识别（连线为阳、断线为阴）。依据《周易·系辞上》「一陰一陽之謂道」。',
      next: 'ch1-s4-060',
    },
    'ch1-s4-060': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '六道画，不是乱堆的。从下往上数——最下面这道叫初爻，然后二爻、三爻、四爻、五爻，最上面那道，叫上爻。记住：卦是从地里长出来的，不是从天上掉下来的，所以从下往上数。',
      next: 'ch1-s4-070',
    },
    'ch1-s4-070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '再看。六道画，掰成两半——下三道一组，叫内卦；上三道一组，叫外卦。三道画凑成的小卦，一共八种，就是你们听烂了的『八卦』。八卦两两一叠，才是一张完整的卦——六十四卦，都是这么叠出来的。',
      next: 'ch1-s4-080',
    },
    'ch1-s4-080': {
      type: 'dialogue', speaker: '顾小满',
      text: '那、那弟子这张……',
      aside: '小声。',
      next: 'ch1-s4-090',
    },
    'ch1-s4-090': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你这张？自己看。下三道，三条整线——有个口诀，乾三连：三道连线，是乾卦。乾为天。',
      next: 'ch1-s4-100',
    },
    'ch1-s4-100': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '上三道，三条断线——坤六断：六截短画，是坤卦。坤为地。',
      next: 'ch1-s4-110',
    },
    'ch1-s4-110': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '地在上，天在下——这张卦，叫地天泰。',
      next: 'ch1-s4-tm2',
    },
    'ch1-s4-tm2': {
      type: 'teachMoment', kpId: 'KP-LY-001', stage: 'demo', masteryTo: '见过', lingli: 0,
      note: '示范续：爻位自下而上；内卦外卦；八卦叠合成六十四卦；以「乾三连、坤六断」歌诀认卦；卦名 = 外卦 + 内卦连读。',
      next: 'ch1-s4-120',
    },
    'ch1-s4-120': {
      type: 'dialogue', speaker: '韩长老',
      text: '卦意如何？',
      next: 'ch1-s4-130',
    },
    'ch1-s4-130': {
      type: 'narration',
      text: '沈疏桐没有立刻答。{{ta}}把那张纸提起来，对着灯笼照了照，像在确认什么，然后才开口。',
      next: 'ch1-s4-140',
    },
    'ch1-s4-140': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '泰。小往大来，吉亨——这是卦辞，圣人给这张卦的批语。泰者，通也。',
      next: 'ch1-s4-150',
    },
    'ch1-s4-150': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '再看这六道爻，一道都没动——纹丝不动，是张安静的卦。安静的卦，答案也安静：东西没出山门，找得回来。',
      next: 'ch1-s4-160',
    },
    'ch1-s4-160': {
      type: 'narration',
      text: '{{ta}}把纸拍回顾小满怀里。',
      next: 'ch1-s4-170',
    },
    'ch1-s4-170': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '至于你——卦都替你把话说圆了，天地交泰，上下同心，没人找你背锅。行了，别哭丧脸了。',
      next: 'ch1-s4-180',
    },
    'ch1-s4-180': {
      type: 'narration',
      text: '顾小满捧着那张纸，眼眶一红，差点当场给{{ta}}跪下去。人群的骚动肉眼可见地平息下来——你亲眼看着一张纸、六道墨痕，把半座宗门的慌乱压了下去。',
      next: 'ch1-s4-190',
    },
    'ch1-s4-190': {
      type: 'narration',
      text: '你忍不住问了一句。',
      next: 'ch1-s4-200',
    },
    'ch1-s4-200': {
      type: 'dialogue', speaker: '{{player}}',
      text: '要是……动了呢？',
      next: 'ch1-s4-210',
    },
    'ch1-s4-210': {
      type: 'narration',
      text: '沈疏桐收拾灯笼的手停了一下。{{ta}}回头看你，灯焰在{{ta}}眼里跳了跳。',
      next: 'ch1-s4-220',
    },
    'ch1-s4-220': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '问得好。',
      next: 'ch1-s4-230',
    },
    'ch1-s4-230': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '动了，就热闹了。',
      next: 'ch1-s4-240',
    },
    'ch1-s4-240': {
      type: 'narration',
      text: '{{ta}}把灯笼塞进你手里，转身对韩长老道：',
      next: 'ch1-s4-250',
    },
    'ch1-s4-250': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '长老，小满这卦是他慌乱中乱摇的，问的也只是他自己的干系，做不得案卦。案卦另起——明蓍堂，我来。',
      next: 'ch1-s4-260',
    },
    'ch1-s4-260': {
      type: 'dialogue', speaker: '韩长老',
      text: '要几个人？',
      next: 'ch1-s4-270',
    },
    'ch1-s4-270': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '一个。',
      next: 'ch1-s4-280',
    },
    'ch1-s4-280': {
      type: 'narration',
      text: '{{ta}}袖子一拂，越过众人，径直往明蓍堂方向走。走出两步，丢下一句：',
      next: 'ch1-s4-290',
    },
    'ch1-s4-290': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '{{player}}，提灯，跟上。',
      next: 'ch1-s5-header',
    },
    // ═══════════════ 第五幕 · 你的第一卦 ═══════════════
    'ch1-s5-header': {
      type: 'sceneHeader', scene: 5, title: '你的第一卦',
      time: '寅时，四下无人', ambience: '明蓍堂内。一炉香，一方案，案上一只铜盘。',
      m1Note: '本章核心演出。剧情固定卦象：山火贲，初爻动，变艮为山。掷序（初→上）[9,8,7,8,8,7]（引擎已验证）。',
      next: 'ch1-s5-010',
    },
    'ch1-s5-010': {
      type: 'narration',
      text: '明蓍堂比你想的小，也比你想的静。一炉香，一方案，案上一只铜盘。沈疏桐从袖中取出旧钱囊，倒出三枚铜钱在掌心——就是廊亭里那三枚，边缘磨得发亮。',
      next: 'ch1-s5-020',
    },
    'ch1-s5-020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '案卦，本该我摇。',
      next: 'ch1-s5-030',
    },
    'ch1-s5-030': {
      type: 'narration',
      text: '{{ta}}却把三枚钱放在了你面前的案上。',
      next: 'ch1-s5-040',
    },
    'ch1-s5-040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '但这一卦，我要你摇。',
      next: 'ch1-s5-050',
    },
    'ch1-s5-050': {
      type: 'dialogue', speaker: '{{player}}',
      text: '我？我昨天才入门——',
      next: 'ch1-s5-060',
    },
    'ch1-s5-060': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '第一，正因为你昨天才入门。全宗上下，就你和这桩案子最没瓜葛，你的手最干净。',
      next: 'ch1-s5-070',
    },
    'ch1-s5-070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '第二——',
      aside: '{{ta}}看着你，第一次用那种不带刺的语气说话。',
      next: 'ch1-s5-080',
    },
    'ch1-s5-080': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你总要摇你人生第一卦的。今天这卦，比你以后自己摇的一万张都金贵：它有答案，答案就在这几天里，对错立见。对错立见的卦，才教得会人。',
      next: 'ch1-s5-090',
    },
    'ch1-s5-090': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '先净手。',
      next: 'ch1-s5-100',
    },
    'ch1-s5-100': {
      type: 'narration',
      text: '{{ta}}示意案边的铜盆。你依言洗手、拭干。{{ta}}把三枚钱在香炉上方过了一遍。',
      next: 'ch1-s5-110',
    },
    'ch1-s5-110': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '钱过香，不是做样子给神佛看，是做给你自己看——从这一息起，杂念留在炉子那头。心不诚，卦不应。不是卦挑剔，是你自己乱：你心里装着八件事，摇出来的就是八件事搅成的一团浆糊，谁都读不出。',
      next: 'ch1-s5-120',
    },
    'ch1-s5-120': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '一事一卦。今夜只问一件事——想好这件事，说出来。',
      next: 'ch1-s5-130',
    },
    'ch1-s5-130': {
      type: 'dialogue', speaker: '{{player}}',
      text: '……贼，往哪去了？',
      next: 'ch1-s5-140',
    },
    'ch1-s5-140': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '好。跟我念祝词。',
      next: 'ch1-s5-150',
    },
    'ch1-s5-150': {
      type: 'narration',
      text: '{{ta}}屈指在案上轻叩，一字一句：',
      next: 'ch1-s5-160',
    },
    'ch1-s5-160': {
      type: 'dialogue', speaker: '沈疏桐 / {{player}}',
      text: '天何言哉，叩之即应。弟子{{player}}，为宗门失窃事关心，不知休咎，罔释厥疑。惟神惟灵，若可若否，望垂昭报。',
      next: 'ch1-s5-170',
    },
    'ch1-s5-170': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '看好，只示范这一次。',
      next: 'ch1-s5-180',
    },
    'ch1-s5-180': {
      type: 'narration',
      text: '{{ta}}拈起三枚钱合在双掌中，摇——腕子很稳，钱在掌心里响得又密又匀，像一阵急雨过檐。然后双掌一倾，三枚钱落进铜盘，转了两转，停住。',
      next: 'ch1-s5-190',
    },
    'ch1-s5-190': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '看结果先不急。先记规矩：有字的那面叫『字』，没字的那面叫『背』。三枚钱一齐掷，看背面有几个——',
      aside: '{{ta}}竖起手指。',
      next: 'ch1-s5-200',
    },
    'ch1-s5-200': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '一个背，叫『单』，是阳爻，画一条整线。两个背，叫『拆』，是阴爻，画两截短线。这两种，是安静的爻。',
      next: 'ch1-s5-210',
    },
    'ch1-s5-210': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '三个背，叫『重』。三个字，叫『交』。这两种——',
      aside: '{{ta}}顿了顿，把「热闹」两个字咽了回去，换了个说法。',
      next: 'ch1-s5-220',
    },
    'ch1-s5-220': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '——记下就行，出来了再说。有个口诀：两背由来拆，双眉本是单，浑眉交定位，总背是重安。眉，就是钱上的字纹。背几个，比什么都要紧。',
      next: 'ch1-s5-tm1',
    },
    'ch1-s5-tm1': {
      type: 'teachMoment', kpId: 'KP-LY-002', stage: 'demo', masteryTo: '见过', lingli: 1,
      note: '三钱掷法手法演示；字/背约定；单、拆、重、交四种结果（此处只教识别）。依据《卜筮正宗·以钱代蓍法》口诀原文照录。M1 注意：以背记数（三背=重=老阳），勿沿用引擎旧注释「字=3」口径。',
      next: 'ch1-s5-230',
    },
    'ch1-s5-230': {
      type: 'narration',
      text: '{{ta}}把自己那一掷从铜盘里抹掉，三枚钱重新推到你面前。',
      next: 'ch1-s5-240',
    },
    'ch1-s5-240': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '我这掷不算数，案卦从你第一掷起。共掷六次，一次成一爻，从初爻往上装——卦是从地里长出来的，忘了？',
      next: 'ch1-s5-250',
    },
    'ch1-s5-250': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '摇。',
      next: 'ch1-s5-260',
    },
    'ch1-s5-260': {
      type: 'narration',
      text: '三枚钱在你掌心里响。你想着那道被撬开的木栅，想着后山那一闪的火光——掌心一倾。钱落盘。三枚，齐刷刷背面朝天。',
      next: 'ch1-s5-cast',
    },
    // 破案卦：固定卦象 山火贲→艮为山，动初爻。掷序 [9,8,7,8,8,7]。
    // perThrow[2].interleaveNode 指向 ch1-s5-270：M1 于第 3 掷后（内卦成）渲染
    // 离中虚引导问答 + KP-001 guided + 再祝链，再续第 4-6 掷。next 为该链的可达性锚
    // （渲染契约：interleave 链在掷 3 后消费一次，不经 next 重复渲染）。
    'ch1-s5-cast': {
      type: 'castInteraction', castId: 'ch1-anjian-gua', mode: 'fixed',
      throws: [9, 8, 7, 8, 8, 7],
      question: '贼，往哪去了？',
      perThrow: [
        {
          throwIndex: 1, result: '重', coinFaces: '三背', lineName: '初爻',
          speakerLine: '……第一掷就是重。三个背。（{{ta}}提笔，在卦纸最下端画了一条整线，又在线旁点了一个圈。）重是阳爻，但先在旁边记个圈——它跟寻常阳爻不一样。哪里不一样，六掷完了我告诉你。接着摇。',
        },
        {
          throwIndex: 2, result: '拆', coinFaces: '两背一字', lineName: '二爻',
          speakerLine: '两个背——拆。阴爻，安静。（笔下两截短线。）',
        },
        {
          throwIndex: 3, result: '单', coinFaces: '一背两字', lineName: '三爻',
          speakerLine: '一个背——单。阳爻，也安静。（一条整线。）内卦成了。你自己看：从下往上，阳、阴、阳——',
          interleaveNode: 'ch1-s5-270',
        },
        {
          throwIndex: 4, result: '拆', coinFaces: '两背一字', lineName: '四爻',
          speakerLine: '拆。',
        },
        {
          throwIndex: 5, result: '拆', coinFaces: '两背一字', lineName: '五爻',
          speakerLine: '又是拆。最后一掷——稳住，别想赢，也别想输。',
        },
        {
          throwIndex: 6, result: '单', coinFaces: '一背两字', lineName: '上爻',
          speakerLine: '（最后三枚钱停稳。一个背，两个字。）单。',
        },
      ],
      next: 'ch1-s5-270',
    },
    'ch1-s5-270': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '中间空的。口诀里哪一个？',
      aside: '{{ta}}把笔递给你。',
      next: 'ch1-s5-280',
    },
    'ch1-s5-280': {
      type: 'choice',
      prompt: null, // 引导应用 · KP-LY-001（第一问，内卦离）；答错不惩罚、不计 wrong
      options: [
        {
          text: '离中虚',
          response: { speaker: '沈疏桐', text: '对。离中虚——中间虚的是离卦。离为火。' },
          effects: { favor: 1 },
          next: 'ch1-s5-tm2',
        },
        {
          text: '坎中满',
          response: { speaker: '沈疏桐', text: '反了。中间满的才是坎。你这张中间是断开的、虚的——离中虚。离为火。记反一次可以，记反两次，抄口诀二十遍。' },
          next: 'ch1-s5-tm2',
        },
        {
          text: '乾三连',
          response: { speaker: '沈疏桐', text: '乾三连是三条整线。你这张中间断着呢，睁眼。——离中虚，离为火。' },
          next: 'ch1-s5-tm2',
        },
      ],
    },
    'ch1-s5-tm2': {
      type: 'teachMoment', kpId: 'KP-LY-001', stage: 'guided', masteryTo: '用过', lingli: 3,
      note: '玩家在提示（口诀）下亲手辨认三画卦。依据八卦象例歌诀（卜筮正宗／增删卜易互证）。',
      next: 'ch1-s5-290',
    },
    'ch1-s5-290': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '内卦定了，还差外卦。仪轨里这时候要再祝一句——念：内象已成，吉凶未判，再求外象三爻，以成一卦，以决忧疑。',
      aside: '你跟着念了。三枚钱回到掌心。',
      next: 'ch1-s5-295',
    },
    'ch1-s5-295': {
      type: 'narration',
      text: '{{ta}}笔尖一收。卦纸上，六道爻从下往上排齐：整线（旁边一个圈）、断线、整线；断线、断线、整线。',
      next: 'ch1-s5-tm3',
    },
    'ch1-s5-tm3': {
      type: 'teachMoment', kpId: 'KP-LY-002', stage: 'guided', masteryTo: '用过', lingli: 3,
      note: '玩家在{{senior}}逐掷口令与仪轨提示下，亲手完成六掷成卦全流程（合掌摇钱、掷盘、按背数报爻、自下而上装爻、中途再祝）。依据《增删卜易·占卦法》《卜筮正宗·以钱代蓍法》。',
      next: 'ch1-s5-300',
    },
    'ch1-s5-300': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '外卦你来认。从下往上：阴、阴、阳——上头一道横盖住，底下两道断着，像不像一只倒扣的碗？',
      next: 'ch1-s5-310',
    },
    'ch1-s5-310': {
      type: 'choice',
      prompt: null, // 引导应用 · KP-LY-001（第二问，外卦艮）；答错不惩罚、不计 wrong
      options: [
        {
          text: '艮覆碗',
          response: { speaker: '沈疏桐', text: '艮覆碗。艮为山。……行，没白教。' },
          effects: { favor: 1 },
          next: 'ch1-s5-320',
        },
        {
          text: '兑上缺',
          response: { speaker: '沈疏桐', text: '兑上缺是顶上缺一口。你这张顶上是整的，缺口在底下。倒扣的碗——艮覆碗，艮为山。' },
          next: 'ch1-s5-320',
        },
      ],
    },
    'ch1-s5-320': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '装卦：山在上，火在下——山下有火。这卦名叫贲。',
      next: 'ch1-s5-330',
    },
    'ch1-s5-330': {
      type: 'dialogue', speaker: '{{player}}',
      text: '……pēn？',
      m1Note: '§0 注 6：游戏内文字禁直显拼音字母。M1 用注音气泡/语音/{{senior}}口头描述（「贲，音同『必』」）演出读音纠正，罗马字母在古风界面出戏。',
      next: 'ch1-s5-340',
    },
    'ch1-s5-340': {
      type: 'dialogue', speaker: '沈疏桐',
      text: 'bì。',
      aside: '{{ta}}用一种「我就知道」的眼神看着你，在卦纸上把这个字写了一遍。',
      m1Note: '§0 注 6：同上，读音以注音气泡/语音呈现，勿直显罗马字母。',
      next: 'ch1-s5-350',
    },
    'ch1-s5-350': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '贲者，饰也，文饰的贲。念错一次记住一辈子，也算值。——山火贲，这是你人生第一卦的名字。',
      next: 'ch1-s5-360',
    },
    'ch1-s5-360': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '现在——说说这个圈。',
      next: 'ch1-s5-370',
    },
    'ch1-s5-370': {
      type: 'narration',
      text: '{{ta}}的笔尖点在初爻旁边那个圈上，声音沉下来一度。',
      next: 'ch1-s5-380',
    },
    'ch1-s5-380': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '小满那张卦，六爻安安静静；你这张不是。重和交，是会动的爻——动爻。三个背是重，阳动；三个字是交，阴动。',
      next: 'ch1-s5-390',
    },
    'ch1-s5-390': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '动是什么意思？',
      next: 'ch1-s5-400',
    },
    'ch1-s5-400': {
      type: 'narration',
      text: '{{ta}}翻过一张新纸，把贲卦重新画了一遍，然后在初爻那条整线上，笔锋一转——把它改成了两截。',
      next: 'ch1-s5-410',
    },
    'ch1-s5-410': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '六爻不动则不变，动则必变。重是动透了的阳，物极必反，它要变成阴；交是动透了的阴，它要变成阳。一道爻一变，整张卦就跟着变——本来那张，叫本卦；变出来那张，叫变卦。',
      next: 'ch1-s5-tm4',
    },
    'ch1-s5-tm4': {
      type: 'teachMoment', kpId: 'KP-LY-003', stage: 'demo', masteryTo: '见过', lingli: 1,
      note: '动爻概念（重/交为动）；「动则必变」；阳动变阴、阴动变阳；本卦/变卦。依据《增删卜易·动变章第七》「六爻不動則不變，動則必變」原文照录。',
      next: 'ch1-s5-420',
    },
    'ch1-s5-420': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你的动爻在初爻，初爻在内卦。来——',
      next: 'ch1-s5-430',
    },
    'ch1-s5-430': {
      type: 'narration',
      text: '{{ta}}把改过的那张纸推到你面前。',
      next: 'ch1-s5-440',
    },
    'ch1-s5-440': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '初爻的阳一变阴，你的内卦，从离，变成了什么？从下往上再认一遍：阴、阴、阳。',
      next: 'ch1-s5-450',
    },
    'ch1-s5-450': {
      type: 'choice',
      prompt: null, // 引导应用 · KP-LY-003（初爻动，离变艮）；答错不惩罚、不计 wrong
      options: [
        {
          text: '艮——跟外卦一样了',
          response: { speaker: '沈疏桐', text: '不错。离变艮。' },
          effects: { favor: 1 },
          next: 'ch1-s5-460',
        },
        {
          text: '还是离',
          response: { speaker: '沈疏桐', text: '初爻都改了你跟我说没变？看纸。阴、阴、阳，倒扣的碗——是艮。' },
          next: 'ch1-s5-460',
        },
        {
          text: '坤',
          response: { speaker: '沈疏桐', text: '坤六断是六截全断。你顶上那道还整整齐齐盖着呢。——是艮。' },
          next: 'ch1-s5-460',
        },
      ],
    },
    'ch1-s5-460': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '内卦变艮，外卦本来就是艮。山上，又是山——',
      next: 'ch1-s5-470',
    },
    'ch1-s5-470': {
      type: 'narration',
      text: '{{ta}}提笔在变卦旁写下三个字。',
      next: 'ch1-s5-480',
    },
    'ch1-s5-480': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '艮为山。你的本卦是山火贲，动初爻，变卦，艮为山。',
      next: 'ch1-s5-tm5',
    },
    'ch1-s5-tm5': {
      type: 'teachMoment', kpId: 'KP-LY-003', stage: 'guided', masteryTo: '用过', lingli: 3,
      note: '玩家在提示下亲手完成「动爻翻转 → 推出变卦」的完整推理。依据《增删卜易·动变章第七》。',
      next: 'ch1-s5-490',
    },
    'ch1-s5-490': {
      type: 'narration',
      text: '堂内安静下来。香烧过半。沈疏桐盯着那两张卦纸看了很久——比{{ta}}解泰卦时看得久得多。',
      next: 'ch1-s5-500',
    },
    'ch1-s5-500': {
      type: 'dialogue', speaker: '{{player}}',
      text: '{{senior}}……卦怎么说？',
      next: 'ch1-s5-510',
    },
    'ch1-s5-510': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '卦说完了。',
      next: 'ch1-s5-520',
    },
    'ch1-s5-520': {
      type: 'narration',
      text: '{{ta}}把两张纸并排推到你面前，本卦在左，变卦在右。',
      next: 'ch1-s5-530',
    },
    'ch1-s5-530': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '贲的卦辞：亨，小利有攸往——往，是『前往』的往。往哪儿？卦辞没说。但你的卦替它说了——',
      next: 'ch1-s5-540',
    },
    'ch1-s5-540': {
      type: 'narration',
      text: '{{ta}}的指尖从左边那张，慢慢移到右边那张。',
      next: 'ch1-s5-550',
    },
    'ch1-s5-550': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '本卦，是事情此刻的模样；动爻一变，变卦，就是事情要去的方向。',
      next: 'ch1-s5-560',
    },
    'ch1-s5-560': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你的卦，动出来一座山。',
      next: 'ch1-s5-570',
    },
    'ch1-s5-570': {
      type: 'narration',
      text: '{{ta}}忽然收了手，往椅背一靠，抱起手臂——又变回了廊亭里那个人。',
      next: 'ch1-s5-580',
    },
    'ch1-s5-580': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '韩长老带着人在外头等信儿呢。人手只够先搜一路。——贼往哪去了，{{junior}}？你摇的卦，你说。',
      next: 'ch1-s6-header',
    },

    // ═══════════════ 第六幕 · 抉择：追向何方 ═══════════════
    'ch1-s6-header': {
      type: 'sceneHeader', scene: 6, title: '抉择：追向何方',
      time: '明蓍堂外', ambience: '韩长老与两名执法堂弟子候在阶下，火把猎猎。',
      m1Note: '计分抉择点 CP-01（本章主计分点）——KP-LY-003 独立应用。无提示，{{senior}}全程沉默。',
      next: 'ch1-s6-010',
    },
    'ch1-s6-010': {
      type: 'narration',
      text: '你捧着两张卦纸走出明蓍堂。夜风一激，你才发现自己手心全是汗。',
      next: 'ch1-s6-020',
    },
    'ch1-s6-020': {
      type: 'dialogue', speaker: '韩长老',
      text: '卦成了？',
      next: 'ch1-s6-030',
    },
    'ch1-s6-030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '成了。',
      next: 'ch1-s6-040',
    },
    'ch1-s6-040': {
      type: 'dialogue', speaker: '韩长老',
      text: '怎么讲？',
      next: 'ch1-s6-050',
    },
    'ch1-s6-050': {
      type: 'narration',
      text: '沈疏桐没有答。{{ta}}侧过身，让出你和韩长老之间的路，然后——抱起了手臂。',
      next: 'ch1-s6-060',
    },
    'ch1-s6-060': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '这卦是{{player}}摇的。问卦人讲卦，规矩。',
      next: 'ch1-s6-070',
    },
    'ch1-s6-070': {
      type: 'narration',
      text: '韩长老的目光落到你脸上。火把的光里，那目光沉得像秤砣。',
      next: 'ch1-s6-080',
    },
    'ch1-s6-080': {
      type: 'dialogue', speaker: '韩长老',
      text: '讲。人手只够先搜一路——贼往哪去了？',
      next: 'ch1-s6-cp01',
    },
    'ch1-s6-cp01': {
      type: 'scoredChoice', cpId: 'CH1-CP-01', testsKp: ['KP-LY-003'],
      prompt: '凭卦象决定追查方向（本章主计分点）',
      context: '（你手里：本卦「山火贲」——山下有火；初爻旁一个圈；变卦「艮为山」——山，又是山。）',
      options: [
        {
          key: 'A',
          text: '本卦山下有火，动爻一变，变出艮为山——火隐入山。贼在后山，往深处搜。',
          verdict: 'optimal',
          basis: '初爻老阳发动，动则必变：内卦离化艮，与外卦艮成重山之象。断的核心是「以动变取向」——本卦为事之现状，动而之变卦为事之所往。艮为山，指向后山深处。',
          sourceRef: [
            '《增删卜易·卷之一·动变章第七》：「六爻不動則不變，動則必變」（ctext wiki chapter=950329）',
            '《卜筮正宗·卷一·以钱代蓍法》：「重交之爻謂之發動……凡動爻有變，重變拆，交變單」（ctext wiki chapter=889452）',
            '《周易·说卦》[17]：「艮為山」（ctext 说卦）',
          ],
          next: 'ch1-s6-a010',
        },
        {
          key: 'B',
          text: '卦是山火贲，山下有火——前山灯房昨夜丢了柴刀，灯房有火。搜灯房。',
          verdict: 'suboptimal',
          basis: '认出了本卦之象（离为火），但无视动爻——只读了卦的一半。动爻既发，不看变卦，是「见静不见动」。',
          sourceRef: [
            '《增删卜易·卷之一·动变章第七》：「動則必變」——动而不取变，即为失断',
          ],
          next: 'ch1-s6-b010',
        },
        {
          key: 'C',
          text: '卦辞说『小利有攸往』——利于前往，贼走不远。封死山门，守株待兔。',
          verdict: 'wrong',
          basis: '断章取义卦辞且解反——「利有攸往」利在「往」（主动前行），非「守」。且全然未用本章所学（动爻、变卦均未触及）。',
          sourceRef: [
            '《周易·贲》卦辞：「亨。小利有攸往」（wikisource 快照 pageid 12673）',
          ],
          next: 'ch1-s6-c010',
        },
      ],
      rewards: {
        optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-003 → 掌握', unlock: '山径先行线（第七幕高光段）' },
        suboptimal: { plot: '灯房扑空线（绕行半时辰后汇合）', mastery: 'KP-LY-003 标记待复习' },
      },
      onWrong: '守门空等线：执法堂自行搜山，玩家错过追踪段前半，KP-LY-003 标记待复习。永不锁主线，第七幕岔路口三线汇合。',
    },

    // ── CP-01 选 A（optimal）：山径先行线 → 第七幕（含驴车段专属高光）──
    'ch1-s6-a010': {
      type: 'narration',
      text: '沈疏桐抱着的手臂松开了。{{ta}}没说话，但你听见{{ta}}从鼻子里轻轻「嗯」了一声——比廊亭里那声「嗯」高了半个调。',
      next: 'ch1-s6-a020',
    },
    'ch1-s6-a020': {
      type: 'dialogue', speaker: '韩长老',
      text: '……跟{{ta}}摇出来的卦一个讲法。好。',
      aside: '看了沈疏桐一眼。',
      next: 'ch1-s6-a030',
    },
    'ch1-s6-a030': {
      type: 'narration',
      text: '他反手一挥。',
      next: 'ch1-s6-a040',
    },
    'ch1-s6-a040': {
      type: 'dialogue', speaker: '韩长老',
      text: '都有了——后山，走！',
      next: 'ch1-s7-header',
    },

    // ── CP-01 选 B（suboptimal）：灯房扑空线 + 复盘补讲 → 岔路口汇合 ──
    'ch1-s6-b010': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……灯房。',
      aside: '闭了闭眼。',
      next: 'ch1-s6-b020',
    },
    'ch1-s6-b020': {
      type: 'narration',
      text: '搜了半个时辰，灯房里只有一个吓傻的管灯杂役和半屋子灯油。折返时，顾小满连滚带爬地跑来：后山猎户看见山径上有人影。',
      next: 'ch1-s6-b030',
    },
    'ch1-s6-b030': {
      type: 'narration',
      text: '赶路的间隙，沈疏桐落后半步，与你并肩。',
      next: 'ch1-s6-b040',
    },
    'ch1-s6-b040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '回去把今晚的卦纸抄十遍。你只读了卦的上半句——山下有火，是本卦，是『此刻』。可你的初爻动了。动了的卦，答案不在本卦里，在变卦里。记住这一晚：见动，必看变。',
      aside: '压低声音。',
      m1Note: 'KP-LY-003 标记待复习（掉级）。',
      next: 'ch1-s7-fork',
    },

    // ── CP-01 选 C（wrong）：守门空等线 + 复盘补讲 → 岔路口汇合 ──
    'ch1-s6-c010': {
      type: 'narration',
      text: '山门守到后半夜，露水打透了三层衣裳，一个人影都没有——贼根本没打算出山门。执法堂等不了，自行拔队搜山。你们赶到后山时，山径上已经全是火把。',
      next: 'ch1-s6-c020',
    },
    'ch1-s6-c020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '知道错哪了吗？『利有攸往』，利在往，卦催着你动身，你偏拿它当门闩使。——还有，你摇出来的动爻、你亲手推出来的变卦，一个字都没用上。卦替你把路画好了，你没看它。',
      aside: '走在你侧后方，声音听不出情绪。',
      m1Note: 'KP-LY-003 标记待复习（掉级）。',
      next: 'ch1-s7-fork',
    },

    // ═══════════════ 第七幕 · 山径 ═══════════════
    // 【M1 路由】s7-header→驴车段（a010-a070）为 CP-01 选 A 线专属高光；
    // B/C 线自 ch1-s7-fork（山径在一片乱石坡前分了岔）汇入。岔路口即三线汇合点。
    'ch1-s7-header': {
      type: 'sceneHeader', scene: 7, title: '山径',
      time: '寅正，月沉雾起', ambience: '后山山径。',
      m1Note: '计分抉择点 CP-02——KP-LY-001 独立应用（认卦形）。开头至驴车段为 CP-01 选 A 线专属；B/C 线跳过，自 ch1-s7-fork 汇入。',
      next: 'ch1-s7-a010',
    },
    'ch1-s7-a010': {
      type: 'narration',
      text: '后山的路比前山野得多。石阶只铺到半山，再往上是踩出来的土径，两侧茅草没膝，露水凉得咬人。',
      next: 'ch1-s7-a020',
    },
    'ch1-s7-a020': {
      type: 'narration',
      text: '转过一座荒废的小神祠时，走在最前的执法堂弟子低喝一声：「长老！这儿——」',
      next: 'ch1-s7-a030',
    },
    'ch1-s7-a030': {
      type: 'narration',
      text: '祠后的草窠里，歪着一辆驴车。驴不见了，车板上一捆柴火原封没动，绳结都没解开。',
      next: 'ch1-s7-a040',
    },
    'ch1-s7-a040': {
      type: 'dialogue', speaker: '执法堂弟子',
      text: '运柴的车？这时辰，柴没卸，人跑了……',
      next: 'ch1-s7-a050',
    },
    'ch1-s7-a050': {
      type: 'dialogue', speaker: '韩长老',
      text: '记下。继续走。',
      next: 'ch1-s7-a060',
    },
    'ch1-s7-a060': {
      type: 'narration',
      text: '队伍继续上行。沈疏桐经过驴车时脚步慢了半拍，借着火把光多看了一眼——你注意到{{ta}}看的不是车，是车辕上那道往山径延伸的、很浅的鞋印。',
      next: 'ch1-s7-a070',
    },
    'ch1-s7-a070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '记住这辆车。回头你会想起它的。',
      aside: '只对你，声音很轻。',
      m1Note: '伏笔：贲卦初九爻辞「賁其趾，舍車而徒」。只埋不点，第八幕由{{senior}}亲口回收。',
      next: 'ch1-s7-fork',
    },

    // ── 三线汇合点：山径岔路口（CP-02 之前）──
    'ch1-s7-fork': {
      type: 'narration',
      text: '山径在一片乱石坡前分了岔。',
      next: 'ch1-s7-fork-010',
    },
    'ch1-s7-fork-010': {
      type: 'narration',
      text: '左右两条小路，各立着一块半人高的旧界石，石面风化得厉害，刻痕里积着青苔。左边那块，刻着三道横痕：断、整、断；右边那块，也是三道：断、断、整——都是从下往上排的旧式刻法。',
      next: 'ch1-s7-fork-020',
    },
    'ch1-s7-fork-020': {
      type: 'dialogue', speaker: '执法堂弟子',
      text: '这是……前辈们留的方位记？刻的什么字？',
      aside: '举着火把凑近，挠头。',
      next: 'ch1-s7-fork-030',
    },
    'ch1-s7-fork-030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '不是字。是卦。',
      next: 'ch1-s7-fork-040',
    },
    'ch1-s7-fork-040': {
      type: 'narration',
      text: '{{ta}}把灯笼往两块石头中间一递——递到了你手里。然后{{ta}}退开一步，抱臂。',
      next: 'ch1-s7-fork-050',
    },
    'ch1-s7-fork-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '宗门旧规，山中路牌以卦代字。左通坎泽，右通艮岭——哦不对，',
      aside: '{{ta}}唇角一挑。',
      next: 'ch1-s7-fork-060',
    },
    'ch1-s7-fork-060': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '我说反了吗？没说反吗？——自己认。贼既然进了山，卦既然指了山，艮岭石窟是唯一能藏人的地方。哪条路是艮？我不提示。',
      next: 'ch1-s7-cp02',
    },
    'ch1-s7-cp02': {
      type: 'scoredChoice', cpId: 'CH1-CP-02', testsKp: ['KP-LY-001'],
      prompt: '凭三画卦刻痕辨认通往艮岭的岔路',
      context: '（左石刻痕，从下往上：断、整、断。右石刻痕，从下往上：断、断、整。）',
      options: [
        {
          key: 'A',
          text: '右边——两道断的在下，一道整的盖在最上，倒扣的碗。艮覆碗，走右边。',
          verdict: 'optimal',
          basis: '自下而上读爻：断（阴）、断（阴）、整（阳），上实下虚，即「艮覆碗」之形，艮为山。左石为坎（中满，阴阳阴），通坎泽（水潭）。',
          sourceRef: [
            '《卜筮正宗·卷一·八卦象例》：「艮覆碗……坎中滿」（ctext wiki chapter=889452）',
            '《增删卜易·卷之一·卦象图第二》：「艮覆碗，☶，初爻、二爻俱是拆，三爻單，為艮卦」（ctext wiki chapter=950329）',
            '《周易·说卦》[17]：「艮為山，為徑路」（ctext 说卦）',
          ],
          next: 'ch1-s7-cp02a010',
        },
        {
          key: 'B',
          text: '左边——中间一道整的，这就是艮。走左边。',
          verdict: 'wrong',
          basis: '认错卦形：中满（阴阳阴）为坎，坎为水，通往水潭。混淆「坎中满」与「艮覆碗」。',
          sourceRef: [
            '《增删卜易·卷之一·卦象图第二》：「坎中滿，☵，初爻拆、二爻單、三爻拆，為坎卦」',
          ],
          next: 'ch1-s7-cp02b010',
        },
        {
          key: 'C',
          text: '刻痕太旧了认不清。人分两队，两条都走。',
          verdict: 'suboptimal',
          basis: '未应用所学（刻痕信息充分可辨），以人力冗余回避判断。剧情层面：深夜分队入山，执法堂人手更薄，为下策。',
          sourceRef: [],
          next: 'ch1-s7-cp02c010',
        },
      ],
      rewards: {
        optimal: { lingli: 5, favor: 1, mastery: 'KP-LY-001 → 掌握', unlock: '石窟先至·抓捕高光段' },
        suboptimal: { plot: '分队线：玩家队先到石窟但人手不足，抓捕狼狈化（喜剧向），高光减半' },
      },
      onWrong: '水潭空手线：绕回时执法堂已围石窟，玩家旁观抓捕。KP-LY-001 标记待复习。三线于第八幕石窟前汇合。',
    },

    // ── CP-02 选 A（optimal）：石窟先至·抓捕高光段 → 第八幕石窟前 ──
    'ch1-s7-cp02a010': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……嗯。',
      next: 'ch1-s7-cp02a020',
    },
    'ch1-s7-cp02a020': {
      type: 'narration',
      text: '{{ta}}从你手里把灯笼拿回去，率先踏上右边那条路。走了两步，你听见{{ta}}几不可闻地补了半句：',
      next: 'ch1-s7-cp02a030',
    },
    'ch1-s7-cp02a030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '教一遍就会认——不算太笨。',
      next: 'ch1-s7-cp02a040',
    },
    'ch1-s7-cp02a040': {
      type: 'narration',
      text: '右径愈走愈陡，尽头一带乱石，黑黢黢地卧着几个石窟的洞口。最边上那个洞口——透出一星极弱的火光。',
      next: 'ch1-s7-cp02a050',
    },
    'ch1-s7-cp02a050': {
      type: 'narration',
      text: '后面的事快得像一阵风：韩长老打了个手势，火把两翼包抄；洞里的人影蹿出来就往下坡跑；沈疏桐一伸手，灯笼杆横里一别——那人影结结实实绊了个狗啃泥；你几乎是凭本能扑上去压住了他，被他挣得满脸是泥，直到执法堂弟子一拥而上。',
      next: 'ch1-s7-cp02a060',
    },
    'ch1-s7-cp02a060': {
      type: 'narration',
      text: '沈疏桐提着灯笼走过来，居高临下看了看被按在地上的人，又看了看同样满脸是泥的你。',
      next: 'ch1-s7-cp02a070',
    },
    'ch1-s7-cp02a070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……抓贼的姿势，回头也得练。',
      next: 'ch1-s7-cp02a080',
    },
    'ch1-s7-cp02a080': {
      type: 'narration',
      text: '但{{ta}}把你从地上拉起来的手，比{{ta}}的话暖得多。',
      next: 'ch1-s8-header',
    },

    // ── CP-02 选 B（wrong）：水潭空手线 + 补讲 → 第八幕石窟前 ──
    'ch1-s7-cp02b010': {
      type: 'narration',
      text: '左径走到头，是一汪黑沉沉的山潭。潭边水汽白茫茫一片，别说人，连只夜鹭都没有。',
      next: 'ch1-s7-cp02b020',
    },
    'ch1-s7-cp02b020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '坎，中满。中间那道整线是坎——坎为水。所以你现在站在水边上。',
      aside: '看着潭水，长长吐出一口气。',
      next: 'ch1-s7-cp02b030',
    },
    'ch1-s7-cp02b030': {
      type: 'narration',
      text: '{{ta}}把灯笼调了个头。',
      next: 'ch1-s7-cp02b040',
    },
    'ch1-s7-cp02b040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '艮覆碗：两道断的在下，一道整的扣在顶上。回头你把八个卦形给我画一百遍。——走，往回赶，别让执法堂等咱们。',
      m1Note: 'KP-LY-001 标记待复习（掉级）。',
      next: 'ch1-s7-cp02b050',
    },
    'ch1-s7-cp02b050': {
      type: 'narration',
      text: '等你们绕回岔路赶到石窟时，人已经抓到了。你们站在人圈外，看火把把审讯的影子投在石壁上。',
      next: 'ch1-s8-header',
    },

    // ── CP-02 选 C（suboptimal）：分队线（喜剧向） → 第八幕石窟前 ──
    'ch1-s7-cp02c010': {
      type: 'dialogue', speaker: '韩长老',
      text: '深夜分队，人手薄了……罢，事急从权。',
      aside: '皱眉。',
      next: 'ch1-s7-cp02c020',
    },
    'ch1-s7-cp02c020': {
      type: 'narration',
      text: '你这一队先摸到石窟，但只有三个人。洞里的人影冲出来时险些真跑脱了——最后是沈疏桐一记灯笼杆加你一记扑，外加半坡的滚，才算按住。等韩长老那队闻声赶到，你们三个人加一个贼，四个人身上全是泥。',
      next: 'ch1-s7-cp02c030',
    },
    'ch1-s7-cp02c030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '下次，把卦认出来。分头走是没办法的办法——你明明有办法。',
      aside: '拨开脸侧一缕沾了泥的头发，面无表情。',
      m1Note: '无掌握度奖励；剧情喜剧化。',
      next: 'ch1-s8-header',
    },

    // ═══════════════ 第八幕 · 第一卦之后 ═══════════════
    // 8.1-8.4 小节标题不是场景切换，八幕整体一个 sceneHeader。三线（CP-02）汇合于此。
    'ch1-s8-header': {
      type: 'sceneHeader', scene: 8, title: '第一卦之后',
      time: '寅时至天光', ambience: '石窟前 → 下山路 → 明蓍堂。',
      m1Note: '真相揭晓（三层）；爻辞回收；宗门悬念钩子；KP-LY-002 独立时刻（本命卦）+ 计分抉择点 CP-03；好感萌芽。8.1-8.4 共用本 header。',
      next: 'ch1-s8-010',
    },
    // ── 8.1 石窟审讯 ──
    'ch1-s8-010': {
      type: 'narration',
      text: '火把围成半圈。被按跪在地上的是个四十来岁的汉子，外门杂役的短打，脸上还挂着你扑上去时蹭的泥——陈五，柴房当值，进门七年，没犯过事。',
      next: 'ch1-s8-020',
    },
    'ch1-s8-020': {
      type: 'dialogue', speaker: '韩长老',
      text: '书呢。',
      next: 'ch1-s8-030',
    },
    'ch1-s8-030': {
      type: 'narration',
      text: '执法堂弟子从洞里搜出一个油布包袱，一层层打开——半册旧书，封皮无字，纸页焦黄。翻开，满页只有一格一格的卦画，没有一个字。',
      next: 'ch1-s8-040',
    },
    'ch1-s8-040': {
      type: 'narration',
      text: '《遗卦残谱》。',
      next: 'ch1-s8-050',
    },
    'ch1-s8-050': {
      type: 'dialogue', speaker: '韩长老',
      text: '说吧。为什么。',
      next: 'ch1-s8-060',
    },
    'ch1-s8-060': {
      type: 'dialogue', speaker: '陈五',
      text: '长老明鉴！小的不识字啊——小的偷它做什么！是、是十天前，小的下山买盐，集上有个人跟小的搭话，口音不是本地人……他给了小的十两银子，说，说只要把藏经阁残卷格最左边那册拿出来，送到后山老松的树洞里搁着，自然有人来取……',
      aside: '头磕在地上。',
      next: 'ch1-s8-070',
    },
    'ch1-s8-070': {
      type: 'dialogue', speaker: '韩长老',
      text: '昨夜后山的火光？',
      next: 'ch1-s8-080',
    },
    'ch1-s8-080': {
      type: 'dialogue', speaker: '陈五',
      text: '是小的失手！翻墙下来火折子掉地上燃了茅草，小的用身子压灭的——长老，书小的碰都没敢多碰，树洞还没送到就……就……',
      next: 'ch1-s8-090',
    },
    'ch1-s8-090': {
      type: 'dialogue', speaker: '韩长老',
      text: '灯房那把柴刀，也是你拿的？',
      next: 'ch1-s8-100',
    },
    'ch1-s8-100': {
      type: 'dialogue', speaker: '陈五',
      text: '柴……什么柴刀？',
      aside: '茫然抬头。',
      next: 'ch1-s8-110',
    },
    'ch1-s8-110': {
      type: 'narration',
      text: '他不是在装。韩长老与身侧弟子对视一眼，摆了摆手。',
      m1Note: '收束注：柴刀次日在灯房柴堆后寻回（管灯杂役自己失手滑落），红鲱鱼线关闭（喂给 CP-01 选项 B 的诱饵）。',
      next: 'ch1-s8-120',
    },
    'ch1-s8-120': {
      type: 'narration',
      text: '他说不下去了，只是磕头。',
      next: 'ch1-s8-130',
    },
    'ch1-s8-130': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你下山，走的哪条道？',
      aside: '忽然开口。',
      next: 'ch1-s8-140',
    },
    'ch1-s8-140': {
      type: 'dialogue', speaker: '陈五',
      text: '小的……小的赶了柴房的驴车到山脚神祠，怕车走山径响动大，就、就把车撂在祠后，自己背着包袱抄小路……',
      aside: '一愣。',
      next: 'ch1-s8-150',
    },
    'ch1-s8-150': {
      type: 'narration',
      text: '沈疏桐看向你。',
      next: 'ch1-s8-160',
    },
    'ch1-s8-160': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '{{player}}。你的卦，初爻——动爻——还记得那一爻的爻辞吗？不记得不怪你，我念给你听。',
      next: 'ch1-s8-170',
    },
    'ch1-s8-170': {
      type: 'narration',
      text: '{{ta}}的声音在火把噼啪声里，一字一顿：',
      next: 'ch1-s8-180',
    },
    'ch1-s8-180': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '贲其趾，舍车而徒。',
      m1Note: '爻辞回收：《周易·贲·初九》「賁其趾，舍車而徒」（wikisource 快照 pageid 12673）。玩家不被要求读懂爻辞（超纲），只共享「卦早已写好」的震撼。',
      next: 'ch1-s8-190',
    },
    'ch1-s8-190': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '文饰其足，舍了车，徒步走。——你摇卦的时候，他刚把驴车丢在祠后，正用两条腿走进你的卦里。',
      next: 'ch1-s8-200',
    },
    'ch1-s8-200': {
      type: 'narration',
      text: '你后颈的汗毛一根根立起来。不是害怕——是一种说不清的、巨大的东西擦着你过去了的感觉。',
      next: 'ch1-s8-210',
    },
    'ch1-s8-210': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '现在知道这门学问为什么值六百级台阶了？',
      aside: '看着你的脸，唇角极淡地弯了一下。',
      next: 'ch1-s8-220',
    },
    // ── 8.2 裁页 ──
    'ch1-s8-220': {
      type: 'narration',
      text: '执法堂押人下山。沈疏桐领了「点验原书」的差，落在队尾。{{ta}}招手叫住你，借一盏灯笼，两人在祠前石阶上把那半册《遗卦残谱》摊开。',
      next: 'ch1-s8-230',
    },
    'ch1-s8-230': {
      type: 'narration',
      text: '{{ta}}翻得很慢。一页，一页。翻到中缝某处，{{ta}}的手指停住了。',
      next: 'ch1-s8-240',
    },
    'ch1-s8-240': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……你看这里。',
      next: 'ch1-s8-250',
    },
    'ch1-s8-250': {
      type: 'narration',
      text: '装订线内侧，一道细得几乎看不见的切口——有一页，被人贴着书脊裁走了。切口发暗，边缘起了毛。',
      next: 'ch1-s8-260',
    },
    'ch1-s8-260': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '切口是旧的。少说数月，甚至更久。',
      next: 'ch1-s8-270',
    },
    'ch1-s8-270': {
      type: 'dialogue', speaker: '{{player}}',
      text: '陈五……？',
      next: 'ch1-s8-280',
    },
    'ch1-s8-280': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '他不识字，连书都不敢多碰。而且他昨夜才动手。',
      aside: '{{ta}}合上书，声音低下去。',
      next: 'ch1-s8-290',
    },
    'ch1-s8-290': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '有人早就动过这册谱。裁了一页，原样放回，等到今天——才雇人来偷剩下的半册。',
      next: 'ch1-s8-300',
    },
    'ch1-s8-300': {
      type: 'dialogue', speaker: '{{player}}',
      text: '为什么不一起拿走？',
      next: 'ch1-s8-310',
    },
    'ch1-s8-310': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '问得好。我不知道。',
      next: 'ch1-s8-320',
    },
    'ch1-s8-320': {
      type: 'narration',
      text: '{{ta}}盯着封皮看了很久，忽然极轻地说了一句，轻得像说给{{ta}}自己听：',
      next: 'ch1-s8-330',
    },
    'ch1-s8-330': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '这册子的抄工……是前任首座的手笔。',
      next: 'ch1-s8-340',
    },
    'ch1-s8-340': {
      type: 'dialogue', speaker: '{{player}}',
      text: '前任首座？',
      next: 'ch1-s8-350',
    },
    'ch1-s8-350': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '——没什么。',
      next: 'ch1-s8-360',
    },
    'ch1-s8-360': {
      type: 'narration',
      text: '{{ta}}把书用油布重新包好，动作恢复了平日的利落，仿佛刚才那半息的失神是你的错觉。',
      next: 'ch1-s8-370',
    },
    'ch1-s8-370': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '裁页的事，我暂不报执法堂。',
      next: 'ch1-s8-380',
    },
    'ch1-s8-380': {
      type: 'dialogue', speaker: '{{player}}',
      text: '为什么？',
      next: 'ch1-s8-390',
    },
    'ch1-s8-390': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '陈五进不了藏经阁二层，能裁页的，只能是门里进得去的人。在知道是谁之前——',
      next: 'ch1-s8-400',
    },
    'ch1-s8-400': {
      type: 'narration',
      text: '{{ta}}看着你，火光在{{ta}}眼里静静烧。',
      next: 'ch1-s8-410',
    },
    'ch1-s8-410': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '——这件事，只有你我知道。',
      m1Note: '宗门层面悬念三件套就位：①取货人未现身②裁页者在门内③残谱与前任首座的关系。均只埋不解。',
      next: 'ch1-s8-420',
    },
    // ── 8.3 你自己的卦 ──
    'ch1-s8-420': {
      type: 'narration',
      text: '回到明蓍堂，天边已经有一线蟹壳青。你一夜没睡，眼皮打架，脑子却烧得清亮。',
      next: 'ch1-s8-430',
    },
    'ch1-s8-430': {
      type: 'narration',
      text: '沈疏桐没有放你回弟子舍。{{ta}}把香炉的灰拨了拨，重新点上一炷。',
      next: 'ch1-s8-440',
    },
    'ch1-s8-440': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '案子的卦，是宗门的。摇它的是你，卦却不是你的。',
      next: 'ch1-s8-450',
    },
    'ch1-s8-450': {
      type: 'narration',
      text: '{{ta}}从袖中取出那只旧钱囊。这一次你看清了——囊口的绳结磨得快断了，是种很旧的打法，现在门里没人这么打结。',
      next: 'ch1-s8-460',
    },
    'ch1-s8-460': {
      type: 'narration',
      text: '{{ta}}解绳的手，停了半拍。',
      next: 'ch1-s8-470',
    },
    'ch1-s8-470': {
      type: 'narration',
      text: '然后{{ta}}把三枚铜钱倒出来，轻轻推到你面前。边缘磨亮的、在廊亭里转过圈的、掷出过山火贲的三枚钱。',
      effects: { favor: 1 }, // 受赠三钱：好感 +1（自动触发，无对话选择）
      m1Note: '好感事件：受赠三钱（好感 +1，自动触发）。伏笔：钱囊来历不解释，「认人」为情感 bonus 章留口。',
      next: 'ch1-s8-480',
    },
    'ch1-s8-480': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '拿去。从今天起，是你的。',
      next: 'ch1-s8-490',
    },
    'ch1-s8-490': {
      type: 'dialogue', speaker: '{{player}}',
      text: '这是{{senior}}的——',
      next: 'ch1-s8-500',
    },
    'ch1-s8-500': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '我有新的。',
      aside: '{{ta}}打断你，语气不容商量，却又在半息后低了半度。',
      next: 'ch1-s8-510',
    },
    'ch1-s8-510': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '钱要旧的才好用——摇熟了的钱，认人。',
      next: 'ch1-s8-520',
    },
    'ch1-s8-520': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你还欠你自己一卦——每个入门弟子的本命卦。规矩：自己净手，自己焚香，自己祝祷，自己掷，自己装卦。我看着。我不说话。',
      next: 'ch1-s8-530',
    },
    'ch1-s8-530': {
      type: 'narration',
      text: '{{ta}}真的一个字都没再说，退到堂柱边的阴影里，抱起手臂。',
      next: 'ch1-s8-540',
    },
    'ch1-s8-540': {
      type: 'narration',
      text: '你于是净手。焚香。三枚旧钱在香上过了一遍。你听见自己的声音在空堂里响：',
      next: 'ch1-s8-550',
    },
    'ch1-s8-550': {
      type: 'dialogue', speaker: '{{player}}',
      text: '天何言哉，叩之即应。弟子{{player}}，初入山门，为自身来路关心——',
      next: 'ch1-s8-560',
    },
    'ch1-s8-560': {
      type: 'narration',
      text: '（你想起了家里那件事。三个月了，第一次，你觉得自己手里有了一件能问它的东西。）',
      next: 'ch1-s8-570',
    },
    'ch1-s8-570': {
      type: 'dialogue', speaker: '{{player}}',
      text: '——不知休咎，罔释厥疑。惟神惟灵，若可若否，望垂昭报。',
      next: 'ch1-s8-cast',
    },
    // 本命卦：真随机（复用已验证引擎，无剧情分支依赖），结果存档，本章不解读。
    'ch1-s8-cast': {
      type: 'castInteraction', castId: 'ch1-benming-gua', mode: 'random',
      question: '为自身来路关心（本命卦）',
      saveAs: 'player.natalHexagram',
      m1Note: '无提示、无纠错，玩家独立完成六掷，逐爻自装。结果存档 player.natalHexagram，本章不解读，作全游戏长线伏笔。CH1-CP-03 选项文本按实际卦象动态生成。此处即 PRD §9.3 终极验收「拿三枚硬币独立起一卦」的剧情内彩排。',
      next: 'ch1-s8-tm6',
    },
    'ch1-s8-tm6': {
      type: 'teachMoment', kpId: 'KP-LY-002', stage: 'independent', masteryTo: '掌握', lingli: 0,
      note: '无脚手架独立完成全套起卦仪轨（净手/焚香/祝词/六掷/自下装卦）。灵力 +5 结算权在 CP-03 optimal（勿双计，§0 注 5）。依据《卜筮正宗·以钱代蓍法》全仪轨。',
      next: 'ch1-s8-590',
    },
    'ch1-s8-590': {
      type: 'narration',
      text: '最后一掷落定。你依着六次结果，从初爻往上，一道一道，把爻画在纸上。',
      next: 'ch1-s8-600',
    },
    'ch1-s8-600': {
      type: 'narration',
      text: '画完最后一道，你抬头。沈疏桐不知什么时候已经站在案边，正看着你的卦纸。晨光从窗棂进来，落在{{ta}}肩上。',
      next: 'ch1-s8-610',
    },
    'ch1-s8-610': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '说说。你摇出了个什么？',
      next: 'ch1-s8-cp03',
    },
    'ch1-s8-cp03': {
      type: 'scoredChoice', cpId: 'CH1-CP-03', testsKp: ['KP-LY-001', 'KP-LY-002'],
      prompt: '复述本命卦的完整结构（选项文本由 M1 按实际随机卦象生成，以下为判定模板）',
      options: [
        {
          key: 'A',
          text: '内卦是〔X〕，外卦是〔Y〕，〔第 N 爻动 / 六爻安静〕——〔卦名，若识得〕。',
          dynamic: true, // 选项文本按实际随机卦象动态生成（结构完述）
          verdict: 'optimal',
          basis: '结构复述完整且方向正确：爻自下而上、内外卦辨识、动静判别——KP-001 与 KP-002 的联合独立应用。',
          sourceRef: [
            '《周易·说卦》[2]：「兼三才而兩之，故《易》六畫而成卦」（ctext 说卦）',
            '《增删卜易·卷之一·占卦法》：「共搖六次，第一次為初爻，畫在卦的最下面，依次上升」（ctext wiki chapter=950329）',
          ],
          next: 'ch1-s8-cp03a010',
        },
        {
          key: 'B',
          text: '摇出来的是〔卦名〕。',
          dynamic: true, // 只报名不报构（追问结构则答不上）
          verdict: 'suboptimal',
          basis: '知其名不知其构。卦名是结果，结构才是知识——不能拆解则不算掌握。',
          sourceRef: [],
          next: 'ch1-s8-cp03b010',
        },
        {
          key: 'C',
          text: '从上往下：初爻是〔实际上爻〕……',
          dynamic: true, // 方向读反
          verdict: 'wrong',
          basis: '装卦方向颠倒——违背「自下装上」的根本约定，内外卦随之全错。',
          sourceRef: [
            '《卜筮正宗·卷一·以钱代蓍法》：「自下裝上，三擲內卦成」（ctext wiki chapter=889452）',
          ],
          next: 'ch1-s8-cp03c010',
        },
      ],
      rewards: {
        optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-001 确认掌握；KP-LY-002 → 掌握' },
        suboptimal: { mastery: 'KP-LY-002 停留「用过」', plot: '{{senior}}三问三答补讲结构' },
      },
      onWrong: '{{senior}}握住玩家执笔的手把卦纸倒转（「卦是从地里长出来的」第三次出现），重述后过关。KP-LY-001/002 标记待复习。不锁进度。',
    },

    // ── CP-03 选 A（optimal）：好感萌芽 → 8.4 章末 ──
    'ch1-s8-cp03a010': {
      type: 'narration',
      text: '你说完，堂里静了三息。',
      next: 'ch1-s8-cp03a020',
    },
    'ch1-s8-cp03a020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……嗯。',
      next: 'ch1-s8-cp03a030',
    },
    'ch1-s8-cp03a030': {
      type: 'narration',
      text: '这是{{ta}}今夜第三声「嗯」。跟前两声都不一样——这一声之后，{{ta}}没有别过头去。',
      next: 'ch1-s8-cp03a040',
    },
    'ch1-s8-cp03a040': {
      type: 'narration',
      variants: {
        female: '她看着你，看了足有两息。晨光里，那双工笔画似的淡眉眼，极轻微地弯了一下——不是笑，更像一张绷了整夜的卦纸，终于松开了一角。',
        male: '他看着你，看了足有两息。晨光里，他抱着的手臂放了下来——这是他今夜第一次，把两只手都垂在身侧站着，像卸了什么东西。',
      },
      next: 'ch1-s8-cp03a050',
    },
    'ch1-s8-cp03a050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '比我当年第一卦，摇得像样。',
      next: 'ch1-s8-cp03a060',
    },
    'ch1-s8-cp03a060': {
      type: 'narration',
      variants: {
        female: '她顿了顿，别过脸去收拾钱囊，声音轻得几乎听不见，',
        male: '他顿了顿，转身去拨香炉的灰，声音混在灰烬的簌簌声里，',
      },
      next: 'ch1-s8-cp03a070',
    },
    'ch1-s8-cp03a070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '——就像样一点。',
      next: 'ch1-s8-hook',
    },

    // ── CP-03 选 B（suboptimal）：三问三答补讲结构 → 8.4 章末 ──
    'ch1-s8-cp03b010': {
      type: 'narration',
      text: '你报出了卦名。然后就没有然后了。',
      next: 'ch1-s8-cp03b020',
    },
    'ch1-s8-cp03b020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '内卦？',
      next: 'ch1-s8-cp03b030',
    },
    'ch1-s8-cp03b030': {
      type: 'narration',
      text: '你张了张嘴。',
      next: 'ch1-s8-cp03b040',
    },
    'ch1-s8-cp03b040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '外卦？',
      next: 'ch1-s8-cp03b050',
    },
    'ch1-s8-cp03b050': {
      type: 'narration',
      text: '你低头去看卦纸——刚才明明是你一道一道画上去的。',
      next: 'ch1-s8-cp03b060',
    },
    'ch1-s8-cp03b060': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '动了几爻？',
      next: 'ch1-s8-cp03b070',
    },
    'ch1-s8-cp03b070': {
      type: 'narration',
      text: '{{ta}}等了三息，把卦纸从你手里抽走，指尖从最下面那道爻开始，一道一道，替你把六道爻重新点了一遍——内卦、外卦、动静，一样一样讲给你听，讲得比第五幕那次还慢。',
      next: 'ch1-s8-cp03b080',
    },
    'ch1-s8-cp03b080': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '名字是卦的脸面，骨头你还没摸到。',
      aside: '{{ta}}把纸拍回你手里。',
      next: 'ch1-s8-cp03b090',
    },
    'ch1-s8-cp03b090': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '回去把这张卦拆开画十遍——脸面谁都记得住，认骨头才算入门。',
      m1Note: 'KP-LY-002 停留「用过」；无好感。',
      next: 'ch1-s8-hook',
    },

    // ── CP-03 选 C（wrong）：倒转卦纸安静纠错 → 8.4 章末 ──
    'ch1-s8-cp03c010': {
      type: 'narration',
      text: '你从最上面那道爻开始数：「初爻……」',
      next: 'ch1-s8-cp03c020',
    },
    'ch1-s8-cp03c020': {
      type: 'narration',
      text: '沈疏桐没有说话。{{ta}}走过来，握住你执笔的手——你僵住了——{{ta}}就着你的手，把整张卦纸，慢慢地，倒转了过来。',
      next: 'ch1-s8-cp03c030',
    },
    'ch1-s8-cp03c030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '第三遍了。',
      next: 'ch1-s8-cp03c040',
    },
    'ch1-s8-cp03c040': {
      type: 'narration',
      text: '{{ta}}的声音不重，甚至没有平时的刺。',
      next: 'ch1-s8-cp03c050',
    },
    'ch1-s8-cp03c050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '卦是从地里长出来的。藏经阁前我说过一遍，摇卦时我说过一遍。初爻在最下面——从地里，往上，长。',
      next: 'ch1-s8-cp03c060',
    },
    'ch1-s8-cp03c060': {
      type: 'narration',
      text: '{{ta}}松开手，退回阴影里。',
      next: 'ch1-s8-cp03c070',
    },
    'ch1-s8-cp03c070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '重新说。',
      next: 'ch1-s8-cp03c080',
    },
    'ch1-s8-cp03c080': {
      type: 'narration',
      text: '你盯着倒转过来的卦纸，深吸一口气，从最下面那道爻——重新数起。这一次，{{ta}}一直听完，没有打断。',
      m1Note: 'KP-LY-001/002 标记待复习；重述后过关，不锁进度；无好感。「卦是从地里长出来的」母题第三次出现（四幕教学→五幕提醒→此处纠错收束）。',
      next: 'ch1-s8-hook',
    },

    // ── 8.4 章末 · 钩子（CP-03 三线汇合）──
    'ch1-s8-hook': {
      type: 'narration',
      text: '{{ta}}送你到明蓍堂门口。天已经亮透了，早课的钟声从前山荡过来。',
      next: 'ch1-s8-hook-010',
    },
    'ch1-s8-hook-010': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '回去睡。睡醒了把你的本命卦收好——不许找人解，也不许自己瞎猜。',
      next: 'ch1-s8-hook-020',
    },
    'ch1-s8-hook-020': {
      type: 'dialogue', speaker: '{{player}}',
      text: '那它什么时候才……',
      next: 'ch1-s8-hook-030',
    },
    'ch1-s8-hook-030': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '物有其时，卦有其应。',
      next: 'ch1-s8-hook-040',
    },
    'ch1-s8-hook-040': {
      type: 'narration',
      text: '{{ta}}说这六个字的时候，看的不是你，是远处云雾里若隐若现的后山。',
      next: 'ch1-s8-hook-050',
    },
    'ch1-s8-hook-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '你的卦已经起了。答案不急——它跑不掉，你也躲不掉。',
      next: 'ch1-s8-hook-060',
    },
    'ch1-s8-hook-060': {
      type: 'narration',
      text: '{{ta}}转身进堂，门轴吱呀。半扇门阖上之前，{{ta}}的声音从门缝里递出来，恢复了十足十的{{senior}}腔调：',
      next: 'ch1-s8-hook-070',
    },
    'ch1-s8-hook-070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '明日卯时，藏经阁前。迟到一息，罚抄《系辞》十遍。——带上你的钱。',
      next: 'ch1-s8-hook-080',
    },
    'ch1-s8-hook-080': {
      type: 'narration',
      text: '你站在晨光里，手心攥着三枚旧铜钱，钱身被你焐得发热。',
      next: 'ch1-s8-hook-090',
    },
    'ch1-s8-hook-090': {
      type: 'narration',
      text: '你想起这一夜：六百级台阶顶上的失窃案、灯笼下六道墨痕、三枚齐刷刷背面朝天的铜钱、山径尽头的火光、被裁走的一页、以及一句轻得像自言自语的「前任首座的手笔」。',
      next: 'ch1-s8-hook-100',
    },
    'ch1-s8-hook-100': {
      type: 'narration',
      text: '你的第一卦替宗门找回了半册残谱。',
      next: 'ch1-s8-hook-110',
    },
    'ch1-s8-hook-110': {
      type: 'narration',
      text: '可是——',
      next: 'ch1-s8-hook-120',
    },
    'ch1-s8-hook-120': {
      type: 'narration',
      text: '裁走的那一页在谁手里？山下等在树洞外的是什么人？{{senior}}袖中那只旧钱囊，又是谁传给{{ta}}的？',
      next: 'ch1-s8-hook-130',
    },
    'ch1-s8-hook-130': {
      type: 'narration',
      text: '还有你自己那张没人解的本命卦，此刻正安安静静躺在你怀里，像一封没拆的信。',
      next: 'ch1-s8-hook-140',
    },
    'ch1-s8-hook-140': {
      type: 'narration',
      text: '【第一章 · 终】',
      next: 'ch1-end',
    },

    // ═══════════════ 第一章 · 终 ═══════════════
    'ch1-end': {
      type: 'chapterEnd',
      rewards: { lingli: 10 },
      hooks: [
        '玩家本命卦（个人线，全游戏长线）',
        '裁页 + 树洞取货人（宗门主线）',
        '钱囊与前任首座（{{senior}}感情线 + 师承旧事，情感 bonus 章留口）',
      ],
      nextChapterTeaser: '残谱上只有卦画没有字——要让一张哑卦「开口报出自己的名字」，你需要学会太卜宗的第二课：装卦。',
    },
  },
};

export default CHAPTER_1;
