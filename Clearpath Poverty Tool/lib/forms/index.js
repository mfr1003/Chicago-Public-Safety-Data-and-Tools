// lib/forms/index.js
//
// Each form template defines:
//   - What fields from the profile we can pre-fill
//   - What fields the USER must fill in themselves (sensitive info)
//   - A PDF generator that produces a pre-filled, print-ready document
//
// The golden rule: we never ask for, store, or print SSNs, exact income,
// immigration status, or anything that could harm someone if intercepted.
// Those fields appear as clearly labeled blank lines on the printed form.

export const FORMS = {

  snap: {
    id: "snap",
    name: "SNAP Benefits (Food Assistance)",
    category: "food",
    description: "Pre-filled SNAP application starter. Bring this to your county office along with your documents.",
    states: "all",                     // available in all states
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "mailing_address", "state", "county", "city", "zip",
      "household_size", "housing_situation", "documents_available",
    ],
    user_must_fill: [
      { label: "Social Security Number (each household member)", lines: 4 },
      { label: "Monthly gross income (all sources)", lines: 2 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    bring_to_office: [
      "Government-issued photo ID",
      "Proof of address (utility bill, lease, or letter from someone you stay with)",
      "Social Security cards for all household members",
      "Proof of income for the last 30 days (pay stubs, award letters, etc.)",
      "If unhoused: a letter from a shelter or a self-attestation form",
    ],
    office_locator: "https://www.fns.usda.gov/snap/state-directory",
    apply_online: "Benefits.gov or your state's benefits portal",
  },

  section8: {
    id: "section8",
    name: "Section 8 / Housing Choice Voucher",
    category: "housing",
    description: "Pre-filled Section 8 waitlist pre-screening. Check if your local housing authority's waitlist is open first.",
    states: "all",
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "email", "mailing_address", "state", "county", "city", "zip",
      "household_size", "household_members", "veteran", "has_disability",
    ],
    user_must_fill: [
      { label: "Social Security Numbers (all household members)", lines: 4 },
      { label: "Annual gross household income", lines: 1 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    bring_to_office: [
      "Photo ID for all adult household members",
      "Birth certificates for all household members",
      "Social Security cards for all household members",
      "Proof of income",
      "Veteran's DD-214 (if applicable)",
    ],
    office_locator: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    apply_online: "Your local Public Housing Authority website",
    important_note: "Section 8 waitlists are often closed. Call your local housing authority first to confirm the waitlist is accepting applications.",
  },

  medicaid: {
    id: "medicaid",
    name: "Medicaid / Health Insurance",
    category: "health",
    description: "Pre-filled Medicaid application starter.",
    states: "all",
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "email", "mailing_address", "state", "city", "zip",
      "household_size", "has_disability",
    ],
    user_must_fill: [
      { label: "Social Security Number", lines: 1 },
      { label: "Immigration status / citizenship", lines: 1 },
      { label: "Monthly household income", lines: 1 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    bring_to_office: [
      "Photo ID",
      "Proof of state residency",
      "Social Security card",
      "Proof of income",
    ],
    apply_online: "HealthCare.gov or your state's Medicaid portal",
    office_locator: "https://www.medicaid.gov/about-us/contact-us/index.html",
  },

  job_application: {
    id: "job_application",
    name: "General Job Application",
    category: "employment",
    description: "A pre-filled general-purpose job application you can bring to any employer.",
    states: "all",
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "email", "mailing_address",
      "employment", "skills", "references",
    ],
    user_must_fill: [
      { label: "Position applying for", lines: 1 },
      { label: "Available start date", lines: 1 },
      { label: "Desired pay", lines: 1 },
      { label: "Social Security Number (some employers require)", lines: 1 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    bring_to_office: [
      "Government-issued photo ID",
      "Social Security card or work authorization document",
      "References contact list",
    ],
    note: "This is a general template. Specific employers may have their own forms.",
  },

  wic: {
    id: "wic",
    name: "WIC (Women, Infants & Children)",
    category: "food",
    description: "Pre-filled WIC program application. For pregnant women, new mothers, and children under 5.",
    states: "all",
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "mailing_address", "state", "city", "zip",
      "household_size",
    ],
    user_must_fill: [
      { label: "Proof of pregnancy or child's age (bring documentation)", lines: 1 },
      { label: "Household income", lines: 1 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    bring_to_office: [
      "Photo ID",
      "Proof of address",
      "Proof of income",
      "Child's birth certificate (if applying for a child)",
      "Medical documentation if applying due to medical risk",
    ],
    office_locator: "https://www.fns.usda.gov/wic/wic-local-agency-directory",
  },

  liheap: {
    id: "liheap",
    name: "LIHEAP (Utility Assistance)",
    category: "utilities",
    description: "Pre-filled LIHEAP application for help with heating and cooling bills.",
    states: "all",
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "mailing_address", "state", "city", "zip",
      "household_size", "housing_situation",
    ],
    user_must_fill: [
      { label: "Social Security Number", lines: 1 },
      { label: "Monthly household income", lines: 1 },
      { label: "Utility account number", lines: 1 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    bring_to_office: [
      "Photo ID",
      "A recent utility bill",
      "Proof of income",
      "Social Security card",
    ],
    office_locator: "https://www.benefits.gov/benefit/623",
  },

  rental_application: {
    id: "rental_application",
    name: "General Rental Application",
    category: "housing",
    description: "A pre-filled general rental application you can bring to any landlord.",
    states: "all",
    prefill_fields: [
      "first_name", "last_name", "date_of_birth",
      "phone", "email",
      "household_size", "household_members",
      "employment", "references",
    ],
    user_must_fill: [
      { label: "Social Security Number", lines: 1 },
      { label: "Monthly income / income source", lines: 1 },
      { label: "Current and prior landlord contact info", lines: 3 },
      { label: "Signature", lines: 1 },
      { label: "Date", lines: 1 },
    ],
    note: "Individual landlords will have their own forms. Use this as a reference or bring it as a supplemental summary.",
  },
};

// Returns forms relevant to a user's situation based on Maya's analysis
export function getRelevantForms(programIds) {
  return programIds
    .map(id => FORMS[id])
    .filter(Boolean);
}
