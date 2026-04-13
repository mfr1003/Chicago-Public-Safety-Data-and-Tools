"""
Chicago Property Accountability Tool
Ownership Clustering Script
PolicyTorque LLC

Takes a list of addresses and identifies common ownership entities
across properties — surfaces the slumlord pattern: the same LLC or
individual appearing across multiple distressed or cited properties.

Requirements:
    pip install requests pandas tabulate

Usage:
    python ownership_cluster.py --addresses addresses.csv
    python ownership_cluster.py --address "1234 N WESTERN AVE"

Input CSV format (addresses.csv):
    address
    1234 N WESTERN AVE
    5678 S HALSTED ST
    ...

Output:
    - Console summary of ownership clusters
    - flagged_properties.csv with full results
    - ownership_clusters.csv with entities owning 2+ properties
"""

import requests
import pandas as pd
import argparse
import json
from datetime import datetime
from tabulate import tabulate

# ── Config ────────────────────────────────────────────────────────────────────

COOK_COUNTY_BASE  = "https://datacatalog.cookcountyil.gov/resource"
CHICAGO_BASE      = "https://data.cityofchicago.org/resource"

# Cook County Assessor - property and ownership
ASSESSOR_ENDPOINT = f"{COOK_COUNTY_BASE}/tx2p-k2g9.json"

# Chicago building violations
VIOLATIONS_ENDPOINT = f"{CHICAGO_BASE}/22u3-xenr.json"

# Chicago building permits
PERMITS_ENDPOINT = f"{CHICAGO_BASE}/ydr8-5enu.json"

# Minimum violations to flag a property as distressed
VIOLATION_THRESHOLD = 3

# ── Address normalization ─────────────────────────────────────────────────────

def normalize_address(raw):
    """Normalize address for consistent API querying."""
    norm = raw.upper().strip()
    replacements = {
        "NORTH": "N", "SOUTH": "S", "EAST": "E", "WEST": "W",
        "STREET": "ST", "AVENUE": "AVE", "BOULEVARD": "BLVD",
        "DRIVE": "DR", "ROAD": "RD", "COURT": "CT",
        "PLACE": "PL", "LANE": "LN", "PARKWAY": "PKY",
    }
    for word, abbr in replacements.items():
        norm = norm.replace(f" {word} ", f" {abbr} ")
        norm = norm.replace(f" {word}$", f" {abbr}")
    # Strip city/state suffix
    norm = norm.split(",")[0].strip()
    return norm


def extract_street_number(address):
    """Pull just the street number for API queries."""
    parts = address.split()
    return parts[0] if parts and parts[0].isdigit() else ""

# ── Data fetchers ─────────────────────────────────────────────────────────────

def fetch_assessor(address):
    """Pull ownership and assessment data from Cook County Assessor."""
    number = extract_street_number(address)
    if not number:
        return []
    try:
        resp = requests.get(
            ASSESSOR_ENDPOINT,
            params={
                "$where": f"upper(property_address) like '%{number}%'",
                "$limit": 5
            },
            timeout=15
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  Assessor fetch error for {address}: {e}")
        return []


def fetch_violations(address):
    """Pull building violation history from Chicago Data Portal."""
    number = extract_street_number(address)
    if not number:
        return []
    try:
        resp = requests.get(
            VIOLATIONS_ENDPOINT,
            params={
                "$where": f"upper(address) like '%{number}%'",
                "$limit": 50,
                "$order": "violation_date DESC"
            },
            timeout=15
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  Violations fetch error for {address}: {e}")
        return []


def fetch_permits(address):
    """Pull building permit history from Chicago Data Portal."""
    number = extract_street_number(address)
    if not number:
        return []
    try:
        resp = requests.get(
            PERMITS_ENDPOINT,
            params={
                "$where": f"upper(street_number) = '{number}'",
                "$limit": 20,
                "$order": "issue_date DESC"
            },
            timeout=15
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  Permits fetch error for {address}: {e}")
        return []

# ── Property profiler ─────────────────────────────────────────────────────────

def profile_property(address):
    """Build a full accountability profile for one address."""
    norm = normalize_address(address)
    print(f"  Profiling: {norm}")

    assessor_data  = fetch_assessor(norm)
    violation_data = fetch_violations(norm)
    permit_data    = fetch_permits(norm)

    # Extract owner from assessor
    owner = "UNKNOWN"
    pin = ""
    assessed_value = ""
    if assessor_data:
        first = assessor_data[0]
        owner = first.get("taxpayer_name", first.get("owner_name", "UNKNOWN"))
        pin = first.get("pin", "")
        assessed_value = first.get("certified_tot", "")

    # Violation summary
    total_violations = len(violation_data)
    unresolved = sum(
        1 for v in violation_data
        if "open" in str(v.get("status", "")).lower()
        or "notice" in str(v.get("status", "")).lower()
    )
    violation_types = list(set(
        v.get("violation_description", v.get("violation_ordinance", ""))[:60]
        for v in violation_data
        if v.get("violation_description") or v.get("violation_ordinance")
    ))[:3]

    # Permit summary
    total_permits = len(permit_data)
    recent_permits = [
        p for p in permit_data
        if p.get("issue_date", "") >= "2022-01-01"
    ]

    # Distress flag
    distressed = total_violations >= VIOLATION_THRESHOLD and unresolved > 0

    return {
        "address":          norm,
        "pin":              pin,
        "owner":            owner,
        "assessed_value":   assessed_value,
        "total_violations": total_violations,
        "unresolved_violations": unresolved,
        "violation_sample": " | ".join(violation_types),
        "total_permits":    total_permits,
        "recent_permits":   len(recent_permits),
        "distressed_flag":  distressed,
    }

# ── Ownership clustering ──────────────────────────────────────────────────────

def cluster_by_owner(profiles):
    """
    Group properties by owner entity.
    Flags owners appearing at 2+ distressed properties.
    """
    df = pd.DataFrame(profiles)

    # Normalize owner names for clustering
    df["owner_normalized"] = (
        df["owner"]
        .str.upper()
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    # Count properties per owner
    owner_counts = df.groupby("owner_normalized").agg(
        property_count=("address", "count"),
        distressed_count=("distressed_flag", "sum"),
        addresses=("address", lambda x: " | ".join(x)),
        total_violations=("total_violations", "sum"),
    ).reset_index()

    # Flag multi-property owners with distressed properties
    flagged = owner_counts[
        (owner_counts["property_count"] >= 2) |
        (owner_counts["distressed_count"] >= 1)
    ].sort_values(
        ["distressed_count", "property_count"],
        ascending=False
    )

    return owner_counts, flagged

# ── Reporting ─────────────────────────────────────────────────────────────────

def print_report(profiles, owner_counts, flagged):
    """Print accountability summary to console."""
    print("\n" + "=" * 70)
    print("CHICAGO PROPERTY ACCOUNTABILITY REPORT")
    print(f"PolicyTorque LLC  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 70)

    print(f"\n── Property Summary ({len(profiles)} addresses) ──────────────────────")
    df = pd.DataFrame(profiles)
    distressed = df[df["distressed_flag"] == True]
    print(f"  Total properties analyzed:     {len(profiles)}")
    print(f"  Properties flagged distressed: {len(distressed)}")
    print(f"  Total violations found:        {df['total_violations'].sum()}")
    print(f"  Unresolved violations:         {df['unresolved_violations'].sum()}")

    if not distressed.empty:
        print("\n── Distressed Properties ──────────────────────────────────────────")
        print(tabulate(
            distressed[["address", "owner", "total_violations",
                        "unresolved_violations", "violation_sample"]],
            headers=["Address", "Owner", "Violations", "Unresolved", "Types (sample)"],
            tablefmt="simple", showindex=False
        ))

    if not flagged.empty:
        print("\n── Ownership Clusters (Editorial Leads) ───────────────────────────")
        print(tabulate(
            flagged[["owner_normalized", "property_count",
                     "distressed_count", "total_violations"]],
            headers=["Owner Entity", "Properties", "Distressed", "Total Violations"],
            tablefmt="simple", showindex=False
        ))
        print("\n  ⚠ These entities own multiple properties in this dataset.")
        print("  Cross-reference with Cook County Recorder for LLC ownership chains.")

    print("\n── FOIA Recommendations ───────────────────────────────────────────")
    if len(distressed) > 0:
        top_owner = flagged.iloc[0]["owner_normalized"] if not flagged.empty else "N/A"
        print(f"  1. Cook County Recorder: deed history for flagged properties")
        print(f"  2. Chicago DOIT: full violation history for repeat offenders")
        print(f"  3. Illinois SOS: LLC registration for '{top_owner}'")
    print("=" * 70)


def save_outputs(profiles, owner_counts, flagged):
    """Save results to CSV files."""
    ts = datetime.now().strftime("%Y%m%d_%H%M")

    props_file = f"outputs/flagged_properties_{ts}.csv"
    clusters_file = f"outputs/ownership_clusters_{ts}.csv"

    pd.DataFrame(profiles).to_csv(props_file, index=False)
    flagged.to_csv(clusters_file, index=False)

    print(f"\n  Results saved:")
    print(f"    {props_file}")
    print(f"    {clusters_file}")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Chicago Property Accountability - Ownership Clustering"
    )
    parser.add_argument("--addresses", help="CSV file with 'address' column")
    parser.add_argument("--address",   help="Single address to analyze")
    args = parser.parse_args()

    addresses = []
    if args.addresses:
        df = pd.read_csv(args.addresses)
        addresses = df["address"].dropna().tolist()
    elif args.address:
        addresses = [args.address]
    else:
        parser.print_help()
        return

    print(f"Analyzing {len(addresses)} address(es)...")
    profiles = []
    for addr in addresses:
        profile = profile_property(addr)
        profiles.append(profile)

    if not profiles:
        print("No profiles generated.")
        return

    owner_counts, flagged = cluster_by_owner(profiles)
    print_report(profiles, owner_counts, flagged)
    save_outputs(profiles, owner_counts, flagged)


if __name__ == "__main__":
    main()
