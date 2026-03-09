import { useState, useEffect, useRef } from 'react';
import { PROVIDERS, MODELS, getDefaultModel } from '../lib/aiProviders.js';
import { exportHistory, importHistory, loadHistoryFromStorage, saveHistoryToStorage } from '../lib/history.js';

export default function SettingsPanel({ aiConfig, setAiConfig, show, setShow, historyCount, onHistoryChange }) {
  const [inputProvider, setInputProvider] = useState(aiConfig.provider);
  const [inputAnthropicKey, setInputAnthropicKey] = useState(aiConfig.anthropicKey);
  const [inputOpenrouterKey, setInputOpenrouterKey] = useState(aiConfig.openrouterKey);
  const [inputModel, setInputModel] = useState(aiConfig.model);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInputProvider(aiConfig.provider);
    setInputAnthropicKey(aiConfig.anthropicKey);
    setInputOpenrouterKey(aiConfig.openrouterKey);
    setInputModel(aiConfig.model);
  }, [aiConfig]);

  // Reset confirm state when panel closes
  useEffect(() => {
    if (!show) {
      setConfirmClear(false);
      setImportMsg('');
    }
  }, [show]);

  // When provider changes, reset model to that provider's default
  const handleProviderChange = (p) => {
    setInputProvider(p);
    setInputModel(getDefaultModel(p));
  };

  const handleSave = () => {
    const newConfig = {
      provider: inputProvider,
      anthropicKey: inputAnthropicKey,
      openrouterKey: inputOpenrouterKey,
      model: inputModel,
    };
    localStorage.setItem('tianji-ai-provider', inputProvider);
    localStorage.setItem('tianji-api-key', inputAnthropicKey);
    localStorage.setItem('tianji-openrouter-key', inputOpenrouterKey);
    localStorage.setItem('tianji-ai-model', inputModel);
    setAiConfig(newConfig);
    setShow(false);
  };

  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    a.href = url;
    a.download = `tianji-history-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const merged = importHistory(reader.result);
        onHistoryChange();
        setImportMsg(`导入成功，当前共 ${merged.length} 条记录`);
      } catch (err) {
        setImportMsg(`导入失败：${err.message}`);
        console.error('History import failed:', err);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    saveHistoryToStorage([]);
    onHistoryChange();
    setConfirmClear(false);
    setImportMsg('历史已清空');
  };

  if (!show) return null;

  const models = MODELS[inputProvider] || [];
  const activeKey = inputProvider === 'openrouter' ? inputOpenrouterKey : inputAnthropicKey;
  const providerInfo = PROVIDERS[inputProvider];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-[var(--color-gold)] text-lg font-title mb-5">设置</h3>

        {/* === AI Service Section === */}
        <div className="mb-5">
          <label className="block text-sm text-[var(--color-text)] mb-2 font-body font-medium">AI 服务</label>

          {/* Provider toggle */}
          <div className="flex rounded-lg border border-[var(--color-surface-border)] overflow-hidden mb-3">
            {Object.values(PROVIDERS).map(p => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={`flex-1 px-3 py-1.5 text-xs font-body transition-colors
                  ${inputProvider === p.id
                    ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                  }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* API Key input for active provider */}
          <label className="block text-xs text-[var(--color-text-dim)] mb-1 font-body">
            {providerInfo.name} API Key
          </label>
          <input
            type="password"
            value={activeKey}
            onChange={e => {
              if (inputProvider === 'openrouter') {
                setInputOpenrouterKey(e.target.value);
              } else {
                setInputAnthropicKey(e.target.value);
              }
            }}
            placeholder={providerInfo.keyPlaceholder}
            className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2 text-[var(--color-text)] text-sm
              focus:border-[var(--color-gold-border-med)] focus:outline-none mb-3 font-body"
          />

          {/* Model selection */}
          <label className="block text-xs text-[var(--color-text-dim)] mb-1 font-body">模型</label>
          <select
            value={inputModel || getDefaultModel(inputProvider)}
            onChange={e => setInputModel(e.target.value)}
            className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2 text-[var(--color-text)] text-sm
              focus:border-[var(--color-gold-border-med)] focus:outline-none mb-2 font-body"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <div className="text-xs text-[var(--color-text-dim)] font-body">
            API Key 仅存储在浏览器本地，不会上传到任何服务器。
            {inputProvider === 'openrouter' && ' OpenRouter 支持多种模型，费用各异。'}
          </div>
        </div>

        {/* === History Management Section === */}
        <div className="mb-5 pt-4 border-t border-[var(--color-surface-border)]">
          <label className="block text-sm text-[var(--color-text)] mb-2 font-body font-medium">历史记录管理</label>
          <div className="text-xs text-[var(--color-text-dim)] mb-3 font-body">
            当前 {historyCount} 条记录
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)] transition-colors font-body"
            >
              导出历史
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)] transition-colors font-body"
            >
              导入历史
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            <button
              onClick={handleClearHistory}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-body
                ${confirmClear
                  ? 'border-red-400 text-red-400 hover:bg-red-400/10'
                  : 'border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-red-300 hover:text-red-300'
                }`}
            >
              {confirmClear ? '确认清空？' : '清空所有历史'}
            </button>
          </div>
          {importMsg && (
            <div className="text-xs text-[var(--color-gold)] font-body">{importMsg}</div>
          )}
        </div>

        {/* === Action buttons === */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-surface-border)]">
          <button onClick={() => setShow(false)} className="px-4 py-2 text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] font-body">
            取消
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-[var(--color-gold-bg)] text-[var(--color-gold)] rounded-lg text-sm hover:bg-[var(--color-gold-bg-hover)] font-body">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
