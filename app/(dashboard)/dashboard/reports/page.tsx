"use client";
import {useState} from "react";
export default function Reports(){
 const [type,setType]=useState("payments"); const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 async function generate(){
   setError(""); const r=await fetch(`/api/admin/${type}`); const x=await r.json(); if(x.data)setRows(x.data); else setError(x.error||"Failed");
 }
 return <><div className="page-head"><div><h1>Reports</h1><p className="muted">Generate operational views from centralized Supabase data.</p></div></div>
 <section className="panel"><div className="actions"><select value={type} onChange={e=>setType(e.target.value)}><option value="enrollments">Enrollment Summary</option><option value="billing">Billing</option><option value="payments">Payments</option><option value="attendance">Attendance</option><option value="schedules">Instructor Assignments / Schedules</option><option value="bookings">Studio Bookings</option><option value="instruments">Instrument Usage</option></select><button className="btn" onClick={generate}>Generate</button></div></section>
 {error&&<div className="error">{error}</div>}<section className="panel"><p className="muted">Showing {rows.length} records. Use the module pages for detailed filters and updates.</p><pre style={{whiteSpace:"pre-wrap",fontSize:12}}>{JSON.stringify(rows,null,2)}</pre></section></>
}
