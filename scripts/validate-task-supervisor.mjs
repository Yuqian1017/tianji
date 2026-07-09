import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const statePath = path.join(root, 'docs/meta/TIANJI_TASK_SUPERVISOR_STATE.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

const required = [
  'project', 'version', 'updatedAt', 'currentPhaseId', 'currentStage',
  'overallPercent', 'currentFocus', 'nextDecision', 'antiDriftRule',
  'phases', 'activeTasks', 'gates', 'recentEvidence'
];

const missing = required.filter((key) => state[key] === undefined);
if (missing.length) {
  throw new Error(`Supervisor missing fields: ${missing.join(', ')}`);
}

if (!Array.isArray(state.phases) || state.phases.length === 0) {
  throw new Error('Supervisor must define at least one phase');
}

if (!state.phases.some((phase) => phase.id === state.currentPhaseId)) {
  throw new Error(`currentPhaseId ${state.currentPhaseId} is not present in phases`);
}

for (const phase of state.phases) {
  for (const key of ['id', 'name', 'status', 'progress', 'goal', 'doneWhen', 'evidence', 'metrics']) {
    if (phase[key] === undefined) throw new Error(`Phase ${phase.id ?? '?'} missing ${key}`);
  }
}

if (state.overallPercent < 0 || state.overallPercent > 100) {
  throw new Error('overallPercent must be between 0 and 100');
}

console.log(`Supervisor OK: ${state.project} / ${state.currentStage} / ${state.overallPercent}%`);
