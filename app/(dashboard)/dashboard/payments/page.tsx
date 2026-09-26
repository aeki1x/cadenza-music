"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/payments").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Payments</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>client.full_name</th><th>amount</th><th>method</th><th>service_type</th><th>paid_at</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.client.full_name ?? row.full_name ?? '')}</td><td>{String(row.amount ?? row.amount ?? '')}</td><td>{String(row.method ?? row.method ?? '')}</td><td>{String(row.service_type ?? row.service_type ?? '')}</td><td>{String(row.paid_at ?? row.paid_at ?? '')}</td></tr>)}</tbody></table></div></section></>
}
