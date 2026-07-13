// Chapter 2 《装卦》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_2_SCRIPT_v1.md (owner-gate passed 2026-07-12,
// 2-round review converged; 3 in-transcription script fixes synced back to the doc).
// This file is a FAITHFUL transcription of the approved script into node flow.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1.js header. New in ch2:
// dressingUpdate { type, board:{throws, revealed:[{pos,branch,wuxing}], marks:{world,response}|null} | null, next }
//   — 装卦盘 state event; board carries FULL cumulative state (idempotent, refresh-safe);
//     board:null clears. Rendered by CastPanel.DressingBoard via Player.activeDressing.
// castInteraction perThrow[] entries may carry `speaker` ('{{player}}' — ch2 self-reported cast).
//
// ── Coin-face convention (canonical, per 卜筮正宗/增删卜易) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_2 = {
  id: 'ch2',
  title: '装卦',
  scriptVersion: 'v1.1-owner-approved-2026-07-12',
  entryNode: 'ch2-s1-header',

  // 剧情固定卦象：地火明夷 · 六爻安静（坎宫游魂，世四应初；引擎实测 2026-07-12）
  fixedCase: {
    throws: [7, 8, 7, 8, 8, 8], // 初爻→上爻
    benGua: '地火明夷',
    bianGua: null,              // 六爻安静
    movingLineIndex: null,
  },

  knowledgePoints: ['KP-LY-004', 'KP-LY-005', 'KP-LY-006'],

  nodes: {
  // ═══════════════ 第一幕 · 哑卦 ═══════════════
  'ch2-s1-header': {
    type: 'sceneHeader', scene: 1, title: '哑卦',
    time: '卯时', ambience: '藏经阁前 → 藏经阁二层。晨钟未歇。',
    next: 'ch2-s1-010',
  },
  'ch2-s1-010': {
    type: 'narration',
    text: '你到藏经阁前的时候，晨钟正敲到第三下。',
    next: 'ch2-s1-020',
  },
  'ch2-s1-020': {
    type: 'narration',
    text: '怀里贴身的地方，帕子裹着三枚旧钱——{{ta}}说了「带上你的钱」，你不敢不带，虽然想不出点验书册要钱做什么。',
    next: 'ch2-s1-030',
  },
  'ch2-s1-030': {
    type: 'narration',
    text: '沈疏桐已经在阶下站着了。{{ta}}身边还立着一位老者，青灰袍子，袖口两块补丁摞得整整齐齐，怀里抱着一册蓝布函套，抱的姿势不像抱书，像抱着刚满月的孙儿。',
    next: 'ch2-s1-040',
  },
  'ch2-s1-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '晨钟三响，卡着点到。——罚抄《系辞》的纸，省下了。',
    aside: '看了看天色，又看了看你',
    next: 'ch2-s1-050',
  },
  'ch2-s1-050': {
    type: 'narration',
    text: '{{ta}}侧身，朝老者略一躬身。',
    next: 'ch2-s1-060',
  },
  'ch2-s1-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '郑司书。这位就是{{player}}，那晚摇案卦的新弟子。',
    next: 'ch2-s1-070',
  },
  'ch2-s1-070': {
    type: 'dialogue', speaker: '郑司书',
    text: '手洗过没有？',
    aside: '上下打量你，先看的是你的手',
    next: 'ch2-s1-080',
  },
  'ch2-s1-080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……啊？',
    next: 'ch2-s1-090',
  },
  'ch2-s1-090': {
    type: 'dialogue', speaker: '郑司书',
    text: '碰我的书，先洗手。',
    next: 'ch2-s1-100',
  },
  'ch2-s1-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '郑司书掌藏经阁书目三十年。在他眼里，书比人金贵——习惯就好。',
    aside: '面无表情',
    next: 'ch2-s1-110',
  },
  'ch2-s1-110': {
    type: 'narration',
    text: '郑司书哼了一声，抱着函套往阁里走，走了两步又回头，像是不放心。',
    next: 'ch2-s1-120',
  },
  'ch2-s1-120': {
    type: 'dialogue', speaker: '郑司书',
    text: '说好了——点验就是点验。一页一页过目、登册，不许折角，不许沾墨，不许……',
    next: 'ch2-s1-130',
  },
  'ch2-s1-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不许把书弄丢。郑司书，丢书的不是我们。',
    next: 'ch2-s1-140',
  },
  'ch2-s1-140': {
    type: 'narration',
    text: '老人的脸抽了一下，没接话，转身进了阁。你听见他喉咙里咕哝了半句什么，像是「造孽」。',
    next: 'ch2-s1-150',
  },
  'ch2-s1-150': {
    type: 'narration',
    text: '上二层的木梯很陡。经过残卷格时，你看见那道被撬开的木栅已经换了新条，新木的颜色扎眼地嵌在旧格子里，像一道没长好的疤。',
    next: 'ch2-s1-160',
  },
  'ch2-s1-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '案子的明面，执法堂前日结了。陈五杖二十，发去后山守窑三年。树洞那头，执法堂的人蹲了七夜——没人来取。',
    aside: '脚步没停，声音压低，只给你',
    next: 'ch2-s1-170',
  },
  'ch2-s1-170': {
    type: 'dialogue', speaker: '{{player}}',
    text: '买主跑了？',
    next: 'ch2-s1-180',
  },
  'ch2-s1-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '闻着味儿了。这种人不会再走老路。',
    next: 'ch2-s1-190',
  },
  'ch2-s1-190': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '所以明面上，这案子完了。剩下的——',
    aside: '{{ta}}顿了顿，',
    next: 'ch2-s1-200',
  },
  'ch2-s1-200': {
    type: 'narration',
    text: '{{ta}}停在二层窗前的长案边。案上，油布包已经打开，那半册《遗卦残谱》摊在正中，旁边是郑司书的登记册、镇纸、一盏晨光里用不上的灯。',
    next: 'ch2-s1-210',
  },
  'ch2-s1-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——剩下的在这儿。裁页的事，你我知道，天知道。现在多一个知道一半的：郑司书只知道『书回来了，例行点验』，不知道裁页。在他面前，嘴严些。',
    next: 'ch2-s1-220',
  },
  'ch2-s1-220': {
    type: 'narration',
    text: '郑司书把登记册翻到新的一页，提笔蘸墨，先给你们立规矩。',
    next: 'ch2-s1-230',
  },
  'ch2-s1-230': {
    type: 'dialogue', speaker: '郑司书',
    text: '《遗卦残谱》，半册，无名氏抄本——书目上就这么写的，赖不掉的。点验的规矩：逐页唱名，我登册。第几页、什么卦、品相如何，一样一样报来。',
    next: 'ch2-s1-240',
  },
  'ch2-s1-240': {
    type: 'narration',
    text: '他说完，三个人一起沉默了。',
    next: 'ch2-s1-250',
  },
  'ch2-s1-250': {
    type: 'narration',
    text: '因为你们三个都想起了同一件事：这册谱，从头到尾，没有一个字。',
    next: 'ch2-s1-260',
  },
  'ch2-s1-260': {
    type: 'narration',
    text: '你凑近看。摊开的那页上是六道墨痕，从下往上排得笔直，墨色沉旧；旁边一枚极小的墨点，点在其中一道爻的边上，小得像笔尖不小心落下的。除此之外——没有卦名，没有页码，没有一个字。',
    next: 'ch2-s1-270',
  },
  'ch2-s1-270': {
    type: 'dialogue', speaker: '郑司书',
    text: '往年点验有字的书，唱名就是念书名。这册……老朽掌书三十年，只知道它叫残谱，里头一页一页的，都是哑巴。',
    aside: '捻着笔，为难',
    next: 'ch2-s1-280',
  },
  'ch2-s1-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '哑巴不要紧。',
    next: 'ch2-s1-290',
  },
  'ch2-s1-290': {
    type: 'narration',
    text: '{{ta}}把那页轻轻抚平，指尖在六道墨痕上很慢地扫过一遍——你注意到{{ta}}这个动作放得很轻，轻得不像对一册书。',
    next: 'ch2-s1-300',
  },
  'ch2-s1-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦没有哑的。每一张卦都有名有姓，有籍贯，有位次——它不开口，是你不会问。',
    next: 'ch2-s1-310',
  },
  'ch2-s1-310': {
    type: 'narration',
    text: '{{ta}}直起身，看着你，晨光从窗棂里进来，落在案上那册无字的谱上。',
    next: 'ch2-s1-320',
  },
  'ch2-s1-320': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '{{player}}。第一课你学会了让卦长出来，这是第二课——',
    next: 'ch2-s1-330',
  },
  'ch2-s1-330': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '让卦报上名来。',
    next: 'ch2-s1-340',
  },
  'ch2-s1-340': {
    type: 'dialogue', speaker: '郑司书',
    text: '……那，老朽这册子，登什么？',
    aside: '在旁边小声',
    next: 'ch2-s1-350',
  },
  'ch2-s1-350': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '登日子。三日之内，这册谱有一页算一页，一页一页，全给你唱出名来。',
    next: 'ch2-s1-360',
  },
  'ch2-s1-360': {
    type: 'narration',
    text: '{{ta}}说「有一页算一页」的时候，目光在书脊内侧那道细得几乎看不见的切口上停了一瞬——快得郑司书没察觉。',
    next: 'ch2-s1-370',
  },
  'ch2-s1-370': {
    type: 'narration',
    text: '你察觉了。有一页，算一页。可你想起那道切口——这册谱里，至少有一页，已经不在了。不在的那一页，谁替它唱名？',
    next: 'ch2-s1-380',
  },
  'ch2-s1-380': {
    type: 'narration',
    text: '{{ta}}不动声色，你也就不动声色。',
    next: 'ch2-s1-390',
  },
  'ch2-s1-390': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '走。上课去。书先封着，郑司书，晌午我们来开工。',
    next: 'ch2-s2-header',
  },

  // ═══════════════ 第二幕 · 籍贯 ═══════════════
  'ch2-s2-header': {
    type: 'sceneHeader', scene: 2, title: '籍贯',
    time: '上午', ambience: '明蓍堂。',
    next: 'ch2-s2-010',
  },
  'ch2-s2-010': {
    type: 'narration',
    text: '明蓍堂还是那个明蓍堂：一炉香，一方案，案上一只铜盘。但今天沈疏桐没让你看案，让你看墙。',
    next: 'ch2-s2-020',
  },
  'ch2-s2-020': {
    type: 'narration',
    text: '堂侧的墙上挂着几幅卷轴，你第一晚来的时候就见过，一直没敢细看。{{ta}}走到最里侧那幅前，把压轴的木条摘了，让整幅轴子放下来。',
    next: 'ch2-s2-030',
  },
  'ch2-s2-030': {
    type: 'narration',
    text: '纸色黄旧，边角起了毛。上面用极工整的小字排着八行卦名，每行八个，一行一色地用朱笔在行首圈着八个大字：乾、坎、艮、震、巽、离、坤、兑。',
    next: 'ch2-s2-040',
  },
  'ch2-s2-040': {
    type: 'narration',
    text: '你凑近了看。那字迹——一笔一笔，稳得不像人手写的，像是刻出来的。你在哪儿见过这种字。',
    next: 'ch2-s2-050',
  },
  'ch2-s2-050': {
    type: 'narration',
    text: '你想起来了。就在今晨，藏经阁二层，你刚见过同一双手画下的墨痕。',
    next: 'ch2-s2-060',
  },
  'ch2-s2-060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}，这轴的字……和残谱像一个人的手。',
    next: 'ch2-s2-070',
  },
  'ch2-s2-070': {
    type: 'narration',
    text: '沈疏桐正在卷袖子的手，几不可察地停了半拍。',
    next: 'ch2-s2-080',
  },
  'ch2-s2-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '……嗯。门里的老手笔。',
    next: 'ch2-s2-090',
  },
  'ch2-s2-090': {
    type: 'narration',
    text: '{{ta}}没再多给一个字，径直用镇尺点上了轴子第一行。',
    next: 'ch2-s2-100',
  },
  'ch2-s2-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '上课。——你入门那晚我说过，八卦两两一叠，六十四卦。六十四张卦，听着乱，其实一点都不乱：它们是八户人家。',
    next: 'ch2-s2-110',
  },
  'ch2-s2-110': {
    type: 'narration',
    text: '{{ta}}的镇尺从第一行朱圈划到最后一行。',
    next: 'ch2-s2-120',
  },
  'ch2-s2-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '乾、坎、艮、震、巽、离、坤、兑——八宫。每宫辖八卦，八八六十四，一个不多，一个不少。每张卦都有籍贯：它归哪一宫，就是哪一宫的人。',
    next: 'ch2-s2-130',
  },
  'ch2-s2-130': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '同宫，还同姓。',
    next: 'ch2-s2-140',
  },
  'ch2-s2-140': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '乾宫兑宫姓金，坎宫姓水，艮宫坤宫姓土，震宫巽宫姓木，离宫姓火。这个姓，往后断卦有大用——今天先记籍贯，用处到了时候自然还你。',
    aside: '{{ta}}点着行首，',
    next: 'ch2-s2-150',
  },
  'ch2-s2-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '再看每一户里头怎么排。',
    next: 'ch2-s2-160',
  },
  'ch2-s2-160': {
    type: 'narration',
    text: '{{ta}}的镇尺落回第一行，逐个点过去。',
    next: 'ch2-s2-170',
  },
  'ch2-s2-170': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '打头的是宫主——八纯卦，乾为天领乾宫，坎为水领坎宫。宫主往后，第二个叫一世，第三个二世，一路排到第六个五世。第七个和第八个，名字特别，记牢——',
    next: 'ch2-s2-180',
  },
  'ch2-s2-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '第七个，游魂。第八个，归魂。',
    next: 'ch2-s2-190',
  },
  'ch2-s2-190': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……游魂？',
    next: 'ch2-s2-200',
  },
  'ch2-s2-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '魂游在外，故曰游魂；魂归本家，故曰归魂。名目的来历筑基再讲，今天只记一件事：位次不乱。宫主、一世到五世、游魂、归魂——任何一宫，都是这么八个位置，铁打的。',
    next: 'ch2-s2-tm1',
  },
  'ch2-s2-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-004', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '六十四卦分属八宫；同宫同五行（乾兑金/坎水/艮坤土/震巽木/离火）；宫内位次固定（宫主·一世至五世·游魂第七·归魂第八）；初学查全图为正途。依据《增删卜易·八宮六十四卦卦名》《歸魂遊魂章》《八宮圖第三》与《卜筮正宗·八宮所屬》（附录 KP-LY-004 卡）。',
    next: 'ch2-s2-210',
  },
  'ch2-s2-210': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '都在轴上，不用背。会查，比会背金贵——背错了自己不知道，查错了轴子会告诉你。',
    next: 'ch2-s2-220',
  },
  'ch2-s2-220': {
    type: 'narration',
    text: '{{ta}}忽然朝你伸手。',
    next: 'ch2-s2-230',
  },
  'ch2-s2-230': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '卦纸。',
    next: 'ch2-s2-240',
  },
  'ch2-s2-240': {
    type: 'dialogue', speaker: '{{player}}',
    text: '什么？',
    next: 'ch2-s2-250',
  },
  'ch2-s2-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你的第一卦。我让你收好的东西，你敢说没带？',
    next: 'ch2-s2-260',
  },
  'ch2-s2-260': {
    type: 'narration',
    text: '你从怀里把那张卦纸摸出来——和三枚旧钱裹在一处，帕子都带着体温。{{ta}}接过去，在案上抚平。山火贲，六道爻，初爻旁一个圈，都是那晚的墨。',
    next: 'ch2-s2-270',
  },
  'ch2-s2-270': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '山火贲。摇它的人是你——现在我问你，它是谁家的卦？',
    next: 'ch2-s2-280',
  },
  'ch2-s2-280': {
    type: 'narration',
    text: '{{ta}}退开半步，把整幅卦轴让给你。',
    next: 'ch2-s2-290',
  },
  'ch2-s2-290': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '轴子就在这儿。找。',
    next: 'ch2-s2-300',
  },
  'ch2-s2-300': {
    type: 'choice',
    prompt: null, // 引导应用 · KP-LY-004（查贲的籍贯）；答错不惩罚、不计 wrong
    options: [
      {
        text: '艮宫——第二个，一世卦',
        response: {
          speaker: '沈疏桐',
          text: '艮宫第二，一世。……第一次查图就查全（宫和位次一起报），行。记住这个说法：贲，籍贯艮宫，姓土，行二，称一世。',
          aside: '{{ta}}把卦纸推回给你，',
        },
        effects: { favor: 1 },
        next: 'ch2-s2-tm2',
      },
      {
        text: '离宫——它下卦是离火',
        response: {
          speaker: '沈疏桐',
          text: '下卦是离就归离宫？那上卦还是艮呢，怎么不说归艮？——籍贯不看长相，看名册。查轴子：山火贲挂在哪一行？艮宫，第二个，一世卦。以后先查，再开口。',
          aside: '你重查，在艮字那行第二个找到了它。',
        },
        next: 'ch2-s2-tm2',
      },
      {
        text: '乾宫——乾是头一宫',
        response: {
          speaker: '沈疏桐',
          text: '乾宫是头一宫，跟贲有什么亲？你这是把族谱头一页当成自己家了。查。艮宫第二，一世卦。轴子不收你的钱，多看两眼。',
          aside: '你在艮字那行第二个找到了它。',
        },
        next: 'ch2-s2-tm2',
      },
    ],
  },
  'ch2-s2-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-004', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家在提示（卦轴在手）下亲手完成第一次「查籍贯」：定宫 + 报位次。依据《增删卜易·八宮六十四卦卦名》艮宫行——贲居艮宫第二（一世）（附录 KP-LY-004 卡）。答错不惩罚：{{senior}}怼一句并逼你重查，不影响主线，不计 wrong。',
    next: 'ch2-s2-310',
  },
  'ch2-s2-310': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '贲的籍贯有了。藏经阁那三十二个一字不吐的哑巴——',
    next: 'ch2-s2-320',
  },
  'ch2-s2-320': {
    type: 'narration',
    text: '{{ta}}朝藏经阁的方向抬了抬下巴。',
    next: 'ch2-s2-330',
  },
  'ch2-s2-330': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——晌午起，一个一个，让它们把籍贯全报出来。',
    next: 'ch2-s3-header',
  },

  // ═══════════════ 第三幕 · 世应 ═══════════════
  'ch2-s3-header': {
    type: 'sceneHeader', scene: 3, title: '世应',
    time: '上午 → 晌午后', ambience: '明蓍堂 → 藏经阁二层。',
    next: 'ch2-s3-010',
  },
  'ch2-s3-010': {
    type: 'narration',
    text: '{{ta}}把你的卦纸又拿了回去，就着晨光看了一会儿。',
    next: 'ch2-s3-020',
  },
  'ch2-s3-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '籍贯之外，还有一件事，也在位次里藏着。看好。',
    next: 'ch2-s3-030',
  },
  'ch2-s3-030': {
    type: 'narration',
    text: '{{ta}}提笔，在贲卦的初爻旁、那个动爻的圈边上，点了一个小小的墨点。又在四爻旁点了一个更小的。',
    next: 'ch2-s3-040',
  },
  'ch2-s3-040': {
    type: 'dialogue', speaker: '{{player}}',
    text: '残谱上……每一页也有这么一个点。',
    next: 'ch2-s3-050',
  },
  'ch2-s3-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不错，你看见了。那个点，叫世。',
    next: 'ch2-s3-060',
  },
  'ch2-s3-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '一张卦六道爻，看着是六道，其实里头站着两个人。世爻，是你自己；应爻，是对面那一头——你问的人、你找的物、你要去的那个地方。世在这头，应在那头，一张卦从此分了你我。',
    next: 'ch2-s3-070',
  },
  'ch2-s3-070': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '世安在哪一爻，不用猜，有诀。籍贯方才教了——宫里排第几，世就落在哪：',
    next: 'ch2-s3-080',
  },
  'ch2-s3-080': {
    type: 'narration',
    text: '{{ta}}屈指，在案上一下一下地敲。',
    next: 'ch2-s3-090',
  },
  'ch2-s3-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '宫主世在上——八纯卦，世安第六爻。一世世在初，二世在二，三世在三，四世在四，五世在五——位次走到哪，世跟到哪。',
    next: 'ch2-s3-100',
  },
  'ch2-s3-100': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '剩下两个特殊的：游魂，世在四。归魂，世在三。',
    next: 'ch2-s3-110',
  },
  'ch2-s3-110': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '应爻更省事：从世爻往上隔两位，就是应。世初应四，世二应五，世三应六——数到头就转回来接着数：世四应初，世五应二，世六应三。',
    next: 'ch2-s3-tm1',
  },
  'ch2-s3-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-006', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '世应含义（世为自己，应作他人）；安世口诀（宫主六 / 一世初…五世五 / 游魂四 / 归魂三）；应爻规则（隔世两位）。依据《卜筮正宗·安世應訣》《世應論用神第二》与《增删卜易·世應章第六》（附录 KP-LY-006 卡）。',
    next: 'ch2-s3-120',
  },
  'ch2-s3-120': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '现在看你自己这张。贲，一世卦——世安在哪？',
    next: 'ch2-s3-130',
  },
  'ch2-s3-130': {
    type: 'dialogue', speaker: '{{player}}',
    text: '一世世在初……初爻。',
    next: 'ch2-s3-140',
  },
  'ch2-s3-140': {
    type: 'narration',
    text: '你说完，自己愣住了。',
    next: 'ch2-s3-150',
  },
  'ch2-s3-150': {
    type: 'narration',
    text: '初爻。那晚三枚铜钱齐刷刷背面朝天的第一掷。整张卦里唯一动了的那道爻。',
    next: 'ch2-s3-160',
  },
  'ch2-s3-160': {
    type: 'narration',
    text: '你的世爻，就是你的动爻。',
    next: 'ch2-s3-170',
  },
  'ch2-s3-170': {
    type: 'narration',
    variants: {
      female: '沈疏桐看着你的脸，没催。她见过很多人学会安世应，大概没几个人第一次安世，安在自己的动爻上。半晌，她把卦纸轻轻转回你这边，声音比平时低了些：',
      male: '沈疏桐抱着手臂看着你，难得没有立刻往下讲。他用指节在案沿上敲了两下，像是替你把这件事敲实：',
    },
    next: 'ch2-s3-180',
  },
  'ch2-s3-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '世是问卦的人。那晚这卦替宗门问贼踪，可摇卦的手是你的——卦里那个『自己』，是你，{{player}}。你上山第一夜，你自己，动了。',
    next: 'ch2-s3-190',
  },
  'ch2-s3-190': {
    type: 'narration',
    text: '你盯着那道画了圈、又点了世的爻，忽然觉得三个月来第一次，有什么东西在你脚下轻轻接住了你。',
    next: 'ch2-s3-200',
  },
  'ch2-s3-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '别感动太久，诀还没练熟。——轴子上，乾宫第七个，火地晋。游魂。世应各在哪？',
    aside: '语气一收，又是{{senior}}',
    next: 'ch2-s3-210',
  },
  'ch2-s3-210': {
    type: 'choice',
    prompt: null, // 引导应用 · KP-LY-006（晋卦世应）；答错不惩罚、不计 wrong
    options: [
      {
        text: '世在四爻，应隔两位——在初爻',
        response: {
          speaker: '沈疏桐',
          text: '游魂世四，应转回初。对。游魂和归魂最容易错，多念两遍。',
        },
        effects: { favor: 1 },
        next: 'ch2-s3-tm2',
      },
      {
        text: '世在上爻——它是第七个，靠后',
        response: {
          speaker: '沈疏桐',
          text: '世六是宫主的位子。晋是游魂——诀里单独给它留了一句：游魂世四。跟着念：游魂四，归魂三。',
        },
        next: 'ch2-s3-tm2',
      },
      {
        text: '世在三爻',
        response: {
          speaker: '沈疏桐',
          text: '三是归魂的位子。第七是游魂，第八才是归魂——一字之差，两个位次。再念：游魂四，归魂三。',
        },
        next: 'ch2-s3-tm2',
      },
    ],
  },
  'ch2-s3-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-006', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家在提示（口诀刚讲）下安一个游魂卦的世应——预演本章最要命的特殊位次。依据《卜筮正宗·安世應訣》「游魂八宮四爻立」；晋居乾宫第七＝游魂（《增删卜易·八宮六十四卦卦名》，附录 KP-LY-004/006 卡）。答错不惩罚、不计 wrong。',
    next: 'ch2-s3-220',
  },
  'ch2-s3-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '行了。晌午了——郑司书该等急了。',
    next: 'ch2-s3-230',
  },

  // ── 3.2 点验开工 ──
  'ch2-s3-230': {
    type: 'narration',
    text: '藏经阁二层。郑司书把登记册摊好，如临大敌。',
    next: 'ch2-s3-240',
  },
  'ch2-s3-240': {
    type: 'narration',
    text: '点验的活，比你想的枯，也比你想的静。{{ta}}翻页，你认卦：从下往上读爻、拼出上下卦、报卦名——这是第一课的本事；八个卦形口诀你还没背全，认不出的，{{ta}}提半句，你接下半句。然后查轴子（{{ta}}把那幅八宫全图轴借了来，就挂在窗边）、报籍贯、按诀验那枚世点——这是今天的本事。{{ta}}听着，对一页，郑司书登一页。',
    next: 'ch2-s3-250',
  },
  'ch2-s3-250': {
    type: 'dialogue', speaker: '{{player}}',
    text: '第一页，乾为天。乾宫宫主，世点在上爻——对。',
    next: 'ch2-s3-260',
  },
  'ch2-s3-260': {
    type: 'dialogue', speaker: '郑司书',
    text: '乾为天，品相完好。……唱下一页。',
    aside: '笔走如飞',
    next: 'ch2-s3-270',
  },
  'ch2-s3-270': {
    type: 'dialogue', speaker: '{{player}}',
    text: '天风姤。乾宫第二，一世卦，世点在初爻——对。',
    next: 'ch2-s3-280',
  },
  'ch2-s3-280': {
    type: 'dialogue', speaker: '郑司书',
    text: '姤。',
    next: 'ch2-s3-290',
  },
  'ch2-s3-290': {
    type: 'dialogue', speaker: '郑司书',
    text: '怪了。这册哑巴书老朽守了三十年，今日头一回听它们一个个有名有姓——小师父，你这唱名，比有字的书还唱得齐整。',
    aside: '老人一边落笔一边点头，忽然又抬起头来，一脸的不可思议，',
    next: 'ch2-s3-300',
  },
  'ch2-s3-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不是人齐整，是卦齐整。名字本来就在页上，只是不用字写。',
    aside: '淡淡地',
    next: 'ch2-s3-310',
  },
  'ch2-s3-310': {
    type: 'narration',
    text: '第三页你卡了一下——天山遁的「遁」字你不认得，是{{ta}}教你念的；第五页你把世点数错一位，自己发现，自己改口。{{ta}}都没说话，只在你改对的时候，把下一页翻给你。',
    next: 'ch2-s3-320',
  },
  'ch2-s3-320': {
    type: 'narration',
    text: '一页，一页。你唱名，老人登册。唱到第十几页的时候，你忽然停住了。',
    next: 'ch2-s3-330',
  },
  'ch2-s3-330': {
    type: 'choice',
    prompt: null, // 不计分 · 风味（次序洞察）；前两项等值 +1 殊途同归，第三项无惩罚只错过
    options: [
      {
        text: '这册谱……是照轴子的次序抄的',
        response: {
          speaker: '沈疏桐',
          text: '现在才看出来？抄谱的人按宫序落笔，一宫八页，位次不乱——所以它才配叫谱，不叫杂录。',
          aside: '翻页的手停了停。{{ta}}嘴上这么说，眼里那点意思却不是怼你。',
        },
        effects: { favor: 1 },
        next: 'ch2-s3-340',
      },
      {
        text: '抄这册谱的人，一定很稳',
        response: {
          speaker: '沈疏桐',
          text: '……嗯。稳。翻下一页。',
          aside: '{{ta}}的目光在页面上那笔墨上停了一息，把别的话咽了回去。',
        },
        effects: { favor: 1 },
        next: 'ch2-s3-340',
      },
      {
        text: '（不说话，继续唱名）',
        response: {
          // 无说话人：旁白应答
          text: '你把话咽了回去，接着唱。沈疏桐瞥了你一眼，没说什么——但你觉得{{ta}}似乎等了一下，等你开口。',
        },
        next: 'ch2-s3-340',
      },
    ],
  },
  'ch2-s3-340': {
    type: 'narration',
    text: '日头一点点斜过去。乾宫八页，全数唱完；坎宫开始。',
    next: 'ch2-s3-350',
  },
  'ch2-s3-350': {
    type: 'dialogue', speaker: '{{player}}',
    text: '坎为水，坎宫宫主，世在上爻——对。水泽节，坎宫一世，世在初——对。水雷屯……',
    next: 'ch2-s3-360',
  },
  'ch2-s3-360': {
    type: 'narration',
    text: '你的声音在阁楼里一页一页地响。你没注意到，从坎宫第一页起，沈疏桐翻页的手，慢了下来。',
    next: 'ch2-s3-370',
  },
  'ch2-s3-370': {
    type: 'narration',
    text: '{{ta}}在等什么。',
    next: 'ch2-s4-header',
  },

  // ═══════════════ 第四幕 · 缺位 ═══════════════
  // 计分抉择点 CP-01（本章主计分点）——KP-LY-004 独立应用。三线（A/B/C）于 4.2「明入地中」（ch2-s4-200）汇合。
  'ch2-s4-header': {
    type: 'sceneHeader', scene: 4, title: '缺位',
    time: '黄昏', ambience: '藏经阁二层。',
    m1Note: '本幕功能：计分抉择点 CP-01（本章主计分点）——KP-LY-004 独立应用：由位次推出被裁走的卦。明夷落地；钱囊暗线微动作。',
    next: 'ch2-s4-010',
  },
  'ch2-s4-010': {
    type: 'narration',
    text: '楼下传来动静。是顾小满的嗓门，隔着一层楼板都藏不住。',
    next: 'ch2-s4-020',
  },
  'ch2-s4-020': {
    type: 'dialogue', speaker: '顾小满',
    text: '司书爷爷！膳堂的食盒——诶您别急您别急，我拿稳着呢，洒不了！',
    aside: '楼下。',
    next: 'ch2-s4-030',
  },
  'ch2-s4-030': {
    type: 'dialogue', speaker: '郑司书',
    text: '食盒进阁？！油星子沾了书皮，你赔得起吗！搁外头搁外头——',
    aside: '噌地起身。',
    next: 'ch2-s4-040',
  },
  'ch2-s4-040': {
    type: 'narration',
    text: '老人一阵风似的下楼去了。楼板还在响，沈疏桐已经把登记册从案上挪开，动作快得像等这一刻等了一下午。',
    next: 'ch2-s4-050',
  },
  'ch2-s4-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '接着唱。快。',
    next: 'ch2-s4-060',
  },
  'ch2-s4-060': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……雷火丰，坎宫第六，五世卦，世点在五爻——对。下一页——',
    next: 'ch2-s4-070',
  },
  'ch2-s4-070': {
    type: 'narration',
    text: '你翻过丰卦。下一页的六道墨痕拼出来，你张口就要报，却卡住了。',
    next: 'ch2-s4-080',
  },
  'ch2-s4-080': {
    type: 'dialogue', speaker: '{{player}}',
    text: '地、地水师？坎宫第……',
    next: 'ch2-s4-090',
  },
  'ch2-s4-090': {
    type: 'narration',
    text: '不对。',
    next: 'ch2-s4-100',
  },
  'ch2-s4-100': {
    type: 'narration',
    text: '丰是第六。师是第八——归魂，世点在三爻，页上那枚墨点也确实点在三爻，一分不差。',
    next: 'ch2-s4-110',
  },
  'ch2-s4-110': {
    type: 'narration',
    text: '可第七呢？',
    next: 'ch2-s4-120',
  },
  'ch2-s4-120': {
    type: 'narration',
    text: '你把两页并排摆开，中间那道装订线内侧，一道细得几乎看不见的切口，边缘发暗，起着毛。',
    next: 'ch2-s4-130',
  },
  'ch2-s4-130': {
    type: 'narration',
    text: '少的那一页，就是从这里裁走的。',
    next: 'ch2-s4-140',
  },
  'ch2-s4-140': {
    type: 'narration',
    text: '乾、坎、艮、震——前四宫，一宫八页，这半册应有三十二页。你忽然明白{{ta}}早上那句「有一页算一页」是什么意思了：案上数得出的，只有三十一。',
    next: 'ch2-s4-150',
  },
  'ch2-s4-150': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '切口那晚我就看见了。少一页——这个我知道。我不知道的是，少的是哪一页。',
    aside: '声音很平，像早就站在这句话里等你。',
    next: 'ch2-s4-160',
  },
  'ch2-s4-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '现在，书页不会说话，裁它的人更不会。{{player}}——',
    next: 'ch2-s4-170',
  },
  'ch2-s4-170': {
    type: 'narration',
    text: '{{ta}}把丰和师两页往你面前推了推，自己抱起手臂，退开一步。窗边的卦轴在暮色里垂着，{{ta}}没有看它一眼——{{ta}}在看你。',
    next: 'ch2-s4-180',
  },
  'ch2-s4-180': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '裁走的，是哪一卦？',
    next: 'ch2-s4-cp01',
  },
  'ch2-s4-cp01': {
    type: 'scoredChoice', cpId: 'CH2-CP-01', testsKp: ['KP-LY-004'],
    prompt: '由页序缺位推出被裁走的卦（本章主计分点）',
    context: '（案上：丰卦页——坎宫第六，五世。师卦页——坎宫第八，归魂。中间一道旧切口。窗边挂着八宫全图轴。）',
    options: [
      {
        key: 'A',
        text: '丰第六，师第八——缺的是坎宫第七，游魂。轴上坎宫第七位是：地火明夷。',
        verdict: 'optimal',
        basis: '位次即籍贯的完整应用：页序＝宫序，丰居六、师居八，缺位在第七；游魂为各宫第七卦；查轴（或诵宫序）得坎宫第七＝地火明夷。刀裁得掉纸，裁不掉位次。',
        sourceRef: [
          '《增删卜易·八宮六十四卦卦名》：「坎宮八卦：﹝俱屬水﹞坎為水﹐水澤節﹐水雷屯﹐水火旣濟﹐澤火革﹐雷火豐﹐地火明夷﹐地水師」（ctext wiki chapter=950329）',
          '《增删卜易·歸魂遊魂章》：「遊魂卦為各宮之第七卦」（ctext wiki chapter=950329）',
        ],
        next: 'ch2-s4-cp01a010',
      },
      {
        key: 'B',
        text: '把这册谱从头对着轴子一页页比过去，比到对不上的地方就知道了。',
        verdict: 'suboptimal',
        basis: '方法可行而未用位次——在册三十一页比到黑也比得出来，但等于承认位次白学。剧情：{{senior}}真让玩家比了半炷香，比到明夷才叫停。',
        sourceRef: [
          '《增删卜易·八宮圖第三》：「初學點卦﹐不會裝卦者﹐須裝照此全圖裝拼世應五行」——查图是正途，但缺位推断只需位次，不需逐页',
        ],
        next: 'ch2-s4-cp01b010',
      },
      {
        key: 'C',
        text: '坎宫的卦……水火既济？我记得坎宫里有它。',
        verdict: 'wrong',
        basis: '既济居坎宫第四（三世），此刻正躺在案上已点验的页堆里——凭印象而不数位次，答案自己会打脸。',
        sourceRef: [
          '《增删卜易·八宮六十四卦卦名》坎宫行——既济在册第四位',
        ],
        next: 'ch2-s4-cp01c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-004 → 掌握' },
      suboptimal: { plot: '逐页比对线（半炷香，比到明夷{{senior}}叫停补讲）', mastery: 'KP-LY-004 标记待复习' },
    },
    onWrong: '翻页自打脸线：{{senior}}一言不发从已验页堆里抽出既济页拍在案上，玩家重数位次得出明夷。KP-LY-004 标记待复习。不锁主线。',
  },

  // ── CP-01 选 A（optimal）──
  'ch2-s4-cp01a010': {
    type: 'narration',
    text: '你说「地火明夷」四个字的时候，沈疏桐抱着的手臂松开了。',
    next: 'ch2-s4-cp01a020',
  },
  'ch2-s4-cp01a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '丰六，师八，缺七。游魂。',
    aside: '{{ta}}一字一顿地把你的推法复述了一遍，像验一道算题。',
    next: 'ch2-s4-cp01a030',
  },
  'ch2-s4-cp01a030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——刀裁得掉纸，裁不掉位次。{{junior}}，这就是我说的：让卦自己报名。连不在了的卦，都报得出名来。',
    next: 'ch2-s4-200',
  },

  // ── CP-01 选 B（suboptimal）：逐页比对线 ──
  'ch2-s4-cp01b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '……比吧。',
    next: 'ch2-s4-cp01b020',
  },
  'ch2-s4-cp01b020': {
    type: 'narration',
    text: '{{ta}}真就让你比。你把点验过的页一页页对着轴子过，酸了脖子，比到坎宫第七位对不上的时候，{{ta}}才开口。',
    next: 'ch2-s4-cp01b030',
  },
  'ch2-s4-cp01b030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '停。答案你自己撞上了——坎宫第七，地火明夷。',
    aside: '{{ta}}把轴子上那一格点给你看。',
    next: 'ch2-s4-cp01b040',
  },
  'ch2-s4-cp01b040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '比对没错，是笨。丰第六、师第八，缺位摆在脸上：位次会数数，你不让它数。回去把八宫位次默一遍。',
    m1Note: 'KP-LY-004 标记待复习。',
    next: 'ch2-s4-200',
  },

  // ── CP-01 选 C（wrong）：翻页自打脸线 ──
  'ch2-s4-cp01c010': {
    type: 'narration',
    text: '沈疏桐没说话。{{ta}}从已经点验过的页堆里，两根手指抽出一页，轻轻拍在你面前。',
    next: 'ch2-s4-cp01c020',
  },
  'ch2-s4-cp01c020': {
    type: 'narration',
    text: '六道墨痕：下头坎中满，上头离中虚——水火既济。世点端端正正在三爻。你唱过它的名，就在半个时辰前。',
    next: 'ch2-s4-cp01c030',
  },
  'ch2-s4-cp01c030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坎宫第四，三世卦。它好好地躺在这儿——你把它裁哪儿去了？',
    next: 'ch2-s4-cp01c040',
  },
  'ch2-s4-cp01c040': {
    type: 'narration',
    text: '你耳根发热，重新去数：丰第六，师第八，缺的是第七——游魂。你去轴上找坎宫第七。',
    next: 'ch2-s4-cp01c050',
  },
  'ch2-s4-cp01c050': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……地火明夷。',
    next: 'ch2-s4-cp01c060',
  },
  'ch2-s4-cp01c060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '对。印象靠不住，位次靠得住——数，别猜。',
    m1Note: 'KP-LY-004 标记待复习；重推后过关，不锁进度。',
    next: 'ch2-s4-200',
  },

  // ── 4.2 明入地中（CP-01 三线汇合点）──
  'ch2-s4-200': {
    type: 'narration',
    text: '暮色进阁，郑司书还在楼下跟顾小满掰扯食盒能不能上楼。沈疏桐把丰、师两页收拢，对着中间那道空出来的缺位，安静了很久。',
    next: 'ch2-s4-210',
  },
  'ch2-s4-210': {
    type: 'dialogue', speaker: '{{player}}',
    text: '明夷……是张什么样的卦？',
    next: 'ch2-s4-220',
  },
  'ch2-s4-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坤上离下。地在上，火在下——明入地中。',
    next: 'ch2-s4-230',
  },
  'ch2-s4-230': {
    type: 'narration',
    text: '{{ta}}的声音放得很缓，像在念一句旧文。',
    next: 'ch2-s4-240',
  },
  'ch2-s4-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '日头沉到地底下去了。光还在，只是谁也看不见。卦辞三个字：利艰贞——艰难里，守得住，才有个『利』字。',
    next: 'ch2-s4-250',
  },
  'ch2-s4-250': {
    type: 'narration',
    text: '你等{{ta}}往下讲。{{ta}}没有往下讲。',
    next: 'ch2-s4-260',
  },
  'ch2-s4-260': {
    type: 'narration',
    text: '{{ta}}的右手垂在袖边，拇指很轻地、几乎无意识地隔着袖子按了按什么东西——你认得那个位置。旧钱囊。',
    next: 'ch2-s4-270',
  },
  'ch2-s4-270': {
    type: 'narration',
    text: '灯还没点。暮色里你看不清{{ta}}的脸，只听见{{ta}}最后说了一句，轻得像自言自语：',
    next: 'ch2-s4-280',
  },
  'ch2-s4-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '三十二张卦，偏偏裁了它。',
    next: 'ch2-s5-header',
  },

  // ═══════════════ 第五幕 · 伪页 ═══════════════
  // 计分抉择点 CP-02——KP-LY-006 独立应用。三线于 5.2「两只手」（ch2-s5-300）汇合。
  'ch2-s5-header': {
    type: 'sceneHeader', scene: 5, title: '伪页',
    time: '掌灯后', ambience: '藏经阁二层。',
    m1Note: '本幕功能：计分抉择点 CP-02——KP-LY-006 独立应用：以世点识破伪页。修书房窗口 + 无名三人钩子。',
    next: 'ch2-s5-010',
  },
  'ch2-s5-010': {
    type: 'narration',
    text: '郑司书终于回来了，手里端着一盏新灯，身后跟着捧食盒捧到手酸的顾小满——食盒最终被特许放在楼梯口，人可以上来。',
    next: 'ch2-s5-020',
  },
  'ch2-s5-020': {
    type: 'dialogue', speaker: '顾小满',
    text: '{{player}}！听说你们在给残谱一页页起名字？',
    aside: '凑到你案边，压着嗓子。',
    next: 'ch2-s5-030',
  },
  'ch2-s5-030': {
    type: 'dialogue', speaker: '顾小满',
    text: '那书我值夜看了两年，愣是一页都不认得——回头、回头你也教教我呗？',
    aside: '他咋舌。',
    next: 'ch2-s5-040',
  },
  'ch2-s5-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '想学，卯时蓍圃，跟{{junior}}一起站着去。',
    aside: '头也不抬。',
    next: 'ch2-s5-050',
  },
  'ch2-s5-050': {
    type: 'dialogue', speaker: '顾小满',
    text: '……弟子突然想起来今晚还要巡楼。',
    next: 'ch2-s5-060',
  },
  'ch2-s5-060': {
    type: 'narration',
    text: '他一溜烟下去了。郑司书把新灯搁在案头，也直起腰。',
    next: 'ch2-s5-070',
  },
  'ch2-s5-070': {
    type: 'dialogue', speaker: '郑司书',
    text: '老朽下去用饭。你们唱着——唱了哪些，开个单子，回头老朽照单补登，一页不会少你们的。',
    next: 'ch2-s5-080',
  },
  'ch2-s5-080': {
    type: 'narration',
    text: '老人下了楼。二层重新只剩你们两个人，和一册唱到一半的谱。',
    next: 'ch2-s5-090',
  },
  'ch2-s5-090': {
    type: 'narration',
    text: '你低头憋笑的劲儿早过去了，接着唱名。',
    next: 'ch2-s5-100',
  },
  'ch2-s5-100': {
    type: 'narration',
    text: '坎宫过完，是艮宫。艮为山、宫主；山火贲、一世——',
    next: 'ch2-s5-110',
  },
  'ch2-s5-110': {
    type: 'narration',
    text: '你停了半息。书页上的贲，和你怀里那张卦纸上的贲，一模一样的六道爻。原来你的第一卦，一直在这册谱里躺着，躺了不知多少年，等着你来唱它的名。',
    next: 'ch2-s5-120',
  },
  'ch2-s5-120': {
    type: 'dialogue', speaker: '{{player}}',
    text: '山火贲，艮宫第二，一世卦，世点在初爻——对。',
    next: 'ch2-s5-130',
  },
  'ch2-s5-130': {
    type: 'narration',
    text: '你唱这一句的时候，声音不自觉地放轻了些。沈疏桐瞥了你一眼，没说破。',
    next: 'ch2-s5-140',
  },
  'ch2-s5-140': {
    type: 'narration',
    text: '山天大畜、二世；山泽损、三世；火泽睽、四世；天泽履、五世。灯花爆了一声。你翻到艮宫第七页。',
    next: 'ch2-s5-150',
  },
  'ch2-s5-150': {
    type: 'narration',
    text: '下卦你认得：顶上缺一口，兑上缺。上卦那个你卡住了——{{ta}}扫了一眼，替你补上：',
    next: 'ch2-s5-160',
  },
  'ch2-s5-160': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '巽。巽下断——最底下那道断的。风泽中孚。',
    next: 'ch2-s5-170',
  },
  'ch2-s5-170': {
    type: 'dialogue', speaker: '{{player}}',
    text: '风泽中孚，艮宫第七，游魂，世点在——',
    next: 'ch2-s5-180',
  },
  'ch2-s5-180': {
    type: 'narration',
    text: '你顿住了。',
    next: 'ch2-s5-190',
  },
  'ch2-s5-190': {
    type: 'narration',
    text: '那枚小小的墨点，点在三爻旁边。',
    next: 'ch2-s5-200',
  },
  'ch2-s5-200': {
    type: 'narration',
    text: '你把口诀在心里又过了一遍。游魂，世在四。归魂，世在三。这一页是第七页，游魂——世点应该在四爻。',
    next: 'ch2-s5-210',
  },
  'ch2-s5-210': {
    type: 'narration',
    text: '可它在三爻。',
    next: 'ch2-s5-220',
  },
  'ch2-s5-220': {
    type: 'narration',
    text: '唱到这里，每一页的世点都端端正正。这一页，点错了。',
    next: 'ch2-s5-cp02',
  },
  'ch2-s5-cp02': {
    type: 'scoredChoice', cpId: 'CH2-CP-02', testsKp: ['KP-LY-006'],
    prompt: '以世点位次识破伪页',
    context: '（页上：风泽中孚，艮宫第七位，游魂。世点在三爻。口诀：游魂世四，归魂世三。）',
    options: [
      {
        key: 'A',
        text: '游魂世在四——这一页世点在三，点错了位。这页不是原抄的，是后来有人补进去的假页。',
        verdict: 'optimal',
        basis: '安世应诀的独立应用 + 反向推断：规则不会错、通册不曾错，错的只能是这一页本身——知识当尺，量出赝品。归魂世三恰是伪造者最顺手的错位（第七第八一字之差），细节自洽。',
        sourceRef: [
          '《卜筮正宗·安世應訣》：「游魂八宮四爻立，歸魂八卦三爻詳」（ctext wiki chapter=889452）',
          '《增删卜易·八宮六十四卦卦名》艮宫行：「……天澤履﹐風澤中孚﹐風山漸」——中孚居艮宫第七（游魂）（ctext wiki chapter=950329）',
        ],
        next: 'ch2-s5-cp02a010',
      },
      {
        key: 'B',
        text: '等等，容我从艮宫第一页重新数一遍位次。',
        verdict: 'suboptimal',
        basis: '谨慎无错、判断未至——重数一遍位次仍是第七，数完还是要面对『点在三』。剧情：{{senior}}陪你数完，逼问下一步。',
        sourceRef: [
          '《增删卜易·歸魂遊魂章》：「遊魂卦為各宮之第七卦」',
        ],
        next: 'ch2-s5-cp02b010',
      },
      {
        key: 'C',
        text: '大概是抄谱人一时笔误，点岔了一爻。',
        verdict: 'wrong',
        basis: '用『笔误』给异常盖被子——已验各页笔笔如刻的手，不会恰好在世点上错这一处。把证据解释掉，是查案（与治学）的第一大忌。',
        sourceRef: [
          '《卜筮正宗·安世應訣》——诀不随人错；错的不是诀，是页',
        ],
        next: 'ch2-s5-cp02c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 1, mastery: 'KP-LY-006 → 掌握' },
      suboptimal: { plot: '重数线（数完仍须下判断，{{senior}}追问至说出『伪页』）', mastery: 'KP-LY-006 标记待复习' },
    },
    onWrong: '盖被子线：{{senior}}把通册世点翻给玩家看（页页如刻），反问「这样的手，会错这一处？」玩家重新面对异常，说出伪页结论。KP-LY-006 标记待复习。不锁主线。',
  },

  // ── CP-02 选 A（optimal）──
  'ch2-s5-cp02a010': {
    type: 'narration',
    text: '沈疏桐从{{ta}}那一侧案边站起来，走到你身后，就着灯光看那枚点错的墨点。看了很久。',
    next: 'ch2-s5-cp02a020',
  },
  'ch2-s5-cp02a020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '我掌灯的时候就觉得这页纸色不对——比别页白半分，旧得不够岁数。',
    aside: '{{ta}}直起身。',
    next: 'ch2-s5-cp02a030',
  },
  'ch2-s5-cp02a030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '可纸色是我的眼睛说的。眼睛会走眼。你这个是诀说的——诀不走眼。',
    next: 'ch2-s5-300',
  },

  // ── CP-02 选 B（suboptimal）：重数线 ──
  'ch2-s5-cp02b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '数。',
    next: 'ch2-s5-cp02b020',
  },
  'ch2-s5-cp02b020': {
    type: 'narration',
    text: '{{ta}}真陪你数了一遍：宫主、一世、二世……数到这一页，还是第七。游魂。',
    next: 'ch2-s5-cp02b030',
  },
  'ch2-s5-cp02b030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '第七，游魂，世当在四。现在呢？',
    next: 'ch2-s5-cp02b040',
  },
  'ch2-s5-cp02b040': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……还是在三。这页、这页是假的——后补的。',
    next: 'ch2-s5-cp02b050',
  },
  'ch2-s5-cp02b050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '对。数第二遍不丢人，数完不敢下断，才丢人。诀在你手里，就要敢拿它当尺子使。',
    m1Note: 'KP-LY-006 标记待复习。',
    next: 'ch2-s5-300',
  },

  // ── CP-02 选 C（wrong）：盖被子线 ──
  'ch2-s5-cp02c010': {
    type: 'narration',
    text: '沈疏桐一言不发，把已点验的页一页页翻给你看。乾宫八页，坎宫七页，艮宫前六页——每一枚世点，端端正正，笔笔如刻。',
    next: 'ch2-s5-cp02c020',
  },
  'ch2-s5-cp02c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '这样一双手，页页不错一笔——会单单在游魂的世位上『笔误』？',
    next: 'ch2-s5-cp02c030',
  },
  'ch2-s5-cp02c030': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……不会。这页是假的。',
    next: 'ch2-s5-cp02c040',
  },
  'ch2-s5-cp02c040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记住你刚才差点做的事：拿『大概』给异常盖被子。查案最怕它，治学更怕它。',
    m1Note: 'KP-LY-006 标记待复习；重判后过关，不锁进度。',
    next: 'ch2-s5-300',
  },

  // ── 5.2 两只手（CP-02 三线汇合点）──
  'ch2-s5-300': {
    type: 'narration',
    text: '伪页被单独抽出来，和缺位的记录并排摆着。灯下看得更清了：纸色白半分，墨色也新些——单看哪一样都说不死，摆在旁的真页旁边，处处不对。',
    next: 'ch2-s5-310',
  },
  'ch2-s5-310': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '裁走明夷，切口留在书脊上——这是一笔明账：谁认真查，谁就查得到，他不在乎。',
    next: 'ch2-s5-320',
  },
  'ch2-s5-320': {
    type: 'narration',
    text: '{{ta}}指尖点在那枚错位的世点上。',
    next: 'ch2-s5-330',
  },
  'ch2-s5-330': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '可换走真中孚、摆上这页假的——这是一笔暗账。切口只有一道，人人都会当这册谱只失了明夷一页；若不逐页验世点，艮宫第七永远是一页『好端端的中孚』。他拿了两页，只肯让人知道一页。',
    next: 'ch2-s5-340',
  },
  'ch2-s5-340': {
    type: 'dialogue', speaker: '{{player}}',
    text: '为什么？',
    next: 'ch2-s5-350',
  },
  'ch2-s5-350': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明账遮暗账。',
    aside: '{{ta}}把伪页对着灯举起来，光从新纸里透过去。',
    next: 'ch2-s5-360',
  },
  'ch2-s5-360': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '肯多费一番工夫描假页去藏的那一页，比大大方方裁走的那一页——更怕见人。',
    next: 'ch2-s5-370',
  },
  'ch2-s5-370': {
    type: 'dialogue', speaker: '{{player}}',
    text: '可他世点点错了。',
    next: 'ch2-s5-380',
  },
  'ch2-s5-380': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '所以他学过装卦，没学透。画得出六道爻，描得像旧墨——游魂归魂的世位，他记岔了。',
    aside: '{{ta}}冷笑了一声。',
    next: 'ch2-s5-390',
  },
  'ch2-s5-390': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '半吊子。偏偏是半吊子最麻烦：门里人，学过艺，手却不正。',
    next: 'ch2-s5-400',
  },
  'ch2-s5-400': {
    type: 'dialogue', speaker: '{{player}}',
    text: '那……原来那页真的中孚上，到底有什么？',
    next: 'ch2-s5-410',
  },
  'ch2-s5-410': {
    type: 'narration',
    text: '沈疏桐沉默了一息。',
    next: 'ch2-s5-420',
  },
  'ch2-s5-420': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '不知道。满谱都是一样的卦画、一样的世点，凭什么这两页值得他又裁又换——',
    aside: '{{ta}}摇了摇头，把话收住。',
    next: 'ch2-s5-430',
  },
  'ch2-s5-430': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '这个问题，今夜答不了。',
    next: 'ch2-s5-440',
  },

  // ── 5.3 出纳册 ──
  'ch2-s5-440': {
    type: 'narration',
    text: '剩下的震宫八页，你们赶在郑司书上楼之前唱完了——页页干净，世点无一错位。这册谱的异常，止于一缺一伪。',
    next: 'ch2-s5-450',
  },
  'ch2-s5-450': {
    type: 'narration',
    text: '郑司书用完饭上楼来补登的时候，伪页已经放回了原位——沈疏桐把它插回艮宫第七，压平，仿佛什么都没发生过。',
    next: 'ch2-s5-460',
  },
  'ch2-s5-460': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '郑司书，点验收尾还有一道规程：本册历年出入，补登在验讫页后。麻烦您把出纳册翻给我们过一遍。',
    aside: '把唱名单子递过去，语气如常。',
    next: 'ch2-s5-470',
  },
  'ch2-s5-470': {
    type: 'dialogue', speaker: '郑司书',
    text: '这是正办！书目在此，赖不掉的——',
    aside: '一听「规程」二字，精神一振。',
    next: 'ch2-s5-480',
  },
  'ch2-s5-480': {
    type: 'narration',
    text: '老人抱来出纳册，就着灯，一条一条往回念。这册谱几年没人借阅，出入记录薄得可怜：',
    next: 'ch2-s5-490',
  },
  'ch2-s5-490': {
    type: 'dialogue', speaker: '郑司书',
    text: '……前年，无。大前年，无。再往前——有了：去岁腊月，修书房领去重装书脊，正月里还回。批条印信齐全，经手三人：两位修书房的师兄，带一个打下手的杂役。',
    next: 'ch2-s5-500',
  },
  'ch2-s5-500': {
    type: 'narration',
    text: '你和沈疏桐对视了一眼。',
    next: 'ch2-s5-510',
  },
  'ch2-s5-510': {
    type: 'narration',
    text: '重装书脊——书拆开、页离线的那一个月。裁一页、补一页，都不过是顺手的事。',
    next: 'ch2-s5-520',
  },
  'ch2-s5-520': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '有劳。名字我记下了，规程上要用。',
    aside: '语气如常。',
    next: 'ch2-s5-530',
  },
  'ch2-s5-530': {
    type: 'narration',
    text: '郑司书把三个名字念了，{{ta}}听着，没有写。你注意到{{ta}}连指尖都没动一下——{{ta}}是真的用记的。',
    next: 'ch2-s5-540',
  },
  'ch2-s5-540': {
    type: 'narration',
    text: '等老人下楼，{{ta}}才极低地补了一句，只给你：',
    next: 'ch2-s5-550',
  },
  'ch2-s5-550': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '这三个名字，记在心里，别落在任何纸上。还有——其中打下手的那个杂役，今年开春，辞工下山了。',
    next: 'ch2-s5-560',
  },
  'ch2-s5-560': {
    type: 'narration',
    text: '灯花又爆了一声。你忽然觉得这座灯火通明的阁楼，比那晚黑着的时候还冷。',
    next: 'ch2-s6-header',
  },

  // ═══════════════ 第六幕 · 报名 ═══════════════
  // 剧情固定卦象：地火明夷 · 六爻安静。掷序（初→上）[7,8,7,8,8,8]（引擎已验证，见脚本 § 0）。
  // 摇卦交互（玩家自报爻）；KP-LY-005 示范 → 引导 → CP-03（装卦交互内嵌，dressingUpdate 节点驱动装卦盘）。
  'ch2-s6-header': {
    type: 'sceneHeader', scene: 6, title: '报名',
    time: '深夜', ambience: '明蓍堂。',
    m1Note: '本幕功能：本章核心演出。摇卦交互（案卦）；KP-LY-005 示范 → 引导 → CP-03（装卦交互内嵌）；明夷重现高光；本命卦籍贯小事件。剧情固定卦象：地火明夷 · 六爻安静，掷序（初→上）[7,8,7,8,8,8]。',
    next: 'ch2-s6-010',
  },
  'ch2-s6-010': {
    type: 'narration',
    text: '从藏经阁出来，夜风一吹，你才发现已经这么晚了。沈疏桐没有放你回弟子舍，径直往明蓍堂走。',
    next: 'ch2-s6-020',
  },
  'ch2-s6-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '早上让你带钱，不是让它们白坐一天。',
    next: 'ch2-s6-030',
  },
  'ch2-s6-030': {
    type: 'narration',
    text: '明蓍堂。一炉香，一方案，案上一只铜盘。{{ta}}点了灯，替你把香续上，然后在案对面坐下来——坐在那晚{{ta}}让你摇第一卦的位置的对面。',
    next: 'ch2-s6-040',
  },
  'ch2-s6-040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '白日里，纸上的账我们算完了：缺一页，假一页，一扇为期一个月的窗，三个经手的人。往下再想，就是瞎猜——人证物证又浑了。',
    next: 'ch2-s6-050',
  },
  'ch2-s6-050': {
    type: 'dialogue', speaker: '{{player}}',
    text: '这种时候……',
    next: 'ch2-s6-060',
  },
  'ch2-s6-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '对。这种时候，才轮到卦开口。',
    next: 'ch2-s6-070',
  },
  'ch2-s6-070': {
    type: 'narration',
    text: '{{ta}}朝你面前的案上看了一眼。你会意，把怀里那方旧帕子解开，三枚旧钱倒在掌心——被你焐了一整天，温的。',
    next: 'ch2-s6-080',
  },
  'ch2-s6-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '案卦的规矩你走过一遍了。今夜从头到尾，你自己来。我只提醒一句：一事一卦——问什么，想清楚再开口。',
    next: 'ch2-s6-090',
  },
  'ch2-s6-090': {
    type: 'narration',
    text: '你净手。焚香。三枚钱在香上过了一遍。要问的事，你在心里翻来覆去掂了几遍——「谁裁的页」？卦不报人名。「杂役去了哪」？他未必是主使。最后你落在了那一页本身上：',
    next: 'ch2-s6-100',
  },
  'ch2-s6-100': {
    type: 'dialogue', speaker: '{{player}}',
    text: '天何言哉，叩之即应。弟子{{player}}，为《遗卦残谱》裁去那一页的下落关心，不知休咎，罔释厥疑。惟神惟灵，若可若否，望垂昭报。',
    next: 'ch2-s6-110',
  },
  'ch2-s6-110': {
    type: 'narration',
    text: '沈疏桐在对面，几不可察地点了一下头。',
    next: 'ch2-s6-cast',
  },
  // 案卦：固定卦象 地火明夷 · 六爻安静。掷序 [7,8,7,8,8,8]。
  // 本章的掷由玩家自报（speaker: '{{player}}'，第一章默认沈疏桐逐掷讲解，本章省略默认改为逐掷自报）。
  // perThrow[2].interleaveNode 指向 ch2-s6-120：M1 于第 3 掷后（内卦成）渲染
  // 沈疏桐不语 + {{player}} 续祝链（resumeCast），再续第 4-6 掷；第 6 掷完成后进 ch2-s6-140。
  // （渲染契约：interleave 链在掷 3 后消费一次，不经 next 重复渲染。）
  'ch2-s6-cast': {
    type: 'castInteraction', castId: 'ch2-angua', mode: 'fixed',
    throws: [7, 8, 7, 8, 8, 8],
    question: '被裁走的那一页，如今在何处？',
    perThrow: [
      {
        throwIndex: 1, result: '单', coinFaces: '一背两字', lineName: '初爻',
        speaker: '{{player}}',
        speakerLine: '（钱落盘。一个背。）单。阳爻。（你自己报，自己画。{{ta}}不接话，只看。）',
      },
      {
        throwIndex: 2, result: '拆', coinFaces: '两背一字', lineName: '二爻',
        speaker: '{{player}}',
        speakerLine: '拆。阴爻。',
      },
      {
        throwIndex: 3, result: '单', coinFaces: '一背两字', lineName: '三爻',
        speaker: '{{player}}',
        speakerLine: '单。——内卦成了：阳、阴、阳，离中虚。（你顿了顿，指尖有点凉。）跟我的第一卦……一样的内卦。',
        interleaveNode: 'ch2-s6-120',
      },
      {
        throwIndex: 4, result: '拆', coinFaces: '两背一字', lineName: '四爻',
        speaker: '{{player}}',
        speakerLine: '拆。',
      },
      {
        throwIndex: 5, result: '拆', coinFaces: '两背一字', lineName: '五爻',
        speaker: '{{player}}',
        speakerLine: '又是拆。',
      },
      {
        throwIndex: 6, result: '拆', coinFaces: '两背一字', lineName: '上爻',
        speaker: '{{player}}',
        speakerLine: '（最后三枚钱停稳。两个背，一个字。）拆。外卦：阴、阴、阴——坤六断。',
      },
    ],
    next: 'ch2-s6-140',
  },
  // ── 摇卦 interleave 链（第 3 掷后消费一次）──
  'ch2-s6-120': {
    type: 'narration',
    text: '沈疏桐没说话。灯焰在{{ta}}眼里跳了一下。',
    next: 'ch2-s6-130',
  },
  'ch2-s6-130': {
    type: 'dialogue', speaker: '{{player}}',
    text: '内象已成，吉凶未判，再求外象三爻，以成一卦，以决忧疑。',
    aside: '续祝。',
    // Player contract: render this node, then hand control back to the paused
    // cast panel for throws 4-6; on the 6th throw advance to `next` (s6-140).
    resumeCast: true,
    next: 'ch2-s6-140',
  },
  // ── 六掷落定 ──
  'ch2-s6-140': {
    type: 'narration',
    text: '你的笔停在纸上方，没落下去。',
    next: 'ch2-s6-150',
  },
  'ch2-s6-150': {
    type: 'narration',
    text: '坤上，离下。地在上，火在下。',
    next: 'ch2-s6-160',
  },
  'ch2-s6-160': {
    type: 'narration',
    text: '这个卦你今天见过。不是见过——你找了它一下午。它就是那张不在了的页。',
    next: 'ch2-s6-170',
  },
  'ch2-s6-170': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……地火明夷。',
    next: 'ch2-s6-180',
  },
  'ch2-s6-180': {
    type: 'narration',
    text: '香灰落了一截。堂里静得能听见灯芯燃烧的声音。',
    next: 'ch2-s6-190',
  },
  'ch2-s6-190': {
    type: 'narration',
    text: '你抬头看沈疏桐。{{ta}}坐得笔直，目光落在卦纸上，脸上什么都没有——正因为什么都没有，你才知道{{ta}}和你看见的是同一件事。',
    next: 'ch2-s6-200',
  },
  'ch2-s6-200': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '六爻安静，无一动爻。先别慌着想它像什么——把卦装完。',
    aside: '开口时，声音稳得像用尺子校过。',
    next: 'ch2-s6-210',
  },
  'ch2-s6-210': {
    type: 'dialogue', speaker: '{{player}}',
    text: '现在？',
    next: 'ch2-s6-220',
  },
  'ch2-s6-220': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '越是这种卦，越要照规矩装完。规矩不是拿来做样子的，是拿来稳手的。——正好，装卦三件事，你还差最后一件。',
    next: 'ch2-s6-230',
  },

  // ── 6.2 浑天甲子 ──
  'ch2-s6-230': {
    type: 'narration',
    text: '{{ta}}起身，把白日里那幅八宫全图轴挂回窗边，又从袖中抽出一张折得整整齐齐的纸，展开，压在你手边——一张小表，八行，每行两栏：某卦在内、某卦在外，各三个字带着五行。',
    next: 'ch2-s6-240',
  },
  'ch2-s6-240': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '籍贯有了，世应有了——可爻还是六道没名没姓的画。最后一步：给爻装上地支。装了支，爻才有名有姓；名字里带着五行，卦才算装完。',
    next: 'ch2-s6-250',
  },
  'ch2-s6-250': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '装法不用背，用查——内卦查内栏，外卦查外栏，这是老规矩：同一个卦，站在内和站在外，装的支不一样，错一栏，全盘错。',
    next: 'ch2-s6-260',
  },
  'ch2-s6-260': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '方向呢？',
    aside: '{{ta}}忽然反问你。',
    next: 'ch2-s6-270',
  },
  'ch2-s6-270': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……从下往上——卦是从地里长出来的。',
    next: 'ch2-s6-280',
  },
  'ch2-s6-280': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '没忘，很好。画卦从下往上，装支也从下往上。',
    next: 'ch2-s6-290',
  },
  'ch2-s6-290': {
    type: 'narration',
    text: '{{ta}}的指尖点在表上「离在内」一行：卯木、丑土、亥水。',
    next: 'ch2-s6-300',
  },
  'ch2-s6-300': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你这卦内卦是离。看好——初爻，装卯木。',
    next: 'ch2-s6-310',
  },
  'ch2-s6-310': {
    type: 'narration',
    text: '{{ta}}提笔，在初爻旁写下一个小小的「卯」字。',
    next: 'ch2-s6-dr1',
  },
  // 装卦盘状态事件（dressingUpdate）：board 为每次的累积全量状态；board:null 表示清盘。
  'ch2-s6-dr1': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 8, 7, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '卯', wuxing: '木' },
      ],
      marks: null,
    },
    next: 'ch2-s6-tm1',
  },
  'ch2-s6-tm1': {
    type: 'teachMoment', kpId: 'KP-LY-005', stage: 'demo', masteryTo: '见过', lingli: 1,
    note: '装支即给爻配地支（支带五行，爻从此有名有姓）；内外卦各查各栏；自下而上装。依据《增删卜易·渾天甲子章第四》「離在內：卯木丑土亥水……點卦由下而上﹐故裝五行也由下而上」。天干注：{{senior}}此处只带一句「支的前头本还各配一个天干——那是这门功课的另一半，筑基再还你」，不展开不考（简化口径的剧情化声明，KP 卡 simplificationNote 对应）。',
    next: 'ch2-s6-320',
  },
  'ch2-s6-320': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '二爻、三爻，你来。表在这儿，照着装。',
    next: 'ch2-s6-330',
  },
  'ch2-s6-330': {
    type: 'choice',
    prompt: null, // 引导应用 · KP-LY-005；教学答错不惩罚，{{senior}}纠正后继续，不计 wrong
    options: [
      {
        text: '二爻丑土，三爻亥水',
        response: { speaker: '沈疏桐', text: '对。离在内：卯、丑、亥，从下往上，一爻一支。' },
        next: 'ch2-s6-dr2',
      },
      {
        text: '二爻亥水，三爻丑土',
        response: { speaker: '沈疏桐', text: '顺序反了。表上怎么排的，爻上就怎么装——卯、丑、亥，从下往上挨个来，不许跳。' },
        next: 'ch2-s6-dr2',
      },
      {
        text: '二爻未土，三爻巳火',
        response: { speaker: '沈疏桐', text: '你查到外栏去了。离在内——内卦查内栏：卯、丑、亥。眼睛放亮，栏别串。' },
        next: 'ch2-s6-dr2',
      },
    ],
  },
  'ch2-s6-dr2': {
    type: 'dressingUpdate',
    board: {
      throws: [7, 8, 7, 8, 8, 8],
      revealed: [
        { pos: 1, branch: '卯', wuxing: '木' },
        { pos: 2, branch: '丑', wuxing: '土' },
        { pos: 3, branch: '亥', wuxing: '水' },
      ],
      marks: null,
    },
    next: 'ch2-s6-tm2',
  },
  'ch2-s6-tm2': {
    type: 'teachMoment', kpId: 'KP-LY-005', stage: 'guided', masteryTo: '用过', lingli: 3,
    note: '玩家照表完成内卦剩余两爻的装支（教学答错不惩罚，{{senior}}纠正后继续，不计 wrong）。依据《增删卜易·渾天甲子章第四》。',
    next: 'ch2-s6-340',
  },
  'ch2-s6-340': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '内卦装完：卯木、丑土、亥水。还剩外卦三爻——',
    next: 'ch2-s6-350',
  },
  'ch2-s6-350': {
    type: 'narration',
    text: '{{ta}}把笔递给你，自己往椅背一靠，抱起手臂。你认得这个姿势。',
    next: 'ch2-s6-360',
  },
  'ch2-s6-360': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '外卦是坤。自己装。装完把六个字连起来念给我听。',
    next: 'ch2-s6-cp03',
  },
  'ch2-s6-cp03': {
    type: 'scoredChoice', cpId: 'CH2-CP-03', testsKp: ['KP-LY-005'],
    prompt: '独立装完案卦外卦三支（表可查、无口头提示）',
    context: '（案上：装支小表摊着。你的卦：内离已装卯、丑、亥；外卦坤，待装四、五、上三爻。）',
    options: [
      {
        key: 'A',
        text: '四爻丑土，五爻亥水，上爻酉金——坤在外：丑、亥、酉。',
        verdict: 'optimal',
        basis: '内外栏之辨的独立应用：坤在外装丑亥酉，自下而上四丑、五亥、上酉。连读全卦：卯丑亥·丑亥酉，装卦完成。',
        sourceRef: [
          '《增删卜易·渾天甲子章第四》：「坤在外：丑土亥水酉金」（ctext wiki chapter=950329）',
        ],
        next: 'ch2-s6-cp03a010',
      },
      {
        key: 'B',
        text: '四爻未土，五爻巳火，上爻卯木——坤：未、巳、卯。',
        verdict: 'suboptimal',
        basis: '查对了卦、串了栏——「坤在內：未土巳火卯木」是坤站在下三爻时的装法。半对：知道去查坤，没守住内外之辨（本课刚教的第一条）。',
        sourceRef: [
          '《增删卜易·渾天甲子章第四》：「坤在內：未土巳火卯木。坤在外：丑土亥水酉金」——一卦两栏，此其所以要分内外',
        ],
        next: 'ch2-s6-cp03b010',
      },
      {
        key: 'C',
        text: '四爻子水，五爻寅木，上爻辰土。',
        verdict: 'wrong',
        basis: '子寅辰是乾、震在内的装法——行都查错了。查表第一步是找对行：外卦是坤，就查坤。',
        sourceRef: [
          '《增删卜易·渾天甲子章第四》：「乾在內：子水寅木辰土」「震在內：子水寅木辰土」——此二行非坤',
        ],
        next: 'ch2-s6-cp03c010',
      },
    ],
    rewards: {
      optimal: { lingli: 5, favor: 2, mastery: 'KP-LY-005 → 掌握' },
      suboptimal: { plot: '{{senior}}让玩家把内外两栏并排念三遍，重装后过', mastery: 'KP-LY-005 标记待复习' },
    },
    onWrong: '{{senior}}把玩家的手按到表上坤字那一行，从行首重查重装。KP-LY-005 标记待复习。不锁进度。',
  },

  // ── CP-03 选 A（optimal）──
  'ch2-s6-cp03a010': {
    type: 'narration',
    text: '你装完最后一个「酉」字，把六个名字从下往上连起来念：',
    next: 'ch2-s6-cp03a020',
  },
  'ch2-s6-cp03a020': {
    type: 'dialogue', speaker: '{{player}}',
    text: '卯木、丑土、亥水；丑土、亥水、酉金。',
    next: 'ch2-s6-cp03a030',
  },
  'ch2-s6-cp03a030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '——装完了。这是你装的第一张全卦。',
    next: 'ch2-s6-cp03a040',
  },
  'ch2-s6-cp03a040': {
    type: 'narration',
    text: '{{ta}}说这句话的时候没有任何形容词，但你听得出来，这句本身就是那个形容词。',
    next: 'ch2-s6-dr3',
  },

  // ── CP-03 选 B（suboptimal）：串栏重装线 ──
  'ch2-s6-cp03b010': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '停。你装的是坤在内的支。你的坤在哪儿？',
    next: 'ch2-s6-cp03b020',
  },
  'ch2-s6-cp03b020': {
    type: 'dialogue', speaker: '{{player}}',
    text: '……在外卦。',
    next: 'ch2-s6-cp03b030',
  },
  'ch2-s6-cp03b030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '内外两栏，并排，念三遍。',
    aside: '你念了三遍：坤在内，未巳卯；坤在外，丑亥酉。然后重装。',
    next: 'ch2-s6-cp03b040',
  },
  'ch2-s6-cp03b040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记住这个错——十个初学装卦的，九个栽在串栏上。你今天栽过了，以后就轮不到你。',
    m1Note: 'KP-LY-005 标记待复习。',
    next: 'ch2-s6-dr3',
  },

  // ── CP-03 选 C（wrong）：查错行重查线 ──
  'ch2-s6-cp03c010': {
    type: 'narration',
    text: '沈疏桐没说话，伸手把你执笔的手按到小表上，按在「坤」字那一行的行首。',
    next: 'ch2-s6-cp03c020',
  },
  'ch2-s6-cp03c020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '查表先找行。你的外卦是什么？',
    next: 'ch2-s6-cp03c030',
  },
  'ch2-s6-cp03c030': {
    type: 'dialogue', speaker: '{{player}}',
    text: '坤。',
    next: 'ch2-s6-cp03c040',
  },
  'ch2-s6-cp03c040': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '那你在乾的行里替它拿什么主意？——从这儿，重查，重装。',
    aside: '你从坤行重新查起：在外，丑、亥、酉。',
    m1Note: 'KP-LY-005 标记待复习；重装后过关，不锁进度。',
    next: 'ch2-s6-dr3',
  },

  // ── CP-03 三线汇合：全卦装齐 ──
  'ch2-s6-dr3': {
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
      marks: null,
    },
    next: 'ch2-s6-400',
  },

  // ── 6.3 卦开口了 ──
  'ch2-s6-400': {
    type: 'narration',
    text: '六道爻，六个名字，一枚世点一枚应点——沈疏桐接过笔，最后替你把世应点上：世在四爻丑土旁，应在初爻卯木旁。',
    next: 'ch2-s6-dr4',
  },
  'ch2-s6-dr4': {
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
    next: 'ch2-s6-410',
  },
  'ch2-s6-410': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '坎宫，游魂，世四，应初。你安的世应、装的支，跟这册天下任何一个懂装卦的人来装，一字不差——这就是装卦：不看手气，只看功夫。',
    next: 'ch2-s6-420',
  },
  'ch2-s6-420': {
    type: 'narration',
    text: '{{ta}}把卦纸转过来，正对着你。',
    next: 'ch2-s6-430',
  },
  'ch2-s6-430': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '现在，念它的全名。',
    next: 'ch2-s6-440',
  },
  'ch2-s6-440': {
    type: 'dialogue', speaker: '{{player}}',
    text: '地火明夷。坎宫游魂。六爻安静。世在四爻丑土，应在初爻——',
    next: 'ch2-s6-450',
  },
  'ch2-s6-450': {
    type: 'narration',
    text: '你念到这里，自己停住了。',
    next: 'ch2-s6-460',
  },
  'ch2-s6-460': {
    type: 'narration',
    text: '初爻，卯木。',
    next: 'ch2-s6-470',
  },
  'ch2-s6-470': {
    type: 'narration',
    text: '你想起白天{{ta}}教世应时说过的话。你把怀里那张贲卦的卦纸摸出来，两张纸并排放着：你的第一卦，世在初爻，卯木——是你。今夜这张卦，应在初爻，还是卯木。',
    next: 'ch2-s6-480',
  },
  'ch2-s6-480': {
    type: 'dialogue', speaker: '{{player}}',
    text: '{{senior}}……我的世，和它的应，是同一爻。',
    next: 'ch2-s6-490',
  },
  'ch2-s6-490': {
    type: 'narration',
    text: '沈疏桐看着那两张并排的卦纸，很久没有说话。',
    next: 'ch2-s6-500',
  },
  'ch2-s6-500': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '世是自己，应是彼端。你问那一页的下落——它在应上答你。应爻卯木，贴着地的那一爻；上头，坤土六断，厚厚地盖着。',
    next: 'ch2-s6-510',
  },
  'ch2-s6-510': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明入地中。',
    next: 'ch2-s6-520',
  },
  'ch2-s6-520': {
    type: 'narration',
    text: '{{ta}}的声音很轻，轻得像在替谁转述：',
    next: 'ch2-s6-530',
  },
  'ch2-s6-530': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '你问它在哪儿。它把自己的名字，又报了一遍。',
    next: 'ch2-s6-540',
  },
  'ch2-s6-540': {
    type: 'narration',
    text: '你的后颈慢慢地麻上来。第一卦那晚是「舍车而徒」擦着你过去；今夜这个更安静，也更沉——一页被裁走的、不会说话的纸，借你的三枚钱，把自己的名字端端正正报还给你。',
    next: 'ch2-s6-550',
  },
  'ch2-s6-550': {
    type: 'dialogue', speaker: '{{player}}',
    text: '它……为什么是安静的？',
    next: 'ch2-s6-560',
  },
  'ch2-s6-560': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '小满那张泰卦也安静。安静的卦，答案也安静——',
    next: 'ch2-s6-570',
  },
  'ch2-s6-570': {
    type: 'narration',
    text: '{{ta}}顿了很久，才把后半句说完：',
    next: 'ch2-s6-580',
  },
  'ch2-s6-580': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '它不动，是因为它已经藏好了。藏得很深，藏它的人不打算再动它——至少眼下不打算。',
    next: 'ch2-s6-590',
  },
  'ch2-s6-590': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '所以急不来。物有其时，卦有其应。它等得起，我们也等得起。',
    next: 'ch2-s6-600',
  },
  'ch2-s6-600': {
    type: 'narration',
    text: '{{ta}}说「等得起」三个字的时候，右手拇指又一次、很轻地按住了袖中那只旧钱囊。灯下你看得清清楚楚。',
    next: 'ch2-s6-610',
  },
  'ch2-s6-610': {
    type: 'narration',
    text: '这一次，{{ta}}发现你在看。{{ta}}没有解释，你也没有问。',
    next: 'ch2-s6-620',
  },

  // ── 6.4 籍贯而已 ──
  'ch2-s6-620': {
    type: 'narration',
    text: '香烧尽了。{{ta}}收卦纸的时候，你把自己那张贲卦收回怀里——指尖碰到帕子里另一张折着的纸。',
    next: 'ch2-s6-630',
  },
  'ch2-s6-630': {
    type: 'narration',
    text: '你的本命卦。第一章那晚摇的，{{ta}}不许解、也不许找人解的那张。',
    next: 'ch2-s6-640',
  },
  'ch2-s6-640': {
    type: 'narration',
    text: '你捏着它，忽然意识到一件事：现在的你，会查籍贯了。只要把它在轴上找一找，你就能知道自己的本命卦是哪一宫的、第几卦、世应何在——',
    next: 'ch2-s6-650',
  },
  'ch2-s6-650': {
    type: 'narration',
    text: '你抬头，正撞上沈疏桐的目光。',
    next: 'ch2-s6-660',
  },
  'ch2-s6-660': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '……想查？',
    next: 'ch2-s6-670',
  },
  'ch2-s6-670': {
    type: 'choice',
    prompt: null, // 不计分 · 风味（两选项等值殊途；本命卦只报籍贯不解读——红线延续）
    options: [
      {
        text: '想。就查个籍贯',
        response: {
          speaker: '沈疏桐',
          text: '查吧。籍贯而已，算不得解卦。——解，还是不许。',
          aside: '{{ta}}把轴子往你这边让了让。',
        },
        effects: { favor: 1 },
        dynamicNatal: true, // 查线动态文本：按存档 player.natalHexagram 的宫位生成（M 注记 § 0 第 9 条）；ch2-s6-680 保留字面占位为 fallback
        next: 'ch2-s6-680',
      },
      {
        text: '不查了。它跑不掉',
        response: {
          speaker: '沈疏桐',
          text: '……学我说话。不查也对。物有其时——它的时候没到，你的功夫也还没到。',
          aside: '难得地、极轻地笑了半声。{{ta}}把轴子卷了起来。',
        },
        effects: { favor: 1 },
        next: 'ch2-s6-drclear',
      },
    ],
  },
  'ch2-s6-680': {
    type: 'narration',
    text: '你把那张卦在轴上找到了：〔按玩家实际本命卦生成：某宫，第几，某世/游魂/归魂〕。原来它一直有籍贯，有位次，有名有姓——只是还没到开口的时候。',
    m1Note: '〔按玩家实际本命卦生成〕段由渲染层按 player.natalHexagram 动态替换（选项 dynamicNatal 标记）；此处字面文本为 fallback。',
    next: 'ch2-s6-drclear',
  },
  'ch2-s6-drclear': {
    type: 'dressingUpdate',
    board: null,
    next: 'ch2-s7-header',
  },

  // ═══════════════ 第七幕 · 灯 ═══════════════
  'ch2-s7-header': {
    type: 'sceneHeader', scene: 7, title: '灯',
    time: '夜半', ambience: '明蓍堂门口 → 弟子舍方向。',
    m1Note: '本幕功能：章末收束；好感事件；钩子清点；下一课预告。',
    next: 'ch2-s7-010',
  },
  'ch2-s7-010': {
    type: 'narration',
    text: '{{ta}}送你到明蓍堂门口。夜已经深透了，山里的月色白得像霜。',
    next: 'ch2-s7-020',
  },
  'ch2-s7-020': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '点验的册子，明日我给郑司书回个『验讫』。官面上，这册谱完好如初，一页不缺——',
    next: 'ch2-s7-030',
  },
  'ch2-s7-030': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '实账在你我心里：缺一页明夷，浮一页假中孚，一扇一个月的窗，三个名字，一个开春下了山。',
    next: 'ch2-s7-040',
  },
  'ch2-s7-040': {
    type: 'narration',
    text: '{{ta}}屈指，一样一样数给你听。数完，看着你。',
    next: 'ch2-s7-050',
  },
  'ch2-s7-050': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '今天一天，你让三十一张哑卦报了名，从缺位里揪出一个名字，从一枚点错的世点里揪出一页假纸——最后那张卦，还是你亲手摇的、亲手装的。',
    next: 'ch2-s7-060',
  },
  'ch2-s7-060': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '记着这个日子。从今天起，你不是只会摇卦的人了——你装得出一张有名有姓的全卦。',
    next: 'ch2-s7-070',
  },
  'ch2-s7-070': {
    type: 'narration',
    text: '你还没来得及高兴，{{ta}}的下一句就到了：',
    next: 'ch2-s7-080',
  },
  'ch2-s7-080': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '明日休一日。后日卯时，明蓍堂——下一课，教你的卦开口叫人：一张卦里，谁是父母，谁是妻财，谁是官鬼。',
    aside: '{{ta}}看你一眼。',
    next: 'ch2-s7-090',
  },
  'ch2-s7-090': {
    type: 'dialogue', speaker: '沈疏桐',
    text: '别瞪眼。卦里住着一家人，到时候你就知道了。',
    next: 'ch2-s7-100',
  },
  'ch2-s7-100': {
    type: 'narration',
    text: '你行礼告退。走出十几步，鬼使神差地，你回了一次头。',
    next: 'ch2-s7-110',
  },
  'ch2-s7-110': {
    type: 'narration',
    variants: {
      female: '明蓍堂的灯还亮着。窗纸上映着她的影子：坐得笔直，面前平摊着什么——你知道是那两张卦纸。你站着看了一会儿，忽然想起白天她说「明入地中」时按住钱囊的手，想起那句轻得像替谁转述的话。她说这案子等得起。可灯下那个影子，怎么看，都不像等得起的样子。',
      male: '明蓍堂的灯还亮着。窗纸上映着他的影子：坐得笔直，面前平摊着什么——你知道是那两张卦纸。你站着看了一会儿，忽然想起白天他说「明入地中」时按住钱囊的手，想起那句轻得像替谁转述的话。他说这案子等得起。可灯下那个影子，怎么看，都不像等得起的样子。',
    },
    effects: { favor: 1 },
    m1Note: '章末事件「灯下的影子」：你把这一眼收进心里，没有告诉任何人（好感 +1，自动触发）。',
    next: 'ch2-s7-120',
  },
  'ch2-s7-120': {
    type: 'narration',
    text: '你揣着两张卦纸往回走。三枚旧钱在帕子里贴着心口，被夜风吹得也不凉。',
    next: 'ch2-s7-130',
  },
  'ch2-s7-130': {
    type: 'narration',
    text: '你想起这一天：三十一个哑巴一页页开口报名，被裁走的那页在缺位里露出名字，假页在一枚点错的墨点上露出马脚；最后，你亲手摇出的卦，把那个名字又还给了你。',
    next: 'ch2-s7-140',
  },
  'ch2-s7-140': {
    type: 'narration',
    text: '卦有名，页有名，经手的人也有名有姓——只是还没到报出来的时候。',
    next: 'ch2-s7-150',
  },
  'ch2-s7-150': {
    type: 'narration',
    text: '裁页的人在门里。取货的人在山下。而你的{{senior}}，此刻正独自坐在灯下，陪着一张明入地中的卦。',
    next: 'ch2-s7-160',
  },
  'ch2-s7-160': {
    type: 'narration',
    text: '物有其时，卦有其应。',
    next: 'ch2-s7-170',
  },
  'ch2-s7-170': {
    type: 'narration',
    text: '你摸了摸怀里的钱，忽然明白这句话还有下半句没人说出来——',
    next: 'ch2-s7-180',
  },
  'ch2-s7-180': {
    type: 'narration',
    text: '人，也有其时。',
    next: 'ch2-end',
  },

  // ═══════════════ 第二章 · 终 ═══════════════
  'ch2-end': {
    type: 'chapterEnd',
    title: '【第二章 · 终】',
    rewards: { lingli: 10 },
    hooks: [
      '明夷缺页 + 中孚伪页——残谱藏着什么（主线核心悬念升级）',
      '修书房三人、杂役开春下山（内应线收窄，第三章立人）',
      '{{senior}}灯下独坐 + 按钱囊——师承旧事引力增强（《钱囊》番外入口本章通关后开启）',
      '「明入地中」意象与失踪者暗合（回放《钱囊》后自明）',
      '本命卦籍贯已可查、解读仍封印（个人长线推进一格）',
    ],
    nextChapterTeaser: '下一课，教你的卦开口叫人——一张卦里，谁是父母，谁是妻财，谁是官鬼。',
  },
  },
};

export default CHAPTER_2;
