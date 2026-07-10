import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import {
  ARISTOLOCHIC_SKILL_NAMES,
  COMPATIBILITY_SUPPLEMENTS,
  REGULATORY_ARISTOLOCHIC_NAMES,
  SAFETY_REFERENCE_PATH,
  UNSUPPORTED_COMPATIBILITY_EXTENSIONS,
  parseAristolochicSkillCandidates,
  parseDoseTablePregnancyClaims,
  parseEighteenIncompatibilities,
  parseFormulaWarnings,
  parseNineteenFears,
  parsePregnancyTable,
} from './lib/tcm-pregnancy-compatibility.mjs';

const ROOT = process.cwd();
const CHP2020_PATH = 'database/tcm/sources/chp2020-tcm-pregnancy-compatibility.json';
const CHP2025_PATH = 'database/tcm/sources/chp2025-tcm-pregnancy-compatibility-index.json';
const REGULATORY_PATH = 'database/tcm/sources/aristolochic-regulatory-2003-2004.json';
const OUTPUT_PATH = 'database/tcm/normalized/tcm-pregnancy-compatibility-formula-candidates.json';

const [safetyText, chp2020Text, chp2025Text, regulatoryText] = await Promise.all([
  readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8'),
  readFile(path.join(ROOT, CHP2020_PATH), 'utf8'),
  readFile(path.join(ROOT, CHP2025_PATH), 'utf8'),
  readFile(path.join(ROOT, REGULATORY_PATH), 'utf8'),
]);
const chp2020 = JSON.parse(chp2020Text);
const chp2025 = JSON.parse(chp2025Text);
const regulatory = JSON.parse(regulatoryText);
const historicalByName = new Map(chp2020.items.map(item => [item.requestedName, item]));
const currentByName = new Map(chp2025.items.map(item => [item.requestedName, item]));
const regulationByName = new Map(regulatory.medicineAdjudications.map(item => [item.name, item]));

function comparatorRecord(name) {
  const historical = historicalByName.get(name);
  const current = currentByName.get(name);
  if (!historical || !current) throw new Error(`Missing pharmacopoeia comparator for ${name}`);
  return {
    name,
    current2025: {
      titleInCatalog: current.titleIn2025Catalog,
      evidenceScope: 'catalog_identity_only',
    },
    official2020: historical.found
      ? {
          found: true,
          entryId: historical.entryId,
          officialTitle: historical.officialTitle,
          attention: historical.attention,
          pregnancyClassification: historical.pregnancyClassification,
          htmlContentSha256: historical.htmlContentSha256,
          sourceUrl: historical.sourceUrl,
        }
      : {
          found: false,
          reason: historical.reason,
        },
  };
}

function comparePregnancy(sourceClassification, comparator) {
  if (!comparator.current2025.titleInCatalog) return 'current_2025_identity_missing';
  if (!comparator.official2020.found) return 'official_2020_monograph_missing';
  const official = comparator.official2020.pregnancyClassification;
  if (official === sourceClassification) return 'same_as_official_2020_attention';
  if (official === 'not_stated') return 'not_stated_in_official_2020_attention';
  return 'conflicts_with_official_2020_attention';
}

function aggregatePregnancyStatus(comparisons) {
  const statuses = comparisons.map(item => item.comparisonStatus);
  if (statuses.includes('conflicts_with_official_2020_attention')) {
    return 'contains_official_2020_classification_conflict';
  }
  if (statuses.includes('current_2025_identity_missing')) return 'contains_current_identity_gap';
  if (statuses.includes('official_2020_monograph_missing')) return 'contains_historical_identity_gap';
  if (statuses.includes('not_stated_in_official_2020_attention')) {
    return 'contains_official_2020_silence';
  }
  return 'all_comparators_same_as_official_2020_attention';
}

function enrichPregnancyRecord(record, comparatorNames, sourceClassification) {
  const comparisons = comparatorNames.map((name) => {
    const comparator = comparatorRecord(name);
    return {
      ...comparator,
      comparisonStatus: comparePregnancy(sourceClassification, comparator),
    };
  });
  return {
    ...record,
    sourceClassification,
    comparisons,
    aggregateStatus: aggregatePregnancyStatus(comparisons),
    current2025PregnancyValidation: 'blocked_monograph_text_not_available_in_project',
    runtimeEligibleFields: [],
    productEligibility: 'blocked',
  };
}

function attentionMentions(comparator, otherName) {
  return Boolean(comparator.official2020.found && comparator.official2020.attention?.includes(otherName));
}

function enrichCompatibilityPair(pair) {
  const left = comparatorRecord(pair.leftName);
  const right = comparatorRecord(pair.rightName);
  const evidence = [];
  if (attentionMentions(left, pair.rightName)) {
    evidence.push({ monograph: pair.leftName, mentions: pair.rightName });
  }
  if (attentionMentions(right, pair.leftName)) {
    evidence.push({ monograph: pair.rightName, mentions: pair.leftName });
  }
  return {
    ...pair,
    current2025: {
      leftTitleInCatalog: left.current2025.titleInCatalog,
      rightTitleInCatalog: right.current2025.titleInCatalog,
      evidenceScope: 'catalog_identity_only',
    },
    official2020AttentionEvidence: evidence,
    official2020ComparisonStatus: evidence.length > 0
      ? 'supported_by_at_least_one_official_attention_field'
      : 'not_supported_by_available_official_attention_fields',
    current2025CompatibilityValidation: 'blocked_monograph_text_not_available_in_project',
    runtimeEligibleFields: [],
    productEligibility: 'blocked',
  };
}

const pregnancySource = parsePregnancyTable(safetyText);
const pregnancyTableItems = pregnancySource.items.map((item) => {
  const comparatorNames = item.canonicalName ? [item.canonicalName] : item.alternatives;
  const sourceClassification = item.sourceCategory === 'prohibited_source_claim'
    ? 'prohibited'
    : 'caution';
  return enrichPregnancyRecord(item, comparatorNames, sourceClassification);
});
const dosePregnancyClaims = parseDoseTablePregnancyClaims(safetyText).map(item => (
  enrichPregnancyRecord(item, item.comparatorNames, item.sourceClassification)
));

const eighteenSource = parseEighteenIncompatibilities(safetyText);
const eighteenPairs = eighteenSource.pairs.map(enrichCompatibilityPair);
const eighteenSupplements = COMPATIBILITY_SUPPLEMENTS.map(enrichCompatibilityPair);
const unsupportedExtensions = UNSUPPORTED_COMPATIBILITY_EXTENSIONS.map(enrichCompatibilityPair);
const nineteenSource = parseNineteenFears(safetyText);
const nineteenPairs = nineteenSource.pairs.map(enrichCompatibilityPair);

const formulaWarnings = parseFormulaWarnings(safetyText).map(row => ({
  ...row,
  containsHomeTreatmentInstruction: /吐不止|葱白汤解|丁香末解|麝香.*解/.test(row.warning),
  runtimeEligibleFields: [],
  productEligibility: 'blocked',
}));

const skillAristolochic = parseAristolochicSkillCandidates(safetyText);
const aristolochicCandidates = REGULATORY_ARISTOLOCHIC_NAMES.map((name, index) => {
  const regulation = regulationByName.get(name);
  if (!regulation) throw new Error(`Missing regulatory adjudication for ${name}`);
  return {
    id: `tcm-aristolochic-regulatory-${String(index + 1).padStart(2, '0')}`,
    name,
    presentInSkillSixNameList: ARISTOLOCHIC_SKILL_NAMES.includes(name),
    sourceSkillRecord: skillAristolochic.find(item => item.name === name) ?? null,
    historicalRegulation: regulation,
    pharmacopoeia: comparatorRecord(name),
    currentRegulatoryStatusValidation: name === '关木通' || name === '广防己' || name === '青木香'
      ? 'historical_standard_cancellation_and_current_catalog_absence_confirmed'
      : 'historical_2004_restriction_current_legal_status_not_fully_adjudicated',
    runtimeEligibleFields: [],
    productEligibility: 'blocked',
  };
});

const allPregnancyRecords = [...pregnancyTableItems, ...dosePregnancyClaims];
const allCompatibilityPairs = [
  ...eighteenPairs,
  ...eighteenSupplements,
  ...unsupportedExtensions,
  ...nineteenPairs,
];

const result = {
  schemaVersion: 1,
  domain: 'tcm_pregnancy_compatibility_aristolochic_formula_safety_candidates',
  status: 'normalized_candidate_full_source_domain_blocked',
  generatedAt: '2026-07-10',
  intendedUse: 'Preserve, compare, and block every Skill pregnancy, compatibility, aristolochic-acid, and formula warning candidate.',
  counts: {
    pregnancyTableRows: pregnancySource.rows.length,
    pregnancyTableItems: pregnancyTableItems.length,
    dosePregnancyClaimRows: dosePregnancyClaims.length,
    pregnancyOfficial2020Conflicts: allPregnancyRecords.filter(item => (
      item.aggregateStatus === 'contains_official_2020_classification_conflict'
    )).length,
    pregnancyCurrentIdentityGaps: allPregnancyRecords.filter(item => (
      item.aggregateStatus === 'contains_current_identity_gap'
    )).length,
    pregnancyOfficial2020Silences: allPregnancyRecords.filter(item => (
      item.aggregateStatus === 'contains_official_2020_silence'
    )).length,
    eighteenSourceRows: eighteenSource.rows.length,
    eighteenExpandedPairs: eighteenPairs.length,
    eighteenSupplementPairs: eighteenSupplements.length,
    unsupportedNameClassExtensions: unsupportedExtensions.length,
    eighteenPairsSupportedByOfficial2020: [...eighteenPairs, ...eighteenSupplements].filter(pair => (
      pair.official2020AttentionEvidence.length > 0
    )).length,
    nineteenSourceRows: nineteenSource.rows.length,
    nineteenExpandedPairs: nineteenPairs.length,
    nineteenPairsSupportedByOfficial2020: nineteenPairs.filter(pair => (
      pair.official2020AttentionEvidence.length > 0
    )).length,
    formulaWarningRows: formulaWarnings.length,
    formulaNames: formulaWarnings.flatMap(row => row.formulaNames).length,
    formulaHomeTreatmentRows: formulaWarnings.filter(row => row.containsHomeTreatmentInstruction).length,
    skillAristolochicNames: skillAristolochic.length,
    regulatoryAristolochicNames: aristolochicCandidates.length,
  },
  sourceRefs: {
    skillSafetyReference: {
      path: SAFETY_REFERENCE_PATH,
      sha256: sha256(safetyText),
      role: 'raw_candidate_reference',
    },
    chp2020Digital: {
      path: CHP2020_PATH,
      sha256: sha256(chp2020Text),
      role: 'official_historical_attention_comparator',
    },
    chp2025Catalog: {
      path: CHP2025_PATH,
      sha256: sha256(chp2025Text),
      sourcePdfSha256: chp2025.catalogPdfSha256,
      role: 'current_identity_catalog_only',
    },
    aristolochicRegulation: {
      path: REGULATORY_PATH,
      sha256: sha256(regulatoryText),
      role: 'historical_official_regulatory_actions',
    },
  },
  pregnancy: {
    tableRows: pregnancySource.rows,
    tableItems: pregnancyTableItems,
    doseTableClaims: dosePregnancyClaims,
  },
  compatibility: {
    eighteenSourceRows: eighteenSource.rows,
    eighteenPairs,
    supplements: eighteenSupplements,
    unsupportedNameClassExtensions: unsupportedExtensions,
    nineteenSourceRows: nineteenSource.rows,
    nineteenPairs,
  },
  aristolochicAcid: {
    skillSixNameList: skillAristolochic,
    regulatoryCandidates: aristolochicCandidates,
    findings: [
      {
        id: 'TCM-AA-001',
        severity: 'critical',
        status: 'source_scope_error_confirmed',
        description: 'The Skill six-name list combines the 2003 关木通 cancellation with the 2004 six-medicine notice and omits 朱砂莲 from the latter notice.',
      },
      {
        id: 'TCM-AA-002',
        severity: 'critical',
        status: 'source_identity_and_substitution_error_confirmed',
        description: 'The Skill conflates 广防己 with 木防己/汉防己. The 2004 notice identifies 广防己 separately and specifies replacement with 防己 from 粉防己.',
      },
      {
        id: 'TCM-AA-003',
        severity: 'high',
        status: 'blocked',
        description: 'All seven regulatory-universe names are absent from the 2025 Pharmacopoeia part-one catalog under exact title; absence alone does not fully adjudicate later legal status for the four prescription-group names.',
      },
    ],
  },
  formulaWarnings,
  boundaries: [
    'The 2025 evidence available here is a title catalog, not monograph pregnancy or compatibility text.',
    'The 2020 digital monographs are official historical comparators and cannot establish current 2025 wording.',
    'Traditional eighteen-incompatibility or nineteen-fear labels are not product rules unless current applicable evidence and exact medicine identity are established.',
    'Formula warnings are source candidates, not prescriptions, antidotes, or self-treatment instructions.',
    'Every normalized record remains blocked and exposes no runtime-eligible field.',
  ],
  productEligibility: 'blocked',
};

await mkdir(path.dirname(path.join(ROOT, OUTPUT_PATH)), { recursive: true });
await writeFile(path.join(ROOT, OUTPUT_PATH), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.counts, null, 2));
