/**
 * Generic multi-turn AI interpretation via Claude streaming API.
 * Reusable by all divination modules.
 *
 * @param {string} apiKey - Anthropic API key
 * @param {string} systemPrompt - System prompt text (module-specific)
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @param {(text: string) => void} onChunk - Streaming callback with accumulated text
 * @returns {Promise<string>} Full response text
 */
export async function aiInterpret(apiKey, systemPrompt, messages, onChunk) {
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
      max_tokens: 4000,
      system: systemPrompt,
      stream: true,
      messages,
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
