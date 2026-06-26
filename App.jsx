import { useState, useEffect, useRef } from "react";

// ─── TABS & REGIONS ───────────────────────────────────────────────────────────
const TABS = [
  { id:"dashboard",  icon:"🌍", label:"Accueil"        },
  { id:"vols",       icon:"✈️", label:"Vols"            },
  { id:"hotels",     icon:"🏨", label:"Hôtels"          },
  { id:"transport",  icon:"🚖", label:"Transport / VTC" },
  { id:"meteo",      icon:"⛅", label:"Météo"           },
  { id:"maps",       icon:"🗺️", label:"Navigation"      },
  { id:"localisation",icon:"📍",label:"Ma Localisation" },
  { id:"traducteur", icon:"🌐", label:"Traducteur"      },
  { id:"finance",    icon:"💳", label:"Finance"         },
  { id:"amazon",     icon:"🛒", label:"Amazon Shopping" },
  { id:"guide",      icon:"🧭", label:"Guide & Tourisme"},
  { id:"sante",      icon:"🏥", label:"Santé"           },
  { id:"messages",   icon:"💬", label:"Messages"        },
  { id:"ia",         icon:"🤖", label:"Assistant IA"    },
  { id:"todo",       icon:"✅", label:"Ma To-Do"        },
  { id:"orders",     icon:"📦", label:"Mes Réservations"},
];

const REGIONS = [
  { id:"monde",     label:"🌍 Monde"      },
  { id:"europe",    label:"🇪🇺 Europe"    },
  { id:"suisse",    label:"🇨🇭 Suisse"    },
  { id:"russie",    label:"🇷🇺 Russie"    },
  { id:"usa",       label:"🇺🇸 USA"       },
  { id:"inde",      label:"🇮🇳 Inde"      },
  { id:"asie",      label:"🌏 Asie"       },
  { id:"chine",     label:"🇨🇳 Chine"     },
  { id:"amsud",     label:"🌎 Am. Sud"    },
  { id:"australie", label:"🇦🇺 Australie" },
];

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
const C = {
  card:  { background:"rgba(10,50,160,0.22)", border:"1px solid rgba(80,150,255,0.18)", borderRadius:18, padding:20, backdropFilter:"blur(10px)" },
  input: { background:"rgba(10,40,120,0.35)", border:"1px solid rgba(80,150,255,0.25)", borderRadius:11, padding:"10px 13px", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" },
  btnP:  { background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", color:"#fff", border:"none", borderRadius:11, padding:"10px 20px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:"0 4px 16px rgba(59,130,246,0.35)" },
  btnG:  { background:"rgba(10,50,180,0.25)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(80,150,255,0.2)", borderRadius:11, padding:"10px 18px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" },
  btnS:  { background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", border:"none", borderRadius:11, padding:"10px 20px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:"0 4px 16px rgba(34,197,94,0.35)" },
  btnD:  { background:"rgba(239,68,68,0.12)", color:"#f87171", border:"1px solid rgba(239,68,68,0.25)", borderRadius:11, padding:"10px 18px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" },
};
function Card({ children, style }) { return <div style={{ ...C.card, ...style }}>{children}</div>; }
function Inp({ placeholder, value, onChange, type="text", style }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ ...C.input, ...style }}/>;
}
function Btn({ children, onClick, v="p", style }) {
  const m = { p:C.btnP, g:C.btnG, s:C.btnS, d:C.btnD };
  return <button onClick={onClick} style={{ ...m[v], transition:"all 0.18s", ...style }}>{children}</button>;
}
function Pill({ label, active, onClick }) {
  return <button onClick={onClick} style={{ padding:"5px 13px", borderRadius:99, border:"none", fontSize:12, cursor:"pointer", whiteSpace:"nowrap", background:active?"rgba(255,255,255,0.92)":"rgba(10,50,180,0.25)", color:active?"#020f2e":"rgba(255,255,255,0.65)", fontWeight:active?700:400, transition:"all 0.15s" }}>{label}</button>;
}
function Lbl({ children }) { return <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:7 }}>{children}</div>; }
function H({ children }) { return <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#fff", marginBottom:14 }}>{children}</div>; }
function Badge({ children, color="#3b82f6" }) {
  return <span style={{ background:`${color}22`, border:`1px solid ${color}44`, borderRadius:6, padding:"2px 8px", fontSize:11, color, fontWeight:600 }}>{children}</span>;
}
function Stars({ n=4 }) { return <span style={{ color:"#f59e0b", fontSize:12 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>; }

// ─── AI HOOK ──────────────────────────────────────────────────────────────────
function useAI() {
  const call = async (prompt, sys="Tu es un assistant de voyage expert. Réponds en français, de façon concise et pratique.") => {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sys, messages:[{role:"user",content:prompt}] })
      });
      const d = await r.json();
      return d.content?.map(b=>b.text||"").join("") || "Erreur IA.";
    } catch { return "Erreur de connexion."; }
  };
  return { call };
}

// ─── SIRI VOICE COMMAND ───────────────────────────────────────────────────────
function useSiri({ setTab, setRegion, onVoiceResult }) {
  const [listening,  setListening]  = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [supported,  setSupported]  = useState(false);
  const recRef = useRef(null);
  const { call } = useAI();

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { setSupported(true); recRef.current = new SR(); recRef.current.lang = "fr-FR"; recRef.current.continuous = false; recRef.current.interimResults = false; }
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 1.05; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };

  const routeCommand = (text) => {
    const t = text.toLowerCase();
    // Navigation commands
    if (t.includes("vol") || t.includes("avion") || t.includes("billet"))           { setTab("vols");      return "J'ouvre la section Vols pour vous."; }
    if (t.includes("hôtel") || t.includes("hotel") || t.includes("hébergement"))    { setTab("hotels");    return "J'ouvre la section Hôtels."; }
    if (t.includes("uber") || t.includes("taxi") || t.includes("transport") || t.includes("vtc")) { setTab("transport"); return "J'ouvre la section Transport."; }
    if (t.includes("météo") || t.includes("temps") || t.includes("température"))    { setTab("meteo");     return "J'ouvre la météo."; }
    if (t.includes("carte") || t.includes("map") || t.includes("navigation") || t.includes("chemin")) { setTab("maps"); return "J'ouvre la navigation."; }
    if (t.includes("argent") || t.includes("devise") || t.includes("euro") || t.includes("franc"))  { setTab("finance"); return "J'ouvre la section Finance et devises."; }
    if (t.includes("guide") || t.includes("tourisme") || t.includes("visiter"))     { setTab("guide");     return "J'ouvre le guide touristique."; }
    if (t.includes("santé") || t.includes("médecin") || t.includes("helsana") || t.includes("vaccin")) { setTab("sante"); return "J'ouvre la section Santé."; }
    if (t.includes("message") || t.includes("chat") || t.includes("whatsapp"))      { setTab("messages");  return "J'ouvre vos messages."; }
    if (t.includes("assistant") || t.includes("aide") || t.includes("question"))    { setTab("ia");        return "J'ouvre l'assistant IA."; }
    if (t.includes("tâche") || t.includes("todo") || t.includes("liste"))           { setTab("todo");      return "J'ouvre votre liste de tâches."; }
    if (t.includes("réservation") || t.includes("commande") || t.includes("booking")){ setTab("orders");   return "J'ouvre vos réservations."; }
    if (t.includes("accueil") || t.includes("home") || t.includes("tableau"))       { setTab("dashboard"); return "Retour à l'accueil."; }
    // Region commands
    if (t.includes("europe"))    { setRegion("europe");    return "Région Europe sélectionnée."; }
    if (t.includes("suisse"))    { setRegion("suisse");    return "Région Suisse sélectionnée."; }
    if (t.includes("russie"))    { setRegion("russie");    return "Région Russie sélectionnée."; }
    if (t.includes("amériqu") && t.includes("sud")) { setRegion("amsud"); return "Amérique du Sud sélectionnée."; }
    if (t.includes("australie")) { setRegion("australie"); return "Région Australie sélectionnée."; }
    if (t.includes("chine"))     { setRegion("chine");     return "Région Chine sélectionnée."; }
    if (t.includes("inde"))      { setRegion("inde");      return "Région Inde sélectionnée."; }
    if (t.includes("asie"))      { setRegion("asie");      return "Région Asie sélectionnée."; }
    if (t.includes("usa") || t.includes("états-unis") || t.includes("amérique du nord")) { setRegion("usa"); return "Région USA sélectionnée."; }
    return null; // let AI handle it
  };

  const start = async () => {
    if (!supported || listening) return;
    setListening(true); setTranscript(""); setResponse("");
    recRef.current.start();
    recRef.current.onresult = async (e) => {
      const said = e.results[0][0].transcript;
      setTranscript(said);
      const quick = routeCommand(said);
      if (quick) {
        setResponse(quick);
        speak(quick);
        if (onVoiceResult) onVoiceResult(said, quick);
      } else {
        const aiReply = await call(said, `Tu es Siri pour X World Hub, une app de voyage. Réponds en 1-2 phrases max en français. Si l'utilisateur demande quelque chose lié aux voyages, réponds brièvement et pratiquement. Commandes disponibles : vols, hôtels, transport, météo, navigation, finance, guide, santé, messages, assistant IA, to-do, réservations.`);
        setResponse(aiReply);
        speak(aiReply);
        if (onVoiceResult) onVoiceResult(said, aiReply);
      }
      setListening(false);
    };
    recRef.current.onerror = () => { setListening(false); setResponse("Microphone non accessible."); };
    recRef.current.onend   = () => setListening(false);
  };

  const stop = () => { recRef.current?.stop(); setListening(false); };

  return { listening, transcript, response, supported, start, stop };
}

// Siri floating button + overlay
function SiriButton({ setTab, setRegion }) {
  const [open, setOpen] = useState(false);
  const { listening, transcript, response, supported, start, stop } = useSiri({ setTab, setRegion });

  const toggle = () => { if (listening) stop(); else { setOpen(true); start(); } };

  const COMMANDS = [
    "\"Réserver un vol\"", "\"Trouver un hôtel\"", "\"Commander un Uber\"",
    "\"Quelle est la météo à Tokyo ?\"", "\"Convertir des euros\"",
    "\"Ouvre mes réservations\"", "\"Guide pour Paris\"", "\"Ouvre l'assistant IA\"",
  ];

  if (!supported) return null;

  return (
    <>
      {/* Floating Siri Button */}
      <button
        onClick={toggle}
        title="Commande vocale Siri"
        style={{
          position:"fixed", bottom:28, right:28, zIndex:500,
          width:58, height:58, borderRadius:"50%", border:"none", cursor:"pointer",
          background: listening
            ? "linear-gradient(135deg,#ec4899,#8b5cf6,#3b82f6)"
            : "linear-gradient(135deg,#1d4ed8,#6366f1)",
          boxShadow: listening
            ? "0 0 0 8px rgba(139,92,246,0.25), 0 0 30px rgba(99,102,241,0.6), 0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 28px rgba(59,130,246,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.3s",
          animation: listening ? "siripulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        <span style={{ fontSize:24 }}>{listening ? "🎙️" : "🎤"}</span>
      </button>

      {/* Siri Overlay Panel */}
      {open && (
        <>
          <div onClick={()=>{stop();setOpen(false);}} style={{ position:"fixed",inset:0,zIndex:490,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)" }}/>
          <div style={{
            position:"fixed", bottom:100, right:22, zIndex:495,
            width:340, background:"linear-gradient(160deg,#06154a,#0a1f6b)",
            border:"1px solid rgba(139,92,246,0.35)", borderRadius:24,
            padding:22, boxShadow:"0 30px 80px rgba(0,0,60,0.7)",
          }}>
            <style>{`
              @keyframes siripulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
              @keyframes wavebar  { 0%,100%{height:4px} 50%{height:22px} }
            `}</style>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:11, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎙️</div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#fff" }}>X World Siri</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Assistant vocal IA</div>
                </div>
              </div>
              <button onClick={()=>{stop();setOpen(false);}} style={{ background:"rgba(255,255,255,0.07)",border:"none",color:"rgba(255,255,255,0.5)",width:28,height:28,borderRadius:8,cursor:"pointer",fontSize:16 }}>×</button>
            </div>

            {/* Wave animation when listening */}
            {listening && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginBottom:16, height:40 }}>
                {[0.2,0.5,0.1,0.8,0.3,0.9,0.4,0.6,0.2,0.7].map((d,i)=>(
                  <div key={i} style={{ width:4, borderRadius:99, background:`hsl(${240+i*12},80%,70%)`, animation:`wavebar 0.8s ease-in-out ${d}s infinite` }}/>
                ))}
              </div>
            )}

            {/* Status */}
            <div style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:12, padding:"10px 14px", marginBottom:14, minHeight:44, display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:13, color: listening ? "#a5b4fc" : transcript ? "#fff" : "rgba(255,255,255,0.35)", fontStyle: listening ? "italic" : "normal" }}>
                {listening ? "🎙️ Je vous écoute..." : transcript || "Appuyez sur le micro et parlez..."}
              </span>
            </div>

            {/* AI Response */}
            {response && (
              <div style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:12, padding:"10px 14px", marginBottom:14 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:1, textTransform:"uppercase", marginBottom:5 }}>Réponse</div>
                <div style={{ fontSize:13, color:"#c4b5fd", lineHeight:1.6 }}>🤖 {response}</div>
              </div>
            )}

            {/* Mic button inside panel */}
            <button onClick={toggle} style={{
              width:"100%", padding:"12px 0", borderRadius:14, border:"none", cursor:"pointer",
              background: listening ? "linear-gradient(135deg,#ec4899,#8b5cf6)" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
              color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14,
              boxShadow:"0 4px 20px rgba(99,102,241,0.4)", transition:"all 0.2s",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              {listening ? <><span>⏹</span> Arrêter</> : <><span>🎤</span> Parler à Siri</>}
            </button>

            {/* Example commands */}
            {!listening && !transcript && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Exemples de commandes</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {COMMANDS.slice(0,4).map(c=>(
                    <div key={c} style={{ fontSize:11, color:"rgba(255,255,255,0.45)", background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"5px 10px" }}>{c}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ item, type, onClose, onConfirm }) {
  const [step,    setStep]    = useState(1); // 1=details 2=payment 3=confirmed
  const [form,    setForm]    = useState({ passengers:"1", class:"économique", cardNum:"", cardName:"", expiry:"", cvv:"" });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const total = type==="vol" ? item.price * parseInt(form.passengers||1)
              : type==="hotel" ? item.price * (item.nights||1)
              : item.price;

  const pay = async () => {
    if (!form.cardNum||!form.cardName||!form.expiry||!form.cvv) return alert("Veuillez remplir tous les champs de paiement.");
    setLoading(true);
    await new Promise(r=>setTimeout(r,1800));
    setLoading(false);
    setStep(3);
    onConfirm({ ...item, type, passengers:form.passengers, class:form.class, total, bookingRef:"XW-"+Math.random().toString(36).substr(2,8).toUpperCase(), date:new Date().toLocaleDateString("fr-FR") });
  };

  const inp = (ph,k,t="text",maxLen) => (
    <input type={t} placeholder={ph} value={form[k]} maxLength={maxLen}
      onChange={e=>set(k,e.target.value)}
      style={{ ...C.input, marginBottom:10 }}/>
  );

  return (
    <>
      <div onClick={step<3?onClose:undefined} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1100,backdropFilter:"blur(8px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:1200,background:"linear-gradient(160deg,#06154a,#0a1f6b)",border:"1px solid rgba(80,150,255,0.3)",borderRadius:24,padding:28,width:460,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 100px rgba(0,0,60,0.8)" }}>
        {/* Step indicator */}
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:22 }}>
          {["Détails","Paiement","Confirmé"].map((s,i)=>(
            <div key={s} style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,background:step>i+1?"#22c55e":step===i+1?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"rgba(255,255,255,0.1)",color:"#fff" }}>{step>i+1?"✓":i+1}</div>
              <span style={{ fontSize:12,color:step===i+1?"#fff":"rgba(255,255,255,0.4)",fontWeight:step===i+1?600:400 }}>{s}</span>
              {i<2&&<div style={{ width:30,height:1,background:"rgba(255,255,255,0.15)" }}/>}
            </div>
          ))}
          {step<3&&<button onClick={onClose} style={{ marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer" }}>×</button>}
        </div>

        {/* STEP 1 — Details */}
        {step===1&&(
          <div>
            <H>📋 Récapitulatif</H>
            <Card style={{ marginBottom:16,padding:16 }}>
              <div style={{ fontSize:20,marginBottom:8 }}>{item.icon} <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff" }}>{item.name||item.title}</span></div>
              {type==="vol"&&<><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:4 }}>✈️ {item.from} → {item.to}</div><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:4 }}>📅 {item.date} · ⏱ {item.duration}</div><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13 }}>🔄 {item.stops}</div></>}
              {type==="hotel"&&<><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:4 }}>📍 {item.location}</div><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:4 }}>🌙 {item.nights} nuit(s)</div><Stars n={item.stars}/></>}
              {type==="vtc"&&<><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:4 }}>📍 {item.from} → {item.to}</div><div style={{ color:"rgba(255,255,255,0.6)",fontSize:13 }}>⏱ ~{item.duration} · {item.distance}</div></>}
              <div style={{ marginTop:12,padding:"10px 14px",background:"rgba(59,130,246,0.15)",borderRadius:10 }}>
                <span style={{ color:"rgba(255,255,255,0.5)",fontSize:12 }}>Prix total estimé : </span>
                <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#60b4ff" }}>€{total}</span>
              </div>
            </Card>
            {type==="vol"&&(
              <>
                <Lbl>Nombre de passagers</Lbl>
                <select value={form.passengers} onChange={e=>set("passengers",e.target.value)} style={{ ...C.input, marginBottom:12 }}>
                  {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} passager{n>1?"s":""}</option>)}
                </select>
                <Lbl>Classe</Lbl>
                <div style={{ display:"flex",gap:7,marginBottom:16 }}>
                  {["économique","premium","business","première"].map(c=><Pill key={c} label={c} active={form.class===c} onClick={()=>set("class",c)}/>)}
                </div>
              </>
            )}
            <Btn onClick={()=>setStep(2)} style={{ width:"100%",textAlign:"center",padding:"13px 0",fontSize:14 }}>Continuer vers le paiement →</Btn>
          </div>
        )}

        {/* STEP 2 — Payment */}
        {step===2&&(
          <div>
            <H>💳 Paiement sécurisé</H>
            <div style={{ background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
              <span>🔒</span><span style={{ fontSize:12,color:"#86efac" }}>Paiement 100% sécurisé · SSL · Données chiffrées</span>
            </div>
            <Lbl>Nom sur la carte</Lbl>
            {inp("Jean Dupont","cardName")}
            <Lbl>Numéro de carte</Lbl>
            {inp("1234 5678 9012 3456","cardNum","text",19)}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
              <div><Lbl>Date d'expiration</Lbl><input placeholder="MM/AA" value={form.expiry} onChange={e=>set("expiry",e.target.value)} maxLength={5} style={{ ...C.input }}/></div>
              <div><Lbl>CVV</Lbl><input placeholder="123" value={form.cvv} onChange={e=>set("cvv",e.target.value)} maxLength={3} style={{ ...C.input }}/></div>
            </div>
            <div style={{ padding:"12px 16px",background:"rgba(29,78,216,0.2)",borderRadius:12,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:"rgba(255,255,255,0.6)",fontSize:13 }}>Total à payer</span>
              <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#60b4ff" }}>€{total}</span>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <Btn v="g" onClick={()=>setStep(1)} style={{ flex:1,textAlign:"center" }}>← Retour</Btn>
              <button onClick={pay} disabled={loading} style={{ ...C.btnS, flex:2, textAlign:"center", opacity:loading?0.7:1 }}>
                {loading?"⏳ Traitement...":"✅ Confirmer & Payer"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Confirmed */}
        {step===3&&(
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:60,marginBottom:12 }}>🎉</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#4ade80",marginBottom:8 }}>Réservation confirmée !</div>
            <div style={{ color:"rgba(255,255,255,0.55)",fontSize:13,marginBottom:20 }}>Votre réservation a bien été enregistrée. Un email de confirmation a été envoyé.</div>
            <Card style={{ textAlign:"left",marginBottom:20,padding:16 }}>
              <Lbl>Référence de réservation</Lbl>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#60b4ff",letterSpacing:2 }}>XW-{Math.random().toString(36).substr(2,8).toUpperCase()}</div>
              <div style={{ marginTop:10,color:"rgba(255,255,255,0.5)",fontSize:12 }}>{item.icon} {item.name||item.title} · €{total}</div>
            </Card>
            <Btn onClick={onClose} style={{ width:"100%",textAlign:"center",padding:"13px 0" }}>Voir mes réservations 📦</Btn>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── VOLS ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Vols({ onBook }) {
  const { call } = useAI();
  const [from,     setFrom]     = useState("Paris CDG");
  const [to,       setTo]       = useState("");
  const [date,     setDate]     = useState("");
  const [pax,      setPax]      = useState("1");
  const [loading,  setLoading]  = useState(false);
  const [flights,  setFlights]  = useState([]);
  const [selected, setSelected] = useState(null);

  const MOCK_FLIGHTS = (f,t) => [
    { id:1, icon:"🇫🇷", name:"Air France",   from:f, to:t, date:date||"15/07/2026", duration:"11h30", stops:"Direct",    price:489,  class:"économique" },
    { id:2, icon:"🇬🇧", name:"British Airways",from:f,to:t, date:date||"15/07/2026", duration:"13h10", stops:"1 escale",  price:392,  class:"économique" },
    { id:3, icon:"🇦🇪", name:"Emirates",      from:f, to:t, date:date||"15/07/2026", duration:"14h45", stops:"1 escale",  price:561,  class:"économique" },
    { id:4, icon:"🇨🇭", name:"Swiss Air",     from:f, to:t, date:date||"15/07/2026", duration:"12h00", stops:"Direct",    price:620,  class:"business"   },
    { id:5, icon:"🇶🇦", name:"Qatar Airways", from:f, to:t, date:date||"15/07/2026", duration:"13h50", stops:"1 escale",  price:445,  class:"économique" },
    { id:6, icon:"🇸🇬", name:"Singapore Air", from:f, to:t, date:date||"15/07/2026", duration:"12h20", stops:"Direct",    price:710,  class:"business"   },
  ];

  const search = async () => {
    if (!to.trim()) return;
    setLoading(true); setFlights([]);
    await new Promise(r=>setTimeout(r,1000));
    setFlights(MOCK_FLIGHTS(from, to));
    setLoading(false);
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <H>✈️ Recherche & Réservation de Vols</H>

      {/* Search form */}
      <Card>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto auto",gap:10,alignItems:"end" }}>
          <div><Lbl>Départ</Lbl><Inp value={from} onChange={e=>setFrom(e.target.value)} placeholder="Paris CDG"/></div>
          <div><Lbl>Destination</Lbl><Inp value={to} onChange={e=>setTo(e.target.value)} placeholder="Tokyo, New York..."/></div>
          <div><Lbl>Date</Lbl><Inp type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          <div><Lbl>Passagers</Lbl>
            <select value={pax} onChange={e=>setPax(e.target.value)} style={{ ...C.input,width:"auto" }}>
              {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} pax</option>)}
            </select>
          </div>
          <Btn onClick={search} style={{ height:42,paddingLeft:20,paddingRight:20 }}>🔍 Chercher</Btn>
        </div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:12 }}>
          {["New York","Tokyo","Dubai","Sydney","Mumbai","Shanghai","Buenos Aires","Moscou","Singapour","Bangkok"].map(c=>(
            <Pill key={c} label={c} active={to===c} onClick={()=>setTo(c)}/>
          ))}
        </div>
      </Card>

      {loading&&<Card style={{ textAlign:"center",padding:40 }}><div style={{ fontSize:40,marginBottom:10 }}>✈️</div><div style={{ color:"rgba(255,255,255,0.5)" }}>Recherche des meilleurs vols...</div></Card>}

      {/* Results */}
      {flights.length>0&&(
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>{flights.length} vols trouvés · {from} → {to}</div>
          {flights.map(f=>(
            <Card key={f.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 20px",border:selected===f.id?"1px solid rgba(59,130,246,0.6)":"1px solid rgba(80,150,255,0.18)",cursor:"pointer" }} onClick={()=>setSelected(f.id)}>
              <span style={{ fontSize:28,flexShrink:0 }}>{f.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",marginBottom:3 }}>{f.name}</div>
                <div style={{ fontSize:12,color:"rgba(255,255,255,0.5)" }}>✈️ {f.from} → {f.to} · 📅 {f.date}</div>
                <div style={{ display:"flex",gap:8,marginTop:5 }}>
                  <Badge>⏱ {f.duration}</Badge>
                  <Badge color={f.stops==="Direct"?"#22c55e":"#f59e0b"}>{f.stops==="Direct"?"✈️ Direct":"🔄 "+f.stops}</Badge>
                  <Badge color="#a78bfa">{f.class}</Badge>
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#60b4ff" }}>€{f.price}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:8 }}>par personne</div>
                <Btn v="s" onClick={e=>{e.stopPropagation();onBook(f,"vol");}} style={{ padding:"8px 16px",fontSize:12 }}>Réserver →</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HOTELS ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Hotels({ onBook }) {
  const [dest,    setDest]    = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout,setCheckout]= useState("");
  const [guests,  setGuests]  = useState("1");
  const [budget,  setBudget]  = useState("all");
  const [loading, setLoading] = useState(false);
  const [hotels,  setHotels]  = useState([]);

  const MOCK_HOTELS = (d) => [
    { id:1, icon:"🏨", title:"Grand Hôtel Central", location:d, stars:5, price:320, nights:calcNights(), amenities:["🍳 Petit-déj","🏊 Piscine","💆 Spa","🅿️ Parking"], badge:"Coup de cœur" },
    { id:2, icon:"🛎️", title:"Hôtel Boutique Lumière", location:d, stars:4, price:185, nights:calcNights(), amenities:["🍳 Petit-déj","📶 WiFi","🏋️ Gym"], badge:"Meilleur rapport qualité-prix" },
    { id:3, icon:"🌿", title:"Eco Lodge Urban", location:d, stars:4, price:140, nights:calcNights(), amenities:["🌿 Bio","📶 WiFi","♻️ Éco"], badge:"Éco-certifié" },
    { id:4, icon:"🏰", title:"Palace Prestige", location:d, stars:5, price:580, nights:calcNights(), amenities:["🍽️ Restaurant","🏊 Piscine","💆 Spa","🚗 Navette"], badge:"Luxe" },
    { id:5, icon:"🏡", title:"Résidence Apart'hotel", location:d, stars:3, price:95, nights:calcNights(), amenities:["🍳 Kitchenette","📶 WiFi","🧺 Laverie"], badge:"Économique" },
    { id:6, icon:"🌊", title:"Hotel Panorama Vue", location:d, stars:4, price:210, nights:calcNights(), amenities:["🌅 Vue mer","🍳 Petit-déj","🏊 Piscine"], badge:"Vue exceptionnelle" },
  ];

  function calcNights() {
    if (!checkin||!checkout) return 1;
    const d1=new Date(checkin), d2=new Date(checkout);
    return Math.max(1,Math.round((d2-d1)/(1000*60*60*24)));
  }

  const search = async () => {
    if (!dest.trim()) return;
    setLoading(true); setHotels([]);
    await new Promise(r=>setTimeout(r,900));
    let h = MOCK_HOTELS(dest);
    if (budget==="eco") h = h.filter(x=>x.price<150);
    if (budget==="mid") h = h.filter(x=>x.price>=150&&x.price<300);
    if (budget==="lux") h = h.filter(x=>x.price>=300);
    setHotels(h);
    setLoading(false);
  };

  const filtered = hotels;
  const nights = calcNights();

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <H>🏨 Recherche & Réservation d'Hôtels</H>
      <Card>
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto auto",gap:10,alignItems:"end",marginBottom:12 }}>
          <div><Lbl>Destination</Lbl><Inp value={dest} onChange={e=>setDest(e.target.value)} placeholder="Paris, Tokyo, Dubai..."/></div>
          <div><Lbl>Arrivée</Lbl><Inp type="date" value={checkin} onChange={e=>setCheckin(e.target.value)}/></div>
          <div><Lbl>Départ</Lbl><Inp type="date" value={checkout} onChange={e=>setCheckout(e.target.value)}/></div>
          <div><Lbl>Voyageurs</Lbl>
            <select value={guests} onChange={e=>setGuests(e.target.value)} style={{ ...C.input,width:"auto" }}>
              {[1,2,3,4].map(n=><option key={n} value={n}>{n} pers.</option>)}
            </select>
          </div>
          <Btn onClick={search} style={{ height:42 }}>🔍 Chercher</Btn>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <Lbl>Budget :</Lbl>
          {[["all","Tous"],["eco","< €150"],["mid","€150–300"],["lux","> €300"]].map(([id,l])=>(
            <Pill key={id} label={l} active={budget===id} onClick={()=>setBudget(id)}/>
          ))}
        </div>
      </Card>

      {loading&&<Card style={{ textAlign:"center",padding:40 }}><div style={{ fontSize:40,marginBottom:10 }}>🏨</div><div style={{ color:"rgba(255,255,255,0.5)" }}>Recherche des meilleures offres...</div></Card>}

      {filtered.length>0&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14 }}>
          {filtered.map(h=>(
            <Card key={h.id} style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {/* Header */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11,background:"rgba(59,130,246,0.2)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:6,padding:"2px 8px",color:"#93c5fd",display:"inline-block",marginBottom:6 }}>{h.badge}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff" }}>{h.icon} {h.title}</div>
                  <div style={{ fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:2 }}>📍 {h.location}</div>
                  <div style={{ marginTop:4 }}><Stars n={h.stars}/></div>
                </div>
              </div>
              {/* Amenities */}
              <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                {h.amenities.map(a=><span key={a} style={{ fontSize:11,background:"rgba(255,255,255,0.07)",borderRadius:6,padding:"2px 7px",color:"rgba(255,255,255,0.5)" }}>{a}</span>)}
              </div>
              {/* Price & CTA */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4,paddingTop:12,borderTop:"1px solid rgba(80,150,255,0.12)" }}>
                <div>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#60b4ff" }}>€{h.price}</span>
                  <span style={{ fontSize:11,color:"rgba(255,255,255,0.35)" }}>/nuit · {nights} nuit(s) = </span>
                  <span style={{ fontWeight:700,color:"#a5f3fc",fontSize:14 }}>€{h.price*nights}</span>
                </div>
                <Btn v="s" onClick={()=>onBook({...h,nights},"hotel")} style={{ padding:"8px 16px",fontSize:12 }}>Réserver →</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSPORT / VTC ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Transport({ region, onBook }) {
  const { call } = useAI();
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");
  const [when,    setWhen]    = useState("now");
  const [loading, setLoading] = useState(false);
  const [rides,   setRides]   = useState([]);
  const [aiTip,   setAiTip]   = useState("");

  const VTC_OPTIONS = [
    { id:1, icon:"🚖", name:"Uber X",       type:"Standard", duration:"~12 min", distance:"", price:18,  regions:["europe","suisse","usa","australie"] },
    { id:2, icon:"🚗", name:"Uber XL",      type:"Grand VTC",duration:"~14 min", distance:"", price:28,  regions:["europe","suisse","usa","australie"] },
    { id:3, icon:"🥂", name:"Uber Black",   type:"Premium",  duration:"~15 min", distance:"", price:55,  regions:["europe","suisse","usa"] },
    { id:4, icon:"⚡", name:"Uber Green",   type:"Électrique",duration:"~18 min",distance:"", price:22, regions:["europe","suisse"] },
    { id:5, icon:"🟡", name:"Yandex Go",    type:"Standard", duration:"~10 min", distance:"", price:8,   regions:["russie"] },
    { id:6, icon:"🏍️", name:"Grab Bike",   type:"Moto",     duration:"~8 min",  distance:"", price:4,   regions:["asie"] },
    { id:7, icon:"🚙", name:"DiDi Express", type:"Standard", duration:"~9 min",  distance:"", price:6,   regions:["chine"] },
    { id:8, icon:"🛺", name:"Uber Auto",    type:"Tuk-tuk",  duration:"~15 min", distance:"", price:3,   regions:["inde"] },
    { id:9, icon:"🌎", name:"InDriver",     type:"Standard", duration:"~12 min", distance:"", price:7,   regions:["amsud"] },
  ];

  const search = async () => {
    if (!from||!to) return;
    setLoading(true); setRides([]); setAiTip("");
    await new Promise(r=>setTimeout(r,800));
    const km = Math.floor(Math.random()*15)+3;
    const available = VTC_OPTIONS.filter(v=>v.regions.includes(region)||region==="monde")
      .map(v=>({...v, distance:`${km} km`, price: Math.round(v.price*(km/5)) }));
    setRides(available);
    const tip = await call(`Donne un conseil pratique de 2 phrases sur le transport de "${from}" à "${to}" dans la région ${region}. Inclus le meilleur moyen de se déplacer.`);
    setAiTip(tip);
    setLoading(false);
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <H>🚖 Réservation de Transport / VTC</H>
      <Card>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:10,alignItems:"end" }}>
          <div><Lbl>Point de départ</Lbl><Inp value={from} onChange={e=>setFrom(e.target.value)} placeholder="Hôtel, adresse..."/></div>
          <div><Lbl>Destination</Lbl><Inp value={to} onChange={e=>setTo(e.target.value)} placeholder="Aéroport, restaurant..."/></div>
          <div><Lbl>Quand</Lbl>
            <select value={when} onChange={e=>setWhen(e.target.value)} style={{ ...C.input }}>
              <option value="now">Maintenant</option>
              <option value="30">Dans 30 min</option>
              <option value="60">Dans 1h</option>
              <option value="later">Planifier</option>
            </select>
          </div>
          <Btn onClick={search} style={{ height:42 }}>🔍 Trouver</Btn>
        </div>
        <div style={{ marginTop:12,display:"flex",gap:6,flexWrap:"wrap" }}>
          <span style={{ fontSize:11,color:"rgba(255,255,255,0.35)" }}>Destinations rapides :</span>
          {["Aéroport","Gare centrale","Centre-ville","Hôtel","Restaurant","Musée"].map(d=>(
            <Pill key={d} label={d} active={to===d} onClick={()=>setTo(d)}/>
          ))}
        </div>
      </Card>

      {aiTip&&<Card style={{ background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.2)",padding:14 }}><span style={{ fontSize:16 }}>💡 </span><span style={{ fontSize:13,color:"rgba(255,255,255,0.7)" }}>{aiTip}</span></Card>}

      {loading&&<Card style={{ textAlign:"center",padding:40 }}><div style={{ fontSize:40 }}>🚖</div><div style={{ color:"rgba(255,255,255,0.5)",marginTop:10 }}>Recherche des véhicules disponibles...</div></Card>}

      {rides.length>0&&(
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>{rides.length} options disponibles · {from} → {to}</div>
          {rides.map(r=>(
            <Card key={r.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px" }}>
              <span style={{ fontSize:32,flexShrink:0 }}>{r.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff" }}>{r.name}</div>
                <div style={{ fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:2 }}>{r.type}</div>
                <div style={{ display:"flex",gap:8,marginTop:6 }}>
                  <Badge>⏱ {r.duration}</Badge>
                  <Badge color="#a78bfa">📍 {r.distance}</Badge>
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#60b4ff" }}>€{r.price}</div>
                <Btn v="s" onClick={()=>onBook({...r,from,to},"vtc")} style={{ padding:"8px 16px",fontSize:12,marginTop:8 }}>Commander →</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ORDERS ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Orders({ orders, onCancel }) {
  if (orders.length===0) return (
    <div style={{ textAlign:"center",padding:"60px 0" }}>
      <div style={{ fontSize:60,marginBottom:16 }}>📦</div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:"rgba(255,255,255,0.5)" }}>Aucune réservation</div>
      <div style={{ color:"rgba(255,255,255,0.3)",fontSize:14,marginTop:8 }}>Vos réservations de vols, hôtels et transports apparaîtront ici.</div>
    </div>
  );

  const typeColor = { vol:"#3b82f6", hotel:"#22c55e", vtc:"#f59e0b" };
  const typeLabel = { vol:"✈️ Vol", hotel:"🏨 Hôtel", vtc:"🚖 Transport" };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <H>📦 Mes Réservations</H>
      <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>{orders.length} réservation(s) · Total dépensé : €{orders.reduce((s,o)=>s+o.total,0)}</div>
      {[...orders].reverse().map((o,i)=>(
        <Card key={i} style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${typeColor[o.type]}44,${typeColor[o.type]}22)`,border:`1px solid ${typeColor[o.type]}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{o.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
              <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff" }}>{o.name||o.title}</span>
              <Badge color={typeColor[o.type]}>{typeLabel[o.type]}</Badge>
              <Badge color="#22c55e">✓ Confirmé</Badge>
            </div>
            {o.type==="vol"&&<div style={{ fontSize:12,color:"rgba(255,255,255,0.5)" }}>✈️ {o.from} → {o.to} · {o.passengers} pax · {o.class}</div>}
            {o.type==="hotel"&&<div style={{ fontSize:12,color:"rgba(255,255,255,0.5)" }}>📍 {o.location} · {o.nights} nuit(s)</div>}
            {o.type==="vtc"&&<div style={{ fontSize:12,color:"rgba(255,255,255,0.5)" }}>📍 {o.from} → {o.to} · {o.duration}</div>}
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:4 }}>📅 {o.date} · Réf: <span style={{ color:"#60b4ff",fontFamily:"monospace" }}>{o.bookingRef}</span></div>
          </div>
          <div style={{ textAlign:"right",flexShrink:0 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#60b4ff" }}>€{o.total}</div>
            <Btn v="d" onClick={()=>onCancel(i)} style={{ padding:"5px 12px",fontSize:11,marginTop:8 }}>Annuler</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setTab, region, setRegion, orders }) {
  const stats = [
    { icon:"✈️", val:`${orders.filter(o=>o.type==="vol").length}`, label:"Vols réservés" },
    { icon:"🏨", val:`${orders.filter(o=>o.type==="hotel").length}`, label:"Hôtels réservés" },
    { icon:"🚖", val:`${orders.filter(o=>o.type==="vtc").length}`, label:"Transports" },
    { icon:"💰", val:`€${orders.reduce((s,o)=>s+o.total,0)}`, label:"Total dépensé" },
  ];
  const quick = [
    { tab:"vols",        icon:"✈️", label:"Réserver vol",    color:"#0ea5e9" },
    { tab:"hotels",      icon:"🏨", label:"Réserver hôtel",  color:"#22c55e" },
    { tab:"transport",   icon:"🚖", label:"Commander VTC",   color:"#f97316" },
    { tab:"localisation",icon:"📍", label:"Ma position",      color:"#10b981" },
    { tab:"traducteur",  icon:"🌐", label:"Traducteur",       color:"#06b6d4" },
    { tab:"finance",     icon:"💳", label:"Devises",          color:"#8b5cf6" },
    { tab:"amazon",      icon:"🛒", label:"Amazon Shopping",  color:"#ff9900" },
    { tab:"guide",       icon:"🧭", label:"Guide voyage",     color:"#d97706" },
    { tab:"ia",          icon:"🤖", label:"Assistant IA",     color:"#ec4899" },
    { tab:"meteo",       icon:"⛅", label:"Météo",            color:"#06b6d4" },
    { tab:"orders",      icon:"📦", label:"Mes réservations", color:"#4ade80" },
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ background:"linear-gradient(135deg,rgba(29,78,216,0.4),rgba(59,130,246,0.15))",border:"1px solid rgba(80,150,255,0.25)",borderRadius:22,padding:"28px 26px" }}>
        <div style={{ fontSize:12,color:"rgba(255,255,255,0.45)",letterSpacing:1,textTransform:"uppercase",marginBottom:6 }}>Bienvenue sur</div>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32,background:"linear-gradient(90deg,#fff,#60b4ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6 }}>X WORLD HUB</div>
        <div style={{ color:"rgba(255,255,255,0.55)",fontSize:14,marginBottom:18 }}>Réservez vols, hôtels, transports — tout en un.{user?` Bonjour ${user.firstName} ${user.avatar}!`:""}</div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <Btn onClick={()=>setTab("vols")}>✈️ Réserver un vol</Btn>
          <Btn v="g" onClick={()=>setTab("hotels")}>🏨 Trouver un hôtel</Btn>
          <Btn v="g" onClick={()=>setTab("transport")}>🚖 Commander un VTC</Btn>
        </div>
      </div>
      <Card><Lbl>Région de voyage</Lbl><div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>{REGIONS.map(r=><Pill key={r.id} label={r.label} active={region===r.id} onClick={()=>setRegion(r.id)}/>)}</div></Card>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
        {stats.map(s=>(
          <Card key={s.label} style={{ display:"flex",alignItems:"center",gap:10,padding:16 }}>
            <span style={{ fontSize:24 }}>{s.icon}</span>
            <div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#fff" }}>{s.val}</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>{s.label}</div></div>
          </Card>
        ))}
      </div>
      <div>
        <H>Accès rapide</H>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10 }}>
          {quick.map(l=>(
            <button key={l.tab} onClick={()=>setTab(l.tab)} style={{ background:`linear-gradient(135deg,${l.color}22,${l.color}11)`,border:`1px solid ${l.color}44`,borderRadius:16,padding:"16px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <span style={{ fontSize:26 }}>{l.icon}</span>
              <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff" }}>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
      {orders.length>0&&(
        <div>
          <H>Dernières réservations</H>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {[...orders].reverse().slice(0,3).map((o,i)=>(
              <Card key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer" }} onClick={()=>setTab("orders")}>
                <span style={{ fontSize:22 }}>{o.icon}</span>
                <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600,color:"#fff" }}>{o.name||o.title}</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>{o.date} · Réf: {o.bookingRef}</div></div>
                <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#60b4ff" }}>€{o.total}</span>
                <Badge color="#22c55e">✓ Confirmé</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MÉTÉO ────────────────────────────────────────────────────────────────────
function Meteo() {
  const { call } = useAI();
  const [city,setCity]=useState("Paris");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const cities=["Paris","Londres","New York","Tokyo","Dubaï","Sydney","Moscou","Mumbai","Shanghai","Genève"];
  const search=async(c)=>{const t=c||city;setLoading(true);setResult("");const r=await call(`Météo et prévisions pour ${t} en juin 2026. Température, conditions, humidité, vent, conseils vestimentaires. Avec emojis.`);setResult(r);setLoading(false);};
  const fc=[{d:"Lun",i:"☀️",h:24,l:16},{d:"Mar",i:"⛅",h:21,l:14},{d:"Mer",i:"🌧️",h:17,l:12},{d:"Jeu",i:"🌦️",h:19,l:13},{d:"Ven",i:"☀️",h:26,l:17},{d:"Sam",i:"☀️",h:28,l:18},{d:"Dim",i:"⛅",h:23,l:15}];
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}><H>⛅ Météo Mondiale</H>
    <Card><Lbl>Ville</Lbl><div style={{display:"flex",gap:8,marginBottom:12}}><Inp value={city} onChange={e=>setCity(e.target.value)} placeholder="Ville..." onKeyDown={e=>e.key==="Enter"&&search()}/><Btn onClick={()=>search()}>Voir</Btn></div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{cities.map(c=><Pill key={c} label={c} active={city===c} onClick={()=>{setCity(c);search(c);}}/>)}</div></Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>{fc.map(f=><Card key={f.d} style={{textAlign:"center",padding:"12px 4px"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{f.d}</div><div style={{fontSize:22,marginBottom:4}}>{f.i}</div><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{f.h}°</div><div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{f.l}°</div></Card>)}</div>
    {loading&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:30}}>⛅</div><div style={{color:"rgba(255,255,255,0.5)",marginTop:8}}>Chargement...</div></Card>}
    {result&&<Card><div style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{result}</div></Card>}
  </div>);
}

// ─── MAPS ─────────────────────────────────────────────────────────────────────
function Maps() {
  const {call}=useAI();
  const [query,setQuery]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const pois=["Restaurants","Musées","Hôtels","Pharmacies","Aéroports","Gares","Plages","Monuments"];
  const search=async(q)=>{const t=q||query;setLoading(true);setResult("");const r=await call(`Infos de navigation pour "${t}" : meilleures adresses, comment y aller, horaires. Pratique et concis.`);setResult(r);setLoading(false);};
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}><H>🗺️ Navigation & Cartes</H>
    <Card><div style={{display:"flex",gap:8,marginBottom:12}}><Inp value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un lieu..." onKeyDown={e=>e.key==="Enter"&&search()}/><Btn onClick={()=>search()}>🔍</Btn></div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{pois.map(p=><Pill key={p} label={p} active={false} onClick={()=>{setQuery(p);search(p);}}/>)}</div></Card>
    <Card style={{padding:0,overflow:"hidden",height:280,position:"relative"}}><div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0a1a3a,#0e2d5a)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}><div style={{fontSize:48,opacity:0.3}}>🗺️</div><Btn v="g" onClick={()=>window.open("https://maps.google.com","_blank")}>Ouvrir Google Maps →</Btn></div></Card>
    {loading&&<Card style={{textAlign:"center",padding:24}}><div style={{color:"rgba(255,255,255,0.5)"}}>🗺️ Chargement...</div></Card>}
    {result&&<Card><div style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{result}</div></Card>}
  </div>);
}

// ─── LOCALISATION ─────────────────────────────────────────────────────────────
function Localisation({ setTab }) {
  const { call } = useAI();
  const [pos,      setPos]      = useState(null);
  const [geoError, setGeoError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [info,     setInfo]     = useState("");
  const [nearby,   setNearby]   = useState("");
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef(null);

  const locate = () => {
    if (!navigator.geolocation) { setGeoError("Géolocalisation non supportée."); return; }
    setLoading(true); setGeoError(""); setInfo(""); setNearby("");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const coords = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy), altitude: p.coords.altitude, speed: p.coords.speed };
        setPos(coords); setLoading(false);
        // AI info about location
        const res = await call(`Je suis localisé à latitude ${coords.lat.toFixed(4)}, longitude ${coords.lng.toFixed(4)}. Dis-moi : 1) Ville/pays probable, 2) Quartier ou zone, 3) Heure locale et fuseau, 4) Météo typique de saison, 5) Points d'intérêt proches. Sois précis et pratique avec emojis.`);
        setInfo(res);
        const nearRes = await call(`À latitude ${coords.lat.toFixed(4)}, longitude ${coords.lng.toFixed(4)}, liste les 5 types de lieux utiles pour un voyageur les plus proches : restaurants, hôtels, pharmacies, transports, musées. Format liste concise avec emojis.`);
        setNearby(nearRes);
      },
      (e) => { setGeoError("Accès refusé au GPS. Autorisez la localisation dans votre navigateur."); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startTracking = () => {
    if (!navigator.geolocation) return;
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => setPos({ lat:p.coords.latitude, lng:p.coords.longitude, accuracy:Math.round(p.coords.accuracy), speed:p.coords.speed }),
      () => {}, { enableHighAccuracy:true }
    );
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    setTracking(false);
  };

  useEffect(() => () => { if(watchRef.current) navigator.geolocation.clearWatch(watchRef.current); }, []);

  const coords = [
    { icon:"📍", label:"Latitude",   val: pos ? pos.lat.toFixed(6) : "—",      color:"#60b4ff" },
    { icon:"📍", label:"Longitude",  val: pos ? pos.lng.toFixed(6) : "—",      color:"#60b4ff" },
    { icon:"🎯", label:"Précision",  val: pos ? `±${pos.accuracy}m` : "—",     color:"#4ade80" },
    { icon:"⚡", label:"Vitesse",    val: pos?.speed ? `${(pos.speed*3.6).toFixed(1)} km/h` : "—", color:"#f59e0b" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <H>📍 Ma Localisation GPS</H>

      {/* Main GPS Card */}
      <Card style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))", border:"1px solid rgba(16,185,129,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#fff", marginBottom:4 }}>
              {pos ? "📍 Position détectée" : "🔍 Prêt à localiser"}
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>
              {pos ? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` : "Cliquez pour activer la géolocalisation"}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn onClick={locate} v={loading?"g":"p"} style={{ fontSize:12 }}>
              {loading ? "⏳ Localisation..." : "📍 Me localiser"}
            </Btn>
            {pos && !tracking && <Btn onClick={startTracking} v="s" style={{ fontSize:12 }}>🔄 Suivi live</Btn>}
            {tracking && <Btn onClick={stopTracking} v="d" style={{ fontSize:12 }}>⏹ Arrêter</Btn>}
          </div>
        </div>

        {tracking && (
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"rgba(74,222,128,0.1)", borderRadius:8 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"pulse 1s infinite" }}/>
            <span style={{ fontSize:11, color:"#4ade80", fontWeight:600 }}>Suivi GPS en temps réel actif</span>
          </div>
        )}
        {geoError && <div style={{ marginTop:10, color:"#f87171", fontSize:12, padding:"8px 12px", background:"rgba(239,68,68,0.1)", borderRadius:8 }}>⚠️ {geoError}</div>}
      </Card>

      {/* Coordinates grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {coords.map(c=>(
          <Card key={c.label} style={{ textAlign:"center", padding:14 }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{c.icon}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:c.color }}>{c.val}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Map visual */}
      {pos && (
        <Card style={{ padding:0, overflow:"hidden", height:260, position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0a2a1a,#0e3d2a)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
            <div style={{ fontSize:40 }}>🗺️</div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>{pos.lat.toFixed(4)}°N, {pos.lng.toFixed(4)}°E</div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn v="g" onClick={()=>window.open(`https://maps.google.com/?q=${pos.lat},${pos.lng}`,"_blank")} style={{ fontSize:11 }}>🗺️ Google Maps</Btn>
              <Btn v="g" onClick={()=>window.open(`https://www.waze.com/ul?ll=${pos.lat},${pos.lng}&navigate=yes`,"_blank")} style={{ fontSize:11 }}>🚗 Waze</Btn>
              <Btn v="g" onClick={()=>navigator.clipboard?.writeText(`${pos.lat},${pos.lng}`)} style={{ fontSize:11 }}>📋 Copier</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* AI location info */}
      {info && (
        <Card>
          <Lbl>📍 Infos sur votre localisation (IA)</Lbl>
          <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.75, whiteSpace:"pre-wrap" }}>{info}</div>
        </Card>
      )}

      {/* Nearby places */}
      {nearby && (
        <Card>
          <Lbl>🏪 Lieux proches suggérés (IA)</Lbl>
          <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.75, whiteSpace:"pre-wrap" }}>{nearby}</div>
          <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn v="g" onClick={()=>setTab("maps")} style={{ fontSize:11 }}>🗺️ Navigation</Btn>
            <Btn v="g" onClick={()=>setTab("transport")} style={{ fontSize:11 }}>🚖 Commander VTC</Btn>
            <Btn v="g" onClick={()=>setTab("meteo")} style={{ fontSize:11 }}>⛅ Météo locale</Btn>
          </div>
        </Card>
      )}

      {/* Share location */}
      {pos && (
        <Card style={{ background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)" }}>
          <Lbl>📤 Partager ma position</Lbl>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn v="g" onClick={()=>navigator.share?.({title:"Ma position",text:`Je suis ici: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`,url:`https://maps.google.com/?q=${pos.lat},${pos.lng}`})||window.open(`https://wa.me/?text=Ma position: https://maps.google.com/?q=${pos.lat},${pos.lng}`,"_blank")} style={{ fontSize:11 }}>💬 WhatsApp</Btn>
            <Btn v="g" onClick={()=>window.open(`https://t.me/share/url?url=https://maps.google.com/?q=${pos.lat},${pos.lng}&text=Ma position`,"_blank")} style={{ fontSize:11 }}>✈️ Telegram</Btn>
            <Btn v="g" onClick={()=>navigator.clipboard?.writeText(`https://maps.google.com/?q=${pos.lat},${pos.lng}`)} style={{ fontSize:11 }}>🔗 Copier lien</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── TRADUCTEUR ───────────────────────────────────────────────────────────────
function Traducteur() {
  const { call } = useAI();
  const [text,     setText]     = useState("");
  const [result,   setResult]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [fromLang, setFromLang] = useState("fr");
  const [toLang,   setToLang]   = useState("en");
  const [mode,     setMode]     = useState("text"); // "text" | "voice" | "phrasebook"
  const [listening,setListening]= useState(false);
  const recRef = useRef(null);

  const LANGUAGES = [
    { code:"fr",  flag:"🇫🇷", name:"Français"   },
    { code:"en",  flag:"🇺🇸", name:"English"    },
    { code:"es",  flag:"🇪🇸", name:"Español"    },
    { code:"de",  flag:"🇩🇪", name:"Deutsch"    },
    { code:"it",  flag:"🇮🇹", name:"Italiano"   },
    { code:"pt",  flag:"🇧🇷", name:"Português"  },
    { code:"zh",  flag:"🇨🇳", name:"中文"       },
    { code:"ja",  flag:"🇯🇵", name:"日本語"     },
    { code:"ko",  flag:"🇰🇷", name:"한국어"     },
    { code:"ar",  flag:"🇸🇦", name:"العربية"    },
    { code:"ru",  flag:"🇷🇺", name:"Русский"   },
    { code:"hi",  flag:"🇮🇳", name:"हिंदी"      },
  ];

  const PHRASEBOOK = {
    fr: [
      { fr:"Bonjour", usage:"Salutation" },
      { fr:"Merci beaucoup", usage:"Remerciement" },
      { fr:"Où est l'hôtel ?", usage:"Navigation" },
      { fr:"Combien ça coûte ?", usage:"Shopping" },
      { fr:"Appelez une ambulance !", usage:"Urgence" },
      { fr:"Je suis allergique à...", usage:"Santé" },
      { fr:"Un billet pour..., s'il vous plaît", usage:"Transport" },
      { fr:"Parlez-vous français ?", usage:"Communication" },
    ]
  };

  const getLangName = (code) => LANGUAGES.find(l=>l.code===code)?.name || code;
  const getLangFlag = (code) => LANGUAGES.find(l=>l.code===code)?.flag || "🌐";

  const translate = async (t) => {
    const src = t || text;
    if (!src.trim()) return;
    setLoading(true); setResult("");
    const fromName = getLangName(fromLang);
    const toName   = getLangName(toLang);
    const r = await call(
      `Traduis ce texte du ${fromName} vers le ${toName} : "${src}"\n\nRéponds UNIQUEMENT avec:\n1. **Traduction:** [traduction exacte]\n2. **Prononciation:** [phonétique si utile pour ${toName}]\n3. **Conseil culturel:** [1 phrase sur le contexte culturel si pertinent]\n4. **Alternatives:** [1-2 autres façons de dire la même chose si applicable]`,
      "Tu es un traducteur expert multilingue spécialisé dans les voyages. Sois précis, naturel et utile."
    );
    setResult(r); setLoading(false);
  };

  const swap = () => { setFromLang(toLang); setToLang(fromLang); setText(result.split("**Traduction:**")[1]?.split("\n")[0]?.trim()||""); setResult(""); };

  const speak = (t, lang) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang+"-"+lang.toUpperCase(); u.rate=0.9;
    window.speechSynthesis.speak(u);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = fromLang+"-"+fromLang.toUpperCase();
    rec.onresult = (e) => { const t=e.results[0][0].transcript; setText(t); translate(t); };
    rec.onend = () => setListening(false);
    rec.start(); setListening(true); recRef.current = rec;
  };

  const LangSelector = ({ value, onChange, label }) => (
    <div style={{ flex:1 }}>
      <Lbl>{label}</Lbl>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {LANGUAGES.map(l=>(
          <button key={l.code} onClick={()=>onChange(l.code)}
            style={{ padding:"5px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, background:value===l.code?"rgba(255,255,255,0.92)":"rgba(10,50,180,0.25)", color:value===l.code?"#020f2e":"rgba(255,255,255,0.65)", fontWeight:value===l.code?700:400, display:"flex", alignItems:"center", gap:5 }}>
            <span>{l.flag}</span><span>{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <H>🌐 Traducteur IA — Multilingue</H>

      {/* Mode tabs */}
      <div style={{ display:"flex", gap:6 }}>
        {[["text","✏️ Texte"],["voice","🎤 Vocal"],["phrasebook","📖 Phrasebook"]].map(([id,l])=>(
          <button key={id} onClick={()=>setMode(id)} style={{ padding:"7px 16px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:mode===id?"rgba(255,255,255,0.92)":"rgba(10,50,180,0.25)", color:mode===id?"#020f2e":"rgba(255,255,255,0.65)" }}>{l}</button>
        ))}
      </div>

      {/* Language selectors */}
      <Card>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
          <LangSelector value={fromLang} onChange={setFromLang} label={`DE : ${getLangFlag(fromLang)} ${getLangName(fromLang)}`}/>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:20, gap:5 }}>
            <button onClick={swap} style={{ background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, color:"#60b4ff" }}>⇄</button>
          </div>
          <LangSelector value={toLang} onChange={setToLang} label={`VERS : ${getLangFlag(toLang)} ${getLangName(toLang)}`}/>
        </div>
      </Card>

      {/* TEXT MODE */}
      {mode==="text" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Card>
            <Lbl>{getLangFlag(fromLang)} Texte à traduire</Lbl>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Tapez en ${getLangName(fromLang)}...`} rows={4}
              style={{ ...C.input, resize:"vertical", marginBottom:10, fontSize:13 }}/>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Btn onClick={()=>translate()} style={{ flex:1 }}>🌐 Traduire en {getLangName(toLang)}</Btn>
              {text && <Btn v="g" onClick={()=>speak(text,fromLang)} style={{ fontSize:12 }}>🔊 Écouter</Btn>}
              <Btn v="g" onClick={()=>setText("")} style={{ fontSize:12 }}>✕ Vider</Btn>
            </div>
          </Card>
          {loading && <Card style={{ textAlign:"center", padding:24 }}><div style={{ fontSize:28 }}>🌐</div><div style={{ color:"rgba(255,255,255,0.5)", marginTop:8 }}>Traduction en cours...</div></Card>}
          {result && (
            <Card style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
              <Lbl>{getLangFlag(toLang)} Résultat en {getLangName(toLang)}</Lbl>
              <div style={{ color:"rgba(255,255,255,0.9)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:12 }}>{result}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Btn v="s" onClick={()=>speak(result.split("**Traduction:**")[1]?.split("\n")[0]?.trim()||result, toLang)} style={{ fontSize:11 }}>🔊 Écouter la traduction</Btn>
                <Btn v="g" onClick={()=>navigator.clipboard?.writeText(result.split("**Traduction:**")[1]?.split("\n")[0]?.trim()||result)} style={{ fontSize:11 }}>📋 Copier</Btn>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* VOICE MODE */}
      {mode==="voice" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ textAlign:"center", padding:32 }}>
            <div style={{ fontSize:56, marginBottom:12 }}>{listening?"🎙️":"🎤"}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#fff", marginBottom:6 }}>
              {listening ? "Je vous écoute..." : "Traduction Vocale"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:20 }}>
              Parlez en {getLangFlag(fromLang)} {getLangName(fromLang)} → traduction en {getLangFlag(toLang)} {getLangName(toLang)}
            </div>
            <button onClick={listening?()=>{recRef.current?.stop();setListening(false);}:startVoice}
              style={{ width:80, height:80, borderRadius:"50%", border:"none", cursor:"pointer", fontSize:32, background:listening?"linear-gradient(135deg,#ec4899,#8b5cf6)":"linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow:"0 8px 28px rgba(59,130,246,0.5)", transition:"all 0.3s" }}>
              {listening?"⏹":"🎤"}
            </button>
          </Card>
          {text && <Card><Lbl>Reconnu : {getLangFlag(fromLang)}</Lbl><div style={{ color:"#fff", fontSize:14 }}>{text}</div></Card>}
          {loading && <Card style={{ textAlign:"center", padding:20 }}><div style={{ color:"rgba(255,255,255,0.5)" }}>🌐 Traduction...</div></Card>}
          {result && (
            <Card style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
              <Lbl>Traduction {getLangFlag(toLang)}</Lbl>
              <div style={{ color:"#4ade80", fontSize:16, fontWeight:600, marginBottom:8 }}>{result.split("**Traduction:**")[1]?.split("\n")[0]?.trim()||result}</div>
              <Btn v="s" onClick={()=>speak(result.split("**Traduction:**")[1]?.split("\n")[0]?.trim()||result, toLang)} style={{ fontSize:12 }}>🔊 Lire à voix haute</Btn>
            </Card>
          )}
        </div>
      )}

      {/* PHRASEBOOK MODE */}
      {mode==="phrasebook" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Card>
            <Lbl>📖 Phrases essentielles du voyageur</Lbl>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:10 }}>
              Cliquez sur une phrase pour la traduire en {getLangFlag(toLang)} {getLangName(toLang)}
            </div>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
            {PHRASEBOOK.fr.map((p, i) => (
              <Card key={i} style={{ cursor:"pointer", transition:"all 0.2s" }}
                onClick={()=>{ setMode("text"); setText(p.fr); translate(p.fr); }}>
                <div style={{ fontSize:10, color:"rgba(59,130,246,0.8)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{p.usage}</div>
                <div style={{ fontSize:14, color:"#fff", fontWeight:600, marginBottom:4 }}>🇫🇷 {p.fr}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn v="g" onClick={e=>{e.stopPropagation();speak(p.fr,"fr");}} style={{ fontSize:10, padding:"4px 10px" }}>🔊 FR</Btn>
                  <Btn v="s" onClick={e=>{e.stopPropagation();setMode("text");setText(p.fr);translate(p.fr);}} style={{ fontSize:10, padding:"4px 10px" }}>🌐 Traduire →{getLangFlag(toLang)}</Btn>
                </div>
              </Card>
            ))}
          </div>
          {/* Custom phrase */}
          <Card>
            <Lbl>✏️ Traduire votre propre phrase</Lbl>
            <div style={{ display:"flex", gap:8 }}>
              <Inp value={text} onChange={e=>setText(e.target.value)} placeholder={`Votre phrase en ${getLangName(fromLang)}...`}/>
              <Btn onClick={()=>translate()} style={{ whiteSpace:"nowrap" }}>Traduire</Btn>
            </div>
            {loading && <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:8 }}>Traduction...</div>}
            {result && <div style={{ color:"#4ade80", fontSize:14, marginTop:10, fontWeight:600 }}>{result.split("**Traduction:**")[1]?.split("\n")[0]?.trim()||result}</div>}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── AMAZON SHOPPING ─────────────────────────────────────────────────────────
const AMAZON_CATS = [
  { id:"all",       label:"Tout",              icon:"🛒" },
  { id:"travel",    label:"Accessoires voyage", icon:"🎒" },
  { id:"tech",      label:"High-Tech",         icon:"💻" },
  { id:"vetement",  label:"Vêtements",         icon:"👕" },
  { id:"sante",     label:"Santé & Beauté",    icon:"💊" },
  { id:"maison",    label:"Maison",            icon:"🏠" },
  { id:"sport",     label:"Sport",             icon:"⚽" },
  { id:"livre",     label:"Livres",            icon:"📚" },
];

const AMAZON_STORES = [
  { id:"fr",  flag:"🇫🇷", name:"Amazon.fr",   url:"https://amazon.fr",   currency:"EUR" },
  { id:"ch",  flag:"🇨🇭", name:"Amazon.ch",   url:"https://amazon.ch",   currency:"CHF" },
  { id:"de",  flag:"🇩🇪", name:"Amazon.de",   url:"https://amazon.de",   currency:"EUR" },
  { id:"uk",  flag:"🇬🇧", name:"Amazon.co.uk",url:"https://amazon.co.uk",currency:"GBP" },
  { id:"us",  flag:"🇺🇸", name:"Amazon.com",  url:"https://amazon.com",  currency:"USD" },
  { id:"jp",  flag:"🇯🇵", name:"Amazon.co.jp",url:"https://amazon.co.jp",currency:"JPY" },
  { id:"in",  flag:"🇮🇳", name:"Amazon.in",   url:"https://amazon.in",   currency:"INR" },
  { id:"au",  flag:"🇦🇺", name:"Amazon.com.au",url:"https://amazon.com.au",currency:"AUD"},
];

const FEATURED_PRODUCTS = [
  // Voyage
  { id:1,  cat:"travel",   name:"Valise Cabine Légère",      brand:"Samsonite",   price:89,  currency:"CHF", rating:4.7, reviews:2341, prime:true,  badge:"Best Seller", icon:"🧳", discount:20 },
  { id:2,  cat:"travel",   name:"Adaptateur Universel Voyage",brand:"BESTEK",      price:24,  currency:"CHF", rating:4.5, reviews:8920, prime:true,  badge:"Amazon Choice",icon:"🔌",discount:0  },
  { id:3,  cat:"travel",   name:"Sac à dos 40L Voyage",      brand:"Osprey",      price:139, currency:"CHF", rating:4.8, reviews:1205, prime:true,  badge:"Top Noté",    icon:"🎒", discount:15 },
  { id:4,  cat:"travel",   name:"Coussin Nuque Mémoire",     brand:"Trtl",        price:34,  currency:"CHF", rating:4.3, reviews:5670, prime:true,  badge:"",            icon:"😴", discount:0  },
  { id:5,  cat:"travel",   name:"Trousse Toilette Suspendue",brand:"Hanging Kit",  price:19,  currency:"CHF", rating:4.6, reviews:3210, prime:true,  badge:"",            icon:"🪥", discount:10 },
  { id:6,  cat:"travel",   name:"Serrure TSA Combinaison",   brand:"Forge",       price:15,  currency:"CHF", rating:4.4, reviews:4500, prime:true,  badge:"Amazon Choice",icon:"🔒",discount:0  },
  // Tech
  { id:7,  cat:"tech",     name:"Kindle Paperwhite 16Go",    brand:"Amazon",      price:149, currency:"CHF", rating:4.9, reviews:21000,prime:true,  badge:"Best Seller", icon:"📖", discount:0  },
  { id:8,  cat:"tech",     name:"Écouteurs Sony WH-1000XM5", brand:"Sony",        price:289, currency:"CHF", rating:4.8, reviews:9800, prime:true,  badge:"Top Noté",    icon:"🎧", discount:18 },
  { id:9,  cat:"tech",     name:"Powerbank 26800mAh",        brand:"Anker",       price:59,  currency:"CHF", rating:4.7, reviews:15000,prime:true,  badge:"Best Seller", icon:"🔋", discount:0  },
  { id:10, cat:"tech",     name:"Câble USB-C Rapide 2m",     brand:"Anker",       price:12,  currency:"CHF", rating:4.6, reviews:30000,prime:true,  badge:"Amazon Choice",icon:"⚡",discount:0  },
  // Santé
  { id:11, cat:"sante",    name:"Trousse Premiers Secours",  brand:"Elite",       price:28,  currency:"CHF", rating:4.7, reviews:2100, prime:true,  badge:"",            icon:"🩺", discount:0  },
  { id:12, cat:"sante",    name:"Anti-moustiques Naturel",   brand:"Para'Kito",   price:14,  currency:"CHF", rating:4.4, reviews:6700, prime:true,  badge:"Amazon Choice",icon:"🦟",discount:0  },
  { id:13, cat:"sante",    name:"Médicaments Voyage Kit",    brand:"PharmAway",   price:22,  currency:"CHF", rating:4.5, reviews:890,  prime:false, badge:"",            icon:"💊", discount:0  },
  // Vêtements
  { id:14, cat:"vetement", name:"Veste Imperméable Pliable", brand:"Columbia",    price:79,  currency:"CHF", rating:4.6, reviews:4300, prime:true,  badge:"",            icon:"🧥", discount:25 },
  { id:15, cat:"vetement", name:"Pantalon Cargo Léger",      brand:"Fjallraven",  price:95,  currency:"CHF", rating:4.5, reviews:2800, prime:true,  badge:"Top Noté",    icon:"👖", discount:0  },
  // Sport
  { id:16, cat:"sport",    name:"Tapis Yoga de Voyage",      brand:"Manduka",     price:44,  currency:"CHF", rating:4.7, reviews:1500, prime:true,  badge:"",            icon:"🧘", discount:0  },
  // Livres
  { id:17, cat:"livre",    name:"Routard Monde 2026",        brand:"Hachette",    price:18,  currency:"CHF", rating:4.6, reviews:450,  prime:true,  badge:"",            icon:"🗺️", discount:0  },
  { id:18, cat:"livre",    name:"Guide Michelin Europe",     brand:"Michelin",    price:24,  currency:"CHF", rating:4.8, reviews:780,  prime:true,  badge:"Best Seller", icon:"⭐", discount:0  },
  // Maison
  { id:19, cat:"maison",   name:"Diffuseur Huiles Essentielles",brand:"InnoGear", price:22,  currency:"CHF", rating:4.5, reviews:9200, prime:true,  badge:"Amazon Choice",icon:"🌸",discount:0  },
];

function Amazon({ onBook }) {
  const { call } = useAI();
  const [cat,     setCat]     = useState("all");
  const [store,   setStore]   = useState("ch");
  const [search,  setSearch]  = useState("");
  const [cart,    setCart]    = useState([]);
  const [view,    setView]    = useState("shop"); // shop | cart | prime | search | ai
  const [aiQuery, setAiQuery] = useState("");
  const [aiRes,   setAiRes]   = useState("");
  const [aiLoad,  setAiLoad]  = useState(false);
  const [wishlist,setWishlist]= useState([]);
  const [added,   setAdded]   = useState(null);
  const [sortBy,  setSortBy]  = useState("featured"); // featured | price_asc | price_desc | rating

  const currentStore = AMAZON_STORES.find(s=>s.id===store) || AMAZON_STORES[0];

  const filtered = FEATURED_PRODUCTS.filter(p => {
    const inCat  = cat==="all" || p.cat===cat;
    const inSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    return inCat && inSearch;
  }).sort((a,b) => {
    if (sortBy==="price_asc")  return a.price - b.price;
    if (sortBy==="price_desc") return b.price - a.price;
    if (sortBy==="rating")     return b.rating - a.rating;
    return 0;
  });

  const addToCart = (p) => {
    setCart(c => {
      const ex = c.find(x=>x.id===p.id);
      if (ex) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x);
      return [...c, {...p, qty:1}];
    });
    setAdded(p.id);
    setTimeout(()=>setAdded(null),1500);
  };
  const removeFromCart = (id) => setCart(c=>c.filter(x=>x.id!==id));
  const toggleWish = (id) => setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);
  const cartTotal  = cart.reduce((s,p)=>s+p.price*p.qty, 0);
  const cartCount  = cart.reduce((s,p)=>s+p.qty, 0);

  const aiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoad(true); setAiRes(""); setView("ai");
    const r = await call(
      `Je cherche à acheter sur Amazon: "${aiQuery}". Donne-moi 4-5 recommandations de produits spécifiques avec : nom exact, marque, prix approximatif en CHF, pourquoi c'est le meilleur choix, note estimée /5. Format liste claire avec emojis. Tiens compte que je suis en voyage.`,
      "Tu es un expert shopping Amazon spécialisé dans les produits voyage. Recommande des produits réels disponibles sur Amazon en 2026."
    );
    setAiRes(r); setAiLoad(false);
  };

  const checkout = () => {
    if (cart.length===0) return;
    const item = {
      name: `Commande Amazon (${cartCount} articles)`,
      price: cartTotal,
      icon: "🛒",
      details: cart.map(p=>`${p.icon} ${p.name} x${p.qty}`).join(", "),
      store: currentStore.name,
    };
    onBook(item, "amazon");
  };

  const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5-Math.round(r));

  const PRIME_BENEFITS = [
    { icon:"🚀", title:"Livraison Express",     desc:"Gratuite en 1-2 jours sur millions d'articles" },
    { icon:"🎬", title:"Prime Video",           desc:"Films, séries, anime en streaming illimité" },
    { icon:"🎵", title:"Prime Music",           desc:"100M+ titres sans pub, podcasts exclusifs" },
    { icon:"📚", title:"Prime Reading",         desc:"1000+ livres & magazines gratuits / mois" },
    { icon:"🎮", title:"Prime Gaming",          desc:"Jeux gratuits + Twitch Channel inclus" },
    { icon:"📷", title:"Amazon Photos",         desc:"Stockage photos illimité + 5Go autres fichiers" },
    { icon:"⚡", title:"Accès Early Deals",     desc:"Offres exclusives avant tout le monde" },
    { icon:"🌍", title:"Prime Voyage X World",  desc:"10% cashback XWL sur vos achats voyages" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Header Amazon */}
      <div style={{ background:"linear-gradient(135deg,rgba(255,153,0,0.2),rgba(255,153,0,0.05))", border:"1px solid rgba(255,153,0,0.3)", borderRadius:18, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#ff9900,#e47911)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🛒</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#fff" }}>Amazon <span style={{ color:"#ff9900" }}>X World</span></div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Shopping mondial intégré · {currentStore.name}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[["shop","🛒 Shop"],["cart",`🛒 Panier (${cartCount})`],["prime","⚡ Prime"],["search","🔍 Recherche"]].map(([id,l])=>(
            <button key={id} onClick={()=>setView(id)} style={{ padding:"7px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:view===id?"#ff9900":"rgba(255,153,0,0.15)", color:view===id?"#000":"rgba(255,255,255,0.7)", transition:"all 0.18s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Store selector */}
      <Card>
        <Lbl>🌍 Boutique Amazon</Lbl>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {AMAZON_STORES.map(s=>(
            <button key={s.id} onClick={()=>setStore(s.id)}
              style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:5, background:store===s.id?"rgba(255,153,0,0.9)":"rgba(255,153,0,0.1)", color:store===s.id?"#000":"rgba(255,255,255,0.7)", fontWeight:store===s.id?700:400, transition:"all 0.15s" }}>
              <span>{s.flag}</span><span>{s.name}</span><span style={{ fontSize:10, opacity:0.7 }}>({s.currency})</span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── SHOP VIEW ── */}
      {view==="shop" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Search bar */}
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setView("search")} placeholder="Rechercher sur Amazon..." style={{ ...C.input, paddingLeft:36, borderColor:"rgba(255,153,0,0.3)" }}/>
            </div>
            <button onClick={()=>{setAiQuery(search);aiSearch();}} style={{ padding:"9px 16px", borderRadius:11, background:"linear-gradient(135deg,#ff9900,#e47911)", border:"none", color:"#000", fontWeight:700, fontSize:12, cursor:"pointer" }}>🤖 IA</button>
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {AMAZON_CATS.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.id)} style={{ padding:"5px 13px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, background:cat===c.id?"rgba(255,153,0,0.9)":"rgba(255,153,0,0.1)", color:cat===c.id?"#000":"rgba(255,255,255,0.65)", fontWeight:cat===c.id?700:400 }}>{c.icon} {c.label}</button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Trier par:</span>
            {[["featured","Pertinence"],["price_asc","Prix ↑"],["price_desc","Prix ↓"],["rating","Note"]].map(([id,l])=>(
              <button key={id} onClick={()=>setSortBy(id)} style={{ padding:"4px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, background:sortBy===id?"rgba(255,153,0,0.3)":"rgba(255,255,255,0.07)", color:sortBy===id?"#ff9900":"rgba(255,255,255,0.5)" }}>{l}</button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.3)" }}>{filtered.length} produits</span>
          </div>

          {/* Product grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {filtered.map(p=>(
              <Card key={p.id} style={{ padding:14, display:"flex", flexDirection:"column", gap:8, position:"relative", border:`1px solid ${p.badge?"rgba(255,153,0,0.3)":"rgba(80,150,255,0.18)"}` }}>
                {/* Badge */}
                {p.badge && <div style={{ position:"absolute", top:10, left:10, background:"linear-gradient(135deg,#ff9900,#e47911)", borderRadius:5, padding:"2px 7px", fontSize:9, fontWeight:700, color:"#000" }}>{p.badge}</div>}
                {/* Discount */}
                {p.discount>0 && <div style={{ position:"absolute", top:10, right:10, background:"#ef4444", borderRadius:5, padding:"2px 7px", fontSize:9, fontWeight:700, color:"#fff" }}>-{p.discount}%</div>}
                {/* Wishlist */}
                <button onClick={()=>toggleWish(p.id)} style={{ position:"absolute", top:p.badge?"32px":"10px", right:10, background:"none", border:"none", fontSize:16, cursor:"pointer", color:wishlist.includes(p.id)?"#ef4444":"rgba(255,255,255,0.3)" }}>♥</button>

                {/* Icon */}
                <div style={{ fontSize:42, textAlign:"center", marginTop:p.badge?16:0, marginBottom:4 }}>{p.icon}</div>

                {/* Info */}
                <div style={{ fontSize:11, color:"#ff9900", fontWeight:600 }}>{p.brand}</div>
                <div style={{ fontSize:13, color:"#fff", fontWeight:600, lineHeight:1.3 }}>{p.name}</div>

                {/* Rating */}
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:"#ff9900", fontSize:11 }}>{stars(p.rating)}</span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{p.rating} ({p.reviews.toLocaleString()})</span>
                </div>

                {/* Prime */}
                {p.prime && <div style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ background:"#00a8e0", borderRadius:3, padding:"1px 5px", fontSize:9, fontWeight:700, color:"#fff" }}>prime</span><span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Livraison gratuite</span></div>}

                {/* Price */}
                <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:p.discount>0?"#ff9900":"#fff" }}>
                    {p.discount>0 ? Math.round(p.price*(1-p.discount/100)) : p.price} {p.currency}
                  </span>
                  {p.discount>0 && <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textDecoration:"line-through" }}>{p.price}</span>}
                </div>

                {/* Buttons */}
                <div style={{ display:"flex", gap:6, marginTop:"auto" }}>
                  <button onClick={()=>addToCart(p)} style={{ flex:1, padding:"8px 0", borderRadius:9, background: added===p.id?"linear-gradient(135deg,#22c55e,#16a34a)":"linear-gradient(135deg,#ff9900,#e47911)", border:"none", color:"#000", fontWeight:700, fontSize:11, cursor:"pointer", transition:"all 0.2s" }}>
                    {added===p.id?"✓ Ajouté":"🛒 Ajouter"}
                  </button>
                  <button onClick={()=>window.open(`${currentStore.url}/s?k=${encodeURIComponent(p.name)}`,"_blank")} style={{ padding:"8px 10px", borderRadius:9, background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer" }}>↗</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── CART VIEW ── */}
      {view==="cart" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <H>🛒 Mon Panier Amazon</H>
          {cart.length===0 ? (
            <Card style={{ textAlign:"center", padding:40 }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🛒</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Votre panier est vide</div>
              <button onClick={()=>setView("shop")} style={{ marginTop:14, padding:"9px 22px", borderRadius:10, background:"#ff9900", border:"none", color:"#000", fontWeight:700, cursor:"pointer" }}>Continuer mes achats</button>
            </Card>
          ) : (
            <>
              {cart.map(p=>(
                <Card key={p.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:32 }}>{p.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{p.brand} · {currentStore.name}</div>
                    {p.prime && <span style={{ background:"#00a8e0", borderRadius:3, padding:"1px 5px", fontSize:9, fontWeight:700, color:"#fff" }}>prime</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button onClick={()=>setCart(c=>c.map(x=>x.id===p.id&&x.qty>1?{...x,qty:x.qty-1}:x))} style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", cursor:"pointer", fontSize:14 }}>-</button>
                    <span style={{ color:"#fff", fontWeight:700, minWidth:20, textAlign:"center" }}>{p.qty}</span>
                    <button onClick={()=>setCart(c=>c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x))} style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", cursor:"pointer", fontSize:14 }}>+</button>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#ff9900", minWidth:70, textAlign:"right" }}>{p.price*p.qty} {p.currency}</div>
                  <button onClick={()=>removeFromCart(p.id)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:18, cursor:"pointer" }}>×</button>
                </Card>
              ))}

              {/* Summary */}
              <Card style={{ background:"rgba(255,153,0,0.08)", border:"1px solid rgba(255,153,0,0.25)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:"rgba(255,255,255,0.6)", fontSize:13 }}>Sous-total ({cartCount} articles)</span>
                  <span style={{ fontWeight:700, color:"#fff" }}>{cartTotal.toFixed(2)} CHF</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:"#00a8e0", fontSize:13 }}>⚡ Livraison Prime</span>
                  <span style={{ color:"#4ade80", fontWeight:700 }}>GRATUIT</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, paddingTop:8, borderTop:"1px solid rgba(255,153,0,0.15)" }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#fff" }}>Total</span>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#ff9900" }}>{cartTotal.toFixed(2)} CHF</span>
                </div>
                <button onClick={checkout} style={{ width:"100%", padding:"13px 0", borderRadius:12, background:"linear-gradient(135deg,#ff9900,#e47911)", border:"none", color:"#000", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, cursor:"pointer", boxShadow:"0 6px 20px rgba(255,153,0,0.4)" }}>
                  🔒 Passer la commande — {cartTotal.toFixed(2)} CHF
                </button>
                <div style={{ textAlign:"center", marginTop:8, fontSize:10, color:"rgba(255,255,255,0.3)" }}>🔒 Paiement sécurisé SSL · Retours gratuits 30 jours</div>
              </Card>
            </>
          )}

          {/* Wishlist */}
          {wishlist.length>0 && (
            <Card>
              <Lbl>❤️ Liste de souhaits ({wishlist.length})</Lbl>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
                {FEATURED_PRODUCTS.filter(p=>wishlist.includes(p.id)).map(p=>(
                  <div key={p.id} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:10, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:22 }}>{p.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, color:"#fff", fontWeight:600, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize:11, color:"#ff9900", fontWeight:700 }}>{p.price} CHF</div>
                    </div>
                    <button onClick={()=>addToCart(p)} style={{ background:"#ff9900", border:"none", borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:700, cursor:"pointer", color:"#000", flexShrink:0 }}>+</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── PRIME VIEW ── */}
      {view==="prime" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ background:"linear-gradient(135deg,rgba(0,168,224,0.25),rgba(0,168,224,0.05))", border:"1px solid rgba(0,168,224,0.3)", textAlign:"center", padding:"28px 20px" }}>
            <div style={{ fontSize:48, marginBottom:10 }}>⚡</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:"#fff", marginBottom:4 }}>Amazon Prime</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:16 }}>Tous les avantages inclus avec X World</div>
            <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap", marginBottom:20 }}>
              <div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#00a8e0" }}>CHF 8.99</div><div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/ mois</div></div>
              <div style={{ borderLeft:"1px solid rgba(255,255,255,0.1)", paddingLeft:16 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#4ade80" }}>CHF 69.90</div><div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/ an (économisez 38%)</div>
              </div>
            </div>
            <button style={{ padding:"12px 40px", borderRadius:12, background:"linear-gradient(135deg,#ff9900,#e47911)", border:"none", color:"#000", fontWeight:800, fontSize:14, cursor:"pointer" }}>
              Essai 30 jours GRATUIT →
            </button>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
            {PRIME_BENEFITS.map(b=>(
              <Card key={b.title} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:26, flexShrink:0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:"#fff", marginBottom:3 }}>{b.title}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:1.5 }}>{b.desc}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── AI SEARCH VIEW ── */}
      {view==="search" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <H>🤖 Recherche IA Amazon</H>
          <Card>
            <Lbl>Décrivez ce que vous cherchez</Lbl>
            <div style={{ display:"flex", gap:8 }}>
              <Inp value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&aiSearch()} placeholder="Ex: meilleure valise cabine pour voyages fréquents..."/>
              <Btn onClick={aiSearch} style={{ whiteSpace:"nowrap" }}>🔍 Rechercher</Btn>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
              {["Sac de voyage léger","Adaptateur universel","Écouteurs sans fil","Trousse de voyage","Kit premiers secours"].map(q=>(
                <button key={q} onClick={()=>{setAiQuery(q);setView("search");}} style={{ padding:"4px 11px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, background:"rgba(255,153,0,0.12)", color:"rgba(255,255,255,0.6)" }}>{q}</button>
              ))}
            </div>
          </Card>
          {aiLoad && <Card style={{ textAlign:"center", padding:30 }}><div style={{ fontSize:30, marginBottom:8 }}>🛒</div><div style={{ color:"rgba(255,255,255,0.5)" }}>L'IA cherche les meilleurs produits...</div></Card>}
          {aiRes && <Card style={{ background:"rgba(255,153,0,0.06)", border:"1px solid rgba(255,153,0,0.2)" }}><Lbl>🤖 Recommandations IA pour "{aiQuery}"</Lbl><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{aiRes}</div><div style={{ marginTop:12 }}><Btn onClick={()=>{window.open(`${currentStore.url}/s?k=${encodeURIComponent(aiQuery)}`,"_blank");}} style={{ fontSize:11 }}>↗ Voir sur {currentStore.name}</Btn></div></Card>}
        </div>
      )}

      {/* ── AI RESULT VIEW ── */}
      {view==="ai" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <H>🤖 Résultats IA</H>
          {aiLoad && <Card style={{ textAlign:"center", padding:30 }}><div style={{ fontSize:30 }}>🤖</div><div style={{ color:"rgba(255,255,255,0.5)", marginTop:8 }}>Analyse en cours...</div></Card>}
          {aiRes && (
            <Card style={{ background:"rgba(255,153,0,0.06)", border:"1px solid rgba(255,153,0,0.2)" }}>
              <Lbl>🤖 Recommandations pour "{aiQuery}"</Lbl>
              <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:12 }}>{aiRes}</div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={()=>window.open(`${currentStore.url}/s?k=${encodeURIComponent(aiQuery)}`,"_blank")} style={{ fontSize:11 }}>↗ Voir sur {currentStore.name}</Btn>
                <Btn v="g" onClick={()=>setView("shop")} style={{ fontSize:11 }}>← Retour shop</Btn>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FINANCE ─────────────────────────────────────────────────────────────────
function Finance() {
  const {call}=useAI();
  const [amt,setAmt]=useState("100");
  const [fr,setFr]=useState("EUR");
  const [to,setTo]=useState("USD");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const curr=["EUR","USD","CHF","GBP","JPY","CNY","INR","RUB","AUD","BRL","CAD","AED"];
  const convert=async()=>{setLoading(true);setResult("");const r=await call(`Taux de change ${amt} ${fr} → ${to} en 2026. Conseils pour éviter frais de change, meilleures apps, astuces retraits à l'étranger.`);setResult(r);setLoading(false);};
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}><H>💳 Finance & Devises</H>
    <Card><div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto",gap:8,alignItems:"end",marginBottom:12}}>
      <div><Lbl>Montant</Lbl><Inp value={amt} onChange={e=>setAmt(e.target.value)}/></div>
      <div style={{paddingBottom:2,color:"rgba(255,255,255,0.4)",fontSize:20,alignSelf:"center"}}>→</div>
      <div><Lbl>Vers</Lbl><select value={to} onChange={e=>setTo(e.target.value)} style={{...C.input,marginBottom:0}}>{curr.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
      <Btn onClick={convert} style={{height:42}}>Convertir</Btn>
    </div>
    <Lbl>Devise source</Lbl><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{curr.map(c=><Pill key={c} label={c} active={fr===c} onClick={()=>setFr(c)}/>)}</div></Card>
    {loading&&<Card style={{textAlign:"center",padding:24}}><div style={{color:"rgba(255,255,255,0.5)"}}>💳 Calcul...</div></Card>}
    {result&&<Card><div style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{result}</div></Card>}
  </div>);
}

// ─── GUIDE ────────────────────────────────────────────────────────────────────
function Guide() {
  const {call}=useAI();
  const [dest,setDest]=useState("");
  const [type,setType]=useState("culture");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const types=["culture","gastronomie","aventure","plage","famille","luxe","nature","backpacker"];
  const search=async()=>{if(!dest)return;setLoading(true);setResult("");const r=await call(`Guide complet pour ${dest} profil "${type}" : top attractions, restaurants, activités, budget quotidien, conseils, meilleure saison. Format clair avec emojis.`);setResult(r);setLoading(false);};
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}><H>🧭 Guide & Tourisme</H>
    <Card><div style={{display:"flex",gap:8,marginBottom:12}}><Inp value={dest} onChange={e=>setDest(e.target.value)} placeholder="Destination..." onKeyDown={e=>e.key==="Enter"&&search()}/><Btn onClick={search}>🔍 Guide</Btn></div>
    <Lbl>Style</Lbl><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{types.map(t=><Pill key={t} label={t} active={type===t} onClick={()=>setType(t)}/>)}</div></Card>
    {loading&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:30}}>🧭</div><div style={{color:"rgba(255,255,255,0.5)",marginTop:8}}>Création du guide...</div></Card>}
    {result&&<Card><div style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{result}</div></Card>}
  </div>);
}

// ─── SANTÉ ────────────────────────────────────────────────────────────────────
function Sante() {
  const {call}=useAI();
  const [dest,setDest]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const topics=["Vaccins requis","Assurance voyage","Urgences","Eau potable","Maladies tropicales","Helsana Suisse"];
  const search=async(t)=>{const q=t||dest;setLoading(true);setResult("");const r=await call(`Conseils santé pour voyager ${q} : vaccins, risques, assurances, numéros urgence, infos Helsana si Suisse.`);setResult(r);setLoading(false);};
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}><H>🏥 Santé & Assurance</H>
    <Card><div style={{display:"flex",gap:8,marginBottom:12}}><Inp value={dest} onChange={e=>setDest(e.target.value)} placeholder="Destination ou sujet santé..." onKeyDown={e=>e.key==="Enter"&&search()}/><Btn onClick={()=>search()}>Conseils</Btn></div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{topics.map(t=><Pill key={t} label={t} active={false} onClick={()=>{setDest(t);search(t);}}/>)}</div></Card>
    <Card style={{display:"flex",alignItems:"center",gap:12,padding:16,background:"rgba(0,112,192,0.15)",border:"1px solid rgba(0,168,232,0.2)"}}><span style={{fontSize:28}}>🏥</span><div><div style={{fontWeight:700,color:"#fff",fontSize:14}}>Helsana — Assurance Suisse</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>Couverture internationale résidents suisses</div></div><Btn v="g" onClick={()=>window.open("https://www.helsana.ch","_blank")} style={{marginLeft:"auto"}}>Accéder →</Btn></Card>
    {loading&&<Card style={{textAlign:"center",padding:24}}><div style={{color:"rgba(255,255,255,0.5)"}}>🏥 Chargement...</div></Card>}
    {result&&<Card><div style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{result}</div></Card>}
  </div>);
}

// ─── WECHAT-STYLE MESSAGES ────────────────────────────────────────────────────
const WC_GREEN = "#07c160";
const WC_DARK  = "rgba(5,25,15,0.95)";

function Messages({ user }) {
  const { call } = useAI();

  const [view, setView]   = useState("chats"); // chats | contacts | moments | wallet | discover
  const [active, setActive] = useState(null);
  const [input,  setInput]  = useState("");
  const [search, setSearch] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [showEmo,   setShowEmo]   = useState(false);
  const [showAdd,   setShowAdd]   = useState(false);
  const [newName,   setNewName]   = useState("");
  const [aiTyping,  setAiTyping]  = useState(false);
  const endRef = useRef(null);

  const EMOJIS = ["😀","😂","❤️","👍","🎉","🙏","😊","🔥","✈️","🌍","🏨","🍜","🎎","🗼","🌸","🀄","🐼","🦁","🌊","🎒","💳","🏥","🗺️","⛅","🤖"];

  const [contacts, setContacts] = useState([
    { id:1,  name:"Sophie Martin",    avatar:"👩", color:"#3b82f6", status:"online",  region:"🇫🇷 Paris",     last:"Prête pour Tokyo? 🗼",          time:"09:12", unread:2, pinned:true,  isGroup:false },
    { id:2,  name:"Marco Ferrari",    avatar:"👨", color:"#f97316", status:"online",  region:"🇮🇹 Rome",      last:"Le vol est confirmé! ✈️",         time:"Hier",  unread:0, pinned:false, isGroup:false },
    { id:3,  name:"Guide Local 🇯🇵",  avatar:"🧭", color:"#ef4444", status:"offline", region:"🇯🇵 Tokyo",     last:"Bienvenue à Tokyo! 🌸",           time:"Lun",   unread:1, pinned:true,  isGroup:false },
    { id:4,  name:"Anna Müller",      avatar:"👩‍💼",color:"#8b5cf6", status:"online",  region:"🇨🇭 Zurich",    last:"Helsana confirme la couverture", time:"Mar",   unread:0, pinned:false, isGroup:false },
    { id:5,  name:"🌍 X World Voyage",avatar:"🌐", color:"#07c160", status:"online",  region:"Groupe",        last:"Nouveau vol Paris→Dubaï dispo!", time:"08:30", unread:5, pinned:true,  isGroup:true  },
    { id:6,  name:"李明 (Li Ming)",   avatar:"🇨🇳", color:"#ef4444", status:"online",  region:"🇨🇳 Shanghai",  last:"你好！我在上海等你",               time:"Mer",   unread:0, pinned:false, isGroup:false },
    { id:7,  name:"Priya Sharma",     avatar:"🇮🇳", color:"#f59e0b", status:"offline", region:"🇮🇳 Mumbai",    last:"Uber booked! 🛺",                  time:"Jeu",   unread:0, pinned:false, isGroup:false },
    { id:8,  name:"🚖 X World VTC",  avatar:"🚗", color:"#f97316", status:"online",  region:"Service",       last:"Votre chauffeur arrive dans 3min",time:"09:00", unread:1, pinned:false, isGroup:true  },
  ]);

  const [conversations, setConversations] = useState({
    1: [
      { id:1, from:"them", text:"Bonjour ! Tu es prête pour Tokyo ? 🗼", time:"09:10", type:"text" },
      { id:2, from:"them", text:"J'ai réservé le vol Air France CDG→NRT ! ✈️", time:"09:11", type:"text" },
      { id:3, from:"them", text:"Prête pour Tokyo? 🗼", time:"09:12", type:"text" },
    ],
    2: [
      { id:1, from:"them", text:"Le vol Rome→Paris est confirmé! ✈️", time:"Hier", type:"text" },
      { id:2, from:"them", text:"Rendez-vous à l'aéroport à 14h 🛫", time:"Hier", type:"text" },
    ],
    3: [
      { id:1, from:"them", text:"Bienvenue à Tokyo! 🌸 Je suis votre guide local.", time:"Lun", type:"text" },
      { id:2, from:"them", text:"Je vous attends à la sortie Shibuya 🚉", time:"Lun", type:"text" },
    ],
    4: [
      { id:1, from:"them", text:"Helsana confirme la couverture internationale 🏥", time:"Mar", type:"text" },
      { id:2, from:"them", text:"Votre police voyage est active jusqu'au 31/12/2026", time:"Mar", type:"text" },
    ],
    5: [
      { id:1, from:"system", text:"Groupe X World Voyage créé 🌍", time:"08:00", type:"system" },
      { id:2, from:"Sophie", text:"Qui vient à Dubaï en juillet? 🌞", time:"08:20", type:"text" },
      { id:3, from:"Marco",  text:"Moi! J'ai trouvé un vol à €392 ✈️", time:"08:25", type:"text" },
      { id:4, from:"them",   text:"Nouveau vol Paris→Dubaï dispo! 🕌", time:"08:30", type:"text" },
    ],
    6: [
      { id:1, from:"them", text:"你好！我在上海等你 🏙️", time:"Mer", type:"text" },
      { id:2, from:"them", text:"Shanghai est magnifique en ce moment!", time:"Mer", type:"text" },
    ],
    7: [
      { id:1, from:"them", text:"Uber booked! 🛺 Driver arriving in 5 min", time:"Jeu", type:"text" },
    ],
    8: [
      { id:1, from:"system", text:"Service X World VTC activé", time:"09:00", type:"system" },
      { id:2, from:"them",   text:"Votre chauffeur Ahmed est en route 🚗", time:"09:00", type:"text" },
      { id:3, from:"them",   text:"Arrivée estimée : 3 minutes ⏱️", time:"09:01", type:"text" },
    ],
  });

  const [moments] = useState([
    { id:1, user:"Sophie Martin",    avatar:"👩", time:"Il y a 2h",   text:"Incroyable vue depuis le Mont Fuji! 🗻",        emoji:"🗻", likes:12, comments:3 },
    { id:2, user:"Marco Ferrari",    avatar:"👨", time:"Il y a 4h",   text:"Pasta e pizza a Roma 🇮🇹 La vita è bella!",     emoji:"🍕", likes:8,  comments:1 },
    { id:3, user:"Li Ming",          avatar:"🇨🇳", time:"Il y a 6h",   text:"上海夜景太美了！✨ Shanghai by night!",         emoji:"🌃", likes:24, comments:7 },
    { id:4, user:"Priya Sharma",     avatar:"🇮🇳", time:"Hier",        text:"Taj Mahal at sunrise 🕌 Pure magic 🌅",          emoji:"🕌", likes:31, comments:5 },
    { id:5, user:"Anna Müller",      avatar:"👩‍💼", time:"Avant-hier",  text:"Zürich Altstadt ❤️ Toujours aussi belle! 🇨🇭",  emoji:"🏔️", likes:9,  comments:2 },
  ]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [conversations, active]);

  const activeContact = contacts.find(c => c.id === active);
  const activeMsgs    = conversations[active] || [];

  const send = async () => {
    if (!input.trim() || !active) return;
    const msg = { id:Date.now(), from:"me", text:input.trim(), time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), type:"text" };
    setConversations(c => ({ ...c, [active]: [...(c[active]||[]), msg] }));
    setContacts(cs => cs.map(c => c.id===active ? {...c, last:input.trim(), time:"maintenant", unread:0} : c));
    const txt = input.trim();
    setInput(""); setShowEmo(false);

    // AI auto-reply for some contacts
    if ([1,3,5,8].includes(active)) {
      setAiTyping(true);
      await new Promise(r=>setTimeout(r,1200+Math.random()*800));
      const contact = contacts.find(c=>c.id===active);
      const reply = await call(txt, `Tu es ${contact?.name}, un ami ou contact de voyage de l'utilisateur. Réponds de façon naturelle, courte (1-2 phrases max), amicale et pertinente au contexte voyage. Utilise des emojis. Langue : français sauf si le contact parle une autre langue.`);
      const aiMsg = { id:Date.now()+1, from:"them", text:reply, time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), type:"text" };
      setConversations(c => ({ ...c, [active]: [...(c[active]||[]), aiMsg] }));
      setContacts(cs => cs.map(c => c.id===active ? {...c, last:reply, time:"maintenant"} : c));
      setAiTyping(false);
    }
  };

  const sendEmoji = (em) => {
    const msg = { id:Date.now(), from:"me", text:em, time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), type:"text" };
    setConversations(c => ({ ...c, [active]: [...(c[active]||[]), msg] }));
    setShowEmo(false);
  };

  const addContact = () => {
    if (!newName.trim()) return;
    const avatars = ["👤","🧑","👦","👧","🧑‍💻","🧑‍✈️","🧑‍🍳","🧑‍🎤"];
    const colors  = ["#3b82f6","#8b5cf6","#ef4444","#f59e0b","#22c55e","#ec4899","#06b6d4","#f97316"];
    const nc = { id:Date.now(), name:newName.trim(), avatar:avatars[Math.floor(Math.random()*avatars.length)], color:colors[Math.floor(Math.random()*colors.length)], status:"offline", region:"Inconnu", last:"Nouveau contact", time:"maintenant", unread:0, pinned:false, isGroup:false };
    setContacts(cs => [...cs, nc]);
    setConversations(cv => ({...cv, [nc.id]:[]}));
    setNewName(""); setShowAdd(false); setActive(nc.id);
  };

  const filtered = contacts.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const pinned   = filtered.filter(c=>c.pinned);
  const others   = filtered.filter(c=>!c.pinned);

  // ── SIDEBAR VIEWS ──
  const NAV = [
    { id:"chats",    icon:"💬", label:"Chats",    badge: contacts.reduce((s,c)=>s+c.unread,0) },
    { id:"contacts", icon:"👥", label:"Contacts", badge:0 },
    { id:"moments",  icon:"🌟", label:"Moments",  badge:0 },
    { id:"discover", icon:"🧭", label:"Discover", badge:0 },
    { id:"wallet",   icon:"💳", label:"Wallet",   badge:0 },
  ];

  return (
    <div style={{ display:"flex", height:600, borderRadius:18, overflow:"hidden", border:"1px solid rgba(7,193,96,0.25)", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
      <style>{`@keyframes wcpulse{0%,100%{opacity:1}50%{opacity:0.3}} .wc-msg-in{animation:wc-slide-in 0.2s ease} @keyframes wc-slide-in{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}`}</style>

      {/* ── LEFT: Nav + List ── */}
      <div style={{ width:260, flexShrink:0, background:WC_DARK, borderRight:"1px solid rgba(7,193,96,0.12)", display:"flex", flexDirection:"column" }}>

        {/* WeChat Header */}
        <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid rgba(7,193,96,0.12)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${WC_GREEN},#05a350)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💬</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:"#fff" }}>WeChat <span style={{ color:WC_GREEN }}>X World</span></div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>Messagerie intégrée</div>
            </div>
          </div>
          <button onClick={()=>setShowAdd(a=>!a)} style={{ background:"none", border:"none", color:WC_GREEN, fontSize:20, cursor:"pointer" }}>＋</button>
        </div>

        {/* Add contact popup */}
        {showAdd && (
          <div style={{ padding:"10px 12px", background:"rgba(7,193,96,0.08)", borderBottom:"1px solid rgba(7,193,96,0.12)" }}>
            <div style={{ display:"flex", gap:6 }}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addContact()} placeholder="Nom du contact..." style={{ ...C.input, fontSize:11, padding:"7px 10px", flex:1 }}/>
              <button onClick={addContact} style={{ background:WC_GREEN, border:"none", borderRadius:8, color:"#fff", padding:"7px 12px", cursor:"pointer", fontSize:12, fontWeight:700 }}>+</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ padding:"8px 10px", borderBottom:"1px solid rgba(7,193,96,0.08)" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher..." style={{ ...C.input, fontSize:11, padding:"7px 12px", borderRadius:99, background:"rgba(255,255,255,0.06)" }}/>
        </div>

        {/* Nav tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(7,193,96,0.12)" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
              <span style={{ fontSize:14 }}>{n.icon}</span>
              <span style={{ fontSize:8, color:view===n.id?WC_GREEN:"rgba(255,255,255,0.3)", fontWeight:view===n.id?700:400 }}>{n.label}</span>
              {n.badge>0 && <span style={{ position:"absolute", top:4, right:"50%", transform:"translateX(80%)", width:14, height:14, borderRadius:"50%", background:"#ef4444", fontSize:8, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{n.badge}</span>}
              {view===n.id && <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:20, height:2, background:WC_GREEN, borderRadius:1 }}/>}
            </button>
          ))}
        </div>

        {/* List area */}
        <div style={{ flex:1, overflowY:"auto" }}>

          {/* CHATS VIEW */}
          {view==="chats" && (
            <>
              {pinned.length>0 && (
                <>
                  <div style={{ padding:"5px 12px 3px", fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:1, textTransform:"uppercase" }}>ÉPINGLÉS</div>
                  {pinned.map(c=><ContactRow key={c.id} c={c} active={active} onClick={()=>{setActive(c.id);setContacts(cs=>cs.map(x=>x.id===c.id?{...x,unread:0}:x));}}/>)}
                  <div style={{ height:1, background:"rgba(7,193,96,0.08)", margin:"4px 0" }}/>
                </>
              )}
              {others.map(c=><ContactRow key={c.id} c={c} active={active} onClick={()=>{setActive(c.id);setContacts(cs=>cs.map(x=>x.id===c.id?{...x,unread:0}:x));}}/>)}
            </>
          )}

          {/* CONTACTS VIEW */}
          {view==="contacts" && (
            <div>
              {contacts.map(c=>(
                <div key={c.id} onClick={()=>{setView("chats");setActive(c.id);}} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${c.color}88,${c.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{c.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{c.region} · <span style={{ color:c.status==="online"?WC_GREEN:"rgba(255,255,255,0.25)" }}>●</span> {c.status}</div>
                  </div>
                  {c.isGroup && <span style={{ fontSize:10, background:"rgba(7,193,96,0.15)", border:"1px solid rgba(7,193,96,0.3)", borderRadius:5, padding:"1px 6px", color:WC_GREEN }}>Groupe</span>}
                </div>
              ))}
            </div>
          )}

          {/* MOMENTS VIEW */}
          {view==="moments" && (
            <div style={{ padding:10 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Moments Voyage</div>
              {moments.map(m=>(
                <div key={m.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:12, marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:`rgba(7,193,96,0.2)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{m.avatar}</div>
                    <div><div style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{m.user}</div><div style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>{m.time}</div></div>
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.5, marginBottom:6 }}>{m.emoji} {m.text}</div>
                  <div style={{ display:"flex", gap:10, fontSize:10, color:"rgba(255,255,255,0.35)" }}>
                    <span>❤️ {m.likes}</span><span>💬 {m.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DISCOVER VIEW */}
          {view==="discover" && (
            <div style={{ padding:10 }}>
              {[["🔍 Recherche","Trouvez des voyageurs proches"],["🎮 Mini-apps","Jeux & services voyage"],["🛍️ Shopping","Boutiques hors-taxes"],["📰 Articles","News voyage & culture"],["🎙️ Live","Guides en direct"]].map(([t,d])=>(
                <div key={t} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 10px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}>
                  <span style={{ fontSize:20 }}>{t.split(" ")[0]}</span>
                  <div><div style={{ fontSize:12, color:"#fff", fontWeight:600 }}>{t.slice(3)}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{d}</div></div>
                  <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
                </div>
              ))}
            </div>
          )}

          {/* WALLET VIEW */}
          {view==="wallet" && (
            <div style={{ padding:12 }}>
              <div style={{ background:`linear-gradient(135deg,${WC_GREEN}33,rgba(5,163,80,0.1))`, border:`1px solid ${WC_GREEN}44`, borderRadius:14, padding:14, marginBottom:10 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>WeChat Pay</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:WC_GREEN }}>€ 1,248.50</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>Solde disponible</div>
              </div>
              {[["💸 Envoyer de l'argent","Transfert instantané"],["🧾 Scan & Pay","Scanner QR code"],["📊 Historique","Vos transactions"],["💴 Taux de change","CNY / EUR / CHF"],["🏦 Recharger","Ajouter des fonds"]].map(([t,d])=>(
                <div key={t} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}>
                  <span style={{ fontSize:18 }}>{t.split(" ")[0]}</span>
                  <div><div style={{ fontSize:12, color:"#fff" }}>{t.slice(3)}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{d}</div></div>
                  <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.2)" }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Chat area ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:"rgba(4,15,40,0.95)" }}>
        {active && activeContact ? (
          <>
            {/* Chat header */}
            <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(7,193,96,0.12)", display:"flex", alignItems:"center", gap:10, background:WC_DARK }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${activeContact.color}88,${activeContact.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{activeContact.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff" }}>{activeContact.name}</div>
                <div style={{ fontSize:10, color:activeContact.status==="online"?WC_GREEN:"rgba(255,255,255,0.3)" }}>
                  <span>● </span>{activeContact.status==="online"?"En ligne":activeContact.region}
                  {activeContact.isGroup && <span style={{ marginLeft:6, color:"rgba(255,255,255,0.3)" }}>· {activeContact.isGroup?"Groupe":""}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:16, cursor:"pointer" }} title="Appel audio">📞</button>
                <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:16, cursor:"pointer" }} title="Appel vidéo">📹</button>
                <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:16, cursor:"pointer" }} title="Plus">⋯</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8, background:"rgba(4,12,30,0.8)" }}>
              {activeMsgs.map((m, i) => (
                <div key={i} className="wc-msg-in" style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":m.from==="system"?"center":"flex-start", alignItems:"flex-end", gap:7 }}>
                  {m.from==="system" && (
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"3px 10px" }}>{m.text}</div>
                  )}
                  {m.from!=="system" && m.from!=="me" && (
                    <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${activeContact.color}88,${activeContact.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{activeContact.avatar}</div>
                  )}
                  {m.from!=="system" && (
                    <div style={{ maxWidth:"65%", display:"flex", flexDirection:"column", alignItems:m.from==="me"?"flex-end":"flex-start", gap:2 }}>
                      {m.from!=="me"&&activeContact.isGroup&&<div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginLeft:4 }}>{m.from}</div>}
                      <div style={{
                        background: m.from==="me" ? `linear-gradient(135deg,${WC_GREEN},#05a350)` : "rgba(20,40,80,0.9)",
                        borderRadius: m.from==="me" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                        padding:"9px 13px", fontSize:13, color:"#fff", lineHeight:1.5, wordBreak:"break-word",
                        boxShadow: m.from==="me" ? `0 2px 12px ${WC_GREEN}44` : "0 2px 8px rgba(0,0,0,0.3)",
                      }}>{m.text}</div>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.2)", marginTop:1 }}>{m.time}{m.from==="me"&&" ✓✓"}</div>
                    </div>
                  )}
                </div>
              ))}
              {aiTyping && (
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${activeContact.color}88,${activeContact.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{activeContact.avatar}</div>
                  <div style={{ background:"rgba(20,40,80,0.9)", borderRadius:"4px 16px 16px 16px", padding:"10px 14px", display:"flex", gap:4, alignItems:"center" }}>
                    {[0,0.2,0.4].map((d,i)=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:WC_GREEN, animation:`wcpulse 1s ${d}s infinite` }}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* Emoji picker */}
            {showEmo && (
              <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(7,193,96,0.1)", background:WC_DARK, display:"flex", flexWrap:"wrap", gap:6 }}>
                {EMOJIS.map(e=><button key={e} onClick={()=>sendEmoji(e)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", padding:"2px 4px", borderRadius:6 }}>{e}</button>)}
              </div>
            )}

            {/* Input bar */}
            <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(7,193,96,0.12)", background:WC_DARK, display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={()=>setVoiceMode(v=>!v)} style={{ background:"none", border:"none", color:voiceMode?WC_GREEN:"rgba(255,255,255,0.4)", fontSize:18, cursor:"pointer" }}>🎙️</button>
              {voiceMode ? (
                <div style={{ flex:1, padding:"9px 14px", background:"rgba(7,193,96,0.1)", border:`1px solid ${WC_GREEN}44`, borderRadius:99, fontSize:12, color:WC_GREEN, textAlign:"center", cursor:"pointer" }}>
                  Maintenez pour parler
                </div>
              ) : (
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Message..."
                  style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99, padding:"9px 14px", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none" }}/>
              )}
              <button onClick={()=>setShowEmo(v=>!v)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:18, cursor:"pointer" }}>😊</button>
              <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:18, cursor:"pointer" }}>📎</button>
              {input.trim() ? (
                <button onClick={send} style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${WC_GREEN},#05a350)`, border:"none", cursor:"pointer", fontSize:16, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>↑</button>
              ) : (
                <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:18, cursor:"pointer" }}>⊕</button>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:`linear-gradient(135deg,${WC_GREEN},#05a350)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>💬</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#fff" }}>WeChat X World</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", textAlign:"center" }}>Sélectionnez une conversation<br/>ou ajoutez un contact avec ＋</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ContactRow sub-component
function ContactRow({ c, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", cursor:"pointer", background:active===c.id?"rgba(7,193,96,0.1)":"transparent", borderBottom:"1px solid rgba(255,255,255,0.03)", transition:"background 0.15s" }}>
      <div style={{ position:"relative", flexShrink:0 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${c.color}88,${c.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{c.avatar}</div>
        {c.status==="online" && <div style={{ position:"absolute", bottom:0, right:0, width:9, height:9, borderRadius:"50%", background:"#07c160", border:"1.5px solid rgba(5,25,15,0.95)" }}/>}
        {c.unread>0 && <div style={{ position:"absolute", top:-3, right:-3, minWidth:15, height:15, borderRadius:99, background:"#ef4444", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, padding:"0 3px" }}>{c.unread}</div>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
            {c.name}{c.pinned&&<span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>📌</span>}
          </div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", flexShrink:0 }}>{c.time}</div>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", marginTop:1 }}>{c.last}</div>
      </div>
    </div>
  );
}

// ─── ASSISTANT IA ─────────────────────────────────────────────────────────────
function Assistant({ user, setTab }) {
  const {call}=useAI();
  const [msgs,setMsgs]=useState([{role:"ai",text:`Bonjour ${user?.firstName||"voyageur"} ${user?.avatar||"🌍"} ! Je suis votre assistant X World. Je peux vous aider à planifier des voyages, réserver des vols/hôtels/transports, consulter la météo, convertir des devises et bien plus !`}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const quickQ=["Planifie 7 jours à Tokyo 🇯🇵","Visa pour la Russie 🇷🇺","Budget Australie 🇦🇺","Top restaurants Paris 🇫🇷","Sécurité en Inde 🇮🇳","Meilleure période Chine 🇨🇳"];
  const send=async(q)=>{const question=q||input.trim();if(!question)return;setMsgs(m=>[...m,{role:"user",text:question}]);setInput("");setLoading(true);
    const r=await call(question,`Tu es un assistant expert de voyage X World. Tu couvres vols, hôtels, transports VTC, météo, devises, guides touristiques, santé/vaccins pour 9 régions. Réponds en français avec emojis, de façon structurée. L'utilisateur s'appelle ${user?.firstName||"voyageur"}.`);
    setMsgs(m=>[...m,{role:"ai",text:r}]);setLoading(false);};
  return(<div style={{display:"flex",flexDirection:"column",height:580,gap:12}}>
    <H>🤖 Assistant IA — X World</H>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{quickQ.map(q=><Pill key={q} label={q} active={false} onClick={()=>send(q)}/>)}</div>
    <Card style={{flex:1,padding:14,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>{m.role==="ai"&&<span style={{fontSize:20,marginRight:8,alignSelf:"flex-start",marginTop:4}}>🤖</span>}<div style={{maxWidth:"78%",background:m.role==="user"?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"rgba(10,50,180,0.28)",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,color:"#fff",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.text}</div></div>)}
      {loading&&<div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🤖</span><div style={{background:"rgba(10,50,180,0.28)",borderRadius:12,padding:"9px 13px",color:"rgba(255,255,255,0.5)",fontSize:13}}>En réflexion...</div></div>}
      <div ref={endRef}/>
    </Card>
    <div style={{display:"flex",gap:8}}><Inp value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Posez votre question..."/><Btn onClick={()=>send()} style={{whiteSpace:"nowrap"}}>Envoyer ✈️</Btn></div>
  </div>);
}

// ─── TODO ─────────────────────────────────────────────────────────────────────
function Todo() {
  const cats=["✈️ Voyage","🏨 Hôtel","🎒 Bagages","📋 Admin","💊 Santé","💰 Budget"];
  const [tasks,setTasks]=useState([
    {id:1,text:"Réserver vol Paris → Tokyo",done:false,cat:"✈️ Voyage",p:"high"},
    {id:2,text:"Vérifier passeport",done:false,cat:"📋 Admin",p:"high"},
    {id:3,text:"Assurance Helsana voyage",done:false,cat:"💊 Santé",p:"med"},
    {id:4,text:"Echanger devises Revolut",done:false,cat:"💰 Budget",p:"med"},
    {id:5,text:"Réserver hôtel Booking.com",done:true,cat:"🏨 Hôtel",p:"low"},
  ]);
  const [input,setInput]=useState("");
  const [cat,setCat]=useState("✈️ Voyage");
  const [filter,setFilter]=useState("all");
  const colors={high:"#ef4444",med:"#f59e0b",low:"#22c55e"};
  const add=()=>{if(!input.trim())return;setTasks(t=>[{id:Date.now(),text:input.trim(),done:false,cat,p:"med"},...t]);setInput("");};
  const done=tasks.filter(t=>t.done).length;
  const filtered=filter==="all"?tasks:filter==="done"?tasks.filter(t=>t.done):tasks.filter(t=>!t.done);
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}><H>✅ Ma To-Do Voyage</H>
    <Card><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>Progression</span><span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{done}/{tasks.length}</span></div><div style={{height:8,background:"rgba(255,255,255,0.08)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${tasks.length?done/tasks.length*100:0}%`,background:"linear-gradient(90deg,#1d4ed8,#22c55e)",borderRadius:99,transition:"width 0.4s"}}/></div></Card>
    <Card><div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>{cats.map(c=><Pill key={c} label={c} active={cat===c} onClick={()=>setCat(c)}/>)}</div><div style={{display:"flex",gap:8}}><Inp value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Nouvelle tâche..."/><Btn onClick={add}>+ Ajouter</Btn></div></Card>
    <div style={{display:"flex",gap:6}}>{[["all","Toutes"],["todo","À faire"],["done","Terminées"]].map(([id,l])=><Pill key={id} label={l} active={filter===id} onClick={()=>setFilter(id)}/>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>{filtered.map(t=><Card key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px"}}>
      <button onClick={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))} style={{width:22,height:22,borderRadius:6,border:`2px solid ${t.done?"#3b82f6":"rgba(80,150,255,0.35)"}`,background:t.done?"#3b82f6":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{t.done&&<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 7L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>}</button>
      <div style={{width:5,height:5,borderRadius:"50%",background:colors[t.p],flexShrink:0}}/>
      <span style={{flex:1,fontSize:13,color:t.done?"rgba(255,255,255,0.3)":"#fff",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
      <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{t.cat}</span>
      <button onClick={()=>setTasks(ts=>ts.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",fontSize:18,cursor:"pointer"}}>×</button>
    </Card>)}</div>
  </div>);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",password:"",confirm:"",country:"",avatar:"🌍"});
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const avatars=["🌍","✈️","🧭","🏝️","🚀","🌊","🦁","🎒","🗺️","🌸"];
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    setError("");
    if(mode==="register"&&(!form.firstName||!form.lastName||!form.email||!form.password))return setError("Tous les champs sont requis.");
    if(mode==="register"&&form.password!==form.confirm)return setError("Mots de passe différents.");
    if(!form.email||!form.password)return setError("Email et mot de passe requis.");
    setLoading(true);await new Promise(r=>setTimeout(r,600));setLoading(false);
    onLogin({firstName:form.firstName||"Voyageur",lastName:form.lastName||"",email:form.email,country:form.country||"Monde",avatar:form.avatar,joined:new Date().toLocaleDateString("fr-FR",{year:"numeric",month:"long"})});
  };
  const inp=(ph,k,t="text")=><input type={t} placeholder={ph} value={form[k]} onChange={e=>set(k,e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{...C.input,marginBottom:10}}/>;
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:999,backdropFilter:"blur(6px)"}}/>
    <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:1000,background:"linear-gradient(160deg,#06154a,#0a1f6b)",border:"1px solid rgba(80,150,255,0.3)",borderRadius:24,padding:"28px 24px",width:420,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 100px rgba(0,0,50,0.7)"}}>
      <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:38,marginBottom:4}}>🌍</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,background:"linear-gradient(90deg,#fff,#60b4ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>X WORLD HUB</div><div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:3}}>Un compte · Accès universel</div></div>
      <div style={{display:"flex",background:"rgba(10,40,120,0.4)",borderRadius:10,padding:3,marginBottom:16}}>{["login","register"].map(m=><button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,background:mode===m?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"transparent",color:mode===m?"#fff":"rgba(255,255,255,0.4)"}}>{m==="login"?"Se connecter":"S'inscrire"}</button>)}</div>
      {mode==="register"&&<><div style={{marginBottom:12}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Avatar</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{avatars.map(a=><button key={a} onClick={()=>set("avatar",a)} style={{width:38,height:38,borderRadius:10,border:`2px solid ${form.avatar===a?"#3b82f6":"rgba(80,150,255,0.2)"}`,background:form.avatar===a?"rgba(59,130,246,0.3)":"rgba(10,50,180,0.15)",fontSize:17,cursor:"pointer"}}>{a}</button>)}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}><input placeholder="Prénom *" value={form.firstName} onChange={e=>set("firstName",e.target.value)} style={{...C.input,marginBottom:10}}/><input placeholder="Nom *" value={form.lastName} onChange={e=>set("lastName",e.target.value)} style={{...C.input,marginBottom:10}}/></div></>}
      {inp("Email *","email","email")}{mode==="register"&&inp("Pays","country")}{inp("Mot de passe *","password","password")}{mode==="register"&&inp("Confirmer mot de passe *","confirm","password")}
      {error&&<div style={{color:"#f87171",fontSize:12,marginBottom:10,padding:"8px 12px",background:"rgba(239,68,68,0.1)",borderRadius:8}}>⚠️ {error}</div>}
      <button onClick={submit} disabled={loading} style={{...C.btnP,width:"100%",textAlign:"center",padding:"12px 0",fontSize:14,opacity:loading?0.7:1}}>{loading?"Connexion...":mode==="login"?"Se connecter →":"Créer mon compte →"}</button>
      <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"rgba(255,255,255,0.3)"}}>{mode==="login"?"Pas de compte ? ":"Déjà inscrit ? "}<span onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{color:"#60b4ff",cursor:"pointer",textDecoration:"underline"}}>{mode==="login"?"S'inscrire":"Se connecter"}</span></div>
    </div>
  </>);
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePanel({ user, onClose, onLogout }) {
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:999,backdropFilter:"blur(5px)"}}/>
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:290,zIndex:1000,background:"linear-gradient(180deg,#06154a,#0a1f6b)",borderLeft:"1px solid rgba(80,150,255,0.2)",display:"flex",flexDirection:"column",boxShadow:"-20px 0 60px rgba(0,0,50,0.5)"}}>
      <div style={{padding:"20px 16px 14px",borderBottom:"1px solid rgba(80,150,255,0.1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:12,color:"rgba(255,255,255,0.4)",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Mon Compte</span><button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"rgba(255,255,255,0.5)",width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:50,height:50,borderRadius:14,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{user.avatar}</div><div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>{user.firstName} {user.lastName}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{user.email}</div><div style={{fontSize:10,color:"#60b4ff",marginTop:2}}>📍 {user.country}</div></div></div>
        <div style={{marginTop:10,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:8,padding:"7px 10px",fontSize:11,color:"#93c5fd",fontWeight:600}}>🔑 Accès universel · 13 modules · 9 régions</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:7}}>{[["Prénom",user.firstName],["Nom",user.lastName],["Email",user.email],["Pays",user.country],["Membre depuis",user.joined]].map(([l,v])=><div key={l} style={{background:"rgba(10,50,180,0.2)",borderRadius:10,padding:"9px 12px"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:2}}>{l}</div><div style={{color:"#fff",fontSize:13}}>{v||"—"}</div></div>)}</div>
      <div style={{padding:"10px 12px",borderTop:"1px solid rgba(80,150,255,0.1)"}}><button onClick={onLogout} style={{...C.btnD,width:"100%",textAlign:"center"}}>🚪 Se déconnecter</button></div>
    </div>
  </>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,         setTab]         = useState("dashboard");
  const [region,      setRegion]      = useState("monde");
  const [user,        setUser]        = useState(null);
  const [showAuth,    setShowAuth]    = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sideOpen,    setSideOpen]    = useState(true);
  const [orders,      setOrders]      = useState([]);
  const [booking,     setBooking]     = useState(null); // { item, type }

  useEffect(()=>{
    (async()=>{
      try { const r=await window.storage.get("xworld:user"); if(r?.value) setUser(JSON.parse(r.value)); } catch {}
      try { const r=await window.storage.get("xworld:orders"); if(r?.value) setOrders(JSON.parse(r.value)); } catch {}
    })();
  },[]);

  const login  = async (u) => { setUser(u); setShowAuth(false); try { await window.storage.set("xworld:user",JSON.stringify(u)); } catch {} };
  const logout = async ()  => { setUser(null); setShowProfile(false); try { await window.storage.delete("xworld:user"); } catch {} };

  const handleBook = (item, type) => { setBooking({ item, type }); };
  const handleConfirm = async (order) => {
    const updated = [...orders, order];
    setOrders(updated);
    try { await window.storage.set("xworld:orders", JSON.stringify(updated)); } catch {}
    setBooking(null);
    setTimeout(()=>setTab("orders"), 500);
  };
  const handleCancel = async (i) => {
    const updated = orders.filter((_,idx)=>idx!==i);
    setOrders(updated);
    try { await window.storage.set("xworld:orders", JSON.stringify(updated)); } catch {}
  };

  const renderTab = () => {
    switch(tab) {
      case "dashboard": return <Dashboard user={user} setTab={setTab} region={region} setRegion={setRegion} orders={orders}/>;
      case "vols":      return <Vols onBook={handleBook}/>;
      case "hotels":    return <Hotels onBook={handleBook}/>;
      case "transport": return <Transport region={region} onBook={handleBook}/>;
      case "meteo":     return <Meteo/>;
      case "maps":      return <Maps/>;
      case "finance":   return <Finance/>;
      case "amazon":    return <Amazon onBook={handleBook}/>;
      case "guide":     return <Guide/>;
      case "sante":        return <Sante/>;
      case "messages":     return <Messages user={user}/>;
      case "ia":           return <Assistant user={user} setTab={setTab}/>;
      case "todo":         return <Todo/>;
      case "orders":       return <Orders orders={orders} onCancel={handleCancel}/>;
      case "localisation": return <Localisation setTab={setTab}/>;
      case "traducteur":   return <Traducteur/>;
      default:          return <Dashboard user={user} setTab={setTab} region={region} setRegion={setRegion} orders={orders}/>;
    }
  };

  const cur = TABS.find(t=>t.id===tab);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#020f2e 0%,#041a4a 30%,#062060 55%,#0a2d7a 100%)", fontFamily:"'DM Sans',sans-serif", color:"#fff", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:4px}
        body{background:#020f2e} input::placeholder{color:rgba(255,255,255,0.3)} input:focus{outline:none} select:focus{outline:none}
        select option{background:#0a1f6b;color:#fff}
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ width:sideOpen?220:60, flexShrink:0, background:"rgba(4,20,70,0.75)", borderRight:"1px solid rgba(80,150,255,0.12)", backdropFilter:"blur(20px)", display:"flex", flexDirection:"column", transition:"width 0.25s", overflow:"hidden", zIndex:10 }}>
        <div style={{ padding:"20px 14px 16px", borderBottom:"1px solid rgba(80,150,255,0.1)", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24, flexShrink:0 }}>🌍</span>
          {sideOpen&&<div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, background:"linear-gradient(90deg,#fff,#60b4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", whiteSpace:"nowrap" }}>X WORLD</div>}
          <button onClick={()=>setSideOpen(o=>!o)} style={{ marginLeft:"auto", background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:24, height:24, borderRadius:6, cursor:"pointer", fontSize:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>{sideOpen?"←":"→"}</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 6px" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 8px", borderRadius:11, border:"none", cursor:"pointer", marginBottom:2, transition:"all 0.15s", background:tab===t.id?"linear-gradient(135deg,rgba(29,78,216,0.5),rgba(59,130,246,0.25))":"transparent", color:tab===t.id?"#fff":"rgba(255,255,255,0.5)", borderLeft:tab===t.id?"3px solid #3b82f6":"3px solid transparent", position:"relative" }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{t.icon}</span>
              {sideOpen&&<span style={{ fontSize:12, fontWeight:tab===t.id?600:400, whiteSpace:"nowrap" }}>{t.label}</span>}
              {t.id==="orders"&&orders.length>0&&<span style={{ position:"absolute", top:6, right:sideOpen?8:4, width:16, height:16, borderRadius:"50%", background:"#3b82f6", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{orders.length}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding:"8px 6px", borderTop:"1px solid rgba(80,150,255,0.1)" }}>
          {user?(
            <button onClick={()=>setShowProfile(true)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px", borderRadius:11, border:"none", cursor:"pointer", background:"rgba(59,130,246,0.12)" }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{user.avatar}</div>
              {sideOpen&&<div style={{ textAlign:"left" }}><div style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{user.firstName}</div><div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>Mon compte</div></div>}
            </button>
          ):(
            <button onClick={()=>setShowAuth(true)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px", borderRadius:11, border:"1px solid rgba(80,150,255,0.2)", cursor:"pointer", background:"rgba(10,50,180,0.2)" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>👤</span>
              {sideOpen&&<span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>Se connecter</span>}
            </button>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(80,150,255,0.1)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(4,15,50,0.4)", backdropFilter:"blur(10px)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>{cur?.icon}</span>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:"#fff" }}>{cur?.label}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>X WORLD HUB · {REGIONS.find(r=>r.id===region)?.label}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {orders.length>0&&<button onClick={()=>setTab("orders")} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:99, background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.3)", cursor:"pointer", color:"#93c5fd", fontSize:12, fontWeight:600 }}>📦 {orders.length} résa</button>}
            <div title="Commande vocale disponible" style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:99, background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", fontSize:11, color:"#a5b4fc", fontWeight:600 }}>🎤 Siri</div>
            {user?(
              <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:99, padding:"5px 12px 5px 5px", cursor:"pointer" }} onClick={()=>setShowProfile(true)}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{user.avatar}</div>
                <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{user.firstName}</span>
              </div>
            ):(
              <button onClick={()=>setShowAuth(true)} style={{ ...C.btnP, padding:"8px 16px", fontSize:12 }}>Se connecter</button>
            )}
          </div>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:22 }}>{renderTab()}</div>
      </div>

      {booking && <BookingModal item={booking.item} type={booking.type} onClose={()=>setBooking(null)} onConfirm={handleConfirm}/>}
      {showAuth    && <AuthModal    onClose={()=>setShowAuth(false)}    onLogin={login}/>}
      {showProfile && user && <ProfilePanel user={user} onClose={()=>setShowProfile(false)} onLogout={logout}/>}

      {/* 🎙️ Siri Voice Command */}
      <SiriButton setTab={setTab} setRegion={setRegion}/>
    </div>
  );
}
