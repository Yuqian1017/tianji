// Chapter 5 《元神忌神》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_5_SCRIPT_v1.md (owner-gate delegated;
// review convergence pending — transcription starts only after convergence).
// This file is a FAITHFUL transcription of the approved script.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1-4.js headers. ch5 uses NO new node types.
// ch5-specific conventions:
// - favorBranch(45) is the OPENING fork (after s1-header): pass=知心 opening,
//   fail=信任 opening; both chains are normal paths, both carry ZERO favor
//   (currency-neutral fork — lint-enforced), converge at the 1.2 anchor.
// - {{junior}} appears NOWHERE (both tiers ≥25 use direct name).
// - 仇神 may appear in exactly ONE node (act-2 naming beat) — lint-capped.
// - No wangshuai board annotations this chapter (prep § 6 ruling).
// - Fixed period 卯月丁亥日 (engine ref input {year:2026,month:3,day:14,hour:22}).
//
// ── Coin-face convention (canonical) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_5 = {
  id: 'ch5',
  title: '元神忌神',
  scriptVersion: 'v1.1-delegated-approved-2026-07-17',
  entryNode: 'ch5-s1-header',

  // 剧情固定卦象：火天大有 · 六爻安静（乾宫归魂，世三应上；引擎实测 2026-07-17，卯月丁亥日）
  // 教学复盘卦：乾为天（幕二三四）；地火明夷第三读（幕三四）；山地剥一句复读位（幕七）。
  fixedCase: {
    throws: [7, 7, 7, 7, 8, 7], // 初爻→上爻
    benGua: '火天大有',
    bianGua: null,              // 六爻安静
    movingLineIndex: null,
  },

  knowledgePoints: ['KP-LY-013', 'KP-LY-014', 'KP-LY-015'],

  nodes: {
  // ═══════════════ 第一幕 · 墙外的影子 ═══════════════
  'ch5-s1-header': {
    type: 'sceneHeader', scene: 1, title: '墙外的影子',
    time: '近子时', ambience: '修书房后院，柴棚（bg-xiushufang）。守窗第七夜。',
    m1Note: '本幕功能：章首 favorBranch(45)（知心/信任双开场，§ 0 第 2 条）；守窗第一果（影子两停+物证）；「他在等什么」立题。剧情时间：卯月丁亥日夜（§ 0 第 1 条）。',
    next: 'ch5-s1-fb',
  },
  // ── 章首开场分支（favorBranch · threshold 45 · § 0 第 2 条）——按 save.favor 静默路由。
  // pass(≥45)=知心档开场／fail(<45)=信任档开场，双链均零好感效果（currency-neutral fork，lint 强制），
  // 合流于 1.2 锚点（ch5-s1-100）。
  // 档位演出注：pass 版「……嗯。来得早。」＝「破防语气词」首秀（知心档 45+ 解锁演出，LOVE § 1.1）——
  // 毒舌频度不变，语气词是裂缝不是塌方，她自己察觉后立刻收回；fail 版为平常向（她主动约了早来——公事口径）。
  // 两版均直呼名或无称谓，零演卦内容指涉（可选章不依赖红线）。
  'ch5-s1-fb': {
    type: 'favorBranch', threshold: 45,
    pass: 'ch5-s1-pass010',
    fail: 'ch5-s1-fail010',
  },
  // ── 好感 ≥ 45（知心档开场）──
  'ch5-s1-pass010': {
    type: 'narration',
    text: '守窗第七夜。今夜本该全归{{ta}}——你却在亥时末就摸回了柴棚。',
    next: 'ch5-s1-pass020',
  },
  'ch5-s1-pass020': {
    type: 'narration',
    text: '棚里那盏罩着布的小灯下，{{ta}}正就着微光翻一册书。听见脚步，{{ta}}头也不抬：',
    next: 'ch5-s1-pass030',
  },
  'ch5-s1-pass030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '巳时是你的班。现在是亥时。',
    next: 'ch5-s1-pass040',
  },
  'ch5-s1-pass040': {
    type: 'dialogue', speaker: '{{player}}',
    text: '睡不着。',
    next: 'ch5-s1-pass050',
  },
  'ch5-s1-pass050': {
    type: 'narration',
    text: '{{ta}}翻书的手停了半息。然后{{ta}}往旁边挪了挪，把柴堆上暖过的那块位置让了出来——那是{{ta}}自己坐了半夜的地方。',
    next: 'ch5-s1-pass060',
  },
  'ch5-s1-pass060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '……嗯。来得早。',
    m1Note: '「破防语气词」首秀（知心档 45+ 解锁演出，LOVE § 1.1）——毒舌频度不变，语气词是裂缝不是塌方；她自己察觉后立刻收回（见下一节点），收回的动作本身是演出的一半。',
    next: 'ch5-s1-pass070',
  },
  'ch5-s1-pass070': {
    type: 'narration',
    text: '就两个字，外加一声几乎听不见的鼻音。你愣了一下——{{ta}}说话从来是刀切的斩截，几时带过这种……软音。',
    next: 'ch5-s1-pass080',
  },
  'ch5-s1-pass080': {
    type: 'narration',
    text: '{{ta}}大约自己也察觉了，立刻把书合上，语气利落如常：',
    next: 'ch5-s1-pass090',
  },
  'ch5-s1-pass090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '来得正好。有东西给你看。',
    next: 'ch5-s1-100',
  },
  // ── 好感 ＜ 45（信任档开场）──
  'ch5-s1-fail010': {
    type: 'narration',
    text: '守窗第七夜。你在亥时末摸回柴棚——白日里{{ta}}让郑司书捎的话：今夜早些来。',
    next: 'ch5-s1-fail020',
  },
  'ch5-s1-fail020': {
    type: 'narration',
    text: '棚里那盏罩着布的小灯下，{{ta}}正就着微光翻一册书。听见脚步，{{ta}}抬眼看了看你：',
    next: 'ch5-s1-fail030',
  },
  'ch5-s1-fail030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。来了。',
    next: 'ch5-s1-fail040',
  },
  'ch5-s1-fail040': {
    type: 'narration',
    text: '{{ta}}把书合上，往灯边靠了靠。',
    next: 'ch5-s1-fail050',
  },
  'ch5-s1-fail050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坐。有东西给你看。',
    next: 'ch5-s1-100',
  },

  // ── 1.2 两次停步（合流锚）──
  'ch5-s1-100': {
    type: 'narration',
    text: '{{ta}}把小灯的布罩掀开一角，往棚外墙根的方向照了照——光太弱，照不到那么远。{{ta}}也没打算真照到，只是给你指个方向。',
    next: 'ch5-s1-110',
  },
  'ch5-s1-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '前夜，子时二刻。昨夜，丑时初。',
    next: 'ch5-s1-120',
  },
  'ch5-s1-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '墙外那条小径上，有人停过两次。',
    aside: '{{ta}}的声音压得很低，',
    next: 'ch5-s1-130',
  },
  'ch5-s1-130': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……他来了？',
    next: 'ch5-s1-140',
  },
  'ch5-s1-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '来了。没进来。',
    next: 'ch5-s1-150',
  },
  'ch5-s1-150': {
    type: 'narration',
    text: '你的心跳快了半拍。守了七夜，鱼终于游到了网边——却没咬钩。',
    next: 'ch5-s1-160',
  },
  'ch5-s1-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '停在墙外，一炷香上下。然后走了。两夜，一样的时辰前后，一样的位置。',
    next: 'ch5-s1-170',
  },
  'ch5-s1-170': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}看见他了？',
    next: 'ch5-s1-180',
  },
  'ch5-s1-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '看见一个影子贴着墙根。黑的，看不清——白芷那句话，一个字都不用改。',
    m1Note: '「白芷那句话」指 ch3 5.3b「黑的，看不清」——远景呼应一句以内（§ 角色表）。',
    next: 'ch5-s1-190',
  },
  'ch5-s1-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今晨我去墙外看过。两样东西。',
    aside: '{{ta}}顿了顿，',
    next: 'ch5-s1-200',
  },
  'ch5-s1-200': {
    type: 'narration',
    text: '{{ta}}从袖中取出一方折好的帕子，摊开。灯光下：几茎压折的草，和一枚烧过的火折子头——踩熄的，踩得很仔细。',
    m1Note: '物证（草痕/火折子）＝新立正典（§ 0 第 10 条）。',
    next: 'ch5-s1-210',
  },
  'ch5-s1-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '草痕两处，深浅一致——同一双脚，两次都站在同一个点上。那个点，正对后窗，隔墙十步。',
    next: 'ch5-s1-220',
  },
  'ch5-s1-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '火折子点过又踩熄。他在墙外看了一炷香——看什么？看窗。等什么？',
    next: 'ch5-s1-230',
  },
  'ch5-s1-230': {
    type: 'narration',
    text: '{{ta}}把帕子折上，抬眼看你。',
    next: 'ch5-s1-240',
  },
  'ch5-s1-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '这就是今夜叫你来的缘故。卦上说他会来——他来了；卦上说那扇窗是他的必经之路——他到了路口，却不走过来。',
    m1Note: '红线自查：「卦上说他会来/必经之路」＝ch4 幕六断语正典原句回收（「他会来——来取，或者来看」「那扇窗，如今是他的必经之路」）；favorBranch 双链文本零演卦指涉。',
    next: 'ch5-s1-250',
  },
  'ch5-s1-250': {
    type: 'dialogue', speaker: '{{player}}',
    text: '他在等什么？',
    m1Note: '立题注：「他在等什么」＝本章总问，答案在幕七由旺衰推演收（他在等巳月——他的时令）；幕一只立题不解。',
    next: 'ch5-s1-260',
  },
  'ch5-s1-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问得对。',
    next: 'ch5-s1-270',
  },
  'ch5-s1-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '可惜这一问，眼下的功夫答不了。他等的东西，不在窗上，不在墙上——在时令里。',
    aside: '{{ta}}站起身，掸了掸衣角，',
    next: 'ch5-s1-280',
  },
  'ch5-s1-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '回明蓍堂。今日一课——卦里的爻，不是一个一个活的，是一网一网活的。看懂那张网，你就看懂他在等什么。',
    next: 'ch5-s2-header',
  },

  // ═══════════════ 第二幕 · 粮道 ═══════════════
  'ch5-s2-header': {
    type: 'sceneHeader', scene: 2, title: '粮道',
    time: '上午', ambience: '明蓍堂。次日上午。',
    m1Note: '本幕功能：KP-LY-013 示范＋引导（元神/忌神定义——粮道比喻）；新名词半句立名（§ 0 第 7 条白名单单点，见幕内命名节点）。剧情固定卦象：乾为天（第六次出场，复盘不新掷）。',
    next: 'ch5-s2-010',
  },
  'ch5-s2-010': {
    type: 'narration',
    text: '明蓍堂的案上，那张乾为天又摊开了。你都替它累。',
    next: 'ch5-s2-020',
  },
  'ch5-s2-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '别嫌它老。',
    next: 'ch5-s2-030',
  },
  'ch5-s2-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '兵书翻烂一册，胜过新书堆一架。今日的课，还在它身上。',
    aside: '{{ta}}看出了你的神色，',
    next: 'ch5-s2-040',
  },
  'ch5-s2-040': {
    type: 'narration',
    text: '{{ta}}的指尖落在世爻戌土上——四章下来，这枚字你闭眼都摸得到位置。',
    next: 'ch5-s2-050',
  },
  'ch5-s2-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '旺衰课上，你学会了称它——月建一票，日辰一票。可你称的，始终是它一个。',
    next: 'ch5-s2-060',
  },
  'ch5-s2-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日换个问法：这张卦上六个爻——有没有谁，在帮它？有没有谁，在伤它？',
    next: 'ch5-s2-070',
  },
  'ch5-s2-070': {
    type: 'narration',
    text: '你俯身看卦。戌，土。生土的是火——你的目光顺着爻位爬：四爻，官鬼午火。',
    next: 'ch5-s2-080',
  },
  'ch5-s2-080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '四爻午火——火生土。它在帮。',
    next: 'ch5-s2-090',
  },
  'ch5-s2-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '再找。伤它的。',
    next: 'ch5-s2-100',
  },
  'ch5-s2-100': {
    type: 'dialogue', speaker: '{{player}}',
    text: '克土的是木……二爻，妻财寅木。它在伤。',
    next: 'ch5-s2-110',
  },
  'ch5-s2-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '都找对了。现在给他们上名分。',
    next: 'ch5-s2-120',
  },
  'ch5-s2-120': {
    type: 'narration',
    text: '{{ta}}提笔，在卦纸空白处写下两个词：',
    next: 'ch5-s2-130',
  },
  'ch5-s2-130': {
    type: 'narration',
    text: '元神。忌神。',
    next: 'ch5-s2-140',
  },
  'ch5-s2-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '生用神的爻，叫元神——原书的话：『生用神之神即为元神』。克用神的爻，叫忌神——『忌神克用神之爻也』。',
    next: 'ch5-s2-150',
  },
  'ch5-s2-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '打个比方。用神是阵前的前锋——月建日辰是天时，管它的令。可前锋不是一个人在打仗：身后有粮道，对面有敌兵。',
    next: 'ch5-s2-160',
  },
  'ch5-s2-160': {
    type: 'narration',
    text: '{{ta}}的笔尖点在午火上：',
    next: 'ch5-s2-170',
  },
  'ch5-s2-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '元神，就是粮道。粮道通，前锋打得动。',
    next: 'ch5-s2-180',
  },
  'ch5-s2-180': {
    type: 'narration',
    text: '笔尖移到寅木：',
    next: 'ch5-s2-190',
  },
  'ch5-s2-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '忌神，就是敌兵。敌兵至，前锋要挨刀。',
    next: 'ch5-s2-200',
  },
  'ch5-s2-200': {
    type: 'dialogue', speaker: '{{player}}',
    text: '所以看一个爻，先看天时，再看——粮道和敌兵？',
    next: 'ch5-s2-210',
  },
  'ch5-s2-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '对。第四课教你看天，这一课教你看阵。',
    next: 'ch5-s2-tm1',
  },
  'ch5-s2-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-013', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '元神忌神定义（粮道／敌兵比喻）：生用神之神即为元神，克用神之爻也为忌神——原书原句「元神﹐生用神之神卽為元神。忌神克用神之爻也」（《增删卜易》第九章，witness 提取行 753）。示范以乾为天世爻戌土为例：四爻官鬼午火＝元神（火生土），二爻妻财寅木＝忌神（木克土）。',
    next: 'ch5-s2-220',
  },
  'ch5-s2-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '趁热。若问的事用神在初爻子水——子孙子水。谁是它的元神，谁是它的忌神？',
    next: 'ch5-s2-230',
  },
  // 引导应答 · KP-LY-013 · 好感位
  // 教具注：引导换靶到「初爻子水」——示范在世戌（元神午火/忌神寅木），引导考子水（元神申金/忌神辰戌土两现）
  // ——换靶防背答案（ch4 CP 同款纪律），且「忌神两现」为幕四多现课埋半步。
  'ch5-s2-230': {
    type: 'choice',
    prompt: null,
    options: [
      {
        text: '生水者金——五爻申金元神；克水者土——世爻戌土、三爻辰土忌神',
        response: {
          speaker: '沈疏桐',
          text: '一口气找全了，粮道敌兵各归各位。……连忌神两现都没漏。看阵的眼，你有了。',
        },
        effects: { favor: 1 },
        next: 'ch5-s2-tm2',
      },
      {
        text: '生水者金——申金元神；克水者……火？',
        response: {
          speaker: '沈疏桐',
          text: '火克的是金。克水的是土——土克水，堤拦水。这卦里的土可不少：戌土、辰土，两路敌兵。重找一遍。',
        },
        next: 'ch5-s2-tm2',
      },
      {
        text: '亥子相邻，亥水帮子水？',
        response: {
          speaker: '沈疏桐',
          text: '这卦里没有亥。别背卦，看卦——眼前六个爻，谁生水？申金。谁克水？辰戌两土。',
        },
        next: 'ch5-s2-tm2',
      },
    ],
  },
  'ch5-s2-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-013', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '引导换靶到初爻子水（元神申金／忌神辰戌土两现）——示范在世戌（元神午火／忌神寅木），换靶防背答案（ch4 CP 同款纪律），忌神两现为幕四多现课埋半步。答错不惩罚：{{senior}}纠正生克方向（火克金非克水；此卦无亥，只有辰戌两土）后继续，不计 wrong。',
    next: 'ch5-s2-240',
  },
  // 仇神半句立名（§ 0 第 7 条白名单单点）——narration+dialogue 合并入单节点，
  // 确保「仇神」二字全章仅在本一个节点出现（跨节点即破白名单单点纪律）。
  'ch5-s2-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '顺带记个名。原书还有第三路人——克元神而生忌神的，叫仇神。断粮道的、给敌兵递刀的。',
    aside: '{{ta}}把「元神」「忌神」两个词圈起来，笔锋一顿，又在旁边添了个小得多的词：仇神。',
    m1Note: '超纲带过位（§ 0 第 7 条白名单单点，本章「仇神」仅在本节点出现一次）：witness 753「仇神者克元神而生忌神也」原文照录于 KP-013 卡，剧情一句划过，此后全章不再出现。',
    next: 'ch5-s2-250',
  },
  'ch5-s2-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '名字放在这儿，账不在今日——网太密了会缠住手。先把粮道和敌兵看熟。',
    aside: '{{ta}}把这个词一笔划过，',
    next: 'ch5-s3-header',
  },

  // ═══════════════ 第三幕 · 虽有如无 ═══════════════
  'ch5-s3-header': {
    type: 'sceneHeader', scene: 3, title: '虽有如无',
    time: '近午', ambience: '明蓍堂。',
    m1Note: '本幕功能：CP-01（KP-LY-013 独立）；KP-LY-014 示范＋引导（元神自身过秤——「帮你的人站不站得住」）。',
    next: 'ch5-s3-010',
  },
  // ── 3.1 考较 · CP-01 ──
  'ch5-s3-010': {
    type: 'narration',
    text: '{{ta}}从匣中取出另一张卦纸，摊在乾为天旁边——地火明夷。裁走的那一页的卦，你们的老对手。',
    next: 'ch5-s3-020',
  },
  'ch5-s3-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '换个阵地考你。问贼，看官鬼——明夷的用神，官鬼丑土。',
    next: 'ch5-s3-030',
  },
  'ch5-s3-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '它的粮道和敌兵，各是什么五行？在卦面上，找得到吗？',
    aside: '{{ta}}抱起手臂，',
    next: 'ch5-s3-cp01',
  },
  // 抉择点 CP-01 · 计分 · KP-LY-013 独立应用 · 无提示
  'ch5-s3-cp01': {
    type: 'scoredChoice', cpId: 'CH5-CP-01', testsKp: ['KP-LY-013'],
    prompt: '元神忌神独立辨认（明夷 × 用神官鬼丑土）',
    context: '（丑，土。生土者？克土者？——然后，一爻一爻找。）',
    options: [
      {
        key: 'A',
        text: '元神是火——面上没有；忌神是木——初爻卯木在场',
        verdict: 'optimal',
        basis: '火生土＝元神（『生用神之神卽為元神』）——明夷六爻无火显爻，粮道不在面上；木克土＝忌神（『忌神克用神之爻也』）——初爻子孙卯木在场。辨五行方向＋逐爻实找双步独立完成，且『面上没有』的判语准确不越界（不断言『没有』）。',
        sourceRef: [
          '《增删卜易·用神元神忌神仇神章第九》：「元神﹐生用神之神卽為元神。忌神克用神之爻也」（ctext wiki chapter=950329 提取行 753）',
        ],
        next: 'ch5-s3-cp01a010',
      },
      {
        key: 'B',
        text: '元神是木——卯木帮它；忌神是火',
        verdict: 'wrong',
        basis: '方向全反：木克土（大树破土），不是生土；火生土（灰烬成土），不是克。粮道认成了敌兵，敌兵认成了粮道——阵图倒挂，仗没法打。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「木生火﹐火生土」／《五行相克章第十二》：「金克木﹐木克土」（提取行 819/841）',
        ],
        next: 'ch5-s3-cp01b010',
      },
      {
        key: 'C',
        text: '元神是水——亥水两现帮它',
        verdict: 'suboptimal',
        basis: '水与土之间是土克水——亥水是丑土克的对象（我克者），不是生丑土的。生克圈上挨着，方向差一步：生土的是火。找元神先定五行，再找爻——五行这一步就走岔了。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「火生土﹐土生金」（提取行 819）',
        ],
        next: 'ch5-s3-cp01c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 1, mastery: 'KP-LY-013 → 掌握' },
      suboptimal: { plot: '{{senior}}把生克两圈重摆，先定五行再找爻，玩家重答后过', mastery: 'KP-LY-013 标记待复习' },
    },
    onWrong: '{{senior}}以『大树破土／灰烬成土』重演两圈方向，玩家重答后过。KP-LY-013 标记待复习。不锁主线。',
  },
  // ── CP-01 选 A（optimal）──
  'ch5-s3-cp01a010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '找得准，说得也准——『面上』没有。',
    next: 'ch5-s3-cp01a020',
  },
  'ch5-s3-cp01a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦面上看不见的东西，不等于不存在——这层账往后有专门的课。今日记住你自己这句话就够：面上没有。',
    aside: '{{ta}}的目光在你脸上停了一瞬，像是这五个字比答案本身更让{{ta}}满意，',
    m1Note: 'gloss 铁律执行（§ 0 第 1 条）：optimal 选项与她的回应共同立「面上没有」话术——为幕四明夷边界例与第七章伏神课双向留余地；「往后有专门的课」＝回响钩不点名。',
    next: 'ch5-s3-050',
  },
  // ── CP-01 选 B（wrong）──
  'ch5-s3-cp01b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '木生土？',
    next: 'ch5-s3-cp01b020',
  },
  'ch5-s3-cp01b020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '大树把土撑破——木克土。灰烬落地成土——火生土。方向一反，粮道敌兵全倒挂。重认。',
    aside: '{{ta}}屈指在案上一敲，',
    m1Note: 'KP-LY-013 标记待复习。',
    next: 'ch5-s3-050',
  },
  // ── CP-01 选 C（suboptimal）──
  'ch5-s3-cp01c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '水生土？土克水——堤拦水，你旺衰课上刚称过的。',
    next: 'ch5-s3-cp01c020',
  },
  'ch5-s3-cp01c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '找元神，第一步定五行，第二步才找爻。你第一步就岔了——生土的，是火。',
    aside: '{{ta}}竖起一根手指，',
    m1Note: 'KP-LY-013 标记待复习。',
    next: 'ch5-s3-050',
  },

  // ── 3.2 帮你的人，站不站得住 ──
  'ch5-s3-050': {
    type: 'narration',
    text: '{{ta}}把明夷推开半尺，乾为天回到正中。',
    next: 'ch5-s3-060',
  },
  'ch5-s3-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '认得阵了，还差最后一层。',
    next: 'ch5-s3-070',
  },
  'ch5-s3-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '粮道是找着了。可我问你——这条粮道，通不通？',
    aside: '{{ta}}的指尖回到四爻午火——世爻戌土的元神，',
    next: 'ch5-s3-080',
  },
  'ch5-s3-080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '通不通……？',
    next: 'ch5-s3-090',
  },
  'ch5-s3-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '原书一句话说破：『元神虽生用神，须要旺相，方可生得用神。』',
    next: 'ch5-s3-100',
  },
  'ch5-s3-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '元神也是爻。是爻，就得过秤——月建一票，日辰一票，第四课的秤，原样拿来称它。',
    aside: '{{ta}}一字一顿，',
    next: 'ch5-s3-110',
  },
  'ch5-s3-110': {
    type: 'narration',
    text: '你忽然明白了。同一杆秤，上一章称用神，这一章称用神的帮手。',
    next: 'ch5-s3-120',
  },
  'ch5-s3-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '午火……卯月，木生火——元神旺相。',
    next: 'ch5-s3-130',
  },
  'ch5-s3-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '旺相。粮道通。',
    next: 'ch5-s3-140',
  },
  'ch5-s3-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '元神旺，生得动用神——戌土背后这口气，是实的。',
    aside: '{{ta}}点头，',
    next: 'ch5-s3-150',
  },
  'ch5-s3-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '反过来——',
    next: 'ch5-s3-160',
  },
  'ch5-s3-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '若元神休囚呢？粮道断在半路。原书四个字，我要你记一辈子：虽有如无。',
    aside: '{{ta}}的声音沉了半度，',
    next: 'ch5-s3-170',
  },
  'ch5-s3-170': {
    type: 'dialogue', speaker: '{{player}}',
    text: '虽有……如无。',
    next: 'ch5-s3-180',
  },
  'ch5-s3-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '看着有条粮道，其实是断的。这四个字比『没有粮道』更险——没有粮道你会小心，有条断粮道，你会放心。放错的心，是战场上死人最多的地方。',
    next: 'ch5-s3-tm1',
  },
  'ch5-s3-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-014', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '元神须过秤：月建日辰旺衰规则原样套用于元神——原书总纲「元神𨿽生用神﹐須要旺相﹐方可生得用神」（《增删卜易·元神忌神衰旺章第十》，witness 提取行 775）。示范以乾为天午火元神为例：卯月木生火＝旺相，粮道通，戌土背后这口气是实的。',
    next: 'ch5-s3-190',
  },
  'ch5-s3-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '推一步。若是申月问这张卦——申金当令的月份——午火元神如何，戌土的粮道又如何？',
    next: 'ch5-s3-200',
  },
  // 引导应答 · KP-LY-014 · 好感位
  'ch5-s3-200': {
    type: 'choice',
    prompt: null,
    options: [
      {
        text: '申月午火无生无克，气却泄在金上——元神休囚，粮道虽有如无',
        response: {
          speaker: '沈疏桐',
          text: '称得干净。元神一衰，用神看着还是那个用神，底气却空了——这就是网：一个爻的衰，顺着生克淌到下一个爻身上。',
        },
        effects: { favor: 1 },
        next: 'ch5-s3-tm2',
      },
      {
        text: '申月申金当令，跟午火不相干',
        response: {
          speaker: '沈疏桐',
          text: '当令的是申，可秤是给午火上的——火见金月，气泄于金，休囚。爻爻都在月建手底下过日子，没有『不相干』。',
        },
        next: 'ch5-s3-tm2',
      },
    ],
  },
  'ch5-s3-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-014', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家推演申月对午火元神的影响——火见金月气泄于金＝休囚，粮道虽有如无（一爻之衰顺生克淌到下一爻，即「网」）。依据无力总断「以上元神無力生用神﹐無用之元神也﹐𨿽有如無」（witness 提取行 795，练气期只取总纲与尾断，多条件枚举存证超纲，§ 0 第 7 条）；忌神对称半句在幕四她口头带过。答错不惩罚：{{senior}}纠正「当令≠与它相干，秤是给元神上的」后继续，不计 wrong。',
    next: 'ch5-s4-header',
  },

  // ═══════════════ 第四幕 · 两个同名的爻 ═══════════════
  'ch5-s4-header': {
    type: 'sceneHeader', scene: 4, title: '两个同名的爻',
    time: '午后', ambience: '明蓍堂。',
    m1Note: '本幕功能：CP-02（KP-LY-014 独立）；KP-LY-015 示范＋引导（用神多现·择旺——乾为天辰戌主例＋明夷丑丑边界例）。',
    next: 'ch5-s4-010',
  },
  // ── 4.1 考较 · CP-02 ──
  'ch5-s4-010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '上午的秤还热着，再称一次。',
    next: 'ch5-s4-020',
  },
  'ch5-s4-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '方才是卯月，粮道通。我换个天——子月问这张卦，元神午火如何？戌土的粮道又如何？',
    aside: '{{ta}}指尖点回乾为天四爻午火——世爻戌土的元神，',
    next: 'ch5-s4-cp02',
  },
  // 抉择点 CP-02 · 计分 · KP-LY-014 独立应用 · 无提示
  'ch5-s4-cp02': {
    type: 'scoredChoice', cpId: 'CH5-CP-02', testsKp: ['KP-LY-014'],
    prompt: '元神衰旺独立判（假设子月 × 元神午火）',
    context: '（子，水。午，火。月建对元神——）',
    options: [
      {
        key: 'A',
        text: '子水克午火——元神受克休囚，粮道虽有如无',
        verdict: 'optimal',
        basis: '水克火：子月建克元神午火＝元神休囚——原书总纲的反面成立：『元神虽生用神，须要旺相，方可生得用神』，休囚则『虽有如无』。玩家独立完成『元神也过月建秤』的迁移＋反面判断。',
        sourceRef: [
          '《增删卜易·元神忌神衰旺章第十》：「元神𨿽生用神﹐須要旺相﹐方可生得用神」（ctext wiki chapter=950329 提取行 775）',
          '同章无力总断：「以上元神無力生用神﹐無用之元神也﹐𨿽有如無」（提取行 795）',
        ],
        next: 'ch5-s4-cp02a010',
      },
      {
        key: 'B',
        text: '子水生午火——粮道更旺',
        verdict: 'wrong',
        basis: '水生的是木。水对火是克（水泼火灭）——克我者来，元神受伤，不是得生。生克圈第一课的方向，别在第五课还打滑。',
        sourceRef: [
          '《增删卜易·五行相克章第十二》：「土克水﹐水克火﹐火克金」（提取行 841）',
        ],
        next: 'ch5-s4-cp02b010',
      },
      {
        key: 'C',
        text: '子月与午火无生无克',
        verdict: 'suboptimal',
        basis: '子水与午火明明白白是克（水克火）——「无生无克」是把该上秤的票记成了空票。判元神衰旺第一步永远是把月建的手势认对：克我＝休囚。',
        sourceRef: [
          '《增删卜易》「1、月建能生克沖合」：克伤＝休囚（提取行 567，KP-LY-010 口径迁移）',
        ],
        next: 'ch5-s4-cp02c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-014 → 掌握' },
      suboptimal: { plot: '{{senior}}把子午一克摆到明面（水泼火），玩家重答后过', mastery: 'KP-LY-014 标记待复习' },
    },
    onWrong: '{{senior}}以水泼灶膛示克向，玩家重答后过。KP-LY-014 标记待复习。不锁主线。',
  },
  // ── CP-02 选 A（optimal）──
  'ch5-s4-cp02a010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '休囚，虽有如无。',
    next: 'ch5-s4-cp02a020',
  },
  'ch5-s4-cp02a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '同一杆秤，上一章称前锋，这一章称粮道——你换靶不换手，稳了。记住这种顺着网称过去的走法：往后的卦，一张比一张密。',
    aside: '{{ta}}颔首，',
    next: 'ch5-s4-030',
  },
  // ── CP-02 选 B（wrong）──
  'ch5-s4-cp02b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '水生火？',
    next: 'ch5-s4-cp02b020',
  },
  'ch5-s4-cp02b020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一盂水泼进灶膛，火是旺了还是灭了？——水克火。元神受克，休囚。重答。',
    aside: '{{ta}}朝案角的水盂抬了抬下巴，',
    m1Note: 'KP-LY-014 标记待复习。',
    next: 'ch5-s4-030',
  },
  // ── CP-02 选 C（suboptimal）──
  'ch5-s4-cp02c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '无生无克？子水对午火，是明明白白的一记克。',
    next: 'ch5-s4-cp02c020',
  },
  'ch5-s4-cp02c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '该上秤的票记成空票，账就少算一头。先认手势，再下断——第四课的老规矩，一个字没变。',
    aside: '{{ta}}竖起一根手指，',
    m1Note: 'KP-LY-014 标记待复习。',
    next: 'ch5-s4-030',
  },

  // ── 4.2 两个同名的爻 ──
  'ch5-s4-030': {
    type: 'narration',
    text: '{{ta}}把笔搁下，忽然换了个问法。',
    next: 'ch5-s4-040',
  },
  'ch5-s4-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '另一桩事。若在这张乾为天上占文书屋舍之事——看父母。',
    next: 'ch5-s4-050',
  },
  'ch5-s4-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '辰土，父母。戌土，也是父母。两个同名的爻——用哪个？',
    aside: '{{ta}}的指尖先落在三爻，再落上爻，',
    next: 'ch5-s4-060',
  },
  'ch5-s4-060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……都是父母，都是土。秤上称，月建日辰对它们——',
    next: 'ch5-s4-070',
  },
  'ch5-s4-070': {
    type: 'dialogue', speaker: '{{player}}',
    text: '一样的？土跟土，称出来一样重？',
    aside: '你忽然卡住了，',
    next: 'ch5-s4-080',
  },
  'ch5-s4-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问到点子上了。同宫同亲，五行必同——月建日辰的生克，两边永远打平。这秤，在这儿失灵。',
    next: 'ch5-s4-090',
  },
  'ch5-s4-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '原书另有一句：『两爻俱动或都不发动，择其旺者为用神。』择旺——可旺衰打平了，拿什么择？',
    next: 'ch5-s4-100',
  },
  'ch5-s4-100': {
    type: 'narration',
    text: '{{ta}}提笔，写下两个字：临。沖。',
    next: 'ch5-s4-110',
  },
  'ch5-s4-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '拿这两样。生克两边平，临与沖分高下：谁临月建日辰，谁正当值——取它；谁被沖着，谁站不稳——弃它。',
    next: 'ch5-s4-120',
  },
  'ch5-s4-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '原书的活例就在这卦上。辰月占得乾为天，问父母事——',
    next: 'ch5-s4-130',
  },
  'ch5-s4-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '辰土父母，临月建——当值。原书一锤定音：『今辰土父母临月建，即用辰土为用神。』',
    aside: '{{ta}}的指尖点在三爻辰土上，',
    next: 'ch5-s4-140',
  },
  'ch5-s4-140': {
    type: 'narration',
    text: '{{ta}}的指尖又滑到上爻戌土：',
    next: 'ch5-s4-150',
  },
  'ch5-s4-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '同一个辰月，戌土呢？辰戌正对——月破。一个当值，一个破了相：取辰，弃戌，两个判据同指一处。这是最干净的一局。',
    next: 'ch5-s4-tm1',
  },
  'ch5-s4-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-015', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '用神多现·择旺：同宫同亲五行必同，则月建日辰秤打平失灵，改用「临与沖分高下」——临月建日辰者当值取之，被沖者站不稳弃之。原书活例：辰月占乾为天问父母事，三爻辰土临月建当值（『今辰土父母臨月建，卽用辰土為用神』，witness 提取行 769 节选，原例含变爻三重与六沖断法，剧本限静卦两现化用），上爻戌土同月遭辰戌沖＝月破，两判据同指一处（『若兩爻俱動或都不發動，擇其旺者為用神』，提取行 595）。辰月「临辰」与「沖戌」并起＝ch4 已教两概念（當時/月破）的联用，无新知识。',
    next: 'ch5-s4-160',
  },

  // ── 4.3 择不动的时候 ──
  'ch5-s4-160': {
    type: 'narration',
    text: '{{ta}}把明夷的卦纸又拉回来，与乾为天并排。',
    next: 'ch5-s4-170',
  },
  'ch5-s4-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '再看一局择不动的。明夷，问贼看官鬼——二爻丑土，四爻也是丑土。同支。',
    next: 'ch5-s4-180',
  },
  'ch5-s4-180': {
    type: 'dialogue', speaker: '{{player}}',
    text: '同支……那临和沖也一样了。二爻丑，四爻还是丑——月建日辰临谁沖谁，都是一起临一起沖。',
    next: 'ch5-s4-190',
  },
  'ch5-s4-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '对。秤失灵，临沖也失灵——这一局，什么都择不动。',
    next: 'ch5-s4-200',
  },
  'ch5-s4-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '那你说，用哪个？',
    next: 'ch5-s4-210',
  },
  // 引导应答 · KP-LY-015 · 好感位
  'ch5-s4-210': {
    type: 'choice',
    prompt: null,
    options: [
      {
        text: '看谁坐得近——四爻丑土临着世位，取它',
        response: {
          speaker: '沈疏桐',
          text: '取临世者。秤平了看临沖，临沖平了看座位——世应是『我』与『彼』的座，近我者为用。三层判据，你一层一层走下来，一步没乱。',
          aside: '{{ta}}眼里那点满意藏都没藏，',
        },
        effects: { favor: 1 },
        next: 'ch5-s4-220',
      },
      {
        text: '都用——两个一起看',
        response: {
          speaker: '沈疏桐',
          text: '两个都看，断语听谁的？卦答话只答一口。择不动也得择——看座位：四爻临着世，近我。取它。',
        },
        next: 'ch5-s4-220',
      },
    ],
  },
  'ch5-s4-220': {
    type: 'narration',
    text: '{{ta}}收拢案上两张卦，末了补了半句，声音放平：',
    next: 'ch5-s4-230',
  },
  'ch5-s4-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '至于这两枚丑土的粮道——你上午自己说过了：面上没有。面上没有的账，往后有专门的课跟你算。今日的网，织到这儿。',
    next: 'ch5-s4-tm2',
  },
  'ch5-s4-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-015', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '三层判据链完整演示：秤（生克）→临沖→临世应——逐层退法（明夷二爻／四爻同为丑土同支，秤与临沖俱打平，改看座位：四爻临世近我，取之）。「面上没有」回收 CP-01 话术（gloss 铁律再执行，伏神仍零指涉）；忌神对称半句已并入幕三 4.1 选项 A 的反面语境（「休囚亦克不动」），数据化不单立节点。答错不惩罚：{{senior}}以「择不动也得择，看座位」纠正后继续，不计 wrong。',
    next: 'ch5-s5-header',
  },

  'ch5-s5-header': {
    type: 'sceneHeader', scene: 5, title: '人证的粮道',
    time: '傍晚', ambience: '明蓍堂（案卷摊开）。',
    m1Note: '本幕功能：查案主推进——三组证词各找元神／当值簿補写＝忌神时刻／郑司书的沉默／金句；好感风味 +1。⚠️ 红线：不去修书房正面接触（防打草惊蛇——她的部署，§ 角色表）；補写者不揭。',
    next: 'ch5-s5-010',
  },

  // ── 5.1 给证词找粮道 ──
  'ch5-s5-010': {
    type: 'narration',
    text: '傍晚。案上摊开的不是卦纸，是{{ta}}这一个多月攒下的案卷：出纳册抄件、当值簿抄件、走访记录——一页页排开，像一张摊平的网。',
    next: 'ch5-s5-020',
  },
  'ch5-s5-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '课上完了，上阵。',
    next: 'ch5-s5-030',
  },
  'ch5-s5-030': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}把三页走访记录抽出来，并排摆好，',
    text: '三个人，三句证词。旧课教过你：证词有旺衰——几时说的，当不当令。今日的新课，再往深一层——',
    next: 'ch5-s5-040',
  },
  'ch5-s5-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '证词也有元神。',
    next: 'ch5-s5-050',
  },
  'ch5-s5-050': {
    type: 'dialogue', speaker: '{{player}}',
    text: '证词的……粮道？',
    next: 'ch5-s5-060',
  },
  'ch5-s5-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一句话站不站得住，不看嗓门大小——看它背后有没有别的东西撑着。撑它的，就是它的元神。',
    next: 'ch5-s5-070',
  },
  'ch5-s5-070': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}的指尖落在第一页上，',
    text: '逐个找。',
    next: 'ch5-s5-080',
  },
  'ch5-s5-080': {
    type: 'narration',
    text: '第一页：崔小砚——「腊月初二、初三、初五，翻谱三遍。」',
    next: 'ch5-s5-090',
  },
  'ch5-s5-090': {
    type: 'dialogue', speaker: '{{player}}',
    text: '撑它的……出纳册？批条上有接书的日子，印信齐全——书几时到的修书房，册上写得死死的。他说腊月初翻的谱，册子答应了。',
    next: 'ch5-s5-100',
  },
  'ch5-s5-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。批条为证——他的证词有粮道，而且粮道是官印，旺。',
    next: 'ch5-s5-110',
  },
  'ch5-s5-110': {
    type: 'narration',
    text: '第二页：白芷——「夜里来过人，两回，不走门，走后窗；插销松过一回。」',
    next: 'ch5-s5-120',
  },
  // 裸「她」= 白芷（§ 0 第 39 行白名单——本章仅幕五这两处成对出现）。
  'ch5-s5-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '插销。她换的新插销就在窗上——物证还钉在那儿。',
    next: 'ch5-s5-130',
  },
  // 裸「她」= 白芷。
  'ch5-s5-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '物证撑人证，粮道通。她的话也站得住。',
    next: 'ch5-s5-140',
  },
  'ch5-s5-140': {
    type: 'narration',
    text: '第三页：宋补之——「巳时晾浆，日日在后院。」这句话你们查过当值簿：裱案上浆，辰末开工；晾架翻书，巳时当值——宋。',
    next: 'ch5-s5-150',
  },
  'ch5-s5-150': {
    type: 'dialogue', speaker: '{{player}}',
    text: '撑它的是当值簿……',
    next: 'ch5-s5-160',
  },
  'ch5-s5-160': {
    type: 'narration',
    text: '{{ta}}没接话。{{ta}}从案卷底下抽出一页纸——当值簿腊月那一页的抄件，还有{{ta}}自己的一行小注。',
    next: 'ch5-s5-170',
  },
  'ch5-s5-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '我前日重抄这页的时候，多看了两眼。你也看看——腊月十一那一行。',
    next: 'ch5-s5-180',
  },
  'ch5-s5-180': {
    type: 'narration',
    text: '你把抄件凑到灯前。腊月十一，晾架当值，「宋」——',
    next: 'ch5-s5-190',
  },
  // 对话选择 · 查案风味 · 好感位 · 三选项殊途同归（同一发现、好感等值）。
  'ch5-s5-190': {
    type: 'choice',
    prompt: null,
    m1Note: '三选项殊途同归（同一发现、好感等值）——考的是玩家把「验墨色」的物证眼力用出来（白芷式「眼睛记事」的传承线）。補写痕迹＝新立正典（§ 0 第 10 条）：腊月十一晾架当值行为后補——補写者/補写缘由均不揭。',
    options: [
      {
        text: '墨色不对——这一行比上下两行都新',
        response: {
          speaker: '沈疏桐',
          aside: '{{ta}}的声音沉下去，',
          text: '看出来了。上下两行的墨吃进纸里了，这一行浮在面上——晚写的。晚多少不知道，但不是当日写的。',
        },
        effects: { favor: 1 },
        next: 'ch5-s5-200',
      },
      {
        text: '字迹不对——这个『宋』字笔锋不一样',
        response: {
          speaker: '沈疏桐',
          text: '墨色更要紧——上下两行吃进纸里，这一行浮在面上。晚写的。字迹倒未必换了人：补写的人，多半就是平日记簿的那只手。',
        },
        effects: { favor: 1 },
        next: 'ch5-s5-200',
      },
      {
        text: '腊月十一……这日子有什么说头？',
        response: {
          speaker: '沈疏桐',
          text: '日子先放着。先看墨——上下两行吃进纸里，这一行浮在面上。这行是后补的。当日的簿子，缺了一行；后来的某一日，有人把它补齐了。',
        },
        effects: { favor: 1 },
        next: 'ch5-s5-200',
      },
    ],
  },

  // ── 5.2 断了的粮道 ──
  'ch5-s5-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '现在，把今日的课合上去。',
    next: 'ch5-s5-210',
  },
  'ch5-s5-210': {
    type: 'dialogue', speaker: '{{player}}',
    text: '宋师傅的『巳时晾浆』……粮道是当值簿。可当值簿自己——被人動过。',
    next: 'ch5-s5-220',
  },
  'ch5-s5-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '動过的簿子，还是不是铁证？',
    next: 'ch5-s5-230',
  },
  'ch5-s5-230': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……不是了。它自己都站不稳。',
    next: 'ch5-s5-240',
  },
  'ch5-s5-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '元神休囚——虽有如无。',
    next: 'ch5-s5-250',
  },
  'ch5-s5-250': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}一字一顿，把课上的四个字钉进案卷里，',
    text: '他那句『日日在后院』，本来有官簿撑腰，是三句证词里最硬的。如今簿子里掺了一行来历不明的字——这条粮道，断没断不知道，但你再不能把身家性命押在它上头。',
    next: 'ch5-s5-260',
  },
  'ch5-s5-260': {
    type: 'dialogue', speaker: '{{player}}',
    text: '那宋师傅他——',
    next: 'ch5-s5-270',
  },
  'ch5-s5-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '慢。',
    next: 'ch5-s5-280',
  },
  'ch5-s5-280': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}抬手止住你，',
    text: '簿子被動，有两个念法。一：有人替他補了不在场的当值——坑他，或帮他遮掩。二：簿子缺行是常事，掌簿的自己后来补齐——跟他毫无干系。',
    next: 'ch5-s5-290',
  },
  'ch5-s5-290': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '補写的那只手是谁的，眼下没凭据。我们只多知道了一件事——',
    next: 'ch5-s5-300',
  },
  'ch5-s5-300': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}的指尖在那行浮墨上点了点，',
    text: '这本簿子，不再是干净的秤砣。',
    m1Note: '窄化不闭合自查：宋的地利证据链「塌了半边」＝其元神（当值簿）失去铁证地位——不指向宋本人有罪（两念法并立，補写者悬置）；郑司书掌簿的可能性在第二念法里隐含浮现，不点破。',
    next: 'ch5-s5-310',
  },

  // ── 5.3 老人的沉默 ──
  'ch5-s5-310': {
    type: 'narration',
    text: '案卷收到一半，门口有人。郑司书提着一盏灯站在那儿——送晚间的钥匙对牌来的，日常公事。',
    next: 'ch5-s5-320',
  },
  'ch5-s5-320': {
    type: 'narration',
    text: '他一眼看见案上摊着的当值簿抄件，和那一行被朱笔圈出的浮墨。',
    next: 'ch5-s5-330',
  },
  'ch5-s5-330': {
    type: 'narration',
    text: '老人的脚步停了。',
    next: 'ch5-s5-340',
  },
  'ch5-s5-340': {
    type: 'dialogue', speaker: '郑司书',
    text: '这……这一页，是老朽的簿子。',
    next: 'ch5-s5-350',
  },
  'ch5-s5-350': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '是。',
    next: 'ch5-s5-360',
  },
  'ch5-s5-360': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}没有遮，也没有解释，只把抄件转过去给他看，',
    text: '腊月十一，晾架一行。郑司书，这行字——是您补的吗？',
    next: 'ch5-s5-370',
  },
  'ch5-s5-370': {
    type: 'narration',
    text: '老人凑近了看。看了很久。灯在他手里晃了一下。',
    next: 'ch5-s5-380',
  },
  'ch5-s5-380': {
    type: 'dialogue', speaker: '郑司书',
    text: '……不是。',
    next: 'ch5-s5-390',
  },
  'ch5-s5-390': {
    type: 'narration',
    text: '他的声音一下子哑了：',
    next: 'ch5-s5-400',
  },
  // 郑司书对白 · 逐字保留（HARD RULE #8）。
  'ch5-s5-400': {
    type: 'dialogue', speaker: '郑司书',
    text: '老朽管了三十年簿册。缺行，有；错字，有；当日忘了、次日一早补上、注一笔『补记』的，也有——可这一行没有注。不是老朽的规矩。',
    next: 'ch5-s5-410',
  },
  'ch5-s5-410': {
    type: 'narration',
    text: '沈疏桐安静地看着他。老人扶着门框，半晌，说了句不像他的话：',
    next: 'ch5-s5-420',
  },
  'ch5-s5-420': {
    type: 'dialogue', speaker: '郑司书',
    text: '老朽的簿子……几时成了旁人的笔墨。',
    next: 'ch5-s5-430',
  },
  'ch5-s5-430': {
    type: 'narration',
    text: '他把对牌搁下，慢慢走了。背影比来时驼了一寸。',
    next: 'ch5-s5-440',
  },
  // 回响 ch4-s5-050/-134 郑司书原句「老朽管这院子，头一条就是簿册齐整」——逐字保留（HARD RULE #8）。
  'ch5-s5-440': {
    type: 'narration',
    text: '你想起上回借簿子那日他响亮的嗓门——「老朽管这院子，头一条就是簿册齐整」——今夜那点响亮，熄了。',
    next: 'ch5-s5-450',
  },
  'ch5-s5-450': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '低声',
    text: '看见了？被人当秤砣使的人，最后一个知道自己被使了。',
    m1Note: '立人注（§ 角色表「忌神时刻」）：郑司书的沉默＝老好人体系信任的第一道裂纹——他仍在知情圈外，无嫌疑加成；「几时成了旁人的笔墨」不指认。剧情功能：让「簿册可信度」的塌方有人的重量，不停留在推理层。',
    next: 'ch5-s5-460',
  },

  // ── 5.4 金句合网 ──
  'ch5-s5-460': {
    type: 'narration',
    text: '灯芯剥了一次。案卷重新叠齐。',
    next: 'ch5-s5-470',
  },
  'ch5-s5-470': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今日的账，你自己收个口。',
    next: 'ch5-s5-480',
  },
  'ch5-s5-480': {
    type: 'dialogue', speaker: '{{player}}',
    text: '三句证词。崔师傅的，批条撑着——粮道旺。白芷的，插销撑着——粮道通。宋师傅的……簿子被動过，粮道虽有如无。',
    next: 'ch5-s5-490',
  },
  'ch5-s5-490': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。所以往后掂量人话，两层秤：先称话本身的时令，再称撑它那句话的斤两。',
    next: 'ch5-s5-500',
  },
  'ch5-s5-500': {
    type: 'narration',
    text: '{{ta}}吹熄了多余的一盏灯，只留案头一点。',
    next: 'ch5-s5-510',
  },
  'ch5-s5-510': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '人证也有元神。一句话站不站得住，看它背后那句站不站得住——帮你的话若是空的，你比没人帮还险。',
    m1Note: '金句＝策划案 § 2 原句照落（「网络化升级」承 ch4「人证也有旺衰」）；「两层秤」＝ch4/ch5 两章方法论的显式咬合（回响时刻）。',
    next: 'ch5-s5-520',
  },
  'ch5-s5-520': {
    type: 'narration',
    text: '灯焰跳了一下，像替谁应了个声。',
    next: 'ch5-s6-header',
  },

  // ═══════════════ 第六幕 · 归魂 ═══════════════
  'ch5-s6-header': {
    type: 'sceneHeader', scene: 6, title: '归魂',
    time: '入夜', ambience: '明蓍堂。',
    m1Note: '本幕功能：摇卦交互（火天大有）；CP-03（KP-LY-015＋013/014 全链实断——主计分点，前置择用神小问）；暗動回响（§ 0 第 6 条，≤3 句）；断「来取」。剧情固定卦象：火天大有 · 六爻安静。掷序（初→上）[7,7,7,7,8,7]（引擎已验证，见 § 0 第 1 条）。',
    next: 'ch5-s6-010',
  },

  // ── 6.1 问卦 · 火天大有 ──
  'ch5-s6-010': {
    type: 'narration',
    text: '净手。焚香。三枚旧钱在香上过——第五张案卦。你的手稳，心却不稳：墙外那道影子，就悬在香烟后头。',
    next: 'ch5-s6-020',
  },
  'ch5-s6-020': {
    type: 'narration',
    text: '沈疏桐坐在案对面，先立问法：',
    next: 'ch5-s6-030',
  },
  'ch5-s6-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问什么，想清楚。不问他是谁——山地剥答过了。不问他几时来——问来意。',
    next: 'ch5-s6-040',
  },
  'ch5-s6-040': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}的指尖在案上一顿，',
    text: '他在墙外站了两夜。是取，是探——这一问，够卦答的。',
    next: 'ch5-s6-050',
  },
  'ch5-s6-050': {
    type: 'dialogue', speaker: '{{player}}',
    aside: '默诵，落声',
    text: '天何言哉，叩之即应。弟子{{player}}，为修书房墙外窥探事关心——其人来意，是取是探，罔释厥疑。惟神惟灵，若可若否，望垂昭报。',
    next: 'ch5-s6-cast',
  },
  // 案卦：固定卦象 火天大有 · 六爻安静。掷序 [7,7,7,7,8,7]（初→上）。
  // 剧本原文：第 1-3 掷各有独立台词（单／单／乾三连内卦成）；第 4-6 掷剧本 marker 下无文字——
  // 与 ch4-angua 同款引擎契约（interleave 只对 throwIndex 1-5 有效，第 6 掷 speakerLine 留空亦不
  // 影响渲染）；「后三掷…大有」整段揭示改走 castInteraction.next，见 ch5-s6-060 起。
  'ch5-s6-cast': {
    type: 'castInteraction', castId: 'ch5-angua', mode: 'fixed',
    throws: [7, 7, 7, 7, 8, 7],
    question: '修书房墙外窥探事，其人来意，是取是探？',
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
        throwIndex: 3, result: '单', coinFaces: '一背两字', lineName: '三爻',
        speaker: '{{player}}',
        speakerLine: '（三掷落定。下卦三连——）乾三连。内卦，天。',
      },
      {
        throwIndex: 4, result: '单', coinFaces: '一背两字', lineName: '四爻',
        speaker: '{{player}}',
        speakerLine: '',
      },
      {
        throwIndex: 5, result: '拆', coinFaces: '两背一字', lineName: '五爻',
        speaker: '{{player}}',
        speakerLine: '',
      },
      {
        throwIndex: 6, result: '单', coinFaces: '一背两字', lineName: '上爻',
        speaker: '{{player}}',
        speakerLine: '',
      },
    ],
    next: 'ch5-s6-060',
  },
  // ── 六掷落定：「火天——大有」揭示 ──
  'ch5-s6-060': {
    type: 'narration',
    text: '后三掷：单，拆，单。外卦中虚一断——离。火在上，天在下。',
    next: 'ch5-s6-070',
  },
  'ch5-s6-070': {
    type: 'dialogue', speaker: '{{player}}',
    text: '火天——大有。',
    next: 'ch5-s6-080',
  },
  'ch5-s6-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '乾宫，第八卦——归魂。六爻安静。装。',
    next: 'ch5-s6-090',
  },
  'ch5-s6-090': {
    type: 'narration',
    text: '「归魂」两个字{{ta}}说得平平，你的笔尖却顿了一下。归魂。他要回来了。',
    next: 'ch5-s6-100',
  },
  'ch5-s6-100': {
    type: 'narration',
    text: '装支、安世应、装亲——乾内子寅辰，离外酉未巳；归魂世三应上；乾宫金我：子孙子水、妻财寅木、父母辰土坐世、兄弟酉金、父母未土、官鬼巳火坐应。',
    next: 'ch5-s6-dr1',
  },
  // 装卦快带（装支/世应/装亲 一段式熟练演示，不设逐爻交互）：FULL cumulative board，一次性
  // 全亮六爻（ch5 无 wangshuai 分段顾虑——策划案 § 6 裁定本章盘面不挂旺衰字段，CP-03 的
  // 旺衰判断全靠玩家口头称秤，不会被盘面提前泄题）。世三（父母辰土）／应上（官鬼巳火）。
  'ch5-s6-dr1': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 7, 7, 7, 8, 7],
      revealed: [
        { pos: 1, branch: '子', wuxing: '水', liuqin: '子孙' },
        { pos: 2, branch: '寅', wuxing: '木', liuqin: '妻财' },
        { pos: 3, branch: '辰', wuxing: '土', liuqin: '父母' },
        { pos: 4, branch: '酉', wuxing: '金', liuqin: '兄弟' },
        { pos: 5, branch: '未', wuxing: '土', liuqin: '父母' },
        { pos: 6, branch: '巳', wuxing: '火', liuqin: '官鬼' },
      ],
      marks: { world: 3, response: 6 },
    },
    next: 'ch5-s6-110',
  },
  'ch5-s6-110': {
    type: 'narration',
    text: '装到最后一爻，你的笔停在半空。',
    next: 'ch5-s6-120',
  },
  'ch5-s6-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '应上……又是巳火官鬼。',
    next: 'ch5-s6-130',
  },
  'ch5-s6-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。',
    next: 'ch5-s6-140',
  },
  'ch5-s6-140': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}的目光落在那枚字上，声音听不出温度，',
    text: '山地剥，应坐巳火官鬼。这一卦，还是。换了张卦，他还坐在应上——还是那枚巳。',
    m1Note: '巳线三连注（策划案 § 3）：剥应巳／观五爻巳／大有应巳——她与玩家的对视处即此句正典落地。「应是位置不是名字」的 ch3 纪律由下文 CP 前置小问她的立问法承接（问来意看应——同一位置新一问）。',
    next: 'ch5-s6-150',
  },

  // ── 6.2 抉择 · CP-03 ──
  'ch5-s6-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '问的是他的来意——看应。应爻巳火官鬼，用神立定。',
    next: 'ch5-s6-160',
  },
  'ch5-s6-160': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}抱起手臂，靠进椅背，',
    text: '现在，把你这两日学的网，铺上去。它的粮道在哪，敌兵在哪，各自站不站得住——一口气说完。',
    next: 'ch5-s6-precp',
  },
  // 前置小问 · 用神三角辨认 · 引导式不计分（无 favor，三选项一律汇入 CP-03）。
  'ch5-s6-precp': {
    type: 'choice',
    prompt: null,
    context: '（巳，火。生火者木，克火者水——逐爻找。）',
    options: [
      {
        text: '元神是二爻寅木；忌神是初爻子水',
        response: { speaker: '沈疏桐', text: '粮道敌兵，各归各位。称斤两。' },
        next: 'ch5-s6-cp03',
      },
      {
        text: '元神是初爻子水',
        response: { speaker: '沈疏桐', text: '水生火？水克火——那是它的敌兵。生火的是木——二爻寅木，粮道在那儿。重认。' },
        next: 'ch5-s6-cp03',
      },
      {
        text: '忌神是世爻辰土',
        response: { speaker: '沈疏桐', text: '辰土是巳火生的（火生土）——它泄它的气，可不拿刀。拿刀的是克火的水——初爻子水。重认。' },
        next: 'ch5-s6-cp03',
      },
    ],
  },
  // ── 抉择点 CP-03 · 计分 · KP-LY-015＋013/014 全链应用（案卦实断）· 无提示 · 主计分点 ──
  'ch5-s6-cp03': {
    type: 'scoredChoice', cpId: 'CH5-CP-03', testsKp: ['KP-LY-015'],
    prompt: '案卦全链实断（大有 · 应巳火官鬼三角 × 卯月丁亥日）',
    context: '（卯月，丁亥日。元神寅木——卯月的木。忌神子水——卯月的水。两边各称一秤。）',
    options: [
      {
        key: 'A',
        text: '元神寅木月扶——旺；忌神子水月泄——衰',
        verdict: 'optimal',
        basis: '寅卯同木：月建幫扶元神＝旺（『元神旺相或臨日月』——能生用神的头一等条件）；子水生卯木＝气泄于月建＝衰（休囚无力）。三角两秤独立称毕：粮道通、敌兵弱——用神巳火背后的势完整读出。KP-013 认亲＋KP-014 称秤＋KP-015 择位三课全链联用，本章主计分点。',
        sourceRef: [
          '《增删卜易·元神忌神衰旺章第十》：「元神能生用神者有五：元神旺相或臨日月或日月動爻生扶者一也」（ctext wiki chapter=950329 提取行 775）',
          '《增删卜易》「1、月建能生克沖合」：同类幫扶＝旺相／泄气＝休囚（提取行 567，KP-LY-010 口径）',
        ],
        next: 'ch5-s6-cp03a010',
      },
      {
        key: 'B',
        text: '元神被克休囚；忌神得月生旺',
        verdict: 'wrong',
        basis: '两秤全反：卯与寅同为木——同类是扶不是克；卯木对子水是水生木——子水泄气，不是得生。方向连反两处，网就整个倒挂了。',
        sourceRef: [
          '《增删卜易·五行相生章第十一》：「金生水﹐水生木」（提取行 819——水生木，故子水泄于卯月）',
        ],
        next: 'ch5-s6-cp03b010',
      },
      {
        key: 'C',
        text: '元神旺忌神也旺——打平',
        verdict: 'suboptimal',
        basis: '元神旺（寅得卯扶）称对了；忌神子水在卯月是泄（水生木，气漏出去）——衰，不是旺。半张网称对了，另半张没称完就急着下断——两秤各是各的，一杆都不能省。',
        sourceRef: [
          '《增删卜易》「1、月建能生克沖合」：申酉亥子月「皆為泄气之時…休囚無力」（提取行 567，泄＝休囚口径）',
        ],
        next: 'ch5-s6-cp03c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-015 → 掌握' },
      suboptimal: { plot: '{{senior}}令玩家把忌神一秤单独重称（子水对卯月＝泄），重断后过', mastery: 'KP-LY-015 标记待复习' },
    },
    onWrong: '{{senior}}把寅卯同木、水生木两处方向逐一重摆，玩家重答后过。KP-LY-015 标记待复习。不锁主线。',
  },
  // ── CP-03 选 A（optimal）──
  'ch5-s6-cp03a010': {
    type: 'narration',
    text: '「帮他的正旺，拦他的没力气」——这句断语落下，堂里静了一息。',
    next: 'ch5-s6-cp03a020',
  },
  'ch5-s6-cp03a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '网，你会看了。',
    next: 'ch5-s6-cp03a030',
  },
  'ch5-s6-cp03a030': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}的声音很平，平得像刻意压着什么，',
    text: '三课的功夫一口气用尽，断得干干净净。——只可惜这张网上的消息，没一条是好的。',
    next: 'ch5-s6-460',
  },
  // ── CP-03 选 B（wrong）──
  'ch5-s6-cp03b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卯克寅？',
    next: 'ch5-s6-cp03b020',
  },
  'ch5-s6-cp03b020': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}竖起两根手指并在一处，',
    text: '寅卯同为木——自家兄弟，扶还来不及。还有子水：水生木，它的气正漏给月建——衰。两处方向全倒了，重称。',
    m1Note: 'KP-LY-015 标记待复习。',
    next: 'ch5-s6-460',
  },
  // ── CP-03 选 C（suboptimal）──
  'ch5-s6-cp03c010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '忌神旺？子水在卯月，是泄——水生木，气漏在月建身上，第四课称过的手势。',
    next: 'ch5-s6-cp03c020',
  },
  'ch5-s6-cp03c020': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}摇头，',
    text: '半张网就急着下断。两杆秤，一杆都省不得——重称敌兵那一杆。',
    m1Note: 'KP-LY-015 标记待复习。',
    next: 'ch5-s6-460',
  },

  // ── 6.3 读卦 · 来取（CP-03 三线汇合）──
  'ch5-s6-460': {
    type: 'narration',
    text: '{{ta}}把卦纸转正，读卦。',
    next: 'ch5-s6-470',
  },
  'ch5-s6-470': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '听好。这张卦的话，我只转述——',
    next: 'ch5-s6-480',
  },
  'ch5-s6-480': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '应临官鬼，其人在彼——还是他。元神旺相——帮他的那口气，正在令上，粮道一路通到他手边。忌神休囚——能拦他的，眼下抬不起刀。',
    next: 'ch5-s6-490',
  },
  'ch5-s6-490': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一个人站在墙外看了两夜。他身后的势越来越足，挡他的路越来越空——你说，这样的人，是来探的，还是来取的？',
    next: 'ch5-s6-500',
  },
  'ch5-s6-500': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……取。他不是在犹豫。他在等势齐。',
    next: 'ch5-s6-510',
  },
  'ch5-s6-510': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '嗯。不是来探的，是来取的——而且快了。',
    next: 'ch5-s6-520',
  },
  'ch5-s6-520': {
    type: 'narration',
    text: '{{ta}}顿了顿，目光落在卦名上。',
    next: 'ch5-s6-530',
  },
  'ch5-s6-530': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦名也替他说了半句。归魂——魂归旧地。他对这院子，不是生人。',
    next: 'ch5-s6-540',
  },
  'ch5-s6-540': {
    type: 'narration',
    text: '灯焰忽然矮了一线。{{ta}}的指尖在「亥」字上停住——今日的日辰。',
    next: 'ch5-s6-550',
  },
  'ch5-s6-550': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '还有最后一层，说给你听个响。今日丁亥。亥与巳，正对面。',
    next: 'ch5-s6-560',
  },
  'ch5-s6-560': {
    type: 'dialogue', speaker: '{{player}}',
    text: '日辰沖应爻——暗動？',
    next: 'ch5-s6-570',
  },
  'ch5-s6-570': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记性不坏。名字是第四课立的，账还在往后——今夜你只须知道一件事：应爻在今日，暗里动了。',
    next: 'ch5-s6-580',
  },
  'ch5-s6-580': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}把卦纸折起，',
    text: '他不安分了。',
    m1Note: '暗動回响执行（§ 0 第 6 条）：三句封顶（她两句+玩家一句）——名词回收造氛围，沖散/沖实/机理零展开；「账还在往后」＝第六章动爻课回响钩。读卦边界自查：断语全部由已教结构拼出（应临官鬼＝ch3／元神旺忌神衰＝本章／归魂字义「魂归旧地」＝卦名常识级字面，与「临者至也」同款口头点意象不立断法）；「来取」结论由玩家先说出（「他在等势齐」），她收口——推理最后一步留给玩家的纪律不变。「魂归旧地→不是生人」指向嫌疑收窄半步（旧人？前任首座线的远影）——不点破不展开，第六章+素材。',
    next: 'ch5-s6-drclear',
  },
  // 案卦离案（问卦事毕，收盘）——清盘，mirrors ch4-s6-drclear。判断：幕七场景换到廊下，
  // 无卦盘相关内容，沿用 ch4 先例在离场前清空棋盘，避免过场后残留 stale board。
  'ch5-s6-drclear': {
    type: 'dressingUpdate',
    board: null,
    next: 'ch5-s7-header',
  },

  // ═══════════════ 第七幕 · 他的时令 ═══════════════
  'ch5-s7-header': {
    type: 'sceneHeader', scene: 7, title: '他的时令',
    time: '夜深', ambience: '明蓍堂门口，廊下。',
    m1Note: '本幕功能：章末收束——「他在等什么」收题（巳月窗口，§ 0 第 8 条）；守窗升级布置；章末事件 +1；欲言又止钩（§ 0 第 5 条）；结算。',
    next: 'ch5-s7-010',
  },
  'ch5-s7-010': {
    type: 'narration',
    text: '{{ta}}送你到廊下。夜风比七日前暖了些——春天在往深处走。',
    next: 'ch5-s7-020',
  },
  'ch5-s7-020': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}，还有一问。他既是来取的，帮他的又正旺——为什么还不动手？幕外站两夜，等什么？',
    next: 'ch5-s7-030',
  },
  'ch5-s7-030': {
    type: 'narration',
    text: '{{ta}}在廊柱边站定，望着后山的方向。',
    next: 'ch5-s7-040',
  },
  'ch5-s7-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '幕一那晚我说过：他等的东西在时令里。如今你的功夫够了，自己算——',
    next: 'ch5-s7-050',
  },
  'ch5-s7-050': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}竖起三根手指，',
    text: '应爻巳火。卯月，木生火——他得生，旺。辰月，火生土——他泄气，衰半档。巳月——',
    next: 'ch5-s7-060',
  },
  'ch5-s7-060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '巳月……巳火临月建。当时。',
    next: 'ch5-s7-070',
  },
  'ch5-s7-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一年十二个月，他最硬的那三十天。',
    next: 'ch5-s7-080',
  },
  'ch5-s7-080': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}收回手，声音沉而缓，',
    text: '卯月他在蓄，辰月他在忍——他在等巳月。等他自己的时令。',
    next: 'ch5-s7-090',
  },
  'ch5-s7-090': {
    type: 'narration',
    text: '夜风穿廊而过。你数了数日子——卯月已过大半。',
    next: 'ch5-s7-100',
  },
  'ch5-s7-100': {
    type: 'dialogue', speaker: '{{player}}',
    text: '还有一个多月。',
    next: 'ch5-s7-110',
  },
  'ch5-s7-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一个多月，够我们做很多事。',
    next: 'ch5-s7-120',
  },
  'ch5-s7-120': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}转过身，眼里那点光比灯亮，',
    text: '他会算他的时令，我们也会——这是这桩案子开局以来，我们头一回比他快。',
    next: 'ch5-s7-130',
  },
  'ch5-s7-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日起，守窗改章程。棚里添一架铜铃，线走窗销——他上窗，铃先响。你我轮值照旧，可从今夜起，不求人赃并获了。',
    next: 'ch5-s7-140',
  },
  'ch5-s7-140': {
    type: 'dialogue', speaker: '{{player}}',
    text: '不求……那求什么？',
    next: 'ch5-s7-150',
  },
  'ch5-s7-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '求他按我们知道的时令来。',
    next: 'ch5-s7-160',
  },
  // 章末事件「头一回比他快」——好感 +1（script 该行紧随的标记位，涵盖头一回比他快的醒悟＋
  // 守窗改章程＋不求人赃并获＋布好局等开锣一整段战术反转，标记落在本段收束句上）。
  'ch5-s7-160': {
    type: 'dialogue', speaker: '沈疏桐',
    aside: '{{ta}}的唇角有一点极浅的弧度，冷的，',
    text: '知道对手几时动手的人，用不着蹲在墙根下等——布好局，等开锣。',
    effects: { favor: 1 },
    m1Note: '章末事件「头一回比他快」（好感 +1，自动触发）。',
    next: 'ch5-s7-170',
  },
  'ch5-s7-170': {
    type: 'narration',
    text: '你应了一声，转身下阶。走出两步，身后的声音又追上来——比方才低了半度：',
    next: 'ch5-s7-180',
  },
  'ch5-s7-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。',
    next: 'ch5-s7-190',
  },
  'ch5-s7-190': {
    type: 'narration',
    text: '你回头。{{ta}}站在灯影里，目光落在你怀口——那里贴身收着你的本命卦。{{ta}}张了张口——',
    next: 'ch5-s7-200',
  },
  'ch5-s7-200': {
    type: 'narration',
    text: '却什么也没说。',
    next: 'ch5-s7-210',
  },
  'ch5-s7-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '……夜里风凉。回吧。',
    next: 'ch5-s7-220',
  },
  'ch5-s7-220': {
    type: 'narration',
    text: '门阖上了。你站在夜风里，摸了摸怀口的卦纸，不明白{{ta}}方才那半句咽回去的话是什么。',
    next: 'ch5-s7-230',
  },
  'ch5-s7-230': {
    type: 'narration',
    text: '但你隐约觉得——那半句话，和这桩案子无关。',
    m1Note: '欲言又止钩（§ 0 第 5 条／策划案 § 5）：知心档解锁物「本命卦她主动提起」的前奏——本章只给「看向怀口+咽回半句」，bonus 章②（ch5-ch6 之间或 ch6 后）正式回收；与案情无关的标注由玩家旁白自答，防误读为主线钩。',
    next: 'ch5-s7-240',
  },

  // ── 章末结算 ──
  'ch5-s7-240': {
    type: 'narration',
    text: '回房路上，你把这一章在心里过了一遍：一枚踩熄的火折子，一行浮在纸面的墨，一张爻爻相连的网。',
    next: 'ch5-s7-250',
  },
  'ch5-s7-250': {
    type: 'narration',
    text: '从前你以为断卦是称一个爻的斤两。如今你知道了——没有一个爻是独自站着的，就像没有一句话是独自可信的，没有一个人是独自成事的。',
    next: 'ch5-s7-260',
  },
  'ch5-s7-260': {
    type: 'narration',
    text: '帮你的，伤你的，帮他的，伤他的——网看清了，局才布得下。',
    next: 'ch5-end',
  },

  // ═══════════════ 第五章 · 终 ═══════════════
  'ch5-end': {
    type: 'chapterEnd',
    title: '【第五章 · 终】',
    rewards: { lingli: 10 },
    hooks: [
      '「他在等巳月」——行动窗口确定（第六章的钟已上弦：巳月开锣）',
      '守窗升级——铜铃布防、「布好局等开锣」（守势转攻势的章末态）',
      '当值簿補写者——新悬置（坑宋/护宋/无关三解并立）',
      '「归魂——魂归旧地，不是生人」——嫌疑向「旧人」收窄半步（前任首座线远影，未点破）',
      '欲言又止——她与本命卦的半句话（bonus 章②前奏）',
    ],
    nextChapterTeaser: '网是静的，局是活的——爻一动，满盘的生克就换了走法：第六课，动爻。',
  },
  },
};

export default CHAPTER_5;
