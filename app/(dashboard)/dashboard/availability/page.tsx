"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/availability").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Instructor Availability</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>instructor.full_name</th><th>day_of_week</th><th>start_time</th><th>end_time</th><th>status</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.instructor.full_name ?? row.full_name ?? '')}</td><td>{String(row.day_of_week ?? row.day_of_week ?? '')}</td><td>{String(row.start_time ?? row.start_time ?? '')}</td><td>{String(row.end_time ?? row.end_time ?? '')}</td><td>{String(row.status ?? row.status ?? '')}</td></tr>)}</tbody></table></div></section></>
}
