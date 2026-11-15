import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
async function api(path, options = {}) {
  const token = localStorage.getItem("placementToken");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function Login({ onLogin }) {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [error,setError] = useState("");
  async function submit(e) { e.preventDefault(); setError(""); try { const data = await api("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})}); onLogin(data); } catch(err) { setError(err.message); } }
  return <section className="panel narrow"><h2>Administrator login</h2><form onSubmit={submit} className="stack"><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button>Login</button></form><p className="error">{error}</p><p className="muted">New administrator? <Link to="/register">Create an account</Link></p></section>;
}
function Register({ onLogin }) {
  const [form,setForm] = useState({name:"",email:"",password:""}); const [error,setError] = useState("");
  function change(e) { setForm({...form,[e.target.name]:e.target.value}); }
  async function submit(e) { e.preventDefault(); setError(""); try { const data=await api("/api/auth/register",{method:"POST",body:JSON.stringify(form)}); onLogin(data); } catch(err) { setError(err.message); } }
  return <section className="panel narrow"><h2>Create administrator account</h2><form onSubmit={submit} className="stack"><input name="name" placeholder="Full name" value={form.name} onChange={change} required/><input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required/><input name="password" type="password" minLength="8" placeholder="Password (8+ characters)" value={form.password} onChange={change} required/><button>Register</button></form><p className="error">{error}</p></section>;
}
function Dashboard({ user, onLogout }) {
  const [records,setRecords] = useState([]); const [error,setError] = useState(""); const [form,setForm] = useState({studentName:"",email:"",company:"",position:"",cgpa:""});
  const [query,setQuery] = useState(""); const [sort,setSort] = useState("newest");
  const load = useCallback(async()=>{ try { const result=await api("/api/applications"); setRecords(result.data); setError(""); } catch(err) { setError(err.message); } },[]);
  useEffect(()=>{load();},[load]);
  function change(e){setForm({...form,[e.target.name]:e.target.value});}
  async function add(e){e.preventDefault();try{await api("/api/applications",{method:"POST",body:JSON.stringify({...form,cgpa:Number(form.cgpa)})});setForm({studentName:"",email:"",company:"",position:"",cgpa:""});await load();}catch(err){setError(err.message);}}
  async function update(id,status){try{await api(`/api/applications/${id}`,{method:"PUT",body:JSON.stringify({status})});await load();}catch(err){setError(err.message);}}
  async function remove(id){if(!window.confirm("Delete this application?"))return;try{await api(`/api/applications/${id}`,{method:"DELETE"});await load();}catch(err){setError(err.message);}}
  const visible=records.filter(r=>`${r.studentName} ${r.company} ${r.email}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="name"?a.studentName.localeCompare(b.studentName):new Date(b.createdAt)-new Date(a.createdAt));
  const statuses=["Applied","Shortlisted","Interview Scheduled","Selected","Rejected"];
  return <><header className="welcome"><div><p className="eyebrow">PLACEMENT CELL / ADMIN PORTAL</p><h1>Good day, {user?.name || "Administrator"}</h1><p>Track student applications and recruitment progress.</p></div><button className="secondary" onClick={onLogout}>Logout</button></header>
    <section className="stats"><article><span>Total applications</span><strong>{records.length}</strong></article><article><span>Selected</span><strong>{records.filter(r=>r.status==="Selected").length}</strong></article><article><span>In progress</span><strong>{records.filter(r=>!["Selected","Rejected"].includes(r.status)).length}</strong></article></section>
    <section className="panel"><h2>New placement application</h2><form onSubmit={add} className="entry-grid"><input name="studentName" placeholder="Student name" value={form.studentName} onChange={change} required minLength="2"/><input name="email" type="email" placeholder="Student email" value={form.email} onChange={change} required/><input name="company" placeholder="Company" value={form.company} onChange={change} required/><input name="position" placeholder="Position" value={form.position} onChange={change} required/><input name="cgpa" type="number" min="0" max="10" step="0.01" placeholder="CGPA (0–10)" value={form.cgpa} onChange={change} required/><button>Add application</button></form></section>
    <section className="panel"><div className="list-head"><div><h2>Applications</h2><p className="muted">{records.length} records stored in MongoDB</p></div><div className="filters"><input placeholder="Search student/company" value={query} onChange={e=>setQuery(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="name">Student name</option></select></div></div>
    {error&&<p className="error" role="alert">{error}</p>}
    {visible.length===0?<p className="muted">No matching applications found.</p>:<div className="table-wrap"><table><thead><tr><th>Student</th><th>Company / Role</th><th>CGPA</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td><strong>{r.studentName}</strong><small>{r.email}</small></td><td>{r.company}<small>{r.position}</small></td><td>{Number(r.cgpa).toFixed(2)}</td><td><select value={r.status} onChange={e=>update(r.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td><button className="danger" onClick={()=>remove(r.id)}>Delete</button></td></tr>)}</tbody></table></div>}</section>
  </>;
}
export default function App(){
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("placementUser")||"null");}catch{return null;}});
  function login(data){localStorage.setItem("placementToken",data.token);localStorage.setItem("placementUser",JSON.stringify(data.user));setUser(data.user);}
  function logout(){localStorage.removeItem("placementToken");localStorage.removeItem("placementUser");setUser(null);}
  return <main className="container"><nav><Link className="brand" to="/">PlaceTrack<span>.</span></Link><span className="nav-note">STUDENT PLACEMENT MANAGEMENT</span></nav>
    <Routes><Route path="/" element={user?<Dashboard user={user} onLogout={logout}/>:<Login onLogin={login}/>}/><Route path="/register" element={<Register onLogin={login}/>}/><Route path="*" element={<section className="panel"><h2>Page not found</h2><Link to="/">Go to dashboard</Link></section>}/></Routes>
    <footer>Placement Management System · Full Stack Development Practical · CO6</footer></main>;
}
