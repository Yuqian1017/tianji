import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  SAFETY_REFERENCE_PATH,
  extractLastHtmlSection,
  normalizeOfficialTitle,
  officialLookupForRow,
  parseDoseRows,
  sha256,
} from './lib/tcm-pharmacopoeia.mjs';

const ROOT = process.cwd();
const API_ROOT = 'https://ydz.chp.org.cn/front-api';
const OUTPUT_PATH = path.join(ROOT, 'database/tcm/sources/chp2020-tcm-safety-selected.json');
const RETRIEVED_AT = process.env.SOURCE_RETRIEVED_AT ?? '2026-07-10';
const USER_AGENT = 'Tianji database validation/1.0';

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
      const text = await response.text();
      const payload = JSON.parse(text);
      if (payload.code !== 200) throw new Error(payload.msg ?? `API code ${payload.code}`);
      return { payload, responseSha256: sha256(text) };
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, attempt * 400));
    }
  }
  throw lastError;
}

async function fetchOfficialEntry(lookup) {
  if (!lookup.officialTitle) {
    return {
      ...lookup,
      found: false,
      reason: lookup.identityStatus,
    };
  }

  const searchBody = JSON.stringify({
    keyword: lookup.searchName,
    pageSize: 100,
    pageNum: 1,
    bookId: 1,
  });
  const search = await fetchJson(`${API_ROOT}/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json;charset=utf-8' },
    body: searchBody,
  });
  const exact = (search.payload.data?.list ?? []).filter(item => (
    item.directoryTitle === '药材和饮片'
    && normalizeOfficialTitle(item.title) === normalizeOfficialTitle(lookup.officialTitle)
  ));
  if (exact.length === 0) {
    return {
      ...lookup,
      found: false,
      reason: 'not_in_2020_official_digital_book',
      searchResponseSha256: search.responseSha256,
    };
  }
  if (exact.length !== 1) {
    throw new Error(`Expected one 2020 monograph for ${lookup.officialTitle}, found ${exact.length}`);
  }

  const searchHit = exact[0];
  const detail = await fetchJson(`${API_ROOT}/entry/${searchHit.id}`);
  const entry = detail.payload.data;
  const html = entry.htmlContent ?? '';
  return {
    ...lookup,
    found: true,
    entryId: entry.entryId,
    officialTitle: entry.title,
    englishTitle: entry.eTitle,
    pageNum: entry.pageNum,
    partTitle: entry.partTitle,
    dose: extractLastHtmlSection(html, '用法与用量'),
    attention: extractLastHtmlSection(html, '注意'),
    htmlContentSha256: sha256(html),
    searchResponseSha256: search.responseSha256,
    sourceUrl: `https://ydz.chp.org.cn/#/item?bookId=1&entryId=${entry.entryId}`,
  };
}

const safetyText = await readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8');
const rows = parseDoseRows(safetyText);
const rowResults = Array(rows.length);
let cursor = 0;

async function worker() {
  while (cursor < rows.length) {
    const index = cursor;
    cursor += 1;
    const row = rows[index];
    const lookups = officialLookupForRow(row);
    const substances = [];
    for (const lookup of lookups) {
      substances.push(await fetchOfficialEntry(lookup));
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    rowResults[index] = {
      rowId: row.id,
      sourceName: row.sourceName,
      substances,
    };
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));

const allSubstances = rowResults.flatMap(row => row.substances);
const snapshot = {
  schemaVersion: 1,
  source: '中华人民共和国药典：2020年版．一部 / 国家药典委员会药典数据库',
  sourceRole: 'official_historical_comparator_not_current_2025_authority',
  bookId: 1,
  apiRoot: API_ROOT,
  officialHome: 'http://ydz.chp.org.cn/',
  retrievedAt: RETRIEVED_AT,
  copyright: '国家药典委员会；仅保存本项目候选药的短字段、入口 ID 与全文 hash，不镜像整部正文。',
  counts: {
    sourceRows: rowResults.length,
    namedSubstances: allSubstances.length,
    officialMonographsFound: allSubstances.filter(item => item.found).length,
    officialMonographsMissingOrUnresolved: allSubstances.filter(item => !item.found).length,
  },
  rows: rowResults,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify(snapshot.counts, null, 2));
