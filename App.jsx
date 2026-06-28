import { useState } from "react";

const TABS = [
  { id:"dashboard", icon:"🌍", label:"Accueil" },
  { id:"vols",      icon:"✈️", label:"Vols" },
  { id:"hotels",    icon:"🏨", label:"Hôtels" },
  { id:"transport", icon:"🚖", label:"Transport" },
  { id:"meteo",     icon:"⛅", label:"Météo" },
  { id:"maps",      icon:"🗺️", label:"Navigation" },
  { id:"finance",   icon:"💳", label:"Finance" },
  { id:"amazon",    icon:"🛒", label:"Amazon" },
  { id:"messages",  icon:"💬", label:"Messages" },
  { id:"ia",        icon:"🤖", label:"Assistant IA" },
  { id:"todo",      icon:"✅", label:"To-Do" },
];

const REGIONS = [
  { id:"monde",     label:"🌍 Monde" },
  { id:"suisse",    label:"🇨🇭 Suisse" },
  { id:"europe",    label:"🇪🇺 Europe" },
  { id:"russie",    label:"🇷🇺 Russie" },
  { id:"usa",       label:"🇺🇸 USA" },
  { id:"inde",      label:"🇮🇳 Inde" },
  { id:"asie",      label:"🌏 Asie" },
  { id:"chine",     label:"🇨🇳 Chine" },
  { id:"amsud",     label:"🌎 Am. Sud" },
  { id:"australie", label:"🇦🇺 Australie" },
];

const s = {
  app:   { minHeight:"100vh", background:"linear-gradient(160deg,#020f2e,#041a4a,#062060)", fontFamily:"'DM Sans',sans-serif", color:"#fff", display:"flex" },
  side:  { width:200, flexShrink:0, background:"rgba(4,12,50,0.9)", borderRight:"1px solid rgba(80,150,255,0.12)", display:"flex", flexDirection:"column" },
  main:  { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  top:   { padding:"14px 22px", borderBottom:"1px solid rgba(80,150,255,0.1)", background:"rgba(4,15,50,0.5)", display:"flex", justifyContent:"space-between", alignItems:"center" },
  card:  { background:"rgba(10,50,160,0.22)", border:"1px solid rgba(80,150,255,0.18)", borderRadius:16, padding:20 },
};

function useAI() {
  const call = async (prompt, system = "Tu es un assistant de voyage expert. Réponds en français avec des emojis.") => {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const d = await r.json();
      return d.content?.[0]?.text || "Réponse non disponible.";
    } catch {
      return "Mode demo — Configurez votre clé Anthropic pour activer l'IA.";
    }
  };
  return { call };
}

function Card({ children, style }) {
  return <div style={{ ...s.card, ...style }}>{children}</div>;
}

function Btn({ children, onClick, color = "#1d4ed8", style }) {
  return (
    <button onClick={onClick} style={{ background:`linear-gradient(135deg,${color},${color}cc)`, color:"#fff", border:"none", borderRadius:10, padding:"10px 18px", fontFamily:"sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", ...style }}>
      {children}
    </button>
  );
}

function Input({ placeholder, value, onChange, onKeyDown, type = "text", style }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}
      style={{ background:"rgba(10,40,120,0.4)", border:"1px solid rgba(80,150,255,0.25)", borderRadius:10, padding:"10px 13px", color:"#fff", fontFamily:"sans-serif", fontSize:13, outline:"none", width:"100%", ...style }} />
  );
}

// DASHBOARD
function Dashboard({ setTab, region, setRegion }) {
  const services = [
    { tab:"vols",      icon:"✈️", label:"Vols",       color:"#0ea5e9" },
    { tab:"hotels",    icon:"🏨", label:"Hôtels",     color:"#22c55e" },
    { tab:"transport", icon:"🚖", label:"Transport",  color:"#f97316" },
    { tab:"finance",   icon:"💳", label:"Finance",    color:"#8b5cf6" },
    { tab:"amazon",    icon:"🛒", label:"Amazon",     color:"#ff9900" },
    { tab:"messages",  icon:"💬", label:"Messages",   color:"#07c160" },
    { tab:"ia",        icon:"🤖", label:"IA Claude",  color:"#ec4899" },
    { tab:"meteo",     icon:"⛅", label:"Météo",      color:"#06b6d4" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card style={{ background:"linear-gradient(135deg,rgba(29,78,216,0.4),rgba(59,130,246,0.15))", border:"1px solid rgba(80,150,255,0.3)", textAlign:"center", padding:32 }}>
        <div style={{ fontSize:52, marginBottom:10 }}>🌍</div>
        <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:28, background:"linear-gradient(90deg,#fff,#60b4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:8 }}>X WORLD HUB</div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:14, marginBottom:20 }}>La super app de voyage mondiale — Un seul compte pour tout</div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={() => setTab("ia")}>🤖 Assistant IA</Btn>
          <Btn onClick={() => setTab("vols")} color="#0ea5e9">✈️ Réserver un vol</Btn>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>Ma Région</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => setRegion(r.id)}
              style={{ padding:"5px 12px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:region===r.id?"rgba(255,255,255,0.92)":"rgba(10,50,180,0.25)", color:region===r.id?"#020f2e":"rgba(255,255,255,0.65)" }}>
              {r.label}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
        {services.map(sv => (
          <button key={sv.tab} onClick={() => setTab(sv.tab)}
            style={{ background:`${sv.color}22`, border:`1px solid ${sv.color}44`, borderRadius:16, padding:"18px 10px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <span style={{ fontSize:28 }}>{sv.icon}</span>
            <span style={{ fontWeight:700, fontSize:12, color:"#fff" }}>{sv.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[["22+","Services"],["9","Régions"],["20","Langues"],["1","Compte"]].map(([n,l]) => (
          <Card key={l} style={{ textAlign:"center", padding:16 }}>
            <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:26, color:"#60b4ff" }}>{n}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:3 }}>{l}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// VOLS
function Vols() {
  const { call } = useAI();
  const [from, setFrom] = useState("Paris CDG");
  const [to, setTo] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!to) return;
    setLoading(true); setResult("");
    const r = await call(`Recherche de vols de ${from} vers ${to}. Donne 3 options réalistes avec compagnie, durée, prix en EUR.`);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>✈️ Recherche de Vols</div>
      <Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8 }}>
          <div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>DÉPART</div>
            <Input placeholder="Paris CDG" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>DESTINATION</div>
            <Input placeholder="Tokyo, New York..." value={to} onChange={e => setTo(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <Btn onClick={search}>🔍 Chercher</Btn>
          </div>
        </div>
      </Card>
      {loading && <Card style={{ textAlign:"center", padding:28 }}><div style={{ fontSize:28 }}>✈️</div><div style={{ color:"rgba(255,255,255,0.5)", marginTop:8 }}>Recherche en cours...</div></Card>}
      {result && <Card><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></Card>}
    </div>
  );
}

// HOTELS
function Hotels() {
  const { call } = useAI();
  const [dest, setDest] = useState("");
  const [budget, setBudget] = useState("moyen");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!dest) return;
    setLoading(true); setResult("");
    const r = await call(`Recommande 4 hôtels ${budget} à ${dest}. Pour chacun: nom, quartier, prix/nuit en EUR, note /10, points forts.`);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>🏨 Recherche d'Hôtels</div>
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <Input placeholder="Ville ou destination..." value={dest} onChange={e => setDest(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
          <Btn onClick={search}>🔍 Chercher</Btn>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["économique","moyen","luxe","ultra-luxe"].map(b => (
            <button key={b} onClick={() => setBudget(b)}
              style={{ padding:"5px 12px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:budget===b?"rgba(255,255,255,0.92)":"rgba(10,50,180,0.25)", color:budget===b?"#020f2e":"rgba(255,255,255,0.65)" }}>
              {b}
            </button>
          ))}
        </div>
      </Card>
      {loading && <Card style={{ textAlign:"center", padding:28 }}><div style={{ fontSize:28 }}>🏨</div><div style={{ color:"rgba(255,255,255,0.5)", marginTop:8 }}>Recherche hôtels...</div></Card>}
      {result && <Card><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></Card>}
    </div>
  );
}

// TRANSPORT
function Transport({ region }) {
  const { call } = useAI();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const vtcs = [
    { name:"Uber Europe",  icon:"🚖", regions:["europe","suisse"] },
    { name:"Uber USA",     icon:"🚕", regions:["usa"] },
    { name:"Yandex Go",    icon:"🟡", regions:["russie"] },
    { name:"Grab",         icon:"🏍️", regions:["asie"] },
    { name:"DiDi",         icon:"🚙", regions:["chine"] },
    { name:"InDriver",     icon:"🌎", regions:["amsud"] },
    { name:"Uber Inde",    icon:"🛺", regions:["inde"] },
    { name:"Uber AU 🦘",   icon:"🦘", regions:["australie"] },
  ];

  const available = vtcs.filter(v => v.regions.includes(region) || region === "monde");

  const search = async () => {
    if (!from || !to) return;
    setLoading(true); setResult("");
    const r = await call(`Transport de "${from}" à "${to}" dans la région ${region}. Donne options VTC, taxi, transports en commun avec prix et durée.`);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>🚖 Transport & VTC</div>
      <Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8 }}>
          <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>DÉPART</div><Input placeholder="Adresse départ" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>ARRIVÉE</div><Input placeholder="Destination" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div style={{ display:"flex", alignItems:"flex-end" }}><Btn onClick={search}>🗺️ Trajet</Btn></div>
        </div>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
        {available.map(v => (
          <Card key={v.name} style={{ display:"flex", alignItems:"center", gap:10, padding:14 }}>
            <span style={{ fontSize:22 }}>{v.icon}</span>
            <span style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{v.name}</span>
          </Card>
        ))}
      </div>
      {loading && <Card style={{ textAlign:"center", padding:24 }}><div style={{ color:"rgba(255,255,255,0.5)" }}>🚖 Calcul trajet...</div></Card>}
      {result && <Card><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></Card>}
    </div>
  );
}

// METEO
function Meteo() {
  const { call } = useAI();
  const [city, setCity] = useState("Paris");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (c) => {
    const target = c || city;
    setLoading(true); setResult("");
    const r = await call(`Météo et prévisions pour ${target} en ce moment. Température, conditions, conseils vestimentaires, meilleure période pour visiter.`);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>⛅ Météo Mondiale</div>
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <Input placeholder="Ville..." value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
          <Btn onClick={() => search(null)}>Voir</Btn>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["Paris","Tokyo","New York","Dubaï","Sydney","Genève","Moscou","Mumbai"].map(c => (
            <button key={c} onClick={() => { setCity(c); search(c); }}
              style={{ padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, background:"rgba(10,50,180,0.3)", color:"rgba(255,255,255,0.7)" }}>
              {c}
            </button>
          ))}
        </div>
      </Card>
      {loading && <Card style={{ textAlign:"center", padding:24 }}><div style={{ color:"rgba(255,255,255,0.5)" }}>⛅ Chargement météo...</div></Card>}
      {result && <Card><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></Card>}
    </div>
  );
}

// MAPS
function Maps() {
  const { call } = useAI();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    const target = q || query;
    setLoading(true); setResult("");
    const r = await call(`Guide navigation et lieux pour "${target}". Comment y aller, horaires, conseils pratiques.`);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>🗺️ Navigation & Cartes</div>
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <Input placeholder="Rechercher un lieu..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search(null)} />
          <Btn onClick={() => search(null)} color="#22c55e">🔍</Btn>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["Restaurants","Musées","Hôtels","Aéroports","Pharmacies","Gares"].map(p => (
            <button key={p} onClick={() => { setQuery(p); search(p); }}
              style={{ padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, background:"rgba(34,197,94,0.15)", color:"rgba(255,255,255,0.7)" }}>
              {p}
            </button>
          ))}
        </div>
      </Card>
      <Card style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10 }}>
        <div style={{ fontSize:40, opacity:0.3 }}>🗺️</div>
        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>Carte interactive</div>
        <Btn onClick={() => window.open("https://maps.google.com","_blank")} color="#22c55e">Ouvrir Google Maps →</Btn>
      </Card>
      {loading && <Card style={{ textAlign:"center", padding:24 }}><div style={{ color:"rgba(255,255,255,0.5)" }}>🗺️ Recherche...</div></Card>}
      {result && <Card><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></Card>}
    </div>
  );
}

// FINANCE
function Finance() {
  const { call } = useAI();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const currencies = ["EUR","USD","CHF","GBP","JPY","CNY","INR","RUB","AUD","BRL"];

  const convert = async () => {
    setLoading(true); setResult("");
    const r = await call(`Convertis ${amount} ${from} en ${to}. Donne le taux actuel, montant converti, et conseils pour éviter les frais de change en voyage.`);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>💳 Finance & Devises</div>
      <Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr auto", gap:8, alignItems:"flex-end", marginBottom:12 }}>
          <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>MONTANT</div><Input type="number" placeholder="100" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:20, paddingBottom:2 }}>→</div>
          <div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>VERS</div>
            <select value={to} onChange={e => setTo(e.target.value)} style={{ background:"rgba(10,40,120,0.4)", border:"1px solid rgba(80,150,255,0.25)", borderRadius:10, padding:"10px 13px", color:"#fff", width:"100%", fontSize:13 }}>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Btn onClick={convert}>Convertir</Btn>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {currencies.map(c => (
            <button key={c} onClick={() => setFrom(c)}
              style={{ padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:from===c?"rgba(255,255,255,0.92)":"rgba(10,50,180,0.25)", color:from===c?"#020f2e":"rgba(255,255,255,0.65)" }}>
              {c}
            </button>
          ))}
        </div>
      </Card>
      {loading && <Card style={{ textAlign:"center", padding:24 }}><div style={{ color:"rgba(255,255,255,0.5)" }}>💳 Calcul...</div></Card>}
      {result && <Card><div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></Card>}
    </div>
  );
}

// AMAZON
function Amazon() {
  const products = [
    { icon:"🧳", name:"Valise Cabine", brand:"Samsonite", price:"CHF 89", badge:"Best Seller" },
    { icon:"🔌", name:"Adaptateur Universel", brand:"BESTEK", price:"CHF 24", badge:"Amazon Choice" },
    { icon:"🎒", name:"Sac à dos 40L", brand:"Osprey", price:"CHF 139", badge:"Top Noté" },
    { icon:"🎧", name:"Écouteurs Sony XM5", brand:"Sony", price:"CHF 289", badge:"Premium" },
    { icon:"🔋", name:"Powerbank 26800mAh", brand:"Anker", price:"CHF 59", badge:"Best Seller" },
    { icon:"📖", name:"Kindle Paperwhite", brand:"Amazon", price:"CHF 149", badge:"Top Noté" },
  ];
  const stores = [
    { flag:"🇨🇭", name:"Amazon.ch", url:"https://amazon.ch" },
    { flag:"🇫🇷", name:"Amazon.fr", url:"https://amazon.fr" },
    { flag:"🇩🇪", name:"Amazon.de", url:"https://amazon.de" },
    { flag:"🇺🇸", name:"Amazon.com", url:"https://amazon.com" },
    { flag:"🇯🇵", name:"Amazon.co.jp", url:"https://amazon.co.jp" },
    { flag:"🇦🇺", name:"Amazon.com.au", url:"https://amazon.com.au" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>🛒 Amazon Shopping</div>
      <Card>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>BOUTIQUES MONDIALES</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {stores.map(st => (
            <button key={st.name} onClick={() => window.open(st.url,"_blank")}
              style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, background:"rgba(255,153,0,0.15)", color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
              <span>{st.flag}</span><span>{st.name}</span>
            </button>
          ))}
        </div>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
        {products.map(p => (
          <Card key={p.name} style={{ textAlign:"center", padding:16 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>{p.icon}</div>
            <div style={{ fontSize:9, background:"rgba(255,153,0,0.2)", borderRadius:5, padding:"1px 7px", color:"#ff9900", fontWeight:700, marginBottom:6, display:"inline-block" }}>{p.badge}</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#fff", marginBottom:3 }}>{p.name}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>{p.brand}</div>
            <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:16, color:"#ff9900" }}>{p.price}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// MESSAGES
function Messages() {
  const [contacts] = useState([
    { id:1, name:"Sophie Martin",   avatar:"👩", last:"Prête pour Tokyo?", unread:2 },
    { id:2, name:"Marco Ferrari",   avatar:"👨", last:"Vol confirmé! ✈️",  unread:0 },
    { id:3, name:"Guide Local 🇯🇵", avatar:"🧭", last:"Bienvenue! 🌸",     unread:1 },
  ]);
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState({
    1:[{from:"them",text:"Prête pour Tokyo? 🗼"}],
    2:[{from:"them",text:"Le vol est confirmé! ✈️"}],
    3:[{from:"them",text:"Bienvenue à Tokyo! 🌸"}],
  });

  const send = () => {
    if (!input.trim() || !active) return;
    setMsgs(m => ({ ...m, [active]: [...(m[active]||[]), {from:"me", text:input.trim()}] }));
    setInput("");
  };

  return (
    <div style={{ display:"flex", gap:12, height:500 }}>
      <Card style={{ width:200, flexShrink:0, padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(80,150,255,0.1)", fontWeight:700, color:"#fff", fontSize:13 }}>💬 Messages</div>
        {contacts.map(c => (
          <div key={c.id} onClick={() => setActive(c.id)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", cursor:"pointer", background:active===c.id?"rgba(59,130,246,0.15)":"transparent", borderBottom:"1px solid rgba(80,150,255,0.07)" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(59,130,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, position:"relative" }}>
              {c.avatar}
              {c.unread > 0 && <span style={{ position:"absolute", top:-2, right:-2, width:14, height:14, borderRadius:"50%", background:"#ef4444", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{c.unread}</span>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:12, color:"#fff" }}>{c.name}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{c.last}</div>
            </div>
          </div>
        ))}
      </Card>
      <Card style={{ flex:1, padding:0, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {active ? (
          <>
            <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(80,150,255,0.1)", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:20 }}>{contacts.find(c => c.id === active)?.avatar}</span>
              <span style={{ fontWeight:700, fontSize:13, color:"#fff" }}>{contacts.find(c => c.id === active)?.name}</span>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:7 }}>
              {(msgs[active]||[]).map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"70%", background:m.from==="me"?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"rgba(10,50,180,0.3)", borderRadius:12, padding:"8px 12px", fontSize:13, color:"#fff" }}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(80,150,255,0.1)", display:"flex", gap:7 }}>
              <Input placeholder="Message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&send()} />
              <Btn onClick={send} style={{ padding:"10px 14px" }}>→</Btn>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, color:"rgba(255,255,255,0.3)" }}>
            <span style={{ fontSize:36 }}>💬</span>
            <span style={{ fontSize:13 }}>Sélectionnez une conversation</span>
          </div>
        )}
      </Card>
    </div>
  );
}

// ASSISTANT IA
function Assistant() {
  const { call } = useAI();
  const [msgs, setMsgs] = useState([
    { role:"ai", text:"Bonjour ! 🌍 Je suis votre assistant X World. Comment puis-je vous aider aujourd'hui ? Vols, hôtels, transport, météo, devises... je suis là !" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickQ = ["Planifie 7 jours à Tokyo","Budget voyage Australie","Visa pour la Russie","Top 5 restaurants Paris","Meilleure période Ibiza"];

  const send = async (q) => {
    const question = q || input.trim();
    if (!question) return;
    setMsgs(m => [...m, {role:"user", text:question}]);
    setInput("");
    setLoading(true);
    const r = await call(question, "Tu es l'assistant IA de X World, une super app de voyage mondiale. Aide avec vols, hôtels, transports, météo, devises, guides touristiques. Réponds en français avec emojis.");
    setMsgs(m => [...m, {role:"ai", text:r}]);
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:580, gap:12 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>🤖 Assistant IA X World</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {quickQ.map(q => (
          <button key={q} onClick={() => send(q)}
            style={{ padding:"5px 12px", borderRadius:99, border:"none", cursor:"pointer", fontSize:11, background:"rgba(59,130,246,0.2)", color:"rgba(255,255,255,0.7)" }}>
            {q}
          </button>
        ))}
      </div>
      <Card style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:7 }}>
            {m.role==="ai" && <span style={{ fontSize:20 }}>🤖</span>}
            <div style={{ maxWidth:"78%", background:m.role==="user"?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"rgba(10,50,180,0.3)", borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"10px 14px", fontSize:13, color:"#fff", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:20 }}>🤖</span>
            <div style={{ background:"rgba(10,50,180,0.3)", borderRadius:12, padding:"10px 14px", color:"rgba(255,255,255,0.5)", fontSize:13 }}>En train de réfléchir...</div>
          </div>
        )}
      </Card>
      <div style={{ display:"flex", gap:8 }}>
        <Input placeholder="Posez votre question voyage..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&send(null)} />
        <Btn onClick={() => send(null)}>Envoyer ✈️</Btn>
      </div>
    </div>
  );
}

// TODO
function Todo() {
  const [tasks, setTasks] = useState([
    { id:1, text:"Réserver billet avion", done:false },
    { id:2, text:"Vérifier passeport",    done:false },
    { id:3, text:"Changer devises",       done:false },
  ]);
  const [input, setInput] = useState("");

  const add = () => {
    if (!input.trim()) return;
    setTasks(t => [{ id:Date.now(), text:input.trim(), done:false }, ...t]);
    setInput("");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>✅ Ma To-Do Voyage</div>
      <Card>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>Progression : {tasks.filter(t=>t.done).length}/{tasks.length}</div>
        <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:99, marginBottom:14, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${tasks.length?tasks.filter(t=>t.done).length/tasks.length*100:0}%`, background:"linear-gradient(90deg,#1d4ed8,#22c55e)", borderRadius:99 }} />
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Input placeholder="Nouvelle tâche..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&add()} />
          <Btn onClick={add}>+ Ajouter</Btn>
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {tasks.map(t => (
          <Card key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px" }}>
            <button onClick={() => setTasks(ts => ts.map(x => x.id===t.id ? {...x,done:!x.done} : x))}
              style={{ width:24, height:24, borderRadius:7, border:`2px solid ${t.done?"#3b82f6":"rgba(80,150,255,0.4)"}`, background:t.done?"#3b82f6":"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {t.done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 7L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>}
            </button>
            <span style={{ flex:1, fontSize:13, color:t.done?"rgba(255,255,255,0.3)":"#fff", textDecoration:t.done?"line-through":"none" }}>{t.text}</span>
            <button onClick={() => setTasks(ts => ts.filter(x => x.id!==t.id))} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:18, cursor:"pointer" }}>×</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ROOT APP
export default function App() {
  const [tab,    setTab]    = useState("dashboard");
  const [region, setRegion] = useState("monde");
  const [sideOpen, setSideOpen] = useState(true);

  const renderTab = () => {
    switch(tab) {
      case "vols":      return <Vols />;
      case "hotels":    return <Hotels />;
      case "transport": return <Transport region={region} />;
      case "meteo":     return <Meteo />;
      case "maps":      return <Maps />;
      case "finance":   return <Finance />;
      case "amazon":    return <Amazon />;
      case "messages":  return <Messages />;
      case "ia":        return <Assistant />;
      case "todo":      return <Todo />;
      default:          return <Dashboard setTab={setTab} region={region} setRegion={setRegion} />;
    }
  };

  const currentTab = TABS.find(t => t.id === tab);

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); border-radius:4px; }
        body { background:#020f2e; }
        input::placeholder { color:rgba(255,255,255,0.3); }
        input:focus { outline:none; }
        select option { background:#0a1f6b; color:#fff; }
      `}</style>

      {/* Sidebar */}
      <div style={{ ...s.side, width:sideOpen?200:60, transition:"width 0.25s", overflow:"hidden" }}>
        <div style={{ padding:"18px 14px 12px", borderBottom:"1px solid rgba(80,150,255,0.1)", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:24, flexShrink:0 }}>🌍</span>
          {sideOpen && <span style={{ fontWeight:800, fontSize:15, background:"linear-gradient(90deg,#fff,#60b4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", whiteSpace:"nowrap" }}>X WORLD</span>}
          <button onClick={() => setSideOpen(o => !o)} style={{ marginLeft:"auto", background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:24, height:24, borderRadius:6, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {sideOpen ? "←" : "→"}
          </button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 6px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:2, transition:"all 0.15s", background:tab===t.id?"rgba(29,78,216,0.4)":"transparent", color:tab===t.id?"#fff":"rgba(255,255,255,0.5)", borderLeft:tab===t.id?"3px solid #3b82f6":"3px solid transparent" }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{t.icon}</span>
              {sideOpen && <span style={{ fontSize:12, fontWeight:tab===t.id?600:400, whiteSpace:"nowrap" }}>{t.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.top}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>{currentTab?.icon}</span>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:"#fff" }}>{currentTab?.label}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>X WORLD HUB · {REGIONS.find(r => r.id === region)?.label}</div>
            </div>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>v1.0 · 🇨🇭 Suisse</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:22 }}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
