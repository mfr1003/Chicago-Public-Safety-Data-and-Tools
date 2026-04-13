// lib/profile.js
//
// The profile only holds NON-SENSITIVE information.
// SSN, income amounts, immigration status — none of that lives here.
// Everything here is the kind of thing you'd put on a resume or
// tell a librarian without hesitation.

export const EMPTY_PROFILE = {
  // Basic info
  first_name: "",
  last_name: "",
  date_of_birth: "",       // "MM/DD/YYYY" — on their ID, they already know this
  phone: "",
  email: "",

  // Location
  state: "",
  county: "",
  city: "",
  zip: "",
  mailing_address: "",     // can be "General Delivery, [City], [State]" for unhoused

  // Household
  household_size: "",
  household_members: [],   // [{ name, relationship, dob }] — no SSNs

  // Employment history (resume-level, not tax-level)
  employment: [],          // [{ employer, title, start, end, supervisor, phone }]
  skills: [],              // ["Forklift certified", "Customer service", ...]

  // References (personal/professional)
  references: [],          // [{ name, relationship, phone, email }]

  // Documents they have in hand (checkbox style, not the doc contents)
  documents_available: [], // ["State ID", "Birth certificate", "Social Security card", ...]

  // Housing situation (helps route them to right programs — no addresses needed)
  housing_situation: "",   // "renting", "staying with others", "shelter", "unhoused", "own"

  // Current benefits they already receive (so we don't re-apply)
  current_benefits: [],    // ["SNAP", "Medicaid", ...]

  // Preferred language
  language: "English",

  // Veteran status (opens different programs)
  veteran: false,

  // Disability status (opens SSI/SSDI pathways)
  has_disability: false,

  // Pregnant or has children under 5 (WIC eligibility)
  wic_eligible_household: false,
};

// Given a profile and a list of required fields for a form,
// return which ones are still empty.
export function findGaps(profile, requiredFields) {
  return requiredFields.filter(field => {
    const val = profile[field];
    if (Array.isArray(val)) return val.length === 0;
    return !val || val === "";
  });
}

// Human-readable labels for gap fields, used in Maya's messages
export const FIELD_LABELS = {
  first_name:       "your first name",
  last_name:        "your last name",
  date_of_birth:    "your date of birth",
  phone:            "a phone number",
  email:            "an email address",
  state:            "your state",
  county:           "your county",
  city:             "your city",
  zip:              "your zip code",
  mailing_address:  "a mailing address",
  household_size:   "how many people are in your household",
  employment:       "some employment history",
  references:       "at least one reference",
  documents_available: "which documents you currently have",
  housing_situation:"your current housing situation",
  language:         "your preferred language",
};

export function describeGaps(gaps) {
  if (gaps.length === 0) return null;
  const labels = gaps.map(g => FIELD_LABELS[g] || g);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(" and ");
  return labels.slice(0, -1).join(", ") + ", and " + labels[labels.length - 1];
}
