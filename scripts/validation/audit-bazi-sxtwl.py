"""Cross-check the BaZi runtime with the independent sxtwl calendar engine."""

from __future__ import annotations

import json
import hashlib
import calendar as civil_calendar
import statistics
import subprocess
import sys
from datetime import datetime, timedelta
from importlib.metadata import version
from pathlib import Path

import sxtwl


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PRIMARY_ARTIFACT = (
    PROJECT_ROOT
    / "docs/validation/artifacts/bazi-audit-2026-07-09-after-fix.json"
)
PRIMARY_AUDIT_SCRIPT = PROJECT_ROOT / "scripts/validation/audit-bazi-current.mjs"
OUTPUT_PATH = (
    PROJECT_ROOT
    / "docs/validation/artifacts/bazi-audit-2026-07-09-sxtwl.json"
)

STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
SOLAR_TERM_NAMES = [
    "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰",
    "春分", "清明", "谷雨", "立夏", "小满", "芒种",
    "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
    "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
]
JIA_ZI = [
    STEMS[index % 10] + BRANCHES[index % 12]
    for index in range(60)
]


def ganzhi(value: object) -> str:
    return STEMS[value.tg] + BRANCHES[value.dz]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def git_output(*args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=PROJECT_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout.strip()


def refresh_primary_artifact() -> dict[str, object]:
    subprocess.run(
        ["node", str(PRIMARY_AUDIT_SCRIPT)],
        cwd=PROJECT_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    source_paths = [
        PROJECT_ROOT / "src/modules/bazi/calendar.js",
        PROJECT_ROOT / "src/modules/bazi/engine.js",
        PROJECT_ROOT / "src/lib/cities.js",
        PRIMARY_AUDIT_SCRIPT,
        Path(__file__).resolve(),
    ]
    dirty_files = git_output("status", "--short").splitlines()
    return {
        "primaryAuditCommand": "node scripts/validation/audit-bazi-current.mjs",
        "gitCommit": git_output("rev-parse", "HEAD"),
        "workingTreeDirty": bool(dirty_files),
        "dirtyFiles": dirty_files,
        "sourceSha256": {
            str(path.relative_to(PROJECT_ROOT)): sha256(path)
            for path in source_paths
        },
        "primaryArtifactSha256": sha256(PRIMARY_ARTIFACT),
    }


def term_datetime(day: object) -> datetime:
    value = sxtwl.JD2DD(day.getJieQiJD())
    base = datetime(
        int(value.Y),
        int(value.M),
        int(value.D),
        int(value.h),
        int(value.m),
    )
    return base + timedelta(seconds=round(value.s))


def sxtwl_pillars(parts: list[int]) -> tuple[list[str], dict[str, object]]:
    year, month, day_number, hour, minute = parts
    day = sxtwl.fromSolar(year, month, day_number)
    year_month_day = day
    boundary = None

    if day.hasJieQi() and day.getJieQi() % 2 == 1:
        boundary = term_datetime(day)
        input_time = datetime(year, month, day_number, hour, minute)
        if input_time < boundary:
            year_month_day = day.before(1)

    day_pillar_day = day.after(1) if hour == 23 else day
    pillars = [
        ganzhi(year_month_day.getYearGZ()),
        ganzhi(year_month_day.getMonthGZ()),
        ganzhi(day_pillar_day.getDayGZ()),
        ganzhi(day.getHourGZ(hour, True)),
    ]
    policy = {
        "jieBoundary": boundary.isoformat(sep=" ") if boundary else None,
        "usedPreviousDayForYearMonth": year_month_day is not day,
        "ziHourUsesNextDayStem": hour == 23,
    }
    return pillars, policy


def collect_jie_boundaries(start_year: int, end_year: int) -> dict[tuple[int, str], datetime]:
    result = {}
    for year in range(start_year, end_year + 1):
        day = sxtwl.fromSolar(year, 1, 1)
        while day.getSolarYear() == year:
            if day.hasJieQi() and day.getJieQi() % 2 == 1:
                name = SOLAR_TERM_NAMES[day.getJieQi()]
                result[(year, name)] = term_datetime(day)
            day = day.after(1)
    return result


def shichen_ordinal(value: datetime) -> int:
    if value.hour == 23:
        return 11
    if value.hour == 0:
        return 0
    return (value.hour + 1) // 2


def traditional_shichen_interval(start: datetime, end: datetime) -> dict[str, int]:
    day_difference = (end.date() - start.date()).days
    shichen_difference = shichen_ordinal(end) - shichen_ordinal(start)
    if shichen_difference < 0:
        shichen_difference += 12
        day_difference -= 1

    converted_days = day_difference * 120 + shichen_difference * 10
    return {
        "years": converted_days // 360,
        "months": (converted_days % 360) // 30,
        "days": converted_days % 30,
        "sourceDayDifference": day_difference,
        "sourceShichenDifference": shichen_difference,
    }


def add_calendar_interval(
    value: datetime,
    years: int,
    months: int,
    days: int,
) -> datetime:
    target_year = value.year + years
    target_day = min(
        value.day,
        civil_calendar.monthrange(target_year, value.month)[1],
    )
    result = value.replace(year=target_year, day=target_day)

    month_offset = result.month - 1 + months
    target_year = result.year + month_offset // 12
    target_month = month_offset % 12 + 1
    target_day = min(
        result.day,
        civil_calendar.monthrange(target_year, target_month)[1],
    )
    result = result.replace(
        year=target_year,
        month=target_month,
        day=target_day,
    )
    return result + timedelta(days=days)


def compare_dayun(primary: dict[str, object]) -> dict[str, object]:
    jie_boundaries = sorted(
        (timestamp, name)
        for (_, name), timestamp in collect_jie_boundaries(1919, 2028).items()
    )
    rows = []

    for case in primary["results"]:
        birth = datetime(*case["effectiveInput"])
        secondary_pillars, _ = sxtwl_pillars(case["effectiveInput"])
        year_stem = secondary_pillars[0][0]
        year_is_yang = STEMS.index(year_stem) % 2 == 0
        forward = (
            (year_is_yang and case["gender"] == "male")
            or (not year_is_yang and case["gender"] == "female")
        )

        if forward:
            target_time, target_name = next(
                item for item in jie_boundaries if item[0] > birth
            )
            interval = traditional_shichen_interval(birth, target_time)
        else:
            target_time, target_name = next(
                item for item in reversed(jie_boundaries) if item[0] <= birth
            )
            interval = traditional_shichen_interval(target_time, birth)

        years = interval["years"]
        months = interval["months"]
        days = interval["days"]
        month_pillar_index = JIA_ZI.index(secondary_pillars[1])
        first_pillar = JIA_ZI[
            (month_pillar_index + (1 if forward else -1)) % 60
        ]
        runtime_dayun = case["current"]["dayun"]
        runtime_first_index = JIA_ZI.index(runtime_dayun["firstPillar"])
        if runtime_first_index == (month_pillar_index + 1) % 60:
            runtime_direction = "forward"
        elif runtime_first_index == (month_pillar_index - 1) % 60:
            runtime_direction = "reverse"
        else:
            runtime_direction = "invalid_first_pillar_step"
        rounded_age = max(1, int(years + months / 12 + days / 360 + 0.5))
        calculated = {
            "direction": "forward" if forward else "reverse",
            "exactStart": {
                "years": years,
                "months": months,
                "days": days,
                "solarDate": add_calendar_interval(
                    birth,
                    years,
                    months,
                    days,
                ).date().isoformat(),
            },
            "roundedStartAge": rounded_age,
            "firstPillar": first_pillar,
        }
        runtime = {
            "direction": runtime_direction,
            **runtime_dayun,
        }
        mismatches = [
            field
            for field in (
                "direction",
                "exactStart",
                "roundedStartAge",
                "firstPillar",
            )
            if runtime[field] != calculated[field]
        ]
        rows.append(
            {
                "id": case["id"],
                "input": case["effectiveInput"],
                "gender": case["gender"],
                "forward": forward,
                "targetJie": target_name,
                "targetJieTime": target_time.isoformat(sep=" "),
                "sourceDayDifference": interval["sourceDayDifference"],
                "sourceShichenDifference": interval["sourceShichenDifference"],
                "runtime": runtime,
                "manualSxtwl": calculated,
                "mismatches": mismatches,
            }
        )

    return {
        "summary": {
            "cases": len(rows),
            "matchingCases": sum(not row["mismatches"] for row in rows),
            "mismatchCases": sum(bool(row["mismatches"]) for row in rows),
            "policy": "year-stem gender direction; nearest Jie; 3 source days = 1 year; 1 shichen = 10 days",
            "precision": "traditional_shichen",
        },
        "results": rows,
    }


def compare_pillars(primary: dict[str, object]) -> dict[str, object]:
    rows = []
    for case in primary["results"]:
        secondary, policy = sxtwl_pillars(case["effectiveInput"])
        runtime = case["current"]["pillars"]
        mismatches = [
            {
                "pillar": name,
                "runtime": runtime[index],
                "sxtwl": secondary[index],
            }
            for index, name in enumerate(("year", "month", "day", "hour"))
            if runtime[index] != secondary[index]
        ]
        rows.append(
            {
                "id": case["id"],
                "input": case["effectiveInput"],
                "runtime": runtime,
                "sxtwl": secondary,
                "policy": policy,
                "mismatches": mismatches,
            }
        )
    return {
        "summary": {
            "cases": len(rows),
            "matchingCases": sum(not row["mismatches"] for row in rows),
            "mismatchCases": sum(bool(row["mismatches"]) for row in rows),
        },
        "results": rows,
    }


def compare_boundaries(primary: dict[str, object]) -> dict[str, object]:
    boundaries = collect_jie_boundaries(1920, 2027)
    rows = []
    for item in primary["boundaryAdapterAudit"]["results"]:
        key = (item["year"], item["jie"])
        secondary = boundaries.get(key)
        primary_time = datetime(*item["exact"])
        if secondary is None:
            rows.append(
                {
                    "year": item["year"],
                    "jie": item["jie"],
                    "primary": primary_time.isoformat(sep=" "),
                    "sxtwl": None,
                    "differenceSeconds": None,
                }
            )
            continue
        difference = (primary_time - secondary).total_seconds()
        rows.append(
            {
                "year": item["year"],
                "jie": item["jie"],
                "primary": primary_time.isoformat(sep=" "),
                "sxtwl": secondary.isoformat(sep=" "),
                "differenceSeconds": difference,
            }
        )

    differences = [
        abs(row["differenceSeconds"])
        for row in rows
        if row["differenceSeconds"] is not None
    ]
    return {
        "summary": {
            "boundaries": len(rows),
            "missingInSxtwl": sum(row["sxtwl"] is None for row in rows),
            "within30Seconds": sum(value <= 30 for value in differences),
            "over60Seconds": sum(value > 60 for value in differences),
            "maximumAbsoluteDifferenceSeconds": max(differences),
            "medianAbsoluteDifferenceSeconds": statistics.median(differences),
            "meanAbsoluteDifferenceSeconds": statistics.mean(differences),
        },
        "results": rows,
    }


def main() -> int:
    runtime_provenance = refresh_primary_artifact()
    primary = json.loads(PRIMARY_ARTIFACT.read_text(encoding="utf-8"))
    pillars = compare_pillars(primary)
    boundaries = compare_boundaries(primary)
    dayun = compare_dayun(primary)
    report = {
        "auditDate": "2026-07-09",
        "stage": "secondary_independent_cross_check",
        "source": {
            "name": "sxtwl",
            "version": version("sxtwl"),
            "implementation": "C++ port of Shou Xing astronomical calendar",
            "repository": "https://github.com/yuangu/sxtwl_cpp",
            "license": "BSD-3-Clause",
        },
        "runtimeProvenance": runtime_provenance,
        "scope": {
            "pillars": "30 stratified runtime cases, including minute-level Jie handling and Sect 1 Zi hour",
            "jieBoundaries": "All 1,296 minor solar terms from 1920 through 2027",
            "dayun": "30 stratified cases independently derived from sxtwl Jie timestamps and the traditional shichen conversion rule",
            "excluded": "Interpretive strength, YongShen, Shensha, and luck-quality judgments",
        },
        "pillars": pillars,
        "jieBoundaries": boundaries,
        "dayun": dayun,
        "officialAnchors": {
            "1999CornOnEar": "sxtwl: 1999-06-06 11:09:07; HKO calendar date: 1999-06-06",
            "2026SpringCommences": "sxtwl: 2026-02-04 04:01:51; HKO rounded minute: 04:02",
            "dayunRule": "Yuan Hai Zi Ping and San Ming Tong Hui: forward/reverse to the nearest Jie, 3 days per year, with elapsed shichen used for the remainder",
        },
        "referenceTexts": {
            "yuanHaiZiPing": "https://www.shidianguji.com/book/NGJ892411999032112149610/chapter/1lqsbrapj4372",
            "sanMingTongHui": "https://www.shidianguji.com/book/SK1610/chapter/1kf5v6ol1vhnp",
        },
        "limitations": [
            "Agreement between two implementations is strong cross-check evidence, not a mathematical proof.",
            "sxtwl exposes day-level pillars, so minute-level Jie selection is reconstructed from its own astronomical JieQi timestamp.",
            "This audit validates deterministic calendar pillars and Jie timestamps, not interpretive BaZi rules.",
            "sxtwl does not expose Dayun; this audit independently implements only the declared traditional shichen rule on top of sxtwl Jie timestamps.",
            "Dayun V3 evidence is limited to the 30 stratified cases and does not validate interpretive claims about whether a luck period is auspicious.",
        ],
    }
    OUTPUT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "pillars": pillars["summary"],
        "jieBoundaries": boundaries["summary"],
        "dayun": dayun["summary"],
        "output": str(OUTPUT_PATH),
    }, ensure_ascii=False, indent=2))

    passed = (
        pillars["summary"]["mismatchCases"] == 0
        and boundaries["summary"]["missingInSxtwl"] == 0
        and boundaries["summary"]["over60Seconds"] == 0
        and dayun["summary"]["mismatchCases"] == 0
    )
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
