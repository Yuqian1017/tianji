// Bonus Chapter 《钱囊》 — structured node-flow data (情感 bonus 章①)
// Source of truth: docs/script/BONUS_QIANNANG_SCRIPT_v1.md (v1.0-reviewed-2026-07-12)
// This file is a FAITHFUL transcription of the reviewed script into node flow.
// Do NOT edit dialogue/narration content here without updating the script doc first (脚本先行铁律).
//
// ── Node types used (bonus 章只用这五类) ────────────────────────────
// sceneHeader { type, scene, title, time, ambience?, next }
// narration   { type, text | variants:{female,male}, next }
// dialogue    { type, speaker, text | variants, aside?, next }   // aside = 舞台指示
// choice      { type, prompt?, options:[{text, response?:{speaker,text,aside?}, effects?:{favor}, next}] }  // 风味/彩蛋选择，不计分
// chapterEnd  { type, rewards:{lingli}, hooks:[] }
// （本章无 scoredChoice / castInteraction / teachMoment / settings — bonus 情感章硬规则）
//
// ── Template variables (renderer substitutes) ───────────────────────
// {{senior}} 师姐/师兄 · {{ta}} 她/他 · {{junior}} 师妹/师弟 · {{player}} 玩家名
// Gender variants: ONLY via `variants` field (skeleton must stay identical — PRD §6.2)
//
// ── 好感/灵力账目 (bonus 章规格) ────────────────────────────────────
// 二幕彩蛋选对 +1 · 三幕应答 +1（三选殊途同归，等值）· 六幕章核心事件 +5 · 通关灵力 +5
// ＝单周目可得好感满 7 / 灵力 5。

export const CHAPTER_QIANNANG = {
  id: 'qiannang',
  title: '钱囊',
  scriptVersion: 'v1.0-reviewed-2026-07-12',
  entryNode: 'qn-s1-header',

  knowledgePoints: [],

  nodes: {
    // ═══════════════ 第一幕 · 旧绳 ═══════════════
    'qn-s1-header': {
      type: 'sceneHeader', scene: 1, title: '旧绳',
      time: '结案数日后，黄昏', ambience: '弟子舍外廊。',
      next: 'qn-s1-010',
    },
    'qn-s1-010': {
      type: 'narration',
      text: '结案之后，日子忽然静下来了。',
      next: 'qn-s1-020',
    },
    'qn-s1-020': {
      type: 'narration',
      text: '白天跟着{{senior}}认卦背口诀，晚上回弟子舍，你总要把那三枚旧钱摸出来，在灯下自己摇几卦。不问吉凶——{{ta}}不许你瞎解——只是摇，装卦，认爻。摇熟了，钱落在掌心里的分量，闭着眼都数得出。',
      next: 'qn-s1-030',
    },
    'qn-s1-030': {
      type: 'narration',
      text: '今晚的头一卦，六掷全静，一个单五个拆——你从下往上装完，认了半天：下头是坎中满，上头是坤六断。地水……地水什么来着？卦名你还没背全。你把它记在纸角上，准备明天问。',
      next: 'qn-s1-040',
    },
    'qn-s1-040': {
      type: 'narration',
      text: '第二卦掷到第五掷，出了一个交——三枚全字。你盯着那三枚字面朝上的钱看了好一会儿。老阴。要动。阴动变阳。你想起初爻那个圈，想起那晚{{senior}}说「动了，就热闹了」。',
      next: 'qn-s1-050',
    },
    'qn-s1-050': {
      type: 'narration',
      text: '现在你知道热闹是什么意思了。',
      next: 'qn-s1-060',
    },
    'qn-s1-060': {
      type: 'narration',
      text: '今晚第三卦装到一半，你忽然停住了。',
      next: 'qn-s1-070',
    },
    'qn-s1-070': {
      type: 'narration',
      text: '三枚钱摊在你掌心里。钱身相碰的地方，又多了一道新蹭的白痕。',
      next: 'qn-s1-080',
    },
    'qn-s1-080': {
      type: 'narration',
      text: '{{ta}}把钱给你那天，你身上什么都没有——你就把它们用一方旧帕子裹了，贴身揣着。半个月下来，帕子磨出了洞，三枚钱在里面互相磕碰。这是传了三代的老钱，边缘的包浆被你揣得起了毛。',
      next: 'qn-s1-090',
    },
    'qn-s1-090': {
      type: 'narration',
      text: '你想起{{ta}}袖中那只洗得发白的旧钱囊——绳结是旧式的，门里没人会打。钱在{{ta}}那里的时候，是有家的。',
      next: 'qn-s1-100',
    },
    'qn-s1-100': {
      type: 'narration',
      text: '到了你手里，只有一方破帕子。',
      next: 'qn-s1-110',
    },
    'qn-s1-110': {
      type: 'narration',
      text: '你把三枚钱拢进掌心，坐了半晌。',
      next: 'qn-s1-120',
    },
    'qn-s1-120': {
      type: 'dialogue', speaker: '{{player}}',
      text: '……得给它们想个办法。',
      aside: '自语',
      next: 'qn-s2-header',
    },

    // ═══════════════ 第二幕 · 寻绳 ═══════════════
    'qn-s2-header': {
      type: 'sceneHeader', scene: 2, title: '寻绳',
      time: '次日辰时', ambience: '山门外早集。',
      next: 'qn-s2-010',
    },
    'qn-s2-010': {
      type: 'narration',
      text: '逢六的日子，山门外有早集。卖山货的、卖香烛的、卖粗纸笔墨的，沿着石阶下的平地摆开两排。',
      next: 'qn-s2-020',
    },
    'qn-s2-020': {
      type: 'narration',
      text: '这是你入门以来头一回下山。石阶走到底，人间的声音忽然涌上来——吆喝声、讨价声、油锅的滋啦声。你在山上待了不到一个月，竟然已经觉得这些声音陌生了。',
      next: 'qn-s2-030',
    },
    'qn-s2-030': {
      type: 'narration',
      text: '集市东头围了一小圈人。你凑过去看：一个布幡子上写着「铁口神断」，幡下坐着个山羊胡先生，面前摆着三枚黄澄澄的新钱。',
      next: 'qn-s2-040',
    },
    'qn-s2-040': {
      type: 'dialogue', speaker: '山羊胡',
      text: '这位客官印堂发亮，家中必有喜事——来来来，卦金三十文，一卦断您前程！',
      aside: '拖着长腔',
      next: 'qn-s2-050',
    },
    'qn-s2-050': {
      type: 'narration',
      text: '他抓起三枚钱，往竹筒里一扔，哗啦摇了两下就倒出来，看也没看几眼：',
      next: 'qn-s2-060',
    },
    'qn-s2-060': {
      type: 'dialogue', speaker: '山羊胡',
      text: '哎呀！乾卦！大吉大利！',
      next: 'qn-s2-070',
    },
    'qn-s2-070': {
      type: 'narration',
      text: '你站在人群外，忽然发现自己在皱眉。',
      next: 'qn-s2-080',
    },
    'qn-s2-080': {
      type: 'narration',
      text: '——三枚钱只掷了一次。六爻要掷六次，一次成一爻，他那一「卦」连一爻都算不上。钱是崭新的，筒是歪的，他倒出来的时候手指还拨了一下。',
      next: 'qn-s2-090',
    },
    'qn-s2-090': {
      type: 'narration',
      text: '一个月前的你，大概也会觉得「乾卦大吉」四个字很值三十文。',
      next: 'qn-s2-100',
    },
    'qn-s2-100': {
      type: 'narration',
      text: '现在你只想起{{senior}}那句话：人证物证都是浑的，这种时候才轮到卦开口——而这位先生的卦，从头到尾没开过口。',
      next: 'qn-s2-110',
    },
    'qn-s2-110': {
      type: 'narration',
      text: '你退出人群，没说话。山下的事，轮不到你管。但你走开的时候，脚步比来时稳了一点——原来「学会了」是这种感觉：不是会说什么，是看得出什么是假的。',
      next: 'qn-s2-120',
    },
    'qn-s2-120': {
      type: 'narration',
      text: '你在一个卖络子的摊前停下。摊主是个手脚麻利的老妇人，摊上挂满五色绳结。',
      next: 'qn-s2-130',
    },
    'qn-s2-130': {
      type: 'dialogue', speaker: '摊主',
      text: '小师父要什么？红绳？穗子？',
      next: 'qn-s2-140',
    },
    'qn-s2-140': {
      type: 'dialogue', speaker: '{{player}}',
      text: '一段结实的旧色麻绳——我想给几枚旧钱编个络子，要经得住天天摩挲的那种。',
      next: 'qn-s2-150',
    },
    'qn-s2-150': {
      type: 'dialogue', speaker: '摊主',
      text: '那要打得对结才行。小师父，考考你——',
      aside: '挑了两卷绳出来',
      next: 'qn-s2-160',
    },
    'qn-s2-160': {
      type: 'narration',
      text: '她枯瘦的手指翻飞，眨眼打出两个结：一个独股盘成，一整条不断；一个双股对拧，中间留一道缝。',
      next: 'qn-s2-170',
    },
    'qn-s2-170': {
      type: 'dialogue', speaker: '摊主',
      text: '我们这行的老话，这两个结，一个叫『单』，一个叫『拆』。你猜哪个是单？',
      next: 'qn-s2-180',
    },
    'qn-s2-180': {
      type: 'choice',
      prompt: null, // 彩蛋 · 不计分（绳结「单/拆」游戏原创风味，选对给好感 +1、选错无惩罚）
      options: [
        {
          text: '不断的那个是单——单是一整条，拆是断成两截',
          response: {
            speaker: '摊主',
            text: '哎哟，小师父是门里懂行的！单结独股，拆结双股——给你这卷，独股麻芯，越磨越亮。',
            aside: '一拍大腿',
          },
          effects: { favor: 1 }, // {{senior}}教的东西在山下也认得出
          next: 'qn-s2-190',
        },
        {
          text: '双股的是单吧',
          response: {
            speaker: '摊主',
            text: '反啦反啦。单是独股一条，拆才是双股开缝——诶，不过小师父肯猜就好。',
            aside: '笑',
          },
          next: 'qn-s2-190', // 无惩罚
        },
      ],
    },
    'qn-s2-190': {
      type: 'narration',
      text: '你付了钱。老妇人把绳卷用油纸包好，忽然压低声音：',
      next: 'qn-s2-200',
    },
    'qn-s2-200': {
      type: 'dialogue', speaker: '摊主',
      text: '给什么人留下的东西编络子？',
      next: 'qn-s2-210',
    },
    'qn-s2-210': {
      type: 'narration',
      text: '你一怔。',
      next: 'qn-s2-220',
    },
    'qn-s2-220': {
      type: 'dialogue', speaker: '摊主',
      text: '你揣怀里那包东西——一路走一路按。只有装着念想的物件，人才这么护。',
      next: 'qn-s2-230',
    },
    'qn-s2-230': {
      type: 'narration',
      text: '她摆摆手，不再多说。',
      next: 'qn-s3-header',
    },

    // ═══════════════ 第三幕 · 廊亭夜 ═══════════════
    'qn-s3-header': {
      type: 'sceneHeader', scene: 3, title: '廊亭夜',
      time: '当夜，掌灯后', ambience: '弟子舍 → 明蓍堂后廊亭。',
      next: 'qn-s3-010',
    },
    'qn-s3-010': {
      type: 'narration',
      text: '绳买回来，在你袖袋里躺了一整个下午。',
      next: 'qn-s3-020',
    },
    'qn-s3-020': {
      type: 'narration',
      text: '你试着编了三次，拆了三次。',
      next: 'qn-s3-030',
    },
    'qn-s3-030': {
      type: 'narration',
      text: '午后第一次：络子编出来歪歪扭扭，像一团打了架的草。你看看络子，再看看帕子里那三枚包浆温润的老钱——配不上。拆了。',
      next: 'qn-s3-040',
    },
    'qn-s3-040': {
      type: 'narration',
      text: '傍晚第二次：好了些，但绳目疏疏落落，钱放进去晃荡。你想起{{ta}}袖中那只囊，绳结匀净得像画出来的。拆了。',
      next: 'qn-s3-050',
    },
    'qn-s3-050': {
      type: 'narration',
      text: '掌灯第三次，你编到一半忽然停住，想明白了一件事：这不是手艺的事。这钱在{{ta}}袖子里装了那么多年，囊是旧的，绳是旧的，结是门里没人会打的旧式结——它们是一起变旧的。',
      next: 'qn-s3-060',
    },
    'qn-s3-060': {
      type: 'narration',
      text: '而你手里这段新绳，跟这三枚钱，没有一天共同的日子。',
      next: 'qn-s3-070',
    },
    'qn-s3-070': {
      type: 'narration',
      text: '你怕的不是编不好一个络子。你怕的是，这钱的「家」根本不是你编得出来的东西。',
      next: 'qn-s3-080',
    },
    'qn-s3-080': {
      type: 'narration',
      text: '可钱总不能一直裹在破帕子里。所以还是得去问{{ta}}——哪怕挨怼。',
      next: 'qn-s3-090',
    },
    'qn-s3-090': {
      type: 'narration',
      text: '你揣着钱和绳出门。走到廊亭外，看见亭里点着一盏灯。',
      next: 'qn-s3-100',
    },
    'qn-s3-100': {
      type: 'narration',
      text: '{{senior}}在。案上摊着一册书，{{ta}}却没在看——目光落在亭外的黑暗里，不知在想什么。',
      next: 'qn-s3-110',
    },
    'qn-s3-110': {
      type: 'narration',
      text: '你犹豫了一下，还是走了进去，把怀里那包东西和新绳一起放在案上。',
      next: 'qn-s3-120',
    },
    'qn-s3-120': {
      type: 'dialogue', speaker: '{{player}}',
      text: '{{senior}}，我想给钱编个络子。编了三回都配不上它们——想着，还是先问过你。',
      next: 'qn-s3-130',
    },
    'qn-s3-130': {
      type: 'narration',
      text: '{{ta}}的目光从黑暗里收回来，落在案上。',
      next: 'qn-s3-140',
    },
    'qn-s3-140': {
      type: 'narration',
      text: '破了洞的旧帕子摊开，三枚钱躺在里面，钱身上几道新蹭的白痕，在灯下看得清清楚楚。旁边是你那个歪歪扭扭的半成品络子。',
      next: 'qn-s3-150',
    },
    'qn-s3-150': {
      type: 'narration',
      text: '{{ta}}的眉峰几不可察地动了一下。',
      next: 'qn-s3-160',
    },
    'qn-s3-160': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……你就这么装它们？',
      next: 'qn-s3-170',
    },
    'qn-s3-170': {
      type: 'narration',
      text: '声音不重。但你听得出，这一句不是毒舌——是真的冷。',
      next: 'qn-s3-180',
    },
    'qn-s3-180': {
      type: 'choice',
      prompt: null, // 不计分 · 风味（三选殊途同归，各给好感 +1，进同一主线）
      options: [
        {
          text: '对不起。我没有更好的东西了',
          response: {
            speaker: '沈疏桐',
            text: '……不怪你。是我给钱的时候，没想到这一层。',
            aside: '{{ta}}盯着你看了两息，忽然泄了力似的，摆摆手。',
          },
          effects: { favor: 1 },
          next: 'qn-s3-190',
        },
        {
          text: '所以我才来学编络子',
          response: {
            speaker: '沈疏桐',
            text: '……三回。你拆了三回。',
            aside: '{{ta}}沉默了很久，目光从破帕子移到那个笨拙的络子上，又移回来。——{{ta}}竟然数得出来。',
          },
          effects: { favor: 1 },
          next: 'qn-s3-190',
        },
        {
          text: '钱没伤着，我每天都数',
          response: {
            speaker: '沈疏桐',
            text: '钱身上的痕是怎么来的？罢了。坐。',
            aside: '你哑口无言。{{ta}}看着你的样子，忽然轻轻叹了口气。',
          },
          effects: { favor: 1 },
          next: 'qn-s3-190',
        },
      ],
    },
    'qn-s3-190': {
      type: 'narration',
      text: '{{ta}}沉默了片刻，忽然从袖中取出那只洗得发白的旧钱囊，搁在灯下。',
      next: 'qn-s3-200',
    },
    'qn-s3-200': {
      type: 'narration',
      text: '空的。囊口那个旧式绳结，在灯影里绕着两个匀净的圈。',
      next: 'qn-s3-210',
    },
    'qn-s3-210': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '看清楚。这个结，叫双钱结。老打法——绳走两圈，像两枚钱背靠背。',
      next: 'qn-s3-220',
    },
    'qn-s3-220': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '教我打这个结的人，也是把这三枚钱传给我的人。',
      next: 'qn-s3-230',
    },
    'qn-s3-230': {
      type: 'narration',
      text: '你屏住呼吸。亭子里静得能听见灯花的噼啪。',
      next: 'qn-s3-240',
    },
    'qn-s3-240': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '我师父。',
      next: 'qn-s4-header',
    },

    // ═══════════════ 第四幕 · 守一夜的人 ═══════════════
    'qn-s4-header': {
      type: 'sceneHeader', scene: 4, title: '守一夜的人',
      time: '夜深', ambience: '明蓍堂后廊亭。',
      next: 'qn-s4-010',
    },
    'qn-s4-010': {
      type: 'narration',
      text: '{{ta}}给自己倒了盏冷茶，也给你倒了一盏。这是{{ta}}头一回给你倒茶。',
      next: 'qn-s4-020',
    },
    'qn-s4-020': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '我入门那年，比你现在还小。也是山下来的，也是家里出了事，也是谁都解释不了。',
      next: 'qn-s4-030',
    },
    'qn-s4-030': {
      type: 'narration',
      text: '{{ta}}看了你一眼。你忽然明白，第一天在接引殿报名册的时候，{{ta}}为什么「看过名册了」。',
      next: 'qn-s4-040',
    },
    'qn-s4-040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '师父那时候是首座。太卜宗四百年，最年轻的首座。',
      next: 'qn-s4-050',
    },
    'qn-s4-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '别人的师父教弟子，先教规矩。我师父先教我摇卦——就在这个亭子里，也是三枚钱，也是一遍一遍地掷。我摇不好，他也不骂，就坐在对面看着，说：『不急。卦等得起人。』',
      next: 'qn-s4-060',
    },
    'qn-s4-060': {
      type: 'narration',
      text: '{{ta}}难得地、极轻地笑了一下。',
      next: 'qn-s4-070',
    },
    'qn-s4-070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '他这个人，你要是见过就知道——半点不像首座。袖口永远沾着墨，抄书抄到一半会忘了吃饭。宗里人背后叫他『抄书的』，他听见了也不恼，说抄一遍，比读十遍记得牢。',
      next: 'qn-s4-080',
    },
    'qn-s4-080': {
      type: 'narration',
      text: '你想起藏经阁那半册《遗卦残谱》——满页卦画，一笔一笔，全是手抄。你听得出了神，手里的绳圈松了。',
      next: 'qn-s4-090',
    },
    'qn-s4-090': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '发什么呆。绳。',
      next: 'qn-s4-100',
    },
    'qn-s4-100': {
      type: 'narration',
      text: '你赶紧把那一圈收紧。{{ta}}扫了一眼，没挑刺——大概是不忍心打断自己。',
      next: 'qn-s4-110',
    },
    'qn-s4-110': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '明蓍堂里挂的那几幅卦轴，也是他抄的。里头有一幅六十四卦圆图，他抄了九遍才满意，说前八遍的『既济』都抄得太急。',
      next: 'qn-s4-120',
    },
    'qn-s4-120': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '急什么呢。他总说，卦等得起人。',
      next: 'qn-s4-130',
    },
    'qn-s4-130': {
      type: 'narration',
      text: '{{ta}}的声音在这句上停了很久。你没有催。',
      next: 'qn-s4-140',
    },
    'qn-s4-140': {
      type: 'narration',
      text: '{{ta}}的指尖在旧钱囊上轻轻碰了一下。',
      next: 'qn-s4-150',
    },
    'qn-s4-150': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '这三枚钱，是他师父传给他的。传到他手里的时候，绳结就是这个打法。',
      next: 'qn-s4-160',
    },
    'qn-s4-160': {
      type: 'dialogue', speaker: '{{player}}',
      text: '那……传给你的时候呢？',
      next: 'qn-s4-170',
    },
    'qn-s4-170': {
      type: 'narration',
      text: '{{ta}}沉默了一会儿。',
      next: 'qn-s4-180',
    },
    'qn-s4-180': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '传给我的那晚，他跟我讲了一件事。他说他年轻的时候，有个外乡人深夜叩山门，求断一卦——家里人生死不知，音信全无。按门规，夜里不开坛。',
      next: 'qn-s4-190',
    },
    'qn-s4-190': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '师父把人请进来，煮了一炉茶，陪着他坐到天亮，开坛，摇卦。后来他跟我说——',
      next: 'qn-s4-200',
    },
    'qn-s4-200': {
      type: 'narration',
      text: '{{ta}}顿了顿，像在原样复述一句听过千遍的话：',
      next: 'qn-s4-210',
    },
    'qn-s4-210': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '『卦是死的，人是活的。钱认人——认的不是手法，是肯为一卦守一夜的人。』',
      next: 'qn-s4-220',
    },
    'qn-s4-220': {
      type: 'narration',
      text: '灯花又爆了一声。',
      next: 'qn-s4-230',
    },
    'qn-s4-230': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '结案那晚，你为宗门的卦守到天亮，又为你自己的卦摇到晨钟。我看着你画完最后一道爻——',
      next: 'qn-s4-240',
    },
    'qn-s4-240': {
      type: 'narration',
      text: '{{ta}}忽然收住，端起冷茶喝了一口，把后半句咽了回去。',
      next: 'qn-s4-250',
    },
    'qn-s4-250': {
      type: 'narration',
      variants: {
        female: '但你看见她端起茶盏，又放下了——像是忘了自己方才已经喝过一口。',
        male: '但你看见他转着茶盏的手停了半圈，又若无其事地转了下去。',
      },
      next: 'qn-s4-260',
    },
    'qn-s4-260': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '——总之，钱给你，不是心血来潮。',
      next: 'qn-s5-header',
    },

    // ═══════════════ 第五幕 · 对不上的年头 ═══════════════
    'qn-s5-header': {
      type: 'sceneHeader', scene: 5, title: '对不上的年头',
      time: '夜深', ambience: '明蓍堂后廊亭。',
      next: 'qn-s5-010',
    },
    'qn-s5-010': {
      type: 'narration',
      text: '你捏着新绳，试着照{{ta}}教的手势绕第一圈。',
      next: 'qn-s5-020',
    },
    'qn-s5-020': {
      type: 'dialogue', speaker: '{{player}}',
      text: '师父他……现在在哪？',
      next: 'qn-s5-030',
    },
    'qn-s5-030': {
      type: 'narration',
      text: '绕绳的手势顿住了——是{{ta}}的手先停的。',
      next: 'qn-s5-040',
    },
    'qn-s5-040': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '七年前，师父下山访友。走之前跟我说，去去就回，让我看好明蓍堂的香。',
      next: 'qn-s5-050',
    },
    'qn-s5-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '香我看到今天。人没有回来。',
      next: 'qn-s5-060',
    },
    'qn-s5-060': {
      type: 'narration',
      text: '{{ta}}说这两句的时候，声音平得像在念别人的卦辞。你却忽然想起另一件事——',
      next: 'qn-s5-070',
    },
    'qn-s5-070': {
      type: 'narration',
      text: '藏经阁那册《遗卦残谱》，师父亲手抄的那册。裁页的切口，发暗，起毛。',
      next: 'qn-s5-080',
    },
    'qn-s5-080': {
      type: 'narration',
      text: '那晚祠前石阶上，{{ta}}盯着切口，只对你一个人说过：切口是旧的。少说数月，甚至更久。',
      next: 'qn-s5-090',
    },
    'qn-s5-090': {
      type: 'narration',
      text: '多久算「更久」？你不敢往下想，也不敢问。',
      next: 'qn-s5-100',
    },
    'qn-s5-100': {
      type: 'narration',
      text: '你只是低下头，接着绕绳。第二圈，像两枚钱背靠背。',
      next: 'qn-s6-header',
    },

    // ═══════════════ 第六幕 · 钱有家了 ═══════════════
    'qn-s6-header': {
      type: 'sceneHeader', scene: 6, title: '钱有家了',
      time: '将晓', ambience: '明蓍堂后廊亭。',
      next: 'qn-s6-010',
    },
    'qn-s6-010': {
      type: 'narration',
      text: '{{ta}}把旧囊口那截磨断的绳拆下来，让你把新绳穿上去——用{{ta}}教的双钱结收口。',
      next: 'qn-s6-020',
    },
    'qn-s6-020': {
      type: 'narration',
      text: '双钱结在你手里成形的时候，天边已经蒙蒙亮了。',
      next: 'qn-s6-030',
    },
    'qn-s6-030': {
      type: 'narration',
      text: '打得歪歪扭扭——第一圈太松，第二圈太紧，两枚「钱」一大一小，背靠背歪着。',
      next: 'qn-s6-040',
    },
    'qn-s6-040': {
      type: 'narration',
      text: '{{ta}}捏起来看了看。你等着挨怼。',
      next: 'qn-s6-050',
    },
    'qn-s6-050': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '……丑。',
      next: 'qn-s6-060',
    },
    'qn-s6-060': {
      type: 'narration',
      text: '{{ta}}把那只旧钱囊——连着你亲手打的新绳——一起放进你手里。',
      effects: { favor: 5 }, // 章核心事件「三代持钱人」
      next: 'qn-s6-070',
    },
    'qn-s6-070': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '丑得很结实。比我第一次打的强。',
      next: 'qn-s6-080',
    },
    'qn-s6-080': {
      type: 'dialogue', speaker: '{{player}}',
      text: '囊也给我？',
      next: 'qn-s6-090',
    },
    'qn-s6-090': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '钱要有家。',
      next: 'qn-s6-100',
    },
    'qn-s6-100': {
      type: 'narration',
      text: '{{ta}}顿了顿，像是还有半句。但{{ta}}没说——{{ta}}起身去拨灯芯，背对着你，那半句就散在灯花的一声轻响里了。',
      next: 'qn-s6-110',
    },
    'qn-s6-110': {
      type: 'narration',
      text: '你没敢问。{{ta}}也没再提。',
      next: 'qn-s6-120',
    },
    'qn-s6-120': {
      type: 'narration',
      text: '晨钟从前山荡过来的时候，{{ta}}起身收灯，忽然背对着你说：',
      next: 'qn-s6-130',
    },
    'qn-s6-130': {
      type: 'dialogue', speaker: '沈疏桐',
      text: '钱囊的事，师父的事——',
      next: 'qn-s6-140',
    },
    'qn-s6-140': {
      type: 'dialogue', speaker: '{{player}}',
      text: '只有你我知道。',
      next: 'qn-s6-150',
    },
    'qn-s6-150': {
      type: 'narration',
      text: '{{ta}}回头看了你一眼。',
      next: 'qn-s6-160',
    },
    'qn-s6-160': {
      type: 'narration',
      variants: {
        female: '那眼神很短，短得像三枚钱落进铜盘的一瞬。但你敢发誓，她那一眼里，有一整个没说出口的「好」。',
        male: '他没说话，只是抬手，用两根手指很轻地敲了敲你的肩——像在案上点一道爻。一道阳爻。',
      },
      next: 'qn-s6-170',
    },
    'qn-s6-170': {
      type: 'narration',
      text: '{{ta}}提着灯走出廊亭，晨光落进来，落在{{ta}}方才望了一夜的方向——',
      next: 'qn-s6-180',
    },
    'qn-s6-180': {
      type: 'narration',
      text: '后山。',
      next: 'qn-s6-190',
    },
    'qn-s6-190': {
      type: 'narration',
      text: '【番外《钱囊》· 终】',
      next: 'qn-end',
    },

    // ═══════════════ 番外《钱囊》 · 终 ═══════════════
    'qn-end': {
      type: 'chapterEnd',
      title: '【番外《钱囊》· 终】',
      rewards: { lingli: 5 },
      hooks: [
        '{{ta}}望后山——三条线埋向同一座山',
      ],
    },
  },
};

export default CHAPTER_QIANNANG;
