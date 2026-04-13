// pages/api/generate-pdf.js
//
// Generates a pre-filled PDF form and streams it back to the browser.
// The profile is sent from the client — we generate the PDF and return it.
// Nothing is stored server-side.

import { generateFormPDF } from "../../lib/forms/generatePdf.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { formId, profile } = req.body;
  if (!formId || !profile) {
    return res.status(400).json({ error: "formId and profile required" });
  }

  try {
    const pdfBytes = await generateFormPDF(formId, profile);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="clearpath-${formId}.pdf"`);
    res.setHeader("Content-Length", pdfBytes.length);

    // Explicitly no caching — user data should never be cached server-side
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF generation error:", err.message);
    return res.status(500).json({ error: "Could not generate PDF. Please try again." });
  }
}
