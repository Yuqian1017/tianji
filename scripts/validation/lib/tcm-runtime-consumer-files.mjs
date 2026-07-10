import { readdir } from 'node:fs/promises';
import path from 'node:path';

const RUNTIME_DIRECTORIES = ['src', 'server', 'public'];
const RUNTIME_ROOT_FILES = ['index.html', 'vite.config.js', 'package.json'];
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.jsx', '.svg']);

async function textFilesUnder(root, relativeDirectory) {
  const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...await textFilesUnder(root, relativePath));
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) files.push(relativePath);
  }
  return files;
}

export async function tcmRuntimeConsumerPaths(root = process.cwd()) {
  const directoryFiles = (await Promise.all(
    RUNTIME_DIRECTORIES.map(directory => textFilesUnder(root, directory)),
  )).flat();
  return [...new Set([...RUNTIME_ROOT_FILES, ...directoryFiles])].sort();
}

