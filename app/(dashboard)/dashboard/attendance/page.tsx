"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/attendance").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Attendance</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>attendance_date</th><th>client.full_name</th><th>status</th><th>remarks</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.attendance_date ?? row.attendance_date ?? '')}</td><td>{String(row.client.full_name ?? row.full_name ?? '')}</td><td>{String(row.status ?? row.status ?? '')}</td><td>{String(row.remarks ?? row.remarks ?? '')}</td></tr>)}</tbody></table></div></section></>
}
