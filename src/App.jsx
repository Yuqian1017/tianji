import { useState, useCallback } from 'react';
import { loadHistoryFromStorage, saveHistoryToStorage } from './lib/history.js';
import SettingsPanel from './components/SettingsPanel.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import LiuyaoModule from './modules/liuyao/LiuyaoModule.jsx';
import MeihuaModule from './modules/meihua/MeihuaModule.jsx';

const TABS = [
  { id: 'liuyao', label: '六爻占卜' },
  { id: 'meihua', label: '梅花易数' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('liuyao');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tianji-api-key') || '');
  const [showSettings, setShowSettings] = useState(false);

  // History (shared across all modules)
  const [history, setHistory] = useState(() => loadHistoryFromStorage());
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // When a history item is loaded, we store it here so the active module can pick it up
  const [pendingHistoryLoad, setPendingHistoryLoad] = useState(null);

  // === History CRUD ===
  const upsertHistory = useCallback((id, question, moduleData, chatMsgs) => {
    setHistory(prev => {
      const existing = prev.findIndex(h => h.id === id);
      const item = {
        id,
        timestamp: existing >= 0 ? prev[existing].timestamp : Date.now(),
        question: question || '综合运势',
        module: moduleData.module || 'liuyao',
        // Store module-specific data alongside common fields
        throws: moduleData.throws,
        result: moduleData.result,
        // Meihua-specific
        method: moduleData.method,
        input: moduleData.input,
        chatMessages: chatMsgs,
      };
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = item;
      } else {
        updated = [item, ...prev];
      }
      return saveHistoryToStorage(updated);
    });
  }, []);

  const handleLoadHistory = useCallback((item) => {
    const module = item.module || 'liuyao';
    // Switch to the correct tab
    setActiveTab(module);
    setActiveHistoryId(item.id);
    // Set pending load — the module will pick it up
    setPendingHistoryLoad(item);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteHistory = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      saveHistoryToStorage(updated);
      return updated;
    });
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  }, [activeHistoryId]);

  // Count history for current tab
  const tabHistoryCount = history.filter(h => (h.module || 'liuyao') === activeTab).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="border-b border-[rgba(200,149,108,0.1)] backdrop-blur-sm sticky top-0 z-10"
        style={{ backgroundColor: 'rgba(10,10,15,0.9)' }}>
        <div className="max-w-3xl mx-auto px-4">
          {/* Title row */}
          <div className="py-3 flex items-center justify-between">
            <h1 className="text-[var(--color-gold)] text-lg font-bold tracking-wide">天机卷</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-gold)] text-sm px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[rgba(200,149,108,0.3)] transition-colors"
              >
                历史
                {tabHistoryCount > 0 && (
                  <span className="ml-1 text-xs text-[var(--color-gold)] opacity-60">{tabHistoryCount}</span>
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-gold)] text-sm px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[rgba(200,149,108,0.3)] transition-colors"
              >
                设置
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 -mb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'text-[var(--color-gold)] border-[var(--color-gold)]'
                    : 'text-[var(--color-text-dim)] border-transparent hover:text-[var(--color-text)] hover:border-[rgba(200,149,108,0.3)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Module content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'liuyao' && (
          <LiuyaoModule
            apiKey={apiKey}
            setShowSettings={setShowSettings}
            upsertHistory={upsertHistory}
            activeHistoryId={activeHistoryId}
            setActiveHistoryId={setActiveHistoryId}
            pendingHistoryLoad={pendingHistoryLoad}
            clearPendingHistoryLoad={() => setPendingHistoryLoad(null)}
          />
        )}
        {activeTab === 'meihua' && (
          <MeihuaModule
            apiKey={apiKey}
            setShowSettings={setShowSettings}
            upsertHistory={upsertHistory}
            activeHistoryId={activeHistoryId}
            setActiveHistoryId={setActiveHistoryId}
            pendingHistoryLoad={pendingHistoryLoad}
            clearPendingHistoryLoad={() => setPendingHistoryLoad(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[var(--color-text-dim)] text-xs max-w-2xl mx-auto px-4">
        本工具基于中国传统文化知识体系，所有占算和分析结果仅供参考和学习。
        不构成任何医疗、法律、财务或人生决策建议。重大决策请咨询专业人士。
      </footer>

      {/* Shared overlays */}
      <SettingsPanel
        apiKey={apiKey}
        setApiKey={setApiKey}
        show={showSettings}
        setShow={setShowSettings}
      />
      <HistoryDrawer
        show={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onLoad={handleLoadHistory}
        onDelete={handleDeleteHistory}
        activeModule={activeTab}
      />
    </div>
  );
}
