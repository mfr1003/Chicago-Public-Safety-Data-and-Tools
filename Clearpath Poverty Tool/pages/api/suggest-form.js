// pages/api/suggest-form.js
//
// Receives a form suggestion from a user and logs it.
// No user data is attached — just the suggestion text and state.
// In production, connect this to Airtable, a GitHub issue, or email.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { suggestion, state } = req.body;
  if (!suggestion || suggestion.trim().length < 5) {
    return res.status(400).json({ error: "Please describe the form or program." });
  }

  // Log to console for now — in production replace this with:
  //   - Airtable API call
  //   - GitHub Issues API
  //   - Simple email via Resend/Postmark
  console.log("[FORM SUGGESTION]", {
    suggestion: suggestion.trim(),
    state: state || "not specified",
    timestamp: new Date().toISOString(),
  });

  // TODO: Replace with your chosen storage mechanism
  // Example Airtable:
  // await fetch("https://api.airtable.com/v0/YOUR_BASE/Suggestions", {
  //   method: "POST",
  //   headers: { Authorization: "Bearer " + process.env.AIRTABLE_KEY, "Content-Type": "application/json" },
  //   body: JSON.stringify({ fields: { Suggestion: suggestion, State: state } })
  // });

  return res.status(200).json({ ok: true });
}
