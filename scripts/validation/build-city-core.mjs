import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { pinyin } from 'pinyin-pro';

const ROOT = process.cwd();
const LEGACY_PATH = path.join(ROOT, 'database/shared/legacy-city-baseline.json');
const CORE_PATH = path.join(ROOT, 'database/shared/cities-core.json');
const SELECTED_SOURCE_PATH = path.join(ROOT, 'database/shared/geonames-selected-2026-07-10.tsv');
const RUNTIME_PATH = path.join(ROOT, 'src/lib/cities.runtime.json');
const CITIES_15000_PATH = process.env.GEONAMES_CITIES15000 ?? '/tmp/tianji-geonames/cities15000.txt';
const CITIES_500_PATH = process.env.GEONAMES_CITIES500 ?? '/tmp/tianji-geonames/cities500.txt';
const ADMIN1_CODES_PATH = process.env.GEONAMES_ADMIN1_CODES ?? '/tmp/tianji-admin1CodesASCII.txt';
const CITIES_15000_ZIP = process.env.GEONAMES_CITIES15000_ZIP ?? '/tmp/tianji-cities15000.zip';
const CITIES_500_ZIP = process.env.GEONAMES_CITIES500_ZIP ?? '/tmp/tianji-cities500.zip';

const CHINA_ADMIN1_BY_REGION = {
  安徽: '01', 浙江: '02', 江西: '03', 江苏: '04', 吉林: '05', 青海: '06', 福建: '07', 黑龙江: '08',
  河南: '09', 河北: '10', 湖南: '11', 湖北: '12', 新疆: '13', 西藏: '14', 甘肃: '15', 广西: '16',
  贵州: '18', 辽宁: '19', 内蒙古: '20', 宁夏: '21', 北京: '22', 上海: '23', 山西: '24', 山东: '25',
  陕西: '26', 天津: '28', 云南: '29', 广东: '30', 海南: '31', 四川: '32', 重庆: '33',
};

const COUNTRY_BY_REGION = {
  香港: 'HK', 澳门: 'MO', 台湾: 'TW',
  日本: 'JP', 韩国: 'KR', 新加坡: 'SG', 马来西亚: 'MY', 泰国: 'TH', 越南: 'VN', 菲律宾: 'PH', 印尼: 'ID',
  印度: 'IN', 澳大利亚: 'AU', 新西兰: 'NZ', 加拿大: 'CA', 英国: 'GB', 法国: 'FR', 德国: 'DE', 荷兰: 'NL',
  意大利: 'IT', 西班牙: 'ES', 奥地利: 'AT', 捷克: 'CZ', 瑞士: 'CH', 俄罗斯: 'RU', 土耳其: 'TR', 阿联酋: 'AE',
  以色列: 'IL', 巴西: 'BR', 阿根廷: 'AR', 秘鲁: 'PE', 埃及: 'EG', 南非: 'ZA',
};

const GEONAME_OVERRIDES = {
  '湘西|湖南': 1805270,
  '鄂尔多斯|内蒙古': 8347664,
  '格尔木|青海': 1281184,
  '林芝|西藏': 13512708,
  '红河|云南': 13512502,
};

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeAscii(value) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function parseGeoNames(text, collection) {
  return text.trim().split('\n').map((rawLine) => {
    const fields = rawLine.split('\t');
    return {
      geonameId: Number(fields[0]),
      sourceName: fields[1],
      asciiName: fields[2],
      alternateNames: fields[3] ? fields[3].split(',') : [],
      latitude: Number(fields[4]),
      longitude: Number(fields[5]),
      featureClass: fields[6],
      featureCode: fields[7],
      countryCode: fields[8],
      admin1Code: fields[10],
      admin2Code: fields[11],
      population: Number(fields[14]) || 0,
      sourceTimeZone: fields[17],
      sourceModifiedDate: fields[18],
      sourceCollection: collection,
      rawLine,
      rawRecordSha256: sha256(rawLine),
    };
  });
}

function expectedCountry(city) {
  if (city.province.startsWith('美国')) return 'US';
  return COUNTRY_BY_REGION[city.province] ?? 'CN';
}

function candidateNames(record) {
  return [record.sourceName, record.asciiName, ...record.alternateNames];
}

async function loadLegacy() {
  try {
    return JSON.parse(await readFile(LEGACY_PATH, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const { CHINA_CITIES } = await import('../../src/lib/cities.js');
    const baseline = {
      schemaVersion: 1,
      status: 'legacy_unproven_runtime_baseline',
      capturedAt: '2026-07-10',
      note: 'Preserves the pre-validation display labels, approximate longitudes and fixed standard meridians for audit only.',
      cities: CHINA_CITIES,
    };
    await mkdir(path.dirname(LEGACY_PATH), { recursive: true });
    await writeFile(LEGACY_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
    return baseline;
  }
}

const [legacy, text15000, text500, admin1CodesText, zip15000, zip500] = await Promise.all([
  loadLegacy(),
  readFile(CITIES_15000_PATH, 'utf8'),
  readFile(CITIES_500_PATH, 'utf8'),
  readFile(ADMIN1_CODES_PATH, 'utf8'),
  readFile(CITIES_15000_ZIP),
  readFile(CITIES_500_ZIP),
]);

const records15000 = parseGeoNames(text15000, 'cities15000');
const records500 = parseGeoNames(text500, 'cities500');
const recordsById = new Map(records500.map(record => [record.geonameId, record]));
for (const record of records15000) recordsById.set(record.geonameId, record);

const unicodeIndex = new Map();
const asciiIndex = new Map();
for (const record of recordsById.values()) {
  for (const name of candidateNames(record)) {
    if (!name) continue;
    const unicodeKey = name.normalize('NFKC').toLowerCase();
    const asciiKey = normalizeAscii(name);
    const unicodeRows = unicodeIndex.get(unicodeKey) ?? [];
    unicodeRows.push(record);
    unicodeIndex.set(unicodeKey, unicodeRows);
    if (asciiKey) {
      const asciiRows = asciiIndex.get(asciiKey) ?? [];
      asciiRows.push(record);
      asciiIndex.set(asciiKey, asciiRows);
    }
  }
}

const cities = legacy.cities.map((city) => {
  const key = `${city.name}|${city.province}`;
  const countryCode = expectedCountry(city);
  const expectedAdmin1Code = countryCode === 'CN' ? CHINA_ADMIN1_BY_REGION[city.province] : null;
  if (countryCode === 'CN' && !expectedAdmin1Code) throw new Error(`No China admin1 contract for ${key}`);
  const overrideId = GEONAME_OVERRIDES[key];
  const isPlausible = record => (
    record?.countryCode === countryCode
    && Math.abs(record.longitude - city.lng) <= 0.5
    && (!expectedAdmin1Code || record.admin1Code === expectedAdmin1Code)
  );
  const displayMatches = (unicodeIndex.get(city.name.normalize('NFKC').toLowerCase()) ?? []).filter(isPlausible);
  const englishMatches = city.en
    ? (asciiIndex.get(normalizeAscii(city.en)) ?? []).filter(isPlausible)
    : [];
  const pinyinName = pinyin(city.name, { toneType: 'none', separator: ' ' });
  const primaryAliases = new Set([city.en, pinyinName].filter(Boolean).map(normalizeAscii));
  const pinyinMatches = (asciiIndex.get(normalizeAscii(pinyinName)) ?? []).filter(isPlausible);
  const candidates = overrideId
    ? [recordsById.get(overrideId)].filter(isPlausible)
    : [...new Map(
      [...displayMatches, ...englishMatches, ...pinyinMatches]
        .map(record => [record.geonameId, record]),
    ).values()];

  const primaryNameMatch = record => (
    record.sourceName.normalize('NFKC') === city.name.normalize('NFKC')
    || primaryAliases.has(normalizeAscii(record.sourceName))
    || primaryAliases.has(normalizeAscii(record.asciiName))
  );
  const featureRank = record => ({ PPLC: 6, PPLA: 5, PPLA2: 4, PPLA3: 3, PPL: 2, PPLA4: 1 }[record.featureCode] ?? 0);
  const minimumLongitudeDelta = Math.min(...candidates.map(record => Math.abs(record.longitude - city.lng)));
  const locationShortlist = candidates.filter(record => (
    Math.abs(record.longitude - city.lng) <= minimumLongitudeDelta + 0.05
  ));
  const record = locationShortlist.toSorted((left, right) => (
    Number(primaryNameMatch(right)) - Number(primaryNameMatch(left))
    || right.population - left.population
    || featureRank(right) - featureRank(left)
    || Math.abs(left.longitude - city.lng) - Math.abs(right.longitude - city.lng)
  ))[0];

  if (!record) throw new Error(`No GeoNames match for ${key}`);
  const matchMethod = overrideId
    ? 'adjudicated_geoname_id'
    : displayMatches.some(item => item.geonameId === record.geonameId)
      ? 'exact_display_name'
      : englishMatches.some(item => item.geonameId === record.geonameId)
        ? 'exact_english_name'
        : 'exact_pinyin_name';
  const longitudeDelta = Math.abs(record.longitude - city.lng);
  if (longitudeDelta > 0.5) {
    throw new Error(`GeoNames longitude drift exceeds 0.5 degrees for ${key}: ${longitudeDelta}`);
  }

  const timeZone = countryCode === 'CN' ? 'Asia/Shanghai' : record.sourceTimeZone;
  return {
    id: `geonames:${record.geonameId}`,
    name: city.name,
    province: city.province,
    ...(city.en ? { en: city.en } : {}),
    geonameId: record.geonameId,
    sourceName: record.sourceName,
    lat: record.latitude,
    lng: record.longitude,
    countryCode,
    sourceAdmin1Code: record.admin1Code,
    timeZone,
    ...(record.sourceTimeZone !== timeZone ? { sourceTimeZone: record.sourceTimeZone } : {}),
    featureCode: record.featureCode,
    population: record.population,
    sourceModifiedDate: record.sourceModifiedDate,
    sourceCollection: record.sourceCollection,
    rawRecordSha256: record.rawRecordSha256,
    matchMethod,
    legacyLongitude: city.lng,
    longitudeDelta: Number(longitudeDelta.toFixed(5)),
  };
});

const selectedSourceText = `${cities.map((city) => {
  const record = recordsById.get(city.geonameId);
  return `${record.sourceCollection}\t${record.rawLine}`;
}).join('\n')}\n`;

const duplicateLabels = cities.filter((city, index) => (
  cities.findIndex(item => item.name === city.name && item.province === city.province) !== index
));
const duplicateIds = cities.filter((city, index) => (
  cities.findIndex(item => item.geonameId === city.geonameId) !== index
));
if (duplicateLabels.length || duplicateIds.length) {
  throw new Error(`Duplicate city identities: labels=${duplicateLabels.map(city => `${city.name}|${city.province}`).join(',')}; geonameIds=${duplicateIds.map(city => `${city.name}|${city.province}|${city.geonameId}`).join(',')}`);
}

const core = {
  schemaVersion: 1,
  domain: 'shared-city-time-zone-core',
  status: 'source_pinned_full_runtime_city_domain',
  generatedAt: '2026-07-10',
  sourceLicense: 'GeoNames CC BY 4.0',
  sourceArchives: [
    {
      collection: 'cities15000',
      url: 'https://download.geonames.org/export/dump/cities15000.zip',
      archiveSha256: sha256(zip15000),
      extractedSha256: sha256(text15000),
    },
    {
      collection: 'cities500',
      url: 'https://download.geonames.org/export/dump/cities500.zip',
      archiveSha256: sha256(zip500),
      extractedSha256: sha256(text500),
    },
    {
      collection: 'admin1CodesASCII',
      url: 'https://download.geonames.org/export/dump/admin1CodesASCII.txt',
      fileSha256: sha256(admin1CodesText),
    },
  ],
  selectedSourceSnapshot: {
    path: 'database/shared/geonames-selected-2026-07-10.tsv',
    sha256: sha256(selectedSourceText),
    rows: cities.length,
  },
  civilTimePolicy: {
    source: 'IANA time zone identifiers from GeoNames; host runtime supplies transition rules',
    mainlandChina: 'Use Asia/Shanghai as the national civil-time default. Preserve GeoNames Asia/Urumqi only as source metadata and require an explicit future convention choice before using local Xinjiang time.',
    ambiguousWallTime: 'reject unless the caller explicitly chooses earlier or later occurrence',
    nonexistentWallTime: 'reject',
    runtimeTzdbVersion: 'host_runtime_unreported',
  },
  scope: {
    included: ['374 existing product city labels', 'GeoNames WGS84 coordinates', 'country and first-order administrative identity', 'IANA time-zone identifiers', 'historical civil offset resolution'],
    excluded: ['address-level geocoding', 'timezone boundary polygons', 'automatic Xinjiang local-time inference', 'pre-IANA local-mean-time reconstruction'],
  },
  cities,
};

const coreText = `${JSON.stringify(core, null, 2)}\n`;
const runtime = {
  schemaVersion: 1,
  status: core.status,
  sourceLicense: core.sourceLicense,
  civilTimePolicy: core.civilTimePolicy,
  sourceCoreSha256: sha256(coreText),
  cities: cities.map(city => ({
    id: city.id,
    name: city.name,
    province: city.province,
    ...(city.en ? { en: city.en } : {}),
    geonameId: city.geonameId,
    lat: city.lat,
    lng: city.lng,
    countryCode: city.countryCode,
    timeZone: city.timeZone,
    ...(city.sourceTimeZone ? { sourceTimeZone: city.sourceTimeZone } : {}),
  })),
};

await mkdir(path.dirname(CORE_PATH), { recursive: true });
await writeFile(SELECTED_SOURCE_PATH, selectedSourceText);
await writeFile(CORE_PATH, coreText);
await writeFile(RUNTIME_PATH, `${JSON.stringify(runtime, null, 2)}\n`);
console.log(JSON.stringify({
  cities: cities.length,
  matchedBy: Object.fromEntries(Object.entries(Object.groupBy(cities, city => city.matchMethod)).map(([key, rows]) => [key, rows.length])),
  sourceCollections: Object.fromEntries(Object.entries(Object.groupBy(cities, city => city.sourceCollection)).map(([key, rows]) => [key, rows.length])),
  maxLongitudeDelta: Math.max(...cities.map(city => city.longitudeDelta)),
  timezoneOverrides: cities.filter(city => city.sourceTimeZone).length,
}, null, 2));
