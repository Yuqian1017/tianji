import { useState, useCallback, useEffect } from 'react';
import { loadHistoryFromStorage, saveHistoryToStorage } from './lib/history.js';
import SettingsPanel from './components/SettingsPanel.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import ThemePicker from './components/ThemePicker.jsx';
import LiuyaoModule from './modules/liuyao/LiuyaoModule.jsx';
import MeihuaModule from './modules/meihua/MeihuaModule.jsx';

const TABS = [
  { id: 'liuyao', label: '六爻占卜', icon: '/assets/icon-liuyao.webp' },
  { id: 'meihua', label: '梅花易数', icon: '/assets/icon-meihua.webp' },
];

const THEME_KEY = 'tianji-theme';

export default function App() {
  const [activeTab, setActiveTab] = useState('liuyao');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tianji-api-key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'ink');

  // History (shared across all modules)
  const [history, setHistory] = useState(() => loadHistoryFromStorage());
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // When a history item is loaded, we store it here so the active module can pick it up
  const [pendingHistoryLoad, setPendingHistoryLoad] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // === History CRUD ===
  const upsertHistory = useCallback((id, question, moduleData, chatMsgs) => {
    setHistory(prev => {
      const existing = prev.findIndex(h => h.id === id);
      const item = {
        id,
        timestamp: existing >= 0 ? prev[existing].timestamp : Date.now(),
        question: question || '综合运势',
        module: moduleData.module || 'liuyao',
        throws: moduleData.throws,
        result: moduleData.result,
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
    setActiveTab(module);
    setActiveHistoryId(item.id);
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
      <header className="border-b border-[var(--color-gold-border-light)] backdrop-blur-sm sticky top-0 z-10"
        style={{ backgroundColor: 'var(--color-header-bg)' }}>
        <div className="max-w-3xl mx-auto px-4">
          {/* Title row */}
          <div className="py-3 flex items-center justify-between">
            <h1 className="text-[var(--color-gold)] text-xl font-title tracking-wide">天机卷</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThemePicker(true)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-gold)] text-sm px-2 py-1 rounded-lg border border-[var(--color-surface-border)] hover:border-[var(--color-gold-border)] transition-colors"
                title="切换主题"
              >
                🎨
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-gold)] text-sm px-3 py-1 rounded-lg border border-[var(--color-surface-border)] hover:border-[var(--color-gold-border)] transition-colors font-body"
              >
                历史
                {tabHistoryCount > 0 && (
                  <span className="ml-1 text-xs text-[var(--color-gold)] opacity-60">{tabHistoryCount}</span>
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-gold)] text-sm px-3 py-1 rounded-lg border border-[var(--color-surface-border)] hover:border-[var(--color-gold-border)] transition-colors font-body"
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
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors font-body
                  ${activeTab === tab.id
                    ? 'text-[var(--color-gold)] border-[var(--color-gold)]'
                    : 'text-[var(--color-text-dim)] border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-gold-border)]'
                  }`}
              >
                <img src={tab.icon} alt="" className="inline-block w-5 h-5 mr-1.5 -mt-0.5 opacity-80" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="max-w-3xl mx-auto overflow-hidden">
        <img
          src="/assets/banner.webp"
          alt=""
          className="w-full h-20 object-cover opacity-40"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}
        />
      </div>

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

      {/* Decorative divider */}
      <div className="max-w-md mx-auto px-8 py-2">
        <img src="/assets/divider.webp" alt="" className="w-full h-6 object-contain opacity-30" />
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-[var(--color-text-dim)] text-xs max-w-2xl mx-auto px-4 font-body">
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
      <ThemePicker
        show={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
