"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/notifications").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Notifications</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>user_id</th><th>title</th><th>message</th><th>type</th><th>read_at</th><th>created_at</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.user_id ?? row.user_id ?? '')}</td><td>{String(row.title ?? row.title ?? '')}</td><td>{String(row.message ?? row.message ?? '')}</td><td>{String(row.type ?? row.type ?? '')}</td><td>{String(row.read_at ?? row.read_at ?? '')}</td><td>{String(row.created_at ?? row.created_at ?? '')}</td></tr>)}</tbody></table></div></section></>
}
