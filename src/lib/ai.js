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
    const errText = await response.text();
    // Parse Anthropic API error to extract user-friendly message
    let userMessage;
    try {
      const errJson = JSON.parse(errText);
      const rawMsg = errJson?.error?.message || errText;
      // Map common Anthropic errors to Chinese
      if (rawMsg.includes('credit balance is too low')) {
        userMessage = 'API 余额不足，请前往 Anthropic Console 充值后重试。';
      } else if (rawMsg.includes('invalid x-api-key') || rawMsg.includes('invalid api key')) {
        userMessage = 'API Key 无效，请在设置中检查并重新输入。';
      } else if (rawMsg.includes('rate limit')) {
        userMessage = '请求过于频繁，请稍后再试。';
      } else if (rawMsg.includes('overloaded')) {
        userMessage = 'Claude 服务繁忙，请稍后再试。';
      } else {
        userMessage = rawMsg;
      }
    } catch {
      userMessage = errText;
    }
    throw new Error(userMessage);
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
