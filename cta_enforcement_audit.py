"""
CTA Fare Enforcement ROI Audit
PolicyTorque LLC

Pulls CPD Administrative Notice of Violation (ANOV) data from the
Chicago Data Portal, filters for transit-related violations, and
profiles citation volume, demographics, and disposition outcomes.

Requirements:
    pip install requests pandas tabulate

Usage:
    python cta_enforcement_audit.py

Data source:
    Chicago Data Portal - CPD ANOV dataset (consent decree, Paragraph 79/80)
    Dataset: https://data.cityofchicago.org/Public-Safety/
             Administrative-Notice-of-Violation-ANOV-/r2u4-wwk3
"""

import requests
import pandas as pd
import json
from datetime import datetime
from tabulate import tabulate

# ── Config ────────────────────────────────────────────────────────────────────

BASE_URL = "https://data.cityofchicago.org/resource/r2u4-wwk3.json"

# Socrata app token - optional but raises rate limits.
# Register free at https://data.cityofchicago.org/profile/app_tokens
APP_TOKEN = ""

# Transit-related Chicago Municipal Code sections.
# 9-80 covers CTA fare evasion and transit ordinances.
# Expand this list after inspecting raw violation_description values below.
TRANSIT_CODES = [
    "9-80",     # CTA fare evasion / transit regulations
    "36-008",   # Riding CTA without paying
    "36-009",   # Unauthorized use of transit
]

# ── Fetch ─────────────────────────────────────────────────────────────────────

def fetch_anov(limit=50000, offset=0):
    """Pull ANOV records from Socrata API."""
    headers = {}
    if APP_TOKEN:
        headers["X-App-Token"] = APP_TOKEN

    params = {
        "$limit": limit,
        "$offset": offset,
        "$order": "violation_date DESC",
    }

    resp = requests.get(BASE_URL, headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def fetch_all_pages():
    """Paginate through full dataset."""
    all_records = []
    offset = 0
    page_size = 10000

    print("Fetching ANOV data from Chicago Data Portal...")
    while True:
        batch = fetch_anov(limit=page_size, offset=offset)
        if not batch:
            break
        all_records.extend(batch)
        print(f"  Fetched {len(all_records):,} records...", end="\r")
        if len(batch) < page_size:
            break
        offset += page_size

    print(f"\nTotal records fetched: {len(all_records):,}")
    return all_records


# ── Schema inspection ─────────────────────────────────────────────────────────

def inspect_schema(df):
    """Print column names and unique violation descriptions for transit filter tuning."""
    print("\n── Schema ─────────────────────────────────────────────────────────")
    print("Columns:", list(df.columns))

    if "violation_description" in df.columns:
        print("\n── All Unique Violation Descriptions ──────────────────────────────")
        for desc in sorted(df["violation_description"].dropna().unique()):
            print(" ", desc)

    if "statute" in df.columns or "violation_code" in df.columns:
        col = "violation_code" if "violation_code" in df.columns else "statute"
        print(f"\n── Top 30 {col} values ────────────────────────────────────────")
        print(df[col].value_counts().head(30).to_string())


# ── Filter ────────────────────────────────────────────────────────────────────

def filter_transit(df):
    """
    Filter to transit-related ANOVs.
    Searches violation_description and violation_code/statute for transit keywords.
    Update TRANSIT_CODES and keywords after running inspect_schema().
    """
    transit_keywords = [
        "transit", "fare", "cta", "rail", "bus", "ventra",
        "riding", "9-80", "36-008", "36-009"
    ]

    mask = pd.Series(False, index=df.index)

    for col in ["violation_description", "violation_code", "statute"]:
        if col in df.columns:
            col_lower = df[col].astype(str).str.lower()
            for kw in transit_keywords:
                mask |= col_lower.str.contains(kw, na=False)

    transit_df = df[mask].copy()
    print(f"\nTransit-related ANOVs: {len(transit_df):,} of {len(df):,} total")
    return transit_df


# ── Analysis ──────────────────────────────────────────────────────────────────

def analyze_demographics(df):
    """Profile racial distribution of transit citations."""
    print("\n── Demographic Profile of Transit Citations ───────────────────────")

    race_col = next((c for c in df.columns if "race" in c.lower()), None)
    if not race_col:
        print("  No race column found - check schema output above.")
        return

    counts = df[race_col].value_counts(dropna=False)
    pct = (counts / counts.sum() * 100).round(1)
    table = pd.DataFrame({"Count": counts, "Pct": pct})
    print(tabulate(table, headers=["Race/Ethnicity", "Count", "%"], tablefmt="simple"))


def analyze_dispositions(df):
    """Profile citation outcomes - this is where collection rate lives."""
    print("\n── Citation Disposition (Outcome) Profile ─────────────────────────")

    disp_col = next((c for c in df.columns
                     if any(x in c.lower() for x in ["disposition", "finding", "status", "outcome"])),
                    None)
    if not disp_col:
        print("  No disposition column found - check schema output above.")
        return

    counts = df[disp_col].value_counts(dropna=False)
    pct = (counts / counts.sum() * 100).round(1)
    table = pd.DataFrame({"Count": counts, "Pct": pct})
    print(tabulate(table, headers=["Disposition", "Count", "%"], tablefmt="simple"))

    # Collection proxy: "Liable" or "Found Guilty" = fine assessed
    liable_keywords = ["liable", "guilty", "violation"]
    dismissed_keywords = ["dismiss", "not guilty", "not liable", "no violation"]

    liable = counts[counts.index.astype(str).str.lower().str.contains(
        "|".join(liable_keywords), na=False)].sum()
    dismissed = counts[counts.index.astype(str).str.lower().str.contains(
        "|".join(dismissed_keywords), na=False)].sum()
    total = counts.sum()

    print(f"\n  Proxy collection rate (liable / total): "
          f"{liable:,} / {total:,} = {liable/total*100:.1f}%")
    print(f"  Proxy dismissal rate: "
          f"{dismissed:,} / {total:,} = {dismissed/total*100:.1f}%")
    print("\n  NOTE: 'Liable' means a fine was assessed, not collected.")
    print("  Actual cash recovery requires DOAH payment records via FOIA.")


def analyze_trend(df):
    """Year-over-year citation volume - tests consistency argument."""
    print("\n── Annual Citation Volume (Consistency Test) ──────────────────────")

    date_col = next((c for c in df.columns if "date" in c.lower()), None)
    if not date_col:
        print("  No date column found.")
        return

    df["year"] = pd.to_datetime(df[date_col], errors="coerce").dt.year
    yearly = df.groupby("year").size().reset_index(name="citations")
    yearly = yearly.dropna().sort_values("year")

    print(tabulate(yearly, headers=["Year", "Citations"], tablefmt="simple",
                   showindex=False))

    # Flag inconsistency: >25% swing year over year
    yearly["pct_change"] = yearly["citations"].pct_change() * 100
    swings = yearly[yearly["pct_change"].abs() > 25].dropna()
    if not swings.empty:
        print("\n  ⚠ Years with >25% volume swing (inconsistency signal):")
        print(tabulate(swings[["year", "citations", "pct_change"]],
                       headers=["Year", "Citations", "% Change"],
                       tablefmt="simple", showindex=False, floatfmt=".1f"))


def analyze_geography(df):
    """Identify top enforcement stations/beats for spatial pattern."""
    print("\n── Top Enforcement Locations ──────────────────────────────────────")

    location_col = next((c for c in df.columns
                         if any(x in c.lower() for x in
                                ["beat", "district", "location", "address", "block"])),
                        None)
    if not location_col:
        print("  No location column found.")
        return

    top = df[location_col].value_counts().head(20)
    print(tabulate(top.reset_index(),
                   headers=[location_col, "Citations"],
                   tablefmt="simple", showindex=False))


# ── ROI stub ──────────────────────────────────────────────────────────────────

def roi_stub(df):
    """
    ROI calculation with sensitivity table.
    Populate cost inputs from FOIA responses.
    Fine amount per citation is a Chicago Municipal Code value.

    Sensitivity table runs three collection rate scenarios (conservative,
    midpoint, generous) against three enforcement cost scenarios (low,
    mid, high). If ROI is negative across all 9 cells, the fiscal
    justification fails regardless of which inputs a critic prefers.
    """
    print("\n── ROI Framework (Populate with FOIA Data) ────────────────────────")

    n_citations = len(df)

    # ── Inputs: update from FOIA responses ───────────────────────────────────
    fine_per_citation   = 50.00   # CTA fare evasion fine (verify from MCC)

    # Collection rate scenarios - replace center value with DOAH actuals
    collection_rates = {
        "Conservative (25%)": 0.25,
        "Midpoint (40%)":     0.40,   # national municipal average
        "Generous (55%)":     0.55,
    }

    # Annual enforcement cost scenarios - replace with FOIA actuals
    # Represents CPD transit fare-enforcement hours + Sheriff contract
    # + DOAH administrative cost, allocated to fare enforcement only
    enforcement_costs = {
        "Low ($2M)":  2_000_000,
        "Mid ($5M)":  5_000_000,
        "High ($10M)": 10_000_000,
    }

    gross_fines = n_citations * fine_per_citation

    print(f"\n  Transit citations in dataset:   {n_citations:,}")
    print(f"  Gross fines at ${fine_per_citation:.0f}/citation:   ${gross_fines:,.0f}")
    print()
    print("  NOTE: Enforcement costs above are placeholders pending FOIA.")
    print("  Collection rate placeholders use national municipal fine benchmarks.")
    print()

    # ── Sensitivity table ─────────────────────────────────────────────────────
    print("  ── Sensitivity Table: Annual ROI by Scenario ──────────────────")
    print(f"  {'':30s}", end="")
    for cost_label in enforcement_costs:
        print(f"  {cost_label:>15s}", end="")
    print()

    breakeven_failures = 0
    total_cells = len(collection_rates) * len(enforcement_costs)

    for rate_label, rate in collection_rates.items():
        collected = gross_fines * rate
        print(f"  {rate_label:30s}", end="")
        for cost_label, cost in enforcement_costs.items():
            roi = (collected - cost) / cost * 100
            flag = " ✓" if abs(roi) <= 10 else (" ✗" if roi < -10 else " ~")
            if roi < -10:
                breakeven_failures += 1
            print(f"  {roi:>+13.1f}%{flag}", end="")
        print()

    print()
    print("  ✓ = within 10% of break-even (efficiency argument applies)")
    print("  ✗ = outside 10% negative (no fiscal justification)")
    print("  ~ = outside 10% positive (enforcement is self-funding)")
    print()

    if breakeven_failures == total_cells:
        print("  ⚠ RESULT: ROI negative in ALL scenarios.")
        print("    Fiscal justification fails regardless of input assumptions.")
    elif breakeven_failures > total_cells // 2:
        print("  ⚠ RESULT: ROI negative in majority of scenarios.")
        print("    Fiscal argument is assumption-dependent, not robust.")
    else:
        print("  RESULT: ROI within defensible range in most scenarios.")
        print("    Argument shifts to efficiency and equity reform, not abolition.")

    print()
    print("  FOIA INPUTS NEEDED TO FINALIZE:")
    print("    DOAH: payment/collection rate on transit citations")
    print("    CPD:  transit section hours logged to fare enforcement")
    print("    Sheriff: CTA contract value + activity breakdown")
    print("    CTA:  internal fare loss estimates by year")
    print()
    print("  Final ROI = (collected - enforcement cost) / enforcement cost")
    print("  Threshold: within 10% = efficiency argument")
    print("             outside 10% OR year-over-year inconsistent = no fiscal basis")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 65)
    print("CTA FARE ENFORCEMENT ROI AUDIT")
    print(f"PolicyTorque LLC  |  Run: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 65)

    # Fetch
    records = fetch_all_pages()
    df = pd.DataFrame(records)

    # Always inspect schema first run - comment out after you know the columns
    inspect_schema(df)

    # Filter to transit violations
    transit = filter_transit(df)

    if transit.empty:
        print("\nNo transit violations found with current keywords.")
        print("Review the schema output above and update TRANSIT_CODES.")
        return

    # Save filtered dataset
    out_file = f"transit_anov_{datetime.now().strftime('%Y%m%d')}.csv"
    transit.to_csv(out_file, index=False)
    print(f"\nFiltered dataset saved: {out_file}")

    # Analysis
    analyze_demographics(transit)
    analyze_dispositions(transit)
    analyze_trend(transit)
    analyze_geography(transit)
    roi_stub(transit)

    print("\n" + "=" * 65)
    print("NEXT STEPS")
    print("=" * 65)
    print("1. Review schema output - confirm correct violation codes")
    print("2. File FOIA with DOAH for payment/collection data")
    print("3. File FOIA with CPD for transit section budget")
    print("4. File FOIA with Cook County Sheriff for CTA contract value")
    print("5. Cross-reference demographic distribution with")
    print("   Chicago population census data by community area")
    print("=" * 65)


if __name__ == "__main__":
    main()
