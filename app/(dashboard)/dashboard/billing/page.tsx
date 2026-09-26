"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/billing").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Billing</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>client.full_name</th><th>service_type</th><th>description</th><th>amount_due</th><th>amount_paid</th><th>status</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.client.full_name ?? row.full_name ?? '')}</td><td>{String(row.service_type ?? row.service_type ?? '')}</td><td>{String(row.description ?? row.description ?? '')}</td><td>{String(row.amount_due ?? row.amount_due ?? '')}</td><td>{String(row.amount_paid ?? row.amount_paid ?? '')}</td><td>{String(row.status ?? row.status ?? '')}</td></tr>)}</tbody></table></div></section></>
}
