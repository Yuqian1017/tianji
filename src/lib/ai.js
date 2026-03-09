/**
 * Multi-provider AI interpretation with streaming.
 * Supports Anthropic (direct) and OpenRouter (OpenAI-compatible).
 *
 * @param {object} config
 * @param {string} config.apiKey - API key for the active provider
 * @param {string} [config.provider='anthropic'] - 'anthropic' | 'openrouter'
 * @param {string} [config.model] - Model ID (uses provider default if empty)
 * @param {string} systemPrompt - System prompt text (module-specific)
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @param {(text: string) => void} onChunk - Streaming callback with accumulated text
 * @returns {Promise<string>} Full response text
 */
export async function aiInterpret(config, systemPrompt, messages, onChunk) {
  const { apiKey, provider = 'anthropic', model } = config;
  if (!apiKey) {
    throw new Error('请先在设置中输入 API Key');
  }
  if (provider === 'openrouter') {
    return callOpenRouter(apiKey, model, systemPrompt, messages, onChunk);
  }
  return callAnthropic(apiKey, model, systemPrompt, messages, onChunk);
}

// --- Anthropic native API ---

async function callAnthropic(apiKey, model, systemPrompt, messages, onChunk) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseAnthropicError(response));
  }

  return readSSE(response, (parsed) => {
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
      return parsed.delta.text;
    }
    return null;
  }, onChunk);
}

async function parseAnthropicError(response) {
  const errText = await response.text();
  try {
    const errJson = JSON.parse(errText);
    const rawMsg = errJson?.error?.message || errText;
    if (rawMsg.includes('credit balance is too low')) {
      return 'API 余额不足，请前往 Anthropic Console 充值后重试。';
    } else if (rawMsg.includes('invalid x-api-key') || rawMsg.includes('invalid api key')) {
      return 'API Key 无效，请在设置中检查并重新输入。';
    } else if (rawMsg.includes('rate limit')) {
      return '请求过于频繁，请稍后再试。';
    } else if (rawMsg.includes('overloaded')) {
      return 'Claude 服务繁忙，请稍后再试。';
    }
    return rawMsg;
  } catch {
    return errText;
  }
}

// --- OpenRouter (OpenAI-compatible) API ---

async function callOpenRouter(apiKey, model, systemPrompt, messages, onChunk) {
  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': '天机卷',
    },
    body: JSON.stringify({
      model: model || 'anthropic/claude-sonnet-4-20250514',
      messages: openaiMessages,
      max_tokens: 4000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseOpenRouterError(response));
  }

  return readSSE(response, (parsed) => {
    const delta = parsed.choices?.[0]?.delta?.content;
    return delta || null;
  }, onChunk);
}

async function parseOpenRouterError(response) {
  const errText = await response.text();
  try {
    const errJson = JSON.parse(errText);
    const rawMsg = errJson?.error?.message || errText;
    if (rawMsg.includes('credit') || rawMsg.includes('insufficient') || rawMsg.includes('balance')) {
      return 'API 余额不足，请前往充值后重试。';
    } else if (rawMsg.includes('invalid') && rawMsg.includes('key')) {
      return 'API Key 无效，请在设置中检查并重新输入。';
    } else if (rawMsg.includes('rate limit')) {
      return '请求过于频繁，请稍后再试。';
    }
    return rawMsg;
  } catch {
    return errText;
  }
}

// --- Shared SSE stream reader ---

async function readSSE(response, extractDelta, onChunk) {
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
          const delta = extractDelta(parsed);
          if (delta) {
            fullText += delta;
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
