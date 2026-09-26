"use client";
import { useEffect,useState } from "react";
type Data={counts:Record<string,number>;pendingEnrollments:number;todaySchedules:any[];profile:any};
export default function Dashboard(){
 const [d,setD]=useState<Data|null>(null); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/dashboard").then(r=>r.json()).then(x=>x.error?setError(x.error):setD(x))},[]);
 if(error)return <div className="error">{error}</div>; if(!d)return <p>Loading dashboard...</p>;
 const c=d.counts;
 return <><div className="page-head"><div><h1>Dashboard</h1><p className="muted">Operational overview for Cadenza Music Center.</p></div></div>
 <div className="cards">
 {[
  ["Clients",c.profiles],["Enrollments",c.enrollments],["Schedules",c.schedules],["Bookings",c.studio_bookings],
  ["Rentals",c.instrument_rentals],["Bills",c.billing],["Payments",c.payments],["Pending Enrollments",d.pendingEnrollments]
 ].map(([a,b])=><div className="card" key={a}><h3>{a}</h3><div className="big">{b}</div></div>)}
 </div>
 <section className="panel"><h2>Today's Schedule</h2>{!d.todaySchedules.length?<p className="muted">No lessons scheduled today.</p>:<div className="table-wrap"><table className="table"><thead><tr><th>Time</th><th>Client</th><th>Instructor</th><th>Room</th><th>Status</th></tr></thead><tbody>{d.todaySchedules.map(x=><tr key={x.id}><td>{x.start_time}–{x.end_time}</td><td>{x.client?.full_name}</td><td>{x.instructor?.full_name}</td><td>{x.room?.name}</td><td><span className={`badge ${x.status}`}>{x.status}</span></td></tr>)}</tbody></table></div>}</section></>
}
