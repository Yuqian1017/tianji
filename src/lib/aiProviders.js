// AI provider and model configuration

export const PROVIDERS = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (直连)',
    keyPlaceholder: 'sk-ant-...',
    storageKey: 'tianji-api-key',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    keyPlaceholder: 'sk-or-...',
    storageKey: 'tianji-openrouter-key',
  },
};

export const MODELS = {
  anthropic: [
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', default: true },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-haiku-4-20250414', name: 'Claude Haiku 4' },
  ],
  openrouter: [
    { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6', default: true },
    { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
    { id: 'anthropic/claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'anthropic/claude-haiku-4-20250414', name: 'Claude Haiku 4' },
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash' },
    { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3' },
  ],
};

export function getActiveApiKey(aiConfig) {
  return aiConfig.provider === 'openrouter' ? aiConfig.openrouterKey : aiConfig.anthropicKey;
}

export function getDefaultModel(providerId) {
  const models = MODELS[providerId] || [];
  return models.find(m => m.default)?.id || models[0]?.id || '';
}
