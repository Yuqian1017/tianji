import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GROUPS = [
  {
    id: 'tcm_original_texts',
    root: 'database/tcm/skill-v3/sources',
    sourceRole: 'classical_or_textbook_fulltext',
  },
  {
    id: 'tcm_curated_references',
    root: 'database/tcm/skill-v3/references',
    sourceRole: 'curated_secondary_reference',
  },
  {
    id: 'tcm_modern_boundaries',
    root: 'database/tcm/sources',
    sourceRole: 'modern_identity_safety_or_comparator_evidence',
  },
  {
    id: 'xuanxue_compendium',
    root: 'database/xuanxue/compendium-new',
    sourceRole: 'canonical_historical_compendium',
  },
  {
    id: 'xuanxue_compendium_mirror',
    root: 'database/xuanxue/compendium-vision-api',
    sourceRole: 'historical_compendium_mirror_or_variant',
  },
  {
    id: 'shared_wikisource_witnesses',
    root: 'database/sources/wikisource',
    sourceRole: 'public_text_witness_or_repository_metadata',
  },
  {
    id: 'shared_ctext_witnesses',
    root: 'database/sources/ctext',
    sourceRole: 'public_text_witness_or_repository_metadata',
  },
  {
    id: 'external_source_manifests',
    root: 'database/sources/external',
    sourceRole: 'external_secondary_source_metadata',
  },
  {
    id: 'xiangshu_source_registry',
    root: 'database/xiangshu/sources',
    sourceRole: 'classical_witness_manifest',
  },
  {
    id: 'shared_datasets',
    files: ['database/shared/geonames-selected-2026-07-10.tsv'],
    sourceRole: 'external_reference_dataset',
  },
  {
    id: 'licenses',
    root: 'database/licenses',
    sourceRole: 'source_license',
  },
];

const EXCLUDED_NAMES = new Set(['.DS_Store', 'SHA256SUMS.txt']);

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (EXCLUDED_NAMES.has(entry.name)) continue;
    const child = path.posix.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(child));
    if (entry.isFile()) files.push(child);
  }
  return files.sort();
}

function idFor(group, canonicalPath) {
  const suffix = createHash('sha256').update(canonicalPath).digest('hex').slice(0, 16);
  return `source.${group}.${suffix}`;
}

const entries = [];
for (const group of GROUPS) {
  const files = group.files ?? await listFiles(group.root);
  for (const canonicalPath of files) {
    const bytes = await readFile(canonicalPath);
    const fileStat = await stat(canonicalPath);
    const entry = {
      id: idFor(group.id, canonicalPath),
      group: group.id,
      title: path.basename(canonicalPath),
      canonicalPath,
      sourceRole: group.sourceRole,
      format: path.extname(canonicalPath).slice(1) || 'none',
      bytes: fileStat.size,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      relationshipStatus: 'standalone',
    };

    if (group.id === 'xuanxue_compendium_mirror') {
      const relativePath = path.posix.relative(group.root, canonicalPath);
      const relatedCanonicalPath = path.posix.join('database/xuanxue/compendium-new', relativePath);
      const canonicalBytes = await readFile(relatedCanonicalPath);
      const canonicalHash = createHash('sha256').update(canonicalBytes).digest('hex');
      entry.relatedCanonicalPath = relatedCanonicalPath;
      entry.relationshipStatus = canonicalHash === entry.sha256
        ? 'identical_mirror'
        : 'historical_variant';
    }

    entries.push(entry);
  }
}

const byGroup = Object.fromEntries(GROUPS.map(group => [
  group.id,
  entries.filter(entry => entry.group === group.id).length,
]));
const output = {
  schemaVersion: 1,
  doctrine: 'single_canonical_file_with_central_registry',
  generatedAt: '2026-07-18',
  root: 'database/sources',
  counts: {
    entries: entries.length,
    byGroup,
    identicalCompendiumMirrors: entries.filter(entry => entry.relationshipStatus === 'identical_mirror').length,
    historicalCompendiumVariants: entries.filter(entry => entry.relationshipStatus === 'historical_variant').length,
  },
  migrationPolicy: {
    current: 'index_in_place_without_copying_or_moving_canonical_files',
    future: 'new_external_witnesses_enter_database/sources_first; legacy paths migrate only with compatibility mapping',
  },
  entries,
};

await writeFile('database/sources/source-library.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.counts));
