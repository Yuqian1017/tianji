import { useState, useCallback, useEffect, useRef } from 'react';
import { loadHistoryFromServer, saveHistoryRecord, deleteHistoryRecord, loadHistoryFromStorage, migrateLocalHistory, HISTORY_KEY } from './lib/history.js';
import { getToken, clearToken, setLogoutCallback } from './lib/api.js';
import { apiFetch } from './lib/api.js';
import LoginPage from './components/LoginPage.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import ThemePicker from './components/ThemePicker.jsx';
import LiuyaoModule from './modules/liuyao/LiuyaoModule.jsx';
import MeihuaModule from './modules/meihua/MeihuaModule.jsx';
import BaziModule from './modules/bazi/BaziModule.jsx';
import ZiweiModule from './modules/ziwei/ZiweiModule.jsx';
import QimenModule from './modules/qimen/QimenModule.jsx';
import FengshuiModule from './modules/fengshui/FengshuiModule.jsx';
import TizhiModule from './modules/tizhi/TizhiModule.jsx';
import ZiwuModule from './modules/ziwu/ZiwuModule.jsx';
import WuyunModule from './modules/wuyun/WuyunModule.jsx';
import BaziHealthModule from './modules/bazihealth/BaziHealthModule.jsx';
import WangzhenModule from './modules/wangzhen/WangzhenModule.jsx';
import FaceModule from './modules/face/FaceModule.jsx';
import PalmModule from './modules/palm/PalmModule.jsx';

const TABS = [
  { id: 'liuyao', label: '六爻占卜', icon: '/assets/icon-liuyao.webp' },
  { id: 'meihua', label: '梅花易数', icon: '/assets/icon-meihua.webp' },
  { id: 'bazi', label: '八字命理', icon: '/assets/icon-bazi.webp' },
  { id: 'ziwei', label: '紫微斗数', icon: '/assets/icon-bazi.webp' },
  { id: 'qimen', label: '奇门遁甲', icon: '/assets/icon-bazi.webp' },
  { id: 'fengshui', label: '风水飞星', icon: '/assets/icon-bazi.webp' },
  { id: 'divider-health', label: '问诊' },
  { id: 'tizhi', label: '体质辨识', icon: '/assets/icon-bazi.webp' },
  { id: 'ziwu', label: '子午流注', icon: '/assets/icon-bazi.webp' },
  { id: 'wuyun', label: '五运六气', icon: '/assets/icon-bazi.webp' },
  { id: 'bazihealth', label: '八字健康', icon: '/assets/icon-bazi.webp' },
  { id: 'wangzhen', label: '望诊', icon: '/assets/icon-bazi.webp' },
  { id: 'divider-xiangshu', label: '相术' },
  { id: 'face', label: '面相', icon: '/assets/icon-bazi.webp' },
  { id: 'palm', label: '手相', icon: '/assets/icon-bazi.webp' },
];

const THEME_KEY = 'tianji-theme';

const THEME_BANNERS = {
  ink: '/assets/banner.webp',
  jade: '/assets/banner-jade.webp',
  dao: '/assets/banner-dao.webp',
  dark: '/assets/banner-dark.webp',
};

export default function App() {
  // === Auth state ===
  const [user, setUser] = useState(null); // { username, role } or null
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('liuyao');
  const [aiConfig, setAiConfig] = useState(() => ({
    provider: localStorage.getItem('tianji-ai-provider') || 'anthropic',
    anthropicKey: localStorage.getItem('tianji-api-key') || '',
    openrouterKey: localStorage.getItem('tianji-openrouter-key') || '',
    model: localStorage.getItem('tianji-ai-model') || '',
  }));
  const [showSettings, setShowSettings] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'ink');

  // History (shared across all modules)
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // When a history item is loaded, we store it here so the active module can pick it up
  const [pendingHistoryLoad, setPendingHistoryLoad] = useState(null);

  // Track if migration has been attempted this session
  const migrationDone = useRef(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // === Auth check on mount ===
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    apiFetch('/api/auth/me')
      .then(data => {
        setUser({ username: data.username, role: data.role });
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Set up logout callback for 401 handling
  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null);
      setHistory([]);
    });
  }, []);

  // === Load history from server when user is set ===
  useEffect(() => {
    if (!user) return;

    setHistoryLoading(true);
    loadHistoryFromServer()
      .then(items => setHistory(items))
      .finally(() => setHistoryLoading(false));
  }, [user]);

  // === Migrate localStorage history on first login ===
  useEffect(() => {
    if (!user || migrationDone.current) return;
    migrationDone.current = true;

    const migrated = localStorage.getItem('tianji-history-migrated');
    if (migrated) return;

    const localItems = loadHistoryFromStorage();
    if (localItems.length === 0) return;

    console.log(`[migration] Found ${localItems.length} local history records, migrating to server...`);

    migrateLocalHistory(localItems)
      .then(result => {
        console.log(`[migration] Migrated ${result.inserted}/${result.total} records`);
        localStorage.setItem('tianji-history-migrated', 'true');
        localStorage.removeItem(HISTORY_KEY);
        // Reload history from server to get the merged results
        return loadHistoryFromServer();
      })
      .then(items => {
        if (items) setHistory(items);
      })
      .catch(err => {
        console.error('[migration] Failed to migrate localStorage history:', err);
        // Don't delete localStorage data on failure
      });
  }, [user]);

  // === History CRUD (optimistic update + server sync) ===
  const upsertHistory = useCallback((id, question, moduleData, chatMsgs) => {
    const item = {
      id,
      timestamp: Date.now(),
      question: question || '综合运势',
      module: moduleData.module || 'liuyao',
      throws: moduleData.throws,
      result: moduleData.result,
      method: moduleData.method,
      input: moduleData.input,
      chatMessages: chatMsgs,
    };

    // Optimistic update: update local state immediately
    setHistory(prev => {
      const existing = prev.findIndex(h => h.id === id);
      if (existing >= 0) {
        // Preserve original timestamp on update
        item.timestamp = prev[existing].timestamp;
        const updated = [...prev];
        updated[existing] = item;
        return updated;
      }
      return [item, ...prev];
    });

    // Async server sync (fire-and-forget)
    saveHistoryRecord(item);
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
    setHistory(prev => prev.filter(h => h.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
    // Async server delete
    deleteHistoryRecord(id);
  }, [activeHistoryId]);

  // Re-read history from server (after import/clear in settings)
  const handleHistoryChange = useCallback(() => {
    loadHistoryFromServer().then(items => setHistory(items));
  }, []);

  // === Login / Logout ===
  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setUser(null);
    setHistory([]);
    setActiveHistoryId(null);
    setPendingHistoryLoad(null);
  }, []);

  // Count history for current tab
  const tabHistoryCount = history.filter(h => (h.module || 'liuyao') === activeTab).length;

  // === Auth loading state ===
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-[var(--color-gold)] font-title text-xl animate-pulse">天机卷</div>
      </div>
    );
  }

  // === Not logged in → show login page ===
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // === Standard 7-prop object for modules ===
  const moduleProps = {
    aiConfig,
    setShowSettings,
    upsertHistory,
    activeHistoryId,
    setActiveHistoryId,
    pendingHistoryLoad,
    clearPendingHistoryLoad: () => setPendingHistoryLoad(null),
  };

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
              {/* User badge */}
              <span className="text-[var(--color-text-dim)] text-xs font-body px-2 py-1 rounded-lg border border-[var(--color-surface-border)] opacity-70">
                {user.username}
              </span>
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
              <button
                onClick={handleLogout}
                className="text-[var(--color-text-dim)] hover:text-red-400 text-sm px-2 py-1 rounded-lg border border-[var(--color-surface-border)] hover:border-red-300 transition-colors font-body"
                title="登出"
              >
                退出
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0.5 -mb-px overflow-x-auto scrollbar-none">
            {TABS.map(tab => {
              if (tab.id.startsWith('divider')) {
                return (
                  <div key={tab.id} className="flex items-center px-1.5 shrink-0">
                    <div className="w-px h-5 bg-[var(--color-gold-border)] opacity-40" />
                    {tab.label && <span className="text-[9px] text-[var(--color-text-dim)] ml-1 opacity-50 font-title whitespace-nowrap">{tab.label}</span>}
                  </div>
                );
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors font-body whitespace-nowrap shrink-0
                    ${activeTab === tab.id
                      ? 'text-[var(--color-gold)] border-[var(--color-gold)]'
                      : 'text-[var(--color-text-dim)] border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-gold-border)]'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Full-width banner (theme-specific) */}
      <div className="w-full overflow-hidden relative">
        <img
          src={THEME_BANNERS[theme] || '/assets/banner.webp'}
          alt=""
          className={`w-full h-24 object-cover ${theme === 'dark' ? 'opacity-50' : 'opacity-35'}`}
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
          }}
        />
      </div>

      {/* Module content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {historyLoading && (
          <div className="text-center text-[var(--color-text-dim)] text-sm font-body py-4 animate-pulse">
            加载历史记录...
          </div>
        )}
        {activeTab === 'liuyao' && <LiuyaoModule {...moduleProps} />}
        {activeTab === 'meihua' && <MeihuaModule {...moduleProps} />}
        {activeTab === 'bazi' && <BaziModule {...moduleProps} />}
        {activeTab === 'ziwei' && <ZiweiModule {...moduleProps} />}
        {activeTab === 'qimen' && <QimenModule {...moduleProps} />}
        {activeTab === 'fengshui' && <FengshuiModule {...moduleProps} />}
        {activeTab === 'tizhi' && <TizhiModule {...moduleProps} />}
        {activeTab === 'ziwu' && <ZiwuModule {...moduleProps} />}
        {activeTab === 'wuyun' && <WuyunModule {...moduleProps} />}
        {activeTab === 'bazihealth' && <BaziHealthModule {...moduleProps} />}
        {activeTab === 'wangzhen' && <WangzhenModule {...moduleProps} />}
        {activeTab === 'face' && <FaceModule {...moduleProps} />}
        {activeTab === 'palm' && <PalmModule {...moduleProps} />}
      </main>

      {/* Decorative divider */}
      <div className="max-w-xs mx-auto px-8 py-6 flex items-center gap-3 opacity-30">
        <div className="flex-1 h-px bg-[var(--color-gold-border)]" />
        <span className="text-[var(--color-gold-muted)] text-xs font-title tracking-widest">✦</span>
        <div className="flex-1 h-px bg-[var(--color-gold-border)]" />
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-[var(--color-text-dim)] text-xs max-w-2xl mx-auto px-4 font-body">
        本工具基于中国传统文化知识体系，所有占算和分析结果仅供参考和学习。
        不构成任何医疗、法律、财务或人生决策建议。重大决策请咨询专业人士。
      </footer>

      {/* Shared overlays */}
      <SettingsPanel
        aiConfig={aiConfig}
        setAiConfig={setAiConfig}
        show={showSettings}
        setShow={setShowSettings}
        historyCount={history.length}
        onHistoryChange={handleHistoryChange}
        user={user}
        onLogout={handleLogout}
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
