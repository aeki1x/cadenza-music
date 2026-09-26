"use client";
import { useEffect,useState } from "react";

const fields:Record<string,{name:string,label:string,type?:string,required?:boolean}[]>={
 users:[{name:"full_name",label:"Full name",required:true},{name:"email",label:"Email",required:true},{name:"contact_number",label:"Contact number"},{name:"role",label:"Role",type:"select",required:true},{name:"status",label:"Status",type:"select"}],
 lesson_packages:[{name:"name",label:"Package name",required:true},{name:"category",label:"Category",required:true},{name:"duration_minutes",label:"Duration (minutes)",type:"number",required:true},{name:"total_sessions",label:"Total sessions",type:"number",required:true},{name:"price",label:"Price",type:"number",required:true},{name:"description",label:"Description"}],
 rooms:[{name:"name",label:"Room name",required:true},{name:"room_type",label:"Room type",required:true},{name:"capacity",label:"Capacity",type:"number",required:true},{name:"rental_rate",label:"Rental rate",type:"number"}],
 instruments:[{name:"name",label:"Name",required:true},{name:"brand",label:"Brand"},{name:"category",label:"Category",required:true},{name:"serial_number",label:"Serial number"},{name:"quantity",label:"Quantity",type:"number",required:true},{name:"rental_rate",label:"Rental rate",type:"number"},{name:"condition_status",label:"Condition",type:"select"}],
 announcements:[{name:"title",label:"Title",required:true},{name:"message",label:"Message",required:true},{name:"target_role",label:"Target role",type:"select"}]
};
const selectOptions:Record<string,string[]>={
 role:["administrator","front_desk","instructor","client"],status:["active","inactive"],condition_status:["available","in_use","rented","maintenance","disposed"],target_role:["administrator","front_desk","instructor","client"]
};
export default function ResourcePage({resource,title}:{resource:string,title:string}){
 const [rows,setRows]=useState<any[]>([]),[form,setForm]=useState<any>({}),[editing,setEditing]=useState<any>(null),[search,setSearch]=useState(""),[msg,setMsg]=useState("");
 const f=fields[resource]||[];
 async function load(){const r=await fetch(`/api/admin/${resource}?search=${encodeURIComponent(search)}`);const x=await r.json();if(x.data)setRows(x.data);else setMsg(x.error)}
 useEffect(()=>{load()},[resource]);
 function change(k:string,v:any){setForm((s:any)=>({...s,[k]:v}))}
 async function save(){
  setMsg("");
  const url=`/api/admin/${resource}`; const method=editing?"PATCH":"POST"; const body=editing?{id:editing.id,...form}:form;
  const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const x=await r.json();
  if(!r.ok){setMsg(x.error||"Save failed");return;} setForm({});setEditing(null);setMsg("Saved.");load();
 }
 async function remove(id:string){if(!confirm("Delete this record?"))return;const r=await fetch(`/api/admin/${resource}?id=${id}`,{method:"DELETE"});const x=await r.json();if(!r.ok)setMsg(x.error);else load()}
 function start(row:any){setEditing(row);const copy:any={};f.forEach(x=>copy[x.name]=row[x.name]??"");setForm(copy)}
 return <><div className="page-head"><div><h1>{title}</h1><p className="muted">Data is loaded from the Supabase table for this module.</p></div></div>
 <section className="panel"><div className="actions" style={{marginBottom:14}}><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:9,border:"1px solid #d7dce5",borderRadius:8}}/><button className="btn secondary" onClick={load}>Search</button></div>
 {msg&&<div className="success" style={{marginBottom:12}}>{msg}</div>}
 <div className="form-grid">{f.map(x=><div className="field" key={x.name}><label>{x.label}</label>{x.type==="select"?<select value={form[x.name]??""} onChange={e=>change(x.name,e.target.value)}><option value="">Select</option>{(selectOptions[x.name]||[]).map(v=><option key={v} value={v}>{v}</option>)}</select>:<input type={x.type||"text"} value={form[x.name]??""} onChange={e=>change(x.name,x.type==="number"?Number(e.target.value):e.target.value)} required={x.required}/>}</div>)}</div>
 <div className="actions" style={{marginTop:14}}><button className="btn" onClick={save}>{editing?"Update":"Add"} {title.slice(0,-1)}</button>{editing&&<button className="btn secondary" onClick={()=>{setEditing(null);setForm({})}}>Cancel</button>}</div></section>
 <section className="panel"><div className="table-wrap"><table className="table"><thead><tr>{f.map(x=><th key={x.name}>{x.label}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}>{f.map(x=><td key={x.name}>{String(row[x.name]??"")}</td>)}<td><div className="actions"><button className="btn secondary" onClick={()=>start(row)}>Edit</button><button className="btn danger" onClick={()=>remove(row.id)}>Delete</button></div></td></tr>)}</tbody></table></div></section></>
}
