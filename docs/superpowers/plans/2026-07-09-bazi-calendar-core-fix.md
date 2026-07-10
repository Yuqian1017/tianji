# BaZi Calendar Core Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Tianji's handwritten BaZi calendar boundaries with the existing mature calendar library, fix January Dayun, and add date-aware equation-of-time correction.

**Architecture:** A focused `calendar.js` adapter owns exact Four Pillars and Yun conversion through `lunar-javascript`. The existing `engine.js` keeps interpretation and output assembly, while `cities.js` owns date-aware solar-time correction. Node's built-in test runner provides regression coverage without a new dependency.

**Tech Stack:** JavaScript ES modules, `lunar-javascript@1.7.7`, Node `node:test`, React/Vite.

---

### Task 1: Establish failing BaZi calendar regressions

**Files:**
- Create: `test/bazi/calendar.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add `test:bazi` using Node's built-in test runner**

```json
"test:bazi": "node --test test/bazi/*.test.mjs"
```

- [ ] **Step 2: Write fixtures for the historical base, 1999 month boundary, 2026 Lichun, January Dayun, and TZ-independent day pillar**

```js
test('uses the actual 1999 Corn on Ear boundary', () => {
  assert.deepEqual(pillarStrings(paiBazi(1999, 6, 7, 9, 11, 'male')), [
    '己卯', '庚午', '庚寅', '辛巳',
  ]);
});

test('does not enter the 2026 Lichun pillars ten minutes early', () => {
  assert.deepEqual(pillarStrings(paiBazi(2026, 2, 4, 3, 53, 'male')).slice(0, 2), [
    '乙巳', '己丑',
  ]);
});

test('finds January Dayun on both sides of the birth time', () => {
  assert.equal(paiBazi(2025, 1, 1, 12, 0, 'male').dayun[0].startAge, 1);
  assert.equal(paiBazi(2025, 1, 1, 12, 0, 'female').dayun[0].startAge, 9);
});
```

- [ ] **Step 3: Run RED**

Run: `npm run test:bazi`

Expected: failures show 己巳 instead of 庚午, early 2026 Lichun switching, and 11/1 instead of 1/9 Dayun.

- [ ] **Step 4: Commit the failing tests**

```bash
git add package.json test/bazi/calendar.test.mjs
git commit -m "test: capture bazi calendar regressions"
```

### Task 2: Replace handwritten BaZi calendar runtime

**Files:**
- Create: `src/modules/bazi/calendar.js`
- Modify: `src/modules/bazi/engine.js`
- Test: `test/bazi/calendar.test.mjs`

- [ ] **Step 1: Implement an exact calendar adapter**

```js
import { Solar } from 'lunar-javascript';

export function createBaziCalendar(year, month, day, hour, minute = 0) {
  const eightChar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
    .getLunar()
    .getEightChar();
  eightChar.setSect(1);
  const toPillar = (ganZhi) => ({ stem: ganZhi[0], branch: ganZhi[1] });
  return {
    eightChar,
    pillars: {
      year: toPillar(eightChar.getYear()),
      month: toPillar(eightChar.getMonth()),
      day: toPillar(eightChar.getDay()),
      hour: toPillar(eightChar.getTime()),
    },
  };
}
```

- [ ] **Step 2: Make `paiBazi`, `getMonthIndex`, and `getDayPillar` consume the adapter**

Remove runtime imports of `JIEQI_PRECISE` and `approxJieqiDate`. Preserve public return fields and set `isApprox: false`.

- [ ] **Step 3: Build Dayun from `eightChar.getYun()`**

Store `years`, `months`, `days`, `solarDate`, and `roundedAge`; generate eight GanZhi steps from `getDaYun().slice(1, 9)`.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:bazi`

Expected: all calendar and Dayun regressions pass.

- [ ] **Step 5: Commit**

```bash
git add src/modules/bazi/calendar.js src/modules/bazi/engine.js test/bazi/calendar.test.mjs
git commit -m "fix: replace bazi handwritten calendar core"
```

### Task 3: Add date-aware equation of time

**Files:**
- Modify: `src/lib/cities.js`
- Modify: `src/modules/bazi/BaziModule.jsx`
- Modify: `src/modules/bazihealth/BaziHealthModule.jsx`
- Modify: `src/modules/ziwei/ZiweiModule.jsx`
- Modify: `src/modules/qimen/QimenModule.jsx`
- Create: `test/bazi/solar-time.test.mjs`

- [ ] **Step 1: Write NOAA formula tests**

Test `calcEquationOfTime` against fixed dates, verify longitude plus equation-of-time offset, and verify `adjustBirthTime` crossing the previous date.

- [ ] **Step 2: Run RED**

Run: `node --test test/bazi/solar-time.test.mjs`

Expected: failure because `calcEquationOfTime` and date-aware offset do not exist.

- [ ] **Step 3: Implement date-aware offset**

```js
export function calcTrueSolarTimeOffset(longitude, standardMeridian = 120, dateParts) {
  const equationOfTime = dateParts ? calcEquationOfTime(dateParts) : 0;
  return Math.round((standardMeridian - longitude) * 4 - equationOfTime);
}
```

- [ ] **Step 4: Pass dates from every runtime call site and label the display `真太阳时（标准时口径）`**

Keep the old no-date API only as a compatibility fallback; no current UI path may call it without date parts.

- [ ] **Step 5: Run GREEN and build**

Run: `npm run test:bazi && npm run build`

Expected: tests pass and Vite build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/cities.js src/modules/bazi src/modules/bazihealth src/modules/ziwei src/modules/qimen test/bazi/solar-time.test.mjs
git commit -m "fix: include equation of time in solar correction"
```

### Task 4: Post-fix audit and evidence closeout

**Files:**
- Modify: `scripts/validation/audit-bazi-current.mjs`
- Rename: `docs/validation/artifacts/bazi-audit-2026-07-09.json` to `docs/validation/artifacts/bazi-audit-2026-07-09-before-fix.json`
- Create: `docs/validation/artifacts/bazi-audit-2026-07-09-after-fix.json`
- Modify: `docs/BAZI_VALIDATION_REPORT_2026-07-09.md`
- Modify: `docs/DATABASE_VALIDATION_LEDGER.md`
- Modify: `docs/meta/TIANJI_TASK_SUPERVISOR_STATE.json`
- Modify: `docs/meta/TIANJI_TASK_SUPERVISOR.html`
- Modify: `docs/meta/TIANJI_PROJECT_ROADMAP.md`

- [ ] **Step 1: Preserve the before-fix artifact and retarget the audit script**

The post-fix script must audit current runtime behavior; legacy handwritten table statistics stay only in the before-fix artifact/report.

- [ ] **Step 2: Run the post-fix audit**

Run: `node scripts/validation/audit-bazi-current.mjs`

Expected: 30-case Four Pillars and Dayun mismatches are zero under the fixed policy.

- [ ] **Step 3: Run all verification**

```bash
npm run test:bazi
npx eslint src/modules/bazi/calendar.js src/modules/bazi/engine.js src/lib/cities.js scripts/validation/audit-bazi-current.mjs test/bazi/*.test.mjs
npm run build
npm run validate:supervisor
git diff --check
```

- [ ] **Step 4: Update evidence without erasing residual gates**

Mark BZ-F01/BZ-F02 remediated only after same-path tests pass. Keep strength/YongShen, branch-relation provenance and global historical timezone/DST as active validation items.

- [ ] **Step 5: Request fresh code review and address Critical/Important findings**

- [ ] **Step 6: Commit**

```bash
git add docs scripts/validation
git commit -m "docs: record bazi remediation evidence"
```
