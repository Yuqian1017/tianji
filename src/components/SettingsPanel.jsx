import { useState, useEffect } from 'react';

export default function SettingsPanel({ apiKey, setApiKey, show, setShow }) {
  const [inputKey, setInputKey] = useState(apiKey);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(inputKey);
    localStorage.setItem('tianji-api-key', inputKey);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-[var(--color-gold)] text-lg font-title mb-4">设置</h3>
        <label className="block text-sm text-[var(--color-text-dim)] mb-2 font-body">Claude API Key</label>
        <input
          type="password"
          value={inputKey}
          onChange={e => setInputKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2 text-[var(--color-text)] text-sm
            focus:border-[var(--color-gold-border-med)] focus:outline-none mb-4 font-body"
        />
        <div className="text-xs text-[var(--color-text-dim)] mb-4 font-body">
          API Key 仅存储在浏览器本地，不会上传到任何服务器。
        </div>
        <div className="flex justify-end gap-3">
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
