const THEMES = [
  {
    id: 'ink',
    name: '水墨留白',
    desc: '淡雅宣纸底·水墨点缀·大量留白',
    palette: ['#f5f0e8', '#5a4a3a', '#4a7a6a', '#b83a3e'],
  },
  {
    id: 'jade',
    name: '仙府玉石',
    desc: '玉石质感·琥珀金·翡翠绿·微光',
    palette: ['#eef2f0', '#8a6d3b', '#3d8b72', '#c94043'],
  },
  {
    id: 'dao',
    name: '道观清修',
    desc: '纯净暖白·檀木色·极简克制',
    palette: ['#faf8f4', '#7a5c3a', '#5a8a6a', '#a84040'],
  },
  {
    id: 'dark',
    name: '夜观星象',
    desc: '深邃夜空·明金·翡翠·高对比',
    palette: ['#0f1118', '#d4a853', '#7ab8a8', '#e05555'],
  },
];

export default function ThemePicker({ show, onClose, theme, setTheme }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[var(--color-gold)] text-lg font-title mb-4">选择主题</h3>

        <div className="space-y-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-lg border transition-all
                ${theme === t.id
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold-bg)]'
                  : 'border-[var(--color-surface-border)] hover:border-[var(--color-gold-border)] hover:bg-[var(--color-gold-bg-faint)]'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-text)] font-medium font-title">{t.name}</span>
                {theme === t.id && <span className="text-[var(--color-gold)] text-sm">✓ 当前</span>}
              </div>
              <div className="text-[var(--color-text-dim)] text-xs font-body mb-2">{t.desc}</div>
              {/* Color swatches */}
              <div className="flex gap-1.5">
                {t.palette.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-[var(--color-surface-border-med)]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-[var(--color-text-dim)] text-sm py-2 hover:text-[var(--color-text)] transition-colors font-body"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
