import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, ReferenceLine, Cell
} from "recharts";

const ANOV_DATA = [
  { year: "2018", Smoking: 1958, Alcohol: 958, "Fare Evasion": 550, "Unsafe Conduct": 231, "Soliciting/Begging": 160, "Trespass (Other)": 122, Loitering: 30, "Vending/Hawking": 136, "Unknown/Unmatched": 1308, Other: 1093, total: 6546 },
  { year: "2019", Smoking: 2754, Alcohol: 1335, "Fare Evasion": 1078, "Unsafe Conduct": 292, "Soliciting/Begging": 184, "Trespass (Other)": 98, Loitering: 41, "Vending/Hawking": 199, "Unknown/Unmatched": 725, Other: 1042, total: 7748 },
  { year: "2020", Smoking: 2288, Alcohol: 1028, "Fare Evasion": 526, "Unsafe Conduct": 315, "Soliciting/Begging": 105, "Trespass (Other)": 53, Loitering: 24, "Vending/Hawking": 68, "Unknown/Unmatched": 768, Other: 635, total: 5810 },
  { year: "2021", Smoking: 2022, Alcohol: 1129, "Fare Evasion": 512, "Unsafe Conduct": 185, "Soliciting/Begging": 37, "Trespass (Other)": 31, Loitering: 16, "Vending/Hawking": 22, "Unknown/Unmatched": 814, Other: 857, total: 5625 },
  { year: "2022", Smoking: 1757, Alcohol: 725, "Fare Evasion": 381, "Unsafe Conduct": 223, "Soliciting/Begging": 14, "Trespass (Other)": 9, Loitering: 17, "Vending/Hawking": 23, "Unknown/Unmatched": 429, Other: 611, total: 4189 },
  { year: "2023", Smoking: 3880, Alcohol: 2173, "Fare Evasion": 1382, "Unsafe Conduct": 775, "Soliciting/Begging": 29, "Trespass (Other)": 42, Loitering: 116, "Vending/Hawking": 73, "Unknown/Unmatched": 754, Other: 1563, total: 10787 },
  { year: "2024", Smoking: 3664, Alcohol: 2452, "Fare Evasion": 1887, "Unsafe Conduct": 932, "Soliciting/Begging": 34, "Trespass (Other)": 41, Loitering: 148, "Vending/Hawking": 37, "Unknown/Unmatched": 473, Other: 2375, total: 12043 },
  { year: "2025", Smoking: 4364, Alcohol: 2979, "Fare Evasion": 2475, "Unsafe Conduct": 1218, "Soliciting/Begging": 78, "Trespass (Other)": 29, Loitering: 611, "Vending/Hawking": 61, "Unknown/Unmatched": 1434, Other: 4791, total: 18040 },
];

const ARREST_DATA = [
  { year: "2018", Felony: 46, Misdemeanor: 131, Other: 201, total: 378 },
  { year: "2019", Felony: 54, Misdemeanor: 136, Other: 246, total: 436 },
  { year: "2020", Felony: 57, Misdemeanor: 70, Other: 195, total: 322 },
  { year: "2021", Felony: 34, Misdemeanor: 35, Other: 122, total: 191 },
  { year: "2022", Felony: 77, Misdemeanor: 75, Other: 258, total: 410 },
  { year: "2023", Felony: 128, Misdemeanor: 469, Other: 730, total: 1327 },
  { year: "2024", Felony: 148, Misdemeanor: 268, Other: 1404, total: 1820 },
  { year: "2025", Felony: 134, Misdemeanor: 204, Other: 1233, total: 1571 },
];

const FARE_VS_TOTAL = ANOV_DATA.map(d => ({
  year: d.year,
  "Fare Evasion": d["Fare Evasion"],
  "% Fare Evasion": Math.round((d["Fare Evasion"] / d.total) * 100),
}));

const CAT_COLORS = {
  Smoking:              "#4A7FB5",
  Alcohol:              "#7B5EA7",
  "Fare Evasion":       "#D4882A",
  "Unsafe Conduct":     "#C0622A",
  "Soliciting/Begging": "#3A8E7E",
  "Trespass (Other)":   "#A84848",
  Loitering:            "#5E8C4E",
  "Vending/Hawking":    "#8C7A4E",
  "Unknown/Unmatched":  "#B0BEC5",
  Other:                "#CFD8DC",
};

const C = {
  bg:      "#F4F6F9",
  surface: "#FFFFFF",
  border:  "#DDE3EC",
  text:    "#1C2B3A",
  muted:   "#5A6A7A",
  subtle:  "#8E9EAE",
  amber:   "#C8801E",
  red:     "#B03030",
  blue:    "#2860A0",
  green:   "#2A7A52",
  purple:  "#6040A0",
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 12, fontFamily: "system-ui" }}>
      <div style={{ color: C.amber, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: C.text, marginBottom: 2 }}>
          <span style={{ color: p.color, marginRight: 6 }}>●</span>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</b>
        </div>
      ))}
    </div>
  );
};

const TABS = ["ANOVs Overview", "By Violation Type", "Arrests", "Fare Evasion Share", "FOIA Status"];

export default function App() {
  const [tab, setTab] = useState(0);

  const card = (label, value, sub, accent) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${accent}`, borderRadius: 8, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 10, color: C.subtle, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
    </div>
  );

  const finding = (accent, label, children) => (
    <div style={{ marginTop: 20, background: C.surface, border: `1px solid ${C.border}`, borderLeft: `4px solid ${accent}`, borderRadius: "0 8px 8px 0", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 10, color: accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.85 }}>{children}</div>
    </div>
  );

  const wrap = (children) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {children}
    </div>
  );

  const ax = { fill: C.subtle, fontSize: 11, fontFamily: "system-ui" };
  const gr = { strokeDasharray: "3 3", stroke: C.border };

  const FOIA_RECORDS = [
    {
      agency: "Chicago Police Department",
      ref: "P166396",
      contact: "R. Earnshaw, FOIA Officer",
      filed: "April 13, 2026",
      status: "PARTIAL — AG COMPLAINT FILED",
      accent: C.red,
      detail: "Citation and arrest data produced. Budget and activity records (Record Sets 1 & 2) not produced, no statutory exemption cited. AG Public Access Counselor complaint filed.",
      consultation: false,
    },
    {
      agency: "Dept. of Finance",
      ref: "F136682-042126",
      contact: "April Lundberg, FOIA Officer",
      filed: "April 21, 2026",
      status: "EXTENSION — DUE COB MAY 4",
      accent: C.amber,
      detail: "Extension invoked April 21 — one business day after receipt — citing consultation with another public body under 5 ILCS 140/3(e). Response due COB May 4, 2026.",
      consultation: true,
    },
    {
      agency: "Dept. of Administrative Hearings",
      ref: "Closed",
      contact: "Tracy (FOIA Liaison)",
      filed: "April 13, 2026",
      status: "CLOSED — NO RECORDS",
      accent: C.subtle,
      detail: "FOIA liaison confirmed DOAH does not collect fines and holds no collection records. Referred requester to Department of Finance. No further action required.",
      consultation: false,
    },
    {
      agency: "Cook County Sheriff's Office",
      ref: "R091132-041326",
      contact: "Tracy Ho, Asst. General Counsel",
      filed: "April 13, 2026",
      status: "EXTENSION — DUE APRIL 27",
      accent: C.amber,
      detail: "Extension invoked citing consultation with another public body under 5 ILCS 140/3(e). Response due April 27, 2026. Sheriff's own deployment records require no external consultation unless a third party has a stake in what is released.",
      consultation: true,
    },
    {
      agency: "Chicago Transit Authority",
      ref: "R002355-041326",
      contact: "Haley Lowrance, FOIA Officer",
      filed: "April 13, 2026",
      status: "EXTENSION — DEADLINE NOT STATED",
      accent: C.amber,
      detail: "Extension invoked citing consultation with another public body under 5 ILCS 140/3(e). No response deadline provided — a defect in the notice. CTA is the central party in this investigation and still required outside consultation before responding about its own records.",
      consultation: true,
    },
  ];

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "24px 32px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
          Active Investigation · Chicago Public Media / PolicyTorque · Data through April 21, 2026
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          CTA Transit Enforcement Audit
        </div>
        <div style={{ fontSize: 12, color: C.muted, maxWidth: 680, lineHeight: 1.75 }}>
          CPD Transit Unit citation and arrest activity, 2018 to present. Budget, cost, and revenue
          records requested across five agencies. Three of five invoked the identical statutory
          consultation extension within eight days of each other.{" "}
          <span style={{ color: C.red, fontWeight: 600 }}>Cost-side data remains unavailable.</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 32px", overflowX: "auto" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "13px 18px 11px", fontSize: 11, letterSpacing: 1,
            textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 600,
            color: tab === i ? C.blue : C.subtle,
            borderBottom: tab === i ? `2px solid ${C.blue}` : "2px solid transparent",
            whiteSpace: "nowrap", transition: "color 0.15s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "28px 32px 48px" }}>

        {/* TAB 0 */}
        {tab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
              {card("Peak Year ANOVs", "18,040", "2025 — all-time high", C.amber)}
              {card("Trough Year ANOVs", "4,189", "2022 — pre-surge baseline", C.subtle)}
              {card("Increase 2022→2025", "+331%", "in three years", C.red)}
              {card("Cost Data Produced", "$0", "withheld across all agencies", C.red)}
            </div>
            <div style={{ fontSize: 11, color: C.subtle, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Total ANOVs by Year</div>
            {wrap(
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ANOV_DATA} barSize={30}>
                  <CartesianGrid {...gr} />
                  <XAxis dataKey="year" tick={ax} />
                  <YAxis tick={ax} tickFormatter={v => v.toLocaleString()} />
                  <Tooltip content={Tip} />
                  <ReferenceLine x="2023" stroke={C.border} strokeWidth={2} label={{ value: "FTA pressure begins →", fill: C.subtle, fontSize: 9, position: "insideTopLeft" }} />
                  <Bar dataKey="total" name="Total ANOVs" radius={[3, 3, 0, 0]}>
                    {ANOV_DATA.map((d, i) => <Cell key={i} fill={d.year >= "2023" ? C.amber : "#B8CADD"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {finding(C.amber, "The Pattern", <>Enforcement volume collapsed to a trough of <b style={{color:C.text}}>4,189 ANOVs in 2022</b>, then surged 331% to <b style={{color:C.amber}}>18,040 in 2025</b>. The inflection point is 2023, coinciding with the FTA's $50M grant threat and the Cook County Sheriff deployment to CTA rail lines. The enforcement machine was switched on — but no cost data was produced by any agency to explain what it costs to run.</>)}
          </div>
        )}

        {/* TAB 1 */}
        {tab === 1 && (
          <div>
            <div style={{ fontSize: 11, color: C.subtle, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>ANOVs by Violation Category — 2018 to 2025</div>
            {wrap(
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={ANOV_DATA} barSize={26}>
                  <CartesianGrid {...gr} />
                  <XAxis dataKey="year" tick={ax} />
                  <YAxis tick={ax} tickFormatter={v => v.toLocaleString()} />
                  <Tooltip content={Tip} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 16 }} />
                  {["Smoking", "Alcohol", "Fare Evasion", "Unsafe Conduct", "Unknown/Unmatched", "Other"].map(cat => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={CAT_COLORS[cat]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
            {finding(C.blue, "Key Finding", <>Smoking is the single largest enforcement category in every year on record. In 2025: <b style={{color:C.text}}>4,364 smoking citations</b> versus <b style={{color:C.amber}}>2,475 fare evasion citations</b>. The enforcement apparatus is primarily a quality-of-life citation machine. If the fiscal argument for enforcement is fare revenue recovery, the citation composition does not support it.</>)}
          </div>
        )}

        {/* TAB 2 */}
        {tab === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
              {card("2022 Arrests", "410", "pre-surge baseline", C.subtle)}
              {card("2024 Arrests", "1,820", "peak year — +344% vs 2022", C.red)}
              {card('"Other" Share, 2024', "77%", "of all arrests — undefined category", C.red)}
            </div>
            <div style={{ fontSize: 11, color: C.subtle, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Arrests by Charge Category</div>
            {wrap(
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ARREST_DATA} barSize={30}>
                  <CartesianGrid {...gr} />
                  <XAxis dataKey="year" tick={ax} />
                  <YAxis tick={ax} />
                  <Tooltip content={Tip} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 16 }} />
                  <Bar dataKey="Felony" stackId="a" fill="#B03030" />
                  <Bar dataKey="Misdemeanor" stackId="a" fill="#7B5EA7" />
                  <Bar dataKey="Other" stackId="a" fill="#B8CADD" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {finding(C.red, "Critical Anomaly", <>The "Other" arrest category — undefined in CPD's response — grew from <b style={{color:C.text}}>258 in 2022</b> to <b style={{color:C.red}}>1,404 in 2024</b>, a 444% increase. Felony arrests grew only 92% over the same period. The surge is concentrated in a charge category with no public definition, beginning precisely when the FTA pressure campaign started. CPD has not explained what "Other" means.</>)}
          </div>
        )}

        {/* TAB 3 */}
        {tab === 3 && (
          <div>
            <div style={{ fontSize: 11, color: C.subtle, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Fare Evasion: Count and Share of Total ANOVs</div>
            {wrap(
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={FARE_VS_TOTAL}>
                  <CartesianGrid {...gr} />
                  <XAxis dataKey="year" tick={ax} />
                  <YAxis yAxisId="count" tick={ax} tickFormatter={v => v.toLocaleString()} />
                  <YAxis yAxisId="pct" orientation="right" tick={{ ...ax, fill: C.blue }} unit="%" domain={[0, 20]} />
                  <Tooltip content={Tip} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 16 }} />
                  <Line yAxisId="count" type="monotone" dataKey="Fare Evasion" stroke={C.amber} strokeWidth={2.5} dot={{ fill: C.amber, r: 4 }} />
                  <Line yAxisId="pct" type="monotone" dataKey="% Fare Evasion" stroke={C.blue} strokeWidth={1.5} strokeDasharray="5 3" dot={{ fill: C.blue, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: C.subtle, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Fare Evasion Citations by Year</div>
              {wrap(
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 90 }}>
                  {FARE_VS_TOTAL.map((d, i) => {
                    const pct = Math.round((d["Fare Evasion"] / 2475) * 100);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div style={{ fontSize: 8, color: C.amber, fontWeight: 600 }}>{d["Fare Evasion"].toLocaleString()}</div>
                        <div style={{ width: "100%", height: `${pct}%`, background: i >= 5 ? C.amber : "#B8CADD", borderRadius: "2px 2px 0 0", minHeight: 4 }} />
                        <div style={{ fontSize: 8, color: C.subtle }}>{d.year}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {finding(C.amber, "The ROI Problem", <>Fare evasion has hovered around <b style={{color:C.text}}>8–14% of all ANOVs</b> across the entire period. Even as total enforcement volume tripled, the share attributable to fare recovery remained roughly constant. Approximately <b style={{color:C.text}}>86% of enforcement activity by citation volume</b> is not directed at fare recovery. The fiscal justification for the apparatus rests on a narrow base — and the revenue side of that equation has not been produced by any agency.</>)}
          </div>
        )}

        {/* TAB 4 — FOIA Status */}
        {tab === 4 && (
          <div>

            {/* Coordination finding banner */}
            <div style={{ background: "#FFF8EE", border: `1px solid ${C.amber}`, borderLeft: `4px solid ${C.amber}`, borderRadius: "0 8px 8px 0", padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                Pattern Finding — Documented in Statutory Record
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.85 }}>
                Three of five agencies — the <b style={{color:C.text}}>Department of Finance</b>, the <b style={{color:C.text}}>Cook County Sheriff's Office</b>, and the <b style={{color:C.text}}>Chicago Transit Authority</b> — each invoked the identical statutory consultation extension under 5 ILCS 140/3(e), citing the need to consult <b style={{color:C.text}}>another public body</b>, within eight days of each other, in response to requests filed the same day. No allegation of coordination is required. The extension notices speak for themselves.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 0 }}>
              {FOIA_RECORDS.map((f, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${f.accent}`, borderRadius: 8, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{f.agency}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      {f.consultation && (
                        <div style={{ fontSize: 8, color: C.amber, background: "#FFF3DC", border: `1px solid ${C.amber}`, borderRadius: 3, padding: "2px 6px", fontWeight: 700, letterSpacing: 1 }}>CONSULTATION</div>
                      )}
                      <div style={{ fontSize: 8, color: f.accent, background: `${f.accent}12`, border: `1px solid ${f.accent}40`, borderRadius: 4, padding: "3px 8px", letterSpacing: 1, fontWeight: 700, whiteSpace: "nowrap" }}>{f.status}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: C.subtle, marginBottom: 4, letterSpacing: 1 }}>REF: {f.ref}</div>
                  <div style={{ fontSize: 10, color: C.subtle, marginBottom: 8 }}>{f.contact} · Filed {f.filed}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65 }}>{f.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
