import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const REFERENCE_PATH = 'database/tcm/skill-v3/references/47-温病-卫气营血三焦方证条文.md';
const ADJUDICATION_PATH = 'database/tcm/adjudications/tcm-classic-ref47-quote-adjudications.json';
const PUBLIC_WITNESS_PATH = 'database/sources/ctext/tcm-wenbing-public-witnesses-2026-07-18.json';
const NIHAISHA_PATH = 'database/sources/external/nihaisha-nishi-tcm-2026-07-18.json';
const OUTPUT_PATH = 'database/tcm/normalized/tcm-classic-ref47-quote-provenance.json';

const SOURCE_SPECS = [
  {
    id: 'wenrelun-local-text',
    work: '温热论',
    path: 'database/tcm/skill-v3/sources/温热论.txt',
  },
  {
    id: 'shirebingpian-local-text',
    work: '湿热病篇',
    path: 'database/tcm/skill-v3/sources/湿热病篇.txt',
  },
  {
    id: 'wenbingtiaobian-local-text',
    work: '温病条辨',
    path: 'database/tcm/skill-v3/sources/温病条辨.txt',
  },
  {
    id: 'wenre-jingwei-local-text',
    work: '温热经纬',
    path: 'database/tcm/skill-v3/sources/温热经纬.txt',
  },
  {
    id: 'huangdi-neijing-suwen-local-text',
    work: '黄帝内经素问',
    path: 'database/tcm/skill-v3/sources/黄帝内经素问.txt',
  },
  {
    id: 'shanghanlun-local-text',
    work: '伤寒论',
    path: 'database/tcm/skill-v3/sources/伤寒论.txt',
  },
  {
    id: 'jingui-yaolue-local-text',
    work: '金匮要略',
    path: 'database/tcm/skill-v3/sources/金匮要略.txt',
  },
];

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function cleanText(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/<[^>]*>/g, '')
    .normalize('NFKC');
}

function normalizeForMatch(text) {
  return cleanText(text).replace(/[\s\p{P}\p{S}]/gu, '');
}

function buildSource(spec, text) {
  let normalizedText = '';
  const lineMap = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    const normalizedLine = normalizeForMatch(line);
    normalizedText += normalizedLine;
    lineMap.push(...Array(normalizedLine.length).fill(index + 1));
  });

  return { ...spec, text, lines, normalizedText, lineMap };
}

function lineForExactMatch(sourceText, quoteText) {
  const index = sourceText.indexOf(quoteText);
  if (index < 0) return null;
  return sourceText.slice(0, index).split('\n').length;
}

function locateQuote(quoteText, source) {
  const cleanedQuote = cleanText(quoteText);
  const exactLine = lineForExactMatch(source.text, cleanedQuote);
  if (exactLine) {
    return {
      sourceId: source.id,
      work: source.work,
      matchType: 'exact_text',
      sourceLines: [exactLine],
    };
  }

  const normalizedQuote = normalizeForMatch(quoteText);
  const normalizedIndex = source.normalizedText.indexOf(normalizedQuote);
  if (normalizedIndex >= 0) {
    return {
      sourceId: source.id,
      work: source.work,
      matchType: 'normalized_contiguous',
      sourceLines: [source.lineMap[normalizedIndex]],
    };
  }

  const segments = cleanedQuote
    .split(/(?:……|…|\.\.\.)/)
    .map(normalizeForMatch)
    .filter(segment => segment.length >= 4);
  if (segments.length < 2) return null;

  let nextIndex = 0;
  const segmentIndexes = [];
  for (const segment of segments) {
    const index = source.normalizedText.indexOf(segment, nextIndex);
    if (index < 0) return null;
    segmentIndexes.push(index);
    nextIndex = index + segment.length;
  }

  return {
    sourceId: source.id,
    work: source.work,
    matchType: 'segmented_ellipsis',
    sourceLines: [...new Set(segmentIndexes.map(index => source.lineMap[index]))],
  };
}

function ngrams(text, width = 2) {
  const counts = new Map();
  for (let index = 0; index <= text.length - width; index += 1) {
    const gram = text.slice(index, index + width);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return counts;
}

function ngramRecall(needle, haystack) {
  let total = 0;
  let overlap = 0;
  for (const [gram, count] of needle) {
    total += count;
    overlap += Math.min(count, haystack.get(gram) ?? 0);
  }
  return total === 0 ? 0 : overlap / total;
}

function buildLocatorWindows(source, maximumSpan = 5) {
  const windows = [];
  for (let lineIndex = 0; lineIndex < source.lines.length; lineIndex += 1) {
    for (let span = 1; span <= maximumSpan && lineIndex + span <= source.lines.length; span += 1) {
      const text = source.lines.slice(lineIndex, lineIndex + span).join(' ');
      const normalized = normalizeForMatch(text);
      if (normalized.length < 4) continue;
      windows.push({
        sourceId: source.id,
        line: lineIndex + 1,
        span,
        grams: ngrams(normalized),
      });
    }
  }
  return windows;
}

function approximateLocator(quoteText, windows) {
  const quoteGrams = ngrams(normalizeForMatch(quoteText));
  let best = null;
  for (const window of windows) {
    const score = ngramRecall(quoteGrams, window.grams);
    if (
      best === null
      || score > best.score
      || (score === best.score && window.span < best.span)
      || (score === best.score && window.span === best.span && window.line < best.line)
    ) {
      best = { sourceId: window.sourceId, line: window.line, span: window.span, score };
    }
  }
  return best;
}

function sourceSnippets(sourceMap, sourceId, lineNumbers) {
  const source = sourceMap.get(sourceId);
  if (!source) throw new Error(`Unknown source in ref47 adjudication: ${sourceId}`);
  return lineNumbers.map(lineNumber => source.lines[lineNumber - 1]?.trim());
}

function expandLocations(sourceMap, locations) {
  return locations.map(location => ({
    ...location,
    sourceSnippets: sourceSnippets(sourceMap, location.sourceId, location.lines),
  }));
}

function defaultExpectedSourceIds(referenceLine) {
  if (referenceLine < 90) {
    return ['wenrelun-local-text', 'wenre-jingwei-local-text'];
  }
  if (referenceLine < 164) {
    return ['shirebingpian-local-text', 'wenre-jingwei-local-text'];
  }
  return ['wenbingtiaobian-local-text'];
}

function defaultAttribution(record, selectedOrLocatorSourceId) {
  if (selectedOrLocatorSourceId === 'huangdi-neijing-suwen-local-text') {
    return {
      layer: 'external_classical_allusion',
      attributedTo: '黄帝内经素问',
      confidence: 'high',
    };
  }
  if (record.referenceLine < 90) {
    return {
      layer: selectedOrLocatorSourceId === 'wenre-jingwei-local-text'
        ? 'base_text_recension_witness'
        : 'base_text_local_transcription',
      attributedTo: '叶桂口述文本',
      confidence: 'medium',
    };
  }
  if (record.referenceLine < 164) {
    return {
      layer: selectedOrLocatorSourceId === 'wenre-jingwei-local-text'
        ? 'base_text_or_self_note_in_composite_recension'
        : 'base_text_or_self_note_in_local_composite',
      attributedTo: '薛雪文本系统',
      confidence: 'medium',
    };
  }
  if (record.referenceLine === 372) {
    return {
      layer: 'modern_editorial_collation_note',
      attributedTo: 'reference compiler',
      confidence: 'high',
    };
  }
  return {
    layer: 'author_text_or_embedded_source_citation',
    attributedTo: '吴瑭编著文本',
    confidence: 'medium',
  };
}

const fileEntries = await Promise.all([
  readFile(REFERENCE_PATH, 'utf8'),
  readFile(ADJUDICATION_PATH, 'utf8'),
  readFile(PUBLIC_WITNESS_PATH, 'utf8'),
  readFile(NIHAISHA_PATH, 'utf8'),
  ...SOURCE_SPECS.map(spec => readFile(spec.path, 'utf8')),
]);
const [
  referenceText,
  adjudicationText,
  publicWitnessText,
  nihaishaText,
  ...sourceTexts
] = fileEntries;
const sources = SOURCE_SPECS.map((spec, index) => buildSource(spec, sourceTexts[index]));
const sourceMap = new Map(sources.map(source => [source.id, source]));
const locatorWindows = new Map(sources.map(source => [source.id, buildLocatorWindows(source)]));
const adjudicationCore = JSON.parse(adjudicationText);
const publicWitnessCore = JSON.parse(publicWitnessText);
const publicWitnessIds = new Set(publicWitnessCore.witnesses.map(witness => witness.id));
const expectedSourceOverrides = new Map(Object.entries(adjudicationCore.expectedSourceOverrides));
const referenceCorrections = new Map(adjudicationCore.referenceCorrections.map(item => [item.id, item]));
const specialRecords = new Map(adjudicationCore.specialRecords.map(item => [item.id, item]));

if (referenceCorrections.size !== adjudicationCore.referenceCorrections.length) {
  throw new Error('Duplicate ref47 reference correction');
}
if (specialRecords.size !== adjudicationCore.specialRecords.length) {
  throw new Error('Duplicate ref47 special adjudication');
}

const draftRecords = [];
for (const [lineIndex, line] of referenceText.split('\n').entries()) {
  let quoteIndex = 0;
  for (const match of line.matchAll(/“([^”\n]+)”|"([^"\n]+)"/g)) {
    const quoteText = match[1] ?? match[2];
    if (normalizeForMatch(quoteText).length < 4) continue;
    quoteIndex += 1;

    const referenceLine = lineIndex + 1;
    const id = `tcm.classic.ref47.quote.L${String(referenceLine).padStart(4, '0')}Q${quoteIndex}`;
    const referenceCorrection = referenceCorrections.get(id) ?? null;
    if (referenceCorrection && referenceCorrection.originalText !== quoteText) {
      throw new Error(`Ref47 correction text drifted for ${id}`);
    }
    const effectiveQuoteText = referenceCorrection?.correctedText ?? quoteText;
    const expectedSourceIds = expectedSourceOverrides.get(id) ?? defaultExpectedSourceIds(referenceLine);
    const sourceMatches = sources
      .map(source => locateQuote(effectiveQuoteText, source))
      .filter(Boolean)
      .map(sourceMatch => ({
        ...sourceMatch,
        sourceSnippets: sourceSnippets(sourceMap, sourceMatch.sourceId, sourceMatch.sourceLines),
      }));
    const selectedSourceMatch = expectedSourceIds
      .map(sourceId => sourceMatches.find(sourceMatch => sourceMatch.sourceId === sourceId))
      .find(Boolean) ?? null;

    draftRecords.push({
      id,
      referenceId: 'ref47',
      referencePath: REFERENCE_PATH,
      referenceLine,
      quoteText,
      effectiveQuoteText,
      referenceCorrection,
      expectedSourceIds,
      sourceMatches,
      selectedSourceMatch,
    });
  }
}

const approximateLocators = new Map();
for (const record of draftRecords) {
  if (record.selectedSourceMatch) continue;
  const candidates = record.expectedSourceIds
    .map(sourceId => approximateLocator(record.effectiveQuoteText, locatorWindows.get(sourceId)))
    .filter(Boolean)
    .sort((left, right) => (
      right.score - left.score
      || left.span - right.span
      || record.expectedSourceIds.indexOf(left.sourceId) - record.expectedSourceIds.indexOf(right.sourceId)
      || left.line - right.line
    ));
  approximateLocators.set(record.id, candidates[0] ?? null);
}

const locatorFingerprintRows = [...approximateLocators]
  .map(([id, locator]) => ({
    id,
    sourceId: locator?.sourceId ?? null,
    line: locator?.line ?? null,
    span: locator?.span ?? null,
    score: locator ? Number(locator.score.toFixed(6)) : null,
  }))
  .sort((left, right) => left.id.localeCompare(right.id));
const locatorFingerprint = sha256(JSON.stringify(locatorFingerprintRows));
if (
  locatorFingerprint !== adjudicationCore.defaultUnresolvedPolicy.reviewedLocatorFingerprint
  && process.env.ALLOW_FINGERPRINT_UPDATE !== '1'
) {
  throw new Error(
    `Ref47 reviewed locator fingerprint drifted: expected ${adjudicationCore.defaultUnresolvedPolicy.reviewedLocatorFingerprint}, computed ${locatorFingerprint}`,
  );
}

const records = [];
for (const draft of draftRecords) {
  const special = specialRecords.get(draft.id) ?? null;
  if (special && special.quoteText !== draft.quoteText) {
    throw new Error(`Ref47 special adjudication quote drifted for ${draft.id}`);
  }

  const locator = approximateLocators.get(draft.id) ?? null;
  let manualAdjudication = null;
  let locatorEvidence = null;
  if (special) {
    manualAdjudication = {
      category: special.category,
      verdict: special.verdict,
      sourceLocations: expandLocations(sourceMap, special.sourceLocations),
      relatedSourceLocations: expandLocations(sourceMap, special.relatedSourceLocations),
      externalWitnessIds: special.externalWitnessIds,
      secondaryLocatorRefs: special.secondaryLocatorRefs,
      note: special.note,
    };
  } else if (!draft.selectedSourceMatch) {
    if (!locator || locator.score < adjudicationCore.defaultUnresolvedPolicy.minimumBigramRecall) {
      throw new Error(`Ref47 unresolved quote lacks a special adjudication: ${draft.id}`);
    }
    const sourceLines = Array.from({ length: locator.span }, (_, index) => locator.line + index);
    manualAdjudication = {
      category: adjudicationCore.defaultUnresolvedPolicy.category,
      verdict: adjudicationCore.defaultUnresolvedPolicy.verdict,
      sourceLocations: [{
        sourceId: locator.sourceId,
        lines: sourceLines,
        sourceSnippets: sourceSnippets(sourceMap, locator.sourceId, sourceLines),
      }],
      relatedSourceLocations: [],
      externalWitnessIds: [],
      secondaryLocatorRefs: [],
      note: adjudicationCore.defaultUnresolvedPolicy.note,
    };
  }

  if (!draft.selectedSourceMatch && locator) {
    locatorEvidence = {
      matchType: 'reviewed_bigram_recall_locator',
      sourceId: locator.sourceId,
      sourceLines: Array.from({ length: locator.span }, (_, index) => locator.line + index),
      bigramRecall: Number(locator.score.toFixed(6)),
    };
  }

  for (const witnessId of [
    ...(manualAdjudication?.externalWitnessIds ?? []),
    ...(draft.referenceCorrection?.externalWitnessIds ?? []),
  ]) {
    if (!publicWitnessIds.has(witnessId)) {
      throw new Error(`Unknown ref47 public witness ${witnessId} in ${draft.id}`);
    }
  }

  const attribution = special?.attribution
    ?? defaultAttribution(draft, draft.selectedSourceMatch?.sourceId ?? locator?.sourceId ?? draft.expectedSourceIds[0]);
  const externalClassicalAllusion = attribution.layer === 'external_classical_allusion';
  const matchType = draft.selectedSourceMatch?.matchType ?? 'unresolved';
  records.push({
    id: draft.id,
    referenceId: draft.referenceId,
    referencePath: draft.referencePath,
    referenceLine: draft.referenceLine,
    quoteText: draft.quoteText,
    effectiveQuoteText: draft.effectiveQuoteText,
    expectedSourceIds: draft.expectedSourceIds,
    attribution,
    externalClassicalAllusion,
    sourceMatches: draft.sourceMatches,
    selectedSourceMatch: draft.selectedSourceMatch,
    matchType,
    multiSource: draft.sourceMatches.length > 1,
    sourceMismatch: false,
    reviewStatus: manualAdjudication
      ? 'manual_form_or_attribution_adjudication_complete_not_content_acceptance'
      : externalClassicalAllusion
        ? 'external_classical_allusion_text_match_only_not_content_acceptance'
        : 'text_match_only_not_content_adjudication',
    locatorEvidence,
    manualAdjudication,
    referenceCorrection: draft.referenceCorrection ? {
      originalText: draft.referenceCorrection.originalText,
      correctedText: draft.referenceCorrection.correctedText,
      externalWitnessIds: draft.referenceCorrection.externalWitnessIds,
      reason: draft.referenceCorrection.reason,
    } : null,
    productEligibility: 'blocked',
    runtimeEligibleFields: [],
  });
}

const recordIds = new Set(records.map(record => record.id));
const unusedSpecialIds = [...specialRecords.keys()].filter(id => !recordIds.has(id));
const unusedCorrectionIds = [...referenceCorrections.keys()].filter(id => !recordIds.has(id));
const unusedOverrideIds = [...expectedSourceOverrides.keys()].filter(id => !recordIds.has(id));
if (unusedSpecialIds.length) throw new Error(`Unused ref47 special adjudications: ${unusedSpecialIds.join(', ')}`);
if (unusedCorrectionIds.length) throw new Error(`Unused ref47 corrections: ${unusedCorrectionIds.join(', ')}`);
if (unusedOverrideIds.length) throw new Error(`Unused ref47 source overrides: ${unusedOverrideIds.join(', ')}`);

const counts = {
  quotes: records.length,
  located: records.filter(record => record.matchType !== 'unresolved').length,
  exactText: records.filter(record => record.matchType === 'exact_text').length,
  normalizedContiguous: records.filter(record => record.matchType === 'normalized_contiguous').length,
  segmentedEllipsis: records.filter(record => record.matchType === 'segmented_ellipsis').length,
  unresolved: records.filter(record => record.matchType === 'unresolved').length,
  manualAdjudicated: records.filter(record => record.manualAdjudication).length,
  reviewedApproximateLocator: records.filter(record =>
    record.manualAdjudication?.category === adjudicationCore.defaultUnresolvedPolicy.category,
  ).length,
  specialAdjudicated: records.filter(record =>
    record.manualAdjudication && record.manualAdjudication.category !== adjudicationCore.defaultUnresolvedPolicy.category,
  ).length,
  locatedWithSpecialAdjudication: records.filter(record =>
    record.matchType !== 'unresolved'
      && record.manualAdjudication
      && record.manualAdjudication.category !== adjudicationCore.defaultUnresolvedPolicy.category,
  ).length,
  pendingManual: records.filter(record => record.matchType === 'unresolved' && !record.manualAdjudication).length,
  multiSource: records.filter(record => record.multiSource).length,
  crossSourceUnselectedMatches: records.filter(record =>
    record.matchType === 'unresolved' && record.sourceMatches.length > 0,
  ).length,
  sourceMismatch: records.filter(record => record.sourceMismatch).length,
  externalClassicalAllusion: records.filter(record => record.externalClassicalAllusion).length,
  publicWitnessSupported: records.filter(record =>
    (record.manualAdjudication?.externalWitnessIds.length ?? 0) > 0
      || (record.referenceCorrection?.externalWitnessIds.length ?? 0) > 0,
  ).length,
  referenceCorrected: records.filter(record => record.referenceCorrection).length,
  laterCommentaryOrNamedQuotation: records.filter(record =>
    /later_commentary|later_named/.test(record.attribution.layer),
  ).length,
  modernEditorial: records.filter(record =>
    /modern_editorial|modern_formula|modern_cross/.test(record.attribution.layer)
      || /modern_editorial|modern_formula|modern_cross/.test(record.manualAdjudication?.category ?? ''),
  ).length,
  encodingOrOcrAdjudicated: records.filter(record =>
    /encoding|ocr|transcoding/.test(record.manualAdjudication?.category ?? ''),
  ).length,
  secondaryLocatorLinked: records.filter(record =>
    (record.manualAdjudication?.secondaryLocatorRefs.length ?? 0) > 0,
  ).length,
};

const sourceRefs = Object.fromEntries([
  ['ref47', REFERENCE_PATH, referenceText],
  ...sources.map(source => [source.id, source.path, source.text]),
  ['ref47-manual-adjudications', ADJUDICATION_PATH, adjudicationText],
  ['ref47-public-transcription-witnesses', PUBLIC_WITNESS_PATH, publicWitnessText],
  ['nihaisha-nishi-tcm-locator-manifest', NIHAISHA_PATH, nihaishaText],
].map(([id, path, text]) => [id, { path, sha256: sha256(text) }]));

const output = {
  schemaVersion: 1,
  doctrine: 'classical_source_first',
  generatedAt: '2026-07-18',
  scope: 'reference_47_wenbing_explicit_quotes',
  status: 'text_match_attribution_and_reviewed_form_adjudication_not_content_acceptance',
  sourceRefs,
  reviewedLocatorFingerprint: locatorFingerprint,
  counts,
  referenceFindings: adjudicationCore.referenceFindings,
  boundaries: [
    'A verbatim or normalized text match proves only that the character sequence occurs in the selected local witness.',
    'The 温热论 section is collated across the local transcription, 温热经纬 recension, and public versions; version differences are preserved rather than silently flattened.',
    'The 46-clause 湿热病篇 transmission is composite. 王孟英、汪氏、杨氏、徐洄溪 and other later comments are attributed separately and do not become 薛生白 self-text.',
    'The local 温病条辨 placeholders require occurrence-level restoration. A1J8 represents both 䐜 and 撑, so global replacement is forbidden.',
    'The reference corrections 肺经气分 and 撑不死的痢疾 live only in the adjudication/provenance overlay; raw Skill files remain unchanged.',
    'nihaisha-nishi-tcm remains a secondary locator and error-propagation source. No ref47 record required it to override an independent classical witness.',
    'Modern headings, learner summaries, formula-family labels, and the textual-collation note are not classical quotations even when their tokens occur in a source file.',
    'No quote, dose, treatment, diagnosis, prognosis, emergency instruction, or self-care instruction becomes runtime eligible through this inventory.',
  ],
  records,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ ...counts, reviewedLocatorFingerprint: locatorFingerprint }));
