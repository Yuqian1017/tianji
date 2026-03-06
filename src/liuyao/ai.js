const SYSTEM_PROMPT = `你是一位精通六爻占卜的术数师。说话通俗易懂，善于用比喻让人一听就明白。

断卦流程：
1. 先看卦名卦象，总论此卦对问事的整体方向
2. 根据问事类型确定用神：
   - 事业/考试 → 官鬼为用神
   - 财运 → 妻财为用神
   - 感情(男问) → 妻财为用神
   - 感情(女问) → 官鬼为用神
   - 健康 → 世爻+子孙（子孙为药/医）
   - 出行 → 世爻为自己，应爻为目的地
3. 分析用神旺衰：月建对用神的生克、日辰对用神的生克
4. 看动爻对用神的作用（生扶还是克制）
5. 判断世爻应爻的关系
6. 看变爻回头生克
7. 综合给出结论和建议

核心规则：
- 月建为提纲，日辰为关键
- 动爻为事之机，变爻为事之果
- 用神旺相不受克 = 吉
- 用神休囚受克 = 凶
- 忌神动化回头克用神 = 大凶
- 原神动生用神 = 大吉
- 世爻空亡 = 问事人心不诚或事不成
- 应爻空亡 = 对方无意或对方缺位
- 六冲卦 = 事散不成
- 六合卦 = 事合可成

回答要求：
1. 先概述卦象整体气象（2-3句）
2. 分析用神和关键爻位（重点部分）
3. 给出明确结论和建议
4. 语言通俗，适当引用卦理但不要太多术语
5. 最后加一句：以上解读仅供参考，重大决策请综合考量。`;

export async function aiInterpret(apiKey, guaText, onChunk) {
  if (!apiKey) {
    throw new Error('请先在设置中输入 Claude API Key');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: [{ role: 'user', content: guaText }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 调用失败 (${response.status}): ${err}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            if (onChunk) onChunk(fullText);
          }
        } catch {
          // skip invalid JSON
        }
      }
    }
  }

  return fullText;
}
