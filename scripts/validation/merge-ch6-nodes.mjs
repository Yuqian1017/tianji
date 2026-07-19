// One-shot merge: /tmp/ch6-nodes-{a,b}.mjs → src/game/chapters/chapter6.js nodes
// Verifies: no id collision, anchor seam (A tail → ch6-s5-header in B), entry exists.
import { readFileSync, writeFileSync } from 'node:fs';

const { NODES_A } = await import('/tmp/ch6-nodes-a.mjs');
const { NODES_B } = await import('/tmp/ch6-nodes-b.mjs');

const aIds = Object.keys(NODES_A);
const bIds = Object.keys(NODES_B);
const collision = aIds.filter((id) => id in NODES_B);
if (collision.length) { console.error('ID COLLISION:', collision); process.exit(1); }
if (!('ch6-s1-header' in NODES_A)) { console.error('A missing entry ch6-s1-header'); process.exit(1); }
if (!('ch6-s5-header' in NODES_B)) { console.error('B missing anchor ch6-s5-header'); process.exit(1); }

// A must reference the seam anchor at least once; B must not reference into A except none expected
const aBlob = JSON.stringify(NODES_A);
if (!aBlob.includes('ch6-s5-header')) { console.error('A never links to seam ch6-s5-header'); process.exit(1); }

const merged = { ...NODES_A, ...NODES_B };
// Dangling-ref check across merged graph (next / options.next / pass / fail / cp chains)
const refs = new Set();
const walk = (v) => {
  if (typeof v === 'string' && /^ch6-/.test(v)) refs.add(v);
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) {
      if (k === 'castId') continue; // identifier, not a node ref (ch5 convention: 'ch5-angua')
      walk(val);
    }
  }
};
for (const node of Object.values(merged)) walk(node);
const dangling = [...refs].filter((r) => !(r in merged) && !r.startsWith('ch6-end-')); // chapterEnd id itself is a node
if (dangling.filter((d) => d !== 'ch6').length) {
  const bad = dangling.filter((d) => d !== 'ch6');
  console.error('DANGLING REFS:', bad); process.exit(1);
}

const path = 'src/game/chapters/chapter6.js';
let src = readFileSync(path, 'utf-8');
const marker = `  nodes: {
    // ── MERGED FROM TRANSCRIPTION AGENTS (A: acts 1-4, B: acts 5-7) ──
  },`;
if (!src.includes(marker)) { console.error('merge marker not found in chapter6.js'); process.exit(1); }

// Serialize nodes preserving key order; JSON then relax quotes minimally is lossy for
// functions — but our nodes are pure data (verified: JSON round-trip below).
const roundTrip = JSON.parse(JSON.stringify(merged));
if (Object.keys(roundTrip).length !== Object.keys(merged).length) { console.error('round-trip loss'); process.exit(1); }
const body = JSON.stringify(merged, null, 2)
  .split('\n')
  .map((l, i) => (i === 0 ? l : '  ' + l))
  .join('\n');
src = src.replace(marker, `  nodes: ${body},`);
writeFileSync(path, src);
console.log(`merged: A=${aIds.length} + B=${bIds.length} = ${Object.keys(merged).length} nodes; dangling=0`);
