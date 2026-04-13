import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = [
  "You are Maya, a compassionate benefits navigator for Clearpath.",
  "Help someone struggling financially find programs they qualify for and feel genuinely supported.",
  "PERSONALITY: Warm, calm, non-judgmental. Plain language only.",
  "RULES:",
  "- Ask ONE question at a time. Acknowledge each answer before moving on.",
  "- Collect: first name, state, household size and ages, monthly income, employment status, housing situation, any current benefits.",
  "- Once you have all of that, output a JSON block inside a code fence tagged 'programs'.",
  "OUTPUT FORMAT (a code fence opened with three backticks followed immediately by the word programs):",
  "{",
  '  "profile_summary": "Short description",',
  '  "programs": [{"name":"SNAP","category":"food","description":"...","estimated_value":"~$600/mo","how_to_apply":"...","documents_needed":["ID","Proof of income"],"urgency":"high"}],',
  '  "jobs": ["tip1"],',
  '  "banking": ["tip1"],',
  '  "housing": ["tip1"]',
  "}",
  "Categories: food, health, cash, housing, utilities, childcare, employment, banking",
  "Urgency: high, medium, low",
  "Start by introducing yourself and asking for their first name.",
].join("\n");

const CAT_ICON  = { food:"🛒", health:"🏥", cash:"💵", housing:"🏠", utilities:"💡", childcare:"👶", employment:"💼", banking:"🏦" };
const CAT_COLOR = { food:"#2d6a4f", health:"#0369a1", cash:"#6d28d9", housing:"#b45309", utilities:"#065f46", childcare:"#be185d", employment:"#1e40af", banking:"#374151" };
const CAT_BG    = { food:"#eef5f1", health:"#f0f9ff", cash:"#f5f3ff", housing:"#fef3c7", utilities:"#ecfdf5", childcare:"#fdf2f8", employment:"#eff6ff", banking:"#f9fafb" };
const URG_LABEL = { high:"Apply now", medium:"Soon", low:"When ready" };
const URG_FG    = { high:"#b91c1c", medium:"#b45309", low:"#9a9088" };
const URG_BG    = { high:"#fef2f2", medium:"#fef3c7", low:"#f0ede8" };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 700);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function Card({ p }) {
  const [open, setOpen] = useState(false);
  const icon = CAT_ICON[p.category]  || "📋";
  const cc   = CAT_COLOR[p.category] || "#374151";
  const cb   = CAT_BG[p.category]    || "#f9fafb";
  const ufg  = URG_FG[p.urgency]    || "#9a9088";
  const ubg  = URG_BG[p.urgency]    || "#f0ede8";
  const ulbl = URG_LABEL[p.urgency] || "When ready";
  return (
    <div style={{ marginBottom:8, borderRadius:10, overflow:"hidden", border:"1px solid #e8e2d9" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ background:"#fff", padding:"11px 13px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, userSelect:"none" }}
      >
        <div style={{ width:34, height:34, borderRadius:8, background:cb, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#1c1916", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
          {p.estimated_value && <div style={{ fontSize:11, color:cc, marginTop:1 }}>{p.estimated_value}</div>}
        </div>
        <span style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", padding:"2px 8px", borderRadius:99, color:ufg, background:ubg, flexShrink:0 }}>{ulbl}</span>
        <span style={{ fontSize:12, color:"#9a9088", flexShrink:0, marginLeft:2 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ background:"#fff", borderTop:"1px solid #e8e2d9", padding:"13px" }}>
          <p style={{ fontSize:13, color:"#5a5248", lineHeight:1.65, marginBottom:12 }}>{p.description}</p>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", color:"#9a9088", fontWeight:600, marginBottom:5 }}>How to apply</div>
            <div style={{ fontSize:13, color:"#5a5248", lineHeight:1.5 }}>{p.how_to_apply}</div>
          </div>
          <div>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", color:"#9a9088", fontWeight:600, marginBottom:5 }}>Documents needed</div>
            {(p.documents_needed || []).map((d, i) => (
              <div key={i} style={{ fontSize:13, color:"#5a5248", lineHeight:1.5, display:"flex", gap:6, marginBottom:3 }}>
                <span style={{ color:cc, flexShrink:0 }}>·</span><span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Steps({ title, icon, items }) {
  if (!items || !items.length) return null;
  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <span>{icon}</span>
        <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#9a9088" }}>{title}</span>
      </div>
      {items.map((s, i) => (
        <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
          <div style={{ width:20, height:20, borderRadius:"50%", background:"#eef5f1", color:"#2d6a4f", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</div>
          <span style={{ fontSize:13, color:"#5a5248", lineHeight:1.55 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function ResourcesPanel({ data, tab, setTab }) {
  const progs = data && data.programs ? data.programs : [];
  if (!data) {
    return (
      <div style={{ padding:"28px 20px", textAlign:"center" }}>
        <div style={{ width:48, height:48, borderRadius:12, background:"#eef5f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 14px" }}>📋</div>
        <div style={{ fontFamily:"'Lora',serif", fontSize:16, color:"#1c1916", marginBottom:6 }}>Your resources will appear here</div>
        <div style={{ fontSize:13, color:"#9a9088", lineHeight:1.6, marginBottom:22 }}>As Maya learns your situation, she will identify every program you likely qualify for.</div>
        {["Food assistance","Health insurance","Housing help","Cash benefits","Job training","Banking access"].map(r => (
          <div key={r} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, background:"#fff", border:"1px solid #e8e2d9", marginBottom:6, textAlign:"left" }}>
            <div style={{ width:14, height:3, background:"#e8e2d9", borderRadius:2 }} />
            <span style={{ fontSize:12, color:"#9a9088" }}>{r}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"13px 20px", background:"#eef5f1", borderBottom:"1px solid #d5ebe0", flexShrink:0 }}>
        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:"#2d6a4f", fontWeight:600, marginBottom:3 }}>Your profile</div>
        <div style={{ fontSize:13, color:"#5a5248", lineHeight:1.5 }}>{data.profile_summary}</div>
      </div>
      <div style={{ display:"flex", background:"#fff", borderBottom:"1px solid #e8e2d9", padding:"0 20px", flexShrink:0 }}>
        {["programs","next steps"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ background:"none", border:"none", borderBottom:tab===t?"2px solid #2d6a4f":"2px solid transparent", padding:"11px 12px 9px", fontSize:12, fontWeight:600, textTransform:"capitalize", color:tab===t?"#2d6a4f":"#9a9088", cursor:"pointer", marginBottom:-1 }}
          >
            {t === "programs" ? "Programs (" + progs.length + ")" : "Next Steps"}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
        {tab === "programs" ? (
          <div>
            <p style={{ fontSize:12, color:"#9a9088", marginBottom:12, lineHeight:1.5 }}>Tap any program to see details and what documents you will need.</p>
            {progs.map((p, i) => <Card key={i} p={p} />)}
          </div>
        ) : (
          <div>
            <Steps title="Jobs & Employment" icon="💼" items={data.jobs} />
            <Steps title="Banking Access"    icon="🏦" items={data.banking} />
            <Steps title="Housing"           icon="🏠" items={data.housing} />
          </div>
        )}
      </div>
      <div style={{ padding:"12px 20px", borderTop:"1px solid #e8e2d9", background:"#fff", flexShrink:0 }}>
        <button
          onClick={() => window.print()}
          style={{ width:"100%", padding:"9px", borderRadius:8, border:"1px solid #e8e2d9", background:"#f7f4ef", color:"#5a5248", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
        >
          📄 Print your resource summary
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [msgs,    setMsgs]    = useState([{ role:"assistant", content:"Hi, I'm Maya. I'm here to help you find every resource, program, and benefit available to you — and make the whole process feel a lot less overwhelming.\n\nNo judgment here, just practical help.\n\nCan I start with your first name?" }]);
  const [input,   setInput]   = useState("");
  const [busy,    setBusy]    = useState(false);
  const [data,    setData]    = useState(null);
  const [resTab,  setResTab]  = useState("programs");
  // Mobile: which top-level view is shown — "chat" or "resources"
  const [mobileView, setMobileView] = useState("chat");

  const isMobile = useIsMobile();
  const endRef   = useRef(null);
  const taRef    = useRef(null);

  useEffect(() => {
    endRef.current && endRef.current.scrollIntoView({ behavior:"smooth" });
  }, [msgs, busy]);

  // When resources first arrive on mobile, nudge user to the resources tab
  useEffect(() => {
    if (data && isMobile) setMobileView("resources");
  }, [data]);

  function parseBlock(text) {
    const m = text.match(/```programs\s*\n([\s\S]*?)```/);
    if (m) {
      try { setData(JSON.parse(m[1].trim())); } catch(e) { console.error(e); }
      return text.replace(/```programs[\s\S]*?```/, "").trim();
    }
    return text;
  }

  async function submit() {
    const txt = input.trim();
    if (!txt || busy) return;
    const next = msgs.concat([{ role:"user", content:txt }]);
    setMsgs(next);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setBusy(true);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: next.map(m => ({ role:m.role, content:m.content }))
        })
      });
      const json  = await res.json();
      const raw   = (json.content && json.content[0] && json.content[0].text) || "Something went wrong — please try again.";
      const clean = parseBlock(raw);
      if (clean) setMsgs(prev => prev.concat([{ role:"assistant", content:clean }]));
    } catch(e) {
      setMsgs(prev => prev.concat([{ role:"assistant", content:"Connection error — please try again." }]));
    }
    setBusy(false);
  }

  const canSend = input.trim().length > 0 && !busy;

  // ── Shared sub-sections ───────────────────────────────────────────────────

  const ChatMessages = (
    <div style={{ flex:1, overflowY:"auto", padding:"22px 16px 12px" }}>
      {msgs.map((m, i) => (
        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start", marginBottom:14 }}>
          {m.role === "assistant" && (
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"#d5ebe0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#2d6a4f" }}>M</div>
              <span style={{ fontSize:12, fontWeight:600, color:"#9a9088" }}>Maya</span>
            </div>
          )}
          <div style={{
            maxWidth:"80%",
            padding: m.role==="user" ? "10px 14px" : "12px 16px",
            borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
            background: m.role==="user" ? "#2d6a4f" : "#fff",
            border: m.role==="user" ? "none" : "1px solid #e8e2d9",
            color: m.role==="user" ? "#fff" : "#1c1916",
            fontSize:14, lineHeight:1.65, whiteSpace:"pre-wrap",
            fontFamily: m.role==="assistant" ? "'Lora',serif" : "system-ui,sans-serif",
          }}>
            {m.content}
          </div>
        </div>
      ))}
      {busy && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:"#d5ebe0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#2d6a4f" }}>M</div>
            <span style={{ fontSize:12, fontWeight:600, color:"#9a9088" }}>Maya</span>
          </div>
          <div style={{ padding:"11px 14px", borderRadius:"4px 16px 16px 16px", background:"#fff", border:"1px solid #e8e2d9", display:"flex", gap:5, alignItems:"center" }}>
            {[0,1,2].map(n => <div key={n} style={{ width:6, height:6, borderRadius:"50%", background:"#2d6a4f", animation:"blink 1.1s ease "+(n*0.18)+"s infinite" }} />)}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );

  const ChatInput = (
    <div style={{ padding:"12px 16px 16px", borderTop:"1px solid #e8e2d9", background:"#fff", flexShrink:0 }}>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:"#f7f4ef", border:"1.5px solid #e8e2d9", borderRadius:12, padding:"6px 6px 6px 14px" }}>
        <textarea
          ref={taRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
          placeholder="Type your answer…"
          rows={1}
          style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontFamily:"system-ui,sans-serif", fontSize:14, color:"#1c1916", lineHeight:1.6, padding:"7px 0", maxHeight:120 }}
        />
        <button
          onClick={submit}
          disabled={!canSend}
          style={{ width:36, height:36, borderRadius:8, border:"none", flexShrink:0, background:canSend?"#2d6a4f":"#e8e2d9", color:"#fff", fontSize:15, cursor:canSend?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center" }}
        >↑</button>
      </div>
      <div style={{ textAlign:"center", fontSize:11, color:"#9a9088", marginTop:6 }}>Enter to send · Shift+Enter for new line</div>
    </div>
  );

  // ── MOBILE layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#f7f4ef", fontFamily:"system-ui,sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap');
          * { box-sizing:border-box; margin:0; padding:0; }
          @keyframes blink { 0%,100%{opacity:.25} 50%{opacity:1} }
          textarea::placeholder { color:#9a9088; }
          ::-webkit-scrollbar { width:4px; }
          ::-webkit-scrollbar-thumb { background:#e8e2d9; border-radius:4px; }
        `}</style>

        {/* Mobile header */}
        <div style={{ height:54, background:"#fff", borderBottom:"1px solid #e8e2d9", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"#eef5f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🌿</div>
            <span style={{ fontFamily:"'Lora',serif", fontSize:17, fontWeight:600, color:"#1c1916" }}>Clearpath</span>
          </div>
          <span style={{ fontSize:11, color:"#9a9088" }}>🔒 Confidential</span>
        </div>

        {/* Mobile top tabs: Chat / Resources */}
        <div style={{ display:"flex", background:"#fff", borderBottom:"1px solid #e8e2d9", flexShrink:0 }}>
          {["chat","resources"].map(v => (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              style={{ flex:1, background:"none", border:"none", borderBottom:mobileView===v?"3px solid #2d6a4f":"3px solid transparent", padding:"12px 0 9px", fontSize:13, fontWeight:600, textTransform:"capitalize", color:mobileView===v?"#2d6a4f":"#9a9088", cursor:"pointer", position:"relative" }}
            >
              {v === "resources" ? "My Resources" : "Chat with Maya"}
              {v === "resources" && data && (
                <span style={{ marginLeft:6, fontSize:10, background:"#2d6a4f", color:"#fff", borderRadius:99, padding:"1px 6px", fontWeight:700 }}>
                  {(data.programs||[]).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile content */}
        {mobileView === "chat" ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {ChatMessages}
            {ChatInput}
          </div>
        ) : (
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <ResourcesPanel data={data} tab={resTab} setTab={setResTab} />
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP layout ────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#f7f4ef", fontFamily:"system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes blink { 0%,100%{opacity:.25} 50%{opacity:1} }
        textarea::placeholder { color:#9a9088; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#e8e2d9; border-radius:4px; }
      `}</style>

      <div style={{ height:54, background:"#fff", borderBottom:"1px solid #e8e2d9", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"#eef5f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🌿</div>
          <span style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:600, color:"#1c1916" }}>Clearpath</span>
        </div>
        <span style={{ fontSize:11, color:"#9a9088" }}>🔒 Private &amp; confidential</span>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid #e8e2d9", minWidth:0 }}>
          {ChatMessages}
          {ChatInput}
        </div>
        <div style={{ width:380, flexShrink:0, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f7f4ef" }}>
          <ResourcesPanel data={data} tab={resTab} setTab={setResTab} />
        </div>
      </div>
    </div>
  );
}
