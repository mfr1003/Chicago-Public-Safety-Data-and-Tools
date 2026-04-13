// pages/index.js
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { FORMS } from "../lib/forms/index.js";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:       "#f7f4ef",
  surface:  "#ffffff",
  border:   "#e8e2d9",
  text:     "#1c1916",
  mid:      "#5a5248",
  dim:      "#9a9088",
  accent:   "#2d6a4f",
  accentBg: "#eef5f1",
  accentLt: "#d5ebe0",
  userBg:   "#2d6a4f",
  red:      "#b91c1c",
  redBg:    "#fef2f2",
  amber:    "#b45309",
  amberBg:  "#fef3c7",
};

const CAT_ICON  = { food:"🛒", health:"🏥", cash:"💵", housing:"🏠", utilities:"💡", childcare:"👶", employment:"💼", banking:"🏦" };
const CAT_COLOR = { food:"#2d6a4f", health:"#0369a1", cash:"#6d28d9", housing:"#b45309", utilities:"#065f46", childcare:"#be185d", employment:"#1e40af", banking:"#374151" };
const CAT_BG    = { food:"#eef5f1", health:"#f0f9ff", cash:"#f5f3ff", housing:"#fef3c7", utilities:"#ecfdf5", childcare:"#fdf2f8", employment:"#eff6ff", banking:"#f9fafb" };
const URG = {
  high:   { label:"Apply now",  fg:"#b91c1c", bg:"#fef2f2" },
  medium: { label:"Soon",       fg:"#b45309", bg:"#fef3c7" },
  low:    { label:"When ready", fg:"#9a9088", bg:"#f0ede8" },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function parseBlocks(text) {
  let profile = null;
  let programs = null;
  let clean = text;

  const profileMatch = clean.match(/```profile\s*\n([\s\S]*?)```/);
  if (profileMatch) {
    try { profile = JSON.parse(profileMatch[1].trim()); } catch(e) {}
    clean = clean.replace(/```profile[\s\S]*?```/, "").trim();
  }

  const programsMatch = clean.match(/```programs\s*\n([\s\S]*?)```/);
  if (programsMatch) {
    try { programs = JSON.parse(programsMatch[1].trim()); } catch(e) {}
    clean = clean.replace(/```programs[\s\S]*?```/, "").trim();
  }

  return { clean, profile, programs };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ProgramCard({ p, profile }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const icon = CAT_ICON[p.category]  || "📋";
  const cc   = CAT_COLOR[p.category] || "#374151";
  const cb   = CAT_BG[p.category]    || "#f9fafb";
  const urg  = URG[p.urgency]        || URG.low;
  const hasForm = p.form_available && FORMS[p.id];

  async function downloadForm() {
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: p.id, profile: profile || {} }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = "clearpath-" + p.id + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
      alert("Could not generate PDF. Please try again.");
    }
    setDownloading(false);
  }

  return (
    <div style={{ marginBottom:8, borderRadius:10, overflow:"hidden", border:"1px solid " + C.border }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ background:C.surface, padding:"11px 13px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, userSelect:"none" }}
      >
        <div style={{ width:34, height:34, borderRadius:8, background:cb, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
          {p.estimated_value && <div style={{ fontSize:11, color:cc, marginTop:1 }}>{p.estimated_value}</div>}
        </div>
        <span style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", padding:"2px 8px", borderRadius:99, color:urg.fg, background:urg.bg, flexShrink:0 }}>{urg.label}</span>
        <span style={{ fontSize:12, color:C.dim, marginLeft:2 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ background:C.surface, borderTop:"1px solid " + C.border, padding:14 }}>
          <p style={{ fontSize:13, color:C.mid, lineHeight:1.65, marginBottom:12 }}>{p.description}</p>

          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", color:C.dim, fontWeight:600, marginBottom:4 }}>How to apply</div>
            <div style={{ fontSize:13, color:C.mid, lineHeight:1.5 }}>{p.how_to_apply}</div>
          </div>

          {hasForm && (
            <button
              onClick={e => { e.stopPropagation(); downloadForm(); }}
              disabled={downloading}
              style={{ marginTop:4, padding:"8px 14px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontSize:12, fontWeight:600, cursor:downloading?"wait":"pointer", display:"flex", alignItems:"center", gap:6 }}
            >
              {downloading ? "Generating…" : "📄 Download pre-filled form"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StepsList({ title, icon, items }) {
  if (!items || !items.length) return null;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
        <span>{icon}</span>
        <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:C.dim }}>{title}</span>
      </div>
      {items.map((s, i) => (
        <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
          <div style={{ width:20, height:20, borderRadius:"50%", background:C.accentBg, color:C.accent, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</div>
          <span style={{ fontSize:13, color:C.mid, lineHeight:1.55 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function SuggestFormModal({ onClose }) {
  const [text, setText]   = useState("");
  const [state, setState] = useState("");
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/suggest-form", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ suggestion: text, state }),
      });
      setSent(true);
    } catch(e) {}
    setBusy(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}>
      <div style={{ background:C.surface, borderRadius:16, padding:24, width:"100%", maxWidth:420, boxShadow:"0 8px 40px rgba(0,0,0,0.15)" }}>
        {sent ? (
          <>
            <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:600, color:C.text, textAlign:"center", marginBottom:8 }}>Thank you</div>
            <div style={{ fontSize:13, color:C.mid, textAlign:"center", lineHeight:1.6, marginBottom:20 }}>Your suggestion helps us build a more complete resource for everyone.</div>
            <button onClick={onClose} style={{ width:"100%", padding:"10px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>Close</button>
          </>
        ) : (
          <>
            <div style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:600, color:C.text, marginBottom:6 }}>Suggest a form or program</div>
            <div style={{ fontSize:13, color:C.mid, marginBottom:16, lineHeight:1.5 }}>What form, program, or resource should we add? Tell us what you needed that wasn't here.</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g. Veterans pension application, state-specific rental assistance in Ohio, utility reconnection programs..."
              rows={4}
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid " + C.border, fontSize:13, fontFamily:"system-ui,sans-serif", color:C.text, resize:"none", outline:"none", marginBottom:10 }}
            />
            <input
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="Your state (optional)"
              style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid " + C.border, fontSize:13, fontFamily:"system-ui,sans-serif", color:C.text, outline:"none", marginBottom:14 }}
            />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid " + C.border, background:C.bg, color:C.mid, fontSize:13, fontWeight:500, cursor:"pointer" }}>Cancel</button>
              <button onClick={submit} disabled={!text.trim()||busy} style={{ flex:2, padding:"10px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontSize:13, fontWeight:600, cursor:text.trim()&&!busy?"pointer":"default" }}>
                {busy ? "Sending…" : "Send suggestion"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResourcesPanel({ programData, profile, tab, setTab, onSuggest }) {
  const progs = programData?.programs || [];

  if (!programData) {
    return (
      <div style={{ padding:"28px 20px", textAlign:"center" }}>
        <div style={{ width:48, height:48, borderRadius:12, background:C.accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 14px" }}>📋</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:16, color:C.text, marginBottom:6 }}>Your resources will appear here</div>
        <div style={{ fontSize:13, color:C.dim, lineHeight:1.6, marginBottom:22 }}>As Maya learns your situation, she will identify every program you likely qualify for — and generate pre-filled forms you can bring to the office.</div>
        {["Food assistance","Health insurance","Housing help","Cash benefits","Job training","Banking access"].map(r => (
          <div key={r} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, background:C.surface, border:"1px solid " + C.border, marginBottom:6, textAlign:"left" }}>
            <div style={{ width:14, height:3, background:C.border, borderRadius:2 }} />
            <span style={{ fontSize:12, color:C.dim }}>{r}</span>
          </div>
        ))}
        <button onClick={onSuggest} style={{ marginTop:16, padding:"8px 16px", borderRadius:8, border:"1px solid " + C.border, background:C.bg, color:C.mid, fontSize:12, cursor:"pointer" }}>
          + Suggest a missing form or program
        </button>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"13px 20px", background:C.accentBg, borderBottom:"1px solid " + C.accentLt, flexShrink:0 }}>
        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:C.accent, fontWeight:600, marginBottom:3 }}>Your situation</div>
        <div style={{ fontSize:13, color:C.mid, lineHeight:1.5 }}>{profile?.first_name ? "Hi " + profile.first_name + ". Here" : "Here"} are the programs and forms ready for you.</div>
      </div>

      <div style={{ display:"flex", background:C.surface, borderBottom:"1px solid " + C.border, padding:"0 20px", flexShrink:0 }}>
        {["programs","next steps"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background:"none", border:"none", borderBottom:tab===t?"2px solid " + C.accent:"2px solid transparent", padding:"11px 12px 9px", fontSize:12, fontWeight:600, textTransform:"capitalize", color:tab===t?C.accent:C.dim, cursor:"pointer", marginBottom:-1 }}>
            {t === "programs" ? "Programs (" + progs.length + ")" : "Next Steps"}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
        {tab === "programs" ? (
          <div>
            <p style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.5 }}>
              Tap any program to expand. Programs with a 📄 button will generate a pre-filled form — you only fill in the sensitive parts yourself.
            </p>
            {progs.map((p, i) => <ProgramCard key={i} p={p} profile={profile} />)}
          </div>
        ) : (
          <div>
            <StepsList title="Jobs & Employment" icon="💼" items={programData.jobs} />
            <StepsList title="Banking Access"    icon="🏦" items={programData.banking} />
            <StepsList title="Housing"           icon="🏠" items={programData.housing} />
          </div>
        )}
      </div>

      <div style={{ padding:"12px 20px", borderTop:"1px solid " + C.border, background:C.surface, flexShrink:0 }}>
        <button onClick={onSuggest} style={{ width:"100%", padding:"9px", borderRadius:8, border:"1px solid " + C.border, background:C.bg, color:C.mid, fontSize:12, fontWeight:500, cursor:"pointer" }}>
          + Suggest a missing form or program
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [msgs,        setMsgs]        = useState([{ role:"assistant", content:"Hi, I'm Maya. I'm here to help you find every benefit, program, and resource available to you — and I can generate pre-filled forms so you walk in with most of the work already done.\n\nWe only collect basic information here. Nothing sensitive — no Social Security numbers, no income details, nothing that could harm you if it were intercepted. The forms we generate leave those fields blank for you to fill in yourself.\n\nYou're welcome to use a nickname or skip your name entirely.\n\nWhat state are you in?" }]);
  const [input,       setInput]       = useState("");
  const [busy,        setBusy]        = useState(false);
  const [profile,     setProfile]     = useState(null);
  const [programData, setProgramData] = useState(null);
  const [tab,         setTab]         = useState("programs");
  const [mobileView,  setMobileView]  = useState("chat");
  const [showSuggest, setShowSuggest] = useState(false);

  const isMobile = useIsMobile();
  const endRef   = useRef(null);
  const taRef    = useRef(null);

  useEffect(() => {
    endRef.current && endRef.current.scrollIntoView({ behavior:"smooth" });
  }, [msgs, busy]);

  useEffect(() => {
    if (programData && isMobile) setMobileView("resources");
  }, [programData]);

  // Save session to sessionStorage (device only, gone when tab closes)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("clearpath_msgs",    JSON.stringify(msgs));
        sessionStorage.setItem("clearpath_profile", JSON.stringify(profile));
        sessionStorage.setItem("clearpath_programs",JSON.stringify(programData));
      } catch(e) {}
    }
  }, [msgs, profile, programData]);

  // Restore session on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const m = sessionStorage.getItem("clearpath_msgs");
        const p = sessionStorage.getItem("clearpath_profile");
        const d = sessionStorage.getItem("clearpath_programs");
        if (m) setMsgs(JSON.parse(m));
        if (p && p !== "null") setProfile(JSON.parse(p));
        if (d && d !== "null") setProgramData(JSON.parse(d));
      } catch(e) {}
    }
  }, []);

  async function send() {
    const txt = input.trim();
    if (!txt || busy) return;
    const next = msgs.concat([{ role:"user", content:txt }]);
    setMsgs(next);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setBusy(true);

    try {
      const res  = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: next.map(m => ({ role:m.role, content:m.content })) }),
      });
      const json = await res.json();
      const raw  = json.text || "Something went wrong — please try again.";

      const { clean, profile: newProfile, programs: newPrograms } = parseBlocks(raw);

      if (newProfile)  setProfile(p  => ({ ...(p||{}), ...newProfile }));
      if (newPrograms) setProgramData(newPrograms);
      if (clean)       setMsgs(prev => prev.concat([{ role:"assistant", content:clean }]));

    } catch(e) {
      setMsgs(prev => prev.concat([{ role:"assistant", content:"Connection error — please try again." }]));
    }
    setBusy(false);
  }

  const ChatMessages = (
    <div style={{ flex:1, overflowY:"auto", padding:"22px 16px 12px" }}>
      {msgs.map((m, i) => (
        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start", marginBottom:14 }}>
          {m.role === "assistant" && (
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:C.accentLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.accent }}>M</div>
              <span style={{ fontSize:12, fontWeight:600, color:C.dim }}>Maya</span>
            </div>
          )}
          <div style={{ maxWidth:"80%", padding:m.role==="user"?"10px 14px":"12px 16px", borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px", background:m.role==="user"?C.userBg:C.surface, border:m.role==="user"?"none":"1px solid " + C.border, color:m.role==="user"?"#fff":C.text, fontSize:14, lineHeight:1.65, whiteSpace:"pre-wrap", fontFamily:m.role==="assistant"?"Georgia,serif":"system-ui,sans-serif" }}>
            {m.content}
          </div>
        </div>
      ))}
      {busy && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:C.accentLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.accent }}>M</div>
            <span style={{ fontSize:12, fontWeight:600, color:C.dim }}>Maya</span>
          </div>
          <div style={{ padding:"11px 14px", borderRadius:"4px 16px 16px 16px", background:C.surface, border:"1px solid " + C.border, display:"flex", gap:5, alignItems:"center" }}>
            {[0,1,2].map(n => <div key={n} style={{ width:6, height:6, borderRadius:"50%", background:C.accent, animation:"blink 1.1s ease "+(n*0.18)+"s infinite" }} />)}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );

  const ChatInput = (
    <div style={{ padding:"12px 16px 16px", borderTop:"1px solid " + C.border, background:C.surface, flexShrink:0 }}>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:C.bg, border:"1.5px solid " + C.border, borderRadius:12, padding:"6px 6px 6px 14px" }}>
        <textarea
          ref={taRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
          onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
          placeholder="Type your answer…"
          rows={1}
          style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontFamily:"system-ui,sans-serif", fontSize:14, color:C.text, lineHeight:1.6, padding:"7px 0", maxHeight:120 }}
        />
        <button onClick={send} disabled={!input.trim()||busy} style={{ width:36, height:36, borderRadius:8, border:"none", flexShrink:0, background:input.trim()&&!busy?C.accent:C.border, color:"#fff", fontSize:15, cursor:input.trim()&&!busy?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center" }}>↑</button>
      </div>
      <div style={{ textAlign:"center", fontSize:11, color:C.dim, marginTop:6 }}>Enter to send · Shift+Enter for new line</div>
    </div>
  );

  const canSend = input.trim().length > 0 && !busy;

  return (
    <>
      <Head>
        <title>Clearpath — Find your benefits</title>
        <meta name="description" content="A free tool to help you find benefits, programs, and generate pre-filled applications. No gatekeeping. No login." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; font-family:system-ui,sans-serif; }
        @keyframes blink { 0%,100%{opacity:.25} 50%{opacity:1} }
        textarea::placeholder { color:${C.dim}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg }}>

        {/* Header */}
        <div style={{ height:54, background:C.surface, borderBottom:"1px solid " + C.border, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:C.accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🌿</div>
            <span style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:600, color:C.text }}>Clearpath</span>
            <span style={{ fontSize:11, color:C.dim, marginLeft:4 }}>Free · No login · No tracking</span>
          </div>
          <span style={{ fontSize:11, color:C.dim }}>🔒 Private</span>
        </div>

        {/* Mobile tabs */}
        {isMobile && (
          <div style={{ display:"flex", background:C.surface, borderBottom:"1px solid " + C.border, flexShrink:0 }}>
            {["chat","resources"].map(v => (
              <button key={v} onClick={() => setMobileView(v)} style={{ flex:1, background:"none", border:"none", borderBottom:mobileView===v?"3px solid "+C.accent:"3px solid transparent", padding:"12px 0 9px", fontSize:13, fontWeight:600, textTransform:"capitalize", color:mobileView===v?C.accent:C.dim, cursor:"pointer", marginBottom:-1 }}>
                {v === "resources" ? "My Resources" : "Chat with Maya"}
                {v === "resources" && programData && (
                  <span style={{ marginLeft:5, fontSize:10, background:C.accent, color:"#fff", borderRadius:99, padding:"1px 6px", fontWeight:700 }}>
                    {(programData.programs||[]).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        {isMobile ? (
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            {mobileView === "chat" ? (
              <>{ChatMessages}{ChatInput}</>
            ) : (
              <ResourcesPanel programData={programData} profile={profile} tab={tab} setTab={setTab} onSuggest={() => setShowSuggest(true)} />
            )}
          </div>
        ) : (
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            <div style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid " + C.border, minWidth:0 }}>
              {ChatMessages}
              {ChatInput}
            </div>
            <div style={{ width:380, flexShrink:0, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <ResourcesPanel programData={programData} profile={profile} tab={tab} setTab={setTab} onSuggest={() => setShowSuggest(true)} />
            </div>
          </div>
        )}
      </div>

      {showSuggest && <SuggestFormModal onClose={() => setShowSuggest(false)} />}
    </>
  );
}
