"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/enrollments").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Enrollments</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>client.full_name</th><th>package.name</th><th>instrument_category</th><th>status</th><th>completed_sessions</th><th>remaining_sessions</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.client.full_name ?? row.full_name ?? '')}</td><td>{String(row.package.name ?? row.name ?? '')}</td><td>{String(row.instrument_category ?? row.instrument_category ?? '')}</td><td>{String(row.status ?? row.status ?? '')}</td><td>{String(row.completed_sessions ?? row.completed_sessions ?? '')}</td><td>{String(row.remaining_sessions ?? row.remaining_sessions ?? '')}</td></tr>)}</tbody></table></div></section></>
}
