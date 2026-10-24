import React, { useEffect, useState } from 'react';
import {
  Activity, ShieldCheck, ScanSearch, Building2, CalendarDays, ClipboardList,
  CloudSun, BookOpen, LayoutDashboard, Menu, HardHat, ArrowUpRight, CheckCircle2,
  AlertTriangle, LoaderCircle, Upload, Send, RefreshCw
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const modules = [
  { id:'overview', label:'Overview', icon:LayoutDashboard },
  { id:'safety', label:'Safety monitoring', icon:ShieldCheck },
  { id:'cracks', label:'Crack analysis', icon:ScanSearch },
  { id:'valuation', label:'Property valuation', icon:Building2 },
  { id:'planning', label:'Project planning', icon:CalendarDays },
  { id:'daily', label:'Daily site assistant', icon:ClipboardList },
  { id:'weather', label:'Weather advisory', icon:CloudSun },
  { id:'knowledge', label:'Knowledge assistant', icon:BookOpen },
];

async function request(path, options={}) {
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

function Result({ data, error }) {
  if (error) return <div className="notice error"><AlertTriangle size={18}/><span>{error}</span></div>;
  if (!data) return null;
  return <div className="result"><div className="result-head"><CheckCircle2 size={18}/><b>Analysis result</b><span className="pill">JSON response</span></div><pre>{JSON.stringify(data, null, 2)}</pre></div>;
}

function Field({label, children, hint}) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Safety({setData,setError,setBusy,busy}) {
  const [form,setForm] = useState({site_notes:'',workers_present:true,helmets_confirmed:false,high_visibility_vests_confirmed:false,fall_protection_needed:false,fall_protection_confirmed:false,housekeeping_ok:false});
  const change = (k,v) => setForm(p=>({...p,[k]:v}));
  async function submit(e){e.preventDefault();setBusy(true);setError('');setData(null);try{setData(await request('/api/safety/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="form-grid">
    <p className="wide muted">Complete this checklist based on a real inspection. This demo does not visually verify PPE.</p>
    {[['helmets_confirmed','Helmet use confirmed'],['high_visibility_vests_confirmed','High-visibility vests confirmed'],['fall_protection_needed','Fall protection required'],['fall_protection_confirmed','Fall protection confirmed'],['housekeeping_ok','Walkways and housekeeping checked']].map(([k,l])=><label className="check" key={k}><input type="checkbox" checked={form[k]} onChange={e=>change(k,e.target.checked)}/><span>{l}</span></label>)}
    <Field label="Site notes"><textarea value={form.site_notes} onChange={e=>change('site_notes',e.target.value)} placeholder="e.g. scaffolding inspection pending..." rows="3"/></Field>
    <div className="wide"><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<ShieldCheck size={17}/>} Review checklist</button></div>
  </form>
}

function Crack({setData,setError,setBusy,busy}) {
  const [file,setFile] = useState(null);
  async function submit(e){e.preventDefault();if(!file){setError('Choose a JPG, PNG, or WEBP image first.');return}setBusy(true);setError('');setData(null);try{const fd=new FormData();fd.append('file',file);setData(await request('/api/cracks/analyze',{method:'POST',body:fd}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="stack">
    <div className="upload"><Upload size={28}/><b>Upload a construction image</b><span>JPG, PNG or WEBP · max 8 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>{file && <small>Selected: {file.name}</small>}</div>
    <div className="notice"><AlertTriangle size={18}/><span>This starter validates the upload but does not run a trained crack-detection model. Results are explicitly marked as demo output.</span></div>
    <button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<ScanSearch size={17}/>} Review image</button>
  </form>
}

function Valuation({setData,setError,setBusy,busy}) {
  const [form,setForm] = useState({area_sqft:1200,property_age_years:5,location_category:'standard',rate_per_sqft:4500});
  const change=(k,v)=>setForm(p=>({...p,[k]:v}));
  async function submit(e){e.preventDefault();setBusy(true);setError('');setData(null);try{setData(await request('/api/valuation/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,area_sqft:Number(form.area_sqft),property_age_years:Number(form.property_age_years),rate_per_sqft:Number(form.rate_per_sqft)})}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="form-grid">
    <Field label="Built-up area (sq ft)"><input type="number" min="1" value={form.area_sqft} onChange={e=>change('area_sqft',e.target.value)} required/></Field>
    <Field label="Property age (years)"><input type="number" min="0" value={form.property_age_years} onChange={e=>change('property_age_years',e.target.value)} required/></Field>
    <Field label="Location category"><select value={form.location_category} onChange={e=>change('location_category',e.target.value)}><option value="prime">Prime</option><option value="standard">Standard</option><option value="developing">Developing</option></select></Field>
    <Field label="Illustrative rate (₹ / sq ft)"><input type="number" min="1" value={form.rate_per_sqft} onChange={e=>change('rate_per_sqft',e.target.value)} required/></Field>
    <div className="wide"><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Building2 size={17}/>} Estimate value</button></div>
  </form>
}

function Planning({setData,setError,setBusy,busy}) {
  const [form,setForm]=useState({project_type:'Residential building',duration_days:120,budget_inr:5000000,project_notes:''});
  const change=(k,v)=>setForm(p=>({...p,[k]:v}));
  async function submit(e){e.preventDefault();setBusy(true);setError('');setData(null);try{setData(await request('/api/planning/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,duration_days:Number(form.duration_days),budget_inr:Number(form.budget_inr)})}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="form-grid">
    <Field label="Project type"><input value={form.project_type} onChange={e=>change('project_type',e.target.value)} required/></Field>
    <Field label="Duration (days)"><input type="number" min="1" value={form.duration_days} onChange={e=>change('duration_days',e.target.value)} required/></Field>
    <Field label="Budget (₹)"><input type="number" min="1" value={form.budget_inr} onChange={e=>change('budget_inr',e.target.value)} required/></Field>
    <Field label="Project notes"><textarea value={form.project_notes} onChange={e=>change('project_notes',e.target.value)} rows="3" placeholder="Site conditions, milestones, constraints..."/></Field>
    <div className="wide"><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<CalendarDays size={17}/>} Generate plan</button></div>
  </form>
}

function Daily({setData,setError,setBusy,busy}) {
  const [progress,setProgress]=useState('Foundation excavation completed for the planned section.');
  const [blockers,setBlockers]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');setData(null);try{setData(await request('/api/site/daily-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({progress_notes:progress,blockers})}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="stack"><Field label="Today's progress"><textarea rows="4" value={progress} onChange={e=>setProgress(e.target.value)} required/></Field><Field label="Blockers / issues"><textarea rows="3" value={blockers} onChange={e=>setBlockers(e.target.value)} placeholder="Any material delay, equipment issue, or safety concern?"/></Field><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Send size={17}/>} Create daily summary</button></form>
}

function Weather({setData,setError,setBusy,busy}) {
  const [condition,setCondition]=useState('rain');
  const [work,setWork]=useState('Outdoor concrete work');
  async function submit(e){e.preventDefault();setBusy(true);setError('');setData(null);try{setData(await request('/api/weather/advice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({condition,planned_work:work})}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="stack"><Field label="Weather condition"><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="clear">Clear</option><option value="hot">Hot</option><option value="extreme_heat">Extreme heat</option><option value="rain">Rain</option><option value="thunderstorm">Thunderstorm</option><option value="strong_wind">Strong wind</option></select></Field><Field label="Planned work"><input value={work} onChange={e=>setWork(e.target.value)} required/></Field><div className="notice"><CloudSun size={18}/><span>Uses conditions you enter; live weather data is not connected.</span></div><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<CloudSun size={17}/>} Get advisory</button></form>
}

function Knowledge({setData,setError,setBusy,busy}) {
  const [question,setQuestion]=useState('What should be checked before starting work at height?');
  async function submit(e){e.preventDefault();setBusy(true);setError('');setData(null);try{setData(await request('/api/knowledge/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})}));}catch(x){setError(x.message)}finally{setBusy(false)}}
  return <form onSubmit={submit} className="stack"><Field label="Ask a construction question"><textarea rows="4" value={question} onChange={e=>setQuestion(e.target.value)} required/></Field><div className="quick-questions">{['Crack in a wall','Concrete curing','PPE and site safety'].map(q=><button type="button" className="chip" key={q} onClick={()=>setQuestion(q)}>{q}</button>)}</div><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Send size={17}/>} Ask assistant</button></form>
}

const content = {
 safety:{title:'Safety monitoring',subtitle:'Review a site checklist and surface items needing verification.',icon:ShieldCheck,component:Safety},
 cracks:{title:'Crack analysis',subtitle:'Upload an image for a safe, clearly labelled preliminary demo review.',icon:ScanSearch,component:Crack},
 valuation:{title:'Property valuation',subtitle:'Calculate an illustrative estimate from area, age, and a chosen rate.',icon:Building2,component:Valuation},
 planning:{title:'Project planning',subtitle:'Create a simple milestone sequence from project inputs.',icon:CalendarDays,component:Planning},
 daily:{title:'Daily site assistant',subtitle:'Turn daily progress notes into next steps and escalations.',icon:ClipboardList,component:Daily},
 weather:{title:'Weather-aware advisory',subtitle:'Review work-planning precautions for an entered condition.',icon:CloudSun,component:Weather},
 knowledge:{title:'Construction knowledge assistant',subtitle:'Get demo answers and checklists for common construction topics.',icon:BookOpen,component:Knowledge},
};

export default function App() {
  const [active,setActive]=useState('overview');
  const [mobileNav,setMobileNav]=useState(false);
  const [health,setHealth]=useState('checking');
  const [data,setData]=useState(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{request('/api/health').then(()=>setHealth('online')).catch(()=>setHealth('offline'))},[]);
  useEffect(()=>{setData(null);setError('')},[active]);
  const page=content[active];
  const PageIcon=page?.icon;
  const go=(id)=>{setActive(id);setMobileNav(false)};
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'show':''}`}>
      <div className="brand"><div className="brand-mark"><HardHat size={22}/></div><div><b>ConstructIQ</b><small>INTELLIGENCE PLATFORM</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{modules.map(({id,label,icon:Icon})=><button key={id} className={`nav-item ${active===id?'active':''}`} onClick={()=>go(id)}><Icon size={18}/><span>{label}</span>{id==='overview'&&<ArrowUpRight className="nav-arrow" size={15}/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-line"><span className={`status-dot ${health}`}></span><span>API {health==='checking'?'checking':health}</span></div><small>Local development build · v1.0</small></div>
    </aside>
    {mobileNav && <button className="scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page?.title || 'Overview'}</b></div><div className="top-right"><span className="demo-pill"><span/> DEMO MODE</span><div className="avatar">CI</div></div></header>
      {active==='overview' ? <div className="page">
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><Activity size={14}/> CONSTRUCTION INTELLIGENCE</div><h1>Make better decisions<br/><span>on every site.</span></h1><p>One workspace for construction safety, planning, property insights, and daily site intelligence.</p><button className="primary hero-btn" onClick={()=>go('safety')}>Start site review <ArrowUpRight size={17}/></button></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="building-shape"><div className="building-roof"></div><div className="building-floor"></div><div className="building-floor"></div><div className="building-floor"></div><div className="building-base"></div></div><div className="float-card float-top"><ShieldCheck size={17}/><span>Safety review</span><b>Ready</b></div><div className="float-card float-bottom"><Activity size={17}/><span>Site intelligence</span><b>Active</b></div></div></section>
        <div className="section-heading"><div><h2>Workspace modules</h2><p>Choose a tool to get started</p></div><span className="module-count">07 MODULES</span></div>
        <div className="module-grid">{modules.filter(m=>m.id!=='overview').map(({id,label,icon:Icon},i)=><button className="module-card" key={id} onClick={()=>go(id)}><div className={`module-icon tone-${i}`}><Icon size={21}/></div><div className="module-card-title">{label}<ArrowUpRight size={15}/></div><p>{({
          safety:'Review PPE and site checklist items.',
          cracks:'Submit an image for preliminary review.',
          valuation:'Estimate a property value from inputs.',
          planning:'Draft project milestones and deliverables.',
          daily:'Summarize progress and blockers.',
          weather:'Check precautions for site conditions.',
          knowledge:'Ask a construction knowledge question.'
        })[id]}</p><span className="card-link">Open module <span>→</span></span></button>)}</div>
        <div className="bottom-note"><div className="note-icon"><AlertTriangle size={19}/></div><div><b>Decision-support notice</b><p>This project currently runs in demo mode. AI-like outputs are illustrative and are not a substitute for a qualified engineer, current regulations, verified market data, or official weather information.</p></div></div>
      </div> : <div className="page">
        <div className="page-title-row"><div className="page-icon"><PageIcon size={23}/></div><div><div className="eyebrow">WORKSPACE MODULE</div><h1>{page.title}</h1><p>{page.subtitle}</p></div></div>
        <div className="work-layout"><section className="panel"><div className="panel-head"><div><h2>Inputs</h2><p>Enter the details below</p></div><span className="step-tag">STEP 01</span></div><page.component setData={setData} setError={setError} setBusy={setBusy} busy={busy}/></section><section className="panel output-panel"><div className="panel-head"><div><h2>Output</h2><p>Structured API response</p></div><span className="step-tag">STEP 02</span></div>{!data&&!error&&!busy&&<div className="empty"><div className="empty-icon"><Activity size={23}/></div><b>Results will appear here</b><p>Complete the form and run the analysis to see the response.</p></div>}{busy&&<div className="empty"><LoaderCircle className="spin" size={26}/><p>Processing request…</p></div>}<Result data={data} error={error}/></section></div>
        <div className="bottom-note"><div className="note-icon"><AlertTriangle size={19}/></div><div><b>Demo-mode limitation</b><p>Responses use deterministic rules and sample assumptions, not a connected multimodal LLM. Verify important decisions with qualified professionals.</p></div></div>
      </div>}
    </main>
  </div>
}
