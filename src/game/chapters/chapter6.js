// Chapter 6 《动爻》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_6_SCRIPT_v1.md v1.1 (two-round review converged
// 2026-07-18; owner-gate delegated). This file is a FAITHFUL transcription.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1-5.js headers. ch6 uses NO new node types.
// ch6-specific conventions:
// - favorBranch(45) is in ACT SIX (natal homework beat, ch6-s6-fb) — NOT the opener
//   (ch5 used the opener slot). pass=知心 close, fail=课业 close; both chains zero
//   favor, converge at ch6-s6-merge. Pre-fork max accumulation is +9 (guides 3 +
//   CP 1/2/2 + case-flavor 1); chapter-end +1 lands after.
// - Dual fixed periods: act 1 = 辰月己酉日 ({year:2026,month:4,day:5}), acts 2-7
//   anchor day = 辰月辛亥日 ({year:2026,month:4,day:7,hour:21}). 22 days after ch5
//   丁亥 (script wording: 二十余日 — NOT 旬日, R1 P2-7).
// - Case gua 观之剥 has ONE moving line (5th, 辛巳官鬼→变丙子子孙). DressingUpdate
//   board gains optional `bian` field on revealed rows: { pos:5, ..., moving:true,
//   bian:'子·子孙' } — renderer support added this chapter (wangshuai-column model).
// - 巳线两层分离 (机检): natal homework nodes (ch6-s6-fb through ch6-s6-merge span)
//   must not contain 案情指称词 他/动手/贼/来取 — lint-enforced.
// - Banned-term whitelist deltas vs ch5: UNBAN 動爻生克语境/變爻/回頭生/回頭克/
//   暗動机理/日破/沖散辨伪/择动; NEW BANS 化進神/化退神/化空/沖空/沖起/合住/沖實.
//   仇神 whitelist from ch5 (single node) does NOT carry over — zero occurrences here.
// - 「休」「囚」 single chars banned from dialogue text (泄气/衰半档 only).
//
// ── Coin-face convention (canonical) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_6 = {
  id: 'ch6',
  title: '动爻',
  scriptVersion: 'v1.1-converged-2026-07-18',
  entryNode: 'ch6-s1-header',

  // 剧情固定卦象：风地观之山地剥 · 五爻辛巳官鬼独发（乾宫四世；引擎实测 2026-07-18，辰月辛亥日）
  // 教学复盘卦：火天大有辰月快照（幕六）；動靜生克章谱例（坤/兌之歸妹/坤之晉——口头，不上盘）。
  fixedCase: {
    throws: [8, 8, 8, 8, 9, 7], // 初爻→上爻；五爻 9=老阳動
    benGua: '风地观',
    bianGua: '山地剥',
    palace: '乾宫',
    guaType: '四世',
    movingLine: 5, // 1-based position
    period: { monthBranch: '辰', dayGanzhi: '辛亥', engineRef: { year: 2026, month: 4, day: 7, hour: 21 } },
  },

  nodes: {
    "ch6-s1-header": {
      "type": "sceneHeader",
      "scene": 1,
      "title": "换月",
      "time": "晨",
      "ambience": "明蓍堂（主场）。辰月第一日。",
      "m1Note": "本幕功能：时间跳跃交代（二十余日，他未再现）；换月仪式＝旺衰复习（ch4 资产换景）；巳月倒计时重申；铜铃章程近况；幕末半句反转口。剧情时间：辰月己酉日（§ 0 第 1 条——幕一换月牌占期，引擎参考 {year:2026,month:4,day:5}，清明入辰）。",
      "next": "ch6-s1-010"
    },
    "ch6-s1-010": {
      "type": "narration",
      "text": "守窗改章程之后，二十余日过去了。",
      "next": "ch6-s1-020"
    },
    "ch6-s1-020": {
      "type": "narration",
      "text": "铜铃装在柴棚梁下，线走窗销，绷得不松不紧——{{ta}}每夜亲手校一遍。你的巳时班照旧，{{ta}}的夜班照旧。",
      "next": "ch6-s1-030"
    },
    "ch6-s1-030": {
      "type": "narration",
      "text": "墙外那条小径，再没有人停过。草长起来，把两处压痕慢慢盖了。",
      "next": "ch6-s1-040"
    },
    "ch6-s1-040": {
      "type": "narration",
      "text": "他像是缩回了夜里。{{senior}}说这叫「蓄」。",
      "next": "ch6-s1-050"
    },
    "ch6-s1-050": {
      "type": "narration",
      "text": "今晨你进明蓍堂时，{{ta}}正站在案前，手里拿着一张新裁的纸。案头原本压着的那张写着「卯」的旧纸，已经揭下来了。",
      "next": "ch6-s1-060"
    },
    "ch6-s1-060": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "来得正好。",
      "next": "ch6-s1-070"
    },
    "ch6-s1-070": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}提笔，在新纸上落了一个字——",
      "text": "辰。",
      "next": "ch6-s1-080"
    },
    "ch6-s1-080": {
      "type": "narration",
      "text": "{{ta}}把纸压回案头原处，动作有点像上香——认真得近乎郑重。",
      "next": "ch6-s1-090"
    },
    "ch6-s1-090": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "今日清明。从这一刻起，满盘的令换了——卯月的账翻篇，辰月的账开张。",
      "next": "ch6-s1-100"
    },
    "ch6-s1-100": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "换一个月建，就要重估满盘。",
      "next": "ch6-s1-110"
    },
    "ch6-s1-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "课没白上。",
      "next": "ch6-s1-120"
    },
    "ch6-s1-120": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把笔搁下，",
      "text": "说说看。辰属什么？",
      "next": "ch6-s1-130"
    },
    "ch6-s1-130": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "辰属土。土当令——满山的木，都退一步。",
      "next": "ch6-s1-140"
    },
    "ch6-s1-140": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "那枚巳火呢？",
      "next": "ch6-s1-150"
    },
    "ch6-s1-150": {
      "type": "narration",
      "text": "你知道{{ta}}问的是谁。那枚在三张卦上坐了三次的巳。",
      "next": "ch6-s1-160"
    },
    "ch6-s1-160": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "卯月木生火，他得生，旺。辰月——火生土，他泄气。衰半档。",
      "m1Note": "红线自查：巳火三态复述为 ch4/ch5 已教口径纯复习，零新知识；「泄气」「衰半档」措辞沿 ch5（§ 0 第 8 条——「休」「囚」不入台词）。",
      "next": "ch6-s1-170"
    },
    "ch6-s1-170": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "嗯。第五课的账，你记住了。",
      "next": "ch6-s1-180"
    },
    "ch6-s1-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}走到窗边，看着后山的方向，",
      "text": "卯月他在蓄，辰月他在忍——这话我说过。如今卯月完了。",
      "m1Note": "「卯月他在蓄，辰月他在忍」＝ch5 幕七正典原句回收。",
      "next": "ch6-s1-190"
    },
    "ch6-s1-190": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "辰月过完，就是巳月。",
      "next": "ch6-s1-200"
    },
    "ch6-s1-200": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "一个月。",
      "next": "ch6-s1-210"
    },
    "ch6-s1-210": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的声音很平，",
      "text": "他最硬的那三十天，还有一个月就到。我们的铃，校了二十多个夜；我们的局，布好了等开锣。",
      "m1Note": "「布好了等开锣」＝ch5「布好局，等开锣」的时态化用（非逐字，R1 P2 裁定勿标原句）。",
      "next": "ch6-s1-220"
    },
    "ch6-s1-220": {
      "type": "narration",
      "text": "{{ta}}回过身，看你一眼，唇角有一点冷冷的弧度。",
      "next": "ch6-s1-230"
    },
    "ch6-s1-230": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "他若聪明，就该忍满这个月，等他的时令——那样这局是我们等他。",
      "next": "ch6-s1-240"
    },
    "ch6-s1-240": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "若他比聪明——再多一分呢？",
      "next": "ch6-s1-250"
    },
    "ch6-s1-250": {
      "type": "narration",
      "text": "{{ta}}没有立刻答。灯下{{ta}}的目光动了一下，像秤杆上的星挪了半格。",
      "next": "ch6-s1-260"
    },
    "ch6-s1-260": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "……那这局，就有意思了。",
      "m1Note": "幕末半句＝「他不等了」的反转口（幕二引爆）；她的「有意思」＝角色表「兴奋」基调的第一次露头。",
      "next": "ch6-s2-header"
    },
    "ch6-s2-header": {
      "type": "sceneHeader",
      "scene": 2,
      "title": "铃响",
      "time": "辰月第三夜，子时前",
      "ambience": "修书房后院（bg-xiushufang）。",
      "m1Note": "本幕功能：第一次交手事件——铃响/人走脱/现场勘验；双问题立起（①为什么辰月动 ②手法懂行）；笔帽拾得（意义幕五揭）；转幕三开课。剧情时间：辰月辛亥日夜（§ 0 第 1 条——主体日开始）。本幕零教学内容（纯事件幕）。",
      "next": "ch6-s2-010"
    },
    "ch6-s2-010": {
      "type": "narration",
      "text": "铃响的时候，你还没有睡沉。",
      "next": "ch6-s2-020"
    },
    "ch6-s2-020": {
      "type": "narration",
      "text": "两声。极短的两声，像有人掐着它的舌头，不许它喊完。然后是死一样的静。",
      "next": "ch6-s2-030"
    },
    "ch6-s2-030": {
      "type": "narration",
      "text": "你披衣出门时，后山的风正往院里灌。赶到修书房后院，柴棚里那盏罩布小灯已经亮了——{{ta}}站在后窗下，手里提着灯，火光照着窗销。",
      "next": "ch6-s2-040"
    },
    "ch6-s2-040": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "人走了。翻的西墙。",
      "next": "ch6-s2-050"
    },
    "ch6-s2-050": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的声音听不出恼，反而稳得出奇，",
      "text": "别跑——看脚下，留着痕迹。",
      "next": "ch6-s2-060"
    },
    "ch6-s2-060": {
      "type": "narration",
      "text": "你放轻脚步过去。灯光下，窗销上的情形看得分明——",
      "next": "ch6-s2-070"
    },
    "ch6-s2-070": {
      "type": "narration",
      "text": "铃线还挂着，却只剩一股。另一股断口整齐，断头卷着，像被极薄的刃挑开的。",
      "next": "ch6-s2-080"
    },
    "ch6-s2-080": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "我这线是双绞的。他摸到了线，知道铃的路数，用薄刃先挑——想把线卸了再开窗。",
      "next": "ch6-s2-090"
    },
    "ch6-s2-090": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}用指尖虚虚一点断口，",
      "text": "挑断第一股的时候，张力一变，铃就说话了。",
      "next": "ch6-s2-100"
    },
    "ch6-s2-100": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "所以铃只响了两声——",
      "next": "ch6-s2-110"
    },
    "ch6-s2-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "他手快。铃一动他就撒手，转身翻墙。前后不过三息。",
      "next": "ch6-s2-120"
    },
    "ch6-s2-120": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把灯举高些，照向西墙——墙头一片瓦灰蹭落，草里两个深深的鞋尖蹬痕，",
      "text": "仓促。这一回，是真仓促。",
      "m1Note": "铃线单股断口/瓦灰/蹬痕＝现场三物证；「三息」「两声」＝仓促定调（幕四「他失手了」的物理底）。",
      "next": "ch6-s2-130"
    },
    "ch6-s2-130": {
      "type": "narration",
      "text": "你蹲下去看那两个蹬痕，心跳还没平。守了这么多夜，他终于碰了窗——却在你们的铃上折了手。",
      "next": "ch6-s2-140"
    },
    "ch6-s2-140": {
      "type": "narration",
      "text": "{{ta}}提着灯沿墙根走了一趟，忽然停住。",
      "next": "ch6-s2-150"
    },
    "ch6-s2-150": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "{{player}}。这里。",
      "next": "ch6-s2-160"
    },
    "ch6-s2-160": {
      "type": "narration",
      "text": "墙根的草窝里，一点铜色的反光。{{ta}}用帕子垫着手拾起来——一枚铜制笔帽，磨得很旧，帽口有一圈细细的坑洼。",
      "m1Note": "笔帽＝新立正典道具（§ 0 第 10 条——本幕只拾得不识，帽口坑洼幕五不解、留 ch7）。",
      "next": "ch6-s2-170"
    },
    "ch6-s2-170": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "笔帽？他掉的？",
      "next": "ch6-s2-180"
    },
    "ch6-s2-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "或者他掉的，或者早就躺在这儿。",
      "next": "ch6-s2-190"
    },
    "ch6-s2-190": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把它包进帕子收好，声音放缓，",
      "text": "天亮再看。急不得——东西不会跑，账跑不了。",
      "m1Note": "「账跑不了」＝幕六「账还在往后」收账线的口头预热（同词呼应，非知识内容）。",
      "next": "ch6-s2-200"
    },
    "ch6-s2-200": {
      "type": "narration",
      "text": "{{ta}}直起身，看了一眼那半断的铃线，又看了一眼墙头缺月。",
      "next": "ch6-s2-210"
    },
    "ch6-s2-210": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "{{senior}}，我不明白。您说他在忍，说他等巳月——今夜才辰月初三。",
      "next": "ch6-s2-220"
    },
    "ch6-s2-220": {
      "type": "narration",
      "text": "{{ta}}沉默了一息。灯焰在{{ta}}眼里跳。",
      "next": "ch6-s2-230"
    },
    "ch6-s2-230": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "问得好。这一问，比铃响值钱。",
      "next": "ch6-s2-240"
    },
    "ch6-s2-240": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "还有一件更值钱的——你方才看见了：他挑线，挑得懂行。寻常贼剪线便是，他不剪，他挑——挑线的人知道：剪线铃必坠响，挑线才有机会无声。",
      "next": "ch6-s2-250"
    },
    "ch6-s2-250": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}顿了顿，",
      "text": "这不是第一回摸机关的手。",
      "next": "ch6-s2-260"
    },
    "ch6-s2-260": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "他为什么现在动？他的手为什么这么熟？",
      "m1Note": "双问题＝本章两条明线（①辰月为何动→幕四断卦「反预判」收 ②手法懂行→幕五錾记收窄「懂机关」环）。",
      "next": "ch6-s2-270"
    },
    "ch6-s2-270": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "两个问题。都好。",
      "next": "ch6-s2-280"
    },
    "ch6-s2-280": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把灯罩落下半边，只留一线光，",
      "text": "都不在墙上——在卦里。回明蓍堂。",
      "next": "ch6-s2-290"
    },
    "ch6-s2-290": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "现在？",
      "next": "ch6-s2-300"
    },
    "ch6-s2-300": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "就现在。",
      "next": "ch6-s2-310"
    },
    "ch6-s2-310": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}已经先一步往外走，声音从夜里飘回来，带着一点你许久没听过的锋利的亮，",
      "text": "他给我们送了一夜好课业——趁热。",
      "next": "ch6-s3-header"
    },
    "ch6-s3-header": {
      "type": "sceneHeader",
      "scene": 3,
      "title": "出手的人",
      "time": "同夜，子时后",
      "ambience": "明蓍堂。",
      "m1Note": "本幕功能：KP-LY-016 示范＋引导（四处框架收口前半；動者力大）；「开那两本账」回响（ch4 幕四正典）；引导应答 +1。剧情时间：辰月辛亥日夜（连夜课——「趁热」）。",
      "next": "ch6-s3-010"
    },
    "ch6-s3-010": {
      "type": "narration",
      "text": "明蓍堂的灯点起来。夜过子时，堂里只有你们两人，和满架睡着的书。",
      "next": "ch6-s3-020"
    },
    "ch6-s3-020": {
      "type": "narration",
      "text": "{{ta}}铺开一张旧纸——你认得。第四课上，{{ta}}画过一张四格的图：月建、日辰，和空着的两格。那张纸{{ta}}一直留着。",
      "m1Note": "四格图＝ch4 幕四道具回收（正典：那张纸她留着）。",
      "next": "ch6-s3-030"
    },
    "ch6-s3-030": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "第四课我说过：原书数的是四处生克沖合。月建、日辰，你已会使。剩下两处，我说——等你认得动爻翻身，再开那两本账。",
      "m1Note": "「等你认得动爻翻身，再开那两本账」＝ch4 幕四逐字正典。",
      "next": "ch6-s3-040"
    },
    "ch6-s3-040": {
      "type": "narration",
      "text": "{{ta}}提笔，在第三格里落字。",
      "next": "ch6-s3-050"
    },
    "ch6-s3-050": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "今夜他替你把账本翻开了。开账。",
      "next": "ch6-s3-060"
    },
    "ch6-s3-060": {
      "type": "narration",
      "text": "格中墨迹未干：卦中动爻。",
      "next": "ch6-s3-070"
    },
    "ch6-s3-070": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "书上这一处，原文只一句——",
      "next": "ch6-s3-080"
    },
    "ch6-s3-080": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}从架上抽下那册谱，翻到夹签处，指给你，",
      "text": "『卦中之動爻能生克沖合』。卦里若有爻发动，这枚动爻就能生、克、沖、合别的爻——跟月建日辰一样，是一股活的力。",
      "next": "ch6-s3-090"
    },
    "ch6-s3-090": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "动爻……我们第一课就学过标动爻。三背为重，动。",
      "m1Note": "「三背为重」＝ch1 铜钱面正典（背=3 勿回退）。",
      "next": "ch6-s3-100"
    },
    "ch6-s3-100": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。第一课你学会认它，今夜学它做什么。",
      "next": "ch6-s3-110"
    },
    "ch6-s3-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把谱又往回翻了一页，",
      "text": "先看静的。谱上说——『六爻安靜旺相之爻﹐可以生得休囚之爻﹐亦可以克得休囚之爻﹐蓋旺相者有力之人也』。",
      "next": "ch6-s3-120"
    },
    "ch6-s3-120": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "听懂这句的关窍没有？六爻都站着不动的时候，谁能生克谁，看的是令——旺相的爻才有力气去生、去克休囚的爻。衰的爻，站着，就只能站着。",
      "next": "ch6-s3-130"
    },
    "ch6-s3-130": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "所以前两课称旺衰——静卦里，力气全从时令来。",
      "next": "ch6-s3-140"
    },
    "ch6-s3-140": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "不错。可爻一旦动了——",
      "next": "ch6-s3-150"
    },
    "ch6-s3-150": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的指尖敲在谱页另一行上，",
      "text": "你自己念。",
      "next": "ch6-s3-160"
    },
    "ch6-s3-160": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "『酉金發動𨿽則休囚﹐動而能克旺相之卯木……』——衰的金，动了，反而克得住当令的木？",
      "m1Note": "「動而能克旺相」由玩家亲口念出（教学引导性惯例：关键句让玩家的嘴说，witness 935 原文 byte-level 对撞已过 R1/R2）。",
      "next": "ch6-s3-170"
    },
    "ch6-s3-170": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "克得住。",
      "next": "ch6-s3-180"
    },
    "ch6-s3-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}直起身，",
      "text": "这就是第三处账的骨头：站着的人，借的是时令的力；出手的人，使的是自己的劲。站着的爻衰了就是衰了；可它一旦发动，衰也动得，动了就伤得了人——哪怕对面正当令。",
      "next": "ch6-s3-tm1"
    },
    "ch6-s3-tm1": {
      "type": "teachMoment",
      "kpId": "KP-LY-016",
      "stage": "demo",
      "masteryTo": "见过",
      "lingli": 1,
      "note": "動爻生克（四处之三）示范＝谱例二卦：章十四总纲句『卦中之動爻能生克沖合』（witness 提取行 903）＋静爻凭令对照『六爻安靜旺相之爻…蓋旺相者有力之人也』＋兌之歸妹例『酉金發動𨿽則休囚﹐動而能克旺相之卯木』（提取行 935，玩家亲口念出）。「站着的人，借的是时令的力；出手的人，使的是自己的劲」＝本 KP 控制性比喻（gameLine 同源）。",
      "next": "ch6-s3-190"
    },
    "ch6-s3-190": {
      "type": "narration",
      "text": "{{ta}}看着你，等这句话沉下去。",
      "next": "ch6-s3-200"
    },
    "ch6-s3-200": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "……所以，衰着的人，也敢动手。",
      "next": "ch6-s3-210"
    },
    "ch6-s3-210": {
      "type": "narration",
      "text": "灯焰一跳。你自己听见了自己这句话里的另一层意思。",
      "next": "ch6-s3-220"
    },
    "ch6-s3-220": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "你听见了。",
      "next": "ch6-s3-230"
    },
    "ch6-s3-230": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}没有笑，眼里的光却深了一层，",
      "text": "先把课上完——完了再说他。",
      "next": "ch6-s3-240"
    },
    "ch6-s3-240": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "练一手。谱上的老例子：春天寅卯月，占得坤卦，六爻安静。",
      "next": "ch6-s3-250"
    },
    "ch6-s3-250": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}随手在纸角写下六亲五行，",
      "text": "三爻卯木官鬼，当春——旺。二爻巳火父母。卯木对巳火，生还是克？",
      "next": "ch6-s3-260"
    },
    "ch6-s3-260": {
      "type": "choice",
      "prompt": null,
      "options": [
        {
          "text": "木生火——卯木生得动巳火，它当令，有力。",
          "response": {
            "speaker": "沈疏桐",
            "text": "对。静卦里旺相者有力——卯木当令，生得动巳火，也克得动丑未的土。"
          },
          "effects": {
            "favor": 1
          },
          "next": "ch6-s3-270"
        },
        {
          "text": "木克火。",
          "response": {
            "speaker": "沈疏桐",
            "text": "停。第二课的圈背一遍——木生火，火生土。卯木对巳火是生，不是克。"
          },
          "next": "ch6-s3-280"
        },
        {
          "text": "衰的爻不能生克——卯木动不了手。",
          "response": {
            "speaker": "沈疏桐",
            "text": "你把两句话缠在一起了。静爻看令——卯木当春正旺，不是衰，它有力。『衰了动不了手』说的是静爻；动爻另算——方才那句『動而能克旺相』，说的才是动爻。"
          },
          "next": "ch6-s3-290"
        }
      ]
    },
    "ch6-s3-270": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}颔首，",
      "text": "五行的账、时令的账，你都没丢。",
      "next": "ch6-s3-tm2"
    },
    "ch6-s3-280": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的笔杆在纸上点了点，",
      "text": "方向错一步，满盘全反。重来。",
      "next": "ch6-s3-tm2"
    },
    "ch6-s3-290": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}放缓半拍，",
      "text": "分两个匣子装：静爻凭令，动爻凭动。再答。",
      "next": "ch6-s3-tm2"
    },
    "ch6-s3-tm2": {
      "type": "teachMoment",
      "kpId": "KP-LY-016",
      "stage": "guided",
      "masteryTo": "用过",
      "lingli": 3,
      "note": "引导＝坤卦判方向（章十四第一例素材，纯旧知识拼装——五行方向 ch2＋旺衰 ch4）：春天寅卯月坤卦六爻安静，三爻卯木官鬼当春旺，对二爻巳火父母＝木生火，生得动。答错不惩罚：B 纠生克方向（木生火非克）、C 分「静爻凭令/动爻凭动」两匣后重答，不计 wrong，无好感。C 选项纠错语严格区分静爻/动爻两匣——不引入动爻旺衰细则（超纲）。",
      "next": "ch6-s3-300"
    },
    "ch6-s3-300": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "今夜先记半张账：卦中动爻，能生克沖合，动者力大，不拘衰旺。",
      "next": "ch6-s3-310"
    },
    "ch6-s3-310": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把笔搁下，",
      "text": "另外半张——动爻自己变出来的那枚爻——账在后头。先占卦。",
      "next": "ch6-s3-320"
    },
    "ch6-s3-320": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "占今夜？",
      "next": "ch6-s3-330"
    },
    "ch6-s3-330": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "占今夜。",
      "next": "ch6-s3-340"
    },
    "ch6-s3-340": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把三枚旧钱推到你面前，",
      "text": "两个问题压着——他是谁的手，他为何现在动。问法我想好了：今夜之动，何人？何意？",
      "m1Note": "幕末问法「何人？何意？」避应期（策划案 § 3）。",
      "next": "ch6-s4-header"
    },
    "ch6-s4-header": {
      "type": "sceneHeader",
      "scene": 4,
      "title": "那半分指着的爻",
      "time": "同夜，丑时",
      "ambience": "明蓍堂。",
      "m1Note": "本幕功能：案卦摇卦交互（castInteraction fixed [8,8,8,8,9,7]）；「点偏半分」正典引爆；择动（KP-015 复习延伸）；CP-01（KP-LY-016 独立）；KP-LY-017 示范（回頭克＝破绽宣言）；反预判显性解释（策划案 § 2 执行义务）；沖散辨伪预亮。剧情时间：辰月辛亥日，丑时（连夜占）。",
      "next": "ch6-s4-010"
    },
    "ch6-s4-010": {
      "type": "narration",
      "text": "三枚旧钱在你掌心焐热。{{ta}}把香点上，堂里静得能听见灯芯的响。",
      "next": "ch6-s4-020"
    },
    "ch6-s4-020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "凝神。就问这一件：今夜之动，何人，何意。",
      "next": "ch6-s4-cast"
    },
    "ch6-s4-cast": {
      "type": "castInteraction",
      "castId": "ch6-angua",
      "mode": "fixed",
      "throws": [
        8,
        8,
        8,
        8,
        9,
        7
      ],
      "question": "今夜之动，何人，何意。",
      "perThrow": [
        {
          "throwIndex": 1,
          "result": "拆",
          "coinFaces": "两背一字",
          "lineName": "初爻",
          "speaker": "{{player}}",
          "speakerLine": "（第一掷，两背。）拆。"
        },
        {
          "throwIndex": 2,
          "result": "拆",
          "coinFaces": "两背一字",
          "lineName": "二爻",
          "speaker": "{{player}}",
          "speakerLine": "（第二掷，两背。）拆。"
        },
        {
          "throwIndex": 3,
          "result": "拆",
          "coinFaces": "两背一字",
          "lineName": "三爻",
          "speaker": "{{player}}",
          "speakerLine": "（第三掷，两背。）"
        },
        {
          "throwIndex": 4,
          "result": "拆",
          "coinFaces": "两背一字",
          "lineName": "四爻",
          "speaker": "{{player}}",
          "speakerLine": "（第四掷，又是两背。四个拆，四枚阴爻，静静叠上去。）"
        },
        {
          "throwIndex": 5,
          "result": "重",
          "coinFaces": "三背",
          "lineName": "五爻",
          "speaker": "{{player}}",
          "speakerLine": "（第五掷——钱落下来的声音不一样。你低头看：三枚，全是背。）三背——重。动爻。",
          "interleaveNode": "ch6-s4-030"
        },
        {
          "throwIndex": 6,
          "result": "单",
          "coinFaces": "一背两字",
          "lineName": "上爻",
          "speaker": "{{player}}",
          "speakerLine": ""
        }
      ],
      "next": "ch6-s4-050"
    },
    "ch6-s4-030": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "五爻动。",
      "next": "ch6-s4-040"
    },
    "ch6-s4-040": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的声音沉下来半度，",
      "text": "接着掷。",
      "resumeCast": true,
      "next": "ch6-s4-050"
    },
    "ch6-s4-050": {
      "type": "narration",
      "text": "第六掷，一背。单。阳爻，静。",
      "next": "ch6-s4-060"
    },
    "ch6-s4-060": {
      "type": "narration",
      "text": "六爻立起来了：下四阴，五爻动阳，上爻静阳。",
      "next": "ch6-s4-070"
    },
    "ch6-s4-070": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "下坤上巽——风地观。",
      "next": "ch6-s4-080"
    },
    "ch6-s4-080": {
      "type": "narration",
      "text": "你报出卦名的一瞬，堂里静了一息。",
      "next": "ch6-s4-090"
    },
    "ch6-s4-090": {
      "type": "narration",
      "text": "你想起来了。第四课的第一幕，{{ta}}翻开谱，找到「点偏半分」的那一页——世点上偏了半分，指着五爻辛巳官鬼的那一页。",
      "next": "ch6-s4-100"
    },
    "ch6-s4-100": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "观……是那半分的页。{{senior}}，样张上点偏半分指的那卦——就是这一卦。",
      "next": "ch6-s4-110"
    },
    "ch6-s4-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "乾宫第五，风地观。",
      "next": "ch6-s4-120"
    },
    "ch6-s4-120": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的指尖压在卦纸边上，很稳，",
      "text": "谱上相邻的两卦——山地剥，风地观。第一课他给我们留了剥；第四课样张的点，偏向观的五爻。今夜，你亲手把观掷了出来——而且，五爻动。",
      "next": "ch6-s4-130"
    },
    "ch6-s4-130": {
      "type": "narration",
      "text": "{{ta}}抬眼看你。",
      "next": "ch6-s4-140"
    },
    "ch6-s4-140": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "那半分指着的爻，今夜动了。装卦。",
      "next": "ch6-s4-150"
    },
    "ch6-s4-150": {
      "type": "narration",
      "text": "你装卦。乾宫，土宫——不，乾宫属金。六亲一列列落下去：",
      "next": "ch6-s4-160"
    },
    "ch6-s4-160": {
      "type": "narration",
      "text": "初爻乙未父母（应）。二爻乙巳官鬼。三爻乙卯妻财。四爻辛未父母（世）。五爻辛巳官鬼——动。上爻辛卯妻财。",
      "next": "ch6-s4-dr1"
    },
    "ch6-s4-dr1": {
      "type": "dressingUpdate",
      "board": {
        "throws": [
          8,
          8,
          8,
          8,
          9,
          7
        ],
        "revealed": [
          {
            "pos": 1,
            "branch": "未",
            "wuxing": "土",
            "liuqin": "父母"
          },
          {
            "pos": 2,
            "branch": "巳",
            "wuxing": "火",
            "liuqin": "官鬼"
          },
          {
            "pos": 3,
            "branch": "卯",
            "wuxing": "木",
            "liuqin": "妻财"
          },
          {
            "pos": 4,
            "branch": "未",
            "wuxing": "土",
            "liuqin": "父母"
          },
          {
            "pos": 5,
            "branch": "巳",
            "wuxing": "火",
            "liuqin": "官鬼",
            "moving": true,
            "bian": "子·子孙"
          },
          {
            "pos": 6,
            "branch": "卯",
            "wuxing": "木",
            "liuqin": "妻财"
          }
        ],
        "marks": {
          "world": 4,
          "response": 1
        }
      },
      "next": "ch6-s4-170"
    },
    "ch6-s4-170": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "官鬼两现。二爻乙巳，五爻辛巳——又是两枚巳。",
      "next": "ch6-s4-180"
    },
    "ch6-s4-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "问贼盗，用神取官鬼——第三课的老规矩。可官鬼两现，取哪枚？",
      "m1Note": "「问贼盗取官鬼」＝ch3 旧知直接用（应爻不焦点化——用神取官鬼，ch3 旧知）。",
      "next": "ch6-s4-190"
    },
    "ch6-s4-190": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "上一课教过——择其旺者。可这两枚同是巳火，同月同日，秤上恒平……",
      "next": "ch6-s4-200"
    },
    "ch6-s4-200": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "上一课教你择旺时，谱上还有后半句，我按下没讲——今夜补上。",
      "next": "ch6-s4-210"
    },
    "ch6-s4-210": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}翻开谱，指着那行，",
      "text": "『如一爻動者擇其動者為用神』。两爻同名，一动一静——取动的。",
      "m1Note": "择动＝KP-015 复习延伸（「按下没讲——今夜补上」＝595 后半句补讲结构，witness 第五批对撞；kp-ly-015.json 已补「择动」canonicalText）。",
      "next": "ch6-s4-220"
    },
    "ch6-s4-220": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "取动的。为什么？",
      "next": "ch6-s4-230"
    },
    "ch6-s4-230": {
      "type": "choice",
      "prompt": null,
      "options": [
        {
          "text": "因为动的那枚才是正在出手的——问『今夜之动』，答话的自然是它。",
          "response": {
            "speaker": "沈疏桐",
            "text": "对。动的那枚才是开口说话的。"
          },
          "next": "ch6-s4-240"
        },
        {
          "text": "因为动的爻更旺。",
          "response": {
            "speaker": "沈疏桐",
            "text": "动不是旺。两枚巳同月同日，秤上恒平——方才你自己说的。动是另一杆秤：谁在做事。再答。"
          },
          "next": "ch6-s4-260"
        },
        {
          "text": "因为静的那枚作废了。",
          "response": {
            "speaker": "沈疏桐",
            "text": "不作废。二爻那枚巳还站在卦里，它的账另有一处等着算。"
          },
          "next": "ch6-s4-250"
        }
      ]
    },
    "ch6-s4-240": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}在五爻旁点了一记，",
      "text": "静爻是在场的人，动爻是出手的人——用神：五爻辛巳官鬼。",
      "m1Note": "「静爻是在场的人，动爻是出手的人」＝幕三比喻的判词化。",
      "next": "ch6-s4-260"
    },
    "ch6-s4-250": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}摇头，",
      "text": "择动不是弃静——是问事时，听正在做事的那枚说话。为什么是它？",
      "next": "ch6-s4-260"
    },
    "ch6-s4-260": {
      "type": "narration",
      "text": "五爻辛巳官鬼。样张的点指了它一个月，今夜它自己站了出来。",
      "next": "ch6-s4-270"
    },
    "ch6-s4-270": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "课上的账，现用。五爻巳火既动——它这股力，落在满盘谁的身上？",
      "next": "ch6-s4-cp01"
    },
    "ch6-s4-cp01": {
      "type": "scoredChoice",
      "cpId": "CH6-CP-01",
      "testsKp": [
        "KP-LY-016"
      ],
      "prompt": "動爻生克独立判（风地观 × 五爻動巳的力落点）",
      "options": [
        {
          "key": "A",
          "text": "世爻应爻两枚未土——火生土，它的力贴着两头的未走。",
          "verdict": "optimal",
          "basis": "火生土：五爻動巳之力及于满盘——世四辛未、应初乙未两枚未土同受其生（『卦中之動爻能生克沖合』，動者力大不拘衰旺）。生克方向＋逐爻实找独立完成；「鬼贴世」的氛围级收束由她补，不展开官鬼持世断法（超纲）。",
          "sourceRef": [
            "《增删卜易》章十四总纲：「卦中之動爻能生克沖合」（witness 提取行 903）"
          ],
          "next": "ch6-s4-cp01a010"
        },
        {
          "key": "B",
          "text": "上爻卯木——巳火克卯木。",
          "verdict": "wrong",
          "basis": "生克方向错：木生火，倒过来巳火对卯木无克——火克的是金。圈序一反，力的落点满盘全错。",
          "sourceRef": [
            "《增删卜易·五行相生章第十一》：「木生火﹐火生土」（提取行 819）"
          ],
          "next": "ch6-s4-cp01b010"
        },
        {
          "key": "C",
          "text": "动爻的力只管它自己，落不到别的爻上。",
          "verdict": "suboptimal",
          "basis": "边界规则错置：動爻之力及于满盘；「只管本位、不及他爻」的是變爻——她按下不纠（「记住你这句错话」），4.4 变爻边界铁律回收递刀。",
          "sourceRef": [
            "《增删卜易》：「夫變出之爻能生克沖合本位之動爻﹐不能生克他爻」（提取行 939——变爻边界，非动爻）"
          ],
          "next": "ch6-s4-cp01c010"
        }
      ],
      "rewards": {
        "optimal": {
          "lingli": 5,
          "favor": 1,
          "mastery": "KP-LY-016 → 掌握"
        },
        "suboptimal": {
          "plot": "{{senior}}按下不纠（「记住你这句错话」＝KP-017 递刀位），令玩家先答眼前：巳火的力落在谁身上——重答后过",
          "mastery": "KP-LY-016 标记待复习"
        }
      },
      "onWrong": "{{senior}}纠生克方向（木生火，火克金非克木——圈再背一遍），玩家重答后过。KP-LY-016 标记待复习。不锁主线。"
    },
    "ch6-s4-cp01a010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。动爻之力，及于满盘——巳火生土，世应两未都受它这一生。",
      "next": "ch6-s4-cp01a020"
    },
    "ch6-s4-cp01a020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}顿了半息，声音压低，",
      "text": "官鬼的力贴着世爻走，不是好客气——鬼贴世，是近了。",
      "m1Note": "「鬼贴世」收在氛围级，不展开官鬼持世/生世断法（超纲）。",
      "next": "ch6-s4-280"
    },
    "ch6-s4-cp01b010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "方向。木生火，倒过来巳火对卯木无克——火克的是金。",
      "next": "ch6-s4-cp01b020"
    },
    "ch6-s4-cp01b020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}敲了敲纸角，",
      "text": "圈再背一遍。答。",
      "m1Note": "KP-LY-016 标记待复习。",
      "next": "ch6-s4-280"
    },
    "ch6-s4-cp01c010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "记住你这句错话。",
      "next": "ch6-s4-cp01c020"
    },
    "ch6-s4-cp01c020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}竟没有立刻纠正，唇角一点极淡的弧度，",
      "text": "今夜稍后，真有一枚爻是『只管一个、不及别人』的——可不是动爻。动爻的力，及于满盘；『只管自己』的另有其爻。先答眼前：巳火的力落在谁身上？",
      "m1Note": "CP-01 错项 C 的「记住这句错话」＝KP-017 变爻边界铁律的递刀位（4.4 回收）。KP-LY-016 标记待复习。",
      "next": "ch6-s4-280"
    },
    "ch6-s4-280": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "第四处账，开了。",
      "next": "ch6-s4-290"
    },
    "ch6-s4-290": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}提笔，在四格图最后一格落字：变出之爻。",
      "text": "动而必变——第一课就会的：老阳翻阴。五爻巳火动，变出什么，你装。",
      "next": "ch6-s4-300"
    },
    "ch6-s4-300": {
      "type": "narration",
      "text": "你按着变卦的规矩推：观五爻动，上卦巽变艮——山地剥。变出的那爻，装干支——",
      "m1Note": "变卦山地剥此处只完成推演，意象留 4.5；变爻装法「仍照本宫推」＝ch1 KP-003 witness 先例＋引擎 bianYao 契约。",
      "next": "ch6-s4-310"
    },
    "ch6-s4-310": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "丙子。子水。",
      "next": "ch6-s4-320"
    },
    "ch6-s4-320": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "aside": "你按本宫安六亲，",
      "text": "乾宫金……金生水——子孙。",
      "next": "ch6-s4-330"
    },
    "ch6-s4-330": {
      "type": "narration",
      "text": "笔尖顿住。你自己先觉出不对来——满盘查过一遍：这卦六爻里，父母、官鬼、妻财——没有子孙。",
      "next": "ch6-s4-340"
    },
    "ch6-s4-340": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "{{senior}}，这卦面上没有子孙爻。能拿官鬼的那门亲，面上一枚都没有——可他一动，动出来一枚。",
      "m1Note": "「面上没有子孙」＝gloss 铁律执行位（只说「面上」——玩家先说出，她不纠正不展开——第七章+回响余地；伏神词全程不現）。",
      "next": "ch6-s4-350"
    },
    "ch6-s4-350": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "说下去。",
      "next": "ch6-s4-360"
    },
    "ch6-s4-360": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "子水，克巳火。变出来的爻……克它自己的动爻？",
      "next": "ch6-s4-370"
    },
    "ch6-s4-370": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "谱上原文——",
      "next": "ch6-s4-380"
    },
    "ch6-s4-380": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "aside": "{{ta}}把谱推到你面前，你念：",
      "text": "『世爻發動﹐動而必變﹐變出巳午之火謂之回頭生世。變出寅卯之木謂之回頭克世……』——回头。变出来的爻，回头生克它的本爻。",
      "m1Note": "witness 579 逐字由玩家念（关键句进玩家嘴的惯例）。",
      "next": "ch6-s4-390"
    },
    "ch6-s4-390": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "这枚账有个名字：回头克。",
      "next": "ch6-s4-400"
    },
    "ch6-s4-400": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的指尖从五爻移到那枚变出的子水上，一寸的距离，",
      "text": "还有一条铁律，谱上写死了：『夫變出之爻能生克沖合本位之動爻﹐不能生克他爻﹐而他爻與本位之動爻﹐亦不能生克變爻。』",
      "m1Note": "witness 939 逐字由她读（边界铁律）。",
      "next": "ch6-s4-410"
    },
    "ch6-s4-410": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "方才有人答错说『动爻的力只管自己』——错在动爻，对在变爻。变出之爻，只回头管它的本爻：生它，或者克它。满盘其余的爻，够不着它，它也够不着别人。能管住变爻的，只有月建日辰这两片天。",
      "m1Note": "CP-01 错项 C 递刀在此回收（「错在动爻，对在变爻」——她口径泛称「有人」，三选项路径皆通）；「惟日月能制变爻」化入台词（「两片天」——955 witness 语义，飛爻/伏爻词全程不現）。",
      "next": "ch6-s4-420"
    },
    "ch6-s4-420": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "所以这枚子水——谁也碰不着它，它只做一件事：回头克那枚动巳。",
      "next": "ch6-s4-430"
    },
    "ch6-s4-430": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。现在把三句账连起来读：他动了；动，必变；变出来的，恰是满盘唯一能克他的一门亲——而且专克他，只克他。",
      "next": "ch6-s4-440"
    },
    "ch6-s4-440": {
      "type": "narration",
      "text": "{{ta}}直起身。灯光把卦纸上那一动一变照得像两枚钉子。",
      "next": "ch6-s4-450"
    },
    "ch6-s4-450": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "他这一动，动出了克他自己的东西。动手的人，先受自己动作的后果——他打出一招，招底下翻出来的东西，只咬他自己。",
      "next": "ch6-s4-tm1"
    },
    "ch6-s4-tm1": {
      "type": "teachMoment",
      "kpId": "KP-LY-017",
      "stage": "demo",
      "masteryTo": "见过",
      "lingli": 1,
      "note": "變爻回頭生克（四处之四）示范＝案卦破绽宣言：观五爻辛巳動变出丙子子孙，子水克巳火＝回頭克。命名句『世爻發動﹐動而必變…變出寅卯之木謂之回頭克世』（witness 提取行 579，玩家念）＋边界铁律『夫變出之爻能生克沖合本位之動爻﹐不能生克他爻…』（提取行 939，她读）。「他这一动，动出了克他自己的东西」＝破绽宣言（回頭克的叙事转译）。",
      "next": "ch6-s4-460"
    },
    "ch6-s4-460": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "墙根那枚笔帽——",
      "next": "ch6-s4-470"
    },
    "ch6-s4-470": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "明日看。",
      "next": "ch6-s4-480"
    },
    "ch6-s4-480": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}按住这个话头，眼里的光却承认了你的方向，",
      "text": "先把回头的账练熟——谱上另有一例，正好手边。",
      "m1Note": "笔帽联想由玩家先起、她按住＝悬置管理（幕五收）。",
      "next": "ch6-s4-490"
    },
    "ch6-s4-490": {
      "type": "narration",
      "text": "{{ta}}把谱翻回一页，指着一处例卦：坤卦，上爻酉金发动，变出巳火。",
      "next": "ch6-s4-500"
    },
    "ch6-s4-500": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "不看我们的卦，看谱上这枚：酉金动，变出巳火。这枚变出来的巳，回头对酉金——生，还是克？",
      "next": "ch6-s4-510"
    },
    "ch6-s4-510": {
      "type": "choice",
      "prompt": null,
      "options": [
        {
          "text": "火克金——巳火回头克酉金。回头克。",
          "response": {
            "speaker": "沈疏桐",
            "text": "对。火克金，回头克——跟我们卦上那枚子水克巳火，一个路数。"
          },
          "effects": {
            "favor": 1
          },
          "next": "ch6-s4-520"
        },
        {
          "text": "金生水……酉金生巳火？",
          "response": {
            "speaker": "沈疏桐",
            "text": "乱了。先定谁对谁：变爻回头作用于动爻——是巳火对酉金，不是酉金对巳火。再排五行：火对金，生还是克？"
          },
          "next": "ch6-s4-tm2"
        },
        {
          "text": "巳火管不着酉金——变爻不生克别的爻。",
          "response": {
            "speaker": "沈疏桐",
            "text": "铁律背对了一半。变爻不生克他爻——可它的本爻不是他爻，是它的来处。回头二字，说的正是它对本爻下手。再答。"
          },
          "next": "ch6-s4-tm2"
        }
      ]
    },
    "ch6-s4-520": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}合上谱，",
      "text": "方向拿稳了。",
      "next": "ch6-s4-tm2"
    },
    "ch6-s4-tm2": {
      "type": "teachMoment",
      "kpId": "KP-LY-017",
      "stage": "guided",
      "masteryTo": "用过",
      "lingli": 3,
      "note": "引导＝回頭方向（坤之晉谱例：坤卦上爻酉金发动，变出巳火——火克金＝回頭克，与案卦子水克巳同路数）。答错不惩罚：B 纠「回头是变爻作用于动爻」的方向序、C 纠边界错用（「他爻」不含本位动爻——本爻是它的来处）后重答，不计 wrong，无好感。",
      "next": "ch6-s4-530"
    },
    "ch6-s4-530": {
      "type": "narration",
      "text": "{{ta}}在卦纸前站了很久。然后{{ta}}开始断，声音不高，一句是一句：",
      "next": "ch6-s4-540"
    },
    "ch6-s4-540": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "观者，看也。这一卦立起来，先是一个字：看。我们在窗里看他，他在墙外看我们——看了一个月，两边都看着。",
      "m1Note": "观「看」字义＝卦名常识级字面（与「临者至也」同款，不立断法）。",
      "next": "ch6-s4-550"
    },
    "ch6-s4-550": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "用神五爻辛巳官鬼——还是那枚巳。换了三张卦，他挪过世、坐过应，今夜他站在五爻——样张上那半分偏着的地方。他从来没走远。",
      "m1Note": "巳线注：剥应二巳/观五爻巳（样张）/大有应上巳＝跨章巳线正典（handoff § 5），本章观五爻动巳成新笔。",
      "next": "ch6-s4-560"
    },
    "ch6-s4-560": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "辰月的巳火，泄气，衰半档。衰着的爻，发动了。",
      "next": "ch6-s4-570"
    },
    "ch6-s4-570": {
      "type": "narration",
      "text": "{{ta}}停下来，看你。",
      "next": "ch6-s4-580"
    },
    "ch6-s4-580": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "今夜的课——站着的人借时令的力，出手的人使自己的劲。他不等他的时令，因为他知道……动本身就是力。",
      "m1Note": "推理最后一步（「动本身就是力」）由玩家说出——纪律不变。",
      "next": "ch6-s4-590"
    },
    "ch6-s4-590": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "他知道的比这再多一层。",
      "next": "ch6-s4-600"
    },
    "ch6-s4-600": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的声音冷下来，慢下来，",
      "text": "{{player}}，想一想：上一卦，火天大有，我们从应爻巳火读出了什么？",
      "next": "ch6-s4-610"
    },
    "ch6-s4-610": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "他在等巳月。等他临月建，最硬的三十天。",
      "next": "ch6-s4-620"
    },
    "ch6-s4-620": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "我们读得出——他就算得到我们读得出。",
      "m1Note": "「他知道我们算得出巳月」反预判正典（本章新立，§ 0 第 10 条）；反预判解释在断卦内给出（策划案 § 2 执行义务达成）。",
      "next": "ch6-s4-630"
    },
    "ch6-s4-630": {
      "type": "narration",
      "text": "堂里静了一息。这句话像一枚钱落在案上，转了三转才停。",
      "next": "ch6-s4-640"
    },
    "ch6-s4-640": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "贼也懂旺衰——这话我第五课就说过。今夜要改一个字：他不止懂旺衰，他懂卦。他知道巳月是明牌，知道我们把铃布在他的时令前头——所以他挑了辰月初三，挑了他衰着、我们以为他必不动的夜。",
      "m1Note": "「贼也懂旺衰」升级为「他懂卦」＝「谁」收窄第一环（幕七收口）。",
      "next": "ch6-s4-650"
    },
    "ch6-s4-650": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "用衰月动手，赌我们不备……",
      "next": "ch6-s4-660"
    },
    "ch6-s4-660": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "这不是莽撞，是算计。衰着动手，力打折扣——他认这个折扣，换我们的不备。",
      "next": "ch6-s4-670"
    },
    "ch6-s4-670": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的指尖点在那枚变出的子水上，",
      "text": "可他没算到两件事。第一，我的线是双绞的。第二——动必有变。他懂动的力，未必懂变的账：他这一动，替我们动出了克他的爻。",
      "next": "ch6-s4-680"
    },
    "ch6-s4-680": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "若有人说，动爻今夜也挨着日辰的沖——亥沖巳——这一动会不会……散了？算不得数？",
      "next": "ch6-s4-690"
    },
    "ch6-s4-690": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "问到刀口上。",
      "next": "ch6-s4-700"
    },
    "ch6-s4-700": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}摇头，只一下，斩截，",
      "text": "谱上有一路人专断『沖散』。野鹤驳他们一句：神兆機于動﹐動必有因。动了就是动了——机已现，因已种，一记沖抹不掉它。这笔账明日课上细算；今夜你只记结论：这一动，作数。",
      "m1Note": "「神兆機于動」＝KP-018 附辨伪（witness 1383——只给立场与结论，沖散机理细算显式延至幕六）。",
      "next": "ch6-s4-710"
    },
    "ch6-s4-710": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "二爻那枚静巳，今夜也挨着同一记亥沖——那笔账，也并到明日。",
      "m1Note": "二爻静巳延账（显式延账话术——不遗漏不超前；幕六日破教具入口）。",
      "next": "ch6-s4-720"
    },
    "ch6-s4-720": {
      "type": "narration",
      "text": "{{ta}}最后看向变卦。",
      "next": "ch6-s4-730"
    },
    "ch6-s4-730": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "观之剥。",
      "next": "ch6-s4-740"
    },
    "ch6-s4-740": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把两个卦名写在一处，",
      "text": "他这一动，卦走回了山地剥——第一课，案头的第一张卦。从剥出发，绕了五张卦，回到剥。",
      "m1Note": "变卦山地剥只提卦名与意象（ch1 回归），不展开六亲（§ 0 第 1 条）。",
      "next": "ch6-s4-750"
    },
    "ch6-s4-750": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "回到案子开始的地方……",
      "next": "ch6-s4-760"
    },
    "ch6-s4-760": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "断语。",
      "next": "ch6-s4-770"
    },
    "ch6-s4-770": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}落笔，",
      "text": "动者是他。仓促而动，动而失手；他知我等巳月，故抢辰月——此人懂卦。动出子孙回头克——他的破绽，今夜已生，落在我们手里。",
      "next": "ch6-s4-780"
    },
    "ch6-s4-780": {
      "type": "narration",
      "text": "{{ta}}搁笔，抬眼。",
      "next": "ch6-s4-790"
    },
    "ch6-s4-790": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "明日辰时，取那枚笔帽。",
      "next": "ch6-s4-drclear"
    },
    "ch6-s4-drclear": {
      "type": "dressingUpdate",
      "board": null,
      "next": "ch6-s5-header"
    },
    "ch6-s5-header": {
      "type": "sceneHeader",
      "scene": 5,
      "title": "錾记",
      "time": "辰时",
      "ambience": "明蓍堂。次日辰时。",
      "m1Note": "本幕功能：笔帽检视＋錾记比对（「懂机关」环收窄→「修书房旧人」）；郑司书「站进来」半步；CP-02（KP-LY-017 独立）＝破绽映射；查案风味 +1；ch7 钩（老档需时日）。剧情时间：辰月壬子日辰时（辛亥次日，§ 0 第 1 条）。",
      "next": "ch6-s5-010"
    },
    "ch6-s5-010": {
      "type": "narration",
      "text": "辰时的日光斜进明蓍堂。案上摊着那方帕子，铜笔帽躺在正中，昨夜的凉还没褪尽。",
      "next": "ch6-s5-020"
    },
    "ch6-s5-020": {
      "type": "narration",
      "text": "{{ta}}请了郑司书来。老人抱着一册蓝布面的旧簿，进门时脚步比往常快。",
      "next": "ch6-s5-030"
    },
    "ch6-s5-030": {
      "type": "dialogue",
      "speaker": "郑司书",
      "text": "沈姑娘说有一件铜器，要老朽掌掌眼。",
      "next": "ch6-s5-040"
    },
    "ch6-s5-040": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "劳您。",
      "next": "ch6-s5-050"
    },
    "ch6-s5-050": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}把帕子往前推了推，",
      "text": "只看，先不问来处。",
      "next": "ch6-s5-060"
    },
    "ch6-s5-060": {
      "type": "narration",
      "text": "老人凑近了。看了很久——比看当值簿那页补字还久。然后他伸出两根手指，把笔帽极轻地翻了个面，眯眼看向帽口内侧。",
      "next": "ch6-s5-070"
    },
    "ch6-s5-070": {
      "type": "dialogue",
      "speaker": "郑司书",
      "text": "……有錾。",
      "next": "ch6-s5-080"
    },
    "ch6-s5-080": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "錾？",
      "next": "ch6-s5-090"
    },
    "ch6-s5-090": {
      "type": "dialogue",
      "speaker": "郑司书",
      "text": "记号。",
      "next": "ch6-s5-100"
    },
    "ch6-s5-100": {
      "type": "dialogue",
      "speaker": "郑司书",
      "aside": "老人把笔帽举到光里，你顺着看去——帽口内侧，一圈细纹里嵌着两个米粒大的錾字，磨得只剩个底子，",
      "text": "修书房的旧规矩：坊里置办的家什，笔杆、帽、镇尺、裁刀，都要錾坊号和入坊的年份——物勒工名，物件坏了好追到人。",
      "next": "ch6-s5-110"
    },
    "ch6-s5-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "如今还錾么？",
      "next": "ch6-s5-120"
    },
    "ch6-s5-120": {
      "type": "dialogue",
      "speaker": "郑司书",
      "text": "早不錾了。",
      "next": "ch6-s5-130"
    },
    "ch6-s5-130": {
      "type": "dialogue",
      "speaker": "郑司书",
      "aside": "老人的声音慢下来，",
      "text": "这套规矩，是前头的规矩。换过章程之后，家什改从库里统领，錾记就废了。这枚帽子上的錾——是旧制。",
      "next": "ch6-s5-140"
    },
    "ch6-s5-140": {
      "type": "narration",
      "text": "堂里静了一息。",
      "next": "ch6-s5-150"
    },
    "ch6-s5-150": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "旧制……这笔帽的主人，是修书房旧人。",
      "next": "ch6-s5-160"
    },
    "ch6-s5-160": {
      "type": "dialogue",
      "speaker": "郑司书",
      "text": "至少，这物件出自旧年的坊里。",
      "next": "ch6-s5-170"
    },
    "ch6-s5-170": {
      "type": "dialogue",
      "speaker": "郑司书",
      "aside": "老人放下笔帽，抱紧了怀里那册蓝布簿子，忽然说，",
      "text": "老朽今晨翻了半宿——这是当年的置办录。可惜只到近十年。再往前的老档，封在库房底箱，得容老朽些时日，一箱一箱启。",
      "next": "ch6-s5-180"
    },
    "ch6-s5-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "您肯启？",
      "next": "ch6-s5-190"
    },
    "ch6-s5-190": {
      "type": "narration",
      "text": "老人抬起眼。那双昏花的眼睛里，有一点你在当值簿那夜见过的东西——那夜是茫然，今日是别的。",
      "next": "ch6-s5-200"
    },
    "ch6-s5-200": {
      "type": "dialogue",
      "speaker": "郑司书",
      "text": "老朽管了三十年簿册。",
      "next": "ch6-s5-210"
    },
    "ch6-s5-210": {
      "type": "dialogue",
      "speaker": "郑司书",
      "aside": "他一字一字地说，",
      "text": "有人拿老朽的簿子做过文章——这回，老朽想亲手把账翻明白。",
      "next": "ch6-s5-220"
    },
    "ch6-s5-220": {
      "type": "narration",
      "text": "{{ta}}向老人深深一揖。",
      "m1Note": "人物注：郑司书「站进来」＝主动启老档（动机承 ch5「老朽的簿子……几时成了旁人的笔墨」正典——被动过簿子的耿耿转为主动查账）；仍在知情圈外（她未透案情全貌，只请掌眼）；補写者悬置原样。「旧制/物勒工名」＝新立正典（錾记制度）；老档需时日＝ch7 钩（名单不落本章）。帽口坑洼（幕二）本幕不解——人物侧写余地留 ch7 对人时用。",
      "next": "ch6-s5-230"
    },
    "ch6-s5-230": {
      "type": "narration",
      "text": "送走郑司书，{{ta}}把笔帽重新包好，却不收起，搁在案上你们两人中间。",
      "next": "ch6-s5-240"
    },
    "ch6-s5-240": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "昨夜卦上，变出一枚子水，回头克那枚动巳。今晨案上，多了一枚旧制錾记的笔帽。",
      "next": "ch6-s5-250"
    },
    "ch6-s5-250": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}看着你，",
      "text": "课上的账，对到案上——卦上那枚回头克的爻，落到案上，是什么？",
      "next": "ch6-s5-cp02"
    },
    "ch6-s5-cp02": {
      "type": "scoredChoice",
      "cpId": "CH6-CP-02",
      "testsKp": [
        "KP-LY-017"
      ],
      "prompt": "破绽映射独立判（变爻回头克 × 案上三物）",
      "options": [
        {
          "key": "A",
          "text": "这枚笔帽——他动作里掉出来的，錾记只指向它的主人，只咬他一个人。",
          "verdict": "optimal",
          "basis": "变爻回头克的边界铁律（只管本位之动爻，不及他爻）落到案上＝「专一性」为映射键：笔帽从他的动作里翻出来（力的来处＝他自己动出），錾记指向其主人（只咬一个人）——两个判据独立齐备。铃是我方外力、蹬痕不专属，均不合回头克之象。",
          "sourceRef": [
            "《增删卜易》变爻边界铁律：「夫變出之爻能生克沖合本位之動爻﹐不能生克他爻」（witness dongyao-andong-2026-07-18 提取行 939）"
          ],
          "next": "ch6-s5-cp02a010"
        },
        {
          "key": "B",
          "text": "铜铃——我们的机关，克住了他。",
          "verdict": "wrong",
          "basis": "力的来处错：铃是我方所布的局——外头的力。回头克不是别人打他，是他自己的动作里翻出来的东西打他（动而必变，变出之爻回头作用于本位动爻）。",
          "sourceRef": [
            "《增删卜易》：「世爻發動﹐動而必變……變出寅卯之木謂之回頭克世」（witness 提取行 579——回头克＝变出之爻作用于本位，非外力）"
          ],
          "next": "ch6-s5-cp02b010"
        },
        {
          "key": "C",
          "text": "墙头的蹬痕瓦灰——也是他留下的痕迹。",
          "verdict": "suboptimal",
          "basis": "痕而不专：蹬痕确是他留下的痕迹（前提不误），但谁的鞋都踩得出——分不出脚，指不到人。回头克的爻「只管本位不及他爻」，落到案上必须是「只指向一个人」的那枚——差在专一性一步。",
          "sourceRef": [
            "《增删卜易》变爻边界铁律：「不能生克他爻﹐而他爻與本位之動爻﹐亦不能生克變爻」（witness 提取行 939——「专」为映射键）"
          ],
          "next": "ch6-s5-cp02c010"
        }
      ],
      "rewards": {
        "optimal": {
          "lingli": 5,
          "favor": 2,
          "mastery": "KP-LY-017 → 掌握"
        },
        "suboptimal": {
          "plot": "{{senior}}以「痕的专属」重问（三样东西里哪样只咬得住一个人），玩家重答后过",
          "mastery": "KP-LY-017 标记待复习"
        }
      },
      "onWrong": "{{senior}}以「力的来处」纠正（铃是我们布的局——外头的力；回头克是他自己动作里翻出来的东西），玩家重答后过。KP-LY-017 标记待复习。不锁主线。"
    },
    "ch6-s5-cp02a010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。回头克的要义，昨夜谱上那条铁律——变出之爻，只管本位，不及他爻。",
      "next": "ch6-s5-cp02a020"
    },
    "ch6-s5-cp02a020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的指尖轻轻落在笔帽上，",
      "text": "蹬痕，谁的鞋都踩得出；铃，是我们的手。唯独这枚帽子——从他的动作里翻出来，錾着他的来处，只咬得住他一个人。这就是回头克：专，且躲不掉。",
      "next": "ch6-s5-260"
    },
    "ch6-s5-cp02b010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "铃是克他，可铃是我们布的局——它是外头的力。回头克不一样：不是别人打他，是他自己的动作里翻出来的东西打他。再想——昨夜他仓促翻墙，什么东西是他『动出来』的？",
      "m1Note": "KP-LY-017 标记待复习。",
      "next": "ch6-s5-260"
    },
    "ch6-s5-cp02c010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "蹬痕是痕，不假。可你踩一脚，我踩一脚，痕分不出谁的脚。",
      "next": "ch6-s5-cp02c020"
    },
    "ch6-s5-cp02c020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}摇头，",
      "text": "回头克的爻有个脾气：只管本位，不及他爻——落到案上，就是『只指向一个人』。三样东西里，哪样只咬得住一个人？",
      "m1Note": "KP-LY-017 标记待复习。",
      "next": "ch6-s5-260"
    },
    "ch6-s5-260": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "记一句进你的卦记：动了手的人，必留下动过的痕；而他动出来的那枚痕，只找他。",
      "m1Note": "「动了手的人必留下动过的痕」＝本章金句后半（策划案 § 2——前半幕三已出）。",
      "next": "ch6-s5-270"
    },
    "ch6-s5-270": {
      "type": "narration",
      "text": "{{ta}}把笔帽收进袖中，起身。",
      "next": "ch6-s5-280"
    },
    "ch6-s5-280": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "老档没启完之前，这枚帽子还咬不到人名。可方向定了——懂机关的手、修书房的旧制、还有昨夜那手懂卦的算计……",
      "m1Note": "三环交集（懂机关/旧制旧人/懂卦）本幕只并列不合拢（合拢在幕七）；笔帽主人不揭（老档 ch7 钩）。",
      "next": "ch6-s5-290"
    },
    "ch6-s5-290": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}停在门边，回头，",
      "text": "今晚还有一课。把第五课欠你的那笔账，还了。",
      "effects": {
        "favor": 1
      },
      "m1Note": "查案风味·錾记比对（好感 +1，自动触发）。「第五课欠你的那笔账」＝幕六「账还在往后」收账预告（ch5 § 0 第 6 条边界解除的入口）。",
      "next": "ch6-s6-header"
    },
    "ch6-s6-header": {
      "type": "sceneHeader",
      "scene": 6,
      "title": "袖里的手",
      "time": "夜",
      "ambience": "明蓍堂。同日夜。",
      "m1Note": "本幕功能：「账还在往后」收账（KP-LY-018 示范＝大有暗動机理＋观二爻日破对比）；引导·日破应答 +1；CP-03（KP-LY-018 独立·主计分）；沖散细算收尾；我方暗動翻转；幕末 natal 作业段＋favorBranch(45)（§ 0 第 2 条）。剧情时间：辰月壬子日夜。",
      "next": "ch6-s6-010"
    },
    "ch6-s6-010": {
      "type": "narration",
      "text": "晚课。案上新旧两卦并排摊着——左边那张边角已经起了毛：火天大有，第五课的案卦。右边是昨夜的观之剥，墨迹还新。",
      "next": "ch6-s6-020"
    },
    "ch6-s6-020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "第五课那夜，你指着大有的应爻问我：日辰沖应爻——暗動？我说，记性不坏，名字是第四课立的，账还在往后。",
      "m1Note": "「记性不坏，名字是第四课立的，账还在往后」＝ch5 幕六正典原句回收（ch5-s6-570）；本幕＝ch5 § 0 第 6 条边界解除——暗動机理正式展开，「你当时猜的名字，账现在还你」叙事归属兑现。",
      "next": "ch6-s6-030"
    },
    "ch6-s6-030": {
      "type": "narration",
      "text": "{{ta}}在案后坐直了。",
      "next": "ch6-s6-040"
    },
    "ch6-s6-040": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "今夜，账还你。",
      "next": "ch6-s6-050"
    },
    "ch6-s6-050": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "我当时猜的那个名字……",
      "next": "ch6-s6-060"
    },
    "ch6-s6-060": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "你猜对了名字，今夜给你名字底下的东西。",
      "next": "ch6-s6-070"
    },
    "ch6-s6-070": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}翻开谱，找到夹签的那页，推给你，",
      "text": "暗動章。第一句，你念。",
      "next": "ch6-s6-080"
    },
    "ch6-s6-080": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "『靜爻旺相日辰沖之為暗動﹐靜爻休囚日辰沖之為破……』",
      "m1Note": "1361 关键句由玩家念出（关键句进玩家嘴的惯例）。",
      "next": "ch6-s6-090"
    },
    "ch6-s6-090": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "停。就这一句，够用一整夜。",
      "next": "ch6-s6-100"
    },
    "ch6-s6-100": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}竖起两根手指，",
      "text": "同一记日辰的沖，落在静爻身上，有两种结果——分界不在沖，在被沖的爻自己：旺相，还是休囚。",
      "next": "ch6-s6-110"
    },
    "ch6-s6-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "旺相的静爻，挨了日辰一沖——暗動。它没翻身，没变爻，看着还是静的——可它暗里动了，愈得其力。谱上说这种动：『占以暗動福來而不知﹐禍來而不覺。』",
      "next": "ch6-s6-120"
    },
    "ch6-s6-120": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "看着没动，其实动了……袖里的手。",
      "next": "ch6-s6-130"
    },
    "ch6-s6-130": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "好比方。袖里的手。",
      "next": "ch6-s6-140"
    },
    "ch6-s6-140": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}指左边那张旧卦纸，",
      "text": "第五课那夜：卯月，丁亥日。应爻巳火——卯月木生火，旺。亥沖巳，沖在一枚旺相的静爻上——所以那一沖是暗動：他没露面，暗里已经不安分了。而那记沖响起来的前两夜——",
      "next": "ch6-s6-150"
    },
    "ch6-s6-150": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "墙外站了两夜的影子。",
      "next": "ch6-s6-160"
    },
    "ch6-s6-160": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "人先到，卦后应——卦与人，对上了。祸来而不觉，幸而我们觉了。",
      "next": "ch6-s6-tm1"
    },
    "ch6-s6-tm1": {
      "type": "teachMoment",
      "kpId": "KP-LY-018",
      "stage": "demo",
      "masteryTo": "见过",
      "lingli": 1,
      "note": "暗動定义（沖之两果·前半）：靜爻旺相日辰沖之＝暗動——原书原句「靜爻旺相日辰沖之為暗動﹐靜爻休囚日辰沖之為破」由玩家亲口念出（暗動章第一句，witness dongyao-andong-2026-07-18 提取行 1361）＋「占以暗動福來而不知﹐禍來而不覺」她引（同章）。示范以火天大有旧卦纸收 ch5「账还在往后」旧账：应爻巳火卯月木生火＝旺相，丁亥日亥沖巳＝暗動（袖里的手）——人先到卦后应（墙外两夜影子，卦与人对上）。",
      "next": "ch6-s6-170"
    },
    "ch6-s6-170": {
      "type": "narration",
      "text": "{{ta}}的指尖挪到右边新卦上。",
      "next": "ch6-s6-180"
    },
    "ch6-s6-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "再看昨夜。同样一枚巳，观卦二爻，静。同样一记亥沖。可昨夜是辰月——巳火泄气，衰半档。衰着的静爻挨这一沖，你说，还是暗動么？",
      "next": "ch6-s6-190"
    },
    "ch6-s6-190": {
      "type": "choice",
      "prompt": null,
      "options": [
        {
          "text": "不是。爻衰了——沖在衰爻上，是那句的后半：『休囚日辰沖之為破』。",
          "response": {
            "speaker": "沈疏桐",
            "text": "对。名字叫日破。衰而静的爻，日辰一沖，不是暗里得力——是愈加无用。空袖子，一沖就断。",
            "aside": "{{ta}}在二爻旁落了个小小的「破」字，"
          },
          "effects": {
            "favor": 1
          },
          "next": "ch6-s6-tm2"
        },
        {
          "text": "是暗動。沖就是动。",
          "response": {
            "speaker": "沈疏桐",
            "text": "沖不是动。沖是一记问——问到旺相的爻，它暗里应；问到休囚的爻，它应不动，反被问破。分界在爻自己的斤两。再答：辰月的巳，旺还是衰？"
          },
          "next": "ch6-s6-tm2"
        },
        {
          "text": "衰爻挨沖……散了？",
          "response": {
            "speaker": "沈疏桐",
            "text": "『散』字昨夜刚说过——那一路专断动爻被沖，野鹤驳的就是他们。眼下这枚二爻是静的。静爻挨沖只有两条路，谱上那一句里全写了。再念一遍，答。"
          },
          "next": "ch6-s6-tm2"
        }
      ]
    },
    "ch6-s6-tm2": {
      "type": "teachMoment",
      "kpId": "KP-LY-018",
      "stage": "guided",
      "masteryTo": "用过",
      "lingli": 3,
      "note": "日破推演（沖之两果·后半）：靜爻休囚日辰沖之＝破——观卦二爻巳静，辰月火生土泄气衰半档，辛亥夜亥沖巳＝日破，愈加无用（收幕四显式延账）。「日破」本章立名入白名单。B 纠错锚「旺衰分界」（沖是一记问，分界在爻自己的斤两）；C 纠错锚「静动之别」（沖散论动爻——野鹤所驳，静爻挨沖只有两条路）。答错不惩罚：{{senior}}纠正后重答继续，不计 wrong。依据 witness 提取行 1361＋1079 节选（沖旺暗動沖衰日破）。",
      "next": "ch6-s6-200"
    },
    "ch6-s6-200": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "把两张卦并起来看，一句话记死：同一记沖，先称被沖的爻——旺相沖之暗動，休囚沖之日破。爻还是那枚爻，令不同了，果就不同。",
      "next": "ch6-s6-210"
    },
    "ch6-s6-210": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "第四课的秤……称到今天，连一记沖落下来是福是祸，都是它说了算。",
      "next": "ch6-s6-220"
    },
    "ch6-s6-220": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "你把六课串成一句话了。",
      "next": "ch6-s6-230"
    },
    "ch6-s6-230": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}眼里有一点真的笑意，",
      "text": "课不白教。",
      "next": "ch6-s6-240"
    },
    "ch6-s6-240": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "验一验。三枚爻，三记沖——只有一句判对了，挑出来。",
      "next": "ch6-s6-cp03"
    },
    "ch6-s6-cp03": {
      "type": "scoredChoice",
      "cpId": "CH6-CP-03",
      "testsKp": [
        "KP-LY-018"
      ],
      "prompt": "暗動／日破三题判（大有应巳·观世未·观二巳 × 三记沖）",
      "options": [
        {
          "key": "A",
          "text": "大有应巳，卯月逢亥沖——巳衰，日破。",
          "verdict": "wrong",
          "basis": "旺衰判反：卯月木生火＝巳旺，不是衰——旺相静爻逢日辰沖之＝暗動，不是日破。这是第五课的旧账（丁亥夜亥沖应巳＝暗動），判反了等于白守一夜。",
          "sourceRef": [
            "《增删卜易》暗動章：「靜爻旺相日辰沖之為暗動」（witness dongyao-andong-2026-07-18 提取行 1361）"
          ],
          "next": "ch6-s6-cp03ac010"
        },
        {
          "key": "B",
          "text": "观卦世爻未土，辰月土旺，若逢丑日沖之——旺相被沖，暗動。",
          "verdict": "optimal",
          "basis": "先称被沖的爻：未土辰月当令＝旺相；丑未正沖，旺相静爻逢日辰沖之＝暗動（袖里的手）——旺相暗動的正向新判独立完成。三题中 A 反在旺衰（卯月巳旺非衰）、C 反在果（衰爻被沖愈加无用非得力），唯此句两秤俱正。「若逢丑日」为假设句——不改占期正典。",
          "sourceRef": [
            "《增删卜易》暗動章：「靜爻旺相日辰沖之為暗動﹐靜爻休囚日辰沖之為破」（witness 提取行 1361）",
            "沖旺暗動沖衰日破口径（witness 提取行 1079 节选）"
          ],
          "next": "ch6-s6-cp03b010"
        },
        {
          "key": "C",
          "text": "观卦二爻巳，辰月逢亥沖——衰爻被沖，暗里得力。",
          "verdict": "suboptimal",
          "basis": "果判反：辰月巳火泄气＝衰（前半称对），但衰爻被沖是「休囚日辰沖之為破」——日破，愈加无用；「暗里得力」是旺相暗動的果，安错了爻。",
          "sourceRef": [
            "《增删卜易》暗動章：「靜爻休囚日辰沖之為破」（witness 提取行 1361；日破愈加無用＝提取行 1079 节选口径）"
          ],
          "next": "ch6-s6-cp03ac010"
        }
      ],
      "rewards": {
        "optimal": {
          "lingli": 5,
          "favor": 2,
          "mastery": "KP-LY-018 → 掌握"
        },
        "suboptimal": {
          "plot": "{{senior}}不给答案，只把案上两卦推回半寸（「几月？什么令？先称，再看沖」），玩家重挑后过",
          "mastery": "KP-LY-018 标记待复习"
        }
      },
      "onWrong": "{{senior}}把秤摆回第一步（那枚爻几月、什么令——先称再看沖），玩家重挑后过。KP-LY-018 标记待复习。不锁主线。"
    },
    "ch6-s6-cp03b010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。三句里两句都把秤丢了——你没丢。",
      "next": "ch6-s6-cp03b020"
    },
    "ch6-s6-cp03b020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}逐条点破，",
      "text": "大有那句，卯月的巳是旺的，那一沖是暗動，不是破——这是第五课的旧账，判反了等于白守一夜。二爻那句，衰爻挨沖愈加无用，何来得力。唯独世爻未土——辰月当令，土旺，丑日一沖——袖里的手。",
      "next": "ch6-s6-250"
    },
    "ch6-s6-cp03ac010": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "回到秤上。那枚爻，几月？什么令？先称，再看沖。",
      "m1Note": "KP-LY-018 标记待复习（A/C 共用纠错链——剧本「— 选 A／选 C」单块）。",
      "next": "ch6-s6-cp03ac020"
    },
    "ch6-s6-cp03ac020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}不给答案，只把案上两卦往你面前推了半寸，",
      "text": "重挑。",
      "next": "ch6-s6-250"
    },
    "ch6-s6-250": {
      "type": "narration",
      "text": "{{ta}}把谱合上，却没有立刻收卦纸。",
      "next": "ch6-s6-260"
    },
    "ch6-s6-260": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "课到这里，反过来照一照我们自己。",
      "next": "ch6-s6-270"
    },
    "ch6-s6-270": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的声音低下来，像说给灯听，",
      "text": "他看我们的守窗：巳时一班，夜里一班，柴棚一盏灯——静的。他看得见的，都是静的。",
      "next": "ch6-s6-280"
    },
    "ch6-s6-280": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "可铃线在窗销上绷着……",
      "next": "ch6-s6-290"
    },
    "ch6-s6-290": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。我们的局，就是他看不见的暗動。",
      "next": "ch6-s6-300"
    },
    "ch6-s6-300": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}唇角那点冷弧度又出来了，",
      "text": "面上纹丝不动，袖里的手早就出了——昨夜他挑线，铃开口，就是这只手第一次碰他。",
      "next": "ch6-s6-310"
    },
    "ch6-s6-310": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "他既懂卦，就让他继续读我们这张『静卦』。明日起，铃线改双股双路——明的一股照旧走窗销，让他挑；暗的一股另走一路，他挑断明线的那一刻，暗线替我们说话。",
      "next": "ch6-s6-320"
    },
    "ch6-s6-320": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "给他备一层他以为懂了的。",
      "next": "ch6-s6-330"
    },
    "ch6-s6-330": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "兵无常势，卦无常形。他给我们上了一课，礼尚往来。",
      "m1Note": "剧情注：双股双路＝守窗章程 v3（幕七正式布置，此处她口头定案）；「我们的暗動」＝KP-018 的剧情翻转位（教学概念反照我方布局）。「兵无常势」为常识级成语，非卦理引文。",
      "next": "ch6-s6-340"
    },
    "ch6-s6-340": {
      "type": "narration",
      "text": "课毕。你起身要谢课，{{ta}}却抬手止住。",
      "next": "ch6-s6-350"
    },
    "ch6-s6-350": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "等等。还有一份课业。",
      "next": "ch6-s6-360"
    },
    "ch6-s6-360": {
      "type": "narration",
      "text": "{{ta}}朝你怀口看了一眼。",
      "next": "ch6-s6-370"
    },
    "ch6-s6-370": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "你那张本命卦。取出来。",
      "next": "ch6-s6-380"
    },
    "ch6-s6-380": {
      "type": "narration",
      "text": "你把贴身收着的卦纸取出来，展平在案上。纸角已经被体温焐软了。",
      "next": "ch6-s6-390"
    },
    "ch6-s6-390": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "六课到今夜，你会认爻，会装卦，会安亲择用，会称旺衰，会看帮伤的网——如今，又会看动。",
      "next": "ch6-s6-400"
    },
    "ch6-s6-400": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}的目光落在你的卦纸上，",
      "text": "这张卦，你装过它的支，认过它的亲。可它的动静，你从来没有正经读过。",
      "next": "ch6-s6-410"
    },
    "ch6-s6-410": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "……用今天的课，读我自己的卦。",
      "next": "ch6-s6-420"
    },
    "ch6-s6-420": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "课业就是这个。回去，把它照今夜的账重读一遍——卦里有没有动的爻；动出来的是什么；变出来的那枚，回头对你做什么。若六爻安静——那也是一笔账：静有静的读法。",
      "m1Note": "natal 作业全泛化（§ 0 第 1/2 条）：不预设玩家 natal 有动爻——全静 natal 读出「六爻安静」亦为正确课业；不点名任何爻；只依赖 natal 存在（ch2 主线资产），零演卦指涉。",
      "next": "ch6-s6-430"
    },
    "ch6-s6-430": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "读出什么，都记进卦记。",
      "next": "ch6-s6-fb"
    },
    "ch6-s6-fb": {
      "type": "favorBranch",
      "threshold": 45,
      "pass": "ch6-s6-pass010",
      "fail": "ch6-s6-fail010"
    },
    "ch6-s6-pass010": {
      "type": "narration",
      "text": "{{ta}}说完，却没有把卦纸还你。{{ta}}就着灯，把那张纸又看了半息——目光在纸上某一处停了停。",
      "next": "ch6-s6-pass020"
    },
    "ch6-s6-pass020": {
      "type": "narration",
      "text": "{{ta}}张了张口。",
      "next": "ch6-s6-pass030"
    },
    "ch6-s6-pass030": {
      "type": "narration",
      "text": "灯焰跳了一下。{{ta}}把到嘴边的话咽了回去，将卦纸折好，递还到你手里，指尖在纸角按了一按。",
      "next": "ch6-s6-pass040"
    },
    "ch6-s6-pass040": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "……读完，说给我听。",
      "next": "ch6-s6-pass050"
    },
    "ch6-s6-pass050": {
      "type": "narration",
      "text": "{{ta}}的声音比方才低了半度。你接过卦纸，那半句没说出口的话又一次留在了灯影里——和上回廊下那半句，像是同一句。",
      "m1Note": "档位演出注（§ 0 第 2 条）：pass 版＝欲言又止二钩三件套（目光停半息＋咽回＋说给我听）；她看的「某一处」不指定爻；玩家旁白「像是同一句」自答归情感层（与 ch5 幕七「和这桩案子无关」同向，不翻案）。",
      "next": "ch6-s6-merge"
    },
    "ch6-s6-fail010": {
      "type": "narration",
      "text": "{{ta}}把卦纸推还给你。",
      "next": "ch6-s6-fail020"
    },
    "ch6-s6-fail020": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "读完，记在卦记里。下回课，我抽查。",
      "next": "ch6-s6-fail030"
    },
    "ch6-s6-fail030": {
      "type": "narration",
      "text": "你把卦纸收回怀口，应了声是。",
      "next": "ch6-s6-merge"
    },
    "ch6-s6-merge": {
      "type": "narration",
      "text": "出明蓍堂时，夜风已经带了初夏将近的暖。你按了按怀口——那张随身两个月的卦纸，忽然重了一点。",
      "next": "ch6-s6-440"
    },
    "ch6-s6-440": {
      "type": "narration",
      "text": "不是纸重了。是你会读它了。",
      "next": "ch6-s6-drclear"
    },
    "ch6-s6-drclear": {
      "type": "dressingUpdate",
      "board": null,
      "next": "ch6-s7-header"
    },
    "ch6-s7-header": {
      "type": "sceneHeader",
      "scene": 7,
      "title": "三个旧字",
      "time": "傍晚",
      "ambience": "明蓍堂门口，廊下。数日后。",
      "m1Note": "本幕功能：章末收束——守窗章程 v3 落成；三环合拢（「懂六爻的旧人」收窄宣言）；「他在等巳月」修正收；章末事件 +1；章末预告；结算。剧情时间：辰月中旬。",
      "next": "ch6-s7-010"
    },
    "ch6-s7-010": {
      "type": "narration",
      "text": "双股铃线是这日午后装完的。",
      "next": "ch6-s7-020"
    },
    "ch6-s7-020": {
      "type": "narration",
      "text": "明的一股照旧走窗销，绷得和从前一模一样——给他看的。暗的一股从梁上另走了一路，落进柴棚深处——给他猜不到的。装完之后{{ta}}亲手试了三遍，第三遍时唇角有那点冷冷的弧度。",
      "m1Note": "双股铃线＝守窗章程 v3 落成（新立正典，§ 0 第 10 条）。",
      "next": "ch6-s7-030"
    },
    "ch6-s7-030": {
      "type": "narration",
      "text": "傍晚，{{ta}}送你到廊下。晚风已经暖了，后山的绿一天深过一天。",
      "next": "ch6-s7-040"
    },
    "ch6-s7-040": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "把这几日的东西归拢归拢。",
      "next": "ch6-s7-050"
    },
    "ch6-s7-050": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}倚着廊柱，",
      "text": "你说，我听。",
      "next": "ch6-s7-060"
    },
    "ch6-s7-060": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "挑铃线的手法——懂机关的人。笔帽的錾——修书房旧制的物件。抢在辰月动手、算准我们等巳月——懂卦的人。",
      "m1Note": "推理最后一步留给玩家（三环收拢玩家先说——纪律不变）。",
      "next": "ch6-s7-070"
    },
    "ch6-s7-070": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "三环。",
      "next": "ch6-s7-080"
    },
    "ch6-s7-080": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}竖起三根手指，一根一根收拢，",
      "text": "懂机关，旧制旧物，懂卦。三环套在一起，圈住的是什么人？",
      "next": "ch6-s7-090"
    },
    "ch6-s7-090": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "修书房的旧人——而且是读过卦的旧人。",
      "next": "ch6-s7-100"
    },
    "ch6-s7-100": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "上一卦归魂，我说：魂归旧地，不是生人。那夜只有半句——今夜补齐了。",
      "m1Note": "「魂归旧地，不是生人」＝ch5 幕六正典原句回收（数据化对撞）。",
      "next": "ch6-s7-110"
    },
    "ch6-s7-110": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}望着后山，声音放缓，",
      "text": "旧地。旧人。旧制。三个旧字，一条路——这条路的尽头是一个名字，名字在郑司书的老档里等我们。",
      "m1Note": "「懂六爻的旧人」收窄宣言——三环交集收窄不点名（名字在老档里，ch7 收）。",
      "next": "ch6-s7-120"
    },
    "ch6-s7-120": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "等老档启完……",
      "next": "ch6-s7-130"
    },
    "ch6-s7-130": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "等。",
      "next": "ch6-s7-140"
    },
    "ch6-s7-140": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}点头，",
      "text": "这回轮到我们等——可跟从前的等不一样了。从前我们等他来；如今，他的破绽在我们手里，他的来处在老档里，他的时令在秤上。",
      "next": "ch6-s7-150"
    },
    "ch6-s7-150": {
      "type": "narration",
      "text": "{{ta}}转过身来看你。",
      "next": "ch6-s7-160"
    },
    "ch6-s7-160": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "还有一件事，这几夜我想明白了，说给你。",
      "next": "ch6-s7-170"
    },
    "ch6-s7-170": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "第五课完，我说我们头一回比他快。铃响那夜，他还了一手——比我们的预判快。",
      "next": "ch6-s7-180"
    },
    "ch6-s7-180": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}顿了顿，",
      "text": "可你记着：这一个来回里，我们错的是时候，他错的是手。时候错了可以改等；手错了——",
      "next": "ch6-s7-190"
    },
    "ch6-s7-190": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "痕，收不回去。",
      "next": "ch6-s7-200"
    },
    "ch6-s7-200": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "对。这案子开局以来，头一回——他先失手。",
      "effects": {
        "favor": 1
      },
      "m1Note": "章末事件「他先失手」（好感 +1，自动触发）——与 ch5「头一回比他快」成对：快与错的攻守易位。",
      "next": "ch6-s7-210"
    },
    "ch6-s7-210": {
      "type": "narration",
      "text": "晚风穿廊。{{ta}}忽然又开口，声音里有一点极少见的、近乎松弛的东西：",
      "next": "ch6-s7-220"
    },
    "ch6-s7-220": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "辰月还有半月。巳月——他最硬的三十天，也是这案子收口的三十天。铃在，局在，账在。",
      "m1Note": "巳月倒计时口径（§ 0 第 9 条）：本章全程辰月，章末不跨月；「收口的三十天」为剧情张力语，不涉应期断法（不给日期）。",
      "next": "ch6-s7-230"
    },
    "ch6-s7-230": {
      "type": "dialogue",
      "speaker": "{{player}}",
      "text": "那第七课呢？",
      "next": "ch6-s7-240"
    },
    "ch6-s7-240": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "第七课。",
      "next": "ch6-s7-250"
    },
    "ch6-s7-250": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "aside": "{{ta}}看了你半息，目光往明蓍堂里那满架的书上扫了一圈，回来，",
      "text": "你如今认得爻站着的样子、动着的样子、暗里动着的样子——可这满卦，还有你看不见的地方。书要藏，人要藏——爻，也会藏。",
      "m1Note": "第七课预告只给意象不落禁词（「藏」——伏神候选但不锁定 ch7 课目，策划权留给下批）。",
      "next": "ch6-s7-260"
    },
    "ch6-s7-260": {
      "type": "narration",
      "text": "{{ta}}说完这句，往堂里走了两步，又停住，背对着你补了最后一句：",
      "next": "ch6-s7-270"
    },
    "ch6-s7-270": {
      "type": "dialogue",
      "speaker": "沈疏桐",
      "text": "第七课，等巳月。",
      "next": "ch6-s7-280"
    },
    "ch6-s7-280": {
      "type": "narration",
      "text": "回房路上，你把这一章在心里过了一遍：一记只响了两声的铃，一枚錾着旧字的笔帽，一张动了一爻的卦。",
      "next": "ch6-s7-290"
    },
    "ch6-s7-290": {
      "type": "narration",
      "text": "从前你以为卦是摆好的棋局，看谁站在哪。如今你知道了——棋是会自己走的。动的那一步才是话；动过的地方，必留下痕。",
      "next": "ch6-s7-300"
    },
    "ch6-s7-300": {
      "type": "narration",
      "text": "他动了。痕在你们手里。",
      "next": "ch6-s7-310"
    },
    "ch6-s7-310": {
      "type": "narration",
      "text": "巳月在前。",
      "next": "ch6-end"
    },
    "ch6-end": {
      "type": "chapterEnd",
      "title": "【第六章 · 终】",
      "rewards": {
        "lingli": 10
      },
      "hooks": [
        "「他先失手」——章末事件（与 ch5「头一回比他快」成对：快与错的攻守易位）",
        "三个旧字——「懂六爻的旧人」收窄宣言（懂机关／旧制旧物／懂卦三环合拢，不点名——名字在郑司书老档里，ch7 收）",
        "双股铃线——守窗章程 v3 落成（明诱暗报）",
        "「第七课，等巳月」——课与决战绑定同月（第七课只给意象「看不见的地方／爻也会藏」，不落名）",
        "natal 课业——「读完说给我听」（知心线）／记进卦记（bonus 章②与 ch7 的双接口）"
      ],
      "nextChapterTeaser": "满卦还有你看不见的地方——书要藏，人要藏，爻也会藏：第七课，等巳月。"
    }
  },
};
