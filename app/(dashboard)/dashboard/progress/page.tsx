"use client";
import {useEffect,useState} from "react";
export default function Page(){
 const [rows,setRows]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/progress").then(r=>r.json()).then(x=>x.data?setRows(x.data):setError(x.error||"Failed"))},[]);
 return <><div className="page-head"><div><h1>Lesson Progress</h1><p className="muted">Supabase-backed records.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr><th>client.full_name</th><th>instructor.full_name</th><th>skill_level</th><th>book_completion</th><th>performance_rating</th><th>created_at</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{String(row.client.full_name ?? row.full_name ?? '')}</td><td>{String(row.instructor.full_name ?? row.full_name ?? '')}</td><td>{String(row.skill_level ?? row.skill_level ?? '')}</td><td>{String(row.book_completion ?? row.book_completion ?? '')}</td><td>{String(row.performance_rating ?? row.performance_rating ?? '')}</td><td>{String(row.created_at ?? row.created_at ?? '')}</td></tr>)}</tbody></table></div></section></>
}
