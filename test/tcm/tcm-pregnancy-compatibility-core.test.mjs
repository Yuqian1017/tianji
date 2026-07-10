import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-pregnancy-compatibility-formula-candidates.json';
const SAFETY_PATH = 'database/tcm/skill-v3/references/安全-配伍妊娠禁忌与毒性药.md';
const CHP2020_PATH = 'database/tcm/sources/chp2020-tcm-pregnancy-compatibility.json';
const CHP2025_PATH = 'database/tcm/sources/chp2025-tcm-pregnancy-compatibility-index.json';
const REGULATORY_PATH = 'database/tcm/sources/aristolochic-regulatory-2003-2004.json';

const EXPECTED_COUNTS = {
  pregnancyTableRows: 3,
  pregnancyTableItems: 35,
  dosePregnancyClaimRows: 54,
  pregnancyOfficial2020Conflicts: 13,
  pregnancyCurrentIdentityGaps: 15,
  pregnancyOfficial2020Silences: 16,
  eighteenSourceRows: 3,
  eighteenExpandedPairs: 50,
  eighteenSupplementPairs: 2,
  unsupportedNameClassExtensions: 2,
  eighteenPairsSupportedByOfficial2020: 52,
  nineteenSourceRows: 9,
  nineteenExpandedPairs: 10,
  nineteenPairsSupportedByOfficial2020: 7,
  formulaWarningRows: 31,
  formulaNames: 37,
  formulaHomeTreatmentRows: 2,
  skillAristolochicNames: 6,
  regulatoryAristolochicNames: 7,
};

const EXPECTED_CONFLICT_SOURCE_NAMES = [
  '蟾酥', '木鳖子', '硫黄', '常山',
  '附子(温里)', '桃仁(活血)', '益母草(活血)', '天南星(化痰)',
  '洋金花(止咳)', '全蝎(息风)', '硫黄(攻毒)', '蟾酥(攻毒)', '木鳖子(攻毒)',
];

async function json(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function pregnancyRecords(core) {
  return [...core.pregnancy.tableItems, ...core.pregnancy.doseTableClaims];
}

test('pins all source snapshots and preserves the complete normalized domain', async () => {
  const [core, safetyText, chp2020Text, chp2025Text, regulatoryText] = await Promise.all([
    json(CORE_PATH),
    readFile(SAFETY_PATH, 'utf8'),
    readFile(CHP2020_PATH, 'utf8'),
    readFile(CHP2025_PATH, 'utf8'),
    readFile(REGULATORY_PATH, 'utf8'),
  ]);

  assert.equal(core.schemaVersion, 1);
  assert.equal(core.status, 'normalized_candidate_full_source_domain_blocked');
  assert.deepEqual(core.counts, EXPECTED_COUNTS);
  assert.equal(core.sourceRefs.skillSafetyReference.sha256, sha256(safetyText));
  assert.equal(core.sourceRefs.chp2020Digital.sha256, sha256(chp2020Text));
  assert.equal(core.sourceRefs.chp2025Catalog.sha256, sha256(chp2025Text));
  assert.equal(core.sourceRefs.aristolochicRegulation.sha256, sha256(regulatoryText));
});

test('keeps every pregnancy source claim blocked and exposes all 13 historical classification conflicts', async () => {
  const core = await json(CORE_PATH);
  const records = pregnancyRecords(core);
  const conflicts = records.filter(item => (
    item.aggregateStatus === 'contains_official_2020_classification_conflict'
  ));

  assert.equal(records.length, 89);
  assert.deepEqual(conflicts.map(item => item.sourceItem ?? item.sourceName), EXPECTED_CONFLICT_SOURCE_NAMES);
  assert.deepEqual(
    [...new Set(conflicts.flatMap(item => item.comparisons.map(comparison => comparison.name)))],
    ['蟾酥', '木鳖子', '硫黄', '常山', '附子', '桃仁', '益母草', '天南星', '洋金花', '全蝎'],
  );
  assert.ok(records.every(item => item.productEligibility === 'blocked'));
  assert.ok(records.every(item => item.runtimeEligibleFields.length === 0));
  assert.ok(records.every(item => (
    item.current2025PregnancyValidation === 'blocked_monograph_text_not_available_in_project'
  )));
});

test('separates 2020-supported compatibility pairs from unsupported traditional candidates', async () => {
  const core = await json(CORE_PATH);
  const supportedEighteen = [
    ...core.compatibility.eighteenPairs,
    ...core.compatibility.supplements,
  ];
  assert.equal(supportedEighteen.length, 52);
  assert.ok(supportedEighteen.every(pair => pair.official2020AttentionEvidence.length > 0));
  assert.ok(supportedEighteen.every(pair => pair.productEligibility === 'blocked'));

  assert.equal(core.compatibility.unsupportedNameClassExtensions.length, 2);
  assert.ok(core.compatibility.unsupportedNameClassExtensions.every(pair => (
    pair.official2020AttentionEvidence.length === 0
  )));
  assert.deepEqual(
    core.compatibility.nineteenPairs
      .filter(pair => pair.official2020AttentionEvidence.length === 0)
      .map(pair => [pair.leftName, pair.rightName]),
    [['水银', '砒霜'], ['川乌', '犀角'], ['草乌', '犀角']],
  );
  assert.ok(core.compatibility.nineteenPairs.every(pair => pair.productEligibility === 'blocked'));
  assert.ok([
    ...core.compatibility.eighteenPairs,
    ...core.compatibility.supplements,
    ...core.compatibility.unsupportedNameClassExtensions,
    ...core.compatibility.nineteenPairs,
  ].every(pair => pair.runtimeEligibleFields.length === 0));
});

test('records the aristolochic regulatory scope errors without widening historical notices', async () => {
  const core = await json(CORE_PATH);
  const candidates = core.aristolochicAcid.regulatoryCandidates;
  assert.equal(candidates.length, 7);
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
  assert.ok(candidates.every(item => item.runtimeEligibleFields.length === 0));
  assert.ok(candidates.every(item => item.pharmacopoeia.current2025.titleInCatalog === false));

  const zhushalian = candidates.find(item => item.name === '朱砂莲');
  assert.equal(zhushalian.presentInSkillSixNameList, false);
  assert.equal(zhushalian.historicalRegulation.noticeId, 'CN-SFDA-2004-379');

  const guangfangji = candidates.find(item => item.name === '广防己');
  assert.equal(guangfangji.historicalRegulation.statusAtNotice, 'medicinal_standard_cancelled');
  assert.equal(guangfangji.historicalRegulation.replacementSpecifiedByNotice, '防己（粉防己）');
  assert.deepEqual(
    core.aristolochicAcid.findings.map(finding => finding.id),
    ['TCM-AA-001', 'TCM-AA-002', 'TCM-AA-003'],
  );
});

test('preserves all 31 formula warning rows while blocking home-treatment instructions', async () => {
  const core = await json(CORE_PATH);
  assert.equal(core.formulaWarnings.length, 31);
  assert.equal(core.formulaWarnings.flatMap(row => row.formulaNames).length, 37);
  assert.deepEqual(
    core.formulaWarnings.filter(row => row.containsHomeTreatmentInstruction).map(row => row.sourceFormulaCell),
    ['瓜蒂散', '三圣散'],
  );
  assert.ok(core.formulaWarnings.every(row => row.productEligibility === 'blocked'));
  assert.ok(core.formulaWarnings.every(row => row.runtimeEligibleFields.length === 0));
});

test('the current source tree does not import or consume the blocked candidate core', async () => {
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.ok(files.includes('src/lib/cities.runtime.json'));
  assert.ok(files.includes('server/index.js'));
  assert.ok(files.includes('index.html'));
  assert.ok(files.includes('vite.config.js'));
  assert.ok(files.includes('package.json'));
  assert.doesNotMatch(text, /tcm-pregnancy-compatibility-formula-candidates/);
  assert.doesNotMatch(text, /TCM-AA-00[123]/);
});
