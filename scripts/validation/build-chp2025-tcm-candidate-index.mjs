import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  SAFETY_REFERENCE_PATH,
  normalizeOfficialTitle,
  officialLookupForRow,
  parseDoseRows,
  sha256,
} from './lib/tcm-pharmacopoeia.mjs';

const execFile = promisify(execFileCallback);
const ROOT = process.cwd();
const SOURCE_URL = 'https://pharm.ncmi.cn/xwzx/202504/P020250407374829982808.pdf';
const ANNOUNCEMENT_URL = 'https://english.nmpa.gov.cn/2025-06/11/c_1102172.htm';
const OUTPUT_PATH = path.join(ROOT, 'database/tcm/sources/chp2025-part1-candidate-index.json');

function normalizeCatalogTitle(value) {
  return normalizeOfficialTitle(value).replace(/\([^)]*\)/g, '');
}

async function loadPdf() {
  const configuredPath = process.env.CHP2025_PART1_PDF;
  if (configuredPath) return readFile(configuredPath);
  const response = await fetch(SOURCE_URL, {
    headers: { 'user-agent': 'Tianji database validation/1.0' },
  });
  if (!response.ok) throw new Error(`Failed to download 2025 catalog: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const safetyText = await readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8');
const rows = parseDoseRows(safetyText);
const pdf = await loadPdf();
const tempDir = await mkdtemp(path.join(os.tmpdir(), 'tianji-chp2025-'));
const pdfPath = path.join(tempDir, 'part1.pdf');
const textPath = path.join(tempDir, 'part1.txt');
await writeFile(pdfPath, pdf);
await execFile('pdftotext', ['-layout', pdfPath, textPath]);
const extractedText = await readFile(textPath, 'utf8');
const materiaMedicaSection = extractedText.split('植物油脂和提取物')[0];
if (!materiaMedicaSection.includes('药材和饮片')) {
  throw new Error('2025 part-one catalog did not contain the materia-medica heading');
}
const catalogTitles = new Set(
  materiaMedicaSection
    .split(/\s+/)
    .map(normalizeCatalogTitle)
    .filter(Boolean),
);

const indexedRows = rows.map(row => ({
  rowId: row.id,
  sourceName: row.sourceName,
  substances: officialLookupForRow(row).map((lookup) => {
    if (!lookup.officialTitle) {
      const alternativesInCatalog = (row.adjudication.alternatives ?? [])
        .filter(title => catalogTitles.has(normalizeCatalogTitle(title)));
      return {
        ...lookup,
        titleIn2025Catalog: false,
        identityStatus: lookup.identityStatus === 'ambiguous_generic_name'
          ? 'ambiguous_generic_name'
          : 'not_current_pharmacopoeia_monograph',
        alternativesInCatalog,
      };
    }
    const titleIn2025Catalog = catalogTitles.has(normalizeCatalogTitle(lookup.officialTitle));
    return {
      ...lookup,
      titleIn2025Catalog,
      identityStatus: titleIn2025Catalog
        ? row.adjudication.status === 'same_as_source_name'
          ? 'exact_current_monograph'
          : 'mapped_current_monograph'
        : 'not_current_pharmacopoeia_monograph',
    };
  }),
}));

const allSubstances = indexedRows.flatMap(row => row.substances);
const result = {
  schemaVersion: 1,
  source: '2025年版《中华人民共和国药典》一部品名目录',
  sourceRole: 'current_edition_catalog_identity_only_not_monograph_content',
  effectiveDate: '2025-10-01',
  announcementUrl: ANNOUNCEMENT_URL,
  catalogUrl: SOURCE_URL,
  catalogPdfSha256: sha256(pdf),
  extractedTextSha256: sha256(extractedText),
  generatedAt: '2026-07-10',
  counts: {
    sourceRows: indexedRows.length,
    namedSubstances: allSubstances.length,
    currentMonographTitles: allSubstances.filter(item => item.titleIn2025Catalog).length,
    currentTitlesMissingOrUnresolved: allSubstances.filter(item => !item.titleIn2025Catalog).length,
    ambiguousGenericNames: allSubstances.filter(item => item.identityStatus === 'ambiguous_generic_name').length,
  },
  rows: indexedRows,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.counts, null, 2));
