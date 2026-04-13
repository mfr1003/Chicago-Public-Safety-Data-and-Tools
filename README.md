# Chicago Public Safety Data and Tools

**PolicyTorque LLC**
**Michael Russo** | michael@policytorque.com | policytorque.com
**Repository:** github.com/mfr1003/Chicago-Public-Safety-Data-and-Tools

---

## What This Is

An open-source investigative data platform for public interest journalism
in Chicago. Three tools, each answering a distinct accountability question,
each built on public data, open methodology, and verifiable code.

This repository exists because the data is public, the questions are
legitimate, and the tools to answer them systematically did not exist.

---

## The Tools

---

### 1. CTA Fare Enforcement ROI Audit

**Directory:** `cta-enforcement-audit/`
**Status:** Active — four FOIA requests pending as of April 13, 2026

**The question:** Does Chicago's fare enforcement apparatus on the CTA rail
system recover more in fines than it costs to operate?

That sounds like a fiscal question. It is actually a values question in
disguise. If the ROI is negative, or inconsistent year over year, the
fiscal justification for an enforcement regime that falls
disproportionately on minority riders is empirically false. What remains
is a policy choice. Policy choices have authors. Authors are accountable.

**The methodology** is built around three pre-defined outcomes, established
before any data is examined:

- **Outcome A:** Revenue within 10% of enforcement cost. The fiscal
  argument holds. The debate shifts to efficiency and equity reform.
- **Outcome B:** Revenue nowhere near enforcement cost. The fiscal
  justification is false. A specific population is subsidizing a
  money-losing program administered in the name of fiscal responsibility.
- **Outcome C:** Revenue inconsistent year over year. Even in years that
  approximate break-even, inconsistency disqualifies the fiscal argument
  as a policy basis. The argument was never really fiscal.

**What is already underway:**

Four FOIA requests filed April 13, 2026:
- Department of Administrative Hearings: citation volume, dispositions,
  payment and collection rates, cost per hearing
- Chicago Police Department: transit section budget, headcount, and
  critically, activity code breakdown — hours logged to fare enforcement
  specifically versus crime response versus general patrol
- Cook County Sheriff: CTA contract value and activity breakdown
  (Reference No. R091132-041326)
- Chicago Transit Authority: internal fare loss estimates, gate
  infrastructure costs, farecard inspection records

A Python analysis pipeline pulls CPD Administrative Notice of Violation
(ANOV) data from the Chicago Data Portal Socrata API, mandated public
under the CPD consent decree. It filters transit-related citations,
profiles demographic distribution and disposition outcomes, and runs a
3x3 ROI sensitivity table across collection rate and enforcement cost
scenarios. Methodology is documented before results are known.

**Why the methodology protects the finding:** The cost allocation problem
— enforcement officers handle more than fare evasion — is explicitly
addressed by requesting activity code breakdowns via FOIA. The sensitivity
table presents results under assumptions favorable to enforcement, not
just assumptions favorable to the thesis. If the data supports
enforcement, this analysis will say so.

---

### 2. Chicago Property Accountability Tool

**Directory:** `chicago-property-accountability/`
**Status:** Active development — agent architecture complete, UI in progress

**The question:** Who owns the buildings where things go wrong, and how
many of those buildings do they own?

Poverty and housing instability in Chicago are not distributed randomly.
They concentrate. The same ownership entities appear repeatedly across
distressed, cited, neglected properties. The data to surface those
patterns is public. The tool to assemble it systematically did not exist.

**What it does:** Enter any Chicago address and five agents simultaneously
pull public records, then an AI orchestrator synthesizes the findings
into a structured editorial briefing:

- **Financial Agent** (Cook County Assessor): Assessed value, ownership
  entity, tax status, parcel ID
- **Distress Agent** (Chicago Data Portal): Building code violations,
  dates, resolution status — flags repeat offenders
- **Physical Asset Agent** (Chicago Data Portal): Permit history, costs,
  types — renovation permits alongside eviction filings is a displacement
  signal
- **Ownership Agent** (Cook County Recorder): Deed history, ownership
  transfers, LLC entity names — surfaces shell company patterns
- **Legislative Agent** (Chicago City Clerk): Aldermanic actions, zoning
  changes — surfaces political connections to distressed properties

**The ownership clustering script** takes a list of addresses — say, every
property cited for heat violations in January — and identifies which
ownership entities appear across multiple distressed properties in the set.
That is the slumlord pattern. The script surfaces it automatically.

**Editorial use cases this was built for:**
- Properties cited 3+ times for the same violation without resolution
- Ownership entities appearing across multiple distressed addresses
- Renovation permits clustered in a neighborhood alongside rising eviction
  filings — the gentrification pressure map
- Tax delinquency combined with repeat code violations — neglect for profit

---

### 3. Clearpath — Benefits Navigation (Maya)

**Directory:** `clearpath/`
**Status:** Active development

**The question:** Can a free, AI-assisted tool collapse the navigation
burden that keeps people in crisis from accessing the public benefits
they qualify for?

The information about available benefits is public. The programs exist.
The money is allocated. The problem is navigation — eleven different
agency websites, eleven different application processes, each requiring
the same information typed in fresh, while managing whatever crisis
brought someone to this point in the first place.

**What it does:** Maya is a conversational AI intake agent. She asks one
question at a time, in plain language, and builds a benefits eligibility
profile gradually. No 47-field intake form. No bureaucratic language.
A knowledgeable friend helping someone navigate a confusing system.

The output is a pre-filled application package. Everything that could be
found with a public records search — program addresses, eligibility
criteria in plain language, publicly known fields — is filled in already.
The sensitive parts: Social Security number, income, immigration status.
Those stay blank. The user fills them in with a pen, in person, at the
agency. We never touch them.

**The privacy architecture is not a policy claim. It is a design
commitment:**
- No login. No account creation.
- No Social Security numbers, income figures, or immigration status
  collected by the tool.
- No server-side database. Session data lives in the browser only and
  disappears when the tab closes.
- The Anthropic API call is disclosed plainly before anyone types
  anything sensitive — not buried in a privacy policy.
- The code is open source so the privacy claim is verifiable, not just
  asserted.

**Who this was built for:** Everyone. Without exception. But specifically
for the populations most underserved by the existing benefits ecosystem:
LGBTQ individuals for whom religiously affiliated shelter and services
create barriers; undocumented people for whom institutional contact
carries existential risk in the current political climate; people in
domestic violence situations, mental health crisis, or who have been
burned by institutions before. The design answer for all of them is the
same: ask for less, store nothing, judge no one.

**Distribution model:** A URL and a QR code. Printed. Posted at public
library bulletin boards, laundromat community boards, free clinic waiting
rooms, harm reduction drop-in centers, food bank lines. The population
most likely to need this urgently is also the population least likely to
find it through conventional channels. The QR code is the answer to that
problem.

---

## What These Three Tools Have In Common

They are all built on the same core conviction: the data is public,
the questions are legitimate, and systematic tools for answering them
serve the public interest in ways that one-off reporting cannot.

The CTA audit asks whether a public expenditure is justified.
The property tool asks who bears the cost of negligence and neglect.
Clearpath asks whether people in crisis can navigate the system meant
to help them.

These are not separate investigations. They are the same question asked
from three angles: is the system working for the people it is supposed
to serve, and if not, why not, and who is responsible?

---

## Methodology Principles Across All Three Tools

**Methodology before results.** Research design is documented before data
is examined. This prevents the appearance, and the reality, of building
toward a predetermined conclusion.

**The rope test.** No analytical shortcut that gives a critic enough rope
to hang the finding. Every cost allocation decision is documented. Every
assumption is made explicit. Every sensitivity table includes scenarios
favorable to the entity being scrutinized.

**Open source as accountability.** The code is public not as a convention
but as a commitment. The methodology is verifiable by anyone who wants
to check it.

**FOIA as infrastructure.** Public records requests are filed early,
documented in the repository, and tracked. Agencies that fail to respond
within statutory deadlines are escalated to the Illinois Attorney General's
Public Access Bureau. The FOIA trail is part of the story.

---

## Repository Structure

```
Chicago-Public-Safety-Data-and-Tools/
├── README.md                          # This file
├── cta-enforcement-audit/             # Tool 1: Fare enforcement ROI
│   ├── README.md
│   ├── METHODOLOGY.md
│   ├── scripts/
│   │   └── cta_enforcement_audit.py
│   ├── foia/
│   │   ├── FOIA_DOAH_transit_citations.md
│   │   ├── FOIA_CPD_transit_section.md
│   │   ├── FOIA_Sheriff_CTA_contract.md
│   │   └── FOIA_CTA_fare_loss_estimates.md
│   ├── data/raw/
│   └── outputs/
├── chicago-property-accountability/   # Tool 2: Property accountability
│   ├── README.md
│   ├── scripts/
│   │   └── ownership_cluster.py
│   ├── data/raw/
│   └── outputs/
└── clearpath/                         # Tool 3: Benefits navigation
    ├── README.md
    ├── MISSION.md
    ├── src/
    └── data/
```

---

## Contact & Collaboration

**Michael Russo**
PolicyTorque LLC
michael@policytorque.com
policytorque.com

If you work in social services, legal aid, housing advocacy, or benefits
navigation and want to contribute knowledge of the programs Clearpath
covers, that contribution is more valuable than any code.

If you work in data journalism and see a tool here that is useful or
worth extending, reach out.

If you are a Chicago resident who has experienced the fare enforcement
system, the housing conditions the property tool is designed to surface,
or the navigation barriers Clearpath is built to collapse — your knowledge
of how these systems actually work is the foundation this research stands on.

---

*All tools are open source. All methodology is documented. All privacy
claims are verifiable in the code. All FOIA filings are in the repository.*
