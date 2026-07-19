// E2E chapter walker — paste into the game.html browser console (dev preview).
// Origin: ch1 ad-hoc walker (M1) → persisted after the ch2 run (2026-07-13).
//
// ⚠️ Anti-throttle: use a MessageChannel pump, NOT setInterval — Chrome clamps
// timers in unfocused/preview tabs to ≥1s (the ch2 run crawled at 4s/tick until
// switched). MessageChannel macrotask self-scheduling is exempt, and React's own
// scheduler uses the same mechanism, so renders keep up. gap=6 macrotasks between
// walker actions gives React room to commit (React 18 batching — see HANDOFF M2).
//
// Usage:
//   1. Seed a save via localStorage.setItem('tianji-game-save', JSON.stringify({...}))
//      (or play from settings), reload, then paste this file.
//   2. runWalker({ startButtonText: '第二章', stopWhen: (save, body) => ... })
//   3. Poll window.__walker for { done, error, steps, lastNode, nodeTrail }.
// Strategy: optimal line = always first option (chapter data lists optimal first).
// Click priority: throw button > continue buttons > first option > cursor-pointer node.

// cpPicks: { '<nodeId>': <optionIndex> } — for choice nodes whose optimal answer is
// NOT the first option (ch6 CP-03 lists the correct pick second by design), or to
// drive wrong-line runs. Applies when save.currentNodeId matches; falls back to first.
function runWalker({ startButtonText = null, stopWhen = null, stepBudget = 1200, cpPicks = {} } = {}) {
  window.__walker = { steps: 0, stuck: 0, done: false, error: null, lastNode: null, nodeTrail: [] };
  const W = window.__walker;
  const getSave = () => { try { return JSON.parse(localStorage.getItem('tianji-game-save')); } catch { return null; } };

  if (startButtonText) {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes(startButtonText));
    if (!b) { W.error = `start button "${startButtonText}" not found`; W.done = true; return W; }
    b.click();
  }

  function tick() {
    try {
      const sv = getSave();
      const nid = sv?.currentNodeId;
      if (nid && nid !== W.lastNode) { W.lastNode = nid; W.nodeTrail.push(nid); }
      if (stopWhen && stopWhen(sv, document.body.innerText)) { W.done = true; return; }
      W.steps++;
      if (W.steps > stepBudget) { W.error = 'step budget exceeded'; W.done = true; return; }
      const buttons = [...document.querySelectorAll('button')];
      const throwBtn = buttons.find((b) => /合掌摇钱|第 \d 掷/.test(b.textContent));
      if (throwBtn) { W.stuck = 0; throwBtn.click(); return; }
      const contBtn = buttons.find((b) => /存档并返回|继续摇卦|继续 ▸/.test(b.textContent));
      if (contBtn) { W.stuck = 0; contBtn.click(); return; }
      const optBtns = buttons.filter((b) => b.className.includes('text-left'));
      if (optBtns.length) {
        const pick = cpPicks[nid];
        const target = (pick !== undefined && optBtns[pick]) ? optBtns[pick] : optBtns[0];
        W.stuck = 0; target.click(); return;
      }
      const clickable = document.querySelector('.cursor-pointer');
      if (clickable) { W.stuck = 0; clickable.click(); return; }
      W.stuck++;
      if (W.stuck > 400) { W.error = `stuck at ${nid}`; W.done = true; }
    } catch (e) { W.error = String(e); W.done = true; }
  }

  const chan = new MessageChannel();
  window.__walkerChan = chan; // keep port alive
  let gap = 0;
  chan.port1.onmessage = () => {
    if (W.done) return;
    gap++;
    if (gap >= 6) { gap = 0; tick(); }
    chan.port2.postMessage(null);
  };
  chan.port2.postMessage(null);
  return W;
}

// Example — full ch2 optimal run until completion:
// runWalker({ startButtonText: '第二章', stopWhen: (sv) => sv?.completedChapters?.includes('ch2') });
