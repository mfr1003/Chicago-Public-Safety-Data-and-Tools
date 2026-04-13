# CTA Fare Enforcement ROI Audit

**A PolicyTorque LLC investigative data project**
**Researcher:** Michael Russo | michael@policytorque.com
**Status:** Active — FOIA responses pending, public data analysis in progress

---

## The Question

Does Chicago's fare enforcement apparatus on the CTA rail system recover more
in fines than it costs to operate?

If yes: enforcement is a fiscal argument, and the policy debate is about
efficiency and equity.

If no, or if the answer is inconsistent year over year: enforcement is a values
argument being dressed up as a fiscal one. That is a different conversation,
with different accountability.

---

## Why It Matters

The City of Chicago, the Chicago Police Department, and the Cook County
Sheriff's Office are collectively spending public money to enforce CTA fare
payment. That enforcement apparatus issues citations that fall disproportionately
on minority riders. The standard defense is fiscal responsibility.

This project tests that defense empirically.

---

## Research Design

### The Three-Outcome Framework

This analysis is structured around three possible findings, each of which
produces a different story:

| Outcome | Finding | Implication |
|---------|---------|-------------|
| A | Revenue within 10% of enforcement cost | Efficiency and equity reform argument |
| B | Revenue nowhere near enforcement cost | No fiscal justification; enforcement is a net expenditure |
| C | Revenue inconsistent year over year | Fiscal argument is situational, not principled |

Outcome C is analytically significant independent of Outcome B. An enforcement
regime whose fiscal performance is inconsistent cannot be defended on fiscal
grounds even in years when it appears to break even.

### Methodology Note: Cost Allocation

A critical design decision: CTA enforcement officers handle the full spectrum
of transit incidents, including assault, robbery, and homicide, not only fare
evasion. Attributing total enforcement cost to fare evasion revenue would
overstate the cost burden and weaken the analysis.

This project isolates fare enforcement cost specifically by requesting activity
code breakdowns from CPD and the Cook County Sheriff via FOIA. Only hours
logged to fare enforcement activity are included in the cost calculation.
If those agencies do not track activity hours at that granularity, that finding
is documented in the methodology and reported as a finding in itself.

### Sensitivity Table

Because key cost inputs depend on FOIA responses, all ROI calculations are
presented as a 3x3 sensitivity table: three collection rate scenarios
(conservative 25%, midpoint 40%, generous 55%) against three enforcement
cost scenarios (low, mid, high). If ROI is negative across all nine cells,
the fiscal justification fails regardless of which assumptions a critic prefers.

---

## Data Sources

### Public (available now)

| Source | Data | Access |
|--------|------|--------|
| Chicago Data Portal | CPD Administrative Notice of Violation (ANOV) citations, including demographics and dispositions | Socrata API |
| Chicago Data Portal | CTA ridership by station, by year | Socrata API |
| Chicago Data Portal | CPD crime data on CTA property | Socrata API |
| CTA Finance | Annual budget documents | Public PDFs |

### FOIA Requests Filed April 13, 2026

| Agency | Records Requested | Reference |
|--------|------------------|-----------|
| Department of Administrative Hearings (DOAH) | Citation volume, dispositions, payment/collection rates, cost per hearing | Submitted via email |
| Chicago Police Department | Transit section budget, headcount, activity code breakdown by type | Submitted via email |
| Cook County Sheriff | CTA contract value, hours committed, activity breakdown | R091132-041326 |
| Chicago Transit Authority | Internal fare loss estimates, gate infrastructure costs, farecard inspection records | Submitted via email |

---

## Repository Structure

```
Chicago-Public-Safety-Data-and-Tools/
├── README.md                   # This file
├── METHODOLOGY.md              # Full research design and analytical framework
├── data/
│   └── raw/                    # FOIA responses and public data exports (added as received)
├── scripts/
│   └── cta_enforcement_audit.py   # Main analysis script
├── outputs/
│   └── sensitivity_table.csv   # ROI sensitivity table (updates as FOIA data arrives)
└── foia/
    ├── FOIA_DOAH_transit_citations.md
    ├── FOIA_CPD_transit_section.md
    ├── FOIA_Sheriff_CTA_contract.md
    └── FOIA_CTA_fare_loss_estimates.md
```

---

## Running the Analysis

```bash
git clone https://github.com/mfr1003/Chicago-Public-Safety-Data-and-Tools.git
cd Chicago-Public-Safety-Data-and-Tools
pip install requests pandas tabulate
python scripts/cta_enforcement_audit.py
```

On first run, the script prints a full schema of the ANOV dataset and all
unique violation description values. Use this to verify transit violation
filters before proceeding to analysis.

---

## Current Status

- [x] Research design finalized
- [x] Three-outcome framework documented
- [x] FOIA requests filed (4 agencies)
- [x] Analysis script built with sensitivity table
- [ ] ANOV schema confirmed (run script locally)
- [ ] Transit violation filter tuned to confirmed codes
- [ ] FOIA responses received and ingested
- [ ] ROI calculation finalized
- [ ] Methodology brief delivered to CPM editorial team

---

## About PolicyTorque

PolicyTorque LLC is an independent policy research and analysis platform
founded by Michael Russo, an Advanced Development Engineer with 10 years
of experience in the automotive supply chain and published research on
energy security, battery supply chains, and industrial policy.

policytorque.com | michael@policytorque.com
