// Standalone game entry — dev/playtest mount without the main app auth wall.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import GameModule from './GameModule.jsx';

// Reuse the app's theme system (index.css variables keyed on data-theme).
document.documentElement.setAttribute('data-theme', localStorage.getItem('tianji-theme') || 'ink');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: 'var(--color-bg)' }}>
      <GameModule />
    </div>
  </StrictMode>,
);
