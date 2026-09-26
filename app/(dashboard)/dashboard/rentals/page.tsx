"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/rentals").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Instrument Rentals</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>instrument.name</th><th>client.full_name</th><th>start_at</th><th>return_at</th><th>total_amount</th><th>status</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.instrument.name ?? row.name ?? '')}</td><td>{String(row.client.full_name ?? row.full_name ?? '')}</td><td>{String(row.start_at ?? row.start_at ?? '')}</td><td>{String(row.return_at ?? row.return_at ?? '')}</td><td>{String(row.total_amount ?? row.total_amount ?? '')}</td><td>{String(row.status ?? row.status ?? '')}</td></tr>)}</tbody></table></div></section></>
}
