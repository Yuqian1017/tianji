import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  SAFETY_REFERENCE_PATH,
  compareDoseQuantities,
  compatibilitySourceFindings,
  containsEmergencyTreatmentInstruction,
  parseDoseRows,
  sha256,
} from './lib/tcm-pharmacopoeia.mjs';

const ROOT = process.cwd();
const CHP2020_PATH = path.join(ROOT, 'database/tcm/sources/chp2020-tcm-safety-selected.json');
const CHP2025_PATH = path.join(ROOT, 'database/tcm/sources/chp2025-part1-candidate-index.json');
const OUTPUT_PATH = path.join(ROOT, 'database/tcm/normalized/tcm-pharmacopoeia-candidates.json');

const [safetyText, chp2020Text, chp2025Text] = await Promise.all([
  readFile(path.join(ROOT, SAFETY_REFERENCE_PATH), 'utf8'),
  readFile(CHP2020_PATH, 'utf8'),
  readFile(CHP2025_PATH, 'utf8'),
]);
const sourceRows = parseDoseRows(safetyText);
const chp2020 = JSON.parse(chp2020Text);
const chp2025 = JSON.parse(chp2025Text);
const chp2020ByRow = new Map(chp2020.rows.map(row => [row.rowId, row]));
const chp2025ByRow = new Map(chp2025.rows.map(row => [row.rowId, row]));

const rows = sourceRows.map((row) => {
  const historicalRow = chp2020ByRow.get(row.id);
  const currentRow = chp2025ByRow.get(row.id);
  if (!historicalRow || !currentRow) throw new Error(`Missing source snapshot row for ${row.id}`);

  const substances = row.substanceNames.map((substanceName, substanceIndex) => {
    const historical = historicalRow.substances.find(item => item.substanceName === substanceName);
    const current = currentRow.substances.find(item => item.substanceName === substanceName);
    if (!historical || !current) throw new Error(`Missing substance snapshot for ${row.id}/${substanceName}`);
    const doseComparison = historical.found
      ? compareDoseQuantities(row.raw.dose, historical.dose)
      : {
          status: 'not_comparable_without_official_2020_monograph',
          officialQuantities: [],
          skillQuantities: [],
          missingFromSkill: [],
        };
    let validationStatus;
    if (current.identityStatus === 'ambiguous_generic_name') {
      validationStatus = 'identity_ambiguous';
    } else if (!current.titleIn2025Catalog) {
      validationStatus = 'not_current_2025_pharmacopoeia_monograph';
    } else if (!historical.found) {
      validationStatus = 'current_title_without_2020_text_comparator';
    } else if (doseComparison.status === 'official_2020_quantities_conflict') {
      validationStatus = 'conflicts_with_official_2020_dose_quantities';
    } else {
      validationStatus = 'official_2020_quantities_concordant_2025_text_unverified';
    }
    return {
      id: `${row.id}-substance-${String(substanceIndex + 1).padStart(2, '0')}`,
      name: current.titleIn2025Catalog ? current.officialTitle : substanceName,
      sourceSubstanceName: substanceName,
      current2025: current,
      official2020: historical.found
        ? {
            found: true,
            entryId: historical.entryId,
            title: historical.officialTitle,
            englishTitle: historical.englishTitle,
            pageNum: historical.pageNum,
            dose: historical.dose,
            attention: historical.attention,
            sourceUrl: historical.sourceUrl,
            htmlContentSha256: historical.htmlContentSha256,
          }
        : {
            found: false,
            reason: historical.reason,
          },
      doseComparison,
      validationStatus,
      currentPharmacopoeiaDoseValidation: 'blocked_2025_monograph_text_not_available_in_project',
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    };
  });

  return {
    id: row.id,
    sourceName: row.sourceName,
    baseName: row.baseName,
    sourceLocator: row.sourceLocator,
    sourceRaw: row.raw,
    nameAdjudication: row.adjudication,
    containsEmergencyTreatmentInstruction: containsEmergencyTreatmentInstruction(row),
    emergencyInstructionEligibility: 'blocked_do_not_surface_as_home_treatment',
    substances,
    productEligibility: 'blocked',
  };
});

const allSubstances = rows.flatMap(row => row.substances);
const result = {
  schemaVersion: 1,
  domain: 'tcm_pharmacopoeia_safety_candidates',
  status: 'normalized_candidate_full_skill_dose_domain_blocked',
  generatedAt: '2026-07-10',
  intendedUse: 'Preserve and audit every Skill dose-table row; no row is runtime-eligible.',
  counts: {
    sourceRows: rows.length,
    namedSubstances: allSubstances.length,
    current2025CatalogTitles: allSubstances.filter(item => item.current2025.titleIn2025Catalog).length,
    current2025MissingOrUnresolved: allSubstances.filter(item => !item.current2025.titleIn2025Catalog).length,
    ambiguousCurrentNames: allSubstances.filter(item => item.validationStatus === 'identity_ambiguous').length,
    official2020Monographs: allSubstances.filter(item => item.official2020.found).length,
    official2020QuantityConcordant: allSubstances.filter(item => item.validationStatus === 'official_2020_quantities_concordant_2025_text_unverified').length,
    official2020QuantityConflicts: allSubstances.filter(item => item.validationStatus === 'conflicts_with_official_2020_dose_quantities').length,
    emergencyInstructionRows: rows.filter(row => row.containsEmergencyTreatmentInstruction).length,
  },
  sourceRefs: {
    skillSafetyReference: {
      path: SAFETY_REFERENCE_PATH,
      sha256: sha256(safetyText),
      role: 'raw_candidate_reference',
    },
    chp2025Catalog: {
      path: path.relative(ROOT, CHP2025_PATH),
      sha256: sha256(chp2025Text),
      sourcePdfSha256: chp2025.catalogPdfSha256,
      role: 'current_identity_catalog_only',
    },
    chp2020Digital: {
      path: path.relative(ROOT, CHP2020_PATH),
      sha256: sha256(chp2020Text),
      role: 'official_historical_dose_and_attention_comparator',
    },
  },
  compatibilityFindings: compatibilitySourceFindings(safetyText),
  boundaries: [
    'The 2025 official public attachment available to this audit is a title catalog, not the monograph body.',
    'The official 2020 digital book can expose historical dose and attention fields but cannot validate 2025 text.',
    'Absence from the 2025 Pharmacopoeia catalog does not mean a substance has no other national, local, hospital, or research standard.',
    'Every Skill dose remains blocked until the applicable current standard and substance identity are established.',
    'Raw emergency treatment and home antidote instructions are retained for audit only and are not product-eligible.',
  ],
  rows,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.counts, null, 2));
