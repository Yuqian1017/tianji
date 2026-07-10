# 六十四卦搜索引擎

> 历史设计草案。输入卦名/卦象/爻位/关键词，返回匹配结果。
>
> **校验边界（2026-07-10）**：本文的 `GUA_DB` 只填了乾卦，不是可运行的完整数据库。完整结构数据以 `database/yijing/zhouyi-core.json` 为准。「事业、感情、财运、健康」主题映射只是字面检索标签，不是预测、诊断或决策结论。

---

## 搜索接口

```javascript
/**
 * 64卦数据库搜索引擎
 * 数据源：64gua-yaoci-part1.md + 64gua-yaoci-part2.md
 */

// ===== 核心数据结构 =====
const GUA_DB = [
  {
    num:1, name:'乾', fullName:'乾为天', symbol:'☰☰',
    upper:'乾', lower:'乾', palace:'乾',
    guaci:'元亨利贞。',
    yao:[
      {pos:'初九', text:'潜龙勿用', keywords:['等待','隐藏','时机未到','韬光养晦']},
      {pos:'九二', text:'见龙在田，利见大人', keywords:['出头','贵人','才能','展示']},
      {pos:'九三', text:'君子终日乾乾，夕惕若厉，无咎', keywords:['勤勉','警惕','谨慎','努力']},
      {pos:'九四', text:'或跃在渊，无咎', keywords:['选择','进退','灵活','试探']},
      {pos:'九五', text:'飞龙在天，利见大人', keywords:['成功','巅峰','权力','领导']},
      {pos:'上九', text:'亢龙有悔', keywords:['过度','衰退','物极必反','知退']},
      {pos:'用九', text:'见群龙无首，吉', keywords:['谦逊','集体','不争首','和谐']}
    ]
  },
  // ... 其余63卦按同结构填入
  // 完整数据见 64gua-yaoci-part1.md 和 64gua-yaoci-part2.md
];

// ===== 八卦↔三爻 映射 =====
const TRIGRAM_MAP = {
  '111':'乾', '000':'坤', '100':'震', '011':'巽',
  '010':'坎', '101':'离', '001':'艮', '110':'兑'
};

const TRIGRAM_SYMBOL = {
  '乾':'☰', '坤':'☷', '震':'☳', '巽':'☴',
  '坎':'☵', '离':'☲', '艮':'☶', '兑':'☱'
};

// ===== 六爻→卦象 转换 =====
function yaoToGua(sixYao) {
  // sixYao = [0,1,1,0,1,0] 从初爻到上爻，0=阴 1=阳
  const lower = TRIGRAM_MAP[sixYao.slice(0,3).join('')];
  const upper = TRIGRAM_MAP[sixYao.slice(3,6).join('')];
  return findByTrigrams(upper, lower);
}

// ===== 搜索方法 =====

/** 按卦名搜索 */
function searchByName(keyword) {
  return GUA_DB.filter(g => 
    g.name.includes(keyword) || g.fullName.includes(keyword)
  );
}

/** 按上下卦搜索 */
function findByTrigrams(upper, lower) {
  return GUA_DB.find(g => g.upper === upper && g.lower === lower);
}

/** 按序号搜索 */
function findByNumber(num) {
  return GUA_DB.find(g => g.num === num);
}

/** 按宫搜索（八宫归属） */
function searchByPalace(palace) {
  return GUA_DB.filter(g => g.palace === palace);
}

/** 全文关键词搜索（搜卦辞+爻辞+关键词） */
function searchByKeyword(keyword) {
  const results = [];
  for (const gua of GUA_DB) {
    // 搜卦辞
    if (gua.guaci.includes(keyword)) {
      results.push({ gua: gua.fullName, match: '卦辞', text: gua.guaci });
    }
    // 搜爻辞
    for (const yao of gua.yao) {
      if (yao.text.includes(keyword) || yao.keywords?.some(k => k.includes(keyword))) {
        results.push({ gua: gua.fullName, match: yao.pos, text: yao.text });
      }
    }
  }
  return results;
}

/** 按主题搜索（预定义主题→关键词映射） */
function searchByTopic(topic) {
  const TOPIC_KEYWORDS = {
    '事业': ['成功','领导','权力','进取','建功','官','王','大人','征'],
    '感情': ['婚','妇','女','夫','配','姻','好','合','媾'],
    '财运': ['财','富','利','获','得','食','资','金','益'],
    '健康': ['疾','病','血','伤','厉','凶','死','丧'],
    '出行': ['往','行','征','涉','川','旅','出','道'],
    '等待': ['待','需','勿用','不可','迟','缓','七日','三年'],
    '危险': ['凶','厉','咎','灾','眚','丧','失','困'],
    '吉祥': ['吉','亨','利','无咎','元吉','大吉','悔亡']
  };
  
  const keywords = TOPIC_KEYWORDS[topic] || [topic];
  const results = [];
  for (const kw of keywords) {
    results.push(...searchByKeyword(kw));
  }
  // 去重
  return [...new Map(results.map(r => [`${r.gua}-${r.match}`, r])).values()];
}

/** 铜钱起卦→查卦 */
function coinToGua(throws) {
  // throws = [7,8,9,6,7,8] 从初爻到上爻
  // 7=少阳(不变) 8=少阴(不变) 9=老阳(变) 6=老阴(变)
  const benYao = throws.map(t => (t === 7 || t === 9) ? 1 : 0);
  const bianYao = throws.map(t => {
    if (t === 9) return 0; // 阳变阴
    if (t === 6) return 1; // 阴变阳
    return (t === 7) ? 1 : 0; // 不变
  });
  
  const dongYao = throws.map((t,i) => (t === 6 || t === 9) ? i+1 : null).filter(Boolean);
  
  return {
    benGua: yaoToGua(benYao),
    bianGua: dongYao.length > 0 ? yaoToGua(bianYao) : null,
    dongYao: dongYao,
    // 返回动爻对应的爻辞
    dongYaoCi: dongYao.map(pos => {
      const gua = yaoToGua(benYao);
      return gua?.yao[pos-1];
    })
  };
}

// ===== 使用示例 =====

// 1. 铜钱起卦
// coinToGua([7,7,8,9,8,7])
// → { benGua: 火泽睽, bianGua: 山泽损, dongYao:[4], dongYaoCi:[{pos:'九四',...}] }

// 2. 按卦名查
// searchByName('乾') → [{num:1, name:'乾', ...}]

// 3. 关键词全文搜索
// searchByKeyword('龙') → [{gua:'乾为天', match:'初九', text:'潜龙勿用'}, ...]

// 4. 按主题搜索
// searchByTopic('感情') → 所有包含婚姻/感情关键词的爻辞

// 5. 按上下卦查
// findByTrigrams('坎','离') → 水火既济
```

---

## 快速查卦索引

| 上\下 | 乾☰ | 坤☷ | 震☳ | 巽☴ | 坎☵ | 离☲ | 艮☶ | 兑☱ |
|-------|------|------|------|------|------|------|------|------|
| **乾☰** | 1乾 | 12否 | 25无妄 | 44姤 | 6讼 | 13同人 | 33遁 | 10履 |
| **坤☷** | 11泰 | 2坤 | 24复 | 46升 | 7师 | 36明夷 | 15谦 | 19临 |
| **震☳** | 34大壮 | 16豫 | 51震 | 32恒 | 40解 | 55丰 | 62小过 | 54归妹 |
| **巽☴** | 9小畜 | 20观 | 42益 | 57巽 | 59涣 | 37家人 | 53渐 | 61中孚 |
| **坎☵** | 5需 | 8比 | 3屯 | 48井 | 29坎 | 63既济 | 39蹇 | 60节 |
| **离☲** | 14大有 | 35晋 | 21噬嗑 | 50鼎 | 64未济 | 30离 | 56旅 | 38睽 |
| **艮☶** | 26大畜 | 23剥 | 27颐 | 18蛊 | 4蒙 | 22贲 | 52艮 | 41损 |
| **兑☱** | 43夬 | 45萃 | 17随 | 28大过 | 47困 | 49革 | 31咸 | 58兑 |
