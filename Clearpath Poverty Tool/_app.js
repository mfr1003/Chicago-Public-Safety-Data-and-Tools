// lib/forms/generatePdf.js
//
// Takes a form template + a profile and produces a print-ready PDF.
// Pre-filled fields are populated. Sensitive fields are left as
// clearly labeled blank lines with instructions.

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FORMS } from "./index.js";
import { findGaps, describeGaps } from "../profile.js";

const BLACK  = rgb(0, 0, 0);
const GREEN  = rgb(0.18, 0.42, 0.31);   // Clearpath accent
const GRAY   = rgb(0.55, 0.55, 0.55);
const RED_DIM = rgb(0.6, 0.2, 0.2);

// Draws a horizontal rule
function hRule(page, x, y, width) {
  page.drawLine({ start:{x,y}, end:{x:x+width,y}, thickness:0.5, color:rgb(0.8,0.8,0.8) });
}

// Draws a blank fill-in line
function blankLine(page, x, y, width) {
  page.drawLine({ start:{x,y}, end:{x:x+width,y}, thickness:0.75, color:rgb(0,0,0) });
}

export async function generateFormPDF(formId, profile) {
  const form = FORMS[formId];
  if (!form) throw new Error("Unknown form: " + formId);

  const doc    = await PDFDocument.create();
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg    = await doc.embedFont(StandardFonts.Helvetica);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  let page = doc.addPage([612, 792]); // US Letter
  const margin = 48;
  const width  = 612 - margin * 2;
  let y = 760;

  function newPage() {
    page = doc.addPage([612, 792]);
    y = 760;
  }

  function checkY(needed = 30) {
    if (y < margin + needed) newPage();
  }

  function text(str, x, fontSize, font, color = BLACK, maxWidth = null) {
    if (!str) return;
    // Simple word wrap
    if (maxWidth) {
      const words = str.split(" ");
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        const w = font.widthOfTextAtSize(test, fontSize);
        if (w > maxWidth && line) {
          checkY(fontSize + 4);
          page.drawText(line, { x, y, size:fontSize, font, color });
          y -= fontSize + 4;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) {
        checkY(fontSize + 4);
        page.drawText(line, { x, y, size:fontSize, font, color });
        y -= fontSize + 4;
      }
    } else {
      checkY(fontSize + 4);
      page.drawText(str, { x, y, size:fontSize, font, color });
      y -= fontSize + 4;
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────
  text("CLEARPATH", margin, 10, bold, GREEN);
  page.drawText("clearpath.app", { x:612-margin-60, y:y+10, size:8, font:reg, color:GRAY });
  y -= 4;
  hRule(page, margin, y, width);
  y -= 14;

  text(form.name, margin, 16, bold, BLACK);
  y -= 2;
  text("Prepared by Clearpath — " + new Date().toLocaleDateString("en-US", {year:"numeric",month:"long",day:"numeric"}), margin, 8, italic, GRAY);
  y -= 10;
  hRule(page, margin, y, width);
  y -= 16;

  // ── How to use this form ──────────────────────────────────────────────────
  text("HOW TO USE THIS FORM", margin, 9, bold, GREEN);
  y -= 2;
  const instructions = [
    "✓  Fields marked PRE-FILLED are already completed for you.",
    "✎  Fields marked YOU FILL IN must be completed by you. These contain",
    "    sensitive information we do not collect or store.",
    "►  Bring this form and the documents listed at the end to the office.",
  ];
  for (const line of instructions) {
    text(line, margin, 9, reg, BLACK, width);
  }
  y -= 10;
  hRule(page, margin, y, width);
  y -= 18;

  // ── Pre-filled section ────────────────────────────────────────────────────
  text("PRE-FILLED INFORMATION", margin, 10, bold, GREEN);
  y -= 8;

  const fieldLabels = {
    first_name:       "First Name",
    last_name:        "Last Name",
    date_of_birth:    "Date of Birth",
    phone:            "Phone Number",
    email:            "Email Address",
    mailing_address:  "Mailing Address",
    state:            "State",
    county:           "County",
    city:             "City",
    zip:              "ZIP Code",
    household_size:   "Household Size",
    housing_situation:"Housing Situation",
    veteran:          "Veteran Status",
    has_disability:   "Disability Status",
    language:         "Preferred Language",
    documents_available: "Documents in Hand",
  };

  const gaps = findGaps(profile, form.prefill_fields);
  const filledFields = form.prefill_fields.filter(f => !gaps.includes(f));

  for (const field of filledFields) {
    checkY(28);
    let val = profile[field];

    // Format special fields
    if (field === "veteran")       val = val ? "Yes" : "No";
    if (field === "has_disability") val = val ? "Yes" : "No";
    if (Array.isArray(val))        val = val.join(", ");

    const label = fieldLabels[field] || field;
    page.drawText(label + ":", { x:margin, y, size:9, font:bold, color:GRAY });
    page.drawText(String(val || "—"), { x:margin+160, y, size:10, font:reg, color:BLACK });
    y -= 18;
  }

  // Employment history
  if (form.prefill_fields.includes("employment") && profile.employment && profile.employment.length > 0) {
    checkY(20);
    y -= 4;
    text("EMPLOYMENT HISTORY", margin, 9, bold, GREEN);
    y -= 4;
    for (const job of profile.employment) {
      checkY(60);
      text((job.title || "Position") + " — " + (job.employer || "Employer"), margin, 10, bold);
      if (job.start || job.end) text((job.start||"") + " to " + (job.end||"Present"), margin+10, 9, italic, GRAY);
      if (job.supervisor) text("Supervisor: " + job.supervisor + (job.phone ? "  |  " + job.phone : ""), margin+10, 9, reg, GRAY);
      y -= 6;
    }
  }

  // References
  if (form.prefill_fields.includes("references") && profile.references && profile.references.length > 0) {
    checkY(20);
    y -= 4;
    text("REFERENCES", margin, 9, bold, GREEN);
    y -= 4;
    for (const ref of profile.references) {
      checkY(40);
      text((ref.name||"Name") + " — " + (ref.relationship||""), margin, 10, bold);
      const contact = [ref.phone, ref.email].filter(Boolean).join("  |  ");
      if (contact) text(contact, margin+10, 9, reg, GRAY);
      y -= 6;
    }
  }

  // ── You fill in section ───────────────────────────────────────────────────
  checkY(60);
  y -= 10;
  hRule(page, margin, y, width);
  y -= 16;
  text("YOU FILL IN — SENSITIVE INFORMATION", margin, 10, bold, RED_DIM);
  text("Complete these fields yourself. Do not share this information with anyone you don't trust.", margin, 8, italic, GRAY, width);
  y -= 10;

  for (const field of form.user_must_fill) {
    checkY(field.lines * 22 + 20);
    text(field.label, margin, 10, bold, BLACK);
    for (let i = 0; i < field.lines; i++) {
      y -= 4;
      blankLine(page, margin, y, width);
      y -= 18;
    }
    y -= 4;
  }

  // ── Gap notice ────────────────────────────────────────────────────────────
  if (gaps.length > 0) {
    checkY(60);
    y -= 6;
    hRule(page, margin, y, width);
    y -= 14;
    text("NOTE FROM CLEARPATH", margin, 9, bold, GRAY);
    text("The following information could not be pre-filled because it wasn't in your profile:", margin, 9, reg, GRAY, width);
    y -= 4;
    text(describeGaps(gaps) + ".", margin+10, 9, italic, GRAY, width - 10);
    text("Visit Clearpath to add this to your profile so future forms fill in completely.", margin, 9, reg, GRAY, width);
  }

  // ── Documents to bring ────────────────────────────────────────────────────
  if (form.bring_to_office && form.bring_to_office.length > 0) {
    checkY(80);
    y -= 10;
    hRule(page, margin, y, width);
    y -= 16;
    text("BRING THESE DOCUMENTS TO THE OFFICE", margin, 10, bold, BLACK);
    y -= 4;

    // Check which ones they already have
    const have = new Set((profile.documents_available || []).map(d => d.toLowerCase()));
    for (const doc of form.bring_to_office) {
      checkY(20);
      const hasIt = Array.from(have).some(h => doc.toLowerCase().includes(h) || h.includes(doc.toLowerCase().split(" ")[0]));
      const marker = hasIt ? "✓ " : "□ ";
      const color  = hasIt ? GREEN : BLACK;
      text(marker + doc, margin + 10, 10, reg, color, width - 10);
    }
  }

  // ── Where to apply ────────────────────────────────────────────────────────
  if (form.apply_online || form.office_locator) {
    checkY(60);
    y -= 10;
    hRule(page, margin, y, width);
    y -= 14;
    text("WHERE TO APPLY", margin, 10, bold, BLACK);
    if (form.apply_online)    text("Online: " + form.apply_online,   margin, 9, reg, GRAY, width);
    if (form.office_locator)  text("Find an office: " + form.office_locator, margin, 9, reg, GRAY, width);
    if (form.important_note)  { y-=4; text("⚠ " + form.important_note, margin, 9, italic, RED_DIM, width); }
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  checkY(40);
  y -= 16;
  hRule(page, margin, y, width);
  y -= 12;
  text("Generated by Clearpath — a free public resource. clearpath.app", margin, 8, italic, GRAY);
  text("This form is a preparation aid only. It is not an official government document.", margin, 8, italic, GRAY);

  return await doc.save();
}
