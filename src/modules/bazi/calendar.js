import { Solar } from 'lunar-javascript';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const MONTH_BRANCHES = '寅卯辰巳午未申酉戌亥子丑';
const JIE_BY_MONTH_BRANCH = {
  寅: '立春',
  卯: '惊蛰',
  辰: '清明',
  巳: '立夏',
  午: '芒种',
  未: '小暑',
  申: '立秋',
  酉: '白露',
  戌: '寒露',
  亥: '立冬',
  子: '大雪',
  丑: '小寒',
};

export const BAZI_CALENDAR_ENGINE = {
  name: 'lunar-javascript',
  version: '1.7.7',
  dayBoundarySect: 1,
  yunCalculationSect: 1,
  yunPrecision: 'traditional_shichen',
};

function toPillar(ganZhi) {
  return { stem: ganZhi[0], branch: ganZhi[1] };
}

function ganzhiForYear(year) {
  return STEMS[((year - 4) % 10 + 10) % 10]
    + BRANCHES[((year - 4) % 12 + 12) % 12];
}

export function createBaziCalendar(year, month, day, hour, minute = 0) {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(BAZI_CALENDAR_ENGINE.dayBoundarySect);

  const pillars = {
    year: toPillar(eightChar.getYear()),
    month: toPillar(eightChar.getMonth()),
    day: toPillar(eightChar.getDay()),
    hour: toPillar(eightChar.getTime()),
  };
  const yearGanZhi = pillars.year.stem + pillars.year.branch;

  return {
    solar,
    lunar,
    eightChar,
    pillars,
    adjustedYear: yearGanZhi === ganzhiForYear(year) ? year : year - 1,
    monthIdx: MONTH_BRANCHES.indexOf(pillars.month.branch),
    jieqiName: JIE_BY_MONTH_BRANCH[pillars.month.branch],
    isApprox: false,
  };
}

export function createDayun(eightChar, gender) {
  const yun = eightChar.getYun(
    gender === 'male' ? 1 : 0,
    BAZI_CALENDAR_ENGINE.yunCalculationSect,
  );
  const years = yun.getStartYear();
  const months = yun.getStartMonth();
  const days = yun.getStartDay();
  const roundedAge = Math.max(
    1,
    Math.round(years + months / 12 + days / 360),
  );
  const dayunStart = {
    years,
    months,
    days,
    solarDate: yun.getStartSolar().toYmd(),
    roundedAge,
    calculationSect: BAZI_CALENDAR_ENGINE.yunCalculationSect,
    precision: BAZI_CALENDAR_ENGINE.yunPrecision,
  };
  const dayun = yun.getDaYun().slice(1, 9).map((item, index) => {
    const ganZhi = item.getGanZhi();
    return {
      ...toPillar(ganZhi),
      startAge: roundedAge + index * 10,
      endAge: roundedAge + (index + 1) * 10 - 1,
    };
  });

  return { dayunStart, dayun };
}
