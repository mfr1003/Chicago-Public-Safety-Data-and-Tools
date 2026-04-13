# METHODOLOGY.md
## CTA Fare Enforcement ROI Audit
**PolicyTorque LLC | Michael Russo | April 2026**

---

## The Central Question

Chicago deploys Chicago Police Department officers, Cook County Sheriff's
deputies, and Department of Administrative Hearings staff to enforce fare
payment on the CTA rail system. That enforcement produces citations, hearings,
and fines. The standard public justification is fiscal: enforcement pays for
itself by recovering lost fare revenue.

This project tests that claim with arithmetic.

The question is not whether fare evasion is wrong. The question is whether
the public money spent enforcing it returns more than it costs. If it does
not, the fiscal argument is a pretext. What remains is a policy choice, and
policy choices have authors who are accountable for them.

---

## Why Methodology Matters Here

Fare enforcement on public transit is politically charged. Any analysis that
appears to be building toward a predetermined conclusion will be dismissed,
regardless of the data behind it.

This project is designed to resist that dismissal. The research design
establishes three possible outcomes before any data is examined, one of
which supports continued enforcement with reforms. The methodology is
documented before results are known. The cost allocation problem is
addressed explicitly rather than papered over. The sensitivity table
presents results under assumptions favorable to enforcement, not just
assumptions favorable to the thesis.

If the data supports enforcement, this document will say so.

---

## The Three-Outcome Framework

Before any data is analyzed, three outcomes are defined with their
corresponding implications:

**Outcome A: Revenue within 10% of enforcement cost**

Enforcement is approximately self-funding. The fiscal argument holds. The
policy debate shifts to efficiency: can the same revenue be recovered at
lower cost or with less disparate impact? This is a reform story, not an
abolition story.

**Outcome B: Revenue nowhere near enforcement cost**

Enforcement is a net public expenditure. The fiscal justification is
empirically false. The demographic distribution of citations means that
a specific population is bearing the cost of a money-losing program
administered in the name of fiscal responsibility.

**Outcome C: Revenue inconsistent year over year**

Even if some years approximate break-even, inconsistency disqualifies the
fiscal argument as a policy basis. A program whose ROI swings more than
25% year over year cannot be defended on fiscal grounds. The argument was
never really fiscal.

Outcomes B and C are not mutually exclusive. A program can be both a net
loser and inconsistent.

---

## The Cost Allocation Problem and Its Solution

CTA enforcement officers do not spend all their time on fare evasion. They
also respond to assaults, robberies, batteries, and homicides on CTA property.
Attributing total enforcement cost to fare evasion revenue alone would
overstate the cost burden and expose the analysis to legitimate methodological
attack.

This is the primary reason the analysis cannot be completed with public data
alone.

**The solution:** FOIA requests filed April 13, 2026 ask CPD and the Cook
County Sheriff specifically for activity code breakdowns: hours logged to
fare enforcement versus hours logged to crime response versus hours logged
to general patrol. Only the fare enforcement hours are included in the cost
calculation.

If those agencies do not track activity at that granularity, that finding
is documented explicitly in the methodology and reported as a finding. An
agency that cannot tell you how much of its transit deployment is fare
enforcement has no empirical basis for making a cost argument for fare
enforcement specifically. That is itself a story.

---

## Data Sources

### Public Data (Chicago Data Portal, Socrata API)

**CPD Administrative Notice of Violation (ANOV) Dataset**

Mandated by the CPD consent decree (Paragraphs 79 and 80). Every citation
issued by a CPD officer, updated regularly. Fields include violation code,
violation description, date, disposition, and race/ethnicity of the recipient.
This is the primary citation volume and demographic dataset.

Transit-related citations are identified by filtering violation codes and
descriptions for CTA, transit, fare, and related terms. The exact filter
is documented in the script and confirmed against the schema on first run.

**CTA Ridership Data**

Annual and monthly ridership totals by station, back to 2001. Used as
denominator context: citations per 100,000 rides by station, which normalizes
enforcement intensity across high- and low-ridership locations.

**CPD Crime Data on CTA Property**

Reported incidents by station, used to separate crime response from fare
enforcement in the activity analysis.

### FOIA Data (Pending)

| Agency | Key Ask | Why It Matters |
|--------|---------|----------------|
| DOAH | Collection rate: fines assessed vs. fines paid | Without this, revenue is gross, not net. Gross fines are not revenue. |
| CPD | Activity code breakdown for transit section | Isolates fare enforcement cost from total transit deployment cost |
| Sheriff | Contract value and activity breakdown | New deployment announced March 2026; no public cost figure exists |
| CTA | Internal fare loss estimates | Either provides a baseline or confirms the agency has none |

---

## ROI Calculation

Once FOIA data is received:

```
Fare enforcement cost =
    (CPD transit hours on fare enforcement x fully-loaded hourly cost)
  + (Sheriff hours on fare enforcement x contract reimbursement rate)
  + (DOAH cost per hearing x number of transit hearings)

Fare enforcement revenue =
    (Citations issued x fine per citation x collection rate)

ROI = (revenue - cost) / cost x 100%
```

Results are presented in a 3x3 sensitivity table varying collection rate
(25%, 40%, 55%) against enforcement cost (low, mid, high). If ROI is
negative across all nine cells, the finding is robust to reasonable
disagreement about inputs.

---

## The Demographic Layer

The ANOV dataset includes race and ethnicity of citation recipients. This
is not the lead finding. It is the context that makes the fiscal finding
consequential.

The sequence is:

1. Establish the ROI finding on its own terms, without reference to demographics
2. Present the demographic distribution of citations as a separate factual layer
3. Let the combination speak for itself

If enforcement is fiscally justified, the demographic disparity is an equity
and reform issue. If enforcement is not fiscally justified, the demographic
disparity means something different: a specific population is subsidizing
a net-loss program with their citations.

The analysis does not assert that demographic disparity is intentional.
It asserts that the fiscal justification either holds or it does not,
and that the demographic distribution is what it is.

---

## Limitations and Mitigations

**Limitation:** FOIA responses may be incomplete, delayed, or denied.

Mitigation: The sensitivity table presents results under a range of cost
assumptions. If activity code data is unavailable, a conservative allocation
fraction (fare enforcement as a percentage of total transit deployment) is
estimated from publicly available deployment figures and documented as an
assumption.

**Limitation:** Citation volume is not the same as enforcement intensity.
A high-ridership station with many citations may have a lower citation rate
per rider than a low-ridership station.

Mitigation: All citation figures are normalized against ridership data by
station where possible.

**Limitation:** Collection rates on municipal fines vary by year, economic
conditions, and enforcement of collections.

Mitigation: Three collection rate scenarios bracket the likely range. The
DOAH FOIA response replaces the midpoint assumption with actuals.

---

## Contact

Michael Russo
PolicyTorque LLC
michael@policytorque.com
policytorque.com
