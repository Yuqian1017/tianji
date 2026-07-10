import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  extractLastHtmlSection,
  normalizeOfficialTitle,
  sha256,
} from './lib/tcm-pharmacopoeia.mjs';
import {
  SAFETY_REFERENCE_PATH,
  classifyPregnancyText,
  uniqueComparatorNames,
} from './lib/tcm-pregnancy-compatibility.mjs';

const ROOT = process.cwd();
const API_ROOT = 'https://ydz.chp.org.cn/front-api';
const DOSE_SNAPSHOT_PATH = path.join(ROOT, 'database/tcm/sources/chp2020-tcm-safety-selected.json');
const OUTPUT_PATH = path.join(ROOT, 'database/tcm/sources/chp2020-tcm-pregnancy-compatibility.json');
const USER_AGENT = 'Tianji database validation/1.0';

const SEARCH_NAME_OVERRIDES = {
  '土鳖虫（䗪虫）': '土鳖虫',
};

async function fetchJson(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'user-agent': USER_AGENT,
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = JSON.parse(await response.text());
      if (payload.code !== 200) throw new Error(payload.msg ?? `API code ${payload.code}`);
      return payload;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, attempt * 400));
    }
  }
  throw lastError;
}

function stableSearchResultSet(list) {
  return list.map(item => ({
    id: item.id,
    title: normalizeOfficialTitle(item.title),
    directoryTitle: item.directoryTitle,
    pageNum: item.pageNum,
    bookId: item.bookId,
  }));
}

function reuseDoseSnapshotItem(requestedName, item) {
  return {
    requestedName,
    searchName: SEARCH_NAME_OVERRIDES[requestedName] ?? requestedName,
    found: true,
    sourceAcquisition: 'reused_chp2020_dose_snapshot',
    entryId: item.entryId,
    officialTitle: item.officialTitle,
    englishTitle: item.englishTitle,
    pageNum: item.pageNum,
    attention: item.attention,
    pregnancyClassification: classifyPregnancyText(item.attention),
    htmlContentSha256: item.htmlContentSha256,
    sourceUrl: item.sourceUrl,
  };
}

async function fetchOfficialEntry(requestedName) {
  const searchName = SEARCH_NAME_OVERRIDES[requestedName] ?? requestedName;
  const search = await fetchJson(`${API_ROOT}/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json;charset=utf-8' },
    body: JSON.stringify({
      keyword: searchName,
      pageSize: 100,
      pageNum: 1,
      bookId: 1,
    }),
  });
  const searchRows = search.data?.list ?? [];
  const exact = searchRows.filter(item => (
    item.directoryTitle === '药材和饮片'
    && normalizeOfficialTitle(item.title) === normalizeOfficialTitle(requestedName)
  ));
  const searchResultSetSha256 = sha256(JSON.stringify(stableSearchResultSet(searchRows)));
  if (exact.length === 0) {
    return {
      requestedName,
      searchName,
      found: false,
      sourceAcquisition: 'queried_chp2020_official_api',
      reason: 'not_in_2020_official_digital_book_under_exact_title',
      searchResultSetSha256,
    };
  }
  if (exact.length !== 1) {
    throw new Error(`Expected one 2020 monograph for ${requestedName}, found ${exact.length}`);
  }

  const detail = await fetchJson(`${API_ROOT}/entry/${exact[0].id}`);
  const entry = detail.data;
  const html = entry.htmlContent ?? '';
  const attention = extractLastHtmlSection(html, '注意');
  return {
    requestedName,
    searchName,
    found: true,
    sourceAcquisition: 'queried_chp2020_official_api',
    entryId: entry.entryId,
    officialTitle: entry.title,
    englishTitle: entry.eTitle,
    pageNum: entry.pageNum,
    attention,
    pregnancyClassification: classifyPregnancyText(attention),
    htmlContentSha256: sha256(html),
    searchResultSetSha256,
    sourceUrl: `https://ydz.chp.org.cn/#/item?bookId=1&entryId=${entry.entryId}`,
  };
}

const [safetyText, doseSnapshotText] = await Promise.all([
  readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8'),
  readFile(DOSE_SNAPSHOT_PATH, 'utf8'),
]);
const requestedNames = uniqueComparatorNames(safetyText);
const doseSnapshot = JSON.parse(doseSnapshotText);
const reusableByTitle = new Map();
for (const item of doseSnapshot.rows.flatMap(row => row.substances)) {
  if (item.found) reusableByTitle.set(normalizeOfficialTitle(item.officialTitle), item);
}

const results = Array(requestedNames.length);
let cursor = 0;

async function worker() {
  while (cursor < requestedNames.length) {
    const index = cursor;
    cursor += 1;
    const requestedName = requestedNames[index];
    const reusable = reusableByTitle.get(normalizeOfficialTitle(requestedName));
    results[index] = reusable
      ? reuseDoseSnapshotItem(requestedName, reusable)
      : await fetchOfficialEntry(requestedName);
    if (!reusable) await new Promise(resolve => setTimeout(resolve, 80));
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));

const snapshot = {
  schemaVersion: 1,
  source: '中华人民共和国药典：2020年版．一部 / 国家药典委员会药典数据库',
  sourceRole: 'official_historical_pregnancy_and_compatibility_comparator_not_current_2025_authority',
  bookId: 1,
  apiRoot: API_ROOT,
  officialHome: 'http://ydz.chp.org.cn/',
  retrievedAt: '2026-07-10',
  copyright: '国家药典委员会；仅保存候选药的注意短字段、入口 ID 与正文 hash，不镜像整部正文。',
  sourceRefs: {
    rawSafetyPath: SAFETY_REFERENCE_PATH,
    rawSafetySha256: sha256(safetyText),
    reusedDoseSnapshotPath: path.relative(ROOT, DOSE_SNAPSHOT_PATH),
    reusedDoseSnapshotSha256: sha256(doseSnapshotText),
  },
  counts: {
    requestedNames: results.length,
    officialMonographsFound: results.filter(item => item.found).length,
    missingExactTitles: results.filter(item => !item.found).length,
    attentionFieldsFound: results.filter(item => item.attention).length,
    pregnancyProhibited: results.filter(item => item.pregnancyClassification === 'prohibited').length,
    pregnancyCaution: results.filter(item => item.pregnancyClassification === 'caution').length,
  },
  items: results,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify(snapshot.counts, null, 2));
