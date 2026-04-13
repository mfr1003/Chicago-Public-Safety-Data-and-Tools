# Chicago Property Accountability Tool

**A PolicyTorque LLC investigative data project**
**Researcher:** Michael Russo | michael@policytorque.com
**Status:** Active development
**Branched from:** CRE Intelligence Platform (commercial version)

---

## What This Is

A multi-agent property intelligence tool for public accountability journalism.
Enter any Chicago address and the tool simultaneously pulls public records
across five data sources, assembles a structured briefing, and surfaces
ownership patterns, repeat violations, and displacement pressure indicators.

Built on the same architecture as the CRE Intelligence Platform but reoriented
entirely toward public interest use cases: slumlord identification, code
violation enforcement gaps, ownership entity clustering, and neighborhood
displacement analysis.

---

## The Accountability Questions This Answers

- Who owns this building, and what else do they own?
- How many times has this property been cited for code violations, and were they fixed?
- Is the same ownership entity appearing across multiple distressed properties?
- What is the eviction filing history at this address?
- What permits have been pulled, and do they match the condition of the building?
- Is this block under displacement pressure from permit activity patterns?

---

## Agent Architecture

| Agent | Data Source | What It Finds |
|-------|------------|---------------|
| Financial Agent | Cook County Assessor | Assessed value, ownership entity, tax status, PIN |
| Distress Agent | Chicago Data Portal - Building Violations | Code violations, dates, resolution status, inspector |
| Physical Asset Agent | Chicago Data Portal - Building Permits | Permit history, costs, types, approval status |
| Ownership Agent | Cook County Recorder | Deed history, ownership transfers, LLC entity names |
| Eviction Agent | Cook County Circuit Court (public) | Eviction filing history at address |
| Legislative Agent | Chicago City Clerk | Aldermanic actions, zoning changes, city council activity |
| Orchestrator | Claude API | Cross-agent synthesis, pattern flags, editorial briefing |

---

## Key Additions Over CRE Intel Version

- **Ownership clustering:** Identifies when the same LLC or individual appears
  across multiple distressed properties in the dataset
- **Repeat violation flagging:** Surfaces properties cited 3+ times without
  resolution as editorial leads
- **Eviction pressure layer:** Cook County eviction filings by address, crossreferenced
  with permit activity (renovation + evictions = displacement signal)
- **Ownership chain transparency:** Deed transfer history to surface shell
  company patterns

---

## Data Sources

All public, all free, all accessible via API:

| Source | API | Dataset |
|--------|-----|---------|
| Cook County Assessor | datacatalog.cookcountyil.gov | Property assessment, ownership |
| Chicago Data Portal | data.cityofchicago.org | Building violations, permits |
| Cook County Recorder | Via FOIA or public portal | Deed transfers |
| Cook County Circuit Court | Via public access portal | Eviction filings |
| Chicago City Clerk | chicityclerk.com | Council actions |

---

## Repository Structure

```
chicago-property-accountability/
├── README.md                   # This file
├── METHODOLOGY.md              # Research design and editorial framework
├── cpa-tool.html               # Main application (single-file, deployable)
├── scripts/
│   └── ownership_cluster.py   # Batch ownership clustering across addresses
├── data/
│   └── raw/                   # FOIA responses and bulk data exports
└── outputs/
    └── flagged_properties.csv  # Running list of editorially significant finds
```

---

## Running the Tool

Single HTML file, no build step required. Deploy to Netlify by dropping
`cpa-tool.html` into the project folder. Or open locally in any browser.

For the ownership clustering script (batch analysis across multiple addresses):

```bash
pip install requests pandas tabulate
python scripts/ownership_cluster.py --addresses addresses.csv
```

---

## Relationship to CRE Intelligence Platform

This tool shares the same agent architecture and Chicago Data Portal pipeline
as the CRE Intelligence Platform (commercial version). The differences:

- **CRE Intel:** Deal flow, comp analysis, acquisition due diligence
- **Property Accountability:** Violation patterns, ownership clustering,
  displacement signals, editorial lead generation

The commercial version remains intact in its own directory. This branch
exists specifically for public interest journalism use cases.

---

## Editorial Use Cases

**Slumlord investigation:** Run 20 addresses cited for heat/hot water violations
in winter. Ownership clustering reveals three of them share an LLC registered
to the same agent. That's the story.

**Displacement mapping:** Permit activity surge in a neighborhood, crossreferenced
with eviction filings at the same addresses over 24 months. That's
the gentrification pressure map.

**Code enforcement gap:** Properties with 5+ unresolved violations over 3 years.
What does the city's enforcement record look like on those specific addresses?
Who owns them? Do any have aldermanic ties?

**Tax delinquency + violation clustering:** Properties that are both tax
delinquent and code-violation repeat offenders. That's the neglect-for-profit profile.

---

## Current Status

- [x] Agent architecture designed and documented
- [x] Chicago Data Portal pipeline validated (CRE Intel version)
- [ ] Ownership Agent: Cook County Recorder integration
- [ ] Eviction Agent: Cook County Circuit Court integration
- [ ] Ownership clustering script
- [ ] Repeat violation flagging logic
- [ ] Orchestrator wired to Claude API
- [ ] UI pivot from deal-flow to accountability framing

---

## About PolicyTorque

PolicyTorque LLC is an independent policy research and analysis platform
founded by Michael Russo, an Advanced Development Engineer with 10 years
of experience in the automotive supply chain and published research on
energy security, battery supply chains, and industrial policy.

policytorque.com | michael@policytorque.com
github.com/mfr1003/Chicago-Public-Safety-Data-and-Tools
