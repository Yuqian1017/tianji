import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const SKILL_ROOT = path.resolve('database/tcm/skill-v3');

test('matches every file recorded in the imported skill manifest', async () => {
  const manifest = await readFile(path.join(SKILL_ROOT, 'SHA256SUMS.txt'), 'utf8');
  const entries = manifest.trim().split('\n').map(line => {
    const match = line.match(/^([0-9a-f]{64})\s+\.\/(.+)$/);
    assert.ok(match, `invalid manifest line: ${line}`);
    return { expected: match[1], relativePath: match[2] };
  });

  assert.equal(entries.length, 98);
  for (const entry of entries) {
    const content = await readFile(path.join(SKILL_ROOT, entry.relativePath));
    const actual = createHash('sha256').update(content).digest('hex');
    assert.equal(actual, entry.expected, entry.relativePath);
  }
});

test('has the declared 50 references and 42 source texts', async () => {
  const references = (await readdir(path.join(SKILL_ROOT, 'references')))
    .filter(name => name.endsWith('.md'));
  const sources = (await readdir(path.join(SKILL_ROOT, 'sources')))
    .filter(name => name.endsWith('.txt'));

  assert.equal(references.length, 50);
  assert.equal(sources.length, 42);
});
