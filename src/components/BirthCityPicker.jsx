import { useState, useRef, useEffect } from 'react';
import { searchCities, calcCitySolarTimeOffset, formatOffset } from '../lib/cities.js';

/**
 * Shared city picker for 真太阳时 correction.
 * Embeds into any module's form as a compact toggle + search dropdown.
 */
export default function BirthCityPicker({ enabled, onToggle, city, onCityChange, dateParts }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const results = query.length > 0 ? searchCities(query) : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectCity = (c) => {
    onCityChange(c);
    setQuery('');
    setShowDropdown(false);
  };

  const handleQueryChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setShowDropdown(value.length > 0);
  };

  let correction = null;
  let correctionError = null;
  if (city) {
    try {
      correction = calcCitySolarTimeOffset(city, dateParts);
    } catch (error) {
      correctionError = error;
    }
  }

  return (
    <div className="space-y-2">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--color-text)] font-body">真太阳时校正</div>
          <div className="text-xs text-[var(--color-text-dim)] font-body">
            按出生地民用时区、历史夏令时、日期与经度校正
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          aria-label={enabled ? '关闭真太阳时校正' : '开启真太阳时校正'}
          className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
            enabled ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-surface-border-med)]'
          }`}
        >
          <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* City picker (shown when enabled) */}
      {enabled && (
        <div ref={dropdownRef} className="relative">
          {city ? (
            <div className="flex items-center justify-between bg-[var(--color-surface-dim)] rounded-lg px-3 py-2 border border-[var(--color-surface-border)]">
              <div>
                <span className="text-sm text-[var(--color-text)] font-body">{city.name}</span>
                <span className="text-xs text-[var(--color-text-dim)] ml-1 font-body">({city.province})</span>
                <span className="text-xs text-[var(--color-gold)] ml-2 font-body">
                  {Math.abs(city.lng).toFixed(1)}°{city.lng >= 0 ? 'E' : 'W'} · {city.timeZone}
                </span>
                {correction && (
                  <span className="text-xs text-[var(--color-gold)] ml-2 font-body">
                    → 校正 {formatOffset(correction.offsetMinutes)}
                  </span>
                )}
              </div>
              <button
                onClick={() => { onCityChange(null); setQuery(''); }}
                className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] ml-2"
              >
                更换
              </button>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="输入城市名搜索，如：成都、Los Angeles、东京..."
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2
                text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
            />
          )}

          {city && correctionError && (
            <div className="mt-1 text-xs text-red-600 font-body">
              {correctionError.message.includes('Ambiguous')
                ? '该民用时刻在此时区重复出现，当前不会自动选择早晚实例。'
                : correctionError.message.includes('Nonexistent')
                  ? '该民用时刻在此时区不存在，当前不会静默调整。'
                  : '日期或时间无效，暂不计算真太阳时校正。'}
            </div>
          )}

          {/* Search results dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-[var(--color-bg-card)] border border-[var(--color-gold-border)]
              rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {results.map((c, i) => {
                let preview = null;
                try {
                  preview = calcCitySolarTimeOffset(c, dateParts);
                } catch {
                  // The selected city view explains ambiguous/nonexistent wall times.
                }
                return (
                  <button
                    key={`${c.name}-${c.province}-${i}`}
                    onClick={() => selectCity(c)}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-dim)] transition-colors
                      border-b border-[var(--color-surface-border)] last:border-b-0 font-body"
                  >
                    <span className="text-sm text-[var(--color-text)]">{c.name}</span>
                    {c.en && <span className="text-xs text-[var(--color-text-dim)] ml-1">{c.en}</span>}
                    <span className="text-xs text-[var(--color-text-dim)] ml-1">({c.province})</span>
                    <span className="text-xs text-[var(--color-gold)] ml-2 float-right">
                      {preview ? formatOffset(preview.offsetMinutes) : '时区边界'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showDropdown && query.length > 0 && results.length === 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-[var(--color-bg-card)] border border-[var(--color-gold-border)]
              rounded-lg shadow-lg px-3 py-2 text-sm text-[var(--color-text-dim)] font-body">
              未找到匹配城市
            </div>
          )}
        </div>
      )}
    </div>
  );
}
